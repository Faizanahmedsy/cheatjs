import type { Scenario, Tone } from "../engine/types";
import { bm25, cosine, dot, f, gaussian, norm, seeded, vec } from "../engine/math";

/* ------------------------------------------------------------------ *
 * Embeddings & vector search. Toy vectors stand in for a real model's
 * output; every score (cosine, BM25, chunk ranges, memory) is computed.
 * ------------------------------------------------------------------ */

// ---- steps 1–2: text → token vectors → one pooled vector (toy 8 dims)
const TOKENS = ["a", " small", " cat"];
const rand = seeded(11);
const TOKEN_VECS = TOKENS.map(() => Array.from({ length: 8 }, () => +(rand() * 2 - 1).toFixed(2)));
const POOLED = TOKEN_VECS[0].map((_, d) => TOKEN_VECS.reduce((s, v) => s + v[d], 0) / TOKEN_VECS.length);
const QVEC = POOLED.map((x) => x / norm(POOLED));

// ---- step 3: a 2D map of meaning, clusters at different angles
type Pt = { word: string; group: "animals" | "vehicles" | "food"; x: number; y: number };
const GROUPS: { group: Pt["group"]; angle: number; tone: Tone; words: string[] }[] = [
  { group: "animals", angle: 125, tone: "green", words: ["cat", "dog", "lion", "puppy"] },
  { group: "vehicles", angle: 5, tone: "blue", words: ["car", "bus", "truck", "bike"] },
  { group: "food", angle: 245, tone: "amber", words: ["pizza", "bread", "rice", "soup"] },
];
const r2 = seeded(5);
const POINTS: Pt[] = GROUPS.flatMap((g) =>
  g.words.map((w) => {
    const a = ((g.angle + gaussian(r2) * 9) * Math.PI) / 180;
    const rad = 0.72 + gaussian(r2) * 0.07;
    return { word: w, group: g.group, x: +(Math.cos(a) * rad).toFixed(3), y: +(Math.sin(a) * rad).toFixed(3) };
  }),
);
const TONE_OF: Record<Pt["group"], Tone> = { animals: "green", vehicles: "blue", food: "amber" };
const MAP_POINTS = POINTS.map((p) => ({ x: p.x, y: p.y, label: p.word, tone: TONE_OF[p.group] }));
const KITTEN = { x: Math.cos((118 * Math.PI) / 180) * 0.6, y: Math.sin((118 * Math.PI) / 180) * 0.6 };
const COS_2D = POINTS.map((p) => cosine([KITTEN.x, KITTEN.y], [p.x, p.y]));
const NEIGHBOURS = COS_2D.map((c, i) => [c, i] as const)
  .sort((a, b) => b[0] - a[0])
  .slice(0, 3)
  .map(([, i]) => i);

// ---- step 4: arrows and angles (2D, so the stage can draw them; it computes the cosine itself)
const ARROW = (deg: number, r = 1) => ({ x: Math.cos((deg * Math.PI) / 180) * r, y: Math.sin((deg * Math.PI) / 180) * r });
const ANGLE_WORDS = [
  { label: "kitten", tone: "green" as const, ...ARROW(40) },
  { label: "cat", tone: "green" as const, ...ARROW(28, 0.9) },
  { label: "toy car", tone: "violet" as const, ...ARROW(95, 0.85) },
  { label: "truck", tone: "blue" as const, ...ARROW(128, 0.95) },
];
const cos2 = (i: number, j: number) => cosine([ANGLE_WORDS[i].x, ANGLE_WORDS[i].y], [ANGLE_WORDS[j].x, ANGLE_WORDS[j].y]);
const verdict = (c: number) => (c > 0.8 ? "very similar" : c > 0.3 ? "partly related" : c > -0.3 ? "unrelated" : "opposite");
const PAIRS = [1, 2, 3].map((j) => ({ a: 0, b: j, verdict: verdict(cos2(0, j)) }));
const PAIR_COS = PAIRS.map((p) => cos2(p.a, p.b));

// ---- the hand-worked cosine (toy dims: [animal, small/young, vehicle, wheels])
const W = {
  kitten: [0.9, 0.8, 0.1, 0.0],
  cat: [0.9, 0.3, 0.1, 0.0],
  puppy: [0.8, 0.9, 0.0, 0.1],
  car: [0.1, 0.0, 0.9, 0.8],
  "toy car": [0.0, 0.7, 0.8, 0.7],
};
const WORDS = Object.keys(W) as (keyof typeof W)[];
const COS_KITTEN = WORDS.filter((w) => w !== "kitten").map((w) => ({ w, c: cosine(W.kitten, W[w]) }));
const DOT_KC = dot(W.kitten, W.cat);
const N_K = norm(W.kitten);
const N_C = norm(W.cat);
const COS_KC = cosine(W.kitten, W.cat);
const COS_KCAR = cosine(W.kitten, W.car);

// ---- steps 6–7: keyword (BM25) vs semantic on a tiny help-desk corpus
const DOCS = [
  { id: "d1", title: "Printer error e1043", text: "printer shows error e1043 when paper jams", v: [0.9, 0.0, 0.1, 0.1] },
  { id: "d2", title: "Forgotten login", text: "how to recover a forgotten login credential", v: [0.0, 0.95, 0.1, 0.1] },
  { id: "d3", title: "Printer setup guide", text: "printer setup guide for new office printers", v: [0.9, 0.1, 0.1, 0.0] },
  { id: "d4", title: "Reset the router", text: "reset the router to fix wifi drops", v: [0.1, 0.1, 0.95, 0.0] },
  { id: "d5", title: "Billing error codes", text: "error codes list for the billing system", v: [0.1, 0.2, 0.0, 0.9] },
];
const CORPUS = DOCS.map((d) => d.text.split(" "));
/** Query A has an exact code; query B uses different words than the right doc. Toy dims: [hardware, account, network, billing]. */
const QA = { text: "error e1043", terms: ["error", "e1043"], v: [0.4, 0.2, 0.3, 0.4], right: 0 };
const QB = { text: "reset my password", terms: ["reset", "my", "password"], v: [0.05, 0.9, 0.3, 0.05], right: 1 };
const BM_A = CORPUS.map((d) => bm25(QA.terms, d, CORPUS));
const BM_B = CORPUS.map((d) => bm25(QB.terms, d, CORPUS));
const SEM_A = DOCS.map((d) => cosine(QA.v, d.v));
const SEM_B = DOCS.map((d) => cosine(QB.v, d.v));
const best = (xs: number[]) => xs.indexOf(Math.max(...xs));
/** Top-3 cards for one ranking; the right answer is green, a wrong #1 is rose. */
const ranked = (prefix: string, scores: number[], right: number, dp: number) =>
  scores
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map(({ s, i }, k) => ({
      id: `${prefix}-${DOCS[i].id}`,
      title: `${k + 1}. ${DOCS[i].title}`,
      score: f(s, dp),
      tone: (i === right ? "green" : k === 0 ? "rose" : "slate") as Tone,
      badge: i === right ? "right one" : undefined,
    }));

