import type { Lesson, StateRow } from "./types";
import { Recorder, lesson, row } from "./recorder";

const LL = "Linked Lists";
const SQ = "Stacks & Queues";
const H = "Hashing";
const D = { directed: true };

/** A linked list laid out in a row: n0 -> n1 -> ... */
function chain(values: number[], gap = 2) {
  const r = new Recorder([]);
  values.forEach((v, i) => r.add(`n${i}`, i * gap, 0, String(v)));
  values.slice(1).forEach((_, i) => r.link(`n${i}`, `n${i + 1}`, D));
  return r;
}

function reverseList(): Lesson {
  const vals = [1, 2, 3, 4, 5];
  const r = chain(vals);
  let prev = -1;
  let cur = 0;
  const tags = () => vals.forEach((_, i) => r.node(`n${i}`, { tag: i === prev ? "prev" : i === cur ? "cur" : undefined, state: i === cur ? "current" : i <= prev ? "done" : "idle" }));
  const st = (): StateRow[] => [{ label: "prev / cur", value: [prev < 0 ? "null" : String(vals[prev]), cur >= vals.length ? "null" : String(vals[cur])] }];
  tags();
  r.snap("Turn every arrow around", "Each node only knows the next one. To reverse, walk once and flip each arrow to point back. Keep three pointers so nothing gets lost.", [1, 2], st());
  while (cur < vals.length) {
    if (cur + 1 < vals.length) r.unlink(`n${cur}`, `n${cur + 1}`);
    if (prev >= 0) r.link(`n${cur}`, `n${prev}`, { ...D, state: "chosen" });
    r.snap(`Flip ${vals[cur]}'s arrow`, `Save ${cur + 1 < vals.length ? vals[cur + 1] : "null"} as next first, then point ${vals[cur]} back to ${prev < 0 ? "null" : vals[prev]}.`, [4, 5], st());
    prev = cur;
    cur++;
    tags();
    r.snap("Step forward", "prev moves to cur, cur moves to the saved next.", [6, 7], st());
  }
  r.snap("Reversed", `${vals[vals.length - 1]} is the new head. One pass, O(n) time, O(1) space.`, [9], st());
  return lesson(
    { slug: "reverse-linked-list", title: "Reverse a Linked List", question: "206. Reverse Linked List", group: LL, blurb: "prev, cur, next: flip arrows.", problem: "Reverse a singly linked list in place." },
    `function reverseList(head) {
  let prev = null, cur = head;
  while (cur) {
    const next = cur.next; // save the rest
    cur.next = prev; // flip the arrow
    prev = cur;
    cur = next;
  }
  return prev;
}`,
    r,
  );
}

function floydCycle(): Lesson {
  const r = new Recorder([]);
  const pos: [number, number][] = [[0, 2], [2, 2], [4, 2], [6, 0.5], [8, 2], [6, 3.5]];
  pos.forEach(([x, y], i) => r.add(`n${i}`, x, y, String(i + 1)));
  const next = [1, 2, 3, 4, 5, 2];
  next.forEach((t, i) => r.link(`n${i}`, `n${t}`, D));
  let slow = 0;
  let fast = 0;
  const show = () => pos.forEach((_, i) => r.node(`n${i}`, { state: i === slow && i === fast ? "current" : i === slow || i === fast ? "frontier" : "idle", tag: i === slow && i === fast ? "both" : i === slow ? "slow" : i === fast ? "fast" : undefined }));
  const st = (): StateRow[] => [{ label: "slow / fast at", value: [String(slow + 1), String(fast + 1)] }];
  show();
  r.snap("Is there a loop?", "Two runners start at the head. Slow moves 1 step, fast moves 2. If there's a loop, fast laps slow and they meet, like runners on a track.", [1, 2], st());
  do {
    slow = next[slow];
    fast = next[next[fast]];
    show();
    r.snap(slow === fast ? "They meet!" : "Run", slow === fast ? `Both are at ${slow + 1}. Fast caught up from behind, so there must be a loop.` : `Slow at ${slow + 1}, fast at ${fast + 1}. Inside a loop, the gap shrinks by 1 every step.`, slow === fast ? [5] : [3, 4], st());
  } while (slow !== fast);
  r.snap("O(1) memory", "No set of seen nodes needed. To find where the loop starts, move one runner back to the head and step both by 1: they meet at the loop's start.", [7], st());
  return lesson(
    { slug: "fast-slow-pointers", title: "Fast & Slow Pointers", question: "141. Linked List Cycle", group: LL, blurb: "Fast laps slow inside a loop.", problem: "Detect a cycle in a linked list using O(1) memory." },
    `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next; // 1 step
    fast = fast.next.next; // 2 steps
    if (slow === fast) return true;
  }
  return false;
}`,
    r,
  );
}

