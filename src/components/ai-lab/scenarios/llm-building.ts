import type { Scenario } from "../engine/types";
import { f } from "../engine/math";

/* ------------------------------------------------------------------ *
 * How a modern LLM is made and shrunk. Compute, Chinchilla tokens,
 * MoE active share and quantised sizes are worked out from the inputs.
 * ------------------------------------------------------------------ */

const P = 7e9; // parameters
const CHINCHILLA = 20; // ~20 tokens per parameter for compute-optimal training (rule of thumb)
const TOKENS_OPT = P * CHINCHILLA;
const TOKENS_REAL = 2e12; // modern small models train far past that
const FLOPS = 6 * P * TOKENS_REAL; // ≈ 6·N·D training compute

// Mixture of Experts: 8 experts, 2 used per token.
const EXPERTS = 8;
const ACTIVE = 2;
const EXPERT_PARAMS = 5.6e9;
const SHARED = 1.3e9;
const MOE_TOTAL = SHARED + EXPERTS * EXPERT_PARAMS;
const MOE_ACTIVE = SHARED + ACTIVE * EXPERT_PARAMS;

// Quantisation: weight memory for the 7B model.
const BYTES: [string, number][] = [["fp32", 4], ["bf16", 2], ["int8", 1], ["4-bit", 0.5]];
const GB = (b: number) => (P * b) / 1e9;

// Diffusion: noise level over denoising steps (simple linear illustration).
const DIFF_STEPS = [0, 10, 20, 30, 40, 50];

const B = (x: number) => `${f(x / 1e9, 1)}B`;

