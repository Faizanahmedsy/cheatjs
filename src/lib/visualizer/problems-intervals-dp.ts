import type { Problem } from "./problem-types";

/** Intervals & Sorting (91–100) and Dynamic Programming (101–115). */
export const INTERVAL_DP_PROBLEMS: Problem[] = [
  // ─────────────────────────── Intervals & Sorting ───────────────────────────
  {
    id: "merge-intervals",
    number: 91,
    title: "Merge Intervals",
    group: "Intervals & Sorting",
    difficulty: "Medium",
    statement:
      "Given a list of intervals [start, end], merge every group of overlapping intervals into one. Return the merged intervals.",
    example: "intervals = [[1,3],[8,10],[2,6],[15,18]] → [[1,6],[8,10],[15,18]]",
    approach:
      "Sort the intervals by their start. Then any interval that overlaps the last merged one must start before (or exactly when) that one ends. If it does, stretch the last merged interval's end; if not, it begins a new merged interval.",
    watch: [
      "after sorting, [2,6] sits right after [1,3]",
      "`last` is always the most recent interval in `merged`",
      "when `cur[0] <= last[1]` the two overlap and `last[1]` grows to the larger end",
      "[8,10] starts after 6, so it is pushed as a new interval",
    ],
    complexity: { time: "O(n log n)", space: "O(n)" },
    code: `function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]); // sort by start first
  const merged = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const cur = intervals[i];
    const last = merged[merged.length - 1]; // most recent merged interval
    if (cur[0] <= last[1]) {
      // overlap: stretch the end of the last interval
      last[1] = Math.max(last[1], cur[1]);
    } else {
      merged.push(cur); // no overlap: start a new interval
    }
  }
  return merged;
}

const intervals = [[1, 3], [8, 10], [2, 6], [15, 18]];
console.log(merge(intervals)); // expected: [[1, 6], [8, 10], [15, 18]]`,
  },
  {
    id: "insert-interval",
    number: 92,
    title: "Insert Interval",
    group: "Intervals & Sorting",
    difficulty: "Medium",
    statement:
      "You get a sorted list of non-overlapping intervals and one new interval. Insert the new one, merging wherever it overlaps, so the list stays sorted and non-overlapping.",
    example: "intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8] → [[1,2],[3,10],[12,16]]",
    approach:
      "Walk the list in three phases. First copy every interval that ends before the new one starts. Then swallow every interval that overlaps the new one, widening it to cover them all. Finally copy the rest, which all start after it ends.",
    watch: [
      "phase 1: [1,2] ends before 4, so it is copied as is",
      "phase 2: [3,5], [6,7] and [8,10] all touch `newInterval`, which widens to [3,10]",
      "`i` never goes back: each interval is looked at once",
      "phase 3: [12,16] is copied after the merged interval is pushed",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function insert(intervals, newInterval) {
  const result = [];
  let i = 0;

  // 1. intervals that end before the new one starts
  while (i < intervals.length && intervals[i][1] < newInterval[0]) {
    result.push(intervals[i]);
    i++;
  }
  // 2. intervals that overlap the new one: merge them in
  while (i < intervals.length && intervals[i][0] <= newInterval[1]) {
    newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
    newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
    i++;
  }
  result.push(newInterval);
  // 3. intervals that start after the new one ends
  while (i < intervals.length) {
    result.push(intervals[i]);
    i++;
  }
  return result;
}

const intervals = [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]];
console.log(insert(intervals, [4, 8])); // expected: [[1, 2], [3, 10], [12, 16]]`,
  },
  {
    id: "meeting-rooms",
    number: 93,
    title: "Meeting Rooms",
    group: "Intervals & Sorting",
    difficulty: "Easy",
    statement:
      "Given meeting times as [start, end], decide whether one person could attend all of them. That is only possible if no two meetings overlap.",
    example: "intervals = [[0,30],[5,10],[15,20]] → false",
    approach:
      "Sort the meetings by start time. Once sorted, only neighbours can clash: if any meeting starts before the previous one ends, there is an overlap. One pass over the sorted list checks every neighbouring pair.",
    watch: [
      "after sorting, meetings are in start-time order",
      "each pass compares `intervals[i][0]` with the previous meeting's end",
      "at i = 1 the meeting [5,10] starts before 30, so the answer is false",
    ],
    complexity: { time: "O(n log n)", space: "O(1)" },
    code: `function canAttendMeetings(intervals) {
  intervals.sort((a, b) => a[0] - b[0]); // order by start time

  for (let i = 1; i < intervals.length; i++) {
    // starts before the previous meeting has ended?
    if (intervals[i][0] < intervals[i - 1][1]) {
      return false;
    }
  }
  return true; // no two meetings clash
}

const intervals = [[0, 30], [5, 10], [15, 20]];
console.log(canAttendMeetings(intervals)); // expected: false`,
  },
  {
    id: "non-overlapping-intervals",
    number: 94,
    title: "Non-overlapping Intervals",
    group: "Intervals & Sorting",
    difficulty: "Medium",
    statement:
      "Given a list of intervals, find the fewest you must remove so that the rest do not overlap. Intervals that only touch at an end point do not count as overlapping.",
    example: "intervals = [[1,2],[2,3],[3,4],[1,3]] → 1",
    approach:
      "Sort by end time and greedily keep the interval that finishes earliest, because it leaves the most room for the others. Walk the list: if an interval starts before the last kept one ends, it overlaps and is removed; otherwise keep it and move `end` forward.",
    watch: [
      "after sorting by end, [1,3] comes right after [1,2]",
      "`end` is the finish time of the last interval we kept",
      "[1,3] starts at 1, before `end` = 2, so `removed` goes up",
      "[2,3] and [3,4] start exactly at `end`, so they are kept",
    ],
    complexity: { time: "O(n log n)", space: "O(1)" },
    code: `function eraseOverlapIntervals(intervals) {
  intervals.sort((a, b) => a[1] - b[1]); // earliest finish first
  let end = intervals[0][1]; // end of the last kept interval
  let removed = 0;

  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < end) {
      removed++; // overlaps the kept one: drop it
    } else {
      end = intervals[i][1]; // no overlap: keep it
    }
  }
  return removed;
}

const intervals = [[1, 2], [2, 3], [3, 4], [1, 3]];
console.log(eraseOverlapIntervals(intervals)); // expected: 1`,
  },
  {
    id: "meeting-rooms-ii",
    number: 95,
    title: "Meeting Rooms II",
    group: "Intervals & Sorting",
    difficulty: "Medium",
    statement:
      "Given meeting times as [start, end], find the smallest number of rooms needed so every meeting has a room. A room freed at time t can be reused by a meeting starting at t.",
    example: "intervals = [[0,30],[5,10],[15,20],[10,15]] → 2",
    approach:
      "Split the meetings into a sorted list of start times and a sorted list of end times. Walk the starts: each start needs a room, but if the earliest unfinished meeting has already ended, its room is reused. The number of rooms in use at the busiest moment is the answer.",
    watch: [
      "`starts` and `ends` are sorted separately",
      "`i` walks the starts, `j` points at the earliest end not yet freed",
      "when `starts[i] >= ends[j]` a meeting has finished: `rooms` goes down and `j` moves",
      "`maxRooms` remembers the peak of `rooms`",
    ],
    complexity: { time: "O(n log n)", space: "O(n)" },
    code: `function minMeetingRooms(intervals) {
  const starts = [];
  const ends = [];
  for (const [s, e] of intervals) {
    starts.push(s);
    ends.push(e);
  }
  starts.sort((a, b) => a - b);
  ends.sort((a, b) => a - b);

  let rooms = 0;
  let maxRooms = 0;
  let j = 0; // earliest meeting end not yet freed
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] >= ends[j]) {
      rooms--; // a meeting ended: free its room
      j++;
    }
    rooms++; // this meeting takes a room
    maxRooms = Math.max(maxRooms, rooms);
  }
  return maxRooms;
}

const intervals = [[0, 30], [5, 10], [15, 20], [10, 15]];
console.log(minMeetingRooms(intervals)); // expected: 2`,
  },
  {
    id: "merge-sorted-array",
    number: 96,
    title: "Merge Sorted Array",
    group: "Intervals & Sorting",
    difficulty: "Easy",
    statement:
      "nums1 holds m sorted numbers followed by n empty slots (zeros); nums2 holds n sorted numbers. Merge nums2 into nums1 in place so nums1 ends up fully sorted.",
    example: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3 → [1,2,2,3,5,6]",
    approach:
      "Fill nums1 from the back. Compare the largest unplaced number of each array and write the bigger one into the last free slot. Working backwards means we never overwrite a number of nums1 that has not been placed yet.",
    watch: [
      "`i` is the last real number of nums1, `j` the last of nums2, `k` the slot being filled",
      "the bigger of `nums1[i]` and `nums2[j]` is written to `nums1[k]`",
      "`k` moves left every pass; only the pointer whose number was used moves with it",
      "once `j` drops below 0, the rest of nums1 is already in place",
    ],
    complexity: { time: "O(m + n)", space: "O(1)" },
    code: `function merge(nums1, m, nums2, n) {
  let i = m - 1; // last real number in nums1
  let j = n - 1; // last number in nums2
  let k = m + n - 1; // last slot of nums1

  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) {
      nums1[k] = nums1[i]; // nums1 has the bigger one
      i--;
    } else {
      nums1[k] = nums2[j]; // nums2 has the bigger (or equal) one
      j--;
    }
    k--;
  }
  return nums1;
}

const nums1 = [1, 2, 3, 0, 0, 0];
const nums2 = [2, 5, 6];
console.log(merge(nums1, 3, nums2, 3)); // expected: [1, 2, 2, 3, 5, 6]`,
  },
  {
    id: "sort-colors",
    number: 97,
    title: "Sort Colors",
    group: "Intervals & Sorting",
    difficulty: "Medium",
    statement:
      "The array holds only 0s, 1s and 2s (red, white, blue). Sort it in place in one pass, without using a library sort.",
    example: "nums = [2,0,2,1,1,0] → [0,0,1,1,2,2]",
    approach:
      "This is the Dutch national flag method. Everything before `lo` is 0, everything after `hi` is 2, and `mid` scans the unknown middle. A 0 is swapped down to `lo`, a 2 is swapped up to `hi`, and a 1 is simply skipped.",
    watch: [
      "`lo`, `mid` and `hi` split the array into 0s | 1s | unknown | 2s",
      "after swapping a 2 to `hi`, `mid` does not move: the value swapped in is still unchecked",
      "after swapping a 0 to `lo`, both `lo` and `mid` move",
      "the loop ends when `mid` passes `hi`",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function sortColors(nums) {
  let lo = 0; // next place for a 0
  let mid = 0; // the value being looked at
  let hi = nums.length - 1; // next place for a 2

  while (mid <= hi) {
    if (nums[mid] === 0) {
      [nums[lo], nums[mid]] = [nums[mid], nums[lo]]; // send 0 to the front
      lo++;
      mid++;
    } else if (nums[mid] === 2) {
      [nums[mid], nums[hi]] = [nums[hi], nums[mid]]; // send 2 to the back
      hi--; // mid stays: the swapped-in value is unchecked
    } else {
      mid++; // a 1 is already in the middle zone
    }
  }
  return nums;
}

const nums = [2, 0, 2, 1, 1, 0];
console.log(sortColors(nums)); // expected: [0, 0, 1, 1, 2, 2]`,
  },
  {
    id: "sort-list",
    number: 98,
    title: "Sort List",
    group: "Intervals & Sorting",
    difficulty: "Medium",
    statement:
      "Given the head of a linked list, sort it in ascending order and return the new head. Aim for O(n log n) time.",
    example: "head = 4 → 2 → 1 → 3 → [1,2,3,4]",
    approach:
      "Use merge sort, which suits linked lists because merging needs no extra array. Find the middle with a slow and a fast pointer, cut the list in two, sort each half recursively, then merge the two sorted halves by always taking the smaller head.",
    watch: [
      "`slow` moves one node while `fast` moves two, so `slow` stops at the middle",
      "`slow.next = null` cuts the list into two halves",
      "the call tree splits down to single nodes, then merges back up",
      "in `mergeLists`, `tail` always points at the end of the merged part",
    ],
    complexity: { time: "O(n log n)", space: "O(log n)" },
    code: `class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

// merge two sorted lists into one
function mergeLists(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) {
      tail.next = a; // take from a
      a = a.next;
    } else {
      tail.next = b; // take from b
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a || b; // attach whatever is left
  return dummy.next;
}

function sortList(head) {
  if (!head || !head.next) return head; // 0 or 1 node is sorted

  // find the middle: fast moves twice as fast as slow
  let slow = head;
  let fast = head.next;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  const right = slow.next;
  slow.next = null; // cut the list in two

  return mergeLists(sortList(head), sortList(right));
}

function toArray(head) {
  const out = [];
  for (let p = head; p; p = p.next) out.push(p.val);
  return out;
}

const head = new ListNode(4, new ListNode(2, new ListNode(1, new ListNode(3))));
console.log(toArray(sortList(head))); // expected: [1, 2, 3, 4]`,
  },
  {
    id: "sort-an-array",
    number: 99,
    title: "Sort an Array",
    group: "Intervals & Sorting",
    difficulty: "Medium",
    statement:
      "Sort an array of numbers in ascending order without using the built-in sort. It should run in O(n log n) time.",
    example: "nums = [5,2,3,1,4] → [1,2,3,4,5]",
    approach:
      "Merge sort: split the array in half, sort each half recursively, then merge the two sorted halves. Merging walks both halves with one pointer each and always takes the smaller front value, so the result stays sorted.",
    watch: [
      "`mid` splits each array in two until pieces have one element",
      "the call tree goes down splitting, then comes back up merging",
      "in `mergeHalves`, `i` and `j` point at the front of each half",
      "whichever of `left[i]` and `right[j]` is smaller is pushed to `out`",
    ],
    complexity: { time: "O(n log n)", space: "O(n)" },
    code: `// merge two sorted arrays into one sorted array
function mergeHalves(left, right) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      out.push(left[i]);
      i++;
    } else {
      out.push(right[j]);
      j++;
    }
  }
  // one half is used up: copy the rest of the other
  while (i < left.length) out.push(left[i++]);
  while (j < right.length) out.push(right[j++]);
  return out;
}

function sortArray(nums) {
  if (nums.length <= 1) return nums; // already sorted
  const mid = Math.floor(nums.length / 2);
  const left = sortArray(nums.slice(0, mid));
  const right = sortArray(nums.slice(mid));
  return mergeHalves(left, right);
}

const nums = [5, 2, 3, 1, 4];
console.log(sortArray(nums)); // expected: [1, 2, 3, 4, 5]`,
  },
  {
    id: "kth-largest-element",
    number: 100,
    title: "Kth Largest Element in an Array",
    group: "Intervals & Sorting",
    difficulty: "Medium",
    statement:
      "Find the kth largest number in an unsorted array. It is the kth largest in sorted order, not the kth distinct value.",
    example: "nums = [3,2,1,5,6,4], k = 2 → 5",
    approach:
      "Quickselect: the kth largest sits at index n - k once the array is sorted. Partition around a pivot so smaller values go left and larger go right; the pivot then lands at its final index. If that index is the target we are done, otherwise keep only the side that contains the target.",
    watch: [
      "`target` is the index the answer would have in sorted order (n - k = 4)",
      "in each partition, `p` marks where the next value smaller than the pivot goes",
      "after the partition, the pivot sits at `p` in its final sorted place",
      "`lo` or `hi` jumps past `p`, throwing away the half that cannot hold the answer",
    ],
    complexity: { time: "O(n) average", space: "O(1)" },
    code: `function findKthLargest(nums, k) {
  const target = nums.length - k; // index of the answer when sorted
  let lo = 0;
  let hi = nums.length - 1;

  while (lo <= hi) {
    // partition nums[lo..hi] around the last value
    const pivot = nums[hi];
    let p = lo; // next place for a value smaller than the pivot
    for (let i = lo; i < hi; i++) {
      if (nums[i] < pivot) {
        [nums[p], nums[i]] = [nums[i], nums[p]];
        p++;
      }
    }
    [nums[p], nums[hi]] = [nums[hi], nums[p]]; // pivot to its final place

    if (p === target) return nums[p];
    if (p < target) lo = p + 1; // answer is to the right
    else hi = p - 1; // answer is to the left
  }
  return -1;
}

const nums = [3, 2, 1, 5, 6, 4];
console.log(findKthLargest(nums, 2)); // expected: 5`,
  },

  // ─────────────────────────── Dynamic Programming ───────────────────────────
  {
    id: "climbing-stairs",
    number: 101,
    title: "Climbing Stairs",
    group: "Dynamic Programming",
    difficulty: "Easy",
    statement:
      "You climb a staircase of n steps, taking either 1 or 2 steps at a time. Count how many different ways you can reach the top.",
    example: "n = 5 → 8",
    approach:
      "To stand on step i, your last move came either from step i - 1 or from step i - 2. So the ways to reach i are the ways to reach i - 1 plus the ways to reach i - 2. Fill a `dp` array from the bottom using that rule.",
    watch: [
      "`dp[1] = 1` and `dp[2] = 2` are the starting answers",
      "each new cell is the sum of the two cells before it",
      "watch `dp` fill left to right: 1, 2, 3, 5, 8",
      "`dp[n]` is the answer",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function climbStairs(n) {
  if (n <= 2) return n;
  const dp = new Array(n + 1).fill(0); // dp[i] = ways to reach step i
  dp[1] = 1; // one way: a single step
  dp[2] = 2; // 1+1 or 2

  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]; // came from one step or two steps below
  }
  return dp[n];
}

console.log(climbStairs(5)); // expected: 8`,
  },
  {
    id: "house-robber",
    number: 102,
    title: "House Robber",
    group: "Dynamic Programming",
    difficulty: "Medium",
    statement:
      "Houses in a row hold some money each. You cannot rob two houses next to each other. Find the most money you can take.",
    example: "nums = [2,7,9,3,1] → 12",
    approach:
      "Let `dp[i]` be the best total using houses 0..i. At house i you either skip it (keep `dp[i - 1]`) or rob it, which means adding its money to `dp[i - 2]`. Take the larger choice; the last cell is the answer.",
    watch: [
      "`dp[0]` is the first house, `dp[1]` the better of the first two",
      "each pass compares skip (`dp[i - 1]`) with rob (`dp[i - 2] + nums[i]`)",
      "at i = 2, robbing 9 on top of 2 (11) beats 7",
      "`dp` fills as 2, 7, 11, 11, 12",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function rob(nums) {
  if (nums.length === 1) return nums[0];
  const dp = new Array(nums.length).fill(0); // dp[i] = best using houses 0..i
  dp[0] = nums[0];
  dp[1] = Math.max(nums[0], nums[1]);

  for (let i = 2; i < nums.length; i++) {
    const skip = dp[i - 1]; // leave house i alone
    const take = dp[i - 2] + nums[i]; // rob house i, so i - 1 is off limits
    dp[i] = Math.max(skip, take);
  }
  return dp[nums.length - 1];
}

const nums = [2, 7, 9, 3, 1];
console.log(rob(nums)); // expected: 12`,
  },
  {
    id: "min-cost-climbing-stairs",
    number: 103,
    title: "Min Cost Climbing Stairs",
    group: "Dynamic Programming",
    difficulty: "Easy",
    statement:
      "Each step has a cost you pay when you leave it, and you can climb 1 or 2 steps at a time. You may start on step 0 or step 1. Find the cheapest way to get past the last step.",
    example: "cost = [1,100,1,1,1,100,1] → 4",
    approach:
      "Let `dp[i]` be the cheapest cost to stand on step i. You reach step i from step i - 1 (paying its cost) or from step i - 2 (paying its cost), so take the cheaper. Starting on step 0 or 1 is free, and the top is one position past the last step.",
    watch: [
      "`dp[0]` and `dp[1]` are 0: you may start on either for free",
      "each pass picks the cheaper of `dp[i - 1] + cost[i - 1]` and `dp[i - 2] + cost[i - 2]`",
      "the expensive 100 steps are jumped over",
      "`dp[n]` (one past the end) is the top of the stairs",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function minCostClimbingStairs(cost) {
  const n = cost.length;
  const dp = new Array(n + 1).fill(0); // dp[i] = cheapest cost to stand on step i
  // dp[0] and dp[1] stay 0: starting there is free

  for (let i = 2; i <= n; i++) {
    const oneStep = dp[i - 1] + cost[i - 1]; // came from the step just below
    const twoSteps = dp[i - 2] + cost[i - 2]; // came from two steps below
    dp[i] = Math.min(oneStep, twoSteps);
  }
  return dp[n]; // the top is past the last step
}

const cost = [1, 100, 1, 1, 1, 100, 1];
console.log(minCostClimbingStairs(cost)); // expected: 4`,
  },
  {
    id: "maximum-subarray",
    number: 104,
    title: "Maximum Subarray",
    group: "Dynamic Programming",
    difficulty: "Medium",
    statement:
      "Find the contiguous part of the array with the largest sum and return that sum. The part must contain at least one number.",
    example: "nums = [-2,1,-3,4,-1,2,1,-5] → 6",
    approach:
      "Let `dp[i]` be the best sum of a subarray that ends exactly at i. Either it extends the best subarray ending at i - 1, or it starts fresh at i; extend only if `dp[i - 1]` is positive. The answer is the largest value anywhere in `dp` (this is Kadane's algorithm).",
    watch: [
      "`dp[i]` chooses between `nums[i]` alone and `dp[i - 1] + nums[i]`",
      "a negative `dp[i - 1]` is dropped: at i = 3 the run restarts at 4",
      "`best` tracks the largest `dp` value seen so far",
      "`dp` reaches 6 at i = 6 (the subarray [4,-1,2,1])",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function maxSubArray(nums) {
  const dp = new Array(nums.length).fill(0); // dp[i] = best sum ending at i
  dp[0] = nums[0];
  let best = dp[0];

  for (let i = 1; i < nums.length; i++) {
    // extend the previous run, or start a new one here
    dp[i] = Math.max(nums[i], dp[i - 1] + nums[i]);
    best = Math.max(best, dp[i]);
  }
  return best;
}

const nums = [-2, 1, -3, 4, -1, 2, 1, -5];
console.log(maxSubArray(nums)); // expected: 6`,
  },
  {
    id: "pascals-triangle",
    number: 105,
    title: "Pascal's Triangle",
    group: "Dynamic Programming",
    difficulty: "Easy",
    statement:
      "Build the first numRows rows of Pascal's triangle. Each row starts and ends with 1, and every inner number is the sum of the two numbers above it.",
    example: "numRows = 5 → [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]",
    approach:
      "Each row depends only on the row before it. Start every row as all 1s, then fill each inner cell with the two cells above it: `prev[col - 1] + prev[col]`. Push the row and move on.",
    watch: [
      "`prev` is the row above, `cur` the row being built",
      "`cur` starts as all 1s, so the edges are already right",
      "each inner `cur[col]` is `prev[col - 1] + prev[col]`",
      "`triangle` grows by one row per pass",
    ],
    complexity: { time: "O(n²)", space: "O(n²)" },
    code: `function generate(numRows) {
  const triangle = [[1]]; // the first row

  for (let row = 1; row < numRows; row++) {
    const prev = triangle[row - 1]; // the row above
    const cur = new Array(row + 1).fill(1); // edges are always 1
    for (let col = 1; col < row; col++) {
      cur[col] = prev[col - 1] + prev[col]; // sum of the two above
    }
    triangle.push(cur);
  }
  return triangle;
}

console.log(generate(5)); // expected: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]`,
  },
  {
    id: "pascals-triangle-ii",
    number: 106,
    title: "Pascal's Triangle II",
    group: "Dynamic Programming",
    difficulty: "Easy",
    statement:
      "Return only row rowIndex of Pascal's triangle (row 0 is [1]). Try to use just one array of extra space.",
    example: "rowIndex = 4 → [1,4,6,4,1]",
    approach:
      "Keep a single `dp` row and update it in place to become the next row. Each new value is the old value plus the one to its left. Go from right to left so the left neighbour you add is still the old row's value.",
    watch: [
      "`dp` starts as [1, 0, 0, 0, 0]",
      "each outer pass turns `dp` into the next row",
      "`j` runs right to left, so `dp[j - 1]` is still from the previous row",
      "after 4 passes `dp` is [1, 4, 6, 4, 1]",
    ],
    complexity: { time: "O(n²)", space: "O(n)" },
    code: `function getRow(rowIndex) {
  const dp = new Array(rowIndex + 1).fill(0);
  dp[0] = 1; // row 0 is [1]

  for (let i = 1; i <= rowIndex; i++) {
    // right to left, so dp[j - 1] is still the old row's value
    for (let j = i; j >= 1; j--) {
      dp[j] = dp[j] + dp[j - 1];
    }
  }
  return dp;
}

console.log(getRow(4)); // expected: [1, 4, 6, 4, 1]`,
  },
  {
    id: "coin-change",
    number: 107,
    title: "Coin Change",
    group: "Dynamic Programming",
    difficulty: "Medium",
    statement:
      "Given coin values and a target amount, find the fewest coins that add up to the amount. You have unlimited coins of each value. Return -1 if it cannot be done.",
    example: "coins = [1,2,5], amount = 7 → 2",
    approach:
      "Let `dp[a]` be the fewest coins that make amount a. For each amount, try every coin: if the coin fits, one coin plus the best way to make the remainder (`dp[a - coin] + 1`) is a candidate. Fill amounts from 0 upward so every remainder is already solved.",
    watch: [
      "`dp[0]` is 0; every other cell starts at Infinity (not reachable yet)",
      "for each amount `a`, each coin offers `dp[a - coin] + 1`",
      "`dp[a]` only ever goes down as better coins are tried",
      "`dp[7]` becomes 2 through the coin 5 (5 + 2)",
    ],
    complexity: { time: "O(amount × coins)", space: "O(amount)" },
    code: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity); // dp[a] = fewest coins for a
  dp[0] = 0; // zero coins make 0

  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) {
        // use this coin, then the best way to make what is left
        dp[a] = Math.min(dp[a], dp[a - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

const coins = [1, 2, 5];
console.log(coinChange(coins, 7)); // expected: 2`,
  },
  {
    id: "longest-increasing-subsequence",
    number: 108,
    title: "Longest Increasing Subsequence",
    group: "Dynamic Programming",
    difficulty: "Medium",
    statement:
      "Find the length of the longest subsequence whose values strictly increase. A subsequence keeps the original order but may skip elements.",
    example: "nums = [10,9,2,5,3,7,101] → 4",
    approach:
      "Let `dp[i]` be the length of the longest increasing subsequence that ends at i. Every element alone has length 1. For each earlier `j` with a smaller value, `nums[i]` can extend that subsequence, giving `dp[j] + 1`. The answer is the largest value in `dp`.",
    watch: [
      "`dp` starts as all 1s: each number alone is a subsequence",
      "`j` scans every index before `i`",
      "when `nums[j] < nums[i]`, `dp[i]` may grow to `dp[j] + 1`",
      "`dp` ends as [1, 1, 1, 2, 2, 3, 4]: 2 → 5 → 7 → 101",
    ],
    complexity: { time: "O(n²)", space: "O(n)" },
    code: `function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1); // dp[i] = longest run ending at i
  let best = 1;

  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        // nums[i] can extend the run that ends at j
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    best = Math.max(best, dp[i]);
  }
  return best;
}

const nums = [10, 9, 2, 5, 3, 7, 101];
console.log(lengthOfLIS(nums)); // expected: 4`,
  },
  {
    id: "longest-common-subsequence",
    number: 109,
    title: "Longest Common Subsequence",
    group: "Dynamic Programming",
    difficulty: "Medium",
    statement:
      "Given two strings, find the length of the longest sequence of characters that appears in both, in the same order. The characters do not have to be next to each other.",
    example: 'text1 = "abcde", text2 = "ace" → 3',
    approach:
      "Build a table where `dp[i][j]` is the answer for the first i characters of text1 and the first j of text2. If those last characters match, it is one more than the diagonal cell `dp[i - 1][j - 1]`. If not, drop one character from either string and take the better of the cell above and the cell to the left.",
    watch: [
      "row 0 and column 0 are 0: an empty string shares nothing",
      "`row` walks text1, `col` walks text2",
      "a match takes the diagonal + 1; a mismatch copies the larger of up and left",
      "the bottom-right cell `dp[m][n]` holds the answer",
    ],
    complexity: { time: "O(m × n)", space: "O(m × n)" },
    code: `function longestCommonSubsequence(text1, text2) {
  const m = text1.length;
  const n = text2.length;
  // dp[row][col] = LCS of text1's first row chars and text2's first col chars
  const dp = [];
  for (let row = 0; row <= m; row++) dp.push(new Array(n + 1).fill(0));

  for (let row = 1; row <= m; row++) {
    for (let col = 1; col <= n; col++) {
      if (text1[row - 1] === text2[col - 1]) {
        dp[row][col] = dp[row - 1][col - 1] + 1; // match: extend the diagonal
      } else {
        dp[row][col] = Math.max(dp[row - 1][col], dp[row][col - 1]); // skip one char
      }
    }
  }
  return dp[m][n];
}

console.log(longestCommonSubsequence("abcde", "ace")); // expected: 3`,
  },
  {
    id: "word-break",
    number: 110,
    title: "Word Break",
    group: "Dynamic Programming",
    difficulty: "Medium",
    statement:
      "Given a string and a list of dictionary words, decide whether the string can be split into a sequence of dictionary words. A word may be used more than once.",
    example: 's = "leetcode", wordDict = ["leet","code"] → true',
    approach:
      "Let `dp[i]` be true when the first i characters can be split into words. `dp[0]` is true (the empty prefix). For each end `i`, look for a split point `j` where `dp[j]` is true and `s.slice(j, i)` is a word; then `dp[i]` is true too.",
    watch: [
      "`dp[0]` is true: an empty prefix needs no words",
      "for each `i`, `j` tries every split point before it",
      "`dp[4]` turns true because \"leet\" is a word",
      "`dp[8]` turns true at j = 4 because \"code\" is a word and `dp[4]` is true",
    ],
    complexity: { time: "O(n²)", space: "O(n)" },
    code: `function wordBreak(s, wordDict) {
  const words = new Set(wordDict); // instant lookups
  const dp = new Array(s.length + 1).fill(false); // dp[i]: first i chars can be split
  dp[0] = true; // the empty prefix

  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      // prefix up to j splits, and s[j..i) is a word
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[s.length];
}

console.log(wordBreak("leetcode", ["leet", "code"])); // expected: true`,
  },
  {
    id: "unique-paths",
    number: 111,
    title: "Unique Paths",
    group: "Dynamic Programming",
    difficulty: "Medium",
    statement:
      "A robot starts at the top-left of an m × n grid and can only move right or down. Count the different paths to the bottom-right corner.",
    example: "m = 3, n = 4 → 10",
    approach:
      "The robot reaches a cell either from the cell above or from the cell to the left, so the paths to it are the sum of those two. The top row and left column have exactly one path each. Fill the table row by row; the last cell is the answer.",
    watch: [
      "the first row and first column are all 1",
      "each inner cell is `dp[row - 1][col] + dp[row][col - 1]`",
      "the second row fills as 1, 2, 3, 4",
      "`dp[m - 1][n - 1]` is the answer",
    ],
    complexity: { time: "O(m × n)", space: "O(m × n)" },
    code: `function uniquePaths(m, n) {
  // dp[row][col] = number of paths to that cell; edges have one path
  const dp = [];
  for (let row = 0; row < m; row++) dp.push(new Array(n).fill(1));

  for (let row = 1; row < m; row++) {
    for (let col = 1; col < n; col++) {
      dp[row][col] = dp[row - 1][col] + dp[row][col - 1]; // from above + from left
    }
  }
  return dp[m - 1][n - 1];
}

console.log(uniquePaths(3, 4)); // expected: 10`,
  },
  {
    id: "minimum-path-sum",
    number: 112,
    title: "Minimum Path Sum",
    group: "Dynamic Programming",
    difficulty: "Medium",
    statement:
      "A grid holds non-negative numbers. Moving only right or down from the top-left to the bottom-right, find the path whose numbers add up to the smallest total.",
    example: "grid = [[1,3,1],[1,5,1],[4,2,1]] → 7",
    approach:
      "Let `dp[row][col]` be the cheapest total to reach that cell. A cell is reached from above or from the left, so add its own value to the cheaper of those two. The top row and left column have only one way in, so they are running sums.",
    watch: [
      "the top row becomes running sums: 1, 4, 5",
      "the left column becomes running sums: 1, 2, 6",
      "each inner cell adds `grid[row][col]` to the smaller of up and left",
      "the bottom-right cell is 7: 1 → 3 → 1 → 1 → 1",
    ],
    complexity: { time: "O(m × n)", space: "O(m × n)" },
    code: `function minPathSum(grid) {
  const m = grid.length;
  const n = grid[0].length;
  const dp = [];
  for (let row = 0; row < m; row++) dp.push(new Array(n).fill(0));
  dp[0][0] = grid[0][0];

  for (let col = 1; col < n; col++) dp[0][col] = dp[0][col - 1] + grid[0][col]; // top row
  for (let row = 1; row < m; row++) dp[row][0] = dp[row - 1][0] + grid[row][0]; // left column

  for (let row = 1; row < m; row++) {
    for (let col = 1; col < n; col++) {
      // come from the cheaper of above and left
      dp[row][col] = grid[row][col] + Math.min(dp[row - 1][col], dp[row][col - 1]);
    }
  }
  return dp[m - 1][n - 1];
}

const grid = [
  [1, 3, 1],
  [1, 5, 1],
  [4, 2, 1],
];
console.log(minPathSum(grid)); // expected: 7`,
  },
  {
    id: "longest-palindromic-substring",
    number: 113,
    title: "Longest Palindromic Substring",
    group: "Dynamic Programming",
    difficulty: "Medium",
    statement:
      "Find the longest contiguous part of a string that reads the same forwards and backwards. If there are several of the same length, any one is fine.",
    example: 's = "cbbd" → "bb"',
    approach:
      "Let `dp[i][j]` be true when s[i..j] is a palindrome. It is one when the end characters match and the inside s[i+1..j-1] is a palindrome (or is shorter than 2 characters). Fill the table by substring length, so the inside is always known first, and remember the longest true cell.",
    watch: [
      "`len` grows from 1, so shorter substrings are solved before longer ones",
      "`i` is the start and `j` the end of the substring being tested",
      "a cell is true only if `s[i] === s[j]` and the inner cell `dp[i + 1][j - 1]` is true",
      "`start` and `maxLen` update when a longer palindrome is found: \"bb\" at i = 1",
    ],
    complexity: { time: "O(n²)", space: "O(n²)" },
    code: `function longestPalindrome(s) {
  const n = s.length;
  // dp[i][j] = true when s[i..j] is a palindrome
  const dp = [];
  for (let i = 0; i < n; i++) dp.push(new Array(n).fill(false));
  let start = 0;
  let maxLen = 1;

  for (let len = 1; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1; // end of this substring
      // ends match, and the inside is a palindrome (or too short to matter)
      if (s[i] === s[j] && (len <= 2 || dp[i + 1][j - 1])) {
        dp[i][j] = true;
        if (len > maxLen) {
          start = i;
          maxLen = len;
        }
      }
    }
  }
  return s.slice(start, start + maxLen);
}

console.log(JSON.stringify(longestPalindrome("cbbd"))); // expected: "bb"`,
  },
  {
    id: "decode-ways",
    number: 114,
    title: "Decode Ways",
    group: "Dynamic Programming",
    difficulty: "Medium",
    statement:
      "Letters are encoded as numbers: A = 1, B = 2, … Z = 26. Given a string of digits, count how many ways it can be decoded back into letters.",
    example: 's = "1226" → 5',
    approach:
      "Let `dp[i]` be the number of ways to decode the first i digits. The last digit alone works if it is not 0, adding `dp[i - 1]` ways. The last two digits together work if they form 10–26, adding `dp[i - 2]` ways.",
    watch: [
      "`dp[0]` is 1: the empty string has one (empty) decoding",
      "`one` is the last single digit, `two` the last two digits as a number",
      "`dp[i]` adds `dp[i - 1]` for a valid single digit and `dp[i - 2]` for a valid pair",
      "`dp` fills as 1, 1, 2, 3, 5",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function numDecodings(s) {
  const n = s.length;
  const dp = new Array(n + 1).fill(0); // dp[i] = ways to decode the first i digits
  dp[0] = 1; // empty string: one way
  dp[1] = s[0] === "0" ? 0 : 1;

  for (let i = 2; i <= n; i++) {
    const one = Number(s[i - 1]); // last digit on its own
    const two = Number(s.slice(i - 2, i)); // last two digits together
    if (one >= 1) dp[i] += dp[i - 1]; // decode it as a single letter
    if (two >= 10 && two <= 26) dp[i] += dp[i - 2]; // decode the pair as one letter
  }
  return dp[n];
}

console.log(numDecodings("1226")); // expected: 5`,
  },
  {
    id: "house-robber-ii",
    number: 115,
    title: "House Robber II",
    group: "Dynamic Programming",
    difficulty: "Medium",
    statement:
      "Same as House Robber, but the houses stand in a circle, so the first and last house are neighbours. Find the most money you can take without robbing two neighbours.",
    example: "nums = [2,7,9,3,1] → 11",
    approach:
      "The first and last house can never both be robbed, so solve the straight-line problem twice: once without the last house and once without the first. Each run fills its own `dp` array exactly like House Robber. The better of the two runs is the answer.",
    watch: [
      "`robLine` is called twice: on houses 0..3 and on houses 1..4",
      "inside each call, `dp` fills just like House Robber",
      "the first run gives 11 (2 + 9), the second gives 10 (7 + 3)",
      "the answer is the larger of the two results",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `// House Robber on houses lo..hi in a straight line
function robLine(nums, lo, hi) {
  const dp = []; // dp[k] = best using houses lo..lo + k
  for (let i = lo; i <= hi; i++) {
    const k = i - lo;
    const skip = k >= 1 ? dp[k - 1] : 0; // leave house i alone
    const take = (k >= 2 ? dp[k - 2] : 0) + nums[i]; // rob house i
    dp.push(Math.max(skip, take));
  }
  return dp[dp.length - 1];
}

function rob(nums) {
  if (nums.length === 1) return nums[0];
  const n = nums.length;
  const withoutLast = robLine(nums, 0, n - 2); // first house allowed
  const withoutFirst = robLine(nums, 1, n - 1); // last house allowed
  return Math.max(withoutLast, withoutFirst);
}

const nums = [2, 7, 9, 3, 1];
console.log(rob(nums)); // expected: 11`,
  },
];
