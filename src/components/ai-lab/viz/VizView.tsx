"use client";

import dynamic from "next/dynamic";
import { Fragment, useId } from "react";
import type {
  BarsViz,
  ChatViz,
  HeatmapViz,
  MatrixViz,
  NetworkViz,
  PlotViz,
  ScatterViz,
  StackViz,
  TableViz,
  TokensViz,
  TreeNode,
  TreeViz,
  Viz,
} from "../engine/types";
import { toneFill, toneVar } from "../engine/tones";

const ThreeLoss = dynamic(() => import("./ThreeLoss"), { ssr: false, loading: () => <ThreeLoading /> });
const ThreeEmbed = dynamic(() => import("./ThreeEmbed"), { ssr: false, loading: () => <ThreeLoading /> });

function ThreeLoading() {
  return <div className="grid h-full min-h-[220px] place-items-center font-labmono text-xs text-lab-muted">loading 3D…</div>;
}

export function fmt(v: number, format?: string) {
  switch (format) {
    case "pct":
      return `${(v * 100).toFixed(1)}%`;
    case "int":
      return String(Math.round(v));
    case "fixed1":
      return v.toFixed(1);
    case "fixed3":
      return v.toFixed(3);
    case "fixed4":
      return v.toFixed(4);
    default:
      return v.toFixed(2);
  }
}

function Frame({ title, caption, children }: { title?: string; caption?: string; children: React.ReactNode }) {
  return (
    <figure className="rounded-md border border-lab-border bg-lab-raised p-3">
      {title && <figcaption className="mb-2 font-labmono text-[10px] font-semibold uppercase tracking-[0.14em] text-lab-muted">{title}</figcaption>}
      {children}
      {caption && <p className="mt-2 text-[12px] leading-snug text-lab-muted">{caption}</p>}
    </figure>
  );
}