const scenario: Scenario = {
  id: "llm-building",
  title: "How LLMs are built",
  tagline: "Pre-train on the internet, tune to be helpful, then shrink it to run.",
  imagine:
    "Imagine raising a scholar. First they read an entire library, every book, without a teacher: that gives knowledge and language. Then a tutor shows them how to answer politely and helpfully. Finally, to fit them in a small office, you give them a pocket-sized summary of everything they know. That is pre-training, alignment and compression.",
  recap: [
    "**Pre-training**: next-token prediction on trillions of tokens builds knowledge; compute ≈ 6 × parameters × tokens.",
    "**Post-training** (SFT, RLHF/DPO, reasoning RL) turns a text-completer into a helpful assistant; **MoE** adds capacity while using only some experts per token.",
    "**Quantisation** shrinks weights (16 → 8 → 4 bits) to run cheaply; **multimodal** models add image/audio encoders, and **diffusion** models generate images by removing noise.",
  ],
  overview: {
    plain:
      "A large language model is first trained to predict the next word on a huge amount of text, which teaches it language and facts. Then it is trained further to follow instructions and be safe. To run it cheaply, its numbers are stored in smaller formats.",
    definition:
      "{{pretraining|Pre-training}} optimises next-token loss over trillions of tokens; {{scaling|scaling laws}} relate loss to parameters, data and compute (training FLOPs ≈ 6ND). Post-training applies SFT, preference optimisation (RLHF, DPO) and, for {{reasoning|reasoning models}}, reinforcement learning on verifiable tasks with long chains of thought. {{moe|Mixture of Experts}} routes each token to a few expert feed-forward blocks. {{quantisation|Quantisation}} stores weights in int8/4-bit for cheaper inference. Multimodal models attach vision/audio encoders; {{diffusion|diffusion models}} generate images by iterative denoising.",
    analogy: "Read the whole library, get tutored on manners, then carry a pocket edition.",
    facts: [
      ["Compute-optimal data (7B)", `≈ ${f(TOKENS_OPT / 1e9, 0)}B tokens (~20/param)`],
      ["Typical today (7B)", `trained on ${f(TOKENS_REAL / 1e12, 0)}T+ tokens, far past that`],
      ["Training compute", `≈ 6·N·D = ${FLOPS.toExponential(1)} FLOPs`],
      ["MoE example", `${EXPERTS} experts, ${ACTIVE} active: ${B(MOE_TOTAL)} total, ${B(MOE_ACTIVE)} used per token`],
      ["7B weights", BYTES.map(([n, b]) => `${n} ${f(GB(b), 1)} GB`).join(" · ")],
      ["Numbers above", "rules of thumb, check current papers"],
    ],
    whereUsed: "Understanding model cards and choosing models: why a 4-bit 7B runs on a laptop, why MoE models are cheap per token but big in memory, and why reasoning models are slower but better at maths and code.",
  },
  objects: [
    { id: "web", kind: "cloud", label: "Text corpus", sub: "trillions of tokens", at: [0, 1.8], tone: "blue" },
    { id: "pre", kind: "gpu", label: "Pre-training", sub: "next-token loss", at: [3, 1.8], tone: "amber" },
    { id: "base", kind: "llm", label: "Base model", sub: "completes text", at: [6, 0], tone: "slate" },
    { id: "post", kind: "gear", label: "Post-training", sub: "SFT, RLHF/DPO, RL", at: [6, 3.6], tone: "violet" },
    { id: "chat", kind: "llm", label: "Assistant", sub: "follows instructions", at: [9, 1.8], tone: "green" },
  ],
  links: [
    { id: "l1", from: "web", to: "pre" },
    { id: "l2", from: "pre", to: "base" },
    { id: "l3", from: "base", to: "post" },
    { id: "l4", from: "post", to: "chat" },
  ],
  logTitle: "Model card notes",
  logColumns: [
    { key: "stage", label: "Stage", width: "22%" },
    { key: "what", label: "What" },
    { key: "number", label: "Number", align: "right", width: "20%" },
  ],
  steps: [
    {
      id: "pretrain",
      title: "Pre-training: guess the next word, trillions of times",
      simple: "The model reads huge amounts of text and keeps guessing the next word, learning language and facts on the way.",
      easy: "Pre-training has one simple game: **hide the next word and guess it**. “The capital of France is ___”. Played on **trillions of words** from the web, books and code, the model must learn grammar, facts, reasoning patterns and coding style just to guess well. The data is cleaned first: duplicates, spam and low-quality pages are removed, because data quality matters as much as size.",
      explain:
        "{{pretraining|Pre-training}}: minimise cross-entropy on next-token prediction over a filtered, deduplicated mix (web, books, code, maths, multilingual). No labels needed (self-supervised). The result is a **base model** that continues text; it is knowledgeable but not yet a helpful assistant.",
      stage: {
        kind: "chat",
        messages: [
          { role: "user", text: "The capital of France is", note: "a base model just continues text" },
          { role: "assistant", text: " Paris. The capital of Germany is Berlin. The capital of Italy is", note: "keeps going, doesn't “answer”" },
        ],
        aside: { title: "Typical data mix", items: ["filtered web pages", "books and papers", "code", "maths", "many languages"], tone: "blue" },
      },
      highlight: ["web", "pre", "base"],
      packets: [{ from: "web", to: "pre", label: "trillions of tokens", tone: "blue" }],
      log: [{ tone: "amber", cells: { stage: "pre-training", what: "next-token loss on 2T tokens", number: FLOPS.toExponential(1) + " FLOPs" } }],
    },
    {
      id: "scaling",
      title: "Scaling laws: bigger, more data, more compute",
      simple: "Loss drops in a predictable way as you add parameters, data and compute, so labs can plan before training.",
      easy: `Researchers found that the error falls **smoothly and predictably** as you add more parameters, more data and more compute. The **Chinchilla** result said: for a fixed budget, use about **20 tokens per parameter**, about ${f(TOKENS_OPT / 1e9, 0)} billion tokens for a 7B model. Today small models are trained much longer than that (${f(TOKENS_REAL / 1e12, 0)} trillion+), because a small model that's cheap to **run** is worth extra training cost.`,
      explain: `{{scaling|Scaling laws}}: loss ≈ power law in N (params) and D (tokens); compute C ≈ 6ND. Chinchilla-optimal D ≈ 20N (${f(TOKENS_OPT / 1e9, 0)}B for 7B). Inference-heavy products “over-train” smaller models (e.g. ${f(TOKENS_REAL / 1e12, 0)}T tokens) to lower serving cost.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "plot",
          title: "Loss falls smoothly with compute (illustrative)",
          series: [{ label: "loss", points: [[1, 3.4], [2, 3.0], [3, 2.75], [4, 2.55], [5, 2.42], [6, 2.32], [7, 2.25]], tone: "violet" }],
          x: [1, 7],
          y: [2, 3.6],
          xLabel: "compute (each step = 10× more)",
          yLabel: "loss",
        },
      },
      deeper: { math: ["C ≈ 6 · N · D", "Chinchilla: D_opt ≈ 20 · N"] },
    },
    {
      id: "post",
      title: "Post-training: from text-completer to assistant",
      simple: "Extra training on good examples and human preferences turns the base model into a helpful, safe assistant.",
      easy: "A base model just continues text. To make an **assistant**, it is trained on many examples of **questions with ideal answers** (instruction tuning), then on **which answer people preferred** (RLHF or DPO), plus safety data so it refuses harmful requests. This stage is much smaller than pre-training but changes behaviour enormously.",
      explain:
        "Post-training: {{sft|SFT}} on instruction–response data (chat format), then preference optimisation ({{rlhf|RLHF}} with a reward model and PPO, or {{dpo|DPO}}), plus safety and tool-use data. It shapes format, helpfulness and refusals; knowledge mostly comes from pre-training.",
      stage: {
        kind: "chat",
        messages: [
          { role: "user", text: "What is the capital of France?" },
          { role: "assistant", text: "The capital of France is Paris.", note: "after post-training: answers, then stops" },
        ],
        aside: { title: "Post-training stages", items: ["SFT on ideal answers", "RLHF or DPO on preferences", "safety + tool-use data"], tone: "violet" },
      },
      highlight: ["base", "post", "chat"],
      packets: [{ from: "post", to: "chat", label: "helpful + safe", tone: "green" }],
    },
    {
      id: "reasoning",
      title: "Reasoning models: think before answering",
      simple: "Some models are trained to write long hidden working-out first, which helps on maths and code but takes longer.",
      easy: "Newer **reasoning models** are trained with reinforcement learning on problems that have **checkable answers** (maths, code tests). They learn to **write out their working** before the final answer, trying, checking and backtracking. They score much higher on hard problems, but they use **many more tokens**, so they are slower and cost more. Use them when the task really needs thinking.",
      explain:
        "{{reasoning|Reasoning models}} are post-trained with RL on verifiable rewards to produce long chains of thought; quality scales with test-time compute (more thinking tokens). Trade-offs: latency, cost, and overthinking simple tasks. Many APIs expose a thinking budget or effort setting.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Normal vs reasoning model",
          columns: ["", "normal chat model", "reasoning model"],
          rows: [
            ["answers", "straight away", "after hidden working-out"],
            ["tokens per answer", "hundreds", "thousands or more"],
            ["good at", "chat, writing, simple tasks", "maths, code, multi-step logic"],
            ["latency and cost", "low", "higher"],
          ],
        },
      },
      interviewTip: "Say when NOT to use one: simple classification or extraction wastes reasoning tokens.",
    },
    {
      id: "moe",
      title: "Mixture of Experts: big brain, small bill",
      simple: "The model has many expert blocks, but each word only uses a couple of them, so it's big yet cheap per word.",
      easy: `A **Mixture of Experts** model has, say, **${EXPERTS} expert blocks** in each layer and a small **router** that picks the best **${ACTIVE}** for each word. So the model holds ${B(MOE_TOTAL)} numbers in total, but each word only uses about **${B(MOE_ACTIVE)}**. You get the knowledge of a big model at the speed of a smaller one. The catch: **all** experts must still sit in GPU memory.`,
      explain: `{{moe|MoE}} replaces the dense feed-forward block with E experts and a learned top-k router. Here E = ${EXPERTS}, k = ${ACTIVE}: total ${B(MOE_TOTAL)}, active ${B(MOE_ACTIVE)} per token (${f((MOE_ACTIVE / MOE_TOTAL) * 100, 0)}%). Compute per token tracks active params; memory tracks total. Training needs load-balancing losses so experts are used evenly.`,
      stage: {
        kind: "cards",
        zones: [
          { id: "tok", label: "token", icon: "doc", tone: "cyan", text: "“biryani”" },
          { id: "router", label: "router picks 2", icon: "search", tone: "amber", text: "scores all 8 experts" },
          { id: "experts", label: `${EXPERTS} experts`, icon: "box", tone: "slate", cards: Array.from({ length: EXPERTS }, (_, i) => ({ id: `e${i}`, title: `expert ${i + 1}`, tone: (i === 2 || i === 5 ? "green" : "slate") as "green" | "slate", badge: i === 2 || i === 5 ? "used" : undefined, struck: !(i === 2 || i === 5) })) },
        ],
        note: `only ${ACTIVE} of ${EXPERTS} experts run for this token`,
      },
      log: [{ tone: "violet", cells: { stage: "architecture", what: `MoE ${EXPERTS} experts, top-${ACTIVE}`, number: `${B(MOE_ACTIVE)} active` } }],
    },
    {
      id: "quant",
      title: "Quantisation: smaller numbers, smaller model",
      simple: "Storing each weight in fewer bits shrinks the model so it runs on cheaper hardware, with a small quality loss.",
      easy: `Each of the 7 billion weights is a number. In 32-bit form the model needs **${f(GB(4), 0)} GB**; in 16-bit **${f(GB(2), 0)} GB**; in 8-bit **${f(GB(1), 0)} GB**; in **4-bit** just **${f(GB(0.5), 1)} GB**, small enough for a laptop. Like saving a photo as a smaller JPEG: a little detail is lost, but usually not much.`,
      explain: `{{quantisation|Quantisation}} maps weights to fewer bits with a scale per group. Post-training methods (GPTQ, AWQ, GGUF k-quants) keep quality close at 8 and often 4 bits; KV-cache quantisation saves memory on long contexts. Memory for weights ≈ params × bytes: ${BYTES.map(([n, b]) => `${n} ${f(GB(b), 1)} GB`).join(", ")}.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "bars",
          title: "7B model weights (GB)",
          items: BYTES.map(([n, b], i) => ({ label: n, value: GB(b), tone: (["rose", "amber", "blue", "green"] as const)[i] })),
          format: "fixed1",
          caption: "Plus memory for the KV cache and activations at run time.",
        },
      },
      log: [{ tone: "green", cells: { stage: "deploy", what: "4-bit quantised", number: `${f(GB(0.5), 1)} GB` } }],
    },
    {
      id: "multimodal",
      title: "Pictures, sound and diffusion",
      simple: "Multimodal models turn images or audio into tokens the LLM can read. Diffusion models make images by removing noise step by step.",
      easy: `To **understand** images, a vision encoder cuts the picture into small patches and turns them into tokens the LLM can read alongside text. Speech works the same way with audio. To **generate** images, **diffusion** models start from pure noise and remove a little noise at each of about ${DIFF_STEPS[DIFF_STEPS.length - 1]} steps, guided by your text, until a picture appears.`,
      explain: `Vision-language models: a ViT-style encoder + projector map image patches into the LLM's embedding space. {{diffusion|Diffusion}}: train a network to predict the noise added to an image; at generation, start from noise and denoise over ~${DIFF_STEPS[DIFF_STEPS.length - 1]} steps with text conditioning (classifier-free guidance), often in a compressed latent space.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "bars",
          title: "Diffusion: noise left at each step",
          items: DIFF_STEPS.map((s) => ({ label: `step ${s}`, value: 100 - (s / DIFF_STEPS[DIFF_STEPS.length - 1]) * 100, tone: (s < 20 ? "slate" : s < 40 ? "amber" : "green") as "slate" | "amber" | "green" })),
          max: 100,
          format: "int",
          caption: "% noise (illustrative): from static to a finished picture.",
        },
      },
    },
  ],
  interview: [
    {
      id: "lb-1",
      level: "fresher",
      q: "What is the difference between a base model and a chat model?",
      answer: "A base model is the result of pre-training: it continues text and has knowledge but doesn't reliably follow instructions. A chat model adds post-training (SFT on instruction data, then RLHF or DPO and safety data), so it answers questions, follows formats and refuses harmful requests.",
      lookFor: "Pre-training vs post-training, what each contributes.",
      wrong: "“The chat model was trained on more data.”",
    },
    {
      id: "lb-2",
      level: "mid",
      q: "Explain Mixture of Experts and its trade-offs.",
      answer: "Each MoE layer has several expert feed-forward blocks and a router that sends each token to the top-k. Compute per token scales with active parameters, so you get a large model's capacity at lower FLOPs. But all experts must be in memory, routing needs load balancing, and serving is more complex.",
      lookFor: "Router, top-k, active vs total params, memory cost, load balancing.",
      wrong: "“MoE means several separate models voting.”",
    },
    {
      id: "lb-3",
      level: "mid",
      q: "Why would you quantise a model, and what can go wrong?",
      answer: "To cut memory and cost: 4-bit weights are about a quarter of 16-bit, so models fit on smaller GPUs or laptops and run faster when memory-bound. Risks: quality loss on maths, code or rare languages, especially at low bits; outlier weights need careful methods (GPTQ, AWQ). Always re-run your evals after quantising.",
      lookFor: "Memory maths, methods, measured quality check.",
      wrong: "“Quantisation retrains the model to be smaller.”",
    },
    {
      id: "lb-4",
      level: "senior",
      q: "What do scaling laws tell you, and why do labs over-train small models?",
      answer: "Loss falls as a predictable power law in parameters, data and compute; Chinchilla found ~20 tokens per parameter is compute-optimal for training. But total cost includes serving, so for heavily used models it is cheaper to train a smaller model on far more tokens: training costs more once, every inference costs less forever.",
      lookFor: "Power law, 6ND, Chinchilla, training vs inference cost.",
      wrong: "“Bigger is always better, so train the largest model you can.”",
    },
  ],
  quiz: [
    {
      id: "lbq-1",
      q: "Weights of a 7B model in 4-bit need about…",
      options: ["28 GB", "14 GB", `${f(GB(0.5), 1)} GB`, "0.7 GB"],
      correct: 2,
      explain: "7 billion × 0.5 bytes.",
    },
    {
      id: "lbq-2",
      q: `In the MoE example, how many parameters does each token use?`,
      options: [B(MOE_TOTAL), B(MOE_ACTIVE), "1.3B", "All of them"],
      correct: 1,
      explain: `Shared layers + ${ACTIVE} experts.`,
    },
    {
      id: "lbq-3",
      q: "Pre-training mainly gives the model…",
      options: ["Politeness", "Knowledge and language", "Refusals", "Tool use"],
      correct: 1,
      explain: "Behaviour comes from post-training; knowledge from pre-training.",
    },
    {
      id: "lbq-4",
      q: "Diffusion models generate an image by…",
      options: ["Predicting the next pixel", "Removing noise step by step", "Copying training images", "Sorting patches"],
      correct: 1,
      explain: "They learn to predict and remove noise.",
    },
  ],
};

export default scenario;
