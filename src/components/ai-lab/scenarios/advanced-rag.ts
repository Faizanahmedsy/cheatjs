import type { Scenario, Tone } from "../engine/types";
import { bm25, cosine, f, mean, ndcgAtK, precisionAtK, reciprocalRank, recallAtK, rrf, sigmoid } from "../engine/math";

/* ------------------------------------------------------------------ *
 * Advanced RAG on a toy HR handbook. A vague question goes through
 * rewrite → hybrid search (BM25 + vectors, metadata filter, RRF) →
 * cross-encoder re-rank → context assembly → answer → evaluation.
 * Scores, ranks, budgets and metrics are all computed below.
 * ------------------------------------------------------------------ */

type Chunk = { id: string; title: string; text: string; year: number; emb: number[] };

/** Toy embedding dims: [vacation/leave, new-hire, policy/time, unrelated]. */
const CHUNKS: Chunk[] = [
  { id: "p1", title: "Leave policy 2024", text: "New employees receive 20 vacation days per year under the 2024 policy.", year: 2024, emb: [0.9, 0.8, 0.5, 0.0] },
  { id: "p2", title: "Carry-over rules", text: "Unused vacation days roll over, up to 5 days, into the next year.", year: 2024, emb: [0.8, 0.1, 0.5, 0.1] },
  { id: "p3", title: "Leave policy 2022", text: "Under the 2022 policy, new hires received 15 vacation days.", year: 2022, emb: [0.8, 0.75, 0.35, 0.0] },
  { id: "p4", title: "What PTO covers", text: "Paid time off covers vacation, sick and personal leave.", year: 2024, emb: [0.7, 0.1, 0.6, 0.1] },
  { id: "p5", title: "First-year accrual", text: "Employees in their first year accrue leave monthly from day one.", year: 2024, emb: [0.6, 0.8, 0.3, 0.1] },
  { id: "p6", title: "Cafeteria hours", text: "The office cafeteria is open from 8am to 4pm.", year: 2024, emb: [0.0, 0.0, 0.1, 0.9] },
  { id: "p7", title: "Remote work", text: "Remote work requests go through your manager.", year: 2023, emb: [0.1, 0.1, 0.3, 0.7] },
  { id: "p8", title: "Holiday calendar", text: "The 2024 holiday calendar lists 10 public holidays.", year: 2024, emb: [0.5, 0.0, 0.5, 0.3] },
  { id: "p9", title: "FAQ (copy of p1)", text: "FAQ: new employees get 20 vacation days each year under the 2024 policy.", year: 2024, emb: [0.88, 0.8, 0.49, 0.0] },
];
const byId = new Map(CHUNKS.map((c) => [c.id, c]));

const STOP = new Set(["how", "much", "do", "get", "the", "in", "of", "a", "to", "per", "up", "into", "from", "your", "through", "their", "are", "is", "for", "many", "under", "each", "and", "go", "faq", "what"]);
const tokenize = (s: string) =>
  s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !STOP.has(w));

const ORIGINAL = "how much leave do new joiners get?";
const REWRITTEN = "How many vacation days do new employees get under the 2024 policy?";
const HYDE = "New employees typically get a set number of vacation days per year under the current leave policy.";
const MULTI = ["new employee vacation days 2024", "paid time off allowance first year", "vacation days for new hires"];

/** Toy query embeddings in the same 4 dims. */
const Q_ORIG = [0.6, 0.4, 0.2, 0.25];
const Q_REWRITE = [0.9, 0.7, 0.4, 0.0];
const Q_HYDE = [0.9, 0.78, 0.5, 0.0];

/* ---- step 2: unfiltered keyword vs vector search ---- */
const bm25Scores = (terms: string[], pool: Chunk[]) => {
  const corpus = pool.map((c) => tokenize(c.text));
  return pool.map((c, i) => ({ id: c.id, score: bm25(terms, corpus[i], corpus) })).sort((a, b) => b.score - a.score);
};
const BM25_ORIG = bm25Scores(tokenize(ORIGINAL), CHUNKS);
const BM25_ALL = bm25Scores(tokenize(REWRITTEN), CHUNKS);
const VEC_ALL = CHUNKS.map((c) => ({ id: c.id, score: cosine(Q_REWRITE, c.emb) })).sort((a, b) => b.score - a.score);
const rankOf = (list: { id: string }[], id: string) => list.findIndex((x) => x.id === id) + 1;

/* ---- step 3: metadata filter + RRF fusion ---- */
const FILTER_YEAR = 2024;
const POOL = CHUNKS.filter((c) => c.year === FILTER_YEAR);
const BM25_F = bm25Scores(tokenize(REWRITTEN), POOL).filter((x) => x.score > 0);
const VEC_F = POOL.map((c) => ({ id: c.id, score: cosine(Q_REWRITE, c.emb) })).sort((a, b) => b.score - a.score);
const TOP_N = 5;
const LISTS = [BM25_F.slice(0, TOP_N).map((x) => x.id), VEC_F.slice(0, TOP_N).map((x) => x.id)];
const FUSED = [...new Set(LISTS.flat())].map((id) => ({ id, score: rrf(LISTS, id) })).sort((a, b) => b.score - a.score);
const CANDIDATES = FUSED.slice(0, TOP_N);
const LETTERS = ["A", "B", "C", "D", "E"];

/* ---- step 4: cross-encoder re-rank (toy model logits; sigmoid + sort computed) ---- */
const CE_LOGIT: Record<string, number> = { p1: 4.1, p9: 3.9, p5: 2.2, p4: 1.1, p2: 0.4, p8: -2.0 };
const RERANKED = CANDIDATES.map((c, i) => ({ ...c, letter: LETTERS[i], first: i + 1, ce: sigmoid(CE_LOGIT[c.id] ?? -3) })).sort((a, b) => b.ce - a.ce);

