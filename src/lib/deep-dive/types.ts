/** Deep Dive: hand-written, step-by-step lessons for hard algorithms, drawn as an isometric scene. */

export type NodeState = "idle" | "frontier" | "current" | "done" | "dim" | "hidden";
export type EdgeState = "idle" | "active" | "chosen" | "dim" | "hidden";

export interface SceneNode {
  id: string;
  label: string;
  /** Grid position on the platform (0..10). */
  x: number;
  y: number;
  state: NodeState;
  /** Small pill above the block, e.g. a distance. */
  tag?: string;
}

export interface SceneEdge {
  a: string;
  b: string;
  weight?: number;
  directed?: boolean;
  state: EdgeState;
}

export interface StateRow {
  label: string;
  value: string[];
}

export interface Step {
  title: string;
  text: string;
  /** 1-based lines of the code to highlight. */
  lines: number[];
  nodes: SceneNode[];
  edges: SceneEdge[];
  state: StateRow[];
}

export interface Lesson {
  slug: string;
  title: string;
  /** LeetCode-style question this lesson solves. */
  question: string;
  group: string;
  blurb: string;
  problem: string;
  code: string[];
  steps: Step[];
}
