import type { Scenario, Tone } from "../engine/types";
import { f, softmax, sum, topK, topP } from "../engine/math";

/* ------------------------------------------------------------------ *
 * LLM inference on the prompt "The capital of France is".
 * Logits are toy numbers; every probability, cache size, VRAM figure,
 * cost and latency below is computed from them, never typed by hand.
 * ------------------------------------------------------------------ */

const PROMPT = "The capital of France is";
const PROMPT_TOKENS = ["The", " capital", " of", " France", " is"];

/** Candidate next tokens and their logits at each decode step (toy slice of the vocabulary). */
const DECODE = [
  { cands: [" Paris", " a", " the", " located", " Lyon"], logits: [6.0, 3.1, 2.8, 2.2, 1.5] },
  { cands: [".", ",", " and", " which", "!"], logits: [4.5, 3.0, 2.0, 1.6, 0.5] },
  { cands: ["<eos>", " It", " The", "\\n", " Paris"], logits: [5.0, 2.9, 2.1, 2.4, 0.3] },
];
const argmax = (v: number[]) => v.indexOf(Math.max(...v));
const STEP_PROBS = DECODE.map((d) => softmax(d.logits));
const PICKED = DECODE.map((d, i) => d.cands[argmax(STEP_PROBS[i])]);

/* ---- sampling knobs on step 1 ---- */
const L0 = DECODE[0].logits;
const C0 = DECODE[0].cands;
const P_T1 = softmax(L0, 1);
const P_T05 = softmax(L0, 0.5);
const P_T15 = softmax(L0, 1.5);
const K = 3;
const P_TOPK = topK(P_T1, K);
const TOP_P = 0.9;
const P_TOPP = topP(P_T1, TOP_P);
const TOPP_KEPT = P_TOPP.filter((p) => p > 0).length;

/* ---- latency model (example numbers for a mid-size model on one GPU) ---- */
const TTFT_MS = 320;
const TPOT_MS = 25; // time per output token
const tokTime = (i: number) => TTFT_MS + i * TPOT_MS;

/* ---- KV cache: example 7B-class config without grouped-query attention ---- */
const LAYERS = 32;
const KV_HEADS = 32;
const HEAD_DIM = 128;
const BYTES_FP16 = 2;
const KV_BYTES_PER_TOKEN = 2 * LAYERS * KV_HEADS * HEAD_DIM * BYTES_FP16; // K and V
const MiB = 1024 ** 2;
const GiB = 1024 ** 3;
const CTX = 4096;
const KV_CTX_GIB = (KV_BYTES_PER_TOKEN * CTX) / GiB;
/** Work to generate OUT tokens after a PROMPT_LEN prompt, counted in "token positions run through the model". */
const PROMPT_LEN = 500;
const OUT = 200;
const WORK_NO_CACHE = sum(Array.from({ length: OUT }, (_, i) => PROMPT_LEN + i + 1));
const WORK_CACHE = PROMPT_LEN + OUT;

/* ---- VRAM for weights ---- */
const PARAMS = 7e9;
const PRECISIONS = [
  { name: "fp32", bytes: 4 },
  { name: "fp16 / bf16", bytes: 2 },
  { name: "int8", bytes: 1 },
  { name: "int4", bytes: 0.5 },
];
const weightsGB = (bytes: number) => (PARAMS * bytes) / 1e9;

/* ---- speculative decoding: expected tokens per big-model pass (Leviathan et al. 2023) ---- */
const specTokens = (alpha: number, gamma: number) => (1 - alpha ** (gamma + 1)) / (1 - alpha);
const SPEC = [0.6, 0.7, 0.8, 0.9].map((a) => ({ a, t: specTokens(a, 4) }));

/* ---- cost + latency for one request (EXAMPLE prices, check current pricing) ---- */
const IN_TOK = 2000;
const OUT_TOK = 500;
const TIERS = [
  { name: "small model", inPerM: 0.15, outPerM: 0.6, ttft: 0.3, tps: 150 },
  { name: "medium model", inPerM: 1, outPerM: 4, ttft: 0.5, tps: 80 },
  { name: "frontier model", inPerM: 5, outPerM: 20, ttft: 1.0, tps: 40 },
].map((t) => ({ ...t, cost: (IN_TOK * t.inPerM + OUT_TOK * t.outPerM) / 1e6, latency: t.ttft + OUT_TOK / t.tps }));
const MONTHLY = 1_000_000;

const shownTok = (t: string) => t.replace(/^ /, "␣");
const money = (x: number) => (x < 0.01 ? `$${x.toFixed(5)}` : `$${x.toFixed(4)}`);

const pctS = (x: number) => `${(x * 100).toFixed(1)}%`;
const KV_TOKEN_MIB = KV_BYTES_PER_TOKEN / MiB;
const KV_CTX_GB = (KV_BYTES_PER_TOKEN * CTX) / 1e9;
const ANSWER = PICKED.filter((t) => t !== "<eos>");
const GEN_TOKENS = [...PROMPT_TOKENS, ...PICKED];
const sampleBars = (probs: number[], title: string, caption?: string) => ({
  kind: "bars" as const,
  title,
  items: C0.map((c, i) => ({ label: shownTok(c), value: probs[i], tone: (probs[i] <= 0 ? "slate" : i === 0 ? "green" : "blue") as Tone, note: probs[i] <= 0 ? "cut" : "" })),
  max: 1,
  format: "pct" as const,
  caption,
});