/* ---- step 5: context assembly: dedupe, budget, order ---- */
const DEDUPE_AT = 0.98;
/** Rough token estimate: about 0.75 English words per token. */
const tokensOf = (s: string) => Math.ceil(s.split(/\s+/).length / 0.75);
const BUDGET = 56;
type Slot = { id: string; tokens: number; ce: number; status: string };
const SLOTS: Slot[] = [];
{
  let used = 0;
  const kept: string[] = [];
  for (const r of RERANKED) {
    const c = byId.get(r.id)!;
    const dup = kept.find((k) => cosine(byId.get(k)!.emb, c.emb) >= DEDUPE_AT);
    const t = tokensOf(c.text);
    if (dup) SLOTS.push({ id: r.id, tokens: t, ce: r.ce, status: `dropped: duplicate of ${dup} (cos ${f(cosine(byId.get(dup)!.emb, c.emb), 3)})` });
    else if (used + t > BUDGET) SLOTS.push({ id: r.id, tokens: t, ce: r.ce, status: `dropped: over budget (${used} + ${t} > ${BUDGET})` });
    else {
      used += t;
      kept.push(r.id);
      SLOTS.push({ id: r.id, tokens: t, ce: r.ce, status: "kept" });
    }
  }
}
const KEPT = SLOTS.filter((s) => s.status === "kept");
const USED = KEPT.reduce((s, x) => s + x.tokens, 0);
const SYS_TOKENS = 40;
const Q_TOKENS = tokensOf(REWRITTEN);

/* ---- step 6/7: answer claims + evaluation set ---- */
const CLAIMS = [
  { text: "New employees get 20 vacation days a year.", source: "p1" },
  { text: "Leave accrues monthly from day one.", source: "p5" },
  { text: "Up to 5 unused days roll over.", source: "p2" },
  { text: "Unused days are paid out at year end.", source: null },
];
const inContext = new Set(KEPT.map((k) => k.id));
const SUPPORTED = CLAIMS.filter((c) => c.source && inContext.has(c.source)).length;
const FAITHFULNESS = SUPPORTED / CLAIMS.length;

const K = 5;
const EVAL = [
  { q: "vacation days for new joiners", rel: { p1: 3, p5: 2 } as Record<string, number>, ranked: RERANKED.map((r) => r.id).slice(0, K) },
  { q: "can unused days carry over?", rel: { p2: 3, p4: 1 } as Record<string, number>, ranked: ["p4", "p2", "p1", "p8", "p5"] },
  { q: "public holidays in 2024", rel: { p8: 3 } as Record<string, number>, ranked: ["p4", "p1", "p2", "p8", "p5"] },
].map((e) => {
  const set = new Set(Object.keys(e.rel));
  return { ...e, recall: recallAtK(e.ranked, set, K), precision: precisionAtK(e.ranked, set, K), rr: reciprocalRank(e.ranked, set), ndcg: ndcgAtK(e.ranked, e.rel, K) };
});
const MEAN = {
  recall: mean(EVAL.map((e) => e.recall)),
  precision: mean(EVAL.map((e) => e.precision)),
  mrr: mean(EVAL.map((e) => e.rr)),
  ndcg: mean(EVAL.map((e) => e.ndcg)),
};

/* ---- step 8: feedback (example counts from a week of thumbs-down) ---- */
const FAILURES: { label: string; value: number; tone: Tone; fix: string }[] = [
  { label: "retrieval miss", value: 12, tone: "rose", fix: "add synonyms to the rewriter (joiner → new employee); add eval case" },
  { label: "stale document", value: 7, tone: "amber", fix: "version metadata + filter; delete superseded chunks on re-ingest" },
  { label: "bad chunking", value: 5, tone: "violet", fix: "split by heading; keep tables whole" },
  { label: "unsupported claim", value: 4, tone: "blue", fix: "stricter prompt: answer only from sources, else say so" },
];
const FAIL_TOTAL = FAILURES.reduce((s, x) => s + x.value, 0);

const t = (id: string) => byId.get(id)!.title;
const rrfQuizA = 1 / 61 + 1 / 63;

