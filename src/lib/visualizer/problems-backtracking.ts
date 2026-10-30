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
    example: "nums = [1,2,3] → [[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]",
    approach:
      "Build subsets one number at a time with a shared `path`. Every call first saves a copy of `path` as an answer, then tries adding each remaining number (from `start` onward), recurses, and removes it again. Only moving forward from `start` means each set is built in one order, so there are no duplicates.",
    watch: [
      "every call copies `path` into `result` first: that is why the empty set comes out first",
      "choose: `path.push(nums[i])`, explore: the recursive call with `i + 1`, un-choose: `path.pop()`",
      "`path` grows to [1,2,3] and then shrinks back after each pop",
      "`start` only moves forward, so [2,1] is never built after [1,2]",
    ],
    complexity: { time: "O(n · 2ⁿ)", space: "O(n)" },
    code: `function subsets(nums) {
  const result = []; // every subset found
  const path = []; // the subset being built right now

  function backtrack(start) {
    result.push([...path]); // every path is a valid subset: save a copy

    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]); // choose nums[i]
      backtrack(i + 1); // explore with only later numbers
      path.pop(); // un-choose: try the next number instead
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
    example: "nums = [1,2,3] → [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
    approach:
      "Fill the positions one by one. At each level try every number that is not already in `path` (a `used` Set tracks them), recurse, then remove it so the next number can take that spot. When `path` holds all n numbers, one full ordering is complete.",
    watch: [
      "`used` grows and shrinks in step with `path`",
      "a number already in `used` is skipped: that is what stops [1,1,…]",
      "when `path.length === nums.length` a copy goes into `result` and the call returns",
      "after each `path.pop()` the loop moves on and a different number takes that position",
    ],
    complexity: { time: "O(n · n!)", space: "O(n)" },
    code: `function permute(nums) {
  const result = []; // every full ordering
  const path = []; // the ordering being built
  const used = new Set(); // numbers already placed in path

  function backtrack() {
    // every position is filled: save a copy
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }

    for (const num of nums) {
      if (used.has(num)) continue; // already placed, skip it
      path.push(num); // choose
      used.add(num);
      backtrack(); // explore the next position
      path.pop(); // un-choose
      used.delete(num);
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
    example: "n = 4, k = 2 → [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]",
    approach:
      "Like Subsets, but only save `path` once it holds exactly k numbers. Each level tries the numbers from `start` to n, recurses with the next number, then pops. Starting the next level after the chosen number keeps every pick in increasing order, so nothing repeats.",
    watch: [
      "`path` only reaches length 2 (k) before it is saved",
      "a call with a full `path` saves a copy and returns at once, without looping",
      "`start` is one past the last number chosen, so picks stay increasing",
      "after `path.pop()` the loop tries the next larger number in that position",
    ],
    complexity: { time: "O(k · C(n, k))", space: "O(k)" },
    code: `function combine(n, k) {
  const result = []; // every pick of k numbers
  const path = []; // the pick being built

  function backtrack(start) {
    // the pick is full: save a copy
    if (path.length === k) {
      result.push([...path]);
      return;
    }

    for (let i = start; i <= n; i++) {
      path.push(i); // choose i
      backtrack(i + 1); // explore with larger numbers only
      path.pop(); // un-choose
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
      "the recursive call passes `i`, not `i + 1`: the same number may be picked again",
      "`remaining < 0` ends a branch early, so [2,2,2,3] is abandoned",
      "`remaining === 0` saves a copy of `path` into `result`",
    ],
    complexity: { time: "O(n^(target/min))", space: "O(target/min)" },
    code: `function combinationSum(candidates, target) {
  const result = []; // every combination that hits target
  const path = []; // the combination being built

  function backtrack(start, remaining) {
    if (remaining === 0) {
      result.push([...path]); // exactly hit the target
      return;
    }
    if (remaining < 0) return; // overshot: dead end

    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i]); // choose
      backtrack(i, remaining - candidates[i]); // explore (same i: reuse allowed)
      path.pop(); // un-choose
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
      "Sort first so equal numbers sit side by side. Recurse with `i + 1` so each number is used at most once. To avoid duplicate answers, skip a number at the same level when it equals the one just before it (`i > start && nums[i] === nums[i - 1]`): that branch was already explored.",
    watch: [
      "after sorting, the two 1s are neighbours: [1,1,2,3]",
      "the second 1 is skipped at the top level (`i > start`) but allowed one level deeper, giving [1,1,2]",
      "the call passes `i + 1`: each number is used once",
      "the loop `break`s as soon as a number is bigger than `remaining`: the rest are bigger too",
    ],
    complexity: { time: "O(2ⁿ)", space: "O(n)" },
    code: `function combinationSum2(candidates, target) {
  const nums = [...candidates].sort((a, b) => a - b); // equal numbers side by side
  const result = []; // every unique combination
  const path = []; // the combination being built

  function backtrack(start, remaining) {
    if (remaining === 0) {
      result.push([...path]); // exactly hit the target
      return;
    }

    for (let i = start; i < nums.length; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue; // same value at same level: skip
      if (nums[i] > remaining) break; // too big, and the rest are bigger

      path.push(nums[i]); // choose
      backtrack(i + 1, remaining - nums[i]); // explore (i + 1: use once)
      path.pop(); // un-choose
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
      "Handle one digit per level. For digit `idx`, try each of its letters: push it onto `path`, recurse to the next digit, then pop. When every digit has a letter (`idx === digits.length`), join `path` into one word and save it.",
    watch: [
      "`idx` is the digit being filled; `letters` are that digit's options",
      "`path` never grows past 2 letters here, one per digit",
      "at the bottom (`idx === 2`) `path.join(\"\")` becomes a new word in `result`",
      "after `path.pop()` the next letter of the same digit is tried",
    ],
    complexity: { time: "O(n · 4ⁿ)", space: "O(n)" },
    code: `const KEYS = { 2: "abc", 3: "def", 4: "ghi", 5: "jkl", 6: "mno", 7: "pqrs", 8: "tuv", 9: "wxyz" };

function letterCombinations(digits) {
  if (digits.length === 0) return [];
  const result = []; // every word found
  const path = []; // letters chosen so far

  function backtrack(idx) {
    // one letter for every digit: save the word
    if (idx === digits.length) {
      result.push(path.join(""));
      return;
    }

    const letters = KEYS[digits[idx]]; // options for this digit
    for (const ch of letters) {
      path.push(ch); // choose a letter
      backtrack(idx + 1); // explore the next digit
      path.pop(); // un-choose
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
    example: "n = 3 → [\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]",
    approach:
      "Build the string one bracket at a time and only make moves that keep it valid. You may add `(` while fewer than n are open, and `)` only while it would close an open one (`close < open`). Because no invalid prefix is ever built, every finished string of length 2n is an answer.",
    watch: [
      "`open` and `close` count the brackets used so far",
      "`(` is tried first, so the deepest nesting \"((()))\" comes out first",
      "`)` is only allowed while `close < open`: it never closes nothing",
      "each `path.pop()` undoes one bracket so the other choice can be tried",
    ],
    complexity: { time: "O(4ⁿ / √n)", space: "O(n)" },
    code: `function generateParenthesis(n) {
  const result = []; // every balanced string
  const path = []; // brackets placed so far

  function backtrack(open, close) {
    // all 2n brackets placed: save the string
    if (path.length === 2 * n) {
      result.push(path.join(""));
      return;
    }

    if (open < n) {
      path.push("("); // choose an opening bracket
      backtrack(open + 1, close); // explore
      path.pop(); // un-choose
    }
    if (close < open) {
      path.push(")"); // choose a closing bracket
      backtrack(open, close + 1); // explore
      path.pop(); // un-choose
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
      "`idx` is how many letters of the word are already matched",
      "a cell becomes `#` while it is on the current path, then gets its letter back",
      "out-of-grid cells and wrong letters return false at once",
      "the first \"S\" at (1,0) is a dead end; the one at (1,3) leads to \"E\",\"E\"",
      "`idx === word.length` means every letter matched: true bubbles back up",
    ],
    complexity: { time: "O(rows · cols · 4^L)", space: "O(L)" },
    code: `function exist(board, word) {
  const rows = board.length;
  const cols = board[0].length;

  function dfs(row, col, idx) {
    if (idx === word.length) return true; // every letter matched
    if (row < 0 || row >= rows || col < 0 || col >= cols) return false; // off the grid
    if (board[row][col] !== word[idx]) return false; // wrong letter (or already used)

    const letter = board[row][col];
    board[row][col] = "#"; // choose: mark this cell as used

    // explore the four neighbours for the next letter
    const found =
      dfs(row + 1, col, idx + 1) ||
      dfs(row - 1, col, idx + 1) ||
      dfs(row, col + 1, idx + 1) ||
      dfs(row, col - 1, idx + 1);

    board[row][col] = letter; // un-choose: give the letter back
    return found;
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (dfs(row, col, 0)) return true; // try every starting cell
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
    example: 's = "aab" → [["a","a","b"],["aa","b"]]',
    approach:
      "At position `start`, try every cut `end`: if `s.slice(start, end + 1)` is a palindrome, push it onto `path` and recurse from `end + 1`, then pop it. When `start` reaches the end of the string, `path` is one complete split.",
    watch: [
      "`start` is where the next piece begins; `end` is where it would stop",
      "a piece that is not a palindrome (\"ab\", \"aab\") is never pushed",
      "`path` holds the pieces so far, e.g. [\"a\",\"a\"] then [\"a\",\"a\",\"b\"]",
      "`start === s.length` means the whole string is used: save a copy of `path`",
    ],
    complexity: { time: "O(n · 2ⁿ)", space: "O(n)" },
    code: `// true when s[left..right] reads the same both ways
function isPalindrome(s, left, right) {
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}

function partition(s) {
  const result = []; // every valid split
  const path = []; // pieces chosen so far

  function backtrack(start) {
    // the whole string is split: save a copy
    if (start === s.length) {
      result.push([...path]);
      return;
    }

    for (let end = start; end < s.length; end++) {
      if (!isPalindrome(s, start, end)) continue; // not a palindrome: skip this cut
      path.push(s.slice(start, end + 1)); // choose this piece
      backtrack(end + 1); // explore the rest of the string
      path.pop(); // un-choose
    }
  }

  backtrack(0);
  return result;
}

console.log(partition("aab")); // expected: [["a","a","b"],["aa","b"]]`,
  },
];
