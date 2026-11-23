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
    example: 'text = "Taco cat!" → true',
    approach:
      "Put one pointer at the start and one at the end. Skip characters that are not letters or digits, then compare the two characters: if they ever differ, it is not a palindrome. Each step moves a pointer inward, so every character is looked at once.",
    watch: [
      "`leftIndex` and `rightIndex` walk towards each other from the two ends",
      "the space and the `!` are skipped: only one pointer moves on those steps",
      "each comparison `text[leftIndex] !== text[rightIndex]` is the moment of truth: one mismatch means false",
      "the loop stops when the pointers meet in the middle",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `// true for a lowercase letter or a digit
function isAlphaNum(character) {
  return (character >= "a" && character <= "z") || (character >= "0" && character <= "9");
}

function isPalindrome(text) {
  text = text.toLowerCase(); // compare without caring about case
  let leftIndex = 0; // starts at the first character
  let rightIndex = text.length - 1; // starts at the last character

  while (leftIndex < rightIndex) {
    // skip anything that is not a letter or digit
    if (!isAlphaNum(text[leftIndex])) {
      leftIndex++;
      continue;
    }
    if (!isAlphaNum(text[rightIndex])) {
      rightIndex--;
      continue;
    }
    // the two ends must match
    if (text[leftIndex] !== text[rightIndex]) {
      return false;
    }
    // both matched: move inward
    leftIndex++;
    rightIndex--;
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
      "`currentSum` is checked against `target` on every pass",
      "sum too big → `rightIndex` steps left; sum too small → `leftIndex` steps right",
      "only one pointer moves per pass, so at most n passes",
      "the answer adds 1 to each index because the problem counts from 1",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function twoSum(numbers, target) {
  let leftIndex = 0; // smallest number
  let rightIndex = numbers.length - 1; // largest number

  while (leftIndex < rightIndex) {
    const currentSum = numbers[leftIndex] + numbers[rightIndex];
    if (currentSum === target) {
      return [leftIndex + 1, rightIndex + 1]; // positions counted from 1
    } else if (currentSum > target) {
      rightIndex--; // too big: use a smaller number
    } else {
      leftIndex++; // too small: use a bigger number
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
    example: "numbers = [-1,0,1,2,-1,-4] → [[-1,-1,2],[-1,0,1]]",
    approach:
      "Sort the array first. Fix one number at a time (`anchorIndex`), then look for two more numbers after it that add up to its negative, using the Two Sum II trick with `left` and `rightIndex`. Skipping values equal to the previous one stops duplicate triplets from being added.",
    watch: [
      "after sorting, `anchorIndex` fixes the first number of the triplet",
      "`left` and `rightIndex` close in on the rest of the array, just like Two Sum II",
      "when `tripletSum` is 0 the triplet is saved and both pointers move",
      "the `while` loops that skip equal values are what prevent duplicates",
    ],
    complexity: { time: "O(n²)", space: "O(1)" },
    code: `function threeSum(numbers) {
  numbers.sort((first, second) => first - second); // sort once so two pointers work
  const result = [];

  for (let anchorIndex = 0; anchorIndex < numbers.length - 2; anchorIndex++) {
    // skip a first number we already tried
    if (anchorIndex > 0 && numbers[anchorIndex] === numbers[anchorIndex - 1]) continue;

    let left = anchorIndex + 1;
    let rightIndex = numbers.length - 1;
    while (left < rightIndex) {
      const tripletSum = numbers[anchorIndex] + numbers[left] + numbers[rightIndex];
      if (tripletSum === 0) {
        result.push([numbers[anchorIndex], numbers[left], numbers[rightIndex]]);
        left++;
        rightIndex--;
        // skip repeated values so the triplet is not added twice
        while (left < rightIndex && numbers[left] === numbers[left - 1]) left++;
        while (left < rightIndex && numbers[rightIndex] === numbers[rightIndex + 1]) rightIndex--;
      } else if (tripletSum < 0) {
        left++; // need a bigger total
      } else {
        rightIndex--; // need a smaller total
      }
    }
  }
  return result;
}

const numbers = [-1, 0, 1, 2, -1, -4];
console.log(threeSum(numbers)); // expected: [[-1, -1, 2], [-1, 0, 1]]`,
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
      "`area` is width `rightIndex - leftIndex` times the shorter of the two heights",
      "`best` only changes when a bigger area appears",
      "the pointer at the shorter line is the one that moves",
      "the width shrinks by one every pass, so the loop runs n − 1 times",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function maxArea(height) {
  let leftIndex = 0;
  let rightIndex = height.length - 1;
  let best = 0;

  while (leftIndex < rightIndex) {
    // the shorter line sets the water level
    const containerHeight = Math.min(height[leftIndex], height[rightIndex]);
    const area = containerHeight * (rightIndex - leftIndex);
    best = Math.max(best, area);

    // move the shorter line: the taller one can't do better here
    if (height[leftIndex] < height[rightIndex]) {
      leftIndex++;
    } else {
      rightIndex--;
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
    example: "numbers = [0,1,0,3,12] → [1,3,12,0,0]",
    approach:
      "`writeIndex` marks where the next non-zero number belongs, and `readIndex` scans every element. Whenever `readIndex` finds a non-zero, swap it into position `writeIndex` and move `writeIndex` forward. The zeros get pushed back as the non-zeros are pulled forward in order.",
    watch: [
      "`readIndex` visits every index once",
      "`writeIndex` only moves when a non-zero is placed",
      "each swap moves a non-zero forward and a zero back",
      "everything before `writeIndex` is always non-zero and in order",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function moveZeroes(numbers) {
  let writeIndex = 0; // where the next non-zero goes

  for (let readIndex = 0; readIndex < numbers.length; readIndex++) {
    if (numbers[readIndex] !== 0) {
      // swap the non-zero into place
      [numbers[writeIndex], numbers[readIndex]] = [numbers[readIndex], numbers[writeIndex]];
      writeIndex++;
    }
  }
  return numbers;
}

const numbers = [0, 1, 0, 3, 12];
console.log(moveZeroes(numbers)); // expected: [1, 3, 12, 0, 0]`,
  },
  {
    id: "remove-duplicates-sorted-array",
    number: 21,
    title: "Remove Duplicates from Sorted Array",
    group: "Two Pointers",
    difficulty: "Easy",
    statement:
      "The array is sorted. Remove repeats in place so each value appears once at the front, and return how many unique values there are.",
    example: "numbers = [0,0,1,1,1,2,2,3] → 4, front = [0,1,2,3]",
    approach:
      "Because the array is sorted, repeats sit next to each other. `writeIndex` points at the last unique value kept; `readIndex` scans ahead. When `readIndex` finds a value different from `numbers[writeIndex]`, it is new, so copy it to `writeIndex + 1`.",
    watch: [
      "`numbers[readIndex]` is compared with `numbers[writeIndex]`, the last kept value",
      "on a new value `writeIndex` moves forward and the value is copied there",
      "repeats are simply skipped by `readIndex`",
      "the answer is `writeIndex + 1`, the count of kept values",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function removeDuplicates(numbers) {
  let writeIndex = 0; // last unique value kept

  for (let readIndex = 1; readIndex < numbers.length; readIndex++) {
    if (numbers[readIndex] !== numbers[writeIndex]) {
      writeIndex++; // make room for the new value
      numbers[writeIndex] = numbers[readIndex]; // keep it
    }
  }
  return writeIndex + 1; // how many unique values
}

const numbers = [0, 0, 1, 1, 1, 2, 2, 3];
const uniqueCount = removeDuplicates(numbers);
console.log(uniqueCount, numbers.slice(0, uniqueCount)); // expected: 4 [0, 1, 2, 3]`,
  },
  {
    id: "remove-element",
    number: 22,
    title: "Remove Element",
    group: "Two Pointers",
    difficulty: "Easy",
    statement:
      "Remove every copy of a given value from the array in place. Return how many elements are left; they must sit at the front of the array.",
    example: "numbers = [3,2,2,3,4], valueToRemove = 3 → 3, front = [2,2,4]",
    approach:
      "`writeIndex` is where the next kept element goes, and `readIndex` checks every element. Anything not equal to `valueToRemove` is copied to `writeIndex`, and `writeIndex` moves on. Elements equal to `valueToRemove` are simply skipped.",
    watch: [
      "`readIndex` reads every element once",
      "`writeIndex` only moves when an element is kept",
      "on a kept element, `numbers[writeIndex]` is overwritten with `numbers[readIndex]`",
      "the final `writeIndex` is the count of kept elements",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function removeElement(numbers, valueToRemove) {
  let writeIndex = 0; // where the next kept element goes

  for (let readIndex = 0; readIndex < numbers.length; readIndex++) {
    if (numbers[readIndex] !== valueToRemove) {
      numbers[writeIndex] = numbers[readIndex]; // keep it
      writeIndex++;
    }
  }
  return writeIndex; // how many elements are kept
}

const numbers = [3, 2, 2, 3, 4];
const keptCount = removeElement(numbers, 3);
console.log(keptCount, numbers.slice(0, keptCount)); // expected: 3 [2, 2, 4]`,
  },
  {
    id: "reverse-string",
    number: 23,
    title: "Reverse String",
    group: "Two Pointers",
    difficulty: "Easy",
    statement:
      "You are given a word as an array of characters. Reverse it in place without making a new array.",
    example: 'text = ["h","e","l","l","o"] → ["o","l","l","e","h"]',
    approach:
      "Swap the first and last characters, then the second and second-to-last, and so on. Two pointers start at the ends and step toward each other. When they meet, every character is in its mirrored spot.",
    watch: [
      "`leftIndex` and `rightIndex` start at the two ends",
      "each pass swaps `text[leftIndex]` and `text[rightIndex]`",
      "both pointers move inward after every swap",
      "the middle character of an odd-length word never moves",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function reverseString(text) {
  let leftIndex = 0;
  let rightIndex = text.length - 1;

  while (leftIndex < rightIndex) {
    // swap the two ends
    [text[leftIndex], text[rightIndex]] = [text[rightIndex], text[leftIndex]];
    leftIndex++;
    rightIndex--;
  }
  return text;
}

const text = ["h", "e", "l", "l", "o"];
console.log(reverseString(text)); // expected: ["o", "l", "l", "e", "h"]`,
  },
  {
    id: "is-subsequence",
    number: 24,
    title: "Is Subsequence",
    group: "Two Pointers",
    difficulty: "Easy",
    statement:
      "Check whether string `subsequence` can be made from string `fullText` by deleting some characters of `fullText` without changing the order of the rest.",
    example: 'subsequence = "ace", fullText = "abcde" → true',
    approach:
      "Walk through `fullText` with `fullTextIndex` and keep `subsequenceIndex` on the next character of `subsequence` we still need. When the characters match, `subsequenceIndex` moves on. If `subsequenceIndex` reaches the end of `subsequence`, every character was found in order.",
    watch: [
      "`fullTextIndex` moves through `fullText` on every pass",
      "`subsequenceIndex` only moves when `subsequence[subsequenceIndex] === fullText[fullTextIndex]`",
      "the characters of `fullText` that do not match are just skipped",
      "the answer is whether `subsequenceIndex` reached `subsequence.length`",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function isSubsequence(subsequence, fullText) {
  let subsequenceIndex = 0; // next character of s we need

  for (let fullTextIndex = 0; fullTextIndex < fullText.length; fullTextIndex++) {
    if (subsequenceIndex < subsequence.length && subsequence[subsequenceIndex] === fullText[fullTextIndex]) {
      subsequenceIndex++; // found it, look for the next one
    }
  }
  return subsequenceIndex === subsequence.length; // found every character in order?
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
    example: "numbers = [-4,-1,0,3,10] → [0,1,9,16,100]",
    approach:
      "The biggest square is always at one of the two ends, because big negatives and big positives both sit at the edges. Compare the two ends, put the larger square at the back of the result, and move that pointer inward. Filling from the back gives a sorted result without sorting.",
    watch: [
      "`leftIndex` and `rightIndex` start at the two ends of `numbers`",
      "`fillIndex` fills `result` from the last slot backwards",
      "the larger of the two squares is placed, and only its pointer moves",
      "`result` fills from right to left in sorted order",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function sortedSquares(numbers) {
  const result = new Array(numbers.length).fill(0);
  let leftIndex = 0;
  let rightIndex = numbers.length - 1;
  let fillIndex = numbers.length - 1; // next slot to fill, from the back

  while (leftIndex <= rightIndex) {
    const leftSq = numbers[leftIndex] * numbers[leftIndex];
    const rightSq = numbers[rightIndex] * numbers[rightIndex];
    // the bigger square goes to the back
    if (leftSq > rightSq) {
      result[fillIndex] = leftSq;
      leftIndex++;
    } else {
      result[fillIndex] = rightSq;
      rightIndex--;
    }
    fillIndex--;
  }
  return result;
}

const numbers = [-4, -1, 0, 3, 10];
console.log(sortedSquares(numbers)); // expected: [0, 1, 9, 16, 100]`,
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
      "`buyDay` is the buy day and `sellDay` is the sell day. If the price on `sellDay` is lower than the buy price, that day is a better day to buy, so `buyDay` jumps to it. Otherwise record the profit and keep the best one.",
    watch: [
      "`sellDay` moves forward every pass: each day is a possible sell day",
      "`buyDay` jumps to `sellDay` whenever a cheaper buy price appears",
      "`profit` is `prices[sellDay] - prices[buyDay]`",
      "`best` only grows",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function maxProfit(prices) {
  let buyDay = 0; // buy day
  let best = 0;

  for (let sellDay = 1; sellDay < prices.length; sellDay++) {
    if (prices[sellDay] < prices[buyDay]) {
      buyDay = sellDay; // cheaper day found: buy here instead
    } else {
      const profit = prices[sellDay] - prices[buyDay];
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
    example: 'text = "abcabcbb" → 3',
    approach:
      "Keep a window `text[leftIndex..right]` with no repeats and a Set of the characters in it. Grow the window one character at a time; if the new character is already in the Set, shrink from the left until it is gone. The window is always valid, so its largest size is the answer.",
    watch: [
      "`rightIndex` adds one character to `window` on every pass",
      "a repeat triggers the inner loop: `leftIndex` moves and characters leave `window`",
      "`window` never holds the same character twice",
      "`best` is the largest `rightIndex - leftIndex + 1` seen",
    ],
    complexity: { time: "O(n)", space: "O(k)" },
    code: `function lengthOfLongestSubstring(text) {
  const window = new Set(); // characters in the current window
  let leftIndex = 0;
  let best = 0;

  for (let rightIndex = 0; rightIndex < text.length; rightIndex++) {
    // shrink until the new character is no longer a repeat
    while (window.has(text[rightIndex])) {
      window.delete(text[leftIndex]);
      leftIndex++;
    }
    window.add(text[rightIndex]); // grow the window
    best = Math.max(best, rightIndex - leftIndex + 1);
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
    example: "target = 7, numbers = [2,3,1,2,4,3] → 2",
    approach:
      "Grow the window to the right, adding to `windowSum`. As soon as `windowSum` reaches the target, record the length and shrink from the left to see if a shorter window still works. Because all numbers are positive, shrinking always lowers the sum, so each pointer moves at most n times.",
    watch: [
      "`windowSum` grows as `rightIndex` moves",
      "while `windowSum >= target` the window records its length and `leftIndex` moves in",
      "`best` drops each time a shorter valid window is found",
      "`best` starts at Infinity and becomes 0 if no window ever qualifies",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function minSubArrayLen(target, numbers) {
  let leftIndex = 0;
  let windowSum = 0;
  let best = Infinity;

  for (let rightIndex = 0; rightIndex < numbers.length; rightIndex++) {
    windowSum += numbers[rightIndex]; // grow the window
    // shrink while the window is still big enough
    while (windowSum >= target) {
      best = Math.min(best, rightIndex - leftIndex + 1);
      windowSum -= numbers[leftIndex];
      leftIndex++;
    }
  }
  return best === Infinity ? 0 : best;
}

const numbers = [2, 3, 1, 2, 4, 3];
console.log(minSubArrayLen(7, numbers)); // expected: 2`,
  },
  {
    id: "contains-duplicate-ii",
    number: 29,
    title: "Contains Duplicate II",
    group: "Sliding Window",
    difficulty: "Easy",
    statement:
      "Check whether the array has two equal numbers whose positions are at most `maxDistance` apart.",
    example: "numbers = [1,2,3,1], maxDistance = 3 → true",
    approach:
      "Keep a Set holding only the last `maxDistance` numbers seen: a window of size `maxDistance`. If the next number is already in the Set, an equal number is within `maxDistance` positions. When the window grows past `maxDistance`, the oldest number (at `leftIndex`) is removed.",
    watch: [
      "`window` holds at most `maxDistance` numbers",
      "`window.has(numbers[rightIndex])` is the duplicate check",
      "when `window.size > maxDistance`, `numbers[leftIndex]` is removed and `leftIndex` moves",
      "the first hit returns true straight away",
    ],
    complexity: { time: "O(n)", space: "O(k)" },
    code: `function containsNearbyDuplicate(numbers, maxDistance) {
  const window = new Set(); // the last k numbers
  let leftIndex = 0;

  for (let rightIndex = 0; rightIndex < numbers.length; rightIndex++) {
    if (window.has(numbers[rightIndex])) {
      return true; // same number within k steps
    }
    window.add(numbers[rightIndex]);
    // keep the window at most k long
    if (window.size > maxDistance) {
      window.delete(numbers[leftIndex]);
      leftIndex++;
    }
  }
  return false;
}

const numbers = [1, 2, 3, 1];
console.log(containsNearbyDuplicate(numbers, 3)); // expected: true`,
  },
  {
    id: "maximum-average-subarray-i",
    number: 30,
    title: "Maximum Average Subarray I",
    group: "Sliding Window",
    difficulty: "Easy",
    statement:
      "Find the run of exactly `windowSize` neighbouring numbers with the largest average, and return that average.",
    example: "numbers = [1,12,-5,-6,50,3], windowSize = 4 → 12.75",
    approach:
      "Add up the first `windowSize` numbers. Then slide the window one step at a time: add the number entering on the right and subtract the one leaving on the left. Each slide is O(1), so the best sum is found in one pass; divide by `windowSize` at the end.",
    watch: [
      "the first loop builds `windowSum` for the first window",
      "each slide adds `numbers[right]` and subtracts `numbers[right - windowSize]`",
      "`best` keeps the largest window sum",
      "dividing by `windowSize` happens once, at the end",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function findMaxAverage(numbers, windowSize) {
  let windowSum = 0;
  // sum of the first window
  for (let index = 0; index < windowSize; index++) {
    windowSum += numbers[index];
  }
  let best = windowSum;

  // slide: one number in on the right, one out on the left
  for (let right = windowSize; right < numbers.length; right++) {
    const left = right - windowSize; // the number leaving the window
    windowSum += numbers[right] - numbers[left];
    best = Math.max(best, windowSum);
  }
  return best / windowSize;
}

const numbers = [1, 12, -5, -6, 50, 3];
console.log(findMaxAverage(numbers, 4)); // expected: 12.75`,
  },
  {
    id: "permutation-in-string",
    number: 31,
    title: "Permutation in String",
    group: "Sliding Window",
    difficulty: "Medium",
    statement:
      "Check whether some rearrangement of `pattern` appears as a block of neighbouring characters inside `text`.",
    example: 'pattern = "ab", text = "eidbaooo" → true',
    approach:
      "Count the characters `pattern` needs in a Map. Slide a window the length of `pattern` across `text`: a character entering the window uses up one of its count, a character leaving gives one back. `missing` tracks how many needed characters are still not in the window; when it hits 0, the window is a rearrangement of `pattern`.",
    watch: [
      "`need` starts with the counts of `pattern`",
      "`missing` drops only when the entering character was still needed",
      "once the window is longer than `pattern`, `text[leftIndex]` leaves and `leftIndex` moves",
      "`missing === 0` means the window holds exactly the letters of `pattern`",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function checkInclusion(pattern, text) {
  const need = new Map(); // how many of each character we still need
  for (const character of pattern) {
    need.set(character, (need.get(character) || 0) + 1);
  }
  let missing = pattern.length; // characters of s1 not yet in the window
  let leftIndex = 0;

  for (let rightIndex = 0; rightIndex < text.length; rightIndex++) {
    const character = text[rightIndex]; // character entering the window
    if ((need.get(character) || 0) > 0) missing--;
    need.set(character, (need.get(character) || 0) - 1);

    // keep the window the same length as s1
    if (rightIndex - leftIndex + 1 > pattern.length) {
      const result = text[leftIndex]; // character leaving the window
      need.set(result, need.get(result) + 1);
      if (need.get(result) > 0) missing++;
      leftIndex++;
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
      "You may change at most `maxReplacements` characters of the string. Return the length of the longest block of one repeated letter you can make.",
    example: 'text = "AABABBA", maxReplacements = 1 → 4',
    approach:
      "In a window, keep the most common letter and change the rest. The window is valid while `length - maxCount <= maxReplacements`. Grow it on the right; when it needs more than `maxReplacements` changes, slide the left edge in by one. The largest valid window is the answer.",
    watch: [
      "`count` holds how many of each letter are in the window",
      "`maxCount` is the count of the most common letter seen in a window",
      "when `rightIndex - leftIndex + 1 - maxCount > maxReplacements` the window gives up its left character",
      "`best` records the largest valid window",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function characterReplacement(text, maxReplacements) {
  const count = new Map(); // letter counts in the window
  let leftIndex = 0;
  let maxCount = 0; // count of the most common letter
  let best = 0;

  for (let rightIndex = 0; rightIndex < text.length; rightIndex++) {
    const character = text[rightIndex];
    count.set(character, (count.get(character) || 0) + 1);
    maxCount = Math.max(maxCount, count.get(character));

    // too many letters to change: drop the left one
    if (rightIndex - leftIndex + 1 - maxCount > maxReplacements) {
      count.set(text[leftIndex], count.get(text[leftIndex]) - 1);
      leftIndex++;
    }
    best = Math.max(best, rightIndex - leftIndex + 1);
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
      "Return every starting position in `text` where a rearrangement of `pattern` begins.",
    example: 'text = "cbaebabacd", pattern = "abc" → [0,6]',
    approach:
      "This is Permutation in String, but instead of stopping at the first match we collect them all. A window the length of `pattern` slides across `text`, with a `need` Map and a `missing` counter updated as characters enter and leave. Whenever `missing` is 0, `leftIndex` is the start of an anagram.",
    watch: [
      "`need` starts with the letter counts of `pattern`",
      "an entering character lowers `missing` only if it was still needed",
      "the leaving character `text[leftIndex]` gives its count back before `leftIndex` moves",
      "`missing === 0` pushes `leftIndex` into `result`",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function findAnagrams(text, pattern) {
  const need = new Map(); // letters of p still needed
  for (const character of pattern) {
    need.set(character, (need.get(character) || 0) + 1);
  }
  let missing = pattern.length;
  let leftIndex = 0;
  const result = [];

  for (let rightIndex = 0; rightIndex < text.length; rightIndex++) {
    const character = text[rightIndex]; // entering the window
    if ((need.get(character) || 0) > 0) missing--;
    need.set(character, (need.get(character) || 0) - 1);

    // keep the window the same length as p
    if (rightIndex - leftIndex + 1 > pattern.length) {
      const startPositions = text[leftIndex]; // leaving the window
      need.set(startPositions, need.get(startPositions) + 1);
      if (need.get(startPositions) > 0) missing++;
      leftIndex++;
    }
    if (missing === 0) result.push(leftIndex); // anagram starts at left
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
      "The array holds only 0s and 1s. If you may flip at most `maxFlips` zeros into ones, return the longest run of ones you can get.",
    example: "numbers = [1,0,1,1,0,0,1,1], maxFlips = 1 → 4",
    approach:
      "Keep a window that contains at most `maxFlips` zeros: those are the ones we flip. Grow it on the right, counting zeros. When there are too many zeros, move `leftIndex` in until one zero has left the window. The largest window seen is the answer.",
    watch: [
      "`zeros` counts the zeros inside the window",
      "when `zeros > maxFlips`, the inner loop moves `leftIndex` past a zero",
      "the window `rightIndex - leftIndex + 1` is always valid after the inner loop",
      "`best` keeps the largest window",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function longestOnes(numbers, maxFlips) {
  let leftIndex = 0;
  let zeros = 0; // zeros in the window (the ones we flip)
  let best = 0;

  for (let rightIndex = 0; rightIndex < numbers.length; rightIndex++) {
    if (numbers[rightIndex] === 0) zeros++;

    // too many zeros: shrink from the left
    while (zeros > maxFlips) {
      if (numbers[leftIndex] === 0) zeros--;
      leftIndex++;
    }
    best = Math.max(best, rightIndex - leftIndex + 1);
  }
  return best;
}

const numbers = [1, 0, 1, 1, 0, 0, 1, 1];
console.log(longestOnes(numbers, 1)); // expected: 4`,
  },
  {
    id: "max-vowels-in-substring",
    number: 35,
    title: "Maximum Number of Vowels in a Substring of Given Length",
    group: "Sliding Window",
    difficulty: "Medium",
    statement:
      "Look at every block of exactly `windowSize` neighbouring characters in the string. Return the largest number of vowels any one block contains.",
    example: 'text = "abciiidef", windowSize = 3 → 3',
    approach:
      "Slide a window of length `windowSize` across the string and keep a running vowel count. When a character enters on the right, add 1 if it is a vowel; when one leaves on the left, subtract 1 if it was a vowel. Each step is O(1), so one pass finds the best window.",
    watch: [
      "`vowels` is a Set used for quick vowel checks",
      "`count` goes up when `text[rightIndex]` is a vowel",
      "once the window is longer than `windowSize`, `text[leftIndex]` leaves and `leftIndex` moves",
      "`best` is updated once the window is exactly `windowSize` long",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function maxVowels(text, windowSize) {
  const vowels = new Set(["a", "e", "i", "o", "u"]);
  let leftIndex = 0;
  let count = 0; // vowels in the window
  let best = 0;

  for (let rightIndex = 0; rightIndex < text.length; rightIndex++) {
    if (vowels.has(text[rightIndex])) count++; // entering character

    // keep the window exactly k long
    if (rightIndex - leftIndex + 1 > windowSize) {
      if (vowels.has(text[leftIndex])) count--; // leaving character
      leftIndex++;
    }
    if (rightIndex - leftIndex + 1 === windowSize) {
      best = Math.max(best, count);
    }
  }
  return best;
}

console.log(maxVowels("abciiidef", 3)); // expected: 3`,
  },
];
