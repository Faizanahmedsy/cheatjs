import type { Lesson, StateRow } from "./types";
import { Recorder, lesson, row, tree } from "./recorder";

const BT = "Backtracking";
const DP = "Dynamic Programming";

/* ------------------------------------------------------------ Backtracking */
function subsets(): Lesson {
  const nums = [1, 2, 3];
  const labels: string[] = [];
  const build = (i: number, depth: number, set: number[]) => {
    labels[i] = `{${set.join(",")}}`;
    if (depth === nums.length) return;
    build(2 * i + 1, depth + 1, [...set, nums[depth]]);
    build(2 * i + 2, depth + 1, set);
  };
  build(0, 0, []);
  const r = new Recorder([]);
  const ids = tree(r, labels);
  ids.forEach((id) => r.node(id!, { state: "hidden" }));
  r.edges.forEach((e) => (e.state = "hidden"));
  const found: string[] = [];
  r.snap("Every subset", "For each number, make one choice: take it or skip it. Three numbers, two choices each: 2³ = 8 subsets. Backtracking walks this choice tree.", [1, 2], []);
  const walk = (i: number, depth: number) => {
    r.node(ids[i]!, { state: "current" });
    r.edges.forEach((e) => e.b === ids[i] && (e.state = "chosen"));
    if (depth === nums.length) {
      found.push(labels[i]);
      r.node(ids[i]!, { state: "done" });
      r.snap(`Found ${labels[i]}`, "All choices made: record this subset, then step back up (backtrack) to try the other choice.", [3], [{ label: "Subsets", value: [...found] }]);
      return;
    }
    if (depth < 2) r.snap(`At ${labels[i]}`, `Choice for ${nums[depth]}: left takes it, right skips it.`, [4, 5, 6, 7], [{ label: "Subsets", value: found.length ? [...found] : ["none yet"] }]);
    walk(2 * i + 1, depth + 1);
    walk(2 * i + 2, depth + 1);
    r.node(ids[i]!, { state: "frontier" });
  };
  walk(0, 0);
  r.snap("8 subsets", "O(2ⁿ) answers, so O(n · 2ⁿ) time. The same take/skip tree solves Combination Sum, Word Search and more.", [9], [{ label: "Subsets", value: found }]);
  return lesson(
    { slug: "subsets-backtracking", title: "Subsets (Backtracking)", question: "78. Subsets", group: BT, blurb: "Take it or skip it.", problem: "Return all possible subsets of a list of distinct numbers." },
    `function subsets(nums) {
  const result = [], chosen = [];
  function decide(index) {
    if (index === nums.length) return void result.push([...chosen]);
    chosen.push(nums[index]); // take it
    decide(index + 1);
    chosen.pop(); // undo: skip it
    decide(index + 1);
  }
  decide(0); return result;
}`,
    r,
  );
}

function permutations(): Lesson {
  const nums = [1, 2, 3];
  const r = new Recorder([]);
  row(r, nums, "n", 0, 2);
  [0, 1, 2].forEach((i) => r.add(`p${i}`, i * 2, 2.6, "_", { state: "dim" }));
  const path: number[] = [];
  const used = new Set<number>();
  const out: string[] = [];
  const draw = () => {
    nums.forEach((v, i) => r.node(`n${i}`, { state: used.has(v) ? "dim" : "idle", tag: used.has(v) ? "used" : undefined }));
    [0, 1, 2].forEach((i) => r.node(`p${i}`, { label: path[i] !== undefined ? String(path[i]) : "_", state: path[i] !== undefined ? "current" : "dim" }));
  };
  const st = (): StateRow[] => [{ label: "Path", value: path.length ? path.map(String) : ["empty"] }, { label: "Found", value: out.length ? out : ["none"] }];
  draw();
  r.snap("Every order", "Fill the slots one at a time with any number not used yet. When all slots are full, record it, then undo the last pick and try the next.", [1, 2], st());
  const go = () => {
    if (path.length === nums.length) {
      out.push(path.join(""));
      r.snap(`Found ${path.join("")}`, "All slots full. Record it and backtrack.", [3], st());
      return;
    }
    for (const v of nums) {
      if (used.has(v)) continue;
      used.add(v);
      path.push(v);
      draw();
      if (path.length < 3) r.snap(`Pick ${v}`, `${v} goes in slot ${path.length - 1}.`, [5, 6], st());
      go();
      path.pop();
      used.delete(v);
      draw();
    }
  };
  go();
  r.snap("3! = 6", "n choices, then n−1, then n−2…: n! orders. The undo step (pop and unmark) is what makes it backtracking.", [10], st());
  return lesson(
    { slug: "permutations", title: "Permutations", question: "46. Permutations", group: BT, blurb: "Fill slots, undo, try next.", problem: "Return all orderings of a list of distinct numbers." },
    `function permute(nums) {
  const result = [], path = [], used = new Set();
  function fill() {
    if (path.length === nums.length) return void result.push([...path]);
    for (const num of nums) {
      if (used.has(num)) continue;
      used.add(num); path.push(num);
      fill();
      path.pop(); used.delete(num); // undo
    }
  }
  fill(); return result;
}`,
    r,
  );
}

