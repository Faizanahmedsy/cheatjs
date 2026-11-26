import type { Lesson, StateRow } from "./types";
import { Recorder, lesson, row } from "./recorder";

const A = "Arrays & Strings";
const B = "Binary Search";
const ids = (n: number) => Array.from({ length: n }, (_, i) => `i${i}`);

/* Two pointers: Two Sum II */
function twoPointers(): Lesson {
  const nums = [1, 3, 4, 6, 8, 11];
  const target = 10;
  const r = new Recorder([]);
  row(r, nums);
  let left = 0;
  let right = nums.length - 1;
  const mark = () => {
    ids(nums.length).forEach((id, i) => r.node(id, { state: i < left || i > right ? "dim" : "idle", tag: i === left && i === right ? "L R" : i === left ? "L" : i === right ? "R" : undefined }));
    r.node(`i${left}`, { state: "current" });
    r.node(`i${right}`, { state: "current" });
  };
  const st = (): StateRow[] => [{ label: "Pair", value: [`${nums[left]} + ${nums[right]} = ${nums[left] + nums[right]}`] }, { label: "Target", value: [String(target)] }];
  mark();
  r.snap("Sorted, find a pair", `The numbers are sorted. Find two that add up to ${target}. Checking every pair is n². Two pointers do it in one pass: one at each end.`, [1, 2], st());
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) {
      r.snap(`${nums[left]} + ${nums[right]} = ${target}`, "Found it. Each step threw away one number for good, so we needed at most n steps.", [5], st());
      break;
    }
    if (sum < target) {
      r.snap(`${sum} is too small`, `${sum} < ${target}. The left number is too small to work with anything, because the right one is already the biggest left. Move left inward.`, [6], st());
      left++;
    } else {
      r.snap(`${sum} is too big`, `${sum} > ${target}. The right number is too big even with the smallest partner. Move right inward.`, [7], st());
      right--;
    }
    mark();
  }
  return lesson(
    { slug: "two-pointers", title: "Two Pointers", question: "167. Two Sum II", group: A, blurb: "One pointer from each end.", problem: "In a sorted array, find two numbers that add up to a target, using O(1) extra space." },
    `function twoSum(numbers, target) {
  let left = 0, right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left, right];
    if (sum < target) left++; // need bigger
    else right--; // need smaller
  }
}`,
    r,
  );
}

/* Sliding window: longest substring without repeats */
function slidingWindow(): Lesson {
  const s = "abcabcbb";
  const r = new Recorder([]);
  row(r, [...s]);
  const lastSeen: Record<string, number> = {};
  let start = 0;
  let best = 0;
  const paint = (end: number) =>
    [...s].forEach((_, i) => r.node(`i${i}`, { state: i >= start && i <= end ? (i === end ? "current" : "frontier") : i < start ? "dim" : "idle", tag: i === start && i === end ? "L R" : i === start ? "L" : i === end ? "R" : undefined }));
  const st = (end: number): StateRow[] => [
    { label: "Window", value: [s.slice(start, end + 1) || "empty"] },
    { label: "Best length", value: [String(best)] },
    { label: "Last seen at", value: Object.entries(lastSeen).map(([k, v]) => `${k}:${v}`) },
  ];
  r.snap("Longest stretch, no repeats", `Find the longest part of "${s}" with no letter twice. A window grows on the right and shrinks on the left when a repeat sneaks in.`, [1, 2], st(-1));
  for (let end = 0; end < s.length; end++) {
    const ch = s[end];
    const jumped = lastSeen[ch] !== undefined && lastSeen[ch] >= start;
    if (jumped) {
      paint(end);
      r.node(`i${lastSeen[ch]}`, { state: "broken", tag: "twin" });
      r.node(`i${end}`, { state: "broken", tag: "R" });
      r.snap(`Stop! "${ch}" again`, `"${ch}" is already inside the window (at ${lastSeen[ch]}). A window can't hold the same letter twice, so the left edge must move.`, [4], st(end - 1));
      start = lastSeen[ch] + 1;
    }
    lastSeen[ch] = end;
    best = Math.max(best, end - start + 1);
    paint(end);
    r.snap(
      jumped ? `Repeat "${ch}": jump left` : `Add "${ch}"`,
      jumped ? `"${ch}" is already in the window. Jump the left edge to just after its last spot (${start}). No need to move it one by one.` : `"${ch}" is new in the window. Window length ${end - start + 1}, best ${best}.`,
      jumped ? [4, 5] : [6, 7],
      st(end),
    );
  }
  r.snap(`Answer: ${best}`, `Each letter enters once and the left edge only moves forward, so it's O(n).`, [9], st(s.length - 1));
  return lesson(
    { slug: "sliding-window", title: "Sliding Window", question: "3. Longest Substring Without Repeating Characters", group: A, blurb: "Grow right, shrink left.", problem: "Find the length of the longest substring with no repeated characters." },
    `function lengthOfLongestSubstring(text) {
  const lastSeen = new Map(); let start = 0, best = 0;
  for (let end = 0; end < text.length; end++) {
    if (lastSeen.get(text[end]) >= start)
      start = lastSeen.get(text[end]) + 1; // jump past the repeat
    lastSeen.set(text[end], end);
    best = Math.max(best, end - start + 1);
  }
  return best;
}`,
    r,
  );
}

