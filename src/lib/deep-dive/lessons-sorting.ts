import type { Lesson, NodeState, StateRow } from "./types";
import { Recorder, lesson } from "./recorder";

const G = "Sorting";
const START = [5, 2, 8, 1, 9, 3];
const GAP = 1.7;

/** Blocks keep their identity, so every swap slides. */
function setup(values = START) {
  const r = new Recorder([]);
  const order = values.map((_, i) => `b${i}`);
  const val: Record<string, number> = {};
  values.forEach((v, i) => {
    val[`b${i}`] = v;
    r.add(`b${i}`, i * GAP, 0, String(v));
  });
  const place = (states: (i: number) => NodeState = () => "idle", tags: (i: number) => string | undefined = () => undefined) =>
    order.forEach((id, i) => r.node(id, { x: i * GAP, y: 0, state: states(i), tag: tags(i) }));
  const swap = (a: number, b: number) => ([order[a], order[b]] = [order[b], order[a]]);
  const at = (i: number) => val[order[i]];
  const st = (extra: StateRow[] = []): StateRow[] => [{ label: "Array", value: order.map((id) => String(val[id])) }, ...extra];
  return { r, order, val, place, swap, at, st };
}

function bubble(): Lesson {
  const { r, order, place, swap, at, st } = setup();
  const n = order.length;
  let swaps = 0;
  place();
  r.snap("Bubble sort", "Walk along, compare neighbours, swap if the left one is bigger. After each pass the biggest unsorted number has bubbled to the end.", [1], st());
  for (let end = n - 1; end > 0; end--) {
    for (let i = 0; i < end; i++) {
      const doSwap = at(i) > at(i + 1);
      if (doSwap) {
        swap(i, i + 1);
        swaps++;
      }
      place((k) => (k > end ? "done" : k === i || k === i + 1 ? "current" : "idle"));
      if (doSwap) r.snap(`Swap ${at(i + 1)} and ${at(i)}`, `${at(i + 1)} > ${at(i)}, so they trade places.`, [3, 4], st([{ label: "Swaps", value: [String(swaps)] }]));
    }
    place((k) => (k >= end ? "done" : "idle"));
    r.snap(`${at(end)} is in place`, `Pass done: ${at(end)} is the biggest left, so it's final.`, [2], st([{ label: "Swaps", value: [String(swaps)] }]));
  }
  place(() => "done");
  r.snap("Sorted", "Up to n passes of up to n compares: O(n²). Simple, but slow on big lists.", [6], st());
  return lesson(
    { slug: "bubble-sort", title: "Bubble Sort", question: "Sorting basics", group: G, blurb: "Big numbers bubble to the end.", problem: "Sort by swapping neighbours that are out of order." },
    `function bubbleSort(nums) {
  for (let end = nums.length - 1; end > 0; end--)
    for (let i = 0; i < end; i++)
      if (nums[i] > nums[i + 1])
        [nums[i], nums[i + 1]] = [nums[i + 1], nums[i]];
  return nums;
}`,
    r,
  );
}

function selection(): Lesson {
  const { r, order, place, swap, at, st } = setup();
  const n = order.length;
  place();
  r.snap("Selection sort", "Find the smallest number left and put it next in line. Repeat.", [1], st());
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) if (at(j) < at(min)) min = j;
    place((k) => (k < i ? "done" : k === min ? "current" : k === i ? "frontier" : "idle"), (k) => (k === min ? "min" : k === i ? "slot" : undefined));
    r.snap(`Smallest left: ${at(min)}`, `Scan positions ${i} to ${n - 1}. The smallest is ${at(min)}.`, [3, 4], st());
    swap(i, min);
    place((k) => (k <= i ? "done" : "idle"));
    r.snap(`${at(i)} goes to slot ${i}`, "Swap it into the next slot. That slot is now final.", [5], st());
  }
  place(() => "done");
  r.snap("Sorted", "Always n²/2 compares, but at most n swaps. Useful when swaps are expensive.", [7], st());
  return lesson(
    { slug: "selection-sort", title: "Selection Sort", question: "Sorting basics", group: G, blurb: "Pick the smallest, place it.", problem: "Sort by repeatedly selecting the smallest remaining item." },
    `function selectionSort(nums) {
  for (let i = 0; i < nums.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < nums.length; j++) if (nums[j] < nums[min]) min = j;
    [nums[i], nums[min]] = [nums[min], nums[i]];
  }
  return nums;
}`,
    r,
  );
}