function nQueens(): Lesson {
  const n = 4;
  const r = new Recorder([]);
  for (let ro = 0; ro < n; ro++) for (let c = 0; c < n; c++) r.add(`q${ro}_${c}`, c * 1.7, ro * 1.7, "", { state: (ro + c) % 2 ? "idle" : "dim" });
  const cols: number[] = [];
  const base = (ro: number, c: number) => ((ro + c) % 2 ? "idle" : "dim");
  const safe = (ro: number, c: number) => cols.every((cc, rr) => cc !== c && Math.abs(cc - c) !== ro - rr);
  const draw = (bad?: [number, number]) => {
    for (let ro = 0; ro < n; ro++) for (let c = 0; c < n; c++) r.node(`q${ro}_${c}`, { label: cols[ro] === c ? "Q" : "", state: cols[ro] === c ? "current" : bad && bad[0] === ro && bad[1] === c ? "frontier" : base(ro, c), tag: bad && bad[0] === ro && bad[1] === c ? "attacked" : undefined });
  };
  const st = (): StateRow[] => [{ label: "Queen column per row", value: cols.length ? cols.map(String) : ["none"] }];
  r.snap("4 queens, no attacks", "Place 4 queens so none share a row, column or diagonal. Go row by row. If a row has no safe spot, go back and move the queen above.", [1, 2], st());
  let solved = false;
  const place = (ro: number) => {
    if (ro === n) return void (solved = true);
    for (let c = 0; c < n && !solved; c++) {
      if (!safe(ro, c)) continue;
      cols.push(c);
      draw();
      r.snap(`Row ${ro}: column ${c}`, `Column ${c} in row ${ro} isn't attacked. Place a queen and move to the next row.`, [4, 5, 6], st());
      place(ro + 1);
      if (solved) return;
      cols.pop();
      draw();
      r.snap(`Undo row ${ro}`, `Row ${ro + 1} had no safe square with this choice. Remove the queen from row ${ro} and try further right.`, [7], st());
    }
  };
  place(0);
  r.snap("Solved", "Backtracking cut off every dead end early instead of trying all 4⁴ boards. Checking columns and diagonals with sets makes each check O(1).", [10], st());
  return lesson(
    { slug: "n-queens", title: "N-Queens", question: "51. N-Queens", group: BT, blurb: "Row by row, undo dead ends.", problem: "Place n queens on an n×n board so no two attack each other." },
    `function solveNQueens(n) {
  const queenCol = []; // queenCol[row] = column
  function place(row) {
    if (row === n) return true;
    for (let col = 0; col < n; col++) {
      if (!isSafe(queenCol, row, col)) continue;
      queenCol.push(col);
      if (place(row + 1)) return true;
      queenCol.pop(); // dead end: undo
    }
    return false;
  }
  return place(0) && queenCol;
}`,
    r,
  );
}

