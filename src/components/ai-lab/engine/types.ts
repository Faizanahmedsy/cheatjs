/**
 * AI Visual Lab scenario engine — the data model.
 *
 * A topic is a `Scenario`: a set of isometric objects, the links between them,
 * and an ordered list of steps. Each step says which objects light up, which
 * "packets" travel along which links, what the right-hand panel explains, and
 * which rows it adds to the trace table at the bottom. Adding a topic is
 * writing one of these objects; the renderer does the rest.
 */

/** Colour role. Keeps the scene, the packet cards and the trace rows in step. */
export type Tone = "blue" | "cyan" | "violet" | "amber" | "green" | "rose" | "slate";

export type ObjectKind =
  | "user"
  | "chat"
  | "laptop"
  | "server"
  | "cloud"
  | "gpu"
  | "llm"
  | "db"
  | "vectordb"
  | "table"
  | "doc"
  | "tokens"
  | "vector"
  | "neuron"
  | "layer"
  | "matrix"
  | "chart"
  | "tool"
  | "cache"
  | "gauge"
  | "gear"
  | "ranker"
  | "dice"
  | "search"
  | "box";

export type SceneObject = {
  id: string;
  kind: ObjectKind;
  label: string;
  /** Second, dimmer label line (a shape, a value, a role). */
  sub?: string;
  /**
   * Position on the screen-aligned lattice: `[col, row]`.
   * One col = 56 px across, one row = 32 px down. Keep objects at least
   * 2 cols apart in a row and 3 rows apart vertically so labels never touch.
   */
  at: [number, number];
  tone?: Tone;
};

export type SceneLink = {
  id: string;
  from: string;
  to: string;
  label?: string;
  /** "iso" runs the connector along the grid axes (an elbow); default is straight. */
  route?: "straight" | "iso";
};

export type Packet = {
  from: string;
  to: string;
  label: string;
  sub?: string;
  tone?: Tone;
};

// ---------- step visualisations (the "lens" in the right panel) ----------

export type BarsViz = {
  kind: "bars";
  title?: string;
  items: { label: string; value: number; tone?: Tone; note?: string }[];
  /** Max of the scale. Defaults to the largest value. */
  max?: number;
  format?: "pct" | "fixed2" | "fixed3" | "fixed4" | "int";
  caption?: string;
};

export type HeatmapViz = {
  kind: "heatmap";
  title?: string;
  rowLabels: string[];
  colLabels: string[];
  values: number[][];
  format?: "fixed2" | "fixed3" | "pct";
  highlightRow?: number;
  caption?: string;
  rowAxis?: string;
  colAxis?: string;
};

export type MatrixViz = {
  kind: "matrices";
  title?: string;
  /** Rendered left-to-right with `ops[i]` drawn between matrix i and i+1. */
  items: { name: string; rowLabels?: string[]; colLabels?: string[]; values: number[][]; tone?: Tone }[];
  ops?: string[];
  format?: "fixed1" | "fixed2" | "fixed3";
  caption?: string;
};

export type PlotSeries = {
  label: string;
  points: [number, number][];
  tone?: Tone;
  dashed?: boolean;
  /** Draw dots instead of a line. */
  dots?: boolean;
};

export type PlotViz = {
  kind: "plot";
  title?: string;
  series: PlotSeries[];
  x: [number, number];
  y: [number, number];
  xLabel?: string;
  yLabel?: string;
  markers?: { x: number; y: number; label?: string; tone?: Tone }[];
  /** Arrows between consecutive markers (gradient-descent steps). */
  connectMarkers?: boolean;
  caption?: string;
};

export type ScatterViz = {
  kind: "scatter";
  title?: string;
  points: { x: number; y: number; label?: string; tone?: Tone }[];
  /** Draw a query point and dashed rays to its nearest neighbours. */
  query?: { x: number; y: number; label: string; neighbours?: number[] };
  /** Optional boundary curve, as a polyline. */
  boundary?: [number, number][];
  x: [number, number];
  y: [number, number];
  caption?: string;
};

