'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Btn, Cells, Message, boxClass, useFramePlayer } from './shared';

const DATA = [1, 3, 4, 6, 8, 10, 13, 17];
type Frame = { l: number | null; r: number | null; done: boolean; msg: string };

export function TwoPointersVisualization() {
  const [target, setTarget] = useState('14');
  const { state, setState, run, busy } = useFramePlayer<Frame>({
    l: null, r: null, done: false,
    msg: 'Sorted array + a target sum. One pointer starts at each end and they walk toward each other.',
  });
  const t = Number(target);

  const start = () => {
    if (busy || target.trim() === '' || !Number.isFinite(t)) return;
    const frames: Frame[] = [];
    let l = 0;
    let r = DATA.length - 1;
    while (l < r) {
      const sum = DATA[l] + DATA[r];
      if (sum === t) {
        frames.push({ l, r, done: true, msg: `${DATA[l]} + ${DATA[r]} = ${sum}. Pair found!` });
        return run(frames, 900);
      }
      frames.push({ l, r, done: false, msg: `${DATA[l]} + ${DATA[r]} = ${sum}, ${sum < t ? `too small → move the left pointer right` : `too big → move the right pointer left`}.` });
      if (sum < t) l += 1; else r -= 1;
    }
    frames.push({ l: null, r: null, done: false, msg: `Pointers met. No pair adds up to ${t}. We checked in one pass, O(n).` });
    run(frames, 900);
  };

  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-slate-400">Target sum:</p>
        <Input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="numeric" className="w-20 border-slate-600 bg-slate-800" />
        <Btn onClick={start} disabled={busy}>Run</Btn>
        <Btn tone="slate" onClick={() => setState({ l: null, r: null, done: false, msg: 'Reset.' })} disabled={busy}>Reset</Btn>
      </div>
      <Cells items={DATA.map((v, i) => ({ label: v, state: state.done && (i === state.l || i === state.r) ? 'found' : i === state.l || i === state.r ? 'active' : 'default' }))} />
      <p className="mt-2 text-xs text-slate-400">left = {state.l ?? '-'} · right = {state.r ?? '-'}</p>
      <Message>{state.msg}</Message>
    </div>
  );
}
