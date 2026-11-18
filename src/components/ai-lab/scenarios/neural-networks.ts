import type { Scenario } from "../engine/types";
import { bce, dot, f, gaussian, leakyRelu, linspace, relu, seeded, sigmoid, tanh, vec } from "../engine/math";

/* ------------------------------------------------------------------ *
 * One house, one neuron, then a small network that learns its price.
 *
 * Steps 1–3 zoom into one neuron with the study-notes numbers:
 *   x = [2, 1, 0] (size, floors, pool), w = [0.5, −0.3, 0.8], b = 0.1 → 0.8.
 * Steps 4–9 use a 3 → 3 → 1 network whose neuron A *is* that neuron,
 * with real backprop (squared error) and real updates, all computed here.
 * Step 10 trains a single neuron and a 2 → 6 → 1 network on ring data.
 * ------------------------------------------------------------------ */

// ---------- one neuron ----------
const X = [2, 1, 0];
const INPUT_NAMES = ["size", "floors", "pool"];
const W = [0.5, -0.3, 0.8];
const B = 0.1;
const PRODUCTS = X.map((x, i) => x * W[i]);
const Z = dot(X, W) + B; // 1.0 − 0.3 + 0 + 0.1 = 0.8
const RELU_OUT = relu(Z);
const SIG_OUT = sigmoid(Z);
const BLOCKED = -0.5;
const LEAKY_A = 0.1;

// ---------- the house network: 3 inputs → 3 hidden (ReLU) → 1 output (price, no activation) ----------
type Net = { W1: number[][]; B1: number[]; V: number[]; c: number };
/** W1[i][j]: input i → hidden neuron j. Column 0 is the neuron from steps 1–3. */
const NET0: Net = {
  W1: [
    [W[0], -0.4, 0.3],
    [W[1], 0.2, 0.4],
    [W[2], 0.5, -0.2],
  ],
  B1: [B, 0.1, 0],
  V: [0.6, 0.5, 0.2],
  c: 0,
};
const HIDDEN = ["neuron A", "neuron B", "neuron C"];
const PRICE = 1.0;
const ALPHA = 0.05;

function forward(n: Net, x: number[]) {
  const z = n.B1.map((b, j) => x.reduce((s, xi, i) => s + xi * n.W1[i][j], b));
  const h = z.map(relu);
  const y = h.reduce((s, hj, j) => s + hj * n.V[j], n.c);
  return { z, h, y };
}

/** Backprop for squared error L = (ŷ − y)². Returns every gradient. */
function backward(n: Net, x: number[], target: number) {
  const fw = forward(n, x);
  const dy = 2 * (fw.y - target); // ∂L/∂ŷ
  const dV = fw.h.map((h) => dy * h); // ∂L/∂vⱼ = ∂L/∂ŷ · hⱼ
  const dh = n.V.map((v) => dy * v); // ∂L/∂hⱼ = ∂L/∂ŷ · vⱼ
  const dz = dh.map((d, j) => (fw.z[j] > 0 ? d : 0)); // ReLU passes the gradient only if it fired
  const dW1 = x.map((xi) => dz.map((d) => xi * d)); // ∂L/∂wᵢⱼ = xᵢ · ∂L/∂zⱼ
  return { fw, dy, dV, dc: dy, dh, dz, dW1, dB1: dz };
}

type Grads = ReturnType<typeof backward>;
const applyStep = (n: Net, g: Pick<Grads, "dW1" | "dB1" | "dV" | "dc">, a: number): Net => ({
  W1: n.W1.map((r, i) => r.map((w, j) => w - a * g.dW1[i][j])),
  B1: n.B1.map((b, j) => b - a * g.dB1[j]),
  V: n.V.map((v, j) => v - a * g.dV[j]),
  c: n.c - a * g.dc,
});

const F0 = forward(NET0, X); // z = [0.8, −0.5, 1.0], h = [0.8, 0, 1.0], ŷ = 0.68
const LOSS0 = (F0.y - PRICE) ** 2;
const G0 = backward(NET0, X, PRICE);
const NET1 = applyStep(NET0, G0, ALPHA);
const F1 = forward(NET1, X);
const LOSS1 = (F1.y - PRICE) ** 2;
const asStage = (n: Net) => [n.W1, n.V.map((v) => [v])];
const PARAMS = 3 * 3 + 3 + 3 * 1 + 1;

/** The biggest weight changes, for the trace and the panel. */
const CHANGES = [
  ...NET0.W1.flatMap((r, i) => r.map((w, j) => ({ name: `${INPUT_NAMES[i]} → ${HIDDEN[j]}`, from: w, to: NET1.W1[i][j] }))),
  ...NET0.V.map((v, j) => ({ name: `${HIDDEN[j]} → price`, from: v, to: NET1.V[j] })),
].sort((a, b) => Math.abs(b.to - b.from) - Math.abs(a.to - a.from));

// ---------- training on a few houses ----------
const HOUSES = [
  { x: [2, 1, 0], y: PRICE },
  { x: [1, 1, 0], y: 0.65 },
  { x: [3, 2, 1], y: 1.8 },
  { x: [1, 2, 1], y: 1.1 },
  { x: [2, 2, 0], y: 1.2 },
  { x: [3, 1, 0], y: 1.35 },
];
const ROUNDS = 60;
const TRAIN = (() => {
  let n = NET0;
  const losses: [number, number][] = [];
  const avgLoss = (net: Net) => HOUSES.reduce((s, h) => s + (forward(net, h.x).y - h.y) ** 2, 0) / HOUSES.length;
  for (let r = 0; r <= ROUNDS; r++) {
    losses.push([r, avgLoss(n)]);
    if (r === ROUNDS) break;
    const acc = { dW1: n.W1.map((row) => row.map(() => 0)), dB1: [0, 0, 0], dV: [0, 0, 0], dc: 0 };
    for (const h of HOUSES) {
      const g = backward(n, h.x, h.y);
      g.dW1.forEach((row, i) => row.forEach((d, j) => (acc.dW1[i][j] += d / HOUSES.length)));
      g.dB1.forEach((d, j) => (acc.dB1[j] += d / HOUSES.length));
      g.dV.forEach((d, j) => (acc.dV[j] += d / HOUSES.length));
      acc.dc += g.dc / HOUSES.length;
    }
    n = applyStep(n, acc, ALPHA);
  }
  return { net: n, losses, first: losses[0][1], last: losses[losses.length - 1][1] };
})();

