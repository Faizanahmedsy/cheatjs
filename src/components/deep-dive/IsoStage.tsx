"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import type { EdgeState, NodeState, SceneEdge, SceneNode, Step } from "@/lib/deep-dive/types";

/** Grid units to screen: a classic 2:1 isometric projection. */
const U = 44;
const proj = (x: number, y: number) => ({ x: (x - y) * U * 0.866, y: (x + y) * U * 0.5 });

const W2 = 26; // half width of a block's top face
const H2 = 15; // half height of a block's top face
const H = 28; // block height

const spring = { type: "spring", stiffness: 160, damping: 22, mass: 0.9 } as const;

const NODE: Record<NodeState, { top: string; left: string; right: string; ink: string; hatch?: boolean; opacity: number }> = {
  idle: { top: "#f4f4f5", left: "#d4d4d8", right: "#a1a1aa", ink: "#18181b", opacity: 1 },
  frontier: { top: "#ffe5d4", left: "#fec7a8", right: "#fca172", ink: "#652f21", opacity: 1 },
  current: { top: "#f5793f", left: "#e5603a", right: "#c2532f", ink: "#fff4ed", hatch: true, opacity: 1 },
  done: { top: "#52525b", left: "#3f3f46", right: "#27272a", ink: "#fafafa", opacity: 1 },
  dim: { top: "#3f3f46", left: "#27272a", right: "#18181b", ink: "#a1a1aa", opacity: 0.45 },
  hidden: { top: "#3f3f46", left: "#27272a", right: "#18181b", ink: "#a1a1aa", opacity: 0 },
};

const EDGE: Record<EdgeState, { stroke: string; width: number; opacity: number; dash?: string }> = {
  idle: { stroke: "#71717a", width: 1.6, opacity: 0.9 },
  active: { stroke: "#f5793f", width: 3, opacity: 1, dash: "6 5" },
  chosen: { stroke: "#fafafa", width: 3.2, opacity: 1 },
  dim: { stroke: "#52525b", width: 1.2, opacity: 0.35 },
  hidden: { stroke: "#52525b", width: 1, opacity: 0 },
};

function Block({ node }: { node: SceneNode }) {
  const c = NODE[node.state];
  const p = proj(node.x, node.y);
  const top = `M0,${-H2} L${W2},0 L0,${H2} L${-W2},0 Z`;
  const left = `M${-W2},0 L0,${H2} L0,${H2 + H} L${-W2},${H} Z`;
  const right = `M0,${H2} L${W2},0 L${W2},${H} L0,${H2 + H} Z`;
  return (
    <motion.g
      initial={{ x: p.x, y: p.y - H - 30, opacity: 0 }}
      animate={{ x: p.x, y: p.y - H, opacity: c.opacity, scale: node.state === "hidden" ? 0.7 : 1 }}
      transition={spring}
    >
      <motion.path d={left} animate={{ fill: c.left }} transition={{ duration: 0.35 }} />
      <motion.path d={right} animate={{ fill: c.right }} transition={{ duration: 0.35 }} />
      {c.hatch && <path d={right} fill="url(#dd-hatch)" />}
      <motion.path d={top} animate={{ fill: c.top }} transition={{ duration: 0.35 }} stroke="rgba(0,0,0,0.12)" strokeWidth={0.8} />
      <motion.text
        y={4}
        textAnchor="middle"
        animate={{ fill: c.ink }}
        className="select-none font-semibold"
        style={{ fontSize: node.label.length > 2 ? 11 : 14 }}
      >
        {node.label}
      </motion.text>
      {node.tag && node.state !== "hidden" && (
        <motion.g key={node.tag} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <rect x={-node.tag.length * 3.6 - 7} y={-H2 - 26} width={node.tag.length * 7.2 + 14} height={18} rx={5} fill="#18181b" stroke="#3f3f46" />
          <text y={-H2 - 13} textAnchor="middle" fill="#fafafa" style={{ fontSize: 11 }} className="font-code">
            {node.tag}
          </text>
        </motion.g>
      )}
    </motion.g>
  );
}

