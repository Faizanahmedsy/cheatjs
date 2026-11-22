'use client';

import { useState } from 'react';
import { Btn, Message, boxClass, useFramePlayer } from './shared';

type Frame = { arr: number[]; compare: number[]; swap: number[]; sorted: number[]; msg: string; comparisons: number; swaps: number };
type Algo = 'Bubble' | 'Selection' | 'Insertion' | 'Merge' | 'Quick';

const NOTES: Record<Algo, string> = {
  Bubble: 'Bubble sort: compare neighbours and swap. The biggest value bubbles to the end each pass. O(n²).',
  Selection: 'Selection sort: find the smallest remaining value and put it in front. O(n²), few swaps.',
  Insertion: 'Insertion sort: take the next value and slide it left into its place. O(n²), great for nearly sorted data.',
  Merge: 'Merge sort: split in halves, sort each, merge them. Always O(n log n).',
  Quick: 'Quick sort: pick a pivot, put smaller values left and bigger right, repeat. O(n log n) on average.',
};

const randomArray = () => Array.from({ length: 10 }, () => 5 + Math.floor(Math.random() * 95));

function makeFrames(algo: Algo, input: number[]): Frame[] {
  const a = [...input];
  const frames: Frame[] = [];
  let comparisons = 0;
  let swaps = 0;
  const push = (compare: number[], swap: number[], sorted: number[], msg: string) =>
    frames.push({ arr: [...a], compare, swap, sorted, msg, comparisons, swaps });
  const swapAt = (i: number, j: number) => {
    [a[i], a[j]] = [a[j], a[i]];
    swaps += 1;
  };
  const n = a.length;
  push([], [], [], 'Start.');

  if (algo === 'Bubble') {
    for (let i = 0; i < n - 1; i += 1) {
      for (let j = 0; j < n - i - 1; j += 1) {
        comparisons += 1;
        push([j, j + 1], [], range(n - i, n), `Compare ${a[j]} and ${a[j + 1]}.`);
        if (a[j] > a[j + 1]) {
          swapAt(j, j + 1);
          push([], [j, j + 1], range(n - i, n), 'Left was bigger, swap.');
        }
      }
    }
  } else if (algo === 'Selection') {
    for (let i = 0; i < n - 1; i += 1) {
      let min = i;
      for (let j = i + 1; j < n; j += 1) {
        comparisons += 1;
        push([j, min], [], range(0, i), `Is ${a[j]} smaller than the current minimum ${a[min]}?`);
        if (a[j] < a[min]) min = j;
      }
      if (min !== i) {
        swapAt(i, min);
        push([], [i, min], range(0, i), `Put the minimum ${a[i]} at position ${i}.`);
      }
    }
  } else if (algo === 'Insertion') {
    for (let i = 1; i < n; i += 1) {
      let j = i;
      while (j > 0) {
        comparisons += 1;
        push([j - 1, j], [], range(0, i), `Compare ${a[j - 1]} and ${a[j]}.`);
        if (a[j - 1] <= a[j]) break;
        swapAt(j - 1, j);
        push([], [j - 1, j], range(0, i), 'Slide left.');
        j -= 1;
      }
    }
  } else if (algo === 'Merge') {
    const merge = (lo: number, mid: number, hi: number) => {
      const left = a.slice(lo, mid + 1);
      const right = a.slice(mid + 1, hi + 1);
      let i = 0;
      let j = 0;
      let k = lo;
      while (i < left.length && j < right.length) {
        comparisons += 1;
        a[k] = left[i] <= right[j] ? left[i++] : right[j++];
        push([k], [], [], `Merging: write ${a[k]} to position ${k}.`);
        k += 1;
      }
      while (i < left.length) { a[k] = left[i++]; push([k], [], [], `Copy leftover ${a[k]}.`); k += 1; }
      while (j < right.length) { a[k] = right[j++]; push([k], [], [], `Copy leftover ${a[k]}.`); k += 1; }
    };
    const sort = (lo: number, hi: number) => {
      if (lo >= hi) return;
      const mid = Math.floor((lo + hi) / 2);
      sort(lo, mid);
      sort(mid + 1, hi);
      merge(lo, mid, hi);
    };
    sort(0, n - 1);
  } else {
    const done = new Set<number>();
    const sort = (lo: number, hi: number) => {
      if (lo > hi) return;
      if (lo === hi) { done.add(lo); return; }
      const pivot = a[hi];
      let p = lo;
      for (let j = lo; j < hi; j += 1) {
        comparisons += 1;
        push([j, hi], [], [...done], `Compare ${a[j]} with pivot ${pivot}.`);
        if (a[j] < pivot) {
          if (p !== j) { swapAt(p, j); push([], [p, j], [...done], 'Smaller than pivot, move to the left side.'); }
          p += 1;
        }
      }
      swapAt(p, hi);
      done.add(p);
      push([], [p, hi], [...done], `Pivot ${pivot} is now in its final place.`);
      sort(lo, p - 1);
      sort(p + 1, hi);
    };
    sort(0, n - 1);
  }
  frames.push({ arr: [...a], compare: [], swap: [], sorted: range(0, n), msg: 'Sorted!', comparisons, swaps });
  return frames;
}

