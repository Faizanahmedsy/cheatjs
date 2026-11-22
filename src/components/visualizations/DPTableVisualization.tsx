'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Btn, Message, boxClass, useFramePlayer } from './shared';

type Frame = {
  grid: (number | null)[][];
  rows: string[];
  cols: string[];
  cur?: [number, number];
  src?: [number, number][];
  msg: string;
};
type Kind = 'coin' | 'lcs' | 'edit' | 'knap';

const LABEL: Record<Kind, string> = {
  coin: 'Coin Change',
  lcs: 'Longest Common Subsequence',
  edit: 'Edit Distance',
  knap: '0/1 Knapsack',
};

function coinFrames(amount: number): Frame[] {
  const coins = [1, 3, 4];
  const INF = 1e9;
  const dp: (number | null)[] = Array(amount + 1).fill(null);
  const cols = Array.from({ length: amount + 1 }, (_, i) => String(i));
  const frames: Frame[] = [{ grid: [[...dp]], rows: ['min coins'], cols, msg: `Coins ${coins.join(', ')}. dp[i] = fewest coins to make amount i.` }];
  dp[0] = 0;
  frames.push({ grid: [[...dp]], rows: ['min coins'], cols, cur: [0, 0], msg: 'dp[0] = 0: zero coins make amount 0.' });
  for (let i = 1; i <= amount; i++) {
    let best = INF;
    const src: [number, number][] = [];
    for (const c of coins) {
      if (c <= i && (dp[i - c] as number) + 1 < best) best = (dp[i - c] as number) + 1;
      if (c <= i) src.push([0, i - c]);
    }
    dp[i] = best >= INF ? -1 : best;
    frames.push({ grid: [[...dp]], rows: ['min coins'], cols, cur: [0, i], src, msg: `dp[${i}] = 1 + min of dp[${i}-coin] for coins ${coins.filter((c) => c <= i).join(', ')} = ${dp[i]}.` });
  }
  frames.push({ grid: [[...dp]], rows: ['min coins'], cols, msg: `Answer: ${dp[amount]} coin(s) make ${amount}. (Greedy picks 4+1+1 = 3 coins for 6, DP finds 3+3 = 2.)` });
  return frames;
}

function lcsFrames(a: string, b: string): Frame[] {
  const m = a.length, n = b.length;
  const g: (number | null)[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null));
  const rows = ['', ...a.split('')], cols = ['', ...b.split('')];
  const frames: Frame[] = [];
  for (let i = 0; i <= m; i++) g[i][0] = 0;
  for (let j = 0; j <= n; j++) g[0][j] = 0;
  const snap = (extra: Partial<Frame>): Frame => ({ grid: g.map((r) => [...r]), rows, cols, msg: '', ...extra });
  frames.push(snap({ msg: 'First row and column are 0: an empty string has nothing in common.' }));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        g[i][j] = (g[i - 1][j - 1] as number) + 1;
        frames.push(snap({ cur: [i, j], src: [[i - 1, j - 1]], msg: `"${a[i - 1]}" = "${b[j - 1]}": take diagonal + 1 = ${g[i][j]}.` }));
      } else {
        g[i][j] = Math.max(g[i - 1][j] as number, g[i][j - 1] as number);
        frames.push(snap({ cur: [i, j], src: [[i - 1, j], [i, j - 1]], msg: `"${a[i - 1]}" ≠ "${b[j - 1]}": take the bigger of up and left = ${g[i][j]}.` }));
      }
    }
  frames.push(snap({ msg: `LCS length = ${g[m][n]}. Bottom-right cell holds the answer.` }));
  return frames;
}

function editFrames(a: string, b: string): Frame[] {
  const m = a.length, n = b.length;
  const g: (number | null)[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null));
  const rows = ['', ...a.split('')], cols = ['', ...b.split('')];
  for (let i = 0; i <= m; i++) g[i][0] = i;
  for (let j = 0; j <= n; j++) g[0][j] = j;
  const snap = (extra: Partial<Frame>): Frame => ({ grid: g.map((r) => [...r]), rows, cols, msg: '', ...extra });
  const frames: Frame[] = [snap({ msg: 'Turning a string into an empty string costs its length in deletes. Same for building from empty with inserts.' })];
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        g[i][j] = g[i - 1][j - 1];
        frames.push(snap({ cur: [i, j], src: [[i - 1, j - 1]], msg: `"${a[i - 1]}" matches "${b[j - 1]}": copy the diagonal, cost ${g[i][j]}.` }));
      } else {
        g[i][j] = 1 + Math.min(g[i - 1][j - 1] as number, g[i - 1][j] as number, g[i][j - 1] as number);
        frames.push(snap({ cur: [i, j], src: [[i - 1, j - 1], [i - 1, j], [i, j - 1]], msg: `Different letters: 1 + min(replace, delete, insert) = ${g[i][j]}.` }));
      }
    }
  frames.push(snap({ msg: `Minimum edits to turn "${a}" into "${b}" = ${g[m][n]}.` }));
  return frames;
}

