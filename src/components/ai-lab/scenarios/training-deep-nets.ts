import type { Scenario } from "../engine/types";
import { f } from "../engine/math";

/* ------------------------------------------------------------------ *
 * Training a deep net in practice. Optimiser paths, schedules, the
 * vanishing-gradient product and normalisation are computed here.
 * ------------------------------------------------------------------ */

// A simple bowl: loss = 0.4·(w − 3)² + 0.6. Compare plain SGD with momentum.
const LOSS = (w: number) => 0.4 * (w - 3) ** 2 + 0.6;
const CURVE: [number, number][] = Array.from({ length: 61 }, (_, i) => {
  const w = i * 0.1;
  return [w, LOSS(w)];
});
const grad = (w: number) => 0.8 * (w - 3);
const walk = (start: number, lr: number, n: number, momentum = 0) => {
  const out = [start];
  let w = start, v = 0;
  for (let i = 0; i < n; i++) {
    v = momentum * v + grad(w);
    w = w - lr * v;
    out.push(Math.max(0, Math.min(6, w)));
  }
  return out;
};
const SGD = walk(0.3, 0.3, 8);
const MOM = walk(0.3, 0.3, 8, 0.6);

// Learning-rate schedule: linear warm-up then cosine decay.
const TOTAL = 100, WARM = 10, PEAK = 3e-4;
const LR = (s: number) => (s < WARM ? (PEAK * (s + 1)) / WARM : 0.5 * PEAK * (1 + Math.cos((Math.PI * (s - WARM)) / (TOTAL - WARM))));

// Vanishing gradients: sigmoid derivative is at most 0.25, so 10 layers multiply it.
const LAYERS = 10;
const SIG_MAX = 0.25;
const VANISH = SIG_MAX ** LAYERS;

// Normalisation on one batch of 4 values.
const RAW = [120, 80, 100, 60];
const MU = RAW.reduce((a, b) => a + b, 0) / RAW.length;
const SD = Math.sqrt(RAW.reduce((s, x) => s + (x - MU) ** 2, 0) / RAW.length);
const NORM = RAW.map((x) => (x - MU) / SD);

// Dropout: keep probability 0.8 at train time, scaled by 1/0.8.
const KEEP = 0.8;
const ACTS = [0.6, 1.2, 0.0, 0.9, 0.4];
const MASK = [1, 0, 1, 1, 0];
const DROPPED = ACTS.map((a, i) => (MASK[i] ? a / KEEP : 0));

// Mixed precision memory per parameter (bytes) for the weights only.
const FP32 = 4, BF16 = 2;

