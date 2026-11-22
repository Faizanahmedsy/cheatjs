'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Btn, Cells, Message, TreeView, boxClass, useFramePlayer, type TNode } from './shared';

type Frame = { arr: number[]; hi: number[]; msg: string };

const toTree = (arr: number[], i = 0): TNode | null =>
  i >= arr.length
    ? null
    : { key: String(i), label: String(arr[i]), children: [toTree(arr, 2 * i + 1), toTree(arr, 2 * i + 2)] };

export function HeapVisualization() {
  const [value, setValue] = useState('4');
  const { state, setState, run, busy } = useFramePlayer<Frame>({
    arr: [5, 9, 8, 12, 10, 15],
    hi: [],
    msg: 'Min-heap: every parent is smaller than its children, so the smallest value is always at the top.',
  });
  const num = Number(value);
  const valid = value.trim() !== '' && Number.isFinite(num);

  const insert = () => {
    if (!valid || busy || state.arr.length >= 15) return;
    const arr = [...state.arr, num];
    const frames: Frame[] = [{ arr: [...arr], hi: [arr.length - 1], msg: `Add ${num} at the end (next free slot).` }];
    let i = arr.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (arr[p] <= arr[i]) {
        frames.push({ arr: [...arr], hi: [i], msg: `${arr[p]} (parent) ≤ ${arr[i]}. Heap rule holds, stop.` });
        break;
      }
      [arr[p], arr[i]] = [arr[i], arr[p]];
      frames.push({ arr: [...arr], hi: [p, i], msg: `Parent was bigger, so swap up. This is sift-up.` });
      i = p;
    }
    run(frames, 700);
  };

  const extract = () => {
    if (busy || state.arr.length === 0) return;
    const arr = [...state.arr];
    const min = arr[0];
    const frames: Frame[] = [{ arr: [...arr], hi: [0], msg: `Smallest value is the root: ${min}.` }];
    arr[0] = arr[arr.length - 1];
    arr.pop();
    frames.push({ arr: [...arr], hi: arr.length ? [0] : [], msg: `Move the last value to the root and remove ${min}.` });
    let i = 0;
    while (true) {
      const l = 2 * i + 1;
      const r = l + 1;
      let s = i;
      if (l < arr.length && arr[l] < arr[s]) s = l;
      if (r < arr.length && arr[r] < arr[s]) s = r;
      if (s === i) break;
      [arr[s], arr[i]] = [arr[i], arr[s]];
      frames.push({ arr: [...arr], hi: [i, s], msg: 'Swap with the smaller child. This is sift-down.' });
      i = s;
    }
    frames.push({ arr: [...arr], hi: [], msg: `Extracted ${min}. Heap rule is true again.` });
    run(frames, 700);
  };

  const random = () => {
    if (busy) return;
    const arr: number[] = [];
    const pool = Array.from({ length: 40 }, (_, i) => i + 1).sort(() => Math.random() - 0.5).slice(0, 7);
    pool.forEach((v) => {
      arr.push(v);
      let i = arr.length - 1;
      while (i > 0 && arr[Math.floor((i - 1) / 2)] > arr[i]) {
        const p = Math.floor((i - 1) / 2);
        [arr[p], arr[i]] = [arr[i], arr[p]];
        i = p;
      }
    });
    setState({ arr, hi: [], msg: 'Built a heap from 7 random values.' });
  };

  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-slate-400">Value:</p>
        <Input value={value} onChange={(e) => setValue(e.target.value)} inputMode="numeric" className="w-20 border-slate-600 bg-slate-800" />
        <Btn onClick={insert} disabled={busy}>Insert</Btn>
        <Btn tone="red" onClick={extract} disabled={busy}>Extract min</Btn>
        <Btn tone="slate" onClick={random} disabled={busy}>Random</Btn>
      </div>
      <p className="mb-1 text-slate-400">Tree view:</p>
      <TreeView root={toTree(state.arr)} hi={state.hi.map(String)} />
      <p className="mb-1 mt-3 text-slate-400">Stored as an array (parent of i is (i-1)/2):</p>
      <Cells items={state.arr.map((v, i) => ({ label: v, state: state.hi.includes(i) ? 'active' : 'default' }))} />
      <Message>{state.msg}</Message>
    </div>
  );
}