/* ---------------------------------------------------------------- 1D DP */
function memoFib(): Lesson {
  const r = new Recorder([]);
  const labels: (string | null)[] = Array(15).fill(null);
  const build = (i: number, n: number) => {
    labels[i] = String(n);
    if (n >= 2) ((build(2 * i + 1, n - 1)), build(2 * i + 2, n - 2));
  };
  build(0, 4);
  const ids = tree(r, labels);
  const memo: Record<number, number> = {};
  let calls = 0;
  const st = (): StateRow[] => [{ label: "Memo", value: Object.keys(memo).length ? Object.entries(memo).map(([k, v]) => `fib(${k})=${v}`) : ["empty"] }, { label: "Calls made", value: [String(calls)] }];
  r.snap("Recursion that branches", "fib(n) = fib(n−1) + fib(n−2). Without memory, fib(4) makes 9 calls, and fib(40) makes over 300 million, repeating the same work again and again.", [1, 2], st());
  const fib = (i: number): number => {
    const n = Number(labels[i]);
    calls++;
    if (memo[n] !== undefined) {
      r.node(ids[i]!, { state: "frontier", tag: "memo" });
      r.snap(`fib(${n}) from memo`, `fib(${n}) was already worked out: ${memo[n]}. Look it up, skip its whole subtree.`, [3], st());
      const dim = (k: number): void => {
        if (k >= labels.length || labels[k] === null) return;
        r.node(ids[k]!, { state: "dim" });
        dim(2 * k + 1);
        dim(2 * k + 2);
      };
      dim(2 * i + 1);
      dim(2 * i + 2);
      return memo[n];
    }
    if (n < 2) {
      r.node(ids[i]!, { state: "done", tag: String(n) });
      return n;
    }
    r.node(ids[i]!, { state: "current" });
    const v = fib(2 * i + 1) + fib(2 * i + 2);
    memo[n] = v;
    r.node(ids[i]!, { state: "done", tag: String(v) });
    r.snap(`fib(${n}) = ${v}`, `Both answers are back. Write fib(${n}) = ${v} in the memo so nobody computes it twice.`, [4, 5], st());
    return v;
  };
  fib(0);
  r.snap("O(n) instead of O(2ⁿ)", "Each fib(k) is computed once. That's memoization: top-down DP. The grey calls never ran.", [6], st());
  return lesson(
    { slug: "memoization", title: "Memoization", question: "509. Fibonacci Number", group: DP, blurb: "Write the answers down.", problem: "Compute Fibonacci numbers without repeating work." },
    `function fib(n, memo = {}) {
  if (n < 2) return n;
  if (memo[n] !== undefined) return memo[n]; // seen it before
  const answer = fib(n - 1, memo) + fib(n - 2, memo);
  memo[n] = answer; // write it down
  return answer;
}`,
    r,
  );
}

/** A 1D table lesson: dp[i] computed left to right. */
function table1d(values: (string | number)[], prefix = "d") {
  const r = new Recorder([]);
  values.forEach((v, i) => r.add(`${prefix}${i}`, i * 1.7, 0, String(v), { tag: String(i) }));
  return r;
}

function climbing(): Lesson {
  const n = 6;
  const r = table1d(Array(n + 1).fill("?"));
  const dp = [1, 1];
  r.node("d0", { label: "1", state: "done" });
  r.node("d1", { label: "1", state: "done" });
  r.snap("Climbing stairs", "You climb 1 or 2 steps at a time. How many ways to reach step 6? To land on step i, your last move came from i−1 or i−2. So ways(i) = ways(i−1) + ways(i−2).", [1, 2], [{ label: "dp", value: ["1", "1"] }]);
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    r.node(`d${i}`, { label: String(dp[i]), state: "current" });
    r.node(`d${i - 1}`, { state: "frontier" });
    r.node(`d${i - 2}`, { state: "frontier" });
    r.snap(`Step ${i}: ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`, `${dp[i - 1]} ways end with a 1-step from step ${i - 1}, ${dp[i - 2]} end with a 2-step from step ${i - 2}.`, [4], [{ label: "dp", value: dp.map(String) }]);
    for (let k = 0; k <= i; k++) r.node(`d${k}`, { state: "done" });
  }
  r.snap(`Answer: ${dp[n]}`, "Bottom-up DP: fill the table from small to big. O(n) time, and only the last two values are really needed: O(1) space.", [6], [{ label: "dp", value: dp.map(String) }]);
  return lesson(
    { slug: "climbing-stairs", title: "Climbing Stairs", question: "70. Climbing Stairs", group: DP, blurb: "ways(i) = ways(i−1) + ways(i−2).", problem: "Count the ways to climb n stairs taking 1 or 2 steps at a time." },
    `function climbStairs(n) {
  const ways = [1, 1];
  for (let step = 2; step <= n; step++)
    ways[step] = ways[step - 1] + ways[step - 2];
  return ways[n];
}
`,
    r,
  );
}

