'use client';

import { useState } from 'react';
import { Btn, Cells, Message, boxClass, useFramePlayer } from './shared';

type Algo = 'kadane' | 'stack' | 'dutch' | 'vote';
type S = 'default' | 'active' | 'found' | 'dim' | 'range';
type Frame = { cells: { label: string | number; state: S }[]; info: string[]; msg: string };

const LABEL: Record<Algo, string> = { kadane: "Kadane (max subarray)", stack: 'Next greater (monotonic stack)', dutch: 'Dutch flag (sort 0/1/2)', vote: 'Majority vote' };
const DATA: Record<Algo, number[]> = { kadane: [-2, 1, -3, 4, -1, 2, 1, -5, 4], stack: [4, 5, 2, 10, 8], dutch: [2, 0, 2, 1, 1, 0], vote: [2, 2, 1, 1, 1, 2, 2] };

function kadane(a: number[]): Frame[] {
  const f: Frame[] = [];
  let cur = a[0], best = a[0], s = 0, bs = 0, be = 0;
  const cells = (i: number): Frame['cells'] => a.map((v, k) => ({ label: v, state: k >= bs && k <= be ? 'found' : k === i ? 'active' : 'default' }));
  f.push({ cells: cells(0), info: [`current sum = ${cur}`, `best = ${best}`], msg: 'Start with the first number. At each step: extend the running sum, or restart if it went negative.' });
  for (let i = 1; i < a.length; i++) {
    if (cur < 0) { cur = a[i]; s = i; } else cur += a[i];
    if (cur > best) { best = cur; bs = s; be = i; }
    f.push({ cells: cells(i), info: [`current sum = ${cur}`, `best = ${best}`], msg: `At ${a[i]}: running sum is ${cur}. Best so far ${best} (green range).` });
  }
  f.push({ cells: cells(-1), info: [`best = ${best}`], msg: `Maximum subarray sum = ${best}. One pass, O(n), no extra memory.` });
  return f;
}

function stackAlgo(a: number[]): Frame[] {
  const res: (number | string)[] = Array(a.length).fill('?');
  const st: number[] = [];
  const f: Frame[] = [];
  const snap = (i: number, msg: string) => f.push({ cells: a.map((v, k) => ({ label: v, state: k === i ? 'active' : st.includes(k) ? 'range' : k < i ? 'found' : 'default' })), info: [`stack (indexes): [${st.join(', ')}]`, `answer: [${res.join(', ')}]`], msg });
  snap(-1, 'For each value find the next bigger value to its right. The stack holds values still waiting for their answer.');
  for (let i = 0; i < a.length; i++) {
    while (st.length && a[st[st.length - 1]] < a[i]) {
      const j = st.pop()!;
      res[j] = a[i];
      snap(i, `${a[i]} is bigger than ${a[j]}, so ${a[j]}'s answer is ${a[i]}. Pop it.`);
    }
    st.push(i);
    snap(i, `Push ${a[i]} and wait for something bigger.`);
  }
  st.forEach((j) => (res[j] = -1));
  snap(-1, 'Anything left on the stack has no bigger value to its right: answer -1. O(n) total, each item pushed and popped once.');
  return f;
}

function dutch(a0: number[]): Frame[] {
  const a = [...a0];
  let lo = 0, mid = 0, hi = a.length - 1;
  const f: Frame[] = [];
  const snap = (msg: string) => f.push({ cells: a.map((v, k) => ({ label: v, state: k === mid ? 'active' : k < lo ? 'found' : k > hi ? 'dim' : 'default' })), info: [`low = ${lo}, mid = ${mid}, high = ${hi}`], msg });
  snap('Three pointers. Everything before low is 0, after high is 2, between low and mid is 1.');
  while (mid <= hi) {
    if (a[mid] === 0) { [a[lo], a[mid]] = [a[mid], a[lo]]; lo++; mid++; snap('0 found: swap it to the low side, move low and mid.'); }
    else if (a[mid] === 1) { mid++; snap('1 stays in the middle: move mid.'); }
    else { [a[mid], a[hi]] = [a[hi], a[mid]]; hi--; snap('2 found: swap it to the high side, move high. Check mid again.'); }
  }
  snap('Sorted in one pass, O(n), in place.');
  return f;
}

function vote(a: number[]): Frame[] {
  let cand: number | null = null, cnt = 0;
  const f: Frame[] = [];
  f.push({ cells: a.map((v) => ({ label: v, state: 'default' as S })), info: ['candidate = none', 'count = 0'], msg: 'Boyer-Moore: keep one candidate and a count. Different values cancel each other out.' });
  a.forEach((v, i) => {
    if (cnt === 0) { cand = v; cnt = 1; } else if (v === cand) cnt++; else cnt--;
    f.push({ cells: a.map((x, k) => ({ label: x, state: k === i ? 'active' : k < i ? 'found' : 'default' })), info: [`candidate = ${cand}`, `count = ${cnt}`], msg: `Saw ${v}: candidate ${cand}, count ${cnt}.` });
  });
  f.push({ cells: a.map((x) => ({ label: x, state: x === cand ? 'found' : 'default' })), info: [`majority element = ${cand}`], msg: `${cand} appears more than half the time. O(n) time, O(1) memory.` });
  return f;
}

export function ArrayAlgoVisualization() {
  const [algo, setAlgo] = useState<Algo>('kadane');
  const { state, setState, run, stop, busy } = useFramePlayer<Frame | null>(null);
  const go = () => {
    if (busy) return;
    const a = DATA[algo];
    run(algo === 'kadane' ? kadane(a) : algo === 'stack' ? stackAlgo(a) : algo === 'dutch' ? dutch(a) : vote(a), 800);
  };
  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(LABEL) as Algo[]).map((k) => (
          <Btn key={k} tone="slate" active={algo === k} onClick={() => { stop(); setAlgo(k); setState(null); }}>{LABEL[k]}</Btn>
        ))}
        <Btn onClick={go} disabled={busy}>Run</Btn>
        <Btn tone="red" onClick={stop} disabled={!busy}>Pause</Btn>
      </div>
      <Cells items={state?.cells ?? DATA[algo].map((v) => ({ label: v }))} />
      {state?.info.map((l) => <p key={l} className="mt-2 font-code text-xs text-slate-300">{l}</p>)}
      <Message>{state?.msg ?? 'Pick an algorithm and press Run.'}</Message>
    </div>
  );
}
