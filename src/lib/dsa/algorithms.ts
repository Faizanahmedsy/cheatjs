import {
  Brain,
  Table,
  Coins,
  Zap,
  Crosshair,
  BarChart3,
  Split,
} from "lucide-react";
import type { DSATopic } from "@/lib/dsa";

// More algorithm topics: dynamic programming, greedy, advanced binary search,
// more sorting and divide and conquer. Every code block is a self-contained
// program that runs as-is (and in the /visualizer).

export const algorithmMoreTopics: DSATopic[] = [
  // ---------------------------------------------------------------------------
  // 1. DYNAMIC PROGRAMMING FOUNDATIONS
  // ---------------------------------------------------------------------------
  {
    id: "dynamic-programming",
    label: "Dynamic Programming",
    icon: Brain,
    href: "/dsa?topic=dynamic-programming",
    content: {
      title: "Dynamic Programming Foundations",
      description:
        "Solve a big problem by solving each smaller version once, storing the answer, and building up from it. Memoisation, tabulation, state and transition, and the classic 1D problems.",
      steps: [
        {
          title: "What DP Is & When to Use It",
          explanation:
            "Dynamic programming is recursion with a memory. A problem is a DP problem when it has two properties. Overlapping subproblems: the same smaller question gets asked again and again (fib(3) is computed many times inside fib(6)). Optimal substructure: the best answer for the big problem is built from the best answers of smaller problems. Signals in a problem statement: count the number of ways, find the minimum or maximum, can you reach or is it possible, and the choices at each step depend only on a small amount of state such as an index or a remaining amount.",
          code: `// Naive recursion: the SAME subproblems are solved again and again.
let calls = 0;

function fib(n) {
  calls++;
  if (n <= 1) return n;            // fib(0) = 0, fib(1) = 1
  return fib(n - 1) + fib(n - 2);  // two branches every time
}

console.log(fib(6));   // 8
console.log(calls);    // 25 calls for n = 6 (it roughly doubles per +1)

// The call tree for fib(4) shows the waste:
//
//                fib(4)
//              /        \\
//          fib(3)       fib(2)      <- fib(2) solved twice
//          /    \\       /    \\
//      fib(2) fib(1) fib(1) fib(0)
//      /    \\
//  fib(1) fib(0)
//
// DP = solve each fib(k) ONCE, store it, reuse it.
//
// Signals that a problem wants DP:
// - "number of ways to ..."           (counting)
// - "minimum / maximum cost ..."      (optimisation)
// - "is it possible to ..."           (true / false)
// - each decision only depends on a small state (index i, amount left, ...)`,
          language: "javascript",
        },
        {
          title: "The Template: Memoisation vs Tabulation",
          explanation:
            "Every DP solution answers three questions. State: what does dp[i] mean, in one sentence? Transition: how is dp[i] built from smaller states? Base case: which states are known without any work? Top-down memoisation keeps the natural recursion and caches each result in a memo. Bottom-up tabulation drops recursion and fills an array from the base cases upward in a loop. Both do the same amount of work; tabulation avoids deep call stacks and is easier to dry run.",
          code: `// ---------- TOP-DOWN (memoisation) ----------
// Same recursion as before, plus a cache.
function fibMemo(n, memo = {}) {
  if (n <= 1) return n;                  // base case
  if (memo[n] !== undefined) {           // already solved? reuse it
    return memo[n];
  }
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo); // solve once
  return memo[n];
}

// ---------- BOTTOM-UP (tabulation) ----------
// 1. STATE:      dp[i] = the i-th fibonacci number
// 2. TRANSITION: dp[i] = dp[i - 1] + dp[i - 2]
// 3. BASE CASE:  dp[0] = 0, dp[1] = 1
// 4. ORDER:      fill i = 2, 3, ... n (smaller states first)
// 5. ANSWER:     dp[n]
function fibTable(n) {
  if (n <= 1) return n;
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}

console.log(fibMemo(10));   // 55
console.log(fibTable(10));  // 55

// How to design any DP:
// - Write the state as a sentence: "dp[i] = best answer using the first i items"
// - Ask: what was the LAST choice made to reach state i? Each possible last
//   choice becomes one term in the transition.
// - Base cases = the states where no choice is left.`,
          language: "javascript",
        },
        {
          title: "Worked Example 1: Climbing Stairs",
          explanation:
            "You can climb 1 or 2 steps at a time. How many distinct ways are there to reach step n? Think about the last move: you arrived at step i either from step i - 1 (a 1-step) or from step i - 2 (a 2-step). So the ways to reach i are the ways to reach i - 1 plus the ways to reach i - 2.",
          code: `function climbStairs(n) {
  // STATE: dp[i] = number of ways to stand on step i
  const dp = new Array(n + 1).fill(0);

  // BASE: one way to stand on the ground (do nothing),
  //       one way to reach step 1 (a single 1-step)
  dp[0] = 1;
  dp[1] = 1;

  // TRANSITION: last move was a 1-step or a 2-step
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
}

console.log(climbStairs(5)); // 8
console.log(climbStairs(3)); // 3  (1+1+1, 1+2, 2+1)`,
          language: "javascript",
        },
        {
          title: "Dry Run: Climbing Stairs (n = 5)",
          explanation:
            "Follow the dp array as it fills one cell per loop iteration. Each new cell only reads the two cells just to its left, which is why the order (left to right) matters.",
          code: `// climbStairs(5)
//
// start:     dp = [1, 1, 0, 0, 0, 0]
//                   0  1  2  3  4  5   <- index (step number)
//
// | i | dp[i-1] | dp[i-2] | dp[i] = sum | dp after this iteration |
// |---|---------|---------|-------------|-------------------------|
// | 2 |    1    |    1    |      2      | [1, 1, 2, 0, 0, 0]      |
// | 3 |    2    |    1    |      3      | [1, 1, 2, 3, 0, 0]      |
// | 4 |    3    |    2    |      5      | [1, 1, 2, 3, 5, 0]      |
// | 5 |    5    |    3    |      8      | [1, 1, 2, 3, 5, 8]      |
//
// return dp[5] = 8
//
// The 8 ways (for checking by hand):
// 1+1+1+1+1, 2+1+1+1, 1+2+1+1, 1+1+2+1, 1+1+1+2, 2+2+1, 2+1+2, 1+2+2

function climbStairs(n) {
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    console.log("i = " + i + " -> dp = [" + dp.join(", ") + "]");
  }
  return dp[n];
}

console.log(climbStairs(5));
// i = 2 -> dp = [1, 1, 2, 0, 0, 0]
// i = 3 -> dp = [1, 1, 2, 3, 0, 0]
// i = 4 -> dp = [1, 1, 2, 3, 5, 0]
// i = 5 -> dp = [1, 1, 2, 3, 5, 8]
// 8`,
          language: "javascript",
        },
        {
          title: "Worked Example 2: House Robber & Min Cost Climbing Stairs",
          explanation:
            "House Robber: you cannot rob two adjacent houses; maximise the money. At house i you either skip it (keep dp[i - 1]) or rob it (nums[i] + dp[i - 2]). Min Cost Climbing Stairs: each step has a cost you pay when you leave it, you may start at step 0 or 1, and you want the cheapest way to get past the top. Both are the same shape as climbing stairs, with max or min instead of a sum.",
          code: `// ---------- House Robber ----------
// STATE: dp[i] = most money from houses 0..i
// TRANSITION: dp[i] = max(dp[i-1], dp[i-2] + nums[i])
function rob(nums) {
  if (nums.length === 1) return nums[0];
  const dp = new Array(nums.length).fill(0);
  dp[0] = nums[0];
  dp[1] = Math.max(nums[0], nums[1]);
  for (let i = 2; i < nums.length; i++) {
    const skip = dp[i - 1];
    const take = dp[i - 2] + nums[i];
    dp[i] = Math.max(skip, take);
  }
  return dp[nums.length - 1];
}

console.log(rob([2, 7, 9, 3, 1])); // 12  (2 + 9 + 1)

// Trace for [2, 7, 9, 3, 1]:
// | i | nums[i] | skip = dp[i-1] | take = dp[i-2]+nums[i] | dp[i] |
// |---|---------|----------------|------------------------|-------|
// | 0 |    2    |       -        |           -            |   2   |
// | 1 |    7    |       -        |           -            |   7   |
// | 2 |    9    |       7        |      2 + 9 = 11        |  11   |
// | 3 |    3    |      11        |      7 + 3 = 10        |  11   |
// | 4 |    1    |      11        |     11 + 1 = 12        |  12   |

// ---------- Min Cost Climbing Stairs ----------
// STATE: dp[i] = cheapest cost to STAND on step i (top = cost.length)
// TRANSITION: dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])
function minCostClimbingStairs(cost) {
  const n = cost.length;
  const dp = new Array(n + 1).fill(0);
  // dp[0] = dp[1] = 0: you may start on step 0 or 1 for free
  for (let i = 2; i <= n; i++) {
    dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);
  }
  return dp[n];
}

console.log(minCostClimbingStairs([10, 15, 20])); // 15

// Trace for [10, 15, 20]:
// dp = [0, 0, _, _]
// i = 2: min(dp[1] + 15, dp[0] + 10) = min(15, 10) = 10 -> dp = [0, 0, 10, _]
// i = 3: min(dp[2] + 20, dp[1] + 15) = min(30, 15) = 15 -> dp = [0, 0, 10, 15]
// answer dp[3] = 15 (start on step 1, pay 15, jump 2 to the top)`,
          language: "javascript",
        },
        {
          title: "Complexity & Space Optimisation",
          explanation:
            "Time is the number of states times the work per state. All three problems have n states and O(1) work each, so O(n) time. The dp array costs O(n) space, but each cell only looks back two cells, so two variables are enough: O(1) space. Compare that with naive recursion, which is O(2^n) because the call tree doubles at every level.",
          code: `// Time  = (number of states) x (work per state)
//
// | approach           | time    | space                     |
// |--------------------|---------|---------------------------|
// | naive recursion    | O(2^n)  | O(n)  call stack          |
// | memoisation        | O(n)    | O(n)  memo + call stack   |
// | tabulation         | O(n)    | O(n)  dp array            |
// | two variables      | O(n)    | O(1)                      |

// When dp[i] only needs dp[i-1] and dp[i-2], keep just those two.
function climbStairsO1(n) {
  let prev2 = 1; // dp[i-2]
  let prev1 = 1; // dp[i-1]
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;   // slide the window forward
    prev1 = curr;
  }
  return prev1;
}

function robO1(nums) {
  let prev2 = 0; // best up to house i-2
  let prev1 = 0; // best up to house i-1
  for (let i = 0; i < nums.length; i++) {
    const curr = Math.max(prev1, prev2 + nums[i]);
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

console.log(climbStairsO1(5));      // 8
console.log(robO1([2, 7, 9, 3, 1])); // 12`,
          language: "javascript",
        },
        {
          title: "Common Mistakes & Edge Cases",
          explanation:
            "Most DP bugs are one of these: a memo check that treats a stored 0 as missing, an array that is one cell too short, a base case that is wrong for the smallest inputs (n = 0, n = 1, a single house), or a loop that reads a cell before it has been filled. Always write the state sentence first and test the tiny inputs by hand.",
          code: `// MISTAKE 1: "if (memo[n])" treats a stored 0 as "not computed".
// Ways to make n using only 2s: 0 for every odd n.
let callsBad = 0;
function waysBad(n, memo = {}) {
  callsBad++;
  if (n === 0) return 1;
  if (n < 0) return 0;
  if (memo[n]) return memo[n];          // BUG: 0 is falsy, never reused
  memo[n] = waysBad(n - 2, memo);
  return memo[n];
}

let callsGood = 0;
function waysGood(n, memo = {}) {
  callsGood++;
  if (n === 0) return 1;
  if (n < 0) return 0;
  if (memo[n] !== undefined) return memo[n]; // FIX: check for undefined
  memo[n] = waysGood(n - 2, memo);
  return memo[n];
}

console.log(waysBad(7), waysGood(7)); // 0 0  (same answer...)
// ...but on a graph with many repeated zero-valued states the bad
// version recomputes them every time and goes exponential.

// MISTAKE 2: array size n instead of n + 1 when the answer is dp[n].
// MISTAKE 3: wrong base cases for tiny inputs:
//   rob([5]) must not read nums[1]; climbStairs(1) must not set dp[2].
// MISTAKE 4: filling in the wrong order (reading dp[i+1] before it exists).
// MISTAKE 5: no clear state sentence -> the transition "almost" works.

// Edge cases to always test:
// - n = 0, n = 1, empty array, single element
// - all zeros, all negatives (for max problems)
// - the answer is impossible (return -1 / false, not Infinity)`,
          language: "javascript",
        },
        {
          title: "Practice List",
          explanation:
            "Solve these in order. For each one, write the state sentence and the transition in a comment before writing any loop, then dry run the dp array on the sample input.",
          code: `// EASY
// - Climbing Stairs
// - Fibonacci Number
// - N-th Tribonacci Number
// - Min Cost Climbing Stairs
//
// MEDIUM
// - House Robber
// - House Robber II            (houses in a circle: run twice)
// - Decode Ways
// - Maximum Product Subarray
// - Delete and Earn            (turns into House Robber)
//
// HARD
// - Paint House III
// - Frog Jump`,
          language: "javascript",
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // 2. 2D DYNAMIC PROGRAMMING
  // ---------------------------------------------------------------------------
  {
    id: "dp-2d",
    label: "2D Dynamic Programming",
    icon: Table,
    href: "/dsa?topic=dp-2d",
    content: {
      title: "2D Dynamic Programming",
      description:
        "When the state needs two numbers (a cell in a grid, a position in each of two strings, an item and a capacity), the dp array becomes a table. Grid paths, LCS, edit distance and 0/1 knapsack, traced row by row.",
      steps: [
        {
          title: "What 2D DP Is & When to Use It",
          explanation:
            "Use a 2D table when one index is not enough to describe where you are. Typical signals: a grid you move through (right and down), two strings or arrays you compare (dp[i][j] = answer for the first i characters of one and the first j of the other), or a list of items with a budget (dp[i][w] = best using the first i items with capacity w). The table is filled row by row so every cell can read the cells above it and to its left, which are already final.",
          code: `// Three families of 2D DP and their state sentences:
//
// 1. GRID:       dp[row][col] = answer for reaching cell (row, col)
//                reads: dp[row-1][col] (from above), dp[row][col-1] (from left)
//
// 2. TWO STRINGS: dp[i][j] = answer for a[0..i-1] and b[0..j-1]
//                reads: dp[i-1][j-1] (diagonal), dp[i-1][j], dp[i][j-1]
//
// 3. KNAPSACK:   dp[i][w] = best value using the first i items, capacity w
//                reads: dp[i-1][w] (skip item), dp[i-1][w - weight] (take it)
//
// Picture the table and the arrows each cell needs:
//
//          col-1      col
//   row-1 [  ↘  ]   [  ↓  ]
//   row   [  →  ]   [ YOU ]
//
// Fill order: top row first, left to right, then the next row.
// By the time you reach a cell, everything it reads is already filled.

// Signals in the problem statement:
// - "grid", "matrix", "move right or down"
// - "two strings", "subsequence", "convert word1 to word2"
// - "items with weight and value", "capacity", "pick a subset"`,
          language: "javascript",
        },
        {
          title: "The Template: Unique Grid Paths",
          explanation:
            "A robot starts at the top-left of an m x n grid and can only move right or down. How many paths reach the bottom-right? Every cell is reached either from the cell above or the cell to the left, so its path count is the sum of those two. The first row and first column have exactly one path each. This build-a-table, set-the-edges, fill-row-by-row loop is the template for every 2D DP.",
          code: `function uniquePaths(m, n) {
  // 1. Create an m x n table (Array.from gives each row its own array)
  const dp = Array.from({ length: m }, () => new Array(n).fill(0));

  // 2. Base cases: first row and first column have one path each
  for (let col = 0; col < n; col++) dp[0][col] = 1;
  for (let row = 0; row < m; row++) dp[row][0] = 1;

  // 3. Fill the rest row by row
  for (let row = 1; row < m; row++) {
    for (let col = 1; col < n; col++) {
      dp[row][col] = dp[row - 1][col] + dp[row][col - 1]; // above + left
    }
  }

  // 4. Answer is in the bottom-right cell
  return dp[m - 1][n - 1];
}

console.log(uniquePaths(3, 3)); // 6
console.log(uniquePaths(3, 7)); // 28

// Table for uniquePaths(3, 3), row by row:
//
//          col0 col1 col2
// row 0  [  1    1    1  ]   base row
// row 1  [  1    2    3  ]   2 = 1 + 1,  3 = 1 + 2
// row 2  [  1    3    6  ]   3 = 2 + 1,  6 = 3 + 3
//
// answer = dp[2][2] = 6`,
          language: "javascript",
        },
        {
          title: "Worked Example 1: Longest Common Subsequence",
          explanation:
            "Given two strings, find the length of the longest sequence of characters that appears in both in the same order (not necessarily next to each other). dp[i][j] is the LCS of the first i characters of text1 and the first j characters of text2. If the last characters match, they extend the diagonal answer by 1. If not, drop the last character of one string or the other and keep the better result. The extra row and column of zeros stand for the empty prefix.",
          code: `function longestCommonSubsequence(text1, text2) {
  const m = text1.length;
  const n = text2.length;

  // (m + 1) x (n + 1): row 0 and col 0 mean "empty prefix" -> LCS 0
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        // last characters match: take the diagonal and add 1
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        // no match: drop a character from one string or the other
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}

console.log(longestCommonSubsequence("abcde", "ace")); // 3  ("ace")
console.log(longestCommonSubsequence("abc", "def"));   // 0`,
          language: "javascript",
        },
        {
          title: "Dry Run: LCS of 'abcde' and 'ace'",
          explanation:
            "Read the table one row at a time. Each row adds one more character of text1. A match copies the top-left diagonal plus one; a mismatch copies the larger of the cell above and the cell to the left.",
          code: `// text1 = "abcde" (rows), text2 = "ace" (columns)
//
//              ""   a    c    e
//   row 0 ""  [ 0    0    0    0 ]
//
// row 1 (a):  j=1 'a'='a' MATCH  -> diag 0 + 1 = 1
//             j=2 'a'≠'c'        -> max(up 0, left 1) = 1
//             j=3 'a'≠'e'        -> max(up 0, left 1) = 1
//   row 1 "a" [ 0    1    1    1 ]
//
// row 2 (b):  no matches          -> copy max(up, left) each time
//   row 2 "b" [ 0    1    1    1 ]
//
// row 3 (c):  j=1 'c'≠'a'        -> max(1, 0) = 1
//             j=2 'c'='c' MATCH  -> diag dp[2][1] = 1, + 1 = 2
//             j=3 'c'≠'e'        -> max(up 1, left 2) = 2
//   row 3 "c" [ 0    1    2    2 ]
//
// row 4 (d):  no matches
//   row 4 "d" [ 0    1    2    2 ]
//
// row 5 (e):  j=1 -> 1, j=2 -> 2
//             j=3 'e'='e' MATCH  -> diag dp[4][2] = 2, + 1 = 3
//   row 5 "e" [ 0    1    2    3 ]
//
// answer dp[5][3] = 3

function lcsTrace(text1, text2) {
  const m = text1.length;
  const n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
    console.log("row " + i + " (" + text1[i - 1] + "): " + dp[i].join(" "));
  }
  return dp[m][n];
}

console.log(lcsTrace("abcde", "ace"));
// row 1 (a): 0 1 1 1
// row 2 (b): 0 1 1 1
// row 3 (c): 0 1 2 2
// row 4 (d): 0 1 2 2
// row 5 (e): 0 1 2 3
// 3`,
          language: "javascript",
        },
        {
          title: "Worked Example 2: Edit Distance",
          explanation:
            "Find the minimum number of single-character inserts, deletes or replaces that turn word1 into word2. dp[i][j] is the cost to turn the first i characters of word1 into the first j characters of word2. Converting to or from an empty string costs its length, which fills row 0 and column 0. If the last characters match, no operation is needed (take the diagonal). Otherwise pay 1 for the cheapest of delete (up), insert (left) or replace (diagonal).",
          code: `function minDistance(word1, word2) {
  const m = word1.length;
  const n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i; // delete all i characters
  for (let j = 0; j <= n; j++) dp[0][j] = j; // insert all j characters

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];          // free: characters match
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // delete word1[i-1]
          dp[i][j - 1],     // insert word2[j-1]
          dp[i - 1][j - 1]  // replace word1[i-1] with word2[j-1]
        );
      }
    }
  }
  return dp[m][n];
}

console.log(minDistance("horse", "ros")); // 3

// Table, row by row (word1 = rows, word2 = columns):
//
//              ""  r   o   s
//   ""       [  0   1   2   3 ]
//   h        [  1   1   2   3 ]   h≠r: 1+min(1,1,0)=1
//   o        [  2   2   1   2 ]   o=o: diag dp[1][1] = 1
//   r        [  3   2   2   2 ]   r=r: diag dp[2][0] = 2
//   s        [  4   3   3   2 ]   s=s: diag dp[3][2] = 2
//   e        [  5   4   4   3 ]   e≠s: 1+min(up 2, left 4, diag 3) = 3
//
// answer dp[5][3] = 3
// horse -> rorse (replace h with r)
// rorse -> rose  (delete r)
// rose  -> ros   (delete e)`,
          language: "javascript",
        },
        {
          title: "Worked Example 3: 0/1 Knapsack",
          explanation:
            "Each item has a weight and a value and can be taken at most once. Maximise the total value without going over the capacity. dp[i][w] is the best value using only the first i items with capacity w. For item i you either skip it (dp[i - 1][w]) or, if it fits, take it (its value plus dp[i - 1][w - weight]). Reading from row i - 1 is what stops an item being used twice.",
          code: `function knapsack(weights, values, capacity) {
  const n = weights.length;
  // rows: 0..n items considered, cols: capacity 0..capacity
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const wt = weights[i - 1];
    const val = values[i - 1];
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w];                       // skip item i
      if (wt <= w) {
        dp[i][w] = Math.max(dp[i][w], val + dp[i - 1][w - wt]); // take it
      }
    }
  }
  return dp[n][capacity];
}

console.log(knapsack([1, 3, 4], [15, 20, 30], 4)); // 35

// Items: A(w1, v15), B(w3, v20), C(w4, v30), capacity 4
//
//                     w=0  w=1  w=2  w=3  w=4
// i=0 (no items)    [  0    0    0    0    0 ]
// i=1 (+A w1 v15)   [  0   15   15   15   15 ]  A fits from w=1
// i=2 (+B w3 v20)   [  0   15   15   20   35 ]
//                        w=3: max(skip 15, 20 + dp[1][0]=0)  = 20
//                        w=4: max(skip 15, 20 + dp[1][1]=15) = 35
// i=3 (+C w4 v30)   [  0   15   15   20   35 ]
//                        w=4: max(skip 35, 30 + dp[2][0]=0)  = 35
//
// answer dp[3][4] = 35  (take A + B, weight 4)`,
          language: "javascript",
        },
        {
          title: "Complexity, Mistakes & Edge Cases",
          explanation:
            "A 2D table with R rows and C columns and O(1) work per cell costs O(R x C) time and space. Because each row only reads the row above, you can keep just two rows (or one row, carefully) for O(C) space. The usual bugs are off-by-one indexing between the table (1-based with an empty row) and the strings (0-based), sharing one row array across the table, and forgetting the base row or column.",
          code: `// | problem            | time      | space     | 1-row space |
// |--------------------|-----------|-----------|-------------|
// | unique paths m x n | O(m*n)    | O(m*n)    | O(n)        |
// | LCS / edit dist.   | O(m*n)    | O(m*n)    | O(n)        |
// | 0/1 knapsack       | O(n*W)    | O(n*W)    | O(W)        |
// (W = capacity; knapsack is "pseudo-polynomial": huge W is slow)

// One-row knapsack: loop w from HIGH to LOW so dp[w - wt] still holds
// the previous row's value (each item used at most once).
function knapsack1D(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], values[i] + dp[w - weights[i]]);
    }
  }
  return dp[capacity];
}
console.log(knapsack1D([1, 3, 4], [15, 20, 30], 4)); // 35

// MISTAKE 1: new Array(m).fill(new Array(n).fill(0))
//   -> every row is the SAME array; writing one row writes them all.
//   Use Array.from({ length: m }, () => new Array(n).fill(0)).
// MISTAKE 2: text1[i] instead of text1[i - 1] when the table has an
//   extra empty row (dp index i means "first i characters").
// MISTAKE 3: looping w low -> high in 1-row knapsack turns it into the
//   UNBOUNDED knapsack (an item gets reused).
// MISTAKE 4: forgetting row 0 / col 0 base values in edit distance.

// Edge cases: empty string (answer is the other length for edit distance,
// 0 for LCS), 1 x 1 grid (1 path), capacity 0, an item heavier than capacity.`,
          language: "javascript",
        },
        {
          title: "Practice List",
          explanation:
            "For each problem, draw the empty table on paper with its row and column labels, fill the base row and column, then fill two or three cells by hand before writing code.",
          code: `// EASY
// - Pascal's Triangle
// - Unique Paths
//
// MEDIUM
// - Unique Paths II           (grid with obstacles)
// - Minimum Path Sum
// - Longest Common Subsequence
// - Edit Distance             (often tagged medium/hard)
// - Maximal Square
// - Longest Palindromic Subsequence
// - Target Sum                (0/1 knapsack in disguise)
//
// HARD
// - Distinct Subsequences
// - Interleaving String
// - Regular Expression Matching`,
          language: "javascript",
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // 3. CLASSIC DP PROBLEMS
  // ---------------------------------------------------------------------------
  {
    id: "dp-classics",
    label: "Classic DP Problems",
    icon: Coins,
    href: "/dsa?topic=dp-classics",
    content: {
      title: "Classic DP Problems",
      description:
        "The problems every interview leans on: coin change (fewest coins and number of ways), longest increasing subsequence, word break and partition equal subset sum.",
      steps: [
        {
          title: "What These Problems Share & When to Use Them",
          explanation:
            "Most classic DP problems are one of three flavours over the same 1D array. Minimise: dp[x] is the fewest steps to reach x, so start with Infinity and take a min. Count: dp[x] is the number of ways to reach x, so start with 0, set dp[0] = 1 and add. Feasibility: dp[x] is whether x is reachable at all, so start with false, set dp[0] = true and OR. Signals: a target amount or sum, a set of pieces you may reuse (coins, words) or use once (numbers in a subset), and a question of fewest, how many, or is it possible.",
          code: `// The three flavours, same skeleton:
//
// MIN COINS        dp[x] = fewest pieces to make x
//   init: Infinity, dp[0] = 0
//   step: dp[x] = Math.min(dp[x], dp[x - piece] + 1)
//
// NUMBER OF WAYS   dp[x] = number of ways to make x
//   init: 0, dp[0] = 1           (one way to make 0: pick nothing)
//   step: dp[x] += dp[x - piece]
//
// IS IT POSSIBLE   dp[x] = can we make x at all?
//   init: false, dp[0] = true
//   step: dp[x] = dp[x] || dp[x - piece]

// Tiny demo: which totals up to 6 can be made from pieces 2 and 5?
const pieces = [2, 5];
const target = 6;
const can = new Array(target + 1).fill(false);
can[0] = true;
for (let x = 1; x <= target; x++) {
  for (const piece of pieces) {
    if (piece <= x && can[x - piece]) can[x] = true;
  }
}
console.log(can); // [true, false, true, false, true, true, true]
//                     0      1     2      3     4     5     6`,
          language: "javascript",
        },
        {
          title: "The Template: Coin Change (Fewest Coins)",
          explanation:
            "Given coin values (each usable any number of times) and an amount, return the fewest coins that make the amount, or -1 if impossible. For each amount a, try every coin as the last coin: the answer is 1 plus the best answer for a - coin. Greedy (always take the biggest coin) fails here: with coins 1, 3, 4 and amount 6 greedy picks 4 + 1 + 1 (3 coins) while the best is 3 + 3 (2 coins).",
          code: `function coinChange(coins, amount) {
  // STATE: dp[a] = fewest coins to make amount a
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // zero coins make amount 0

  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] + 1 < dp[a]) {
        dp[a] = dp[a - coin] + 1; // use "coin" as the last coin
      }
    }
  }

  // Infinity means no combination works
  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log(coinChange([1, 3, 4], 6));  // 2   (3 + 3)
console.log(coinChange([1, 2, 5], 11)); // 3   (5 + 5 + 1)
console.log(coinChange([2], 3));        // -1`,
          language: "javascript",
        },
        {
          title: "Dry Run: coinChange([1, 3, 4], 6)",
          explanation:
            "Each row of the trace is one amount. For every coin that fits, look up dp[a - coin], add one, and keep the smallest. The array fills left to right and every lookup lands on a cell that is already final.",
          code: `// dp starts as [0, ∞, ∞, ∞, ∞, ∞, ∞]
//
// | a | coin 1: dp[a-1]+1 | coin 3: dp[a-3]+1 | coin 4: dp[a-4]+1 | dp[a] |
// |---|-------------------|-------------------|-------------------|-------|
// | 1 | dp[0]+1 = 1       | too big           | too big           |   1   |
// | 2 | dp[1]+1 = 2       | too big           | too big           |   2   |
// | 3 | dp[2]+1 = 3       | dp[0]+1 = 1  <-   | too big           |   1   |
// | 4 | dp[3]+1 = 2       | dp[1]+1 = 2       | dp[0]+1 = 1  <-   |   1   |
// | 5 | dp[4]+1 = 2  <-   | dp[2]+1 = 3       | dp[1]+1 = 2       |   2   |
// | 6 | dp[5]+1 = 3       | dp[3]+1 = 2  <-   | dp[2]+1 = 3       |   2   |
//
// final dp = [0, 1, 2, 1, 1, 2, 2]  -> answer 2 (coin 3, then dp[3] = coin 3)

function coinChangeTrace(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] + 1 < dp[a]) dp[a] = dp[a - coin] + 1;
    }
    console.log("a = " + a + " -> dp[a] = " + dp[a]);
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log(coinChangeTrace([1, 3, 4], 6));
// a = 1 -> dp[a] = 1
// a = 2 -> dp[a] = 2
// a = 3 -> dp[a] = 1
// a = 4 -> dp[a] = 1
// a = 5 -> dp[a] = 2
// a = 6 -> dp[a] = 2
// 2`,
          language: "javascript",
        },
        {
          title: "Worked Example 2: Coin Change II (Number of Ways)",
          explanation:
            "Count the combinations of coins that make the amount, where order does not matter (1 + 2 and 2 + 1 are the same). Put the coin loop OUTSIDE and the amount loop inside: each coin is added to the table once, so a combination is only ever built in one order. Swap the loops and you count ordered sequences (permutations) instead, which is a different problem.",
          code: `function change(amount, coins) {
  // STATE: dp[a] = number of combinations that make a
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1; // one way to make 0: take nothing

  for (const coin of coins) {             // coins OUTSIDE
    for (let a = coin; a <= amount; a++) { // amounts inside
      dp[a] += dp[a - coin];
    }
  }
  return dp[amount];
}

console.log(change(5, [1, 2, 5])); // 4
// 5 | 2+2+1 | 2+1+1+1 | 1+1+1+1+1

// Trace for change(5, [1, 2, 5]), one row per coin:
//                    a = 0  1  2  3  4  5
// start            [     1  0  0  0  0  0 ]
// after coin 1     [     1  1  1  1  1  1 ]   only 1s
// after coin 2     [     1  1  2  2  3  3 ]   dp[2]+=dp[0], dp[3]+=dp[1], ...
// after coin 5     [     1  1  2  2  3  4 ]   dp[5] += dp[0]

// Loops swapped -> counts ORDERED sequences (permutations):
function countOrdered(amount, coins) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) dp[a] += dp[a - coin];
    }
  }
  return dp[amount];
}

console.log(change(3, [1, 2]));       // 2  (1+1+1, 1+2)
console.log(countOrdered(3, [1, 2])); // 3  (1+1+1, 1+2, 2+1)`,
          language: "javascript",
        },
        {
          title: "Worked Example 3: Longest Increasing Subsequence (O(n²))",
          explanation:
            "Find the length of the longest strictly increasing subsequence. dp[i] is the length of the longest increasing subsequence that ENDS at index i. To compute it, look at every earlier index j with a smaller value and extend its subsequence by one. The answer is the largest dp value anywhere, not dp[n - 1], because the best subsequence may end before the last element.",
          code: `function lengthOfLIS(nums) {
  // STATE: dp[i] = length of the longest increasing subsequence ending at i
  const dp = new Array(nums.length).fill(1); // each element alone has length 1
  let best = 1;

  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1); // extend the run ending at j
      }
    }
    best = Math.max(best, dp[i]);
  }
  return best;
}

console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4  (2, 3, 7, 18)

// Trace (for each i, which earlier j are smaller, and the best extension):
// | i | nums[i] | smaller earlier values (dp)            | dp[i] |
// |---|---------|----------------------------------------|-------|
// | 0 |   10    | -                                      |   1   |
// | 1 |    9    | none                                   |   1   |
// | 2 |    2    | none                                   |   1   |
// | 3 |    5    | 2(1)                                   |   2   |
// | 4 |    3    | 2(1)                                   |   2   |
// | 5 |    7    | 2(1), 5(2), 3(2)                       |   3   |
// | 6 |   101   | 10(1), 9(1), 2(1), 5(2), 3(2), 7(3)    |   4   |
// | 7 |   18    | 10(1), 9(1), 2(1), 5(2), 3(2), 7(3)    |   4   |
//
// dp = [1, 1, 1, 2, 2, 3, 4, 4]  -> max = 4`,
          language: "javascript",
        },
        {
          title: "Worked Example 4: Word Break & Partition Equal Subset Sum",
          explanation:
            "Both are feasibility DP. Word Break: dp[i] is true when the first i characters can be split into dictionary words; it is true if some earlier split point j is true and s.slice(j, i) is a word. Partition Equal Subset Sum: the array splits into two equal halves exactly when some subset sums to half the total. That is 0/1 knapsack with booleans; loop the sum downward so each number is used at most once.",
          code: `// ---------- Word Break ----------
function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  // STATE: dp[i] = can s[0..i-1] be segmented?
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true; // the empty prefix is always fine

  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      // prefix up to j is valid AND the piece j..i-1 is a word
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[s.length];
}

console.log(wordBreak("leetcode", ["leet", "code"]));                      // true
console.log(wordBreak("catsandog", ["cats", "dog", "sand", "and", "cat"])); // false

// "leetcode": dp[0] = T
//   i = 4: j = 0, dp[0] T and "leet" is a word  -> dp[4] = T
//   i = 8: j = 4, dp[4] T and "code" is a word  -> dp[8] = T  => true

// ---------- Partition Equal Subset Sum ----------
function canPartition(nums) {
  let total = 0;
  for (const x of nums) total += x;
  if (total % 2 === 1) return false;     // odd total can never split evenly
  const target = total / 2;

  // STATE: dp[j] = can some subset of the numbers seen so far sum to j?
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;

  for (const num of nums) {
    for (let j = target; j >= num; j--) { // HIGH -> LOW: use num once
      dp[j] = dp[j] || dp[j - num];
    }
  }
  return dp[target];
}

console.log(canPartition([1, 5, 11, 5])); // true   ([1, 5, 5] and [11])
console.log(canPartition([1, 2, 3, 5])); // false  (total 11 is odd)

// [1, 5, 11, 5], target 11. Reachable sums after each number:
// start      {0}
// after 1    {0, 1}
// after 5    {0, 1, 5, 6}
// after 11   {0, 1, 5, 6, 11}        <- 11 reached
// after 5    {0, 1, 5, 6, 10, 11}`,
          language: "javascript",
        },
        {
          title: "Complexity, Mistakes & Edge Cases",
          explanation:
            "Coin change in both forms is O(amount x coins) time and O(amount) space. LIS here is O(n²) time and O(n) space (a binary search version reaches O(n log n)). Word break is O(n²) split points, each with a slice that costs up to O(n). Partition is O(n x target). The classic bugs are loop order (combinations vs permutations, 0/1 vs unbounded), returning Infinity instead of -1, and answering with dp[n - 1] instead of the maximum.",
          code: `// | problem              | time               | space        |
// |----------------------|--------------------|--------------|
// | coin change (min)    | O(amount * coins)  | O(amount)    |
// | coin change II       | O(amount * coins)  | O(amount)    |
// | LIS (this version)   | O(n^2)             | O(n)         |
// | word break           | O(n^2) splits (+ slice cost) | O(n) |
// | partition subset sum | O(n * target)      | O(target)    |

// Loop-order cheat sheet:
// - coins OUTSIDE, amount inside, low -> high  => combinations, unbounded
// - amount OUTSIDE, coins inside               => permutations (order counts)
// - items OUTSIDE, sum inside, HIGH -> LOW     => each item used once (0/1)

// MISTAKE: returning dp[amount] when it is still Infinity.
function coinChangeBad(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1);
    }
  }
  return dp[amount]; // BUG: should map Infinity to -1
}
console.log(coinChangeBad([2], 3)); // Infinity  (expected -1)

// MISTAKE: LIS answer = dp[n - 1]. For [3, 4, 1] dp = [1, 2, 1]:
// dp[2] = 1 but the answer is 2.
// MISTAKE: "<=" instead of "<" in LIS makes it non-decreasing.
// MISTAKE: partition loop going LOW -> HIGH reuses a number.

// Edge cases: amount 0 (answer 0 coins, 1 way), empty word, single number,
// all numbers equal, a coin larger than the amount.`,
          language: "javascript",
        },
        {
          title: "Practice List",
          explanation:
            "Group these by flavour as you solve them (min, count, feasibility) and note the loop order each one needs.",
          code: `// EASY
// - Climbing Stairs            (count flavour warm-up)
// - Is Subsequence
//
// MEDIUM
// - Coin Change
// - Coin Change II
// - Longest Increasing Subsequence
// - Word Break
// - Partition Equal Subset Sum
// - Perfect Squares
// - Combination Sum IV         (ordered count)
// - Number of Longest Increasing Subsequence
//
// HARD
// - Word Break II
// - Russian Doll Envelopes     (LIS in 2D)`,
          language: "javascript",
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // 4. GREEDY
  // ---------------------------------------------------------------------------
  {
    id: "greedy",
    label: "Greedy",
    icon: Zap,
    href: "/dsa?topic=greedy",
    content: {
      title: "Greedy Algorithms",
      description:
        "Make the locally best choice at every step and never look back. When it works it is simple and fast; the trick is knowing when it works. Interval scheduling, jump game, gas station, assign cookies and minimum platforms.",
      steps: [
        {
          title: "What Greedy Is & When It Works",
          explanation:
            "A greedy algorithm picks the choice that looks best right now and never undoes it. It is correct only when a local best choice can never hurt the final answer. The usual proof is an exchange argument: take any optimal solution; if it does not start with the greedy choice, swap its first choice for the greedy one and show the result is still valid and no worse. Repeat and the optimal solution turns into the greedy one. Signals: you can sort by one key (end time, size, deadline) and then decide each item in one pass; problems about maximum non-overlapping, minimum number of resources, or reaching the end. If you find a small counter-example (coin change with coins 1, 3, 4) switch to DP.",
          code: `// Exchange argument for "pick the most non-overlapping meetings":
//
// Greedy rule: always pick the meeting that ENDS FIRST.
//
// Take any best schedule OPT. Let g be the earliest-ending meeting.
// If OPT's first meeting is not g, swap it for g:
//   - g ends no later than OPT's first meeting,
//   - so g cannot clash with anything after it in OPT,
//   - the count is unchanged -> still optimal.
// Repeat for the rest -> greedy is optimal.
//
// When greedy FAILS (prove it with a counter-example):
function greedyCoins(coins, amount) {
  const sorted = [...coins].sort((a, b) => b - a); // biggest first
  let count = 0;
  for (let i = 0; i < sorted.length; i++) {
    while (amount >= sorted[i]) {
      amount -= sorted[i];
      count++;
    }
  }
  return amount === 0 ? count : -1;
}

console.log(greedyCoins([1, 3, 4], 6)); // 3  (4 + 1 + 1) but 3 + 3 = 2 coins
console.log(greedyCoins([1, 5, 10], 18)); // 5  (10 + 5 + 1 + 1 + 1), optimal here

// Signals for greedy:
// - "maximum number of non-overlapping ..."
// - "minimum number of rooms / platforms / arrows"
// - "can you reach the end"
// - sorting by one key makes every decision obvious`,
          language: "javascript",
        },
        {
          title: "The Template: Sort, Then One Pass",
          explanation:
            "Most greedy solutions are two lines of thinking: sort by the key that makes the safe choice come first, then walk the items once, keeping only the state you need (the last end time, the farthest reach, the current fuel). If the decision at each item needs to look further ahead than that, greedy is probably wrong.",
          code: `// Greedy template
function greedy(items) {
  // 1. Sort by the key that makes the safe choice come first
  items.sort((a, b) => a.key - b.key);

  // 2. Keep only the state you need
  let state = 0;
  let answer = 0;

  // 3. One pass: take or skip each item, never undo
  for (let i = 0; i < items.length; i++) {
    if (items[i].fits(state)) {
      state = items[i].update(state);
      answer++;
    }
  }
  return answer;
}

// Runnable instance: how many tasks fit in 10 minutes? (shortest first)
function maxTasks(durations, limit) {
  const sorted = [...durations].sort((a, b) => a - b);
  let used = 0;
  let count = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (used + sorted[i] <= limit) {
      used += sorted[i];
      count++;
    }
  }
  return count;
}

console.log(maxTasks([5, 2, 8, 3, 1], 10)); // 3
// sorted [1, 2, 3, 5, 8]:
// take 1 (used 1), take 2 (used 3), take 3 (used 6),
// 5 -> 11 > 10 skip, 8 -> 14 > 10 skip  => 3 tasks`,
          language: "javascript",
        },
        {
          title:
            "Worked Example 1: Activity Selection / Non-overlapping Intervals",
          explanation:
            "Given intervals [start, end], choose the most intervals that do not overlap (touching at an endpoint is allowed). Sort by end time and keep an interval whenever it starts at or after the end of the last kept one. The LeetCode version, Non-overlapping Intervals, asks how many to REMOVE; that is simply the total minus the number kept.",
          code: `function selectActivities(intervals) {
  // 1. Sort by END time: finishing early leaves the most room
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]);

  const chosen = [];
  let lastEnd = -Infinity;

  // 2. Keep every interval that starts after the last kept one ends
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i][0];
    const end = sorted[i][1];
    if (start >= lastEnd) {
      chosen.push(sorted[i]);
      lastEnd = end;
    }
  }
  return chosen;
}

function eraseOverlapIntervals(intervals) {
  return intervals.length - selectActivities(intervals).length;
}

const meetings = [[1, 2], [3, 4], [0, 6], [5, 7], [8, 9], [5, 9]];
console.log(selectActivities(meetings));
// [[1, 2], [3, 4], [5, 7], [8, 9]]
console.log(eraseOverlapIntervals(meetings)); // 2
console.log(eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]])); // 1`,
          language: "javascript",
        },
        {
          title: "Dry Run: Activity Selection",
          explanation:
            "After sorting by end time, walk the list once. Each row compares the interval's start with lastEnd and either keeps it (moving lastEnd forward) or skips it.",
          code: `// input:  [[1,2], [3,4], [0,6], [5,7], [8,9], [5,9]]
// sorted by end: [1,2] [3,4] [0,6] [5,7] [8,9] [5,9]
//
// | i | interval | start >= lastEnd ?  | decision | lastEnd | chosen          |
// |---|----------|---------------------|----------|---------|-----------------|
// | 0 | [1, 2]   | 1 >= -Infinity  yes | KEEP     |    2    | 1 interval      |
// | 1 | [3, 4]   | 3 >= 2          yes | KEEP     |    4    | 2 intervals     |
// | 2 | [0, 6]   | 0 >= 4          no  | skip     |    4    | 2 intervals     |
// | 3 | [5, 7]   | 5 >= 4          yes | KEEP     |    7    | 3 intervals     |
// | 4 | [8, 9]   | 8 >= 7          yes | KEEP     |    9    | 4 intervals     |
// | 5 | [5, 9]   | 5 >= 9          no  | skip     |    9    | 4 intervals     |
//
// kept 4, removed 2

function selectTrace(intervals) {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]);
  let lastEnd = -Infinity;
  let kept = 0;
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i][0];
    if (start >= lastEnd) {
      kept++;
      lastEnd = sorted[i][1];
      console.log("keep [" + sorted[i] + "], lastEnd = " + lastEnd);
    } else {
      console.log("skip [" + sorted[i] + "]");
    }
  }
  return kept;
}

console.log(selectTrace([[1, 2], [3, 4], [0, 6], [5, 7], [8, 9], [5, 9]]));
// keep [1,2], lastEnd = 2
// keep [3,4], lastEnd = 4
// skip [0,6]
// keep [5,7], lastEnd = 7
// keep [8,9], lastEnd = 9
// skip [5,9]
// 4`,
          language: "javascript",
        },
        {
          title: "Worked Example 2: Jump Game & Gas Station",
          explanation:
            "Jump Game: nums[i] is the longest jump from index i; can you reach the last index? Track the farthest index reachable so far; if the loop ever reaches an index beyond it, you are stuck. Gas Station: stations on a circle, gas[i] to collect and cost[i] to drive to the next one; find the start that completes the loop. If total gas is less than total cost no start works. Otherwise, whenever the running tank goes negative, no station from the current start up to here can be the answer, so restart from the next station.",
          code: `// ---------- Jump Game ----------
function canJump(nums) {
  let farthest = 0; // farthest index we can reach so far
  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) return false;        // stuck before index i
    farthest = Math.max(farthest, i + nums[i]);
  }
  return true;
}

console.log(canJump([2, 3, 1, 1, 4])); // true
console.log(canJump([3, 2, 1, 0, 4])); // false

// [3, 2, 1, 0, 4]:
// i=0 farthest = max(0, 0+3) = 3
// i=1 farthest = max(3, 1+2) = 3
// i=2 farthest = max(3, 2+1) = 3
// i=3 farthest = max(3, 3+0) = 3
// i=4 4 > 3 -> stuck -> false

// ---------- Gas Station ----------
function canCompleteCircuit(gas, cost) {
  let total = 0; // overall gas - cost
  let tank = 0;  // fuel since the current start
  let start = 0;
  for (let i = 0; i < gas.length; i++) {
    const gain = gas[i] - cost[i];
    total += gain;
    tank += gain;
    if (tank < 0) {     // cannot get past station i from "start"
      start = i + 1;    // so try starting after it
      tank = 0;
    }
  }
  return total >= 0 ? start : -1;
}

console.log(canCompleteCircuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2])); // 3
console.log(canCompleteCircuit([2, 3, 4], [3, 4, 3]));             // -1

// gas [1,2,3,4,5], cost [3,4,5,1,2]
// | i | gain | tank      | start |
// |---|------|-----------|-------|
// | 0 |  -2  | -2 -> 0   |   1   |
// | 1 |  -2  | -2 -> 0   |   2   |
// | 2 |  -2  | -2 -> 0   |   3   |
// | 3 |  +3  |  3        |   3   |
// | 4 |  +3  |  6        |   3   |
// total = 0 >= 0 -> answer 3`,
          language: "javascript",
        },
        {
          title: "Worked Example 3: Assign Cookies & Minimum Platforms",
          explanation:
            "Assign Cookies: each child needs a cookie of at least their greed size; maximise happy children. Sort both and give each child the smallest cookie that satisfies them, so bigger cookies are saved for greedier children. Minimum Platforms: given train arrival and departure times, find how many platforms are needed. Sort arrivals and departures separately and sweep through time like a merge; an arrival adds a platform, a departure frees one, and the peak is the answer.",
          code: `// ---------- Assign Cookies ----------
function findContentChildren(greed, sizes) {
  const g = [...greed].sort((a, b) => a - b);
  const s = [...sizes].sort((a, b) => a - b);
  let i = 0; // child pointer
  let j = 0; // cookie pointer
  while (i < g.length && j < s.length) {
    if (s[j] >= g[i]) i++; // cookie j satisfies child i
    j++;                    // cookie j is used or too small either way
  }
  return i; // number of satisfied children
}

console.log(findContentChildren([1, 2, 3], [1, 1]));    // 1
console.log(findContentChildren([1, 2], [1, 2, 3]));    // 2

// ---------- Minimum Platforms ----------
function minPlatforms(arr, dep) {
  const a = [...arr].sort((x, y) => x - y);
  const d = [...dep].sort((x, y) => x - y);
  let i = 0;
  let j = 0;
  let platforms = 0;
  let best = 0;
  while (i < a.length) {
    if (a[i] <= d[j]) {   // next event is an arrival
      platforms++;
      best = Math.max(best, platforms);
      i++;
    } else {              // next event is a departure
      platforms--;
      j++;
    }
  }
  return best;
}

console.log(minPlatforms(
  [900, 940, 950, 1100, 1500, 1800],
  [910, 1200, 1120, 1130, 1900, 2000]
)); // 3

// arrivals   900 940 950 1100 1500 1800
// departures 910 1120 1130 1200 1900 2000 (sorted)
// 900 arr ->1 | 910 dep ->0 | 940 arr ->1 | 950 arr ->2 | 1100 arr ->3 (peak)
// 1120 dep ->2 | 1130 dep ->1 | 1200 dep ->0 | 1500 arr ->1 | 1800 arr ->2`,
          language: "javascript",
        },
        {
          title: "Complexity, Mistakes & Edge Cases",
          explanation:
            "Greedy solutions are usually dominated by the sort: O(n log n) time, then an O(n) pass. Jump game and gas station need no sort and run in O(n) time with O(1) space. The biggest mistake is using greedy without a reason it is safe; the second is sorting by the wrong key (start time instead of end time for interval scheduling).",
          code: `// | problem                  | time        | space            |
// |--------------------------|-------------|------------------|
// | activity selection       | O(n log n)  | O(n) sorted copy |
// | jump game                | O(n)        | O(1)             |
// | gas station              | O(n)        | O(1)             |
// | assign cookies           | O(n log n + m log m) | O(n + m) |
// | minimum platforms        | O(n log n)  | O(n)             |

// MISTAKE: sorting intervals by START time.
function selectByStart(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  let lastEnd = -Infinity;
  let kept = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i][0] >= lastEnd) {
      kept++;
      lastEnd = sorted[i][1];
    }
  }
  return kept;
}
// One long meeting that starts first blocks three short ones:
console.log(selectByStart([[0, 10], [1, 2], [3, 4], [5, 6]])); // 1  (wrong, best is 3)

// MISTAKE: ">" vs ">=" when touching intervals are allowed ([1,2] and [2,3]).
// MISTAKE: in platforms, a train arriving at the same minute another
//          departs - decide whether that needs 1 or 2 platforms ("<=" means 2).
// MISTAKE: default .sort() on numbers sorts as strings: [10, 9, 1] -> [1, 10, 9].

// Edge cases: empty input, a single interval, all intervals identical,
// nums = [0] in jump game (already at the end -> true).`,
          language: "javascript",
        },
        {
          title: "Practice List",
          explanation:
            "Before coding each one, write down the sort key and one sentence on why the greedy choice is safe. If you cannot, try to find a counter-example.",
          code: `// EASY
// - Assign Cookies
// - Lemonade Change
// - Best Time to Buy and Sell Stock II
//
// MEDIUM
// - Jump Game
// - Jump Game II
// - Gas Station
// - Non-overlapping Intervals
// - Minimum Number of Arrows to Burst Balloons
// - Partition Labels
//
// HARD
// - Candy
// - IPO`,
          language: "javascript",
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // 5. BINARY SEARCH (ADVANCED)
  // ---------------------------------------------------------------------------
  {
    id: "binary-search-advanced",
    label: "Binary Search Advanced",
    icon: Crosshair,
    href: "/dsa?topic=binary-search-advanced",
    content: {
      title: "Binary Search Beyond Sorted Arrays",
      description:
        "Binary search works on anything where a yes/no question flips exactly once. Lower and upper bound, first and last position, rotated arrays, and searching over the answer itself (Koko eating bananas, ship packages, square root).",
      steps: [
        {
          title: "What It Is & When to Use It",
          explanation:
            "Plain binary search finds a value in a sorted array. The general idea is bigger: if you can ask a yes/no question about a position (or a candidate answer) and the answers look like no, no, no, yes, yes, yes, then binary search finds the first yes in O(log n) steps. The array does not have to contain the answer; you can search over the range of possible answers. Signals: a sorted or rotated array, first or last occurrence, minimum speed / capacity / time such that something is possible, or an O(log n) requirement.",
          code: `// The core idea: a predicate that flips from false to true exactly once.
//
//   index:      0      1      2      3      4      5
//   arr:        1      3      5      7      9     11
//   arr >= 6 ?  no     no     no     YES    YES    YES
//                                     ^ first yes = answer
//
// Binary search finds that boundary in O(log n) by halving the range.
//
// The same shape appears when searching over ANSWERS:
//
//   speed k:        1     2     3     4     5     6 ...
//   finish in time? no    no    no    YES   YES   YES
//                                     ^ smallest k that works
//
// Signals:
// - "sorted" or "rotated sorted" array
// - "first / last position", "insert position"
// - "minimum X such that ..." / "maximum X such that ..."
// - constraints like n up to 10^9 (cannot try every value)

function firstAtLeast(arr, target) {
  let lo = 0;
  let hi = arr.length; // answer can be "past the end"
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] >= target) hi = mid; // yes: answer is mid or left of it
    else lo = mid + 1;                // no: answer is right of mid
  }
  return lo;
}

console.log(firstAtLeast([1, 3, 5, 7, 9, 11], 6)); // 3`,
          language: "javascript",
        },
        {
          title: "The Template: Lower Bound & Upper Bound",
          explanation:
            "Lower bound is the first index whose value is at least the target. Upper bound is the first index whose value is strictly greater than the target. Both use the half-open range [lo, hi) with hi starting at arr.length, loop while lo < hi, and end with lo === hi pointing at the answer. The count of a value is upper bound minus lower bound, and lower bound is also the insert position.",
          code: `// Search space is [lo, hi) - hi is NOT a valid answer yet... but can be
// returned when every element fails the test (means "insert at the end").

function lowerBound(arr, target) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] >= target) {
      hi = mid;        // mid might be the answer, keep it
    } else {
      lo = mid + 1;    // mid is too small, discard it
    }
  }
  return lo;           // first index with arr[i] >= target
}

function upperBound(arr, target) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] > target) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;           // first index with arr[i] > target
}

const arr = [1, 2, 2, 2, 3, 5];
console.log(lowerBound(arr, 2)); // 1
console.log(upperBound(arr, 2)); // 4
console.log(upperBound(arr, 2) - lowerBound(arr, 2)); // 3  (count of 2s)
console.log(lowerBound(arr, 4)); // 5  (insert position for 4)
console.log(lowerBound(arr, 9)); // 6  (past the end)`,
          language: "javascript",
        },
        {
          title: "Worked Example 1: First and Last Position",
          explanation:
            "Return the first and last index of target in a sorted array, or [-1, -1]. The first position is the lower bound. The last position is one before the upper bound. Check that the lower bound actually holds the target, otherwise it is missing.",
          code: `function lowerBound(arr, target) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] >= target) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

function upperBound(arr, target) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] > target) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

function searchRange(nums, target) {
  const first = lowerBound(nums, target);
  if (first === nums.length || nums[first] !== target) {
    return [-1, -1];                          // target not present
  }
  const last = upperBound(nums, target) - 1;
  return [first, last];
}

console.log(searchRange([5, 7, 7, 8, 8, 10], 8)); // [3, 4]
console.log(searchRange([5, 7, 7, 8, 8, 10], 6)); // [-1, -1]
console.log(searchRange([], 0));                  // [-1, -1]`,
          language: "javascript",
        },
        {
          title: "Dry Run: searchRange([5, 7, 7, 8, 8, 10], 8)",
          explanation:
            "Watch lo and hi close in. Every iteration either moves hi down to mid (the answer is mid or to its left) or moves lo past mid (the answer is to its right). The loop stops when they meet.",
          code: `// nums:   [5, 7, 7, 8, 8, 10]
// index:   0  1  2  3  4  5
//
// lowerBound(8): first index with nums[i] >= 8
// | lo | hi | mid | nums[mid] | >= 8 ? | action      |
// |----|----|-----|-----------|--------|-------------|
// |  0 |  6 |  3  |     8     |  yes   | hi = 3      |
// |  0 |  3 |  1  |     7     |  no    | lo = 2      |
// |  2 |  3 |  2  |     7     |  no    | lo = 3      |
// |  3 |  3 |  -  |     -     |   -    | stop -> 3   |
//
// upperBound(8): first index with nums[i] > 8
// | lo | hi | mid | nums[mid] | > 8 ?  | action      |
// |----|----|-----|-----------|--------|-------------|
// |  0 |  6 |  3  |     8     |  no    | lo = 4      |
// |  4 |  6 |  5  |    10     |  yes   | hi = 5      |
// |  4 |  5 |  4  |     8     |  no    | lo = 5      |
// |  5 |  5 |  -  |     -     |   -    | stop -> 5   |
//
// first = 3, last = 5 - 1 = 4  ->  [3, 4]

function lowerBoundTrace(arr, target) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    console.log("lo=" + lo + " hi=" + hi + " mid=" + mid + " arr[mid]=" + arr[mid]);
    if (arr[mid] >= target) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

console.log(lowerBoundTrace([5, 7, 7, 8, 8, 10], 8));
// lo=0 hi=6 mid=3 arr[mid]=8
// lo=0 hi=3 mid=1 arr[mid]=7
// lo=2 hi=3 mid=2 arr[mid]=7
// 3`,
          language: "javascript",
        },
        {
          title: "Worked Example 2: Search in Rotated Sorted Array",
          explanation:
            "A sorted array was rotated at an unknown point, like [4, 5, 6, 7, 0, 1, 2]. At any mid, at least one half (lo..mid or mid..hi) is still normally sorted. Find which half is sorted by comparing nums[lo] with nums[mid], check whether the target lies inside that sorted half, and throw away the other half. This version uses the closed range [lo, hi] because we are looking for an exact match.",
          code: `function search(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;

    if (nums[lo] <= nums[mid]) {
      // LEFT half lo..mid is sorted
      if (nums[lo] <= target && target < nums[mid]) {
        hi = mid - 1;   // target is inside the sorted left half
      } else {
        lo = mid + 1;
      }
    } else {
      // RIGHT half mid..hi is sorted
      if (nums[mid] < target && target <= nums[hi]) {
        lo = mid + 1;   // target is inside the sorted right half
      } else {
        hi = mid - 1;
      }
    }
  }
  return -1;
}

console.log(search([4, 5, 6, 7, 0, 1, 2], 0)); // 4
console.log(search([4, 5, 6, 7, 0, 1, 2], 3)); // -1
console.log(search([1], 0));                   // -1

// Trace search([4,5,6,7,0,1,2], 0):
// | lo | hi | mid | nums[mid] | sorted half    | target inside? | action   |
// |----|----|-----|-----------|----------------|----------------|----------|
// |  0 |  6 |  3  |     7     | left [4..7]    | 4<=0? no       | lo = 4   |
// |  4 |  6 |  5  |     1     | left [0..1]    | 0<=0<1 yes     | hi = 4   |
// |  4 |  4 |  4  |     0     | found          |                | return 4 |`,
          language: "javascript",
        },
        {
          title: "Worked Example 3: Binary Search on the Answer",
          explanation:
            "When the question is the smallest speed, capacity or value such that something is possible, binary search over that value. Write a helper that checks one candidate (can Koko finish at speed k? can we ship within d days at capacity c?). The check is monotonic: once a value works, every larger value works too. So find the first value where the check says yes. Integer square root is the same idea from the other side: the largest x with x * x <= n.",
          code: `// ---------- Koko Eating Bananas ----------
// Smallest eating speed k so all piles are eaten within h hours.
function minEatingSpeed(piles, h) {
  const hoursNeeded = (k) => {
    let hours = 0;
    for (const p of piles) hours += Math.ceil(p / k);
    return hours;
  };
  let lo = 1;
  let hi = Math.max(...piles); // eating the biggest pile in 1 hour always works
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (hoursNeeded(mid) <= h) hi = mid; // fast enough, try slower
    else lo = mid + 1;                    // too slow
  }
  return lo;
}

console.log(minEatingSpeed([3, 6, 7, 11], 8)); // 4
// | lo | hi | mid | hours at mid        | fits 8? | action |
// |----|----|-----|---------------------|---------|--------|
// |  1 | 11 |  6  | 1+1+2+2 = 6         |  yes    | hi = 6 |
// |  1 |  6 |  3  | 1+2+3+4 = 10        |  no     | lo = 4 |
// |  4 |  6 |  5  | 1+2+2+3 = 8         |  yes    | hi = 5 |
// |  4 |  5 |  4  | 1+2+2+3 = 8         |  yes    | hi = 4 |
// lo = hi = 4

// ---------- Capacity To Ship Packages Within D Days ----------
function shipWithinDays(weights, days) {
  const daysNeeded = (cap) => {
    let d = 1;
    let load = 0;
    for (const w of weights) {
      if (load + w > cap) { d++; load = 0; } // start a new day
      load += w;
    }
    return d;
  };
  let lo = Math.max(...weights);          // must fit the heaviest package
  let hi = weights.reduce((a, b) => a + b, 0); // everything in one day
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (daysNeeded(mid) <= days) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

console.log(shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)); // 15

// ---------- Integer Square Root ----------
// Largest x with x * x <= n (the LAST "yes").
function mySqrt(n) {
  let lo = 0;
  let hi = n;
  let ans = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (mid * mid <= n) {
      ans = mid;       // mid works, try bigger
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}

console.log(mySqrt(8));  // 2
console.log(mySqrt(16)); // 4`,
          language: "javascript",
        },
        {
          title: "Complexity, Mistakes & Edge Cases",
          explanation:
            "Binary search over n positions takes O(log n) steps and O(1) space. Searching over an answer range [lo, hi] takes O(log(hi - lo)) steps, each paying for one check, so Koko is O(n log max) and shipping is O(n log sum). Nearly every bug is a boundary bug: mixing the half-open and closed templates, an infinite loop when lo never moves, or returning lo without checking it is valid.",
          code: `// | task                     | time                 | space |
// |--------------------------|----------------------|-------|
// | lower / upper bound      | O(log n)             | O(1)  |
// | rotated array search     | O(log n)             | O(1)  |
// | Koko eating bananas      | O(n log maxPile)     | O(1)  |
// | ship packages            | O(n log sumWeights)  | O(1)  |
// | integer square root      | O(log n)             | O(1)  |

// Pick ONE template and keep it consistent:
//
// HALF-OPEN [lo, hi)            CLOSED [lo, hi]
// hi = arr.length               hi = arr.length - 1
// while (lo < hi)               while (lo <= hi)
// hi = mid  /  lo = mid + 1     hi = mid - 1  /  lo = mid + 1
// answer: lo                    answer: tracked in a variable

// MISTAKE: "lo = mid" with mid rounded down -> infinite loop when hi = lo + 1.
// Safe guard while learning: cap the iterations and print them.
function brokenSearch(arr, target) {
  let lo = 0;
  let hi = arr.length - 1;
  let guard = 0;
  while (lo < hi && guard < 5) {
    guard++;
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] <= target) lo = mid; // BUG: should be mid + 1 (or round mid up)
    else hi = mid - 1;
  }
  return guard;
}
console.log(brokenSearch([1, 2], 2)); // 5  (hit the guard: lo stuck at 0)

// MISTAKE: in rotated search, using "<" instead of "<=" in
//          nums[lo] <= nums[mid] breaks when lo === mid.
// MISTAKE: Koko's lo = 0 -> division by zero. Start at 1.
// MISTAKE: mid * mid overflow is not a JS problem below 2^53, but is in
//          other languages - compare mid <= n / mid there.

// Edge cases: empty array, one element, target smaller than all /
// larger than all, all elements equal, array not rotated at all.`,
          language: "javascript",
        },
        {
          title: "Practice List",
          explanation:
            "For each problem, first write the yes/no question and check it flips only once, then decide whether you want the first yes or the last yes.",
          code: `// EASY
// - Binary Search
// - Search Insert Position
// - Sqrt(x)
// - First Bad Version
//
// MEDIUM
// - Find First and Last Position of Element in Sorted Array
// - Search in Rotated Sorted Array
// - Find Minimum in Rotated Sorted Array
// - Koko Eating Bananas
// - Capacity To Ship Packages Within D Days
// - Find Peak Element
//
// HARD
// - Median of Two Sorted Arrays
// - Split Array Largest Sum`,
          language: "javascript",
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // 6. MORE SORTING
  // ---------------------------------------------------------------------------
  {
    id: "more-sorting",
    label: "More Sorting",
    icon: BarChart3,
    href: "/dsa?topic=more-sorting",
    content: {
      title: "More Sorting Algorithms",
      description:
        "Selection sort, insertion sort, counting sort and heap sort, plus a comparison table of time, space and stability, and when to reach for each one.",
      steps: [
        {
          title: "What Sorting Choices Exist & When to Use Them",
          explanation:
            "Sorting algorithms trade speed, memory and stability. Stable means equal keys keep their original order, which matters when you sort by one field after another. Simple quadratic sorts (selection, insertion) are fine for tiny or nearly sorted inputs. Comparison sorts can never beat O(n log n) in general; merge, quick and heap sort reach it. Counting sort beats it by not comparing at all, but only works for small integer ranges. In real JavaScript code use arr.sort((a, b) => a - b); learn the others to understand the trade-offs and to answer interview questions.",
          code: `// Quick decision guide
//
// Input is tiny (< ~20) or nearly sorted          -> insertion sort
// Need O(1) extra memory and guaranteed n log n   -> heap sort
// Need stability and guaranteed n log n           -> merge sort
// Fastest on average, in place, stability not needed -> quick sort
// Integers in a small range (ages, grades, 0..k)  -> counting sort
// Production JavaScript                           -> arr.sort((a, b) => a - b)
//                                                    (stable since ES2019)

// Stability in one picture: sort people by age.
const people = [["Ann", 30], ["Bob", 25], ["Cid", 30], ["Dee", 25]];
const byAge = [...people].sort((a, b) => a[1] - b[1]); // stable built-in sort
console.log(byAge.map((p) => p[0]).join(" ")); // Bob Dee Ann Cid
// Bob stays before Dee and Ann before Cid: original order kept for ties.`,
          language: "javascript",
        },
        {
          title: "The Template: Selection Sort",
          explanation:
            "Selection sort grows a sorted prefix one element at a time. On pass i it scans the unsorted part for the smallest value and swaps it into position i. It always does about n²/2 comparisons, even on sorted input, but at most n - 1 swaps, which is its one advantage when writes are expensive. The long-distance swap is what makes it unstable.",
          code: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    // find the index of the smallest value in arr[i..n-1]
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    // put it at position i (the end of the sorted prefix)
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}

console.log(selectionSort([64, 25, 12, 22, 11])); // [11, 12, 22, 25, 64]

// Trace (| marks the end of the sorted prefix):
// | i | min found      | swap      | array after                 |
// |---|----------------|-----------|-----------------------------|
// | 0 | 11 at index 4  | 0 <-> 4   | [11 | 25, 12, 22, 64]       |
// | 1 | 12 at index 2  | 1 <-> 2   | [11, 12 | 25, 22, 64]       |
// | 2 | 22 at index 3  | 2 <-> 3   | [11, 12, 22 | 25, 64]       |
// | 3 | 25 at index 3  | none      | [11, 12, 22, 25 | 64]       |`,
          language: "javascript",
        },
        {
          title: "Worked Example 1: Insertion Sort",
          explanation:
            "Insertion sort works like sorting playing cards in your hand. Take the next card (the key), slide every bigger card in the sorted part one place to the right, and drop the key into the gap. On an already sorted array the inner loop never runs, so it is O(n); that makes it the go-to for small or nearly sorted inputs, and real-world sorts (TimSort) use it on short runs.",
          code: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];       // the card we are placing
    let j = i - 1;

    // shift bigger elements of the sorted part one step right
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }

    arr[j + 1] = key;         // drop the key into the gap
  }
  return arr;
}

console.log(insertionSort([5, 2, 4, 6, 1, 3])); // [1, 2, 3, 4, 5, 6]
console.log(insertionSort([1, 2, 3, 4]));       // [1, 2, 3, 4]  (no shifts at all)`,
          language: "javascript",
        },
        {
          title: "Dry Run: insertionSort([5, 2, 4, 6, 1, 3])",
          explanation:
            "Each row is one outer iteration. The key is lifted out, bigger values to its left shift right one at a time, and the key lands in the gap. Everything left of position i is always sorted.",
          code: `// | i | key | shifted right      | key lands at | array after          |
// |---|-----|--------------------|--------------|----------------------|
// | 1 |  2  | 5                  | index 0      | [2, 5, 4, 6, 1, 3]   |
// | 2 |  4  | 5                  | index 1      | [2, 4, 5, 6, 1, 3]   |
// | 3 |  6  | none               | index 3      | [2, 4, 5, 6, 1, 3]   |
// | 4 |  1  | 6, 5, 4, 2         | index 0      | [1, 2, 4, 5, 6, 3]   |
// | 5 |  3  | 6, 5, 4            | index 2      | [1, 2, 3, 4, 5, 6]   |
//
// Inner while loop at i = 4 (key = 1) in detail:
//   j=3: arr[3]=6 > 1 -> arr[4]=6   [2, 4, 5, 6, 6, 3]
//   j=2: arr[2]=5 > 1 -> arr[3]=5   [2, 4, 5, 5, 6, 3]
//   j=1: arr[1]=4 > 1 -> arr[2]=4   [2, 4, 4, 5, 6, 3]
//   j=0: arr[0]=2 > 1 -> arr[1]=2   [2, 2, 4, 5, 6, 3]
//   j=-1: stop, arr[0] = 1          [1, 2, 4, 5, 6, 3]

function insertionSortTrace(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
    console.log("i=" + i + " key=" + key + " -> [" + arr.join(", ") + "]");
  }
  return arr;
}

insertionSortTrace([5, 2, 4, 6, 1, 3]);
// i=1 key=2 -> [2, 5, 4, 6, 1, 3]
// i=2 key=4 -> [2, 4, 5, 6, 1, 3]
// i=3 key=6 -> [2, 4, 5, 6, 1, 3]
// i=4 key=1 -> [1, 2, 4, 5, 6, 3]
// i=5 key=3 -> [1, 2, 3, 4, 5, 6]`,
          language: "javascript",
        },
        {
          title: "Worked Example 2: Counting Sort",
          explanation:
            "Counting sort does not compare elements. It counts how many times each value appears, turns the counts into running totals (so count[v] tells you where the last v belongs), then walks the input from right to left placing each value at its slot. Walking right to left keeps it stable. It runs in O(n + k) where k is the range of values, so it is only a good idea when k is small.",
          code: `function countingSort(arr) {
  if (arr.length === 0) return arr;
  const max = Math.max(...arr);          // assumes non-negative integers
  const count = new Array(max + 1).fill(0);

  // 1. count each value
  for (let i = 0; i < arr.length; i++) count[arr[i]]++;

  // 2. running totals: count[v] = how many values are <= v
  for (let v = 1; v <= max; v++) count[v] += count[v - 1];

  // 3. place from the right so equal values keep their order (stable)
  const output = new Array(arr.length);
  for (let i = arr.length - 1; i >= 0; i--) {
    const v = arr[i];
    count[v]--;
    output[count[v]] = v;
  }
  return output;
}

console.log(countingSort([4, 2, 2, 8, 3, 3, 1])); // [1, 2, 2, 3, 3, 4, 8]

// Trace for [4, 2, 2, 8, 3, 3, 1]
// value:          0  1  2  3  4  5  6  7  8
// counts:        [0, 1, 2, 2, 1, 0, 0, 0, 1]
// running total: [0, 1, 3, 5, 6, 6, 6, 6, 7]
//
// place from the right:
// i=6 v=1 -> count[1]=0 -> output[0]=1
// i=5 v=3 -> count[3]=4 -> output[4]=3
// i=4 v=3 -> count[3]=3 -> output[3]=3
// i=3 v=8 -> count[8]=6 -> output[6]=8
// i=2 v=2 -> count[2]=2 -> output[2]=2
// i=1 v=2 -> count[2]=1 -> output[1]=2
// i=0 v=4 -> count[4]=5 -> output[5]=4
// output = [1, 2, 2, 3, 3, 4, 8]`,
          language: "javascript",
        },
        {
          title: "Worked Example 3: Heap Sort (Array-Based)",
          explanation:
            "Heap sort treats the array as a binary tree: the children of index i sit at 2i + 1 and 2i + 2. First build a max-heap by sifting every parent down, from the last parent up to the root, so the largest value ends up at index 0. Then repeatedly swap the root with the last element of the heap, shrink the heap by one, and sift the new root down. The sorted part grows from the right. It is O(n log n) in every case with O(1) extra space, but not stable.",
          code: `// Push arr[i] down until both children are smaller (heap = arr[0..size-1])
function siftDown(arr, i, size) {
  while (true) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < size && arr[left] > arr[largest]) largest = left;
    if (right < size && arr[right] > arr[largest]) largest = right;
    if (largest === i) return;                    // heap property holds
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    i = largest;                                  // keep sifting down
  }
}

function heapSort(arr) {
  const n = arr.length;

  // 1. Build a max-heap: sift down every parent, last parent first
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(arr, i, n);
  }

  // 2. Move the max to the end, shrink the heap, repair the root
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    siftDown(arr, 0, end);
  }
  return arr;
}

console.log(heapSort([12, 11, 13, 5, 6, 7])); // [5, 6, 7, 11, 12, 13]

// Build heap from [12, 11, 13, 5, 6, 7]:
//   i=2 (13): child 7 smaller          -> no change
//   i=1 (11): children 5, 6 smaller    -> no change
//   i=0 (12): children 11, 13 -> swap with 13
//             [13, 11, 12, 5, 6, 7]    (12 now at index 2, child 7 smaller)
//
//            13
//          /    \\
//        11      12
//       /  \\    /
//      5    6  7
//
// Extract phase (| splits heap from the sorted tail):
//   swap 13<->7, sift -> [12, 11, 7, 5, 6 | 13]
//   swap 12<->6, sift -> [11, 6, 7, 5 | 12, 13]
//   swap 11<->5, sift -> [7, 6, 5 | 11, 12, 13]
//   swap 7<->5,  sift -> [6, 5 | 7, 11, 12, 13]
//   swap 6<->5         -> [5 | 6, 7, 11, 12, 13]`,
          language: "javascript",
        },
        {
          title: "Complexity Comparison & Common Mistakes",
          explanation:
            "Use the table to pick a sort by what you care about: worst-case time, memory, or stability. The common mistakes are mostly about JavaScript's built-in sort (string comparison by default) and about assuming every sort keeps equal items in order.",
          code: `// | algorithm  | best        | average     | worst       | space    | stable |
// |------------|-------------|-------------|-------------|----------|--------|
// | bubble     | O(n)        | O(n^2)      | O(n^2)      | O(1)     | yes    |
// | selection  | O(n^2)      | O(n^2)      | O(n^2)      | O(1)     | NO     |
// | insertion  | O(n)        | O(n^2)      | O(n^2)      | O(1)     | yes    |
// | merge      | O(n log n)  | O(n log n)  | O(n log n)  | O(n)     | yes    |
// | quick      | O(n log n)  | O(n log n)  | O(n^2)      | O(log n) | NO     |
// | heap       | O(n log n)  | O(n log n)  | O(n log n)  | O(1)     | NO     |
// | counting   | O(n + k)    | O(n + k)    | O(n + k)    | O(n + k) | yes    |
// (k = range of values; insertion's O(n) best case is on sorted input)

// MISTAKE 1: default sort compares as STRINGS.
console.log([10, 9, 1, 100].sort());                // [1, 10, 100, 9]
console.log([10, 9, 1, 100].sort((a, b) => a - b)); // [1, 9, 10, 100]

// MISTAKE 2: assuming selection sort is stable.
function selectionSortBy(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j][0] < arr[minIdx][0]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}
const pairs = [[2, "a"], [2, "b"], [1, "c"]];
console.log(selectionSortBy(pairs).map((p) => p[0] + p[1]).join(" ")); // 1c 2b 2a
// 2a was before 2b, now it is after: the long swap broke stability.

// MISTAKE 3: counting sort on negative numbers or a huge range
//            (values up to 10^9 -> a 10^9-length count array).
// MISTAKE 4: heap sort with the wrong child index (2i and 2i+1 is 1-based).
// MISTAKE 5: sort() mutates the array; copy first with [...arr].

// Edge cases: empty array, one element, all equal, already sorted,
// reverse sorted (worst case for insertion and naive quick sort).`,
          language: "javascript",
        },
        {
          title: "Practice List",
          explanation:
            "Implement each sort once by hand on paper with a 5-element array, then try these problems, which reuse the ideas (counting, heaps, partial sorting).",
          code: `// EASY
// - Sort Colors              (counting sort or 3-way partition; tagged medium)
// - Squares of a Sorted Array
// - Relative Sort Array      (counting sort)
// - Height Checker           (counting sort)
//
// MEDIUM
// - Sort an Array            (write heap sort or merge sort)
// - Insertion Sort List
// - Kth Largest Element in an Array (heap)
// - Top K Frequent Elements  (bucket sort)
// - Largest Number           (custom comparator)
//
// HARD
// - Maximum Gap              (bucket / radix sort)
// - Count of Smaller Numbers After Self`,
          language: "javascript",
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // 7. DIVIDE AND CONQUER
  // ---------------------------------------------------------------------------
  {
    id: "divide-and-conquer",
    label: "Divide and Conquer",
    icon: Split,
    href: "/dsa?topic=divide-and-conquer",
    content: {
      title: "Divide and Conquer",
      description:
        "Split the problem into independent halves, solve each recursively, then combine. Merge sort, counting inversions, quickselect and maximum subarray.",
      steps: [
        {
          title: "What It Is & When to Use It",
          explanation:
            "Divide and conquer has three moves. Divide: split the input into smaller parts, usually two halves. Conquer: solve each part recursively, with a trivial base case for size 0 or 1. Combine: build the full answer from the part answers. Unlike DP, the parts do not overlap, so there is nothing to cache. The cost usually follows T(n) = 2T(n/2) + combine cost; with an O(n) combine that is O(n log n). Signals: the answer for the whole array can be built from the answers for the two halves plus something that crosses the middle, or you only need to recurse into one half.",
          code: `// Divide -> Conquer -> Combine
//
//              [38, 27, 43, 3]
//               /            \\
//          [38, 27]        [43, 3]          DIVIDE
//           /    \\          /    \\
//         [38]  [27]      [43]  [3]          base cases
//           \\    /          \\    /
//          [27, 38]        [3, 43]           COMBINE (merge)
//               \\            /
//              [3, 27, 38, 43]
//
// Recurrence: T(n) = 2 T(n/2) + O(n)
//   log n levels, O(n) work per level -> O(n log n)
//
// One-sided variants recurse into only ONE half:
//   T(n) = T(n/2) + O(1)  -> O(log n)  (binary search)
//   T(n) = T(n/2) + O(n)  -> O(n)      (quickselect, on average)
//
// Signals:
// - "the answer for the whole = combine(left answer, right answer)"
// - something must be counted ACROSS the middle (inversions, crossing sums)
// - you need the k-th something without fully sorting`,
          language: "javascript",
        },
        {
          title: "The Template: Merge Sort Recap",
          explanation:
            "Merge sort is the cleanest divide and conquer program. Split the array at the middle, sort each half recursively, then merge the two sorted halves with two pointers, always taking the smaller front element. Using <= in the merge keeps equal items in their original order, which is why merge sort is stable.",
          code: `// Generic template:
// function solve(arr, lo, hi) {
//   if (hi - lo <= 1) return baseAnswer;     // base case
//   const mid = Math.floor((lo + hi) / 2);   // divide
//   const left = solve(arr, lo, mid);        // conquer left
//   const right = solve(arr, mid, hi);       // conquer right
//   return combine(left, right);             // combine
// }

function merge(left, right) {
  const result = [];
  let i = 0; // pointer into left
  let j = 0; // pointer into right
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {   // <= keeps it stable
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }
  // one side is empty; copy whatever is left of the other
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr;                // base case
  const mid = Math.floor(arr.length / 2);         // divide
  const left = mergeSort(arr.slice(0, mid));      // conquer
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);                      // combine
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10])); // [3, 9, 10, 27, 38, 43, 82]`,
          language: "javascript",
        },
        {
          title: "Dry Run: The Final Merge",
          explanation:
            "For [38, 27, 43, 3, 9, 82, 10] the last step merges the sorted left half [27, 38, 43] with the sorted right half [3, 9, 10, 82]. Each row compares the two front elements, takes the smaller one, and moves that pointer forward.",
          code: `// left  = [27, 38, 43]       right = [3, 9, 10, 82]
//
// | step | i | j | left[i] | right[j] | take       | result                     |
// |------|---|---|---------|----------|------------|----------------------------|
// |  1   | 0 | 0 |   27    |    3     | right 3    | [3]                        |
// |  2   | 0 | 1 |   27    |    9     | right 9    | [3, 9]                     |
// |  3   | 0 | 2 |   27    |   10     | right 10   | [3, 9, 10]                 |
// |  4   | 0 | 3 |   27    |   82     | left 27    | [3, 9, 10, 27]             |
// |  5   | 1 | 3 |   38    |   82     | left 38    | [3, 9, 10, 27, 38]         |
// |  6   | 2 | 3 |   43    |   82     | left 43    | [3, 9, 10, 27, 38, 43]     |
// | copy | 3 | 3 |    -    |   82     | rest: 82   | [3, 9, 10, 27, 38, 43, 82] |

function mergeTrace(left, right) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
    console.log("i=" + i + " j=" + j + " result=[" + result.join(", ") + "]");
  }
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}

console.log(mergeTrace([27, 38, 43], [3, 9, 10, 82]));
// i=0 j=1 result=[3]
// i=0 j=2 result=[3, 9]
// i=0 j=3 result=[3, 9, 10]
// i=1 j=3 result=[3, 9, 10, 27]
// i=2 j=3 result=[3, 9, 10, 27, 38]
// i=3 j=3 result=[3, 9, 10, 27, 38, 43]
// [3, 9, 10, 27, 38, 43, 82]`,
          language: "javascript",
        },
        {
          title: "Worked Example 1: Count Inversions",
          explanation:
            "An inversion is a pair i < j with arr[i] > arr[j]; the count measures how unsorted an array is. Checking every pair is O(n²). Piggy-back on merge sort instead: inversions are those inside the left half, those inside the right half, and those that cross the middle. During the merge, when a right element is taken before left[i], it is smaller than left[i] and every element after it in the left half, so it adds left.length - i inversions at once.",
          code: `function sortAndCount(arr) {
  if (arr.length <= 1) return { sorted: arr, count: 0 };
  const mid = Math.floor(arr.length / 2);
  const leftPart = sortAndCount(arr.slice(0, mid));
  const rightPart = sortAndCount(arr.slice(mid));
  const left = leftPart.sorted;
  const right = rightPart.sorted;

  let count = leftPart.count + rightPart.count; // inversions inside each half
  const sorted = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      sorted.push(left[i++]);
    } else {
      // right[j] is smaller than left[i], left[i+1], ... (all remaining)
      count += left.length - i;                  // crossing inversions
      sorted.push(right[j++]);
    }
  }
  while (i < left.length) sorted.push(left[i++]);
  while (j < right.length) sorted.push(right[j++]);
  return { sorted, count };
}

function countInversions(arr) {
  return sortAndCount(arr).count;
}

console.log(countInversions([2, 4, 1, 3, 5])); // 3  -> (2,1), (4,1), (4,3)
console.log(countInversions([5, 4, 3, 2, 1])); // 10 (every pair)
console.log(countInversions([1, 2, 3]));       // 0

// Trace for [2, 4, 1, 3, 5]: split into [2, 4] and [1, 3, 5]
//   [2, 4]    -> 0 inversions inside
//   [1, 3, 5] -> 0 inversions inside
// Merge [2, 4] with [1, 3, 5]:
// | i | j | left[i] | right[j] | take | count added       | count |
// |---|---|---------|----------|------|-------------------|-------|
// | 0 | 0 |    2    |    1     |  1   | 2 - 0 = 2 (2, 4)  |   2   |
// | 0 | 1 |    2    |    3     |  2   | 0                 |   2   |
// | 1 | 1 |    4    |    3     |  3   | 2 - 1 = 1 (4)     |   3   |
// | 1 | 2 |    4    |    5     |  4   | 0                 |   3   |
// copy 5                                                   -> 3`,
          language: "javascript",
        },
        {
          title: "Worked Example 2: Quickselect (Kth Smallest)",
          explanation:
            "To find the kth smallest element you do not need to sort everything. Partition the array around a pivot (Lomuto: everything smaller goes left, the pivot lands at its final sorted index p). If p is the index you want, you are done; otherwise recurse only into the side that contains it. On average each step halves the work, giving O(n); a bad pivot every time gives O(n²), which a random pivot makes very unlikely.",
          code: `// Lomuto partition: pivot = arr[hi]; returns the pivot's final index
function partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo;                         // next slot for a "smaller" element
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]]; // pivot into its sorted spot
  return i;
}

function kthSmallest(nums, k) {
  const arr = [...nums];
  const target = k - 1;               // k is 1-based
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const p = partition(arr, lo, hi);
    if (p === target) return arr[p];
    if (p < target) lo = p + 1;       // answer is on the right
    else hi = p - 1;                  // answer is on the left
  }
  return -1;
}

console.log(kthSmallest([7, 10, 4, 3, 20, 15], 3)); // 7
console.log(kthSmallest([7, 10, 4, 3, 20, 15], 1)); // 3

// Trace for k = 3 (target index 2):
// | lo | hi | pivot | array after partition       | p | action       |
// |----|----|-------|-----------------------------|---|--------------|
// |  0 |  5 |  15   | [7, 10, 4, 3, 15, 20]       | 4 | 4 > 2, hi=3  |
// |  0 |  3 |   3   | [3, 10, 4, 7, 15, 20]       | 0 | 0 < 2, lo=1  |
// |  1 |  3 |   7   | [3, 4, 7, 10, 15, 20]       | 2 | found -> 7   |`,
          language: "javascript",
        },
        {
          title:
            "Worked Example 3: Maximum Subarray (Kadane vs Divide and Conquer)",
          explanation:
            "Find the contiguous subarray with the largest sum. Divide and conquer: the best subarray lies entirely in the left half, entirely in the right half, or crosses the middle; the crossing case is the best suffix of the left plus the best prefix of the right. That is O(n log n). Kadane's algorithm does it in O(n) with one pass: at each element, either extend the current run or start fresh from this element, whichever is larger. Knowing both shows how a smarter state can beat divide and conquer.",
          code: `// ---------- Divide and conquer: O(n log n) ----------
function maxCrossing(nums, lo, mid, hi) {
  let sum = 0;
  let leftBest = -Infinity;
  for (let i = mid; i >= lo; i--) {      // best suffix ending at mid
    sum += nums[i];
    leftBest = Math.max(leftBest, sum);
  }
  sum = 0;
  let rightBest = -Infinity;
  for (let j = mid + 1; j <= hi; j++) {  // best prefix starting at mid+1
    sum += nums[j];
    rightBest = Math.max(rightBest, sum);
  }
  return leftBest + rightBest;
}

function maxSubDC(nums, lo, hi) {
  if (lo === hi) return nums[lo];        // one element
  const mid = Math.floor((lo + hi) / 2);
  return Math.max(
    maxSubDC(nums, lo, mid),             // entirely left
    maxSubDC(nums, mid + 1, hi),         // entirely right
    maxCrossing(nums, lo, mid, hi)       // crosses the middle
  );
}

// ---------- Kadane: O(n) ----------
function maxSubKadane(nums) {
  let current = nums[0]; // best sum of a run ending here
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]); // start fresh or extend
    best = Math.max(best, current);
  }
  return best;
}

const nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
console.log(maxSubDC(nums, 0, nums.length - 1)); // 6  ([4, -1, 2, 1])
console.log(maxSubKadane(nums));                 // 6

// Kadane trace:
// | i | nums[i] | current = max(nums[i], current + nums[i]) | best |
// |---|---------|-------------------------------------------|------|
// | 0 |   -2    | -2                                        |  -2  |
// | 1 |    1    | max(1, -1)  = 1                           |   1  |
// | 2 |   -3    | max(-3, -2) = -2                          |   1  |
// | 3 |    4    | max(4, 2)   = 4                           |   4  |
// | 4 |   -1    | max(-1, 3)  = 3                           |   4  |
// | 5 |    2    | max(2, 5)   = 5                           |   5  |
// | 6 |    1    | max(1, 6)   = 6                           |   6  |
// | 7 |   -5    | max(-5, 1)  = 1                           |   6  |
// | 8 |    4    | max(4, 5)   = 5                           |   6  |`,
          language: "javascript",
        },
        {
          title: "Complexity, Mistakes & Edge Cases",
          explanation:
            "Read the cost off the recurrence: two halves plus a linear combine is O(n log n), one half plus a linear partition is O(n) on average. Space comes from the recursion depth (O(log n) when splits are balanced) plus any temporary arrays (O(n) for merge sort). Most bugs are in the base case and the split point, which can cause infinite recursion when a range of size 2 splits into sizes 2 and 0.",
          code: `// | algorithm            | recurrence             | time            | space      |
// |----------------------|------------------------|-----------------|------------|
// | merge sort           | 2T(n/2) + O(n)         | O(n log n)      | O(n)       |
// | count inversions     | 2T(n/2) + O(n)         | O(n log n)      | O(n)       |
// | quickselect          | T(n/2) + O(n) average  | O(n) avg, O(n^2) worst | O(1) iterative |
// | max subarray (D&C)   | 2T(n/2) + O(n)         | O(n log n)      | O(log n)   |
// | max subarray (Kadane)| -                      | O(n)            | O(1)       |
// | binary search        | T(n/2) + O(1)          | O(log n)        | O(1)       |

// MISTAKE: a split that does not shrink the problem.
// With mid = Math.floor((lo + hi) / 2), the halves must be
// [lo, mid] and [mid + 1, hi]  (closed), or [lo, mid) and [mid, hi) (half-open).
// Mixing them, e.g. [lo, mid] and [mid, hi], loops forever on 2 elements.

// MISTAKE: count inversions with "<" instead of "<=" in the merge
// counts equal pairs as inversions.
function crossCountStrict(left, right) {
  let count = 0;
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) i++;        // BUG: equal values go right first
    else { count += left.length - i; j++; }
  }
  return count;
}
console.log(crossCountStrict([2], [2])); // 1  (expected 0: 2 > 2 is false)

// MISTAKE: Kadane starting best at 0 -> wrong for all-negative input.
// [-3, -1, -2] has answer -1, not 0.
// MISTAKE: quickselect with k 1-based vs index 0-based mixed up.

// Edge cases: empty array, one element, all negative, all equal,
// already sorted input (worst case for a last-element pivot).`,
          language: "javascript",
        },
        {
          title: "Practice List",
          explanation:
            "For each problem, write the three parts as comments first: how you divide, what the base case returns, and how two half-answers combine.",
          code: `// EASY
// - Maximum Subarray (also try the D&C version)
// - Convert Sorted Array to Binary Search Tree
// - Majority Element (D&C or Boyer-Moore)
//
// MEDIUM
// - Sort an Array (merge sort)
// - Kth Largest Element in an Array (quickselect)
// - Sort List (merge sort on a linked list)
// - Different Ways to Add Parentheses
// - Pow(x, n)
//
// HARD
// - Count of Smaller Numbers After Self
// - Reverse Pairs
// - Merge k Sorted Lists`,
          language: "javascript",
        },
      ],
    },
  },
];