function Bars({ v }: { v: BarsViz }) {
  const max = v.max ?? Math.max(...v.items.map((i) => Math.abs(i.value)), 1e-9);
  return (
    <Frame title={v.title} caption={v.caption}>
      <div className="space-y-1.5">
        {v.items.map((it, i) => (
          <div key={i} className="grid grid-cols-[minmax(56px,auto)_1fr_auto] items-center gap-2 font-labmono text-[11px]">
            <span className="truncate text-lab-text" title={it.label}>
              {it.label}
            </span>
            <div className="h-3 rounded-sm bg-lab-panel">
              <div
                className="h-3 rounded-sm transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${Math.max(0, Math.min(100, (Math.abs(it.value) / max) * 100))}%`, background: toneVar(it.tone ?? "blue") }}
              />
            </div>
            <span className="tabular-nums text-lab-muted">
              {fmt(it.value, v.format)}
              {it.note ? ` ${it.note}` : ""}
            </span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function Heatmap({ v }: { v: HeatmapViz }) {
  const max = Math.max(...v.values.flat(), 1e-9);
  return (
    <Frame title={v.title} caption={v.caption}>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0.5 font-labmono text-[10.5px]">
          <thead>
            <tr>
              <th className="text-left text-[9px] font-normal text-lab-muted">{v.rowAxis ? `${v.rowAxis} ↓ / ${v.colAxis ?? ""} →` : ""}</th>
              {v.colLabels.map((c) => (
                <th key={c} className="px-1 pb-1 text-center font-semibold text-lab-muted">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {v.values.map((row, r) => (
              <tr key={r}>
                <th className={`pr-2 text-right font-semibold ${v.highlightRow === r ? "text-lab-accent" : "text-lab-muted"}`}>{v.rowLabels[r]}</th>
                {row.map((x, c) => (
                  <td
                    key={c}
                    className="rounded-sm px-1 py-1.5 text-center tabular-nums transition-colors duration-500"
                    style={{
                      background: toneFill("blue", 6 + (x / max) * 74),
                      color: x / max > 0.55 ? "white" : "var(--lab-text)",
                      outline: v.highlightRow === r ? `1px solid ${toneVar("amber")}` : undefined,
                    }}
                  >
                    {fmt(x, v.format)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Frame>
  );
}

function Matrices({ v }: { v: MatrixViz }) {
  return (
    <Frame title={v.title} caption={v.caption}>
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
        {v.items.map((m, i) => (
          <Fragment key={m.name + i}>
            <div>
              <div className="mb-1 text-center font-labmono text-[10px] font-bold" style={{ color: toneVar(m.tone ?? "blue") }}>
                {m.name}
              </div>
              <table className="border-separate border-spacing-0 font-labmono text-[10px]">
                {m.colLabels && (
                  <thead>
                    <tr>
                      {m.rowLabels && <th />}
                      {m.colLabels.map((c) => (
                        <th key={c} className="px-1 font-normal text-lab-muted">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {m.values.map((row, r) => (
                    <tr key={r}>
                      {m.rowLabels && <th className="pr-1 text-right font-normal text-lab-muted">{m.rowLabels[r]}</th>}
                      {row.map((x, c) => (
                        <td
                          key={c}
                          className="border px-1.5 py-0.5 text-right tabular-nums"
                          style={{ borderColor: "var(--lab-border)", background: toneFill(m.tone ?? "blue", 8) }}
                        >
                          {fmt(x, v.format)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {v.ops?.[i] && <span className="font-labmono text-sm text-lab-muted">{v.ops[i]}</span>}
          </Fragment>
        ))}
      </div>
    </Frame>
  );
}

const W = 320;
const H = 200;
const PAD = { l: 34, r: 10, t: 10, b: 26 };

function scaler(dom: [number, number], range: [number, number]) {
  return (x: number) => range[0] + ((x - dom[0]) / (dom[1] - dom[0] || 1)) * (range[1] - range[0]);
}

function Axes({ x, y, xLabel, yLabel, h = H }: { x: [number, number]; y: [number, number]; xLabel?: string; yLabel?: string; h?: number }) {
  const sx = scaler(x, [PAD.l, W - PAD.r]);
  const sy = scaler(y, [h - PAD.b, PAD.t]);
  const zeroX = x[0] < 0 && x[1] > 0 ? sx(0) : null;
  const zeroY = y[0] < 0 && y[1] > 0 ? sy(0) : null;
  const tick = (n: number) => (Math.abs(n) >= 100 ? n.toFixed(0) : Number.isInteger(n) ? String(n) : n.toFixed(1));
  return (
    <g fontSize={9} style={{ fontFamily: "var(--lab-mono)", fill: "var(--lab-muted)" }}>
      <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={h - PAD.t - PAD.b} fill="none" style={{ stroke: "var(--lab-border)" }} />
      {zeroX !== null && <line x1={zeroX} x2={zeroX} y1={PAD.t} y2={h - PAD.b} strokeDasharray="2 3" style={{ stroke: "var(--lab-border)" }} />}
      {zeroY !== null && <line x1={PAD.l} x2={W - PAD.r} y1={zeroY} y2={zeroY} strokeDasharray="2 3" style={{ stroke: "var(--lab-border)" }} />}
      <text x={PAD.l} y={h - PAD.b + 12} textAnchor="middle">
        {tick(x[0])}
      </text>
      <text x={W - PAD.r} y={h - PAD.b + 12} textAnchor="middle">
        {tick(x[1])}
      </text>
      <text x={PAD.l - 4} y={h - PAD.b} textAnchor="end">
        {tick(y[0])}
      </text>
      <text x={PAD.l - 4} y={PAD.t + 8} textAnchor="end">
        {tick(y[1])}
      </text>
      {xLabel && (
        <text x={(PAD.l + W - PAD.r) / 2} y={h - 4} textAnchor="middle">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text x={10} y={(PAD.t + h - PAD.b) / 2} textAnchor="middle" transform={`rotate(-90 10 ${(PAD.t + h - PAD.b) / 2})`}>
          {yLabel}
        </text>
      )}
    </g>
  );
}

function Plot({ v }: { v: PlotViz }) {
  const uid = useId().replace(/:/g, "");
  const sx = scaler(v.x, [PAD.l, W - PAD.r]);
  const sy = scaler(v.y, [H - PAD.b, PAD.t]);
  const clampY = (y: number) => Math.max(v.y[0] - (v.y[1] - v.y[0]) * 0.05, Math.min(v.y[1] + (v.y[1] - v.y[0]) * 0.05, y));
  return (
    <Frame title={v.title} caption={v.caption}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={v.title ?? "plot"}>
        <defs>
          <clipPath id={`clip-${uid}`}>
            <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={H - PAD.t - PAD.b} />
          </clipPath>
          <marker id={`arrow-${uid}`} viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" style={{ fill: toneVar("amber") }} />
          </marker>
        </defs>
        <Axes x={v.x} y={v.y} xLabel={v.xLabel} yLabel={v.yLabel} />
        <g clipPath={`url(#clip-${uid})`}>
          {v.series.map((s, i) =>
            s.dots ? (
              <g key={i}>
                {s.points.map(([x, y], j) => (
                  <circle key={j} cx={sx(x)} cy={sy(y)} r={2.6} style={{ fill: toneVar(s.tone ?? "blue") }} />
                ))}
              </g>
            ) : (
              <polyline
                key={i}
                points={s.points.map(([x, y]) => `${sx(x).toFixed(1)},${sy(clampY(y)).toFixed(1)}`).join(" ")}
                fill="none"
                strokeWidth={1.8}
                strokeDasharray={s.dashed ? "4 3" : undefined}
                style={{ stroke: toneVar(s.tone ?? "blue") }}
              />
            ),
          )}
          {v.connectMarkers &&
            v.markers?.slice(1).map((m, i) => {
              const a = v.markers![i];
              return (
                <line key={i} x1={sx(a.x)} y1={sy(a.y)} x2={sx(m.x)} y2={sy(m.y)} strokeWidth={1.2} markerEnd={`url(#arrow-${uid})`} style={{ stroke: toneVar("amber") }} />
              );
            })}
          {v.markers?.map((m, i) => (
            <g key={i}>
              <circle cx={sx(m.x)} cy={sy(m.y)} r={3.6} strokeWidth={1.2} style={{ fill: toneFill(m.tone ?? "amber", 60), stroke: toneVar(m.tone ?? "amber") }} />
              {m.label && (
                <text x={sx(m.x) + 6} y={sy(m.y) - 6} fontSize={9} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
                  {m.label}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>
      {v.series.length > 1 && (
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-labmono text-[10px] text-lab-muted">
          {v.series.map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1">
              <span className="inline-block h-0.5 w-3" style={{ background: toneVar(s.tone ?? "blue") }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
    </Frame>
  );
}

function Scatter({ v }: { v: ScatterViz }) {
  const h = 230;
  const sx = scaler(v.x, [PAD.l, W - PAD.r]);
  const sy = scaler(v.y, [h - PAD.b, PAD.t]);
  return (
    <Frame title={v.title} caption={v.caption}>
      <svg viewBox={`0 0 ${W} ${h}`} className="w-full" role="img" aria-label={v.title ?? "scatter"}>
        <Axes x={v.x} y={v.y} h={h} />
        {v.boundary && (
          <polyline points={v.boundary.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ")} fill="none" strokeWidth={1.6} strokeDasharray="5 3" style={{ stroke: toneVar("amber") }} />
        )}
        {v.query?.neighbours?.map((n) => (
          <line key={n} x1={sx(v.query!.x)} y1={sy(v.query!.y)} x2={sx(v.points[n].x)} y2={sy(v.points[n].y)} strokeDasharray="3 3" strokeWidth={1.1} style={{ stroke: toneVar("amber") }} />
        ))}
        {v.points.map((p, i) => (
          <g key={i}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={4} style={{ fill: toneFill(p.tone ?? "blue", 70), stroke: toneVar(p.tone ?? "blue") }} />
            {p.label && (
              <text x={sx(p.x) + 6} y={sy(p.y) + 3} fontSize={8.5} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
                {p.label}
              </text>
            )}
          </g>
        ))}
        {v.query && (
          <g>
            <path
              d={`M ${sx(v.query.x)} ${sy(v.query.y) - 7} L ${sx(v.query.x) + 2} ${sy(v.query.y) - 2} L ${sx(v.query.x) + 7} ${sy(v.query.y)} L ${sx(v.query.x) + 2} ${sy(v.query.y) + 2} L ${sx(v.query.x)} ${sy(v.query.y) + 7} L ${sx(v.query.x) - 2} ${sy(v.query.y) + 2} L ${sx(v.query.x) - 7} ${sy(v.query.y)} L ${sx(v.query.x) - 2} ${sy(v.query.y) - 2} Z`}
              style={{ fill: toneVar("amber") }}
            />
            <text x={sx(v.query.x) + 9} y={sy(v.query.y) - 6} fontSize={9} fontWeight={700} style={{ fill: toneVar("amber"), fontFamily: "var(--lab-mono)" }}>
              {v.query.label}
            </text>
          </g>
        )}
      </svg>
    </Frame>
  );
}

function Tokens({ v }: { v: TokensViz }) {
  return (
    <Frame title={v.title} caption={v.caption}>
      <div className="flex flex-wrap gap-1.5">
        {v.tokens.map((t, i) => (
          <div key={i} className="rounded border px-2 py-1 text-center font-labmono" style={{ borderColor: toneVar(t.tone ?? "blue"), background: toneFill(t.tone ?? "blue", 12) }}>
            <div className="whitespace-pre text-[12px] text-lab-text">{t.text}</div>
            {t.id !== undefined && <div className="text-[9.5px] tabular-nums" style={{ color: toneVar(t.tone ?? "blue") }}>{t.id}</div>}
            {t.note && <div className="text-[9px] text-lab-muted">{t.note}</div>}
          </div>
        ))}
      </div>
    </Frame>
  );
}

function Table({ v }: { v: TableViz }) {
  return (
    <Frame title={v.title} caption={v.caption}>
      <div className="overflow-x-auto">
        <table className="w-full font-labmono text-[10.5px]">
          <thead>
            <tr className="border-b border-lab-border text-left text-lab-muted">
              {v.columns.map((c) => (
                <th key={c} className="px-1.5 py-1 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {v.rows.map((r, i) => (
              <tr key={i} className="border-b border-lab-border last:border-0" style={v.highlightRow === i ? { background: toneFill("amber", 14) } : undefined}>
                {r.map((c, j) => (
                  <td key={j} className="px-1.5 py-1 align-top tabular-nums text-lab-text">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Frame>
  );
}

function Stack({ v }: { v: StackViz }) {
  const total = v.segments.reduce((s, x) => s + x.value, 0);
  return (
    <Frame title={v.title} caption={v.caption}>
      <div className="flex h-8 overflow-hidden rounded">
        {v.segments.map((s) => (
          <div
            key={s.label}
            className="grid place-items-center font-labmono text-[10px] font-semibold text-white"
            style={{ width: `${(s.value / total) * 100}%`, background: toneVar(s.tone ?? "blue") }}
            title={s.label}
          >
            {Math.round((s.value / total) * 100)}%
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 font-labmono text-[10px] text-lab-muted">
        {v.segments.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: toneVar(s.tone ?? "blue") }} />
            {s.label}
          </span>
        ))}
      </div>
    </Frame>
  );
}

function TreeBranch({ node, depth }: { node: TreeNode; depth: number }) {
  return (
    <div className={depth ? "ml-3 border-l border-lab-border pl-3" : ""}>
      <div
        className="my-1 inline-block rounded border px-2 py-1 font-labmono text-[11px] text-lab-text"
        style={{ borderColor: toneVar(node.tone ?? (node.children ? "violet" : "green")), background: toneFill(node.tone ?? (node.children ? "violet" : "green"), 10) }}
      >
        {node.label}
      </div>
      {node.children?.map((c, i) => (
        <div key={i}>
          <div className="ml-3 font-labmono text-[10px] text-lab-muted">└ {c.edge}</div>
          <TreeBranch node={c.node} depth={depth + 1} />
        </div>
      ))}
    </div>
  );
}

function Tree({ v }: { v: TreeViz }) {
  return (
    <Frame title={v.title} caption={v.caption}>
      <TreeBranch node={v.root} depth={0} />
    </Frame>
  );
}

const ROLE_TONE = { system: "slate", user: "cyan", assistant: "green", tool: "amber" } as const;

function Chat({ v }: { v: ChatViz }) {
  return (
    <Frame title={v.title} caption={v.caption}>
      <div className="space-y-1.5">
        {v.messages.map((m, i) => (
          <div
            key={i}
            className={`rounded border px-2 py-1.5 text-[12px] leading-snug ${m.dim ? "opacity-45" : ""}`}
            style={{ borderColor: toneVar(ROLE_TONE[m.role]), background: toneFill(ROLE_TONE[m.role], 8) }}
          >
            <span className="mr-1.5 font-labmono text-[9.5px] font-bold uppercase tracking-wider" style={{ color: toneVar(ROLE_TONE[m.role]) }}>
              {m.role}
            </span>
            <span className="whitespace-pre-wrap break-words font-labmono text-[11px] text-lab-text">{m.text}</span>
            {m.note && <div className="mt-0.5 text-[10.5px] text-lab-muted">{m.note}</div>}
          </div>
        ))}
      </div>
    </Frame>
  );
}

function Network({ v }: { v: NetworkViz }) {
  const h = 210;
  const n = v.layers.length;
  const xs = v.layers.map((_, i) => 36 + (i * (W - 72)) / Math.max(1, n - 1));
  const ys = v.layers.map((count) => Array.from({ length: count }, (_, j) => (h - 30) / 2 + 6 + (j - (count - 1) / 2) * Math.min(38, (h - 50) / Math.max(1, count - 1))));
  return (
    <Frame title={v.title} caption={v.caption}>
      <svg viewBox={`0 0 ${W} ${h}`} className="w-full" role="img" aria-label={v.title ?? "network"}>
        {v.layers.slice(1).map((_, li) =>
          ys[li].flatMap((y1, a) =>
            ys[li + 1].map((y2, b) => {
              const active = v.activeLayer === li + 1 || (v.flow === "backward" && v.activeLayer === li);
              return (
                <line
                  key={`${li}-${a}-${b}`}
                  x1={xs[li]}
                  y1={y1}
                  x2={xs[li + 1]}
                  y2={y2}
                  strokeWidth={active ? 1.2 : 0.7}
                  strokeDasharray={active ? "4 4" : undefined}
                  className={active ? (v.flow === "backward" ? "lab-dash-rev" : "lab-dash") : undefined}
                  style={{ stroke: active ? toneVar(v.flow === "backward" ? "rose" : "cyan") : "var(--lab-border)" }}
                />
              );
            }),
          ),
        )}
        {v.layers.map((_, li) =>
          ys[li].map((y, j) => {
            const val = v.values?.[li]?.[j];
            const active = v.activeLayer === li;
            const tone = li === 0 ? "blue" : li === n - 1 ? "green" : "violet";
            return (
              <g key={`${li}-${j}`}>
                <circle cx={xs[li]} cy={y} r={13} strokeWidth={active ? 2 : 1.2} style={{ fill: toneFill(tone, active ? 35 : 15), stroke: toneVar(tone) }} />
                {val !== undefined && val !== null && (
                  <text x={xs[li]} y={y + 3} textAnchor="middle" fontSize={8.5} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
                    {Math.abs(val) >= 10 ? val.toFixed(0) : val.toFixed(2)}
                  </text>
                )}
              </g>
            );
          }),
        )}
        {v.layerNames?.map((name, li) => (
          <text key={name + li} x={xs[li]} y={h - 6} textAnchor="middle" fontSize={8.5} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
            {name}
          </text>
        ))}
      </svg>
    </Frame>
  );
}

/** `big`: drawn as the centre stage, so the 3D views get more height. */
export function VizView({ viz, big }: { viz: Viz; big?: boolean }) {
  const threeH = big ? "h-[min(56vh,420px)]" : "h-[260px]";
  switch (viz.kind) {
    case "bars":
      return <Bars v={viz} />;
    case "heatmap":
      return <Heatmap v={viz} />;
    case "matrices":
      return <Matrices v={viz} />;
    case "plot":
      return <Plot v={viz} />;
    case "scatter":
      return <Scatter v={viz} />;
    case "tokens":
      return <Tokens v={viz} />;
    case "table":
      return <Table v={viz} />;
    case "stack":
      return <Stack v={viz} />;
    case "tree":
      return <Tree v={viz} />;
    case "chat":
      return <Chat v={viz} />;
    case "nn":
      return <Network v={viz} />;
    case "three-loss":
      return (
        <Frame title={viz.title} caption={viz.caption}>
          <div className={`${threeH} overflow-hidden rounded bg-lab-scene`}>
            <ThreeLoss />
          </div>
        </Frame>
      );
    case "three-embed":
      return (
        <Frame title={viz.title} caption={viz.caption}>
          <div className={`${threeH} overflow-hidden rounded bg-lab-scene`}>
            <ThreeEmbed />
          </div>
        </Frame>
      );
  }
}
