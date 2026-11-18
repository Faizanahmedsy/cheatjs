import type { Scenario } from "../engine/types";
import { bce, dot, f, gaussian, leakyRelu, linspace, relu, seeded, sigmoid, tanh, vec } from "../engine/math";

/* ------------------------------------------------------------------ *
 * One neuron, then a network. The headline numbers come from the
 * study notes: x = [2, 1, 0], w = [0.5, −0.3, 0.8], b = 0.1 → z = 0.8.
 * Everything else (gradients, updates, the trained curved boundary)
 * is computed here at module load.
 * ------------------------------------------------------------------ */

const X = [2, 1, 0];
const W = [0.5, -0.3, 0.8];
const B = 0.1;
const PRODUCTS = X.map((x, i) => x * W[i]);
const Z = dot(X, W) + B; // 1.0 − 0.3 + 0 + 0.1 = 0.8
const RELU_OUT = relu(Z);
const SIG_OUT = sigmoid(Z);
const LEAKY_A = 0.1;

// ---- loss: regression target 1.0 for the ReLU output, class label 1 for the sigmoid output
const Y_REG = 1.0;
const MSE_ONE = (RELU_OUT - Y_REG) ** 2;
const Y_CLS = 1;
const BCE_ONE = bce(SIG_OUT, Y_CLS);

// ---- backprop through the sigmoid neuron with BCE
const dL_dp = -Y_CLS / SIG_OUT + (1 - Y_CLS) / (1 - SIG_OUT);
const dp_dz = SIG_OUT * (1 - SIG_OUT);
const dL_dz = dL_dp * dp_dz; // simplifies to p − y
const GRAD_W = X.map((x) => dL_dz * x);
const GRAD_B = dL_dz;
/** Finite-difference check on w₀, so the analytic gradient is verified numerically. */
const H = 1e-5;
const lossAt = (w: number[], b: number) => bce(sigmoid(dot(X, w) + b), Y_CLS);
const NUM_GRAD_W0 = (lossAt([W[0] + H, W[1], W[2]], B) - lossAt([W[0] - H, W[1], W[2]], B)) / (2 * H);

// ---- gradient descent on that one neuron
const ALPHA = 0.5;
type Iter = { it: number; w: number[]; b: number; z: number; p: number; loss: number };
const ITERS: Iter[] = [];
{
  let w = [...W];
  let b = B;
  for (let it = 0; it <= 6; it++) {
    const z = dot(X, w) + b;
    const p = sigmoid(z);
    ITERS.push({ it, w: [...w], b, z, p, loss: bce(p, Y_CLS) });
    const g = p - Y_CLS;
    w = w.map((wi, k) => wi - ALPHA * g * X[k]);
    b -= ALPHA * g;
  }
}
const AFTER = ITERS[1];

// ---- a small 3 → 4 → 4 → 1 network with seeded weights (forward pass only)
const r = seeded(6);
const mk = (i: number, o: number) => Array.from({ length: i }, () => Array.from({ length: o }, () => +(r() * 1.6 - 0.8).toFixed(2)));
const NW1 = mk(3, 4);
const NW2 = mk(4, 4);
const NW3 = mk(4, 1);
const layer = (v: number[], m: number[][]) => m[0].map((_, j) => v.reduce((s, a, i) => s + a * m[i][j], 0));
const Z1 = layer(X, NW1);
const H1 = Z1.map(relu);
const Z2 = layer(H1, NW2);
const H2 = Z2.map(relu);
const Z3 = layer(H2, NW3)[0];
const NET_OUT = sigmoid(Z3);

// ---- why depth matters: ring data that no straight line can separate
type Pt = { x: number; y: number; c: number };
const rr = seeded(5);
const RING: Pt[] = Array.from({ length: 40 }, (_, i) => {
  const inner = i % 2 === 0;
  const rad = inner ? 0.3 + rr() * 0.5 : 1.3 + rr() * 0.5;
  const a = rr() * 2 * Math.PI;
  return { x: rad * Math.cos(a), y: rad * Math.sin(a), c: inner ? 1 : 0 };
});

/** Logistic regression (a single neuron, straight-line boundary), trained by gradient descent. */
const LIN = (() => {
  let a1 = 0;
  let a2 = 0;
  let c = 0;
  for (let it = 0; it < 1500; it++) {
    let g1 = 0;
    let g2 = 0;
    let g0 = 0;
    for (const p of RING) {
      const e = sigmoid(a1 * p.x + a2 * p.y + c) - p.c;
      g1 += e * p.x;
      g2 += e * p.y;
      g0 += e;
    }
    a1 -= (0.5 * g1) / RING.length;
    a2 -= (0.5 * g2) / RING.length;
    c -= (0.5 * g0) / RING.length;
  }
  const acc = RING.filter((p) => (sigmoid(a1 * p.x + a2 * p.y + c) > 0.5 ? 1 : 0) === p.c).length / RING.length;
  return { a1, a2, c, acc };
})();

