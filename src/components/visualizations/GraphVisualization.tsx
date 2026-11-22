'use client';

import { useState } from 'react';
import { Btn, Message, boxClass, useFramePlayer } from './shared';

const NODES: Record<string, { x: number; y: number }> = {
  A: { x: 160, y: 30 },
  B: { x: 70, y: 100 },
  C: { x: 250, y: 100 },
  D: { x: 30, y: 180 },
  E: { x: 120, y: 180 },
  F: { x: 250, y: 180 },
  G: { x: 190, y: 230 },
};
const EDGES: [string, string][] = [
  ['A', 'B'], ['A', 'C'], ['B', 'D'], ['B', 'E'], ['C', 'F'], ['E', 'G'], ['F', 'G'],
];

const neighbours = (n: string) =>
  EDGES.filter(([a, b]) => a === n || b === n).map(([a, b]) => (a === n ? b : a)).sort();

type Frame = { visited: string[]; current: string | null; frontier: string[]; msg: string };
const idle: Frame = {
  visited: [],
  current: null,
  frontier: [],
  msg: 'Pick a start node, then run BFS (queue, level by level) or DFS (stack, go deep first).',
};

export function GraphVisualization() {
  const [start, setStart] = useState('A');
  const { state, run, setState, busy } = useFramePlayer<Frame>(idle);

  const traverse = (kind: 'BFS' | 'DFS') => {
    if (busy) return;
    const frames: Frame[] = [];
    const visited: string[] = [];
    const seen = new Set<string>([start]);
    const frontier = [start];
    frames.push({ visited: [], current: null, frontier: [...frontier], msg: `${kind}: put ${start} in the ${kind === 'BFS' ? 'queue' : 'stack'}.` });
    while (frontier.length) {
      const node = kind === 'BFS' ? frontier.shift()! : frontier.pop()!;
      visited.push(node);
      const fresh = neighbours(node).filter((n) => !seen.has(n));
      fresh.forEach((n) => seen.add(n));
      if (kind === 'BFS') frontier.push(...fresh);
      else frontier.push(...fresh.reverse());
      frames.push({
        visited: [...visited],
        current: node,
        frontier: [...frontier],
        msg: `Visit ${node}. ${fresh.length ? `New neighbours added: ${[...fresh].sort().join(', ')}.` : 'No new neighbours.'}`,
      });
    }
    frames.push({ visited: [...visited], current: null, frontier: [], msg: `${kind} order: ${visited.join(' → ')}` });
    run(frames, 800);
  };

  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-slate-400">Start:</p>
        {Object.keys(NODES).map((n) => (
          <Btn key={n} tone="slate" active={start === n} onClick={() => !busy && (setStart(n), setState(idle))}>
            {n}
          </Btn>
        ))}
      </div>
      <div className="mb-3 flex gap-2">
        <Btn onClick={() => traverse('BFS')} disabled={busy}>Run BFS</Btn>
        <Btn tone="yellow" onClick={() => traverse('DFS')} disabled={busy}>Run DFS</Btn>
        <Btn tone="slate" onClick={() => setState(idle)} disabled={busy}>Reset</Btn>
      </div>
      <div className="overflow-x-auto rounded-md border border-slate-700/50 bg-slate-800/50">
        <svg viewBox="0 0 280 260" width="280" height="260" className="mx-auto block">
          {EDGES.map(([a, b]) => (
            <line key={a + b} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} stroke="#475569" strokeWidth={2} />
          ))}
          {Object.entries(NODES).map(([n, p]) => {
            const isCur = state.current === n;
            const isVisited = state.visited.includes(n);
            const inFrontier = state.frontier.includes(n);
            return (
              <g key={n}>
                <circle cx={p.x} cy={p.y} r={16} fill={isCur ? '#facc15' : isVisited ? '#22d3ee' : '#1e293b'} stroke={inFrontier ? '#4ade80' : '#64748b'} strokeWidth={inFrontier ? 3 : 1.5} />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill={isCur || isVisited ? '#0f172a' : '#e2e8f0'}>{n}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        <span className="text-green-300">Green ring</span> = waiting in the {`queue / stack`}: [{state.frontier.join(', ')}] ·{' '}
        <span className="text-yellow-300">yellow</span> = visiting now · <span className="text-cyan-300">cyan</span> = done
      </p>
      <Message>{state.msg}</Message>
    </div>
  );
}