function Edge({ edge, from, to }: { edge: SceneEdge; from: SceneNode; to: SceneNode }) {
  const s = EDGE[edge.state];
  const a = proj(from.x, from.y);
  const b = proj(to.x, to.y);
  // Stop arrows short of the block they point at.
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const cut = edge.directed ? 30 : 0;
  const bx = b.x - ((b.x - a.x) / len) * cut;
  const by = b.y - ((b.y - a.y) / len) * cut;
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  return (
    <motion.g initial={false} animate={{ opacity: s.opacity }} transition={{ duration: 0.3 }}>
      <motion.line
        initial={false}
        animate={{ x1: a.x, y1: a.y, x2: bx, y2: by, stroke: s.stroke, strokeWidth: s.width }}
        transition={spring}
        strokeDasharray={s.dash}
        strokeLinecap="round"
        markerEnd={edge.directed ? `url(#dd-arrow-${edge.state})` : undefined}
        className={s.dash ? "dd-march" : undefined}
      />
      {edge.weight !== undefined && (
        <g transform={`translate(${mx},${my})`}>
          <rect x={-12} y={-9} width={24} height={18} rx={5} fill="#09090b" stroke={s.stroke} strokeOpacity={0.6} />
          <text y={4} textAnchor="middle" fill="#e4e4e7" style={{ fontSize: 11 }} className="font-code">
            {edge.weight}
          </text>
        </g>
      )}
    </motion.g>
  );
}

/** The whole scene for one step. Blocks keep their keys between steps, so every change tweens. */
export function IsoStage({ step, all }: { step: Step; all: Step[] }) {
  const box = useMemo(() => {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const s of all)
      for (const n of s.nodes) {
        if (n.state === "hidden") continue;
        x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y);
      }
    return { x0: x0 - 1.2, x1: x1 + 1.2, y0: y0 - 1.2, y1: y1 + 1.2 };
  }, [all]);

  const corners = [proj(box.x0, box.y0), proj(box.x1, box.y0), proj(box.x1, box.y1), proj(box.x0, box.y1)];
  const T = 16; // platform thickness
  const minX = Math.min(...corners.map((c) => c.x)) - 10;
  const maxX = Math.max(...corners.map((c) => c.x)) + 10;
  const minY = Math.min(...corners.map((c) => c.y)) - H - 50;
  const maxY = Math.max(...corners.map((c) => c.y)) + T + 10;
  const edgeSeed = useMemo(() => {
    const m = new Map<string, SceneEdge>();
    for (const s of all) for (const e of s.edges) if (!m.has(`${e.a}-${e.b}`)) m.set(`${e.a}-${e.b}`, e);
    return m;
  }, [all]);
  const edgeKeys = [...edgeSeed.keys()];
  const byId = new Map(step.nodes.map((n) => [n.id, n]));
  const ordered = [...step.nodes].sort((p, q) => p.x + p.y - (q.x + q.y));
  const pt = (c: { x: number; y: number }, dy = 0) => `${c.x},${c.y + dy}`;

  return (
    <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} className="h-full w-full" role="img" aria-label={step.title}>
      <defs>
        <pattern id="dd-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="2.5" height="6" fill="rgba(255,255,255,0.35)" />
        </pattern>
        <pattern id="dd-side" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="7" fill="#18181b" />
          <rect width="2" height="7" fill="#27272a" />
        </pattern>
        {(Object.keys(EDGE) as EdgeState[]).map((k) => (
          <marker key={k} id={`dd-arrow-${k}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={EDGE[k].stroke} />
          </marker>
        ))}
      </defs>
      {/* Platform: top, then the two visible sides. */}
      <polygon points={`${pt(corners[3])} ${pt(corners[2])} ${pt(corners[2], T)} ${pt(corners[3], T)}`} fill="#111113" />
      <polygon points={`${pt(corners[1])} ${pt(corners[2])} ${pt(corners[2], T)} ${pt(corners[1], T)}`} fill="url(#dd-side)" />
      <polygon points={corners.map((c) => pt(c)).join(" ")} fill="#1c1c1f" stroke="#2e2e33" />
      {edgeKeys.map((k) => {
        const e = step.edges.find((x) => `${x.a}-${x.b}` === k) ?? { ...edgeSeed.get(k)!, state: "hidden" as const };
        const from = byId.get(e.a);
        const to = byId.get(e.b);
        return from && to ? <Edge key={k} edge={e} from={from} to={to} /> : null;
      })}
      {ordered.map((n) => (
        <Block key={n.id} node={n} />
      ))}
    </svg>
  );
}
