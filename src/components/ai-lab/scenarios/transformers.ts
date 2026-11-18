import type { Scenario } from "../engine/types";
import { add, crossEntropy, f, layerNorm, matmul, positionalEncoding, relu, seeded, softmax, transpose, vec } from "../engine/math";

/* ------------------------------------------------------------------ *
 * Toy transformer on "The cat is sleeping". d_model = 6, d_k = 3.
 * Every number below is computed — change a weight and the whole
 * walkthrough (heatmaps, bars, trace rows) updates consistently.
 * ------------------------------------------------------------------ */

const TOKENS = ["The", " cat", " is", " sleeping"];
const SHOW = ["The", "␣cat", "␣is", "␣sleeping"];
const SHORT = ["The", "cat", "is", "sleeping"];
/** Illustrative IDs: every tokenizer has its own vocabulary, so real IDs differ. */
const IDS = [791, 8415, 374, 21811];
const D = 6;
const DK = 3;

/**
 * Embedding rows. Dims 0–1 are left empty so the fast sin/cos position signal
 * has room; dims 2–5 are toy meanings: [animal, action, function-word, state].
 */
const E = [
  [0, 0, 0.2, 0.0, 1.8, 0.0],
  [0, 0, 1.8, 0.2, 0.0, 0.4],
  [0, 0, 0.0, 0.8, 1.4, 0.6],
  [0, 0, 0.4, 1.8, 0.0, 1.6],
];
const PE = TOKENS.map((_, p) => positionalEncoding(p, D));
const X = E.map((row, p) => add(row, PE[p]));

const Wq = [
  [0, 0, 0],
  [0, 0, 0],
  [0.2, 0, 0],
  [1.0, 0, 0.2],
  [0, 0.8, 0],
  [0.5, 0, 0.6],
];
const Wk = [
  [0, 0, 0],
  [0, 0, 0],
  [1.0, 0, 0.1],
  [0, 0.2, 0.4],
  [0, 0.6, 0],
  [0.1, 0, 0.7],
];
const Wv = [
  [0, 0, 0],
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [0.3, 0.3, 0],
];

const Q = matmul(X, Wq);
const K = matmul(X, Wk);
const V = matmul(X, Wv);
const SCORES = matmul(Q, transpose(K)).map((r) => r.map((x) => x / Math.sqrt(DK)));
const A = SCORES.map((r) => softmax(r));
const O = matmul(A, V);

/** Causal (decoder) version: token i may only look at tokens 0..i. */
const A_CAUSAL = SCORES.map((r, i) => softmax(r.map((x, j) => (j <= i ? x : -Infinity))));

/**
 * A second head that reads only the position dims (0–1 = sin p, cos p).
 * W_K rotates the key by one position, so q_i · k_j = α²·cos(i − j − 1):
 * largest when j = i − 1. That is a "previous-token head".
 */
const ALPHA = 2.5;
const zeros = (r: number, c: number) => Array.from({ length: r }, () => Array(c).fill(0) as number[]);
const Wq2 = zeros(D, DK);
Wq2[0][0] = ALPHA;
Wq2[1][1] = ALPHA;
const Wk2 = zeros(D, DK);
Wk2[0][0] = ALPHA * Math.cos(1);
Wk2[0][1] = -ALPHA * Math.sin(1);
Wk2[1][0] = ALPHA * Math.sin(1);
Wk2[1][1] = ALPHA * Math.cos(1);
const Q2 = matmul(X, Wq2);
const K2 = matmul(X, Wk2);
const A2 = matmul(Q2, transpose(K2)).map((r) => softmax(r.map((x) => x / Math.sqrt(DK))));

const argmaxRow = (r: number[]) => r.indexOf(Math.max(...r));

/** Output projection W_o (d_k → d_model), then residual + LayerNorm for each token. */
const Wo = [
  [0.1, 0.0, 0.5, 0.1, 0.0, 0.2],
  [0.0, 0.1, 0.0, 0.4, 0.3, 0.1],
  [0.0, 0.0, 0.2, 0.0, 0.4, 0.3],
];
const ATTN_OUT = matmul(O, Wo);
const RESID = X.map((x, i) => add(x, ATTN_OUT[i]));
const NORMED = RESID.map((r) => layerNorm(r));

/** Feed-forward: 6 → 12 (ReLU) → 6, seeded weights so the numbers are stable. */
const rnd = seeded(7);
const W1 = Array.from({ length: D }, () => Array.from({ length: 12 }, () => +(rnd() * 1.2 - 0.6).toFixed(2)));
const W2 = Array.from({ length: 12 }, () => Array.from({ length: D }, () => +(rnd() * 1.2 - 0.6).toFixed(2)));
const H_FFN = matmul([NORMED[3]], W1)[0].map(relu);
const FFN_OUT = matmul([H_FFN], W2)[0];
const BLOCK_OUT = layerNorm(add(NORMED[3], FFN_OUT));

/** Next-token head: a toy 5-word slice of the vocabulary. */
const CANDIDATES = [" on", " in", ".", " peacefully", ","];
const LOGITS = [2.3, 1.9, 1.6, 0.8, 0.4];
const PROBS = softmax(LOGITS);
const TARGET = 0; // the training text continues "… sleeping on the sofa"
const LOSS = crossEntropy(PROBS[TARGET]);

const mat = (m: number[][]) => m.map((r) => r.map((x) => +x.toFixed(2)));