const scenario: Scenario = {
  id: "llm-inference",
  title: "LLM inference & model choice",
  tagline: "Prompt in, one token at a time out — and what each token costs.",
  imagine:
    "Imagine a very fast typist who has read most of the internet. You hand over the start of a sentence; they read all of it in one glance, then type the reply one word at a time, each time picking a likely next word. Every word costs a little time and a little money.",
  recap: [
    "The model reads the whole prompt at once (**prefill**), then writes the reply **one token at a time** (decode), each one picked from a list of probabilities.",
    "**Temperature**, top-k and top-p only change how that pick is made: safe and repetitive, or varied and riskier.",
    "Speed and cost come from memory and token counts: weights + **KV cache** must fit on the GPU, and you pay per input and output token.",
  ],
  overview: {
    plain:
      "Running a trained language model to get an answer is called inference. The model reads your whole message in one go, then writes the reply one small piece of text at a time, each time choosing a likely next piece. How it chooses, how much memory it needs and how many pieces it writes decide how good, fast and cheap the answer is.",
    definition:
      "{{inference|Inference}} is running a trained model to get an answer. An LLM reads your whole prompt in one parallel pass ({{prefill}}), then produces the reply **one token at a time** ({{decode}}): each step outputs {{logits}}, a sampling rule picks one token, and that token is fed back in. It stops at an end-of-sequence token or a length limit.",
    analogy:
      "A **typist with a perfect memory**. First they read your whole letter in one go (prefill). Then they type the reply one letter at a time, glancing back at their notes (the KV cache) instead of re-reading the letter for every keystroke.",
    facts: [
      ["Two phases", "Prefill (prompt, parallel, sets {{ttft|TTFT}}) and decode (one token per step)"],
      ["Sampling knobs", "{{temperature}}, {{top-k}}, {{top-p}}; temperature 0 ≈ always pick the top token"],
      ["Memory", "{{vram|VRAM}} must hold the weights plus the {{kv-cache|KV cache}}"],
      ["Rule of thumb", "Weights ≈ parameters × bytes per parameter (7B × 2 bytes ≈ 14 GB)"],
      ["Speed-ups", "{{quantization}}, {{continuous-batching|continuous batching}}, {{speculative-decoding|speculative decoding}}, caching"],
      ["Prices", "All prices on this page are **examples** — check the provider's current pricing."],
    ],
    whereUsed: "Every chat app, coding assistant and RAG system. Picking the model, precision and serving setup is usually the biggest lever on cost and latency.",
  },
  objects: [
    { id: "api", kind: "cloud", label: "Cloud API", sub: "pay per token", at: [2.4, -3.2], tone: "cyan" },
    { id: "server", kind: "server", label: "Self-hosted", sub: "your GPUs", at: [7.2, -3.2], tone: "slate" },
    { id: "prompt", kind: "chat", label: "Prompt", sub: "“The capital of France is”", at: [0, 0], tone: "cyan" },
    { id: "tokenizer", kind: "tool", label: "Tokenizer", sub: "text → IDs", at: [2.4, 0], tone: "violet" },
    { id: "llm", kind: "llm", label: "Model", sub: "forward pass", at: [4.8, 0], tone: "violet" },
    { id: "kv", kind: "cache", label: "KV cache", sub: "keys + values so far", at: [7.2, 0], tone: "amber" },
    { id: "sampler", kind: "dice", label: "Sampler", sub: "temp · top-k · top-p", at: [9.6, 0], tone: "green" },
    { id: "out", kind: "laptop", label: "Output stream", sub: "tokens as they come", at: [12, 0], tone: "green" },
    { id: "gpu", kind: "gpu", label: "GPU memory", sub: "weights + KV cache", at: [2.4, 3.6], tone: "blue" },
    { id: "opt", kind: "gear", label: "Optimiser", sub: "quantize · batch · speculate", at: [7.2, 3.6], tone: "violet" },
    { id: "cost", kind: "gauge", label: "Cost / latency", sub: "per request", at: [12, 3.6], tone: "rose" },
  ],
  links: [
    { id: "l1", from: "prompt", to: "tokenizer" },
    { id: "l2", from: "tokenizer", to: "llm" },
    { id: "l3", from: "llm", to: "kv" },
    { id: "l4", from: "kv", to: "sampler" },
    { id: "l5", from: "sampler", to: "out" },
    { id: "l-api", from: "prompt", to: "api" },
    { id: "l-srv", from: "prompt", to: "server" },
    { id: "l-gpu", from: "llm", to: "gpu" },
    { id: "l-opt", from: "opt", to: "llm" },
    { id: "l-cost", from: "out", to: "cost" },
  ],
  logTitle: "token stream",
  logColumns: [
    { key: "op", label: "Operation", width: "20%" },
    { key: "item", label: "Token / item" },
    { key: "metric", label: "Logit / input" },
    { key: "value", label: "Prob / result" },
    { key: "t", label: "t (ms)", align: "right", width: "10%" },
  ],
  steps: [
    // 1 ─────────────────────────────────────────────────────────────
    {
      id: "tokens",
      title: "Your words become tokens",
      simple: "First your text is cut into small pieces called tokens, and each piece gets a number.",
      easy: `The model never sees letters. First, your text “${PROMPT}” is **cut into ${PROMPT_TOKENS.length} small pieces**, called tokens, and each piece gets a number. Look at the little **␣** mark: it means a space. “␣capital” is one piece, and the space is part of it.`,
      explain: `The model never sees letters. A {{tokenizer}} (a fixed rulebook) cuts “${PROMPT}” into **${PROMPT_TOKENS.length} {{token|tokens}}** and gives each one a number. Notice the spaces: “␣capital” is one token, space included.`,
      analogy: "Cutting a sentence into fridge-magnet words before you can move them around.",
      detail:
        "Most LLMs use sub-word tokenizers such as {{bpe|BPE}}: common words are one token, rare words split into pieces. A rough rule for English is 1 token ≈ ¾ of a word, so 1,000 words ≈ 1,300 tokens. Everything is counted in tokens: the {{context-window|context window}}, the price and the speed.",
      stage: { kind: "tokens", mode: "split", text: PROMPT, tokens: PROMPT_TOKENS, note: "␣ = a space that belongs to the token" },
      highlight: ["prompt", "tokenizer"],
      packets: [{ from: "prompt", to: "tokenizer", label: `“${PROMPT}”`, tone: "cyan" }],
      log: PROMPT_TOKENS.map((t, i) => ({ tone: "blue" as Tone, cells: { op: "tokenize", item: `“${t}”`, metric: `pos ${i}`, value: "" } })),
      interviewTip: "Prices, limits and latency are all per token, not per word. Say that early when estimating anything.",
    },
    // 2 ─────────────────────────────────────────────────────────────
    {
      id: "prefill",
      title: "Read the whole prompt at once",
      simple: "Before writing anything, the model reads your whole question in one go.",
      easy: `Before it writes a single word, the model **reads your whole question at once**. All ${PROMPT_TOKENS.length} pieces go through together, and the model keeps notes about each one. This reading takes time: in our example you wait about **${TTFT_MS} ms** before the first word appears. A longer question means a longer wait.`,
      explain: `This first pass is the {{prefill}}. All ${PROMPT_TOKENS.length} tokens go through the model side by side, and it saves notes about each one for later. The wait before the first word appears is the {{ttft|time to first token}}: about **${TTFT_MS} ms** in our example. Longer prompts make it longer.`,
      analogy: "Reading the whole question before you start answering.",
      detail:
        "Prefill is one forward pass over n prompt tokens, so it is **compute-bound** (big matrix × matrix work that uses the GPU well). It fills the {{kv-cache|KV cache}} with every prompt token's keys and values and produces the first {{logits}}. TTFT ≈ queueing + prefill; it grows roughly linearly with prompt length (attention adds an n² part).",
      stage: { kind: "tokens", mode: "ids", tokens: PROMPT_TOKENS, ids: PROMPT_TOKENS.map((_, i) => `pos ${i}`), note: `all ${PROMPT_TOKENS.length} read in one pass · first word after ≈ ${TTFT_MS} ms (example timing)` },
      highlight: ["prompt", "tokenizer", "llm", "kv"],
      packets: [
        { from: "tokenizer", to: "llm", label: `${PROMPT_TOKENS.length} tokens`, sub: "all at once", tone: "blue" },
        { from: "llm", to: "kv", label: `store K,V × ${PROMPT_TOKENS.length}`, tone: "amber" },
      ],
      deeper: {
        math: ["Prefill: one forward pass over n prompt tokens → compute-bound (big matrix × matrix).", "Decode: one forward pass per new token → memory-bandwidth-bound (all weights read for 1 token).", "TTFT ≈ queueing + prefill time; it grows roughly linearly with prompt length (attention adds an n² part)."],
      },
      log: [{ tone: "amber", cells: { op: "prefill", item: `${PROMPT_TOKENS.length} tokens in one pass`, metric: "KV cache filled", value: "first logits ready", t: TTFT_MS } }],
      interviewTip: "Split latency into **TTFT** (prefill) and **time per output token** (decode). They have different causes and different fixes.",
    },
    // 3 ─────────────────────────────────────────────────────────────
    {
      id: "next",
      title: "Score every possible next word",
      simple: "The model gives every possible next word a chance, then picks one. Here “Paris” wins easily.",
      easy: `Now the model must write the first word. It gives **every word it knows a chance**, like a score out of 100%. “Paris” gets **${pctS(P_T1[0])}** and “a” gets ${pctS(P_T1[1])}. The simplest rule is to always pick the word with the highest chance, so it writes “Paris”.`,
      explain: `For each word in its vocabulary the model outputs a raw score (a {{logits|logit}}). {{softmax|Softmax}} turns the scores into chances that add up to 100%. “Paris” gets **${pctS(P_T1[0])}**, “a” gets ${pctS(P_T1[1])}. With the simplest rule, always take the top one, it writes “Paris”.`,
      analogy: "A quiz contestant with several answers in mind, each with a different gut feeling of how sure they are.",
      detail: `The real vocabulary has tens of thousands of tokens; five are shown. Always picking the top token is **greedy decoding** (temperature 0). It is predictable but can get repetitive, so chat apps usually sample instead: draw at random, weighted by the probabilities.`,
      stage: { kind: "tokens", mode: "next", tokens: PROMPT_TOKENS, candidates: C0.map((c, i) => ({ text: c, p: P_T1[i] })), chosen: 0, note: "softmax of the logits · temperature 1" },
      highlight: ["llm", "sampler"],
      packets: [{ from: "kv", to: "sampler", label: "logits (1 × vocab)", tone: "violet" }],
      viz: {
        only: "interview",
        kind: "table",
        title: "Logits → probabilities (T = 1)",
        columns: ["Token", "Logit", "Probability"],
        rows: C0.map((c, i) => [shownTok(c), L0[i].toFixed(1), pctS(P_T1[i])]),
        highlightRow: 0,
      },
      deeper: { math: ["p_i = exp(z_i) / Σ_j exp(z_j)", `p(Paris) = e^${L0[0]} / Σ e^z = ${f(P_T1[0], 4)}`, "Greedy: argmax p. Sampling: draw i with probability p_i."] },
      log: C0.map((c, i) => ({ tone: (i === 0 ? "green" : "blue") as Tone, cells: { op: "softmax T=1", item: `“${c}”`, metric: L0[i].toFixed(2), value: f(P_T1[i], 4) } })),
      interviewTip: "Name the output of the model correctly: logits over the vocabulary for the last position, not words.",
    },
    // 4 ─────────────────────────────────────────────────────────────
    {
      id: "sampling",
      title: "Turn the dial: temperature, top-k, top-p",
      simple: "A few dials decide how adventurous the pick is: always the safest word, or sometimes a surprise.",
      easy: `Picking the top word every time gives safe but boring answers. So there are dials. The **temperature** dial controls how adventurous the model is. Set low (0.5), “Paris” becomes even more likely: **${pctS(P_T05[0])}**. Set high (1.5), it drops to **${pctS(P_T15[0])}**, so other words get a chance. Another setting, “top-p”, throws away the very unlikely words and keeps only the likely ones: here it keeps **${TOPP_KEPT}** words.`,
      explain: `{{temperature|Temperature}} (a creativity dial) reshapes the chances: at 0.5 “Paris” rises to **${pctS(P_T05[0])}**, at 1.5 it falls to **${pctS(P_T15[0])}**. {{top-p|Top-p}} (keep only the likeliest words until their chances add up to ${TOP_P * 100}%) cuts the long tail: here it keeps **${TOPP_KEPT}** words.`,
      analogy: "Temperature is how adventurous a diner is: at 0 they always order the house special; at 1.5 they might try anything on the menu.",
      detail:
        "The model outputs one {{logits|logit}} per vocabulary token. A **sampling rule** picks one:\n\n- {{temperature|Temperature}} divides the logits first: low = sharper (safe, repetitive), high = flatter (varied, riskier).\n- {{top-k|Top-k}} keeps only the k likeliest tokens.\n- {{top-p|Top-p}} keeps the smallest set whose probabilities reach p.\n\nThen it renormalises and draws at random. Temperature 0 is treated as “always take the top token” (greedy). Temperature changes randomness, not intelligence.",
      stage: {
        kind: "viz",
        viz: [sampleBars(P_T05, "Temperature 0.5: sharper"), sampleBars(P_T15, "Temperature 1.5: flatter"), sampleBars(P_TOPP, `Top-p ${TOP_P}: tail cut`)],
        note: "same five logits each time · only the picking rule changes",
      },
      highlight: ["llm", "sampler"],
      packets: [
        { from: "kv", to: "sampler", label: "logits (1 × vocab)", tone: "violet" },
        { from: "sampler", to: "sampler", label: `T=1 · top-k=${K} · top-p=${TOP_P}`, tone: "green" },
      ],
      viz: [
        {
          only: "interview",
          kind: "table",
          title: "Same logits, different temperatures",
          columns: ["Token", "Logit", "T = 0.5", "T = 1.0", "T = 1.5"],
          rows: C0.map((c, i) => [shownTok(c), L0[i].toFixed(1), pctS(P_T05[i]), pctS(P_T1[i]), pctS(P_T15[i])]),
          highlightRow: 0,
        },
        { ...sampleBars(P_TOPK, `Top-k (k=${K}) after renormalising`), only: "interview" as const },
      ],
      deeper: {
        math: ["p_i = exp(z_i / T) / Σ_j exp(z_j / T)", `top-p: sort, add up until ≥ ${TOP_P}: ${f(P_T1[0], 3)} + ${f(P_T1[1], 3)} = ${f(P_T1[0] + P_T1[1], 3)} → keep ${TOPP_KEPT}`, "Top-k and top-p are often combined; temperature is applied before both."],
        code: {
          lang: "python",
          src: `
def sample(logits, T=1.0, top_k=None, top_p=None):
    if T == 0:
        return int(np.argmax(logits))          # greedy
    p = softmax(logits / T)
    if top_k: p[np.argsort(p)[:-top_k]] = 0
    if top_p:
        order = np.argsort(p)[::-1]
        keep = order[: np.searchsorted(np.cumsum(p[order]), top_p) + 1]
        mask = np.zeros_like(p); mask[keep] = 1; p *= mask
    return int(np.random.choice(len(p), p=p / p.sum()))`,
        },
      },
      log: [
        { tone: "blue", cells: { op: "T = 0.5", item: "“ Paris”", metric: L0[0].toFixed(2), value: f(P_T05[0], 4) } },
        { tone: "blue", cells: { op: "T = 1.5", item: "“ Paris”", metric: L0[0].toFixed(2), value: f(P_T15[0], 4) } },
        { tone: "green", cells: { op: `top-p ${TOP_P}`, item: `${TOPP_KEPT} tokens kept`, metric: "", value: f(P_TOPP[0], 4) } },
      ],
      interviewTip: "Know that top-p adapts to the distribution's shape while top-k is a fixed cut. That is the usual follow-up.",
    },
    // 5 ─────────────────────────────────────────────────────────────
    {
      id: "decode",
      title: "Write one token, then the next",
      simple: "The chosen word is added to the text, and the model runs again to pick the next one.",
      easy: `Now the model repeats one move: pick a word, add it to the text, then pick the next word, again and again. This is how it writes “${ANSWER.join("").trim()}”. When it picks a special “stop” marker, it ends. Each new piece takes about **${TPOT_MS} ms**, so a 500-piece reply would take about ${((500 * TPOT_MS) / 1000).toFixed(1)} seconds.`,
      explain: `This loop is the {{decode}} phase. It writes “${ANSWER.join("").trim()}”, then picks a special stop token (<eos>, end of sequence) and stops. Each new token takes about **${TPOT_MS} ms** here, so a 500-token reply takes about ${((500 * TPOT_MS) / 1000).toFixed(1)} s.`,
      analogy: "Typing on a phone with predictive text, always tapping the suggested next word.",
      detail: `The picked token is appended to the input and the model runs again, but only for that **one new token**, because earlier tokens' keys and values are already cached. It repeats until \`<eos>\`, a stop string or the max-tokens limit. Total latency ≈ TTFT + output tokens × time per output token, so **output length is often the biggest term**.`,
      stage: { kind: "tokens", mode: "generate", tokens: GEN_TOKENS, promptCount: PROMPT_TOKENS.length, note: `grey = prompt · green = written one by one, ≈ ${TPOT_MS} ms each` },
      highlight: ["llm", "kv", "sampler", "out"],
      packets: PICKED.flatMap((tok, i) => [
        { from: "sampler", to: "out", label: `“${shownTok(tok)}”`, sub: `p=${f(STEP_PROBS[i][argmax(STEP_PROBS[i])], 2)} · ${tokTime(i)} ms`, tone: (tok === "<eos>" ? "rose" : "green") as Tone },
        ...(tok === "<eos>" ? [] : [{ from: "sampler", to: "llm", label: "append + run 1 token", tone: "amber" as Tone }]),
      ]),
      viz: {
        only: "interview",
        kind: "table",
        title: "Greedy decode trace",
        columns: ["Step", "Picked", "p", "Runner-up", "t (ms)"],
        rows: DECODE.map((d, i) => {
          const order = [...STEP_PROBS[i]].map((p, j) => [p, j] as const).sort((a, b) => b[0] - a[0]);
          return [i + 1, shownTok(PICKED[i]), f(order[0][0], 3), `${shownTok(d.cands[order[1][1]])} (${f(order[1][0], 3)})`, tokTime(i)];
        }),
        caption: `Output: “${PROMPT}${ANSWER.join("")}” — then <eos> stops the loop.`,
      },
      deeper: {
        math: [`t(token i) ≈ TTFT + i × TPOT = ${TTFT_MS} + i × ${TPOT_MS} ms (example timing)`, `→ ${Math.round(1000 / TPOT_MS)} tokens/s while decoding`, "Total latency ≈ TTFT + output_tokens × TPOT."],
        code: {
          lang: "python",
          src: `
ids = tokenizer.encode(prompt)
logits, cache = model(ids)                 # prefill
while len(out) < max_tokens:
    tok = sample(logits[-1], T=0)
    if tok == eos_id: break
    out.append(tok)
    logits, cache = model([tok], cache)     # decode: 1 token, reuse cache`,
        },
      },
      log: DECODE.map((d, i) => {
        const j = argmax(STEP_PROBS[i]);
        return { tone: (PICKED[i] === "<eos>" ? "rose" : "green") as Tone, cells: { op: `decode step ${i + 1}`, item: `“${d.cands[j]}”`, metric: d.logits[j].toFixed(2), value: f(STEP_PROBS[i][j], 4), t: tokTime(i) } };
      }),
      interviewTip: "To cut latency, the first question is how long the outputs are: capping or shortening them is often the biggest win.",
    },
    // 6 ─────────────────────────────────────────────────────────────
    {
      id: "kv",
      title: "Keep notes: the KV cache",
      simple: "The model keeps notes about every word it has read, so it never has to re-read the whole text.",
      easy: `Without a trick, the model would re-read the whole text again for every new word. That is a lot of repeated work. So it keeps **notes** about every piece it already read (this notebook is called the cache). Each new piece only adds one line. Without the notes, writing ${OUT} pieces after a ${PROMPT_LEN}-piece question would need **${(WORK_NO_CACHE / WORK_CACHE).toFixed(0)} times** more work. The price is memory: the notebook grows with every piece.`,
      explain: `Those notes are the {{kv-cache|KV cache}} (each token's saved “key” and “value” numbers). Each new word only adds one line to the notebook. Without it, writing ${OUT} tokens after a ${PROMPT_LEN}-token prompt would mean **${(WORK_NO_CACHE / WORK_CACHE).toFixed(0)}×** more work. The price is memory: the notebook grows with every token.`,
      analogy: "Keeping your rough notes while writing an essay instead of re-reading every source for every sentence.",
      detail: `Without a cache, every new token would re-run attention for the *entire* text so far. The cache keeps each token's key and value vectors, so each decode step computes only the new token's. It grows with every token, for every layer, for every request in the batch: **${KV_TOKEN_MIB.toFixed(2)} MiB per token** in the example 7B-class config, ${KV_CTX_GIB.toFixed(2)} GiB at ${CTX} tokens. On long chats it can rival the weights. Grouped-query attention (fewer KV heads) shrinks it a lot.`,
      stage: { kind: "tokens", mode: "generate", tokens: GEN_TOKENS, promptCount: PROMPT_TOKENS.length, notebook: true, note: "each new token adds one line · old lines are read, never recomputed" },
      highlight: ["llm", "kv", "gpu"],
      packets: [
        { from: "llm", to: "kv", label: "+1 token's K,V per layer", tone: "amber" },
        { from: "llm", to: "gpu", label: `${KV_TOKEN_MIB.toFixed(2)} MiB per token`, sub: "example 7B-class config", tone: "blue" },
      ],
      viz: [
        {
          kind: "bars",
          title: `Work to write ${OUT} tokens after a ${PROMPT_LEN}-token prompt`,
          items: [
            { label: "no cache", value: WORK_NO_CACHE, tone: "rose", note: "positions" },
            { label: "KV cache", value: WORK_CACHE, tone: "green", note: "positions" },
          ],
          format: "int",
          caption: `${(WORK_NO_CACHE / WORK_CACHE).toFixed(0)}× fewer token positions through the model.`,
        },
        {
          only: "interview",
          kind: "table",
          title: "KV cache size (example: 32 layers, 32 KV heads, head dim 128, fp16)",
          columns: ["Context", "Per request", "Batch of 8"],
          rows: [512, 2048, CTX, 16384].map((n) => [n.toLocaleString("en-US"), `${((KV_BYTES_PER_TOKEN * n) / GiB).toFixed(2)} GiB`, `${((KV_BYTES_PER_TOKEN * n * 8) / GiB).toFixed(1)} GiB`]),
        },
      ],
      deeper: {
        math: [
          "KV bytes per token = 2 (K and V) × layers × kv_heads × head_dim × bytes",
          `= 2 × ${LAYERS} × ${KV_HEADS} × ${HEAD_DIM} × ${BYTES_FP16} = ${KV_BYTES_PER_TOKEN.toLocaleString("en-US")} B = ${KV_TOKEN_MIB.toFixed(2)} MiB`,
          `× ${CTX} tokens = ${KV_CTX_GIB.toFixed(2)} GiB for one request`,
          `No cache: Σ_{i=1..${OUT}} (${PROMPT_LEN} + i) = ${WORK_NO_CACHE.toLocaleString("en-US")};  cache: ${PROMPT_LEN} + ${OUT} = ${WORK_CACHE}`,
        ],
      },
      log: [
        { tone: "amber", cells: { op: "kv per token", item: `${LAYERS} layers × ${KV_HEADS} heads × ${HEAD_DIM}`, metric: "fp16", value: `${KV_TOKEN_MIB.toFixed(2)} MiB` } },
        { tone: "amber", cells: { op: "kv @ context", item: `${CTX} tokens`, metric: "1 request", value: `${KV_CTX_GIB.toFixed(2)} GiB` } },
        { tone: "green", cells: { op: "work saved", item: `${PROMPT_LEN} prompt + ${OUT} out`, metric: `${WORK_NO_CACHE.toLocaleString("en-US")} → ${WORK_CACHE}`, value: `${(WORK_NO_CACHE / WORK_CACHE).toFixed(0)}× less` } },
      ],
      interviewTip: "The KV cache, not the weights, is often what limits how many users one GPU can serve at once.",
    },
    // 7 ─────────────────────────────────────────────────────────────
    {
      id: "run",
      title: "Where the model runs",
      simple: "You can rent a model from a company, use a host for free models, or run it on your own computers.",
      easy: "Where does the model actually live? There are three ways. **Rent it**: a company runs the model and you pay for each piece of text you send. This is the quickest start. **Use a host**: a service runs free, open models on its computers for you. **Run it yourself**: you buy or rent powerful computers (called GPUs) and run everything. Your data stays with you, but all the work is yours.",
      explain:
        "A **cloud API** (a provider runs the model; you pay per token) is the quickest start. A **hosting platform** serves open models on its GPUs. **Self-hosting** on your own GPUs keeps the data in-house, but you run everything yourself.",
      analogy: "Eating out, ordering a meal kit, or cooking from your own garden: less effort on the left, more control on the right.",
      detail:
        "Self-hosting an open-weights model uses a serving engine (vLLM, TGI, llama.cpp and similar). You get full control and data stays in your network, but you own capacity, scaling and upgrades. A rented GPU costs money every hour whether busy or idle, so self-hosting tends to win only when utilisation is high and steady; spiky or low traffic usually favours per-token APIs. The right answer depends on volume, data rules, latency needs and team skills.",
      stage: {
        kind: "cards",
        zones: [
          {
            id: "api",
            label: "Cloud API",
            icon: "llm",
            tone: "cyan",
            cards: [
              { id: "api-start", title: "Start in minutes", tone: "green" },
              { id: "api-pay", title: "Pay per token", sub: "cheap at low volume", tone: "cyan" },
              { id: "api-data", title: "Data goes to the provider", sub: "their terms and limits", tone: "amber" },
            ],
          },
          {
            id: "host",
            label: "Hosting platform",
            icon: "box",
            tone: "blue",
            cards: [
              { id: "host-open", title: "Open models, their GPUs", tone: "blue" },
              { id: "host-ops", title: "Little to operate", tone: "green" },
              { id: "host-cat", title: "Their catalogue only", tone: "amber" },
            ],
          },
          {
            id: "self",
            label: "Self-hosted",
            icon: "box",
            tone: "slate",
            cards: [
              { id: "self-data", title: "Data stays with you", tone: "green" },
              { id: "self-gpu", title: "Pay per GPU-hour", sub: "busy or idle", tone: "amber" },
              { id: "self-ops", title: "You run everything", sub: "scaling, upgrades, on-call", tone: "rose" },
            ],
          },
        ],
        note: "green = good · amber = trade-off · red = cost to you",
      },
      highlight: ["prompt", "api", "server"],
      packets: [
        { from: "prompt", to: "api", label: "HTTPS · per-token bill", tone: "cyan" },
        { from: "prompt", to: "server", label: "your VPC · per-GPU-hour bill", tone: "slate" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: "Trade-offs",
        columns: ["", "Cloud API", "Self-hosted", "Hosting platform"],
        rows: [
          ["Time to start", "minutes", "days–weeks", "hours"],
          ["Cost shape", "per token", "per GPU-hour", "per token or per hour"],
          ["Data control", "provider terms", "full", "provider terms"],
          ["Ops burden", "none", "high", "low"],
          ["Model choice", "provider's models", "any open weights", "their catalogue"],
          ["Best when", "low/medium volume, top quality", "high steady volume, strict data", "open models without ops"],
        ],
      },
      deeper: {
        text: "Break-even thinking: a GPU you rent costs money every hour whether busy or idle. Self-hosting tends to win only when utilisation is high and steady; spiky or low traffic usually favours per-token APIs.",
      },
      log: [
        { tone: "cyan", cells: { op: "option", item: "cloud API", metric: "pay per token", value: "zero ops" } },
        { tone: "slate", cells: { op: "option", item: "self-hosted", metric: "pay per GPU-hour", value: "full control" } },
        { tone: "blue", cells: { op: "option", item: "hosting platform", metric: "open weights", value: "managed GPUs" } },
      ],
      interviewTip: "Never answer “self-hosting is cheaper” without asking about volume and utilisation: idle GPUs still cost money.",
    },
    // 8 ─────────────────────────────────────────────────────────────
    {
      id: "vram",
      title: "Will it fit on the GPU?",
      simple: "Every number inside the model takes up memory, and all of it has to fit on the graphics card.",
      easy: `A model is made of billions of numbers, and all of them must fit in the memory of a **graphics card (GPU)**. A model with 7 billion numbers, stored at 2 bytes each, needs **${weightsGB(2).toFixed(0)} GB** just to sit there, plus extra room for its notes. The fix is to store each number in a smaller, rougher form (“compressing” it). That shrinks the model to ${weightsGB(1).toFixed(0)} GB, or even ${weightsGB(0.5).toFixed(1)} GB. It becomes slightly less exact, but it fits.`,
      explain: `A model's {{parameter|parameters}} must sit in {{vram|GPU memory}}. A 7-billion-parameter model at 2 bytes each needs **${weightsGB(2).toFixed(0)} GB** for weights alone, plus the KV cache. {{quantization|Quantization}} (storing each number in fewer bits) shrinks it to ${weightsGB(1).toFixed(0)} GB at 8-bit or ${weightsGB(0.5).toFixed(1)} GB at 4-bit.`,
      analogy: "Packing a suitcase: the same clothes fold smaller if you vacuum-pack them, but they come out a little creased.",
      detail: `Memory for weights ≈ **parameters × bytes per parameter**. Add the KV cache (≈ ${KV_CTX_GB.toFixed(1)} GB for one 4k-token request in the example config), activations and framework overhead. Quantization usually costs a little quality, more at 4-bit and on maths or code, so measure it on your own tasks.`,
      stage: {
        kind: "viz",
        viz: [
          {
            kind: "bars",
            title: "Weights for a 7B model by precision (GB)",
            items: PRECISIONS.map((p) => ({ label: p.name, value: weightsGB(p.bytes), tone: (p.bytes >= 2 ? "blue" : "green") as Tone, note: "GB" })),
            format: "fixed2",
          },
          {
            kind: "stack",
            title: "fp16, one 4k-token request",
            segments: [
              { label: "weights", value: +weightsGB(2).toFixed(1), tone: "blue" },
              { label: "KV cache", value: +KV_CTX_GB.toFixed(1), tone: "amber" },
            ],
            caption: `≈ ${(weightsGB(2) + KV_CTX_GB).toFixed(1)} GB before overhead`,
          },
        ],
      },
      highlight: ["llm", "gpu"],
      packets: [{ from: "llm", to: "gpu", label: `7B × 2 B = ${weightsGB(2).toFixed(0)} GB`, sub: "weights only, fp16", tone: "blue" }],
      deeper: {
        math: PRECISIONS.map((p) => `${p.name}: 7 × 10⁹ × ${p.bytes} B = ${weightsGB(p.bytes).toFixed(1)} GB`).concat([`Plus KV cache, e.g. ${KV_CTX_GIB.toFixed(2)} GiB per 4k-token request in the example config.`]),
      },
      log: PRECISIONS.map((p) => ({ tone: "blue" as Tone, cells: { op: "weights", item: `7B @ ${p.name}`, metric: `${p.bytes} B / param`, value: `${weightsGB(p.bytes).toFixed(1)} GB` } })),
      interviewTip: "Do the arithmetic out loud: params × bytes, then add KV cache. Interviewers want the method, not a memorised number.",
    },
    // 9 ─────────────────────────────────────────────────────────────
    {
      id: "optimise",
      title: "Making it faster and cheaper",
      simple: "Four common tricks: compress the model, serve many people together, let a small helper guess ahead, and reuse work.",
      easy: `Companies use four tricks to make models cheaper and faster. **Compress** the model so there is less to read. **Serve many people together**, like one bus instead of a taxi for each person. **Guess ahead**: a small, fast helper writes a few words and the big model quickly checks them. If the helper is right 80% of the time, the big model gets about **${f(specTokens(0.8, 4), 1)}** words for the price of one step. And **reuse work** that was already done.`,
      explain: `{{quantization|Quantization}} means less memory to read per token. {{continuous-batching|Continuous batching}} (serving many users in one pass) raises throughput. {{speculative-decoding|Speculative decoding}} lets a small model guess ahead: about **${f(specTokens(0.8, 4), 1)}** tokens per big-model pass when it is right 80% of the time. Caching reuses work already done.`,
      analogy: "A junior drafts the next few lines, and the senior just approves them in one read.",
      detail:
        "Decode is memory-bandwidth-bound: every weight is read for each token. So fewer bytes per weight (quantization), one weight read serving many users (batching), and several tokens per big-model pass (speculative decoding) all speed it up. Speculative decoding keeps the big model's output distribution with the standard accept/reject rule. Batching raises total tokens/s but can lower each user's speed. Prompt (prefix) caching reuses the prefill of a shared system prompt.",
      stage: {
        kind: "cards",
        zones: [
          { id: "q", label: "Quantize", icon: "box", tone: "violet", cards: [{ id: "opt-q", title: "16-bit → 8 or 4-bit", sub: "less memory to read", tone: "violet" }] },
          { id: "b", label: "Batch", icon: "tray", tone: "blue", cards: [{ id: "opt-b", title: "Many users per pass", sub: "more tokens/s in total", tone: "blue" }] },
          { id: "s", label: "Speculate", icon: "check", tone: "green", cards: [{ id: "opt-s", title: "Draft 4, verify at once", sub: `≈ ${f(specTokens(0.8, 4), 1)} tokens per pass at 80%`, tone: "green" }] },
          { id: "c", label: "Cache", icon: "shelf", tone: "amber", cards: [{ id: "opt-c", title: "Reuse shared prompt work", sub: "and repeated answers", tone: "amber" }] },
        ],
      },
      highlight: ["opt", "llm", "gpu"],
      packets: [
        { from: "opt", to: "llm", label: "int8 / int4 weights", tone: "violet" },
        { from: "opt", to: "llm", label: "batch requests together", tone: "violet" },
        { from: "opt", to: "llm", label: "draft 4 tokens → verify", tone: "green" },
      ],
      viz: {
        only: "interview",
        kind: "bars",
        title: "Speculative decoding: tokens per big-model pass (draft length 4)",
        items: SPEC.map((s) => ({ label: `accept ${s.a * 100}%`, value: s.t, tone: "green" as Tone, note: "tokens" })),
        max: 5,
        format: "fixed2",
        caption: "Expected tokens = (1 − α^(γ+1)) / (1 − α). The gain depends on how often the draft model agrees with the big one.",
      },
      deeper: {
        math: [`E[tokens per pass] = (1 − α^(γ+1)) / (1 − α); α = 0.8, γ = 4 → ${f(specTokens(0.8, 4), 3)}`, "Real speed-up is lower than that ratio because the draft model also costs time.", "Batching: decode at batch 1 is memory-bound; at batch B the same weight read serves B tokens."],
      },
      log: SPEC.map((s) => ({ tone: "green" as Tone, cells: { op: "speculative", item: `α = ${s.a}, γ = 4`, metric: "E[tokens / pass]", value: f(s.t, 3) } })),
      interviewTip: "Tie every speed-up back to why decode is slow (memory bandwidth); that is what separates a good answer from a list.",
    },
    // 10 ────────────────────────────────────────────────────────────
    {
      id: "choose",
      title: "Cost, speed and choosing a model",
      simple: "Bigger models are usually smarter but slower and pricier, so use the smallest one that does the job.",
      easy: `You pay for the text going **in** and the text coming **out**. One request with ${IN_TOK.toLocaleString("en-US")} pieces in and ${OUT_TOK} out costs about **${money(TIERS[0].cost)}** on a small model and **${money(TIERS[2].cost)}** on the biggest kind (example prices, real ones change). A smart habit: start with a small model, test it on real questions, and send only the hard ones to a bigger model.`,
      explain: `You pay for **input tokens + output tokens**. One request with ${IN_TOK.toLocaleString("en-US")} in and ${OUT_TOK} out costs about **${money(TIERS[0].cost)}** on a small model and **${money(TIERS[2].cost)}** on a frontier one (example prices; real ones change). The usual habit: start small, test on real questions, and send only the hard ones to a bigger model.`,
      analogy: "Hiring: you don't send every small errand to your most senior (and most expensive) person.",
      detail:
        "Cost per request = input tokens × input price + output tokens × output price. Latency ≈ {{ttft|TTFT}} + output tokens ÷ tokens per second. Pick the smallest model that passes an evaluation set built from real traffic, route hard requests to a bigger one, cache fixed prompts and cap output length. All prices here are **examples — check current pricing**.",
      stage: {
        kind: "viz",
        viz: [
          {
            kind: "table",
            title: `One request: ${IN_TOK.toLocaleString("en-US")} in + ${OUT_TOK} out (EXAMPLE prices)`,
            columns: ["Tier", "Cost", "Latency", `× ${MONTHLY.toLocaleString("en-US")} / month`],
            rows: TIERS.map((t) => [t.name, money(t.cost), `${t.latency.toFixed(2)} s`, `$${(t.cost * MONTHLY).toLocaleString("en-US", { maximumFractionDigits: 0 })}`]),
          },
          {
            kind: "bars",
            title: "Latency per request (s)",
            items: TIERS.map((t, i) => ({ label: t.name, value: t.latency, tone: (["green", "blue", "rose"] as const)[i] })),
            format: "fixed2",
          },
        ],
      },
      highlight: ["out", "cost"],
      packets: TIERS.map((t) => ({ from: "out", to: "cost", label: `${t.name}: ${money(t.cost)}`, sub: `≈ ${t.latency.toFixed(2)} s`, tone: "rose" as Tone })),
      viz: {
        only: "interview",
        kind: "tree",
        title: "Picking a model",
        root: {
          label: "Must data stay in your network?",
          children: [
            {
              edge: "yes",
              node: { label: "Self-host open weights (or a private deployment)", children: [{ edge: "then", node: { label: "Smallest model that passes your eval; quantize to fit GPUs" } }] },
            },
            {
              edge: "no",
              node: {
                label: "Is the task hard (multi-step reasoning, tricky code)?",
                children: [
                  { edge: "yes", node: { label: "Frontier-tier API; cache prompts; cap output" } },
                  {
                    edge: "no",
                    node: {
                      label: "High volume or tight latency?",
                      children: [
                        { edge: "yes", node: { label: "Small model (maybe fine-tuned) + routing to bigger on failure" } },
                        { edge: "no", node: { label: "Medium-tier API — simplest good default" } },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
        caption: "Always confirm with an evaluation set from your real traffic.",
      },
      deeper: {
        math: TIERS.map((t) => `${t.name}: (${IN_TOK} × ${t.inPerM} + ${OUT_TOK} × ${t.outPerM}) / 10⁶ = ${money(t.cost)};  ${t.ttft} s + ${OUT_TOK}/${t.tps} s = ${t.latency.toFixed(2)} s`),
      },
      log: TIERS.map((t) => ({ tone: "rose" as Tone, cells: { op: "estimate", item: `${t.name} (example price)`, metric: `${IN_TOK} in / ${OUT_TOK} out`, value: `${money(t.cost)} · ${t.latency.toFixed(2)} s` } })),
      interviewTip: "Quote the formula, then say you would measure on real traffic. Never quote a price as fact — they change.",
    },
  ],
  interview: [
    {
      id: "inf-1",
      level: "fresher",
      q: "Walk me through what happens when you send a prompt to an LLM.",
      answer:
        "The text is tokenized into IDs. The model runs a forward pass over the whole prompt in parallel (prefill), caching keys and values for each token. The last position's logits go through softmax and a sampling rule picks the next token. That token is appended and the model runs again for just that token, reusing the cache (decode). This repeats until an end-of-sequence token, a stop sequence or the max-tokens limit. Tokens are detokenized back to text, often streamed as they come.",
      lookFor: "Prefill vs decode, sampling, the loop, and a stop condition.",
      wrong: "“The model generates the whole answer in one pass.”",
    },
    {
      id: "inf-2",
      level: "fresher",
      q: "What does temperature do?",
      answer: "It divides the logits before softmax. Below 1 it sharpens the distribution so likely tokens dominate (more predictable); above 1 it flattens it (more varied, more errors). Temperature 0 is usually implemented as greedy decoding — always take the most likely token.",
      lookFor: "Logits ÷ T before softmax, and the sharpen/flatten effect.",
      wrong: "“Higher temperature makes the model smarter / more creative in a better way.” It only changes randomness.",
    },
    {
      id: "inf-3",
      level: "fresher",
      q: "Top-k vs top-p — what's the difference?",
      answer: "Top-k keeps a fixed number of the most likely tokens. Top-p keeps the smallest set whose cumulative probability reaches p, so it adapts: when the model is confident it may keep one or two tokens, when unsure it keeps many. Both renormalise and then sample.",
      lookFor: "Fixed count vs probability mass, and why top-p adapts.",
      wrong: "“Top-p keeps tokens with probability above p.” It is a cumulative threshold, not a per-token one.",
    },
    {
      id: "inf-4",
      level: "fresher",
      q: "Why do output tokens usually take longer (and often cost more) than input tokens?",
      answer: "Input tokens are processed together in one parallel prefill pass, which uses the GPU efficiently. Output tokens are generated one per forward pass, and each pass has to read the model's weights from memory for a single token, so each output token costs much more GPU time. Many providers price output tokens higher to reflect that.",
      lookFor: "Parallel prefill vs sequential decode; memory-bandwidth-bound decode.",
      wrong: "“Output tokens are bigger.” Tokens are the same kind of unit either way.",
    },
    {
      id: "inf-5",
      level: "mid",
      q: "What is the KV cache, and what does it cost you?",
      answer:
        "During decoding, attention needs the keys and values of every earlier token. The KV cache stores them so each step computes only the new token's K and V instead of reprocessing the whole sequence. The cost is memory: about 2 × layers × KV heads × head dim × bytes per token, per request. It grows with context length and batch size and often limits how many concurrent users a GPU can serve. Grouped-query or multi-query attention and cache quantization reduce it; paged allocation (as in vLLM's PagedAttention) reduces waste.",
      lookFor: "What is cached and why, the size formula, and that it limits concurrency.",
      wrong: "“The KV cache stores previous answers so repeated questions are free.” That's response caching, a different thing.",
    },
    {
      id: "inf-6",
      level: "mid",
      q: "How much GPU memory do you need to serve a 7B model?",
      answer: "Weights ≈ 7 × 10⁹ × 2 bytes ≈ 14 GB in fp16/bf16, about 7 GB in int8 and 3.5 GB in int4. Then add the KV cache (depends on context length, batch size and the model's KV heads) plus activations and framework overhead. So fp16 with a modest context fits on a 24 GB card; long contexts or many concurrent users need more memory or quantization.",
      lookFor: "params × bytes, then KV cache and overhead on top.",
      wrong: "“14 GB exactly” with nothing for the KV cache, or confusing GB of weights with parameter count.",
    },
    {
      id: "inf-7",
      level: "mid",
      q: "What are the trade-offs of quantizing a model to 8 or 4 bits?",
      answer: "Pros: less memory (fit on smaller or fewer GPUs, more room for KV cache) and usually faster decode, since decode is memory-bound. Cons: some quality loss — typically small at 8-bit, more variable at 4-bit and on some tasks such as maths or code. Methods differ (weight-only schemes like GPTQ/AWQ, or quantizing activations too). Always evaluate the quantized model on your own task before shipping.",
      lookFor: "Memory and speed gains, task-dependent quality loss, and evaluating rather than assuming.",
      wrong: "“Quantization has no quality impact” or “it makes training faster” (it's mostly an inference technique here).",
    },
    {
      id: "inf-8",
      level: "mid",
      q: "When would you self-host an open model instead of using a cloud API?",
      answer: "Self-host when data must stay in your environment, when volume is high and steady enough that owned or reserved GPUs beat per-token prices, when you need a specific or fine-tuned open model, or need control over latency and versions. Use an API when traffic is low or spiky, you need top quality fast, or you don't want to run GPU infrastructure. Hosting platforms for open models sit in between.",
      lookFor: "Data control, utilisation/volume, ops burden and quality — not just “cheaper”.",
      wrong: "“Self-hosting is always cheaper.” Idle GPUs cost money; low utilisation often makes it more expensive.",
    },
    {
      id: "inf-9",
      level: "senior",
      design: true,
      q: "LLM latency is too high. What do you do?",
      answer:
        "First measure and split it: queueing, TTFT (prefill) and time per output token × output length, per request type. Then match the fix to the term. Long TTFT: shorten or restructure prompts, use prompt/prefix caching for shared system prompts, trim retrieved context. Slow decode: cap or shorten outputs (often the biggest win), use a smaller or distilled model or route easy requests to one, quantize, enable speculative decoding, tune batching so per-user speed isn't starved. Perceived latency: stream tokens, show progress, run independent calls in parallel instead of chaining. Infrastructure: region close to users, enough capacity to avoid queues. Re-check quality with an eval after each change.",
      lookFor: "Measuring before fixing, separating TTFT from decode, output length as a lever, and checking quality after changes.",
      wrong: "“Just buy bigger GPUs” or “switch to the fastest model” without measuring where the time goes or checking quality.",
    },
    {
      id: "inf-10",
      level: "senior",
      q: "Explain continuous batching and the throughput vs latency trade-off.",
      answer: "Static batching waits to fill a batch and runs until the longest request finishes, wasting slots. Continuous (in-flight) batching adds and removes requests at every decode step, so the GPU stays full. Bigger batches raise total tokens per second because one weight read serves many tokens, but each user's tokens per second can drop and the KV cache needs more memory. You tune max batch size and scheduling to meet a per-user latency target at the lowest cost.",
      lookFor: "Step-level scheduling, why batching helps memory-bound decode, and the per-user latency cost.",
      wrong: "“Batching makes every request faster.” It raises throughput; individual latency can get worse.",
    },
    {
      id: "inf-11",
      level: "senior",
      q: "How does speculative decoding work, and when does it help?",
      answer: "A small draft model proposes several tokens. The large model scores all of them in one forward pass; with the standard acceptance rule (accept with probability min(1, p_target / p_draft), resample from an adjusted distribution on rejection) the output matches what the large model would have sampled alone. It helps when the draft agrees often (predictable text such as code or structured output) and when decoding is memory-bound. Gains shrink if acceptance is low or the GPU is already saturated by large batches.",
      lookFor: "Draft-then-verify, same output distribution, and dependence on acceptance rate.",
      wrong: "“The small model's output replaces the big model's, trading quality for speed.” Done correctly it doesn't change the distribution.",
    },
    {
      id: "inf-12",
      level: "senior",
      design: true,
      q: "A support bot will handle about a million requests a month. How do you choose the model and estimate cost?",
      answer:
        "Build an evaluation set from real tickets with pass/fail criteria. Measure average input and output tokens (system prompt + retrieved context + history in; reply out). Try candidate tiers and compute cost = requests × (in × price_in + out × price_out) using current prices, plus latency at p50/p95. Pick the smallest model that passes; consider routing — small model by default, escalate to a larger one when confidence is low or a classifier flags a hard case. Cut cost with prompt caching for the fixed system prompt, shorter context and capped outputs. Compare with self-hosting only if volume is steady and data rules require it.",
      lookFor: "Eval first, token-based cost formula, p95 latency, routing and caching.",
      wrong: "“Use the best model to be safe” with no cost estimate, or quoting remembered prices as current.",
    },
    {
      id: "inf-13",
      level: "senior",
      q: "Why is decoding memory-bandwidth-bound, and what follows from that?",
      answer: "At batch size 1, generating one token needs every weight read from GPU memory but only a little arithmetic per weight, so memory bandwidth, not compute, sets the speed. That's why fewer bytes per weight (quantization), batching (one read serves many tokens) and speculative decoding (several tokens per big-model pass) all speed up decode.",
      lookFor: "Low arithmetic intensity at small batch and the link to each optimisation.",
      wrong: "“Decode is slow because the GPU runs out of compute.”",
    },
  ],
  quiz: [
    {
      id: "infq-1",
      q: "Lowering temperature from 1.0 to 0.5 does what to the most likely token's probability?",
      options: ["Lowers it", "Raises it", "Leaves it unchanged", "Sets it to exactly 50%"],
      correct: 1,
      explain: `Dividing logits by a smaller T sharpens the distribution. Here “Paris” goes from ${(P_T1[0] * 100).toFixed(1)}% to ${(P_T05[0] * 100).toFixed(1)}%.`,
    },
    {
      id: "infq-2",
      q: `With these probabilities, how many tokens does top-p = ${TOP_P} keep?`,
      options: ["1", "2", "3", "5"],
      correct: ["1", "2", "3", "5"].indexOf(String(TOPP_KEPT)),
      explain: `${f(P_T1[0], 3)} alone is below ${TOP_P}; adding the next (${f(P_T1[1], 3)}) reaches ${f(P_T1[0] + P_T1[1], 3)}, so ${TOPP_KEPT} tokens are kept.`,
    },
    {
      id: "infq-3",
      q: "Roughly how much memory do a 7B model's weights need in fp16?",
      options: [`${weightsGB(0.5).toFixed(1)} GB`, `${weightsGB(1).toFixed(0)} GB`, `${weightsGB(2).toFixed(0)} GB`, `${weightsGB(4).toFixed(0)} GB`],
      correct: 2,
      explain: "7 × 10⁹ parameters × 2 bytes ≈ 14 GB, before KV cache and overhead.",
    },
    {
      id: "infq-4",
      q: "What does the KV cache avoid?",
      options: ["Tokenizing the prompt twice", "Recomputing keys and values of earlier tokens at every decode step", "Calling the API twice for the same question", "Loading the weights from disk"],
      correct: 1,
      explain: "It stores each token's keys and values so each new step only computes the new token's.",
    },
    {
      id: "infq-5",
      q: `Example price: $${TIERS[1].inPerM} per 1M input and $${TIERS[1].outPerM} per 1M output tokens. What does one request with ${IN_TOK} in and ${OUT_TOK} out cost?`,
      options: [money(TIERS[1].cost / 2), money(TIERS[1].cost), money(TIERS[1].cost * 10), money((IN_TOK + OUT_TOK) * TIERS[1].inPerM / 1e6)],
      correct: 1,
      explain: `(${IN_TOK} × ${TIERS[1].inPerM} + ${OUT_TOK} × ${TIERS[1].outPerM}) / 1,000,000 = ${money(TIERS[1].cost)}. Output is priced separately — and higher here.`,
    },
    {
      id: "infq-6",
      q: "Which change most directly reduces time to first token?",
      options: ["Shorter prompt / prompt caching", "Lower temperature", "Higher max-tokens", "Top-k = 1"],
      correct: 0,
      explain: "TTFT is mostly prefill, which scales with prompt length. Sampling settings barely affect it.",
    },
  ],
};

export default scenario;
