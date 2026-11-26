"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, type ReactNode } from "react";
import "@fontsource/baloo-2/600.css";
import "@fontsource/baloo-2/700.css";
import "@fontsource/baloo-2/800.css";
import {
  Activity, Archive, ArrowLeftRight, Box, Code, Copy, Database, DoorOpen, FileText, Globe, HardDrive, Key, ListOrdered,
  Megaphone, Network, ScrollText, Server, Shield, Signpost, Split, Table, TrendingUp, UserCog, Users, Zap, type LucideIcon,
} from "lucide-react";
import type { EdgeState, Lesson, Look, NodeState, SceneEdge, SceneNode, Step } from "@/lib/deep-dive/types";
import { withBase } from "@/lib/base-path";


/* Billu Toy Town: warm paper, ink outlines, chunky blocks. */
const INK = "#1B2A22";
const TERRA = "#B8432A";
const GREEN = "#1E6B45";
const AMBER = "#E8A33D";
const U = 62; // px per grid unit

const PAL: Record<NodeState, { face: string; depth: string; ink: string; line: string; op: number }> = {
  idle: { face: "#FFFBF2", depth: "#C9B48D", ink: INK, line: INK, op: 1 },
  frontier: { face: "#FFC98F", depth: "#C77F3F", ink: INK, line: INK, op: 1 },
  current: { face: TERRA, depth: "#6E2717", ink: "#FFFFFF", line: INK, op: 1 },
  done: { face: "#BFE3C6", depth: "#5F9B72", ink: "#12432B", line: INK, op: 1 },
  dim: { face: "#E6DAC2", depth: "#C2B393", ink: "#6B604E", line: "#8C7F66", op: 0.8 },
  broken: { face: "#F2B5AB", depth: "#B9695C", ink: "#6E1408", line: "#A32B1B", op: 1 },
  hidden: { face: "#E6DAC2", depth: "#C2B393", ink: "#6B604E", line: "#8C7F66", op: 0 },
};

const ICONS: Record<string, LucideIcon> = {
  user: Users, internet: Globe, server: Server, lb: Split, db: Database, replica: Copy, cache: Zap, bucket: Archive, file: FileText,
  queue: ListOrdered, topic: Megaphone, lambda: Code, cdn: Network, dns: Signpost, gateway: DoorOpen, firewall: Shield, key: Key,
  table: Table, autoscale: TrendingUp, disk: HardDrive, nat: ArrowLeftRight, role: UserCog, policy: ScrollText, monitor: Activity, box: Box,
};

const spring = { type: "spring", stiffness: 170, damping: 20, mass: 0.8 } as const;

/** Which drawing style fits this lesson: arrays look like arrays, trees like trees, graphs like maps. */
export function lookFor(lesson: Lesson): Look {
  if (lesson.look) return lesson.look;
  const g = lesson.group;
  const hasEdges = lesson.steps.some((s) => s.edges.length > 0);
  const nodes = lesson.steps[lesson.steps.length - 1]?.nodes ?? [];
  const xs = new Set(nodes.map((n) => n.x));
  const ys = new Set(nodes.map((n) => n.y));
  if (hasEdges) {
    if (/Linked|Design/.test(g)) return "train";
    if (/Tree|Heap|Trie|Backtrack/.test(g)) return "tree";
    return "map";
  }
  if (/Stack|Queue/.test(g) && xs.size <= 3 && ys.size >= 3) return "stack";
  if (/Sorting/.test(g) && nodes.length && nodes.every((n) => n.label === "" || /^-?\d+$/.test(n.label))) return "bars";
  if (xs.size >= 3 && ys.size >= 3) return "tiles";
  return "cells";
}

type Geo = { w: number; h: number; round: boolean };

/** Size of one block for a look and a label; `cap` keeps neighbours in a row from touching. */
function geo(look: Look, label: string, cap: number, barH = 0): Geo {
  const len = Math.max(1, label.length);
  switch (look) {
    case "tree":
      return { w: Math.min(cap, Math.max(60, len * 14 + 22)), h: 60, round: true };
    case "map":
      return { w: Math.min(cap, Math.max(64, len * 14 + 24)), h: 64, round: true };
    case "train":
      return { w: Math.min(cap, Math.max(78, len * 14 + 30)), h: 52, round: false };
    case "stack":
      return { w: Math.min(cap, Math.max(150, len * 14 + 40)), h: 44, round: false };
    case "cloud":
      return { w: Math.min(cap, Math.max(150, len * 9.5 + 64)), h: 66, round: false };
    case "bars":
      return { w: Math.min(cap, 56), h: barH, round: false };
    case "tiles":
      return { w: Math.min(cap, Math.max(58, len * 13 + 18)), h: 58, round: false };
    default:
      return { w: Math.min(cap, Math.max(62, len * 15 + 22)), h: 62, round: false };
  }
}

