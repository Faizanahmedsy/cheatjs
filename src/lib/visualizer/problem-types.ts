/** The practice-problem groups shown in the JS Visualizer's picker, in order. */
export const PROBLEM_GROUPS = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack & Queue",
  "Binary Search",
  "Linked Lists",
  "Binary Trees & BST",
  "Graphs & Grids",
  "Intervals & Sorting",
  "Dynamic Programming",
  "Backtracking & Recursion",
  "Strings & Parsing",
] as const;

/** Pre-DSA warm-up groups, one per loop pattern (from the DSA hub in Notion). */
export const PRE_DSA_GROUPS = [
  "Pre-DSA · Functions & maths",
  "Pre-DSA · Conditions",
  "Pre-DSA · Strings",
  "Pre-DSA · Counter",
  "Pre-DSA · Accumulator",
  "Pre-DSA · Best so far",
  "Pre-DSA · Flags & early exit",
  "Pre-DSA · Nested loops",
  "Pre-DSA · Frequency count",
] as const;

export type ProblemGroup = (typeof PROBLEM_GROUPS)[number] | (typeof PRE_DSA_GROUPS)[number];

export type Level = "pre" | 1 | 2 | 3;

export const LEVELS: { id: Level; label: string; short: string; blurb: string }[] = [
  { id: "pre", label: "Pre-DSA", short: "Pre", blurb: "Loops and logic warm-ups: counter, accumulator, best so far, flags, pairs, frequency." },
  { id: 1, label: "Level 1", short: "L1", blurb: "Easy classics. One idea each." },
  { id: 2, label: "Level 2", short: "L2", blurb: "Medium array, string, stack and search patterns." },
  { id: 3, label: "Level 3", short: "L3", blurb: "Medium lists, trees, graphs, intervals, DP and backtracking." },
];

const LEVEL_2_GROUPS = new Set<string>(["Arrays & Hashing", "Two Pointers", "Sliding Window", "Stack & Queue", "Binary Search", "Strings & Parsing"]);

/** Pre-DSA → Easy (L1) → Medium basics (L2) → Medium structures (L3). */
export function levelOf(problem: { group: string; difficulty: string }): Level {
  if (problem.group.startsWith("Pre-DSA")) return "pre";
  if (problem.difficulty === "Easy") return 1;
  return LEVEL_2_GROUPS.has(problem.group) ? 2 : 3;
}

/** "P3" for Pre-DSA warm-ups, the plain number otherwise. */
export function displayNumber(problem: { number: number }): string {
  return problem.number > 1000 ? `P${problem.number - 1000}` : String(problem.number);
}

/**
 * A classic practice problem, ready to dry-run in the JS Visualizer.
 *
 * Everything a learner needs sits beside the code: what is asked, one
 * worked input → output, the idea in plain words, what to watch while
 * stepping, and the cost.
 */
export interface Problem {
  /** Stable id, kebab-case, e.g. "two-sum". */
  id: string;
  /** Position in the syllabus (1–143; 125–133 are not used). */
  number: number;
  /** The well-known title, e.g. "Two Sum". */
  title: string;
  group: ProblemGroup;
  difficulty: "Easy" | "Medium" | "Hard";
  /** The problem statement in two or three short plain sentences. */
  statement: string;
  /** The input the code runs on and the answer it prints, e.g. "nums = [2,7,11,15], target = 9 → [0,1]". */
  example: string;
  /** The idea in plain words (2–4 sentences): why this approach works. */
  approach: string;
  /** What to watch while stepping (3–5 short bullets): which variables, which moment matters. */
  watch: string[];
  complexity: { time: string; space: string };
  /** A self-contained runnable program: the solution, then a call on `example`'s input and a console.log. */
  code: string;
}