function houseRobber(): Lesson {
  const houses = [2, 7, 9, 3, 1];
  const r = new Recorder([]);
  row(r, houses, "h", 0);
  houses.forEach((_, i) => r.add(`d${i}`, i * 1.7, 2.4, "?", { state: "dim" }));
  const dp: number[] = [];
  const st = (): StateRow[] => [{ label: "Best up to each house", value: dp.map(String) }];
  r.snap("Don't rob neighbours", "Each house has money. Robbing two side-by-side houses sets off the alarm. At each house the choice is: skip it (keep the best so far), or rob it plus the best from two houses back.", [1, 2], st());
  houses.forEach((v, i) => {
    const skip = i ? dp[i - 1] : 0;
    const rob = v + (i > 1 ? dp[i - 2] : 0);
    dp[i] = Math.max(skip, rob);
    r.node(`h${i}`, { state: "current" });
    r.node(`d${i}`, { label: String(dp[i]), state: "done", tag: rob >= skip ? "rob" : "skip" });
    r.snap(`House ${i}: ${dp[i]}`, `Skip = ${skip}. Rob = ${v} + ${i > 1 ? dp[i - 2] : 0} = ${rob}. Take the bigger: ${dp[i]}.`, [4, 5], st());
    r.node(`h${i}`, { state: "idle" });
  });
  r.snap(`Answer: ${dp[dp.length - 1]}`, "Rob houses 2, 9 and 1. O(n) time, O(1) space with two variables.", [7], st());
  return lesson(
    { slug: "house-robber", title: "House Robber", question: "198. House Robber", group: DP, blurb: "Skip it, or rob + two back.", problem: "Maximise the money robbed without robbing two adjacent houses." },
    `function rob(houses) {
  let twoBack = 0, oneBack = 0;
  for (const money of houses) {
    const best = Math.max(oneBack, // skip this house
      twoBack + money); // rob it
    [twoBack, oneBack] = [oneBack, best];
  }
  return oneBack;
}`,
    r,
  );
}

function coinChange(): Lesson {
  const coins = [1, 3, 4];
  const amount = 6;
  const r = table1d(Array(amount + 1).fill("∞"));
  const dp = [0, ...Array(amount).fill(Infinity)];
  r.node("d0", { label: "0", state: "done" });
  const st = (): StateRow[] => [{ label: "Fewest coins for each amount", value: dp.map((v) => (v === Infinity ? "∞" : String(v))) }];
  r.snap("Fewest coins", `Coins ${coins.join(", ")}. Make ${amount} with as few as possible. Greedy (biggest first: 4+1+1) gives 3, but 3+3 gives 2. DP tries every last coin.`, [1, 2], st());
  for (let a = 1; a <= amount; a++) {
    let from = -1;
    for (const c of coins) if (c <= a && dp[a - c] + 1 < dp[a]) ((dp[a] = dp[a - c] + 1), (from = c));
    r.node(`d${a}`, { label: String(dp[a]), state: "current" });
    if (from > 0) r.node(`d${a - from}`, { state: "frontier" });
    r.snap(`Amount ${a}: ${dp[a]} coin(s)`, `Try each coin as the last one: amount ${a} − coin, plus 1. Best is a ${from} on top of amount ${a - from} (${dp[a - from]} coins).`, [4, 5], st());
    for (let k = 0; k <= a; k++) r.node(`d${k}`, { state: "done" });
  }
  r.snap(`Answer: ${dp[amount]}`, "O(amount × coins). The table reuses every smaller answer.", [7], st());
  return lesson(
    { slug: "coin-change", title: "Coin Change", question: "322. Coin Change", group: DP, blurb: "Try every coin as the last one.", problem: "Find the fewest coins that make up an amount." },
    `function coinChange(coins, amount) {
  const fewest = [0, ...Array(amount).fill(Infinity)];
  for (let total = 1; total <= amount; total++) {
    for (const coin of coins)
      if (coin <= total) fewest[total] = Math.min(fewest[total], fewest[total - coin] + 1);
  }
  return fewest[amount] === Infinity ? -1 : fewest[amount];
}`,
    r,
  );
}