const fit = (label: string, room: number, base: number) => Math.max(11, Math.min(base, room / (Math.max(1, label.length) * 0.58)));

function Label({ text, ink, room, base, y = 0, x = 0, anchor = "middle" }: { text: string; ink: string; room: number; base: number; y?: number; x?: number; anchor?: "middle" | "start" }) {
  const size = fit(text, room, base);
  return (
    <text x={x} y={y + size * 0.36} textAnchor={anchor} fill={ink} style={{ fontSize: size, fontWeight: 800, transition: "fill .35s" }} className="select-none">
      {text}
    </text>
  );
}

/** One block, drawn differently for each look. Origin is the block's centre. */
function Shape({ node, look, g, index, barBase }: { node: SceneNode; look: Look; g: Geo; index?: string; barBase: number }) {
  const c = PAL[node.state];
  const sw = 3;
  const dashed = node.state === "broken" ? "7 6" : undefined;
  const { w, h } = g;
  let body: ReactNode;
  switch (look) {
    case "tree":
      body = (
        <>
          <circle cy={6} r={w / 2} fill={c.depth} stroke={c.line} strokeWidth={sw} />
          <circle r={w / 2} fill={c.face} stroke={c.line} strokeWidth={sw} strokeDasharray={dashed} />
          <path d={`M ${-w / 2 + 12} -8 A ${w / 2 - 10} ${w / 2 - 10} 0 0 1 -4 ${-w / 2 + 8}`} stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={4} fill="none" strokeLinecap="round" />
          <Label text={node.label} ink={c.ink} room={w - 12} base={24} />
        </>
      );
      break;
    case "map":
      body = (
        <>
          <circle r={w / 2 + 9} fill={c.face} opacity={0.35} />
          <circle cy={5} r={w / 2} fill={c.depth} stroke={c.line} strokeWidth={sw} />
          <circle r={w / 2} fill={c.face} stroke={c.line} strokeWidth={4} strokeDasharray={dashed} />
          <circle r={w / 2 - 8} fill="none" stroke={c.ink} strokeOpacity={0.25} strokeWidth={2} />
          <Label text={node.label} ink={c.ink} room={w - 18} base={26} />
        </>
      );
      break;
    case "train":
      body = (
        <>
          <rect x={-w / 2} y={-h / 2 + 6} width={w} height={h} rx={14} fill={c.depth} stroke={c.line} strokeWidth={sw} />
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill={c.face} stroke={c.line} strokeWidth={sw} strokeDasharray={dashed} />
          <rect x={-w / 2 + 8} y={-h / 2 + 7} width={w - 16} height={7} rx={3.5} fill={c.ink} opacity={0.18} />
          <circle cx={-w / 2 + 18} cy={h / 2 + 8} r={8} fill={INK} />
          <circle cx={w / 2 - 18} cy={h / 2 + 8} r={8} fill={INK} />
          <circle cx={-w / 2 + 18} cy={h / 2 + 8} r={3} fill="#FFFBF2" />
          <circle cx={w / 2 - 18} cy={h / 2 + 8} r={3} fill="#FFFBF2" />
          <Label text={node.label} ink={c.ink} room={w - 14} base={24} y={2} />
        </>
      );
      break;
    case "stack":
      body = (
        <>
          <rect x={-w / 2} y={-h / 2 + 6} width={w} height={h} rx={10} fill={c.depth} stroke={c.line} strokeWidth={sw} />
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill={c.face} stroke={c.line} strokeWidth={sw} strokeDasharray={dashed} />
          <line x1={-w / 2 + 12} x2={-w / 2 + 26} y1={0} y2={0} stroke={c.ink} strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
          <line x1={w / 2 - 26} x2={w / 2 - 12} y1={0} y2={0} stroke={c.ink} strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
          <Label text={node.label} ink={c.ink} room={w - 64} base={22} />
        </>
      );
      break;
    case "cloud": {
      const Icon = ICONS[node.icon ?? "box"] ?? Box;
      body = (
        <>
          <rect x={-w / 2} y={-h / 2 + 7} width={w} height={h} rx={18} fill={c.depth} stroke={c.line} strokeWidth={sw} />
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill={c.face} stroke={c.line} strokeWidth={sw} strokeDasharray={dashed} />
          <circle cx={-w / 2 + 30} cy={0} r={20} fill={c.ink} opacity={0.12} />
          <Icon x={-w / 2 + 17} y={-13} width={26} height={26} strokeWidth={2.4} color={c.ink} />
          <Label text={node.label} ink={c.ink} room={w - 66} base={16} x={-w / 2 + 56} anchor="start" />
        </>
      );
      break;
    }
    case "bars": {
      const top = barBase - h;
      body = (
        <>
          <rect x={-w / 2 + 5} y={top + 5} width={w} height={h} rx={8} fill={c.depth} stroke={c.line} strokeWidth={sw} />
          <rect x={-w / 2} y={top} width={w} height={h} rx={8} fill={c.face} stroke={c.line} strokeWidth={sw} strokeDasharray={dashed} />
          <Label text={node.label} ink={node.state === "current" ? "#FFFFFF" : INK} room={w - 8} base={22} y={top + 18} />
          {index !== undefined && (
            <text y={barBase + 26} textAnchor="middle" fill="#7A6E58" style={{ fontSize: 13, fontWeight: 700 }}>
              {index}
            </text>
          )}
        </>
      );
      break;
    }
    case "tiles":
      body = (
        <>
          <rect x={-w / 2} y={-h / 2 + 5} width={w} height={h} rx={7} fill={c.depth} stroke={c.line} strokeWidth={sw} />
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={7} fill={c.face} stroke={c.line} strokeWidth={sw} strokeDasharray={dashed} />
          <Label text={node.label} ink={c.ink} room={w - 10} base={22} />
        </>
      );
      break;
    default:
      body = (
        <>
          <rect x={-w / 2} y={-h / 2 + 8} width={w} height={h} rx={12} fill={c.depth} stroke={c.line} strokeWidth={sw} />
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={12} fill={c.face} stroke={c.line} strokeWidth={sw} strokeDasharray={dashed} />
          <rect x={-w / 2 + 7} y={-h / 2 + 6} width={w - 14} height={6} rx={3} fill="#FFFFFF" opacity={node.state === "current" ? 0.25 : 0.7} />
          <Label text={node.label} ink={c.ink} room={w - 12} base={30} y={2} />
          {index !== undefined && (
            <text y={h / 2 + 30} textAnchor="middle" fill="#7A6E58" style={{ fontSize: 13, fontWeight: 700 }}>
              {index}
            </text>
          )}
        </>
      );
  }
  return (
    <motion.g key={node.state} initial={{ scale: 0.86 }} animate={{ scale: 1, x: node.state === "broken" ? [0, -7, 7, -5, 5, 0] : 0 }} transition={{ ...spring, x: { duration: 0.5 } }}>
      {body}
    </motion.g>
  );
}

