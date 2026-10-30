import type { Problem } from "./problem-types";

/** Practice problems 36–55: Stack & Queue (36–45) and Binary Search (46–55). */
export const STACK_SEARCH_PROBLEMS: Problem[] = [
  // ───────────────────────────── Stack & Queue ─────────────────────────────
  {
    id: "valid-parentheses",
    number: 36,
    title: "Valid Parentheses",
    group: "Stack & Queue",
    difficulty: "Easy",
    statement:
      "Given a string made only of brackets ( ) [ ] { }, decide whether it is balanced. Every opening bracket must be closed by the same kind, in the right order.",
    example: 's = "{[()]}()" → true',
    approach:
      "Push every opening bracket onto a stack. When a closing bracket arrives, it must match the bracket on top of the stack, the most recent one still open; pop it if it does. The string is valid only if nothing ever mismatches and the stack is empty at the end.",
    watch: [
      "`stack` grows on `{`, `[`, `(` and shrinks on each closing bracket",
      "`pairs` maps each closing bracket to the opening one it needs",
      "the check `stack.pop() !== pairs[ch]` is where a wrong order would fail",
      "at the end `stack.length === 0` means every bracket was closed",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function isValid(s) {
  // each closing bracket and the opening bracket it needs
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = []; // opening brackets still waiting to be closed

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch); // remember it until its partner shows up
    } else if (stack.pop() !== pairs[ch]) {
      return false; // the most recent open bracket is the wrong kind
    }
  }
  return stack.length === 0; // nothing left open
}

console.log(isValid("{[()]}()")); // expected: true`,
  },
  {
    id: "min-stack",
    number: 37,
    title: "Min Stack",
    group: "Stack & Queue",
    difficulty: "Medium",
    statement:
      "Build a stack that supports push, pop, top and getMin. Every operation, including finding the smallest value, must take constant time.",
    example:
      "push 5, push 3, push 7, getMin, pop, push 2, getMin, pop, top, getMin → [3,2,3,3]",
    approach:
      "Keep a second stack, `mins`, alongside the normal one. Each push also records the smallest value so far on `mins`, and each pop removes from both. The top of `mins` is therefore always the minimum of whatever is currently in the stack.",
    watch: [
      "`stack` and `mins` always have the same length",
      "pushing 7 copies 3 onto `mins`: the smallest so far is still 3",
      "after popping 2, the top of `mins` is back to 3 with no searching",
      "`results` collects what getMin and top return",
    ],
    complexity: { time: "O(1) per operation", space: "O(n)" },
    code: `class MinStack {
  constructor() {
    this.stack = []; // the values
    this.mins = []; // mins[i] = smallest of stack[0..i]
  }
  push(val) {
    this.stack.push(val);
    const last = this.mins.length ? this.mins[this.mins.length - 1] : val;
    this.mins.push(Math.min(val, last)); // smallest so far
  }
  pop() {
    this.stack.pop();
    this.mins.pop(); // keep both stacks in step
  }
  top() {
    return this.stack[this.stack.length - 1];
  }
  getMin() {
    return this.mins[this.mins.length - 1];
  }
}

const ms = new MinStack();
const results = [];
ms.push(5);
ms.push(3);
ms.push(7);
results.push(ms.getMin()); // 3
ms.pop(); // removes 7
ms.push(2);
results.push(ms.getMin()); // 2
ms.pop(); // removes 2
results.push(ms.top()); // 3 is on top again
results.push(ms.getMin()); // 3
console.log(results); // expected: [3, 2, 3, 3]`,
  },
  {
    id: "evaluate-reverse-polish-notation",
    number: 38,
    title: "Evaluate Reverse Polish Notation",
    group: "Stack & Queue",
    difficulty: "Medium",
    statement:
      "An expression is written in postfix form: each operator comes after its two operands. Work out its value. Division truncates toward zero.",
    example: 'tokens = ["4","13","5","/","+"] → 6',
    approach:
      "Read the tokens left to right. Numbers go onto a stack. An operator pops the top two numbers, applies itself (second-popped is the left side), and pushes the result back. When the tokens run out, the single number left is the answer.",
    watch: [
      "numbers pile up on `stack` until an operator arrives",
      "`b` is popped first, then `a`: order matters for `-` and `/`",
      "13 / 5 becomes 2 because `Math.trunc` drops the fraction",
      "the stack shrinks by one on every operator",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function evalRPN(tokens) {
  const stack = []; // numbers waiting for an operator

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "+" || t === "-" || t === "*" || t === "/") {
      const b = stack.pop(); // right operand (pushed last)
      const a = stack.pop(); // left operand
      let res;
      if (t === "+") res = a + b;
      else if (t === "-") res = a - b;
      else if (t === "*") res = a * b;
      else res = Math.trunc(a / b); // divide toward zero
      stack.push(res);
    } else {
      stack.push(Number(t)); // a number: save it
    }
  }
  return stack[0]; // the only value left
}

