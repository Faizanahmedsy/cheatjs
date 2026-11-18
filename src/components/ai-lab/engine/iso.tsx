/**
 * Isometric drawing kit. Everything is plain SVG drawn in "iso units":
 * x runs down-right, y runs down-left, z runs up. One unit = 28 px across,
 * 16 px down; one unit of height = 32 px.
 */
import type { ReactNode } from "react";
import type { ObjectKind, Tone } from "./types";
import { toneFill, toneVar } from "./tones";

export const ISO_X = 28;
export const ISO_Y = 16;
export const ISO_Z = 32;

/** Screen position of an object placed at lattice `[col, row]`. */
export const latticeToScreen = ([c, r]: [number, number]) => ({ x: c * 56, y: r * 32 });

/** Local iso point → screen offset from the object's anchor. */
export const P = (x: number, y: number, z = 0): [number, number] => [(x - y) * ISO_X, (x + y) * ISO_Y - z * ISO_Z];

const pts = (list: [number, number][]) => list.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");

type BoxProps = { w: number; d: number; h: number; z?: number; ox?: number; oy?: number; tone: Tone; strong?: boolean };

/** An axis-aligned box centred on (ox, oy). Draws only the three visible faces. */
export function IsoBox({ w, d, h, z = 0, ox = 0, oy = 0, tone, strong }: BoxProps) {
  const x0 = ox - w / 2, x1 = ox + w / 2, y0 = oy - d / 2, y1 = oy + d / 2, z1 = z + h;
  const stroke = toneVar(tone);
  const sw = strong ? 1.5 : 1.1;
  return (
    <g strokeLinejoin="round" style={{ stroke }} strokeWidth={sw}>
      {/* +y face (front-left) */}
      <polygon points={pts([P(x0, y1, z), P(x1, y1, z), P(x1, y1, z1), P(x0, y1, z1)])} style={{ fill: toneFill(tone, 12) }} />
      {/* +x face (front-right) */}
      <polygon points={pts([P(x1, y0, z), P(x1, y1, z), P(x1, y1, z1), P(x1, y0, z1)])} style={{ fill: toneFill(tone, 7) }} />
      {/* top */}
      <polygon points={pts([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)])} style={{ fill: toneFill(tone, strong ? 30 : 20) }} />
    </g>
  );
}

/** An ellipse lying flat on the ground plane at height z. */
export function IsoEllipse({ r, z = 0, ox = 0, oy = 0, tone, fill = 0, dashed }: { r: number; z?: number; ox?: number; oy?: number; tone: Tone; fill?: number; dashed?: boolean }) {
  const [cx, cy] = P(ox, oy, z);
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={r * ISO_X * Math.SQRT2}
      ry={r * ISO_Y * Math.SQRT2}
      strokeWidth={1.1}
      strokeDasharray={dashed ? "3 3" : undefined}
      style={{ stroke: toneVar(tone), fill: fill ? toneFill(tone, fill) : "none" }}
    />
  );
}

function Cylinder({ r, h, tone, strong, rings = 2 }: { r: number; h: number; tone: Tone; strong?: boolean; rings?: number }) {
  const rx = r * ISO_X * Math.SQRT2;
  const ry = r * ISO_Y * Math.SQRT2;
  const H = h * ISO_Z;
  const stroke = toneVar(tone);
  return (
    <g strokeWidth={strong ? 1.5 : 1.1} style={{ stroke }}>
      <path d={`M ${-rx},${-H} L ${-rx},0 A ${rx} ${ry} 0 0 0 ${rx},0 L ${rx},${-H} A ${rx} ${ry} 0 0 1 ${-rx},${-H} Z`} style={{ fill: toneFill(tone, 10) }} />
      {Array.from({ length: rings }, (_, i) => {
        const y = (-H * (i + 1)) / (rings + 1);
        return <path key={i} d={`M ${-rx},${y} A ${rx} ${ry} 0 0 0 ${rx},${y}`} fill="none" strokeOpacity={0.6} />;
      })}
      <ellipse cx={0} cy={-H} rx={rx} ry={ry} style={{ fill: toneFill(tone, strong ? 30 : 20) }} />
    </g>
  );
}

/** Text laid flat on the top face of a box at height z. */
function TopText({ text, z, tone, size = 9 }: { text: string; z: number; tone: Tone; size?: number }) {
  const [x, y] = P(0, 0, z);
  return (
    <text
      transform={`matrix(0.868,0.496,-0.868,0.496,${x},${y})`}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={size}
      fontWeight={700}
      style={{ fill: toneVar(tone), fontFamily: "var(--lab-mono)", letterSpacing: 1 }}
      stroke="none"
    >
      {text}
    </text>
  );
}