function mergeTwo(): Lesson {
  const a = [1, 4, 7];
  const b = [2, 3, 8];
  const r = new Recorder([]);
  a.forEach((v, i) => r.add(`a${i}`, i * 2, 0, String(v)));
  b.forEach((v, i) => r.add(`b${i}`, i * 2, 2.5, String(v)));
  a.slice(1).forEach((_, i) => r.link(`a${i}`, `a${i + 1}`, D));
  b.slice(1).forEach((_, i) => r.link(`b${i}`, `b${i + 1}`, D));
  let i = 0;
  let j = 0;
  let k = 0;
  let last = "";
  const out: number[] = [];
  const st = (): StateRow[] => [{ label: "Merged", value: out.length ? out.map(String) : ["empty"] }];
  r.snap("Zip two sorted lists", "Both lists are sorted. Compare their fronts, take the smaller, move on. Like merging two queues by height.", [1, 2], st());
  while (i < a.length || j < b.length) {
    const takeA = j >= b.length || (i < a.length && a[i] <= b[j]);
    const id = takeA ? `a${i}` : `b${j}`;
    const v = takeA ? a[i++] : b[j++];
    out.push(v);
    r.node(id, { x: k++ * 2, y: 5, state: "done" });
    r.edges = r.edges.filter((e) => e.a !== id);
    if (last) r.link(last, id, { ...D, state: "chosen" });
    last = id;
    r.snap(`Take ${v}`, `${v} is the smaller front. Attach it to the merged list.`, [4, 5], st());
  }
  r.snap("Merged", "Each node is moved once: O(n + m), no new nodes.", [8], st());
  return lesson(
    { slug: "merge-two-sorted-lists", title: "Merge Two Sorted Lists", question: "21. Merge Two Sorted Lists", group: LL, blurb: "Take the smaller front.", problem: "Merge two sorted linked lists into one sorted list." },
    `function mergeTwoLists(first, second) {
  const dummy = { next: null }; let tail = dummy;
  while (first && second) {
    if (first.val <= second.val) { tail.next = first; first = first.next; }
    else { tail.next = second; second = second.next; }
    tail = tail.next;
  }
  tail.next = first ?? second;
  return dummy.next;
}`,
    r,
  );
}

function removeNth(): Lesson {
  const vals = [1, 2, 3, 4, 5, 6];
  const n = 2;
  const r = chain(vals);
  let lead = 0;
  let back = 0;
  const show = () => vals.forEach((_, i) => r.node(`n${i}`, { state: i === lead || i === back ? "current" : "idle", tag: i === lead && i === back ? "both" : i === lead ? "lead" : i === back ? "back" : undefined }));
  const st = (): StateRow[] => [{ label: "Gap", value: [String(lead - back)] }];
  show();
  r.snap(`Remove ${n}nd from the end`, "We don't know the length. Trick: send a lead pointer n steps ahead, then walk both together. When lead hits the end, back is right before the target.", [1], st());
  for (let s = 0; s < n; s++) lead++;
  show();
  r.snap(`Lead goes ${n} ahead`, `Now there's a fixed gap of ${n} between them.`, [2, 3], st());
  while (lead < vals.length - 1) {
    lead++;
    back++;
  }
  show();
  r.snap("Walk together", "Both move until lead is on the last node. The gap stays the same.", [4], st());
  const target = back + 1;
  r.node(`n${target}`, { state: "dim" });
  r.unlink(`n${back}`, `n${target}`);
  r.unlink(`n${target}`, `n${target + 1}`);
  r.link(`n${back}`, `n${target + 1}`, { ...D, state: "chosen" });
  r.snap(`Skip ${vals[target]}`, `back.next = back.next.next. ${vals[target]} is cut out in one pass.`, [5], st());
  return lesson(
    { slug: "remove-nth-from-end", title: "Remove Nth From End", question: "19. Remove Nth Node From End of List", group: LL, blurb: "A fixed gap between two pointers.", problem: "Remove the nth node from the end of a linked list in one pass." },
    `function removeNthFromEnd(head, n) {
  const dummy = { next: head }; let lead = dummy, back = dummy;
  for (let step = 0; step < n; step++) lead = lead.next;
  while (lead.next) { lead = lead.next; back = back.next; }
  back.next = back.next.next; // skip the target
  return dummy.next;
}`,
    r,
  );
}

