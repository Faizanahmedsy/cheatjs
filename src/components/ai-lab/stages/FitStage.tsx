"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { FitStage as FitStageSpec, Tone } from "../engine/types";
import { toneFill, toneVar } from "../engine/tones";
import { H, timing, TRAIN_FRAME_S, W, type StageProps } from "./common";

const SET_TONE: Record<string, Tone> = { train: "blue", val: "amber", test: "violet" };
const SET_NAME: Record<string, string> = { train: "training", val: "validation", test: "test" };

function ticks([a, b]: [number, number], n = 4) {
  return Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
}
const tickLabel = (v: number, span: number) => (span >= 100 ? Math.round(v).toLocaleString("en-US") : span >= 5 ? v.toFixed(0) : v.toFixed(1));

type Box = { x0: number; x1: number; y0: number; y1: number };

function Axes({ box, x, y, xLabel, yLabel, small }: { box: Box; x: [number, number]; y: [number, number]; xLabel?: string; yLabel?: string; small?: boolean }) {
  const sx = (v: number) => box.x0 + ((v - x[0]) / (x[1] - x[0])) * (box.x1 - box.x0);
  const sy = (v: number) => box.y1 - ((v - y[0]) / (y[1] - y[0])) * (box.y1 - box.y0);
  const fs = small ? 10 : 12;
  return (
    <g style={{ fontFamily: "var(--lab-mono)" }}>
      <rect x={box.x0} y={box.y0} width={box.x1 - box.x0} height={box.y1 - box.y0} fill="none" style={{ stroke: "var(--lab-border)" }} />
      {!small &&
        ticks(x).map((v) => (
          <text key={`x${v}`} x={sx(v)} y={box.y1 + 18} textAnchor="middle" fontSize={fs} style={{ fill: "var(--lab-muted)" }}>
            {tickLabel(v, x[1] - x[0])}
          </text>
        ))}
      {!small &&
        ticks(y).map((v) => (
          <text key={`y${v}`} x={box.x0 - 8} y={sy(v) + 4} textAnchor="end" fontSize={fs} style={{ fill: "var(--lab-muted)" }}>
            {tickLabel(v, y[1] - y[0])}
          </text>
        ))}
      {xLabel && (
        <text x={(box.x0 + box.x1) / 2} y={box.y1 + (small ? 16 : 38)} textAnchor="middle" fontSize={fs + 1} style={{ fill: "var(--lab-text)" }}>
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text x={box.x0 + 8} y={box.y0 + 16} fontSize={fs + 1} style={{ fill: "var(--lab-text)" }}>
          {yLabel}
        </text>
      )}
    </g>
  );
}

/**
 * The house-price picture: dots are houses, the line is the model's rule.
 * Modes: data, split, guess (misses drawn as red lines), train (the line fits
 * better each epoch while the loss graph falls), fits (under / good / over) and
 * predict (read a new house's price off the line).
 */
