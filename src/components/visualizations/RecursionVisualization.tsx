'use client';

import { useState } from 'react';
import { Btn, Message, TreeView, boxClass, useFramePlayer, type TNode } from './shared';

type Built = { root: TNode; order: string[]; calls: number; hits: number };

function build(n: number, memo: boolean): Built {
  let id = 0;
  let calls = 0;
  let hits = 0;
  const order: string[] = [];
  const cache = new Set<number>();
  const make = (k: number): TNode => {
    const key = `c${id++}`;
    calls += 1;
    order.push(key);
    if (memo && cache.has(k)) {
      hits += 1;
      return { key, label: `f${k}`, children: [], mark: true };
    }
    if (k <= 1) {
      cache.add(k);
      return { key, label: `f${k}`, children: [] };
    }
    const left = make(k - 1);
    const right = make(k - 2);
    cache.add(k);
    return { key, label: `f${k}`, children: [left, right] };
  };
  return { root: make(n), order, calls, hits };
}

export function RecursionVisualization() {
  const [n, setN] = useState(5);
  const [memo, setMemo] = useState(false);
  const built = build(n, memo);
  const { state, setState, run, busy } = useFramePlayer<{ visited: string[]; msg: string }>({
    visited: [],
    msg: 'Every circle is one function call. Without memo, the same sub-problems repeat again and again.',
  });

  const play = () => {
    if (busy) return;
    run(
      built.order.map((k, i) => ({ visited: built.order.slice(0, i + 1), msg: `Calls made so far: ${i + 1}` })),
      350
    );
  };

  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-slate-400">fib(n), n =</p>
        {[3, 4, 5, 6].map((v) => (
          <Btn key={v} tone="slate" active={n === v} onClick={() => !busy && (setN(v), setState({ visited: [], msg: '' }))}>{v}</Btn>
        ))}
        <Btn tone={memo ? 'green' : 'slate'} active={memo} onClick={() => !busy && (setMemo(!memo), setState({ visited: [], msg: '' }))}>
          Memoization: {memo ? 'ON' : 'OFF'}
        </Btn>
        <Btn onClick={play} disabled={busy}>Run calls</Btn>
      </div>
      <TreeView root={built.root} visited={state.visited} hi={state.visited.slice(-1)} />
      <p className="mt-2 text-xs text-slate-400">
        Total calls: <span className="text-yellow-300">{built.calls}</span>
        {memo ? <> · answers reused from cache: <span className="text-green-300">{built.hits}</span> (green ring)</> : null}
      </p>
      <Message>{state.msg || (memo ? 'With memo, a repeated call returns instantly from the cache instead of growing a new branch.' : 'No memo: switch it ON to see the repeated branches disappear.')}</Message>
    </div>
  );
}
