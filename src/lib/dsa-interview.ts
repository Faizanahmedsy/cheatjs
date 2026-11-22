import type { Snippet } from './cheatsheets';

const mk = (
  category: string,
  title: string,
  description: string,
  code: string,
  pros: string[],
  cons: string[],
  visualization?: string
): Snippet => ({ title, category, description, code: code.trim(), language: 'javascript', pros, cons, visualization });

export const ALGORITHM_CATEGORIES = [
  'Searching',
  'Sorting',
  'Arrays & Strings',
  'Linked List',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Backtracking',
  'Greedy & Heap',
  'Bits & Math',
] as const;

export const PATTERN_CATEGORIES = ['Array patterns', 'Search & intervals', 'Graph & tree patterns', 'DP & recursion'] as const;

export const INTERVIEW_ALGORITHMS: Snippet[] = [
  // ---------------- Searching ----------------
  mk('Searching', 'Lower Bound / Upper Bound', 'Find the FIRST position where a value could be inserted (lower bound) or the position just after the last copy (upper bound). Also gives first/last occurrence of a duplicate. A very common interview building block.',
`// first index with arr[i] >= target
function lowerBound(arr, target) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
// first index with arr[i] > target
function upperBound(arr, target) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] <= target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
const a = [1, 2, 2, 2, 5, 8];
console.log(lowerBound(a, 2)); // 1 (first 2)
console.log(upperBound(a, 2) - 1); // 3 (last 2)
console.log(upperBound(a, 2) - lowerBound(a, 2)); // 3 copies`,
    ['O(log n) even with duplicates.', 'One template solves first/last/count/insert position.'], ['Needs sorted data.', 'Easy to mix up < and <= between the two versions.']),

  mk('Searching', 'Search in Rotated Sorted Array', 'A sorted array was rotated (like [4,5,6,7,0,1,2]). One half around the middle is always sorted. Check which half is sorted, then decide if the target lies inside it.',
`function searchRotated(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      // left half is sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      // right half is sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}
console.log(searchRotated([4, 5, 6, 7, 0, 1, 2], 0)); // 4`,
    ['O(log n) instead of O(n).', 'Same idea finds the minimum of a rotated array.'], ['Duplicates break the simple check (can degrade to O(n)).', 'Boundary conditions are tricky.']),

  mk('Searching', 'Binary Search on Answer', 'When the answer is a number and you can test "is X enough?" quickly, binary search the answer itself. Example: Koko eating bananas, ship packages in D days, split array largest sum.',
`// Smallest speed k so Koko finishes all piles within h hours
function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles);
  const canFinish = (k) => {
    let hours = 0;
    for (const p of piles) hours += Math.ceil(p / k);
    return hours <= h;
  };
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (canFinish(mid)) hi = mid; // mid works, try smaller
    else lo = mid + 1;            // too slow
  }
  return lo;
}
console.log(minEatingSpeed([3, 6, 7, 11], 8)); // 4`,
    ['Turns hard optimisation into a yes/no check.', 'O(n log range) is fast.'], ['Needs a monotonic yes/no check (once true, stays true).', 'Choosing lo and hi correctly takes practice.']),

  mk('Searching', 'Find Peak Element', 'A peak is bigger than both neighbours. Compare the middle with its right neighbour: if the right is bigger, a peak must exist on the right, else on the left (or at mid). Works even on unsorted data.',
`function findPeak(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] < nums[mid + 1]) lo = mid + 1; // climb up
    else hi = mid;                               // peak at mid or left
  }
  return lo; // index of a peak
}
console.log(findPeak([1, 3, 20, 4, 1, 0])); // 2`,
    ['O(log n) on unsorted data.', 'Very short code.'], ['Returns just one of possibly many peaks.', 'Needs neighbours to differ.']),

  // ---------------- Sorting ----------------
  mk('Sorting', 'Quick Sort', 'Pick a pivot, put smaller values on its left and bigger on its right, then sort both sides the same way. Average O(n log n), sorts in place and is usually the fastest in practice.',
`function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr;
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  quickSort(arr, lo, i - 1);
  quickSort(arr, i + 1, hi);
  return arr;
}
console.log(quickSort([9, 3, 7, 1, 8, 2]));`,
    ['Average O(n log n).', 'In place, small memory.'], ['Worst case O(n²) with bad pivots (sorted input).', 'Not stable.']),

  mk('Sorting', 'Merge Sort (with the merge step)', 'Split in half, sort each half, then merge two sorted lists. Always O(n log n) and stable. The merge step is also used to merge two sorted arrays or lists and to count inversions.',
`function merge(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    out.push(a[i] <= b[j] ? a[i++] : b[j++]);
  }
  return out.concat(a.slice(i), b.slice(j));
}
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = arr.length >> 1;
  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)));
}
console.log(mergeSort([5, 2, 9, 1, 5, 6]));`,
    ['Guaranteed O(n log n).', 'Stable, great for linked lists.'], ['Needs O(n) extra memory.', 'Slower than quick sort on arrays in practice.']),

  mk('Sorting', 'Heap Sort', 'Build a max-heap, then repeatedly swap the biggest value to the end and fix the heap. O(n log n) worst case with no extra memory.',
`function heapSort(arr) {
  const n = arr.length;
  const sift = (i, size) => {
    while (true) {
      let big = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < size && arr[l] > arr[big]) big = l;
      if (r < size && arr[r] > arr[big]) big = r;
      if (big === i) return;
      [arr[i], arr[big]] = [arr[big], arr[i]];
      i = big;
    }
  };
  for (let i = (n >> 1) - 1; i >= 0; i--) sift(i, n); // build heap
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    sift(0, end);
  }
  return arr;
}
console.log(heapSort([4, 10, 3, 5, 1]));`,
    ['O(n log n) worst case.', 'In place.'], ['Not stable.', 'Poor cache use, slower than quick sort.']),

  mk('Sorting', 'Counting Sort', 'When values are small whole numbers, count how many times each appears, then rebuild. No comparisons, so it runs in O(n + k) where k is the value range.',
`function countingSort(arr, max) {
  const count = new Array(max + 1).fill(0);
  for (const v of arr) count[v]++;
  const out = [];
  for (let v = 0; v <= max; v++) {
    while (count[v]-- > 0) out.push(v);
  }
  return out;
}
console.log(countingSort([4, 2, 2, 8, 3, 3, 1], 8));`,
    ['Linear time for small ranges.', 'Very simple.'], ['Wastes memory if the range is large.', 'Only works for integers.']),

  mk('Sorting', 'Quickselect (Kth Largest)', 'Find the kth largest value without fully sorting. Partition like quick sort but only continue into the side that holds the answer. Average O(n).',
`function kthLargest(nums, k) {
  const target = nums.length - k; // index in sorted order
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const pivot = nums[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (nums[j] < pivot) { [nums[i], nums[j]] = [nums[j], nums[i]]; i++; }
    }
    [nums[i], nums[hi]] = [nums[hi], nums[i]];
    if (i === target) return nums[i];
    if (i < target) lo = i + 1;
    else hi = i - 1;
  }
}
console.log(kthLargest([3, 2, 1, 5, 6, 4], 2)); // 5`,
    ['Average O(n), faster than sorting.', 'In place.'], ['Worst case O(n²).', 'Changes the input array.']),

  // ---------------- Arrays & Strings ----------------
  mk('Arrays & Strings', 'Two Sum (Hash Map)', 'Find two numbers that add up to a target. Keep a map of numbers already seen. For each number, check if its partner (target - number) is in the map. The #1 interview question.',
`function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]`,
    ['O(n) time in one pass.', 'Works on unsorted data.'], ['Uses O(n) extra memory.', 'Two pointers is better for sorted input.']),

  mk('Arrays & Strings', "Kadane's Algorithm (Max Subarray)", 'Largest sum of a continuous part of an array. Keep a running sum. If it drops below zero, throw it away and start fresh at the next number.',
`function maxSubArray(nums) {
  let current = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    best = Math.max(best, current);
  }
  return best;
}
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6`,
    ['O(n) time, O(1) memory.', 'Short and famous.'], ['Needs a small tweak to return the subarray itself.', 'All-negative arrays need the right start value.']),

  mk('Arrays & Strings', 'Prefix Sum + Subarray Sum Equals K', 'A prefix sum is the running total up to each index. A subarray from i to j has sum k when prefix[j] - prefix[i-1] = k. Store counts of prefix sums in a map to count such subarrays in O(n).',
`function subarraySum(nums, k) {
  const count = new Map([[0, 1]]); // prefix sum -> how many times
  let sum = 0, result = 0;
  for (const n of nums) {
    sum += n;
    result += count.get(sum - k) || 0;
    count.set(sum, (count.get(sum) || 0) + 1);
  }
  return result;
}
console.log(subarraySum([1, 1, 1], 2)); // 2

// range sum query with a prefix array
const prefix = [0];
[3, 1, 4, 1, 5].forEach((v, i) => prefix.push(prefix[i] + v));
const rangeSum = (l, r) => prefix[r + 1] - prefix[l];
console.log(rangeSum(1, 3)); // 6`,
    ['Handles negative numbers (unlike sliding window).', 'Range sums in O(1) after O(n) setup.'], ['Needs O(n) extra memory.', 'Idea of "sum - k" is not obvious at first.']),

  mk('Arrays & Strings', 'Dutch National Flag (Sort Colors)', 'Sort an array of 0s, 1s and 2s in one pass using three pointers: low, mid, high. Also the idea behind 3-way quick sort partition.',
`function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++; mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    }
  }
  return nums;
}
console.log(sortColors([2, 0, 2, 1, 1, 0])); // [0,0,1,1,2,2]`,
    ['One pass, O(n), in place.', 'No counting needed.'], ['Hard to remember the "do not move mid after swapping with high" rule.', 'Only for few distinct values.'], 'ArrayAlgo'),

  mk('Arrays & Strings', 'Majority Element (Boyer-Moore Vote)', 'Find the value that appears more than n/2 times. Keep a candidate and a count: same value adds one, different value removes one. The majority survives.',
`function majorityElement(nums) {
  let candidate = null, count = 0;
  for (const n of nums) {
    if (count === 0) candidate = n;
    count += n === candidate ? 1 : -1;
  }
  return candidate;
}
console.log(majorityElement([2, 2, 1, 1, 1, 2, 2])); // 2`,
    ['O(n) time, O(1) memory.', 'Beats hash map counting on memory.'], ['Only valid if a majority is guaranteed.', 'Needs a second pass to verify otherwise.']),

  mk('Arrays & Strings', 'Product of Array Except Self', 'For every index, the product of all other numbers, without division. Multiply everything on the left, then everything on the right, using two passes.',
`function productExceptSelf(nums) {
  const n = nums.length;
  const out = new Array(n).fill(1);
  let left = 1;
  for (let i = 0; i < n; i++) { out[i] = left; left *= nums[i]; }
  let right = 1;
  for (let i = n - 1; i >= 0; i--) { out[i] *= right; right *= nums[i]; }
  return out;
}
console.log(productExceptSelf([1, 2, 3, 4])); // [24,12,8,6]`,
    ['O(n) time, O(1) extra memory (besides output).', 'No division, safe with zeros.'], ['Two passes feel unusual at first.', 'Easy to mix left and right order.']),

  mk('Arrays & Strings', 'Merge Intervals', 'Sort intervals by start. Walk once: if the next interval starts before the last merged one ends, extend it; otherwise start a new one. Used in calendar and meeting room questions.',
`function mergeIntervals(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [start, end] of intervals) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}
console.log(mergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]]));
// [[1,6],[8,10],[15,18]]`,
    ['Simple and fast: O(n log n).', 'Pattern reused in many problems.'], ['Needs sorting first.', 'Touching intervals ([1,2],[2,3]) depend on < vs <=.'], 'Intervals'),

  mk('Arrays & Strings', 'Trapping Rain Water', 'How much water stays between bars. Water above a bar = min(tallest bar to its left, tallest to its right) - bar height. Two pointers do it in one pass.',
`function trap(height) {
  let l = 0, r = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (l < r) {
    if (height[l] < height[r]) {
      leftMax = Math.max(leftMax, height[l]);
      water += leftMax - height[l];
      l++;
    } else {
      rightMax = Math.max(rightMax, height[r]);
      water += rightMax - height[r];
      r--;
    }
  }
  return water;
}
console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])); // 6`,
    ['O(n) time, O(1) memory.', 'Classic two-pointer showcase.'], ['The "move the smaller side" logic needs explaining.', 'Stack solution is a different style.']),

  mk('Arrays & Strings', 'Valid Parentheses (Stack)', 'Check that every bracket closes in the right order. Push opening brackets on a stack. For a closing bracket, the top of the stack must be its partner.',
`function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}
console.log(isValid('{[()]}')); // true
console.log(isValid('(]'));     // false`,
    ['O(n) time.', 'The standard stack example.'], ['O(n) memory in the worst case.', 'Must handle leftover openers at the end.']),

  mk('Arrays & Strings', 'Monotonic Stack: Next Greater Element', 'Keep a stack of values still waiting for a bigger one. When a bigger value arrives, pop and answer them. Each item is pushed and popped once, so O(n). Also solves daily temperatures and largest rectangle.',
`function nextGreater(nums) {
  const result = new Array(nums.length).fill(-1);
  const stack = []; // indexes waiting for a bigger value
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {
      result[stack.pop()] = nums[i];
    }
    stack.push(i);
  }
  return result;
}
console.log(nextGreater([4, 5, 2, 10, 8])); // [5,10,10,-1,-1]`,
    ['O(n) instead of O(n²).', 'Pattern for many "next bigger/smaller" questions.'], ['Takes time to see when to use it.', 'Stack holds indexes, easy to confuse with values.'], 'ArrayAlgo'),

  mk('Arrays & Strings', 'Longest Substring Without Repeating Characters', 'Sliding window over the string. Move the right end forward. If a letter repeats, jump the left end past its previous position. Track the longest window.',
`function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (lastSeen.has(ch) && lastSeen.get(ch) >= left) {
      left = lastSeen.get(ch) + 1;
    }
    lastSeen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
console.log(lengthOfLongestSubstring('abcabcbb')); // 3`,
    ['O(n) time in one pass.', 'Template for many window problems.'], ['Off-by-one on the left pointer is common.', 'Needs a map or set of 128/26 characters.']),

  mk('Arrays & Strings', 'Group Anagrams / Valid Anagram', 'Two words are anagrams if their sorted letters match. Use the sorted word (or a letter count) as a map key to group them.',
`function isAnagram(a, b) {
  if (a.length !== b.length) return false;
  const count = {};
  for (const ch of a) count[ch] = (count[ch] || 0) + 1;
  for (const ch of b) {
    if (!count[ch]) return false;
    count[ch]--;
  }
  return true;
}
function groupAnagrams(words) {
  const groups = new Map();
  for (const w of words) {
    const key = [...w].sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return [...groups.values()];
}
console.log(isAnagram('listen', 'silent')); // true
console.log(groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']));`,
    ['Easy to explain and code.', 'Letter-count key makes grouping O(n·k).'], ['Sorting each word adds a log factor.', 'Counting assumes a small alphabet.']),

  mk('Arrays & Strings', 'Longest Palindromic Substring (Expand Around Center)', 'Every palindrome mirrors around a center. Try each letter (and each gap between letters) as a center and expand outward while both sides match. O(n²), simple, no table.',
`function longestPalindrome(s) {
  let start = 0, maxLen = 0;
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    const len = r - l - 1;
    if (len > maxLen) { maxLen = len; start = l + 1; }
  };
  for (let i = 0; i < s.length; i++) {
    expand(i, i);     // odd length
    expand(i, i + 1); // even length
  }
  return s.slice(start, start + maxLen);
}
console.log(longestPalindrome('babad')); // "bab"`,
    ['Easy to write in an interview.', 'O(1) extra memory.'], ['O(n²) time.', 'Manacher is O(n) but much harder.']),

  mk('Arrays & Strings', 'KMP String Search', 'Find a pattern inside text without re-checking letters. Build a table of how much of the pattern can be reused after a mismatch. O(n + m).',
`function buildLps(p) {
  const lps = [0];
  let len = 0;
  for (let i = 1; i < p.length; ) {
    if (p[i] === p[len]) lps[i++] = ++len;
    else if (len) len = lps[len - 1];
    else lps[i++] = 0;
  }
  return lps;
}
function kmp(text, pattern) {
  const lps = buildLps(pattern);
  let j = 0;
  for (let i = 0; i < text.length; i++) {
    while (j && text[i] !== pattern[j]) j = lps[j - 1];
    if (text[i] === pattern[j]) j++;
    if (j === pattern.length) return i - j + 1;
  }
  return -1;
}
console.log(kmp('ababcabcabababd', 'ababd')); // 10`,
    ['Linear time, never goes backwards in the text.', 'Good for repeated searching.'], ['The prefix table is hard to explain.', 'indexOf is enough in real code.']),

  // ---------------- Linked List ----------------
  mk('Linked List', 'Reverse a Linked List', 'Walk the list and flip each arrow to point backwards. Keep three pointers: previous, current and a saved next. Asked in almost every interview.',
`class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}
function reverseList(head) {
  let prev = null, cur = head;
  while (cur) {
    const next = cur.next; // save
    cur.next = prev;       // flip
    prev = cur;            // move
    cur = next;
  }
  return prev; // new head
}
const list = new ListNode(1, new ListNode(2, new ListNode(3)));
let n = reverseList(list);
while (n) { console.log(n.val); n = n.next; } // 3 2 1`,
    ['O(n) time, O(1) memory.', 'Core step for palindrome list and reverse-k-group.'], ['Losing the next pointer is the classic bug.', 'Recursive version uses O(n) stack.'], 'LinkedListReverse'),

  mk('Linked List', 'Merge Two Sorted Lists', 'Use a dummy head node. Compare the fronts of both lists and attach the smaller one. Attach whatever is left at the end.',
`class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}
function mergeTwoLists(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) { tail.next = a; a = a.next; }
    else { tail.next = b; b = b.next; }
    tail = tail.next;
  }
  tail.next = a || b;
  return dummy.next;
}`,
    ['O(n + m) time, O(1) memory.', 'Dummy node removes edge cases.'], ['Pointer mistakes lose nodes.', 'Needs care with an empty list.']),

  mk('Linked List', 'Find Middle & Remove Nth From End', 'Slow/fast pointers: when fast reaches the end, slow is in the middle. For "nth from end", move fast n steps ahead first, then move both together.',
`function middleNode(head) {
  let slow = head, fast = head;
  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }
  return slow;
}
function removeNthFromEnd(head, n) {
  const dummy = { next: head };
  let fast = dummy, slow = dummy;
  for (let i = 0; i < n; i++) fast = fast.next;
  while (fast.next) { fast = fast.next; slow = slow.next; }
  slow.next = slow.next.next; // skip the node
  return dummy.next;
}`,
    ['One pass, O(1) memory.', 'Works without knowing the length.'], ['Dummy node needed to remove the head.', 'Gap size mistakes are common.']),

  mk('Linked List', 'LRU Cache', 'A cache that keeps the most recently used items and removes the least recently used when full. A Map keeps insertion order in JavaScript, so re-inserting a key moves it to the "newest" end. get and put are O(1).',
`class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);      // move to newest
    this.map.set(key, value);
    return value;
  }
  put(key, value) {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest); // evict least recent
    }
  }
}
const c = new LRUCache(2);
c.put(1, 1); c.put(2, 2); c.get(1); c.put(3, 3);
console.log(c.get(2)); // -1 (evicted)`,
    ['O(1) get and put.', 'Short using Map order.'], ['Interviewers may want a manual doubly linked list + hash map.', 'Memory grows up to capacity.'], 'LRUCache'),

  // ---------------- Trees ----------------
  mk('Trees', 'Tree Traversals (Recursive + Iterative)', 'Inorder (left, node, right), preorder (node, left, right), postorder (left, right, node). On a BST, inorder gives sorted order. Iterative versions use an explicit stack.',
`class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function inorder(root, out = []) {
  if (!root) return out;
  inorder(root.left, out);
  out.push(root.val);
  inorder(root.right, out);
  return out;
}
function inorderIterative(root) {
  const out = [], stack = [];
  let cur = root;
  while (cur || stack.length) {
    while (cur) { stack.push(cur); cur = cur.left; }
    cur = stack.pop();
    out.push(cur.val);
    cur = cur.right;
  }
  return out;
}
const t = new TreeNode(2, new TreeNode(1), new TreeNode(3));
console.log(inorder(t), inorderIterative(t)); // [1,2,3] [1,2,3]`,
    ['Foundation for most tree problems.', 'Iterative form avoids stack overflow.'], ['Recursion depth can be large on skewed trees.', 'Iterative postorder is tricky.']),

  mk('Trees', 'Level Order Traversal (BFS)', 'Visit a tree level by level using a queue. Process exactly the number of nodes that were in the queue at the start of each level.',
`function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length) {
    const size = queue.length;
    const level = [];
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}`,
    ['Natural for "by level" questions (right-side view, zigzag, min depth).', 'O(n) time.'], ['Queue can hold a whole level (O(width)).', 'Array.shift is O(n), use an index for huge trees.']),

  mk('Trees', 'Maximum Depth, Diameter and Invert Tree', 'Three tiny recursions every candidate should know. Depth = 1 + max(left, right). Diameter = the longest path through any node. Invert = swap left and right at every node.',
`function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
function diameter(root) {
  let best = 0;
  const height = (node) => {
    if (!node) return 0;
    const l = height(node.left), r = height(node.right);
    best = Math.max(best, l + r); // path through this node
    return 1 + Math.max(l, r);
  };
  height(root);
  return best;
}
function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  return root;
}`,
    ['Each one is 3-6 lines.', 'Teaches the "return a value up, update a global" trick.'], ['Deep recursion on skewed trees.', 'Diameter needs the side variable, easy to forget.']),

  mk('Trees', 'Validate Binary Search Tree', 'Every node must stay inside a (min, max) range inherited from its ancestors. Checking only the direct children is a classic mistake.',
`function isValidBST(node, min = -Infinity, max = Infinity) {
  if (!node) return true;
  if (node.val <= min || node.val >= max) return false;
  return (
    isValidBST(node.left, min, node.val) &&
    isValidBST(node.right, node.val, max)
  );
}`,
    ['O(n) time, very short.', 'Teaches passing bounds down.'], ['Duplicates depend on the problem rules.', 'Infinity bounds fail if values can be extreme.']),

  mk('Trees', 'Lowest Common Ancestor', 'The lowest node that has both targets below it. In a plain tree: if p and q are found in different subtrees, the current node is the answer. In a BST just walk down using the values.',
`function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root; // p and q on different sides
  return left || right;
}
// BST version
function lcaBST(root, p, q) {
  while (root) {
    if (p.val < root.val && q.val < root.val) root = root.left;
    else if (p.val > root.val && q.val > root.val) root = root.right;
    else return root;
  }
  return null;
}`,
    ['O(n) for any tree, O(h) for a BST.', 'Frequently asked at big companies.'], ['Assumes both nodes exist.', 'Hard to see why returning early is correct.']),

  // ---------------- Graphs ----------------
  mk('Graphs', 'Breadth-First Search (BFS)', 'Explore a graph level by level with a queue. Finds the shortest path in an unweighted graph. Run the animation to see the queue change.',
`function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const next of graph[node]) {
      if (!visited.has(next)) {
        visited.add(next);   // mark when adding, not when popping
        queue.push(next);
      }
    }
  }
  return order;
}
const graph = { A: ['B', 'C'], B: ['A', 'D'], C: ['A', 'D'], D: ['B', 'C'] };
console.log(bfs(graph, 'A')); // [A, B, C, D]`,
    ['Shortest path in unweighted graphs.', 'O(V + E).'], ['Queue can get large.', 'Does not handle weights.'], 'GraphAlgo'),

  mk('Graphs', 'Depth-First Search (DFS)', 'Go as deep as possible along one path, then backtrack. Uses recursion or a stack. Good for connectivity, cycles, paths and counting components.',
`function dfs(graph, node, visited = new Set(), order = []) {
  visited.add(node);
  order.push(node);
  for (const next of graph[node]) {
    if (!visited.has(next)) dfs(graph, next, visited, order);
  }
  return order;
}
const graph = { A: ['B', 'C'], B: ['A', 'D'], C: ['A', 'D'], D: ['B', 'C'] };
console.log(dfs(graph, 'A')); // [A, B, D, C]`,
    ['Short and natural with recursion.', 'O(V + E), small memory on wide graphs.'], ['Deep graphs can overflow the call stack.', 'Does not give shortest paths.'], 'GraphAlgo'),

  mk('Graphs', 'Number of Islands (Grid DFS)', 'A grid is a graph. Each time you find land that has not been seen, count one island and flood-fill the whole island so it is not counted again.',
`function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  let count = 0;
  const sink = (r, c) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0'; // mark visited
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') { count++; sink(r, c); }
    }
  }
  return count;
}
console.log(numIslands([
  ['1', '1', '0'],
  ['0', '1', '0'],
  ['0', '0', '1'],
])); // 2`,
    ['No separate visited set needed.', 'Same template: flood fill, rotting oranges, surrounded regions.'], ['Changes the input grid.', 'Recursion can overflow on huge grids.']),

  mk('Graphs', 'Topological Sort (Kahn)', 'Order tasks so every prerequisite comes first. Repeatedly take nodes with no incoming edges. If some nodes are left over, there is a cycle. Used for course schedule problems.',
`function topoSort(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  const indegree = new Array(n).fill(0);
  for (const [a, b] of edges) { graph[a].push(b); indegree[b]++; }
  const queue = [];
  for (let i = 0; i < n; i++) if (indegree[i] === 0) queue.push(i);
  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const next of graph[node]) {
      if (--indegree[next] === 0) queue.push(next);
    }
  }
  return order.length === n ? order : []; // [] means cycle
}
console.log(topoSort(4, [[0, 1], [0, 2], [1, 3], [2, 3]])); // [0,1,2,3]`,
    ['Detects cycles for free.', 'O(V + E).'], ['Only works on directed graphs.', 'More than one valid order may exist.'], 'GraphAlgo'),

  mk('Graphs', "Dijkstra's Shortest Path", 'Shortest path from one node to all others when edges have non-negative weights. Always settle the closest unsettled node, then try to improve its neighbours. A min-heap makes it fast.',
`function dijkstra(graph, start) {
  // graph: { A: [['B', 4], ['C', 2]], ... }
  const dist = {};
  for (const node in graph) dist[node] = Infinity;
  dist[start] = 0;
  const done = new Set();
  while (done.size < Object.keys(graph).length) {
    // pick closest unsettled node (use a min-heap for big graphs)
    let node = null;
    for (const n in dist) {
      if (!done.has(n) && (node === null || dist[n] < dist[node])) node = n;
    }
    if (dist[node] === Infinity) break;
    done.add(node);
    for (const [next, w] of graph[node]) {
      if (dist[node] + w < dist[next]) dist[next] = dist[node] + w;
    }
  }
  return dist;
}
const g = { A: [['B', 4], ['C', 2]], B: [['D', 5]], C: [['B', 1], ['D', 8]], D: [] };
console.log(dijkstra(g, 'A')); // { A: 0, B: 3, C: 2, D: 8 }`,
    ['Fast: O((V + E) log V) with a heap.', 'Works on any weighted graph with no negative edges.'], ['Fails with negative weights (use Bellman-Ford).', 'JS has no built-in heap.'], 'GraphAlgo'),

  mk('Graphs', 'Union-Find (Disjoint Set)', 'Track which items belong to the same group. find() gives the group leader, union() merges two groups. With path compression and union by size, each operation is almost O(1). Used for connected components, cycle detection and Kruskal.',
`class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
  }
  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]); // compress
    return this.parent[x];
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false; // already connected
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    return true;
  }
}
const uf = new UnionFind(5);
uf.union(0, 1); uf.union(1, 2);
console.log(uf.find(0) === uf.find(2)); // true`,
    ['Near-constant time per operation.', 'Easy cycle detection: union returns false.'], ['Cannot split groups apart.', 'Only answers "same group?" questions.'], 'UnionFind'),

  mk('Graphs', 'Cycle Detection (Directed and Undirected)', 'Undirected: DFS and meet a visited node that is not your parent. Directed: track nodes currently on the recursion path; meeting one of them means a cycle.',
`// Directed graph: three states 0 = new, 1 = on path, 2 = done
function hasCycleDirected(graph) {
  const state = {};
  const visit = (n) => {
    if (state[n] === 1) return true;
    if (state[n] === 2) return false;
    state[n] = 1;
    for (const next of graph[n] || []) if (visit(next)) return true;
    state[n] = 2;
    return false;
  };
  return Object.keys(graph).some(visit);
}
console.log(hasCycleDirected({ a: ['b'], b: ['c'], c: ['a'] })); // true

// Undirected graph
function hasCycleUndirected(graph) {
  const seen = new Set();
  const dfs = (n, parent) => {
    seen.add(n);
    for (const next of graph[n]) {
      if (next === parent) continue;
      if (seen.has(next) || dfs(next, n)) return true;
    }
    return false;
  };
  return Object.keys(graph).some((n) => !seen.has(n) && dfs(n, null));
}`,
    ['O(V + E).', 'Same idea checks "can I finish all courses?".'], ['Directed and undirected need different logic.', 'Forgetting the parent check gives false cycles.']),

  mk('Graphs', 'Minimum Spanning Tree (Kruskal)', 'Connect all nodes with the smallest total edge weight and no cycles. Sort edges by weight and add each edge unless it would create a cycle (check with Union-Find).',
`function kruskal(n, edges) {
  // edges: [u, v, weight]
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  edges.sort((a, b) => a[2] - b[2]);
  let total = 0;
  const used = [];
  for (const [u, v, w] of edges) {
    const ru = find(u), rv = find(v);
    if (ru !== rv) {
      parent[ru] = rv;
      total += w;
      used.push([u, v, w]);
    }
  }
  return { total, used };
}
console.log(kruskal(4, [[0, 1, 1], [1, 2, 4], [0, 2, 3], [2, 3, 2]]).total); // 6`,
    ['Simple greedy idea.', 'O(E log E).'], ['Needs Union-Find as a helper.', 'Only for undirected weighted graphs.']),

  // ---------------- Dynamic Programming ----------------
  mk('Dynamic Programming', 'Climbing Stairs / Fibonacci (1D DP)', 'To reach step n you came from step n-1 or n-2, so ways(n) = ways(n-1) + ways(n-2). Keep only the last two values for O(1) memory. This is the "hello world" of DP.',
`function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}
console.log(climbStairs(5)); // 8`,
    ['O(n) time, O(1) memory.', 'Template for house robber, min cost stairs, decode ways.'], ['Looks too easy, the real skill is defining the state.', 'Large n needs BigInt.']),

  mk('Dynamic Programming', 'House Robber', 'You cannot rob two neighbouring houses. At each house choose: skip it (keep the best so far) or rob it (its money + best from two houses ago).',
`function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const money of nums) {
    const take = prev2 + money;
    prev2 = prev1;
    prev1 = Math.max(prev1, take);
  }
  return prev1;
}
console.log(rob([2, 7, 9, 3, 1])); // 12`,
    ['O(n) time, O(1) memory.', 'Teaches the "take or skip" choice.'], ['Circular version (house robber II) needs two runs.', 'State definition must be clear.']),

  mk('Dynamic Programming', 'Coin Change (Min Coins)', 'Fewest coins to make an amount. dp[i] = 1 + the best dp[i - coin] over all coins. Greedy fails here (coins 1,3,4 for amount 6), DP does not. Watch the table fill.',
`function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
console.log(coinChange([1, 3, 4], 6)); // 2 (3 + 3)

// number of ways (order does not matter)
function coinWays(coins, amount) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) dp[i] += dp[i - coin];
  }
  return dp[amount];
}`,
    ['O(amount × coins).', 'Teaches unbounded knapsack.'], ['Greedy gives wrong answers.', 'Counting ways: loop order matters.'], 'DPTable'),

  mk('Dynamic Programming', '0/1 Knapsack', 'Pick items with weights and values to maximise value without passing the bag capacity. Each item is taken at most once. Each cell: best of skipping the item or taking it.',
`function knapsack(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    // go backwards so each item is used once
    for (let c = capacity; c >= weights[i]; c--) {
      dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}
console.log(knapsack([1, 3, 4], [15, 20, 30], 6)); // 45`,
    ['O(n × capacity) time, O(capacity) memory.', 'Base of subset sum and partition problems.'], ['Pseudo-polynomial: slow for huge capacities.', 'Loop direction mistake turns it into unbounded.'], 'DPTable'),

  mk('Dynamic Programming', 'Longest Common Subsequence (LCS)', 'Longest sequence of letters that appear in both strings in the same order (not necessarily together). If letters match, take the diagonal + 1. Otherwise take the best of up and left.',
`function lcs(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}
console.log(lcs('ABCBD', 'BDCB')); // 3`,
    ['Classic 2D DP, appears in diff tools.', 'O(n × m).'], ['O(n × m) memory unless optimised.', 'Subsequence is not substring.'], 'DPTable'),

  mk('Dynamic Programming', 'Edit Distance', 'Minimum inserts, deletes or replaces to turn one word into another. If letters match copy the diagonal, else 1 + min(replace, delete, insert).',
`function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}
console.log(editDistance('horse', 'ros')); // 3`,
    ['Used in spell check and search.', 'Shows how three choices combine in a table.'], ['O(n × m) time and memory.', 'Base row and column are easy to forget.'], 'DPTable'),

  mk('Dynamic Programming', 'Longest Increasing Subsequence (LIS)', 'Longest list of numbers (not necessarily adjacent) that keeps increasing. O(n²) DP is easy. The O(n log n) trick keeps the smallest possible tail for each length and uses binary search.',
`// O(n^2) DP
function lisSlow(nums) {
  const dp = new Array(nums.length).fill(1);
  for (let i = 1; i < nums.length; i++)
    for (let j = 0; j < i; j++)
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
  return Math.max(...dp);
}
// O(n log n) with tails + binary search
function lisFast(nums) {
  const tails = [];
  for (const n of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < n) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = n;
  }
  return tails.length;
}
console.log(lisFast([10, 9, 2, 5, 3, 7, 101, 18])); // 4`,
    ['Both versions fit in 15 lines.', 'Shows DP and binary search together.'], ['tails[] is not the real subsequence.', 'The fast version is hard to explain.']),

  mk('Dynamic Programming', 'Unique Paths / Min Path Sum (2D grid)', 'Count paths (or the cheapest path) from the top-left to the bottom-right, moving only right or down. Each cell depends on the cell above and the cell to its left.',
`function uniquePaths(m, n) {
  const dp = new Array(n).fill(1);
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) dp[c] += dp[c - 1];
  }
  return dp[n - 1];
}
console.log(uniquePaths(3, 7)); // 28

function minPathSum(grid) {
  const R = grid.length, C = grid[0].length;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (r === 0 && c === 0) continue;
      const up = r > 0 ? grid[r - 1][c] : Infinity;
      const left = c > 0 ? grid[r][c - 1] : Infinity;
      grid[r][c] += Math.min(up, left);
    }
  }
  return grid[R - 1][C - 1];
}`,
    ['One row of memory is enough.', 'Template for many grid DP questions.'], ['Obstacles need extra checks.', 'Overwriting the grid changes the input.']),

  mk('Dynamic Programming', 'Word Break', 'Can a string be split into dictionary words? dp[i] is true if some earlier dp[j] is true and the piece s[j..i] is in the dictionary.',
`function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && words.has(s.slice(j, i))) { dp[i] = true; break; }
    }
  }
  return dp[s.length];
}
console.log(wordBreak('leetcode', ['leet', 'code'])); // true`,
    ['Clear 1D DP.', 'O(n²) with a Set lookup.'], ['slice makes it slower on long strings.', 'A Trie can speed it up.']),

  mk('Dynamic Programming', 'Subset Sum / Partition Equal Subset', 'Can some numbers add up exactly to a target? For equal partition, the target is half the total. dp[s] says whether sum s is reachable.',
`function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const target = total / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (const n of nums) {
    for (let s = target; s >= n; s--) {
      if (dp[s - n]) dp[s] = true;
    }
  }
  return dp[target];
}
console.log(canPartition([1, 5, 11, 5])); // true`,
    ['It is 0/1 knapsack with booleans.', 'O(n × target).'], ['Slow for huge targets.', 'Loop must go backwards.']),

  // ---------------- Backtracking ----------------
  mk('Backtracking', 'Subsets and Combinations', 'Build answers one choice at a time. Add an item, explore further, then remove it (undo) and try the next. The same template makes subsets, combinations and combination sum.',
`function subsets(nums) {
  const result = [];
  const path = [];
  const go = (start) => {
    result.push([...path]);          // every path is an answer
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);            // choose
      go(i + 1);                     // explore
      path.pop();                    // undo
    }
  };
  go(0);
  return result;
}
console.log(subsets([1, 2, 3])); // 8 subsets

function combinationSum(candidates, target) {
  const result = [], path = [];
  const go = (start, remain) => {
    if (remain === 0) return result.push([...path]);
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remain) continue;
      path.push(candidates[i]);
      go(i, remain - candidates[i]); // same number can repeat
      path.pop();
    }
  };
  go(0, target);
  return result;
}`,
    ['One template solves many problems.', 'Easy to read.'], ['Exponential time.', 'Duplicates need sorting + skipping.']),

  mk('Backtracking', 'Permutations', 'Every ordering of the numbers. At each position try every unused number, go deeper, then un-use it.',
`function permute(nums) {
  const result = [];
  const path = [];
  const used = new Array(nums.length).fill(false);
  const go = () => {
    if (path.length === nums.length) return result.push([...path]);
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true; path.push(nums[i]);
      go();
      path.pop(); used[i] = false;
    }
  };
  go();
  return result;
}
console.log(permute([1, 2, 3]).length); // 6`,
    ['Straightforward template.', 'Output is always correct.'], ['n! results, only for small n.', 'Duplicates need extra logic.']),

  mk('Backtracking', 'N-Queens', 'Place N queens on an N x N board so none attack each other. Put one queen per row, try each column, skip attacked cells, undo when stuck. Watch the animation.',
`function solveNQueens(n) {
  const cols = new Set(), diag1 = new Set(), diag2 = new Set();
  const board = [], result = [];
  const go = (row) => {
    if (row === n) return result.push(board.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || diag1.has(row - c) || diag2.has(row + c)) continue;
      cols.add(c); diag1.add(row - c); diag2.add(row + c); board.push(c);
      go(row + 1);
      cols.delete(c); diag1.delete(row - c); diag2.delete(row + c); board.pop();
    }
  };
  go(0);
  return result;
}
console.log(solveNQueens(4).length); // 2`,
    ['Sets make the safety check O(1).', 'The best backtracking showcase.'], ['Exponential time.', 'Diagonal formulas (row-c, row+c) are easy to forget.'], 'NQueens'),

  mk('Backtracking', 'Word Search (Grid Backtracking)', 'Find a word in a grid by moving up, down, left or right without reusing a cell. Mark the cell visited, try all four directions, then unmark it.',
`function exist(board, word) {
  const R = board.length, C = board[0].length;
  const go = (r, c, i) => {
    if (i === word.length) return true;
    if (r < 0 || c < 0 || r >= R || c >= C || board[r][c] !== word[i]) return false;
    const saved = board[r][c];
    board[r][c] = '#';               // mark visited
    const found = go(r + 1, c, i + 1) || go(r - 1, c, i + 1) ||
                  go(r, c + 1, i + 1) || go(r, c - 1, i + 1);
    board[r][c] = saved;             // undo
    return found;
  };
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (go(r, c, 0)) return true;
  return false;
}`,
    ['Mark and unmark inside the grid, no extra set.', 'Prunes early on mismatch.'], ['Worst case is exponential.', 'Forgetting to undo breaks results.']),

  // ---------------- Greedy & Heap ----------------
  mk('Greedy & Heap', 'Jump Game and Activity Selection', 'Greedy means always take the locally best choice. Jump game: keep the furthest index you can reach. Activity selection: sort by end time and always take the next activity that fits.',
`function canJump(nums) {
  let furthest = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > furthest) return false;
    furthest = Math.max(furthest, i + nums[i]);
  }
  return true;
}
console.log(canJump([2, 3, 1, 1, 4])); // true

function maxActivities(intervals) {
  intervals.sort((a, b) => a[1] - b[1]); // earliest end first
  let count = 0, end = -Infinity;
  for (const [s, e] of intervals) {
    if (s >= end) { count++; end = e; }
  }
  return count;
}
console.log(maxActivities([[1, 3], [2, 4], [3, 5], [0, 6], [5, 7]])); // 3`,
    ['O(n) or O(n log n).', 'Very short code.'], ['Greedy is only right when it can be proved.', 'Hard to know when greedy is enough.']),

  mk('Greedy & Heap', 'Min-Heap and Top K Frequent', 'A heap gives the smallest value in O(log n). To keep the K largest items, keep a min-heap of size K. JavaScript has no built-in heap, so here is a small one.',
`class MinHeap {
  constructor(cmp = (a, b) => a - b) { this.h = []; this.cmp = cmp; }
  size() { return this.h.length; }
  peek() { return this.h[0]; }
  push(v) {
    const h = this.h; h.push(v);
    let i = h.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.cmp(h[i], h[p]) >= 0) break;
      [h[i], h[p]] = [h[p], h[i]]; i = p;
    }
  }
  pop() {
    const h = this.h, top = h[0], last = h.pop();
    if (h.length) {
      h[0] = last;
      let i = 0;
      while (true) {
        let s = i; const l = 2 * i + 1, r = 2 * i + 2;
        if (l < h.length && this.cmp(h[l], h[s]) < 0) s = l;
        if (r < h.length && this.cmp(h[r], h[s]) < 0) s = r;
        if (s === i) break;
        [h[i], h[s]] = [h[s], h[i]]; i = s;
      }
    }
    return top;
  }
}
function topKFrequent(nums, k) {
  const freq = new Map();
  for (const n of nums) freq.set(n, (freq.get(n) || 0) + 1);
  const heap = new MinHeap((a, b) => a[1] - b[1]);
  for (const entry of freq) {
    heap.push(entry);
    if (heap.size() > k) heap.pop();
  }
  return heap.h.map(([n]) => n);
}
console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2)); // [2, 1]`,
    ['O(n log k) instead of sorting O(n log n).', 'Reusable heap class for many problems.'], ['You must write your own heap in JS.', 'Bucket sort can reach O(n).']),

  mk('Greedy & Heap', 'Meeting Rooms II', 'Minimum rooms needed for a set of meetings. Sort start times and end times separately. Walk the starts: if a meeting starts before the earliest end, a new room is needed, otherwise a room is reused. (A min-heap of end times gives the same answer.)',
`function minMeetingRooms(intervals) {
  const starts = intervals.map((i) => i[0]).sort((a, b) => a - b);
  const ends = intervals.map((i) => i[1]).sort((a, b) => a - b);
  let rooms = 0, endPtr = 0;
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] < ends[endPtr]) rooms++; // need a new room
    else endPtr++;                         // a room just freed up
  }
  return rooms;
}
console.log(minMeetingRooms([[0, 30], [5, 10], [15, 20]])); // 2`,
    ['O(n log n) and no heap class needed.', 'Pattern for CPU scheduling.'], ['Two-array trick is not obvious.', 'Touching times (end = start) must be handled.']),

  mk('Greedy & Heap', 'Median from a Data Stream', 'Keep the numbers sorted as they arrive. The median is the middle one (or the average of the two middle ones). The interview-best version keeps the smaller half in a max-heap and the bigger half in a min-heap (add O(log n), read O(1)). This version uses sorted insertion so the idea is easy to see.',
`// Tiny version using sorted insertion (clear idea, O(n) add).
// Swap the arrays for two heaps to reach O(log n).
class MedianFinder {
  constructor() { this.data = []; }
  addNum(num) {
    let lo = 0, hi = this.data.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.data[mid] < num) lo = mid + 1; else hi = mid;
    }
    this.data.splice(lo, 0, num);
  }
  findMedian() {
    const n = this.data.length, m = n >> 1;
    return n % 2 ? this.data[m] : (this.data[m - 1] + this.data[m]) / 2;
  }
}
const mf = new MedianFinder();
[5, 15, 1, 3].forEach((n) => mf.addNum(n));
console.log(mf.findMedian()); // 4`,
    ['Median read in O(1).', 'Easy to understand and test.'], ['Insertion is O(n); use two heaps for O(log n).', 'splice shifts many items on big inputs.']),

  // ---------------- Bits & Math ----------------
  mk('Bits & Math', 'Bit Tricks (Single Number, Power of Two, Count Bits)', 'XOR cancels equal numbers, so XOR-ing all values leaves the one that appears once. n & (n - 1) removes the lowest set bit, which counts bits and tests powers of two.',
`function singleNumber(nums) {
  let x = 0;
  for (const n of nums) x ^= n; // pairs cancel
  return x;
}
console.log(singleNumber([4, 1, 2, 1, 2])); // 4

const isPowerOfTwo = (n) => n > 0 && (n & (n - 1)) === 0;
console.log(isPowerOfTwo(16)); // true

function countBits(n) {
  let count = 0;
  while (n) { n &= n - 1; count++; } // drop lowest set bit
  return count;
}
console.log(countBits(13)); // 3 (1101)

// check, set, clear, toggle bit i
const isSet = (n, i) => (n >> i) & 1;
const setBit = (n, i) => n | (1 << i);
const clearBit = (n, i) => n & ~(1 << i);
const toggleBit = (n, i) => n ^ (1 << i);`,
    ['O(1) memory, very fast.', 'Impresses interviewers when used well.'], ['Hard to read.', 'JS bitwise operators work on 32-bit integers only.']),

  mk('Bits & Math', 'Sieve of Eratosthenes', 'Find all primes up to n. Cross out the multiples of each prime, starting at p×p. What remains is prime. O(n log log n).',
`function sieve(n) {
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;
  for (let p = 2; p * p <= n; p++) {
    if (!isPrime[p]) continue;
    for (let m = p * p; m <= n; m += p) isPrime[m] = false;
  }
  return isPrime.map((v, i) => (v ? i : -1)).filter((i) => i > 0);
}
console.log(sieve(30)); // [2,3,5,7,11,13,17,19,23,29]`,
    ['Very fast for many primes.', 'Short code.'], ['Needs O(n) memory.', 'Wasteful to test a single number.'], 'Sieve'),

  mk('Bits & Math', 'GCD, LCM and Fast Power', 'GCD by the Euclid method: gcd(a, b) = gcd(b, a % b). LCM = a × b / gcd. Fast power squares the base and halves the exponent, so x^n takes O(log n) steps.',
`const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a / gcd(a, b)) * b;
console.log(gcd(48, 18), lcm(4, 6)); // 6 12

function power(x, n, mod = null) {
  let result = 1n, base = BigInt(x), exp = BigInt(n);
  const m = mod === null ? null : BigInt(mod);
  while (exp > 0n) {
    if (exp & 1n) result = m ? (result * base) % m : result * base;
    base = m ? (base * base) % m : base * base;
    exp >>= 1n;
  }
  return result;
}
console.log(power(2, 10)); // 1024n
console.log(power(3, 200, 1000000007)); // modular power`,
    ['Euclid is 1 line.', 'Fast power is the base of modular maths.'], ['BigInt is needed for huge values.', 'Negative exponents need extra handling.']),
];