/* Prefix sums: subarray sum equals k */
function prefixSum(): Lesson {
  const nums = [1, 2, 1, -1, 2, 1];
  const k = 3;
  const r = new Recorder([]);
  row(r, nums);
  const seen: Record<number, number> = { 0: 1 };
  let running = 0;
  let count = 0;
  const st = (): StateRow[] => [
    { label: "Running total", value: [String(running)] },
    { label: "Totals seen (count)", value: Object.entries(seen).map(([t, c]) => `${t}×${c}`) },
    { label: "Answers", value: [String(count)] },
  ];
  r.snap("Count stretches adding to 3", `How many unbroken stretches add up to ${k}? Trick: if the running total now is T, and earlier it was T − ${k}, the part in between adds to ${k}.`, [1, 2], st());
  nums.forEach((v, i) => {
    running += v;
    const hits = seen[running - k] ?? 0;
    count += hits;
    seen[running] = (seen[running] ?? 0) + 1;
    r.node(`i${i}`, { state: "current", tag: String(running) });
    r.snap(
      `Total ${running}`,
      hits ? `Total is ${running}. We saw ${running - k} before ${hits} time(s), so ${hits} stretch(es) ending here add to ${k}. Answers: ${count}.` : `Total is ${running}. We never saw ${running - k}, so no stretch ending here works.`,
      [4, 5, 6],
      st(),
    );
    r.node(`i${i}`, { state: "done" });
  });
  r.snap(`Answer: ${count}`, "One pass with a map of totals: O(n). This works with negative numbers too, where sliding window fails.", [8], st());
  return lesson(
    { slug: "prefix-sum", title: "Prefix Sum + Hash Map", question: "560. Subarray Sum Equals K", group: A, blurb: "Running totals remember the past.", problem: "Count the subarrays whose sum equals k, even with negative numbers." },
    `function subarraySum(nums, k) {
  const totalsSeen = new Map([[0, 1]]); let running = 0, count = 0;
  for (const num of nums) {
    running += num;
    count += totalsSeen.get(running - k) ?? 0; // earlier total that leaves k
    totalsSeen.set(running, (totalsSeen.get(running) ?? 0) + 1);
  }
  return count;
}
`,
    r,
  );
}