// ---- step 8: chunking with overlap
const DOC_TOKENS = 2000;
const CHUNK = 500;
const OVERLAP = 100;
const STRIDE = CHUNK - OVERLAP;
const N_CHUNKS = Math.ceil((DOC_TOKENS - OVERLAP) / STRIDE);
const CHUNKS = Array.from({ length: N_CHUNKS }, (_, i) => [i * STRIDE, Math.min(DOC_TOKENS, i * STRIDE + CHUNK)] as const);
const STORED = CHUNKS.reduce((s, [a, b]) => s + (b - a), 0);

// ---- step 9: vector DB maths
const N_VEC = 1_000_000;
const DIM = 768;
const FLOAT32_GB = (N_VEC * DIM * 4) / 1e9;
const INT8_GB = (N_VEC * DIM * 1) / 1e9;
const BINARY_GB = (N_VEC * DIM) / 8 / 1e9;
const MACS = N_VEC * DIM;

// ---- step 10: end-to-end search trace
const QC = { text: "my wifi keeps dropping", v: [0.1, 0.05, 0.9, 0.05] };
const SEM_C = DOCS.map((d, i) => ({ id: d.id, title: d.title, text: d.text, s: cosine(QC.v, d.v), i })).sort((a, b) => b.s - a.s);
const THRESHOLD = 0.5;
const KEPT = SEM_C.filter((r) => r.s >= THRESHOLD);
const DROPPED = SEM_C.filter((r) => r.s < THRESHOLD);

