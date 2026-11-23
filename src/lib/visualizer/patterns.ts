import type { ProblemGroup } from "./problem-types";

/** One-line idea and a tiny text picture for each problem pattern. */
export const PATTERN_INFO: Record<ProblemGroup, { idea: string; picture: string }> = {
  "Pre-DSA · Functions & maths": {
    idea: "A function takes inputs, does one calculation and returns the answer.",
    picture: "(4, 3) → width × height → 12",
  },
  "Pre-DSA · Conditions": {
    idea: "Turn each rule into a yes / no check. Only the first branch that says yes runs.",
    picture: "score 82: ≥ 90? no → ≥ 75? yes → \"B\"",
  },
  "Pre-DSA · Strings": {
    idea: "A string is a row of characters with positions 0, 1, 2… Walk it like a list.",
    picture: "\"code\"\n c o d e\n 0 1 2 3",
  },
  "Pre-DSA · Counter": {
    idea: "Start count at 0 and add 1 each time an item matches the rule.",
    picture: "[3, 8, 5, 6] → even? 0 → 1 → 1 → 2",
  },
  "Pre-DSA · Accumulator": {
    idea: "Keep a running result (sum, product, new list) and update it with every item.",
    picture: "total: 0 → +4 → +7 → +1 = 12",
  },
  "Pre-DSA · Best so far": {
    idea: "Remember the best value seen so far and replace it only when something better shows up.",
    picture: "[7, 3, 12, 5] → best 7 → 7 → 12 → 12",
  },
  "Pre-DSA · Flags & early exit": {
    idea: "Stop as soon as you know the answer: return early, or flip a yes / no flag and break.",
    picture: "[4, 8, 15] find 8 → 4 no, 8 yes → stop",
  },
  "Pre-DSA · Nested loops": {
    idea: "Outer loop picks one item, inner loop compares it with every item after it (start at outer + 1).",
    picture: "first=0: (0,1) (0,2) (0,3)\nfirst=1: (1,2) (1,3)",
  },
  "Pre-DSA · Frequency count": {
    idea: "Use a map from item to count; add 1 to an item's count each time you see it.",
    picture: "\"banana\" → { b:1, a:3, n:2 }",
  },
  "Arrays & Hashing": {
    idea: "Remember what you have seen in a map or set, so later items can be checked in one step instead of a second loop.",
    picture: "[2, 7, 11]  →  seen = { 2:0, 7:1 }  →  need 2? yes ✓",
  },
  "Two Pointers": {
    idea: "Put one finger at each end (or two fingers moving together) and move them inward based on a comparison.",
    picture: "[1, 3, 5, 8, 9]\n ▲L           ▲R   → move L or R",
  },
  "Sliding Window": {
    idea: "Keep a window over a part of the list; grow the right edge, shrink the left edge when the window breaks a rule.",
    picture: "a b [c d e] f g\n     └window┘ → slide →",
  },
  "Stack & Queue": {
    idea: "A stack is a pile of plates: last in, first out. Use it to remember things you will match or undo later.",
    picture: "push ( → [ ( [ ]  pop when ) matches",
  },
  "Binary Search": {
    idea: "In a sorted list, look at the middle and throw away the half that cannot hold the answer. Repeat.",
    picture: "[1 3 5 7 9 11 13]\n lo    ▲mid     hi → keep one half",
  },
  "Linked Lists": {
    idea: "Each box points to the next box. Most tricks are about moving and re-pointing these arrows carefully.",
    picture: "1 → 2 → 3 → null",
  },
  "Binary Trees & BST": {
    idea: "Each node has a left and right child. Solve the small trees (children) first, then combine at the parent.",
    picture: "    4\n   / \\\n  2   6",
  },
  "Graphs & Grids": {
    idea: "Visit neighbours step by step (BFS = ripple, DFS = go deep), marking cells as visited so you never loop.",
    picture: "■ ■ □\n□ ■ □  → spread to touching ■",
  },
  "Intervals & Sorting": {
    idea: "Sort by start time first; then overlapping ranges sit next to each other and can be merged in one pass.",
    picture: "[1──3] [2──6] [8─10] → [1────6] [8─10]",
  },
  "Dynamic Programming": {
    idea: "Write down the answer for small inputs in a table, then build bigger answers from the smaller ones.",
    picture: "dp: 1 1 2 3 5 8 …  each = earlier answers",
  },
  "Backtracking & Recursion": {
    idea: "Try a choice, go deeper, and undo it when it fails, so every possible path gets tried once.",
    picture: "start ─┬─ a ─┬─ ab ✓\n       │      └─ ac ✗ (undo)",
  },
  "Strings & Parsing": {
    idea: "Walk the text character by character, keeping counts or a small state to decide what each character means.",
    picture: "\"a b c\" → read a, read b, …",
  },
};