export default function FitStage({ stage, animate, speed, runKey }: StageProps<FitStageSpec>) {
  const t = timing(animate, speed);
  const { mode, points, x, y } = stage;
  const lines = stage.lines ?? [];
  const [frame, setFrame] = useState(animate && mode === "train" ? 0 : Math.max(0, lines.length - 1));

  useEffect(() => {
    if (mode !== "train" || !animate) {
      setFrame(Math.max(0, lines.length - 1));
      return;
    }
    setFrame(0);
    let k = 0;
    const id = window.setInterval(() => {
      k += 1;
      if (k >= lines.length) window.clearInterval(id);
      else setFrame(k);
    }, (TRAIN_FRAME_S * 1000) / speed);
    return () => window.clearInterval(id);
  }, [mode, animate, speed, lines.length, runKey]);

  if (mode === "fits") {
    const curves = stage.curves ?? [];
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label="Underfit, good fit and overfit compared">
        {curves.map((c, k) => {
          const box = { x0: 30 + k * 292, x1: 30 + k * 292 + 262, y0: 70, y1: 330 };
          const sx = (v: number) => box.x0 + ((v - x[0]) / (x[1] - x[0])) * (box.x1 - box.x0);
          const sy = (v: number) => box.y1 - ((v - y[0]) / (y[1] - y[0])) * (box.y1 - box.y0);
          const clip = `fit-clip-${k}`;
          return (
            <g key={c.label}>
              <defs>
                <clipPath id={clip}>
                  <rect x={box.x0} y={box.y0} width={box.x1 - box.x0} height={box.y1 - box.y0} />
                </clipPath>
              </defs>
              <text x={(box.x0 + box.x1) / 2} y={52} textAnchor="middle" fontSize={15} fontWeight={700} style={{ fill: toneVar(c.tone), fontFamily: "var(--lab-mono)" }}>
                {c.label}
              </text>
              <Axes box={box} x={x} y={y} small xLabel={stage.xLabel} />
              <g clipPath={`url(#${clip})`}>
                {points
                  .filter((p) => p.set !== "test")
                  .map((p, i) => (
                    <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={5} strokeWidth={2} style={{ fill: p.set === "val" ? "none" : toneFill("blue", 70), stroke: toneVar(p.set === "val" ? "amber" : "blue") }} />
                  ))}
                <motion.polyline
                  points={c.points.map(([a, b]) => `${sx(a).toFixed(1)},${sy(b).toFixed(1)}`).join(" ")}
                  fill="none"
                  strokeWidth={3}
                  initial={animate ? { pathLength: 0 } : false}
                  animate={{ pathLength: 1 }}
                  transition={t(1, 0.3 + k * 0.5)}
                  style={{ stroke: toneVar(c.tone) }}
                />
              </g>
              {c.note && (
                <text x={(box.x0 + box.x1) / 2} y={372} textAnchor="middle" fontSize={12} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
                  {c.note}
                </text>
              )}
            </g>
          );
        })}
        <g transform="translate(300 420)" fontSize={12} style={{ fontFamily: "var(--lab-mono)" }}>
          <circle cx={0} cy={-4} r={5} style={{ fill: toneFill("blue", 70), stroke: toneVar("blue") }} />
          <text x={10} y={0} style={{ fill: "var(--lab-muted)" }}>
            houses it trained on
          </text>
          <circle cx={190} cy={-4} r={5} strokeWidth={2} style={{ fill: "none", stroke: toneVar("amber") }} />
          <text x={200} y={0} style={{ fill: "var(--lab-muted)" }}>
            new houses (validation)
          </text>
        </g>
        {stage.note && (
          <text x={W / 2} y={H - 10} textAnchor="middle" fontSize={13} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
            {stage.note}
          </text>
        )}
      </svg>
    );
  }

  const withLoss = mode === "train" && (stage.losses?.length ?? 0) > 0;
  const box = { x0: 80, x1: withLoss ? 540 : 860, y0: 50, y1: 380 };
  const sx = (v: number) => box.x0 + ((v - x[0]) / (x[1] - x[0])) * (box.x1 - box.x0);
  const sy = (v: number) => box.y1 - ((v - y[0]) / (y[1] - y[0])) * (box.y1 - box.y0);
  const line = lines[Math.min(frame, lines.length - 1)];
  const lineAt = (v: number) => (line ? line.w * v + line.b : 0);
  const colourBySet = mode === "split";

  const counts = colourBySet ? (["train", "val", "test"] as const).map((s) => [s, points.filter((p) => p.set === s).length] as const) : [];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={`House prices: ${mode}`}>
      <defs>
        <clipPath id="fit-main-clip">
          <rect x={box.x0} y={box.y0} width={box.x1 - box.x0} height={box.y1 - box.y0} />
        </clipPath>
      </defs>
      <Axes box={box} x={x} y={y} xLabel={stage.xLabel} yLabel={stage.yLabel} />

      <g clipPath="url(#fit-main-clip)">
        {/* misses */}
        {mode === "guess" &&
          line &&
          points.map((p, i) => (
            <motion.line
              key={`r${i}`}
              x1={sx(p.x)}
              x2={sx(p.x)}
              y1={sy(p.y)}
              y2={sy(lineAt(p.x))}
              strokeWidth={2}
              strokeDasharray="4 3"
              initial={animate ? { opacity: 0 } : false}
              animate={{ opacity: 0.9 }}
              transition={t(0.3, 0.8 + i * 0.05)}
              style={{ stroke: toneVar("rose") }}
            />
          ))}
        {/* the model's line */}
        {line && mode !== "data" && mode !== "split" && (
          <motion.line
            initial={false}
            animate={{ x1: sx(x[0]), y1: sy(lineAt(x[0])), x2: sx(x[1]), y2: sy(lineAt(x[1])) }}
            transition={t(0.4)}
            strokeWidth={3.5}
            strokeLinecap="round"
            style={{ stroke: toneVar("green") }}
          />
        )}
        {/* houses */}
        {points.map((p, i) => {
          const tone = colourBySet ? SET_TONE[p.set ?? "train"] : "blue";
          return (
            <motion.circle
              key={i}
              cx={sx(p.x)}
              cy={sy(p.y)}
              r={7}
              strokeWidth={2}
              initial={animate && mode === "data" ? { opacity: 0, scale: 0.4 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={t(0.3, mode === "data" ? i * 0.06 : 0)}
              style={{ fill: toneFill(tone, 60), stroke: toneVar(tone) }}
            />
          );
        })}
      </g>

      {/* data: one house, explained */}
      {mode === "data" && stage.callout && points[stage.callout.index] && (() => {
        const p = points[stage.callout.index];
        const cx = sx(p.x);
        const cy = sy(p.y);
        return (
          <motion.g initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={t(0.5, 1.6)}>
            <circle cx={cx} cy={cy} r={13} fill="none" strokeWidth={2.5} style={{ stroke: toneVar("amber") }} />
            <line x1={cx} y1={cy + 13} x2={cx} y2={box.y1} strokeDasharray="5 4" strokeWidth={2} style={{ stroke: toneVar("cyan") }} />
            <line x1={cx - 13} y1={cy} x2={box.x0} y2={cy} strokeDasharray="5 4" strokeWidth={2} style={{ stroke: toneVar("green") }} />
            <rect x={cx + 18} y={cy - 54} width={250} height={48} rx={8} style={{ fill: "var(--lab-panel)", stroke: toneVar("amber") }} />
            <text x={cx + 30} y={cy - 34} fontSize={13} style={{ fill: toneVar("cyan"), fontFamily: "var(--lab-mono)" }}>
              feature: {stage.callout.feature}
            </text>
            <text x={cx + 30} y={cy - 15} fontSize={13} style={{ fill: toneVar("green"), fontFamily: "var(--lab-mono)" }}>
              label: {stage.callout.label}
            </text>
          </motion.g>
        );
      })()}

      {/* predict: read a new house off the line */}
      {mode === "predict" && line && stage.newPoint && (() => {
        const px = sx(stage.newPoint.x);
        const py = sy(lineAt(stage.newPoint.x));
        return (
          <g>
            <motion.line x1={px} x2={px} y1={box.y1} y2={py} strokeWidth={2} strokeDasharray="5 4" initial={animate ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={t(0.6, 0.4)} style={{ stroke: toneVar("amber") }} />
            <motion.line x1={px} x2={box.x0} y1={py} y2={py} strokeWidth={2} strokeDasharray="5 4" initial={animate ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={t(0.6, 1)} style={{ stroke: toneVar("amber") }} />
            <motion.circle cx={px} cy={py} r={10} initial={animate ? { scale: 0 } : false} animate={{ scale: 1 }} transition={t(0.4, 1.5)} style={{ fill: toneVar("amber") }} />
            <motion.g initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={t(0.4, 1.7)}>
              <rect x={px + 16} y={py - 40} width={Math.max(160, stage.newPoint.label.length * 8 + 24)} height={30} rx={8} style={{ fill: "var(--lab-panel)", stroke: toneVar("amber") }} />
              <text x={px + 28} y={py - 20} fontSize={14} fontWeight={700} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
                {stage.newPoint.label}
              </text>
            </motion.g>
          </g>
        );
      })()}

      {/* split legend */}
      {colourBySet && (
        <g transform={`translate(${box.x0 + 14} ${box.y0 + 40})`} style={{ fontFamily: "var(--lab-mono)" }}>
          {counts.map(([s, n], k) => (
            <g key={s} transform={`translate(0 ${k * 24})`}>
              <circle cx={6} cy={-4} r={6} style={{ fill: toneFill(SET_TONE[s], 60), stroke: toneVar(SET_TONE[s]) }} />
              <text x={20} y={0} fontSize={13} style={{ fill: "var(--lab-text)" }}>
                {SET_NAME[s]}: {n} houses
              </text>
            </g>
          ))}
        </g>
      )}

      {/* train: the loss graph beside it */}
      {withLoss && stage.losses && (() => {
        const lb = { x0: 610, x1: 870, y0: 80, y1: 340 };
        const maxL = Math.max(...stage.losses);
        const lx = (k: number) => lb.x0 + (k / Math.max(1, stage.losses!.length - 1)) * (lb.x1 - lb.x0);
        const ly = (v: number) => lb.y1 - (v / maxL) * (lb.y1 - lb.y0);
        const upto = stage.losses.slice(0, frame + 1);
        return (
          <g style={{ fontFamily: "var(--lab-mono)" }}>
            <text x={lb.x0} y={lb.y0 - 16} fontSize={13} fontWeight={700} style={{ fill: "var(--lab-text)" }}>
              loss (how wrong) ↓
            </text>
            <rect x={lb.x0} y={lb.y0} width={lb.x1 - lb.x0} height={lb.y1 - lb.y0} fill="none" style={{ stroke: "var(--lab-border)" }} />
            <polyline points={upto.map((v, k) => `${lx(k).toFixed(1)},${ly(v).toFixed(1)}`).join(" ")} fill="none" strokeWidth={3} style={{ stroke: toneVar("rose") }} />
            {upto.length > 0 && <circle cx={lx(upto.length - 1)} cy={ly(upto[upto.length - 1])} r={5} style={{ fill: toneVar("rose") }} />}
            <text x={lb.x0} y={lb.y1 + 22} fontSize={12} style={{ fill: "var(--lab-muted)" }}>
              rounds of practice →
            </text>
            <text x={lb.x0} y={lb.y1 + 50} fontSize={15} fontWeight={700} style={{ fill: "var(--lab-text)" }}>
              {line?.label ?? ""}
            </text>
          </g>
        );
      })()}

      {stage.note && (
        <text x={W / 2} y={H - 10} textAnchor="middle" fontSize={13} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
          {stage.note}
        </text>
      )}
    </svg>
  );
}