console.log(evalRPN(["4", "13", "5", "/", "+"])); // expected: 6`,
  },
  {
    id: "daily-temperatures",
    number: 39,
    title: "Daily Temperatures",
    group: "Stack & Queue",
    difficulty: "Medium",
    statement:
      "For each day's temperature, find how many days you must wait for a warmer day. If no warmer day comes, the answer for that day is 0.",
    example: "temps = [73,74,75,71,69,72,76,73] → [1,1,4,2,1,1,0,0]",
    approach:
      "Keep a stack of day indexes that are still waiting for a warmer day; their temperatures go down from bottom to top. When today is warmer than the day on top, that day's wait is over: pop it and record `i - day`. Each index is pushed and popped at most once, so the whole thing is linear.",
    watch: [
      "`stack` holds indexes, not temperatures",
      "a warm day can pop several waiting days at once (day 6, 76°, pops three)",
      "`answer[day] = i - day` is the wait in days",
      "days still on the stack at the end keep their 0",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function dailyTemperatures(temps) {
  const answer = new Array(temps.length).fill(0);
  const stack = []; // indexes of days still waiting for a warmer day

  for (let i = 0; i < temps.length; i++) {
    // today is warmer than the waiting day on top: its wait ends now
    while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
      const day = stack.pop();
      answer[day] = i - day;
    }
    stack.push(i); // today waits too
  }
  return answer;
}

const temps = [73, 74, 75, 71, 69, 72, 76, 73];
console.log(dailyTemperatures(temps)); // expected: [1, 1, 4, 2, 1, 1, 0, 0]`,
  },
  {
    id: "next-greater-element-i",
    number: 40,
    title: "Next Greater Element I",
    group: "Stack & Queue",
    difficulty: "Easy",
    statement:
      "`nums1` is a subset of `nums2`. For each value in `nums1`, find the first bigger value to its right in `nums2`, or -1 if there is none.",
    example: "nums1 = [4,1,2], nums2 = [1,3,4,2] → [-1,3,-1]",
    approach:
      "Walk `nums2` once with a stack of values still waiting for a bigger one. When a bigger value arrives, pop the smaller ones and record it as their next greater element in a Map. Then each query in `nums1` is a single Map lookup.",
    watch: [
      "`stack` holds values that have not found a bigger one yet",
      "when 3 arrives it pops 1, so `next` gets 1 → 3",
      "values left on the stack at the end have no bigger value: -1",
      "the final loop just reads answers out of `next`",
    ],
    complexity: { time: "O(n + m)", space: "O(n)" },
    code: `function nextGreaterElement(nums1, nums2) {
  const next = new Map(); // value -> next greater value in nums2
  const stack = []; // values still waiting for a bigger one

  for (let i = 0; i < nums2.length; i++) {
    const n = nums2[i];
    // n is the answer for every smaller value on top of the stack
    while (stack.length && stack[stack.length - 1] < n) {
      next.set(stack.pop(), n);
    }
    stack.push(n);
  }

  const result = [];
  for (let j = 0; j < nums1.length; j++) {
    result.push(next.has(nums1[j]) ? next.get(nums1[j]) : -1);
  }
  return result;
}

console.log(nextGreaterElement([4, 1, 2], [1, 3, 4, 2])); // expected: [-1, 3, -1]`,
  },
  {
    id: "implement-queue-using-stacks",
    number: 41,
    title: "Implement Queue using Stacks",
    group: "Stack & Queue",
    difficulty: "Easy",
    statement:
      "Build a first-in, first-out queue (push, pop, peek, empty) using only two stacks. A stack only lets you add and remove at its top.",
    example: "push 1, push 2, peek, pop, push 3, pop, pop, empty → [1,1,2,3,true]",
    approach:
      "New items go onto the `inbox` stack. To take from the front, use the `outbox` stack; when it is empty, pour everything from `inbox` into it, which reverses the order so the oldest item ends up on top. Each item moves at most once, so operations are O(1) on average.",
    watch: [
      "pushes only ever touch `inbox`",
      "the first peek pours `inbox` into `outbox`, reversing the order",
      "pushing 3 lands in `inbox` while 2 waits in `outbox`",
      "`outbox` is refilled only when it runs empty",
    ],
    complexity: { time: "O(1) amortised", space: "O(n)" },
    code: `class MyQueue {
  constructor() {
    this.inbox = []; // new items go here
    this.outbox = []; // items come out from here, oldest on top
  }
  push(x) {
    this.inbox.push(x);
  }
  move() {
    // only refill when outbox is empty, or the order would break
    if (this.outbox.length === 0) {
      while (this.inbox.length) this.outbox.push(this.inbox.pop());
    }
  }
  pop() {
    this.move();
    return this.outbox.pop();
  }
  peek() {
    this.move();
    return this.outbox[this.outbox.length - 1];
  }
  empty() {
    return this.inbox.length === 0 && this.outbox.length === 0;
  }
}

const q = new MyQueue();
const results = [];
q.push(1);
q.push(2);
results.push(q.peek()); // 1 is at the front
results.push(q.pop()); // removes 1
q.push(3);
results.push(q.pop()); // 2
results.push(q.pop()); // 3
results.push(q.empty()); // true
console.log(results); // expected: [1, 1, 2, 3, true]`,
  },
  {
    id: "implement-stack-using-queues",
    number: 42,
    title: "Implement Stack using Queues",
    group: "Stack & Queue",
    difficulty: "Easy",
    statement:
      "Build a last-in, first-out stack (push, pop, top, empty) using only a queue. A queue only lets you add at the back and remove from the front.",
    example: "push 1, push 2, push 3, top, pop, pop, empty → [3,3,2,false]",
    approach:
      "After adding a new item at the back of the queue, rotate the older items: take each one off the front and add it to the back. That brings the newest item to the front, so pop and top just read the front of the queue.",
    watch: [
      "`queue[0]` is always the most recently pushed item",
      "on each push, the `for` loop rotates `size - 1` older items behind the new one",
      "pop and top never search: the answer is at the front",
      "push costs O(n); pop and top cost O(1)",
    ],
    complexity: { time: "O(n) push, O(1) pop", space: "O(n)" },
    code: `class MyStack {
  constructor() {
    this.queue = []; // front is queue[0]
  }
  push(x) {
    this.queue.push(x); // add at the back
    // move every older item behind x so x is at the front
    for (let i = 0; i < this.queue.length - 1; i++) {
      this.queue.push(this.queue.shift());
    }
  }
  pop() {
    return this.queue.shift(); // newest item is at the front
  }
  top() {
    return this.queue[0];
  }
  empty() {
    return this.queue.length === 0;
  }
}

const st = new MyStack();
const results = [];
st.push(1);
st.push(2);
st.push(3);
results.push(st.top()); // 3
results.push(st.pop()); // 3
results.push(st.pop()); // 2
results.push(st.empty()); // false: 1 is still inside
console.log(results); // expected: [3, 3, 2, false]`,
  },
  {
    id: "remove-all-adjacent-duplicates-in-string",
    number: 43,
    title: "Remove All Adjacent Duplicates In String",
    group: "Stack & Queue",
    difficulty: "Easy",
    statement:
      "Repeatedly delete two equal letters that sit next to each other, until no such pair is left. Return the final string.",
    example: 's = "abbaca" → "ca"',
    approach:
      "Use a stack as the string being built. For each letter, if it equals the letter on top of the stack, the two cancel: pop. Otherwise push it. Removing a pair can bring two new equal letters together, and the stack handles that automatically.",
    watch: [
      "`stack` is the answer so far, one letter per cell",
      "the second `b` cancels the first one",
      "then the second `a` meets the first `a` and they cancel too",
      "joining the stack at the end gives the answer",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function removeDuplicates(s) {
  const stack = []; // letters kept so far

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (stack.length && stack[stack.length - 1] === ch) {
      stack.pop(); // same as the last kept letter: both vanish
    } else {
      stack.push(ch); // keep it for now
    }
  }
  return stack.join("");
}

console.log(JSON.stringify(removeDuplicates("abbaca"))); // expected: "ca"`,
  },
  {
    id: "removing-stars-from-a-string",
    number: 44,
    title: "Removing Stars From a String",
    group: "Stack & Queue",
    difficulty: "Medium",
    statement:
      "Each `*` in the string deletes itself and the closest non-star character to its left. Return the string after all stars are processed.",
    example: 's = "leet**cod*e" → "lecoe"',
    approach:
      "Walk the string with a stack of kept characters. A normal character is pushed; a star pops the most recent kept character, which is exactly the closest one to its left. The stack at the end is the answer.",
    watch: [
      "letters are pushed onto `stack` one by one",
      "each `*` pops one letter: the two stars after `leet` remove `t` and `e`",
      "the star after `cod` removes `d`",
      "the stars themselves are never pushed",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function removeStars(s) {
  const stack = []; // characters that survive so far

  for (let i = 0; i < s.length; i++) {
    if (s[i] === "*") {
      stack.pop(); // a star erases the closest kept character
    } else {
      stack.push(s[i]);
    }
  }
  return stack.join("");
}

console.log(JSON.stringify(removeStars("leet**cod*e"))); // expected: "lecoe"`,
  },
  {
    id: "asteroid-collision",
    number: 45,
    title: "Asteroid Collision",
    group: "Stack & Queue",
    difficulty: "Medium",
    statement:
      "Asteroids move in a row: positive ones go right, negative ones go left, and the absolute value is the size. When two meet, the smaller explodes; equal sizes both explode. Return what is left.",
    example: "asteroids = [5,10,-5,-12,3] → [-12,3]",
    approach:
      "Keep a stack of surviving asteroids. A collision only happens when the top of the stack moves right and the new one moves left. Then compare sizes: pop smaller right-movers until the new one is destroyed, ties both, or no right-mover is left. If it survives, push it.",
    watch: [
      "`-5` meets `10` on top and is destroyed: `alive` becomes false",
      "`-12` pops `10` and then `5`, and survives",
      "`3` moves right, so it never collides with `-12` on its left",
      "the `while` loop runs only while the top moves right and `a` moves left",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function asteroidCollision(asteroids) {
  const stack = []; // survivors so far, left to right

  for (let i = 0; i < asteroids.length; i++) {
    const a = asteroids[i];
    let alive = true;
    // a collision: top moves right, a moves left
    while (alive && a < 0 && stack.length && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1];
      if (top < -a) {
        stack.pop(); // top is smaller: it explodes, a keeps going
      } else if (top === -a) {
        stack.pop(); // same size: both explode
        alive = false;
      } else {
        alive = false; // a is smaller: it explodes
      }
    }
    if (alive) stack.push(a);
  }
  return stack;
}

console.log(asteroidCollision([5, 10, -5, -12, 3])); // expected: [-12, 3]`,
  },

  // ───────────────────────────── Binary Search ─────────────────────────────
  {
    id: "binary-search",
    number: 46,
    title: "Binary Search",
    group: "Binary Search",
    difficulty: "Easy",
    statement:
      "Given a sorted array and a target, return the target's index, or -1 if it is not there. The search must take O(log n) time.",
    example: "nums = [-1,0,3,5,9,12,15], target = 9 → 4",
    approach:
      "Look at the middle element. If it is the target, done; if it is smaller, the target can only be in the right half, otherwise only in the left half. Each look throws away half of what is left, so only about log n looks are needed.",
    watch: [
      "`lo` and `hi` mark the part of the array still possible",
      "`mid` sits halfway between them",
      "`nums[mid] < target` moves `lo` past `mid`; otherwise `hi` moves before it",
      "if `lo` passes `hi`, the target is not in the array",
    ],
    complexity: { time: "O(log n)", space: "O(1)" },
    code: `function search(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) {
      return mid; // found it
    } else if (nums[mid] < target) {
      lo = mid + 1; // target is in the right half
    } else {
      hi = mid - 1; // target is in the left half
    }
  }
  return -1; // the range is empty: not there
}

const nums = [-1, 0, 3, 5, 9, 12, 15];
console.log(search(nums, 9)); // expected: 4`,
  },
  {
    id: "search-insert-position",
    number: 47,
    title: "Search Insert Position",
    group: "Binary Search",
    difficulty: "Easy",
    statement:
      "Given a sorted array of distinct numbers and a target, return the target's index if it is present. If not, return the index where it would be inserted to keep the array sorted.",
    example: "nums = [1,3,5,6,8], target = 7 → 4",
    approach:
      "Run a normal binary search. If the target is missing, the loop ends with `lo` just past `hi`, and `lo` is the first index whose value is bigger than the target: exactly where it belongs.",
    watch: [
      "`lo` and `hi` close in on the target's spot",
      "7 is never found, so the loop runs until `lo > hi`",
      "at the end `lo` points at 8, the first value bigger than 7",
      "returning `lo` gives the insert position",
    ],
    complexity: { time: "O(log n)", space: "O(1)" },
    code: `function searchInsert(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid; // already there
    if (nums[mid] < target) {
      lo = mid + 1; // goes somewhere to the right
    } else {
      hi = mid - 1; // goes somewhere to the left
    }
  }
  return lo; // first index with a bigger value
}

const nums = [1, 3, 5, 6, 8];
console.log(searchInsert(nums, 7)); // expected: 4`,
  },
  {
    id: "first-bad-version",
    number: 48,
    title: "First Bad Version",
    group: "Binary Search",
    difficulty: "Easy",
    statement:
      "Versions 1 to n were released, and once a version is bad every later one is bad too. Using the given `isBadVersion(v)` check, find the first bad version with as few checks as possible.",
    example: "n = 8, first bad = 5 → 5",
    approach:
      "The versions look like good, good, …, bad, bad: a sorted yes/no list. Binary search for the boundary: if `mid` is bad, the first bad one is `mid` or earlier, so keep it with `hi = mid`; if it is good, the answer is after it. When `lo` meets `hi`, that is the first bad version.",
    watch: [
      "`isBadVersion` is the only way to learn about a version",
      "a bad `mid` sets `hi = mid` (it may be the answer, so it stays in range)",
      "a good `mid` sets `lo = mid + 1`",
      "the loop stops when `lo === hi`, after about log n checks",
    ],
    complexity: { time: "O(log n)", space: "O(1)" },
    code: `// the API the problem gives you (here: versions 5 and up are bad)
const bad = 5;
function isBadVersion(v) {
  return v >= bad;
}

function firstBadVersion(n) {
  let lo = 1;
  let hi = n;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (isBadVersion(mid)) {
      hi = mid; // mid could be the first bad one: keep it
    } else {
      lo = mid + 1; // mid is good: the first bad is later
    }
  }
  return lo; // lo === hi: the first bad version
}

console.log(firstBadVersion(8)); // expected: 5`,
  },
  {
    id: "find-first-and-last-position",
    number: 49,
    title: "Find First and Last Position of Element in Sorted Array",
    group: "Binary Search",
    difficulty: "Medium",
    statement:
      "Given a sorted array and a target, return the first and last index where the target appears. If it is not there, return [-1, -1].",
    example: "nums = [5,7,7,8,8,8,10], target = 8 → [3,5]",
    approach:
      "Run binary search twice. When `mid` hits the target, do not stop: save it, then keep searching left for the first copy, or right for the last copy. Each search is O(log n), so the whole thing is too.",
    watch: [
      "`findBound` is called twice: once looking left, once looking right",
      "on a match, `found` saves `mid` and the search keeps going",
      "searching left, a match moves `hi`; searching right, it moves `lo`",
      "the last saved `found` in each call is the boundary",
    ],
    complexity: { time: "O(log n)", space: "O(1)" },
    code: `// goLeft = true finds the first copy, false finds the last copy
function findBound(nums, target, goLeft) {
  let lo = 0;
  let hi = nums.length - 1;
  let found = -1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) {
      found = mid; // a copy: remember it, but keep looking
      if (goLeft) hi = mid - 1;
      else lo = mid + 1;
    } else if (nums[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found;
}

function searchRange(nums, target) {
  return [findBound(nums, target, true), findBound(nums, target, false)];
}

const nums = [5, 7, 7, 8, 8, 8, 10];
console.log(searchRange(nums, 8)); // expected: [3, 5]`,
  },
  {
    id: "search-in-rotated-sorted-array",
    number: 50,
    title: "Search in Rotated Sorted Array",
    group: "Binary Search",
    difficulty: "Medium",
    statement:
      "A sorted array of distinct numbers was rotated at some unknown point, e.g. [0,1,2,4,5,6,7] became [4,5,6,7,0,1,2]. Find the target's index in O(log n) time, or return -1.",
    example: "nums = [4,5,6,7,0,1,2], target = 0 → 4",
    approach:
      "At any `mid`, at least one half is still properly sorted. Check which one by comparing `nums[lo]` with `nums[mid]`. If the target lies inside the sorted half's range, search there; otherwise search the other half.",
    watch: [
      "`nums[lo] <= nums[mid]` means the left half is sorted",
      "the target is tested against the sorted half's two ends",
      "first pass: left half 4..7 is sorted but 0 is not in it, so `lo` jumps right",
      "the search still halves the range each pass",
    ],
    complexity: { time: "O(log n)", space: "O(1)" },
    code: `function search(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;

    if (nums[lo] <= nums[mid]) {
      // left half lo..mid is sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      // right half mid..hi is sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}

const nums = [4, 5, 6, 7, 0, 1, 2];
console.log(search(nums, 0)); // expected: 4`,
  },
  {
    id: "find-minimum-in-rotated-sorted-array",
    number: 51,
    title: "Find Minimum in Rotated Sorted Array",
    group: "Binary Search",
    difficulty: "Medium",
    statement:
      "A sorted array of distinct numbers was rotated at an unknown point. Find its smallest value in O(log n) time.",
    example: "nums = [4,5,6,7,0,1,2] → 0",
    approach:
      "Compare `nums[mid]` with the last value of the range, `nums[hi]`. If it is bigger, the drop (and the minimum) is to the right of `mid`. Otherwise `mid..hi` is sorted, so the minimum is `mid` or to its left. When `lo` meets `hi`, it sits on the minimum.",
    watch: [
      "`nums[mid] > nums[hi]` means the drop is to the right: `lo = mid + 1`",
      "otherwise `hi = mid`: `mid` itself might be the minimum",
      "the range shrinks until `lo === hi`",
      "no target value is needed, only the comparison with `nums[hi]`",
    ],
    complexity: { time: "O(log n)", space: "O(1)" },
    code: `function findMin(nums) {
  let lo = 0;
  let hi = nums.length - 1;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] > nums[hi]) {
      lo = mid + 1; // the drop is after mid
    } else {
      hi = mid; // mid..hi is sorted: min is mid or earlier
    }
  }
  return nums[lo];
}

const nums = [4, 5, 6, 7, 0, 1, 2];
console.log(findMin(nums)); // expected: 0`,
  },
  {
    id: "search-a-2d-matrix",
    number: 52,
    title: "Search a 2D Matrix",
    group: "Binary Search",
    difficulty: "Medium",
    statement:
      "Each row of the matrix is sorted, and each row starts with a value bigger than the last value of the row above. Decide whether the target is in the matrix in O(log(m·n)) time.",
    example: "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3 → true",
    approach:
      "Read row by row, the matrix is one long sorted list of m·n values. Binary search over positions 0 to m·n − 1 and turn each `mid` into a cell: `row = Math.floor(mid / cols)`, `col = mid % cols`.",
    watch: [
      "`lo` and `hi` are positions in the flattened list, not cells",
      "`row` and `col` turn `mid` back into a cell",
      "the search moves just like plain Binary Search",
      "3 is found at row 0, col 1",
    ],
    complexity: { time: "O(log(m·n))", space: "O(1)" },
    code: `function searchMatrix(matrix, target) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  let lo = 0;
  let hi = rows * cols - 1; // positions in the flattened matrix

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const row = Math.floor(mid / cols); // which row mid falls in
    const col = mid % cols; // and which column
    const val = matrix[row][col];
    if (val === target) return true;
    if (val < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}

const matrix = [
  [1, 3, 5, 7],
  [10, 11, 16, 20],
  [23, 30, 34, 60],
];
console.log(searchMatrix(matrix, 3)); // expected: true`,
  },
  {
    id: "sqrt-x",
    number: 53,
    title: "Sqrt(x)",
    group: "Binary Search",
    difficulty: "Easy",
    statement:
      "Given a non-negative integer x, return its square root rounded down to a whole number. Do not use a built-in power or square-root function.",
    example: "x = 20 → 4",
    approach:
      "The answer is the largest whole number `mid` with `mid * mid <= x`. Binary search over 0..x: if `mid` squared fits, save it and try bigger; if it is too big, try smaller. The last saved value is the answer.",
    watch: [
      "`lo` and `hi` are candidate answers, not array indexes",
      "`mid * mid <= x` means `mid` is a possible answer: it goes into `ans`",
      "a square that is too big moves `hi` below `mid`",
      "`ans` holds 4 at the end, since 4·4 = 16 ≤ 20 but 5·5 = 25 > 20",
    ],
    complexity: { time: "O(log x)", space: "O(1)" },
    code: `function mySqrt(x) {
  let lo = 0;
  let hi = x;
  let ans = 0; // best answer found so far

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (mid * mid <= x) {
      ans = mid; // fits: remember it and try bigger
      lo = mid + 1;
    } else {
      hi = mid - 1; // too big: try smaller
    }
  }
  return ans;
}

console.log(mySqrt(20)); // expected: 4`,
  },
  {
    id: "valid-perfect-square",
    number: 54,
    title: "Valid Perfect Square",
    group: "Binary Search",
    difficulty: "Easy",
    statement:
      "Given a positive integer, decide whether it is a perfect square (the square of some whole number). Do not use a built-in square-root function.",
    example: "num = 49 → true",
    approach:
      "Binary search for a whole number whose square equals `num`. If `mid` squared is too small, go right; if too big, go left. Finding an exact match means it is a perfect square; an empty range means it is not.",
    watch: [
      "`sq` is `mid * mid`, compared with `num` each pass",
      "too small moves `lo` up, too big moves `hi` down",
      "`sq === num` happens at `mid = 7`",
      "the range only spans 1..num, so about log num passes",
    ],
    complexity: { time: "O(log n)", space: "O(1)" },
    code: `function isPerfectSquare(num) {
  let lo = 1;
  let hi = num;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const sq = mid * mid;
    if (sq === num) return true; // an exact square root
    if (sq < num) lo = mid + 1; // too small
    else hi = mid - 1; // too big
  }
  return false;
}

console.log(isPerfectSquare(49)); // expected: true`,
  },
  {
    id: "koko-eating-bananas",
    number: 55,
    title: "Koko Eating Bananas",
    group: "Binary Search",
    difficulty: "Medium",
    statement:
      "Koko has piles of bananas and h hours. Each hour she picks one pile and eats up to k bananas from it. Find the smallest whole speed k that lets her finish every pile within h hours.",
    example: "piles = [3,6,7,11], h = 8 → 4",
    approach:
      "Speed 1 is slowest and the biggest pile is the fastest speed ever needed. Faster speeds always take fewer hours, so binary search the speed: if `mid` finishes in time, it might be the answer, so search left keeping it; otherwise search right.",
    watch: [
      "`lo` and `hi` are speeds, not indexes",
      "`hours` adds up `Math.ceil(pile / mid)` for each pile",
      "`hours <= h` means fast enough: `hi = mid`",
      "too slow means `lo = mid + 1`; they meet at the slowest speed that works",
    ],
    complexity: { time: "O(n log m)", space: "O(1)" },
    code: `function minEatingSpeed(piles, h) {
  let lo = 1; // slowest possible speed
  let hi = Math.max(...piles); // eating a whole pile each hour

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    // hours needed at speed mid
    let hours = 0;
    for (let i = 0; i < piles.length; i++) {
      hours += Math.ceil(piles[i] / mid);
    }
    if (hours <= h) {
      hi = mid; // fast enough: try slower, but keep mid
    } else {
      lo = mid + 1; // too slow: must eat faster
    }
  }
  return lo;
}

console.log(minEatingSpeed([3, 6, 7, 11], 8)); // expected: 4`,
  },
];