/* Kadane */
function kadane(): Lesson {
  const nums = [3, -4, 5, -2, 4, -6, 1];
  const r = new Recorder([]);
  row(r, nums);
  let run = 0;
  let best = -Infinity;
  let start = 0;
  let bestRange = [0, 0];
  const st = (): StateRow[] => [{ label: "Current run", value: [String(run)] }, { label: "Best so far", value: [best === -Infinity ? "–" : String(best)] }];
  r.snap("The best stretch", "Some numbers are gains, some losses. Which unbroken stretch adds up to the most? One pass is enough if you carry two numbers: the current run and the best so far.", [1, 2, 3], st());
  nums.forEach((v, i) => {
    if (run < 0) {
      r.snap("Drop a run in debt", `The run is ${run}, below 0. Anything added to a debt starts worse, so drop it and start fresh at ${v}.`, [7], st());
      run = 0;
      start = i;
      nums.forEach((_, j) => j < i && r.node(`i${j}`, { state: "dim" }));
    }
    run += v;
    if (run > best) {
      best = run;
      bestRange = [start, i];
    }
    r.node(`i${i}`, { state: "current", tag: String(run) });
    r.snap(`Add ${v}: run ${run}`, `Run = ${run}. ${run === best ? "New best!" : `Best stays ${best}.`}`, [5, 6], st());
    r.node(`i${i}`, { state: "frontier" });
  });
  nums.forEach((_, j) => r.node(`i${j}`, { state: j >= bestRange[0] && j <= bestRange[1] ? "current" : "dim", tag: undefined }));
  r.snap(`Answer: ${best}`, `The best stretch is ${nums.slice(bestRange[0], bestRange[1] + 1).join(", ")}. A dip (−2) was worth keeping because 5 and 4 on each side outweigh it. O(n).`, [9], st());
  return lesson(
    { slug: "kadane", title: "Kadane's Algorithm", question: "53. Maximum Subarray", group: A, blurb: "Drop the run when it goes negative.", problem: "Find the contiguous subarray with the largest sum." },
    `function maxSubArray(nums) {
  let run = 0;
  let best = nums[0];
  for (const num of nums) {
    run += num;
    if (run > best) best = run;
    if (run < 0) run = 0; // a run in debt is dropped
  }
  return best;
}`,
    r,
  );
}

/* Dutch national flag */
function sortColors(): Lesson {
  const nums = [2, 0, 2, 1, 1, 0];
  const r = new Recorder([]);
  // Blocks keep their identity so swaps slide.
  const order = nums.map((_, i) => `b${i}`);
  nums.forEach((v, i) => r.add(`b${i}`, i * 1.7, 0, String(v)));
  const place = (low: number, mid: number, high: number) =>
    order.forEach((id, i) => r.node(id, { x: i * 1.7, state: i < low ? "done" : i > high ? "done" : i === mid ? "current" : "idle", tag: [i === low && "low", i === mid && "mid", i === high && "high"].filter(Boolean).join(" ") || undefined }));
  let low = 0;
  let mid = 0;
  let high = nums.length - 1;
  const swap = (a: number, b: number) => {
    [nums[a], nums[b]] = [nums[b], nums[a]];
    [order[a], order[b]] = [order[b], order[a]];
  };
  const st = (): StateRow[] => [{ label: "Array", value: nums.map(String) }, { label: "low / mid / high", value: [String(low), String(mid), String(high)] }];
  place(low, mid, high);
  r.snap("Sort 0s, 1s and 2s in one pass", "Three pointers split the array: 0s before low, 2s after high, unknown between mid and high.", [1, 2], st());
  while (mid <= high) {
    const v = nums[mid];
    if (v === 0) {
      swap(low, mid);
      low++;
      mid++;
      place(low, mid, high);
      r.snap("0: send left", "A 0 belongs at the front. Swap it with low, move both forward.", [4], st());
    } else if (v === 2) {
      swap(mid, high);
      high--;
      place(low, mid, high);
      r.snap("2: send right", "A 2 belongs at the back. Swap with high and shrink the back. Don't move mid: the swapped-in number is unchecked.", [5], st());
    } else {
      mid++;
      place(low, mid, high);
      r.snap("1: leave it", "A 1 is already in the middle zone. Just move on.", [6], st());
    }
  }
  r.snap("Sorted", "One pass, no counting, O(1) space. This is Dijkstra's Dutch National Flag.", [8], st());
  return lesson(
    { slug: "sort-colors", title: "Dutch National Flag", question: "75. Sort Colors", group: A, blurb: "Three pointers, one pass.", problem: "Sort an array of 0s, 1s and 2s in place, in one pass." },
    `function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) swap(nums, low++, mid++);
    else if (nums[mid] === 2) swap(nums, mid, high--);
    else mid++;
  }
}
`,
    r,
  );
}

