"use client";

import { motion } from "framer-motion";
import type { DescentStage as DescentStageSpec, Tone } from "../engine/types";
import { toneFill, toneVar } from "../engine/tones";
import { fmtNum, H, HOP_S, timing, W, type StageProps } from "./common";


/** Loss at w, read off the curve by straight-line interpolation. */
function lossAt(curve: [number, number][], w: number) {
  if (w <= curve[0][0]) return curve[0][1];
  for (let i = 1; i < curve.length; i++) {
    const [x0, y0] = curve[i - 1];
    const [x1, y1] = curve[i];
    if (w <= x1) return y0 + ((w - x0) / (x1 - x0 || 1)) * (y1 - y0);
  }
  return curve[curve.length - 1][1];
}

/**
 * Gradient descent as a ball walking down a valley. The curve is the loss for
 * each value of the weight; the ball starts high and each hop is one update.
 * Extra balls (`compare`) show other learning rates on the same valley.
 */
export default function DescentStage({ stage, animate, speed }: StageProps<DescentStageSpec>) {
  const t = timing(animate, speed);
  const { curve } = stage;
  const xs = curve.map((p) => p[0]);
  const ys = curve.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const yMax = Math.max(...ys);
  const yMin = Math.min(0, ...ys);
  const box = { l: 80, r: 860, t: 96, b: 370 };
  const sx = (v: number) => box.l + ((v - x0) / (x1 - x0 || 1)) * (box.r - box.l);
  const sy = (v: number) => box.b - ((v - yMin) / (yMax - yMin || 1)) * (box.b - box.t);
  const path = curve.map(([a, b], i) => `${i ? "L" : "M"} ${sx(a).toFixed(1)} ${sy(b).toFixed(1)}`).join(" ");
  const min = curve.reduce((m, p) => (p[1] < m[1] ? p : m), curve[0]);

  const balls: { label?: string; tone: Tone; steps: number[] }[] = [{ label: stage.label, tone: "amber", steps: stage.steps }, ...(stage.compare ?? [])];
  const clampW = (w: number) => Math.max(x0, Math.min(x1, w));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={`A ball rolling down the loss curve in ${stage.steps.length - 1} steps`}>
      {/* axes */}
      <line x1={box.l} y1={box.b} x2={box.r} y2={box.b} strokeWidth={1.5} style={{ stroke: "var(--lab-border)" }} />
      <line x1={box.l} y1={box.t - 10} x2={box.l} y2={box.b} strokeWidth={1.5} style={{ stroke: "var(--lab-border)" }} />
      <text x={(box.l + box.r) / 2} y={box.b + 34} textAnchor="middle" fontSize={14} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
        {stage.xLabel} →
      </text>
      <text x={box.l + 10} y={box.t - 18} fontSize={14} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
        ↑ {stage.yLabel}
      </text>

      {/* the valley */}
      <path d={`${path} L ${sx(x1)} ${box.b} L ${sx(x0)} ${box.b} Z`} style={{ fill: toneFill("rose", 7) }} />
      <path d={path} fill="none" strokeWidth={3.5} strokeLinecap="round" style={{ stroke: toneVar("rose") }} />

      {/* the lowest point */}
      <line x1={sx(min[0])} x2={sx(min[0])} y1={sy(min[1])} y2={box.b} strokeDasharray="4 5" strokeWidth={1.5} style={{ stroke: toneVar("green") }} />
      <text x={sx(min[0])} y={box.b + 16} textAnchor="middle" fontSize={12} fontWeight={700} style={{ fill: toneVar("green"), fontFamily: "var(--lab-mono)" }}>
        best ({fmtNum(min[0], 1)})
      </text>

      {balls.map((b, bi) => {
        const pts = b.steps.map((w) => ({ x: sx(clampW(w)), y: sy(lossAt(curve, clampW(w))) - 11 }));
        if (!pts.length) return null;
        const n = pts.length;
        const dur = Math.max(0.01, (n - 1) * HOP_S);
        const last = pts[n - 1];
        const lastW = b.steps[n - 1];
        return (
          <g key={bi}>
            {/* footprints: each update leaves a dot */}
            {pts.map((p, k) => (
              <motion.circle
                key={k}
                cx={p.x}
                cy={p.y + 11}
                r={3.5}
                initial={animate ? { opacity: 0 } : false}
                animate={{ opacity: 0.8 }}
                transition={t(0.2, 0.4 + k * HOP_S)}
                style={{ fill: toneVar(b.tone) }}
              />
            ))}
            {/* hops */}
            {pts.slice(1).map((p, k) => {
              const a = pts[k];
              const lift = Math.min(60, 14 + Math.abs(p.x - a.x) * 0.25);
              return (
                <motion.path
                  key={`h${k}`}
                  d={`M ${a.x} ${a.y} Q ${(a.x + p.x) / 2} ${Math.min(a.y, p.y) - lift} ${p.x} ${p.y}`}
                  fill="none"
                  strokeWidth={1.6}
                  strokeDasharray="4 4"
                  initial={animate ? { pathLength: 0, opacity: 0 } : false}
                  animate={{ pathLength: 1, opacity: 0.7 }}
                  transition={t(HOP_S, 0.4 + k * HOP_S)}
                  style={{ stroke: toneVar(b.tone) }}
                />
              );
            })}
            {/* the ball */}
            <motion.circle
              r={11}
              initial={animate ? { cx: pts[0].x, cy: pts[0].y } : { cx: last.x, cy: last.y }}
              animate={{ cx: pts.map((p) => p.x), cy: pts.map((p) => p.y) }}
              transition={animate ? { duration: dur / speed, delay: 0.4 / speed, ease: "linear" } : { duration: 0 }}
              strokeWidth={2.5}
              style={{ fill: toneFill(b.tone, 60), stroke: toneVar(b.tone), filter: `drop-shadow(0 0 6px ${toneVar(b.tone)})` }}
            />
            {/* readout */}
            <motion.g initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={t(0.4, 0.4 + dur)}>
              <rect x={30 + bi * 290} y={12} width={280} height={30} rx={8} style={{ fill: "var(--lab-panel)", stroke: toneVar(b.tone) }} />
              <circle cx={46 + bi * 290} cy={27} r={6} style={{ fill: toneVar(b.tone) }} />
              <text x={60 + bi * 290} y={32} fontSize={12} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
                {b.label ? `${b.label}: ` : ""}
                {n - 1} steps → {fmtNum(lossAt(curve, clampW(lastW)), 2)}
              </text>
            </motion.g>
          </g>
        );
      })}

      {stage.note && (
        <text x={W / 2} y={H - 12} textAnchor="middle" fontSize={13} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
          {stage.note}
        </text>
      )}
    </svg>
  );
}