function insertion(): Lesson {
  const { r, order, place, swap, at, st } = setup();
  const n = order.length;
  place((k) => (k === 0 ? "done" : "idle"));
  r.snap("Insertion sort", "Like sorting cards in your hand: the left part is sorted; take the next card and slide it left until it fits.", [1], st());
  for (let i = 1; i < n; i++) {
    const v = at(i);
    let j = i;
    while (j > 0 && at(j - 1) > at(j)) {
      swap(j - 1, j);
      j--;
    }
    place((k) => (k === j ? "current" : k <= i ? "done" : "idle"));
    r.snap(`Insert ${v}`, j === i ? `${v} is already bigger than everything to its left. It stays.` : `${v} slides left past ${i - j} bigger number(s) into slot ${j}.`, [3, 4, 5], st());
  }
  place(() => "done");
  r.snap("Sorted", "O(n²) in the worst case, but almost O(n) on nearly sorted data. That's why real sorts use it for small pieces.", [8], st());
  return lesson(
    { slug: "insertion-sort", title: "Insertion Sort", question: "Sorting basics", group: G, blurb: "Slide each card into place.", problem: "Sort by inserting each item into the sorted part on its left." },
    `function insertionSort(nums) {
  for (let i = 1; i < nums.length; i++) {
    let j = i;
    while (j > 0 && nums[j - 1] > nums[j]) {
      [nums[j - 1], nums[j]] = [nums[j], nums[j - 1]]; j--;
    }
  }
  return nums;
}`,
    r,
  );
}

function merge(): Lesson {
  const values = [5, 2, 8, 1, 9, 3, 7, 4];
  const { r, order, val, place, st } = setup(values);
  place();
  r.snap("Merge sort", "Split the list in halves until each piece has one number (already sorted). Then merge sorted pieces back together, always taking the smaller front number.", [1, 2], st());
  const sort = (lo: number, hi: number, depth: number) => {
    if (hi - lo <= 1) return;
    const mid = (lo + hi) >> 1;
    sort(lo, mid, depth + 1);
    sort(mid, hi, depth + 1);
    const merged = order.slice(lo, hi).sort((a, b) => val[a] - val[b]);
    merged.forEach((id, k) => (order[lo + k] = id));
    order.forEach((id, i) => r.node(id, { x: i * GAP, y: i >= lo && i < hi ? 2.2 : 0, state: i >= lo && i < hi ? "current" : "idle", tag: undefined }));
    r.snap(
      `Merge ${hi - lo} numbers`,
      `Two sorted halves (positions ${lo}–${mid - 1} and ${mid}–${hi - 1}) are merged: compare the fronts, take the smaller, repeat. Result: ${merged.map((id) => val[id]).join(", ")}.`,
      [4, 5, 6],
      st(),
    );
    order.forEach((id, i) => r.node(id, { y: 0, state: i >= lo && i < hi ? "frontier" : "idle" }));
  };
  sort(0, order.length, 0);
  place(() => "done");
  r.snap("Sorted", "log n levels of splitting, and each level does n work merging: O(n log n) every time. Needs O(n) extra space.", [8], st());
  return lesson(
    { slug: "merge-sort", title: "Merge Sort", question: "912. Sort an Array", group: G, blurb: "Split, sort halves, merge.", problem: "Sort in O(n log n) by divide and conquer." },
    `function mergeSort(nums) {
  if (nums.length <= 1) return nums;
  const mid = nums.length >> 1;
  const left = mergeSort(nums.slice(0, mid)), right = mergeSort(nums.slice(mid));
  const merged = [];
  while (left.length && right.length) merged.push(left[0] <= right[0] ? left.shift() : right.shift());
  return [...merged, ...left, ...right];
}
// O(n log n) time, O(n) space`,
    r,
  );
}