/* Trapping rain water */
function trappingRain(): Lesson {
  const h = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
  const r = new Recorder([]);
  row(r, h, "i", 0, 1.3);
  let left = 0;
  let right = h.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;
  const st = (): StateRow[] => [{ label: "leftMax / rightMax", value: [String(leftMax), String(rightMax)] }, { label: "Water", value: [String(water)] }];
  r.snap("Rain on the bars", "Each number is a wall height. Rain fills the dips. Water above a bar = the lower of the tallest wall on its left and right, minus the bar.", [1], st());
  r.node("i0", { tag: "L" });
  r.node(`i${right}`, { tag: "R" });
  let n = 0;
  while (left < right) {
    if (h[left] < h[right]) {
      leftMax = Math.max(leftMax, h[left]);
      const w = leftMax - h[left];
      water += w;
      r.node(`i${left}`, { state: w ? "frontier" : "done", tag: w ? `+${w}` : undefined });
      left++;
      if (n++ % 2 === 0 || w) r.snap(w ? `Left side: +${w}` : "Left side moves", `The left wall is the lower side, so leftMax decides. ${w ? `${leftMax} − ${h[left - 1]} = ${w} water here.` : "No dip here."} Total ${water}.`, [5, 6, 7], st());
    } else {
      rightMax = Math.max(rightMax, h[right]);
      const w = rightMax - h[right];
      water += w;
      r.node(`i${right}`, { state: w ? "frontier" : "done", tag: w ? `+${w}` : undefined });
      right--;
      if (n++ % 2 === 0 || w) r.snap(w ? `Right side: +${w}` : "Right side moves", `The right side is lower, so rightMax decides. ${w ? `${rightMax} − ${h[right + 1]} = ${w}.` : "No dip here."} Total ${water}.`, [9, 10, 11], st());
    }
  }
  r.snap(`Answer: ${water}`, "Always move the lower side: its max is the true limit, because the other side is at least as tall. O(n) time, O(1) space.", [13], st());
  return lesson(
    { slug: "trapping-rain-water", title: "Trapping Rain Water", question: "42. Trapping Rain Water", group: A, blurb: "Move the lower wall inward.", problem: "Given bar heights, compute how much rain water is trapped between them." },
    `function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      leftMax = Math.max(leftMax, height[left]);
      water += leftMax - height[left++];
    } else {
      rightMax = Math.max(rightMax, height[right]);
      water += rightMax - height[right--];
    }
  }
  return water;
}`,
    r,
  );
}

/* Product except self */
function productExceptSelf(): Lesson {
  const nums = [1, 2, 3, 4];
  const r = new Recorder([]);
  row(r, nums, "i", 0);
  row(r, nums.map(() => "?"), "o", 2.2);
  const out = nums.map(() => 1);
  const st = (): StateRow[] => [{ label: "Answer row", value: out.map(String) }];
  r.snap("No division allowed", "For each spot, multiply everything except itself. Without division, split it: product of everything to the left × everything to the right.", [1], st());
  let left = 1;
  nums.forEach((v, i) => {
    out[i] = left;
    r.add(`o${i}`, i * 1.7, 2.2, String(out[i]), { state: "frontier" });
    r.node(`i${i}`, { state: "current", tag: `left ${left}` });
    r.snap(`Left of ${v}: ${left}`, `Everything left of position ${i} multiplies to ${left}. Write it down, then include ${v} for the next one.`, [3, 4], st());
    r.node(`i${i}`, { state: "idle", tag: undefined });
    left *= v;
  });
  let right = 1;
  for (let i = nums.length - 1; i >= 0; i--) {
    out[i] *= right;
    r.node(`o${i}`, { label: String(out[i]), state: "done" });
    r.node(`i${i}`, { state: "current", tag: `right ${right}` });
    r.snap(`Right of ${nums[i]}: ×${right}`, `Now walk back from the right. Multiply the saved left product by the right product ${right}: ${out[i]}.`, [6, 7], st());
    r.node(`i${i}`, { state: "idle", tag: undefined });
    right *= nums[i];
  }
  r.snap(`Answer: ${out.join(", ")}`, "Two passes, no division, O(1) extra space besides the answer.", [9], st());
  return lesson(
    { slug: "product-except-self", title: "Product Except Self", question: "238. Product of Array Except Self", group: A, blurb: "Left products × right products.", problem: "Return an array where each item is the product of all other items, without division." },
    `function productExceptSelf(nums) {
  const answer = []; let left = 1;
  for (let i = 0; i < nums.length; i++) {
    answer[i] = left; left *= nums[i];
  }
  let right = 1;
  for (let i = nums.length - 1; i >= 0; i--) {
    answer[i] *= right; right *= nums[i];
  }
  return answer;
}`,
    r,
  );
}