export type TokensViz = {
  kind: "tokens";
  title?: string;
  tokens: { text: string; id?: number | string; tone?: Tone; note?: string }[];
  caption?: string;
};

export type TableViz = {
  kind: "table";
  title?: string;
  columns: string[];
  rows: (string | number)[][];
  highlightRow?: number;
  caption?: string;
};

export type StackViz = {
  kind: "stack";
  title?: string;
  segments: { label: string; value: number; tone?: Tone }[];
  caption?: string;
};

export type TreeNode = { label: string; tone?: Tone; children?: { edge: string; node: TreeNode }[] };
export type TreeViz = { kind: "tree"; title?: string; root: TreeNode; caption?: string };

export type ChatViz = {
  kind: "chat";
  title?: string;
  messages: { role: "system" | "user" | "assistant" | "tool"; text: string; note?: string; dim?: boolean }[];
  caption?: string;
};

export type NetworkViz = {
  kind: "nn";
  title?: string;
  /** Neurons per layer, e.g. [3, 4, 4, 1]. */
  layers: number[];
  layerNames?: string[];
  /** Optional values printed in the neurons, per layer. */
  values?: (number | null)[][];
  /** Highlight a layer index (the one being computed). */
  activeLayer?: number;
  /** Direction of the animated flow on the edges. */
  flow?: "forward" | "backward";
  caption?: string;
};

export type ThreeLossViz = { kind: "three-loss"; title?: string; caption?: string };
export type ThreeEmbedViz = { kind: "three-embed"; title?: string; caption?: string };

export type Viz =
  | BarsViz
  | HeatmapViz
  | MatrixViz
  | PlotViz
  | ScatterViz
  | TokensViz
  | TableViz
  | StackViz
  | TreeViz
  | ChatViz
  | NetworkViz
  | ThreeLossViz
  | ThreeEmbedViz;

// ---------- steps ----------

export type LogRow = { tone?: Tone; cells: Record<string, string | number> };

export type Step = {
  id: string;
  title: string;
  /**
   * Plain-English explanation a layman can follow. Supports light markup:
   * `{{term}}` / `{{term|shown text}}` for glossary tooltips, `**bold**`, and `` `code` ``.
   */
  explain: string;
  /** One-line analogy, shown in a callout. */
  analogy?: string;
  /** The "deeper" toggle: math lines and/or code. */
  deeper?: { text?: string; math?: string[]; code?: { lang: string; src: string } };
  highlight?: string[];
  packets?: Packet[];
  viz?: Viz | Viz[];
  log?: LogRow[];
  /** Overrides the auto-computed step length (ms at 1x). */
  duration?: number;
  /** An "in interviews" one-liner tied to this step. */
  interviewTip?: string;
};

// ---------- interview + quiz ----------

export type Level = "fresher" | "mid" | "senior";

export type InterviewQuestion = {
  id: string;
  level: Level;
  q: string;
  answer: string;
  lookFor: string;
  wrong: string;
  /** Scenario / system-design style question. */
  design?: boolean;
};

export type QuizQuestion = {
  id: string;
  q: string;
  options: string[];
  correct: number;
  explain: string;
};

export type Scenario = {
  id: string;
  title: string;
  tagline: string;
  overview: {
    definition: string;
    analogy: string;
    facts: [string, string][];
    /** Where this shows up in real systems. */
    whereUsed?: string;
  };
  objects: SceneObject[];
  links: SceneLink[];
  logTitle: string;
  logColumns: { key: string; label: string; align?: "left" | "right"; width?: string }[];
  steps: Step[];
  interview: InterviewQuestion[];
  quiz: QuizQuestion[];
};

export type ScenarioMeta = {
  id: string;
  num: number;
  title: string;
  short: string;
  tagline: string;
  keywords: string;
  load: () => Promise<{ default: Scenario }>;
};
