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

/** Which level a panel visual belongs to. Omitted = shown in both. */
export type VizLevel = { only?: "simple" | "interview" };

export type Viz = VizLevel &
  (
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
  | ThreeEmbedViz
  );

// ---------- stages: the big concept visual in the centre ----------

export type NeuronStage = {
  kind: "neuron";
  inputs: { label: string; value: number }[];
  weights: number[];
  bias: number;
  activation: "relu" | "sigmoid";
  /** inputs: show x × w on each line · sum: fill the body with Σ + b · activate: pass through the gate. */
  phase: "inputs" | "sum" | "activate";
  outputLabel?: string;
  /** Optional "what if the total were negative?" example for the gate phase. */
  blockedExample?: number;
};

export type NetworkStage = {
  kind: "network";
  layers: { title: string; nodes: { label: string; value?: number }[] }[];
  /** weights[l][i][j]: from node i in layer l to node j in layer l + 1. */
  weights: number[][][];
  /**
   * structure: draw it · forward: numbers flow right, neurons light up · error: the guess
   * is compared with the right answer · backward: blame flows left · update: lines change to newWeights.
   */
  mode: "structure" | "forward" | "error" | "backward" | "update";
  newWeights?: number[][][];
  /** Shown next to the output in forward/error/backward/update modes. `was` = the output before the update. */
  target?: { label: string; value: number; was?: number };
  /** Show a little ReLU gate on hidden neurons (open when the value is above 0). */
  gates?: boolean;
  /** Per-node blame for the backward pass, same shape as layers' nodes. Use [] for a layer that gets none (the inputs). */
  blame?: number[][];
  note?: string;
};

export type TokensStage = {
  kind: "tokens";
  mode: "split" | "ids" | "vectors" | "qkv" | "attention" | "next" | "generate";
  /** The sentence before splitting (split mode). */
  text?: string;
  tokens: string[];
  ids?: (number | string)[];
  /** A short vector per token, drawn as little bars (vectors mode). */
  vectors?: number[][];
  /** attention[i][j] = how much token i looks at token j. */
  attention?: number[][];
  /** The token whose attention lines are drawn first. */
  focus?: number;
  /** next/generate: candidate next words with probabilities. */
  candidates?: { text: string; p: number }[];
  chosen?: number;
  /** generate: how many of `tokens` are the prompt; the rest appear one by one. */
  promptCount?: number;
  /** generate: show the KV cache as a notebook that fills up. */
  notebook?: boolean;
  note?: string;
};

export type FitStage = {
  kind: "fit";
  mode: "data" | "split" | "guess" | "train" | "fits" | "predict";
  points: { x: number; y: number; set?: "train" | "val" | "test" }[];
  xLabel: string;
  yLabel: string;
  x: [number, number];
  y: [number, number];
  /** guess/predict: one line. train: one line per frame (epoch), animated in order. */
  lines?: { w: number; b: number; label?: string }[];
  /** train: loss per frame for the side graph. */
  losses?: number[];
  /** fits: three curves sampled as points. */
  curves?: { label: string; tone: Tone; points: [number, number][]; note?: string }[];
  /** predict: the new input and its prediction. */
  newPoint?: { x: number; label: string };
  /** data: annotate one point with its feature (x) and label (y) in words. */
  callout?: { index: number; feature: string; label: string };
  note?: string;
};

export type DescentStage = {
  kind: "descent";
  /** The loss curve as (w, loss) points, sorted by w. */
  curve: [number, number][];
  /** Positions of w at each step, in order. The ball walks through them. */
  steps: number[];
  xLabel: string;
  yLabel: string;
  /** Label for the main ball, e.g. "learning rate 0.1". */
  label?: string;
  /** Extra balls on the same curve (e.g. too-small / too-big learning rates), drawn with their own tone. */
  compare?: { label: string; tone: Tone; steps: number[] }[];
  note?: string;
};

export type MapStage = {
  kind: "map";
  mode: "map" | "angle";
  points: { x: number; y: number; label: string; tone?: Tone }[];
  query?: { x: number; y: number; label: string };
  neighbours?: number[];
  /** angle mode: arrows from the origin to points a and b (indices). The stage computes the cosine from the coordinates. */
  pairs?: { a: number; b: number; verdict: string }[];
  note?: string;
};

export type CardsStage = {
  kind: "cards";
  /**
   * Zones drawn left to right. A card keeps its `id` across steps, so when a
   * later step puts it in a different zone it visibly flies there.
   */
  zones: {
    id: string;
    label: string;
    icon?: "doc" | "scissors" | "shelf" | "person" | "librarian" | "tray" | "llm" | "answer" | "box" | "search" | "check";
    cards?: { id: string; title: string; sub?: string; score?: string; tone?: Tone; struck?: boolean; badge?: string }[];
    /** Free text in the zone, e.g. the question or the answer. `[n]` becomes a sticky-note citation. */
    text?: string;
    tone?: Tone;
  }[];
  note?: string;
};

export type ChatStage = {
  kind: "chat";
  messages: { role: "system" | "user" | "assistant" | "tool"; text: string; note?: string; dim?: boolean }[];
  /** Type the last message out word by word. */
  streamLast?: boolean;
  /** A side box, e.g. "sent to the model this turn" or a memory notebook. */
  aside?: { title: string; items: string[]; tone?: Tone };
  note?: string;
};

/** A panel visual drawn big. Two or three side by side compare well (e.g. a line vs a curve). */
export type VizStage = { kind: "viz"; viz: Viz | Viz[]; note?: string };

export type Stage = NeuronStage | NetworkStage | TokensStage | FitStage | DescentStage | MapStage | CardsStage | ChatStage | VizStage;

// ---------- steps ----------

export type LogRow = { tone?: Tone; cells: Record<string, string | number> };

export type Step = {
  id: string;
  title: string;
  /** "In simple words": one plain sentence, no jargon, at most ~20 words. Shown first, in both modes. */
  simple?: string;
  /**
   * 2–3 short plain sentences a school student can follow. Supports light markup:
   * `{{term}}` / `{{term|shown text}}` for glossary tooltips, `**bold**`, and `` `code` ``.
   * Explain any jargon in brackets the first time it appears.
   */
  explain: string;
  /** Interview mode only: the deeper, more technical explanation. */
  detail?: string;
  /** The big centre visual. Steps without one show the flow scene. */
  stage?: Stage;
  /** One-line analogy, shown in a callout. */
  analogy?: string;
  /** Interview mode: "Show the maths" (text + math) and "Show the code" toggles, collapsed by default. */
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
  /** "Imagine…" card shown before step 1. Starts with "Imagine". */
  imagine?: string;
  /** "What you just learned": three plain bullets shown after the last step. */
  recap?: [string, string, string];
  overview: {
    /** Simple-mode definition: 2–3 plain sentences. */
    plain?: string;
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
