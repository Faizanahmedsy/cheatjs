'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Btn, Cells, Message, boxClass, useFramePlayer } from './shared';

const DATA = [2, 5, 8, 12, 16, 23, 38, 42, 56, 61, 72, 80, 91, 95, 99];
type Frame = { lo: number; hi: number; mid: number | null; found: number | null; msg: string; steps: number };

export function BinarySearchVisualization() {
  const [target, setTarget] = useState('23');
  const { state, setState, run, busy } = useFramePlayer<Frame>({
    lo: 0, hi: DATA.length - 1, mid: null, found: null, steps: 0,
    msg: 'The array is sorted. Each step throws away half of the remaining values.',
  });
  const t = Number(target);

  const search = () => {
    if (busy || target.trim() === '' || !Number.isFinite(t)) return;
    const frames: Frame[] = [];
    let lo = 0;
    let hi = DATA.length - 1;
    let steps = 0;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      steps += 1;
      if (DATA[mid] === t) {
        frames.push({ lo, hi, mid, found: mid, steps, msg: `mid = ${mid}, value ${DATA[mid]} equals ${t}. Found in ${steps} step${steps > 1 ? 's' : ''}!` });
        return run(frames, 900);
      }
      const goRight = DATA[mid] < t;
      frames.push({ lo, hi, mid, found: null, steps, msg: `mid = ${mid}, value ${DATA[mid]} is ${goRight ? 'smaller' : 'bigger'} than ${t}. Throw away the ${goRight ? 'left' : 'right'} half.` });
      if (goRight) lo = mid + 1; else hi = mid - 1;
    }
    frames.push({ lo: 1, hi: 0, mid: null, found: null, steps, msg: `${t} is not in the array. Checked ${steps} values instead of ${DATA.length}.` });
    run(frames, 900);
  };

  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-slate-400">Target:</p>
        <Input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="numeric" className="w-20 border-slate-600 bg-slate-800" />
        <Btn onClick={search} disabled={busy}>Search</Btn>
        <Btn tone="yellow" onClick={() => setTarget(String(DATA[Math.floor(Math.random() * DATA.length)]))} disabled={busy}>Random target</Btn>
        <Btn tone="slate" onClick={() => setState({ lo: 0, hi: DATA.length - 1, mid: null, found: null, steps: 0, msg: 'Reset.' })} disabled={busy}>Reset</Btn>
      </div>
      <Cells
        items={DATA.map((v, i) => ({
          label: v,
          state: state.found === i ? 'found' : state.mid === i ? 'active' : i >= state.lo && i <= state.hi ? 'range' : 'dim',
        }))}
      />
      <p className="mt-2 text-xs text-slate-400">
        lo = {state.lo} · hi = {state.hi} · steps: <span className="text-yellow-300">{state.steps}</span> (linear search worst case: {DATA.length})
      </p>
      <Message>{state.msg}</Message>
    </div>
  );
}
