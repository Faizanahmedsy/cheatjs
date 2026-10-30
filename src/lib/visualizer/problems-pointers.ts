import type { Problem } from "./problem-types";

/** Practice problems 16–35: Two Pointers (16–25) and Sliding Window (26–35). */
export const POINTER_PROBLEMS: Problem[] = [
  // ───────────────────────────── Two Pointers ─────────────────────────────
  {
    id: "valid-palindrome",
    number: 16,
    title: "Valid Palindrome",
    group: "Two Pointers",
    difficulty: "Easy",
    statement:
      "Given a string, decide whether it reads the same forwards and backwards. Ignore case, and skip anything that is not a letter or a digit.",
    example: 's = "Taco cat!" → true',
    approach:
      "Put one pointer at the start and one at the end. Skip characters that are not letters or digits, then compare the two characters: if they ever differ, it is not a palindrome. Each step moves a pointer inward, so every character is looked at once.",
    watch: [
      "`left` and `right` walk towards each other from the two ends",
      "the space and the `!` are skipped: only one pointer moves on those steps",
      "each comparison `s[left] !== s[right]` is the moment of truth: one mismatch means false",
      "the loop stops when the pointers meet in the middle",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `// true for a lowercase letter or a digit
function isAlphaNum(ch) {
  return (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9");
}

function isPalindrome(s) {
  s = s.toLowerCase(); // compare without caring about case
  let left = 0; // starts at the first character
  let right = s.length - 1; // starts at the last character

  while (left < right) {
    // skip anything that is not a letter or digit
    if (!isAlphaNum(s[left])) {
      left++;
      continue;
    }
    if (!isAlphaNum(s[right])) {
      right--;
      continue;
    }
    // the two ends must match
    if (s[left] !== s[right]) {
      return false;
    }
    // both matched: move inward
    left++;
    right--;
  }
  return true; // every pair matched
}

console.log(isPalindrome("Taco cat!")); // expected: true`,
  },
  {
    id: "two-sum-ii",
    number: 17,
    title: "Two Sum II (Sorted Input)",
    group: "Two Pointers",
    difficulty: "Medium",
    statement:
      "The array is sorted from small to large. Find the two numbers that add up to the target and return their positions, counting from 1.",
    example: "numbers = [1,3,4,6,8,11], target = 10 → [3,4]",
    approach:
      "Start with the smallest number (left) and the largest (right). If their sum is too big, the only way to shrink it is to move right inward; if it is too small, move left inward. Because the array is sorted, every move safely throws away a number that can never be part of the answer.",
    watch: [
      "`sum` is checked against `target` on every pass",
      "sum too big → `right` steps left; sum too small → `left` steps right",
      "only one pointer moves per pass, so at most n passes",
      "the answer adds 1 to each index because the problem counts from 1",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function twoSum(numbers, target) {
  let left = 0; // smallest number
  let right = numbers.length - 1; // largest number

  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) {
      return [left + 1, right + 1]; // positions counted from 1
    } else if (sum > target) {
      right--; // too big: use a smaller number
    } else {
      left++; // too small: use a bigger number
    }
  }
  return []; // no pair found
}

const numbers = [1, 3, 4, 6, 8, 11];
console.log(twoSum(numbers, 10)); // expected: [3, 4]`,
  },
  {
    id: "three-sum",
    number: 18,
    title: "3Sum",
    group: "Two Pointers",
    difficulty: "Medium",
    statement:
      "Find every group of three numbers in the array that adds up to zero. Each group should appear only once, even if the array has repeated values.",
    example: "nums = [-1,0,1,2,-1,-4] → [[-1,-1,2],[-1,0,1]]",
    approach:
      "Sort the array first. Fix one number at a time (`i`), then look for two more numbers after it that add up to its negative, using the Two Sum II trick with `left` and `right`. Skipping values equal to the previous one stops duplicate triplets from being added.",
    watch: [
      "after sorting, `i` fixes the first number of the triplet",
      "`left` and `right` close in on the rest of the array, just like Two Sum II",
      "when `sum` is 0 the triplet is saved and both pointers move",
      "the `while` loops that skip equal values are what prevent duplicates",
    ],
    complexity: { time: "O(n²)", space: "O(1)" },
    code: `function threeSum(nums) {
  nums.sort((a, b) => a - b); // sort once so two pointers work
  const result = [];

  for (let i = 0; i < nums.length - 2; i++) {
    // skip a first number we already tried
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let left = i + 1;
    let right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        left++;
        right--;
        // skip repeated values so the triplet is not added twice
        while (left < right && nums[left] === nums[left - 1]) left++;
        while (left < right && nums[right] === nums[right + 1]) right--;
      } else if (sum < 0) {
        left++; // need a bigger total
      } else {
        right--; // need a smaller total
      }
    }
  }
  return result;
}

const nums = [-1, 0, 1, 2, -1, -4];
console.log(threeSum(nums)); // expected: [[-1, -1, 2], [-1, 0, 1]]`,
  },
  {
    id: "container-with-most-water",
    number: 19,
    title: "Container With Most Water",
    group: "Two Pointers",
    difficulty: "Medium",
    statement:
      "Each number is the height of a vertical line. Pick two lines that, together with the floor, hold the most water, and return that amount.",
    example: "height = [1,8,6,2,5,4,8,3,7] → 49",
    approach:
      "Start with the widest container: the first and the last line. The water level is set by the shorter line, so moving the taller line inward can never help. Always move the shorter line inward and keep the best area seen.",
    watch: [
      "`area` is width `right - left` times the shorter of the two heights",
      "`best` only changes when a bigger area appears",
      "the pointer at the shorter line is the one that moves",
      "the width shrinks by one every pass, so the loop runs n − 1 times",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let best = 0;

  while (left < right) {
    // the shorter line sets the water level
    const h = Math.min(height[left], height[right]);
    const area = h * (right - left);
    best = Math.max(best, area);

    // move the shorter line: the taller one can't do better here
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  return best;
}

const height = [1, 8, 6, 2, 5, 4, 8, 3, 7];
console.log(maxArea(height)); // expected: 49`,
  },
  {
    id: "move-zeroes",
    number: 20,
    title: "Move Zeroes",
    group: "Two Pointers",
    difficulty: "Easy",
    statement:
      "Move every 0 in the array to the end, keeping the other numbers in their original order. Change the array in place.",
    example: "nums = [0,1,0,3,12] → [1,3,12,0,0]",
    approach:
      "`slow` marks where the next non-zero number belongs, and `fast` scans every element. Whenever `fast` finds a non-zero, swap it into position `slow` and move `slow` forward. The zeros get pushed back as the non-zeros are pulled forward in order.",
    watch: [
      "`fast` visits every index once",
      "`slow` only moves when a non-zero is placed",
      "each swap moves a non-zero forward and a zero back",
      "everything before `slow` is always non-zero and in order",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function moveZeroes(nums) {
  let slow = 0; // where the next non-zero goes

  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== 0) {
      // swap the non-zero into place
      [nums[slow], nums[fast]] = [nums[fast], nums[slow]];
      slow++;
    }
  }
  return nums;
}

const nums = [0, 1, 0, 3, 12];
console.log(moveZeroes(nums)); // expected: [1, 3, 12, 0, 0]`,
  },
  {
    id: "remove-duplicates-sorted-array",
    number: 21,
    title: "Remove Duplicates from Sorted Array",
    group: "Two Pointers",
    difficulty: "Easy",
    statement:
      "The array is sorted. Remove repeats in place so each value appears once at the front, and return how many unique values there are.",
    example: "nums = [0,0,1,1,1,2,2,3] → 4, front = [0,1,2,3]",
    approach:
      "Because the array is sorted, repeats sit next to each other. `slow` points at the last unique value kept; `fast` scans ahead. When `fast` finds a value different from `nums[slow]`, it is new, so copy it to `slow + 1`.",
    watch: [
      "`nums[fast]` is compared with `nums[slow]`, the last kept value",
      "on a new value `slow` moves forward and the value is copied there",
      "repeats are simply skipped by `fast`",
      "the answer is `slow + 1`, the count of kept values",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function removeDuplicates(nums) {
  let slow = 0; // last unique value kept

  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++; // make room for the new value
      nums[slow] = nums[fast]; // keep it
    }
  }
  return slow + 1; // how many unique values
}

const nums = [0, 0, 1, 1, 1, 2, 2, 3];
const k = removeDuplicates(nums);
console.log(k, nums.slice(0, k)); // expected: 4 [0, 1, 2, 3]`,
  },
  {
    id: "remove-element",
    number: 22,
    title: "Remove Element",
    group: "Two Pointers",
    difficulty: "Easy",
    statement:
      "Remove every copy of a given value from the array in place. Return how many elements are left; they must sit at the front of the array.",
    example: "nums = [3,2,2,3,4], val = 3 → 3, front = [2,2,4]",
    approach:
      "`slow` is where the next kept element goes, and `fast` checks every element. Anything not equal to `val` is copied to `slow`, and `slow` moves on. Elements equal to `val` are simply skipped.",
    watch: [
      "`fast` reads every element once",
      "`slow` only moves when an element is kept",
      "on a kept element, `nums[slow]` is overwritten with `nums[fast]`",
      "the final `slow` is the count of kept elements",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function removeElement(nums, val) {
  let slow = 0; // where the next kept element goes

  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== val) {
      nums[slow] = nums[fast]; // keep it
      slow++;
    }
  }
  return slow; // how many elements are kept
}

