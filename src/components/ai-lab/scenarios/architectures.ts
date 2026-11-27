import type { Scenario } from "../engine/types";

/* ------------------------------------------------------------------ *
 * CNNs, RNNs/LSTMs and the three transformer shapes. The convolution
 * output, pooling and parameter counts are computed below.
 * ------------------------------------------------------------------ */

// A 5×5 image of a vertical edge, and a 3×3 vertical-edge filter.
const IMG = [
  [0, 0, 9, 9, 9],
  [0, 0, 9, 9, 9],
  [0, 0, 9, 9, 9],
  [0, 0, 9, 9, 9],
  [0, 0, 9, 9, 9],
];
const K = [
  [-1, 0, 1],
  [-1, 0, 1],
  [-1, 0, 1],
];
const CONV = Array.from({ length: 3 }, (_, r) =>
  Array.from({ length: 3 }, (_, c) => K.reduce((s, row, i) => s + row.reduce((t, k, j) => t + k * IMG[r + i][c + j], 0), 0)),
);
const POOL = Math.max(...CONV.flat());

// Parameter counts: a dense layer on a 224×224×3 image vs a 3×3 conv with 64 filters.
const DENSE = 224 * 224 * 3 * 64;
const CONV_P = 3 * 3 * 3 * 64 + 64;

// RNN memory: how much of word 1 survives after n steps if each step keeps 70%.
const KEEP = 0.7;
const RNN_MEM = [1, 5, 10, 20].map((n) => ({ n, left: KEEP ** n }));

