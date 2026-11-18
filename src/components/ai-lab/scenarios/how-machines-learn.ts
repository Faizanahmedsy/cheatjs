import type { Scenario } from "../engine/types";
import { f, gaussian, linspace, mean, seeded } from "../engine/math";

/* ------------------------------------------------------------------ *
 * One running example: predict a house's price ($ thousands) from its
 * size (thousands of sq ft). The data is generated with a fixed seed,
 * and every loss, gradient and fit below is computed from it.
 * ------------------------------------------------------------------ */

type House = { size: number; beds: number; price: number };

const rand = seeded(11);
/** 20 houses: price ≈ 60 + 110 × size, plus noise (σ = 25). */
const HOUSES: House[] = Array.from({ length: 20 }, () => {
  const size = +(0.7 + rand() * 2.9).toFixed(2);
  const price = Math.round(60 + 110 * size + gaussian(rand) * 25);
  const beds = Math.max(1, Math.min(5, Math.round(size * 1.3 + 0.4)));
  return { size, beds, price };
});

// 70 / 15 / 15 split → 14 / 3 / 3.
const TRAIN = HOUSES.slice(0, 14);
const VAL = HOUSES.slice(14, 17);
const TEST = HOUSES.slice(17);

const predict = (w: number, b: number, x: number) => w * x + b;
const mseOf = (w: number, b: number, d: House[]) => mean(d.map((h) => (predict(w, b, h.size) - h.price) ** 2));
const maeOf = (w: number, b: number, d: House[]) => mean(d.map((h) => Math.abs(predict(w, b, h.size) - h.price)));
const sqft = (size: number) => `${Math.round(size * 1000).toLocaleString("en-US")} sq ft`;
const usd = (k: number) => `$${Math.round(k)}k`;

function gradients(w: number, b: number, d: House[]) {
  const n = d.length;
  let gw = 0;
  let gb = 0;
  for (const h of d) {
    const err = predict(w, b, h.size) - h.price;
    gw += (2 * err * h.size) / n;
    gb += (2 * err) / n;
  }
  return { gw, gb };
}

/** Full-batch gradient descent from w = 0, b = 0. Records every epoch. */
const LR = 0.1;
const EPOCHS = 400;
type Epoch = { epoch: number; w: number; b: number; train: number; val: number; mae: number };
const HISTORY: Epoch[] = [];
{
  let w = 0;
  let b = 0;
  for (let e = 0; e <= EPOCHS; e++) {
    HISTORY.push({ epoch: e, w, b, train: mseOf(w, b, TRAIN), val: mseOf(w, b, VAL), mae: maeOf(w, b, TRAIN) });
    const { gw, gb } = gradients(w, b, TRAIN);
    w -= LR * gw;
    b -= LR * gb;
  }
}
const FINAL = HISTORY[HISTORY.length - 1];
const LOGGED = [0, 1, 2, 5, 10, 25, 50, 100, 200, 400].map((e) => HISTORY[e]);
const FIRST = gradients(0, 0, TRAIN);

/** MSE worked example: a hand-made guess line on three houses. */
const GUESS = { w: 80, b: 50 };
const EX = TRAIN.slice(0, 3).map((h) => {
  const pred = predict(GUESS.w, GUESS.b, h.size);
  const err = pred - h.price;
  return { ...h, pred, err, sq: err * err };
});
const EX_MSE = mean(EX.map((e) => e.sq));

/** 1D slice of the bowl: loss vs w with b frozen at its trained value. */
const B_FIXED = FINAL.b;
const lossW = (w: number) => mseOf(w, B_FIXED, TRAIN);
const dLossW = (w: number) => mean(TRAIN.map((h) => 2 * (predict(w, B_FIXED, h.size) - h.price) * h.size));

/** Under / good / over-fitting on 7 training houses (every other one by size). */
const SUB = [...TRAIN].sort((a, b) => a.size - b.size).filter((_, i) => i % 2 === 0);
const meanPrice = mean(SUB.map((h) => h.price));
const xbar = mean(SUB.map((h) => h.size));
const LS_W = SUB.reduce((s, h) => s + (h.size - xbar) * (h.price - meanPrice), 0) / SUB.reduce((s, h) => s + (h.size - xbar) ** 2, 0);
const LS_B = meanPrice - LS_W * xbar;
/** Degree-6 polynomial through all 7 points (Lagrange form): zero training error by construction. */
const wiggle = (x: number) => SUB.reduce((s, p, i) => s + p.price * SUB.reduce((t, q, j) => (j === i ? t : (t * (x - q.size)) / (p.size - q.size)), 1), 0);
const FITS = [
  { name: "Underfit: always the average", fn: (_x: number) => meanPrice, tone: "slate" as const },
  { name: "Good fit: straight line", fn: (x: number) => LS_W * x + LS_B, tone: "green" as const },
  { name: "Overfit: degree-6 curve", fn: wiggle, tone: "rose" as const },
];
const fitMse = (fn: (x: number) => number, d: House[]) => mean(d.map((h) => (fn(h.size) - h.price) ** 2));

/** Inference on a new house and the honest test-set score. */
const NEW_SIZE = 2.0;
const NEW_PRICE = predict(FINAL.w, FINAL.b, NEW_SIZE);
const TEST_MAE = maeOf(FINAL.w, FINAL.b, TEST);
const TEST_RMSE = Math.sqrt(mseOf(FINAL.w, FINAL.b, TEST));


/** The ball on the valley: gradient descent on w alone (b frozen), at three learning rates. */
const CURVATURE = 2 * mean(TRAIN.map((h) => h.size * h.size)); // d²L/dw²: how sharply the valley bends
const walk = (lr: number, n: number) => {
  const out = [0];
  for (let i = 0; i < n; i++) out.push(out[i] - lr * dLossW(out[i]));
  return out;
};
const LR_OK = 0.05;
const LR_SMALL = 0.005;
const LR_BIG = +(1.9 / CURVATURE).toFixed(2); // just under the 2 / curvature limit: bounces across the valley
const HOPS = 8;
const PATH_OK = walk(LR_OK, HOPS);
const PATH_SMALL = walk(LR_SMALL, HOPS);
const PATH_BIG = walk(LR_BIG, HOPS);
const W_BEST = PATH_OK[PATH_OK.length - 1];
const allW = [...PATH_OK, ...PATH_SMALL, ...PATH_BIG];
const W_MIN = Math.min(0, ...allW) - 5;
const W_MAX = Math.max(...allW) + 10;
const VALLEY: [number, number][] = linspace(W_MIN, W_MAX, 90).map((w) => [w, lossW(w)]);

