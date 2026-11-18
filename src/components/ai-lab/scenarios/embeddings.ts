import type { Scenario, Tone } from "../engine/types";
import { bm25, cosine, dot, f, gaussian, norm, seeded, vec } from "../engine/math";

/* ------------------------------------------------------------------ *
 * Embeddings & vector search. Toy vectors stand in for a real model's
 * output; every score (cosine, BM25, memory, chunk ranges) is computed.
 * ------------------------------------------------------------------ */

// ---- step 1: one text → one vector (toy 8 dims, unit length)
const rand = seeded(11);
const RAW = Array.from({ length: 8 }, () => +(rand() * 2 - 1).toFixed(2));
const QVEC = RAW.map((x) => x / norm(RAW));

// ---- step 2: a 2D map of meaning, clusters at different angles
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
const KITTEN = { x: Math.cos((118 * Math.PI) / 180) * 0.6, y: Math.sin((118 * Math.PI) / 180) * 0.6 };
const COS_2D = POINTS.map((p) => cosine([KITTEN.x, KITTEN.y], [p.x, p.y]));
const NEIGHBOURS = COS_2D.map((c, i) => [c, i] as const)
  .sort((a, b) => b[0] - a[0])
  .slice(0, 3)
  .map(([, i]) => i);

// ---- step 3: cosine similarity, worked by hand
// Toy dims: [animal, small/young, vehicle, wheels]
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

// ---- step 4: keyword (BM25) vs semantic on a tiny help-desk corpus
const DOCS = [
  { id: "d1", text: "printer shows error e1043 when paper jams", v: [0.9, 0.0, 0.1, 0.1] },
  { id: "d2", text: "how to recover a forgotten login credential", v: [0.0, 0.95, 0.1, 0.1] },
  { id: "d3", text: "printer setup guide for new office printers", v: [0.9, 0.1, 0.1, 0.0] },
  { id: "d4", text: "reset the router to fix wifi drops", v: [0.1, 0.1, 0.95, 0.0] },
  { id: "d5", text: "error codes list for the billing system", v: [0.1, 0.2, 0.0, 0.9] },
];
const CORPUS = DOCS.map((d) => d.text.split(" "));
/** Query A has an exact code; query B uses different words than the right doc. Toy dims: [hardware, account, network, billing]. */
const QA = { text: "error e1043", terms: ["error", "e1043"], v: [0.4, 0.2, 0.3, 0.4] };
const QB = { text: "reset my password", terms: ["reset", "my", "password"], v: [0.05, 0.9, 0.3, 0.05] };
const BM_A = CORPUS.map((d) => bm25(QA.terms, d, CORPUS));
const BM_B = CORPUS.map((d) => bm25(QB.terms, d, CORPUS));
const SEM_A = DOCS.map((d) => cosine(QA.v, d.v));
const SEM_B = DOCS.map((d) => cosine(QB.v, d.v));
const best = (xs: number[]) => xs.indexOf(Math.max(...xs));

// ---- step 5: chunking with overlap
const DOC_TOKENS = 2000;
const CHUNK = 500;
const OVERLAP = 100;
const STRIDE = CHUNK - OVERLAP;
const N_CHUNKS = Math.ceil((DOC_TOKENS - OVERLAP) / STRIDE);
const CHUNKS = Array.from({ length: N_CHUNKS }, (_, i) => [i * STRIDE, Math.min(DOC_TOKENS, i * STRIDE + CHUNK)] as const);
const STORED = CHUNKS.reduce((s, [a, b]) => s + (b - a), 0);

// ---- step 6: vector DB maths
const N_VEC = 1_000_000;
const DIM = 768;
const FLOAT32_GB = (N_VEC * DIM * 4) / 1e9;
const INT8_GB = (N_VEC * DIM * 1) / 1e9;
const BINARY_GB = (N_VEC * DIM) / 8 / 1e9;
const MACS = N_VEC * DIM;

// ---- step 7: end-to-end search trace
const QC = { text: "my wifi keeps dropping", v: [0.1, 0.05, 0.9, 0.05] };
const SEM_C = DOCS.map((d, i) => ({ id: d.id, text: d.text, s: cosine(QC.v, d.v), i })).sort((a, b) => b.s - a.s);
const THRESHOLD = 0.5;

const fmtInt = (n: number) => n.toLocaleString("en-US");