function range(from: number, to: number) {
  return Array.from({ length: Math.max(0, to - from) }, (_, i) => from + i);
}

export function SortingVisualization() {
  const [algo, setAlgo] = useState<Algo>('Bubble');
  const { state, setState, run, stop, busy } = useFramePlayer<Frame>({
    arr: [64, 25, 12, 90, 33, 71, 18, 47, 80, 5],
    compare: [], swap: [], sorted: [], msg: NOTES.Bubble, comparisons: 0, swaps: 0,
  });
  const max = Math.max(...state.arr, 1);

  const pick = (next: Algo) => {
    if (busy) return;
    setAlgo(next);
    setState({ ...state, compare: [], swap: [], sorted: [], msg: NOTES[next], comparisons: 0, swaps: 0 });
  };

  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(NOTES) as Algo[]).map((name) => (
          <Btn key={name} tone="slate" active={algo === name} onClick={() => pick(name)}>{name}</Btn>
        ))}
      </div>
      <div className="mb-3 flex gap-2">
        <Btn onClick={() => run(makeFrames(algo, state.arr), 180)} disabled={busy}>Sort</Btn>
        <Btn tone="red" onClick={stop} disabled={!busy}>Stop</Btn>
        <Btn tone="yellow" onClick={() => setState({ arr: randomArray(), compare: [], swap: [], sorted: [], msg: NOTES[algo], comparisons: 0, swaps: 0 })} disabled={busy}>
          New array
        </Btn>
      </div>
      <div className="flex h-44 items-end justify-center gap-1 rounded-md border border-slate-700/50 bg-slate-800/50 p-3">
        {state.arr.map((v, i) => {
          const color = state.swap.includes(i) ? 'bg-red-400' : state.compare.includes(i) ? 'bg-yellow-400' : state.sorted.includes(i) ? 'bg-green-400' : 'bg-cyan-500/70';
          return (
            <div key={i} className="flex flex-1 flex-col items-center justify-end" style={{ height: '100%' }}>
              <span className="mb-1 text-[10px] text-slate-400">{v}</span>
              <div className={`w-full rounded-t ${color}`} style={{ height: `${(v / max) * 80}%` }} />
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Comparisons: <span className="text-yellow-300">{state.comparisons}</span> · Swaps: <span className="text-red-300">{state.swaps}</span> ·
        <span className="text-yellow-300"> yellow</span> compare · <span className="text-red-300">red</span> swap · <span className="text-green-300">green</span> sorted
      </p>
      <Message>{state.msg}</Message>
    </div>
  );
}