function Tag({ text, top, hot }: { text: string; top: number; hot: boolean }) {
  const w = Math.max(28, text.length * 8.2 + 18);
  const fill = hot ? INK : "#FFFBF2";
  const ink = hot ? "#FFFBF2" : INK;
  return (
    <motion.g key={text} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <path d={`M -6 ${top - 8} L 0 ${top - 1} L 6 ${top - 8} Z`} fill={INK} />
      <rect x={-w / 2} y={top - 32} width={w} height={25} rx={9} fill={fill} stroke={INK} strokeWidth={2.5} />
      <text y={top - 15} textAnchor="middle" fill={ink} style={{ fontSize: 14, fontWeight: 800 }}>
        {text}
      </text>
    </motion.g>
  );
}

const EDGE_COLOR: Record<EdgeState, string> = { idle: INK, active: TERRA, chosen: GREEN, dim: "#A89A7E", hidden: "#A89A7E" };

/** Point where the line from a box's centre towards (dx, dy) leaves the box (or circle). */
function exit(g: Geo, dx: number, dy: number, pad: number) {
  const len = Math.hypot(dx, dy) || 1;
  if (g.round) return (g.w / 2 + pad) / len;
  const tx = Math.abs(dx) > 0.001 ? (g.w / 2 + pad) / Math.abs(dx) : Infinity;
  const ty = Math.abs(dy) > 0.001 ? (g.h / 2 + pad) / Math.abs(dy) : Infinity;
  return Math.min(tx, ty);
}