function knapFrames(cap: number): Frame[] {
  const w = [1, 3, 4], v = [15, 20, 30];
  const g: (number | null)[][] = Array.from({ length: w.length + 1 }, () => Array(cap + 1).fill(null));
  const rows = ['no items', ...w.map((x, i) => `item ${i + 1} (w${x}, $${v[i]})`)];
  const cols = Array.from({ length: cap + 1 }, (_, i) => String(i));
  for (let c = 0; c <= cap; c++) g[0][c] = 0;
  const snap = (extra: Partial<Frame>): Frame => ({ grid: g.map((r) => [...r]), rows, cols, msg: '', ...extra });
  const frames: Frame[] = [snap({ msg: `Columns are bag capacity. Rows add one item at a time. Each cell = best value possible.` })];
  for (let i = 1; i <= w.length; i++)
    for (let c = 0; c <= cap; c++) {
      const skip = g[i - 1][c] as number;
      if (w[i - 1] > c) {
        g[i][c] = skip;
        frames.push(snap({ cur: [i, c], src: [[i - 1, c]], msg: `Item ${i} (weight ${w[i - 1]}) does not fit in ${c}. Keep value ${skip}.` }));
      } else {
        const take = (g[i - 1][c - w[i - 1]] as number) + v[i - 1];
        g[i][c] = Math.max(skip, take);
        frames.push(snap({ cur: [i, c], src: [[i - 1, c], [i - 1, c - w[i - 1]]], msg: `Skip = ${skip}, take = ${take}. Best = ${g[i][c]}.` }));
      }
    }
  frames.push(snap({ msg: `Best value with capacity ${cap} = ${g[w.length][cap]}.` }));
  return frames;
}

export function DPTableVisualization() {
  const [kind, setKind] = useState<Kind>('coin');
  const [a, setA] = useState('ABCBD');
  const [b, setB] = useState('BDCB');
  const [num, setNum] = useState('6');
  const { state, setState, run, stop, busy } = useFramePlayer<Frame | null>(null);

  const reset = (k: Kind) => {
    stop();
    setKind(k);
    setState(null);
    if (k === 'edit') { setA('horse'); setB('ros'); }
    if (k === 'lcs') { setA('ABCBD'); setB('BDCB'); }
    if (k === 'coin') setNum('6');
    if (k === 'knap') setNum('6');
  };

  const start = () => {
    if (busy) return;
    const n = Math.max(1, Math.min(12, Number(num) || 6));
    const s1 = a.slice(0, 8), s2 = b.slice(0, 8);
    const frames = kind === 'coin' ? coinFrames(n) : kind === 'lcs' ? lcsFrames(s1, s2) : kind === 'edit' ? editFrames(s1, s2) : knapFrames(Math.min(n, 8));
    run(frames, kind === 'coin' ? 700 : 450);
  };

  const isStr = kind === 'lcs' || kind === 'edit';
  const cellState = (r: number, c: number) => {
    if (!state) return '';
    if (state.cur && state.cur[0] === r && state.cur[1] === c) return 'border-yellow-400 bg-yellow-400/20 text-yellow-200';
    if (state.src?.some(([sr, sc]) => sr === r && sc === c)) return 'border-cyan-400 bg-cyan-400/15 text-cyan-200';
    return 'border-slate-600 bg-slate-800 text-slate-100';
  };

  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(LABEL) as Kind[]).map((k) => (
          <Btn key={k} tone="slate" active={kind === k} onClick={() => reset(k)}>{LABEL[k]}</Btn>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {isStr ? (
          <>
            <Input value={a} onChange={(e) => setA(e.target.value)} className="w-28 border-slate-600 bg-slate-800" aria-label="First string" />
            <Input value={b} onChange={(e) => setB(e.target.value)} className="w-28 border-slate-600 bg-slate-800" aria-label="Second string" />
          </>
        ) : (
          <>
            <p className="text-slate-400">{kind === 'coin' ? 'Amount (1-12):' : 'Capacity (1-8):'}</p>
            <Input value={num} onChange={(e) => setNum(e.target.value)} inputMode="numeric" className="w-20 border-slate-600 bg-slate-800" />
          </>
        )}
        <Btn onClick={start} disabled={busy}>Fill table</Btn>
        <Btn tone="red" onClick={stop} disabled={!busy}>Pause</Btn>
      </div>
      {state ? (
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-1 text-center text-xs">
            <thead>
              <tr>
                <th />
                {state.cols.map((c, i) => <th key={i} className="px-2 text-slate-400">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {state.grid.map((row, r) => (
                <tr key={r}>
                  <th className="whitespace-nowrap pr-2 text-right text-slate-400">{state.rows[r]}</th>
                  {row.map((v, c) => (
                    <td key={c} className={`h-9 min-w-[2.25rem] rounded border font-bold ${cellState(r, c)}`}>{v ?? ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <Message>{state?.msg ?? 'Pick a problem and press "Fill table". Yellow = cell being computed, blue = earlier cells it uses.'}</Message>
    </div>
  );
}