const scenario: Scenario = {
  id: "transformers",
  title: "Transformers & attention",
  tagline: "Every token looks at every other token and decides what matters — all at once.",
  overview: {
    definition:
      "A **transformer** is a neural network built around {{self-attention}}: each {{token}} builds its new meaning by taking a weighted mix of every token in the context. Stack that (plus a small per-token {{ffn|feed-forward net}}) dozens of times and train it to predict the next token, and you get a large language model.",
    analogy:
      "A **cocktail party**. Every guest (token) has a question they want answered (**query**), a name badge saying what they know about (**key**), and the actual gossip they can share (**value**). Each guest scans every badge, listens most to the best matches, and walks away with a blend of what they heard.",
    facts: [
      ["Paper", "“Attention Is All You Need”, Vaswani et al., 2017"],
      ["Core op", "softmax(QKᵀ / √d_k) · V"],
      ["Replaces", "{{rnn|RNNs}} / {{lstm|LSTMs}} — no step-by-step loop over the sequence"],
      ["Training cost", "Attention compares every token with every token: O(n²) in sequence length n"],
      ["Families", "Encoder-only (BERT), decoder-only (GPT-style chat models), encoder–decoder (T5, the original)"],
      ["This demo", `d_model = ${D}, d_k = ${DK}, 4 tokens. Real models use d_model in the thousands.`],
    ],
    whereUsed: "Every modern LLM, most translation and speech models, vision transformers (ViT) and the embedding models behind semantic search.",
  },
  objects: [
    { id: "rnn", kind: "layer", label: "RNN / LSTM", sub: "old way: 1 word at a time", at: [2.4, -3.2], tone: "slate" },
    { id: "pos", kind: "chart", label: "Positional enc.", sub: "sin / cos by position", at: [7.2, -3.2], tone: "amber" },
    { id: "text", kind: "chat", label: "Input text", sub: "“The cat is sleeping”", at: [0, 0], tone: "cyan" },
    { id: "tokenizer", kind: "tool", label: "Tokenizer", sub: "BPE", at: [2.4, 0], tone: "violet" },
    { id: "tokens", kind: "tokens", label: "Token IDs", sub: "4 tokens", at: [4.8, 0], tone: "blue" },
    { id: "embed", kind: "matrix", label: "Embeddings", sub: "4 × d_model", at: [7.2, 0], tone: "blue" },
    { id: "qkv", kind: "layer", label: "Q · K · V", sub: "3 projections", at: [9.6, 0], tone: "violet" },
    { id: "attn", kind: "gpu", label: "Attention", sub: "softmax(QKᵀ/√d)·V", at: [12, 0], tone: "violet" },
    { id: "addnorm", kind: "box", label: "Add & Norm", sub: "residual + LayerNorm", at: [12, 3.6], tone: "cyan" },
    { id: "ffn", kind: "gear", label: "Feed-forward", sub: "per-token MLP", at: [9.6, 3.6], tone: "violet" },
    { id: "stack", kind: "layer", label: "Block × N", sub: "repeat the block", at: [7.2, 3.6], tone: "slate" },
    { id: "head", kind: "llm", label: "LM head", sub: "→ vocab logits", at: [4.8, 3.6], tone: "green" },
    { id: "next", kind: "dice", label: "Next token", sub: "softmax → pick", at: [2.4, 3.6], tone: "green" },
    { id: "loss", kind: "gauge", label: "Loss", sub: "cross-entropy", at: [0, 3.6], tone: "rose" },
  ],
  links: [
    { id: "l-rnn", from: "text", to: "rnn" },
    { id: "l1", from: "text", to: "tokenizer" },
    { id: "l2", from: "tokenizer", to: "tokens" },
    { id: "l3", from: "tokens", to: "embed" },
    { id: "l-pos", from: "pos", to: "embed" },
    { id: "l4", from: "embed", to: "qkv" },
    { id: "l5", from: "qkv", to: "attn" },
    { id: "l6", from: "attn", to: "addnorm" },
    { id: "l7", from: "addnorm", to: "ffn" },
    { id: "l8", from: "ffn", to: "stack" },
    { id: "l9", from: "stack", to: "head" },
    { id: "l10", from: "head", to: "next" },
    { id: "l11", from: "next", to: "loss" },
  ],
  logTitle: "tensor trace",
  logColumns: [
    { key: "op", label: "Operation", width: "26%" },
    { key: "what", label: "Token / tensor" },
    { key: "shape", label: "Shape", width: "12%" },
    { key: "value", label: "Value" },
  ],
  steps: [
    {
      id: "why",
      title: "Why not RNNs?",
      explain:
        "Before transformers, language models used {{rnn|RNNs}} and {{lstm|LSTMs}}. They read one word at a time and squeeze everything so far into a single running memory.\n\nTwo problems: **it is slow** (word 4 cannot start until word 3 is done, so a GPU cannot work on them in parallel) and **it forgets** (information from word 1 must survive every hop to reach word 400).\n\nA transformer lets every word look at every other word **directly, in one step**. That is the whole idea.",
      analogy: "An RNN is a game of telephone: the message passes person to person and degrades. Attention is everyone in one room hearing everyone else first-hand.",
      highlight: ["text", "rnn"],
      packets: [
        { from: "text", to: "rnn", label: "t1: The", tone: "slate" },
        { from: "text", to: "rnn", label: "t2: cat", tone: "slate" },
        { from: "text", to: "rnn", label: "t3: is", tone: "slate" },
        { from: "text", to: "rnn", label: "t4: sleeping", tone: "slate" },
      ],
      viz: {
        kind: "table",
        title: "RNN / LSTM vs transformer",
        columns: ["", "RNN / LSTM", "Transformer"],
        rows: [
          ["Reads tokens", "one after another", "all at once"],
          ["Path from token 1 to token n", "n steps", "1 step"],
          ["Training parallelism", "low (sequential)", "high (matrix maths)"],
          ["Cost vs length n", "O(n)", "O(n²) attention"],
        ],
        caption: "The trade: transformers pay O(n²) compute for direct, parallel access to the whole context.",
      },
      deeper: {
        math: ["RNN:  h_t = tanh(W_h · h_{t−1} + W_x · x_t + b)", "Gradient to x_1 passes through ∂h_t/∂h_{t−1} for every t → it shrinks or explodes (vanishing / exploding gradients).", "LSTM gates ease this but the loop is still sequential."],
      },
      log: [
        { tone: "slate", cells: { op: "rnn step t=1", what: "h₁ = f(h₀, “The”)", shape: "1 × d", value: "must wait" } },
        { tone: "slate", cells: { op: "rnn step t=2", what: "h₂ = f(h₁, “cat”)", shape: "1 × d", value: "must wait" } },
        { tone: "slate", cells: { op: "rnn step t=4", what: "h₄ = f(h₃, “sleeping”)", shape: "1 × d", value: "4 sequential hops" } },
      ],
      interviewTip: "Say both reasons: **parallel training** and **short paths between distant tokens**. Most candidates only mention one.",
    },
    {
      id: "tokens",
      title: "Text → tokens → embeddings + position",
      explain:
        "The {{tokenizer}} chops text into {{token|tokens}} — often whole words, sometimes word pieces — and swaps each for an integer ID. Note the leading space: in GPT-style {{bpe|BPE}} vocabularies, “ cat” (with space) and “cat” are different tokens.\n\nEach ID picks one row out of a big learned table: its {{embedding}}. Attention itself has no idea of word order, so we add a {{positional-encoding|positional encoding}} — a pattern of sines and cosines unique to each position.",
      analogy: "Tokens are LEGO bricks; the embedding is each brick's colour and shape; the position stamp says which slot it sits in.",
      highlight: ["text", "tokenizer", "tokens", "embed", "pos"],
      packets: [
        { from: "text", to: "tokenizer", label: "“The cat is sleeping”", tone: "cyan" },
        { from: "tokenizer", to: "tokens", label: `[${IDS.join(", ")}]`, sub: "illustrative IDs", tone: "blue" },
        { from: "tokens", to: "embed", label: "look up 4 rows", tone: "blue" },
        { from: "pos", to: "embed", label: "+ PE(pos)", tone: "amber" },
      ],
      viz: [
        { kind: "tokens", title: "Tokens and IDs", tokens: SHOW.map((t, i) => ({ text: t, id: IDS[i], tone: "blue" as const })), caption: "IDs here are made up for the demo — every tokenizer has its own vocabulary." },
        {
          kind: "matrices",
          title: "X = embedding + position",
          items: [
            { name: "E (lookup)", rowLabels: SHORT, values: mat(E), tone: "blue" },
            { name: "PE", values: mat(PE), tone: "amber" },
            { name: "X", values: mat(X), tone: "violet" },
          ],
          ops: ["+", "="],
          caption: "Toy 6-number embeddings (2 for position, 4 for meaning). Real models use 768 to 12,000+ numbers per token.",
        },
      ],
      deeper: {
        math: ["PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))", "PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))", `Position 1 → ${vec(PE[1])}`, "The original paper also multiplies embeddings by √d_model before adding PE. Many modern LLMs use RoPE (rotary embeddings) inside attention instead."],
      },
      log: [
        ...TOKENS.map((t, i) => ({ tone: "blue" as const, cells: { op: "tokenize", what: `“${t}” → ${IDS[i]}`, shape: "id", value: `pos ${i}` } })),
        { tone: "amber", cells: { op: "embed + PE", what: "X = E[ids] + PE", shape: `4 × ${D}`, value: `X[cat] = ${vec(X[1])}` } },
      ],
      interviewTip: "Tokens ≠ words. Pricing, context limits and speed are all counted in tokens.",
    },
    {
      id: "qkv",
      title: "Queries, keys and values",
      explain:
        "Each token's vector X is multiplied by three learned matrices to make three new vectors:\n\n- **{{query|Query}}** — what am I looking for?\n- **{{key|Key}}** — what do I contain?\n- **{{value|Value}}** — what will I hand over if picked?\n\nSame input, three different “views”. Training learns the matrices W_Q, W_K, W_V.",
      analogy: "At the cocktail party: the query is the question in your head, the key is the name badge, the value is the story the person actually tells.",
      highlight: ["embed", "qkv"],
      packets: [
        { from: "embed", to: "qkv", label: `X (4 × ${D})`, tone: "blue" },
        { from: "qkv", to: "attn", label: `Q, K, V (4 × ${DK})`, tone: "violet" },
      ],
      viz: {
        kind: "matrices",
        title: "Q = X·W_Q,  K = X·W_K,  V = X·W_V",
        items: [
          { name: "Q", rowLabels: SHORT, values: mat(Q), tone: "cyan" },
          { name: "K", values: mat(K), tone: "violet" },
          { name: "V", values: mat(V), tone: "green" },
        ],
        caption: `d_k = ${DK}: each token gets a 3-number query, key and value.`,
      },
      deeper: {
        code: {
          lang: "python",
          src: `
import numpy as np
X  = embeddings + positions        # (n, d_model)
Q  = X @ W_q                       # (n, d_k)
K  = X @ W_k                       # (n, d_k)
V  = X @ W_v                       # (n, d_v)`,
        },
      },
      log: [
        { tone: "violet", cells: { op: "project", what: "Q = X · W_Q", shape: `4 × ${DK}`, value: `Q[sleeping] = ${vec(Q[3])}` } },
        { tone: "violet", cells: { op: "project", what: "K = X · W_K", shape: `4 × ${DK}`, value: `K[cat] = ${vec(K[1])}` } },
        { tone: "violet", cells: { op: "project", what: "V = X · W_V", shape: `4 × ${DK}`, value: `V[cat] = ${vec(V[1])}` } },
      ],
    },
    {
      id: "scores",
      title: "Scores: Q · Kᵀ / √d_k",
      explain:
        "Every query is compared with every key using a {{dot-product|dot product}}: multiply matching numbers and add them up. A big number means “this key matches what I'm looking for”.\n\nThat gives a 4 × 4 grid of scores — row = who is looking, column = who is being looked at. We divide by √d_k so the numbers do not grow with vector size; otherwise {{softmax}} in the next step becomes all-or-nothing and training stalls.",
      highlight: ["qkv", "attn"],
      packets: [{ from: "qkv", to: "attn", label: "Q · Kᵀ", sub: `÷ √${DK} = ÷ ${f(Math.sqrt(DK), 3)}`, tone: "amber" }],
      viz: {
        kind: "heatmap",
        title: "Scaled scores (before softmax)",
        rowLabels: SHORT,
        colLabels: SHORT,
        values: SCORES,
        format: "fixed2",
        highlightRow: 3,
        rowAxis: "query",
        colAxis: "key",
        caption: `Row “sleeping”: its query matches the key of “cat” best (${f(SCORES[3][1])}).`,
      },
      deeper: {
        math: [
          `score(sleeping, cat) = Q[sleeping] · K[cat] / √${DK}`,
          `= ${vec(Q[3])} · ${vec(K[1])} / ${f(Math.sqrt(DK), 3)}`,
          `= ${f(Q[3].reduce((s, q, i) => s + q * K[1][i], 0), 3)} / ${f(Math.sqrt(DK), 3)} = ${f(SCORES[3][1], 3)}`,
          "Why √d_k: if q and k have independent unit-variance entries, q·k has variance d_k. Dividing by √d_k brings it back to ~1.",
        ],
      },
      log: SCORES.map((r, i) => ({ tone: "amber" as const, cells: { op: "score row", what: `“${SHORT[i]}” vs all`, shape: "1 × 4", value: `[${r.map((x) => f(x)).join(", ")}]` } })),
      interviewTip: "The √d_k question is a classic. Answer with *variance*, not “normalisation”.",
    },
    {
      id: "softmax",
      title: "Softmax → weights → mix the values",
      explain:
        "{{softmax|Softmax}} turns each row of scores into percentages that add up to 100%. Those are the **attention weights**.\n\nEach token's output is then a weighted average of all the value vectors. “sleeping” puts most of its weight on “cat”, so its new vector now carries the information *who* is sleeping.\n\nThis is the moment a word's meaning becomes context-aware.",
      analogy: "You heard four people at the party. You trust one a lot and the others a little; your takeaway is a blend weighted by that trust.",
      highlight: ["attn"],
      packets: [
        { from: "attn", to: "attn", label: "softmax each row", tone: "amber" },
        { from: "attn", to: "addnorm", label: `out = A · V (4 × ${DK})`, tone: "green" },
      ],
      viz: [
        {
          kind: "heatmap",
          title: "Attention weights A = softmax(scores)",
          rowLabels: SHORT,
          colLabels: SHORT,
          values: A,
          format: "pct",
          highlightRow: 3,
          rowAxis: "query",
          colAxis: "key",
          caption: "Every row sums to 100%.",
        },
        {
          kind: "bars",
          title: "Where “sleeping” looks",
          items: SHORT.map((t, j) => ({ label: t, value: A[3][j], tone: j === argmaxRow(A[3]) ? "green" : "blue" })),
          max: 1,
          format: "pct",
        },
        {
          kind: "matrices",
          title: "Output = A · V",
          items: [{ name: "out", rowLabels: SHORT, values: mat(O), tone: "green" }],
          caption: `out[sleeping] = Σ A[sleeping, j] · V[j] = ${vec(O[3])}`,
        },
      ],
      deeper: {
        math: [
          "softmax(z)_j = e^{z_j} / Σ_k e^{z_k}",
          `Row sleeping: e^${f(SCORES[3][1])} dominates → ${(A[3][1] * 100).toFixed(1)}% on “cat”`,
          `Check: ${A[3].map((x) => (x * 100).toFixed(1)).join(" + ")} = ${(A[3].reduce((s, x) => s + x, 0) * 100).toFixed(1)}%`,
        ],
        code: {
          lang: "python",
          src: `
scores  = Q @ K.T / np.sqrt(d_k)            # (n, n)
weights = np.exp(scores - scores.max(-1, keepdims=True))
weights = weights / weights.sum(-1, keepdims=True)
out     = weights @ V                       # (n, d_v)`,
        },
      },
      log: A.map((r, i) => ({
        tone: "green" as const,
        cells: { op: "softmax + mix", what: `“${SHORT[i]}” attends most to “${SHORT[argmaxRow(r)]}”`, shape: "1 × 4", value: `${(r[argmaxRow(r)] * 100).toFixed(1)}%` },
      })),
    },
    {
      id: "multihead",
      title: "Multi-head attention",
      explain:
        "One set of Q/K/V weights can only learn one way of relating words. So a transformer runs several **heads** in parallel, each with its own weights — this is {{multi-head|multi-head attention}}.\n\nBelow, head 1 learned *meaning* (everything looks at “cat”); head 2 reads only the *position* numbers and learned to look at the **previous** token — a pattern found in real trained models. The heads' outputs are glued together and mixed by one more matrix, W_O.",
      analogy: "Several listeners at the party, each tuned to a different thing: one to who's who, one to who's standing nearby.",
      highlight: ["qkv", "attn"],
      packets: [
        { from: "qkv", to: "attn", label: "head 1: Q₁ K₁ V₁", tone: "violet" },
        { from: "qkv", to: "attn", label: "head 2: Q₂ K₂ V₂", tone: "cyan" },
        { from: "attn", to: "addnorm", label: "concat → · W_O", tone: "green" },
      ],
      viz: [
        { kind: "heatmap", title: "Head 1 — meaning", rowLabels: SHORT, colLabels: SHORT, values: A, format: "pct", rowAxis: "query", colAxis: "key" },
        { kind: "heatmap", title: "Head 2 — previous token", rowLabels: SHORT, colLabels: SHORT, values: A2, format: "pct", rowAxis: "query", colAxis: "key", caption: "Same tokens, different weights → each token looks one step left (“The” has nothing to its left, so it mostly looks at itself)." },
      ],
      deeper: {
        math: ["head_i = Attention(X W_Q^i, X W_K^i, X W_V^i)", "MultiHead(X) = Concat(head_1, …, head_h) · W_O", "Typical: d_k = d_model / h, so h heads cost about the same as one full-width head."],
      },
      log: [
        { tone: "violet", cells: { op: "head 1", what: "“sleeping” → “cat”", shape: "4 × 4", value: `${(A[3][1] * 100).toFixed(1)}%` } },
        { tone: "cyan", cells: { op: "head 2", what: `“sleeping” → “${SHORT[argmaxRow(A2[3])]}”`, shape: "4 × 4", value: `${(A2[3][argmaxRow(A2[3])] * 100).toFixed(1)}%` } },
        { tone: "green", cells: { op: "concat · W_O", what: "heads merged", shape: `4 × ${D}`, value: "back to d_model" } },
      ],
      interviewTip: "Heads do not get hand-assigned jobs; specialisation emerges from training. Some heads are known to be redundant and can be pruned.",
    },
    {
      id: "block",
      title: "Add & Norm, feed-forward, stack × N",
      explain:
        "After attention, two bits of plumbing keep a deep stack trainable:\n\n- **{{residual|Residual}}**: add the input back (x + attention(x)), so information and gradients always have a shortcut.\n- **{{layernorm|LayerNorm}}**: rescale each token's vector to mean 0, spread 1.\n\nThen a {{ffn|feed-forward network}} processes **each token on its own** (expand → {{relu|ReLU}} → shrink). Attention mixes information *between* tokens; the FFN transforms it *within* a token.\n\nThat whole unit is one **block**. Models stack it N times.",
      highlight: ["attn", "addnorm", "ffn", "stack"],
      packets: [
        { from: "attn", to: "addnorm", label: "x + attn(x)", tone: "cyan" },
        { from: "addnorm", to: "ffn", label: "LayerNorm(·)", tone: "cyan" },
        { from: "ffn", to: "stack", label: "6 → 12 → 6", sub: "ReLU in the middle", tone: "violet" },
      ],
      viz: [
        {
          kind: "bars",
          title: "“sleeping”: residual vs after LayerNorm",
          items: [
            ...RESID[3].map((x, i) => ({ label: `x+attn d${i}`, value: x, tone: "slate" as const })),
            ...NORMED[3].map((x, i) => ({ label: `norm d${i}`, value: x, tone: x >= 0 ? ("cyan" as const) : ("rose" as const), note: x < 0 ? "(neg)" : "" })),
          ],
          format: "fixed2",
          caption: `After LayerNorm the 6 numbers have mean ${f(NORMED[3].reduce((s, x) => s + x, 0) / D)} and std ≈ 1.`,
        },
        {
          kind: "nn",
          title: "FFN for one token (6 → 12 → 6)",
          layers: [6, 12, 6],
          layerNames: ["in", "hidden (ReLU)", "out"],
          values: [NORMED[3], H_FFN, BLOCK_OUT],
          activeLayer: 1,
          caption: `${H_FFN.filter((h) => h === 0).length} of 12 hidden units were negative and got zeroed by ReLU. Output shown after the second Add & Norm.`,
        },
        {
          kind: "table",
          title: "Published configurations",
          columns: ["Model", "Blocks", "d_model", "Heads"],
          rows: [
            ["Transformer base (2017)", "6 + 6", 512, 8],
            ["BERT-base", 12, 768, 12],
            ["GPT-2 small", 12, 768, 12],
            ["GPT-3 175B", 96, "12,288", 96],
          ],
          caption: "From the original papers. Newer frontier models rarely publish these.",
        },
      ],
      deeper: {
        math: ["Post-LN (original):  x = LN(x + Attn(x));  x = LN(x + FFN(x))", "Pre-LN (most modern LLMs): x = x + Attn(LN(x));  x = x + FFN(LN(x)) — more stable when very deep", "FFN(x) = W₂ · act(W₁ x + b₁) + b₂, with hidden size usually ≈ 4 × d_model", "Per block ≈ 12·d² parameters: 4d² attention (Q,K,V,O) + 8d² FFN → the FFN holds about ⅔."],
      },
      log: [
        { tone: "cyan", cells: { op: "residual", what: "x + attn(x) [sleeping]", shape: `1 × ${D}`, value: vec(RESID[3]) } },
        { tone: "cyan", cells: { op: "layernorm", what: "LN(·) [sleeping]", shape: `1 × ${D}`, value: vec(NORMED[3]) } },
        { tone: "violet", cells: { op: "ffn", what: "ReLU(x·W₁)·W₂ → add & norm", shape: `1 × ${D}`, value: vec(BLOCK_OUT) } },
        { tone: "slate", cells: { op: "repeat", what: "blocks 2 … N", shape: `4 × ${D}`, value: "same shape every block" } },
      ],
      interviewTip: "Know where the parameters live: the FFNs, not attention, hold most of them.",
    },
    {
      id: "next",
      title: "Predict the next token, learn from the miss",
      explain:
        "The last block's vector for the **final** position goes through the LM head: one score ({{logits|logit}}) per word in the vocabulary, then softmax → probabilities.\n\n**Training**: the real text continues “… sleeping **on** the sofa”, so the loss is {{cross-entropy}} = −log(probability given to “ on”). Confident and right → loss near 0. Confident and wrong → huge loss. {{backprop|Backprop}} then nudges every weight in every block.\n\nA {{causal-mask|causal mask}} stops each position peeking at later words, which lets one forward pass train on every position of the sentence at once.",
      highlight: ["stack", "head", "next", "loss"],
      packets: [
        { from: "stack", to: "head", label: "h[last] (1 × d_model)", tone: "blue" },
        { from: "head", to: "next", label: "logits → softmax", tone: "green" },
        { from: "next", to: "loss", label: `−ln p(“ on”) = ${f(LOSS, 3)}`, tone: "rose" },
      ],
      viz: [
        {
          kind: "bars",
          title: "Next-token probabilities (toy 5-word vocabulary)",
          items: CANDIDATES.map((c, i) => ({ label: `“${c}”`, value: PROBS[i], tone: i === TARGET ? "green" : "blue", note: `logit ${LOGITS[i].toFixed(1)}` })),
          max: 1,
          format: "pct",
          caption: `Target “ on” got ${(PROBS[TARGET] * 100).toFixed(1)}% → loss = −ln(${f(PROBS[TARGET], 3)}) = ${f(LOSS, 3)}.`,
        },
        {
          kind: "plot",
          title: "Cross-entropy = −ln p(correct)",
          series: [{ label: "−ln p", points: Array.from({ length: 60 }, (_, i) => { const p = 0.02 + (i / 59) * 0.98; return [p, -Math.log(p)] as [number, number]; }), tone: "rose" }],
          x: [0, 1],
          y: [0, 4],
          xLabel: "probability on the right token",
          yLabel: "loss",
          markers: [{ x: PROBS[TARGET], y: LOSS, label: `p=${f(PROBS[TARGET])}`, tone: "green" }],
        },
        {
          kind: "heatmap",
          title: "Causal mask: decoders only look left",
          rowLabels: SHORT,
          colLabels: SHORT,
          values: A_CAUSAL,
          format: "pct",
          rowAxis: "query",
          colAxis: "key",
          caption: "Same scores as before, but future positions are set to −∞ before softmax, so they get exactly 0%.",
        },
      ],
      deeper: {
        math: [`p = softmax(logits) = [${PROBS.map((p) => f(p, 3)).join(", ")}]`, `L = −ln p(“ on”) = −ln ${f(PROBS[TARGET], 4)} = ${f(LOSS, 4)}`, "Over a batch: average L over every position of every sequence (“teacher forcing”: the true previous tokens are fed in, not the model's guesses)."],
      },
      log: [
        ...CANDIDATES.map((c, i) => ({ tone: (i === TARGET ? "green" : "blue") as "green" | "blue", cells: { op: "lm head", what: `“${c}”  logit ${LOGITS[i].toFixed(1)}`, shape: "1 of V", value: `p = ${f(PROBS[i], 3)}` } })),
        { tone: "rose", cells: { op: "loss", what: "cross-entropy on “ on”", shape: "scalar", value: f(LOSS, 4) } },
      ],
      interviewTip: "Training is parallel over positions (thanks to the causal mask); generation is sequential, one token at a time. Interviewers love that contrast.",
    },
  ],
  interview: [
    {
      id: "tr-1",
      level: "fresher",
      q: "What problem did transformers solve compared to RNNs and LSTMs?",
      answer:
        "RNNs process tokens one after another, so training cannot be parallelised across the sequence, and information from early tokens must survive many steps to influence later ones (vanishing gradients; LSTMs reduce but don't remove this). Transformers use self-attention: every token attends to every other token in one layer, so training is parallel across positions and any two tokens are one step apart.",
      lookFor: "Both points — parallelism during training and short path length between distant tokens.",
      wrong: "“Transformers have unlimited memory / context.” They have a fixed context window, and attention costs O(n²) in its length.",
    },
    {
      id: "tr-2",
      level: "fresher",
      q: "Explain queries, keys and values in plain words.",
      answer:
        "Each token's vector is projected three ways. The query is what the token is looking for, the key is what it can be matched on, and the value is the information it passes on. Query·key dot products give relevance scores; softmax turns them into weights; the output is the weighted sum of values.",
      lookFor: "That Q, K, V come from the same input through different learned matrices, and the order: score → softmax → weighted sum of V.",
      wrong: "“Q, K, V are three different inputs” (in self-attention they are the same sequence) or “keys are the token IDs”.",
    },
    {
      id: "tr-3",
      level: "fresher",
      q: "What is a token, and why don't LLMs just use words?",
      answer:
        "A token is the unit a model reads — a word, sub-word or symbol. Sub-word schemes like BPE keep the vocabulary to a fixed size (tens of thousands to a few hundred thousand entries) while still representing any text, including rare words, typos and code, by splitting them into pieces.",
      lookFor: "Fixed vocabulary + handles unseen words. Bonus: pricing and context limits are measured in tokens.",
      wrong: "“One token = one word.” In English a token averages less than a word, and other languages often need more tokens per word.",
    },
    {
      id: "tr-4",
      level: "fresher",
      q: "Why is there a softmax in attention?",
      answer: "To turn raw similarity scores into positive weights that sum to 1 per query, so the output is a proper weighted average of value vectors. It is also differentiable, so the whole thing trains with gradient descent.",
      lookFor: "Normalisation into a distribution + differentiability.",
      wrong: "“Softmax picks the single best token.” It gives a soft blend; argmax would not be differentiable.",
    },
    {
      id: "tr-5",
      level: "mid",
      q: "Why do we divide the attention scores by √d_k?",
      answer:
        "If query and key entries are roughly independent with unit variance, their dot product has variance d_k, so scores grow with dimension. Large scores push softmax into a near one-hot regime where gradients are tiny. Dividing by √d_k keeps the score variance around 1, so training stays stable.",
      lookFor: "Variance argument and the softmax-saturation / vanishing-gradient consequence.",
      wrong: "“To normalise the scores between 0 and 1” — softmax does that; the scaling is about variance before softmax.",
    },
    {
      id: "tr-6",
      level: "mid",
      q: "Why does a transformer need positional information, and what are the options?",
      answer:
        "Self-attention treats its input as a set: shuffling tokens just shuffles the outputs, so without positions “dog bites man” and “man bites dog” look alike. Options: fixed sinusoidal encodings added to embeddings (original paper), learned absolute position embeddings (BERT, GPT-2), and relative schemes such as RoPE, which rotates queries and keys by position and is used in many open LLMs (e.g. the Llama family), or ALiBi, which adds a distance penalty to scores.",
      lookFor: "Permutation-equivariance as the reason; at least two concrete schemes; awareness that RoPE is common today.",
      wrong: "“The model learns order from the training data automatically.” Not without some positional signal.",
    },
    {
      id: "tr-7",
      level: "mid",
      q: "What does multi-head attention buy you over a single head?",
      answer:
        "Each head has its own projections, so different heads can track different relationships (syntax, coreference, nearby tokens) in parallel. With d_k = d_model / h, the total cost is similar to one full-width head. Head outputs are concatenated and mixed by W_O.",
      lookFor: "Different subspaces/relations, similar cost, concat + output projection.",
      wrong: "“More heads always means a better model.” Many heads end up redundant; it is a tuned hyperparameter.",
    },
    {
      id: "tr-8",
      level: "mid",
      q: "Encoder-only vs decoder-only vs encoder–decoder: when would you use each?",
      answer:
        "Encoder-only (BERT-style) sees the whole input bidirectionally — good for classification, tagging and embeddings. Decoder-only (GPT-style) uses a causal mask and is trained on next-token prediction — the standard for chat and general generation. Encoder–decoder (original Transformer, T5) encodes an input then generates conditioned on it via cross-attention — natural for translation and summarisation.",
      lookFor: "Causal mask vs bidirectional; cross-attention in encoder–decoder; matching each to tasks.",
      wrong: "“BERT can generate text like GPT.” It is trained with masked-token prediction and is not a left-to-right generator.",
    },
    {
      id: "tr-9",
      level: "mid",
      q: "How is a decoder-only LLM trained, and why is training parallel when generation is sequential?",
      answer:
        "Next-token prediction with cross-entropy: for each position, maximise the probability of the actual next token. The true previous tokens are fed in (teacher forcing) and a causal mask stops each position from seeing the future, so one forward pass computes the loss for every position at once. At generation time the next input depends on the previous output, so it must go one token at a time.",
      lookFor: "Teacher forcing + causal mask → parallel training; autoregressive dependency → sequential decoding.",
      wrong: "“During training the model generates the sentence token by token and compares it.”",
    },
    {
      id: "tr-10",
      level: "senior",
      q: "What is the complexity of self-attention, and how do real systems handle long contexts?",
      answer:
        "For sequence length n and width d, the score matrix costs O(n²·d) compute and O(n²) memory per head. Mitigations: FlashAttention computes exact attention in tiles without materialising the n×n matrix in GPU memory (same maths, much less memory traffic); sliding-window or sparse attention patterns; grouped-query or multi-query attention to shrink the KV cache; and at inference a KV cache so each new token costs O(n) instead of recomputing the prefix. Beyond the window, use retrieval (RAG) or summarisation.",
      lookFor: "Correct O(n²), knowing FlashAttention is exact (an IO optimisation), and separating training cost from inference KV-cache memory.",
      wrong: "“FlashAttention is an approximation of attention.” It is exact; approximate methods (e.g. linear attention) are a different family.",
    },
    {
      id: "tr-11",
      level: "senior",
      q: "Pre-LN vs post-LN: what changed and why?",
      answer:
        "The original Transformer applied LayerNorm after each residual add (post-LN), which needs careful learning-rate warm-up and becomes unstable as depth grows. GPT-2 and most later LLMs normalise the input of each sub-layer instead (pre-LN): x + f(LN(x)). This keeps a clean residual path and trains more stably at depth. Many modern models also swap LayerNorm for RMSNorm, which skips mean-centring.",
      lookFor: "Where the norm sits, the stability reason, and awareness of RMSNorm.",
      wrong: "“LayerNorm normalises across the batch.” That is BatchNorm; LayerNorm normalises across features of each token.",
    },
    {
      id: "tr-12",
      level: "senior",
      q: "Roughly where are the parameters in a transformer block?",
      answer:
        "With width d and FFN hidden size 4d: attention has four d×d matrices (Q, K, V, O) ≈ 4d², the FFN has two d×4d matrices ≈ 8d², so about 12d² per block and roughly two-thirds in the FFN. Total ≈ 12·L·d² plus the embedding table (vocab × d).",
      lookFor: "The 12d² estimate and FFN ≈ ⅔. Ability to sanity-check a model size from L and d.",
      wrong: "“Most parameters are in attention.”",
    },
    {
      id: "tr-13",
      level: "senior",
      design: true,
      q: "Your product must answer questions over 300-page contracts, but the model's context window is far smaller. What are your options?",
      answer:
        "1) Retrieval: chunk the contract, embed and retrieve only relevant clauses (RAG) — cheapest and gives citations. 2) Map-reduce: summarise or extract per section, then reason over the extracts. 3) A long-context model — simpler pipeline, but prefill cost grows with length and quality can drop for facts buried mid-document, so test it. 4) Hybrid: retrieval to narrow, long context for the narrowed set. Choose by evaluating answer accuracy, latency and cost on real contract questions, not by context length alone.",
      lookFor: "Multiple options with trade-offs (cost, latency, citations, recall), and an evaluation plan.",
      wrong: "“Just truncate to the first N tokens” or “just raise max_tokens” (that limits output length, not input context).",
    },
  ],
  quiz: [
    {
      id: "trq-1",
      q: "In self-attention, what does the softmax operate on?",
      options: ["The value vectors", "Each query's row of scaled query–key scores", "The token IDs", "The final output vectors"],
      correct: 1,
      explain: "Softmax runs over each query's scores against all keys, turning them into weights that sum to 1. Those weights then mix the value vectors.",
    },
    {
      id: "trq-2",
      q: "Why divide QKᵀ by √d_k?",
      options: ["To make scores sum to 1", "To keep score variance ≈ 1 so softmax doesn't saturate", "To save memory", "To add position information"],
      correct: 1,
      explain: "Dot products of d_k-dimensional vectors have variance that grows with d_k. Scaling keeps softmax out of its flat, near one-hot regions where gradients vanish.",
    },
    {
      id: "trq-3",
      q: `In this demo, which token does “sleeping” attend to most?`,
      options: SHORT.map((t) => `“${t}”`),
      correct: argmaxRow(A[3]),
      explain: `Its weight on “${SHORT[argmaxRow(A[3])]}” is ${(A[3][argmaxRow(A[3])] * 100).toFixed(1)}% — the query of “sleeping” matches that key best.`,
    },
    {
      id: "trq-4",
      q: "What does the causal mask do?",
      options: ["Hides padding tokens only", "Stops each position attending to later positions", "Randomly drops attention weights", "Masks 15% of input tokens"],
      correct: 1,
      explain: "Future positions get −∞ before softmax, so a decoder can't peek ahead. Randomly masking 15% of tokens is BERT's training objective, a different thing.",
    },
    {
      id: "trq-5",
      q: "Where do most of a standard transformer block's parameters live?",
      options: ["Attention Q/K/V/O matrices", "The feed-forward network", "LayerNorm", "Positional encoding"],
      correct: 1,
      explain: "≈ 8d² for the FFN vs ≈ 4d² for attention, so about two-thirds sit in the FFN.",
    },
    {
      id: "trq-6",
      q: `The model gives the correct next token probability ${f(PROBS[TARGET], 2)}. What is the cross-entropy loss?`,
      options: [f(1 - PROBS[TARGET], 2), f(LOSS, 2), f(PROBS[TARGET] ** 2, 2), f(Math.log2(1 / PROBS[TARGET]) * 2, 2)],
      correct: 1,
      explain: `−ln(${f(PROBS[TARGET], 3)}) = ${f(LOSS, 3)}. Cross-entropy uses the natural log of the probability assigned to the correct token.`,
    },
  ],
};

export default scenario;