/* Merge intervals */
function mergeIntervals(): Lesson {
  const list: [number, number][] = [[1, 3], [2, 6], [8, 10], [9, 12], [15, 18]];
  const r = new Recorder([]);
  list.forEach(([a, b], i) => r.add(`v${i}`, i * 2, 0, `${a}-${b}`));
  const merged: [number, number][] = [];
  const st = (): StateRow[] => [{ label: "Merged", value: merged.map(([a, b]) => `${a}-${b}`) }];
  r.snap("Sorted by start", "The meetings are sorted by start time. Walk through once: if one starts before the last merged one ends, they overlap.", [1, 2], st());
  list.forEach(([a, b], i) => {
    const last = merged[merged.length - 1];
    if (last && a <= last[1]) {
      last[1] = Math.max(last[1], b);
      const owner = merged.length - 1;
      r.node(`v${i}`, { state: "dim" });
      r.node(`m${owner}`, { label: `${last[0]}-${last[1]}`, state: "current" });
      r.snap(`${a}-${b} overlaps`, `${a} ≤ ${last[1] === b ? "the last end" : last[1]}, so it overlaps. Stretch the merged one to end at ${last[1]}.`, [5], st());
    } else {
      merged.push([a, b]);
      r.add(`m${merged.length - 1}`, (merged.length - 1) * 2, 2.2, `${a}-${b}`, { state: "current" });
      r.node(`v${i}`, { state: "done" });
      r.snap(`${a}-${b} starts fresh`, last ? `${a} > ${last[1]}: a gap, so this starts a new merged block.` : "The first one starts the list.", [6], st());
    }
    merged.forEach((_, j) => r.node(`m${j}`, { state: "done" }));
  });
  r.snap(`Answer: ${merged.length} blocks`, "Sorting costs O(n log n); the merge pass is O(n).", [8], st());
  return lesson(
    { slug: "merge-intervals", title: "Merge Intervals", question: "56. Merge Intervals", group: A, blurb: "Sort, then extend or start new.", problem: "Merge all overlapping intervals." },
    `function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [start, end] of intervals) {
    if (merged.length && start <= merged.at(-1)[1]) merged.at(-1)[1] = Math.max(merged.at(-1)[1], end);
    else merged.push([start, end]);
  }
  return merged;
}
`,
    r,
  );
}