function lis(): Lesson {
  const nums = [10, 9, 2, 5, 3, 7, 101, 18];
  const r = new Recorder([]);
  row(r, nums, "i", 0, 1.7);
  const dp = nums.map(() => 1);
  const st = (): StateRow[] => [{ label: "Longest rising run ending here", value: dp.map(String) }];
  r.snap("Longest rising subsequence", "Pick numbers left to right (gaps allowed) so each is bigger than the last. dp[i] = longest such chain ending at i = 1 + best dp[j] for smaller nums[j] before it.", [1, 2], st());
  nums.forEach((v, i) => {
    let from = -1;
    for (let j = 0; j < i; j++) if (nums[j] < v && dp[j] + 1 > dp[i]) ((dp[i] = dp[j] + 1), (from = j));
    nums.forEach((_, k) => r.node(`i${k}`, { state: k === i ? "current" : k === from ? "frontier" : k < i ? "done" : "idle", tag: k <= i ? String(dp[k]) : undefined }));
    if (i > 1) r.snap(`${v}: length ${dp[i]}`, from < 0 ? `Nothing smaller before ${v}, so it starts a chain of 1.` : `Best chain to extend ends at ${nums[from]} (length ${dp[from]}). So ${dp[i]}.`, [4, 5], st());
  });
  r.snap(`Answer: ${Math.max(...dp)}`, "2, 3, 7, 18 (or 101). This table is O(n²); a binary-search trick (patience sorting) makes it O(n log n).", [7], st());
  return lesson(
    { slug: "longest-increasing-subsequence", title: "Longest Increasing Subsequence", question: "300. Longest Increasing Subsequence", group: DP, blurb: "Extend the best smaller chain.", problem: "Find the length of the longest strictly increasing subsequence." },
    `function lengthOfLIS(nums) {
  const longest = nums.map(() => 1);
  for (let i = 0; i < nums.length; i++)
    for (let j = 0; j < i; j++)
      if (nums[j] < nums[i]) longest[i] = Math.max(longest[i], longest[j] + 1);
  return Math.max(...longest);
}`,
    r,
  );
}

function wordBreak(): Lesson {
  const s = "leetcode";
  const dict = ["leet", "code"];
  const r = new Recorder([]);
  row(r, [...s], "c", 0, 1.3);
  const ok = [true, ...Array(s.length).fill(false)];
  const st = (): StateRow[] => [{ label: "Can split the first i letters", value: ok.map((b, i) => `${i}:${b ? "yes" : "no"}`) }];
  r.snap("Split into words", `Can "${s}" be cut into dictionary words (${dict.join(", ")})? ok[i] = the first i letters can be split. ok[i] is true if some ok[j] is true and s[j..i] is a word.`, [1, 2], st());
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) if (ok[j] && dict.includes(s.slice(j, i))) {
      ok[i] = true;
      [...s].forEach((_, k) => r.node(`c${k}`, { state: k >= j && k < i ? "current" : k < j ? "done" : "idle" }));
      r.node(`c${i - 1}`, { tag: "ok" });
      r.snap(`"${s.slice(j, i)}" fits`, `The first ${j} letters split fine and "${s.slice(j, i)}" is a word, so the first ${i} letters split too.`, [4, 5], st());
      break;
    }
  }
  r.snap(`Answer: ${ok[s.length]}`, "O(n²) checks with a set for the dictionary. Plain recursion without the table can blow up exponentially.", [7], st());
  return lesson(
    { slug: "word-break", title: "Word Break", question: "139. Word Break", group: DP, blurb: "Can the first i letters split?", problem: "Decide whether a string can be segmented into dictionary words." },
    `function wordBreak(text, words) {
  const dict = new Set(words), canSplit = [true];
  for (let end = 1; end <= text.length; end++) {
    for (let start = 0; start < end; start++)
      if (canSplit[start] && dict.has(text.slice(start, end))) { canSplit[end] = true; break; }
  }
  return !!canSplit[text.length];
}`,
    r,
  );
}

