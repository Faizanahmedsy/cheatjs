'use client';

import { useState } from 'react';
import { Btn, Cells, Message, boxClass, useFramePlayer } from './shared';

const DATA = [2, 1, 5, 1, 3, 2, 9, 7];
type Frame = { start: number; sum: number; best: number; bestStart: number; msg: string };

export function SlidingWindowVisualization() {
  const [k, setK] = useState(3);
  const { state, setState, run, busy } = useFramePlayer<Frame>({
    start: -1, sum: 0, best: 0, bestStart: -1,
    msg: 'Find the window of k numbers with the biggest sum. Slide it: add the new value, remove the old one.',
  });

  const play = () => {
    if (busy) return;
    const frames: Frame[] = [];
    let sum = DATA.slice(0, k).reduce((a, b) => a + b, 0);
    let best = sum;
    let bestStart = 0;
    frames.push({ start: 0, sum, best, bestStart, msg: `First window sum = ${sum}.` });
    for (let i = k; i < DATA.length; i += 1) {
      sum += DATA[i] - DATA[i - k];
      if (sum > best) { best = sum; bestStart = i - k + 1; }
      frames.push({ start: i - k + 1, sum, best, bestStart, msg: `Add ${DATA[i]}, remove ${DATA[i - k]} → sum = ${sum}. Best so far: ${best}.` });
    }
    frames.push({ start: bestStart, sum: best, best, bestStart, msg: `Best window starts at index ${bestStart} with sum ${best}. Only one pass, O(n).` });
    run(frames, 900);
  };

  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-slate-400">Window size k:</p>
        {[2, 3, 4].map((v) => (
          <Btn key={v} tone="slate" active={k === v} onClick={() => !busy && (setK(v), setState({ start: -1, sum: 0, best: 0, bestStart: -1, msg: '' }))}>{v}</Btn>
        ))}
        <Btn onClick={play} disabled={busy}>Slide</Btn>
      </div>
      <Cells items={DATA.map((v, i) => ({ label: v, state: i >= state.start && i < state.start + k && state.start >= 0 ? 'range' : 'default' }))} />
      <p className="mt-2 text-xs text-slate-400">
        Window sum: <span className="text-cyan-300">{state.sum}</span> · Best: <span className="text-green-300">{state.best}</span>
      </p>
      <Message>{state.msg || 'Pick k and press Slide.'}</Message>
    </div>
  );
}