/** The guess line before any learning, and a hand guess used for the MSE example. */
const ZERO_MSE = mseOf(0, 0, TRAIN);
const GUESS_MSE = mseOf(GUESS.w, GUESS.b, TRAIN);

/** Frames for the training animation. */
const FRAMES = [0, 1, 2, 3, 5, 8, 12, 20, 35, 60, 100, 200, 400].map((e) => HISTORY[e]);

const trainPts = TRAIN.map((h) => ({ x: h.size, y: h.price }));
const X_DOM: [number, number] = [0.5, 3.7];
const Y_DOM: [number, number] = [0, 500];
const setOf = (h: House) => (TRAIN.includes(h) ? ("train" as const) : VAL.includes(h) ? ("val" as const) : ("test" as const));

const scenario: Scenario = {
  id: "how-machines-learn",
  title: "How machines learn",
  tagline: "Guess, measure how wrong you were, adjust a little, repeat.",
  imagine:
    "Imagine a new estate agent guessing house prices. On day one their guesses are wild. Every time a house sells, they compare their guess with the real price and adjust their rule of thumb a little. After enough sales they are good at it, without ever memorising a single house. Machine learning is that, done with numbers.",
  recap: [
    "A model learns from **examples with answers**: features in (size), label out (price). Some examples are kept aside to test it fairly.",
    "Training is a loop: **guess, measure the miss (loss), step downhill (gradient descent)**, repeat. The learning rate sets the step size.",
    "The goal is doing well on **new** data, not zero training error. Too simple underfits; too wiggly overfits.",
  ],
  overview: {
    plain:
      "Machine learning means the computer finds the rule itself, from examples, instead of a person writing it. You show it many houses with their prices; it keeps guessing, checks how wrong it was, and adjusts. Once its guesses are good, you use it to price houses it has never seen.",
    definition:
      "**Machine learning** means letting a program find its own rule from examples instead of a person writing the rule. You give it {{feature|features}} (house size) and {{label|labels}} (the price it sold for); {{training}} adjusts the model's {{parameter|parameters}} until its predictions match the labels; then {{inference}} uses the frozen model on houses it has never seen.",
    analogy:
      "A new estate agent guessing prices. Day one they guess badly. Each time a sale closes they compare their guess with the real price and nudge their rule of thumb (“about $110k per 1,000 sq ft, plus a base”). After enough sales, their guesses are close — and they never memorised a single house.",
    facts: [
      ["Supervised learning", "Learn from examples that come with the right answer (labels)"],
      ["The loop", "init → predict → {{loss}} → optimise ({{gradient}} step) → repeat"],
      ["This demo's model", "price = w × size + b  (2 parameters)"],
      ["Data", `20 houses → 14 train / 3 validation / 3 test (70 / 15 / 15)`],
      ["Loss", "{{mse|MSE}} — mean squared error, in ($k)²"],
      ["Trained result", `w = ${f(FINAL.w, 1)} $k per 1,000 sq ft, b = ${f(FINAL.b, 1)} $k`],
    ],
    whereUsed: "Price estimates, spam filters, credit scoring, demand forecasting — and, scaled up a billion-fold, the same loop trains LLMs.",
  },
  objects: [
    { id: "test", kind: "db", label: "Test set", sub: "3 houses, locked away", at: [2.4, -3.2], tone: "slate" },
    { id: "user", kind: "user", label: "New house", sub: sqft(NEW_SIZE), at: [4.8, -3.2], tone: "cyan" },
    { id: "data", kind: "table", label: "House data", sub: "20 rows", at: [0, 0], tone: "blue" },
    { id: "split", kind: "ranker", label: "Split", sub: "70 / 15 / 15", at: [2.4, 0], tone: "slate" },
    { id: "model", kind: "box", label: "Model", sub: "price = w·size + b", at: [4.8, 0], tone: "violet" },
    { id: "pred", kind: "vector", label: "Predictions", sub: "ŷ for each house", at: [7.2, 0], tone: "blue" },
    { id: "loss", kind: "gauge", label: "Loss (MSE)", sub: "how wrong?", at: [9.6, 0], tone: "rose" },
    { id: "val", kind: "db", label: "Validation", sub: "3 houses", at: [2.4, 3.6], tone: "cyan" },
    { id: "curve", kind: "chart", label: "Learning curve", sub: "loss per epoch", at: [7.2, 3.6], tone: "green" },
    { id: "opt", kind: "gear", label: "Optimiser", sub: "gradient descent", at: [9.6, 3.6], tone: "amber" },
  ],
  links: [
    { id: "l-ds", from: "data", to: "split" },
    { id: "l-sm", from: "split", to: "model", label: "train" },
    { id: "l-sv", from: "split", to: "val" },
    { id: "l-st", from: "split", to: "test" },
    { id: "l-mp", from: "model", to: "pred" },
    { id: "l-pl", from: "pred", to: "loss" },
    { id: "l-lo", from: "loss", to: "opt" },
    { id: "l-om", from: "opt", to: "model" },
    { id: "l-oc", from: "opt", to: "curve" },
    { id: "l-vm", from: "val", to: "model" },
    { id: "l-tm", from: "test", to: "model" },
    { id: "l-um", from: "user", to: "model" },
  ],
  logTitle: "training log",
  logColumns: [
    { key: "stage", label: "Stage", width: "16%" },
    { key: "epoch", label: "Epoch", align: "right", width: "8%" },
    { key: "train", label: "Train MSE", align: "right" },
    { key: "val", label: "Val MSE", align: "right" },
    { key: "mae", label: "MAE ($k)", align: "right" },
    { key: "note", label: "Params / note" },
  ],
  steps: [
    // 1 ─────────────────────────────────────────────────────────────
    {
      id: "data",
      title: "Start with examples",
      simple: "Every dot is a real house: how big it is, and what it sold for.",
      explain: `We have ${HOUSES.length} houses. The thing we look at, size, is the {{feature}} (an input clue). The thing we want to predict, price, is the {{label}} (the right answer). Bigger houses cost more, roughly along a straight line.`,
      analogy: "Features are the clues on the listing; the label is the price written on the sold sign.",
      detail:
        "Each row is one example. The columns we feed in are **features** (size, bedrooms); the column we predict is the **label**. Learning from examples that come with the right answer is called **supervised learning**.\n\nTo keep the picture 2-D we use one feature, size. The data is synthetic: price = 60 + 110 × size + noise (standard deviation 25), so we can check that training recovers the true rule.",
      stage: {
        kind: "fit",
        mode: "data",
        points: HOUSES.map((h) => ({ x: h.size, y: h.price })),
        xLabel: "size (1,000 sq ft)",
        yLabel: "price ($k)",
        x: X_DOM,
        y: Y_DOM,
        callout: { index: 0, feature: `size ${sqft(HOUSES[0].size)}`, label: `price ${usd(HOUSES[0].price)}` },
      },
      highlight: ["data"],
      packets: [{ from: "data", to: "split", label: "20 rows", sub: "size, beds → price", tone: "blue" }],
      viz: {
        only: "interview",
        kind: "table",
        title: "First 6 houses",
        columns: ["size (sq ft)", "beds", "price (label)"],
        rows: HOUSES.slice(0, 6).map((h) => [sqft(h.size), h.beds, usd(h.price)]),
        caption: "Features on the left, label on the right.",
      },
      deeper: {
        text: "The data here is synthetic: price = 60 + 110 × size + noise with standard deviation 25. Knowing the true rule lets us check that training recovers it.",
        code: {
          lang: "python",
          src: `
import pandas as pd
df = pd.read_csv("houses.csv")
X = df[["size"]]      # features (a 2-D table)
y = df["price"]       # label (one column)`,
        },
      },
      log: HOUSES.slice(0, 3).map((h, i) => ({ tone: "blue" as const, cells: { stage: "row", epoch: "", train: "", val: "", mae: "", note: `house ${i + 1}: ${sqft(h.size)}, ${h.beds} beds → ${usd(h.price)}` } })),
      interviewTip: "Name features and label explicitly. Many candidates blur “data” into one blob.",
    },
    // 2 ─────────────────────────────────────────────────────────────
    {
      id: "split",
      title: "Keep some houses aside",
      simple: "We hide a few houses from the model, so later we can test it on houses it never saw.",
      explain: `The model learns only from the **${TRAIN.length} training** houses. ${VAL.length} go to the {{validation-set|validation set}} (a practice exam we check while working), and ${TEST.length} to the {{test-set|test set}} (the final exam, opened once at the end).`,
      analogy: "Homework (train), mock exam (validation), the real exam you only sit once (test).",
      detail:
        "Before learning anything, set data aside. Validation is for comparing settings and spotting {{overfitting}}; the test set stays locked until the very end, so the final score is honest. If you score a model on data it trained on, you are grading a student on the exact questions they practised.\n\nShuffle first, unless the data is a time series: then split by time so you never train on the future.",
      stage: {
        kind: "fit",
        mode: "split",
        points: HOUSES.map((h) => ({ x: h.size, y: h.price, set: setOf(h) })),
        xLabel: "size (1,000 sq ft)",
        yLabel: "price ($k)",
        x: X_DOM,
        y: Y_DOM,
        note: "70% to learn from · 15% to check while working · 15% for the final exam",
      },
      highlight: ["split", "val", "test"],
      packets: [
        { from: "split", to: "model", label: `train: ${TRAIN.length} houses`, tone: "blue" },
        { from: "split", to: "val", label: `val: ${VAL.length}`, tone: "cyan" },
        { from: "split", to: "test", label: `test: ${TEST.length}`, sub: "don't touch", tone: "slate" },
      ],
      viz: {
        only: "interview",
        kind: "stack",
        title: "20 houses",
        segments: [
          { label: `train (${TRAIN.length})`, value: TRAIN.length, tone: "blue" },
          { label: `validation (${VAL.length})`, value: VAL.length, tone: "cyan" },
          { label: `test (${TEST.length})`, value: TEST.length, tone: "slate" },
        ],
        caption: "Shuffle first (unless the data is a time series — then split by time so you never train on the future).",
      },
      deeper: {
        code: {
          lang: "python",
          src: `
from sklearn.model_selection import train_test_split
X_train, X_tmp, y_train, y_tmp = train_test_split(X, y, test_size=0.30, random_state=0)
X_val, X_test, y_val, y_test = train_test_split(X_tmp, y_tmp, test_size=0.50, random_state=0)`,
        },
      },
      log: [
        { tone: "blue", cells: { stage: "split", note: `train ${TRAIN.length} houses, mean ${usd(mean(TRAIN.map((h) => h.price)))}` } },
        { tone: "cyan", cells: { stage: "split", note: `validation ${VAL.length} houses, mean ${usd(mean(VAL.map((h) => h.price)))}` } },
        { tone: "slate", cells: { stage: "split", note: `test ${TEST.length} houses — locked until the end` } },
      ],
      interviewTip: "Mention **data leakage**: fit scalers, imputers and feature selection on the training set only.",
    },
    // 3 ─────────────────────────────────────────────────────────────
    {
      id: "init",
      title: "The first guess knows nothing",
      simple: "The model is a straight line with two dials. At the start both dials are 0, so every guess is $0.",
      explain:
        "The rule is price = **w** × size + **b**. The {{weight|weight w}} is dollars per 1,000 sq ft; the {{bias|bias b}} is a base price. Both start at 0, so the line lies flat on the floor. The red lines show how far off each guess is.",
      analogy: "A new agent who hasn't seen a single sale yet and says “free!” for every house.",
      detail:
        "w and b are the model's two {{parameter|parameters}}. Training has to start somewhere, so both dials start at 0; the first prediction for every house is $0, which is terrible, and that is fine. The rest of training turns the dials in the right direction.\n\nNeural networks start from small random weights instead of 0 so that neurons don't all learn the same thing; for this 2-parameter line, 0 is fine.",
      stage: {
        kind: "fit",
        mode: "guess",
        points: trainPts,
        xLabel: "size (1,000 sq ft)",
        yLabel: "price ($k)",
        x: X_DOM,
        y: Y_DOM,
        lines: [{ w: 0, b: 0, label: "w = 0, b = 0" }],
        note: `price = 0 × size + 0 · every guess is $0k`,
      },
      highlight: ["model", "pred"],
      packets: [
        { from: "split", to: "model", label: `house 1: ${sqft(TRAIN[0].size)}`, tone: "blue" },
        { from: "model", to: "pred", label: "ŷ = 0 × size + 0 = $0k", sub: `actual ${usd(TRAIN[0].price)}`, tone: "violet" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: "Predictions at w = 0, b = 0",
        columns: ["house", "size", "predicted", "actual", "error"],
        rows: TRAIN.slice(0, 4).map((h, i) => [i + 1, sqft(h.size), usd(0), usd(h.price), `−${h.price}`]),
        caption: "Every guess is off by the full price.",
      },
      deeper: {
        math: ["ŷ = w · x + b", "With w = 0 and b = 0: ŷ = 0 for every house"],
      },
      log: [{ tone: "violet", cells: { stage: "init", epoch: 0, train: f(HISTORY[0].train, 0), val: f(HISTORY[0].val, 0), mae: f(HISTORY[0].mae, 1), note: "w = 0, b = 0" } }],
      interviewTip: "Know why neural nets use random (not zero) initialisation: equal weights get equal gradients and never become different.",
    },
    // 4 ─────────────────────────────────────────────────────────────
    {
      id: "loss",
      title: "Measure the miss",
      simple: "We add up how far every guess is from the real price. One number says how wrong the model is.",
      explain: `That number is the {{loss}}. We use {{mse|MSE}} (mean squared error): square each miss, then average. Here a rough guess line (w = ${GUESS.w}, b = ${GUESS.b}) scores **${f(GUESS_MSE, 0)}**, much better than the flat line's ${f(ZERO_MSE, 0)}. Smaller is better.`,
      analogy: "A teacher marking a test: the further off your answer, the more marks you lose, and big mistakes lose a lot.",
      detail: `Squaring does two things: negatives can't cancel positives, and a $100k miss costs 100× more than a $10k miss, so big mistakes are punished hard.\n\nWorked example with w = ${GUESS.w}, b = ${GUESS.b} on three houses: MSE = (${EX.map((e) => f(e.sq, 1)).join(" + ")}) / 3 = ${f(EX_MSE, 1)}. RMSE = √MSE = ${f(Math.sqrt(EX_MSE), 1)} reads as “typically off by about $${f(Math.sqrt(EX_MSE), 0)}k”.`,
      stage: {
        kind: "fit",
        mode: "guess",
        points: trainPts,
        xLabel: "size (1,000 sq ft)",
        yLabel: "price ($k)",
        x: X_DOM,
        y: Y_DOM,
        lines: [{ w: GUESS.w, b: GUESS.b, label: `w = ${GUESS.w}, b = ${GUESS.b}` }],
        note: `MSE = average of (miss)² = ${f(GUESS_MSE, 0)} · the flat line scored ${f(ZERO_MSE, 0)}`,
      },
      highlight: ["pred", "loss"],
      packets: [{ from: "pred", to: "loss", label: `MSE = ${f(GUESS_MSE, 0)}`, sub: `w = ${GUESS.w}, b = ${GUESS.b}`, tone: "rose" }],
      viz: [
        {
          only: "interview",
          kind: "table",
          title: "MSE by hand (3 houses)",
          columns: ["size", "ŷ = 80x + 50", "actual", "error", "error²"],
          rows: EX.map((e) => [e.size.toFixed(2), f(e.pred, 1), e.price, f(e.err, 1), f(e.sq, 1)]),
          caption: `MSE = (${EX.map((e) => f(e.sq, 1)).join(" + ")}) / 3 = ${f(EX_MSE, 1)}`,
        },
        { only: "interview", kind: "bars", title: "Squared error per house", items: EX.map((e, i) => ({ label: `house ${i + 1}`, value: e.sq, tone: "rose" as const })), format: "fixed2" },
      ],
      deeper: {
        math: ["MSE = (1/n) Σ (ŷᵢ − yᵢ)²", `RMSE = √MSE = ${f(Math.sqrt(EX_MSE), 1)}`, "MAE = (1/n) Σ |ŷᵢ − yᵢ| is gentler on outliers; MSE is smooth, which makes its gradient easy to use."],
        code: {
          lang: "python",
          src: `
import numpy as np
mse = np.mean((y_pred - y_true) ** 2)`,
        },
      },
      log: [
        { tone: "rose", cells: { stage: "loss", train: f(ZERO_MSE, 0), note: "flat line w = 0, b = 0" } },
        { tone: "rose", cells: { stage: "loss", train: f(GUESS_MSE, 0), note: `guess w = ${GUESS.w}, b = ${GUESS.b}` } },
      ],
      interviewTip: "Say *why* you'd pick MSE vs MAE: MSE punishes large errors and is smooth; MAE is robust to outliers.",
    },
    // 5 ─────────────────────────────────────────────────────────────
    {
      id: "descent",
      title: "Walk downhill",
      simple: "Picture the loss as a valley. The model feels which way is downhill and takes a small step that way.",
      explain: `The curve shows the loss for every value of w (b held fixed). The {{gradient}} (the slope under the ball) says which way is uphill, so we step the **opposite** way. Steep slope, big step; near the bottom the steps shrink. After ${HOPS} steps w ≈ **${f(W_BEST, 0)}**.`,
      analogy: "Walking down a foggy hill: you can't see the valley, but you can feel which way the ground tilts under your feet.",
      detail: `This is **gradient descent**: w ← w − α · ∂L/∂w, where α is the {{learning-rate|learning rate}}. The real loss is a bowl over both w and b (the 3-D view shows a ball rolling down a surface); the 2-D curve is one slice of it.\n\nAt w = 0, b = 0 on the 14 training houses: ∂L/∂w = ${f(FIRST.gw, 1)}, ∂L/∂b = ${f(FIRST.gb, 1)}, both negative, so both dials go up.`,
      stage: { kind: "descent", curve: VALLEY, steps: PATH_OK, xLabel: "w ($k per 1,000 sq ft)", yLabel: "loss (MSE)", label: `α = ${LR_OK}`, note: `each dot is one update · b fixed at ${f(B_FIXED, 0)}` },
      highlight: ["loss", "opt", "model"],
      packets: [
        { from: "loss", to: "opt", label: `∂L/∂w = ${f(FIRST.gw, 1)}`, sub: `∂L/∂b = ${f(FIRST.gb, 1)}`, tone: "amber" },
        { from: "opt", to: "model", label: `w = 0 − ${LR}·(${f(FIRST.gw, 1)}) = ${f(HISTORY[1].w, 2)}`, tone: "amber" },
      ],
      viz: { only: "interview", kind: "three-loss", title: "A loss surface in 3-D", caption: "Drag to rotate. The ball follows real gradient steps on a bumpy bowl (a toy surface, not this house model)." },
      deeper: {
        math: [
          "L(w, b) = (1/n) Σ (w·xᵢ + b − yᵢ)²",
          "∂L/∂w = (2/n) Σ (w·xᵢ + b − yᵢ) · xᵢ",
          "∂L/∂b = (2/n) Σ (w·xᵢ + b − yᵢ)",
          `At w = 0, b = 0: ∂L/∂w = ${f(FIRST.gw, 2)}, ∂L/∂b = ${f(FIRST.gb, 2)}`,
          `Ball path (α = ${LR_OK}): ${PATH_OK.map((w) => f(w, 1)).join(" → ")}`,
        ],
        code: {
          lang: "python",
          src: `
err = (w * x + b) - y
grad_w = 2 * np.mean(err * x)
grad_b = 2 * np.mean(err)
w -= lr * grad_w
b -= lr * grad_b`,
        },
      },
      log: [
        { tone: "amber", cells: { stage: "gradient", epoch: 0, note: `∂L/∂w = ${f(FIRST.gw, 2)}, ∂L/∂b = ${f(FIRST.gb, 2)}` } },
        { tone: "amber", cells: { stage: "update", epoch: 1, train: f(HISTORY[1].train, 0), val: f(HISTORY[1].val, 0), mae: f(HISTORY[1].mae, 1), note: `w = ${f(HISTORY[1].w, 2)}, b = ${f(HISTORY[1].b, 2)}` } },
      ],
      interviewTip: "Be ready to write the update rule and say what the gradient's sign means.",
    },
    // 6 ─────────────────────────────────────────────────────────────
    {
      id: "learning-rate",
      title: "How big a step?",
      simple: "Tiny steps take forever. Huge steps jump over the bottom. A medium step gets there quickly.",
      explain: `The step size is the {{learning-rate|learning rate}} (α). Same valley, same start, ${HOPS} steps each: α = ${LR_SMALL} barely moves (w = ${f(PATH_SMALL[HOPS], 0)}), α = ${LR_OK} gets close to the bottom, and α = ${LR_BIG} bounces from side to side.`,
      analogy: "Parking a car: inching forward takes ages, flooring it overshoots the spot.",
      detail: `For this valley, any α above 2 ÷ (curvature) = ${f(2 / CURVATURE, 3)} makes every step overshoot by more than it gains, and the loss explodes. α = ${LR_BIG} sits just under that limit, so it bounces but slowly settles.\n\nIn practice you tune α, often with a warm-up and a decay schedule, and use adaptive optimisers like Adam that scale the step for each parameter.`,
      stage: {
        kind: "descent",
        curve: VALLEY,
        steps: PATH_OK,
        xLabel: "w ($k per 1,000 sq ft)",
        yLabel: "loss (MSE)",
        label: `α ${LR_OK}`,
        compare: [
          { label: `α ${LR_SMALL}`, tone: "cyan", steps: PATH_SMALL },
          { label: `α ${LR_BIG}`, tone: "rose", steps: PATH_BIG },
        ],
        note: `${HOPS} steps each, from w = 0`,
      },
      highlight: ["opt", "model"],
      packets: [{ from: "opt", to: "model", label: `α = ${LR_SMALL} · ${LR_OK} · ${LR_BIG}`, tone: "amber" }],
      viz: {
        only: "interview",
        kind: "table",
        title: `Where w ends after ${HOPS} steps`,
        columns: ["learning rate", "final w", "loss"],
        rows: [
          [LR_SMALL, f(PATH_SMALL[HOPS], 1), f(lossW(PATH_SMALL[HOPS]), 0)],
          [LR_OK, f(PATH_OK[HOPS], 1), f(lossW(PATH_OK[HOPS]), 0)],
          [LR_BIG, f(PATH_BIG[HOPS], 1), f(lossW(PATH_BIG[HOPS]), 0)],
        ],
        highlightRow: 1,
      },
      deeper: {
        math: [`curvature d²L/dw² = 2·mean(x²) = ${f(CURVATURE, 2)}`, "each step multiplies the distance to the bottom by (1 − α·curvature)", `α = ${LR_SMALL}: × ${f(1 - LR_SMALL * CURVATURE, 2)} · α = ${LR_OK}: × ${f(1 - LR_OK * CURVATURE, 2)} · α = ${LR_BIG}: × ${f(1 - LR_BIG * CURVATURE, 2)}`, "|factor| > 1 → diverges"],
      },
      log: [
        { tone: "slate", cells: { stage: `α ${LR_SMALL}`, note: `w after ${HOPS} steps: ${f(PATH_SMALL[HOPS], 1)} (too slow)` } },
        { tone: "green", cells: { stage: `α ${LR_OK}`, note: `w after ${HOPS} steps: ${f(PATH_OK[HOPS], 1)}` } },
        { tone: "rose", cells: { stage: `α ${LR_BIG}`, note: `w after ${HOPS} steps: ${f(PATH_BIG[HOPS], 1)} (bouncing)` } },
      ],
      interviewTip: "Describe both failure modes from the loss curve: flat and slow (α too small) vs zig-zag or exploding (α too big).",
    },
    // 7 ─────────────────────────────────────────────────────────────
    {
      id: "loop",
      title: "Repeat: the training loop",
      simple: "Guess, measure, step, repeat. Each round the line fits the houses a little better.",
      explain: `One pass over all the training houses is an {{epoch}}. Every epoch does the same four moves: **predict, measure the loss, find the slope, update**. The loss falls fast, then flattens. After ${EPOCHS} epochs: w = **${f(FINAL.w, 1)}**, b = **${f(FINAL.b, 1)}**, close to the true 110 and 60.`,
      detail:
        "We also score the **validation** houses every epoch, without learning from them. If training loss keeps falling but validation loss starts rising, the model is memorising: time to stop (early stopping).\n\nThe final training MSE settles near 25² ≈ 625 because the noise we added has standard deviation 25: no straight line can predict random noise.",
      stage: {
        kind: "fit",
        mode: "train",
        points: trainPts,
        xLabel: "size (1,000 sq ft)",
        yLabel: "price ($k)",
        x: X_DOM,
        y: Y_DOM,
        lines: FRAMES.map((h) => ({ w: h.w, b: h.b, label: `epoch ${h.epoch}: MSE ${f(h.train, 0)}` })),
        losses: FRAMES.map((h) => h.train),
      },
      highlight: ["model", "pred", "loss", "opt", "curve", "val"],
      packets: [
        { from: "model", to: "pred", label: "predict", tone: "violet" },
        { from: "pred", to: "loss", label: "loss", tone: "rose" },
        { from: "loss", to: "opt", label: "gradient", tone: "amber" },
        { from: "opt", to: "model", label: "update w, b", tone: "amber" },
        { from: "opt", to: "curve", label: `epoch ${EPOCHS}: MSE ${f(FINAL.train, 0)}`, tone: "green" },
      ],
      viz: {
        only: "interview",
        kind: "plot",
        title: "Learning curve (epochs 1–40)",
        series: [
          { label: "train MSE", points: HISTORY.slice(1, 41).map((h) => [h.epoch, h.train] as [number, number]), tone: "blue" },
          { label: "validation MSE", points: HISTORY.slice(1, 41).map((h) => [h.epoch, h.val] as [number, number]), tone: "cyan", dashed: true },
        ],
        x: [1, 40],
        y: [0, 3000],
        xLabel: "epoch",
        yLabel: "MSE",
        caption: `Epoch 0 starts at ${f(HISTORY[0].train, 0)} (off the chart). By epoch ${EPOCHS}: w = ${f(FINAL.w, 1)}, b = ${f(FINAL.b, 1)}.`,
      },
      deeper: {
        code: {
          lang: "python",
          src: `
w, b, lr = 0.0, 0.0, 0.1
for epoch in range(400):
    err = (w * x_train + b) - y_train
    w -= lr * 2 * np.mean(err * x_train)
    b -= lr * 2 * np.mean(err)
    val_mse = np.mean((w * x_val + b - y_val) ** 2)`,
        },
      },
      log: LOGGED.map((h) => ({
        tone: (h.epoch === EPOCHS ? "green" : "blue") as "green" | "blue",
        cells: { stage: "epoch", epoch: h.epoch, train: f(h.train, 1), val: f(h.val, 1), mae: f(h.mae, 1), note: `w = ${f(h.w, 2)}, b = ${f(h.b, 2)}` },
      })),
      interviewTip: "Early stopping = keep the weights from the epoch with the best **validation** loss.",
    },
    // 8 ─────────────────────────────────────────────────────────────
    {
      id: "fit",
      title: "Too simple, just right, too wiggly",
      simple: "A good model follows the trend. Too simple misses it; too wiggly memorises every dot and fails on new ones.",
      explain: `Three models learn from the same 7 houses, then face new ones (hollow dots). Always guessing the average is {{underfitting}} (too simple). A curve through every dot is {{overfitting}} (memorising): perfect on its 7 houses, wild in between. The straight line wins on new houses.`,
      analogy: "Overfitting is the student who memorised last year's answers: perfect on old papers, lost on a new question.",
      detail: `Scores (train MSE / validation MSE): ${FITS.map((m) => `${m.name.split(":")[0]} ${f(fitMse(m.fn, SUB), 0)} / ${f(fitMse(m.fn, VAL), 0)}`).join("; ")}. The goal is never zero training error; it is low error on new data.\n\nBias–variance: underfit = high bias (too simple), overfit = high variance (too sensitive to the exact training points). Fixes for overfitting: more data, a simpler model, regularisation (L2 adds λ·Σw² to the loss), early stopping, dropout in neural nets.`,
      stage: {
        kind: "fit",
        mode: "fits",
        points: [...SUB.map((h) => ({ x: h.size, y: h.price, set: "train" as const })), ...VAL.map((h) => ({ x: h.size, y: h.price, set: "val" as const }))],
        xLabel: "size",
        yLabel: "price",
        x: [0.7, 3.1],
        y: [-150, 500],
        curves: FITS.map((m) => ({
          label: m.name.split(":")[0],
          tone: m.tone,
          points: linspace(0.75, 3.0, 90).map((x) => [x, m.fn(x)] as [number, number]),
          note: `new houses: MSE ${f(fitMse(m.fn, VAL), 0)}`,
        })),
      },
      highlight: ["model", "val", "curve"],
      packets: [
        { from: "val", to: "model", label: "score on unseen houses", tone: "cyan" },
        { from: "model", to: "pred", label: `overfit val MSE ${f(fitMse(wiggle, VAL), 0)}`, tone: "rose" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: "Scores",
        columns: ["model", "train MSE", "val MSE"],
        rows: FITS.map((m) => [m.name.split(":")[0], f(fitMse(m.fn, SUB), 0), f(fitMse(m.fn, VAL), 0)]),
        highlightRow: 1,
        caption: `The overfit curve predicts ${usd(wiggle(VAL[2].size))} for a ${sqft(VAL[2].size)} house that sold for ${usd(VAL[2].price)}.`,
      },
      deeper: {
        math: ["Bias–variance: expected error = bias² + variance + irreducible noise.", "Degree-6 polynomial through 7 points: zero training error by construction (Lagrange interpolation)."],
      },
      log: FITS.map((m) => ({ tone: m.tone, cells: { stage: "compare", train: f(fitMse(m.fn, SUB), 0), val: f(fitMse(m.fn, VAL), 0), note: m.name } })),
      interviewTip: "Diagnose from the two numbers: high train + high val = underfit; low train + high val = overfit.",
    },
    // 9 ─────────────────────────────────────────────────────────────
    {
      id: "inference",
      title: "Use the trained model",
      simple: "Learning is done. To price a new house, read its size off the line.",
      explain: `Using a trained model is called {{inference}}: no answers needed, nothing changes inside. A ${sqft(NEW_SIZE)} house → ${f(FINAL.w, 1)} × ${NEW_SIZE} + ${f(FINAL.b, 1)} = **${usd(NEW_PRICE)}**. Only now do we open the test set once: the model is off by about **${usd(TEST_MAE)}** on average there.`,
      detail:
        "Training is over; the dials are frozen. Inference is just running the rule on a new input: no labels, no loss, no learning, so it is fast and cheap compared with training.\n\nThe test set is unlocked once to report an honest number: how far off the model is on houses it has never seen and was never tuned on. If you tune on it, it stops being a test set.",
      stage: {
        kind: "fit",
        mode: "predict",
        points: trainPts,
        xLabel: "size (1,000 sq ft)",
        yLabel: "price ($k)",
        x: X_DOM,
        y: Y_DOM,
        lines: [{ w: FINAL.w, b: FINAL.b }],
        newPoint: { x: NEW_SIZE, label: `${sqft(NEW_SIZE)} → ${usd(NEW_PRICE)}` },
      },
      highlight: ["user", "model", "pred", "test"],
      packets: [
        { from: "user", to: "model", label: sqft(NEW_SIZE), tone: "cyan" },
        { from: "model", to: "pred", label: `ŷ = ${f(FINAL.w, 1)}×${NEW_SIZE} + ${f(FINAL.b, 1)} = ${usd(NEW_PRICE)}`, tone: "green" },
        { from: "test", to: "model", label: `test MAE ${usd(TEST_MAE)}`, tone: "slate" },
      ],
      viz: [
        {
          only: "interview",
          kind: "table",
          title: "Test set (first and only look)",
          columns: ["size", "predicted", "actual", "error"],
          rows: TEST.map((h) => {
            const p = predict(FINAL.w, FINAL.b, h.size);
            return [sqft(h.size), usd(p), usd(h.price), `${p - h.price >= 0 ? "+" : "−"}${f(Math.abs(p - h.price), 0)}`];
          }),
          caption: `Test MAE ≈ $${f(TEST_MAE, 1)}k, RMSE ≈ $${f(TEST_RMSE, 1)}k.`,
        },
        {
          only: "interview",
          kind: "table",
          title: "Training vs inference",
          columns: ["", "Training", "Inference"],
          rows: [
            ["Needs labels", "yes", "no"],
            ["Changes weights", "yes", "no"],
            ["Cost", "many passes over data", "one forward pass"],
            ["When", "offline, occasionally", "every request"],
          ],
        },
      ],
      deeper: {
        code: {
          lang: "python",
          src: `
price = w * 2.0 + b            # inference: one multiply and one add
test_mae = np.mean(np.abs(w * x_test + b - y_test))`,
        },
      },
      log: [
        { tone: "green", cells: { stage: "inference", note: `${sqft(NEW_SIZE)} → ${usd(NEW_PRICE)}` } },
        { tone: "slate", cells: { stage: "test", mae: f(TEST_MAE, 1), note: `RMSE ${f(TEST_RMSE, 1)} on ${TEST.length} unseen houses` } },
      ],
      interviewTip: "If you tune on the test set, it stops being a test set. Say so.",
    },
  ],
  interview: [
    {
      id: "ml-1",
      level: "fresher",
      q: "What is the difference between supervised, unsupervised and reinforcement learning?",
      answer:
        "Supervised learning learns from labelled examples (inputs with the correct output) — e.g. predicting house prices. Unsupervised learning finds structure in unlabelled data — clustering customers, reducing dimensions. Reinforcement learning learns a policy by acting in an environment and receiving rewards — game playing, robotics, and fine-tuning LLMs from human preference signals.",
      lookFor: "One clear example of each and the key difference: what signal the model learns from.",
      wrong: "“Unsupervised learning means no human was involved.” Humans still choose data, features and objectives; it just has no labels.",
    },
    {
      id: "ml-2",
      level: "fresher",
      q: "What are features and labels?",
      answer: "Features are the inputs the model uses to make a prediction (size, location, bedrooms). The label is the target value the model should predict (the sale price). Training learns a mapping from features to labels.",
      lookFor: "Concrete example and the direction of the mapping.",
      wrong: "Calling the label a feature, or saying the model “stores” the labels.",
    },
    {
      id: "ml-3",
      level: "fresher",
      q: "What is the difference between training and inference?",
      answer: "Training uses labelled data to adjust the model's parameters by minimising a loss, usually over many passes. Inference uses the trained, frozen model to make predictions on new inputs — no labels and no weight updates, usually a single forward pass.",
      lookFor: "Weights change in training and not in inference; cost and frequency differ.",
      wrong: "“The model keeps learning from every prediction it makes.” Not unless you explicitly build online learning or retraining.",
    },
    {
      id: "ml-4",
      level: "fresher",
      q: "Why do we split data into training, validation and test sets?",
      answer: "To measure how well the model generalises. Train is for learning parameters; validation is for choosing hyperparameters and spotting overfitting; test is held out until the end for one unbiased estimate. A common split is 70/15/15 or 80/10/10; with little data, use cross-validation instead of a single validation split.",
      lookFor: "Distinct roles of validation vs test, and that the test set must not influence any decision.",
      wrong: "“Validation and test are the same thing.” If you tune on it, it is validation, and your reported score is optimistic.",
    },
    {
      id: "ml-5",
      level: "mid",
      q: "MSE vs MAE: when would you choose each?",
      answer: "MSE squares errors, so it punishes large errors heavily and is smooth everywhere, which suits gradient-based optimisation; it is sensitive to outliers. MAE treats all errors linearly, so it is more robust to outliers and easier to explain (“off by $X on average”), but its gradient is constant in size and undefined at zero. Huber loss is a compromise: quadratic for small errors, linear for large ones.",
      lookFor: "Outlier sensitivity, optimisation behaviour, and the business meaning of the metric.",
      wrong: "“MSE is always better because it's more mathematical.”",
    },
    {
      id: "ml-6",
      level: "mid",
      q: "What happens if the learning rate is too high or too low?",
      answer: "Too high: updates overshoot the minimum, loss oscillates or diverges (can go to NaN). Too low: training is very slow and can stall on plateaus. In practice you tune it, often with a warm-up and a decay schedule, and use adaptive optimisers like Adam that scale steps per parameter.",
      lookFor: "Both failure modes, how to detect them from the loss curve, and practical remedies.",
      wrong: "“A higher learning rate always trains faster.” Past a point it stops converging at all.",
    },
    {
      id: "ml-7",
      level: "mid",
      q: "How do you detect and fix overfitting?",
      answer: "Detect it when training loss keeps improving but validation loss stalls or worsens — a growing gap. Fixes: get more (or augmented) data, simplify the model, add regularisation (L1/L2 weight penalties, dropout in neural nets), use early stopping on validation loss, and reduce leaky or noisy features.",
      lookFor: "Diagnosis from the train/val gap and several concrete remedies.",
      wrong: "“Train for more epochs” — that usually makes overfitting worse.",
    },
    {
      id: "ml-8",
      level: "mid",
      q: "Batch, mini-batch and stochastic gradient descent — what's the difference?",
      answer: "Batch GD computes the gradient on the full training set per update: accurate but expensive per step. Stochastic GD uses one example per update: cheap, noisy steps. Mini-batch (e.g. 32–1024 examples) is the standard middle ground: efficient on GPUs, and the noise can help escape poor regions. One epoch = enough updates to see every example once.",
      lookFor: "Trade-off between gradient accuracy, compute per step and hardware efficiency.",
      wrong: "“Stochastic means the model is random at inference time.”",
    },
    {
      id: "ml-9",
      level: "senior",
      q: "Explain the bias–variance trade-off with an example.",
      answer: "Expected error splits into bias² (error from wrong assumptions, e.g. a straight line for a curved relationship), variance (sensitivity to the particular training sample, e.g. a high-degree polynomial) and irreducible noise. Making a model more flexible usually lowers bias and raises variance. You pick the capacity — or the regularisation strength — that minimises validation error. Large neural nets complicate the simple picture (they can generalise well while fitting training data closely), but regularisation and validation-driven selection still apply.",
      lookFor: "The decomposition, a concrete example of each side, and how you'd choose in practice.",
      wrong: "“Bias means the model is unfair.” That is a different (fairness) meaning of the word.",
    },
    {
      id: "ml-10",
      level: "senior",
      q: "What is data leakage? Give three ways it happens.",
      answer: "Leakage is when information that won't be available at prediction time (or from the evaluation set) gets into training, inflating offline scores. Examples: fitting a scaler or imputer on the full dataset before splitting; a feature derived from the target (e.g. “final sale date” when predicting whether it sells); random splits on time-series data so the model trains on the future; the same customer appearing in both train and test.",
      lookFor: "Clear definition plus realistic examples, and prevention: split first, pipelines, time-based or group-based splits.",
      wrong: "“Leakage means the data was stolen.”",
    },
    {
      id: "ml-11",
      level: "senior",
      q: "Why does feature scaling matter for gradient descent?",
      answer: "If one feature ranges in thousands and another in fractions, the loss surface is a long, thin valley: one learning rate is too big for one direction and too small for the other, so GD zig-zags and converges slowly. Standardising features (mean 0, std 1) makes the surface rounder and lets one learning rate work for all parameters. Tree-based models don't need it; distance-based and gradient-trained models do.",
      lookFor: "The geometry of the loss surface and which model families care.",
      wrong: "“Scaling changes what the model can learn.” For linear models it changes the optimisation, not the set of possible solutions.",
    },
    {
      id: "ml-12",
      level: "senior",
      design: true,
      q: "Design a house-price prediction model for a property website. Walk me through it.",
      answer: "1) Define the goal and metric: e.g. MAE or median absolute percentage error, because users read “off by X”. 2) Data: past sales with size, location, age, rooms; check quality and outliers. 3) Split by time (train on older sales, validate on newer) and keep a final test period. 4) Baseline: median price per area, then linear regression, then gradient-boosted trees. 5) Features: location encodings, price-per-area history; fit all preprocessing on training data only. 6) Evaluate per segment (cheap vs luxury, regions) not just overall. 7) Ship with monitoring for drift (market moves), retrain on a schedule, and show a range rather than a single number.",
      lookFor: "Metric choice tied to the user, time-based split, baseline first, leakage awareness, segment analysis, monitoring and retraining.",
      wrong: "Jumping straight to “train a deep neural network on all the data” without a metric, baseline or split strategy.",
    },
    {
      id: "ml-13",
      level: "senior",
      design: true,
      q: "Your model scored well offline but performs badly in production. What do you check?",
      answer: "Training/serving skew (features computed differently online), data leakage that inflated offline scores, distribution shift (new regions, new market conditions), stale features or missing values in production, label definition differences, and whether the offline metric matches the business outcome. Compare live feature distributions to training, replay production inputs through the offline pipeline, and add monitoring plus a shadow or A/B rollout.",
      lookFor: "A systematic list with ways to verify each, not a single guess.",
      wrong: "“Retrain with more epochs.”",
    },
  ],
  quiz: [
    {
      id: "mlq-1",
      q: `A model predicts ${f(EX[0].pred, 1)}, ${f(EX[1].pred, 1)}, ${f(EX[2].pred, 1)} for houses that sold at ${EX[0].price}, ${EX[1].price}, ${EX[2].price}. What is the MSE?`,
      options: [f(mean(EX.map((e) => Math.abs(e.err))), 1), f(EX_MSE, 1), f(Math.sqrt(EX_MSE), 1), f(EX.reduce((s, e) => s + e.sq, 0), 1)],
      correct: 1,
      explain: `Square each error and average: (${EX.map((e) => f(e.sq, 1)).join(" + ")}) / 3 = ${f(EX_MSE, 1)}. The other options are MAE, RMSE and the un-averaged sum.`,
    },
    {
      id: "mlq-2",
      q: "With 20 examples and a 70/15/15 split, how many go to training?",
      options: ["10", "14", "15", "17"],
      correct: 1,
      explain: "70% of 20 = 14, leaving 3 for validation and 3 for test.",
    },
    {
      id: "mlq-3",
      q: "Training loss keeps falling while validation loss rises. What is happening?",
      options: ["Underfitting", "Overfitting", "The learning rate is too low", "The test set leaked"],
      correct: 1,
      explain: "The model is fitting the training set's noise and getting worse on unseen data — overfitting. Stop early or regularise.",
    },
    {
      id: "mlq-4",
      q: "In gradient descent, which way do you move the weights?",
      options: ["Along the gradient", "Opposite the gradient", "Perpendicular to the gradient", "Randomly, then keep the best"],
      correct: 1,
      explain: "The gradient points uphill (where loss increases fastest), so w ← w − α·∇L moves downhill.",
    },
    {
      id: "mlq-5",
      q: `The trained model is price = ${f(FINAL.w, 1)} × size + ${f(FINAL.b, 1)} (size in 1,000 sq ft, price in $k). What does it predict for 2,000 sq ft?`,
      options: [usd(FINAL.w * 2), usd(NEW_PRICE), usd(FINAL.w + FINAL.b), usd(FINAL.w * 2000 + FINAL.b)],
      correct: 1,
      explain: `${f(FINAL.w, 1)} × 2.0 + ${f(FINAL.b, 1)} = ${f(NEW_PRICE, 1)} → about ${usd(NEW_PRICE)}. Size must be in the same units the model was trained on (thousands of sq ft).`,
    },
    {
      id: "mlq-6",
      q: "What is the test set for?",
      options: ["Tuning the learning rate", "Early stopping", "One final, unbiased estimate of performance", "Extra training data when you run out"],
      correct: 2,
      explain: "Tuning and early stopping use the validation set. The test set is looked at once, at the end.",
    },
  ],
};

export default scenario;
