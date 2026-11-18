"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Scenario } from "../engine/types";
import { toneFill, toneVar } from "../engine/tones";

type Row =
  | { kind: "msg"; step: number; from: number; to: number; label: string; tone: string; first: boolean }
  | { kind: "note"; step: number; lanes: number[]; label: string; first: boolean };

const LANE = 132;
const ROW = 34;
const HEAD = 44;

/** The same scenario as a sequence diagram: one lifeline per object, one arrow per packet. */
export function SequenceView({ scenario, stepIndex, onStep }: { scenario: Scenario; stepIndex: number; onStep: (i: number) => void }) {
  const { lanes, rows } = useMemo(() => {
    const used = new Set<string>();
    scenario.steps.forEach((s) => {
      s.packets?.forEach((p) => {
        used.add(p.from);
        used.add(p.to);
      });
      if (!s.packets?.length) s.highlight?.forEach((h) => used.add(h));
    });
    const lanes = scenario.objects.filter((o) => used.has(o.id));
    const idx = (id: string) => lanes.findIndex((l) => l.id === id);
    const rows: Row[] = [];
    scenario.steps.forEach((s, si) => {
      if (s.packets?.length) {
        s.packets.forEach((p, pi) => rows.push({ kind: "msg", step: si, from: idx(p.from), to: idx(p.to), label: p.label, tone: p.tone ?? "blue", first: pi === 0 }));
      } else {
        const ls = (s.highlight ?? []).map(idx).filter((i) => i >= 0);
        rows.push({ kind: "note", step: si, lanes: ls.length ? ls : [0], label: s.title, first: true });
      }
    });
    return { lanes, rows };
  }, [scenario]);

  const width = Math.max(1, lanes.length) * LANE + 40;
  const height = HEAD + rows.length * ROW + 24;
  const laneX = (i: number) => 40 + i * LANE + LANE / 2;
  const box = useRef<HTMLDivElement>(null);
  const firstRowOfStep = rows.findIndex((r) => r.step === stepIndex);

  useEffect(() => {
    if (!box.current || firstRowOfStep < 0) return;
    const y = HEAD + firstRowOfStep * ROW;
    const el = box.current;
    if (y < el.scrollTop + HEAD || y > el.scrollTop + el.clientHeight - ROW * 2) el.scrollTo({ top: Math.max(0, y - el.clientHeight / 3), behavior: "smooth" });
  }, [firstRowOfStep]);

  return (
    <div ref={box} className="h-full overflow-auto pt-6">
      <svg width={width} height={height} className="min-w-full" role="img" aria-label={`${scenario.title} as a sequence diagram`}>
        <defs>
          {(["blue", "cyan", "violet", "amber", "green", "rose", "slate"] as const).map((t) => (
            <marker key={t} id={`seq-arrow-${t}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" style={{ fill: toneVar(t) }} />
            </marker>
          ))}
        </defs>
        {lanes.map((l, i) => (
          <g key={l.id}>
            <line x1={laneX(i)} x2={laneX(i)} y1={HEAD - 10} y2={height - 8} strokeDasharray="3 4" style={{ stroke: "var(--lab-border)" }} />
            <rect x={laneX(i) - 56} y={4} width={112} height={26} rx={4} style={{ fill: toneFill(l.tone ?? "blue", 14), stroke: toneVar(l.tone ?? "blue") }} />
            <text x={laneX(i)} y={21} textAnchor="middle" fontSize={9.5} fontWeight={600} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
              {(l.label.length > 17 ? `${l.label.slice(0, 16)}…` : l.label).toUpperCase()}
            </text>
          </g>
        ))}
        {rows.map((r, i) => {
          const y = HEAD + i * ROW + ROW / 2;
          const state = r.step === stepIndex ? "now" : r.step < stepIndex ? "past" : "future";
          const opacity = state === "future" ? 0.3 : state === "past" ? 0.7 : 1;
          return (
            <g key={i} opacity={opacity} className="cursor-pointer" onClick={() => onStep(r.step)}>
              {state === "now" && <rect x={0} y={y - ROW / 2} width={width} height={ROW} style={{ fill: toneFill("blue", 8) }} />}
              {r.first && (
                <text x={8} y={y + 3} fontSize={9} fontWeight={700} style={{ fill: state === "now" ? "var(--lab-accent)" : "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
                  {String(r.step + 1).padStart(2, "0")}
                </text>
              )}
              {r.kind === "msg" ? (
                r.from === r.to ? (
                  <g>
                    <path d={`M ${laneX(r.from)} ${y - 6} h 26 v 12 h -24`} fill="none" strokeWidth={1.3} markerEnd={`url(#seq-arrow-${r.tone})`} style={{ stroke: toneVar(r.tone as never) }} />
                    <text x={laneX(r.from) + 32} y={y + 3} fontSize={9} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
                      {r.label}
                    </text>
                  </g>
                ) : (
                  <g>
                    <line x1={laneX(r.from)} x2={laneX(r.to) + (r.to > r.from ? -3 : 3)} y1={y + 4} y2={y + 4} strokeWidth={1.3} markerEnd={`url(#seq-arrow-${r.tone})`} style={{ stroke: toneVar(r.tone as never) }} />
                    <text x={(laneX(r.from) + laneX(r.to)) / 2} y={y - 2} textAnchor="middle" fontSize={9} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
                      {r.label.length > 34 ? `${r.label.slice(0, 33)}…` : r.label}
                    </text>
                  </g>
                )
              ) : (
                (() => {
                  const lo = Math.min(...r.lanes);
                  const hi = Math.max(...r.lanes);
                  const x = laneX(lo) - 50;
                  const w = laneX(hi) - laneX(lo) + 100;
                  return (
                    <g>
                      <rect x={x} y={y - 10} width={w} height={20} rx={3} strokeDasharray="3 2" style={{ fill: toneFill("violet", 12), stroke: toneVar("violet") }} />
                      <text x={x + w / 2} y={y + 3} textAnchor="middle" fontSize={9} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
                        {r.label.length > 44 ? `${r.label.slice(0, 43)}…` : r.label}
                      </text>
                    </g>
                  );
                })()
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