const scenario: Scenario = {
  id: "embeddings",
  title: "Embeddings & vector search",
  tagline: "Meaning as coordinates; search as “what is nearby?”",
  overview: {
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
    {
      id: "vectorise",
      title: "Text → tokens → one vector",
      explain:
        "The embedding model reads the text's {{token|tokens}} with a transformer, then squeezes all of them into **one** fixed-length {{vector}} (often by averaging the token vectors, called mean pooling).\n\nThe numbers on their own mean nothing to a human. What matters is how they compare with *other* vectors: similar meaning → similar direction.\n\nVectors are usually scaled to length 1 so that comparing them is a plain {{dot-product|dot product}}.",
      analogy: "Like turning a song into a fingerprint: you can't hum the fingerprint, but two recordings of the same song produce nearly the same one.",
      highlight: ["text", "tokenizer", "model", "vector"],
      packets: [
        { from: "text", to: "tokenizer", label: "“a small cat”", tone: "cyan" },
        { from: "tokenizer", to: "model", label: "[a, ␣small, ␣cat]", tone: "violet" },
        { from: "model", to: "vector", label: "pool → 1 vector", sub: "length 1.00", tone: "blue" },
      ],
      viz: [
        { kind: "tokens", title: "Tokens", tokens: [{ text: "a" }, { text: "␣small" }, { text: "␣cat" }] },
        {
          kind: "bars",
          title: "Its embedding (toy: 8 of the ~768 numbers)",
          items: QVEC.map((x, i) => ({ label: `d${i}`, value: x, tone: x >= 0 ? ("blue" as const) : ("rose" as const), note: x < 0 ? "(neg)" : "" })),
          max: 1,
          format: "fixed2",
          caption: `Scaled to unit length: √(Σ x²) = ${f(norm(QVEC), 2)}.`,
        },
      ],
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
      log: [
        { tone: "cyan", cells: { stage: "tokenize", item: "“a small cat” → 3 tokens", score: "", note: "toy split" } },
        { tone: "blue", cells: { stage: "embed", item: `v = ${vec(QVEC.slice(0, 4))} …`, score: f(norm(QVEC), 2), note: "‖v‖ after normalising" } },
      ],
      interviewTip: "Say clearly: **one vector per text**, fixed length regardless of text length, and the same model must embed both queries and documents.",
    },
    {
      id: "space",
      title: "Meaning becomes position",
      explain:
        "Plot every vector and you get a map of meaning. Words about animals cluster together, vehicles somewhere else, food somewhere else again.\n\nThe query “kitten” is not in our list, yet it lands right next to the animals — so its nearest neighbours are exactly the results you'd want. Nobody wrote a rule saying kittens are animals; the model learned it from text.\n\nReal embeddings have hundreds of dimensions. These pictures are squashed down to 2D and 3D so we can see them.",
      highlight: ["vector", "space"],
      packets: [{ from: "vector", to: "space", label: "plot all vectors", tone: "amber" }],
      viz: [
        {
          kind: "scatter",
          title: "2D view: three clusters + the query",
          points: POINTS.map((p) => ({ x: p.x, y: p.y, label: p.word, tone: TONE_OF[p.group] })),
          query: { x: KITTEN.x, y: KITTEN.y, label: "kitten", neighbours: NEIGHBOURS },
          x: [-1, 1],
          y: [-1, 1],
          caption: `Nearest by cosine: ${NEIGHBOURS.map((i) => `${POINTS[i].word} (${f(COS_2D[i], 3)})`).join(", ")}.`,
        },
        { kind: "three-embed", title: "3D view (drag to rotate)", caption: "Same idea in 3D. The pink point is a query; dashed lines join its 3 nearest neighbours." },
      ],
      deeper: {
        text: "Dimensionality-reduction tools like PCA, t-SNE or UMAP make these pictures. They distort distances, so use them for intuition, never to measure similarity — always compare the full vectors.",
      },
      log: NEIGHBOURS.map((i, k) => ({ tone: "green" as const, cells: { stage: `neighbour ${k + 1}`, item: POINTS[i].word, score: f(COS_2D[i], 3), note: POINTS[i].group } })),
    },
    {
      id: "cosine",
      title: "Cosine similarity, worked out",
      explain:
        "{{cosine-similarity|Cosine similarity}} asks: **do two arrows point the same way?** It ignores how long they are.\n\nRecipe: multiply matching numbers and add them up (the {{dot-product|dot product}}), then divide by the two lengths. 1 means same direction, 0 means unrelated, −1 means opposite.\n\nWith toy 4-number vectors — [animal, small/young, vehicle, wheels] — “kitten” is close to “cat” and “puppy”, and far from “car”. “Toy car” shares the *small* idea, so it sits in between.",
      highlight: ["space"],
      packets: [{ from: "space", to: "space", label: "cos(kitten, ·)", tone: "amber" }],
      viz: [
        {
          kind: "table",
          title: "cos(kitten, cat) step by step",
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
          kind: "bars",
          title: "Similarity to “kitten”",
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
      },
      log: COS_KITTEN.map(({ w, c }) => ({ tone: (c > 0.8 ? "green" : "slate") as Tone, cells: { stage: "cosine", item: `kitten ↔ ${w}`, score: f(c, 3), note: c > 0.8 ? "close" : c > 0.4 ? "partly related" : "unrelated" } })),
      interviewTip: `Be ready to compute one by hand. Here cos(kitten, car) = ${f(COS_KCAR, 3)}: nearly unrelated.`,
    },
    {
      id: "keyword-vs-semantic",
      title: "Keyword (BM25) vs semantic search",
      explain:
        "Two ways to search the same five help-desk articles:\n\n- **{{bm25|BM25}}** scores documents by shared words, giving more weight to rare words.\n- **Semantic** compares embeddings, so it matches meaning.\n\nQuery A, “error e1043”: only BM25 finds the right article, because “e1043” is an exact code the embedding blurs into “some error”.\n\nQuery B, “reset my password”: BM25 grabs the *router* article (it shares the word “reset”), while semantic search finds “recover a forgotten login credential” — no shared words at all.\n\nNeither wins everywhere. That is why production systems often run both ({{hybrid-search|hybrid search}}).",
      analogy: "BM25 is a librarian who matches the exact words on the spine. Semantic search is one who understands what you meant but sometimes mishears part numbers.",
      highlight: ["bm25", "vdb", "results"],
      packets: [
        { from: "bm25", to: "results", label: `A → ${DOCS[best(BM_A)].id} · B → ${DOCS[best(BM_B)].id}`, sub: "keyword", tone: "amber" },
        { from: "vdb", to: "results", label: `A → ${DOCS[best(SEM_A)].id} · B → ${DOCS[best(SEM_B)].id}`, sub: "semantic", tone: "blue" },
      ],
      viz: [
        {
          kind: "table",
          title: "Scores per document",
          columns: ["doc", "BM25 · A", "cos · A", "BM25 · B", "cos · B"],
          rows: DOCS.map((d, i) => [`${d.id} ${d.text.split(" ").slice(0, 3).join(" ")}…`, f(BM_A[i]), f(SEM_A[i], 3), f(BM_B[i]), f(SEM_B[i], 3)]),
          caption: `A “${QA.text}”: BM25 top = ${DOCS[best(BM_A)].id}, semantic top = ${DOCS[best(SEM_A)].id}. B “${QB.text}”: BM25 top = ${DOCS[best(BM_B)].id}, semantic top = ${DOCS[best(SEM_B)].id}. Semantic vectors are toy values.`,
        },
        {
          kind: "bars",
          title: `Query B “${QB.text}” — semantic`,
          items: DOCS.map((d, i) => ({ label: d.id, value: SEM_B[i], tone: i === best(SEM_B) ? ("green" as const) : ("blue" as const) })),
          max: 1,
          format: "fixed3",
        },
      ],
      deeper: {
        math: [
          "BM25(q, d) = Σ_t IDF(t) · tf·(k₁+1) / (tf + k₁·(1 − b + b·|d|/avgdl))",
          "IDF(t) = ln(1 + (N − n_t + 0.5)/(n_t + 0.5)),  k₁ = 1.2,  b = 0.75",
          `“e1043” appears in 1 of 5 docs → IDF = ${f(Math.log(1 + (5 - 1 + 0.5) / (1 + 0.5)), 3)}; “error” in 2 of 5 → IDF = ${f(Math.log(1 + (5 - 2 + 0.5) / (2 + 0.5)), 3)}`,
        ],
      },
      log: [
        { tone: "amber", cells: { stage: "bm25 · A", item: `${DOCS[best(BM_A)].id} “${DOCS[best(BM_A)].text}”`, score: f(Math.max(...BM_A)), note: "exact code wins" } },
        { tone: "rose", cells: { stage: "cos · A", item: `${DOCS[best(SEM_A)].id} “${DOCS[best(SEM_A)].text}”`, score: f(Math.max(...SEM_A), 3), note: "semantic blurs the code" } },
        { tone: "rose", cells: { stage: "bm25 · B", item: `${DOCS[best(BM_B)].id} “${DOCS[best(BM_B)].text}”`, score: f(Math.max(...BM_B)), note: "shares “reset”, wrong topic" } },
        { tone: "green", cells: { stage: "cos · B", item: `${DOCS[best(SEM_B)].id} “${DOCS[best(SEM_B)].text}”`, score: f(Math.max(...SEM_B), 3), note: "meaning match" } },
      ],
      interviewTip: "Give a concrete case where BM25 beats embeddings (codes, SKUs, names) — it shows you have run search in production, not just read about it.",
    },
    {
      id: "chunking",
      title: "Chunking: size and overlap",
      explain:
        "A whole manual squeezed into one vector is too blurry to search, and embedding models have an input limit. So we split documents into {{chunk|chunks}} first.\n\nHere a 2,000-token document is cut into 500-token chunks that **overlap** by 100 tokens, so a sentence that falls on a boundary still appears whole in at least one chunk.\n\nSmaller chunks = sharper matches but less context each; bigger chunks = more context but fuzzier vectors. There is no universal best size — test a few on your own questions.",
      analogy: "Cutting a long scroll into index cards, letting each card repeat the last line of the previous one so no sentence is cut in half.",
      highlight: ["docs", "chunker"],
      packets: [
        { from: "docs", to: "chunker", label: `${fmtInt(DOC_TOKENS)} tokens`, tone: "slate" },
        { from: "chunker", to: "model", label: `${N_CHUNKS} chunks × ≤${CHUNK}`, sub: `overlap ${OVERLAP}`, tone: "violet" },
      ],
      viz: {
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
    },
    {
      id: "vectordb",
      title: "Vector databases: exact vs approximate",
      explain:
        "Comparing a query with every stored vector is **exact** but slow once you have millions. A {{vector-db|vector database}} builds an index for {{ann|approximate nearest-neighbour}} search instead.\n\nThe popular {{hnsw|HNSW}} index links each vector to a few close neighbours in layered graphs. A search starts at the top layer and hops greedily toward the query, checking only a small fraction of the vectors.\n\nThe price: it can occasionally miss a true neighbour. You tune that trade-off (speed vs recall) and you should measure it.",
      analogy: "Finding a house by asking neighbours for directions, street by street, instead of knocking on every door in the country.",
      highlight: ["vector", "vdb"],
      packets: [
        { from: "vector", to: "vdb", label: "upsert(id, v, metadata)", tone: "blue" },
        { from: "vdb", to: "results", label: "query → top-k ids", tone: "green" },
      ],
      viz: [
        {
          kind: "table",
          title: "Flat (exact) vs HNSW (approximate)",
          columns: ["", "Flat / brute force", "HNSW"],
          rows: [
            ["Work per query", "every vector", "a small slice, via graph hops"],
            ["Recall", "100%", "below 100%, tunable (efSearch)"],
            ["Memory", "vectors", "vectors + graph links"],
            ["Good for", "≤ ~100k vectors, or exact needs", "millions of vectors, low latency"],
          ],
        },
        {
          kind: "bars",
          title: `Memory for ${fmtInt(N_VEC)} vectors × ${DIM} dims`,
          items: [
            { label: "float32", value: FLOAT32_GB, tone: "rose", note: "GB" },
            { label: "int8", value: INT8_GB, tone: "amber", note: "GB" },
            { label: "binary", value: BINARY_GB, tone: "green", note: "GB" },
          ],
          format: "fixed3",
          caption: `Brute force = ${fmtInt(MACS)} multiply-adds per query. Quantising vectors (int8, binary) cuts memory a lot, usually with a re-scoring pass to recover accuracy.`,
        },
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
    {
      id: "search",
      title: "A full search, with scores",
      explain:
        `A user types “${QC.text}”. The same embedding model turns it into a vector, the vector DB returns the closest chunks with their cosine scores, and anything below a cut-off (here ${THRESHOLD}) is dropped rather than shown as a bad match.\n\nThe result “reset the router to fix wifi drops” shares only one word with the query (“wifi”), yet it ranks first by a wide margin because the *meaning* matches.`,
      highlight: ["user", "model", "vdb", "results"],
      packets: [
        { from: "user", to: "model", label: `“${QC.text}”`, tone: "cyan" },
        { from: "model", to: "vector", label: "q vector", tone: "blue" },
        { from: "vector", to: "vdb", label: "nearest k = 3", tone: "blue" },
        { from: "vdb", to: "results", label: `${SEM_C[0].id} ${f(SEM_C[0].s, 3)}`, tone: "green" },
      ],
      viz: {
        kind: "bars",
        title: `Cosine to “${QC.text}”`,
        items: SEM_C.map((r) => ({ label: r.id, value: r.s, tone: r.s >= THRESHOLD ? ("green" as const) : ("slate" as const), note: r.s >= THRESHOLD ? "" : "below cut-off" })),
        max: 1,
        format: "fixed3",
        caption: `${SEM_C.filter((r) => r.s >= THRESHOLD).length} result(s) above ${THRESHOLD}. Toy vectors.`,
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
