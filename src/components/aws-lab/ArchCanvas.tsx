"use client";

import { AnimatePresence, motion } from "framer-motion";
import { toneFill, toneVar } from "@/components/ai-lab/engine/tones";
import type { AwsLink, AwsNode, AwsScene, Chaos, NodeKind } from "./types";

const ICON: Record<NodeKind, string> = {
  user: "👤", internet: "🌐", server: "🖥️", lb: "⚖️", db: "🗄️", replica: "📚", cache: "⚡", bucket: "🪣", file: "📄", queue: "📬", topic: "📣",
  lambda: "λ", cdn: "🚀", dns: "📒", gateway: "🚪", firewall: "🛡️", key: "🔑", table: "🧮", autoscale: "📈", disk: "💽", nat: "🔀", role: "🎫",
  policy: "📜", monitor: "📊", box: "▣",
};

export const NODE_W = 112;
export const NODE_H = 76;

export type Analysis = {
  down: Set<string>;
  /** Nodes that currently receive traffic from a user. */
  reached: Set<string>;
  live: Set<string>;
  /** null when the scene has no goal node. */
  appUp: boolean | null;
};

/** Which nodes are broken, which still get traffic, and whether the app still works. */
export function analyze(scene: AwsScene, chaos: Chaos | undefined, broken: boolean): Analysis {
  const down = new Set<string>();
  if (broken && chaos) {
    for (const id of chaos.down) {
      down.add(id);
      for (const n of scene.nodes) if (n.zone === id) down.add(n.id);
    }
  }
  const reached = new Set<string>();
  const live = new Set<string>();
  const hasInbound = new Set(scene.links.map((l) => l.to));
  // Traffic starts at users and at anything nothing else points to (a sender, a client).
  const queue = scene.nodes.filter((n) => (n.kind === "user" || n.kind === "internet" || !hasInbound.has(n.id)) && !down.has(n.id)).map((n) => n.id);
  queue.forEach((id) => reached.add(id));
  while (queue.length) {
    const cur = queue.shift()!;
    for (const l of scene.links) {
      if (l.from !== cur || !l.flow || down.has(l.to)) continue;
      live.add(l.id);
      if (!reached.has(l.to)) {
        reached.add(l.to);
        queue.push(l.to);
      }
    }
  }
  const goals = scene.nodes.filter((n) => n.goal);
  return { down, reached, live, appUp: goals.length ? goals.some((g) => reached.has(g.id)) : null };
}

const byId = (nodes: AwsNode[]) => new Map(nodes.map((n) => [n.id, n]));

