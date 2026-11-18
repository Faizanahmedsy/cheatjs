"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { NetworkStage as NetworkStageSpec } from "../engine/types";
import { toneFill, toneVar } from "../engine/tones";
import { fmtNum, H, timing, W, type StageProps } from "./common";

const R = 30;
const HOP = 1.1; // seconds per layer-to-layer hop at 1x

/**
 * A real-looking neural network: circles in layers, every connection drawn,
 * line thickness and colour = weight (blue +, red −). Forward mode sends glowing
 * dots left to right and fills each neuron as its value arrives; backward mode
 * sends red "blame" back; update mode resizes the lines to the new weights.
 */
export default function NetworkStage({ stage, animate, speed }: StageProps<NetworkStageSpec>) {
  const uid = useId().replace(/:/g, "");
  const t = timing(animate, speed);
  const { layers, weights, mode } = stage;
  const L = layers.length;
  const xs = layers.map((_, l) => 160 + (l * 600) / Math.max(1, L - 1));
  const ys = layers.map((layer) => {
    const n = layer.nodes.length;
    const gap = Math.min(100, 320 / Math.max(1, n - 1));
    return layer.nodes.map((_, i) => 235 + (i - (n - 1) / 2) * gap);
  });
  const all = (stage.newWeights && mode === "update" ? [...weights.flat(2), ...stage.newWeights.flat(2)] : weights.flat(2)).map(Math.abs);
  const maxW = Math.max(...all, 1e-9);
  const width = (w: number) => 1.2 + (Math.abs(w) / maxW) * 7;
  const showValues = (l: number) => l === 0 || mode !== "structure";
  const arrive = (l: number) => 0.3 + (l - 1) * HOP + 0.85; // when layer l's dots land (forward)

  // Biggest weight changes get a label in update mode.
  const deltas: { l: number; i: number; j: number; d: number }[] = [];
  if (mode === "update" && stage.newWeights)
    weights.forEach((m, l) => m.forEach((row, i) => row.forEach((w, j) => deltas.push({ l, i, j, d: stage.newWeights![l][i][j] - w }))));
  const topDeltas = deltas.sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 3);

  const out = layers[L - 1].nodes[0];
  const err = stage.target && out?.value !== undefined ? out.value - stage.target.value : null;
  const blameMax = Math.max(...(stage.blame?.flat() ?? [0]).map(Math.abs), 1e-9);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={`Neural network, ${mode} view`}>
      <defs>
        {layers.map((layer, l) =>
          layer.nodes.map((_, i) => (
            <clipPath key={`${l}-${i}`} id={`${uid}-c-${l}-${i}`}>
              <circle cx={xs[l]} cy={ys[l][i]} r={R - 2.5} />
            </clipPath>
          )),
        )}
      </defs>

      {layers.map((layer, l) => (
        <text key={layer.title} x={xs[l]} y={30} textAnchor="middle" fontSize={13} fontWeight={700} letterSpacing={1.5} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
          {layer.title.toUpperCase()}
        </text>
      ))}

      {/* connections */}
      {weights.map((m, l) =>
        m.map((row, i) =>
          row.map((w, j) => {
            const nw = stage.newWeights?.[l]?.[i]?.[j];
            const finalW = mode === "update" && nw !== undefined ? nw : w;
            const tone = finalW >= 0 ? "blue" : "rose";
            const x1 = xs[l] + R;
            const x2 = xs[l + 1] - R;
            const y1 = ys[l][i];
            const y2 = ys[l + 1][j];
            return (
              <motion.line
                key={`${l}-${i}-${j}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeLinecap="round"
                initial={{ strokeWidth: width(w), opacity: mode === "structure" && animate ? 0 : 0.55 }}
                animate={{ strokeWidth: width(finalW), opacity: mode === "backward" ? 0.3 : 0.55 }}
                transition={mode === "update" ? t(1.6, 0.6) : t(0.5, mode === "structure" ? 0.4 + l * 0.5 : 0)}
                style={{ stroke: toneVar(tone) }}
              >
                <title>{mode === "update" && nw !== undefined ? `weight ${fmtNum(w, 3)} → ${fmtNum(nw, 3)}` : `weight ${fmtNum(w, 2)}`}</title>
              </motion.line>
            );
          }),
        ),
      )}

      {/* forward: values travel along every line */}
      {animate &&
        mode === "forward" &&
        weights.map((m, l) =>
          m.map((row, i) =>
            row.map((w, j) => {
              const v = layers[l].nodes[i].value ?? 1;
              // A neuron that outputs 0 (an input of 0, or a shut gate) sends nothing.
              if (Math.abs(v) < 1e-9) return null;
              const signal = v * w;
              const tone = signal >= 0 ? "cyan" : "rose";
              return (
                <motion.circle
                  key={`f-${l}-${i}-${j}`}
                  r={3.5 + Math.min(4, Math.abs(signal) * 5)}
                  initial={{ cx: xs[l] + R, cy: ys[l][i], opacity: 0 }}
                  animate={{ cx: xs[l + 1] - R, cy: ys[l + 1][j], opacity: [0, 1, 1, 0] }}
                  transition={t(0.85, 0.3 + l * HOP)}
                  style={{ fill: toneVar(tone), filter: `drop-shadow(0 0 5px ${toneVar(tone)})` }}
                />
              );
            }),
          ),
        )}

      {/* backward: blame travels right to left in red */}
      {animate &&
        mode === "backward" &&
        weights.map((m, l) =>
          m.map((row, i) =>
            row.map((_, j) => (
              <motion.circle
                key={`b-${l}-${i}-${j}`}
                r={5}
                initial={{ cx: xs[l + 1] - R, cy: ys[l + 1][j], opacity: 0 }}
                animate={{ cx: xs[l] + R, cy: ys[l][i], opacity: [0, 1, 1, 0] }}
                transition={t(0.85, 0.5 + (L - 2 - l) * HOP)}
                style={{ fill: toneVar("rose"), filter: `drop-shadow(0 0 5px ${toneVar("rose")})` }}
              />
            )),
          ),
        )}

      {/* update: label the biggest changes */}
      {topDeltas.map(({ l, i, j, d }) => {
        const x = xs[l] + R + (xs[l + 1] - xs[l] - 2 * R) * 0.5;
        const y = (ys[l][i] + ys[l + 1][j]) / 2;
        const tone = d >= 0 ? "blue" : "rose";
        return (
          <motion.g key={`d-${l}-${i}-${j}`} initial={{ opacity: animate ? 0 : 1 }} animate={{ opacity: 1 }} transition={t(0.4, 1.8)}>
            <rect x={x - 30} y={y - 11} width={60} height={22} rx={11} style={{ fill: "var(--lab-panel)", stroke: toneVar(tone) }} />
            <text x={x} y={y + 4.5} textAnchor="middle" fontSize={12} fontWeight={700} style={{ fill: toneVar(tone), fontFamily: "var(--lab-mono)" }}>
              {d >= 0 ? "+" : "−"}
              {fmtNum(Math.abs(d), 2)}
            </text>
          </motion.g>
        );
      })}

      {/* neurons */}
      {layers.map((layer, l) =>
        layer.nodes.map((node, i) => {
          const x = xs[l];
          const y = ys[l][i];
          const tone = l === 0 ? "cyan" : l === L - 1 ? "green" : "violet";
          const maxV = Math.max(...layer.nodes.map((n) => Math.abs(n.value ?? 0)), 1e-9);
          const level = node.value !== undefined && showValues(l) ? Math.min(1, Math.abs(node.value) / maxV) : 0;
          const delay = mode === "forward" && l > 0 ? arrive(l) : 0;
          const blame = stage.blame?.[l]?.[i];
          const stroke = mode === "backward" && blame !== undefined ? toneVar("rose") : toneVar(tone);
          const sw = mode === "backward" && blame !== undefined ? 2 + (Math.abs(blame) / blameMax) * 4 : 2;
          const isHidden = l > 0 && l < L - 1;
          // A computed neuron "lights up" when it fires (output above 0) and stays dark when its gate is shut.
          const computed = l > 0 && node.value !== undefined && mode !== "structure";
          const fires = computed && (node.value ?? 0) > 1e-9;
          const dark = computed && !fires;
          return (
            <g key={`${l}-${i}`}>
              {fires && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r={R + 7}
                  strokeWidth={3}
                  initial={{ opacity: animate && mode === "forward" ? 0 : 0.85 }}
                  animate={{ opacity: 0.85 }}
                  transition={t(0.5, delay + 0.4)}
                  style={{ fill: "none", stroke: toneVar(tone), filter: `drop-shadow(0 0 8px ${toneVar(tone)})` }}
                />
              )}
              <motion.g initial={{ opacity: mode === "structure" && animate ? 0 : 1 }} animate={{ opacity: dark ? 0.55 : 1 }} transition={t(0.4, mode === "structure" ? l * 0.5 : mode === "forward" ? delay + 0.4 : 0)}>
                <circle cx={x} cy={y} r={R} strokeWidth={sw} style={{ fill: toneFill(tone, 8), stroke }} />
                <g clipPath={`url(#${uid}-c-${l}-${i})`}>
                  <motion.rect
                    x={x - R}
                    y={y + R - 2 * R * level}
                    width={2 * R}
                    height={2 * R * level}
                    initial={{ scaleY: animate && mode === "forward" && l > 0 ? 0 : 1 }}
                    animate={{ scaleY: 1 }}
                    transition={t(0.6, delay)}
                    style={{ fill: toneFill(tone, 42), originY: 1 }}
                  />
                </g>
                {node.value !== undefined && showValues(l) && (
                  <motion.text
                    x={x}
                    y={y + 5}
                    textAnchor="middle"
                    fontSize={14}
                    fontWeight={700}
                    initial={{ opacity: animate && mode === "forward" && l > 0 ? 0 : 1 }}
                    animate={{ opacity: 1 }}
                    transition={t(0.3, delay + 0.3)}
                    style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}
                  >
                    {fmtNum(node.value, Math.abs(node.value) >= 10 ? 0 : 2)}
                  </motion.text>
                )}
              </motion.g>
              {/* labels: inputs on the left, output on the right, hidden above */}
              {l === 0 && (
                <text x={x - R - 12} y={y + 5} textAnchor="end" fontSize={14} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
                  {node.label}
                </text>
              )}
              {l === L - 1 && (
                <text x={x + R + 12} y={y + 5} fontSize={14} fontWeight={700} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
                  {node.label}
                </text>
              )}
              {isHidden && (
                <text x={x} y={y - R - 8} textAnchor="middle" fontSize={11.5} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
                  {node.label}
                </text>
              )}
              {/* ReLU gate under hidden neurons */}
              {isHidden && stage.gates && node.value !== undefined && (mode === "forward" || mode === "error") && (
                <motion.g initial={{ opacity: animate && mode === "forward" ? 0 : 1 }} animate={{ opacity: 1 }} transition={t(0.3, delay + 0.5)}>
                  <rect x={x - 30} y={y + R + 5} width={60} height={18} rx={9} style={{ fill: toneFill(node.value > 0 ? "green" : "rose", 16), stroke: toneVar(node.value > 0 ? "green" : "rose") }} />
                  <text x={x} y={y + R + 18} textAnchor="middle" fontSize={10.5} fontWeight={700} style={{ fill: toneVar(node.value > 0 ? "green" : "rose"), fontFamily: "var(--lab-mono)" }}>
                    {node.value > 0 ? "gate open" : "gate shut"}
                  </text>
                </motion.g>
              )}
              {mode === "backward" && blame !== undefined && (
                <text x={x} y={l === 0 ? y + R + 18 : y - R - 22} textAnchor="middle" fontSize={11} style={{ fill: toneVar("rose"), fontFamily: "var(--lab-mono)" }}>
                  blame {fmtNum(blame, 2)}
                </text>
              )}
            </g>
          );
        }),
      )}

      {/* target vs guess */}
      {stage.target &&
        err !== null &&
        mode !== "structure" &&
        (() => {
          const ox = xs[L - 1];
          const oy = ys[L - 1][0];
          const close = Math.abs(err) < 0.05;
          const tone = close ? "green" : stage.target.was !== undefined ? "amber" : "rose";
          const miss = (e: number) => (Math.abs(e) < 0.005 ? "spot on" : `${e < 0 ? "too low" : "too high"} by ${fmtNum(Math.abs(e), 2)}`);
          const wasErr = stage.target.was !== undefined ? stage.target.was - stage.target.value : null;
          const rows = wasErr !== null ? 3 : 2;
          const h = 22 + rows * 19;
          return (
            <motion.g initial={{ opacity: animate ? 0 : 1 }} animate={{ opacity: 1 }} transition={t(0.4, mode === "forward" ? arrive(L - 1) + 0.6 : mode === "update" ? 2 : 0.2)}>
              {mode === "error" && (
                <motion.circle
                  cx={ox}
                  cy={oy}
                  r={R + 6}
                  fill="none"
                  strokeWidth={3}
                  initial={{ opacity: 0.2 }}
                  animate={animate ? { opacity: [0.2, 1, 0.2] } : { opacity: 1 }}
                  transition={animate ? { duration: 1.4 / speed, repeat: 2 } : { duration: 0 }}
                  style={{ stroke: toneVar("rose") }}
                />
              )}
              <rect x={ox - 105} y={oy + 50} width={210} height={h} rx={8} style={{ fill: toneFill(tone, 10), stroke: toneVar(tone) }} />
              <text x={ox} y={oy + 70} textAnchor="middle" fontSize={12.5} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
                {stage.target.label}: {fmtNum(stage.target.value, 2)}
              </text>
              {wasErr !== null && (
                <text x={ox} y={oy + 89} textAnchor="middle" fontSize={12.5} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
                  before: {fmtNum(stage.target.was!, 2)} ({miss(wasErr)})
                </text>
              )}
              <text x={ox} y={oy + (wasErr !== null ? 108 : 89)} textAnchor="middle" fontSize={12.5} fontWeight={700} style={{ fill: toneVar(tone), fontFamily: "var(--lab-mono)" }}>
                {wasErr !== null ? `now: ${fmtNum(out.value!, 2)} (${miss(err)})` : `guess is ${miss(err)}`}
              </text>
            </motion.g>
          );
        })()}

      {stage.note && (
        <text x={W / 2} y={H - 14} textAnchor="middle" fontSize={13} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
          {stage.note}
        </text>
      )}
    </svg>
  );
}