/* Binary search */
function binarySearch(): Lesson {
  const nums = [1, 3, 5, 7, 9, 11, 13, 15];
  const target = 11;
  const r = new Recorder([]);
  row(r, nums);
  let low = 0;
  let high = nums.length - 1;
  const st = (mid?: number): StateRow[] => [{ label: "low / mid / high", value: [String(low), mid === undefined ? "–" : String(mid), String(high)] }, { label: "Left to search", value: [String(high - low + 1)] }];
  r.snap(`Find ${target}`, "Sorted list. Look at the middle: it tells you which half can't have the answer, so you throw that half away.", [1, 2], st());
  while (low <= high) {
    const mid = (low + high) >> 1;
    nums.forEach((_, i) => r.node(`i${i}`, { state: i < low || i > high ? "dim" : i === mid ? "current" : "idle", tag: i === mid ? "mid" : undefined }));
    if (nums[mid] === target) {
      r.snap(`Found at ${mid}`, `The middle is ${target}. Done in ${Math.ceil(Math.log2(nums.length))} looks or fewer: O(log n).`, [4, 5], st(mid));
      break;
    }
    const goRight = nums[mid] < target;
    r.snap(`Middle is ${nums[mid]}`, goRight ? `${nums[mid]} < ${target}, so everything at or left of it is too small. Keep the right half.` : `${nums[mid]} > ${target}, keep the left half.`, goRight ? [4, 6] : [4, 7], st(mid));
    if (goRight) low = mid + 1;
    else high = mid - 1;
  }
  return lesson(
    { slug: "binary-search", title: "Binary Search", question: "704. Binary Search", group: B, blurb: "Halve the search each step.", problem: "Find a target in a sorted array in O(log n)." },
    `function search(nums, target) {
  let low = 0, high = nums.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) low = mid + 1; // answer is to the right
    else high = mid - 1; // answer is to the left
  }
  return -1;
}`,
    r,
  );
}

/* Rotated sorted array */
function rotatedSearch(): Lesson {
  const nums = [4, 5, 6, 7, 0, 1, 2];
  const target = 0;
  const r = new Recorder([]);
  row(r, nums);
  let low = 0;
  let high = nums.length - 1;
  const st = (mid?: number): StateRow[] => [{ label: "low / mid / high", value: [String(low), mid === undefined ? "–" : String(mid), String(high)] }];
  r.snap("A turned list", `This sorted list was turned at some point. Find ${target} in O(log n). Key fact: cut it anywhere and at least one half is still in order.`, [1], st());
  while (low <= high) {
    const mid = (low + high) >> 1;
    nums.forEach((_, i) => r.node(`i${i}`, { state: i < low || i > high ? "dim" : i === mid ? "current" : "idle", tag: i === mid ? "mid" : undefined }));
    if (nums[mid] === target) {
      r.snap(`Found at ${mid}`, "Found it.", [4], st(mid));
      break;
    }
    if (nums[low] <= nums[mid]) {
      const inLeft = nums[low] <= target && target < nums[mid];
      r.snap(`Left half ${nums[low]}..${nums[mid]} is in order`, inLeft ? `${target} fits between ${nums[low]} and ${nums[mid]}, so go left.` : `${target} is not between ${nums[low]} and ${nums[mid]}, so it must be on the right.`, [5, 6, 7], st(mid));
      if (inLeft) high = mid - 1;
      else low = mid + 1;
    } else {
      const inRight = nums[mid] < target && target <= nums[high];
      r.snap(`Right half ${nums[mid]}..${nums[high]} is in order`, inRight ? `${target} fits on the right.` : `${target} is not there, go left.`, [8, 9, 10], st(mid));
      if (inRight) low = mid + 1;
      else high = mid - 1;
    }
  }
  return lesson(
    { slug: "search-rotated-array", title: "Search Rotated Array", question: "33. Search in Rotated Sorted Array", group: B, blurb: "One half is always sorted.", problem: "Search a target in a sorted array that was rotated, in O(log n)." },
    `function search(nums, target) {
  let low = 0, high = nums.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1; if (nums[mid] === target) return mid;
    if (nums[low] <= nums[mid]) { // left half is in order
      if (nums[low] <= target && target < nums[mid]) high = mid - 1;
      else low = mid + 1;
    } else { // right half is in order
      if (nums[mid] < target && target <= nums[high]) low = mid + 1;
      else high = mid - 1;
    }
  }
  return -1;
}`,
    r,
  );
}

