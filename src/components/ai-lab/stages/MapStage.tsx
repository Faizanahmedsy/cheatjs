"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { MapStage as MapStageSpec, Tone } from "../engine/types";
import { toneFill, toneVar } from "../engine/tones";
import { fmtNum, H, timing, W, type StageProps } from "./common";

const TONES: Tone[] = ["blue", "cyan", "violet", "amber", "green", "rose", "slate"];

function star(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const rr = k % 2 === 0 ? r : r * 0.45;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

/** Cosine of the angle between two arrows from the origin, from their coordinates. */
export function cosine2(a: { x: number; y: number }, b: { x: number; y: number }) {
  return (a.x * b.x + a.y * b.y) / (Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y) || 1);
}

/**
 * A meaning map. Map mode: words are dots, similar words sit close together
 * (soft halos group them), and a query star drops in and links to its nearest
 * neighbours. Angle mode: arrows from the origin to two words, the angle
 * between them, and the cosine worked out from the coordinates.
 */
export default function MapStage({ stage, animate, speed }: StageProps<MapStageSpec>) {
  const uid = useId().replace(/:/g, "");
  const t = timing(animate, speed);
  const { points } = stage;

  if (stage.mode === "angle" && stage.pairs?.length) {
    const pairs = stage.pairs;
    const n = pairs.length;
    const panelW = (W - 40) / n;
    const maxR = Math.max(...pairs.flatMap((p) => [points[p.a], points[p.b]]).map((q) => Math.hypot(q.x, q.y)), 1e-9);
    const radius = Math.min(panelW / 2 - 40, 150);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label="Angles between word arrows and their cosine similarity">
        <defs>
          {TONES.map((tn) => (
            <marker key={tn} id={`${uid}-arr-${tn}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: toneVar(tn) }} />
            </marker>
          ))}
        </defs>
        {pairs.map((pair, k) => {
          const A = points[pair.a];
          const B = points[pair.b];
          const cx = 20 + panelW * k + panelW / 2;
          const cy = 225;
          const s = radius / maxR;
          const ax = cx + A.x * s;
          const ay = cy - A.y * s;
          const bx = cx + B.x * s;
          const by = cy - B.y * s;
          const c = cosine2(A, B);
          const deg = (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
          const fa = Math.atan2(A.y, A.x);
          let delta = Math.atan2(B.y, B.x) - fa;
          while (delta > Math.PI) delta -= 2 * Math.PI;
          while (delta <= -Math.PI) delta += 2 * Math.PI;
          const ar = 46;
          const p1 = { x: cx + ar * Math.cos(fa), y: cy - ar * Math.sin(fa) };
          const p2 = { x: cx + ar * Math.cos(fa + delta), y: cy - ar * Math.sin(fa + delta) };
          const mid = fa + delta / 2;
          const toneA = A.tone ?? "blue";
          const toneB = B.tone ?? "violet";
          const verdictTone: Tone = c > 0.7 ? "green" : c > 0.2 ? "amber" : "rose";
          const d0 = 0.2 + k * 0.6;
          return (
            <g key={k} style={{ fontFamily: "var(--lab-mono)" }}>
              {k > 0 && <line x1={20 + panelW * k} x2={20 + panelW * k} y1={40} y2={410} strokeDasharray="3 5" style={{ stroke: "var(--lab-border)" }} />}
              {/* axes through the origin */}
              <line x1={cx - radius - 20} x2={cx + radius + 20} y1={cy} y2={cy} style={{ stroke: "var(--lab-border)" }} />
              <line x1={cx} x2={cx} y1={cy - radius - 20} y2={cy + radius + 20} style={{ stroke: "var(--lab-border)" }} />
              <circle cx={cx} cy={cy} r={4} style={{ fill: "var(--lab-muted)" }} />
              {/* arrows */}
              {(
                [
                  [ax, ay, toneA, A.label, 0],
                  [bx, by, toneB, B.label, 1],
                ] as const
              ).map(([x, y, tone, label, j]) => (
                <g key={j}>
                  <motion.line
                    x1={cx}
                    y1={cy}
                    x2={x}
                    y2={y}
                    strokeWidth={4}
                    strokeLinecap="round"
                    markerEnd={`url(#${uid}-arr-${tone})`}
                    initial={animate ? { pathLength: 0, opacity: 0 } : false}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={t(0.6, d0 + j * 0.3)}
                    style={{ stroke: toneVar(tone) }}
                  />
                  <motion.text
                    x={x + (x >= cx ? 10 : -10)}
                    y={y + (y >= cy ? 18 : -8)}
                    textAnchor={x >= cx ? "start" : "end"}
                    fontSize={16}
                    fontWeight={700}
                    initial={animate ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={t(0.3, d0 + 0.5 + j * 0.3)}
                    style={{ fill: toneVar(tone) }}
                  >
                    {label}
                  </motion.text>
                </g>
              ))}
              {/* the angle */}
              <motion.path
                d={`M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A ${ar} ${ar} 0 0 ${delta > 0 ? 0 : 1} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`}
                fill="none"
                strokeWidth={2.5}
                initial={animate ? { pathLength: 0 } : false}
                animate={{ pathLength: 1 }}
                transition={t(0.5, d0 + 1)}
                style={{ stroke: toneVar(verdictTone) }}
              />
              <motion.text
                x={cx + (ar + 22) * Math.cos(mid)}
                y={cy - (ar + 22) * Math.sin(mid) + 5}
                textAnchor="middle"
                fontSize={13}
                fontWeight={700}
                initial={animate ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={t(0.3, d0 + 1.3)}
                style={{ fill: toneVar(verdictTone) }}
              >
                {deg.toFixed(0)}°
              </motion.text>
              {/* the result */}
              <motion.g initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={t(0.4, d0 + 1.5)}>
                <rect x={cx - panelW / 2 + 16} y={392} width={panelW - 32} height={50} rx={8} style={{ fill: toneFill(verdictTone, 12), stroke: toneVar(verdictTone) }} />
                <text x={cx} y={413} textAnchor="middle" fontSize={14} fontWeight={700} style={{ fill: "var(--lab-text)" }}>
                  cosine = {fmtNum(c, 2)}
                </text>
                <text x={cx} y={432} textAnchor="middle" fontSize={12.5} style={{ fill: toneVar(verdictTone) }}>
                  {pair.verdict}
                </text>
              </motion.g>
            </g>
          );
        })}
        {stage.note && (
          <text x={W / 2} y={28} textAnchor="middle" fontSize={13} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
            {stage.note}
          </text>
        )}
      </svg>
    );
  }

  // ---------- map mode ----------
  const all = stage.query ? [...points, stage.query] : points;
  const px = all.map((p) => p.x);
  const py = all.map((p) => p.y);
  const padX = (Math.max(...px) - Math.min(...px)) * 0.08 || 1;
  const padY = (Math.max(...py) - Math.min(...py)) * 0.1 || 1;
  const dom = { x0: Math.min(...px) - padX, x1: Math.max(...px) + padX, y0: Math.min(...py) - padY, y1: Math.max(...py) + padY };
  const box = { l: 50, r: 760, t: 50, b: 400 };
  const sx = (v: number) => box.l + ((v - dom.x0) / (dom.x1 - dom.x0)) * (box.r - box.l);
  const sy = (v: number) => box.b - ((v - dom.y0) / (dom.y1 - dom.y0)) * (box.b - box.t);

  // Soft halos around words that share a colour (a topic group).
  const groups = new Map<Tone, { x: number; y: number }[]>();
  points.forEach((p) => {
    const tone = p.tone ?? "blue";
    groups.set(tone, [...(groups.get(tone) ?? []), { x: sx(p.x), y: sy(p.y) }]);
  });
  const halos = [...groups.entries()]
    .filter(([, g]) => g.length >= 2)
    .map(([tone, g]) => {
      const mx = g.reduce((s, p) => s + p.x, 0) / g.length;
      const my = g.reduce((s, p) => s + p.y, 0) / g.length;
      const rx = Math.max(...g.map((p) => Math.abs(p.x - mx))) + 56;
      const ry = Math.max(...g.map((p) => Math.abs(p.y - my))) + 36;
      return { tone, mx, my, rx, ry };
    });

  const q = stage.query;
  const neighbours = stage.neighbours ?? [];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={`Meaning map of ${points.length} words${q ? `, query ${q.label}` : ""}`}>
      {/* faint grid */}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`gx${i}`} x1={box.l + ((box.r - box.l) * i) / 7} x2={box.l + ((box.r - box.l) * i) / 7} y1={box.t} y2={box.b} style={{ stroke: "var(--lab-grid)" }} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`gy${i}`} x1={box.l} x2={box.r} y1={box.t + ((box.b - box.t) * i) / 5} y2={box.t + ((box.b - box.t) * i) / 5} style={{ stroke: "var(--lab-grid)" }} />
      ))}

      {halos.map((h, i) => (
        <motion.ellipse
          key={h.tone}
          cx={h.mx}
          cy={h.my}
          rx={h.rx}
          ry={h.ry}
          strokeDasharray="5 5"
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={t(0.6, 0.3 + i * 0.2)}
          style={{ fill: toneFill(h.tone, 7), stroke: toneVar(h.tone) }}
        />
      ))}

      {/* query links to its nearest neighbours */}
      {q &&
        neighbours.map((ni, rank) => {
          const p = points[ni];
          if (!p) return null;
          return (
            <motion.line
              key={`n${ni}`}
              x1={sx(q.x)}
              y1={sy(q.y)}
              x2={sx(p.x)}
              y2={sy(p.y)}
              strokeWidth={2.5}
              strokeDasharray="6 5"
              initial={animate ? { pathLength: 0, opacity: 0 } : false}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={t(0.5, 1.2 + rank * 0.35)}
              style={{ stroke: toneVar("amber") }}
            />
          );
        })}

      {points.map((p, i) => {
        const tone = p.tone ?? "blue";
        const rank = neighbours.indexOf(i);
        return (
          <motion.g key={`${p.label}-${i}`} initial={animate ? { opacity: 0, scale: 0.6 } : false} animate={{ opacity: 1, scale: 1 }} transition={t(0.35, 0.1 + i * 0.05)}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={9} strokeWidth={2} style={{ fill: toneFill(tone, 55), stroke: toneVar(tone) }} />
            <text x={sx(p.x) + 14} y={sy(p.y) + 5} fontSize={15} fontWeight={600} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
              {p.label}
            </text>
            {q && rank >= 0 && (
              <motion.g initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={t(0.3, 1.5 + rank * 0.35)}>
                <circle cx={sx(p.x) - 14} cy={sy(p.y) - 14} r={10} style={{ fill: toneVar("amber") }} />
                <text x={sx(p.x) - 14} y={sy(p.y) - 10} textAnchor="middle" fontSize={12} fontWeight={800} style={{ fill: "var(--lab-bg)", fontFamily: "var(--lab-mono)" }}>
                  {rank + 1}
                </text>
              </motion.g>
            )}
          </motion.g>
        );
      })}

      {q && (
        <motion.g initial={animate ? { opacity: 0, scale: 2 } : false} animate={{ opacity: 1, scale: 1 }} transition={t(0.5, 0.7)}>
          <polygon points={star(sx(q.x), sy(q.y), 16)} strokeWidth={2} style={{ fill: toneVar("amber"), stroke: "var(--lab-bg)", filter: `drop-shadow(0 0 6px ${toneVar("amber")})` }} />
          <rect x={sx(q.x) + 18} y={sy(q.y) - 32} width={Math.max(90, q.label.length * 9 + 20)} height={26} rx={13} style={{ fill: "var(--lab-panel)", stroke: toneVar("amber") }} />
          <text x={sx(q.x) + 28} y={sy(q.y) - 14} fontSize={14} fontWeight={700} style={{ fill: toneVar("amber"), fontFamily: "var(--lab-mono)" }}>
            {q.label}
          </text>
        </motion.g>
      )}

      {/* the nearest list */}
      {q && neighbours.length > 0 && (
        <motion.g initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={t(0.4, 1.4 + neighbours.length * 0.35)} style={{ fontFamily: "var(--lab-mono)" }}>
          <text x={782} y={80} fontSize={13} fontWeight={700} letterSpacing={1} style={{ fill: "var(--lab-muted)" }}>
            CLOSEST
          </text>
          {neighbours.map((ni, rank) => (
            <g key={ni} transform={`translate(782 ${100 + rank * 34})`}>
              <circle cx={10} cy={-5} r={10} style={{ fill: toneVar("amber") }} />
              <text x={10} y={-1} textAnchor="middle" fontSize={12} fontWeight={800} style={{ fill: "var(--lab-bg)" }}>
                {rank + 1}
              </text>
              <text x={26} y={0} fontSize={14} style={{ fill: "var(--lab-text)" }}>
                {points[ni]?.label}
              </text>
            </g>
          ))}
        </motion.g>
      )}

      {stage.note && (
        <text x={W / 2} y={H - 14} textAnchor="middle" fontSize={13} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
          {stage.note}
        </text>
      )}
    </svg>
  );
}