function palindrome(): Lesson {
  const s = "babad";
  const r = new Recorder([]);
  row(r, [...s], "c", 0, 1.7);
  let best = [0, 0];
  const st = (): StateRow[] => [{ label: "Longest so far", value: [s.slice(best[0], best[1] + 1)] }];
  r.snap("Longest palindrome inside", "A palindrome mirrors around its centre. Try every centre (each letter and each gap) and grow outward while both ends match.", [1, 2], st());
  for (let c = 0; c < s.length; c++) {
    let lo = c;
    let hi = c;
    while (lo > 0 && hi < s.length - 1 && s[lo - 1] === s[hi + 1]) ((lo--), (hi++));
    if (hi - lo > best[1] - best[0]) best = [lo, hi];
    [...s].forEach((_, k) => r.node(`c${k}`, { state: k === c ? "current" : k >= lo && k <= hi ? "frontier" : "idle", tag: k === c ? "centre" : undefined }));
    r.snap(`Centre ${s[c]} at ${c}`, `Grow out from ${c} while the ends match: "${s.slice(lo, hi + 1)}".`, [4, 5], st());
  }
  r.snap(`Answer: "${s.slice(best[0], best[1] + 1)}"`, "2n − 1 centres, each grows up to n: O(n²) time, O(1) space. (Manacher's algorithm does O(n), rarely needed.)", [7], st());
  return lesson(
    { slug: "longest-palindromic-substring", title: "Longest Palindromic Substring", question: "5. Longest Palindromic Substring", group: DP, blurb: "Expand around every centre.", problem: "Find the longest palindromic substring." },
    `function longestPalindrome(text) {
  let best = "";
  for (let centre = 0; centre < 2 * text.length - 1; centre++) {
    let left = Math.floor(centre / 2), right = left + (centre % 2);
    while (left >= 0 && text[left] === text[right]) { left--; right++; }
    if (right - left - 1 > best.length) best = text.slice(left + 1, right);
  }
  return best;
}`,
    r,
  );
}

/* ---------------------------------------------------------------- 2D DP */
/** A 2D table with header blocks; cell ids c{i}_{j}. */
function table2d(rowHead: string[], colHead: string[]) {
  const r = new Recorder([]);
  const G = 1.55;
  colHead.forEach((h, j) => r.add(`ch${j}`, (j + 1) * G, 0, h, { state: "done" }));
  rowHead.forEach((h, i) => r.add(`rh${i}`, 0, (i + 1) * G, h, { state: "done" }));
  rowHead.forEach((_, i) => colHead.forEach((_, j) => r.add(`c${i}_${j}`, (j + 1) * G, (i + 1) * G, "", { state: "dim" })));
  return r;
}

function gridLesson(o: {
  slug: string; title: string; question: string; blurb: string; problem: string; intro: string; codeText: string;
  rows: string[]; cols: string[]; init: (i: number, j: number) => number | null;
  cell: (i: number, j: number, dp: number[][]) => { v: number; from: [number, number][]; why: string };
  lines: number[]; outro: (dp: number[][]) => [string, string]; every?: number;
}): Lesson {
  const r = table2d(o.rows, o.cols);
  const dp = o.rows.map((_, i) => o.cols.map((_, j) => o.init(i, j) ?? NaN));
  const show = (i: number, j: number) => r.node(`c${i}_${j}`, { label: String(dp[i][j]), state: "done" });
  dp.forEach((line, i) => line.forEach((v, j) => !Number.isNaN(v) && show(i, j)));
  const st = (): StateRow[] => [];
  r.snap(o.title, o.intro, [1, 2], st());
  let count = 0;
  for (let i = 0; i < o.rows.length; i++)
    for (let j = 0; j < o.cols.length; j++) {
      if (!Number.isNaN(dp[i][j])) continue;
      const { v, from, why } = o.cell(i, j, dp);
      dp[i][j] = v;
      r.node(`c${i}_${j}`, { label: String(v), state: "current" });
      from.forEach(([a, b]) => r.node(`c${a}_${b}`, { state: "frontier" }));
      if (count++ % (o.every ?? 1) === 0 || (i === o.rows.length - 1 && j === o.cols.length - 1)) r.snap(`Cell ${o.rows[i]}, ${o.cols[j]}: ${v}`, why, o.lines, st());
      from.forEach(([a, b]) => show(a, b));
      show(i, j);
    }
  const [t, x] = o.outro(dp);
  r.node(`c${o.rows.length - 1}_${o.cols.length - 1}`, { state: "current" });
  r.snap(t, x, [o.lines[o.lines.length - 1] + 2], st());
  return lesson({ slug: o.slug, title: o.title, question: o.question, group: DP, blurb: o.blurb, problem: o.problem }, o.codeText, r);
}

