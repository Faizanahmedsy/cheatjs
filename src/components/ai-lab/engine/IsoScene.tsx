"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import type { Packet, Scenario, SceneObject, Step, Tone } from "./types";
import { IsoShape, latticeToScreen } from "./iso";
import { toneFill, toneVar } from "./tones";

type Pt = { x: number; y: number };

const TONES: Tone[] = ["blue", "cyan", "violet", "amber", "green", "rose", "slate"];

/** Screen polyline for a connector between two objects. */
function routePoints(a: SceneObject, b: SceneObject, route: "straight" | "iso" = "straight"): Pt[] {
  const A = latticeToScreen(a.at);
  const B = latticeToScreen(b.at);
  if (route === "straight") return [A, B];
  // Lattice [c, r] ↔ iso (x, y): x = c + r, y = r - c. Elbow at (x_b, y_a).
  const xb = b.at[0] + b.at[1];
  const ya = a.at[1] - a.at[0];
  const elbow = latticeToScreen([(xb - ya) / 2, (xb + ya) / 2]);
  return [A, elbow, B];
}

const pathD = (p: Pt[]) => p.map((q, i) => `${i ? "L" : "M"} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" ");

function cumulative(p: Pt[]) {
  const segs = p.slice(1).map((q, i) => Math.hypot(q.x - p[i].x, q.y - p[i].y));
  const total = segs.reduce((s, x) => s + x, 0) || 1;
  let acc = 0;
  const times = [0, ...segs.map((s) => (acc += s) / total)];
  return { total, times };
}

function pointAt(p: Pt[], t: number): Pt {
  const { total } = cumulative(p);
  let d = t * total;
  for (let i = 1; i < p.length; i++) {
    const seg = Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
    if (d <= seg || i === p.length - 1) {
      const k = seg ? Math.min(1, d / seg) : 0;
      return { x: p[i - 1].x + (p[i].x - p[i - 1].x) * k, y: p[i - 1].y + (p[i].y - p[i - 1].y) * k };
    }
    d -= seg;
  }
  return p[p.length - 1];
}

/** The polyline from the start up to fraction `t` of its length. */
function trimPath(p: Pt[], t: number): Pt[] {
  const { times } = cumulative(p);
  const out = p.filter((_, i) => times[i] < t);
  return [...out, pointAt(p, t)];
}

/** Per-packet travel time at 1x, ms. Shared with the player so the step waits for the last packet. */
export const PACKET_MS = 1100;

export function stepDurationMs(step: Step | undefined) {
  if (!step) return 0;
  if (step.duration) return step.duration;
  const n = step.packets?.length ?? 0;
  return Math.max(3200, 1200 + n * PACKET_MS);
}

type Props = {
  scenario: Scenario;
  step: Step | null;
  /** Changes every time the step should replay its packets. */
  runKey: string;
  animate: boolean;
  speed: number;
};

function IsoSceneImpl({ scenario, step, runKey, animate, speed }: Props) {
  const byId = useMemo(() => new Map(scenario.objects.map((o) => [o.id, o])), [scenario]);

  const bounds = useMemo(() => {
    const ps = scenario.objects.map((o) => latticeToScreen(o.at));
    const xs = ps.map((p) => p.x);
    const ys = ps.map((p) => p.y);
    const minX = Math.min(...xs) - 100;
    const maxX = Math.max(...xs) + 100;
    const minY = Math.min(...ys) - 120;
    const maxY = Math.max(...ys) + 70;
    return { minX, minY, w: maxX - minX, h: maxY - minY };
  }, [scenario]);

  const gridLines = useMemo(() => {
    const { minX, minY, w, h } = bounds;
    // Convert the four corners to iso coordinates to know which grid lines cross the view.
    const toIso = (sx: number, sy: number) => ({ x: (sx / 28 + sy / 16) / 2, y: (sy / 16 - sx / 28) / 2 });
    const corners = [toIso(minX, minY), toIso(minX + w, minY), toIso(minX, minY + h), toIso(minX + w, minY + h)];
    const x0 = Math.floor(Math.min(...corners.map((c) => c.x)));
    const x1 = Math.ceil(Math.max(...corners.map((c) => c.x)));
    const y0 = Math.floor(Math.min(...corners.map((c) => c.y)));
    const y1 = Math.ceil(Math.max(...corners.map((c) => c.y)));
    const S = (x: number, y: number) => [(x - y) * 28, (x + y) * 16] as const;
    const lines: string[] = [];
    for (let x = x0; x <= x1; x++) {
      const [ax, ay] = S(x, y0);
      const [bx, by] = S(x, y1);
      lines.push(`M${ax} ${ay}L${bx} ${by}`);
    }
    for (let y = y0; y <= y1; y++) {
      const [ax, ay] = S(x0, y);
      const [bx, by] = S(x1, y);
      lines.push(`M${ax} ${ay}L${bx} ${by}`);
    }
    return lines.join("");
  }, [bounds]);

  const highlighted = useMemo(() => new Set(step?.highlight ?? []), [step]);
  const packets = useMemo(() => step?.packets ?? [], [step]);

  const activeLinks = useMemo(() => {
    const set = new Set<string>();
    for (const p of packets) {
      for (const l of scenario.links) {
        if ((l.from === p.from && l.to === p.to) || (l.from === p.to && l.to === p.from)) set.add(l.id);
      }
    }
    return set;
  }, [packets, scenario.links]);

  const linkTone = (id: string): Tone => {
    const p = packets.find((pk) => scenario.links.some((l) => l.id === id && ((l.from === pk.from && l.to === pk.to) || (l.from === pk.to && l.to === pk.from))));
    return p?.tone ?? "blue";
  };

  const packetPath = (pk: Packet): Pt[] => {
    const a = byId.get(pk.from);
    const b = byId.get(pk.to);
    if (!a || !b) return [];
    if (a.id === b.id) {
      // A step that works "inside" one object: slide the card across just above it.
      const c = latticeToScreen(a.at);
      return [
        { x: c.x - 40, y: c.y - 62 },
        { x: c.x + 40, y: c.y - 62 },
      ];
    }
    const link = scenario.links.find((l) => (l.from === pk.from && l.to === pk.to) || (l.from === pk.to && l.to === pk.from));
    if (!link) return routePoints(a, b);
    const pts = routePoints(byId.get(link.from)!, byId.get(link.to)!, link.route);
    return link.from === pk.from ? pts : [...pts].reverse();
  };

  const sorted = useMemo(() => [...scenario.objects].sort((a, b) => a.at[1] - b.at[1] || a.at[0] - b.at[0]), [scenario]);
  const dimOthers = highlighted.size > 0;
  const travel = PACKET_MS / speed / 1000;

  return (
    <svg
      viewBox={`${bounds.minX} ${bounds.minY} ${bounds.w} ${bounds.h}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full select-none"
      role="img"
      aria-label={`${scenario.title} scene${step ? `, step: ${step.title}` : ""}`}
    >
      <defs>
        {TONES.map((t) => (
          <radialGradient key={t} id={`lab-orb-${t}`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" style={{ stopColor: toneFill(t, 70) }} />
            <stop offset="100%" style={{ stopColor: toneFill(t, 12) }} />
          </radialGradient>
        ))}
      </defs>

      <path d={gridLines} fill="none" strokeWidth={0.6} style={{ stroke: "var(--lab-grid)" }} />

      {/* connectors */}
      {scenario.links.map((l) => {
        const a = byId.get(l.from);
        const b = byId.get(l.to);
        if (!a || !b) return null;
        const pts = routePoints(a, b, l.route);
        const active = activeLinks.has(l.id);
        const tone = active ? linkTone(l.id) : "slate";
        const mid = pointAt(pts, 0.5);
        return (
          <g key={l.id}>
            <path
              d={pathD(pts)}
              fill="none"
              strokeWidth={active ? 1.8 : 1}
              strokeDasharray="5 6"
              className={animate ? "lab-dash" : undefined}
              style={{ stroke: toneVar(tone), opacity: active ? 0.95 : 0.45 }}
            />
            {l.label && (
              <text x={mid.x} y={mid.y + 12} textAnchor="middle" fontSize={8} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
                {l.label}
              </text>
            )}
          </g>
        );
      })}

      {/* objects, back to front */}
      {sorted.map((o) => {
        const { x, y } = latticeToScreen(o.at);
        const on = highlighted.has(o.id);
        const tone = o.tone ?? "blue";
        return (
          <motion.g
            key={o.id}
            initial={false}
            animate={{ opacity: dimOthers && !on ? 0.42 : 1, y: on && animate ? -4 : 0 }}
            transition={{ duration: animate ? 0.35 : 0 }}
          >
            <g transform={`translate(${x} ${y})`}>
              {on && (
                <ellipse
                  cx={0}
                  cy={0}
                  rx={46}
                  ry={26}
                  className={animate ? "lab-pulse" : undefined}
                  strokeWidth={1.2}
                  style={{ fill: toneFill(tone, 10), stroke: toneVar(tone), opacity: 0.8 }}
                />
              )}
              <g style={on ? { filter: `drop-shadow(0 0 5px ${toneVar(tone)})` } : undefined}>
                <IsoShape kind={o.kind} tone={tone} strong={on} />
              </g>
              <text y={30} textAnchor="middle" fontSize={9.5} fontWeight={600} style={{ fill: on ? toneVar(tone) : "var(--lab-text)", fontFamily: "var(--lab-mono)", letterSpacing: 0.6 }}>
                {o.label.toUpperCase()}
              </text>
              {o.sub && (
                <text y={41} textAnchor="middle" fontSize={8} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
                  {o.sub}
                </text>
              )}
              <title>{`${o.label}${o.sub ? ` — ${o.sub}` : ""}`}</title>
            </g>
          </motion.g>
        );
      })}

      {/* packets */}
      {packets.map((pk, i) => {
        const pts = packetPath(pk);
        if (pts.length < 2) return null;
        const tone = pk.tone ?? "blue";
        const chars = Math.max(pk.label.length, pk.sub?.length ?? 0);
        const w = Math.min(220, chars * 6.1 + 16);
        const h = pk.sub ? 30 : 19;
        const card = (
          <g transform={`translate(${-w / 2} ${-h - 10})`}>
            <rect width={w} height={h} rx={4} strokeWidth={1.2} style={{ fill: toneFill(tone, 22), stroke: toneVar(tone) }} />
            <text x={w / 2} y={13} textAnchor="middle" fontSize={10} fontWeight={600} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
              {pk.label}
            </text>
            {pk.sub && (
              <text x={w / 2} y={24.5} textAnchor="middle" fontSize={8.5} style={{ fill: toneVar(tone), fontFamily: "var(--lab-mono)" }}>
                {pk.sub}
              </text>
            )}
            <circle cx={w / 2} cy={h + 10} r={3} style={{ fill: toneVar(tone) }} />
          </g>
        );
        if (!animate) {
          // Step-only mode: park every packet half-way along its link so you can read what moves where.
          // Packets sharing a link are spread along it instead of stacking.
          const same = packets.filter((q) => (q.from === pk.from && q.to === pk.to) || (q.from === pk.to && q.to === pk.from));
          const j = same.indexOf(pk);
          const mid = pointAt(pts, (j + 1) / (same.length + 1));
          return (
            <g key={`${runKey}-${i}`} transform={`translate(${mid.x} ${mid.y})`}>
              {card}
            </g>
          );
        }
        // Stop short of the target so the parked card never covers the object it arrived at.
        const trip = trimPath(pts, 0.8);
        const { times } = cumulative(trip);
        const last = i === packets.length - 1;
        return (
          <motion.g
            key={`${runKey}-${i}`}
            initial={{ x: trip[0].x, y: trip[0].y, opacity: 0 }}
            animate={{ x: trip.map((p) => p.x), y: trip.map((p) => p.y), opacity: last ? 1 : [0, 1, 1, 0] }}
            transition={{
              x: { duration: travel, times, delay: i * travel, ease: "easeInOut" },
              y: { duration: travel, times, delay: i * travel, ease: "easeInOut" },
              opacity: last ? { duration: 0.2, delay: i * travel } : { duration: travel * 1.25, times: [0, 0.1, 0.8, 1], delay: i * travel },
            }}
          >
            {card}
          </motion.g>
        );
      })}
    </svg>
  );
}

export const IsoScene = memo(IsoSceneImpl);
