import type { Lesson } from "./types";
import type { EdgeState, NodeState, SceneEdge, SceneNode, StateRow, Step } from "./types";

/** Records the scene as an algorithm runs; every snap() becomes one step. */
export class Recorder {
  nodes = new Map<string, SceneNode>();
  edges: SceneEdge[] = [];
  steps: Step[] = [];

  constructor(nodes: [string, number, number, string?][], edges: [string, string, number?][] = [], directed = false) {
    for (const [id, x, y, label] of nodes) this.nodes.set(id, { id, label: label ?? id, x, y, state: "idle" });
    this.edges = edges.map(([a, b, weight]) => ({ a, b, weight, directed, state: "idle" as EdgeState }));
  }

  /** Add a block (or reset one that exists). */
  add(id: string, x: number, y: number, label: string, patch: Partial<SceneNode> = {}) {
    this.nodes.set(id, { id, label, x, y, state: "idle", ...patch });
  }

  link(a: string, b: string, patch: Partial<SceneEdge> = {}) {
    if (!this.edges.some((e) => e.a === a && e.b === b)) this.edges.push({ a, b, state: "idle", ...patch });
  }

  unlink(a: string, b: string) {
    this.edges = this.edges.filter((e) => !(e.a === a && e.b === b) && !(e.a === b && e.b === a));
  }

  has(id: string) {
    return this.nodes.has(id);
  }

  get(id: string) {
    return this.nodes.get(id)!;
  }

  node(id: string, patch: Partial<SceneNode>) {
    const n = this.nodes.get(id)!;
    this.nodes.set(id, { ...n, ...patch });
  }

  all(state: NodeState) {
    this.nodes.forEach((n, id) => this.nodes.set(id, { ...n, state }));
  }

  edge(a: string, b: string, state: EdgeState) {
    for (const e of this.edges) if ((e.a === a && e.b === b) || (!e.directed && e.a === b && e.b === a)) e.state = state;
  }

  /** Neighbours with weights, following edge direction when the graph is directed. */
  adj(id: string): [string, number][] {
    const out: [string, number][] = [];
    for (const e of this.edges) {
      if (e.a === id) out.push([e.b, e.weight ?? 1]);
      else if (!e.directed && e.b === id) out.push([e.a, e.weight ?? 1]);
    }
    return out;
  }

  snap(title: string, text: string, lines: number[], state: StateRow[]) {
    this.steps.push({
      title,
      text,
      lines,
      nodes: [...this.nodes.values()].map((n) => ({ ...n })),
      edges: this.edges.map((e) => ({ ...e })),
      state,
    });
  }
}

export const inf = (v: number | undefined) => (v === undefined || v === Infinity ? "∞" : String(v));


/** A row of blocks for an array; ids are `${prefix}${index}`. */
export function row(r: Recorder, values: (string | number)[], prefix = "i", y = 0, gap = 1.7) {
  values.forEach((v, i) => r.add(`${prefix}${i}`, i * gap, y, String(v)));
}

/** A grid of blocks; ids are `${prefix}${row}_${col}`. */
export function grid(r: Recorder, cells: (string | number)[][], prefix = "g", gap = 1.6) {
  cells.forEach((line, ro) => line.forEach((v, c) => r.add(`${prefix}${ro}_${c}`, c * gap, ro * gap, String(v))));
}

/** Lay out a binary tree given in level order (null = empty). Returns ids by index. */
export function tree(r: Recorder, values: (number | string | null)[], prefix = "t") {
  const depth = Math.floor(Math.log2(values.length)) + 1;
  const ids: (string | null)[] = [];
  values.forEach((v, i) => {
    if (v === null) return void ids.push(null);
    const level = Math.floor(Math.log2(i + 1));
    const pos = i + 1 - 2 ** level;
    const span = 2 ** (depth - level);
    const across = (pos * span + span / 2 - 2 ** (depth - 1)) * 1.3;
    const down = level * 2.2;
    const id = `${prefix}${i}`;
    r.add(id, across + 6, down, String(v));
    ids.push(id);
    if (i > 0 && ids[Math.floor((i - 1) / 2)]) r.link(ids[Math.floor((i - 1) / 2)]!, id);
  });
  return ids;
}

export const code = (text: string) => text.replace(/^\n/, "").replace(/\n$/, "").split("\n");

/** Build a lesson from its meta, code text and recorded steps. */
export function lesson(meta: Omit<Lesson, "steps" | "code">, codeText: string, r: Recorder): Lesson {
  return { ...meta, code: code(codeText), steps: r.steps };
}
