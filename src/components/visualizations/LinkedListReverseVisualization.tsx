'use client';

import { Btn, Message, boxClass, useFramePlayer } from './shared';

const VALS = [1, 2, 3, 4, 5];
type Frame = { next: (number | null)[]; prev: number | null; cur: number | null; msg: string };

function frames(): Frame[] {
  const next: (number | null)[] = VALS.map((_, i) => (i + 1 < VALS.length ? i + 1 : null));
  let prev: number | null = null;
  let cur: number | null = 0;
  const f: Frame[] = [{ next: [...next], prev, cur, msg: 'Three pointers: prev, cur and a saved next. We flip one arrow at a time.' }];
  while (cur !== null) {
    const nxt: number | null = next[cur];
    f.push({ next: [...next], prev, cur, msg: `Save cur.next (${nxt === null ? 'null' : VALS[nxt]}) so we do not lose the rest of the list.` });
    next[cur] = prev;
    f.push({ next: [...next], prev, cur, msg: `Flip the arrow: ${VALS[cur]} now points to ${prev === null ? 'null' : VALS[prev]}.` });
    prev = cur;
    cur = nxt;
    f.push({ next: [...next], prev, cur, msg: 'Move prev and cur one step forward.' });
  }
  f.push({ next: [...next], prev, cur, msg: 'cur is null. prev is the new head: the list is reversed. O(n) time, O(1) memory.' });
  return f;
}

export function LinkedListReverseVisualization() {
  const init: Frame = { next: VALS.map((_, i) => (i + 1 < VALS.length ? i + 1 : null)), prev: null, cur: 0, msg: 'Press Reverse to flip every arrow of 1 → 2 → 3 → 4 → 5.' };
  const { state, setState, run, stop, busy } = useFramePlayer<Frame>(init);
  return (
    <div className={boxClass}>
      <div className="mb-3 flex gap-2">
        <Btn onClick={() => run(frames(), 800)} disabled={busy}>Reverse</Btn>
        <Btn tone="red" onClick={stop} disabled={!busy}>Pause</Btn>
        <Btn tone="slate" onClick={() => { stop(); setState(init); }}>Reset</Btn>
      </div>
      <div className="flex flex-wrap gap-3">
        {VALS.map((v, i) => (
          <div key={v} className="flex flex-col items-center">
            <div className="h-5 text-[10px] font-bold text-yellow-300">
              {state.prev === i ? 'prev ' : ''}{state.cur === i ? 'cur' : ''}
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded border text-sm font-bold ${state.cur === i ? 'border-yellow-400 bg-yellow-400/20 text-yellow-200' : state.prev === i ? 'border-green-400 bg-green-400/20 text-green-200' : 'border-slate-600 bg-slate-800 text-slate-100'}`}>{v}</div>
            <span className="mt-1 text-[10px] text-slate-400">next: {state.next[i] === null ? 'null' : VALS[state.next[i] as number]}</span>
          </div>
        ))}
      </div>
      <Message>{state.msg}</Message>
    </div>
  );
}