function Edge({ edge, a, b, ga, gb, look }: { edge: SceneEdge; a: { x: number; y: number }; b: { x: number; y: number }; ga: Geo; gb: Geo; look: Look }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const sa = exit(ga, dx, dy, 2);
  const sb = exit(gb, -dx, -dy, edge.directed ? 8 : 2);
  const x1 = a.x + dx * sa, y1 = a.y + dy * sa, x2 = b.x - dx * sb, y2 = b.y - dy * sb;
  const color = EDGE_COLOR[edge.state];
  const op = edge.state === "hidden" ? 0 : edge.state === "dim" ? 0.55 : 1;
  const d = look === "tree" ? `M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2} ${x2} ${(y1 + y2) / 2} ${x2} ${y2}` : `M ${x1} ${y1} L ${x2} ${y2}`;
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const moving = edge.state === "active";
  let line: ReactNode;
  if (look === "map") {
    const road = edge.state === "active" ? "#D9774F" : edge.state === "chosen" ? "#2F8F5B" : edge.state === "dim" ? "#D3C7AE" : "#8A8172";
    line = (
      <>
        <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke={INK} strokeWidth={17} strokeLinecap="round" opacity={edge.state === "dim" ? 0.25 : 1} />
        <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke={road} strokeWidth={12} strokeLinecap="round" style={{ transition: "stroke .35s" }} />
        <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke="#FFFBF2" strokeWidth={2} strokeDasharray="9 9" opacity={0.8} />
        {edge.directed && <path d={d} stroke="none" fill="none" markerEnd="url(#toy-arrow-road)" />}
      </>
    );
  } else if (look === "tree") {
    const branch = edge.state === "idle" ? "#7A5230" : color;
    line = <path d={d} stroke={branch} strokeWidth={edge.state === "idle" ? 6 : 7} fill="none" strokeLinecap="round" strokeDasharray={edge.state === "dim" ? "8 9" : undefined} style={{ transition: "stroke .35s" }} markerEnd={edge.directed ? `url(#toy-arrow-${edge.state})` : undefined} />;
  } else {
    line = (
      <path
        d={d}
        stroke={color}
        strokeWidth={edge.state === "chosen" ? 6 : edge.state === "active" ? 5 : 3.5}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={edge.state === "dim" ? "6 8" : moving ? "12 9" : undefined}
        className={moving ? "toy-march" : undefined}
        markerEnd={edge.directed ? `url(#toy-arrow-${edge.state})` : undefined}
        style={{ transition: "stroke .35s" }}
      />
    );
  }
  return (
    <motion.g initial={false} animate={{ opacity: op }} transition={{ duration: 0.3 }}>
      {line}
      {moving && op > 0 && (
        <>
          {[0, 0.45, 0.9].map((delay) => (
            <circle key={delay} r={6.5} fill={look === "map" ? "#FFFBF2" : TERRA} stroke={INK} strokeWidth={2}>
              <animateMotion dur="1.35s" begin={`${delay}s`} repeatCount="indefinite" path={`M ${x1} ${y1} L ${x2} ${y2}`} />
            </circle>
          ))}
        </>
      )}
      {edge.weight !== undefined && op > 0 && (
        <g transform={`translate(${mx},${my})`}>
          <rect x={-17} y={-14} width={34} height={28} rx={look === "map" ? 5 : 10} fill={look === "map" ? "#F3C34B" : "#FFFBF2"} stroke={INK} strokeWidth={2.5} />
          <text y={6} textAnchor="middle" fill={INK} style={{ fontSize: 15, fontWeight: 800 }}>
            {edge.weight}
          </text>
        </g>
      )}
    </motion.g>
  );
}

/** Index under an array cell: ids like i3, b10 → "3", "10". */
const indexOf = (id: string) => /^[a-z]+(\d+)$/.exec(id)?.[1];