function quick(): Lesson {
  const values = [5, 2, 8, 1, 9, 3, 7, 4];
  const { r, order, place, swap, at, st } = setup(values);
  const done = new Set<number>();
  place();
  r.snap("Quick sort", "Pick a pivot. Move everything smaller to its left and bigger to its right. Now the pivot is in its final spot. Do the same to each side.", [1], st());
  const sort = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) return void done.add(lo);
    const pivot = at(hi);
    let wall = lo;
    for (let i = lo; i < hi; i++) if (at(i) < pivot) swap(i, wall++);
    swap(wall, hi);
    done.add(wall);
    place((k) => (done.has(k) ? (k === wall ? "current" : "done") : k >= lo && k <= hi ? "frontier" : "dim"), (k) => (k === wall ? "pivot" : undefined));
    r.snap(`Pivot ${pivot} lands at ${wall}`, `In positions ${lo}–${hi}: numbers below ${pivot} moved left of the wall, then ${pivot} went to the wall. It's final now.`, [3, 4, 5, 6], st());
    sort(lo, wall - 1);
    sort(wall + 1, hi);
  };
  sort(0, order.length - 1);
  place(() => "done");
  r.snap("Sorted", "Average O(n log n), in place. A bad pivot every time (already sorted input) gives O(n²), so real code picks a random pivot.", [8], st());
  return lesson(
    { slug: "quick-sort", title: "Quick Sort", question: "912. Sort an Array", group: G, blurb: "Partition around a pivot.", problem: "Sort in place by partitioning around a pivot." },
    `function quickSort(nums, low = 0, high = nums.length - 1) {
  if (low >= high) return nums;
  const pivot = nums[high]; let wall = low;
  for (let i = low; i < high; i++) if (nums[i] < pivot) swap(nums, i, wall++);
  swap(nums, wall, high); // pivot is final here
  quickSort(nums, low, wall - 1); quickSort(nums, wall + 1, high);
  return nums;
}
// average O(n log n)`,
    r,
  );
}

function counting(): Lesson {
  const values = [3, 1, 4, 1, 0, 3, 3];
  const r = new Recorder([]);
  values.forEach((v, i) => r.add(`i${i}`, i * GAP, 0, String(v)));
  const counts = [0, 0, 0, 0, 0];
  counts.forEach((_, v) => r.add(`c${v}`, v * GAP, 2.4, "0", { tag: `${v}s` }));
  const st = (): StateRow[] => [{ label: "Counts", value: counts.map((c, v) => `${v}:${c}`) }];
  r.snap("Counting sort", "When numbers are small whole numbers, skip comparing. Count how many of each, then write them out in order.", [1], st());
  values.forEach((v, i) => {
    counts[v]++;
    r.node(`i${i}`, { state: "done" });
    r.node(`c${v}`, { label: String(counts[v]), state: "current" });
    r.snap(`Count a ${v}`, `One more ${v}. Count of ${v}s is now ${counts[v]}.`, [3], st());
    r.node(`c${v}`, { state: "frontier" });
  });
  const out = counts.flatMap((c, v) => Array(c).fill(v));
  out.forEach((v, i) => r.node(`i${i}`, { label: String(v), state: "current" }));
  r.snap(`Write out: ${out.join(" ")}`, "Walk the counts in order and write each number that many times. O(n + range), no compares at all.", [4, 5], st());
  return lesson(
    { slug: "counting-sort", title: "Counting Sort", question: "Sorting basics", group: G, blurb: "Count, don't compare.", problem: "Sort small non-negative integers in O(n + k) by counting." },
    `function countingSort(nums, maxValue) {
  const counts = Array(maxValue + 1).fill(0);
  for (const num of nums) counts[num]++;
  const sorted = [];
  counts.forEach((count, value) => { for (let k = 0; k < count; k++) sorted.push(value); });
  return sorted;
}`,
    r,
  );
}

export const SORTING_LESSONS: Lesson[] = [bubble(), selection(), insertion(), merge(), quick(), counting()];