const lcs = () => {
  const a = "ace";
  const b = "abcde";
  return gridLesson({
    slug: "longest-common-subsequence", title: "Longest Common Subsequence", question: "1143. Longest Common Subsequence", blurb: "Match: diagonal + 1. Else: best of up or left.",
    problem: "Find the length of the longest subsequence shared by two strings.",
    intro: `Rows are "${a}" (plus empty), columns are "${b}". Cell (i, j) = LCS of the first i letters and the first j letters. Empty rows/cols are 0.`,
    rows: ["–", ...a], cols: ["–", ...b], init: (i, j) => (i === 0 || j === 0 ? 0 : null), lines: [4, 5, 6],
    cell: (i, j, dp) => (a[i - 1] === b[j - 1]
      ? { v: dp[i - 1][j - 1] + 1, from: [[i - 1, j - 1]], why: `"${a[i - 1]}" matches "${b[j - 1]}": take the diagonal ${dp[i - 1][j - 1]} and add 1.` }
      : { v: Math.max(dp[i - 1][j], dp[i][j - 1]), from: [[i - 1, j], [i, j - 1]], why: `"${a[i - 1]}" ≠ "${b[j - 1]}": drop one letter. Best of up (${dp[i - 1][j]}) and left (${dp[i][j - 1]}).` }),
    outro: (dp) => [`Answer: ${dp[3][5]}`, `"ace" is fully inside "abcde". O(n·m) time.`],
    codeText: `function longestCommonSubsequence(first, second) {
  const table = Array.from({ length: first.length + 1 }, () => Array(second.length + 1).fill(0));
  for (let i = 1; i <= first.length; i++) for (let j = 1; j <= second.length; j++)
    table[i][j] = first[i - 1] === second[j - 1]
      ? table[i - 1][j - 1] + 1 // letters match
      : Math.max(table[i - 1][j], table[i][j - 1]); // drop one
  return table[first.length][second.length];
}`,
  });
};

const editDistance = () => {
  const a = "ros";
  const b = "horse";
  return gridLesson({
    slug: "edit-distance", title: "Edit Distance", question: "72. Edit Distance", blurb: "Insert, delete or replace: 1 + min.",
    problem: "Find the fewest insertions, deletions and replacements to turn one word into another.",
    intro: `Turn "${b}" into "${a}". Cell (i, j) = edits to turn the first j letters of "${b}" into the first i of "${a}". The edges are just counts of inserts or deletes.`,
    rows: ["–", ...a], cols: ["–", ...b], init: (i, j) => (i === 0 ? j : j === 0 ? i : null), lines: [4, 5, 6],
    cell: (i, j, dp) => (a[i - 1] === b[j - 1]
      ? { v: dp[i - 1][j - 1], from: [[i - 1, j - 1]], why: `"${a[i - 1]}" = "${b[j - 1]}": no edit needed, copy the diagonal ${dp[i - 1][j - 1]}.` }
      : { v: 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]), from: [[i - 1, j - 1], [i - 1, j], [i, j - 1]], why: `Letters differ: 1 + the smallest of replace (${dp[i - 1][j - 1]}), insert (${dp[i - 1][j]}) and delete (${dp[i][j - 1]}).` }),
    outro: (dp) => [`Answer: ${dp[3][5]}`, "horse → rorse → rose → ros: 3 edits. O(n·m). Spell checkers and DNA tools use this."],
    codeText: `function minDistance(from, to) {
  const table = buildTableWithEdges(to.length, from.length); // edges count up 0, 1, 2…
  for (let i = 1; i <= to.length; i++) for (let j = 1; j <= from.length; j++)
    table[i][j] = to[i - 1] === from[j - 1]
      ? table[i - 1][j - 1] // same letter: free
      : 1 + Math.min(table[i - 1][j - 1], table[i - 1][j], table[i][j - 1]); // replace, insert, delete
  return table[to.length][from.length];
}`,
    every: 1,
  });
};