const scenario: Scenario = {
  id: "advanced-rag",
  title: "Advanced RAG & retrieval quality",
  tagline: "Better queries, better ranking, a tighter context — and numbers that prove it.",
  overview: {
    definition:
      "Basic {{rag|RAG}} embeds the question and grabs the nearest {{chunk|chunks}}. **Advanced RAG** improves each stage: rewrite the question, search with keywords *and* vectors ({{hybrid-search|hybrid search}}), filter by metadata, re-order with a {{reranker|re-ranker}}, pack the best evidence into the prompt, and **measure** retrieval and answers so changes are proven, not guessed.",
    analogy:
      "A **research librarian**. They first clarify what you really mean, check both the card catalogue (keywords) and their memory of similar books (meaning), skip editions that are out of date, read the top few to pick the best, and hand you a short, ordered stack — then ask afterwards whether it helped.",
    facts: [
      ["Biggest lever", "Retrieval quality. If the right chunk is not retrieved, the LLM cannot use it."],
      ["Hybrid merge", "{{rrf|RRF}}: score = Σ 1 / (k + rank), k = 60 is the common default"],
      ["Re-ranking", "{{cross-encoder|Cross-encoder}} over the top ~20–100 first-stage results"],
      ["Retrieval metrics", "{{recall|Recall@k}}, {{precision|precision@k}}, {{mrr|MRR}}, {{ndcg|NDCG}}"],
      ["Answer metrics", "{{faithfulness|Faithfulness}} / {{grounding|groundedness}}, answer correctness, citation accuracy"],
      ["This demo", `${CHUNKS.length} toy HR chunks, 4-number embeddings, ${EVAL.length} labelled test questions`],
    ],
    whereUsed: "Internal knowledge assistants, support bots, legal and policy search — anywhere wrong or outdated answers are expensive.",
  },
  objects: [
    { id: "bm25", kind: "search", label: "BM25 index", sub: "keywords", at: [4.8, -3.2], tone: "amber" },
    { id: "vdb", kind: "vectordb", label: "Vector DB", sub: "ANN + metadata filter", at: [7.2, -3.2], tone: "blue" },
    { id: "user", kind: "user", label: "User", sub: "vague question", at: [0, 0], tone: "cyan" },
    { id: "rewriter", kind: "tool", label: "Query rewriter", sub: "rewrite · HyDE · multi", at: [2.4, 0], tone: "violet" },
    { id: "fusion", kind: "gear", label: "Hybrid merge", sub: "RRF, k = 60", at: [7.2, 0], tone: "violet" },
    { id: "reranker", kind: "ranker", label: "Re-ranker", sub: "cross-encoder", at: [9.6, 0], tone: "green" },
    { id: "context", kind: "doc", label: "Context builder", sub: "dedupe · budget · order", at: [12, 0], tone: "cyan" },
    { id: "feedback", kind: "chart", label: "Feedback loop", sub: "failures → fixes", at: [4.8, 3.6], tone: "amber" },
    { id: "eval", kind: "gauge", label: "Evaluator", sub: "recall · MRR · faithfulness", at: [9.6, 3.6], tone: "rose" },
    { id: "llm", kind: "llm", label: "LLM", sub: "answer + citations", at: [12, 3.6], tone: "green" },
  ],
  links: [
    { id: "l1", from: "user", to: "rewriter" },
    { id: "l2", from: "rewriter", to: "bm25" },
    { id: "l3", from: "rewriter", to: "vdb" },
    { id: "l4", from: "bm25", to: "fusion" },
    { id: "l5", from: "vdb", to: "fusion" },
    { id: "l6", from: "fusion", to: "reranker" },
    { id: "l7", from: "reranker", to: "context" },
    { id: "l8", from: "context", to: "llm" },
    { id: "l9", from: "llm", to: "eval" },
    { id: "l10", from: "eval", to: "feedback" },
    { id: "l11", from: "feedback", to: "rewriter" },
  ],
  logTitle: "retrieval trace",
  logColumns: [
    { key: "stage", label: "Stage", width: "18%" },
    { key: "doc", label: "Chunk / query" },
    { key: "score", label: "Score", align: "right", width: "14%" },
    { key: "detail", label: "Detail" },
  ],
  steps: [
    {
      id: "rewrite",
      title: "Fix the question before searching",
      explain:
        `Users type short, vague questions: “${ORIGINAL}”. The handbook never says “joiners”, so keyword search misses, and the vector of a vague question sits far from the right chunk.\n\nA small LLM call can improve the query first:\n\n- **Rewrite**: make it specific and self-contained.\n- **Expansion**: add synonyms (joiner → new employee, leave → vacation).\n- **{{hyde|HyDE}}**: write a *fake* answer and search with its {{embedding}} — answers look more like documents than questions do.\n- **Multi-query**: search several phrasings and merge the results.\n- **Decomposition**: split a compound question into sub-questions.`,
      analogy: "A good librarian asks “do you mean annual leave for someone in their first year?” before walking to the shelves.",
      highlight: ["user", "rewriter"],
      packets: [
        { from: "user", to: "rewriter", label: "vague question", sub: "how much leave … new joiners?", tone: "cyan" },
        { from: "rewriter", to: "rewriter", label: "rewrite + HyDE + 3 variants", tone: "violet" },
      ],
      viz: [
        {
          kind: "table",
          title: "Five ways to improve a query",
          columns: ["Technique", "Output"],
          rows: [
            ["Rewrite", REWRITTEN],
            ["Expansion", "leave OR vacation OR PTO; joiner OR new employee OR new hire"],
            ["HyDE", HYDE],
            ["Multi-query", MULTI.join(" | ")],
            ["Decomposition", "“Compare 2022 and 2024 leave” → (1) 2022 allowance? (2) 2024 allowance?"],
          ],
        },
        {
          kind: "bars",
          title: `Cosine similarity to the right chunk (${t("p1")})`,
          items: [
            { label: "original", value: cosine(Q_ORIG, byId.get("p1")!.emb), tone: "slate" },
            { label: "rewritten", value: cosine(Q_REWRITE, byId.get("p1")!.emb), tone: "blue" },
            { label: "HyDE", value: cosine(Q_HYDE, byId.get("p1")!.emb), tone: "green" },
          ],
          max: 1,
          format: "fixed3",
          caption: `Keyword search on the original wording ranks ${t("p1")} #${rankOf(BM25_ORIG, "p1")}; the rewritten query ranks it #${rankOf(BM25_ALL, "p1")}.`,
        },
      ],
      deeper: {
        text: "HyDE costs an extra LLM call and can backfire when the model does not know the domain — its fake answer may pull in the wrong documents. Keep the original query in the mix (multi-query) and measure.",
        code: {
          lang: "python",
          src: `
rewritten = llm("Rewrite as a specific, standalone search query: " + q)
hyde_doc  = llm("Write a short passage that answers: " + rewritten)
variants  = llm("Give 3 different phrasings of: " + rewritten).splitlines()
queries   = [q, rewritten, *variants]          # search all, fuse with RRF
hyde_vec  = embed(hyde_doc)                    # search with the fake answer's vector`,
        },
      },
      log: [
        { tone: "cyan", cells: { stage: "input", doc: ORIGINAL, score: "", detail: "vague: no match for “joiners”" } },
        { tone: "violet", cells: { stage: "rewrite", doc: REWRITTEN, score: f(cosine(Q_REWRITE, byId.get("p1")!.emb), 3), detail: "cos to p1" } },
        { tone: "violet", cells: { stage: "hyde", doc: "fake answer → embed", score: f(cosine(Q_HYDE, byId.get("p1")!.emb), 3), detail: "cos to p1" } },
      ],
      interviewTip: "Name the cost of every trick: an extra LLM call adds latency and money. Interviewers want to hear you would measure the gain.",
    },
    {
      id: "hybrid",
      title: "Keyword and vector search, side by side",
      explain:
        "Two searches run in parallel on the rewritten query:\n\n- **{{bm25|BM25}}** scores exact word matches — great for names, codes, numbers like “2024”.\n- **Vector search** compares {{embedding|embeddings}} with {{cosine-similarity|cosine similarity}} — great for paraphrases.\n\nNotice the problem: the **2022** policy (p3) scores high on both. It *looks* relevant but is out of date. Similarity alone cannot know that.",
      highlight: ["rewriter", "bm25", "vdb"],
      packets: [
        { from: "rewriter", to: "bm25", label: "BM25: 6 query terms", sub: "vacation days new employees …", tone: "amber" },
        { from: "rewriter", to: "vdb", label: `q = [${Q_REWRITE.join(", ")}]`, tone: "blue" },
      ],
      viz: [
        {
          kind: "table",
          title: "Top 5 from each search (no filter)",
          columns: ["#", "BM25", "score", "Vector", "cosine"],
          rows: Array.from({ length: 5 }, (_, i) => [i + 1, `${BM25_ALL[i].id} ${t(BM25_ALL[i].id)}`, f(BM25_ALL[i].score), `${VEC_ALL[i].id} ${t(VEC_ALL[i].id)}`, f(VEC_ALL[i].score, 3)]),
          highlightRow: Math.min(rankOf(BM25_ALL, "p3"), rankOf(VEC_ALL, "p3")) - 1,
          caption: `p3 (2022, outdated) ranks #${rankOf(BM25_ALL, "p3")} in BM25 and #${rankOf(VEC_ALL, "p3")} in vectors.`,
        },
      ],
      deeper: {
        math: [
          "BM25(q, d) = Σ_t IDF(t) · tf·(k₁+1) / (tf + k₁·(1 − b + b·|d|/avgdl)),  k₁ = 1.2, b = 0.75",
          "IDF(t) = ln(1 + (N − n_t + 0.5) / (n_t + 0.5))",
          "cos(q, d) = q·d / (‖q‖·‖d‖)",
          `cos(q, p1) = ${f(cosine(Q_REWRITE, byId.get("p1")!.emb), 4)},  cos(q, p3) = ${f(cosine(Q_REWRITE, byId.get("p3")!.emb), 4)}`,
        ],
      },
      log: [
        ...BM25_ALL.slice(0, 3).map((x, i) => ({ tone: "amber" as const, cells: { stage: `bm25 #${i + 1}`, doc: `${x.id} ${t(x.id)}`, score: f(x.score), detail: `year ${byId.get(x.id)!.year}` } })),
        ...VEC_ALL.slice(0, 3).map((x, i) => ({ tone: "blue" as const, cells: { stage: `vector #${i + 1}`, doc: `${x.id} ${t(x.id)}`, score: f(x.score, 3), detail: `year ${byId.get(x.id)!.year}` } })),
      ],
    },
    {
      id: "filter-fuse",
      title: "Metadata filter + fuse with RRF",
      explain:
        `A {{metadata-filter|metadata filter}} (year = ${FILTER_YEAR}) removes stale versions before ranking. The same mechanism enforces **permissions** — users must only retrieve chunks they are allowed to read.\n\nNow merge the two lists. BM25 scores and cosines are on different scales, so we use ranks instead: {{rrf|Reciprocal Rank Fusion}} gives each chunk 1 / (60 + rank) from each list and adds them up. A chunk near the top of **both** lists wins.`,
      analogy: "Two judges rank the same contestants with different scoring sheets. Instead of adding incompatible points, you add up how high each contestant placed.",
      highlight: ["bm25", "vdb", "fusion"],
      packets: [
        { from: "bm25", to: "fusion", label: `top ${TOP_N} ids (year=${FILTER_YEAR})`, tone: "amber" },
        { from: "vdb", to: "fusion", label: `top ${TOP_N} ids (year=${FILTER_YEAR})`, tone: "blue" },
      ],
      viz: [
        {
          kind: "table",
          title: "Fused ranking",
          columns: ["", "Chunk", "BM25 rank", "Vector rank", "RRF"],
          rows: FUSED.map((x, i) => [i < TOP_N ? LETTERS[i] : "—", `${x.id} ${t(x.id)}`, LISTS[0].indexOf(x.id) + 1 || "—", LISTS[1].indexOf(x.id) + 1 || "—", f(x.score, 4)]),
          caption: `p3 (2022) and p7 (2023) are filtered out. Top ${TOP_N} become candidates A–E for the re-ranker.`,
        },
        { kind: "bars", title: "RRF scores", items: FUSED.map((x, i) => ({ label: x.id, value: x.score, tone: i < TOP_N ? "violet" : "slate" })), format: "fixed4" },
      ],
      deeper: {
        math: [
          "RRF(d) = Σ_lists 1 / (k + rank_list(d)),  k = 60",
          `RRF(${FUSED[0].id}) = ${LISTS.map((l) => (l.includes(FUSED[0].id) ? `1/(60+${l.indexOf(FUSED[0].id) + 1})` : "0")).join(" + ")} = ${f(FUSED[0].score, 5)}`,
          "Filter inside the vector DB query (pre-filter) where possible; filtering after top-k can leave you with too few results.",
        ],
      },
      log: FUSED.slice(0, TOP_N).map((x, i) => ({ tone: "violet" as const, cells: { stage: `rrf ${LETTERS[i]}`, doc: `${x.id} ${t(x.id)}`, score: f(x.score, 4), detail: `bm25 #${LISTS[0].indexOf(x.id) + 1 || "—"} · vec #${LISTS[1].indexOf(x.id) + 1 || "—"}` } })),
      interviewTip: "Mention access control as a metadata filter. Leaking a document the user may not see is a security bug, not a relevance bug.",
    },
    {
      id: "rerank",
      title: "Re-rank A–E with a cross-encoder",
      explain:
        "First-stage search is fast because document vectors were computed in advance ({{bi-encoder}}): the query and the chunk never “see” each other.\n\nA {{cross-encoder}} reads the question and one chunk **together** and outputs a relevance score. It is far more accurate but too slow to run over the whole corpus, so we only run it on the few candidates. Here it lifts the exact answer to the top.",
      analogy: "The first round is a quick CV scan; the re-ranker is the interview. You only interview the shortlist.",
      highlight: ["fusion", "reranker"],
      packets: [
        { from: "fusion", to: "reranker", label: "5 × (query, chunk) pairs", tone: "violet" },
        { from: "reranker", to: "reranker", label: "score each pair", tone: "green" },
      ],
      viz: [
        {
          kind: "table",
          title: "Before → after re-ranking",
          columns: ["New", "Cand.", "Chunk", "Was", "Relevance"],
          rows: RERANKED.map((r, i) => [i + 1, r.letter, `${r.id} ${t(r.id)}`, `#${r.first}`, f(r.ce, 3)]),
          highlightRow: 0,
          caption: "Relevance = sigmoid(cross-encoder logit). Logits here are made up for the demo; the sorting is real.",
        },
        { kind: "bars", title: "Cross-encoder relevance", items: RERANKED.map((r) => ({ label: `${r.letter} ${r.id}`, value: r.ce, tone: r.ce > 0.5 ? "green" : "slate" })), max: 1, format: "fixed3" },
      ],
      deeper: {
        code: {
          lang: "python",
          src: `
pairs  = [(query, chunk.text) for chunk in candidates]
scores = cross_encoder.predict(pairs)          # one forward pass per pair
ranked = [c for _, c in sorted(zip(scores, candidates), reverse=True)]`,
        },
        math: ["Cost: bi-encoder = 1 query embedding + ANN lookup; cross-encoder = one model pass per candidate.", "So re-rank 20–100 candidates, not 1 million."],
      },
      log: RERANKED.map((r, i) => ({ tone: "green" as const, cells: { stage: `rerank #${i + 1}`, doc: `${r.letter} ${r.id} ${t(r.id)}`, score: f(r.ce, 3), detail: `was #${r.first}` } })),
    },
    {
      id: "assemble",
      title: "Assemble the context: dedupe, budget, order",
      explain:
        `The prompt has limited room, and every extra {{token}} costs money and latency. The context builder:\n\n- **Dedupes**: p9 is an FAQ copy of p1 — near-identical vectors, so it adds nothing.\n- **Fits a budget**: here ${BUDGET} tokens for evidence.\n- **Orders**: best evidence first, each chunk tagged with its id so the answer can cite it.\n\nModels tend to use information at the start and end of a long context more reliably than the middle (“lost in the middle”), so a short, well-ordered context usually beats a long one.`,
      highlight: ["reranker", "context"],
      packets: [{ from: "reranker", to: "context", label: `${RERANKED.length} ranked chunks`, tone: "green" }],
      viz: [
        {
          kind: "table",
          title: "Context decisions",
          columns: ["Chunk", "Tokens", "Decision"],
          rows: SLOTS.map((s) => [`${s.id} ${t(s.id)}`, s.tokens, s.status]),
        },
        {
          kind: "stack",
          title: `Prompt budget (≈ ${SYS_TOKENS + Q_TOKENS + USED} tokens)`,
          segments: [
            { label: `system prompt ${SYS_TOKENS}`, value: SYS_TOKENS, tone: "slate" },
            { label: `question ${Q_TOKENS}`, value: Q_TOKENS, tone: "cyan" },
            ...KEPT.map((k, i) => ({ label: `${k.id} ${k.tokens}`, value: k.tokens, tone: (["green", "blue", "violet", "amber"] as Tone[])[i % 4] })),
          ],
          caption: "Token counts are estimates (≈ 0.75 words per token).",
        },
      ],
      deeper: {
        math: [`dedupe if cos(a, b) ≥ ${DEDUPE_AT}:  cos(p1, p9) = ${f(cosine(byId.get("p1")!.emb, byId.get("p9")!.emb), 4)}`, `budget: ${KEPT.map((k) => k.tokens).join(" + ")} = ${USED} ≤ ${BUDGET}`],
        code: {
          lang: "python",
          src: `
context = "\\n\\n".join(f"[{c.id}] {c.title}\\n{c.text}" for c in kept)
prompt  = f"Answer only from the sources. Cite ids like [p1]. If unsure, say so.\\n\\n{context}\\n\\nQ: {question}"`,
        },
      },
      log: SLOTS.map((s) => ({ tone: (s.status === "kept" ? "cyan" : "slate") as Tone, cells: { stage: "context", doc: `${s.id} ${t(s.id)}`, score: `${s.tokens} tok`, detail: s.status } })),
    },
    {
      id: "generate",
      title: "Answer with citations",
      explain:
        `The LLM answers from the assembled sources and cites them by id. Then we check the answer **claim by claim**: is each sentence backed by a cited chunk?\n\nHere ${SUPPORTED} of ${CLAIMS.length} claims are supported. The last one (“paid out at year end”) appears in no source — a {{hallucination}}. {{faithfulness|Faithfulness}} = ${SUPPORTED} / ${CLAIMS.length} = ${f(FAITHFULNESS)}.`,
      highlight: ["context", "llm"],
      packets: [
        { from: "context", to: "llm", label: `prompt ≈ ${SYS_TOKENS + Q_TOKENS + USED} tokens`, tone: "cyan" },
        { from: "llm", to: "eval", label: "answer + [p1] [p5] [p2]", tone: "green" },
      ],
      viz: [
        {
          kind: "chat",
          title: "The answer",
          messages: [
            { role: "user", text: REWRITTEN },
            { role: "assistant", text: `${CLAIMS[0].text} [p1] ${CLAIMS[1].text} [p5] ${CLAIMS[2].text} [p2] ${CLAIMS[3].text}`, note: "last sentence has no source" },
          ],
        },
        { kind: "table", title: "Claim-level check", columns: ["Claim", "Source", "Supported?"], rows: CLAIMS.map((c) => [c.text, c.source ?? "—", c.source && inContext.has(c.source) ? "yes" : "NO"]), highlightRow: CLAIMS.length - 1 },
      ],
      deeper: {
        math: ["faithfulness = supported claims / total claims", `= ${SUPPORTED} / ${CLAIMS.length} = ${f(FAITHFULNESS)}`, "Usually an LLM judge extracts claims and checks each against the context — validate the judge against human labels first."],
      },
      log: CLAIMS.map((c) => ({ tone: (c.source && inContext.has(c.source) ? "green" : "rose") as Tone, cells: { stage: "claim", doc: c.text, score: c.source && inContext.has(c.source) ? "1" : "0", detail: c.source ? `cites ${c.source}` : "no source" } })),
      interviewTip: "Separate “was the right evidence retrieved?” from “did the answer stick to it?”. They fail for different reasons and have different fixes.",
    },
    {
      id: "evaluate",
      title: "Measure retrieval on a labelled test set",
      explain:
        `You cannot improve what you do not measure. Build a small **golden set**: real questions with the chunk ids that answer them. Then score the ranked results:\n\n- {{recall|Recall@${K}}}: did we find the relevant chunks at all?\n- {{precision|Precision@${K}}}: how much of the top ${K} is useful?\n- {{mrr|MRR}}: how high is the *first* relevant result?\n- {{ndcg|NDCG}}: are the *most* relevant results highest?\n\nRun it on every change (new chunker, new embedding model, new prompt) like unit tests.`,
      highlight: ["llm", "eval"],
      packets: [{ from: "llm", to: "eval", label: `${EVAL.length} test questions`, tone: "rose" }],
      viz: [
        {
          kind: "table",
          title: `Retrieval metrics @${K}`,
          columns: ["Question", "Recall", "Prec.", "RR", "NDCG"],
          rows: [...EVAL.map((e) => [e.q, f(e.recall), f(e.precision), f(e.rr), f(e.ndcg, 3)]), ["mean", f(MEAN.recall), f(MEAN.precision), f(MEAN.mrr), f(MEAN.ndcg, 3)]],
          highlightRow: EVAL.length,
          caption: "MRR = mean of the RR column.",
        },
        {
          kind: "bars",
          title: "Pipeline scorecard",
          items: [
            { label: `recall@${K}`, value: MEAN.recall, tone: "green" },
            { label: "MRR", value: MEAN.mrr, tone: "blue" },
            { label: `NDCG@${K}`, value: MEAN.ndcg, tone: "violet" },
            { label: "faithfulness", value: FAITHFULNESS, tone: "rose" },
          ],
          max: 1,
          format: "fixed2",
        },
      ],
      deeper: {
        math: [
          "Recall@k = |relevant ∩ top k| / |relevant|      Precision@k = |relevant ∩ top k| / k",
          "RR = 1 / rank of first relevant;  MRR = mean RR",
          "DCG@k = Σ rel_i / log₂(i + 1);  NDCG = DCG / ideal DCG",
          `Q3: first relevant (p8) at rank ${EVAL[2].ranked.indexOf("p8") + 1} → RR = ${f(EVAL[2].rr)}; NDCG = (3/log₂5) / (3/log₂2) = ${f(EVAL[2].ndcg, 3)}`,
        ],
      },
      log: [
        ...EVAL.map((e) => ({ tone: "rose" as const, cells: { stage: "eval", doc: e.q, score: f(e.ndcg, 3), detail: `R@${K} ${f(e.recall)} · P@${K} ${f(e.precision)} · RR ${f(e.rr)}` } })),
        { tone: "amber", cells: { stage: "summary", doc: "mean over test set", score: f(MEAN.mrr), detail: `MRR · recall ${f(MEAN.recall)} · NDCG ${f(MEAN.ndcg, 3)}` } },
      ],
      interviewTip: "Precision@k is capped when a question has fewer than k relevant chunks — say so, and lean on recall, MRR and NDCG for RAG.",
    },
    {
      id: "feedback",
      title: "Close the loop",
      explain:
        "Production gives you the best test cases: thumbs-down, “that's wrong” follow-ups, escalations to a human. Tag each failure by **where** it broke, fix the biggest bucket, and add the failing question to the golden set so it can never silently break again.",
      analogy: "The librarian keeps a notebook of every question they couldn't answer well — and that notebook decides what to reorganise next.",
      highlight: ["eval", "feedback", "rewriter"],
      packets: [
        { from: "eval", to: "feedback", label: `${FAIL_TOTAL} failures tagged`, tone: "amber" },
        { from: "feedback", to: "rewriter", label: "joiner → new employee", sub: "+ new eval cases", tone: "violet" },
      ],
      viz: [
        { kind: "stack", title: "Where answers broke (example week)", segments: FAILURES.map((x) => ({ label: x.label, value: x.value, tone: x.tone })), caption: "Example counts for illustration." },
        { kind: "table", title: "Fix per bucket", columns: ["Failure", "Share", "Fix"], rows: FAILURES.map((x) => [x.label, `${Math.round((x.value / FAIL_TOTAL) * 100)}%`, x.fix]) },
      ],
      deeper: {
        text: "Keep the loop honest: re-run the full golden set after each fix, compare against the previous run, and only ship changes that improve the target metric without regressing others.",
      },
      log: FAILURES.map((x) => ({ tone: x.tone, cells: { stage: "feedback", doc: x.label, score: `${x.value}`, detail: x.fix } })),
    },
  ],
  interview: [
    {
      id: "arag-1",
      level: "fresher",
      q: "What is hybrid search and why would you use it in RAG?",
      answer:
        "Running keyword search (usually BM25) and vector search together and merging the results. Keywords catch exact terms — product codes, names, error messages, numbers — that embeddings can blur; vectors catch paraphrases and synonyms that keywords miss. Merging (often with Reciprocal Rank Fusion) gives better recall than either alone on most real corpora.",
      lookFor: "Concrete examples of what each side misses, and a merge method.",
      wrong: "“Vector search always beats keyword search, so BM25 is obsolete.”",
    },
    {
      id: "arag-2",
      level: "fresher",
      q: "What does a re-ranker do, and why not use it for the whole search?",
      answer:
        "A re-ranker (typically a cross-encoder) reads the query and a candidate chunk together and outputs a relevance score, which is more accurate than comparing separately computed embeddings. It needs one model pass per candidate, so it is only run on the top tens of results from a fast first-stage search.",
      lookFor: "Bi-encoder vs cross-encoder, and the two-stage cost argument.",
      wrong: "“The re-ranker re-embeds the corpus with a better model.” It scores query–chunk pairs; nothing is re-indexed.",
    },
    {
      id: "arag-3",
      level: "fresher",
      q: "Why add metadata filters to retrieval?",
      answer:
        "Similarity can't tell an outdated policy from the current one, or a document the user may not see from one they can. Filters on fields like version, date, product, region, tenant or permission groups remove those chunks before ranking. Access-control filtering is a security requirement, not an optimisation.",
      lookFor: "Freshness and permissions as the two main reasons.",
      wrong: "“The embedding captures the date, so filtering isn't needed.”",
    },
    {
      id: "arag-4",
      level: "fresher",
      q: "What is the difference between recall@k and precision@k?",
      answer: "Recall@k: of all relevant chunks for a question, what fraction appear in the top k. Precision@k: of the top k results, what fraction are relevant. In RAG, recall is usually the first thing to get right — a chunk that is not retrieved cannot be used.",
      lookFor: "Correct definitions and why recall matters most for RAG.",
      wrong: "Swapping the two, or “precision is the share of questions answered correctly”.",
    },
    {
      id: "arag-5",
      level: "mid",
      q: "Explain HyDE. When can it hurt?",
      answer:
        "Hypothetical Document Embeddings: ask an LLM to write a plausible answer to the question, embed that text, and search with its vector, because answers look more like documents than short questions do. It adds an LLM call (latency, cost) and can mislead retrieval when the model lacks domain knowledge and writes a confidently wrong passage. Keeping the original query in a multi-query setup limits the damage.",
      lookFor: "The mechanism, the reason it works, and the cost / failure mode.",
      wrong: "“HyDE uses the hypothetical answer as the final answer.” It is only used for retrieval.",
    },
    {
      id: "arag-6",
      level: "mid",
      q: "How does Reciprocal Rank Fusion work, and why use ranks rather than scores?",
      answer:
        "Each document gets Σ 1/(k + rank) over the ranked lists it appears in, with k commonly 60. BM25 scores and cosine similarities live on different, query-dependent scales, so adding them needs careful normalisation and weighting; RRF only uses positions, needs no tuning to start, and rewards documents that rank well in several lists.",
      lookFor: "The formula, the incomparable-scales reason, and that k dampens the dominance of top ranks.",
      wrong: "“Average the BM25 score and the cosine similarity.”",
    },
    {
      id: "arag-7",
      level: "mid",
      q: "Multi-query vs query decomposition — what is the difference?",
      answer:
        "Multi-query generates several phrasings of the same question and merges their results to improve recall. Decomposition splits a compound question (“compare X in 2022 and 2024”) into separate sub-questions, retrieves for each, and combines the answers — needed when no single chunk answers the whole question.",
      lookFor: "Same intent with different wording vs different sub-intents.",
      wrong: "Treating them as the same technique.",
    },
    {
      id: "arag-8",
      level: "mid",
      q: "You have 30 relevant-looking chunks but a small token budget. How do you build the context?",
      answer:
        "Re-rank, drop near-duplicates, keep the best chunks that fit the budget (leaving room for instructions and the answer), and tag each with an id and source for citations. Order matters: models tend to use information at the start and end of long contexts better than the middle, so put the strongest evidence first. Consider merging adjacent chunks from the same document to keep context coherent.",
      lookFor: "Dedupe, budget, ordering, citations — and awareness that more context is not automatically better.",
      wrong: "“Put all 30 chunks in; a bigger context window means better answers.”",
    },
    {
      id: "arag-9",
      level: "mid",
      q: "MRR vs NDCG — when would you prefer each?",
      answer:
        "MRR only looks at the position of the first relevant result — good when one chunk answers the question. NDCG uses graded relevance across all top-k positions with a logarithmic position discount, normalised so a perfect ordering scores 1 — better when several chunks contribute and some matter more.",
      lookFor: "First-hit vs graded, multi-result quality.",
      wrong: "“They are the same metric with different names.”",
    },
    {
      id: "arag-10",
      level: "senior",
      design: true,
      q: "How do you evaluate a RAG pipeline?",
      answer:
        "Evaluate the stages separately and end to end. 1) Build a golden set from real user questions with the chunk ids that answer them and reference answers, including hard and “not in the docs” cases. 2) Retrieval: recall@k, MRR, NDCG on that set. 3) Generation: faithfulness/groundedness (claim-level support by the retrieved context), answer correctness against the reference, citation accuracy, and correct refusals when the answer is missing. LLM judges scale this, but calibrate them against human labels. 4) System: latency percentiles and cost per query. 5) Run it as a regression suite on every change, then confirm online with feedback rates and A/B tests.",
      lookFor: "Component vs end-to-end split, a real labelled set, judge validation, and regression testing.",
      wrong: "“Read a few answers and see if they look good” or “use BLEU/ROUGE against a reference answer” as the main metric.",
    },
    {
      id: "arag-11",
      level: "senior",
      design: true,
      q: "Users say the assistant cites outdated policies. How do you diagnose and fix it?",
      answer:
        "Reproduce with the reported questions and inspect what was retrieved. Typical causes: old and new versions both indexed; ingestion only adds and never deletes; no version or effective-date metadata. Fixes: make ingestion an upsert keyed by document id that removes superseded chunks, add version/date metadata and filter or boost current versions, dedupe near-identical chunks, and tell the model to prefer the latest effective date. Add these questions to the golden set and track a “stale citation” rate.",
      lookFor: "Starts from evidence, fixes ingestion and metadata rather than the prompt alone, and adds regression tests.",
      wrong: "“Tell the LLM in the prompt to ignore old documents” as the only fix.",
    },
    {
      id: "arag-12",
      level: "senior",
      design: true,
      q: "The re-ranker pushes p95 latency over budget. What are your options?",
      answer:
        "Re-rank fewer candidates (measure recall at the smaller cut-off), use a smaller or distilled cross-encoder, batch candidates in one GPU call, cap chunk length, cache results for repeated queries, run BM25 and vector search in parallel, and skip re-ranking when the first stage is already confident. Measure the quality loss of each option on the golden set before choosing.",
      lookFor: "Several levers with a quality-vs-latency measurement plan.",
      wrong: "“Remove the re-ranker” without measuring the quality impact.",
    },
    {
      id: "arag-13",
      level: "senior",
      q: "What can go wrong with LLM-as-judge for faithfulness, and how do you guard against it?",
      answer:
        "Judges can be inconsistent, favour longer or more confident answers, be sensitive to prompt wording or answer order, and miss subtle unsupported details. Guard by checking claims one at a time against the context, using clear rubrics, measuring agreement with human labels on a sample, fixing the judge model and prompt version so scores are comparable over time, and spot-checking disagreements.",
      lookFor: "Known biases plus calibration against humans and versioning.",
      wrong: "“An LLM judge is objective, so its scores can be trusted as ground truth.”",
    },
  ],
  quiz: [
    {
      id: "aragq-1",
      q: "A chunk ranks 1st in BM25 and 3rd in vector search. With k = 60, what is its RRF score?",
      options: [f(1 / 61, 4), f(rrfQuizA, 4), f((1 + 1 / 3) / 2, 4), f(1 / 64, 4)],
      correct: 1,
      explain: `1/(60+1) + 1/(60+3) = ${f(1 / 61, 4)} + ${f(1 / 63, 4)} = ${f(rrfQuizA, 4)}.`,
    },
    {
      id: "aragq-2",
      q: "A question has 2 relevant chunks; 1 of them appears in the top 5. What are recall@5 and precision@5?",
      options: [`recall ${f(0.5)}, precision ${f(0.2)}`, `recall ${f(0.2)}, precision ${f(0.5)}`, `recall ${f(1)}, precision ${f(0.2)}`, `recall ${f(0.5)}, precision ${f(0.5)}`],
      correct: 0,
      explain: "Recall = 1 found / 2 relevant = 0.50. Precision = 1 relevant / 5 returned = 0.20.",
    },
    {
      id: "aragq-3",
      q: `An answer makes ${CLAIMS.length} claims and ${SUPPORTED} are supported by the retrieved context. What is its faithfulness?`,
      options: [f(SUPPORTED / CLAIMS.length), f(1 / CLAIMS.length), f(1), f(SUPPORTED / (CLAIMS.length + 1))],
      correct: 0,
      explain: `${SUPPORTED} / ${CLAIMS.length} = ${f(FAITHFULNESS)}. Faithfulness is about support by the context, not whether the claim happens to be true.`,
    },
    {
      id: "aragq-4",
      q: "Which model reads the query and the chunk together to score relevance?",
      options: ["Bi-encoder", "Cross-encoder", "BM25", "Tokenizer"],
      correct: 1,
      explain: "A cross-encoder takes the (query, chunk) pair as one input. A bi-encoder embeds them separately, which is faster but less precise.",
    },
    {
      id: "aragq-5",
      q: "In HyDE, what gets embedded and used for search?",
      options: ["The user's question only", "A hypothetical answer written by an LLM", "The re-ranker's scores", "The final answer shown to the user"],
      correct: 1,
      explain: "HyDE embeds an LLM-written hypothetical answer, because it resembles real documents more than a short question does.",
    },
    {
      id: "aragq-6",
      q: `The first relevant result is at rank ${EVAL[2].ranked.indexOf("p8") + 1}. What is the reciprocal rank?`,
      options: [f(EVAL[2].rr), f(1 - EVAL[2].rr), f(EVAL[2].ranked.indexOf("p8") + 1), f(1 / (EVAL[2].ranked.indexOf("p8") + 2))],
      correct: 0,
      explain: `RR = 1 / ${EVAL[2].ranked.indexOf("p8") + 1} = ${f(EVAL[2].rr)}. MRR averages this over all test questions.`,
    },
  ],
};

export default scenario;
