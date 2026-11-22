'use client';

import { useState } from 'react';
import { Btn, Message, boxClass, useFramePlayer } from './shared';

type Algo = 'bfs' | 'dfs' | 'dijkstra' | 'topo';
const POS: Record<string, [number, number]> = { A: [40, 90], B: [120, 30], C: [120, 150], D: [210, 90], E: [290, 150], F: [300, 40] };
const UND: [string, string, number][] = [['A', 'B', 4], ['A', 'C', 2], ['B', 'C', 1], ['B', 'D', 5], ['C', 'D', 8], ['C', 'E', 10], ['D', 'E', 2], ['D', 'F', 6], ['E', 'F', 3]];
const DAG: [string, string, number][] = [['A', 'B', 0], ['A', 'C', 0], ['B', 'D', 0], ['C', 'D', 0], ['C', 'E', 0], ['D', 'F', 0], ['E', 'F', 0]];
const NODES = Object.keys(POS);

type Frame = { done: string[]; cur?: string; frontier: string[]; info: string; msg: string; order?: string[] };

const adj = (edges: [string, string, number][], directed: boolean) => {
  const m: Record<string, [string, number][]> = Object.fromEntries(NODES.map((n) => [n, []]));
  for (const [a, b, w] of edges) {
    m[a].push([b, w]);
    if (!directed) m[b].push([a, w]);
  }
  for (const k of NODES) m[k].sort((x, y) => x[0].localeCompare(y[0]));
  return m;
};

function bfs(): Frame[] {
  const g = adj(UND, false);
  const seen = new Set(['A']);
  const q = ['A'];
  const done: string[] = [];
  const f: Frame[] = [{ done: [], frontier: ['A'], info: 'queue: A', msg: 'BFS: use a queue. Visit nearest nodes first, level by level.' }];
  while (q.length) {
    const n = q.shift()!;
    done.push(n);
    for (const [nb] of g[n]) if (!seen.has(nb)) { seen.add(nb); q.push(nb); }
    f.push({ done: [...done], cur: n, frontier: [...q], info: `queue: ${q.join(', ') || 'empty'}`, msg: `Visit ${n}. Add its unseen neighbours to the back of the queue.` });
  }
  f.push({ done: [...done], frontier: [], info: `order: ${done.join(' → ')}`, msg: `BFS order: ${done.join(' → ')}. Finds shortest path in an unweighted graph.` });
  return f;
}

function dfs(): Frame[] {
  const g = adj(UND, false);
  const seen = new Set<string>();
  const stack: string[] = [];
  const done: string[] = [];
  const f: Frame[] = [{ done: [], frontier: [], info: 'stack: empty', msg: 'DFS: go as deep as possible, then backtrack.' }];
  const go = (n: string) => {
    seen.add(n);
    stack.push(n);
    done.push(n);
    f.push({ done: [...done], cur: n, frontier: [...stack], info: `path: ${stack.join(' → ')}`, msg: `Visit ${n} and dive into its first unseen neighbour.` });
    for (const [nb] of g[n]) if (!seen.has(nb)) go(nb);
    stack.pop();
    if (stack.length) f.push({ done: [...done], cur: stack[stack.length - 1], frontier: [...stack], info: `path: ${stack.join(' → ')}`, msg: `Dead end at ${n}. Backtrack to ${stack[stack.length - 1]}.` });
  };
  go('A');
  f.push({ done: [...done], frontier: [], info: `order: ${done.join(' → ')}`, msg: `DFS order: ${done.join(' → ')}.` });
  return f;
}

function dijkstra(): Frame[] {
  const g = adj(UND, false);
  const dist: Record<string, number> = Object.fromEntries(NODES.map((n) => [n, Infinity]));
  dist.A = 0;
  const done: string[] = [];
  const fmt = () => NODES.map((n) => `${n}:${dist[n] === Infinity ? '∞' : dist[n]}`).join('  ');
  const f: Frame[] = [{ done: [], frontier: ['A'], info: fmt(), msg: 'Dijkstra: always settle the unsettled node with the smallest distance, then relax its edges.' }];
  while (done.length < NODES.length) {
    const n = NODES.filter((x) => !done.includes(x)).sort((a, b) => dist[a] - dist[b])[0];
    if (dist[n] === Infinity) break;
    done.push(n);
    for (const [nb, w] of g[n]) if (!done.includes(nb) && dist[n] + w < dist[nb]) dist[nb] = dist[n] + w;
    f.push({ done: [...done], cur: n, frontier: NODES.filter((x) => !done.includes(x) && dist[x] < Infinity), info: fmt(), msg: `Settle ${n} (distance ${dist[n]}). Update neighbours if a shorter route is found.` });
  }
  f.push({ done: [...done], frontier: [], info: fmt(), msg: 'Shortest distance from A to every node. Needs non-negative weights.' });
  return f;
}

