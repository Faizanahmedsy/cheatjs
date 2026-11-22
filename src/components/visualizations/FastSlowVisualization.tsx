'use client';

import { useState } from 'react';
import { Btn, Message, boxClass, useFramePlayer } from './shared';

const SIZE = 8;
type Frame = { slow: number | null; fast: number | null; msg: string };

export function FastSlowVisualization() {
  const [cycle, setCycle] = useState(true);
  const { state, setState, run, busy } = useFramePlayer<Frame>({
    slow: null, fast: null,
    msg: 'Slow moves 1 step, fast moves 2 steps. If there is a loop, fast catches slow from behind.',
  });
  const next = (i: number) => (i < SIZE - 1 ? i + 1 : cycle ? 3 : null);

  const play = () => {
    if (busy) return;
    const frames: Frame[] = [{ slow: 0, fast: 0, msg: 'Both pointers start at the head.' }];
    let slow: number | null = 0;
    let fast: number | null = 0;
    for (let guard = 0; guard < 30; guard += 1) {
      slow = next(slow as number);
      const f1: number | null = next(fast as number);
      fast = f1 === null ? null : next(f1);
      if (fast === null || slow === null) {
        frames.push({ slow, fast: null, msg: 'Fast reached the end (null). No cycle.' });
        break;
      }
      if (slow === fast) {
        frames.push({ slow, fast, msg: `Slow and fast meet at node ${slow}. A cycle exists!` });
        break;
      }
      frames.push({ slow, fast, msg: `Slow → ${slow}, fast → ${fast}.` });
    }
    run(frames, 850);
  };

  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Btn tone={cycle ? 'green' : 'slate'} active={cycle} onClick={() => !busy && (setCycle(!cycle), setState({ slow: null, fast: null, msg: '' }))}>
          Cycle: {cycle ? 'ON (7 → 3)' : 'OFF'}
        </Btn>
        <Btn onClick={play} disabled={busy}>Run</Btn>
      </div>
      <div className="overflow-x-auto rounded-md border border-slate-700/50 bg-slate-800/50 p-3">
        <div className="flex min-w-max items-center">
          {Array.from({ length: SIZE }, (_, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <span className="h-4 text-[10px] font-bold text-yellow-300">{state.slow === i ? 'S' : ''}{state.fast === i ? 'F' : ''}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${state.slow === i && state.fast === i ? 'border-green-400 bg-green-400/20 text-green-200' : state.slow === i || state.fast === i ? 'border-yellow-400 bg-yellow-400/20 text-yellow-200' : 'border-slate-600 bg-slate-800 text-slate-100'}`}>
                  {i}
                </div>
              </div>
              {i < SIZE - 1 ? <span className="mx-1 text-slate-500">→</span> : null}
            </div>
          ))}
          <span className="ml-2 text-xs text-slate-400">{cycle ? '→ back to 3 (loop)' : '→ null'}</span>
        </div>
      </div>
      <Message>{state.msg || 'Toggle the cycle and press Run.'}</Message>
    </div>
  );
}