/** An upright rectangle facing front-left (lying in the x/z plane at y). */
function PlaneX({ x0, x1, y, z0, z1, tone, fill = 14 }: { x0: number; x1: number; y: number; z0: number; z1: number; tone: Tone; fill?: number }) {
  return <polygon points={pts([P(x0, y, z0), P(x1, y, z0), P(x1, y, z1), P(x0, y, z1)])} strokeWidth={1.1} style={{ stroke: toneVar(tone), fill: toneFill(tone, fill) }} />;
}

function Line({ a, b, tone, op = 0.8, w = 1 }: { a: [number, number]; b: [number, number]; tone: Tone; op?: number; w?: number }) {
  return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} strokeWidth={w} strokeOpacity={op} strokeLinecap="round" style={{ stroke: toneVar(tone) }} />;
}

/** The drawing for one object kind, centred on (0,0) = the object's ground anchor. */
export function IsoShape({ kind, tone, strong }: { kind: ObjectKind; tone: Tone; strong: boolean }): ReactNode {
  const s = toneVar(tone);
  switch (kind) {
    case "server":
      return (
        <g>
          <IsoBox w={1} d={1} h={1.6} tone={tone} strong={strong} />
          {[0.4, 0.8, 1.2].map((z) => (
            <Line key={z} a={P(-0.4, 0.5, z)} b={P(0.4, 0.5, z)} tone={tone} op={0.7} />
          ))}
          {[0.3, 0.7, 1.1].map((z) => {
            const [x, y] = P(0.5, 0.25, z + 0.12);
            return <circle key={z} cx={x} cy={y} r={1.6} style={{ fill: s }} />;
          })}
        </g>
      );
    case "gpu":
      return (
        <g>
          <IsoBox w={1.7} d={1.1} h={0.35} tone={tone} strong={strong} />
          <IsoEllipse r={0.28} z={0.35} ox={-0.42} tone={tone} />
          <IsoEllipse r={0.28} z={0.35} ox={0.42} tone={tone} />
          <IsoEllipse r={0.06} z={0.35} ox={-0.42} tone={tone} fill={60} />
          <IsoEllipse r={0.06} z={0.35} ox={0.42} tone={tone} fill={60} />
          {[-0.6, -0.3, 0, 0.3, 0.6].map((x) => (
            <Line key={x} a={P(x, 0.55, 0.05)} b={P(x, 0.55, 0.28)} tone={tone} op={0.5} />
          ))}
        </g>
      );
    case "llm":
      return (
        <g>
          {[-0.45, -0.15, 0.15, 0.45].map((x) => (
            <Line key={`a${x}`} a={P(x, 0.7, 0.05)} b={P(x, 0.92, 0.05)} tone={tone} w={1.6} />
          ))}
          {[-0.45, -0.15, 0.15, 0.45].map((y) => (
            <Line key={`b${y}`} a={P(0.7, y, 0.05)} b={P(0.92, y, 0.05)} tone={tone} w={1.6} />
          ))}
          <IsoBox w={1.4} d={1.4} h={0.3} tone={tone} strong={strong} />
          <IsoBox w={0.85} d={0.85} h={0.1} z={0.3} tone={tone} strong={strong} />
          <TopText text="LLM" z={0.4} tone={tone} size={10} />
        </g>
      );
    case "db":
      return <Cylinder r={0.55} h={0.95} tone={tone} strong={strong} rings={2} />;
    case "vectordb":
      return (
        <g>
          <Cylinder r={0.6} h={1.05} tone={tone} strong={strong} rings={3} />
          {[
            [-0.2, -0.1],
            [0.15, -0.25],
            [0.2, 0.15],
            [-0.1, 0.25],
            [0.0, 0.0],
          ].map(([x, y], i) => {
            const [cx, cy] = P(x, y, 1.05);
            return <circle key={i} cx={cx} cy={cy} r={1.8} style={{ fill: s }} />;
          })}
        </g>
      );
    case "table":
      return (
        <g>
          <IsoBox w={1.7} d={1.3} h={0.14} tone={tone} strong={strong} />
          {[-0.33, 0, 0.33].map((y) => (
            <Line key={`r${y}`} a={P(-0.85, y, 0.14)} b={P(0.85, y, 0.14)} tone={tone} op={0.55} />
          ))}
          {[-0.28, 0.28].map((x) => (
            <Line key={`c${x}`} a={P(x, -0.65, 0.14)} b={P(x, 0.65, 0.14)} tone={tone} op={0.55} />
          ))}
        </g>
      );
    case "doc": {
      return (
        <g>
          <IsoEllipse r={0.45} tone={tone} dashed />
          <polygon
            points={pts([P(-0.45, 0, 0.05), P(0.45, 0, 0.05), P(0.45, 0, 1.15), P(0.2, 0, 1.4), P(-0.45, 0, 1.4)])}
            strokeWidth={1.1}
            style={{ stroke: s, fill: toneFill(tone, strong ? 22 : 14) }}
          />
          {[1.1, 0.9, 0.7, 0.5].map((z) => (
            <Line key={z} a={P(-0.3, 0, z)} b={P(0.3, 0, z)} tone={tone} op={0.6} />
          ))}
        </g>
      );
    }
    case "tokens":
      return (
        <g>
          {[-0.78, -0.26, 0.26, 0.78].map((x) => (
            <IsoBox key={x} w={0.42} d={0.42} h={0.42} ox={x} tone={tone} strong={strong} />
          ))}
        </g>
      );
    case "vector":
      return (
        <g>
          {[0.35, 0.8, 0.55, 1.0, 0.45].map((h, i) => (
            <IsoBox key={i} w={0.26} d={0.5} h={h} ox={-0.6 + i * 0.3} tone={tone} strong={strong} />
          ))}
        </g>
      );
    case "neuron": {
      const [, cy] = P(0, 0, 0.75);
      return (
        <g>
          <IsoEllipse r={0.45} tone={tone} dashed />
          <Line a={P(0, 0, 0)} b={P(0, 0, 0.4)} tone={tone} op={0.6} />
          <circle cx={0} cy={cy} r={15} strokeWidth={strong ? 1.6 : 1.1} style={{ stroke: s, fill: `url(#lab-orb-${tone})` }} />
          <ellipse cx={-4} cy={cy - 5} rx={4} ry={2.5} style={{ fill: "rgba(255,255,255,0.35)" }} />
        </g>
      );
    }
    case "layer":
      return (
        <g>
          {[0, 0.38, 0.76].map((z) => (
            <IsoBox key={z} w={1.4} d={1.4} h={0.16} z={z} tone={tone} strong={strong} />
          ))}
        </g>
      );
    case "matrix":
      return (
        <g>
          <IsoEllipse r={0.5} tone={tone} dashed />
          <PlaneX x0={-0.6} x1={0.6} y={0} z0={0.1} z1={1.3} tone={tone} fill={strong ? 22 : 14} />
          {[0.5, 0.9].map((z) => (
            <Line key={`h${z}`} a={P(-0.6, 0, z)} b={P(0.6, 0, z)} tone={tone} op={0.55} />
          ))}
          {[-0.2, 0.2].map((x) => (
            <Line key={`v${x}`} a={P(x, 0, 0.1)} b={P(x, 0, 1.3)} tone={tone} op={0.55} />
          ))}
        </g>
      );
    case "chart": {
      const curve: [number, number][] = [0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => P(-0.55 + t * 1.1, 0, 0.3 + 0.85 * Math.exp(-3 * t)));
      return (
        <g>
          <IsoEllipse r={0.5} tone={tone} dashed />
          <PlaneX x0={-0.65} x1={0.65} y={0} z0={0.1} z1={1.35} tone={tone} fill={strong ? 20 : 12} />
          <polyline points={pts(curve)} fill="none" strokeWidth={1.6} style={{ stroke: s }} />
        </g>
      );
    }
    case "laptop":
      return (
        <g>
          <PlaneX x0={-0.7} x1={0.7} y={-0.5} z0={0.08} z1={1.05} tone={tone} fill={strong ? 22 : 14} />
          {[0.8, 0.6, 0.4].map((z, i) => (
            <Line key={z} a={P(-0.5, -0.5, z)} b={P(0.5 - i * 0.2, -0.5, z)} tone={tone} op={0.6} />
          ))}
          <IsoBox w={1.4} d={1} h={0.08} tone={tone} strong={strong} />
        </g>
      );
    case "chat":
      return (
        <g>
          <IsoEllipse r={0.4} tone={tone} dashed />
          <path d="M -26,-62 h 52 a 6 6 0 0 1 6 6 v 24 a 6 6 0 0 1 -6 6 h -30 l -10 10 v -10 h -12 a 6 6 0 0 1 -6 -6 v -24 a 6 6 0 0 1 6 -6 z" strokeWidth={strong ? 1.5 : 1.1} style={{ stroke: s, fill: toneFill(tone, strong ? 24 : 14) }} />
          {[-10, 0, 10].map((x) => (
            <circle key={x} cx={x} cy={-44} r={2.2} style={{ fill: s }} />
          ))}
        </g>
      );
    case "user":
      return (
        <g>
          <IsoEllipse r={0.42} tone={tone} fill={8} />
          <path d="M -15,-4 C -15,-24 15,-24 15,-4 Z" strokeWidth={strong ? 1.5 : 1.1} style={{ stroke: s, fill: toneFill(tone, strong ? 26 : 16) }} />
          <circle cx={0} cy={-32} r={8} strokeWidth={strong ? 1.5 : 1.1} style={{ stroke: s, fill: toneFill(tone, strong ? 26 : 16) }} />
        </g>
      );
    case "cloud":
      return (
        <g>
          <IsoEllipse r={0.5} tone={tone} dashed />
          <path
            d="M -24,-30 a 10 10 0 0 1 4,-19 a 14 14 0 0 1 26,-5 a 11 11 0 0 1 19,9 a 8 8 0 0 1 -1,15 z"
            strokeWidth={strong ? 1.5 : 1.1}
            style={{ stroke: s, fill: toneFill(tone, strong ? 24 : 14) }}
          />
        </g>
      );
    case "tool":
      return (
        <g>
          <IsoBox w={1.1} d={1.1} h={0.55} tone={tone} strong={strong} />
          <TopText text="{ }" z={0.55} tone={tone} size={11} />
        </g>
      );
    case "cache":
      return (
        <g>
          {[
            [-0.3, -0.3],
            [0.3, -0.3],
            [-0.3, 0.3],
            [0.3, 0.3],
          ].map(([x, y]) => (
            <IsoBox key={`${x}${y}`} w={0.5} d={0.5} h={0.3} ox={x} oy={y} tone={tone} strong={strong} />
          ))}
          {[
            [-0.3, -0.3],
            [0.3, -0.3],
          ].map(([x, y]) => (
            <IsoBox key={`u${x}${y}`} w={0.5} d={0.5} h={0.3} z={0.3} ox={x} oy={y} tone={tone} strong={strong} />
          ))}
        </g>
      );
    case "gauge": {
      const [cx, cy] = P(0, 0, 0.35);
      const r = 20;
      return (
        <g>
          <IsoBox w={1} d={0.6} h={0.2} tone={tone} strong={strong} />
          <path d={`M ${cx - r},${cy} A ${r} ${r} 0 0 1 ${cx + r},${cy} Z`} strokeWidth={strong ? 1.5 : 1.1} style={{ stroke: s, fill: toneFill(tone, strong ? 24 : 14) }} />
          <line x1={cx} y1={cy} x2={cx + r * 0.6} y2={cy - r * 0.62} strokeWidth={1.8} strokeLinecap="round" style={{ stroke: s }} />
          <circle cx={cx} cy={cy} r={2.2} style={{ fill: s }} />
        </g>
      );
    }
    case "gear":
      return (
        <g>
          <IsoBox w={1.1} d={1.1} h={0.4} tone={tone} strong={strong} />
          <IsoEllipse r={0.32} z={0.4} tone={tone} />
          <IsoEllipse r={0.12} z={0.4} tone={tone} fill={50} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i * Math.PI) / 3;
            return <Line key={i} a={P(Math.cos(a) * 0.32, Math.sin(a) * 0.32, 0.4)} b={P(Math.cos(a) * 0.45, Math.sin(a) * 0.45, 0.4)} tone={tone} w={2} />;
          })}
        </g>
      );
    case "ranker":
      return (
        <g>
          <IsoBox w={1.6} d={0.9} h={0.12} tone={tone} strong={strong} />
          {[1.0, 0.7, 0.4].map((h, i) => (
            <IsoBox key={i} w={0.4} d={0.5} h={h} z={0.12} ox={-0.5 + i * 0.5} tone={tone} strong={strong} />
          ))}
        </g>
      );
    case "dice":
      return (
        <g>
          <IsoBox w={0.85} d={0.85} h={0.85} tone={tone} strong={strong} />
          {[
            [-0.2, -0.2],
            [0, 0],
            [0.2, 0.2],
          ].map(([x, y], i) => {
            const [cx, cy] = P(x, y, 0.85);
            return <circle key={i} cx={cx} cy={cy} r={2} style={{ fill: s }} />;
          })}
        </g>
      );
    case "search":
      return (
        <g>
          <IsoEllipse r={0.4} tone={tone} dashed />
          <circle cx={-3} cy={-40} r={13} strokeWidth={strong ? 2 : 1.5} style={{ stroke: s, fill: toneFill(tone, strong ? 22 : 12) }} />
          <line x1={6} y1={-31} x2={16} y2={-20} strokeWidth={3} strokeLinecap="round" style={{ stroke: s }} />
        </g>
      );
    case "box":
    default:
      return <IsoBox w={1.1} d={1.1} h={0.7} tone={tone} strong={strong} />;
  }
}