const fmtInt = (n: number) => n.toLocaleString("en-US");
const deg = (c: number) => ((Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI).toFixed(0);

const scenario: Scenario = {
  id: "embeddings",
  title: "Embeddings & vector search",
  tagline: "Meaning as coordinates; search as “what is nearby?”",
  imagine:
    "Imagine a huge map where every sentence ever written has its own address, and sentences that mean the same thing live on the same street. “My wifi keeps dropping” and “reset the router” would be neighbours, even though they share almost no words. Searching becomes simple: find your question's address and look at who lives nearby.",
  recap: [
    "An **embedding** turns a piece of text into one list of numbers; similar meanings get similar lists.",
    "**Cosine similarity** checks whether two of those lists point the same way: 1 = same meaning, 0 = unrelated.",
    "**Vector search** embeds the question and returns the nearest chunks; keyword search still wins for exact codes and names.",
  ],
  overview: {
    plain:
      "An embedding is a list of numbers that captures what a piece of text means. A model is trained so that texts with similar meaning get similar numbers. To search, you turn the question into numbers too and look for the stored texts whose numbers are closest.",
    definition:
      "An {{embedding}} is a list of numbers (a {{vector}}) that an embedding model produces for a piece of text. The model is trained so that texts with similar meaning land close together. Search then becomes geometry: embed the question, and find the stored vectors pointing the same way using {{cosine-similarity|cosine similarity}}.",
    analogy:
      "A **map of a city**, but for meaning. Every sentence gets GPS coordinates. “Kitten” and “cat” live on the same street; “truck” is across town. Finding related text is asking “who lives near this address?”",
    facts: [
      ["Output", "One fixed-length vector per text, commonly 384 – 3,072 numbers"],
      ["Similarity", "Cosine = dot product ÷ lengths. For unit-length vectors, cosine = dot product"],
      ["Keyword search", "{{bm25|BM25}}: exact words, great for codes, names, IDs"],
      ["Semantic search", "Vectors: matches meaning even when the words differ"],
      ["At scale", "A {{vector-db|vector database}} with an {{ann|ANN}} index such as {{hnsw|HNSW}}"],
      ["Golden rule", "Embed queries and documents with the **same** model"],
    ],
    whereUsed: "Semantic search, RAG retrieval, recommendations (“more like this”), de-duplication, clustering support tickets, and classification with few labels.",
  },
  objects: [
    { id: "user", kind: "user", label: "User query", sub: "“a small cat”", at: [2.4, -3.2], tone: "cyan" },
    { id: "space", kind: "chart", label: "Embedding space", sub: "nearby = similar", at: [9.6, -3.2], tone: "amber" },
    { id: "text", kind: "chat", label: "Input text", sub: "any sentence", at: [0, 0], tone: "cyan" },
    { id: "tokenizer", kind: "tool", label: "Tokenizer", sub: "text → tokens", at: [2.4, 0], tone: "violet" },
    { id: "model", kind: "layer", label: "Embedding model", sub: "bi-encoder", at: [4.8, 0], tone: "violet" },
    { id: "vector", kind: "vector", label: "Vector", sub: "e.g. 768 numbers", at: [7.2, 0], tone: "blue" },
    { id: "docs", kind: "doc", label: "Documents", sub: "help-desk articles", at: [0, 3.6], tone: "slate" },
    { id: "chunker", kind: "tool", label: "Chunker", sub: "size + overlap", at: [2.4, 3.6], tone: "violet" },
    { id: "bm25", kind: "search", label: "Keyword index", sub: "BM25", at: [7.2, 3.6], tone: "amber" },
    { id: "vdb", kind: "vectordb", label: "Vector DB", sub: "HNSW index", at: [9.6, 3.6], tone: "blue" },
    { id: "results", kind: "ranker", label: "Results", sub: "top-k + scores", at: [12, 3.6], tone: "green" },
  ],
  links: [
    { id: "l1", from: "text", to: "tokenizer" },
    { id: "l2", from: "tokenizer", to: "model" },
    { id: "l3", from: "model", to: "vector" },
    { id: "l4", from: "vector", to: "space" },
    { id: "l5", from: "user", to: "model" },
    { id: "l6", from: "docs", to: "chunker" },
    { id: "l7", from: "chunker", to: "model" },
    { id: "l8", from: "vector", to: "vdb" },
    { id: "l9", from: "chunker", to: "bm25" },
    { id: "l10", from: "bm25", to: "results" },
    { id: "l11", from: "vdb", to: "results" },
  ],
  logTitle: "retrieval trace",
  logColumns: [
    { key: "stage", label: "Stage", width: "18%" },
    { key: "item", label: "Item" },
    { key: "score", label: "Score", align: "right", width: "14%" },
    { key: "note", label: "Note" },
  ],
  steps: [
    // 1 ─────────────────────────────────────────────────────────────
    {
      id: "tokens",
      title: "Words become lists of numbers",
      simple: "The model cuts the text into pieces and gives every piece its own list of numbers.",
      explain:
        "First the text is split into {{token|tokens}} (small pieces of words). The embedding model then gives each piece a {{vector}} (a list of numbers). Real models use hundreds of numbers per piece; the bars show 8 toy ones. Up means positive, down means negative.",
      analogy: "Like describing each ingredient of a dish with a row of scores: sweet, salty, spicy, crunchy…",
      detail:
        "The embedding model is a transformer (usually encoder-only, e.g. a BERT-style model). After its layers, every token has a context-aware vector: “cat” in “a small cat” gets a slightly different vector than “cat” in “cat command”. The individual numbers have no human meaning on their own; only comparisons between vectors do.",
      stage: { kind: "tokens", mode: "vectors", tokens: TOKENS, vectors: TOKEN_VECS, note: "one list of numbers per token (toy: 8 numbers)" },
      highlight: ["text", "tokenizer", "model"],
      packets: [
        { from: "text", to: "tokenizer", label: "“a small cat”", tone: "cyan" },
        { from: "tokenizer", to: "model", label: "[a, ␣small, ␣cat]", tone: "violet" },
      ],
      deeper: {
        math: TOKENS.map((t, i) => `h(${t.trim()}) = ${vec(TOKEN_VECS[i])}`),
      },
      log: TOKENS.map((t, i) => ({ tone: "cyan" as const, cells: { stage: "token", item: `“${t.trim()}”`, score: "", note: `${vec(TOKEN_VECS[i].slice(0, 3))} …` } })),
      interviewTip: "Mention that token vectors are contextual: the same word gets different vectors in different sentences.",
    },
    // 2 ─────────────────────────────────────────────────────────────
    {
      id: "pool",
      title: "Squeeze them into one list",
      simple: "All the pieces are averaged into one list of numbers that stands for the whole text.",
      explain:
        "Averaging the token lists (called mean pooling) gives **one** vector for the whole text, always the same length, whether the text is 3 words or 300. That one list is the {{embedding}}. It is then scaled to length 1, so comparing two texts is a quick {{dot-product|dot product}} (multiply matching numbers and add up).",
      analogy: "Like turning a song into a fingerprint: you can't hum the fingerprint, but two recordings of the same song produce nearly the same one.",
      detail: `v = mean(h₁, h₂, h₃), then v̂ = v / ‖v‖. Here ‖v̂‖ = ${f(norm(QVEC), 2)}. Some models use the [CLS] token's vector instead of the mean. Either way the output is **one fixed-length vector per text**, and the same model must embed both queries and documents, or the vectors live in different spaces.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "bars",
          title: "The embedding of “a small cat” (8 of ~768 numbers)",
          items: QVEC.map((x, i) => ({ label: `d${i}`, value: x, tone: x >= 0 ? ("blue" as const) : ("rose" as const), note: x < 0 ? "(neg)" : "" })),
          max: 1,
          format: "fixed2",
          caption: `Average of the 3 token lists, scaled to length ${f(norm(QVEC), 2)}.`,
        },
      },
      highlight: ["model", "vector"],
      packets: [{ from: "model", to: "vector", label: "pool → 1 vector", sub: `length ${f(norm(QVEC), 2)}`, tone: "blue" }],
      deeper: {
        math: ["v = mean(h₁, h₂, …, h_n)   (mean pooling of the last-layer token vectors)", "v̂ = v / ‖v‖   (normalise to length 1)", `‖v̂‖ = ${f(norm(QVEC), 4)}`],
        code: {
          lang: "python",
          src: `
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("<an embedding model>")
v = model.encode("a small cat", normalize_embeddings=True)
print(v.shape)   # (dim,)  e.g. (384,) or (768,)`,
        },
      },
      log: [{ tone: "blue", cells: { stage: "embed", item: `v = ${vec(QVEC.slice(0, 4))} …`, score: f(norm(QVEC), 2), note: "‖v‖ after normalising" } }],
      interviewTip: "Say clearly: **one vector per text**, fixed length regardless of text length, and the same model must embed both queries and documents.",
    },
    // 3 ─────────────────────────────────────────────────────────────
    {
      id: "space",
      title: "Meaning becomes position",
      simple: "Plot every text's numbers as a dot: texts with similar meaning land close together.",
      explain:
        "Put each vector on a map and groups appear: animals together, vehicles elsewhere, food somewhere else again. Nobody told the model that a lion is an animal; it learned it from lots of text. Real embeddings have hundreds of dimensions; this picture squashes them down to 2.",
      analogy: "A city map where every word has an address and similar words share a neighbourhood.",
      detail:
        "Tools like PCA, t-SNE or UMAP make these 2D/3D pictures. They distort distances, so use them for intuition only, never to measure similarity: always compare the full vectors.\n\nThe groups emerge because the model was trained (often contrastively) to pull matching pairs together and push non-matching pairs apart.",
      stage: { kind: "map", mode: "map", points: MAP_POINTS, note: "colour = topic group · position = meaning (squashed to 2D)" },
      highlight: ["vector", "space"],
      packets: [{ from: "vector", to: "space", label: "plot all vectors", tone: "amber" }],
      viz: {
        only: "interview",
        kind: "three-embed",
        title: "3D view (drag to rotate)",
        caption: "Same idea in 3D. The pink point is a query; dashed lines join its 3 nearest neighbours.",
      },
      deeper: {
        text: "Dimensionality-reduction tools like PCA, t-SNE or UMAP make these pictures. They distort distances, so use them for intuition, never to measure similarity — always compare the full vectors.",
      },
      log: GROUPS.map((g) => ({ tone: g.tone, cells: { stage: "cluster", item: g.group, score: g.words.length, note: g.words.join(", ") } })),
    },
    // 4 ─────────────────────────────────────────────────────────────
    {
      id: "cosine",
      title: "Do the arrows point the same way?",
      simple: "Draw each text as an arrow. The smaller the angle between two arrows, the more alike they are.",
      explain: `{{cosine-similarity|Cosine similarity}} turns that angle into a score: **1** = same direction, **0** = unrelated (a right angle), **−1** = opposite. Kitten and cat are ${deg(PAIR_COS[0])}° apart, a cosine of **${f(PAIR_COS[0], 2)}**. Kitten and truck are almost at a right angle: **${f(PAIR_COS[2], 2)}**.`,
      analogy: "Two people pointing at the same star are “similar” even if one arm is longer than the other: length doesn't matter, direction does.",
      detail: `Recipe: multiply matching numbers and add them (the {{dot-product|dot product}}), then divide by both lengths: cos(a, b) = a·b / (‖a‖‖b‖).\n\nWorked with toy 4-number vectors [animal, small/young, vehicle, wheels]: kitten = ${vec(W.kitten, 1)}, cat = ${vec(W.cat, 1)} → dot = ${f(DOT_KC, 2)}, lengths ${f(N_K, 3)} and ${f(N_C, 3)}, cos = **${f(COS_KC, 3)}**. cos(kitten, car) = ${f(COS_KCAR, 3)}. For unit-length vectors cosine is just the dot product, and ranking by Euclidean distance gives the same order.`,
      stage: { kind: "map", mode: "angle", points: ANGLE_WORDS, pairs: PAIRS, note: "smaller angle = more similar · the cosine is worked out from the arrows" },
      highlight: ["space"],
      packets: [{ from: "space", to: "space", label: "cos(kitten, ·)", tone: "amber" }],
      viz: [
        {
          only: "interview",
          kind: "table",
          title: "cos(kitten, cat) step by step (4 toy dims)",
          columns: ["", "value"],
          rows: [
            ["kitten", vec(W.kitten, 1)],
            ["cat", vec(W.cat, 1)],
            ["dot = Σ aᵢ·bᵢ", f(DOT_KC, 3)],
            ["‖kitten‖", f(N_K, 3)],
            ["‖cat‖", f(N_C, 3)],
            ["cos = dot ÷ (‖a‖·‖b‖)", f(COS_KC, 3)],
          ],
          highlightRow: 5,
        },
        {
          only: "interview",
          kind: "bars",
          title: "Similarity to “kitten” (4 toy dims)",
          items: COS_KITTEN.map(({ w, c }) => ({ label: w, value: c, tone: c > 0.8 ? ("green" as const) : c > 0.4 ? ("amber" as const) : ("slate" as const) })),
          max: 1,
          format: "fixed3",
        },
      ],
      deeper: {
        math: [
          "cos(a, b) = (a · b) / (‖a‖ ‖b‖)",
          `a · b = 0.9·0.9 + 0.8·0.3 + 0.1·0.1 + 0.0·0.0 = ${f(DOT_KC, 3)}`,
          `‖a‖ = ${f(N_K, 3)},  ‖b‖ = ${f(N_C, 3)}  →  cos = ${f(COS_KC, 3)}`,
          "If both vectors are unit length, cos = a · b, and ‖a − b‖² = 2 − 2·cos — so ranking by Euclidean distance gives the same order.",
        ],
        code: { lang: "python", src: `import numpy as np\ncos = a @ b / (np.linalg.norm(a) * np.linalg.norm(b))` },
      },
      log: PAIRS.map((p, k) => ({ tone: (PAIR_COS[k] > 0.8 ? "green" : PAIR_COS[k] > 0.3 ? "amber" : "slate") as Tone, cells: { stage: "cosine", item: `kitten ↔ ${ANGLE_WORDS[p.b].label}`, score: f(PAIR_COS[k], 3), note: p.verdict } })),
      interviewTip: `Be ready to compute one by hand. With the toy 4-number vectors, cos(kitten, car) = ${f(COS_KCAR, 3)}: nearly unrelated.`,
    },
    // 5 ─────────────────────────────────────────────────────────────
    {
      id: "nearest",
      title: "Search = find the nearest",
      simple: "To search, turn the question into numbers too, then pick the dots that sit closest to it.",
      explain: `The word “kitten” is not in our list, yet its dot lands right among the animals. Its three nearest neighbours by cosine are ${NEIGHBOURS.map((i) => `**${POINTS[i].word}**`).join(", ")}: exactly the results you'd want. That is semantic search (search by meaning, not by matching letters).`,
      analogy: "Dropping a pin on the map and asking “who lives closest?”",
      detail: `Nearest by cosine: ${NEIGHBOURS.map((i) => `${POINTS[i].word} (${f(COS_2D[i], 3)})`).join(", ")}. Returning the k best matches is called top-k retrieval (here k = 3). In production the query is embedded at request time, while document vectors are computed once and stored, which is why this style (a bi-encoder) is fast.`,
      stage: { kind: "map", mode: "map", points: MAP_POINTS, query: { x: KITTEN.x, y: KITTEN.y, label: "kitten" }, neighbours: NEIGHBOURS, note: "the star is the question · numbers = closest first" },
      highlight: ["user", "model", "space"],
      packets: [
        { from: "user", to: "model", label: "“kitten”", tone: "cyan" },
        { from: "vector", to: "space", label: "nearest 3", tone: "amber" },
      ],
      viz: {
        only: "interview",
        kind: "scatter",
        title: "The same search as a plot",
        points: MAP_POINTS,
        query: { x: KITTEN.x, y: KITTEN.y, label: "kitten", neighbours: NEIGHBOURS },
        x: [-1, 1],
        y: [-1, 1],
      },
      log: NEIGHBOURS.map((i, k) => ({ tone: "green" as const, cells: { stage: `neighbour ${k + 1}`, item: POINTS[i].word, score: f(COS_2D[i], 3), note: POINTS[i].group } })),
      interviewTip: "Distinguish the offline step (embed and store documents once) from the online step (embed the query, search) — it explains why bi-encoders scale.",
    },
    // 6 ─────────────────────────────────────────────────────────────
    {
      id: "keyword-wins",
      title: "When exact words matter",
      simple: "For codes, names and IDs, plain word matching beats meaning search.",
      explain: `Query “${QA.text}” on five help-desk articles. {{bm25|Keyword search (BM25)}} (scores shared words, rare words count more) puts **${DOCS[best(BM_A)].title}** first, because “e1043” is a rare exact match. Meaning search blurs the code into “some error” and ranks **${DOCS[best(SEM_A)].title}** first.`,
      analogy: "Looking up a part number: you want the exact number, not “something similar”.",
      detail: `BM25 rewards documents containing rare query words, with diminishing returns for repeats and a length penalty. “e1043” appears in 1 of 5 docs → IDF = ${f(Math.log(1 + (5 - 1 + 0.5) / (1 + 0.5)), 3)}; “error” in 2 of 5 → IDF = ${f(Math.log(1 + (5 - 2 + 0.5) / (2 + 0.5)), 3)}. Embeddings are bad at rare tokens (codes, SKUs, new product names) because they were rarely seen in training.`,
      stage: {
        kind: "cards",
        zones: [
          { id: "q", label: "the question", icon: "person", tone: "cyan", text: `“${QA.text}”` },
          { id: "kw", label: "keyword (BM25)", icon: "search", tone: "amber", cards: ranked("a-kw", BM_A, QA.right, 2) },
          { id: "sem", label: "meaning (vectors)", icon: "box", tone: "blue", cards: ranked("a-sem", SEM_A, QA.right, 3) },
        ],
        note: "green = the article that actually answers it",
      },
      highlight: ["bm25", "vdb", "results"],
      packets: [
        { from: "bm25", to: "results", label: `A → ${DOCS[best(BM_A)].id}`, sub: "keyword", tone: "amber" },
        { from: "vdb", to: "results", label: `A → ${DOCS[best(SEM_A)].id}`, sub: "semantic", tone: "blue" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: `Scores for “${QA.text}”`,
        columns: ["doc", "BM25", "cosine"],
        rows: DOCS.map((d, i) => [`${d.id} ${d.title}`, f(BM_A[i]), f(SEM_A[i], 3)]),
        caption: "Semantic vectors are toy values.",
      },
      deeper: {
        math: [
          "BM25(q, d) = Σ_t IDF(t) · tf·(k₁+1) / (tf + k₁·(1 − b + b·|d|/avgdl))",
          "IDF(t) = ln(1 + (N − n_t + 0.5)/(n_t + 0.5)),  k₁ = 1.2,  b = 0.75",
        ],
      },
      log: [
        { tone: "amber", cells: { stage: "bm25 · A", item: `${DOCS[best(BM_A)].id} “${DOCS[best(BM_A)].text}”`, score: f(Math.max(...BM_A)), note: "exact code wins" } },
        { tone: "rose", cells: { stage: "cos · A", item: `${DOCS[best(SEM_A)].id} “${DOCS[best(SEM_A)].text}”`, score: f(Math.max(...SEM_A), 3), note: "semantic blurs the code" } },
      ],
      interviewTip: "Give a concrete case where BM25 beats embeddings (codes, SKUs, names) — it shows you have run search in production, not just read about it.",
    },
    // 7 ─────────────────────────────────────────────────────────────
    {
      id: "meaning-wins",
      title: "When the words are different",
      simple: "When people ask in their own words, meaning search finds the right page and word matching doesn't.",
      explain: `Query “${QB.text}”. Keyword search grabs **${DOCS[best(BM_B)].title}**, because it shares the word “reset”. Meaning search finds **${DOCS[best(SEM_B)].title}**, which shares no words at all with the question. Neither method wins everywhere, so real systems often run both ({{hybrid-search|hybrid search}}).`,
      analogy: "BM25 is a librarian who matches the exact words on the spine. Semantic search is one who understands what you meant but sometimes mishears part numbers.",
      detail: "Hybrid search runs BM25 and vector search in parallel and merges the two ranked lists, often with Reciprocal Rank Fusion (score = Σ 1/(k + rank)), which needs no score calibration between the two systems. A re-ranker can then reorder the merged top results.",
      stage: {
        kind: "cards",
        zones: [
          { id: "q", label: "the question", icon: "person", tone: "cyan", text: `“${QB.text}”` },
          { id: "kw", label: "keyword (BM25)", icon: "search", tone: "amber", cards: ranked("b-kw", BM_B, QB.right, 2) },
          { id: "sem", label: "meaning (vectors)", icon: "box", tone: "blue", cards: ranked("b-sem", SEM_B, QB.right, 3) },
        ],
        note: "green = the article that actually answers it",
      },
      highlight: ["bm25", "vdb", "results"],
      packets: [
        { from: "bm25", to: "results", label: `B → ${DOCS[best(BM_B)].id}`, sub: "keyword", tone: "amber" },
        { from: "vdb", to: "results", label: `B → ${DOCS[best(SEM_B)].id}`, sub: "semantic", tone: "blue" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: `Scores for “${QB.text}”`,
        columns: ["doc", "BM25", "cosine"],
        rows: DOCS.map((d, i) => [`${d.id} ${d.title}`, f(BM_B[i]), f(SEM_B[i], 3)]),
        caption: "Semantic vectors are toy values.",
      },
      log: [
        { tone: "rose", cells: { stage: "bm25 · B", item: `${DOCS[best(BM_B)].id} “${DOCS[best(BM_B)].text}”`, score: f(Math.max(...BM_B)), note: "shares “reset”, wrong topic" } },
        { tone: "green", cells: { stage: "cos · B", item: `${DOCS[best(SEM_B)].id} “${DOCS[best(SEM_B)].text}”`, score: f(Math.max(...SEM_B), 3), note: "meaning match" } },
      ],
      interviewTip: "When asked “keyword or vector?”, answer “both, measured”: hybrid search with fusion is the common production default.",
    },
    // 8 ─────────────────────────────────────────────────────────────
    {
      id: "chunking",
      title: "Cut long documents into pieces",
      simple: "Long documents are cut into overlapping pieces, and each piece gets its own list of numbers.",
      explain: `One vector for a whole manual would be too blurry to search, and models have an input limit. So we cut it into {{chunk|chunks}} (pieces). Here a ${fmtInt(DOC_TOKENS)}-token document becomes **${N_CHUNKS}** chunks of ${CHUNK} tokens, each **overlapping** the last by ${OVERLAP}, so no sentence is lost on a cut.`,
      analogy: "Cutting a long scroll into index cards, letting each card repeat the last line of the previous one so no sentence is cut in half.",
      detail: `Stride = size − overlap = ${STRIDE}; chunks = ⌈(${DOC_TOKENS} − ${OVERLAP}) / ${STRIDE}⌉ = ${N_CHUNKS}; ${fmtInt(STORED)} tokens stored (${f(STORED / DOC_TOKENS, 2)}× the original).\n\nSmaller chunks = sharper matches but less context each; bigger chunks = more context but fuzzier vectors. There is no universal best size: test a few on your own questions. Split on structure first (headings, paragraphs, table rows), then fall back to size, and keep source, page and heading as metadata.`,
      stage: {
        kind: "cards",
        zones: [
          { id: "doc", label: "the document", icon: "doc", tone: "slate", cards: [{ id: "manual", title: "Router manual", sub: `${fmtInt(DOC_TOKENS)} tokens`, tone: "slate" }] },
          { id: "cut", label: "chunker", icon: "scissors", tone: "violet", text: `size ${CHUNK}, overlap ${OVERLAP}` },
          {
            id: "chunks",
            label: `${N_CHUNKS} chunks`,
            icon: "shelf",
            tone: "blue",
            cards: CHUNKS.map(([a, b], i) => ({ id: `chunk-${i + 1}`, title: `c${i + 1} · tokens ${a}–${b}`, sub: i > 0 ? `repeats the last ${OVERLAP} of c${i}` : "first piece", tone: "blue" as const })),
          },
        ],
      },
      highlight: ["docs", "chunker"],
      packets: [
        { from: "docs", to: "chunker", label: `${fmtInt(DOC_TOKENS)} tokens`, tone: "slate" },
        { from: "chunker", to: "model", label: `${N_CHUNKS} chunks × ≤${CHUNK}`, sub: `overlap ${OVERLAP}`, tone: "violet" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: `Chunk ranges (size ${CHUNK}, overlap ${OVERLAP}, stride ${STRIDE})`,
        columns: ["chunk", "tokens", "length"],
        rows: CHUNKS.map(([a, b], i) => [`c${i + 1}`, `${a} – ${b}`, b - a]),
        caption: `n = ⌈(${DOC_TOKENS} − ${OVERLAP}) / ${STRIDE}⌉ = ${N_CHUNKS} chunks; ${fmtInt(STORED)} tokens stored (${f(STORED / DOC_TOKENS, 2)}× the original).`,
      },
      deeper: {
        math: [`stride = size − overlap = ${CHUNK} − ${OVERLAP} = ${STRIDE}`, `chunks = ⌈(L − overlap) / stride⌉ = ⌈${DOC_TOKENS - OVERLAP} / ${STRIDE}⌉ = ${N_CHUNKS}`],
        text: "Better than fixed windows: split on structure first (headings, paragraphs, table rows), then fall back to size. Store the source, page and heading with every chunk as metadata.",
      },
      log: CHUNKS.map(([a, b], i) => ({ tone: "violet" as const, cells: { stage: "chunk", item: `c${i + 1}: tokens ${a}–${b}`, score: b - a, note: i > 0 ? `overlaps c${i} by ${OVERLAP}` : "first" } })),
      interviewTip: "Say how you would pick a chunk size: build a small set of real questions, try 2–3 sizes, and measure retrieval recall.",
    },
    // 9 ─────────────────────────────────────────────────────────────
    {
      id: "vectordb",
      title: "Searching millions, fast",
      simple: "A vector database finds the closest lists quickly by checking only a few likely ones, not all of them.",
      explain: `Comparing a question with every stored vector is **exact** but slow: ${fmtInt(N_VEC)} vectors × ${DIM} numbers = ${fmtInt(MACS)} multiplications per search. A {{vector-db|vector database}} builds an index for {{ann|approximate}} search instead. It is far faster, but can occasionally miss a true neighbour.`,
      analogy: "Finding a house by asking neighbours for directions, street by street, instead of knocking on every door in the country.",
      detail:
        "The popular {{hnsw|HNSW}} index links each vector to a few close neighbours in layered graphs. A search starts at the sparse top layer and hops greedily toward the query, checking only a small fraction of the vectors. Knobs: M (links per node), efConstruction (build effort), efSearch (search effort: higher → better recall, slower).\n\nMemory matters too: storing vectors as int8 or binary instead of float32 cuts memory a lot, usually with a re-scoring pass to recover accuracy.",
      stage: {
        kind: "viz",
        viz: [
          {
            kind: "table",
            title: "Exact vs approximate",
            columns: ["", "Check everything (exact)", "HNSW (approximate)"],
            rows: [
              ["Work per search", "every vector", "a small slice, via graph hops"],
              ["Finds the true nearest", "always (100%)", "almost always, tunable"],
              ["Good for", "up to ~100k vectors", "millions, low latency"],
            ],
          },
          {
            kind: "bars",
            title: `Memory for ${fmtInt(N_VEC)} vectors × ${DIM} numbers`,
            items: [
              { label: "float32", value: FLOAT32_GB, tone: "rose", note: "GB" },
              { label: "int8", value: INT8_GB, tone: "amber", note: "GB" },
              { label: "binary", value: BINARY_GB, tone: "green", note: "GB" },
            ],
            format: "fixed3",
            caption: "Smaller number formats shrink memory, at a small accuracy cost.",
          },
        ],
      },
      highlight: ["vector", "vdb"],
      packets: [
        { from: "vector", to: "vdb", label: "upsert(id, v, metadata)", tone: "blue" },
        { from: "vdb", to: "results", label: "query → top-k ids", tone: "green" },
      ],
      deeper: {
        math: [`float32: ${fmtInt(N_VEC)} × ${DIM} × 4 bytes = ${f(FLOAT32_GB, 2)} GB`, `int8: × 1 byte = ${f(INT8_GB, 3)} GB;  binary: ÷ 8 = ${f(BINARY_GB, 3)} GB`, "HNSW knobs: M (links per node), efConstruction (build effort), efSearch (search effort ↑ → recall ↑, latency ↑)."],
        text: "Options range from libraries (FAISS, hnswlib) to databases (pgvector in Postgres, and dedicated vector stores). Pick by scale, filtering needs, and what your team already runs.",
      },
      log: [
        { tone: "blue", cells: { stage: "index", item: `${fmtInt(N_VEC)} × ${DIM} float32`, score: `${f(FLOAT32_GB, 2)} GB`, note: "raw vectors" } },
        { tone: "amber", cells: { stage: "flat search", item: "compare with every vector", score: fmtInt(MACS), note: "multiply-adds / query" } },
        { tone: "green", cells: { stage: "hnsw search", item: "greedy hops through graph", score: "≪ N", note: "approximate, tune efSearch" } },
      ],
      interviewTip: "Always pair “ANN” with “measure recall against exact search on a sample”. It shows you know approximate means approximate.",
    },
    // 10 ────────────────────────────────────────────────────────────
    {
      id: "search",
      title: "A full search, with scores",
      simple: "Turn the question into numbers, score every chunk, keep the close ones and drop the weak ones.",
      explain: `A user types “${QC.text}”. The same model embeds it, the vector database scores the chunks, and anything below a cut-off of **${THRESHOLD}** is dropped instead of shown as a bad match. **${SEM_C[0].title}** wins with ${f(SEM_C[0].s, 3)}, though it shares only the word “wifi”.`,
      analogy: "A shop assistant who only shows you the shoes that actually fit, not every shoe in the store.",
      detail: `Scores: ${SEM_C.map((r) => `${r.id} ${f(r.s, 3)}`).join(", ")}. Score cut-offs are model-specific: a 0.5 from one embedding model is not a 0.5 from another, so calibrate the threshold on labelled examples. Many systems keep a fixed top-k and let a re-ranker or the LLM judge relevance instead of a hard cut-off.`,
      stage: {
        kind: "cards",
        zones: [
          { id: "q", label: "the question", icon: "person", tone: "cyan", text: `“${QC.text}”` },
          { id: "scored", label: `below ${THRESHOLD}: dropped`, icon: "box", tone: "slate", cards: DROPPED.map((r) => ({ id: `c-${r.id}`, title: r.title, score: f(r.s, 3), tone: "slate" as const, struck: true })) },
          { id: "kept", label: "shown to the user", icon: "check", tone: "green", cards: KEPT.map((r) => ({ id: `c-${r.id}`, title: r.title, score: f(r.s, 3), tone: "green" as const })) },
        ],
        note: "score = cosine similarity to the question (toy vectors)",
      },
      highlight: ["user", "model", "vdb", "results"],
      packets: [
        { from: "user", to: "model", label: `“${QC.text}”`, tone: "cyan" },
        { from: "model", to: "vector", label: "q vector", tone: "blue" },
        { from: "vector", to: "vdb", label: "nearest k = 3", tone: "blue" },
        { from: "vdb", to: "results", label: `${SEM_C[0].id} ${f(SEM_C[0].s, 3)}`, tone: "green" },
      ],
      viz: {
        only: "interview",
        kind: "bars",
        title: `Cosine to “${QC.text}”`,
        items: SEM_C.map((r) => ({ label: r.id, value: r.s, tone: r.s >= THRESHOLD ? ("green" as const) : ("slate" as const), note: r.s >= THRESHOLD ? "" : "below cut-off" })),
        max: 1,
        format: "fixed3",
        caption: `${KEPT.length} result(s) above ${THRESHOLD}. Toy vectors.`,
      },
      deeper: {
        code: {
          lang: "sql",
          src: `
-- pgvector: <=> is cosine distance (1 − cosine similarity)
SELECT id, text, 1 - (embedding <=> :q) AS score
FROM chunks
ORDER BY embedding <=> :q
LIMIT 3;`,
        },
      },
      log: SEM_C.slice(0, 3).map((r, k) => ({ tone: (r.s >= THRESHOLD ? "green" : "slate") as Tone, cells: { stage: `rank ${k + 1}`, item: `${r.id} “${r.text}”`, score: f(r.s, 3), note: r.s >= THRESHOLD ? "kept" : `dropped (< ${THRESHOLD})` } })),
      interviewTip: "Score cut-offs are model-specific — a 0.5 from one embedding model is not a 0.5 from another. Calibrate on labelled examples.",
    },
  ],
  interview: [
    {
      id: "em-1",
      level: "fresher",
      q: "What is an embedding, in one or two sentences?",
      answer: "A fixed-length vector of numbers produced by a model so that inputs with similar meaning get vectors that point in similar directions. It lets you compare meaning with simple maths like cosine similarity.",
      lookFor: "Fixed length, learned by a model, similarity = closeness.",
      wrong: "“An embedding is a compressed copy of the text you can decode back.” You generally cannot reconstruct the text; it is a representation for comparison.",
    },
    {
      id: "em-2",
      level: "fresher",
      q: "What is cosine similarity and why is it popular for embeddings?",
      answer: "Dot product divided by the product of the vectors' lengths: the cosine of the angle between them, from −1 to 1. It ignores magnitude and compares direction, which is where embedding models put meaning. For unit-normalised vectors it equals the dot product, which is cheap.",
      lookFor: "Formula, range, magnitude-invariance, equivalence with dot product after normalisation.",
      wrong: "“Cosine similarity is a probability that the texts match.” It is a geometric score, not a calibrated probability.",
    },
    {
      id: "em-3",
      level: "fresher",
      q: "Keyword search vs semantic search — when does each win?",
      answer: "Keyword search (BM25) wins on exact tokens: error codes, product SKUs, names, rare jargon. Semantic search wins when the user's words differ from the document's (synonyms, paraphrase, other phrasing). Many systems combine both.",
      lookFor: "Concrete examples for each side, and mention of hybrid.",
      wrong: "“Semantic search is strictly better, keyword search is legacy.”",
    },
    {
      id: "em-4",
      level: "fresher",
      q: "What does a vector database do that a normal database doesn't?",
      answer: "It stores vectors and answers “which stored vectors are nearest to this one?” quickly, usually with an approximate index (HNSW, IVF) instead of scanning everything. Most also store metadata so you can filter, e.g. by source or date, during the search.",
      lookFor: "Nearest-neighbour queries, ANN index, metadata filtering.",
      wrong: "“It's a database that stores AI models.”",
    },
    {
      id: "em-5",
      level: "mid",
      q: "Can you embed documents with one model and queries with another?",
      answer: "Not unless the two models were trained to share a space (some model families provide paired query/document encoders, or require prefixes like “query:”/“passage:”). Vectors from unrelated models live in different coordinate systems, so their similarities are meaningless. Changing the embedding model means re-embedding the whole corpus.",
      lookFor: "Shared space requirement, re-index on model change, awareness of query/document prefixes or instructions.",
      wrong: "“It's fine as long as both output the same number of dimensions.”",
    },
    {
      id: "em-6",
      level: "mid",
      q: "How do chunk size and overlap affect retrieval?",
      answer: "Small chunks give focused vectors and precise matches but may lack the context needed to answer; large chunks carry context but their vector averages many topics, so matches get fuzzier and you spend more prompt tokens. Overlap keeps boundary sentences intact at the cost of storing more. Structure-aware splitting (headings, paragraphs) usually beats fixed windows. Tune on your own queries.",
      lookFor: "The precision/context trade-off, cost of overlap, structure-aware splitting, evaluating rather than guessing.",
      wrong: "“Use 512 tokens — that's the right chunk size.” There is no universal value.",
    },
    {
      id: "em-7",
      level: "mid",
      q: "What are HNSW's main parameters and what do they trade off?",
      answer: "M is how many links each node keeps (more → better recall, more memory). efConstruction is the candidate list size while building (higher → better graph, slower build). efSearch is the candidate list size at query time (higher → better recall, higher latency). You tune efSearch per workload by measuring recall against brute force on a sample.",
      lookFor: "All three knobs, the recall/latency/memory trade-off, measuring against exact search.",
      wrong: "“HNSW always returns the exact nearest neighbours.”",
    },
    {
      id: "em-8",
      level: "mid",
      q: "Why normalise embeddings, and what changes if you don't?",
      answer: "With unit-length vectors, cosine similarity, dot product and Euclidean distance all give the same ranking, so you can use the fastest one the index supports. Without normalising, dot product also rewards vector length, which some models use intentionally and others don't — check the model's documentation for the intended metric.",
      lookFor: "Metric equivalence after normalisation; following the model's recommended metric.",
      wrong: "“Normalising improves the embedding's quality.” It changes the metric, not what the model learned.",
    },
    {
      id: "em-9",
      level: "senior",
      q: "You need to search 200 million vectors with p95 latency under 100 ms. What do you consider?",
      answer: "Memory first: at 768 float32 dims that is ~600 GB of raw vectors, so consider fewer dimensions (if the model supports truncation), int8/binary or product quantisation with a re-scoring step, and sharding across nodes. Choose an index (HNSW for latency if memory allows, IVF-PQ for memory efficiency), tune recall vs latency on a labelled sample, cache hot queries, and design how filters interact with the index (pre-filter vs post-filter). Plan re-indexing for model upgrades.",
      lookFor: "Back-of-envelope memory maths, quantisation, sharding, measured recall, filtering strategy, re-index plan.",
      wrong: "“Just put it in a vector DB, it scales automatically.”",
    },
    {
      id: "em-10",
      level: "senior",
      q: "How would you choose an embedding model for a new domain (e.g. legal or medical text)?",
      answer: "Shortlist using public benchmarks such as MTEB as a starting point, then build a small labelled set from your own data (queries with known relevant passages) and compare recall@k / NDCG, latency, dimension (storage cost), max input length, language coverage, licence and hosting. If none is good enough, try hybrid search or a re-ranker before fine-tuning the embedding model on domain pairs.",
      lookFor: "Own-data evaluation over leaderboard faith; cost dimensions; cheaper fixes before fine-tuning.",
      wrong: "“Pick the top model on the leaderboard.”",
    },
    {
      id: "em-11",
      level: "senior",
      q: "Filters and ANN: what goes wrong if you filter after the vector search?",
      answer: "Post-filtering takes the top-k nearest and then drops those that fail the filter, so a selective filter (e.g. one tenant out of thousands) can leave zero or very few results even though matching documents exist. Fixes: pre-filtering or filter-aware search supported by the index, partitioning by tenant, or over-fetching k. For access control, filtering must be enforced at query time, never only in the UI.",
      lookFor: "Understands the empty-results failure, knows the remedies, ties it to security.",
      wrong: "“Filtering afterwards is equivalent, just slower.”",
    },
    {
      id: "em-12",
      level: "senior",
      design: true,
      q: "Design semantic search for an e-commerce catalogue of 5 million products.",
      answer: "Index each product's title, attributes and description (structured fields as metadata for filters such as category, price, stock). Run hybrid retrieval: BM25 for exact brand/SKU/size terms plus vector search for intent (“warm jacket for hiking”), merge (e.g. RRF), then re-rank the top results with business signals (availability, popularity). Embed at ingest via a queue, re-embed on product change, version the index for model upgrades. Evaluate offline with labelled queries (NDCG@10) and online with click-through and conversion A/B tests. Watch latency budgets and cache popular queries.",
      lookFor: "Hybrid, filters, re-ranking with business signals, freshness pipeline, offline + online evaluation.",
      wrong: "“Embed everything and return the top-10 cosine matches.”",
    },
  ],
  quiz: [
    {
      id: "emq-1",
      q: `What is cos(kitten, cat) for kitten = ${vec(W.kitten, 1)} and cat = ${vec(W.cat, 1)}?`,
      options: [f(COS_KC, 3), f(DOT_KC, 3), f(COS_KCAR, 3), f(N_K, 3)],
      correct: 0,
      explain: `Dot = ${f(DOT_KC, 3)}, lengths ${f(N_K, 3)} and ${f(N_C, 3)}, so cos = ${f(DOT_KC, 3)} / ${f(N_K * N_C, 3)} = ${f(COS_KC, 3)}. ${f(DOT_KC, 3)} is the raw dot product, not the cosine.`,
    },
    {
      id: "emq-2",
      q: "Which query is keyword search most likely to handle better than semantic search?",
      options: ["“how do I get my money back”", "“error E1043”", "“something warm for winter”", "“feeling anxious at work”"],
      correct: 1,
      explain: "Exact codes, SKUs and names are where BM25 shines; embeddings tend to blur them into a general topic.",
    },
    {
      id: "emq-3",
      q: `A ${fmtInt(DOC_TOKENS)}-token document, chunk size ${CHUNK}, overlap ${OVERLAP}. How many chunks?`,
      options: [String(DOC_TOKENS / CHUNK), String(N_CHUNKS), String(N_CHUNKS + 2), String(Math.ceil(DOC_TOKENS / OVERLAP))],
      correct: 1,
      explain: `Stride = ${CHUNK} − ${OVERLAP} = ${STRIDE}; chunks = ⌈(${DOC_TOKENS} − ${OVERLAP}) / ${STRIDE}⌉ = ${N_CHUNKS}.`,
    },
    {
      id: "emq-4",
      q: "Your team switches to a new embedding model. What must happen to the stored vectors?",
      options: ["Nothing", "Re-embed the whole corpus with the new model", "Only re-embed new documents", "Normalise the old vectors again"],
      correct: 1,
      explain: "Different models produce incompatible spaces. Queries embedded with the new model can't be compared with documents embedded by the old one.",
    },
    {
      id: "emq-5",
      q: "Raising HNSW's efSearch usually…",
      options: ["lowers recall and latency", "raises recall and latency", "shrinks memory", "makes results exact"],
      correct: 1,
      explain: "A larger candidate list explores more of the graph: better recall, slower queries. It never guarantees exact results.",
    },
    {
      id: "emq-6",
      q: `Memory for ${fmtInt(N_VEC)} float32 vectors of ${DIM} dims, before any index overhead?`,
      options: [`${f(INT8_GB, 2)} GB`, `${f(FLOAT32_GB, 2)} GB`, `${f(BINARY_GB, 3)} GB`, `${f(FLOAT32_GB * 4, 2)} GB`],
      correct: 1,
      explain: `${fmtInt(N_VEC)} × ${DIM} × 4 bytes = ${f(FLOAT32_GB, 2)} GB. int8 would be ${f(INT8_GB, 2)} GB.`,
    },
  ],
};

export default scenario;