function Traffic({ link, a, b, spike }: { link: AwsLink; a: AwsNode; b: AwsNode; spike: boolean }) {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const dur = Math.max(1.4, len / 150);
  const count = spike ? 5 : 2;
  const path = `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} r={spike ? 3.5 : 4} fill={spike ? toneVar("rose") : toneVar(link.tone ?? "cyan")}>
          <animateMotion dur={`${dur}s`} begin={`${-(dur / count) * i}s`} repeatCount="indefinite" path={path} />
        </circle>
      ))}
    </>
  );
}

export function ArchCanvas({ scene, chaos, broken, animate = true }: { scene: AwsScene; chaos?: Chaos; broken: boolean; animate?: boolean }) {
  const merged: AwsScene =
    broken && chaos?.add
      ? { ...scene, nodes: [...scene.nodes, ...(chaos.add.nodes ?? [])], links: [...scene.links, ...(chaos.add.links ?? [])] }
      : scene;
  const a = analyze(merged, chaos, broken);
  const nodes = byId(merged.nodes);
  const spike = broken && !!chaos?.spike;

  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 1000 500" className="h-full w-full" role="img" aria-label="Architecture diagram">
        <defs>
          <pattern id="aws-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="var(--lab-grid)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1000" height="500" fill="url(#aws-grid)" opacity="0.7" />

        {merged.zones.map((z) => {
          const dead = a.down.has(z.id);
          return (
            <g key={z.id} opacity={dead ? 0.55 : 1}>
              <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={16} fill={toneFill(z.tone ?? "slate", dead ? 4 : 7)} stroke={dead ? toneVar("rose") : toneVar(z.tone ?? "slate")} strokeDasharray="7 6" strokeWidth={1.5} />
              <text x={z.x + 12} y={z.y + 19} fontSize={12} fontWeight={700} letterSpacing={0.8} fill={dead ? toneVar("rose") : toneVar(z.tone ?? "slate")}>
                {z.label.toUpperCase()}{dead ? " · DOWN" : ""}
              </text>
            </g>
          );
        })}

        {merged.links.map((l) => {
          const f = nodes.get(l.from);
          const t = nodes.get(l.to);
          if (!f || !t) return null;
          const on = a.live.has(l.id);
          const dead = a.down.has(l.from) || a.down.has(l.to);
          const mx = (f.x + t.x) / 2;
          const my = (f.y + t.y) / 2;
          return (
            <g key={l.id}>
              <line x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke={dead ? toneVar("rose") : toneVar(l.tone ?? (on ? "cyan" : "slate"))} strokeWidth={on ? 2.2 : 1.6} strokeDasharray={l.dashed || dead ? "6 6" : undefined} opacity={dead ? 0.35 : on ? 0.9 : 0.45} />
              {l.flow && on && animate && <Traffic link={l} a={f} b={t} spike={spike} />}
              {l.label && (
                <g>
                  <rect x={mx - l.label.length * 3.4 - 6} y={my - 10} width={l.label.length * 6.8 + 12} height={18} rx={9} fill="var(--lab-bg)" stroke="var(--lab-border)" />
                  <text x={mx} y={my + 3} textAnchor="middle" fontSize={10.5} fill="var(--lab-muted)">{l.label}</text>
                </g>
              )}
            </g>
          );
        })}

        <AnimatePresence>
          {merged.nodes.map((n) => {
            const dead = a.down.has(n.id);
            const idle = !dead && !a.reached.has(n.id) && merged.links.some((l) => l.to === n.id);
            const tn = dead ? "rose" : n.tone ?? "blue";
            return (
              <motion.g
                key={n.id}
                initial={animate ? { opacity: 0, scale: 0.5, x: n.x, y: n.y } : false}
                animate={{ opacity: dead ? 0.6 : idle ? 0.5 : 1, scale: 1, x: n.x, y: n.y }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 160, damping: 20 }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
                <rect x={-NODE_W / 2} y={-NODE_H / 2} width={NODE_W} height={NODE_H} rx={14} fill={toneFill(tn, dead ? 8 : 16)} stroke={toneVar(tn)} strokeWidth={n.goal ? 2.6 : 1.6} />
                <text y={-8} textAnchor="middle" fontSize={26} style={{ filter: dead ? "grayscale(1)" : undefined }}>{ICON[n.kind]}</text>
                <text y={17} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="var(--lab-text)">{n.label}</text>
                {n.sub && <text y={30} textAnchor="middle" fontSize={10} fill="var(--lab-muted)">{dead ? "not working" : n.sub}</text>}
                {dead && (
                  <g>
                    <circle cx={NODE_W / 2 - 4} cy={-NODE_H / 2 + 4} r={11} fill={toneVar("rose")} />
                    <text x={NODE_W / 2 - 4} y={-NODE_H / 2 + 9} textAnchor="middle" fontSize={14} fontWeight={800} fill="#fff">✕</text>
                  </g>
                )}
                {idle && <text y={-NODE_H / 2 - 5} textAnchor="middle" fontSize={10} fill={toneVar("amber")}>no traffic</text>}
              </motion.g>
            );
          })}
        </AnimatePresence>
      </svg>

      {broken && chaos && !chaos.noStatus && a.appUp !== null && (
        <div
          className="pointer-events-none absolute right-3 top-3 rounded-full px-3 py-1.5 text-[13px] font-bold shadow-lg"
          style={{ background: a.appUp ? toneFill("green", 28) : toneFill("rose", 30), color: a.appUp ? toneVar("green") : toneVar("rose"), border: `1px solid ${a.appUp ? toneVar("green") : toneVar("rose")}` }}
        >
          {a.appUp ? "✅ The app still works" : "❌ The app is down"}
        </div>
      )}
    </div>
  );
}