export const INTERVIEW_PATTERNS: Snippet[] = [
  mk('Array patterns', 'Prefix Sum Pattern', 'Precompute running totals so any range sum is one subtraction. Use when you see "sum of subarray" or "many range queries". Pair it with a Map to count subarrays with a target sum.',
`const nums = [3, 1, 4, 1, 5, 9];
const prefix = [0];
for (const n of nums) prefix.push(prefix[prefix.length - 1] + n);
// sum of nums[l..r] inclusive
const rangeSum = (l, r) => prefix[r + 1] - prefix[l];
console.log(rangeSum(1, 3)); // 1 + 4 + 1 = 6`,
    ['O(1) range queries.', 'Easy to extend to 2D grids.'], ['Fixed array only (updates need a Fenwick tree).', 'Off-by-one with the extra 0 at the start.']),

  mk('Array patterns', 'Monotonic Stack Pattern', 'Keep a stack that is always increasing or decreasing. Use for "next greater/smaller element", daily temperatures, stock span and largest rectangle in a histogram.',
`function dailyTemperatures(temps) {
  const answer = new Array(temps.length).fill(0);
  const stack = []; // indexes of days waiting for a warmer day
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[stack[stack.length - 1]] < temps[i]) {
      const j = stack.pop();
      answer[j] = i - j;
    }
    stack.push(i);
  }
  return answer;
}
console.log(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]));
// [1,1,4,2,1,1,0,0]`,
    ['O(n) with simple code.', 'Replaces nested loops.'], ['Takes practice to spot.', 'Choosing increasing vs decreasing order confuses beginners.'], 'ArrayAlgo'),

  mk('Array patterns', 'Cyclic Sort (Numbers 1 to n)', 'When values are in the range 1..n, put every number at its own index (value v belongs at index v-1) by swapping. Then missing or duplicate numbers are easy to see. O(n) time, O(1) memory.',
`function firstMissingPositive(nums) {
  let i = 0;
  while (i < nums.length) {
    const correct = nums[i] - 1;
    if (nums[i] > 0 && nums[i] <= nums.length && nums[i] !== nums[correct]) {
      [nums[i], nums[correct]] = [nums[correct], nums[i]];
    } else i++;
  }
  for (let j = 0; j < nums.length; j++) {
    if (nums[j] !== j + 1) return j + 1; // first missing positive
  }
  return nums.length + 1;
}
console.log(firstMissingPositive([3, 4, -1, 1])); // 2`,
    ['O(1) memory.', 'Solves first missing positive and find duplicates.'], ['Changes the input.', 'Only for values in a known range.']),

  mk('Array patterns', 'Kadane / Sliding Window Choice', 'Use a fixed window for "size k" questions, a growing/shrinking window for "longest/shortest subarray with a rule", and Kadane when the rule is just the best sum. Negative numbers break windows, use prefix sums then.',
`// Shortest subarray with sum >= target (positive numbers only)
function minSubArrayLen(target, nums) {
  let left = 0, sum = 0, best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {
      best = Math.min(best, right - left + 1);
      sum -= nums[left++];   // shrink from the left
    }
  }
  return best === Infinity ? 0 : best;
}
console.log(minSubArrayLen(7, [2, 3, 1, 2, 4, 3])); // 2`,
    ['O(n): each item enters and leaves once.', 'Pattern for most substring questions.'], ['Fails with negative numbers.', 'Shrink condition must be exact.']),

  mk('Search & intervals', 'Binary Search Template (Find Boundary)', 'Almost every binary search problem is "find the first index where a condition becomes true". Write the condition as a function and keep the same loop every time.',
`function firstTrue(lo, hi, isTrue) {
  // smallest x in [lo, hi] where isTrue(x), or hi + 1 if none
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (isTrue(mid)) hi = mid - 1;
    else lo = mid + 1;
  }
  return lo;
}
const arr = [1, 3, 5, 7, 9];
console.log(firstTrue(0, arr.length - 1, (i) => arr[i] >= 6)); // 3`,
    ['One template, fewer bugs.', 'Works for answers on arrays and on numbers.'], ['Needs a monotonic condition.', 'Return value when nothing is true needs care.']),

  mk('Search & intervals', 'Interval Overlap Checks', 'Two intervals overlap when a.start < b.end and b.start < a.end. Sort by start and compare with the previous interval for merging, inserting and "can attend all meetings".',
`const overlaps = (a, b) => a[0] < b[1] && b[0] < a[1];
console.log(overlaps([1, 5], [4, 8])); // true

function canAttendAll(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < intervals[i - 1][1]) return false;
  }
  return true;
}
console.log(canAttendAll([[0, 30], [5, 10]])); // false`,
    ['Simple check, reused everywhere.', 'O(n log n) after sorting.'], ['Edge touching rule (< vs <=) changes answers.', 'Must sort first.'], 'Intervals'),

  mk('Graph & tree patterns', 'BFS Level Pattern (Shortest Path in Grid)', 'For the shortest number of steps in a grid or word ladder, use BFS and count the levels. Mark cells visited when you add them to the queue.',
`function shortestPath(grid, start, end) {
  const R = grid.length, C = grid[0].length;
  const queue = [[...start, 0]];
  const seen = new Set([start.join(',')]);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let head = 0; head < queue.length; head++) {
    const [r, c, steps] = queue[head];
    if (r === end[0] && c === end[1]) return steps;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc, key = nr + ',' + nc;
      if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
      if (grid[nr][nc] === 1 || seen.has(key)) continue;
      seen.add(key);
      queue.push([nr, nc, steps + 1]);
    }
  }
  return -1;
}
const maze = [[0, 0, 0], [1, 1, 0], [0, 0, 0]];
console.log(shortestPath(maze, [0, 0], [2, 2])); // 4`,
    ['Always finds the shortest route in unweighted grids.', 'Index pointer keeps the queue O(1).'], ['Memory grows with the frontier.', 'Weighted grids need Dijkstra.']),

  mk('Graph & tree patterns', 'Tree DFS: Return Up, Update Global', 'Many tree problems (diameter, max path sum, balanced tree) use one DFS that returns a value to the parent and updates a global best at each node.',
`function maxPathSum(root) {
  let best = -Infinity;
  const gain = (node) => {
    if (!node) return 0;
    const left = Math.max(0, gain(node.left));   // ignore negative branches
    const right = Math.max(0, gain(node.right));
    best = Math.max(best, node.val + left + right); // path bending at node
    return node.val + Math.max(left, right);        // path going up
  };
  gain(root);
  return best;
}`,
    ['One pass, O(n).', 'Template for hard tree questions.'], ['Two different values (return vs best) confuse people.', 'Negative values need clamping.']),

  mk('Graph & tree patterns', 'Backtracking Template', 'Choose, explore, un-choose. Prune early when a choice cannot lead to an answer. Use for subsets, permutations, combinations, N-Queens, sudoku and word search.',
`function backtrack(state, choices, results) {
  if (isGoal(state)) { results.push(copy(state)); return; }
  for (const choice of choices(state)) {
    if (!isValid(state, choice)) continue; // prune
    apply(state, choice);                  // choose
    backtrack(state, choices, results);    // explore
    undo(state, choice);                   // un-choose
  }
}
// isGoal, copy, isValid, apply, undo depend on the problem`,
    ['One shape fits every search problem.', 'Pruning makes it practical.'], ['Exponential in the worst case.', 'Forgetting undo is the most common bug.'], 'NQueens'),

  mk('DP & recursion', 'DP Recipe (How to Solve Any DP)', 'Five steps: 1) define the state ("dp[i] means..."), 2) write the choice at each state, 3) set the base cases, 4) pick the order that fills smaller states first, 5) return the right cell. Start with plain recursion, add a memo, then convert to a table.',
`// Step by step: House Robber
// 1 state:  best(i) = most money from houses 0..i
// 2 choice: skip i -> best(i-1), or rob i -> best(i-2) + nums[i]
// 3 base:   best(0) = nums[0], best(-1) = 0
// 4 order:  i from left to right
// 5 answer: best(n - 1)
function robMemo(nums) {
  const memo = new Map();
  const best = (i) => {
    if (i < 0) return 0;
    if (memo.has(i)) return memo.get(i);
    const v = Math.max(best(i - 1), best(i - 2) + nums[i]);
    memo.set(i, v);
    return v;
  };
  return best(nums.length - 1);
}
console.log(robMemo([2, 7, 9, 3, 1])); // 12`,
    ['Works for every DP problem.', 'Memo first means less thinking about order.'], ['Choosing the state is still the hard part.', 'Recursion depth limit on big inputs.'], 'Recursion'),

  mk('DP & recursion', 'Top-Down vs Bottom-Up', 'Top-down: recursion + memo, only computes what is needed. Bottom-up: fill a table from the smallest case, no recursion, easier to save memory. Same answer, same speed class.',
`// Top-down
const fibTop = (n, memo = {}) =>
  n <= 1 ? n : (memo[n] ??= fibTop(n - 1, memo) + fibTop(n - 2, memo));

// Bottom-up
function fibBottom(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}
console.log(fibTop(40), fibBottom(40)); // 102334155 102334155`,
    ['Top-down is quick to write.', 'Bottom-up has no stack overflow.'], ['Top-down can hit recursion limits.', 'Bottom-up needs the right fill order.'], 'Recursion'),

  mk('DP & recursion', 'Union-Find Pattern', 'Use whenever you see "are these connected?", "number of groups", "merge accounts" or "detect a cycle in an undirected graph". Create a Union-Find, union each pair and count the groups.',
`function countComponents(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  let groups = n;
  for (const [a, b] of edges) {
    const ra = find(a), rb = find(b);
    if (ra !== rb) { parent[ra] = rb; groups--; }
  }
  return groups;
}
console.log(countComponents(5, [[0, 1], [1, 2], [3, 4]])); // 2`,
    ['Almost O(1) per edge.', 'Much shorter than DFS for groups.'], ['No way to remove an edge.', 'Only tells if connected, not the path.'], 'UnionFind'),
];
