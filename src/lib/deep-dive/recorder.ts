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