const scenario: Scenario = {
  id: "training-deep-nets",
  title: "Training deep nets in practice",
  tagline: "Optimisers, learning-rate schedules, normalisation and the tricks that make big models train.",
  imagine:
    "Imagine teaching a hundred-storey building to pass a bucket from the roof to the ground. If each floor drops a little water, nothing arrives. If each floor adds a little, it floods. Deep-learning tricks (good starting weights, normalisation, skip connections, careful step sizes) keep the bucket the right size all the way down.",
  recap: [
    "**Adam** adapts the step size per weight and adds momentum; pair it with **warm-up then decay** for the learning rate.",
    "Deep stacks lose or blow up gradients; fix with **ReLU-family activations, good initialisation, normalisation, residual connections** and gradient clipping.",
    "Fight overfitting with **dropout, weight decay, data augmentation and early stopping**; train faster with **bf16 mixed precision** and gradient accumulation.",
  ],
  overview: {
    plain:
      "A neural network learns by taking many small steps downhill on its error. Training deep ones needs a few practical tricks: a smart step-taker (optimiser), a step size that changes over time, ways to keep signals from fading through many layers, and ways to stop it memorising.",
    definition:
      "Practical deep-learning training combines an {{optimiser}} (SGD with momentum, {{adam|Adam/AdamW}}), a {{lr-schedule|learning-rate schedule}} (warm-up + cosine or linear decay), stability tools against {{vanishing|vanishing/exploding gradients}} (He/Xavier init, {{batchnorm|BatchNorm}} or {{layernorm|LayerNorm}}, residual connections, gradient clipping), regularisation ({{dropout}}, weight decay, augmentation, early stopping) and efficiency (mixed precision, gradient accumulation, checkpointing).",
    analogy: "Walking down a foggy mountain: momentum keeps you rolling, the step size shrinks near the bottom, and handrails (normalisation) stop you slipping.",
    facts: [
      ["Default optimiser", "AdamW, lr ≈ 1e-4 to 3e-4 for transformers (check your setup)"],
      ["Schedule", `warm-up ${WARM} steps, then cosine decay to ~0`],
      ["Sigmoid × 10 layers", `gradient shrinks to ≤ ${VANISH.toExponential(1)}`],
      ["CNNs", "BatchNorm; transformers: LayerNorm / RMSNorm"],
      ["Dropout", "train only, keep-prob scaling; off at inference"],
      ["Mixed precision", `bf16 weights ${BF16} B vs fp32 ${FP32} B, ~2× faster on modern GPUs`],
    ],
    whereUsed: "Every model you train or fine-tune: transformers, CNNs, recommenders. These are also the first follow-up questions after “explain backprop”.",
  },
  objects: [
    { id: "batch", kind: "table", label: "Mini-batch", sub: "e.g. 32 examples", at: [0, 1.8], tone: "blue" },
    { id: "net", kind: "llm", label: "Deep network", sub: "many layers", at: [3, 1.8], tone: "violet" },
    { id: "loss", kind: "gauge", label: "Loss", sub: "how wrong", at: [6, 0], tone: "rose" },
    { id: "grads", kind: "matrix", label: "Gradients", sub: "backprop", at: [6, 3.6], tone: "amber" },
    { id: "opt", kind: "gear", label: "Optimiser", sub: "AdamW + schedule", at: [9, 1.8], tone: "green" },
  ],
  links: [
    { id: "l1", from: "batch", to: "net" },
    { id: "l2", from: "net", to: "loss" },
    { id: "l3", from: "loss", to: "grads" },
    { id: "l4", from: "grads", to: "opt" },
    { id: "l5", from: "opt", to: "net" },
  ],
  logTitle: "Training notes",
  logColumns: [
    { key: "knob", label: "Knob", width: "26%" },
    { key: "choice", label: "Choice" },
    { key: "why", label: "Why" },
  ],
  steps: [
    {
      id: "batches",
      title: "Learn from small batches, not all at once",
      simple: "The model looks at a small handful of examples, adjusts, then looks at the next handful.",
      easy: "Computing the error on a million examples before every tiny step would be painfully slow. Instead, take a **mini-batch** of, say, 32 examples, work out which way is downhill for them, take a step, and repeat. Each step is a bit noisy, but there are many of them, and the noise even helps escape bad spots.",
      explain:
        "Mini-batch stochastic gradient descent: estimate the gradient on a batch (32–4096 examples), update, repeat. One pass over the data is an **epoch**. Bigger batches give smoother gradients and better GPU use but often need a higher learning rate and warm-up; gradient accumulation fakes a big batch on a small GPU.",
      stage: {
        kind: "descent",
        curve: CURVE,
        steps: SGD,
        xLabel: "weight",
        yLabel: "loss",
        label: "plain SGD, lr 0.3",
        note: "each hop = one mini-batch update",
      },
      highlight: ["batch", "net", "loss"],
      packets: [{ from: "batch", to: "net", label: "32 examples", tone: "blue" }],
      log: [{ tone: "blue", cells: { knob: "batch size", choice: "32–256 per GPU", why: "noisy but fast steps" } }],
    },
    {
      id: "momentum",
      title: "Momentum and Adam: smarter steps",
      simple: "Momentum keeps rolling in a good direction. Adam also gives each weight its own step size.",
      easy: "Plain steps zig-zag. **Momentum** is like a ball rolling downhill: it remembers the previous direction and keeps going, so it gets to the bottom in fewer steps. **Adam** adds one more idea: weights that get huge, jumpy gradients take **smaller** steps, and quiet ones take **bigger** steps. That is why Adam is the default for most deep learning.",
      explain:
        "Momentum keeps a running average of gradients (v = βv + g). {{adam|Adam}} keeps both the average gradient (m) and the average squared gradient (v) per parameter and steps by m/√v, so each weight gets an adaptive step. **AdamW** applies weight decay separately from the gradient, which regularises properly and is the transformer default.",
      stage: {
        kind: "descent",
        curve: CURVE,
        steps: MOM,
        xLabel: "weight",
        yLabel: "loss",
        label: "with momentum 0.6",
        compare: [{ label: "plain SGD", tone: "slate", steps: SGD }],
        note: "momentum overshoots a little, then settles faster",
      },
      highlight: ["opt"],
      log: [{ tone: "green", cells: { knob: "optimiser", choice: "AdamW (β1 0.9, β2 0.999)", why: "adaptive per-weight steps" } }],
      deeper: {
        math: ["m ← β₁m + (1 − β₁)g", "v ← β₂v + (1 − β₂)g²", "w ← w − lr · m̂ / (√v̂ + ε) − lr · λ · w   (AdamW)"],
        code: { lang: "python", src: "opt = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)" },
      },
    },
    {
      id: "schedule",
      title: "Warm up, then slow down",
      simple: "Start with tiny steps, speed up, then take smaller and smaller steps as you get close.",
      easy: `At the very start the network is random, so big steps can throw it off a cliff. So the step size **warms up** over the first ${WARM} steps to its peak, then **slowly shrinks** in a smooth curve until the end. Small steps at the end let it settle neatly at the bottom.`,
      explain: `A {{lr-schedule|schedule}}: linear warm-up for ${WARM} steps to ${PEAK.toExponential(0)}, then cosine decay over the remaining ${TOTAL - WARM}. Warm-up protects Adam's early, unreliable second-moment estimates; decay lowers noise near the minimum. The learning rate is usually the single most important hyperparameter.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "plot",
          title: "Learning rate per step",
          series: [{ label: "warm-up + cosine", points: Array.from({ length: TOTAL }, (_, s) => [s, LR(s) * 1e4]), tone: "green" }],
          x: [0, TOTAL],
          y: [0, PEAK * 1e4 * 1.1],
          xLabel: "training step",
          yLabel: "lr × 10⁻⁴",
          markers: [{ x: WARM, y: PEAK * 1e4, label: "peak", tone: "amber" }],
        },
      },
      log: [{ tone: "green", cells: { knob: "learning rate", choice: `warm-up ${WARM} → cosine`, why: "stable start, gentle finish" } }],
      interviewTip: "If loss explodes or goes NaN, first suspects: learning rate too high, no warm-up, no gradient clipping.",
    },
    {
      id: "vanish",
      title: "Deep stacks lose their signal",
      simple: "Each layer can shrink the learning signal a bit. Through many layers it fades to almost nothing.",
      easy: `During backprop, the error signal is **multiplied** at every layer on its way back. With the old sigmoid activation that multiplier is at most **0.25**. Ten layers: 0.25 × 0.25 × … ten times = **${VANISH.toExponential(1)}**. The first layers get almost no signal, so they barely learn. That is the **vanishing gradient** problem (multipliers above 1 cause the opposite: **exploding**).`,
      explain: `{{vanishing|Vanishing gradients}}: the chain rule multiplies per-layer derivatives; sigmoid's derivative ≤ 0.25, so after ${LAYERS} layers ≤ ${VANISH.toExponential(1)}. Fixes: ReLU/GELU activations (derivative 1 where active), He/Xavier initialisation, normalisation layers, **residual connections** (x + f(x) gives a direct path for gradients), and gradient clipping for explosions.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "bars",
          title: "Biggest possible gradient reaching each layer (sigmoid)",
          items: Array.from({ length: 6 }, (_, i) => ({ label: i === 0 ? "output layer" : `${i * 2} layers back`, value: SIG_MAX ** (i * 2), tone: (i < 2 ? "green" : i < 4 ? "amber" : "rose") as "green" | "amber" | "rose" })),
          max: 1,
          format: "fixed4",
          caption: "Each step back multiplies by at most 0.25. Residual connections and ReLU keep this near 1.",
        },
      },
      highlight: ["grads"],
      packets: [{ from: "loss", to: "grads", label: "signal fades going back", tone: "rose" }],
      log: [{ tone: "amber", cells: { knob: "activation + skips", choice: "GELU/ReLU + residual", why: "gradients reach early layers" } }],
    },
    {
      id: "norm",
      title: "Normalisation keeps numbers in a good range",
      simple: "Shift and scale numbers to average 0 and spread 1, so every layer sees tidy inputs.",
      easy: `If one layer outputs numbers like 60–120 and the next expects small values, training wobbles. **Normalisation** rescales them: subtract the average (${f(MU, 0)}), divide by the spread (${f(SD, 1)}). The values ${RAW.join(", ")} become ${NORM.map((x) => f(x, 2)).join(", ")}. **BatchNorm** does this across the batch (great for images); **LayerNorm** does it across one example's features (used in transformers).`,
      explain: `Normalise to mean 0, variance 1, then apply learned scale γ and shift β. {{batchnorm|BatchNorm}} uses batch statistics (needs reasonable batch sizes, different behaviour at inference). {{layernorm|LayerNorm}} (and RMSNorm) normalises each token's features independently, so it works for any batch size and sequence; transformers use it.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "One feature across a batch of 4",
          columns: ["raw", "minus mean", "÷ spread"],
          rows: RAW.map((x, i) => [x, f(x - MU, 0), f(NORM[i], 2)]),
          caption: `mean ${f(MU, 0)}, standard deviation ${f(SD, 1)}`,
        },
      },
      deeper: { math: ["x̂ = (x − μ) / √(σ² + ε)", "y = γ · x̂ + β"] },
      log: [{ tone: "violet", cells: { knob: "normalisation", choice: "LayerNorm (transformers), BatchNorm (CNNs)", why: "stable, faster training" } }],
    },
    {
      id: "regularise",
      title: "Dropout and friends stop memorising",
      simple: "Randomly switching off some neurons in training forces the network not to rely on any single one.",
      easy: `**Dropout** randomly switches off some neurons on each training step (here 1 in 5). The network can't rely on any single neuron, so it learns sturdier patterns. The survivors are scaled up (÷ ${KEEP}) so totals stay the same, and at prediction time dropout is **off**. Other tools: **weight decay**, **more or augmented data** (flipped photos, reworded text), and **early stopping**.`,
      explain: `{{dropout|Dropout}} with keep probability ${KEEP}: zero activations by a random mask and scale survivors by 1/${KEEP} (inverted dropout), so no change is needed at inference. Combine with weight decay (AdamW), data augmentation and early stopping on validation loss.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "One training step with dropout",
          columns: ["neuron", "activation", "kept?", "passed on"],
          rows: ACTS.map((a, i) => [`n${i + 1}`, f(a, 1), MASK[i] ? "yes" : "dropped", f(DROPPED[i], 2)]),
          caption: `survivors × 1/${KEEP} = ×${f(1 / KEEP, 2)}`,
        },
      },
      highlight: ["net"],
      log: [{ tone: "rose", cells: { knob: "regularisation", choice: "dropout 0.1, weight decay 0.01", why: "less memorising" } }],
    },
    {
      id: "speed",
      title: "Train faster: mixed precision and friends",
      simple: "Use smaller number formats where safe, and tricks that fit a big batch into a small GPU.",
      easy: `Most maths can use **16-bit** numbers instead of 32-bit: half the memory, and modern GPUs run it about twice as fast. **bf16** keeps the same range as 32-bit, so it rarely overflows. If the GPU can't hold a big batch, add up gradients over several small batches before stepping (**gradient accumulation**). If activations don't fit, recompute some on the way back (**checkpointing**).`,
      explain: `Mixed precision: compute in bf16/fp16 (${BF16} B) with fp32 master weights where needed; fp16 needs loss scaling, bf16 usually doesn't. Gradient accumulation simulates large batches; activation checkpointing trades compute for memory. For multi-GPU: data parallel (DDP), sharded optimisers (ZeRO/FSDP), tensor and pipeline parallelism.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Speed and memory tools",
          columns: ["tool", "saves", "cost"],
          rows: [
            ["bf16 mixed precision", "~½ memory, ~2× speed", "rare precision issues"],
            ["gradient accumulation", "big batch on small GPU", "slower per update"],
            ["activation checkpointing", "activation memory", "~30% more compute"],
            ["FSDP / ZeRO", "splits weights + optimiser across GPUs", "network traffic"],
            ["gradient clipping (norm 1.0)", "stops explosions", "none really"],
          ],
        },
      },
      highlight: ["opt"],
      log: [{ tone: "slate", cells: { knob: "precision", choice: "bf16 autocast", why: "faster, less memory" } }],
    },
  ],
  interview: [
    {
      id: "td-1",
      level: "fresher",
      q: "Why does Adam usually train faster than plain SGD?",
      answer: "Adam combines momentum (a running average of gradients) with a per-parameter adaptive step from the running average of squared gradients, so steep, noisy directions take smaller steps and flat ones larger steps. It needs less tuning. SGD with momentum can still generalise slightly better in some vision tasks.",
      lookFor: "Momentum + adaptive scaling, AdamW for decay, honest trade-off.",
      wrong: "“Adam uses a bigger learning rate.”",
    },
    {
      id: "td-2",
      level: "mid",
      q: "What causes vanishing gradients and how do modern networks avoid them?",
      answer: "Backprop multiplies per-layer derivatives; if they are below 1 (sigmoid/tanh saturation, poor init) the product shrinks exponentially with depth. Fixes: ReLU/GELU, He/Xavier initialisation, normalisation layers, residual connections that give gradients a direct path, and gating in LSTMs. Exploding gradients get clipping.",
      lookFor: "Chain-rule product, several fixes, residuals named.",
      wrong: "“Use a bigger learning rate so the gradients get bigger.”",
    },
    {
      id: "td-3",
      level: "mid",
      q: "BatchNorm vs LayerNorm: why do transformers use LayerNorm?",
      answer: "BatchNorm normalises each feature across the batch, so it depends on batch statistics and behaves differently at inference; it suits CNNs with large batches. LayerNorm normalises across the features of each example, independent of batch size and sequence length, which suits variable-length sequences and autoregressive generation.",
      lookFor: "Which axis, batch dependence, train/inference difference.",
      wrong: "“They are the same but LayerNorm is newer.”",
    },
    {
      id: "td-4",
      level: "senior",
      q: "Your loss goes NaN after 2,000 steps. How do you debug it?",
      answer: "Check for a learning-rate spike or missing warm-up, add gradient-norm logging and clipping, look for fp16 overflow (switch to bf16 or enable loss scaling), inspect the batch that triggered it for bad data (inf, empty, huge values), check divisions or logs of zero in custom losses, and reproduce with a fixed seed.",
      lookFor: "Systematic: lr, gradients, precision, data, custom ops, reproducibility.",
      wrong: "“Restart training and hope.”",
    },
  ],
  quiz: [
    {
      id: "tdq-1",
      q: `Sigmoid's derivative is at most 0.25. Through ${LAYERS} layers the gradient can shrink to about…`,
      options: ["0.25", "2.5", VANISH.toExponential(1), "0"],
      correct: 2,
      explain: `0.25 multiplied by itself ${LAYERS} times.`,
    },
    {
      id: "tdq-2",
      q: "Why warm up the learning rate?",
      options: ["To use less memory", "Early updates are unreliable, big steps can wreck a random model", "To increase dropout", "It makes the final loss zero"],
      correct: 1,
      explain: "Small early steps let Adam's statistics settle before full-size updates.",
    },
    {
      id: "tdq-3",
      q: "At inference time, dropout is…",
      options: ["Doubled", "Off", "Same as training", "Applied to the input only"],
      correct: 1,
      explain: "With inverted dropout, survivors were already scaled during training.",
    },
    {
      id: "tdq-4",
      q: "Transformers mostly use…",
      options: ["BatchNorm", "LayerNorm / RMSNorm", "No normalisation", "Dropout only"],
      correct: 1,
      explain: "Per-example normalisation works for any batch size and sequence length.",
    },
  ],
};

export default scenario;