function topo(): Frame[] {
  const g = adj(DAG, true);
  const indeg: Record<string, number> = Object.fromEntries(NODES.map((n) => [n, 0]));
  for (const [, b] of DAG) indeg[b]++;
  const q = NODES.filter((n) => indeg[n] === 0);
  const order: string[] = [];
  const fmt = () => NODES.map((n) => `${n}:${indeg[n]}`).join('  ');
  const f: Frame[] = [{ done: [], frontier: [...q], info: `in-degree ${fmt()}`, msg: 'Topological sort (Kahn): start with nodes that have no incoming edges (in-degree 0).', order }];
  while (q.length) {
    const n = q.shift()!;
    order.push(n);
    for (const [nb] of g[n]) { indeg[nb]--; if (indeg[nb] === 0) q.push(nb); }
    f.push({ done: [...order], cur: n, frontier: [...q], info: `in-degree ${fmt()}`, msg: `Take ${n}, remove its edges. Neighbours that reach in-degree 0 join the queue.`, order: [...order] });
  }
  f.push({ done: [...order], frontier: [], info: `order: ${order.join(' → ')}`, msg: `Valid order: ${order.join(' → ')}. If some nodes were left over, the graph has a cycle.`, order });
  return f;
}

export function GraphAlgoVisualization() {
  const [algo, setAlgo] = useState<Algo>('bfs');
  const { state, setState, run, stop, busy } = useFramePlayer<Frame | null>(null);
  const edges = algo === 'topo' ? DAG : UND;

  const start = () => {
    if (busy) return;
    run(algo === 'bfs' ? bfs() : algo === 'dfs' ? dfs() : algo === 'dijkstra' ? dijkstra() : topo(), 900);
  };

  const fill = (n: string) => (state?.cur === n ? '#facc15' : state?.done.includes(n) ? '#22d3ee' : state?.frontier.includes(n) ? '#4ade80' : '#1e293b');

  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap gap-2">
        {([['bfs', 'BFS'], ['dfs', 'DFS'], ['dijkstra', 'Dijkstra'], ['topo', 'Topological sort']] as [Algo, string][]).map(([k, l]) => (
          <Btn key={k} tone="slate" active={algo === k} onClick={() => { stop(); setAlgo(k); setState(null); }}>{l}</Btn>
        ))}
        <Btn onClick={start} disabled={busy}>Run from A</Btn>
        <Btn tone="red" onClick={stop} disabled={!busy}>Pause</Btn>
      </div>
      <div className="overflow-x-auto rounded-md border border-slate-700/50 bg-slate-800/50">
        <svg viewBox="0 0 340 190" className="mx-auto block h-auto w-full max-w-md">
          <defs><marker id="arr" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" /></marker></defs>
          {edges.map(([a, b, w]) => (
            <g key={a + b}>
              <line x1={POS[a][0]} y1={POS[a][1]} x2={POS[b][0]} y2={POS[b][1]} stroke="#475569" strokeWidth={2} markerEnd={algo === 'topo' ? 'url(#arr)' : undefined} />
              {algo !== 'topo' && algo === 'dijkstra' ? (
                <text x={(POS[a][0] + POS[b][0]) / 2} y={(POS[a][1] + POS[b][1]) / 2 - 4} fontSize={10} fill="#fbbf24" textAnchor="middle">{w}</text>
              ) : null}
            </g>
          ))}
          {NODES.map((n) => (
            <g key={n}>
              <circle cx={POS[n][0]} cy={POS[n][1]} r={16} fill={fill(n)} stroke="#64748b" strokeWidth={1.5} />
              <text x={POS[n][0]} y={POS[n][1] + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill={state?.cur === n || state?.done.includes(n) || state?.frontier.includes(n) ? '#0f172a' : '#e2e8f0'}>{n}</text>
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-2 text-xs text-slate-400">Yellow = current · cyan = finished · green = waiting (queue / stack)</p>
      {state?.info ? <p className="mt-1 font-code text-xs text-slate-300">{state.info}</p> : null}
      <Message>{state?.msg ?? 'Choose an algorithm and press Run. Dijkstra shows edge weights.'}</Message>
    </div>
  );
}