const nums = [3, 2, 2, 3, 4];
const k = removeElement(nums, 3);
console.log(k, nums.slice(0, k)); // expected: 3 [2, 2, 4]`,
  },
  {
    id: "reverse-string",
    number: 23,
    title: "Reverse String",
    group: "Two Pointers",
    difficulty: "Easy",
    statement:
      "You are given a word as an array of characters. Reverse it in place without making a new array.",
    example: 's = ["h","e","l","l","o"] → ["o","l","l","e","h"]',
    approach:
      "Swap the first and last characters, then the second and second-to-last, and so on. Two pointers start at the ends and step toward each other. When they meet, every character is in its mirrored spot.",
    watch: [
      "`left` and `right` start at the two ends",
      "each pass swaps `s[left]` and `s[right]`",
      "both pointers move inward after every swap",
      "the middle character of an odd-length word never moves",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function reverseString(s) {
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    // swap the two ends
    [s[left], s[right]] = [s[right], s[left]];
    left++;
    right--;
  }
  return s;
}

const s = ["h", "e", "l", "l", "o"];
console.log(reverseString(s)); // expected: ["o", "l", "l", "e", "h"]`,
  },
  {
    id: "is-subsequence",
    number: 24,
    title: "Is Subsequence",
    group: "Two Pointers",
    difficulty: "Easy",
    statement:
      "Check whether string `s` can be made from string `t` by deleting some characters of `t` without changing the order of the rest.",
    example: 's = "ace", t = "abcde" → true',
    approach:
      "Walk through `t` with `j` and keep `i` on the next character of `s` we still need. When the characters match, `i` moves on. If `i` reaches the end of `s`, every character was found in order.",
    watch: [
      "`j` moves through `t` on every pass",
      "`i` only moves when `s[i] === t[j]`",
      "the characters of `t` that do not match are just skipped",
      "the answer is whether `i` reached `s.length`",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function isSubsequence(s, t) {
  let i = 0; // next character of s we need

  for (let j = 0; j < t.length; j++) {
    if (i < s.length && s[i] === t[j]) {
      i++; // found it, look for the next one
    }
  }
  return i === s.length; // found every character in order?
}

console.log(isSubsequence("ace", "abcde")); // expected: true`,
  },
  {
    id: "squares-of-sorted-array",
    number: 25,
    title: "Squares of a Sorted Array",
    group: "Two Pointers",
    difficulty: "Easy",
    statement:
      "The array is sorted and may contain negative numbers. Return the squares of every number, also sorted from small to large.",
    example: "nums = [-4,-1,0,3,10] → [0,1,9,16,100]",
    approach:
      "The biggest square is always at one of the two ends, because big negatives and big positives both sit at the edges. Compare the two ends, put the larger square at the back of the result, and move that pointer inward. Filling from the back gives a sorted result without sorting.",
    watch: [
      "`left` and `right` start at the two ends of `nums`",
      "`p` fills `result` from the last slot backwards",
      "the larger of the two squares is placed, and only its pointer moves",
      "`result` fills from right to left in sorted order",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function sortedSquares(nums) {
  const result = new Array(nums.length).fill(0);
  let left = 0;
  let right = nums.length - 1;
  let p = nums.length - 1; // next slot to fill, from the back

  while (left <= right) {
    const leftSq = nums[left] * nums[left];
    const rightSq = nums[right] * nums[right];
    // the bigger square goes to the back
    if (leftSq > rightSq) {
      result[p] = leftSq;
      left++;
    } else {
      result[p] = rightSq;
      right--;
    }
    p--;
  }
  return result;
}

const nums = [-4, -1, 0, 3, 10];
console.log(sortedSquares(nums)); // expected: [0, 1, 9, 16, 100]`,
  },

  // ──────────────────────────── Sliding Window ────────────────────────────
  {
    id: "best-time-to-buy-and-sell-stock",
    number: 26,
    title: "Best Time to Buy and Sell Stock",
    group: "Sliding Window",
    difficulty: "Easy",
    statement:
      "Each number is a stock's price on one day. Buy on one day and sell on a later day to make the most profit; return that profit, or 0 if no profit is possible.",
    example: "prices = [7,1,5,3,6,4] → 5",
    approach:
      "`left` is the buy day and `right` is the sell day. If the price on `right` is lower than the buy price, that day is a better day to buy, so `left` jumps to it. Otherwise record the profit and keep the best one.",
    watch: [
      "`right` moves forward every pass: each day is a possible sell day",
      "`left` jumps to `right` whenever a cheaper buy price appears",
      "`profit` is `prices[right] - prices[left]`",
      "`best` only grows",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function maxProfit(prices) {
  let left = 0; // buy day
  let best = 0;

  for (let right = 1; right < prices.length; right++) {
    if (prices[right] < prices[left]) {
      left = right; // cheaper day found: buy here instead
    } else {
      const profit = prices[right] - prices[left];
      best = Math.max(best, profit);
    }
  }
  return best;
}

const prices = [7, 1, 5, 3, 6, 4];
console.log(maxProfit(prices)); // expected: 5`,
  },
  {
    id: "longest-substring-without-repeating",
    number: 27,
    title: "Longest Substring Without Repeating Characters",
    group: "Sliding Window",
    difficulty: "Medium",
    statement:
      "Find the length of the longest stretch of the string in which no character appears twice.",
    example: 's = "abcabcbb" → 3',
    approach:
      "Keep a window `s[left..right]` with no repeats and a Set of the characters in it. Grow the window one character at a time; if the new character is already in the Set, shrink from the left until it is gone. The window is always valid, so its largest size is the answer.",
    watch: [
      "`right` adds one character to `window` on every pass",
      "a repeat triggers the inner loop: `left` moves and characters leave `window`",
      "`window` never holds the same character twice",
      "`best` is the largest `right - left + 1` seen",
    ],
    complexity: { time: "O(n)", space: "O(k)" },
    code: `function lengthOfLongestSubstring(s) {
  const window = new Set(); // characters in the current window
  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right++) {
    // shrink until the new character is no longer a repeat
    while (window.has(s[right])) {
      window.delete(s[left]);
      left++;
    }
    window.add(s[right]); // grow the window
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(lengthOfLongestSubstring("abcabcbb")); // expected: 3`,
  },
  {
    id: "minimum-size-subarray-sum",
    number: 28,
    title: "Minimum Size Subarray Sum",
    group: "Sliding Window",
    difficulty: "Medium",
    statement:
      "All numbers are positive. Find the length of the shortest run of neighbouring numbers whose sum is at least the target, or 0 if there is none.",
    example: "target = 7, nums = [2,3,1,2,4,3] → 2",
    approach:
      "Grow the window to the right, adding to `sum`. As soon as `sum` reaches the target, record the length and shrink from the left to see if a shorter window still works. Because all numbers are positive, shrinking always lowers the sum, so each pointer moves at most n times.",
    watch: [
      "`sum` grows as `right` moves",
      "while `sum >= target` the window records its length and `left` moves in",
      "`best` drops each time a shorter valid window is found",
      "`best` starts at Infinity and becomes 0 if no window ever qualifies",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function minSubArrayLen(target, nums) {
  let left = 0;
  let sum = 0;
  let best = Infinity;

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right]; // grow the window
    // shrink while the window is still big enough
    while (sum >= target) {
      best = Math.min(best, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }
  return best === Infinity ? 0 : best;
}

const nums = [2, 3, 1, 2, 4, 3];
console.log(minSubArrayLen(7, nums)); // expected: 2`,
  },
  {
    id: "contains-duplicate-ii",
    number: 29,
    title: "Contains Duplicate II",
    group: "Sliding Window",
    difficulty: "Easy",
    statement:
      "Check whether the array has two equal numbers whose positions are at most `k` apart.",
    example: "nums = [1,2,3,1], k = 3 → true",
    approach:
      "Keep a Set holding only the last `k` numbers seen: a window of size `k`. If the next number is already in the Set, an equal number is within `k` positions. When the window grows past `k`, the oldest number (at `left`) is removed.",
    watch: [
      "`window` holds at most `k` numbers",
      "`window.has(nums[right])` is the duplicate check",
      "when `window.size > k`, `nums[left]` is removed and `left` moves",
      "the first hit returns true straight away",
    ],
    complexity: { time: "O(n)", space: "O(k)" },
    code: `function containsNearbyDuplicate(nums, k) {
  const window = new Set(); // the last k numbers
  let left = 0;

  for (let right = 0; right < nums.length; right++) {
    if (window.has(nums[right])) {
      return true; // same number within k steps
    }
    window.add(nums[right]);
    // keep the window at most k long
    if (window.size > k) {
      window.delete(nums[left]);
      left++;
    }
  }
  return false;
}

const nums = [1, 2, 3, 1];
console.log(containsNearbyDuplicate(nums, 3)); // expected: true`,
  },
  {
    id: "maximum-average-subarray-i",
    number: 30,
    title: "Maximum Average Subarray I",
    group: "Sliding Window",
    difficulty: "Easy",
    statement:
      "Find the run of exactly `k` neighbouring numbers with the largest average, and return that average.",
    example: "nums = [1,12,-5,-6,50,3], k = 4 → 12.75",
    approach:
      "Add up the first `k` numbers. Then slide the window one step at a time: add the number entering on the right and subtract the one leaving on the left. Each slide is O(1), so the best sum is found in one pass; divide by `k` at the end.",
    watch: [
      "the first loop builds `sum` for the first window",
      "each slide adds `nums[right]` and subtracts `nums[right - k]`",
      "`best` keeps the largest window sum",
      "dividing by `k` happens once, at the end",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function findMaxAverage(nums, k) {
  let sum = 0;
  // sum of the first window
  for (let i = 0; i < k; i++) {
    sum += nums[i];
  }
  let best = sum;

  // slide: one number in on the right, one out on the left
  for (let right = k; right < nums.length; right++) {
    const left = right - k; // the number leaving the window
    sum += nums[right] - nums[left];
    best = Math.max(best, sum);
  }
  return best / k;
}

const nums = [1, 12, -5, -6, 50, 3];
console.log(findMaxAverage(nums, 4)); // expected: 12.75`,
  },
  {
    id: "permutation-in-string",
    number: 31,
    title: "Permutation in String",
    group: "Sliding Window",
    difficulty: "Medium",
    statement:
      "Check whether some rearrangement of `s1` appears as a block of neighbouring characters inside `s2`.",
    example: 's1 = "ab", s2 = "eidbaooo" → true',
    approach:
      "Count the characters `s1` needs in a Map. Slide a window the length of `s1` across `s2`: a character entering the window uses up one of its count, a character leaving gives one back. `missing` tracks how many needed characters are still not in the window; when it hits 0, the window is a rearrangement of `s1`.",
    watch: [
      "`need` starts with the counts of `s1`",
      "`missing` drops only when the entering character was still needed",
      "once the window is longer than `s1`, `s2[left]` leaves and `left` moves",
      "`missing === 0` means the window holds exactly the letters of `s1`",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function checkInclusion(s1, s2) {
  const need = new Map(); // how many of each character we still need
  for (const ch of s1) {
    need.set(ch, (need.get(ch) || 0) + 1);
  }
  let missing = s1.length; // characters of s1 not yet in the window
  let left = 0;

  for (let right = 0; right < s2.length; right++) {
    const ch = s2[right]; // character entering the window
    if ((need.get(ch) || 0) > 0) missing--;
    need.set(ch, (need.get(ch) || 0) - 1);

    // keep the window the same length as s1
    if (right - left + 1 > s1.length) {
      const out = s2[left]; // character leaving the window
      need.set(out, need.get(out) + 1);
      if (need.get(out) > 0) missing++;
      left++;
    }
    if (missing === 0) return true; // window is a rearrangement of s1
  }
  return false;
}

console.log(checkInclusion("ab", "eidbaooo")); // expected: true`,
  },
  {
    id: "longest-repeating-character-replacement",
    number: 32,
    title: "Longest Repeating Character Replacement",
    group: "Sliding Window",
    difficulty: "Medium",
    statement:
      "You may change at most `k` characters of the string. Return the length of the longest block of one repeated letter you can make.",
    example: 's = "AABABBA", k = 1 → 4',
    approach:
      "In a window, keep the most common letter and change the rest. The window is valid while `length - maxCount <= k`. Grow it on the right; when it needs more than `k` changes, slide the left edge in by one. The largest valid window is the answer.",
    watch: [
      "`count` holds how many of each letter are in the window",
      "`maxCount` is the count of the most common letter seen in a window",
      "when `right - left + 1 - maxCount > k` the window gives up its left character",
      "`best` records the largest valid window",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function characterReplacement(s, k) {
  const count = new Map(); // letter counts in the window
  let left = 0;
  let maxCount = 0; // count of the most common letter
  let best = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    count.set(ch, (count.get(ch) || 0) + 1);
    maxCount = Math.max(maxCount, count.get(ch));

    // too many letters to change: drop the left one
    if (right - left + 1 - maxCount > k) {
      count.set(s[left], count.get(s[left]) - 1);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(characterReplacement("AABABBA", 1)); // expected: 4`,
  },
  {
    id: "find-all-anagrams",
    number: 33,
    title: "Find All Anagrams in a String",
    group: "Sliding Window",
    difficulty: "Medium",
    statement:
      "Return every starting position in `s` where a rearrangement of `p` begins.",
    example: 's = "cbaebabacd", p = "abc" → [0,6]',
    approach:
      "This is Permutation in String, but instead of stopping at the first match we collect them all. A window the length of `p` slides across `s`, with a `need` Map and a `missing` counter updated as characters enter and leave. Whenever `missing` is 0, `left` is the start of an anagram.",
    watch: [
      "`need` starts with the letter counts of `p`",
      "an entering character lowers `missing` only if it was still needed",
      "the leaving character `s[left]` gives its count back before `left` moves",
      "`missing === 0` pushes `left` into `result`",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function findAnagrams(s, p) {
  const need = new Map(); // letters of p still needed
  for (const ch of p) {
    need.set(ch, (need.get(ch) || 0) + 1);
  }
  let missing = p.length;
  let left = 0;
  const result = [];

  for (let right = 0; right < s.length; right++) {
    const ch = s[right]; // entering the window
    if ((need.get(ch) || 0) > 0) missing--;
    need.set(ch, (need.get(ch) || 0) - 1);

    // keep the window the same length as p
    if (right - left + 1 > p.length) {
      const out = s[left]; // leaving the window
      need.set(out, need.get(out) + 1);
      if (need.get(out) > 0) missing++;
      left++;
    }
    if (missing === 0) result.push(left); // anagram starts at left
  }
  return result;
}

console.log(findAnagrams("cbaebabacd", "abc")); // expected: [0, 6]`,
  },
  {
    id: "max-consecutive-ones-iii",
    number: 34,
    title: "Max Consecutive Ones III",
    group: "Sliding Window",
    difficulty: "Medium",
    statement:
      "The array holds only 0s and 1s. If you may flip at most `k` zeros into ones, return the longest run of ones you can get.",
    example: "nums = [1,0,1,1,0,0,1,1], k = 1 → 4",
    approach:
      "Keep a window that contains at most `k` zeros: those are the ones we flip. Grow it on the right, counting zeros. When there are too many zeros, move `left` in until one zero has left the window. The largest window seen is the answer.",
    watch: [
      "`zeros` counts the zeros inside the window",
      "when `zeros > k`, the inner loop moves `left` past a zero",
      "the window `right - left + 1` is always valid after the inner loop",
      "`best` keeps the largest window",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function longestOnes(nums, k) {
  let left = 0;
  let zeros = 0; // zeros in the window (the ones we flip)
  let best = 0;

  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeros++;

    // too many zeros: shrink from the left
    while (zeros > k) {
      if (nums[left] === 0) zeros--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

const nums = [1, 0, 1, 1, 0, 0, 1, 1];
console.log(longestOnes(nums, 1)); // expected: 4`,
  },
  {
    id: "max-vowels-in-substring",
    number: 35,
    title: "Maximum Number of Vowels in a Substring of Given Length",
    group: "Sliding Window",
    difficulty: "Medium",
    statement:
      "Look at every block of exactly `k` neighbouring characters in the string. Return the largest number of vowels any one block contains.",
    example: 's = "abciiidef", k = 3 → 3',
    approach:
      "Slide a window of length `k` across the string and keep a running vowel count. When a character enters on the right, add 1 if it is a vowel; when one leaves on the left, subtract 1 if it was a vowel. Each step is O(1), so one pass finds the best window.",
    watch: [
      "`vowels` is a Set used for quick vowel checks",
      "`count` goes up when `s[right]` is a vowel",
      "once the window is longer than `k`, `s[left]` leaves and `left` moves",
      "`best` is updated once the window is exactly `k` long",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function maxVowels(s, k) {
  const vowels = new Set(["a", "e", "i", "o", "u"]);
  let left = 0;
  let count = 0; // vowels in the window
  let best = 0;

  for (let right = 0; right < s.length; right++) {
    if (vowels.has(s[right])) count++; // entering character

    // keep the window exactly k long
    if (right - left + 1 > k) {
      if (vowels.has(s[left])) count--; // leaving character
      left++;
    }
    if (right - left + 1 === k) {
      best = Math.max(best, count);
    }
  }
  return best;
}

console.log(maxVowels("abciiidef", 3)); // expected: 3`,
  },
];