/** Stack drawn as a column going back on the platform. */
function stackView(r: Recorder, stack: (string | number)[], prefix = "s") {
  [...r.nodes.keys()].filter((k) => k.startsWith(prefix)).forEach((k) => r.node(k, { state: "hidden" }));
  stack.forEach((v, i) => r.add(`${prefix}${i}`, 0, -i * 1.4 + 6, String(v), { state: i === stack.length - 1 ? "current" : "idle", tag: i === stack.length - 1 ? "top" : undefined }));
}

function validParens(): Lesson {
  const s = "({[]})";
  const r = new Recorder([]);
  row(r, [...s], "c", 0, 1.5);
  [...s].forEach((_, i) => r.node(`c${i}`, { x: 3 + i * 1.5 }));
  const stack: string[] = [];
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const st = (): StateRow[] => [{ label: "Stack", value: stack.length ? [...stack] : ["empty"] }];
  r.snap("Do the brackets match?", "Every opener needs the right closer, in the right order. The most recent opener must close first: last in, first out. That's a stack.", [1], st());
  [...s].forEach((ch, i) => {
    r.node(`c${i}`, { state: "current" });
    if (pairs[ch]) {
      const top = stack.pop();
      stackView(r, stack);
      r.snap(`${ch} closes ${top}`, `${ch} matches the top opener ${top}. Pop it.`, [5, 6], st());
    } else {
      stack.push(ch);
      stackView(r, stack);
      r.snap(`Push ${ch}`, `${ch} opens something. Push it on the stack and wait for its closer.`, [4], st());
    }
    r.node(`c${i}`, { state: "done" });
  });
  r.snap("Valid", "The stack is empty at the end, so every opener was closed in order. O(n).", [8], st());
  return lesson(
    { slug: "valid-parentheses", title: "Stack: Valid Parentheses", question: "20. Valid Parentheses", group: SQ, blurb: "Last opened, first closed.", problem: "Check whether brackets are balanced and correctly nested." },
    `function isValid(text) {
  const stack = [], pairs = { ")": "(", "]": "[", "}": "{" };
  for (const ch of text) {
    if (!pairs[ch]) stack.push(ch); // an opener
    else if (stack.pop() !== pairs[ch]) return false; // wrong closer
  }
  return stack.length === 0;
}
`,
    r,
  );
}

