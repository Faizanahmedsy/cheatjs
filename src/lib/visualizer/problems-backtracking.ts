import type { Problem } from "./problem-types";

/** Backtracking & Recursion (116–124). */
export const BACKTRACKING_PROBLEMS: Problem[] = [
  {
    id: "subsets",
    number: 116,
    title: "Subsets",
    group: "Backtracking & Recursion",
    difficulty: "Medium",
    statement:
      "Given an array of distinct numbers, return every possible subset (the power set). The empty set counts, and no subset may appear twice.",
    example: "numbers = [1,2,3] → [[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]",
    approach:
      "Build subsets one number at a time with a shared `currentPath`. Every call first saves a copy of `currentPath` as an answer, then tries adding each remaining number (from `start` onward), recurses, and removes it again. Only moving forward from `start` means each set is built in one order, so there are no duplicates.",
    watch: [
      "every call copies `currentPath` into `result` first: that is why the empty set comes out first",
      "choose: `currentPath.push(numbers[numberIndex])`, explore: the recursive call with `numberIndex + 1`, un-choose: `currentPath.pop()`",
      "`currentPath` grows to [1,2,3] and then shrinks back after each pop",
      "`start` only moves forward, so [2,1] is never built after [1,2]",
    ],
    complexity: { time: "O(n · 2ⁿ)", space: "O(n)" },
    code: `function subsets(numbers) {
  const result = []; // every subset found
  const currentPath = []; // the subset being built right now

  function backtrack(start) {
    result.push([...currentPath]); // every path is a valid subset: save a copy

    for (let numberIndex = start; numberIndex < numbers.length; numberIndex++) {
      currentPath.push(numbers[numberIndex]); // choose numbers[numberIndex]
      backtrack(numberIndex + 1); // explore with only later numbers
      currentPath.pop(); // un-choose: try the next number instead
    }
  }

  backtrack(0);
  return result;
}

console.log(subsets([1, 2, 3])); // expected: [[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]`,
  },
  {
    id: "permutations",
    number: 117,
    title: "Permutations",
    group: "Backtracking & Recursion",
    difficulty: "Medium",
    statement:
      "Given an array of distinct numbers, return every possible ordering of them. Each ordering uses every number exactly once.",
    example: "numbers = [1,2,3] → [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
    approach:
      "Fill the positions one by one. At each level try every number that is not already in `currentPath` (a `used` Set tracks them), recurse, then remove it so the next number can take that spot. When `currentPath` holds all n numbers, one full ordering is complete.",
    watch: [
      "`used` grows and shrinks in step with `currentPath`",
      "a number already in `used` is skipped: that is what stops [1,1,…]",
      "when `currentPath.length === numbers.length` a copy goes into `result` and the call returns",
      "after each `currentPath.pop()` the loop moves on and a different number takes that position",
    ],
    complexity: { time: "O(n · n!)", space: "O(n)" },
    code: `function permute(numbers) {
  const result = []; // every full ordering
  const currentPath = []; // the ordering being built
  const used = new Set(); // numbers already placed in path

  function backtrack() {
    // every position is filled: save a copy
    if (currentPath.length === numbers.length) {
      result.push([...currentPath]);
      return;
    }

    for (const number of numbers) {
      if (used.has(number)) continue; // already placed, skip it
      currentPath.push(number); // choose
      used.add(number);
      backtrack(); // explore the next position
      currentPath.pop(); // un-choose
      used.delete(number);
    }
  }

  backtrack();
  return result;
}

console.log(permute([1, 2, 3])); // expected: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]`,
  },
  {
    id: "combinations",
    number: 118,
    title: "Combinations",
    group: "Backtracking & Recursion",
    difficulty: "Medium",
    statement:
      "Given n and k, return every way to pick k different numbers from 1 to n. Order inside a pick does not matter, so [1,2] and [2,1] are the same.",
    example: "maxNumber = 4, groupSize = 2 → [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]",
    approach:
      "Like Subsets, but only save `currentPath` once it holds exactly k numbers. Each level tries the numbers from `start` to n, recurses with the next number, then pops. Starting the next level after the chosen number keeps every pick in increasing order, so nothing repeats.",
    watch: [
      "`currentPath` only reaches length 2 (k) before it is saved",
      "a call with a full `currentPath` saves a copy and returns at once, without looping",
      "`start` is one past the last number chosen, so picks stay increasing",
      "after `currentPath.pop()` the loop tries the next larger number in that position",
    ],
    complexity: { time: "O(k · C(n, k))", space: "O(k)" },
    code: `function combine(maxNumber, groupSize) {
  const result = []; // every pick of k numbers
  const currentPath = []; // the pick being built

  function backtrack(start) {
    // the pick is full: save a copy
    if (currentPath.length === groupSize) {
      result.push([...currentPath]);
      return;
    }

    for (let number = start; number <= maxNumber; number++) {
      currentPath.push(number); // choose i
      backtrack(number + 1); // explore with larger numbers only
      currentPath.pop(); // un-choose
    }
  }

  backtrack(1);
  return result;
}

console.log(combine(4, 2)); // expected: [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]`,
  },
  {
    id: "combination-sum",
    number: 119,
    title: "Combination Sum",
    group: "Backtracking & Recursion",
    difficulty: "Medium",
    statement:
      "Given distinct positive numbers and a target, return every combination that adds up to the target. A number may be used any number of times.",
    example: "candidates = [2,3,5], target = 8 → [[2,2,2,2],[2,3,3],[3,5]]",
    approach:
      "Keep `remaining`, the amount still needed. Try each candidate from `start` onward: subtract it, recurse with the same `start` index (so it can be used again), then pop it. Stop a branch when `remaining` hits 0 (found one) or goes below 0 (overshot).",
    watch: [
      "`remaining` drops by the chosen number on every call",
      "the recursive call passes `candidateIndex`, not `candidateIndex + 1`: the same number may be picked again",
      "`remaining < 0` ends a branch early, so [2,2,2,3] is abandoned",
      "`remaining === 0` saves a copy of `currentPath` into `result`",
    ],
    complexity: { time: "O(n^(target/min))", space: "O(target/min)" },
    code: `function combinationSum(candidates, target) {
  const result = []; // every combination that hits target
  const currentPath = []; // the combination being built

  function backtrack(start, remaining) {
    if (remaining === 0) {
      result.push([...currentPath]); // exactly hit the target
      return;
    }
    if (remaining < 0) return; // overshot: dead end

    for (let candidateIndex = start; candidateIndex < candidates.length; candidateIndex++) {
      currentPath.push(candidates[candidateIndex]); // choose
      backtrack(candidateIndex, remaining - candidates[candidateIndex]); // explore (same i: reuse allowed)
      currentPath.pop(); // un-choose
    }
  }

  backtrack(0, target);
  return result;
}

console.log(combinationSum([2, 3, 5], 8)); // expected: [[2,2,2,2],[2,3,3],[3,5]]`,
  },
  {
    id: "combination-sum-ii",
    number: 120,
    title: "Combination Sum II",
    group: "Backtracking & Recursion",
    difficulty: "Medium",
    statement:
      "Given numbers that may contain duplicates and a target, return every combination that adds up to the target. Each number may be used once, and the answer must not contain the same combination twice.",
    example: "candidates = [2,1,1,3], target = 4 → [[1,1,2],[1,3]]",
    approach:
      "Sort first so equal numbers sit side by side. Recurse with `numberIndex + 1` so each number is used at most once. To avoid duplicate answers, skip a number at the same level when it equals the one just before it (`numberIndex > start && numbers[numberIndex] === numbers[numberIndex - 1]`): that branch was already explored.",
    watch: [
      "after sorting, the two 1s are neighbours: [1,1,2,3]",
      "the second 1 is skipped at the top level (`numberIndex > start`) but allowed one level deeper, giving [1,1,2]",
      "the call passes `numberIndex + 1`: each number is used once",
      "the loop `break`s as soon as a number is bigger than `remaining`: the rest are bigger too",
    ],
    complexity: { time: "O(2ⁿ)", space: "O(n)" },
    code: `function combinationSum2(candidates, target) {
  const numbers = [...candidates].sort((first, second) => first - second); // equal numbers side by side
  const result = []; // every unique combination
  const currentPath = []; // the combination being built

  function backtrack(start, remaining) {
    if (remaining === 0) {
      result.push([...currentPath]); // exactly hit the target
      return;
    }

    for (let numberIndex = start; numberIndex < numbers.length; numberIndex++) {
      if (numberIndex > start && numbers[numberIndex] === numbers[numberIndex - 1]) continue; // same value at same level: skip
      if (numbers[numberIndex] > remaining) break; // too big, and the rest are bigger

      currentPath.push(numbers[numberIndex]); // choose
      backtrack(numberIndex + 1, remaining - numbers[numberIndex]); // explore (numberIndex + 1: use once)
      currentPath.pop(); // un-choose
    }
  }

  backtrack(0, target);
  return result;
}

console.log(combinationSum2([2, 1, 1, 3], 4)); // expected: [[1,1,2],[1,3]]`,
  },
  {
    id: "letter-combinations-of-a-phone-number",
    number: 121,
    title: "Letter Combinations of a Phone Number",
    group: "Backtracking & Recursion",
    difficulty: "Medium",
    statement:
      "Each digit 2–9 on a phone keypad maps to a few letters. Given a string of digits, return every letter string those digits could spell.",
    example: 'digits = "23" → ["ad","ae","af","bd","be","bf","cd","ce","cf"]',
    approach:
      "Handle one digit per level. For digit `digitPosition`, try each of its letters: push it onto `currentPath`, recurse to the next digit, then pop. When every digit has a letter (`digitPosition === digits.length`), join `currentPath` into one word and save it.",
    watch: [
      "`digitPosition` is the digit being filled; `letters` are that digit's options",
      "`currentPath` never grows past 2 letters here, one per digit",
      "at the bottom (`digitPosition === 2`) `currentPath.join(\"\")` becomes a new word in `result`",
      "after `currentPath.pop()` the next letter of the same digit is tried",
    ],
    complexity: { time: "O(n · 4ⁿ)", space: "O(n)" },
    code: `const KEYS = { 2: "abc", 3: "def", 4: "ghi", 5: "jkl", 6: "mno", 7: "pqrs", 8: "tuv", 9: "wxyz" };

function letterCombinations(digits) {
  if (digits.length === 0) return [];
  const result = []; // every word found
  const currentPath = []; // letters chosen so far

  function backtrack(digitPosition) {
    // one letter for every digit: save the word
    if (digitPosition === digits.length) {
      result.push(currentPath.join(""));
      return;
    }

    const letters = KEYS[digits[digitPosition]]; // options for this digit
    for (const character of letters) {
      currentPath.push(character); // choose a letter
      backtrack(digitPosition + 1); // explore the next digit
      currentPath.pop(); // un-choose
    }
  }

  backtrack(0);
  return result;
}

console.log(letterCombinations("23")); // expected: ["ad","ae","af","bd","be","bf","cd","ce","cf"]`,
  },
  {
    id: "generate-parentheses",
    number: 122,
    title: "Generate Parentheses",
    group: "Backtracking & Recursion",
    difficulty: "Medium",
    statement:
      "Given n, return every string of n pairs of parentheses that is correctly balanced. Every opening bracket must be closed, in order.",
    example: "pairCount = 3 → [\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]",
    approach:
      "Build the string one bracket at a time and only make moves that keep it valid. You may add `(` while fewer than n are open, and `)` only while it would close an open one (`close < open`). Because no invalid prefix is ever built, every finished string of length 2n is an answer.",
    watch: [
      "`open` and `close` count the brackets used so far",
      "`(` is tried first, so the deepest nesting \"((()))\" comes out first",
      "`)` is only allowed while `close < open`: it never closes nothing",
      "each `currentPath.pop()` undoes one bracket so the other choice can be tried",
    ],
    complexity: { time: "O(4ⁿ / √n)", space: "O(n)" },
    code: `function generateParenthesis(pairCount) {
  const result = []; // every balanced string
  const currentPath = []; // brackets placed so far

  function backtrack(open, close) {
    // all 2n brackets placed: save the string
    if (currentPath.length === 2 * pairCount) {
      result.push(currentPath.join(""));
      return;
    }

    if (open < pairCount) {
      currentPath.push("("); // choose an opening bracket
      backtrack(open + 1, close); // explore
      currentPath.pop(); // un-choose
    }
    if (close < open) {
      currentPath.push(")"); // choose a closing bracket
      backtrack(open, close + 1); // explore
      currentPath.pop(); // un-choose
    }
  }

  backtrack(0, 0);
  return result;
}

console.log(generateParenthesis(3)); // expected: ["((()))","(()())","(())()","()(())","()()()"]`,
  },
  {
    id: "word-search",
    number: 123,
    title: "Word Search",
    group: "Backtracking & Recursion",
    difficulty: "Medium",
    statement:
      "Given a grid of letters and a word, decide whether the word can be traced through the grid. Each step moves up, down, left or right, and a cell may be used only once in the word.",
    example: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE" → true',
    approach:
      "Try every cell as a starting point. From a cell, match the next letter, mark the cell as used (overwrite it with `#`), and explore the four neighbours for the following letter. If none of them works, put the letter back (un-choose) so other paths can use the cell.",
    watch: [
      "`letterPosition` is how many letters of the word are already matched",
      "a cell becomes `#` while it is on the current path, then gets its letter back",
      "out-of-grid cells and wrong letters return false at once",
      "the first \"S\" at (1,0) is a dead end; the one at (1,3) leads to \"E\",\"E\"",
      "`letterPosition === word.length` means every letter matched: true bubbles back up",
    ],
    complexity: { time: "O(rows · cols · 4^L)", space: "O(L)" },
    code: `function exist(board, word) {
  const rowCount = board.length;
  const columnCount = board[0].length;

  function dfs(rowIndex, columnIndex, letterPosition) {
    if (letterPosition === word.length) return true; // every letter matched
    if (rowIndex < 0 || rowIndex >= rowCount || columnIndex < 0 || columnIndex >= columnCount) return false; // off the grid
    if (board[rowIndex][columnIndex] !== word[letterPosition]) return false; // wrong letter (or already used)

    const letter = board[rowIndex][columnIndex];
    board[rowIndex][columnIndex] = "#"; // choose: mark this cell as used

    // explore the four neighbours for the next letter
    const found =
      dfs(rowIndex + 1, columnIndex, letterPosition + 1) ||
      dfs(rowIndex - 1, columnIndex, letterPosition + 1) ||
      dfs(rowIndex, columnIndex + 1, letterPosition + 1) ||
      dfs(rowIndex, columnIndex - 1, letterPosition + 1);

    board[rowIndex][columnIndex] = letter; // un-choose: give the letter back
    return found;
  }

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      if (dfs(rowIndex, columnIndex, 0)) return true; // try every starting cell
    }
  }
  return false;
}

const board = [
  ["A", "B", "C", "E"],
  ["S", "F", "C", "S"],
  ["A", "D", "E", "E"],
];
console.log(exist(board, "SEE")); // expected: true`,
  },
  {
    id: "palindrome-partitioning",
    number: 124,
    title: "Palindrome Partitioning",
    group: "Backtracking & Recursion",
    difficulty: "Medium",
    statement:
      "Split a string into pieces so that every piece is a palindrome. Return every such way of splitting it.",
    example: 'text = "aab" → [["a","a","b"],["aa","b"]]',
    approach:
      "At position `start`, try every cut `end`: if `text.slice(start, end + 1)` is a palindrome, push it onto `currentPath` and recurse from `end + 1`, then pop it. When `start` reaches the end of the string, `currentPath` is one complete split.",
    watch: [
      "`start` is where the next piece begins; `end` is where it would stop",
      "a piece that is not a palindrome (\"ab\", \"aab\") is never pushed",
      "`currentPath` holds the pieces so far, e.g. [\"a\",\"a\"] then [\"a\",\"a\",\"b\"]",
      "`start === text.length` means the whole string is used: save a copy of `currentPath`",
    ],
    complexity: { time: "O(n · 2ⁿ)", space: "O(n)" },
    code: `// true when text[left..right] reads the same both ways
function isPalindrome(text, left, right) {
  while (left < right) {
    if (text[left] !== text[right]) return false;
    left++;
    right--;
  }
  return true;
}

function partition(text) {
  const result = []; // every valid split
  const currentPath = []; // pieces chosen so far

  function backtrack(start) {
    // the whole string is split: save a copy
    if (start === text.length) {
      result.push([...currentPath]);
      return;
    }

    for (let end = start; end < text.length; end++) {
      if (!isPalindrome(text, start, end)) continue; // not a palindrome: skip this cut
      currentPath.push(text.slice(start, end + 1)); // choose this piece
      backtrack(end + 1); // explore the rest of the string
      currentPath.pop(); // un-choose
    }
  }

  backtrack(0);
  return result;
}

console.log(partition("aab")); // expected: [["a","a","b"],["aa","b"]]`,
  },
];
