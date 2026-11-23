import type { Problem } from "./problem-types";

/** Practice problems 1–15: Arrays & Hashing. */
export const HASHING_PROBLEMS: Problem[] = [
  {
    id: "two-sum",
    number: 1,
    title: "Two Sum",
    group: "Arrays & Hashing",
    difficulty: "Easy",
    statement:
      "Given an array of numbers and a target, find the two positions whose values add up to the target. Exactly one such pair exists, and you may not use the same position twice.",
    example: "numbers = [2,7,11,15], target = 9 → [0,1]",
    approach:
      "Walk the array once and remember every number you have already seen, together with its index, in a Map. For each new number, the partner it needs is target - number; if that partner is already in the Map, you have the pair. A Map lookup is instant, so one pass is enough instead of checking every pair.",
    watch: [
      "Watch `need`: it is the value that would complete the pair with `numbers[numberIndex]`.",
      "`numberToIndex` is checked before the current number is stored, so a number never pairs with itself.",
      "Watch `numberToIndex` grow by one entry (value → index) each pass.",
      "At numberIndex = 1, `need` is 2 and `numberToIndex` already holds 2 → 0, so the answer is returned.",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function twoSum(numbers, target) {
  const numberToIndex = new Map(); // value -> index where we saw it
  for (let numberIndex = 0; numberIndex < numbers.length; numberIndex++) {
    const need = target - numbers[numberIndex]; // the partner this number needs
    if (numberToIndex.has(need)) {
      return [numberToIndex.get(need), numberIndex]; // partner numberToIndex earlier: done
    }
    numberToIndex.set(numbers[numberIndex], numberIndex); // remember this number for later ones
  }
  return []; // no pair found
}

const numbers = [2, 7, 11, 15];
console.log(twoSum(numbers, 9)); // expected: [0, 1]`,
  },
  {
    id: "contains-duplicate",
    number: 2,
    title: "Contains Duplicate",
    group: "Arrays & Hashing",
    difficulty: "Easy",
    statement:
      "Given an array of numbers, say whether any value appears more than once. Return true if there is a repeat, false if every value is different.",
    example: "numbers = [1,2,3,1] → true",
    approach:
      "Keep a Set of the values seen so far. For each number, first ask the Set whether it is already there; if yes, it is a duplicate. Otherwise add it and move on. A Set answers 'have I seen this?' instantly, so one pass is enough.",
    watch: [
      "Watch `seen` gain one value per pass.",
      "The `seen.has(numbers[numberIndex])` check happens before the add.",
      "At numberIndex = 3 the value 1 is already in `seen`, so the function returns true early.",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function containsDuplicate(numbers) {
  const seen = new Set(); // values met so far
  for (let numberIndex = 0; numberIndex < numbers.length; numberIndex++) {
    if (seen.has(numbers[numberIndex])) {
      return true; // met this value before
    }
    seen.add(numbers[numberIndex]); // first time: remember it
  }
  return false; // every value was new
}

const numbers = [1, 2, 3, 1];
console.log(containsDuplicate(numbers)); // expected: true`,
  },
  {
    id: "valid-anagram",
    number: 3,
    title: "Valid Anagram",
    group: "Arrays & Hashing",
    difficulty: "Easy",
    statement:
      "Given two strings, decide whether one is a rearrangement of the other. They must use exactly the same letters, the same number of times.",
    example: 'firstWord = "anagram", secondWord = "nagaram" → true',
    approach:
      "Count each letter of the first string in a Map, then walk the second string and take one away for each letter. If a letter is missing or its count is already zero, the strings differ. Equal lengths plus no shortfall means every count ended at zero, so they are anagrams.",
    watch: [
      "If the lengths differ the answer is false straight away.",
      "Watch `count` fill up during the first loop: 'a' reaches 3.",
      "In the second loop each letter of `secondWord` lowers its count by one.",
      "A missing letter or a zero count would return false at once.",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function isAnagram(firstWord, secondWord) {
  if (firstWord.length !== secondWord.length) {
    return false; // different lengths can never match
  }
  const count = new Map(); // letter -> how many times in s
  for (let firstWordIndex = 0; firstWordIndex < firstWord.length; firstWordIndex++) {
    count.set(firstWord[firstWordIndex], (count.get(firstWord[firstWordIndex]) || 0) + 1);
  }
  for (let secondWordIndex = 0; secondWordIndex < secondWord.length; secondWordIndex++) {
    const remaining = count.get(secondWord[secondWordIndex]) || 0; // copies of this letter still unused
    if (remaining === 0) {
      return false; // t uses a letter s does not have (enough of)
    }
    count.set(secondWord[secondWordIndex], remaining - 1); // use one copy up
  }
  return true; // every letter matched
}

console.log(isAnagram("anagram", "nagaram")); // expected: true`,
  },
  {
    id: "group-anagrams",
    number: 4,
    title: "Group Anagrams",
    group: "Arrays & Hashing",
    difficulty: "Medium",
    statement:
      "Given a list of words, put the words that are anagrams of each other into the same group. Return the list of groups.",
    example: 'strs = ["eat","tea","tan","ate","nat","bat"] → [["eat","tea","ate"],["tan","nat"],["bat"]]',
    approach:
      "Anagrams become the same string once their letters are sorted: 'eat', 'tea' and 'ate' all become 'aet'. Use that sorted string as a key in a Map whose value is the list of words with that key. After one pass, the Map's values are the groups.",
    watch: [
      "Watch `key`: each word's letters in sorted order.",
      "A new key creates a new empty list in `groups`; a known key reuses its list.",
      "'tea' and 'ate' land in the list that 'eat' started.",
      "The groups come out in the order their first word appeared.",
    ],
    complexity: { time: "O(n · k log k)", space: "O(n · k)" },
    code: `function groupAnagrams(strs) {
  const groups = new Map(); // sorted letters -> words with those letters
  for (let wordIndex = 0; wordIndex < strs.length; wordIndex++) {
    const word = strs[wordIndex];
    const key = word.split("").sort().join(""); // "eat" -> "aet"
    if (!groups.has(key)) {
      groups.set(key, []); // first word with this key
    }
    groups.get(key).push(word); // add the word to its group
  }
  return Array.from(groups.values());
}

const strs = ["eat", "tea", "tan", "ate", "nat", "bat"];
console.log(groupAnagrams(strs)); // expected: [["eat","tea","ate"],["tan","nat"],["bat"]]`,
  },
  {
    id: "top-k-frequent-elements",
    number: 5,
    title: "Top K Frequent Elements",
    group: "Arrays & Hashing",
    difficulty: "Medium",
    statement:
      "Given an array of numbers and a number k, return the k values that appear most often. The answer is unique, and any order is accepted.",
    example: "numbers = [1,1,1,2,2,3], topCount = 2 → [1,2]",
    approach:
      "First count how often each value appears using a Map. A value can appear at most n times, so make 'buckets' where bucket f holds the values that appear exactly f times. Then walk the buckets from the highest frequency down and collect values until you have k of them. This avoids sorting, so it stays linear.",
    watch: [
      "Watch `count` after the first loop: 1 → 3, 2 → 2, 3 → 1.",
      "Each value is dropped into `buckets[freq]`.",
      "The last loop walks `frequencyCount` downward from the end of `buckets`.",
      "The loop stops as soon as `result` holds k values.",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function topKFrequent(numbers, topCount) {
  const count = new Map(); // value -> how often it appears
  for (let numberIndex = 0; numberIndex < numbers.length; numberIndex++) {
    count.set(numbers[numberIndex], (count.get(numbers[numberIndex]) || 0) + 1);
  }

  // buckets[frequencyCount] lists the values that appear exactly f times
  const buckets = [];
  for (let frequencyCount = 0; frequencyCount <= numbers.length; frequencyCount++) {
    buckets.push([]);
  }
  for (const [value, freq] of count) {
    buckets[freq].push(value);
  }

  // Collect from the most frequent bucket downward
  const result = [];
  for (let frequencyCount = buckets.length - 1; frequencyCount >= 0 && result.length < topCount; frequencyCount--) {
    for (const value of buckets[frequencyCount]) {
      if (result.length < topCount) {
        result.push(value);
      }
    }
  }
  return result;
}

const numbers = [1, 1, 1, 2, 2, 3];
console.log(topKFrequent(numbers, 2)); // expected: [1, 2]`,
  },
  {
    id: "product-of-array-except-self",
    number: 6,
    title: "Product of Array Except Self",
    group: "Arrays & Hashing",
    difficulty: "Medium",
    statement:
      "Given an array of numbers, build a new array where each position holds the product of every other number. Do it without division and in linear time.",
    example: "numbers = [1,2,3,4] → [24,12,8,6]",
    approach:
      "The product of everything except position i is (product of everything to its left) × (product of everything to its right). A left-to-right pass stores the left products in the answer, and a right-to-left pass multiplies in the right products, kept in a single running variable.",
    watch: [
      "In the first loop `prefix` is the product of all numbers before `numberIndex`.",
      "After the first loop `answer` is [1, 1, 2, 6] — left products only.",
      "In the second loop `suffix` is the product of all numbers after `numberIndex`.",
      "Watch each `answer[numberIndex]` change once more as the suffix is multiplied in.",
    ],
    complexity: { time: "O(n)", space: "O(1) extra (besides the output)" },
    code: `function productExceptSelf(numbers) {
  const numberCount = numbers.length;
  const answer = new Array(numberCount).fill(1);

  // Pass 1: answer[numberIndex] = product of everything left of i
  let prefix = 1;
  for (let numberIndex = 0; numberIndex < numberCount; numberIndex++) {
    answer[numberIndex] = prefix;
    prefix *= numbers[numberIndex];
  }

  // Pass 2: multiply in the product of everything right of i
  let suffix = 1;
  for (let numberIndex = numberCount - 1; numberIndex >= 0; numberIndex--) {
    answer[numberIndex] *= suffix;
    suffix *= numbers[numberIndex];
  }
  return answer;
}

const numbers = [1, 2, 3, 4];
console.log(productExceptSelf(numbers)); // expected: [24, 12, 8, 6]`,
  },
  {
    id: "valid-sudoku",
    number: 7,
    title: "Valid Sudoku",
    group: "Arrays & Hashing",
    difficulty: "Medium",
    statement:
      "Check whether a partly filled Sudoku board breaks the rules: no digit may repeat in a row, a column, or a box. Empty cells ('.') are ignored. This mini 4×4 version uses digits 1–4 and 2×2 boxes; the real game is 9×9 with 3×3 boxes and works the same way.",
    example:
      'board = [["1",".",".","4"],[".","4",".","."],[".",".","2","."],["3",".",".","2"]] → false',
    approach:
      "Keep one Set of digits for every row, every column and every box. Visit each filled cell once: if its digit is already in that row's, column's or box's Set, the board is invalid. Otherwise record the digit in all three. The box number comes from dividing the row and column by the box size.",
    watch: [
      "Empty cells are skipped with `continue`.",
      "Watch `boxNumber`: rows 0–1 / cols 0–1 are box 0, rows 2–3 / cols 2–3 are box 3.",
      "Each filled digit is added to `seenInRow[rowIndex]`, `seenInColumn[columnIndex]` and `seenInBox[boxNumber]`.",
      "At the last cell, '2' is already in `seenInBox[3]`, so the board is invalid.",
    ],
    complexity: { time: "O(n²) for an n×n board", space: "O(n²)" },
    code: `function isValidSudoku(board) {
  const size = board.length; // 4 here (9 in the real game)
  const boxSize = 2; // 2x2 seenInBox here (3x3 in the real game)
  const seenInRow = [], seenInColumn = [], seenInBox = [];
  for (let lineIndex = 0; lineIndex < size; lineIndex++) {
    seenInRow.push(new Set());
    seenInColumn.push(new Set());
    seenInBox.push(new Set());
  }

  for (let rowIndex = 0; rowIndex < size; rowIndex++) {
    for (let columnIndex = 0; columnIndex < size; columnIndex++) {
      const digit = board[rowIndex][columnIndex];
      if (digit === ".") continue; // empty cell: nothing to check
      // which box this cell belongs to (numbered left to right, top to bottom)
      const boxNumber = Math.floor(rowIndex / boxSize) * (size / boxSize) + Math.floor(columnIndex / boxSize);
      if (seenInRow[rowIndex].has(digit) || seenInColumn[columnIndex].has(digit) || seenInBox[boxNumber].has(digit)) {
        return false; // digit repeats in its row, column or box
      }
      seenInRow[rowIndex].add(digit);
      seenInColumn[columnIndex].add(digit);
      seenInBox[boxNumber].add(digit);
    }
  }
  return true; // no repeats anywhere
}

const board = [
  ["1", ".", ".", "4"],
  [".", "4", ".", "."],
  [".", ".", "2", "."],
  ["3", ".", ".", "2"],
];
console.log(isValidSudoku(board)); // expected: false`,
  },
  {
    id: "longest-consecutive-sequence",
    number: 8,
    title: "Longest Consecutive Sequence",
    group: "Arrays & Hashing",
    difficulty: "Medium",
    statement:
      "Given an unsorted array of numbers, find the length of the longest run of consecutive values (like 1, 2, 3, 4). The values can appear anywhere in the array.",
    example: "numbers = [100,4,200,1,3,2] → 4",
    approach:
      "Put every number in a Set so you can ask 'is x here?' instantly. A run can only start at a number whose predecessor (num - 1) is missing. From each such start, count upward while the next number exists. Each number is counted in exactly one run, so the total work is linear.",
    watch: [
      "Watch the `has(number - 1)` check: 4, 3 and 2 are skipped because they are not run starts.",
      "From the start 1, `current` climbs 1 → 2 → 3 → 4 while `length` grows.",
      "`best` only changes when a longer run is found.",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function longestConsecutive(numbers) {
  const set = new Set(numbers); // instant "is x here?" checks
  let best = 0;
  for (const number of set) {
    if (set.has(number - 1)) continue; // not the start of a run
    // num starts a run: count how far it goes
    let current = number;
    let length = 1;
    while (set.has(current + 1)) {
      current++;
      length++;
    }
    best = Math.max(best, length);
  }
  return best;
}

const numbers = [100, 4, 200, 1, 3, 2];
console.log(longestConsecutive(numbers)); // expected: 4`,
  },
  {
    id: "majority-element",
    number: 9,
    title: "Majority Element",
    group: "Arrays & Hashing",
    difficulty: "Easy",
    statement:
      "Given an array, return the value that appears more than half the time. Such a value is guaranteed to exist.",
    example: "numbers = [2,2,1,1,1,2,2] → 2",
    approach:
      "Use Boyer–Moore voting: keep a current candidate and a vote count. A matching number adds a vote, any other number removes one, and when the count hits zero the next number becomes the new candidate. The majority value has more votes than all others combined, so it is the one left standing.",
    watch: [
      "Watch `count` rise with matches and fall with mismatches.",
      "When `count` is 0, `candidate` switches to the current number.",
      "At numberIndex = 4 the candidate becomes 1 for a while, then 2 wins it back.",
      "Only two variables are used: no Map is needed.",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function majorityElement(numbers) {
  let candidate = null;
  let count = 0; // votes for the current candidate
  for (let numberIndex = 0; numberIndex < numbers.length; numberIndex++) {
    if (count === 0) {
      candidate = numbers[numberIndex]; // no votes left: pick a new candidate
    }
    if (numbers[numberIndex] === candidate) {
      count++; // a vote for
    } else {
      count--; // a vote against
    }
  }
  return candidate;
}

const numbers = [2, 2, 1, 1, 1, 2, 2];
console.log(majorityElement(numbers)); // expected: 2`,
  },
  {
    id: "find-all-numbers-disappeared-in-an-array",
    number: 10,
    title: "Find All Numbers Disappeared in an Array",
    group: "Arrays & Hashing",
    difficulty: "Easy",
    statement:
      "An array of length n holds numbers from 1 to n, but some appear twice and others are missing. Return every number from 1 to n that does not appear.",
    example: "numbers = [4,3,2,7,8,2,3,1] → [5,6]",
    approach:
      "Use the array itself as a checklist: value v 'ticks' position v - 1 by making the number there negative. Use the absolute value when reading, because a position may already be ticked. Afterwards, any position still holding a positive number was never ticked, so position + 1 is missing.",
    watch: [
      "Watch `markedIndex`: the position that `numbers[numberIndex]` ticks off.",
      "Numbers in `numbers` turn negative as they are ticked; a second tick leaves them negative.",
      "After the first loop only positions 4 and 5 are still positive.",
      "The second loop turns those positions into the answers 5 and 6.",
    ],
    complexity: { time: "O(n)", space: "O(1) extra (besides the output)" },
    code: `function findDisappearedNumbers(numbers) {
  // Pass 1: for each value v, mark position v - 1 as "seen" (negative)
  for (let numberIndex = 0; numberIndex < numbers.length; numberIndex++) {
    const markedIndex = Math.abs(numbers[numberIndex]) - 1; // abs: it may already be marked
    if (numbers[markedIndex] > 0) {
      numbers[markedIndex] = -numbers[markedIndex];
    }
  }
  // Pass 2: positions still positive were never marked
  const missing = [];
  for (let numberIndex = 0; numberIndex < numbers.length; numberIndex++) {
    if (numbers[numberIndex] > 0) {
      missing.push(numberIndex + 1);
    }
  }
  return missing;
}

const numbers = [4, 3, 2, 7, 8, 2, 3, 1];
console.log(findDisappearedNumbers(numbers)); // expected: [5, 6]`,
  },
  {
    id: "intersection-of-two-arrays",
    number: 11,
    title: "Intersection of Two Arrays",
    group: "Arrays & Hashing",
    difficulty: "Easy",
    statement:
      "Given two arrays, return the values that appear in both. Each value appears only once in the answer, in any order.",
    example: "nums1 = [4,9,5], nums2 = [9,4,9,8,4] → [9,4]",
    approach:
      "Put the first array's values into a Set. Walk the second array; whenever a value is in the Set, add it to the result and delete it from the Set. Deleting makes sure the same value is never added twice.",
    watch: [
      "Watch `seen` start as {4, 9, 5}.",
      "When `nums2[numberIndex]` is found in `seen`, it is pushed to `result` and removed from `seen`.",
      "The second 9 and second 4 are ignored because they were already removed.",
    ],
    complexity: { time: "O(n + m)", space: "O(n)" },
    code: `function intersection(nums1, nums2) {
  const seen = new Set(nums1); // values of the first array
  const result = [];
  for (let numberIndex = 0; numberIndex < nums2.length; numberIndex++) {
    if (seen.has(nums2[numberIndex])) {
      result.push(nums2[numberIndex]); // in both arrays
      seen.delete(nums2[numberIndex]); // so it is not added twice
    }
  }
  return result;
}

const nums1 = [4, 9, 5];
const nums2 = [9, 4, 9, 8, 4];
console.log(intersection(nums1, nums2)); // expected: [9, 4]`,
  },
  {
    id: "intersection-of-two-arrays-ii",
    number: 12,
    title: "Intersection of Two Arrays II",
    group: "Arrays & Hashing",
    difficulty: "Easy",
    statement:
      "Given two arrays, return their common values, keeping repeats: a value appears in the answer as many times as it appears in both arrays. Any order is accepted.",
    example: "nums1 = [1,2,2,1], nums2 = [2,2] → [2,2]",
    approach:
      "Count each value of the first array in a Map. Walk the second array; whenever a value still has a count above zero, add it to the result and lower its count. The count limits each value to the smaller of its two frequencies.",
    watch: [
      "Watch `count` after the first loop: 1 → 2, 2 → 2.",
      "Each match in `nums2` pushes to `result` and lowers `count` by one.",
      "A value whose count is 0 would be skipped.",
    ],
    complexity: { time: "O(n + m)", space: "O(n)" },
    code: `function intersect(nums1, nums2) {
  const count = new Map(); // value -> copies left from nums1
  for (let numberIndex = 0; numberIndex < nums1.length; numberIndex++) {
    count.set(nums1[numberIndex], (count.get(nums1[numberIndex]) || 0) + 1);
  }
  const result = [];
  for (let numberIndex = 0; numberIndex < nums2.length; numberIndex++) {
    const remaining = count.get(nums2[numberIndex]) || 0;
    if (remaining > 0) {
      result.push(nums2[numberIndex]); // a copy is still available
      count.set(nums2[numberIndex], remaining - 1); // use it up
    }
  }
  return result;
}

const nums1 = [1, 2, 2, 1];
const nums2 = [2, 2];
console.log(intersect(nums1, nums2)); // expected: [2, 2]`,
  },
  {
    id: "happy-number",
    number: 13,
    title: "Happy Number",
    group: "Arrays & Hashing",
    difficulty: "Easy",
    statement:
      "Start with a number and keep replacing it with the sum of the squares of its digits. If you eventually reach 1, the number is happy; if you loop forever without reaching 1, it is not.",
    example: "currentNumber = 19 → true",
    approach:
      "Remember every number you have produced in a Set. If you reach 1, the number is happy. If you produce a number that is already in the Set, you are in a cycle that will never reach 1, so stop and answer false.",
    watch: [
      "Watch `currentNumber` change: 19 → 82 → 68 → 100 → 1.",
      "In the inner loop, `digit` is the last digit and `currentNumber` shrinks by a factor of 10.",
      "`seen` gains each number before its next value is computed.",
      "The outer loop ends when `currentNumber` is 1 or is already in `seen`.",
    ],
    complexity: { time: "O(log n)", space: "O(log n)" },
    code: `function isHappy(currentNumber) {
  const seen = new Set(); // numbers produced so far
  while (currentNumber !== 1 && !seen.has(currentNumber)) {
    seen.add(currentNumber);
    // replace n with the sum of the squares of its digits
    let digitSquareSum = 0;
    while (currentNumber > 0) {
      const digit = currentNumber % 10; // last digit
      digitSquareSum += digit * digit;
      currentNumber = Math.floor(currentNumber / 10); // drop the last digit
    }
    currentNumber = digitSquareSum;
  }
  return currentNumber === 1; // reached 1, or stuck in a cycle
}

console.log(isHappy(19)); // expected: true`,
  },
  {
    id: "isomorphic-strings",
    number: 14,
    title: "Isomorphic Strings",
    group: "Arrays & Hashing",
    difficulty: "Easy",
    statement:
      "Two strings are isomorphic if each letter of the first can be swapped for a letter of the second to turn it into the second. Every occurrence of a letter must map the same way, and two different letters cannot map to the same one.",
    example: 'firstText = "paper", secondText = "title" → true',
    approach:
      "Keep two Maps: one from letters of s to letters of t, and one back the other way. At each position, if either letter already has a mapping that disagrees with the current pair, the strings are not isomorphic. Checking both directions blocks two letters mapping to the same one.",
    watch: [
      "Watch `sToT` and `tToS` each gain a pair the first time a letter is met.",
      "At charIndex = 2, 'p' is already mapped to 't', and `secondText[charIndex]` is 't', so it agrees.",
      "A mismatch in either Map would return false at once.",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function isIsomorphic(firstText, secondText) {
  if (firstText.length !== secondText.length) return false;
  const sToT = new Map(); // letter in firstText -> letter in t
  const tToS = new Map(); // letter in secondText -> letter in s
  for (let charIndex = 0; charIndex < firstText.length; charIndex++) {
    const firstChar = firstText[charIndex];
    const secondChar = secondText[charIndex];
    if (sToT.has(firstChar) && sToT.get(firstChar) !== secondChar) return false; // a already maps elsewhere
    if (tToS.has(secondChar) && tToS.get(secondChar) !== firstChar) return false; // b already taken
    sToT.set(firstChar, secondChar);
    tToS.set(secondChar, firstChar);
  }
  return true;
}

console.log(isIsomorphic("paper", "title")); // expected: true`,
  },
  {
    id: "word-pattern",
    number: 15,
    title: "Word Pattern",
    group: "Arrays & Hashing",
    difficulty: "Easy",
    statement:
      "Given a pattern of letters and a sentence of words, check whether the sentence follows the pattern. Each letter must stand for exactly one word, and each word for exactly one letter.",
    example: 'pattern = "abba", sentence = "dog cat cat dog" → true',
    approach:
      "Split the sentence into words, then pair letter i with word i. Keep two Maps, letter → word and word → letter, exactly like Isomorphic Strings. If a letter or word already has a different partner, the pattern is broken.",
    watch: [
      "Watch `words` after the split: four words for four letters.",
      "`letterToWord` and `wordToLetter` gain an entry the first time each letter or word appears.",
      "At patternIndex = 2 and patternIndex = 3 the pairs already exist and agree, so nothing changes.",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function wordPattern(pattern, sentence) {
  const words = sentence.split(" ");
  if (words.length !== pattern.length) return false; // counts must match
  const letterToWord = new Map();
  const wordToLetter = new Map();
  for (let patternIndex = 0; patternIndex < pattern.length; patternIndex++) {
    const letter = pattern[patternIndex];
    const word = words[patternIndex];
    if (letterToWord.has(letter) && letterToWord.get(letter) !== word) return false;
    if (wordToLetter.has(word) && wordToLetter.get(word) !== letter) return false;
    letterToWord.set(letter, word);
    wordToLetter.set(word, letter);
  }
  return true;
}

console.log(wordPattern("abba", "dog cat cat dog")); // expected: true`,
  },
];