function dailyTemps(): Lesson {
  const t = [73, 74, 75, 71, 69, 72, 76];
  const r = new Recorder([]);
  row(r, t);
  const ans = t.map(() => 0);
  const stack: number[] = [];
  const st = (): StateRow[] => [{ label: "Stack (waiting days)", value: stack.length ? stack.map((i) => `${t[i]}`) : ["empty"] }, { label: "Answer", value: ans.map(String) }];
  const paint = (i: number) => t.forEach((_, k) => r.node(`i${k}`, { state: k === i ? "current" : stack.includes(k) ? "frontier" : k < i ? "done" : "idle", tag: ans[k] ? `${ans[k]}d` : undefined }));
  r.snap("Wait for a warmer day", "For each day, how many days until it's warmer? Keep a stack of days still waiting. Their temperatures go down from bottom to top (a monotonic stack).", [1, 2], st());
  t.forEach((temp, i) => {
    const solved: number[] = [];
    while (stack.length && t[stack[stack.length - 1]] < temp) {
      const d = stack.pop()!;
      ans[d] = i - d;
      solved.push(t[d]);
    }
    stack.push(i);
    paint(i);
    r.snap(`Day ${i}: ${temp}`, solved.length ? `${temp} is warmer than ${solved.join(", ")} waiting on the stack. They're answered and popped. Then ${temp} waits.` : `Nobody waiting is colder than ${temp}. It joins the stack.`, [4, 5, 6, 7], st());
  });
  r.snap("Answer", "Each day is pushed and popped at most once: O(n). Days left on the stack never get a warmer day: 0.", [9], st());
  return lesson(
    { slug: "monotonic-stack", title: "Monotonic Stack", question: "739. Daily Temperatures", group: SQ, blurb: "Waiting items, popped by a bigger one.", problem: "For each day, find how many days until a warmer temperature." },
    `function dailyTemperatures(temps) {
  const answer = temps.map(() => 0), waiting = [];
  for (let day = 0; day < temps.length; day++) {
    while (waiting.length && temps[waiting.at(-1)] < temps[day]) {
      const colder = waiting.pop();
      answer[colder] = day - colder;
    }
    waiting.push(day);
  }
  return answer;
}`,
    r,
  );
}

function histogram(): Lesson {
  const h = [2, 1, 5, 6, 2, 3];
  const r = new Recorder([]);
  row(r, h);
  const stack: number[] = [];
  let best = 0;
  const st = (): StateRow[] => [{ label: "Stack (rising bars)", value: stack.length ? stack.map((i) => String(h[i])) : ["empty"] }, { label: "Biggest area", value: [String(best)] }];
  r.snap("Biggest rectangle", "Bars of width 1. Find the biggest rectangle under them. Keep a stack of bars with rising heights. When a shorter bar arrives, taller bars can't stretch further right, so measure them now.", [1, 2], st());
  [...h, 0].forEach((height, i) => {
    while (stack.length && h[stack[stack.length - 1]] > height) {
      const top = stack.pop()!;
      const left = stack.length ? stack[stack.length - 1] + 1 : 0;
      const area = h[top] * (i - left);
      best = Math.max(best, area);
      h.forEach((_, k) => r.node(`i${k}`, { state: k >= left && k < i ? "frontier" : "idle", tag: k === top ? `${h[top]}×${i - left}` : undefined }));
      r.snap(`Height ${h[top]}: area ${area}`, `A bar of height ${h[top]} can stretch from ${left} to ${i - 1} (width ${i - left}). Area ${area}. Best ${best}.`, [5, 6, 7], st());
    }
    if (i < h.length) stack.push(i);
  });
  r.snap(`Answer: ${best}`, "Bars 5 and 6 make a 5×2 rectangle. Each bar is pushed and popped once: O(n). A Google favourite.", [10], st());
  return lesson(
    { slug: "largest-rectangle-histogram", title: "Largest Rectangle in Histogram", question: "84. Largest Rectangle in Histogram", group: SQ, blurb: "Measure a bar when a shorter one arrives.", problem: "Find the area of the largest rectangle in a histogram." },
    `function largestRectangleArea(heights) {
  const rising = []; let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const height = i === heights.length ? 0 : heights[i];
    while (rising.length && heights[rising.at(-1)] > height) {
      const top = rising.pop(), left = rising.length ? rising.at(-1) + 1 : 0;
      best = Math.max(best, heights[top] * (i - left));
    }
    rising.push(i);
  }
  return best;
}`,
    r,
  );
}

