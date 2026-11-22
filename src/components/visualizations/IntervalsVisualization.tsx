'use client';

import { Btn, Message, boxClass, useFramePlayer } from './shared';

type Iv = [number, number];
const INPUT: Iv[] = [[8, 10], [1, 3], [15, 18], [2, 6]];
type Frame = { merged: Iv[]; cur: number; sorted: Iv[]; msg: string };
const MAX = 20;

function frames(): Frame[] {
  const sorted = [...INPUT].sort((a, b) => a[0] - b[0]);
  const f: Frame[] = [{ merged: [], cur: -1, sorted: INPUT, msg: 'Unsorted intervals. Step 1: sort them by start time.' }, { merged: [], cur: -1, sorted, msg: 'Sorted by start. Now walk through once and merge anything that overlaps the last merged interval.' }];
  const merged: Iv[] = [];
  sorted.forEach((iv, i) => {
    const last = merged[merged.length - 1];
    if (last && iv[0] <= last[1]) {
      last[1] = Math.max(last[1], iv[1]);
      f.push({ merged: merged.map((m) => [...m] as Iv), cur: i, sorted, msg: `[${iv}] starts before ${last[1]} ends: overlap. Extend the last interval to [${last}].` });
    } else {
      merged.push([...iv]);
      f.push({ merged: merged.map((m) => [...m] as Iv), cur: i, sorted, msg: `[${iv}] does not overlap. Start a new merged interval.` });
    }
  });
  f.push({ merged, cur: -1, sorted, msg: `Result: ${merged.map((m) => `[${m}]`).join(', ')}. Sorting costs O(n log n), the merge pass is O(n).` });
  return f;
}

function Row({ items, active, color }: { items: Iv[]; active?: number; color: string }) {
  return (
    <div className="relative h-8 rounded bg-slate-800/70">
      {items.map(([s, e], i) => (
        <div key={i} className={`absolute top-1 flex h-6 items-center justify-center rounded text-[10px] font-bold text-slate-900 ${active === i ? 'bg-yellow-400' : color}`} style={{ left: `${(s / MAX) * 100}%`, width: `${((e - s) / MAX) * 100}%` }}>{s}-{e}</div>
      ))}
    </div>
  );
}

export function IntervalsVisualization() {
  const init: Frame = { merged: [], cur: -1, sorted: INPUT, msg: 'Merge overlapping intervals: [8,10] [1,3] [15,18] [2,6]. Press Run.' };
  const { state, setState, run, stop, busy } = useFramePlayer<Frame>(init);
  return (
    <div className={boxClass}>
      <div className="mb-3 flex gap-2">
        <Btn onClick={() => run(frames(), 1000)} disabled={busy}>Run</Btn>
        <Btn tone="red" onClick={stop} disabled={!busy}>Pause</Btn>
        <Btn tone="slate" onClick={() => { stop(); setState(init); }}>Reset</Btn>
      </div>
      <p className="mb-1 text-xs text-slate-400">Intervals</p>
      <div className="space-y-1">{state.sorted.map((iv, i) => <Row key={i} items={[iv]} active={state.cur === i ? 0 : undefined} color="bg-cyan-400" />)}</div>
      <p className="mb-1 mt-3 text-xs text-slate-400">Merged</p>
      <Row items={state.merged} color="bg-green-400" />
      <Message>{state.msg}</Message>
    </div>
  );
}