// ---------- why depth helps: ring data no straight line can separate ----------
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

// ---------- the stage pieces shared by several steps ----------
const neuronInputs = X.map((value, i) => ({ label: INPUT_NAMES[i], value }));
const inputNodes = X.map((value, i) => ({ label: INPUT_NAMES[i], value }));
const layersAt = (fw: ReturnType<typeof forward>) => [
  { title: "inputs", nodes: inputNodes },
  { title: "hidden layer", nodes: fw.h.map((v, j) => ({ label: HIDDEN[j], value: v })) },
  { title: "output", nodes: [{ label: "price guess", value: fw.y }] },
];
const sign = (v: number) => (v < 0 ? `− ${f(-v, 2)}` : `+ ${f(v, 2)}`);
const pct = (v: number) => `${(v * 100).toFixed(0)}%`;
/** f() with a real minus sign, for prose. */
const mf = (v: number, dp = 2) => f(v, dp).replace(/^-/, "−");

const scenario: Scenario = {
  id: "neural-networks",
  title: "Neural networks & deep learning",
  tagline: "Tiny weighted sums with a switch after each one, stacked until they can learn almost any pattern.",
  imagine:
    "Imagine guessing a house's price. You look at a few clues: how big it is, how many floors, whether it has a pool. Some clues matter more than others. A neural network does exactly that with numbers, and every time it hears the real price it adjusts itself to guess a little better.",
  recap: [
    "A **neuron** multiplies each input by a weight, adds them up with a bias, and passes the total on only if it is above zero.",
    "A **network** is rows of neurons. The forward pass sends the inputs through them to make a guess.",
    "**Training** repeats: measure how wrong (loss), share the blame backwards (backprop), nudge every weight a little.",
  ],
  overview: {
    plain:
      "A neural network is many tiny calculators, called neurons, wired together in rows. Each one multiplies a few numbers by how much they matter, adds them up, and decides whether to pass the result on. It learns by comparing its guesses with the right answers and adjusting itself a little each time.",
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
      ["Parameters", `This lab's 3 → 3 → 1 network: 3·3 + 3 + 3·1 + 1 = ${PARAMS}. A dense layer has inputs × outputs + outputs.`],
      ["“Deep”", "Many hidden layers — each one builds features out of the last layer's features"],
    ],
    whereUsed: "Image recognition, speech, recommendation, and every transformer/LLM — which is a very large neural network.",
  },
  objects: [
    { id: "weights", kind: "matrix", label: "Weights w, b", sub: "how much each input matters", at: [2.4, -3.2], tone: "amber" },
    { id: "labels", kind: "table", label: "Real price", sub: `target = ${f(PRICE, 1)}`, at: [12, -3.2], tone: "slate" },
    { id: "inputs", kind: "vector", label: "Inputs x", sub: "size 2, floors 1, pool 0", at: [0, 0], tone: "blue" },
    { id: "sum", kind: "neuron", label: "Σ w·x + b", sub: "weighted sum z", at: [2.4, 0], tone: "violet" },
    { id: "act", kind: "chart", label: "Activation", sub: "ReLU gate", at: [4.8, 0], tone: "violet" },
    { id: "hidden", kind: "layer", label: "Hidden layer", sub: "3 neurons", at: [7.2, 0], tone: "violet" },
    { id: "out", kind: "neuron", label: "Output", sub: "price guess ŷ", at: [9.6, 0], tone: "green" },
    { id: "loss", kind: "gauge", label: "Loss", sub: "(ŷ − y)²", at: [12, 0], tone: "rose" },
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
    // 1 ─────────────────────────────────────────────────────────────
    {
      id: "neuron",
      title: "Meet one neuron",
      simple: "A neuron takes a few numbers and gives each one a weight: how much that number matters.",
      explain:
        "This neuron judges a house from three numbers: **size 2**, **floors 1**, **pool 0** (no pool). Each line is a {{weight}} (how much that input matters). A thick line matters a lot; blue pushes the answer up, red pushes it down. The neuron multiplies each input by its weight: 2 × 0.5 = **1.0**.",
      analogy: "Deciding if a house is worth it: size counts a lot in its favour, more floors count a little against (stairs!), and a pool would count in its favour if there were one.",
      detail:
        "A single artificial neuron is also called a {{perceptron}}. It computes a weighted sum **z = Σ wᵢxᵢ + b**. A positive weight means the input pushes the output up, a negative one pushes it down, and an input of 0 contributes nothing, whatever its weight.\n\nThe weights are {{parameter|parameters}}: numbers the network learns. Nobody types them in; training finds them.",
      stage: { kind: "neuron", inputs: neuronInputs, weights: W, bias: B, activation: "relu", phase: "inputs", outputLabel: "fires?" },
      highlight: ["inputs", "weights", "sum"],
      packets: [
        { from: "inputs", to: "sum", label: "x = [2, 1, 0]", tone: "blue" },
        { from: "weights", to: "sum", label: "w = [0.5, −0.3, 0.8]", sub: "b = 0.1", tone: "amber" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: "Each input × its weight",
        columns: ["input", "x", "w", "x · w"],
        rows: X.map((x, i) => [INPUT_NAMES[i], x, W[i], f(PRODUCTS[i], 1)]),
        caption: "Pool is 0, so its weight of 0.8 adds nothing for this house.",
      },
      deeper: {
        math: ["z = w · x + b = Σᵢ wᵢ xᵢ + b", `products: ${PRODUCTS.map((p) => f(p, 1)).join(", ")}`, "The original perceptron (Rosenblatt, 1958) outputs 1 if z > 0, else 0. Modern neurons use smooth or piecewise activations so they can be trained with gradients."],
        code: {
          lang: "python",
          src: `
import numpy as np
x = np.array([2, 1, 0])          # size, floors, pool
w = np.array([0.5, -0.3, 0.8])
print(x * w)                     # [ 1.  -0.3  0. ]`,
        },
      },
      log: X.map((x, i) => ({
        tone: "blue" as const,
        cells: { stage: "multiply", what: `${INPUT_NAMES[i]}: ${x} × ${W[i]}`, value: f(PRODUCTS[i], 2), note: x === 0 ? "input 0 → no effect" : W[i] < 0 ? "negative weight pulls down" : "positive weight pushes up" },
      })),
      interviewTip: "Say the formula out loud and compute an example — it proves you aren't just reciting buzzwords.",
    },
    // 2 ─────────────────────────────────────────────────────────────
    {
      id: "sum",
      title: "Add it all up, plus a bias",
      simple: "The neuron adds the results together, plus one small extra number called the bias.",
      explain: `1.0 − 0.3 + 0 = **0.7**. Then it adds the {{bias}} (a fixed nudge that is there whatever the inputs), **0.1**, to get a total of **${f(Z, 1)}**. The circle fills up to show how big the total is.`,
      analogy: "The bias is your mood before you even see the house: a slight lean towards yes, whatever the clues say.",
      detail:
        "The total **z** is called the pre-activation. The bias lets a neuron fire even when every input is 0, or stay quiet until the evidence is strong. Without it, the neuron's line would always have to pass through the origin.",
      stage: { kind: "neuron", inputs: neuronInputs, weights: W, bias: B, activation: "relu", phase: "sum", outputLabel: "fires?" },
      highlight: ["sum", "weights"],
      packets: [{ from: "weights", to: "sum", label: "+ b = 0.1", tone: "amber" }],
      viz: {
        only: "interview",
        kind: "table",
        title: "z = Σ xᵢ·wᵢ + b",
        columns: ["i", "xᵢ", "wᵢ", "xᵢ·wᵢ"],
        rows: [...X.map((x, i) => [i + 1, x, W[i], f(PRODUCTS[i], 1)]), ["", "", "+ b", f(B, 1)], ["", "", "z =", f(Z, 1)]],
        highlightRow: 4,
        caption: `${PRODUCTS.map((p) => f(p, 1)).join(" + ")} + ${f(B, 1)} = ${f(Z, 1)}`,
      },
      deeper: {
        math: [`z = (2)(0.5) + (1)(−0.3) + (0)(0.8) + 0.1 = ${f(Z, 2)}`, "In matrix form for a whole layer: z = W·x + b, one row of W per neuron."],
        code: { lang: "python", src: `z = w @ x + b      # ${f(Z, 1)}` },
      },
      log: [{ tone: "violet", cells: { stage: "sum", what: "Σ x·w + b", value: f(Z, 2), note: "z, the total before the gate" } }],
      interviewTip: "If asked what the bias is for: it shifts the activation threshold, so the neuron can fire (or not) independently of the inputs.",
    },
    // 3 ─────────────────────────────────────────────────────────────
    {
      id: "gate",
      title: "The gate: fire or stay quiet",
      simple: "If the total is above zero the neuron fires and passes it on; if not, it stays quiet and sends 0.",
      explain: `That switch is the {{activation}} (a rule applied after the sum). The most common one, {{relu|ReLU}}, lets positive totals through unchanged and turns negative ones into 0. Our ${f(Z, 1)} passes, so the neuron lights up. A total of ${mf(BLOCKED, 1)} would come out as 0.`,
      analogy: "A doorbell that only rings if you press hard enough. A light press does nothing at all.",
      detail:
        "Without a non-linear activation, stacking layers is pointless: W₂(W₁x) = (W₂W₁)x is still one straight-line model. The bend is what lets networks learn curves.\n\n- **{{relu|ReLU}}** = max(0, z): cheap, the default in hidden layers, gradient 1 for positives.\n- **{{sigmoid|Sigmoid}}** squashes to 0..1: good for a yes/no probability at the output, but its slope is at most 0.25, so gradients fade in deep stacks.\n- **tanh** squashes to −1..1, centred on 0.\n- **Leaky ReLU** lets a small slope through for negatives so a neuron can't get stuck at 0 (a {{dead-relu|dead ReLU}}).",
      stage: { kind: "neuron", inputs: neuronInputs, weights: W, bias: B, activation: "relu", phase: "activate", outputLabel: "passed on", blockedExample: BLOCKED },
      highlight: ["sum", "act"],
      packets: [{ from: "sum", to: "act", label: `z = ${f(Z, 1)}`, sub: `ReLU → ${f(RELU_OUT, 1)}`, tone: "violet" }],
      viz: [
        {
          only: "interview",
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
          only: "interview",
          kind: "table",
          title: "Same total, different activations",
          columns: ["activation", `a(${f(Z, 1)})`, `a(${f(BLOCKED, 1)})`, "range"],
          rows: [
            ["sigmoid", f(sigmoid(Z), 3), f(sigmoid(BLOCKED), 3), "0 … 1"],
            ["ReLU", f(relu(Z), 3), f(relu(BLOCKED), 3), "0 … ∞"],
            ["tanh", f(tanh(Z), 3), f(tanh(BLOCKED), 3), "−1 … 1"],
            [`leaky ReLU (a=${LEAKY_A})`, f(leakyRelu(Z, LEAKY_A), 3), f(leakyRelu(BLOCKED, LEAKY_A), 3), "−∞ … ∞"],
          ],
          caption: "Common default for leaky ReLU is a = 0.01; 0.1 is used here so the slope is visible.",
        },
      ],
      deeper: {
        math: ["ReLU(z) = max(0, z),  ReLU'(z) = 1 if z > 0 else 0", "σ(z) = 1 / (1 + e^(−z)),  σ'(z) = σ(z)(1 − σ(z)) ≤ 0.25", "tanh'(z) = 1 − tanh²(z)", "Sigmoid/tanh saturate: for large |z| the slope ≈ 0, so gradients vanish."],
        code: { lang: "python", src: `relu = lambda z: max(0.0, z)\nprint(relu(${f(Z, 1)}), relu(${f(BLOCKED, 1)}))   # ${f(RELU_OUT, 1)} 0.0` },
      },
      log: [
        { tone: "green", cells: { stage: "activate", what: `ReLU(${f(Z, 1)})`, value: f(RELU_OUT, 2), note: "positive → passes, the neuron fires" } },
        { tone: "rose", cells: { stage: "activate", what: `ReLU(${f(BLOCKED, 1)})`, value: f(relu(BLOCKED), 2), note: "negative → gate shuts" } },
      ],
      interviewTip: "Know *why* ReLU replaced sigmoid in hidden layers: sigmoid's slope is at most 0.25, so gradients shrink layer after layer.",
    },
    // 4 ─────────────────────────────────────────────────────────────
    {
      id: "layers",
      title: "Many neurons make a network",
      simple: "Put neurons side by side in rows, feed one row into the next, and you have a neural network.",
      explain:
        "The **inputs** hold the house's numbers. The {{hidden-layer|hidden layer}} has three neurons, each with its own weights, so each one notices something different. Neuron A is the one you just met. The **output** neuron combines them into one price guess. Every line is one weight.",
      analogy: "A small team: three people each check the house in their own way, and a manager combines their opinions into one price.",
      detail: `Layers where every neuron connects to every neuron in the next layer are called dense (or fully connected). This one has 3 × 3 = 9 weights into the hidden layer, 3 into the output, plus 4 biases: **${PARAMS} parameters**. GPT-class models have billions, but every one of them is a number like these.\n\nIn real networks hidden neurons don't have neat human meanings; the letters A, B, C are just names.`,
      stage: { kind: "network", layers: layersAt(F0).map((l, k) => (k === 0 ? l : { ...l, nodes: l.nodes.map((n) => ({ label: n.label })) })), weights: asStage(NET0), mode: "structure", note: "neuron A is the neuron from steps 1–3 · line thickness = weight" },
      highlight: ["inputs", "hidden", "out"],
      packets: [
        { from: "inputs", to: "sum", label: "3 inputs", tone: "blue" },
        { from: "act", to: "hidden", label: "3 hidden neurons", tone: "violet" },
        { from: "hidden", to: "out", label: "1 output", tone: "green" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: `Parameter count: ${PARAMS}`,
        columns: ["layer", "weights", "biases", "total"],
        rows: [
          ["inputs → hidden", "3 × 3 = 9", 3, 12],
          ["hidden → output", "3 × 1 = 3", 1, 4],
          ["all", 12, 4, PARAMS],
        ],
        highlightRow: 2,
      },
      deeper: {
        math: ["h = ReLU(W₁·x + b₁)   (3 numbers)", "ŷ = v·h + c            (1 number, no activation: it is a price)", "Parameters of a dense layer = n_in × n_out + n_out"],
        code: {
          lang: "python",
          src: `
import torch.nn as nn
net = nn.Sequential(
    nn.Linear(3, 3), nn.ReLU(),   # inputs → hidden
    nn.Linear(3, 1),              # hidden → price
)
print(sum(p.numel() for p in net.parameters()))   # ${PARAMS}`,
        },
      },
      log: [{ tone: "slate", cells: { stage: "build", what: "3 → 3 → 1, ReLU hidden", value: `${PARAMS} params`, note: "12 weights + 4 biases" } }],
      interviewTip: "Parameter count of a dense layer = inputs × outputs + outputs (biases). Be ready to do it for 512 → 256 in your head.",
    },
    // 5 ─────────────────────────────────────────────────────────────
    {
      id: "forward",
      title: "Send the numbers through",
      simple: "The numbers flow left to right; each neuron adds up what reaches it and lights up if its total is above zero.",
      explain: `This trip is the {{forward-pass|forward pass}}. Neuron A gets ${f(F0.h[0], 1)} and lights up. Neuron B's total is ${mf(F0.z[1], 1)}, so its gate shuts and it sends nothing on. Pool is 0, so no signal leaves it either. The output adds up what arrives: a guess of **${f(F0.y, 2)}**.`,
      analogy: "Water through pipes: thick pipes carry more, and a closed tap (a shut gate) stops the flow completely.",
      detail: `Hidden totals z = ${vec(F0.z, 1)} → after ReLU h = ${vec(F0.h, 1)}. Output ŷ = ${NET0.V.map((v, j) => `${f(v, 1)}×${f(F0.h[j], 1)}`).join(" + ")} + ${f(NET0.c, 1)} = **${f(F0.y, 2)}**.\n\nThe output neuron has **no** activation, because a price can be any number. For a yes/no answer you would put a sigmoid there; for one-of-many classes, a softmax.`,
      stage: { kind: "network", layers: layersAt(F0), weights: asStage(NET0), mode: "forward", gates: true, note: "dot size = signal strength · a neuron that sends 0 sends no dots" },
      highlight: ["inputs", "sum", "act", "hidden", "out"],
      packets: [
        { from: "inputs", to: "sum", label: "x = [2, 1, 0]", tone: "blue" },
        { from: "act", to: "hidden", label: `h = ${vec(F0.h, 1)}`, tone: "violet" },
        { from: "hidden", to: "out", label: `ŷ = ${f(F0.y, 2)}`, tone: "green" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: "Hidden layer, neuron by neuron",
        columns: ["neuron", "total z", "ReLU(z)", "gate"],
        rows: HIDDEN.map((name, j) => [name, f(F0.z[j], 2), f(F0.h[j], 2), F0.h[j] > 0 ? "open" : "shut"]),
        caption: `Output: ${NET0.V.map((v, j) => `${f(v, 1)}·${f(F0.h[j], 1)}`).join(" + ")} = ${f(F0.y, 2)}`,
      },
      deeper: {
        math: ["z = W₁ᵀx + b₁", `= ${vec(F0.z, 2)}`, `h = ReLU(z) = ${vec(F0.h, 2)}`, `ŷ = v·h + c = ${f(F0.y, 3)}`],
        code: { lang: "python", src: `guess = net(torch.tensor([2., 1., 0.]))   # tensor([${f(F0.y, 4)}])` },
      },
      log: [
        ...HIDDEN.map((name, j) => ({ tone: (F0.h[j] > 0 ? "violet" : "rose") as "violet" | "rose", cells: { stage: "hidden", what: `${name}: ReLU(${f(F0.z[j], 2)})`, value: f(F0.h[j], 2), note: F0.h[j] > 0 ? "fires" : "gate shut → sends 0" } })),
        { tone: "green", cells: { stage: "output", what: "v·h + c", value: f(F0.y, 3), note: "the price guess" } },
      ],
      interviewTip: "Be able to say what the output activation should be for regression (none), binary classification (sigmoid) and multi-class (softmax).",
    },
    // 6 ─────────────────────────────────────────────────────────────
    {
      id: "wrong",
      title: "How wrong was the guess?",
      simple: "We compare the guess with the real price. The size of the gap tells the network how wrong it was.",
      explain: `The real price was **${f(PRICE, 1)}** but the network said **${f(F0.y, 2)}**: too low by ${f(PRICE - F0.y, 2)}. We turn the gap into one score called the {{loss}} (a number for "how wrong"). Here we square the gap: ${f(PRICE - F0.y, 2)} × ${f(PRICE - F0.y, 2)} = **${f(LOSS0, 2)}**. Squaring makes big misses count much more than small ones.`,
      analogy: "A teacher marking a test: the further your answer is from the right one, the more marks you lose.",
      detail: `For numbers (regression) the usual loss is {{mse|mean squared error}}: the average of (ŷ − y)² over the examples. For yes/no answers it is {{bce|binary cross-entropy}}: −[y·ln p + (1 − y)·ln(1 − p)], which punishes confident wrong answers very hard (p = 0.01 for a true "yes" costs 4.6).\n\nThe loss must be a single number, so training has one thing to make smaller.`,
      stage: { kind: "network", layers: layersAt(F0), weights: asStage(NET0), mode: "error", gates: true, target: { label: "real price", value: PRICE }, note: `loss = (${f(F0.y, 2)} − ${f(PRICE, 2)})² = ${f(LOSS0, 3)}` },
      highlight: ["out", "loss", "labels"],
      packets: [
        { from: "out", to: "loss", label: `ŷ = ${f(F0.y, 2)}`, tone: "green" },
        { from: "labels", to: "loss", label: `y = ${f(PRICE, 1)}`, tone: "slate" },
      ],
      viz: [
        {
          only: "interview",
          kind: "table",
          title: "Two losses, two jobs",
          columns: ["", "MSE", "BCE"],
          rows: [
            ["Task", "regression (numbers)", "binary classification"],
            ["Output layer", "no activation", "sigmoid → p"],
            ["Our example", `(${f(F0.y, 2)} − ${f(PRICE, 1)})² = ${f(LOSS0, 3)}`, `p = σ(${f(Z, 1)}) = ${f(SIG_OUT, 3)}, y = 1 → ${f(bce(SIG_OUT, 1), 3)}`],
          ],
        },
        {
          only: "interview",
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
        },
      ],
      deeper: {
        math: ["MSE = (1/n) Σ (ŷ − y)²", `one house: (${f(F0.y, 3)} − ${f(PRICE, 3)})² = ${f(LOSS0, 4)}`, "BCE = −[y·ln p + (1 − y)·ln(1 − p)]", "Why not MSE on a sigmoid output? Its gradient is multiplied by σ'(z), which is tiny when the neuron saturates, so learning stalls exactly when the model is very wrong. BCE cancels that factor."],
        code: { lang: "python", src: `loss = (guess - 1.0) ** 2        # ${f(LOSS0, 4)}\n# torch: nn.MSELoss()(guess, target)` },
      },
      log: [{ tone: "rose", cells: { stage: "loss", what: `(${f(F0.y, 2)} − ${f(PRICE, 1)})²`, value: f(LOSS0, 4), note: "too low by " + f(PRICE - F0.y, 2) } }],
      interviewTip: "Match the loss to the output: MSE with a linear output, BCE with sigmoid, categorical cross-entropy with softmax.",
    },
    // 7 ─────────────────────────────────────────────────────────────
    {
      id: "blame",
      title: "Share out the blame",
      simple: "Working backwards from the mistake, every neuron and weight gets its share of the blame.",
      explain:
        "This is {{backprop|backpropagation}}. The output neuron gets the most blame. It passes blame back along each line, in proportion to that line's weight. Neuron B was switched off, so it gets **no** blame: it did not affect the guess. The weights from pool get none either, because pool was 0.",
      analogy: "A group project went badly. You trace back who contributed what, and each person's share of the fix matches their share of the result.",
      detail: `Each "blame" is a {{gradient}}: how much the loss would change if that number changed a little. The {{chain-rule|chain rule}} multiplies local slopes along the path from the loss back to each weight.\n\nHere ∂L/∂ŷ = 2(ŷ − y) = **${f(G0.dy, 2)}** (negative: the guess should go up). Hidden: ∂L/∂z = ∂L/∂ŷ × vⱼ × ReLU′ = ${vec(G0.dz, 2)}. ReLU′ is 0 for neuron B, so its whole branch gets zero gradient. Each weight's gradient is (input that flowed along it) × (blame at its end): pool's weights get 0.`,
      stage: {
        kind: "network",
        layers: layersAt(F0),
        weights: asStage(NET0),
        mode: "backward",
        blame: [[], G0.dz.map(Math.abs), [Math.abs(G0.dy)]],
        target: { label: "real price", value: PRICE },
        note: "red dots = blame flowing back · thicker red ring = more blame",
      },
      highlight: ["loss", "grad", "hidden", "out"],
      packets: [
        { from: "loss", to: "grad", label: `∂L/∂ŷ = ${f(G0.dy, 2)}`, tone: "rose" },
        { from: "grad", to: "opt", label: `∂L/∂z = ${vec(G0.dz, 2)}`, tone: "rose" },
      ],
      viz: [
        {
          only: "interview",
          kind: "table",
          title: "Chain rule, link by link",
          columns: ["gradient", "formula", "value"],
          rows: [
            ["∂L/∂ŷ", "2(ŷ − y)", f(G0.dy, 3)],
            ...HIDDEN.map((name, j) => [`∂L/∂v (${name})`, `∂L/∂ŷ · h = ${f(G0.dy, 2)} × ${f(F0.h[j], 1)}`, f(G0.dV[j], 3)]),
            ...HIDDEN.map((name, j) => [`∂L/∂z (${name})`, F0.z[j] > 0 ? `∂L/∂ŷ · v = ${f(G0.dy, 2)} × ${f(NET0.V[j], 1)}` : "gate shut → × 0", f(G0.dz[j], 3)]),
            ...INPUT_NAMES.map((name, i) => [`∂L/∂w (${name} → A)`, `${name} × ∂L/∂z_A = ${X[i]} × ${f(G0.dz[0], 2)}`, f(G0.dW1[i][0], 3)]),
          ],
        },
        {
          only: "interview",
          kind: "table",
          title: "Classic special case: sigmoid + BCE",
          columns: ["link", "value"],
          rows: [
            ["p = σ(0.8)", f(SIG_OUT, 4)],
            ["∂L/∂z = p − y", f(SIG_OUT - 1, 4)],
          ],
          caption: "For a sigmoid output with binary cross-entropy, the slopes cancel and the output gradient is simply p − y.",
        },
      ],
      deeper: {
        math: ["∂L/∂wᵢⱼ = ∂L/∂ŷ · ∂ŷ/∂hⱼ · ∂hⱼ/∂zⱼ · ∂zⱼ/∂wᵢⱼ", "= 2(ŷ − y) · vⱼ · ReLU′(zⱼ) · xᵢ", `size → A: 2(${f(F0.y, 2)} − 1) × ${NET0.V[0]} × 1 × 2 = ${f(G0.dW1[0][0], 3)}`, "Backprop reuses each layer's upstream gradient, so all gradients cost about two forward passes."],
        code: {
          lang: "python",
          src: `
loss = (net(x) - 1.0) ** 2
loss.backward()                      # autograd runs the chain rule
print(net[0].weight.grad)            # blame for every hidden weight`,
        },
      },
      log: [
        { tone: "rose", cells: { stage: "backward", what: "∂L/∂ŷ = 2(ŷ − y)", value: f(G0.dy, 4), note: "guess should go up" } },
        ...HIDDEN.map((name, j) => ({ tone: "rose" as const, cells: { stage: "backward", what: `∂L/∂z ${name}`, value: f(G0.dz[j], 4), note: F0.h[j] > 0 ? "" : "gate was shut → no blame" } })),
      ],
      interviewTip: "Backprop computes gradients; gradient descent uses them. Interviewers check you don't conflate the two.",
    },
    // 8 ─────────────────────────────────────────────────────────────
    {
      id: "update",
      title: "Nudge every weight",
      simple: "Each weight moves a tiny bit in the direction that makes the guess less wrong.",
      explain: `How big a nudge? That is the {{learning-rate|learning rate}}, here **${ALPHA}**: small, careful steps. The glowing lines changed the most. Run the house through again: the guess rises from ${f(F0.y, 2)} to **${f(F1.y, 2)}**. Still a bit low, but the loss fell from ${f(LOSS0, 2)} to **${f(LOSS1, 2)}**.`,
      analogy: "Tuning a guitar string: a small twist, listen, another small twist. Crank it hard and you overshoot.",
      detail: `The update rule is **w ← w − α · ∂L/∂w**: step against the gradient (downhill). A negative gradient means "increase this weight". Biggest changes: ${CHANGES.slice(0, 3)
        .map((c) => `${c.name} ${f(c.from, 2)} → ${f(c.to, 3)}`)
        .join("; ")}. Neuron B's weights did not move at all (no blame).\n\nToo large a learning rate overshoots and the loss bounces or explodes; too small and training crawls. Real training uses optimisers like Adam (an adaptive step per weight) and mini-{{batch|batches}}, but the core move is this one.`,
      stage: {
        kind: "network",
        layers: layersAt(F1),
        weights: asStage(NET0),
        newWeights: asStage(NET1),
        mode: "update",
        target: { label: "real price", value: PRICE, was: F0.y },
        note: `learning rate ${ALPHA} · chips show how much each weight moved`,
      },
      highlight: ["grad", "opt", "weights", "sum"],
      packets: [
        { from: "grad", to: "opt", label: `α = ${ALPHA}`, tone: "amber" },
        { from: "opt", to: "sum", label: "new weights", sub: CHANGES.slice(0, 2).map((c) => `${f(c.from, 2)}→${f(c.to, 2)}`).join(", "), tone: "amber" },
        { from: "hidden", to: "out", label: `ŷ = ${f(F1.y, 3)}`, tone: "green" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: "The biggest changes",
        columns: ["weight", "before", "gradient", "after"],
        rows: CHANGES.slice(0, 5).map((c) => [c.name, f(c.from, 3), f((c.from - c.to) / ALPHA, 3), f(c.to, 3)]),
        caption: `after = before − ${ALPHA} × gradient`,
      },
      deeper: {
        math: [
          "wᵢⱼ ← wᵢⱼ − α · ∂L/∂wᵢⱼ   (same for v, b₁, c)",
          `size → A: ${f(NET0.W1[0][0], 3)} − ${ALPHA} × (${f(G0.dW1[0][0], 3)}) = ${f(NET1.W1[0][0], 3)}`,
          `bias c: ${f(NET0.c, 3)} − ${ALPHA} × (${f(G0.dc, 3)}) = ${f(NET1.c, 3)}`,
          `new forward pass: ŷ = ${f(F1.y, 4)}, loss ${f(LOSS0, 4)} → ${f(LOSS1, 4)}`,
        ],
        code: {
          lang: "python",
          src: `
opt = torch.optim.SGD(net.parameters(), lr=${ALPHA})
opt.zero_grad()
loss = (net(x) - 1.0) ** 2
loss.backward()
opt.step()                           # w -= lr * w.grad, for every weight`,
        },
      },
      log: [
        ...CHANGES.slice(0, 3).map((c) => ({ tone: "amber" as const, cells: { stage: "update", what: c.name, value: `${sign(c.to - c.from)}`, note: `${f(c.from, 3)} → ${f(c.to, 3)}` } })),
        { tone: "green", cells: { stage: "re-check", what: `ŷ ${f(F0.y, 3)} → ${f(F1.y, 3)}`, value: f(LOSS1, 4), note: `loss was ${f(LOSS0, 4)}` } },
      ],
      interviewTip: "If the loss goes up or turns NaN, the first suspect is a learning rate that is too high.",
    },
    // 9 ─────────────────────────────────────────────────────────────
    {
      id: "repeat",
      title: "Repeat for many houses",
      simple: "Guess, check, blame, nudge: repeat it over many houses, many times, and the mistakes keep shrinking.",
      explain: `That loop is {{training}}. Here the network practises on ${HOUSES.length} houses for ${ROUNDS} rounds; one round over all the data is an {{epoch}}. The average loss drops fast at first (${f(TRAIN.first, 2)} → ${f(TRAIN.last, 3)}), then levels off. After training, the guesses sit much closer to the real prices.`,
      analogy: "Practising free throws: you miss, adjust, shoot again. Early shots improve a lot, later ones only a little.",
      detail: `Each round here averages the gradients over all ${HOUSES.length} houses before updating (full-batch gradient descent). Real training shuffles the data into mini-batches of, say, 32 examples, updates after each batch, and runs many epochs.\n\nWatch out: a low training loss is not the goal. What matters is the loss on houses the network has **never seen** (a validation set). If that one starts rising while training loss keeps falling, the model is {{overfitting}}.`,
      stage: {
        kind: "viz",
        viz: [
          {
            kind: "plot",
            title: `Average loss, ${ROUNDS} rounds`,
            series: [{ label: "loss", points: TRAIN.losses, tone: "rose" }],
            x: [0, ROUNDS],
            y: [0, Math.ceil(TRAIN.first * 10) / 10],
            xLabel: "round (epoch)",
            yLabel: "loss",
            markers: [
              { x: 0, y: TRAIN.first, label: f(TRAIN.first, 2), tone: "rose" },
              { x: ROUNDS, y: TRAIN.last, label: f(TRAIN.last, 3), tone: "green" },
            ],
          },
          {
            kind: "table",
            title: "Guesses before and after",
            columns: ["house (size, floors, pool)", "real", "before", "after"],
            rows: HOUSES.map((h) => [`(${h.x.join(", ")})`, f(h.y, 2), f(forward(NET0, h.x).y, 2), f(forward(TRAIN.net, h.x).y, 2)]),
            highlightRow: 0,
          },
        ],
      },
      highlight: ["loss", "grad", "opt", "sum"],
      packets: [
        { from: "loss", to: "grad", label: "blame", tone: "rose" },
        { from: "grad", to: "opt", label: "nudge", tone: "amber" },
        { from: "opt", to: "sum", label: `× ${ROUNDS} rounds`, tone: "green" },
      ],
      deeper: {
        math: [`average loss: ${TRAIN.losses.filter((_, i) => i % 10 === 0).map(([r, l]) => `round ${r}: ${f(l, 3)}`).join(" · ")}`, "one epoch = one pass over the training data", "mini-batch SGD: update after every batch of B examples, so one epoch = N / B updates"],
        code: {
          lang: "python",
          src: `
for epoch in range(${ROUNDS}):
    for x, y in loader:              # batches of houses
        opt.zero_grad()
        loss = ((net(x) - y) ** 2).mean()
        loss.backward()
        opt.step()`,
        },
      },
      log: TRAIN.losses
        .filter((_, i) => i % 15 === 0 || i === ROUNDS)
        .map(([r, l]) => ({ tone: (r === 0 ? "rose" : "green") as "rose" | "green", cells: { stage: "train", what: `round ${r}`, value: f(l, 4), note: r === 0 ? "untrained" : "" } })),
      interviewTip: "Define epoch, batch and iteration precisely: 1,000 examples with batch size 100 is 10 iterations per epoch.",
    },
    // 10 ────────────────────────────────────────────────────────────
    {
      id: "deep",
      title: "Why more layers help",
      simple: "One neuron can only draw a straight line. Many neurons working together can draw curves.",
      explain: `Green dots sit inside a ring of blue dots. A single neuron can only split the page with a straight line, so it gets stuck at about **${pct(LIN.acc)}** right. Add a hidden layer of 6 neurons: each draws its own line, and together they bend into a closed curve: **${pct(MLP.acc)}** right.`,
      analogy: "One straight fence can't pen in a sheep in the middle of a field. Six fences joined together can.",
      detail:
        "This is why depth matters. Each hidden neuron draws one straight {{decision-boundary|boundary}}; the next layer combines them into curves, and deeper layers combine curves into ever more complex shapes (in images: edges → shapes → objects).\n\nUniversal approximation: one hidden layer with enough neurons can approximate any continuous function, but it may need a huge width. Depth is usually far more parameter-efficient.",
      stage: {
        kind: "viz",
        viz: [
          {
            kind: "scatter",
            title: `One neuron: a straight line · ${pct(LIN.acc)}`,
            points: RING.map((p) => ({ x: p.x, y: p.y, tone: p.c ? ("green" as const) : ("blue" as const) })),
            boundary: LIN_LINE,
            x: [-2.2, 2.2],
            y: [-2.2, 2.2],
          },
          {
            kind: "scatter",
            title: `6 hidden neurons: a curve · ${pct(MLP.acc)}`,
            points: RING.map((p) => ({ x: p.x, y: p.y, tone: p.c ? ("green" as const) : ("blue" as const) })),
            boundary: MLP.boundary,
            x: [-2.2, 2.2],
            y: [-2.2, 2.2],
          },
        ],
        note: "dashed = where the model switches from “blue” to “green” · both trained with the same loop",
      },
      highlight: ["hidden", "out", "boundary"],
      packets: [
        { from: "hidden", to: "boundary", label: "6 lines → 1 curve", tone: "green" },
        { from: "out", to: "loss", label: `BCE ${f(MLP.finalLoss, 3)}`, sub: `acc ${pct(MLP.acc)}`, tone: "green" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: "Same data, same training loop",
        columns: ["model", "boundary", "accuracy"],
        rows: [
          ["1 neuron (logistic regression)", "straight line", pct(LIN.acc)],
          ["2 → 6 → 1 network (tanh)", "curve", pct(MLP.acc)],
        ],
        highlightRow: 1,
      },
      deeper: {
        math: [
          "Without activations: W₂(W₁x) = (W₂W₁)x — still one linear map, still one straight line.",
          "Universal approximation: one wide hidden layer can approximate any continuous function on a bounded region.",
          "Depth: many functions need exponentially fewer neurons when built from several layers.",
          `MLP training loss: ${MLP.lossLog.filter((_, i) => i % 6 === 0).map(([it, l]) => `it ${it}: ${f(l, 3)}`).join(" · ")}`,
        ],
      },
      log: [
        { tone: "blue", cells: { stage: "linear", what: "1 neuron, straight boundary", value: pct(LIN.acc), note: "can't enclose the inner points" } },
        { tone: "green", cells: { stage: "MLP", what: "2 → 6 → 1, tanh hidden", value: pct(MLP.acc), note: "closed curve boundary" } },
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
      answer: "The loss depends on the output, which depends on pre-activations, which depend on weights. The chain rule multiplies local derivatives along that path: ∂L/∂w = ∂L/∂a · ∂a/∂z · ∂z/∂w. Backprop computes these from the output layer backwards, reusing each layer's upstream gradient so the full gradient costs about as much as a couple of forward passes. A ReLU that output 0 passes zero gradient back, and for sigmoid + BCE, ∂L/∂z simplifies to p − y.",
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
      q: `A ReLU neuron's total is ${f(BLOCKED, 1)}. What does it pass on?`,
      options: [f(BLOCKED, 1), "0", f(-BLOCKED, 1), "1"],
      correct: 1,
      explain: "ReLU = max(0, z). Any negative total becomes 0: the gate shuts and the neuron stays quiet.",
    },
    {
      id: "nnq-3",
      q: `The network guesses ${f(F0.y, 2)} and the real price is ${f(PRICE, 1)}. What is the squared-error loss?`,
      options: [f(PRICE - F0.y, 2), f(LOSS0, 2), f(PRICE + F0.y, 2), f(Math.sqrt(PRICE - F0.y), 2)],
      correct: 1,
      explain: `(${f(F0.y, 2)} − ${f(PRICE, 1)})² = ${f(PRICE - F0.y, 2)}² = ${f(LOSS0, 2)}. The gap itself (${f(PRICE - F0.y, 2)}) is not the squared loss.`,
    },
    {
      id: "nnq-4",
      q: "Why did neuron B get no blame in the backward pass?",
      options: ["Its weights were negative", "Its gate was shut (it output 0), so it did not affect the guess", "Backprop skips the middle neuron of a layer", "Its bias was too small"],
      correct: 1,
      explain: "ReLU's slope is 0 when the total is below zero, so the chain rule multiplies its blame by 0. A neuron that is shut for every input stops learning: a dead ReLU.",
    },
    {
      id: "nnq-5",
      q: `With ∂L/∂w = ${f(G0.dW1[0][0], 3)}, w = ${f(NET0.W1[0][0], 1)} and learning rate ${ALPHA}, what is the new w?`,
      options: [f(NET0.W1[0][0] + ALPHA * G0.dW1[0][0], 3), f(NET1.W1[0][0], 3), f(NET0.W1[0][0] - G0.dW1[0][0], 3), f(NET0.W1[0][0] * ALPHA, 3)],
      correct: 1,
      explain: `w − α·∂L/∂w = ${f(NET0.W1[0][0], 1)} − ${ALPHA} × (${f(G0.dW1[0][0], 3)}) = ${f(NET1.W1[0][0], 3)}. A negative gradient means increasing w lowers the loss.`,
    },
    {
      id: "nnq-6",
      q: `For a sigmoid output with BCE, p = ${f(SIG_OUT, 3)} and y = 1. What is ∂L/∂z?`,
      options: [f(SIG_OUT, 3), f(SIG_OUT - 1, 3), f(SIG_OUT * (1 - SIG_OUT), 3), f(bce(SIG_OUT, 1), 3)],
      correct: 1,
      explain: `It simplifies to p − y = ${f(SIG_OUT, 3)} − 1 = ${f(SIG_OUT - 1, 3)}. The other options are p, σ'(z) and the loss itself.`,
    },
    {
      id: "nnq-7",
      q: "What happens if you remove every activation function from a 10-layer network?",
      options: ["It becomes a much stronger model", "It collapses to one linear model", "It can no longer be trained", "It becomes a decision tree"],
      correct: 1,
      explain: "Composing linear maps gives a linear map, so all 10 layers equal one matrix multiply (plus a bias): it can only draw straight boundaries.",
    },
  ],
};

export default scenario;