function minStack(): Lesson {
  const ops: [string, number?][] = [["push", 5], ["push", 3], ["push", 7], ["push", 2], ["pop"], ["pop"]];
  const r = new Recorder([]);
  const main: number[] = [];
  const mins: number[] = [];
  const draw = () => {
    stackView(r, main, "s");
    [...r.nodes.keys()].filter((k) => k.startsWith("s")).forEach((k) => r.node(k, { x: 0 }));
    stackView(r, mins, "m");
    [...r.nodes.keys()].filter((k) => k.startsWith("m")).forEach((k) => r.node(k, { x: 3, tag: r.get(k).tag ? "min" : undefined }));
  };
  const st = (): StateRow[] => [{ label: "Stack", value: main.length ? main.map(String) : ["empty"] }, { label: "Min so far (twin stack)", value: mins.length ? mins.map(String) : ["empty"] }];
  r.snap("getMin in O(1)", "A stack that can also tell its smallest item instantly. Keep a twin stack: each level stores the smallest value at or below it.", [1, 2], st());
  for (const [op, v] of ops) {
    if (op === "push") {
      main.push(v!);
      mins.push(Math.min(v!, mins.length ? mins[mins.length - 1] : Infinity));
      draw();
      r.snap(`push ${v}`, `Push ${v}. The twin stack gets min(${v}, old min) = ${mins[mins.length - 1]}.`, [4], st());
    } else {
      const out = main.pop();
      mins.pop();
      draw();
      r.snap(`pop ${out}`, `Pop from both. The min goes back to ${mins[mins.length - 1]} by itself, no searching.`, [5], st());
    }
  }
  return lesson(
    { slug: "min-stack", title: "Min Stack", question: "155. Min Stack", group: SQ, blurb: "A twin stack of minimums.", problem: "Design a stack with push, pop, top and getMin all in O(1)." },
    `class MinStack {
  items = []; mins = [];
  push(value) { this.items.push(value); this.mins.push(Math.min(value, this.mins.at(-1) ?? Infinity)); }
  pop() { this.mins.pop(); return this.items.pop(); }
  getMin() { return this.mins.at(-1); }
}`,
    r,
  );
}

function slidingMax(): Lesson {
  const nums = [1, 3, -1, -3, 5, 3, 6, 7];
  const k = 3;
  const r = new Recorder([]);
  row(r, nums);
  const dq: number[] = [];
  const out: number[] = [];
  const st = (): StateRow[] => [{ label: "Deque (front first)", value: dq.length ? dq.map((i) => String(nums[i])) : ["empty"] }, { label: "Window maxes", value: out.length ? out.map(String) : ["none yet"] }];
  r.snap("Max of every window of 3", "Slide a window of 3. Keep a deque of candidates, biggest at the front. A smaller number behind a bigger, newer one can never be the max again, so throw it out.", [1], st());
  nums.forEach((v, i) => {
    if (dq.length && dq[0] <= i - k) dq.shift();
    while (dq.length && nums[dq[dq.length - 1]] <= v) dq.pop();
    dq.push(i);
    if (i >= k - 1) out.push(nums[dq[0]]);
    nums.forEach((_, j) => r.node(`i${j}`, { state: j === dq[0] ? "current" : dq.includes(j) ? "frontier" : j > i - k && j <= i ? "idle" : "dim", tag: j === dq[0] && i >= k - 1 ? "max" : undefined }));
    r.snap(`Add ${v}`, `Remove smaller numbers from the back, then add ${v}. ${i >= k - 1 ? `Window max is the front: ${nums[dq[0]]}.` : "The window isn't full yet."}`, [3, 4, 5, 6], st());
  });
  r.snap("O(n)", "Each index enters and leaves the deque once. A heap would be O(n log k).", [8], st());
  return lesson(
    { slug: "sliding-window-maximum", title: "Sliding Window Maximum", question: "239. Sliding Window Maximum", group: SQ, blurb: "A deque of possible maxes.", problem: "Return the maximum of each sliding window of size k." },
    `function maxSlidingWindow(nums, k) {
  const candidates = [], result = []; // indexes, values decreasing
  for (let i = 0; i < nums.length; i++) {
    if (candidates[0] <= i - k) candidates.shift(); // left the window
    while (candidates.length && nums[candidates.at(-1)] <= nums[i]) candidates.pop();
    candidates.push(i);
    if (i >= k - 1) result.push(nums[candidates[0]]);
  }
  return result;
}`,
    r,
  );
}