/** A 2 → 6 (tanh) → 1 (sigmoid) network trained with full-batch gradient descent on BCE. */
const MLP = (() => {
  const HID = 6;
  const wr = seeded(9);
  const W1 = Array.from({ length: HID }, () => [gaussian(wr), gaussian(wr)]);
  const b1 = Array(HID).fill(0) as number[];
  const W2 = Array.from({ length: HID }, () => gaussian(wr) * 0.5);
  let b2 = 0;
  const fwd = (x: number, y: number) => {
    const h = W1.map((w, j) => Math.tanh(w[0] * x + w[1] * y + b1[j]));
    return { h, p: sigmoid(h.reduce((s, v, j) => s + v * W2[j], b2)) };
  };
  const lr = 0.5;
  const n = RING.length;
  const lossLog: [number, number][] = [];
  for (let it = 0; it <= 1500; it++) {
    if (it % 50 === 0) lossLog.push([it, RING.reduce((s, p) => s + bce(fwd(p.x, p.y).p, p.c), 0) / n]);
    const gW1 = W1.map(() => [0, 0]);
    const gb1 = Array(HID).fill(0) as number[];
    const gW2 = Array(HID).fill(0) as number[];
    let gb2 = 0;
    for (const p of RING) {
      const { h, p: q } = fwd(p.x, p.y);
      const d2 = q - p.c;
      gb2 += d2;
      for (let j = 0; j < HID; j++) {
        gW2[j] += d2 * h[j];
        const d1 = d2 * W2[j] * (1 - h[j] ** 2);
        gb1[j] += d1;
        gW1[j][0] += d1 * p.x;
        gW1[j][1] += d1 * p.y;
      }
    }
    for (let j = 0; j < HID; j++) {
      W2[j] -= (lr * gW2[j]) / n;
      b1[j] -= (lr * gb1[j]) / n;
      W1[j][0] -= (lr * gW1[j][0]) / n;
      W1[j][1] -= (lr * gW1[j][1]) / n;
    }
    b2 -= (lr * gb2) / n;
  }
  const acc = RING.filter((p) => (fwd(p.x, p.y).p > 0.5 ? 1 : 0) === p.c).length / n;
  // Trace the p = 0.5 boundary: along each ray from the centre, bisect for the crossing.
  const boundary: [number, number][] = [];
  for (let k = 0; k <= 48; k++) {
    const a = (k / 48) * 2 * Math.PI;
    const inside = (d: number) => fwd(d * Math.cos(a), d * Math.sin(a)).p > 0.5;
    let lo = 0;
    let hi = 2.4;
    if (!inside(lo) || inside(hi)) continue;
    for (let i = 0; i < 30; i++) {
      const m = (lo + hi) / 2;
      if (inside(m)) lo = m;
      else hi = m;
    }
    boundary.push([lo * Math.cos(a), lo * Math.sin(a)]);
  }
  return { acc, boundary, lossLog, finalLoss: lossLog[lossLog.length - 1][1] };
})();

/** The straight line a1·x + a2·y + c = 0, clipped to the plot. */
const LIN_LINE: [number, number][] =
  Math.abs(LIN.a2) > 1e-6
    ? [-2.2, 2.2].map((x) => [x, -(LIN.a1 * x + LIN.c) / LIN.a2] as [number, number])
    : [
        [-LIN.c / LIN.a1, -2.2],
        [-LIN.c / LIN.a1, 2.2],
      ];

const ACTS = [
  { name: "sigmoid", fn: sigmoid, tone: "green" as const },
  { name: "ReLU", fn: relu, tone: "blue" as const },
  { name: "tanh", fn: tanh, tone: "violet" as const },
  { name: `leaky ReLU (a=${LEAKY_A})`, fn: (x: number) => leakyRelu(x, LEAKY_A), tone: "amber" as const },
];

