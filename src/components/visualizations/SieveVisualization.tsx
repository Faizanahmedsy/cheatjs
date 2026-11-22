'use client';

import { Btn, Message, boxClass, useFramePlayer } from './shared';

const N = 50;
type Frame = { comp: number[]; p: number | null; msg: string };

function frames(): Frame[] {
  const comp: boolean[] = Array(N + 1).fill(false);
  const f: Frame[] = [{ comp: [], p: null, msg: 'List 2 to 50. Take the next unmarked number, it is prime. Cross out all its multiples.' }];
  for (let p = 2; p * p <= N; p++) {
    if (comp[p]) continue;
    for (let m = p * p; m <= N; m += p) comp[m] = true;
    f.push({ comp: comp.map((c, i) => (c ? i : -1)).filter((i) => i > 0), p, msg: `${p} is prime. Cross out ${p * p}, ${p * p + p}, ${p * p + 2 * p}… (start at ${p}×${p}).` });
  }
  f.push({ comp: comp.map((c, i) => (c ? i : -1)).filter((i) => i > 0), p: null, msg: 'Done. Every number not crossed out is prime. We only needed primes up to √50 ≈ 7. Time O(n log log n).' });
  return f;
}

export function SieveVisualization() {
  const init: Frame = { comp: [], p: null, msg: 'Sieve of Eratosthenes finds all primes up to N quickly. Press Run.' };
  const { state, setState, run, stop, busy } = useFramePlayer<Frame>(init);
  const last = state.msg.startsWith('Done');
  return (
    <div className={boxClass}>
      <div className="mb-3 flex gap-2">
        <Btn onClick={() => run(frames(), 1100)} disabled={busy}>Run</Btn>
        <Btn tone="red" onClick={stop} disabled={!busy}>Pause</Btn>
        <Btn tone="slate" onClick={() => { stop(); setState(init); }}>Reset</Btn>
      </div>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: N - 1 }, (_, i) => i + 2).map((n) => {
          const c = state.comp.includes(n);
          return (
            <div key={n} className={`flex h-8 w-8 items-center justify-center rounded border text-xs font-bold ${state.p === n ? 'border-yellow-400 bg-yellow-400/30 text-yellow-100' : c ? 'border-slate-800 bg-slate-900 text-slate-600 line-through' : last ? 'border-green-400 bg-green-400/20 text-green-200' : 'border-slate-600 bg-slate-800 text-slate-100'}`}>{n}</div>
          );
        })}
      </div>
      <Message>{state.msg}</Message>
    </div>
  );
}
