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

export type ProblemGroup = (typeof PROBLEM_GROUPS)[number];

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