const scenario: Scenario = {
  id: "architectures",
  title: "CNNs, RNNs & transformer types",
  tagline: "Why images used CNNs, why RNNs faded, and BERT vs GPT vs T5.",
  imagine:
    "Imagine three readers. One scans a photo with a small magnifying glass, square by square. One reads a novel word by word and must remember the start by the end. One spreads the whole page on a table and looks at everything at once. Those are CNNs, RNNs and transformers.",
  recap: [
    "**CNNs** slide small shared filters over an image: few parameters, they find edges, then shapes, then objects. Still strong for vision on small budgets.",
    "**RNNs/LSTMs** read one step at a time and carry a memory; slow to train and forgetful over long text, which is why **transformers** replaced them.",
    "Transformers come in three shapes: **encoder-only** (BERT: understand), **decoder-only** (GPT: generate), **encoder–decoder** (T5: transform input to output).",
  ],
  overview: {
    plain:
      "Different kinds of data were first handled by different network shapes: CNNs for images, RNNs for sequences. Transformers now do both well. Knowing why each existed, and which transformer shape fits which job, is a classic interview topic.",
    definition:
      "A {{cnn|CNN}} applies learned convolution filters with shared weights and local receptive fields, plus pooling, building a hierarchy of features. An {{rnn|RNN}} updates a hidden state token by token; {{lstm|LSTMs/GRUs}} add gates to keep information longer. {{transformer|Transformers}} replace recurrence with self-attention, enabling parallel training over the whole sequence. Variants: encoder-only (bidirectional, e.g. BERT), decoder-only (causal, e.g. GPT, Llama, Claude) and encoder–decoder (e.g. T5, original translation models). Vision Transformers (ViT) apply attention to image patches.",
    analogy: "A magnifying glass (CNN), a reader with a notebook (RNN), and a whole page on the table (transformer).",
    facts: [
      ["Edge filter output", `3×3 map, strongest ${POOL}`],
      ["Dense on 224×224 image", `${DENSE.toLocaleString()} weights for 64 units`],
      ["3×3 conv, 64 filters", `${CONV_P.toLocaleString()} weights`],
      ["RNN memory after 20 steps", `${(RNN_MEM[3].left * 100).toFixed(2)}% (at 70% kept per step)`],
      ["BERT", "fill-in-the-blank training, used for embeddings, classification"],
      ["GPT", "next-word training, used for chat and generation"],
    ],
    whereUsed: "CNNs: phone cameras, medical scans, defect detection. RNNs: older speech and time-series systems. Encoder models: search embeddings, classifiers, rerankers. Decoder models: chat assistants and code models. Encoder–decoder: translation and summarisation.",
  },
  objects: [
    { id: "img", kind: "table", label: "Image", sub: "pixels", at: [0, 0], tone: "blue" },
    { id: "cnn", kind: "matrix", label: "CNN", sub: "sliding filters", at: [3, 0], tone: "amber" },
    { id: "text", kind: "doc", label: "Sentence", sub: "tokens", at: [0, 3.6], tone: "cyan" },
    { id: "rnn", kind: "gear", label: "RNN / LSTM", sub: "one word at a time", at: [3, 3.6], tone: "slate" },
    { id: "tf", kind: "llm", label: "Transformer", sub: "attention, all at once", at: [6.5, 1.8], tone: "violet" },
  ],
  links: [
    { id: "l1", from: "img", to: "cnn" },
    { id: "l2", from: "text", to: "rnn" },
    { id: "l3", from: "cnn", to: "tf" },
    { id: "l4", from: "rnn", to: "tf" },
  ],
  logTitle: "Architecture notes",
  logColumns: [
    { key: "arch", label: "Architecture", width: "24%" },
    { key: "idea", label: "Key idea" },
    { key: "use", label: "Use today" },
  ],
  steps: [
    {
      id: "dense-problem",
      title: "Why not just connect every pixel?",
      simple: "Connecting every pixel to every neuron needs millions of weights and ignores that nearby pixels belong together.",
      easy: `A small photo is 224 × 224 pixels with 3 colours: about 150,000 numbers. A plain layer that connects **every pixel to each of 64 neurons** needs **${DENSE.toLocaleString()}** weights, and it doesn't know that neighbouring pixels belong together or that a cat in the corner is still a cat. A **CNN** fixes both.`,
      explain: `A dense layer on a 224×224×3 input with 64 units has ${DENSE.toLocaleString()} weights and no notion of locality or translation. A 3×3 convolution with 64 filters has ${CONV_P.toLocaleString()} (weights + biases), reused at every position: **weight sharing** and **local receptive fields**.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "bars",
          title: "Weights needed for 64 feature detectors",
          items: [
            { label: "dense layer", value: DENSE, tone: "rose" },
            { label: "3×3 conv", value: CONV_P, tone: "green" },
          ],
          format: "int",
        },
      },
      highlight: ["img", "cnn"],
    },
    {
      id: "conv",
      title: "A filter slides over the image",
      simple: "A small 3×3 grid of numbers slides across the picture and lights up where it finds its pattern.",
      easy: `A **filter** is a tiny 3×3 grid of numbers. Slide it over the image; at each spot, multiply and add. This one looks for a **dark-to-bright vertical edge**: it gives **${POOL}** where the edge is and **0** on flat areas. A CNN learns many filters: early ones find edges, later ones combine them into eyes, wheels, letters.`,
      explain: `Convolution: at each position, sum(filter ⊙ patch). The vertical-edge filter outputs ${CONV.map((r) => r.join(" ")).join(" / ")} on this image: high where pixel values jump left to right. Stacking conv layers grows the receptive field; features go from edges to textures to parts to objects.`,
      stage: {
        kind: "viz",
        viz: [
          { kind: "matrices", title: "image  ⊛  filter  =  feature map", items: [{ name: "image (5×5)", values: IMG, tone: "slate" }, { name: "edge filter", values: K, tone: "amber" }, { name: "feature map", values: CONV, tone: "green" }], ops: ["⊛", "="], format: "int" },
        ],
      },
      highlight: ["cnn"],
      packets: [{ from: "img", to: "cnn", label: "slide 3×3", tone: "amber" }],
      log: [{ tone: "amber", cells: { arch: "CNN", idea: "shared local filters + pooling", use: "vision on small budgets, edge devices" } }],
      deeper: { math: ["out[r][c] = Σᵢ Σⱼ K[i][j] · X[r+i][c+j]", "output size = (n − k + 2p) / s + 1"] },
    },
    {
      id: "pool",
      title: "Pooling and the feature pyramid",
      simple: "Pooling keeps the strongest signal in each area and shrinks the map, so later layers see the big picture.",
      easy: `After a filter, **pooling** keeps only the strongest value in each small area (here ${POOL} from the whole 3×3 map). The map gets smaller, the network cares less about exact positions, and the next layers can look at **bigger patterns**. Stack this a few times and you go from pixels to “there's a cat here”. Famous designs: **ResNet** added skip connections so CNNs could go 100+ layers deep.`,
      explain: `Max pooling (2×2, stride 2) halves width and height and adds small translation invariance; here max over the map = ${POOL}. Modern CNNs (ResNet, EfficientNet, ConvNeXt) use residual connections and normalisation. For classification, a global pool + linear head gives class scores; transfer learning reuses ImageNet-pretrained backbones.`,
      stage: {
        kind: "cards",
        zones: [
          { id: "l1", label: "early layers", icon: "box", tone: "slate", cards: [{ id: "a", title: "edges", tone: "slate" }, { id: "b", title: "colour blobs", tone: "slate" }] },
          { id: "l2", label: "middle layers", icon: "box", tone: "amber", cards: [{ id: "c", title: "textures, corners", tone: "amber" }, { id: "d", title: "eyes, wheels", tone: "amber" }] },
          { id: "l3", label: "last layers", icon: "check", tone: "green", cards: [{ id: "e", title: "“cat” 0.94", tone: "green", badge: "class" }] },
        ],
        note: "each pooling step shrinks the map and widens what one neuron sees",
      },
      highlight: ["cnn"],
    },
    {
      id: "rnn",
      title: "RNNs read one word at a time",
      simple: "An RNN reads a sentence word by word and keeps a small memory, but the memory of early words fades.",
      easy: `For text, an **RNN** reads **one word at a time** and updates a small memory after each. The trouble: the memory of early words **fades**. If each step keeps 70% of it, after 20 words only **${(RNN_MEM[3].left * 100).toFixed(2)}%** of the first word is left. **LSTMs** add gates (keep, forget, output) that hold memory much longer, but they still read one word at a time, so they are **slow to train**.`,
      explain: `An {{rnn|RNN}} computes hₜ = tanh(W·hₜ₋₁ + U·xₜ). Information and gradients pass through repeated multiplications, so they vanish over long sequences (illustrated: ${KEEP}ⁿ). {{lstm|LSTM}}/GRU gates create an additive memory path that lasts longer. But step t needs step t−1, so training can't be parallelised across the sequence.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "bars",
          title: "How much of word 1 is still remembered",
          items: RNN_MEM.map((m) => ({ label: `after ${m.n} words`, value: m.left * 100, tone: (m.left > 0.2 ? "green" : m.left > 0.02 ? "amber" : "rose") as "green" | "amber" | "rose" })),
          max: 100,
          format: "fixed1",
          caption: "Illustration with 70% kept per step (%).",
        },
      },
      highlight: ["text", "rnn"],
      packets: [{ from: "text", to: "rnn", label: "word… by… word", tone: "slate" }],
      log: [{ tone: "slate", cells: { arch: "RNN / LSTM", idea: "hidden state passed step by step", use: "small streaming / time-series models" } }],
    },
    {
      id: "why-tf",
      title: "Transformers: look at everything at once",
      simple: "A transformer sees all words together, so it trains fast on GPUs and links far-apart words directly.",
      easy: "A **transformer** puts the whole sentence on the table at once. Every word can look **directly** at every other word through attention, so the first and last words are one step apart, not twenty. And because nothing waits for the previous word, **all positions train in parallel** on a GPU. That speed is what made today's huge models possible.",
      explain:
        "Self-attention gives O(1) path length between any two tokens and full parallelism over the sequence during training. The cost is O(n²) attention in sequence length, handled with tricks like FlashAttention, sliding windows and KV caching. Vision Transformers apply the same idea to 16×16 image patches.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "RNN vs transformer",
          columns: ["", "RNN / LSTM", "Transformer"],
          rows: [
            ["reads", "one token at a time", "all tokens at once"],
            ["distance word 1 → word 50", "49 steps", "1 step (attention)"],
            ["training on GPU", "sequential, slow", "parallel, fast"],
            ["cost with length n", "O(n)", "O(n²) attention"],
            ["today", "niche", "default for text, growing in vision"],
          ],
        },
      },
      highlight: ["tf"],
      packets: [{ from: "rnn", to: "tf", label: "replaced by", tone: "violet" }],
      log: [{ tone: "violet", cells: { arch: "Transformer", idea: "self-attention, parallel", use: "LLMs, embeddings, ViT" } }],
    },
    {
      id: "three-shapes",
      title: "Three transformer shapes",
      simple: "BERT reads to understand, GPT writes the next word, and T5 reads an input and writes an output.",
      easy: "Transformers come in three shapes. **Encoder-only (BERT)**: every word sees words on **both sides**; trained by filling in hidden words; great for **understanding** (search, classification). **Decoder-only (GPT, Llama, Claude)**: each word sees only **earlier** words; trained to **predict the next word**; great for **generating**. **Encoder–decoder (T5)**: one part reads the input, the other writes the output; natural for **translation** and summarising.",
      explain:
        "Encoder-only: bidirectional attention, masked-language-model training, output = contextual embeddings (BERT, RoBERTa; used for embeddings and rerankers). Decoder-only: causal mask, next-token training, autoregressive generation (GPT family, Llama, Claude). Encoder–decoder: encoder reads the source, decoder generates with cross-attention to it (T5, BART). Decoder-only dominates because one objective scales to every task through prompting.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Which shape for which job",
          columns: ["shape", "sees", "trained to", "examples", "use for"],
          rows: [
            ["encoder-only", "both sides", "fill in [MASK]", "BERT, RoBERTa", "embeddings, classify, rerank"],
            ["decoder-only", "only earlier words", "predict next word", "GPT, Llama, Claude", "chat, code, generation"],
            ["encoder–decoder", "input fully, output so far", "map input → output", "T5, BART", "translate, summarise"],
          ],
          highlightRow: 1,
        },
      },
      highlight: ["tf"],
      interviewTip: "Mention the attention mask: bidirectional for encoders, causal for decoders. That is the real difference.",
    },
  ],
  interview: [
    {
      id: "ar-1",
      level: "fresher",
      q: "Why do CNNs work well on images?",
      answer: "They use small filters with shared weights that slide over the image, so they detect the same pattern anywhere with very few parameters, and they exploit locality: nearby pixels are related. Stacking layers builds features from edges to objects, and pooling adds some translation invariance.",
      lookFor: "Weight sharing, locality, hierarchy, parameter efficiency.",
      wrong: "“Because they have more layers.”",
    },
    {
      id: "ar-2",
      level: "mid",
      q: "Why did transformers replace RNNs for language?",
      answer: "RNNs process tokens sequentially, so training can't be parallelised and long-range information passes through many steps and fades. Transformers use self-attention: any token reaches any other in one step, and all positions train in parallel on GPUs, which allowed scaling to huge data and models.",
      lookFor: "Parallelism and path length; mentions the O(n²) cost.",
      wrong: "“Transformers have more parameters.”",
    },
    {
      id: "ar-3",
      level: "mid",
      q: "BERT vs GPT: what is the actual difference?",
      answer: "BERT is encoder-only with bidirectional attention, trained by masked-token prediction, and outputs contextual embeddings, so it suits classification, search and reranking. GPT is decoder-only with a causal mask, trained on next-token prediction, so it can generate text autoregressively.",
      lookFor: "Attention mask, training objective, typical uses.",
      wrong: "“GPT is just a bigger BERT.”",
    },
    {
      id: "ar-4",
      level: "senior",
      q: "You must classify 2 million support tickets a day cheaply. Which architecture?",
      answer: "A fine-tuned encoder model (a small BERT-style model or a sentence-embedding model + linear head) gives strong accuracy at a fraction of an LLM's cost and latency. Use an LLM to label or bootstrap training data, distil into the small model, and route only low-confidence tickets to the LLM.",
      lookFor: "Cost-aware choice, distillation, confidence routing.",
      wrong: "“Send every ticket to the largest LLM.”",
    },
  ],
  quiz: [
    {
      id: "arq-1",
      q: "The edge filter gives a high value where…",
      options: ["The image is flat", "Brightness jumps from left to right", "The image is dark everywhere", "Colours change"],
      correct: 1,
      explain: "−1 on the left, +1 on the right: large when the right side is brighter.",
    },
    {
      id: "arq-2",
      q: "Main reason RNNs train slowly?",
      options: ["Too many parameters", "Each step needs the previous step's output", "They use convolutions", "No activation functions"],
      correct: 1,
      explain: "Sequential dependency blocks parallel training across time.",
    },
    {
      id: "arq-3",
      q: "Best shape for producing search embeddings?",
      options: ["Decoder-only", "Encoder-only", "RNN", "GAN"],
      correct: 1,
      explain: "Bidirectional encoders produce strong contextual embeddings.",
    },
    {
      id: "arq-4",
      q: "GPT-style models can't see future words because of…",
      options: ["Pooling", "A causal attention mask", "Dropout", "Tokenisation"],
      correct: 1,
      explain: "The mask hides later positions so training matches generation.",
    },
  ],
};

export default scenario;