export function ToyStage({ lesson, step, index, total }: { lesson: Lesson; step: Step; index: number; total: number }) {
  const all = lesson.steps;
  const look = lookFor(lesson);

  const layout = useMemo(() => {
    // Smallest gap between neighbours in one row, so wide labels never overlap.
    let gap = Infinity;
    for (const s of all) {
      const rows = new Map<number, number[]>();
      for (const n of s.nodes) if (n.state !== "hidden") rows.set(n.y, [...(rows.get(n.y) ?? []), n.x]);
      for (const xs of rows.values()) {
        xs.sort((p, q) => p - q);
        for (let i = 1; i < xs.length; i++) if (xs[i] - xs[i - 1] > 0.2) gap = Math.min(gap, xs[i] - xs[i - 1]);
      }
    }
    const cap = Number.isFinite(gap) ? gap * U - 10 : 999;
    let maxVal = 1;
    if (look === "bars") for (const s of all) for (const n of s.nodes) maxVal = Math.max(maxVal, Math.abs(Number(n.label) || 0));
    const indexed = look === "cells" || look === "bars";
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const s of all)
      for (const n of s.nodes) {
        if (n.state === "hidden") continue;
        const g = geo(look, n.label, cap, look === "bars" ? 34 + (Math.abs(Number(n.label) || 0) / maxVal) * 150 : 0);
        const cx = n.x * U, cy = n.y * U;
        const up = look === "bars" ? 190 : g.h / 2 + 52;
        const down = look === "bars" ? 100 : g.h / 2 + (indexed ? 100 : 26);
        x0 = Math.min(x0, cx - g.w / 2 - 34); x1 = Math.max(x1, cx + g.w / 2 + 20);
        y0 = Math.min(y0, cy - up); y1 = Math.max(y1, cy + down);
      }
    if (!Number.isFinite(x0)) { x0 = 0; x1 = 400; y0 = 0; y1 = 200; }
    let w = x1 - x0 + 40, h = y1 - y0 + 30;
    const vx = x0 - 20;
    let vy = y0 - 10;
    if (w < 560) { const extra = 560 - w; w = 560; return { cap, maxVal, indexed, vb: [vx - extra / 2, vy, w, Math.max(h, w * 0.42)] as const, vyFix: h }; }
    if (h < w * 0.42) { vy -= (w * 0.42 - h) / 2; h = w * 0.42; }
    return { cap, maxVal, indexed, vb: [vx, vy, w, h] as const, vyFix: h };
  }, [all, look]);

  const { cap, maxVal, indexed } = layout;
  const [vx, vy, vw, vh] = layout.vb;
  const barH = (n: SceneNode) => 34 + (Math.abs(Number(n.label) || 0) / maxVal) * 150;
  const geoOf = (n: SceneNode) => geo(look, n.label, cap, look === "bars" ? barH(n) : 0);
  const lift = (s: NodeState) => (s === "current" ? -12 : s === "frontier" ? -5 : 0);

  const byId = new Map(step.nodes.map((n) => [n.id, n]));
  const edgeKeys = useMemo(() => {
    const m = new Map<string, SceneEdge>();
    for (const s of all) for (const e of s.edges) if (!m.has(`${e.a}-${e.b}`)) m.set(`${e.a}-${e.b}`, e);
    return m;
  }, [all]);
  const ordered = [...step.nodes].sort((p, q) => p.y - q.y || p.x - q.x);

  // The "window": a run of highlighted cells in one row with nothing else between them.
  const win = useMemo(() => {
    if (look !== "cells") return null;
    const hot = step.nodes.filter((n) => n.state === "current" || n.state === "frontier");
    if (!hot.length || new Set(hot.map((n) => n.y)).size !== 1) return null;
    const y = hot[0].y;
    const lo = Math.min(...hot.map((n) => n.x)), hi = Math.max(...hot.map((n) => n.x));
    const between = step.nodes.some((n) => n.y === y && n.x > lo && n.x < hi && n.state !== "hidden" && !hot.includes(n));
    if (between || (hot.length < 2 && !step.nodes.some((n) => n.y === y && n.state === "dim"))) return null;
    const g = geoOf(hot[0]);
    return { x: lo * U - g.w / 2 - 14, w: (hi - lo) * U + g.w + 28, y: y * U - g.h / 2 - 26, h: g.h + 44 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, look]);

  // Billu peeks from the corner of the block being worked on.
  const focus = step.nodes.find((n) => n.state === "current") ?? step.nodes.find((n) => n.state === "frontier");
  const fg = focus ? geoOf(focus) : null;
  const under = look === "cells" || look === "bars";
  const billu = focus && fg ? (under ? { x: focus.x * U, y: focus.y * U + (look === "bars" ? 72 : fg.h / 2 + 70) } : { x: focus.x * U - fg.w / 2 - 6, y: focus.y * U + fg.h / 2 - 2 }) : null;
  // Keep the last spot so the frame and Billu glide from where they were instead of from the corner.
  const lastWin = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const lastBillu = useRef({ x: 0, y: 0 });
  if (win) lastWin.current = win;
  if (billu) lastBillu.current = billu;
  const w0 = lastWin.current;
  const b0 = lastBillu.current;
  const frame = { x: w0.x, y: w0.y, width: w0.w, height: w0.h, opacity: win ? 1 : 0 };

  return (
    <div className="relative overflow-hidden rounded-[28px] border-[3px] border-[#1B2A22] text-[#1B2A22]" style={{ fontFamily: "'Baloo 2', ui-rounded, system-ui, sans-serif", backgroundColor: "#EBDCC0", backgroundImage: "radial-gradient(ellipse at 50% 58%, #FBF4E6 0, #F8EFDD 40%, rgba(248,239,221,0) 78%)" }}>
      <div className="flex items-start gap-3 px-4 pt-4 sm:px-5">
        <span className="shrink-0 rounded-xl border-[2.5px] border-[#1B2A22] bg-[#FFFBF2] px-2.5 py-0.5 text-sm font-extrabold shadow-[0_3px_0_#1B2A22]">
          {index + 1}/{total}
        </span>
        <AnimatePresence mode="wait">
          <motion.p key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="text-lg font-extrabold leading-snug sm:text-[22px]">
            {step.title}
          </motion.p>
        </AnimatePresence>
      </div>
      <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} className="block h-auto max-h-[60vh] w-full" role="img" aria-label={step.title}>
        <defs>
          {(Object.keys(EDGE_COLOR) as EdgeState[]).map((k) => (
            <marker key={k} id={`toy-arrow-${k}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={EDGE_COLOR[k]} />
            </marker>
          ))}
          <marker id="toy-arrow-road" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={INK} />
          </marker>
          <clipPath id="toy-billu">
            <circle r={22} />
          </clipPath>
        </defs>
        {look === "bars" && (
          <line x1={vx + 20} x2={vx + vw - 20} y1={Math.max(...step.nodes.map((n) => n.y)) * U + 30} y2={Math.max(...step.nodes.map((n) => n.y)) * U + 30} stroke={INK} strokeWidth={3} strokeLinecap="round" opacity={0.35} />
        )}
        <motion.rect
          initial={frame}
          animate={frame}
          transition={spring}
          rx={26}
          fill={AMBER}
          fillOpacity={0.14}
          stroke={AMBER}
          strokeWidth={12}
        />
        <motion.rect initial={frame} animate={frame} transition={spring} rx={26} fill="none" stroke={INK} strokeWidth={4.5} />
        {[...edgeKeys.keys()].map((k) => {
          const e = step.edges.find((x) => `${x.a}-${x.b}` === k) ?? { ...edgeKeys.get(k)!, state: "hidden" as const };
          const a = byId.get(e.a), b = byId.get(e.b);
          if (!a || !b) return null;
          return <Edge key={k} edge={e} look={look} a={{ x: a.x * U, y: a.y * U + lift(a.state) }} b={{ x: b.x * U, y: b.y * U + lift(b.state) }} ga={geoOf(a)} gb={geoOf(b)} />;
        })}
        {ordered.map((n) => {
          const g = geoOf(n);
          const tagTop = look === "bars" ? 30 - g.h - 4 : look === "tree" || look === "map" ? -g.w / 2 - 6 : -g.h / 2 - 4;
          return (
            <motion.g
              key={n.id}
              initial={{ x: n.x * U, y: n.y * U - 30, opacity: 0 }}
              animate={{ x: n.x * U, y: n.y * U + lift(n.state), opacity: PAL[n.state].op }}
              transition={spring}
            >
              <ellipse cx={0} cy={look === "bars" ? 36 : g.h / 2 + 12} rx={g.w / 2} ry={7} fill={INK} opacity={0.08} />
              <Shape node={n} look={look} g={g} index={indexed ? indexOf(n.id) : undefined} barBase={30} />
              {n.tag && n.state !== "hidden" && <Tag text={n.tag} top={tagTop} hot={n.state === "current" || n.state === "broken"} />}
            </motion.g>
          );
        })}
        <motion.g initial={{ x: b0.x, y: b0.y, opacity: 0 }} animate={{ x: b0.x, y: b0.y, opacity: billu ? 1 : 0 }} transition={{ type: "spring", stiffness: 120, damping: 14 }}>
          <g className="toy-bob">
            <circle r={25} fill="#FFFBF2" stroke={INK} strokeWidth={3.5} />
            <image href={withBase("/billu.webp")} x={-22} y={-22} width={44} height={44} clipPath="url(#toy-billu)" />
          </g>
        </motion.g>
      </svg>
    </div>
  );
}