function hashMap(): Lesson {
  const keys = ["cat", "dog", "cow", "ant", "bee"];
  const hash = (k: string) => [...k].reduce((h, c) => h + c.charCodeAt(0), 0) % 4;
  const r = new Recorder([]);
  [0, 1, 2, 3].forEach((b) => r.add(`b${b}`, b * 2.2, 0, `[${b}]`, { state: "done" }));
  const buckets: string[][] = [[], [], [], []];
  const st = (): StateRow[] => buckets.map((list, b) => ({ label: `Bucket ${b}`, value: list.length ? list : ["empty"] }));
  r.snap("How a hash map works", "A hash map is an array of buckets. A hash function turns a key into a bucket number, so we jump straight to it instead of searching.", [1, 2], st());
  keys.forEach((k) => {
    const b = hash(k);
    const depth = buckets[b].length;
    buckets[b].push(k);
    r.add(`k${k}`, b * 2.2, 1.8 + depth * 1.6, k, { state: "current", tag: depth ? "collision" : undefined });
    r.link(depth ? `k${buckets[b][depth - 1]}` : `b${b}`, `k${k}`, { directed: true });
    r.snap(`"${k}" goes to bucket ${b}`, depth ? `hash("${k}") = ${b}, but bucket ${b} is taken. Collision! Chain it after the others.` : `hash("${k}") = sum of letter codes % 4 = ${b}.`, [3, 4], st());
    r.node(`k${k}`, { state: "idle", tag: undefined });
  });
  r.snap("O(1) on average", "Lookup: hash the key, go to its bucket, check its short chain. When chains get long, the map doubles its buckets and re-hashes everything.", [6], st());
  return lesson(
    { slug: "hash-map-internals", title: "How a Hash Map Works", question: "706. Design HashMap", group: H, blurb: "Buckets, hashing and collisions.", problem: "Store key-value pairs with O(1) average lookups using buckets and chaining." },
    `class HashMap {
  buckets = Array.from({ length: 4 }, () => []);
  put(key, value) {
    const bucket = this.buckets[hash(key) % this.buckets.length];
    bucket.push([key, value]); // same bucket? chain them
  }
  get(key) { return this.buckets[hash(key) % this.buckets.length].find(([k]) => k === key)?.[1]; }
}`,
    r,
  );
}

function twoSum(): Lesson {
  const nums = [2, 7, 11, 15];
  const target = 9;
  const r = new Recorder([]);
  row(r, nums);
  const seen: Record<number, number> = {};
  const st = (): StateRow[] => [{ label: "Map: value → index", value: Object.keys(seen).length ? Object.entries(seen).map(([v, i]) => `${v}→${i}`) : ["empty"] }];
  r.snap("Two Sum in one pass", `Find two numbers adding to ${target}. For each number, ask the map: "have I seen the partner I need?"`, [1], st());
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    r.node(`i${i}`, { state: "current", tag: `need ${need}` });
    if (seen[need] !== undefined) {
      r.node(`i${seen[need]}`, { state: "current" });
      r.snap(`Found ${need}`, `${need} is in the map at index ${seen[need]}. Answer [${seen[need]}, ${i}]. O(n) instead of O(n²).`, [4, 5], st());
      break;
    }
    seen[nums[i]] = i;
    r.snap(`Need ${need}, not seen`, `No ${need} yet. Remember ${nums[i]} at index ${i}.`, [4, 6], st());
    r.node(`i${i}`, { state: "done", tag: undefined });
  }
  return lesson(
    { slug: "two-sum-hash", title: "Two Sum (Hash Map)", question: "1. Two Sum", group: H, blurb: "Ask the map for the partner.", problem: "Find indices of two numbers that add up to target in O(n)." },
    `function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const partner = target - nums[i];
    if (seen.has(partner)) return [seen.get(partner), i];
    seen.set(nums[i], i);
  }
}`,
    r,
  );
}