/* Binary search on the answer */
function koko(): Lesson {
  const piles = [3, 6, 7, 11];
  const hours = 8;
  const r = new Recorder([]);
  const speeds = Array.from({ length: 11 }, (_, i) => i + 1);
  row(r, speeds, "s", 0, 1.4);
  const need = (k: number) => piles.reduce((t, p) => t + Math.ceil(p / k), 0);
  let low = 1;
  let high = 11;
  const st = (mid?: number): StateRow[] => [{ label: "Piles", value: piles.map(String) }, { label: "Speed tried", value: [mid ? `${mid} needs ${need(mid)}h` : "–"] }, { label: "Hours allowed", value: [String(hours)] }];
  r.snap("Slowest speed that works", "Koko eats bananas at k per hour, one pile at a time. What's the slowest k that finishes in 8 hours? The blocks are possible speeds. If k works, every faster speed works too: that's what lets us binary search.", [1, 2], st());
  while (low < high) {
    const mid = (low + high) >> 1;
    speeds.forEach((s) => r.node(`s${s - 1}`, { state: s < low || s > high ? "dim" : s === mid ? "current" : "idle", tag: s === mid ? `${need(mid)}h` : undefined }));
    const ok = need(mid) <= hours;
    r.snap(`Try speed ${mid}`, ok ? `${need(mid)} hours ≤ ${hours}: speed ${mid} works. Maybe slower works too, keep the left side including ${mid}.` : `${need(mid)} hours > ${hours}: too slow. Only faster speeds can work.`, [4, 5, 6], st(mid));
    if (ok) high = mid;
    else low = mid + 1;
  }
  speeds.forEach((s) => r.node(`s${s - 1}`, { state: s === low ? "current" : "dim", tag: s === low ? `${need(low)}h` : undefined }));
  r.snap(`Answer: ${low}`, `Speed ${low} is the slowest that finishes in time. We searched the answers, not the array: O(n log max).`, [8], st(low));
  return lesson(
    { slug: "binary-search-on-answer", title: "Binary Search on the Answer", question: "875. Koko Eating Bananas", group: B, blurb: "Search the answer space.", problem: "Find the minimum eating speed that finishes all piles within h hours." },
    `function minEatingSpeed(piles, hours) {
  let low = 1, high = Math.max(...piles);
  while (low < high) {
    const speed = (low + high) >> 1;
    const needed = piles.reduce((sum, pile) => sum + Math.ceil(pile / speed), 0);
    if (needed <= hours) high = speed; // works, try slower
    else low = speed + 1; // too slow
  }
  return low;
}`,
    r,
  );
}

/* XOR trick */
function singleNumber(): Lesson {
  const nums = [4, 1, 2, 1, 2];
  const r = new Recorder([]);
  row(r, nums);
  let acc = 0;
  const bits = (n: number) => n.toString(2).padStart(3, "0");
  const st = (): StateRow[] => [{ label: "Running XOR", value: [`${acc} (${bits(acc)})`] }];
  r.snap("Everyone has a twin but one", "Every number appears twice except one. Find it with no extra memory. XOR has two magic rules: x ^ x = 0 and x ^ 0 = x.", [1], st());
  nums.forEach((v, i) => {
    const before = acc;
    acc ^= v;
    r.node(`i${i}`, { state: "current", tag: bits(v) });
    r.snap(`${before} ^ ${v} = ${acc}`, `${bits(before)} XOR ${bits(v)} = ${bits(acc)}. Bits that match cancel to 0.`, [3], st());
    r.node(`i${i}`, { state: "done" });
  });
  r.snap(`Answer: ${acc}`, "Each pair cancelled itself out, so only the single number is left. O(n) time, O(1) space.", [4], st());
  return lesson(
    { slug: "single-number-xor", title: "XOR Trick", question: "136. Single Number", group: "Bit Manipulation", blurb: "Pairs cancel with XOR.", problem: "Every element appears twice except one. Find it in O(n) time and O(1) space." },
    `function singleNumber(nums) {
  let result = 0;
  for (const num of nums) result ^= num; // twins cancel out
  return result;
}`,
    r,
  );
}

export const ARRAY_LESSONS: Lesson[] = [twoPointers(), slidingWindow(), prefixSum(), kadane(), sortColors(), trappingRain(), productExceptSelf(), mergeIntervals(), binarySearch(), rotatedSearch(), koko(), singleNumber()];
