'use client';

import { useState } from 'react';
import { Btn, Message, boxClass, useFramePlayer } from './shared';

type Frame = { queens: number[]; trying?: [number, number]; bad?: boolean; msg: string };

function frames(n: number): Frame[] {
  const f: Frame[] = [];
  const cols: number[] = [];
  const safe = (r: number, c: number) => cols.every((cc, rr) => cc !== c && Math.abs(cc - c) !== r - rr);
  let found = false;
  const place = (r: number): boolean => {
    if (r === n) return true;
    for (let c = 0; c < n; c++) {
      if (f.length > 400) return false;
      if (safe(r, c)) {
        cols.push(c);
        f.push({ queens: [...cols], trying: [r, c], msg: `Row ${r}: column ${c} is safe. Place a queen and go to the next row.` });
        if (place(r + 1)) return true;
        cols.pop();
        f.push({ queens: [...cols], msg: `Row ${r + 1} had no safe column. Backtrack: remove the queen from row ${r}.` });
      } else {
        f.push({ queens: [...cols], trying: [r, c], bad: true, msg: `Row ${r}: column ${c} is attacked by a queen. Try the next column.` });
      }
    }
    return false;
  };
  found = place(0);
  f.push({ queens: [...cols], msg: found ? `Solved: ${n} queens, none attacking each other.` : 'Stopped early (too many steps to show).' });
  return f;
}

export function NQueensVisualization() {
  const [n, setN] = useState(4);
  const { state, setState, run, stop, busy } = useFramePlayer<Frame>({ queens: [], msg: 'Place N queens so none attack each other. Try a cell, go deeper, and back up when stuck: this is backtracking.' });

  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {[4, 5, 6].map((k) => (
          <Btn key={k} tone="slate" active={n === k} onClick={() => { stop(); setN(k); setState({ queens: [], msg: `${k} x ${k} board.` }); }}>{k} queens</Btn>
        ))}
        <Btn onClick={() => run(frames(n), 350)} disabled={busy}>Solve</Btn>
        <Btn tone="red" onClick={stop} disabled={!busy}>Pause</Btn>
      </div>
      <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${n}, 2.5rem)` }}>
        {Array.from({ length: n * n }, (_, i) => {
          const r = Math.floor(i / n), c = i % n;
          const q = state.queens[r] === c;
          const t = state.trying && state.trying[0] === r && state.trying[1] === c;
          return (
            <div key={i} className={`flex h-10 w-10 items-center justify-center rounded text-lg font-bold ${t && state.bad ? 'bg-red-500/40' : t ? 'bg-yellow-400/30' : (r + c) % 2 ? 'bg-slate-700' : 'bg-slate-800'}`}>
              {q ? '♛' : t && state.bad ? '✕' : ''}
            </div>
          );
        })}
      </div>
      <Message>{state.msg}</Message>
    </div>
  );
}
