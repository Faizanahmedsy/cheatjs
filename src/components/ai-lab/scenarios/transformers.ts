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

const pc = (x: number) => `${(x * 100).toFixed(0)}%`;
const TOP3 = argmaxRow(A[3]);
const TOP2 = argmaxRow(A2[3]);
/** How many of the 12 FFN hidden units ReLU switched off for "sleeping". */
const FFN_OFF = H_FFN.filter((h) => h === 0).length;

const scenario: Scenario = {
  id: "transformers",
  title: "Transformers & attention",
  tagline: "Every word looks at every other word and decides what matters — all at once.",
  imagine:
    "Imagine reading “The cat is sleeping” and someone asks: who is sleeping? You glance back at “cat” without thinking. A transformer does that for every word at once: each word looks at all the others, decides which ones matter to it, and soaks up their meaning.",
  recap: [
    "Text is cut into **tokens**, and each token becomes a list of numbers that holds its meaning and its position.",
    "**Attention**: every token scores every other token, turns the scores into percentages, and blends in what the best matches carry.",
    "Stack that many times and train it to **predict the next token**: that is how a large language model works.",
  ],
  overview: {
    plain:
      "A transformer is the kind of neural network behind ChatGPT and other chat models. It reads all the words of a text at the same time, and each word looks at every other word to work out what it means in this sentence. Trained on huge amounts of text to guess the next word, it learns language.",
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
    // 1 ─────────────────────────────────────────────────────────────
    {
      id: "why",
      title: "Read every word at once",
      simple: "Old models read a sentence one word at a time and forget the start. A transformer sees every word at the same time.",
      easy: `Imagine reading a long sentence one word at a time, with a very short memory. By the end you forget the start. Older computer models worked like that. A transformer is different: it looks at **all the words together**, so every word can see every other word right away. That makes it faster, and it does not forget.`,
      explain: `Before transformers, models like {{rnn|RNNs}} read a sentence word by word, squeezing everything into one running memory. That is slow (word 4 waits for word 3) and forgetful (word 1 must survive ${TOKENS.length - 1} hops to reach word ${TOKENS.length}). A transformer lets every word look at every other word **directly, in one step**.`,
      analogy: "Old way: a game of Chinese whispers, where the message gets messy as it passes along. New way: everyone sits in one room and hears everyone directly.",
      detail:
        "{{rnn|RNNs}} and {{lstm|LSTMs}} carry a hidden state from step to step. Two problems: **training can't be parallel** across the sequence (each step depends on the previous one), and **long paths**: the gradient from token n back to token 1 passes through every step, so it vanishes or explodes. LSTM gates ease the second but not the first.\n\nSelf-attention connects any two tokens in one layer and computes all positions with matrix maths, which GPUs love. The price: comparing every token with every token costs O(n²) in sequence length.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Old way vs transformer",
          columns: ["", "RNN / LSTM (old)", "Transformer"],
          rows: [
            ["Reads words", "one after another", "all at once"],
            [`Word 1 → word ${TOKENS.length}`, `${TOKENS.length - 1} hops, fading`, "1 direct look"],
            ["On a GPU", "waits in a queue", "works in parallel"],
            ["Cost for n words", "grows like n", "grows like n² (every pair)"],
          ],
          caption: "The trade: transformers pay for every-pair comparisons to get direct, parallel access to the whole text.",
        },
      },
      highlight: ["text", "rnn"],
      packets: [
        { from: "text", to: "rnn", label: "t1: The", tone: "slate" },
        { from: "text", to: "rnn", label: "t2: cat", tone: "slate" },
        { from: "text", to: "rnn", label: "t3: is", tone: "slate" },
        { from: "text", to: "rnn", label: "t4: sleeping", tone: "slate" },
      ],
      deeper: {
        math: ["RNN:  h_t = tanh(W_h · h_{t−1} + W_x · x_t + b)", "Gradient to x_1 passes through ∂h_t/∂h_{t−1} for every t → it shrinks or explodes (vanishing / exploding gradients).", "LSTM gates ease this but the loop is still sequential."],
      },
      log: [
        { tone: "slate", cells: { op: "rnn step t=1", what: "h₁ = f(h₀, “The”)", shape: "1 × d", value: "must wait" } },
        { tone: "slate", cells: { op: "rnn step t=2", what: "h₂ = f(h₁, “cat”)", shape: "1 × d", value: "must wait" } },
        { tone: "slate", cells: { op: "rnn step t=4", what: "h₄ = f(h₃, “sleeping”)", shape: "1 × d", value: `${TOKENS.length} sequential hops` } },
      ],
      interviewTip: "Say both reasons: **parallel training** and **short paths between distant tokens**. Most candidates only mention one.",
    },
    // 2 ─────────────────────────────────────────────────────────────
    {
      id: "split",
      title: "Cut the text into tokens",
      simple: "First, the computer cuts your sentence into small pieces called tokens.",
      easy: "A computer cannot read a sentence the way we do. So first it **cuts the sentence into small pieces**, called tokens. Short, common words stay whole. Long or rare words are cut into smaller parts. See the little **␣** mark? It means a space. The space belongs to the word after it, so “␣cat” and “cat” count as two different pieces.",
      explain:
        "A {{tokenizer}} (a fixed rulebook) chops the text into {{token|tokens}}. Short common words are one token each; rare words get split into pieces. Notice the **␣**: the space before a word is part of its token, so “␣cat” and “cat” are different tokens.",
      analogy: "Tokens are like LEGO bricks. Any sentence can be built from the same box of bricks.",
      detail:
        "Most LLMs use {{bpe|BPE}}-style sub-word tokenizers: start from bytes and merge the most frequent pairs into new tokens. That keeps the vocabulary fixed (tens of thousands to a few hundred thousand entries) while still covering any text.\n\nTokens ≠ words: English averages roughly ¾ of a word per token, other languages and code often need more. Pricing, context limits and speed are all counted in tokens.",
      stage: { kind: "tokens", mode: "split", text: TOKENS.join(""), tokens: TOKENS, note: "␣ = the space that belongs to the token" },
      highlight: ["text", "tokenizer"],
      packets: [{ from: "text", to: "tokenizer", label: "“The cat is sleeping”", tone: "cyan" }],
      viz: { only: "interview", kind: "tokens", title: "Tokens", tokens: SHOW.map((t) => ({ text: t, tone: "blue" as const })), caption: "GPT-style vocabularies keep the leading space inside the token." },
      log: TOKENS.map((t, i) => ({ tone: "blue" as const, cells: { op: "tokenize", what: `piece ${i + 1}: “${t}”`, shape: "text", value: `pos ${i}` } })),
      interviewTip: "Tokens ≠ words. Pricing, context limits and speed are all counted in tokens.",
    },
    // 3 ─────────────────────────────────────────────────────────────
    {
      id: "ids",
      title: "Each token gets a number",
      simple: "Each piece gets a number, because computers only understand numbers.",
      easy: `Computers only understand numbers, not words. So every piece gets a **number**, like a roll number in a class. “␣cat” becomes **${IDS[1]}**. The number is only a name tag. It says nothing about meaning: ${IDS[1]} is not “bigger” or “better” than ${IDS[2]}.`,
      explain: `The tokenizer looks each piece up in its vocabulary (its fixed list of all tokens) and swaps it for that entry's number: “␣cat” → **${IDS[1]}**. These numbers are only labels, like seat numbers: ${IDS[1]} is not “bigger” than ${IDS[2]} in any useful way.`,
      analogy: "A library gives every book a shelf number. The number tells you where the book is, not what is inside it.",
      detail: "IDs here are illustrative: every tokenizer has its own vocabulary, so real IDs differ between models. The same text tokenised by two models can even give a different number of tokens, which is why token counts (and cost) differ between providers.",
      stage: { kind: "tokens", mode: "ids", tokens: TOKENS, ids: IDS, note: "illustrative IDs: every tokenizer has its own numbering" },
      highlight: ["tokenizer", "tokens"],
      packets: [{ from: "tokenizer", to: "tokens", label: `[${IDS.join(", ")}]`, sub: "illustrative IDs", tone: "blue" }],
      viz: { only: "interview", kind: "tokens", title: "Tokens and IDs", tokens: SHOW.map((t, i) => ({ text: t, id: IDS[i], tone: "blue" as const })), caption: "IDs here are made up for the demo — every tokenizer has its own vocabulary." },
      log: TOKENS.map((t, i) => ({ tone: "blue" as const, cells: { op: "lookup id", what: `“${t}” → ${IDS[i]}`, shape: "id", value: `pos ${i}` } })),
      interviewTip: "Be ready to explain why the same text costs a different number of tokens on two different models.",
    },
    // 4 ─────────────────────────────────────────────────────────────
    {
      id: "vectors",
      title: "Numbers that hold meaning and position",
      simple: "Each piece becomes a small list of numbers that says what the word means and where it sits.",
      easy: `A roll number alone tells us nothing about meaning. So each piece is turned into a **short list of numbers** (the little bars) that describe what the word means. Words with similar meaning get similar bars, like “happy” and “glad”. Then we add a **position stamp**, so the computer knows which word came first and which came last. Here every word gets ${D} numbers. Real models use thousands.`,
      explain: `Each ID picks a learned row of numbers, its {{embedding}} (a list of numbers that captures meaning). Similar words get similar lists. Attention alone can't tell word order, so a {{positional-encoding|position stamp}} is added too. Here each token gets ${D} numbers (the bars); real models use thousands.`,
      analogy: "Like an ID card: one part says who you are (meaning), another part says which seat you sit in (position).",
      detail: `The embedding table has one row per vocabulary entry; looking up an ID is just picking its row. In this toy, dims 2–5 are meanings [animal, action, function-word, state] and dims 0–1 carry the sin/cos position signal.\n\nThe original paper adds fixed sinusoidal encodings. BERT and GPT-2 learn position embeddings; many modern LLMs use **RoPE**, which rotates queries and keys by position inside attention.`,
      stage: { kind: "tokens", mode: "vectors", tokens: TOKENS, vectors: X, note: "bars = the token's numbers · blue positive, red negative" },
      highlight: ["tokens", "embed", "pos"],
      packets: [
        { from: "tokens", to: "embed", label: "look up 4 rows", tone: "blue" },
        { from: "pos", to: "embed", label: "+ PE(pos)", tone: "amber" },
      ],
      viz: {
        only: "interview",
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
      deeper: {
        math: ["PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))", "PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))", `Position 1 → ${vec(PE[1])}`, "The original paper also multiplies embeddings by √d_model before adding PE."],
      },
      log: [
        ...SHORT.map((t, i) => ({ tone: "blue" as const, cells: { op: "embed + PE", what: `X[${t}]`, shape: `1 × ${D}`, value: vec(X[i]) } })),
      ],
      interviewTip: "Self-attention is permutation-equivariant: without positions, “dog bites man” and “man bites dog” look the same.",
    },
    // 5 ─────────────────────────────────────────────────────────────
    {
      id: "qkv",
      title: "Every word asks, labels and offers",
      simple: "Every word prepares three things: a question, a label, and the information it can share.",
      easy: "Now every word prepares **three small notes**. A **question**: “what am I looking for?”. A **label**: “this is what I am about”. And its **information**: “this is what I can tell you”. For example, “sleeping” asks “who is sleeping?”, while “cat” has a label that says “I am an animal”. The model learns by itself how to write these notes.",
      explain:
        "Each token's numbers are multiplied by three learned tables to make a {{query}} (what am I looking for?), a {{key}} (what can I be found by?) and a {{value}} (what I hand over if chosen). Same token, three different views. Training learns the three tables.",
      analogy: "At a party: the question is what you want to find out, the label is your name badge, and the information is the story you tell.",
      detail: `Q = X·W_Q, K = X·W_K, V = X·W_V, each ${TOKENS.length} × ${DK} here (d_k = ${DK}). In self-attention all three come from the **same** sequence; in cross-attention (encoder–decoder) the queries come from one sequence and keys/values from another.`,
      stage: { kind: "tokens", mode: "qkv", tokens: TOKENS, note: "Q = looking for · K = label · V = information" },
      highlight: ["embed", "qkv"],
      packets: [
        { from: "embed", to: "qkv", label: `X (4 × ${D})`, tone: "blue" },
        { from: "qkv", to: "attn", label: `Q, K, V (4 × ${DK})`, tone: "violet" },
      ],
      viz: {
        only: "interview",
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
      interviewTip: "Say the order: score (Q·K) → softmax → weighted sum of V. And that Q, K, V come from the same input via different learned matrices.",
    },
    // 6 ─────────────────────────────────────────────────────────────
    {
      id: "attention",
      title: "Who should I listen to?",
      simple: `“sleeping” compares its question with every word’s label. “cat” fits best, so “sleeping” pays ${pc(A[3][TOP3])} of its attention to “cat”.`,
      easy: `Now every word **checks the label of every other word** against its own question and gives a match score. A good match gives a big score. The scores are turned into percentages that add up to 100%. The thick lines show who is paying attention to whom. “sleeping” asks “who is sleeping?”, and “cat” answers best. Hover over or tap another word to see where **it** looks.`,
      explain: `Each query is compared with every key using a {{dot-product|dot product}} (multiply matching numbers and add). A {{softmax}} then turns the scores into percentages that add up to 100%. Thicker lines = more {{attention}}. Hover or tab to another word to see where it looks.`,
      analogy: "Like walking into a room and reading everyone's name badge to decide who is worth listening to.",
      detail: `Scores = Q·Kᵀ / √d_k, a ${TOKENS.length} × ${TOKENS.length} grid (row = who looks, column = who is looked at). Dividing by √d_k = ${f(Math.sqrt(DK), 3)} keeps the scores' variance near 1: without it, scores grow with vector size and softmax becomes all-or-nothing, so gradients vanish.\n\nRow “sleeping”: score with “cat” = ${f(SCORES[3][1], 2)}, the highest, so softmax gives it ${(A[3][1] * 100).toFixed(1)}%.`,
      stage: { kind: "tokens", mode: "attention", tokens: TOKENS, attention: A, focus: 3, note: "line thickness = share of attention" },
      highlight: ["qkv", "attn"],
      packets: [{ from: "qkv", to: "attn", label: "Q · Kᵀ", sub: `÷ √${DK} → softmax`, tone: "amber" }],
      viz: [
        {
          only: "interview",
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
        {
          only: "interview",
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
      ],
      deeper: {
        math: [
          `score(sleeping, cat) = Q[sleeping] · K[cat] / √${DK}`,
          `= ${vec(Q[3])} · ${vec(K[1])} / ${f(Math.sqrt(DK), 3)}`,
          `= ${f(Q[3].reduce((s, q, i) => s + q * K[1][i], 0), 3)} / ${f(Math.sqrt(DK), 3)} = ${f(SCORES[3][1], 3)}`,
          "softmax(z)_j = e^{z_j} / Σ_k e^{z_k}",
          `Check row sleeping: ${A[3].map((x) => (x * 100).toFixed(1)).join(" + ")} = ${(A[3].reduce((s, x) => s + x, 0) * 100).toFixed(1)}%`,
          "Why √d_k: if q and k have independent unit-variance entries, q·k has variance d_k. Dividing by √d_k brings it back to ~1.",
        ],
      },
      log: A.map((r, i) => ({
        tone: "amber" as const,
        cells: { op: "score + softmax", what: `“${SHORT[i]}” attends most to “${SHORT[argmaxRow(r)]}”`, shape: "1 × 4", value: `${(r[argmaxRow(r)] * 100).toFixed(1)}%` },
      })),
      interviewTip: "The √d_k question is a classic. Answer with *variance*, not “normalisation”.",
    },
    // 7 ─────────────────────────────────────────────────────────────
    {
      id: "mix",
      title: "Blend in what you heard",
      simple: "Each word collects information from the other words, taking more from the ones it trusts.",
      easy: `Now every word **collects information from the others**, taking more from the words with a big percentage. “sleeping” takes ${pc(A[3][1])} of its information from “cat”. So now “sleeping” knows **who** is sleeping. This is the magic moment: a word's meaning now depends on the sentence around it.`,
      explain: `Now each token takes a weighted average of every token's {{value}}. “Sleeping” takes ${pc(A[3][1])} of “cat”'s information, so its new numbers now carry **who** is sleeping. This is the moment a word's meaning starts to depend on its sentence.`,
      analogy: "You listen to four people. You trust one a lot and the others a little. What you remember is a mix, mostly from the one you trust.",
      detail: `out = A · V. For “sleeping”: out = Σⱼ A[sleeping, j] · V[j] = ${vec(O[3])}. The output has the same shape as V (${TOKENS.length} × ${DK}); the heads' outputs are later projected back to d_model.\n\nSoftmax gives a **soft** blend, not a single pick, which keeps everything differentiable so it can be trained with gradient descent.`,
      stage: {
        kind: "viz",
        viz: [
          {
            kind: "bars",
            title: "How much “sleeping” takes from each word",
            items: SHORT.map((t, j) => ({ label: t, value: A[3][j], tone: j === TOP3 ? ("green" as const) : ("blue" as const) })),
            max: 1,
            format: "pct",
            caption: "These percentages are the recipe for the blend.",
          },
          {
            kind: "matrices",
            title: "New “sleeping” = weights × values",
            items: [
              { name: "weights", values: [A[3].map((x) => +x.toFixed(2))], tone: "amber" },
              { name: "V (one row per word)", rowLabels: SHORT, values: mat(V), tone: "green" },
              { name: "new sleeping", values: [O[3].map((x) => +x.toFixed(2))], tone: "violet" },
            ],
            ops: ["×", "="],
          },
        ],
      },
      highlight: ["attn"],
      packets: [
        { from: "attn", to: "attn", label: "softmax each row", tone: "amber" },
        { from: "attn", to: "addnorm", label: `out = A · V (4 × ${DK})`, tone: "green" },
      ],
      viz: {
        only: "interview",
        kind: "matrices",
        title: "Output = A · V (all tokens)",
        items: [{ name: "out", rowLabels: SHORT, values: mat(O), tone: "green" }],
        caption: `out[sleeping] = Σ A[sleeping, j] · V[j] = ${vec(O[3])}`,
      },
      deeper: {
        code: {
          lang: "python",
          src: `
scores  = Q @ K.T / np.sqrt(d_k)            # (n, n)
weights = np.exp(scores - scores.max(-1, keepdims=True))
weights = weights / weights.sum(-1, keepdims=True)
out     = weights @ V                       # (n, d_v)`,
        },
      },
      log: O.map((r, i) => ({ tone: "green" as const, cells: { op: "mix values", what: `out[${SHORT[i]}]`, shape: `1 × ${DK}`, value: vec(r) } })),
      interviewTip: "If asked why softmax and not argmax: argmax isn't differentiable, and a soft blend lets a token use several sources.",
    },
    // 8 ─────────────────────────────────────────────────────────────
    {
      id: "multihead",
      title: "Several heads, several questions",
      simple: "The model asks several different questions at the same time, each one looking at the words in its own way.",
      easy: `One way of looking is not enough. So the model uses **several “heads”**, like several friends reading the same sentence for different reasons. Head 1 looks for **meaning**: “sleeping” looks at “cat”. Head 2 simply looks at the **word just before it**: “sleeping” looks at “${SHORT[TOP2]}”. All heads work at the same time, then their findings are combined.`,
      explain: `One set of query/key/value tables can only learn one way of relating words, so a transformer runs several **heads** side by side ({{multi-head|multi-head attention}}). Here head 1 links words by meaning (“sleeping” → “cat”); head 2 learned to look at the **previous** word (“sleeping” → “${SHORT[TOP2]}”).`,
      analogy: "Like several friends reading the same story. One tracks the characters, another tracks what happens in what order.",
      detail:
        "Each head has its own W_Q, W_K, W_V. Head 2 here reads only the position numbers, and its key matrix rotates by one position, so the best match is always the token on the left — a “previous-token head”, a pattern found in real trained models. The heads' outputs are concatenated and mixed by one more matrix, W_O.\n\nWith d_k = d_model / h, h heads cost about the same as one full-width head. Heads aren't assigned jobs; specialisation emerges from training, and some heads turn out redundant.",
      stage: {
        kind: "viz",
        viz: [
          { kind: "heatmap", title: "Head 1 — meaning", rowLabels: SHORT, colLabels: SHORT, values: A, format: "pct", highlightRow: 3, rowAxis: "looks from", colAxis: "looks at" },
          { kind: "heatmap", title: "Head 2 — previous word", rowLabels: SHORT, colLabels: SHORT, values: A2, format: "pct", highlightRow: 3, rowAxis: "looks from", colAxis: "looks at", caption: "“The” has nothing on its left, so it mostly looks at itself." },
        ],
        note: "same words, different learned tables → different patterns",
      },
      highlight: ["qkv", "attn"],
      packets: [
        { from: "qkv", to: "attn", label: "head 1: Q₁ K₁ V₁", tone: "violet" },
        { from: "qkv", to: "attn", label: "head 2: Q₂ K₂ V₂", tone: "cyan" },
        { from: "attn", to: "addnorm", label: "concat → · W_O", tone: "green" },
      ],
      deeper: {
        math: ["head_i = Attention(X W_Q^i, X W_K^i, X W_V^i)", "MultiHead(X) = Concat(head_1, …, head_h) · W_O", `Head 2: q_i · k_j = α²·cos(i − j − 1), α = ${ALPHA} → largest when j = i − 1`],
      },
      log: [
        { tone: "violet", cells: { op: "head 1", what: "“sleeping” → “cat”", shape: "4 × 4", value: `${(A[3][1] * 100).toFixed(1)}%` } },
        { tone: "cyan", cells: { op: "head 2", what: `“sleeping” → “${SHORT[TOP2]}”`, shape: "4 × 4", value: `${(A2[3][TOP2] * 100).toFixed(1)}%` } },
        { tone: "green", cells: { op: "concat · W_O", what: "heads merged", shape: `4 × ${D}`, value: "back to d_model" } },
      ],
      interviewTip: "Heads do not get hand-assigned jobs; specialisation emerges from training. Some heads are known to be redundant and can be pruned.",
    },
    // 9 ─────────────────────────────────────────────────────────────
    {
      id: "block",
      title: "Think it over, then repeat the block",
      simple: "After sharing, every word thinks alone for a moment. This share-and-think step repeats many times.",
      easy: `Attention was the **sharing** part: words swapped information. Now comes the **thinking** part: each word is processed **alone** by a small network. (For “sleeping”, ${FFN_OFF} of its 12 small switches stayed off.) Sharing plus thinking is one **block**. A real model stacks dozens of blocks, one after another, and gets a bit smarter at every one.`,
      explain: `Attention mixes information **between** words. Then a small {{ffn|feed-forward network}} works on **each word alone** (for “sleeping”, ${FFN_OFF} of its 12 middle neurons stayed switched off). Shortcuts ({{residual|residual connections}}) and rescaling ({{layernorm|LayerNorm}}) keep it stable. That is one block; real models stack dozens.`,
      analogy: "A study group. First everyone shares notes. Then everyone thinks alone. Repeat for every chapter.",
      detail:
        "- **{{residual|Residual}}**: add the input back, x + attention(x), so information and gradients always have a shortcut.\n- **{{layernorm|LayerNorm}}**: rescale each token's vector to mean 0, spread 1.\n- **FFN**: expand → {{relu|ReLU}} → shrink, usually to 4 × d_model in the middle.\n\nPost-LN (original) normalises after the add; most modern LLMs use pre-LN, x + f(LN(x)), which trains more stably when very deep. Per block ≈ 12·d² parameters: 4d² attention + 8d² FFN, so the FFN holds about ⅔.",
      stage: {
        kind: "viz",
        viz: [
          {
            kind: "nn",
            title: "Feed-forward for “sleeping” (6 → 12 → 6)",
            layers: [6, 12, 6],
            layerNames: ["in", "middle (ReLU)", "out"],
            values: [NORMED[3], H_FFN, BLOCK_OUT],
            activeLayer: 1,
            caption: `${FFN_OFF} of 12 middle neurons got a negative total and output 0.`,
          },
          {
            kind: "table",
            title: "How many blocks real models stack",
            columns: ["Model", "Blocks", "d_model", "Heads"],
            rows: [
              ["Transformer base (2017)", "6 + 6", 512, 8],
              ["BERT-base", 12, 768, 12],
              ["GPT-2 small", 12, 768, 12],
              ["GPT-3 175B", 96, "12,288", 96],
            ],
            caption: "From the original papers.",
          },
        ],
      },
      highlight: ["attn", "addnorm", "ffn", "stack"],
      packets: [
        { from: "attn", to: "addnorm", label: "x + attn(x)", tone: "cyan" },
        { from: "addnorm", to: "ffn", label: "LayerNorm(·)", tone: "cyan" },
        { from: "ffn", to: "stack", label: "6 → 12 → 6", sub: "ReLU in the middle", tone: "violet" },
      ],
      viz: {
        only: "interview",
        kind: "bars",
        title: "“sleeping”: residual vs after LayerNorm",
        items: [
          ...RESID[3].map((x, i) => ({ label: `x+attn d${i}`, value: x, tone: "slate" as const })),
          ...NORMED[3].map((x, i) => ({ label: `norm d${i}`, value: x, tone: x >= 0 ? ("cyan" as const) : ("rose" as const), note: x < 0 ? "(neg)" : "" })),
        ],
        format: "fixed2",
        caption: `After LayerNorm the 6 numbers have mean ${f(NORMED[3].reduce((s, x) => s + x, 0) / D)} and std ≈ 1.`,
      },
      deeper: {
        math: ["Post-LN (original):  x = LN(x + Attn(x));  x = LN(x + FFN(x))", "Pre-LN (most modern LLMs): x = x + Attn(LN(x));  x = x + FFN(LN(x))", "FFN(x) = W₂ · act(W₁ x + b₁) + b₂, hidden size usually ≈ 4 × d_model", "Per block ≈ 12·d² parameters: 4d² attention (Q,K,V,O) + 8d² FFN."],
      },
      log: [
        { tone: "cyan", cells: { op: "residual", what: "x + attn(x) [sleeping]", shape: `1 × ${D}`, value: vec(RESID[3]) } },
        { tone: "cyan", cells: { op: "layernorm", what: "LN(·) [sleeping]", shape: `1 × ${D}`, value: vec(NORMED[3]) } },
        { tone: "violet", cells: { op: "ffn", what: "ReLU(x·W₁)·W₂ → add & norm", shape: `1 × ${D}`, value: vec(BLOCK_OUT) } },
        { tone: "slate", cells: { op: "repeat", what: "blocks 2 … N", shape: `4 × ${D}`, value: "same shape every block" } },
      ],
      interviewTip: "Know where the parameters live: the FFNs, not attention, hold most of them.",
    },
    // 10 ────────────────────────────────────────────────────────────
    {
      id: "next",
      title: "Guess the next word, learn from the miss",
      simple: `The model gives a chance to every possible next word. “on” gets ${pc(PROBS[TARGET])}. While learning, the real next word teaches it.`,
      easy: `Finally the model **guesses the next word**. It gives a chance to every word it knows. After “The cat is sleeping …” it gives “on” ${pc(PROBS[TARGET])}. While learning, we know the real answer (“… sleeping **on** the sofa”), so we can check the guess. The worse the guess, the bigger the **mistake score**. Here it is **${f(LOSS, 2)}**. Then the model makes tiny fixes inside itself, so that next time “on” gets a higher chance.`,
      explain: `The last word's final numbers become one score per word in the vocabulary ({{logits}}), and softmax turns them into chances. The real text continues “sleeping **on** the sofa”, so the {{loss}} is −log(chance given to “␣on”) = **${f(LOSS, 2)}**. {{backprop|Backprop}} then nudges every weight so “␣on” gets a bit more next time.`,
      analogy: "A fill-in-the-blank quiz with millions of sentences. Every wrong answer is a small lesson.",
      detail: `This is {{cross-entropy}} loss: 0 when the model puts 100% on the right token, huge when it is confidently wrong. Over a batch, the loss is averaged over every position of every sequence.\n\nA {{causal-mask|causal mask}} sets later positions to −∞ before softmax, so each position can only look left. With the true previous tokens fed in (teacher forcing), one forward pass trains on **every** position at once. Generation is different: each new token depends on the last, so it goes one token at a time.`,
      stage: { kind: "tokens", mode: "next", tokens: TOKENS, candidates: CANDIDATES.map((c, i) => ({ text: c, p: PROBS[i] })), chosen: TARGET, note: `real next word: “on” · loss = −ln ${f(PROBS[TARGET], 2)} = ${f(LOSS, 2)}` },
      highlight: ["stack", "head", "next", "loss"],
      packets: [
        { from: "stack", to: "head", label: "h[last] (1 × d_model)", tone: "blue" },
        { from: "head", to: "next", label: "logits → softmax", tone: "green" },
        { from: "next", to: "loss", label: `−ln p(“ on”) = ${f(LOSS, 3)}`, tone: "rose" },
      ],
      viz: [
        {
          only: "interview",
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
          only: "interview",
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
        math: [`p = softmax(logits) = [${PROBS.map((p) => f(p, 3)).join(", ")}]`, `L = −ln p(“ on”) = −ln ${f(PROBS[TARGET], 4)} = ${f(LOSS, 4)}`, "Teacher forcing: the true previous tokens are fed in, not the model's guesses."],
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