function groupAnagrams(): Lesson {
  const words = ["eat", "tea", "tan", "ate", "nat", "bat"];
  const r = new Recorder([]);
  row(r, words, "w", 0, 1.8);
  const groups: Record<string, string[]> = {};
  const st = (): StateRow[] => Object.entries(groups).map(([k, v]) => ({ label: `key "${k}"`, value: v }));
  r.snap("Group the anagrams", "Anagrams have the same letters. Sort each word's letters to get a key: all anagrams share it. Then a map groups them.", [1, 2], st());
  words.forEach((w, i) => {
    const key = [...w].sort().join("");
    const g = Object.keys(groups).indexOf(key);
    (groups[key] ??= []).push(w);
    const col = g < 0 ? Object.keys(groups).length - 1 : g;
    r.node(`w${i}`, { x: col * 2.4, y: 2 + groups[key].length * 1.5, state: "current", tag: key });
    r.snap(`${w} → "${key}"`, `Sorted letters of "${w}" are "${key}". ${groups[key].length > 1 ? `It joins ${groups[key].slice(0, -1).join(", ")}.` : "A new group starts."}`, [3, 4], st());
    r.node(`w${i}`, { state: "done", tag: undefined });
  });
  r.snap(`${Object.keys(groups).length} groups`, "O(n · k log k) for n words of length k. Counting letters as the key makes it O(n · k).", [6], st());
  return lesson(
    { slug: "group-anagrams", title: "Group Anagrams", question: "49. Group Anagrams", group: H, blurb: "Sorted letters as the key.", problem: "Group words that are anagrams of each other." },
    `function groupAnagrams(words) {
  const groups = new Map();
  for (const word of words) {
    const key = [...word].sort().join("");
    groups.set(key, [...(groups.get(key) ?? []), word]);
  }
  return [...groups.values()];
}`,
    r,
  );
}

function longestConsecutive(): Lesson {
  const nums = [100, 4, 200, 1, 3, 2];
  const r = new Recorder([]);
  row(r, nums, "i", 0, 1.8);
  const set = new Set(nums);
  let best = 0;
  const st = (): StateRow[] => [{ label: "Set", value: [...set].map(String) }, { label: "Longest run", value: [String(best)] }];
  r.snap("Longest run, no sorting", "Find the longest run of consecutive numbers in O(n). Put everything in a set. Only start counting from a number whose x − 1 is missing: that's where a run begins.", [1, 2], st());
  nums.forEach((v, i) => {
    if (set.has(v - 1)) {
      r.node(`i${i}`, { state: "dim", tag: "skip" });
      r.snap(`${v}: not a start`, `${v - 1} exists, so ${v} is in the middle of a run. Skip it; the start will count it.`, [4], st());
      return;
    }
    let len = 1;
    while (set.has(v + len)) len++;
    best = Math.max(best, len);
    nums.forEach((u, j) => u >= v && u < v + len && r.node(`i${j}`, { state: "current" }));
    r.node(`i${i}`, { tag: `run ${len}` });
    r.snap(`${v} starts a run of ${len}`, `${v - 1} is missing, so count up: ${Array.from({ length: len }, (_, t) => v + t).join(", ")}. Length ${len}.`, [5, 6, 7], st());
    nums.forEach((_, j) => r.node(`i${j}`, { state: "idle" }));
  });
  r.snap(`Answer: ${best}`, "Each number is counted inside exactly one run: O(n) total.", [9], st());
  return lesson(
    { slug: "longest-consecutive-sequence", title: "Longest Consecutive Sequence", question: "128. Longest Consecutive Sequence", group: H, blurb: "Only count from run starts.", problem: "Find the length of the longest consecutive sequence in O(n)." },
    `function longestConsecutive(nums) {
  const set = new Set(nums); let best = 0;
  for (const num of set) {
    if (set.has(num - 1)) continue; // not the start of a run
    let length = 1;
    while (set.has(num + length)) length++;
    best = Math.max(best, length);
  }
  return best;
}`,
    r,
  );
}

export const LINEAR_LESSONS: Lesson[] = [reverseList(), floydCycle(), mergeTwo(), removeNth(), validParens(), dailyTemps(), histogram(), minStack(), slidingMax(), hashMap(), twoSum(), groupAnagrams(), longestConsecutive()];
