'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export const boxClass =
  'bg-slate-900/50 p-4 rounded-lg border border-slate-700 font-code text-sm';

const tones = {
  cyan: 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30',
  red: 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30',
  green: 'bg-green-500/20 text-green-300 hover:bg-green-500/30',
  slate: 'bg-slate-700/60 text-slate-200 hover:bg-slate-700',
} as const;

export function Btn({
  tone = 'cyan',
  active = false,
  className = '',
  ...props
}: React.ComponentProps<typeof Button> & { tone?: keyof typeof tones; active?: boolean }) {
  return (
    <Button
      size="sm"
      {...props}
      className={`${tones[tone]} ${active ? 'ring-1 ring-cyan-400' : ''} ${className}`}
    />
  );
}

/** Plays a list of snapshots one after another so every step can be seen. */
export function useFramePlayer<T>(initial: T) {
  const [state, setState] = useState<T>(initial);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setBusy(false);
  }, []);

  const run = useCallback(
    (frames: T[], ms = 600) => {
      stop();
      if (frames.length === 0) return;
      setBusy(true);
      let i = 0;
      const tick = () => {
        setState(frames[i]);
        i += 1;
        if (i < frames.length) {
          timer.current = setTimeout(tick, ms);
        } else {
          timer.current = null;
          setBusy(false);
        }
      };
      tick();
    },
    [stop]
  );

  useEffect(() => stop, [stop]);
  return { state, setState, run, stop, busy };
}

export function Message({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 min-h-[2.5rem] rounded-md bg-slate-800/60 px-3 py-2 text-xs text-slate-300">
      {children}
    </p>
  );
}

export type TNode = { key: string; label: string; children: (TNode | null)[]; mark?: boolean };

const GAP_X = 44;
const GAP_Y = 54;

/** Draws a tree. mode "inorder" keeps binary-tree left/right order; "leaf" centres parents over children. */
export function TreeView({
  root,
  hi = [],
  visited = [],
  mode = 'leaf',
}: {
  root: TNode | null;
  hi?: string[];
  visited?: string[];
  mode?: 'inorder' | 'leaf';
}) {
  if (!root) return <p className="py-6 text-center text-slate-500">Tree is empty</p>;

  const pos = new Map<string, { x: number; y: number }>();
  const nodes: TNode[] = [];
  const edges: [string, string][] = [];
  let slot = 0;
  let maxDepth = 0;

  const place = (n: TNode, depth: number): number => {
    maxDepth = Math.max(maxDepth, depth);
    nodes.push(n);
    if (mode === 'inorder') {
      const [left, right] = n.children;
      if (left) {
        place(left, depth + 1);
        edges.push([n.key, left.key]);
      }
      const x = slot++;
      pos.set(n.key, { x, y: depth });
      if (right) {
        place(right, depth + 1);
        edges.push([n.key, right.key]);
      }
      return x;
    }
    const real = n.children.filter(Boolean) as TNode[];
    if (real.length === 0) {
      const x = slot++;
      pos.set(n.key, { x, y: depth });
      return x;
    }
    const xs = real.map((child) => {
      const x = place(child, depth + 1);
      edges.push([n.key, child.key]);
      return x;
    });
    const x = (xs[0] + xs[xs.length - 1]) / 2;
    pos.set(n.key, { x, y: depth });
    return x;
  };
  place(root, 0);

  const width = Math.max(slot, 1) * GAP_X + 16;
  const height = maxDepth * GAP_Y + 56;
  const px = (k: string) => pos.get(k)!.x * GAP_X + 28;
  const py = (k: string) => pos.get(k)!.y * GAP_Y + 28;

  return (
    <div className="overflow-x-auto rounded-md border border-slate-700/50 bg-slate-800/50">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto block">
        {edges.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={px(a)} y1={py(a)} x2={px(b)} y2={py(b)} stroke="#475569" strokeWidth={2} />
        ))}
        {nodes.map((n) => {
          const active = hi.includes(n.key);
          const seen = visited.includes(n.key);
          const fill = active ? '#facc15' : seen ? '#22d3ee' : '#1e293b';
          const text = active || seen ? '#0f172a' : '#e2e8f0';
          return (
            <g key={n.key}>
              <circle
                cx={px(n.key)}
                cy={py(n.key)}
                r={n.mark ? 17 : 15}
                fill={fill}
                stroke={n.mark ? '#4ade80' : '#64748b'}
                strokeWidth={n.mark ? 3 : 1.5}
              />
              <text x={px(n.key)} y={py(n.key) + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={text}>
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function Cells({
  items,
  tone,
  showIndex = true,
}: {
  items: { label: string | number; state?: 'default' | 'active' | 'found' | 'dim' | 'range' }[];
  tone?: string;
  showIndex?: boolean;
}) {
  const styles = {
    default: 'border-slate-600 bg-slate-800 text-slate-100',
    active: 'border-yellow-400 bg-yellow-400/20 text-yellow-200',
    found: 'border-green-400 bg-green-400/20 text-green-200',
    dim: 'border-slate-700 bg-slate-900 text-slate-600',
    range: 'border-cyan-400 bg-cyan-400/10 text-cyan-200',
  };
  return (
    <div className={`flex flex-wrap gap-1 ${tone ?? ''}`}>
      {items.map((it, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded border text-sm font-bold ${styles[it.state ?? 'default']}`}
          >
            {it.label}
          </div>
          {showIndex ? <span className="mt-1 text-[10px] text-slate-500">{i}</span> : null}
        </div>
      ))}
    </div>
  );
}