const scenario: Scenario = {
  id: "neural-networks",
  title: "Neural networks & deep learning",
  tagline: "Tiny weighted sums with a bend after each one — stacked until they can draw any shape.",
  overview: {
    definition:
      "A **neural network** is many {{neuron|neurons}} wired in layers. Each neuron multiplies its inputs by {{weight|weights}}, adds a {{bias}}, and passes the result through an {{activation|activation function}}. A {{forward-pass|forward pass}} pushes data through to get a prediction; {{backprop|backpropagation}} works out how each weight should change; gradient descent applies the change.",
    analogy:
      "A committee of very simple voters. Each voter weighs a few clues and shouts how strongly they agree. The next row of voters listens to the first row, and so on. Alone each is dumb; together, after practice, they can recognise faces.",
    facts: [
      ["One neuron", "z = w·x + b, then a = activation(z)"],
      ["Notes example", `x = [2, 1, 0], w = [0.5, −0.3, 0.8], b = 0.1 → z = ${f(Z, 1)} → ReLU = ${f(RELU_OUT, 1)}`],
      ["Why activations", "Without a non-linear bend, any stack of layers collapses to one straight-line model"],
      ["Learning", "Loss → {{backprop}} ({{chain-rule|chain rule}}) → w ← w − α·∂L/∂w"],
      ["Losses", "{{mse|MSE}} for numbers, {{bce|binary cross-entropy}} for yes/no"],
      ["“Deep”", "Many hidden layers — each one builds features out of the last layer's features"],
    ],
    whereUsed: "Image recognition, speech, recommendation, and every transformer/LLM — which is a very large neural network.",
  },
  objects: [
    { id: "weights", kind: "matrix", label: "Weights w, b", sub: "[0.5, −0.3, 0.8], 0.1", at: [2.4, -3.2], tone: "amber" },
    { id: "labels", kind: "table", label: "Label y", sub: "target = 1", at: [12, -3.2], tone: "slate" },
    { id: "inputs", kind: "vector", label: "Inputs x", sub: "[2, 1, 0]", at: [0, 0], tone: "blue" },
    { id: "sum", kind: "neuron", label: "Σ w·x + b", sub: "weighted sum z", at: [2.4, 0], tone: "violet" },
    { id: "act", kind: "chart", label: "Activation", sub: "ReLU / sigmoid", at: [4.8, 0], tone: "violet" },
    { id: "hidden", kind: "layer", label: "Hidden layers", sub: "4 → 4 neurons", at: [7.2, 0], tone: "violet" },
    { id: "out", kind: "neuron", label: "Output", sub: "ŷ or p", at: [9.6, 0], tone: "green" },
    { id: "loss", kind: "gauge", label: "Loss", sub: "MSE / BCE", at: [12, 0], tone: "rose" },
    { id: "boundary", kind: "chart", label: "Decision boundary", sub: "line vs curve", at: [0, 3.6], tone: "green" },
    { id: "opt", kind: "gear", label: "Update", sub: "w −= α·∂L/∂w", at: [4.8, 3.6], tone: "amber" },
    { id: "grad", kind: "box", label: "Backprop", sub: "chain rule", at: [9.6, 3.6], tone: "rose" },
  ],
  links: [
    { id: "l-xs", from: "inputs", to: "sum" },
    { id: "l-ws", from: "weights", to: "sum" },
    { id: "l-sa", from: "sum", to: "act" },
    { id: "l-ah", from: "act", to: "hidden" },
    { id: "l-ho", from: "hidden", to: "out" },
    { id: "l-ol", from: "out", to: "loss" },
    { id: "l-yl", from: "labels", to: "loss" },
    { id: "l-lg", from: "loss", to: "grad" },
    { id: "l-go", from: "grad", to: "opt" },
    { id: "l-os", from: "opt", to: "sum", label: "new w" },
  ],
  logTitle: "forward / backward trace",
  logColumns: [
    { key: "stage", label: "Stage", width: "14%" },
    { key: "what", label: "Computation" },
    { key: "value", label: "Value", align: "right", width: "14%" },
    { key: "note", label: "Note" },
  ],
  steps: [
    {
      id: "perceptron",
      title: "One neuron: inputs × weights + bias",
      explain:
        "A {{perceptron}} — one artificial neuron — does something very simple: multiply each input by its {{weight}}, add them up, then add a {{bias}}.\n\nWith the numbers from the notes: 2×0.5 + 1×(−0.3) + 0×0.8 + 0.1 = **0.8**. That single number z says how strongly the neuron is “switched on” before any activation.\n\nA positive weight means “this input pushes the output up”, a negative one pushes it down, and a weight times an input of 0 contributes nothing.",
      analogy: "Deciding whether to go for a run: sunshine counts +0.5 per unit, tiredness counts −0.3, and you have a slight +0.1 urge regardless.",
      highlight: ["inputs", "weights", "sum"],
      packets: [
        { from: "inputs", to: "sum", label: "x = [2, 1, 0]", tone: "blue" },
        { from: "weights", to: "sum", label: "w = [0.5, −0.3, 0.8]", sub: "b = 0.1", tone: "amber" },
      ],
      viz: {
        kind: "table",
        title: "z = Σ xᵢ·wᵢ + b",
        columns: ["i", "xᵢ", "wᵢ", "xᵢ·wᵢ"],
        rows: [...X.map((x, i) => [i + 1, x, W[i], f(PRODUCTS[i], 1)]), ["", "", "+ b", f(B, 1)], ["", "", "z =", f(Z, 1)]],
        highlightRow: 4,
        caption: `${PRODUCTS.map((p) => f(p, 1)).join(" + ")} + ${f(B, 1)} = ${f(Z, 1)}`,
      },
      deeper: {
        math: ["z = w · x + b = Σᵢ wᵢ xᵢ + b", `= (2)(0.5) + (1)(−0.3) + (0)(0.8) + 0.1 = ${f(Z, 2)}`, "The original perceptron (Rosenblatt, 1958) outputs 1 if z > 0, else 0. Modern neurons use smooth activations so they can be trained with gradients."],
        code: {
          lang: "python",
          src: `
import numpy as np
x = np.array([2, 1, 0]); w = np.array([0.5, -0.3, 0.8]); b = 0.1
z = w @ x + b      # 0.8`,
        },
      },
      log: [
        ...X.map((x, i) => ({ tone: "blue" as const, cells: { stage: "multiply", what: `x${i + 1}·w${i + 1} = ${x} × ${W[i]}`, value: f(PRODUCTS[i], 2), note: x === 0 ? "zero input → no effect" : W[i] < 0 ? "negative weight pulls down" : "" } })),
        { tone: "violet", cells: { stage: "sum", what: "Σ + b", value: f(Z, 2), note: "z, the pre-activation" } },
      ],
      interviewTip: "Say the formula out loud and compute an example — it proves you aren't just reciting buzzwords.",
    },
    {
      id: "activations",
      title: "Activation functions: the bend",
      explain:
        "The weighted sum is a straight-line function. If every layer were straight lines, the whole network would still be one straight line — no matter how many layers. The {{activation}} adds a **bend**.\n\n- **{{relu|ReLU}}**: max(0, z). Default for hidden layers: cheap, doesn't saturate for positives.\n- **{{sigmoid|Sigmoid}}**: squashes to 0..1 — good for a yes/no probability at the output.\n- **tanh**: squashes to −1..1, centred on 0.\n- **Leaky ReLU**: like ReLU but lets a small slope through for negatives, so neurons can't get stuck at 0.",
      highlight: ["sum", "act"],
      packets: [{ from: "sum", to: "act", label: `z = ${f(Z, 1)}`, sub: `ReLU → ${f(RELU_OUT, 1)}, sigmoid → ${f(SIG_OUT, 3)}`, tone: "violet" }],
      viz: [
        {
          kind: "plot",
          title: "Four activations",
          series: ACTS.map((a) => ({ label: a.name, points: linspace(-3, 3, 61).map((x) => [x, a.fn(x)] as [number, number]), tone: a.tone })),
          x: [-3, 3],
          y: [-1.2, 2],
          xLabel: "z",
          yLabel: "a(z)",
          markers: [
            { x: Z, y: RELU_OUT, label: `ReLU(${f(Z, 1)}) = ${f(RELU_OUT, 1)}`, tone: "blue" },
            { x: Z, y: SIG_OUT, label: `σ = ${f(SIG_OUT, 2)}`, tone: "green" },
          ],
        },
        {
          kind: "table",
          title: "Same z, different activations",
          columns: ["activation", `a(${f(Z, 1)})`, `a(${f(-Z, 1)})`, "range"],
          rows: [
            ["sigmoid", f(sigmoid(Z), 3), f(sigmoid(-Z), 3), "0 … 1"],
            ["ReLU", f(relu(Z), 3), f(relu(-Z), 3), "0 … ∞"],
            ["tanh", f(tanh(Z), 3), f(tanh(-Z), 3), "−1 … 1"],
            [`leaky ReLU (a=${LEAKY_A})`, f(leakyRelu(Z, LEAKY_A), 3), f(leakyRelu(-Z, LEAKY_A), 3), "−∞ … ∞"],
          ],
          caption: "Common default for leaky ReLU is a = 0.01; 0.1 is used here so the slope is visible.",
        },
      ],
      deeper: {
        math: ["σ(z) = 1 / (1 + e^(−z)),  σ'(z) = σ(z)(1 − σ(z)) ≤ 0.25", "tanh'(z) = 1 − tanh²(z)", "ReLU'(z) = 1 if z > 0 else 0 — no shrinking for positive inputs, which helps deep nets train", "Sigmoid/tanh saturate: for large |z| the slope ≈ 0, so gradients vanish."],
      },
      log: ACTS.map((a) => ({ tone: a.tone, cells: { stage: "activate", what: `${a.name}(${f(Z, 1)})`, value: f(a.fn(Z), 4), note: a.name === "ReLU" ? "notes example: 0.8 → 0.8" : "" } })),
      interviewTip: "Know *why* ReLU replaced sigmoid in hidden layers: sigmoid's slope is at most 0.25, so gradients shrink layer after layer.",
    },
    {
      id: "layers",
      title: "Stack neurons into layers",
      explain:
        "One neuron draws one straight line (then bends it). Put several side by side and you get a **layer**; feed one layer's outputs into the next and you get a **multi-layer network**.\n\nThe first hidden layer learns simple patterns from raw inputs; later layers combine those patterns into more abstract ones. In images: edges → shapes → objects.\n\nHere is a 3 → 4 → 4 → 1 network running a {{forward-pass|forward pass}} on x = [2, 1, 0] (weights are random, the network is untrained).",
      analogy: "A factory line: each station takes the previous station's parts and builds something slightly more complete.",
      highlight: ["inputs", "act", "hidden", "out"],
      packets: [
        { from: "inputs", to: "sum", label: "x = [2, 1, 0]", tone: "blue" },
        { from: "act", to: "hidden", label: `h¹ = ${vec(H1)}`, tone: "violet" },
        { from: "hidden", to: "out", label: `h² = ${vec(H2)}`, tone: "violet" },
      ],
      viz: {
        kind: "nn",
        title: "Forward pass, layer by layer",
        layers: [3, 4, 4, 1],
        layerNames: ["input", "hidden 1 (ReLU)", "hidden 2 (ReLU)", "output (σ)"],
        values: [X, H1, H2, [NET_OUT]],
        activeLayer: 2,
        flow: "forward",
        caption: `${[...H1, ...H2].filter((v) => v === 0).length} of 8 hidden neurons output 0 here: their weighted sum was negative, so ReLU switched them off for this input.`,
      },
      deeper: {
        math: ["h¹ = ReLU(x · W¹ + b¹)", "h² = ReLU(h¹ · W² + b²)", "ŷ = σ(h² · W³ + b³)", `Here: z¹ = ${vec(Z1)} → h¹ = ${vec(H1)}`, `z² = ${vec(Z2)} → h² = ${vec(H2)}`, `z³ = ${f(Z3, 3)} → ŷ = σ(z³) = ${f(NET_OUT, 3)}`, "(Biases are 0 in this toy network.)"],
        code: {
          lang: "python",
          src: `
import torch.nn as nn
net = nn.Sequential(
    nn.Linear(3, 4), nn.ReLU(),
    nn.Linear(4, 4), nn.ReLU(),
    nn.Linear(4, 1), nn.Sigmoid(),
)`,
        },
      },
      log: [
        { tone: "violet", cells: { stage: "layer 1", what: "ReLU(x·W¹)", value: "4 values", note: vec(H1) } },
        { tone: "violet", cells: { stage: "layer 2", what: "ReLU(h¹·W²)", value: "4 values", note: vec(H2) } },
        { tone: "green", cells: { stage: "output", what: "σ(h²·W³)", value: f(NET_OUT, 3), note: "untrained: just a guess" } },
      ],
      interviewTip: "Parameter count of a dense layer = inputs × outputs + outputs (biases). Here: 3·4+4 + 4·4+4 + 4·1+1 = 41.",
    },
    {
      id: "loss",
      title: "How wrong? MSE and binary cross-entropy",
      explain:
        "The {{loss}} scores the prediction against the {{label}}.\n\n- Predicting a **number** (a price, a temperature)? Use {{mse|MSE}}: the ReLU neuron said 0.8, the target is 1.0 → (0.8 − 1.0)² = **0.04**.\n- Predicting **yes/no**? Put a sigmoid on the output to get a probability, and use {{bce|binary cross-entropy}}. Our neuron gives p = σ(0.8) = **0.690** for a true “yes” → loss = −ln 0.690 = **0.371**.\n\nBCE explodes when the model is confidently wrong: p = 0.01 for a true “yes” costs 4.6.",
      highlight: ["out", "loss", "labels"],
      packets: [
        { from: "out", to: "loss", label: `p = σ(${f(Z, 1)}) = ${f(SIG_OUT, 3)}`, tone: "green" },
        { from: "labels", to: "loss", label: "y = 1", tone: "slate" },
      ],
      viz: [
        {
          kind: "plot",
          title: "BCE for a true “yes” vs a true “no”",
          series: [
            { label: "y = 1: −ln p", points: linspace(0.01, 0.99, 60).map((p) => [p, bce(p, 1)] as [number, number]), tone: "rose" },
            { label: "y = 0: −ln(1 − p)", points: linspace(0.01, 0.99, 60).map((p) => [p, bce(p, 0)] as [number, number]), tone: "blue", dashed: true },
          ],
          x: [0, 1],
          y: [0, 4.7],
          xLabel: "predicted p",
          yLabel: "loss",
          markers: [{ x: SIG_OUT, y: BCE_ONE, label: `p=${f(SIG_OUT, 2)}, L=${f(BCE_ONE, 3)}`, tone: "green" }],
        },
        {
          kind: "table",
          title: "Two losses, two jobs",
          columns: ["", "MSE", "BCE"],
          rows: [
            ["Task", "regression (numbers)", "binary classification"],
            ["Output layer", "linear / ReLU", "sigmoid → p"],
            ["Our example", `(${f(RELU_OUT, 1)} − ${f(Y_REG, 1)})² = ${f(MSE_ONE, 3)}`, `−ln ${f(SIG_OUT, 3)} = ${f(BCE_ONE, 3)}`],
          ],
        },
      ],
      deeper: {
        math: ["MSE = (1/n) Σ (ŷ − y)²", "BCE = −[y·ln p + (1 − y)·ln(1 − p)]", `y = 1, p = ${f(SIG_OUT, 4)} → BCE = ${f(BCE_ONE, 4)}`, "Why not MSE on a sigmoid output? The gradient gets multiplied by σ'(z), which is tiny when the neuron saturates — learning stalls exactly when the model is very wrong. BCE cancels that factor (next step)."],
      },
      log: [
        { tone: "rose", cells: { stage: "MSE", what: `(${f(RELU_OUT, 1)} − ${f(Y_REG, 1)})²`, value: f(MSE_ONE, 4), note: "regression view" } },
        { tone: "rose", cells: { stage: "BCE", what: `−ln σ(${f(Z, 1)})`, value: f(BCE_ONE, 4), note: `p = ${f(SIG_OUT, 4)}, y = 1` } },
      ],
    },
    {
      id: "backprop",
      title: "Backprop: blame flows backwards (chain rule)",
      explain:
        "We know the loss. Which weight should change, and by how much? {{backprop|Backpropagation}} answers that by walking **backwards** from the loss, multiplying local slopes along the way — the {{chain-rule|chain rule}}.\n\nFor our sigmoid neuron: loss depends on p, p depends on z, z depends on each weight. Multiply those three slopes and you get each weight's {{gradient}}. Something lovely happens: for sigmoid + BCE, ∂L/∂z is simply **p − y** = 0.690 − 1 = **−0.310**.\n\nBecause z = Σ wᵢxᵢ + b, the gradient for wᵢ is just (p − y)·xᵢ. Input 3 was 0, so w₃ gets **no** blame.",
      analogy: "A group project went badly. You trace back: the report was weak because section 2 was weak because one input was wrong — and you fix in proportion to how much each part contributed.",
      highlight: ["loss", "grad", "out", "sum"],
      packets: [
        { from: "loss", to: "grad", label: `∂L/∂z = p − y = ${f(dL_dz, 3)}`, tone: "rose" },
        { from: "grad", to: "opt", label: `∂L/∂w = ${vec(GRAD_W, 3)}`, sub: `∂L/∂b = ${f(GRAD_B, 3)}`, tone: "rose" },
      ],
      viz: [
        {
          kind: "table",
          title: "Chain rule, link by link",
          columns: ["link", "formula", "value"],
          rows: [
            ["∂L/∂p", "−y/p + (1−y)/(1−p)", f(dL_dp, 4)],
            ["∂p/∂z", "p(1 − p)", f(dp_dz, 4)],
            ["∂L/∂z", "product = p − y", f(dL_dz, 4)],
            ...X.map((x, i) => [`∂L/∂w${i + 1}`, `(p − y) · x${i + 1} = ${f(dL_dz, 3)} × ${x}`, f(GRAD_W[i], 4)]),
            ["∂L/∂b", "(p − y) · 1", f(GRAD_B, 4)],
          ],
        },
        {
          kind: "nn",
          title: "Gradients flow output → input",
          layers: [3, 1, 1],
          layerNames: ["x", "z", "loss"],
          values: [GRAD_W, [dL_dz], [BCE_ONE]],
          activeLayer: 0,
          flow: "backward",
          caption: "Numbers on the inputs are each weight's gradient. Negative = increasing that weight would lower the loss.",
        },
      ],
      deeper: {
        math: [
          "∂L/∂wᵢ = ∂L/∂p · ∂p/∂z · ∂z/∂wᵢ",
          `= (${f(dL_dp, 4)}) × (${f(dp_dz, 4)}) × xᵢ = ${f(dL_dz, 4)} · xᵢ`,
          `Numerical check on w₁: [L(w₁+h) − L(w₁−h)] / 2h = ${f(NUM_GRAD_W0, 4)}  ✓ matches ${f(GRAD_W[0], 4)}`,
          "In a deep net the same rule repeats layer by layer; frameworks (PyTorch, JAX) do it automatically — that is autograd.",
        ],
        code: {
          lang: "python",
          src: `
import torch
x = torch.tensor([2., 1., 0.])
w = torch.tensor([0.5, -0.3, 0.8], requires_grad=True)
b = torch.tensor(0.1, requires_grad=True)
p = torch.sigmoid(w @ x + b)
loss = -torch.log(p)          # BCE with y = 1
loss.backward()
print(w.grad)                 # tensor([-0.6201, -0.3100, 0.0000])`,
        },
      },
      log: [
        { tone: "rose", cells: { stage: "backward", what: "∂L/∂z = p − y", value: f(dL_dz, 4), note: "sigmoid + BCE simplifies" } },
        ...X.map((x, i) => ({ tone: "rose" as const, cells: { stage: "backward", what: `∂L/∂w${i + 1} = (p − y)·${x}`, value: f(GRAD_W[i], 4), note: x === 0 ? "input was 0 → no blame" : "" } })),
        { tone: "rose", cells: { stage: "backward", what: "∂L/∂b", value: f(GRAD_B, 4), note: "" } },
      ],
      interviewTip: "Backprop computes gradients; gradient descent uses them. Interviewers check you don't conflate the two.",
    },
    {
      id: "update",
      title: "Update: w ← w − α · ∂L/∂w",
      explain:
        "Now nudge every weight a little in the downhill direction, scaled by the {{learning-rate|learning rate}} α = 0.5:\n\nw₁ = 0.5 − 0.5 × (−0.620) = **0.810**, w₂ = −0.3 − 0.5 × (−0.310) = **−0.145**, w₃ stays **0.8**, b = 0.1 − 0.5 × (−0.310) = **0.255**.\n\nRun the neuron again: z jumps from 0.80 to 1.73, p from 0.690 to 0.849, and the loss falls from 0.371 to **0.163**. Repeat, and it keeps falling — that is training.",
      highlight: ["grad", "opt", "weights", "sum"],
      packets: [
        { from: "grad", to: "opt", label: `α = ${ALPHA}`, tone: "amber" },
        { from: "opt", to: "sum", label: `w = ${vec(AFTER.w, 3)}`, sub: `b = ${f(AFTER.b, 3)}`, tone: "amber" },
        { from: "sum", to: "act", label: `z = ${f(AFTER.z, 3)} → p = ${f(AFTER.p, 3)}`, tone: "green" },
      ],
      viz: [
        {
          kind: "plot",
          title: "Loss over 6 updates",
          series: [{ label: "BCE", points: ITERS.map((it) => [it.it, it.loss] as [number, number]), tone: "rose" }],
          x: [0, 6],
          y: [0, 0.4],
          xLabel: "update",
          yLabel: "loss",
          markers: ITERS.map((it) => ({ x: it.it, y: it.loss, tone: "rose" as const })),
        },
        {
          kind: "table",
          title: "Weights after each update",
          columns: ["step", "w", "b", "p", "loss"],
          rows: ITERS.slice(0, 4).map((it) => [it.it, vec(it.w, 3), f(it.b, 3), f(it.p, 3), f(it.loss, 3)]),
          highlightRow: 1,
        },
      ],
      deeper: {
        math: ["wᵢ ← wᵢ − α · ∂L/∂wᵢ,   b ← b − α · ∂L/∂b", `w₁: ${f(W[0], 3)} − ${ALPHA} × (${f(GRAD_W[0], 3)}) = ${f(AFTER.w[0], 3)}`, `w₂: ${f(W[1], 3)} − ${ALPHA} × (${f(GRAD_W[1], 3)}) = ${f(AFTER.w[1], 3)}`, `b:  ${f(B, 3)} − ${ALPHA} × (${f(GRAD_B, 3)}) = ${f(AFTER.b, 3)}`, "Real training uses mini-batches and optimisers like Adam (adaptive per-weight step sizes), but the core move is this."],
        code: {
          lang: "python",
          src: `
opt = torch.optim.SGD([w, b], lr=0.5)
for step in range(6):
    opt.zero_grad()
    loss = -torch.log(torch.sigmoid(w @ x + b))
    loss.backward()
    opt.step()`,
        },
      },
      log: ITERS.map((it) => ({ tone: (it.it === 0 ? "rose" : "green") as "rose" | "green", cells: { stage: `update ${it.it}`, what: `z = ${f(it.z, 3)}, p = ${f(it.p, 3)}`, value: f(it.loss, 4), note: `w = ${vec(it.w, 3)}, b = ${f(it.b, 3)}` } })),
    },
    {
      id: "deep",
      title: "Why deep networks work: curved boundaries",
      explain:
        "Here the “yes” points (green) sit inside a ring of “no” points (blue). A single neuron can only draw a **straight** {{decision-boundary|decision boundary}}, so it can't separate them — even fully trained it gets stuck well short of 100% (scores below).\n\nAdd one hidden layer of 6 tanh neurons and train the whole thing with backprop: each hidden neuron draws its own straight line, and the output neuron combines those lines into a **closed curve**. Accuracy jumps to 100% on this data.\n\nMore layers = more ways to fold and combine — that's why depth lets networks fit complicated shapes like faces or speech.",
      analogy: "One straight fence can't pen in a sheep in the middle of a field. Six fences joined together can.",
      highlight: ["hidden", "out", "boundary"],
      packets: [
        { from: "hidden", to: "boundary", label: "6 lines → 1 curve", tone: "green" },
        { from: "out", to: "loss", label: `BCE ${f(MLP.finalLoss, 3)}`, sub: `acc ${(MLP.acc * 100).toFixed(0)}%`, tone: "green" },
      ],
      viz: [
        {
          kind: "scatter",
          title: "Learned boundary (2 → 6 → 1 network)",
          points: RING.map((p) => ({ x: p.x, y: p.y, tone: p.c ? ("green" as const) : ("blue" as const) })),
          boundary: MLP.boundary,
          x: [-2.2, 2.2],
          y: [-2.2, 2.2],
          caption: "Dashed curve = where the network's output crosses 50%. Traced from the trained weights.",
        },
        {
          kind: "scatter",
          title: "Best straight line (single neuron)",
          points: RING.map((p) => ({ x: p.x, y: p.y, tone: p.c ? ("green" as const) : ("blue" as const) })),
          boundary: LIN_LINE,
          x: [-2.2, 2.2],
          y: [-2.2, 2.2],
          caption: `Logistic regression, also trained with gradient descent: ${(LIN.acc * 100).toFixed(0)}% accuracy.`,
        },
        {
          kind: "table",
          title: "Same data, same training loop",
          columns: ["model", "boundary", "accuracy"],
          rows: [
            ["1 neuron (logistic regression)", "straight line", `${(LIN.acc * 100).toFixed(0)}%`],
            ["2 → 6 → 1 network", "curve", `${(MLP.acc * 100).toFixed(0)}%`],
          ],
          highlightRow: 1,
        },
      ],
      deeper: {
        math: [
          "Universal approximation: one hidden layer with enough neurons can approximate any continuous function on a bounded region — but it may need a huge width.",
          "Depth is more efficient: many functions need exponentially fewer neurons when built from several layers.",
          "Without activations: W₂(W₁x) = (W₂W₁)x — still one linear map, still one straight line.",
          `Training loss: ${MLP.lossLog.filter((_, i) => i % 6 === 0).map(([it, l]) => `it ${it}: ${f(l, 3)}`).join(" · ")}`,
        ],
      },
      log: [
        { tone: "blue", cells: { stage: "linear", what: "1 neuron, straight boundary", value: `${(LIN.acc * 100).toFixed(0)}%`, note: "can't enclose the inner points" } },
        ...MLP.lossLog.filter((_, i) => i % 10 === 0).map(([it, l]) => ({ tone: "green" as const, cells: { stage: "train MLP", what: `iteration ${it}`, value: f(l, 4), note: "BCE" } })),
        { tone: "green", cells: { stage: "MLP", what: "2 → 6 → 1, tanh hidden", value: `${(MLP.acc * 100).toFixed(0)}%`, note: "closed curve boundary" } },
      ],
      interviewTip: "If asked “why not just one huge layer?”, mention universal approximation *and* that depth is far more parameter-efficient in practice.",
    },
  ],
  interview: [
    {
      id: "nn-1",
      level: "fresher",
      q: "What does a single artificial neuron compute?",
      answer: "A weighted sum of its inputs plus a bias, z = w·x + b, passed through an activation function a = g(z). For x = [2, 1, 0], w = [0.5, −0.3, 0.8], b = 0.1: z = 0.8, and ReLU(0.8) = 0.8.",
      lookFor: "The formula, the role of the bias, and the activation — ideally with a quick worked number.",
      wrong: "“A neuron stores a piece of the training data.” It stores weights, not examples.",
    },
    {
      id: "nn-2",
      level: "fresher",
      q: "Why do neural networks need non-linear activation functions?",
      answer: "Because a composition of linear layers is itself linear: W₂(W₁x) = (W₂W₁)x. Without non-linearities a deep network is no more expressive than a single linear model and can only draw straight decision boundaries. Activations like ReLU let layers bend and combine features into complex functions.",
      lookFor: "The collapse-to-linear argument.",
      wrong: "“Activations make training faster.” Some help optimisation, but the core reason is expressiveness.",
    },
    {
      id: "nn-3",
      level: "fresher",
      q: "Compare sigmoid, tanh and ReLU.",
      answer: "Sigmoid maps to (0, 1) — useful for probabilities at an output, but saturates and its derivative is at most 0.25, so gradients vanish in deep stacks. Tanh maps to (−1, 1), zero-centred, still saturates. ReLU = max(0, z): cheap, gradient 1 for positive inputs, the default for hidden layers; downside is “dead” units stuck at 0, which leaky ReLU / GELU variants address.",
      lookFor: "Ranges, saturation / vanishing gradients, and which one to use where.",
      wrong: "“ReLU is not differentiable so it can't be used with backprop.” It is non-differentiable only at 0; frameworks use a subgradient there.",
    },
    {
      id: "nn-4",
      level: "fresher",
      q: "What is a forward pass and what is a backward pass?",
      answer: "The forward pass feeds inputs through the layers to produce a prediction and a loss. The backward pass (backpropagation) applies the chain rule from the loss back through each layer to get the gradient of the loss with respect to every parameter. An optimiser then updates the parameters with those gradients.",
      lookFor: "Clear separation of prediction, gradient computation and update.",
      wrong: "“The backward pass runs the network in reverse to reconstruct the input.”",
    },
    {
      id: "nn-5",
      level: "mid",
      q: "Explain backpropagation using the chain rule.",
      answer: "The loss depends on the output, which depends on pre-activations, which depend on weights. The chain rule multiplies local derivatives along that path: ∂L/∂w = ∂L/∂a · ∂a/∂z · ∂z/∂w. Backprop computes these from the output layer backwards, reusing each layer's upstream gradient so the full gradient costs about as much as a couple of forward passes. For sigmoid + BCE, ∂L/∂z simplifies to p − y.",
      lookFor: "Local derivatives multiplied along the path, reuse of upstream gradients (efficiency), and a concrete simplification.",
      wrong: "“Backprop tries random weight changes and keeps the ones that help.”",
    },
    {
      id: "nn-6",
      level: "mid",
      q: "When would you use MSE vs binary cross-entropy vs categorical cross-entropy?",
      answer: "MSE for regression of continuous targets. Binary cross-entropy with a sigmoid output for two-class or multi-label problems (each label independent). Categorical cross-entropy with a softmax output for mutually exclusive classes. Cross-entropy pairs with sigmoid/softmax so the output gradient is simply p − y, avoiding the slow learning MSE causes on saturated sigmoids.",
      lookFor: "Matching loss to output activation and task, and the gradient reason.",
      wrong: "“Use MSE for everything; it's simpler.”",
    },
    {
      id: "nn-7",
      level: "mid",
      q: "What are vanishing and exploding gradients, and how are they mitigated?",
      answer: "Backprop multiplies many per-layer factors; if they are mostly < 1 the gradient shrinks toward zero in early layers (vanishing), if > 1 it blows up (exploding). Mitigations: ReLU-family activations, careful initialisation (Xavier/Glorot, He), normalisation layers (BatchNorm, LayerNorm), residual connections, gradient clipping for explosions, and gated architectures (LSTM) for recurrent nets.",
      lookFor: "The multiplicative cause and several concrete fixes.",
      wrong: "“Use a bigger learning rate to fix vanishing gradients.” That tends to destabilise the layers whose gradients are fine.",
    },
    {
      id: "nn-8",
      level: "mid",
      q: "Why initialise weights randomly instead of with zeros?",
      answer: "If all weights in a layer start equal, every neuron computes the same output and receives the same gradient, so they stay identical forever (the symmetry problem). Small random values break that symmetry. Scale matters too: schemes like Xavier/Glorot or He set the variance by layer width so activations and gradients neither shrink nor grow through depth.",
      lookFor: "Symmetry breaking plus variance-aware initialisation.",
      wrong: "“Zero init is fine because training will fix it.”",
    },
    {
      id: "nn-9",
      level: "senior",
      q: "How many parameters does a dense layer with 512 inputs and 256 outputs have, and why does that matter?",
      answer: "512 × 256 weights + 256 biases = 131,328. Parameter count drives memory (weights, gradients and optimiser state — Adam keeps two extra values per parameter), compute per forward pass, and overfitting risk relative to dataset size. You estimate it to size GPUs and batch sizes before training.",
      lookFor: "Correct arithmetic including biases, and the link to memory/optimiser state.",
      wrong: "Forgetting biases, or assuming memory = parameters × 4 bytes only (ignoring gradients and optimiser state during training).",
    },
    {
      id: "nn-10",
      level: "senior",
      q: "Why do deep networks generalise when they have more parameters than training examples?",
      answer: "Classical theory says they should overfit, yet in practice they often generalise well. Contributing factors: implicit regularisation from SGD (it tends to find flatter solutions), architectural priors (convolutions, attention, weight sharing), explicit regularisation (weight decay, dropout, data augmentation), and early stopping. Generalisation is still judged empirically on held-out data; it is an active research area, so avoid claiming one definitive cause.",
      lookFor: "Awareness of the puzzle, several plausible mechanisms, and honesty that it's not fully settled.",
      wrong: "“More parameters always means better generalisation.”",
    },
    {
      id: "nn-11",
      level: "senior",
      q: "Your training loss is NaN after a few hundred steps. How do you debug it?",
      answer: "Check for exploding gradients (log gradient norms; add clipping), a learning rate that is too high (lower it or add warm-up), numerically unstable ops (log(0) in a hand-written BCE — use the framework's combined logits loss; division by zero in normalisation; mixed-precision overflow — use loss scaling or bf16), and bad inputs (NaN/inf in data, unnormalised features). Reproduce on a tiny batch and overfit it to confirm the pipeline works.",
      lookFor: "Systematic checks: gradients, LR, numerics, data; and the overfit-one-batch sanity test.",
      wrong: "“Restart with a different random seed.”",
    },
    {
      id: "nn-12",
      level: "senior",
      design: true,
      q: "You have 50,000 labelled product images in 20 categories and a small GPU budget. How do you build the classifier?",
      answer: "Don't train from scratch: fine-tune a pretrained vision backbone (a CNN or ViT pretrained on a large dataset), or first try a linear classifier on frozen embeddings as a fast baseline. Use stratified train/val/test splits, data augmentation (crops, flips, colour jitter), softmax + categorical cross-entropy, and track per-class precision/recall — not just accuracy — because classes may be imbalanced. Use early stopping on validation loss, mixed precision to fit the GPU, then error analysis on the confusion matrix to decide whether to collect more data for weak classes.",
      lookFor: "Transfer learning first, a cheap baseline, sensible splits/augmentation, the right loss, per-class metrics and an iteration plan.",
      wrong: "“Design a 50-layer network from scratch and train it for many epochs.”",
    },
  ],
  quiz: [
    {
      id: "nnq-1",
      q: "x = [2, 1, 0], w = [0.5, −0.3, 0.8], b = 0.1. What is z = w·x + b?",
      options: [f(Z - B, 1), f(Z, 1), f(dot(X, W.map(Math.abs)) + B, 1), f(Z + 0.8, 1)],
      correct: 1,
      explain: `2(0.5) + 1(−0.3) + 0(0.8) + 0.1 = ${f(Z, 1)}. Forgetting the bias gives ${f(Z - B, 1)}.`,
    },
    {
      id: "nnq-2",
      q: "Which activation is the usual default for hidden layers?",
      options: ["Sigmoid", "ReLU (or a variant)", "Step function", "Softmax"],
      correct: 1,
      explain: "ReLU-family activations are cheap and don't saturate for positive inputs, so gradients flow through deep stacks. Softmax is for output layers over classes.",
    },
    {
      id: "nnq-3",
      q: `For a sigmoid output with BCE, p = ${f(SIG_OUT, 3)} and y = 1. What is ∂L/∂z?`,
      options: [f(SIG_OUT, 3), f(dL_dz, 3), f(dp_dz, 3), f(BCE_ONE, 3)],
      correct: 1,
      explain: `It simplifies to p − y = ${f(SIG_OUT, 3)} − 1 = ${f(dL_dz, 3)}. The other options are p, σ'(z) and the loss itself.`,
    },
    {
      id: "nnq-4",
      q: `With ∂L/∂w₁ = ${f(GRAD_W[0], 3)}, w₁ = 0.5 and α = ${ALPHA}, what is the new w₁?`,
      options: [f(W[0] + ALPHA * GRAD_W[0], 3), f(AFTER.w[0], 3), f(W[0] - GRAD_W[0], 3), f(W[0] * ALPHA, 3)],
      correct: 1,
      explain: `w₁ − α·∂L/∂w₁ = 0.5 − ${ALPHA} × (${f(GRAD_W[0], 3)}) = ${f(AFTER.w[0], 3)}. A negative gradient means increasing w₁ lowers the loss.`,
    },
    {
      id: "nnq-5",
      q: "Why can a single neuron not separate the ring data in the last step?",
      options: ["It has too few training examples", "Its decision boundary is a straight line", "Its learning rate is too low", "Sigmoid can't output probabilities"],
      correct: 1,
      explain: "A single neuron's p = 0.5 boundary is w·x + b = 0 — a straight line. Enclosing a cluster needs a curve, which a hidden layer provides.",
    },
    {
      id: "nnq-6",
      q: "What happens if you remove every activation function from a 10-layer network?",
      options: ["It becomes a much stronger model", "It collapses to one linear model", "It can no longer be trained", "It becomes a decision tree"],
      correct: 1,
      explain: "Composing linear maps gives a linear map, so all 10 layers equal one matrix multiply (plus a bias).",
    },
  ],
};

export default scenario;
