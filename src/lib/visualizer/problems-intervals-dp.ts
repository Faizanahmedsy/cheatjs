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
      "when `currentInterval[0] <= last[1]` the two overlap and `last[1]` grows to the larger end",
      "[8,10] starts after 6, so it is pushed as a new interval",
    ],
    complexity: { time: "O(n log n)", space: "O(n)" },
    code: `function merge(intervals) {
  intervals.sort((firstInterval, secondInterval) => firstInterval[0] - secondInterval[0]); // sort by start first
  const merged = [intervals[0]];

  for (let intervalIndex = 1; intervalIndex < intervals.length; intervalIndex++) {
    const currentInterval = intervals[intervalIndex];
    const last = merged[merged.length - 1]; // most recent merged interval
    if (currentInterval[0] <= last[1]) {
      // overlap: stretch the end of the last interval
      last[1] = Math.max(last[1], currentInterval[1]);
    } else {
      merged.push(currentInterval); // no overlap: start a new interval
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
      "`intervalIndex` never goes back: each interval is looked at once",
      "phase 3: [12,16] is copied after the merged interval is pushed",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function insert(intervals, newInterval) {
  const result = [];
  let intervalIndex = 0;

  // 1. intervals that end before the new one starts
  while (intervalIndex < intervals.length && intervals[intervalIndex][1] < newInterval[0]) {
    result.push(intervals[intervalIndex]);
    intervalIndex++;
  }
  // 2. intervals that overlap the new one: merge them in
  while (intervalIndex < intervals.length && intervals[intervalIndex][0] <= newInterval[1]) {
    newInterval[0] = Math.min(newInterval[0], intervals[intervalIndex][0]);
    newInterval[1] = Math.max(newInterval[1], intervals[intervalIndex][1]);
    intervalIndex++;
  }
  result.push(newInterval);
  // 3. intervals that start after the new one ends
  while (intervalIndex < intervals.length) {
    result.push(intervals[intervalIndex]);
    intervalIndex++;
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
      "each pass compares `intervals[intervalIndex][0]` with the previous meeting's end",
      "at intervalIndex = 1 the meeting [5,10] starts before 30, so the answer is false",
    ],
    complexity: { time: "O(n log n)", space: "O(1)" },
    code: `function canAttendMeetings(intervals) {
  intervals.sort((firstMeeting, secondMeeting) => firstMeeting[0] - secondMeeting[0]); // order by start time

  for (let intervalIndex = 1; intervalIndex < intervals.length; intervalIndex++) {
    // starts before the previous meeting has ended?
    if (intervals[intervalIndex][0] < intervals[intervalIndex - 1][1]) {
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
  intervals.sort((firstInterval, secondInterval) => firstInterval[1] - secondInterval[1]); // earliest finish first
  let end = intervals[0][1]; // end of the last kept interval
  let removed = 0;

  for (let intervalIndex = 1; intervalIndex < intervals.length; intervalIndex++) {
    if (intervals[intervalIndex][0] < end) {
      removed++; // overlaps the kept one: drop it
    } else {
      end = intervals[intervalIndex][1]; // no overlap: keep it
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
      "`startIndex` walks the starts, `endIndex` points at the earliest end not yet freed",
      "when `starts[startIndex] >= ends[endIndex]` a meeting has finished: `rooms` goes down and `endIndex` moves",
      "`maxRooms` remembers the peak of `rooms`",
    ],
    complexity: { time: "O(n log n)", space: "O(n)" },
    code: `function minMeetingRooms(intervals) {
  const starts = [];
  const ends = [];
  for (const [meetingStart, meetingEnd] of intervals) {
    starts.push(meetingStart);
    ends.push(meetingEnd);
  }
  starts.sort((first, second) => first - second);
  ends.sort((first, second) => first - second);

  let rooms = 0;
  let maxRooms = 0;
  let endIndex = 0; // earliest meeting end not yet freed
  for (let startIndex = 0; startIndex < starts.length; startIndex++) {
    if (starts[startIndex] >= ends[endIndex]) {
      rooms--; // a meeting ended: free its room
      endIndex++;
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
    example: "nums1 = [1,2,3,0,0,0], nums1Count = 3, nums2 = [2,5,6], nums2Count = 3 → [1,2,2,3,5,6]",
    approach:
      "Fill nums1 from the back. Compare the largest unplaced number of each array and write the bigger one into the last free slot. Working backwards means we never overwrite a number of nums1 that has not been placed yet.",
    watch: [
      "`nums1LastIndex` is the last real number of nums1, `nums2LastIndex` the last of nums2, `writeIndex` the slot being filled",
      "the bigger of `nums1[nums1LastIndex]` and `nums2[nums2LastIndex]` is written to `nums1[writeIndex]`",
      "`writeIndex` moves left every pass; only the pointer whose number was used moves with it",
      "once `nums2LastIndex` drops below 0, the rest of nums1 is already in place",
    ],
    complexity: { time: "O(m + n)", space: "O(1)" },
    code: `function merge(nums1, nums1Count, nums2, nums2Count) {
  let nums1LastIndex = nums1Count - 1; // last real number in nums1
  let nums2LastIndex = nums2Count - 1; // last number in nums2
  let writeIndex = nums1Count + nums2Count - 1; // last slot of nums1

  while (nums2LastIndex >= 0) {
    if (nums1LastIndex >= 0 && nums1[nums1LastIndex] > nums2[nums2LastIndex]) {
      nums1[writeIndex] = nums1[nums1LastIndex]; // nums1 has the bigger one
      nums1LastIndex--;
    } else {
      nums1[writeIndex] = nums2[nums2LastIndex]; // nums2 has the bigger (or equal) one
      nums2LastIndex--;
    }
    writeIndex--;
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
    example: "numbers = [2,0,2,1,1,0] → [0,0,1,1,2,2]",
    approach:
      "This is the Dutch national flag method. Everything before `lowIndex` is 0, everything after `highIndex` is 2, and `middleIndex` scans the unknown middle. A 0 is swapped down to `lowIndex`, a 2 is swapped up to `highIndex`, and a 1 is simply skipped.",
    watch: [
      "`lowIndex`, `middleIndex` and `highIndex` split the array into 0s | 1s | unknown | 2s",
      "after swapping a 2 to `highIndex`, `middleIndex` does not move: the value swapped in is still unchecked",
      "after swapping a 0 to `lowIndex`, both `lowIndex` and `middleIndex` move",
      "the loop ends when `middleIndex` passes `highIndex`",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function sortColors(numbers) {
  let lowIndex = 0; // next place for a 0
  let middleIndex = 0; // the value being looked at
  let highIndex = numbers.length - 1; // next place for a 2

  while (middleIndex <= highIndex) {
    if (numbers[middleIndex] === 0) {
      [numbers[lowIndex], numbers[middleIndex]] = [numbers[middleIndex], numbers[lowIndex]]; // send 0 to the front
      lowIndex++;
      middleIndex++;
    } else if (numbers[middleIndex] === 2) {
      [numbers[middleIndex], numbers[highIndex]] = [numbers[highIndex], numbers[middleIndex]]; // send 2 to the back
      highIndex--; // mid stays: the swapped-in value is unchecked
    } else {
      middleIndex++; // a 1 is already in the middle zone
    }
  }
  return numbers;
}

const numbers = [2, 0, 2, 1, 1, 0];
console.log(sortColors(numbers)); // expected: [0, 0, 1, 1, 2, 2]`,
  },
  {
    id: "sort-list",
    number: 98,
    title: "Sort List",
    group: "Intervals & Sorting",
    difficulty: "Medium",
    statement:
      "Given the head of a linked list, sort it in ascending order and return the new head. Aim for O(n log n) time.",
    example: "listHead = 4 → 2 → 1 → 3 → [1,2,3,4]",
    approach:
      "Use merge sort, which suits linked lists because merging needs no extra array. Find the middle with a slow and a fast pointer, cut the list in two, sort each half recursively, then merge the two sorted halves by always taking the smaller head.",
    watch: [
      "`slowPointer` moves one node while `fastPointer` moves two, so `slowPointer` stops at the middle",
      "`slowPointer.next = null` cuts the list into two halves",
      "the call tree splits down to single nodes, then merges back up",
      "in `mergeLists`, `tailNode` always points at the end of the merged part",
    ],
    complexity: { time: "O(n log n)", space: "O(log n)" },
    code: `class ListNode {
  constructor(value, nextNode = null) {
    this.val = value;
    this.next = nextNode;
  }
}

// merge two sorted lists into one
function mergeLists(firstList, secondList) {
  const dummy = new ListNode(0);
  let tailNode = dummy;
  while (firstList && secondList) {
    if (firstList.val <= secondList.val) {
      tailNode.next = firstList; // take from a
      firstList = firstList.next;
    } else {
      tailNode.next = secondList; // take from b
      secondList = secondList.next;
    }
    tailNode = tailNode.next;
  }
  tailNode.next = firstList || secondList; // attach whatever is left
  return dummy.next;
}

function sortList(listHead) {
  if (!listHead || !listHead.next) return listHead; // 0 or 1 node is sorted

  // find the middle: fast moves twice as fast as slow
  let slowPointer = listHead;
  let fastPointer = listHead.next;
  while (fastPointer && fastPointer.next) {
    slowPointer = slowPointer.next;
    fastPointer = fastPointer.next.next;
  }
  const right = slowPointer.next;
  slowPointer.next = null; // cut the list in two

  return mergeLists(sortList(listHead), sortList(right));
}

function toArray(listHead) {
  const result = [];
  for (let listNode = listHead; listNode; listNode = listNode.next) result.push(listNode.val);
  return result;
}

const listHead = new ListNode(4, new ListNode(2, new ListNode(1, new ListNode(3))));
console.log(toArray(sortList(listHead))); // expected: [1, 2, 3, 4]`,
  },
  {
    id: "sort-an-array",
    number: 99,
    title: "Sort an Array",
    group: "Intervals & Sorting",
    difficulty: "Medium",
    statement:
      "Sort an array of numbers in ascending order without using the built-in sort. It should run in O(n log n) time.",
    example: "numbers = [5,2,3,1,4] → [1,2,3,4,5]",
    approach:
      "Merge sort: split the array in half, sort each half recursively, then merge the two sorted halves. Merging walks both halves with one pointer each and always takes the smaller front value, so the result stays sorted.",
    watch: [
      "`middleIndex` splits each array in two until pieces have one element",
      "the call tree goes down splitting, then comes back up merging",
      "in `mergeHalves`, `leftHalfIndex` and `rightHalfIndex` point at the front of each half",
      "whichever of `left[leftHalfIndex]` and `right[rightHalfIndex]` is smaller is pushed to `result`",
    ],
    complexity: { time: "O(n log n)", space: "O(n)" },
    code: `// merge two sorted arrays into one sorted array
function mergeHalves(left, right) {
  const result = [];
  let leftHalfIndex = 0;
  let rightHalfIndex = 0;
  while (leftHalfIndex < left.length && rightHalfIndex < right.length) {
    if (left[leftHalfIndex] <= right[rightHalfIndex]) {
      result.push(left[leftHalfIndex]);
      leftHalfIndex++;
    } else {
      result.push(right[rightHalfIndex]);
      rightHalfIndex++;
    }
  }
  // one half is used up: copy the rest of the other
  while (leftHalfIndex < left.length) result.push(left[leftHalfIndex++]);
  while (rightHalfIndex < right.length) result.push(right[rightHalfIndex++]);
  return result;
}

function sortArray(numbers) {
  if (numbers.length <= 1) return numbers; // already sorted
  const middleIndex = Math.floor(numbers.length / 2);
  const left = sortArray(numbers.slice(0, middleIndex));
  const right = sortArray(numbers.slice(middleIndex));
  return mergeHalves(left, right);
}

const numbers = [5, 2, 3, 1, 4];
console.log(sortArray(numbers)); // expected: [1, 2, 3, 4, 5]`,
  },
  {
    id: "kth-largest-element",
    number: 100,
    title: "Kth Largest Element in an Array",
    group: "Intervals & Sorting",
    difficulty: "Medium",
    statement:
      "Find the kth largest number in an unsorted array. It is the kth largest in sorted order, not the kth distinct value.",
    example: "numbers = [3,2,1,5,6,4], targetRank = 2 → 5",
    approach:
      "Quickselect: the kth largest sits at index n - k once the array is sorted. Partition around a pivot so smaller values go left and larger go right; the pivot then lands at its final index. If that index is the target we are done, otherwise keep only the side that contains the target.",
    watch: [
      "`target` is the index the answer would have in sorted order (n - targetRank = 4)",
      "in each partition, `storeIndex` marks where the next value smaller than the pivot goes",
      "after the partition, the pivot sits at `storeIndex` in its final sorted place",
      "`lowIndex` or `highIndex` jumps past `storeIndex`, throwing away the half that cannot hold the answer",
    ],
    complexity: { time: "O(n) average", space: "O(1)" },
    code: `function findKthLargest(numbers, targetRank) {
  const target = numbers.length - targetRank; // index of the answer when sorted
  let lowIndex = 0;
  let highIndex = numbers.length - 1;

  while (lowIndex <= highIndex) {
    // partition numbers[lo..hi] around the last value
    const pivot = numbers[highIndex];
    let storeIndex = lowIndex; // next place for a value smaller than the pivot
    for (let index = lowIndex; index < highIndex; index++) {
      if (numbers[index] < pivot) {
        [numbers[storeIndex], numbers[index]] = [numbers[index], numbers[storeIndex]];
        storeIndex++;
      }
    }
    [numbers[storeIndex], numbers[highIndex]] = [numbers[highIndex], numbers[storeIndex]]; // pivot to its final place

    if (storeIndex === target) return numbers[storeIndex];
    if (storeIndex < target) lowIndex = storeIndex + 1; // answer is to the right
    else highIndex = storeIndex - 1; // answer is to the left
  }
  return -1;
}

const numbers = [3, 2, 1, 5, 6, 4];
console.log(findKthLargest(numbers, 2)); // expected: 5`,
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
    example: "stairCount = 5 → 8",
    approach:
      "To stand on step i, your last move came either from step i - 1 or from step i - 2. So the ways to reach i are the ways to reach i - 1 plus the ways to reach i - 2. Fill a `waysToReach` array from the bottom using that rule.",
    watch: [
      "`waysToReach[1] = 1` and `waysToReach[2] = 2` are the starting answers",
      "each new cell is the sum of the two cells before it",
      "watch `waysToReach` fill left to right: 1, 2, 3, 5, 8",
      "`waysToReach[stairCount]` is the answer",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function climbStairs(stairCount) {
  if (stairCount <= 2) return stairCount;
  const waysToReach = new Array(stairCount + 1).fill(0); // waysToReach[stepNumber] = ways to reach step i
  waysToReach[1] = 1; // one way: a single step
  waysToReach[2] = 2; // 1+1 or 2

  for (let stepNumber = 3; stepNumber <= stairCount; stepNumber++) {
    waysToReach[stepNumber] = waysToReach[stepNumber - 1] + waysToReach[stepNumber - 2]; // came from one step or two steps below
  }
  return waysToReach[stairCount];
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
    example: "numbers = [2,7,9,3,1] → 12",
    approach:
      "Let `bestLoot[houseIndex]` be the best total using houses 0..i. At house i you either skip it (keep `bestLoot[houseIndex - 1]`) or rob it, which means adding its money to `bestLoot[houseIndex - 2]`. Take the larger choice; the last cell is the answer.",
    watch: [
      "`bestLoot[0]` is the first house, `bestLoot[1]` the better of the first two",
      "each pass compares skip (`bestLoot[houseIndex - 1]`) with rob (`bestLoot[houseIndex - 2] + numbers[houseIndex]`)",
      "at houseIndex = 2, robbing 9 on top of 2 (11) beats 7",
      "`bestLoot` fills as 2, 7, 11, 11, 12",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function rob(numbers) {
  if (numbers.length === 1) return numbers[0];
  const bestLoot = new Array(numbers.length).fill(0); // bestLoot[houseIndex] = best using houses 0..i
  bestLoot[0] = numbers[0];
  bestLoot[1] = Math.max(numbers[0], numbers[1]);

  for (let houseIndex = 2; houseIndex < numbers.length; houseIndex++) {
    const skip = bestLoot[houseIndex - 1]; // leave house i alone
    const take = bestLoot[houseIndex - 2] + numbers[houseIndex]; // rob house i, so houseIndex - 1 is off limits
    bestLoot[houseIndex] = Math.max(skip, take);
  }
  return bestLoot[numbers.length - 1];
}

const numbers = [2, 7, 9, 3, 1];
console.log(rob(numbers)); // expected: 12`,
  },
  {
    id: "min-cost-climbing-stairs",
    number: 103,
    title: "Min Cost Climbing Stairs",
    group: "Dynamic Programming",
    difficulty: "Easy",
    statement:
      "Each step has a cost you pay when you leave it, and you can climb 1 or 2 steps at a time. You may start on step 0 or step 1. Find the cheapest way to get past the last step.",
    example: "stepCosts = [1,100,1,1,1,100,1] → 4",
    approach:
      "Let `cheapestCost[stepNumber]` be the cheapest cost to stand on step i. You reach step i from step i - 1 (paying its cost) or from step i - 2 (paying its cost), so take the cheaper. Starting on step 0 or 1 is free, and the top is one position past the last step.",
    watch: [
      "`cheapestCost[0]` and `cheapestCost[1]` are 0: you may start on either for free",
      "each pass picks the cheaper of `cheapestCost[stepNumber - 1] + stepCosts[stepNumber - 1]` and `cheapestCost[stepNumber - 2] + stepCosts[stepNumber - 2]`",
      "the expensive 100 steps are jumped over",
      "`cheapestCost[stepCount]` (one past the end) is the top of the stairs",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function minCostClimbingStairs(stepCosts) {
  const stepCount = stepCosts.length;
  const cheapestCost = new Array(stepCount + 1).fill(0); // cheapestCost[stepNumber] = cheapest cost to stand on step i
  // cheapestCost[0] and cheapestCost[1] stay 0: starting there is free

  for (let stepNumber = 2; stepNumber <= stepCount; stepNumber++) {
    const oneStep = cheapestCost[stepNumber - 1] + stepCosts[stepNumber - 1]; // came from the step just below
    const twoSteps = cheapestCost[stepNumber - 2] + stepCosts[stepNumber - 2]; // came from two steps below
    cheapestCost[stepNumber] = Math.min(oneStep, twoSteps);
  }
  return cheapestCost[stepCount]; // the top is past the last step
}

const stepCosts = [1, 100, 1, 1, 1, 100, 1];
console.log(minCostClimbingStairs(stepCosts)); // expected: 4`,
  },
  {
    id: "maximum-subarray",
    number: 104,
    title: "Maximum Subarray",
    group: "Dynamic Programming",
    difficulty: "Medium",
    statement:
      "Find the contiguous part of the array with the largest sum and return that sum. The part must contain at least one number.",
    example: "numbers = [-2,1,-3,4,-1,2,1,-5] → 6",
    approach:
      "Let `bestSumEndingHere[numberIndex]` be the best sum of a subarray that ends exactly at i. Either it extends the best subarray ending at i - 1, or it starts fresh at i; extend only if `bestSumEndingHere[numberIndex - 1]` is positive. The answer is the largest value anywhere in `bestSumEndingHere` (this is Kadane's algorithm).",
    watch: [
      "`bestSumEndingHere[numberIndex]` chooses between `numbers[numberIndex]` alone and `bestSumEndingHere[numberIndex - 1] + numbers[numberIndex]`",
      "a negative `bestSumEndingHere[numberIndex - 1]` is dropped: at numberIndex = 3 the run restarts at 4",
      "`best` tracks the largest `bestSumEndingHere` value seen so far",
      "`bestSumEndingHere` reaches 6 at numberIndex = 6 (the subarray [4,-1,2,1])",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function maxSubArray(numbers) {
  const bestSumEndingHere = new Array(numbers.length).fill(0); // bestSumEndingHere[numberIndex] = best sum ending at i
  bestSumEndingHere[0] = numbers[0];
  let best = bestSumEndingHere[0];

  for (let numberIndex = 1; numberIndex < numbers.length; numberIndex++) {
    // extend the previous run, or start a new one here
    bestSumEndingHere[numberIndex] = Math.max(numbers[numberIndex], bestSumEndingHere[numberIndex - 1] + numbers[numberIndex]);
    best = Math.max(best, bestSumEndingHere[numberIndex]);
  }
  return best;
}

const numbers = [-2, 1, -3, 4, -1, 2, 1, -5];
console.log(maxSubArray(numbers)); // expected: 6`,
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
      "Each row depends only on the row before it. Start every row as all 1s, then fill each inner cell with the two cells above it: `rowAbove[columnIndex - 1] + rowAbove[columnIndex]`. Push the row and move on.",
    watch: [
      "`rowAbove` is the row above, `newRow` the row being built",
      "`newRow` starts as all 1s, so the edges are already right",
      "each inner `newRow[columnIndex]` is `rowAbove[columnIndex - 1] + rowAbove[columnIndex]`",
      "`triangle` grows by one row per pass",
    ],
    complexity: { time: "O(n²)", space: "O(n²)" },
    code: `function generate(numRows) {
  const triangle = [[1]]; // the first row

  for (let rowIndex = 1; rowIndex < numRows; rowIndex++) {
    const rowAbove = triangle[rowIndex - 1]; // the row above
    const newRow = new Array(rowIndex + 1).fill(1); // edges are always 1
    for (let columnIndex = 1; columnIndex < rowIndex; columnIndex++) {
      newRow[columnIndex] = rowAbove[columnIndex - 1] + rowAbove[columnIndex]; // sum of the two above
    }
    triangle.push(newRow);
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
      "Keep a single `rowValues` row and update it in place to become the next row. Each new value is the old value plus the one to its left. Go from right to left so the left neighbour you add is still the old row's value.",
    watch: [
      "`rowValues` starts as [1, 0, 0, 0, 0]",
      "each outer pass turns `rowValues` into the next row",
      "`columnIndex` runs right to left, so `rowValues[columnIndex - 1]` is still from the previous row",
      "after 4 passes `rowValues` is [1, 4, 6, 4, 1]",
    ],
    complexity: { time: "O(n²)", space: "O(n)" },
    code: `function getRow(rowIndex) {
  const rowValues = new Array(rowIndex + 1).fill(0);
  rowValues[0] = 1; // row 0 is [1]

  for (let rowNumber = 1; rowNumber <= rowIndex; rowNumber++) {
    // right to left, so rowValues[columnIndex - 1] is still the old row's value
    for (let columnIndex = rowNumber; columnIndex >= 1; columnIndex--) {
      rowValues[columnIndex] = rowValues[columnIndex] + rowValues[columnIndex - 1];
    }
  }
  return rowValues;
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
      "Let `fewestCoins[currentAmount]` be the fewest coins that make amount a. For each amount, try every coin: if the coin fits, one coin plus the best way to make the remainder (`fewestCoins[currentAmount - coin] + 1`) is a candidate. Fill amounts from 0 upward so every remainder is already solved.",
    watch: [
      "`fewestCoins[0]` is 0; every other cell starts at Infinity (not reachable yet)",
      "for each amount `currentAmount`, each coin offers `fewestCoins[currentAmount - coin] + 1`",
      "`fewestCoins[currentAmount]` only ever goes down as better coins are tried",
      "`fewestCoins[7]` becomes 2 through the coin 5 (5 + 2)",
    ],
    complexity: { time: "O(amount × coins)", space: "O(amount)" },
    code: `function coinChange(coins, amount) {
  const fewestCoins = new Array(amount + 1).fill(Infinity); // fewestCoins[currentAmount] = fewest coins for a
  fewestCoins[0] = 0; // zero coins make 0

  for (let currentAmount = 1; currentAmount <= amount; currentAmount++) {
    for (const coin of coins) {
      if (coin <= currentAmount) {
        // use this coin, then the best way to make what is left
        fewestCoins[currentAmount] = Math.min(fewestCoins[currentAmount], fewestCoins[currentAmount - coin] + 1);
      }
    }
  }
  return fewestCoins[amount] === Infinity ? -1 : fewestCoins[amount];
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
    example: "numbers = [10,9,2,5,3,7,101] → 4",
    approach:
      "Let `longestEndingHere[endIndex]` be the length of the longest increasing subsequence that ends at i. Every element alone has length 1. For each earlier `earlierIndex` with a smaller value, `numbers[endIndex]` can extend that subsequence, giving `longestEndingHere[earlierIndex] + 1`. The answer is the largest value in `longestEndingHere`.",
    watch: [
      "`longestEndingHere` starts as all 1s: each number alone is a subsequence",
      "`earlierIndex` scans every index before `endIndex`",
      "when `numbers[earlierIndex] < numbers[endIndex]`, `longestEndingHere[endIndex]` may grow to `longestEndingHere[earlierIndex] + 1`",
      "`longestEndingHere` ends as [1, 1, 1, 2, 2, 3, 4]: 2 → 5 → 7 → 101",
    ],
    complexity: { time: "O(n²)", space: "O(n)" },
    code: `function lengthOfLIS(numbers) {
  const longestEndingHere = new Array(numbers.length).fill(1); // longestEndingHere[endIndex] = longest run ending at i
  let best = 1;

  for (let endIndex = 1; endIndex < numbers.length; endIndex++) {
    for (let earlierIndex = 0; earlierIndex < endIndex; earlierIndex++) {
      if (numbers[earlierIndex] < numbers[endIndex]) {
        // numbers[endIndex] can extend the run that ends at j
        longestEndingHere[endIndex] = Math.max(longestEndingHere[endIndex], longestEndingHere[earlierIndex] + 1);
      }
    }
    best = Math.max(best, longestEndingHere[endIndex]);
  }
  return best;
}

const numbers = [10, 9, 2, 5, 3, 7, 101];
console.log(lengthOfLIS(numbers)); // expected: 4`,
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
      "Build a table where `lcsTable[i][j]` is the answer for the first i characters of text1 and the first j of text2. If those last characters match, it is one more than the diagonal cell `lcsTable[i - 1][j - 1]`. If not, drop one character from either string and take the better of the cell above and the cell to the left.",
    watch: [
      "row 0 and column 0 are 0: an empty string shares nothing",
      "`firstPrefixLength` walks text1, `secondPrefixLength` walks text2",
      "a match takes the diagonal + 1; a mismatch copies the larger of up and left",
      "the bottom-right cell `lcsTable[firstLength][secondLength]` holds the answer",
    ],
    complexity: { time: "O(m × n)", space: "O(m × n)" },
    code: `function longestCommonSubsequence(text1, text2) {
  const firstLength = text1.length;
  const secondLength = text2.length;
  // lcsTable[firstPrefixLength][secondPrefixLength] = LCS of text1's first row chars and text2's first col chars
  const lcsTable = [];
  for (let firstPrefixLength = 0; firstPrefixLength <= firstLength; firstPrefixLength++) lcsTable.push(new Array(secondLength + 1).fill(0));

  for (let firstPrefixLength = 1; firstPrefixLength <= firstLength; firstPrefixLength++) {
    for (let secondPrefixLength = 1; secondPrefixLength <= secondLength; secondPrefixLength++) {
      if (text1[firstPrefixLength - 1] === text2[secondPrefixLength - 1]) {
        lcsTable[firstPrefixLength][secondPrefixLength] = lcsTable[firstPrefixLength - 1][secondPrefixLength - 1] + 1; // match: extend the diagonal
      } else {
        lcsTable[firstPrefixLength][secondPrefixLength] = Math.max(lcsTable[firstPrefixLength - 1][secondPrefixLength], lcsTable[firstPrefixLength][secondPrefixLength - 1]); // skip one char
      }
    }
  }
  return lcsTable[firstLength][secondLength];
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
    example: 'text = "leetcode", wordDict = ["leet","code"] → true',
    approach:
      "Let `canSplit[prefixLength]` be true when the first i characters can be split into words. `canSplit[0]` is true (the empty prefix). For each end `prefixLength`, look for a split point `splitPoint` where `canSplit[splitPoint]` is true and `text.slice(splitPoint, prefixLength)` is a word; then `canSplit[prefixLength]` is true too.",
    watch: [
      "`canSplit[0]` is true: an empty prefix needs no words",
      "for each `prefixLength`, `splitPoint` tries every split point before it",
      "`canSplit[4]` turns true because \"leet\" is a word",
      "`canSplit[8]` turns true at splitPoint = 4 because \"code\" is a word and `canSplit[4]` is true",
    ],
    complexity: { time: "O(n²)", space: "O(n)" },
    code: `function wordBreak(text, wordDict) {
  const words = new Set(wordDict); // instant lookups
  const canSplit = new Array(text.length + 1).fill(false); // canSplit[prefixLength]: first i chars can be split
  canSplit[0] = true; // the empty prefix

  for (let prefixLength = 1; prefixLength <= text.length; prefixLength++) {
    for (let splitPoint = 0; splitPoint < prefixLength; splitPoint++) {
      // prefix up to j splits, and text[j..i) is a word
      if (canSplit[splitPoint] && words.has(text.slice(splitPoint, prefixLength))) {
        canSplit[prefixLength] = true;
        break;
      }
    }
  }
  return canSplit[text.length];
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
    example: "rowCount = 3, columnCount = 4 → 10",
    approach:
      "The robot reaches a cell either from the cell above or from the cell to the left, so the paths to it are the sum of those two. The top row and left column have exactly one path each. Fill the table row by row; the last cell is the answer.",
    watch: [
      "the first row and first column are all 1",
      "each inner cell is `pathCount[rowIndex - 1][columnIndex] + pathCount[rowIndex][columnIndex - 1]`",
      "the second row fills as 1, 2, 3, 4",
      "`pathCount[rowCount - 1][columnCount - 1]` is the answer",
    ],
    complexity: { time: "O(m × n)", space: "O(m × n)" },
    code: `function uniquePaths(rowCount, columnCount) {
  // pathCount[rowIndex][columnIndex] = number of paths to that cell; edges have one path
  const pathCount = [];
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) pathCount.push(new Array(columnCount).fill(1));

  for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
    for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
      pathCount[rowIndex][columnIndex] = pathCount[rowIndex - 1][columnIndex] + pathCount[rowIndex][columnIndex - 1]; // from above + from left
    }
  }
  return pathCount[rowCount - 1][columnCount - 1];
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
      "Let `cheapestSum[rowIndex][columnIndex]` be the cheapest total to reach that cell. A cell is reached from above or from the left, so add its own value to the cheaper of those two. The top row and left column have only one way in, so they are running sums.",
    watch: [
      "the top row becomes running sums: 1, 4, 5",
      "the left column becomes running sums: 1, 2, 6",
      "each inner cell adds `grid[rowIndex][columnIndex]` to the smaller of up and left",
      "the bottom-right cell is 7: 1 → 3 → 1 → 1 → 1",
    ],
    complexity: { time: "O(m × n)", space: "O(m × n)" },
    code: `function minPathSum(grid) {
  const rowCount = grid.length;
  const columnCount = grid[0].length;
  const cheapestSum = [];
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) cheapestSum.push(new Array(columnCount).fill(0));
  cheapestSum[0][0] = grid[0][0];

  for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) cheapestSum[0][columnIndex] = cheapestSum[0][columnIndex - 1] + grid[0][columnIndex]; // top row
  for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) cheapestSum[rowIndex][0] = cheapestSum[rowIndex - 1][0] + grid[rowIndex][0]; // left column

  for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
    for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
      // come from the cheaper of above and left
      cheapestSum[rowIndex][columnIndex] = grid[rowIndex][columnIndex] + Math.min(cheapestSum[rowIndex - 1][columnIndex], cheapestSum[rowIndex][columnIndex - 1]);
    }
  }
  return cheapestSum[rowCount - 1][columnCount - 1];
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
    example: 'text = "cbbd" → "bb"',
    approach:
      "Let `isPalindromeTable[startIndex][endIndex]` be true when s[i..j] is a palindrome. It is one when the end characters match and the inside s[i+1..j-1] is a palindrome (or is shorter than 2 characters). Fill the table by substring length, so the inside is always known first, and remember the longest true cell.",
    watch: [
      "`substringLength` grows from 1, so shorter substrings are solved before longer ones",
      "`startIndex` is the start and `endIndex` the end of the substring being tested",
      "a cell is true only if `text[startIndex] === text[endIndex]` and the inner cell `isPalindromeTable[startIndex + 1][endIndex - 1]` is true",
      "`start` and `maxLen` update when a longer palindrome is found: \"bb\" at startIndex = 1",
    ],
    complexity: { time: "O(n²)", space: "O(n²)" },
    code: `function longestPalindrome(text) {
  const textLength = text.length;
  // isPalindromeTable[startIndex][endIndex] = true when text[i..j] is a palindrome
  const isPalindromeTable = [];
  for (let startIndex = 0; startIndex < textLength; startIndex++) isPalindromeTable.push(new Array(textLength).fill(false));
  let start = 0;
  let maxLen = 1;

  for (let substringLength = 1; substringLength <= textLength; substringLength++) {
    for (let startIndex = 0; startIndex + substringLength - 1 < textLength; startIndex++) {
      const endIndex = startIndex + substringLength - 1; // end of this substring
      // ends match, and the inside is a palindrome (or too short to matter)
      if (text[startIndex] === text[endIndex] && (substringLength <= 2 || isPalindromeTable[startIndex + 1][endIndex - 1])) {
        isPalindromeTable[startIndex][endIndex] = true;
        if (substringLength > maxLen) {
          start = startIndex;
          maxLen = substringLength;
        }
      }
    }
  }
  return text.slice(start, start + maxLen);
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
    example: 'text = "1226" → 5',
    approach:
      "Let `waysToDecode[prefixLength]` be the number of ways to decode the first i digits. The last digit alone works if it is not 0, adding `waysToDecode[prefixLength - 1]` ways. The last two digits together work if they form 10–26, adding `waysToDecode[prefixLength - 2]` ways.",
    watch: [
      "`waysToDecode[0]` is 1: the empty string has one (empty) decoding",
      "`lastDigit` is the last single digit, `lastTwoDigits` the last two digits as a number",
      "`waysToDecode[prefixLength]` adds `waysToDecode[prefixLength - 1]` for a valid single digit and `waysToDecode[prefixLength - 2]` for a valid pair",
      "`waysToDecode` fills as 1, 1, 2, 3, 5",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function numDecodings(text) {
  const digitCount = text.length;
  const waysToDecode = new Array(digitCount + 1).fill(0); // waysToDecode[prefixLength] = ways to decode the first i digits
  waysToDecode[0] = 1; // empty string: one way
  waysToDecode[1] = text[0] === "0" ? 0 : 1;

  for (let prefixLength = 2; prefixLength <= digitCount; prefixLength++) {
    const lastDigit = Number(text[prefixLength - 1]); // last digit on its own
    const lastTwoDigits = Number(text.slice(prefixLength - 2, prefixLength)); // last two digits together
    if (lastDigit >= 1) waysToDecode[prefixLength] += waysToDecode[prefixLength - 1]; // decode it as a single letter
    if (lastTwoDigits >= 10 && lastTwoDigits <= 26) waysToDecode[prefixLength] += waysToDecode[prefixLength - 2]; // decode the pair as one letter
  }
  return waysToDecode[digitCount];
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
    example: "numbers = [2,7,9,3,1] → 11",
    approach:
      "The first and last house can never both be robbed, so solve the straight-line problem twice: once without the last house and once without the first. Each run fills its own `bestLoot` array exactly like House Robber. The better of the two runs is the answer.",
    watch: [
      "`robLine` is called twice: on houses 0..3 and on houses 1..4",
      "inside each call, `bestLoot` fills just like House Robber",
      "the first run gives 11 (2 + 9), the second gives 10 (7 + 3)",
      "the answer is the larger of the two results",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `// House Robber on houses lo..hi in a straight line
function robLine(numbers, firstHouse, lastHouse) {
  const bestLoot = []; // bestLoot[position] = best using houses lo..lo + k
  for (let houseIndex = firstHouse; houseIndex <= lastHouse; houseIndex++) {
    const position = houseIndex - firstHouse;
    const skip = position >= 1 ? bestLoot[position - 1] : 0; // leave house i alone
    const take = (position >= 2 ? bestLoot[position - 2] : 0) + numbers[houseIndex]; // rob house i
    bestLoot.push(Math.max(skip, take));
  }
  return bestLoot[bestLoot.length - 1];
}

function rob(numbers) {
  if (numbers.length === 1) return numbers[0];
  const houseCount = numbers.length;
  const withoutLast = robLine(numbers, 0, houseCount - 2); // first house allowed
  const withoutFirst = robLine(numbers, 1, houseCount - 1); // last house allowed
  return Math.max(withoutLast, withoutFirst);
}

const numbers = [2, 7, 9, 3, 1];
console.log(rob(numbers)); // expected: 11`,
  },
];