const knapsack = () => {
  const items = [[1, 1], [3, 4], [4, 5]];
  const cap = 5;
  return gridLesson({
    slug: "knapsack-01", title: "0/1 Knapsack", question: "416. Partition Equal Subset Sum (family)", blurb: "Take the item or leave it.",
    problem: "Choose items with weights and values to maximise value within a weight limit, each item at most once.",
    intro: `Items (weight, value): ${items.map(([w, v]) => `(${w}, ${v})`).join(", ")}. Bag holds ${cap}. Cell (item i, capacity c) = best value using the first i items in a bag of size c.`,
    rows: ["none", ...items.map(([w, v]) => `${w}kg`)], cols: Array.from({ length: cap + 1 }, (_, c) => String(c)), init: (i) => (i === 0 ? 0 : null), lines: [4, 5, 6],
    cell: (i, c, dp) => {
      const [w, v] = items[i - 1];
      const leave = dp[i - 1][c];
      if (w > c) return { v: leave, from: [[i - 1, c]], why: `A ${w}kg item doesn't fit in ${c}. Same as without it: ${leave}.` };
      const take = v + dp[i - 1][c - w];
      return { v: Math.max(leave, take), from: [[i - 1, c], [i - 1, c - w]], why: `Leave it: ${leave}. Take it: ${v} + best for the remaining ${c - w}kg (${dp[i - 1][c - w]}) = ${take}. Keep ${Math.max(leave, take)}.` };
    },
    outro: (dp) => [`Answer: ${dp[3][cap]}`, "Take the 1kg and 4kg items: value 6. O(items × capacity)."],
    codeText: `function knapsack(items, capacity) {
  const best = Array(capacity + 1).fill(0);
  for (const { weight, value } of items)
    for (let room = capacity; room >= weight; room--) // go down so each item is used once
      best[room] = Math.max(best[room], // leave it
        value + best[room - weight]); // take it
  return best[capacity];
}`,
    every: 2,
  });
};

const uniquePaths = () =>
  gridLesson({
    slug: "unique-paths", title: "Unique Paths", question: "62. Unique Paths", blurb: "Ways from above + ways from the left.",
    problem: "Count the paths from the top-left to the bottom-right moving only right or down.",
    intro: "A robot moves only right or down. Ways to reach a cell = ways to reach the cell above + ways to reach the cell on the left. The top row and left column have just 1 way.",
    rows: ["0", "1", "2"], cols: ["0", "1", "2", "3"], init: (i, j) => (i === 0 || j === 0 ? 1 : null), lines: [4],
    cell: (i, j, dp) => ({ v: dp[i - 1][j] + dp[i][j - 1], from: [[i - 1, j], [i, j - 1]], why: `${dp[i - 1][j]} from above + ${dp[i][j - 1]} from the left.` }),
    outro: (dp) => [`Answer: ${dp[2][3]}`, "O(rows × cols). It also equals the maths formula C(m+n−2, m−1)."],
    codeText: `function uniquePaths(rows, cols) {
  const ways = Array.from({ length: rows }, () => Array(cols).fill(1));
  for (let r = 1; r < rows; r++) for (let c = 1; c < cols; c++)
    ways[r][c] = ways[r - 1][c] + ways[r][c - 1];
  return ways[rows - 1][cols - 1];
}`,
  });

export const DP_LESSONS: Lesson[] = [subsets(), permutations(), nQueens(), memoFib(), climbing(), houseRobber(), coinChange(), lis(), wordBreak(), palindrome(), lcs(), editDistance(), knapsack(), uniquePaths()];
