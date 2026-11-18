import type { CardsStage, Scenario, Tone } from "../engine/types";
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

/* ---- the cards stage: one library story, cards keep their ids so they fly between zones ---- */
type Card = NonNullable<CardsStage["zones"][number]["cards"]>[number];
type Zone = CardsStage["zones"][number];
const cards = (zones: Zone[], note?: string): CardsStage => ({ kind: "cards", zones, note });
const yearSub = (id: string) => `year ${byId.get(id)!.year}${byId.get(id)!.year !== FILTER_YEAR ? " · out of date" : ""}`;
/** A keyword-list card (its own id, so the same chunk can sit in both lists at once). */
const kCard = (x: { id: string; score: number }, i: number): Card => ({ id: `k-${x.id}`, title: t(x.id), sub: `#${i + 1} · ${yearSub(x.id)}`, score: f(x.score), tone: "amber" });
/** A vector-list card. It uses the chunk id, so later steps can fly it into the shortlist. */
const vCard = (x: { id: string; score: number }, i: number): Card => ({ id: x.id, title: t(x.id), sub: `#${i + 1} · ${yearSub(x.id)}`, score: f(x.score, 3), tone: "blue" });
const Q_ZONE = (text: string): Zone => ({ id: "question", label: "Your question", icon: "person", text, tone: "cyan" });
const COS_ORIG = cosine(Q_ORIG, byId.get("p1")!.emb);
const COS_REWRITE = cosine(Q_REWRITE, byId.get("p1")!.emb);
const COS_HYDE = cosine(Q_HYDE, byId.get("p1")!.emb);
const P3_BM25 = rankOf(BM25_ALL, "p3");
const P3_VEC = rankOf(VEC_ALL, "p3");
const letterOf = (id: string) => LETTERS[CANDIDATES.findIndex((c) => c.id === id)];
const DROPPED_RRF = FUSED.slice(TOP_N);
const BADGE = new Map(KEPT.map((k, i) => [k.id, String(i + 1)]));
const cite = (id: string | null) => (id && BADGE.has(id) ? ` [${BADGE.get(id)}]` : "");
const ANSWER_TEXT = CLAIMS.map((c) => `${c.text}${cite(c.source)}`).join(" ");
const shortlistCard = (id: string, score: string, sub: string, tone: Tone = "violet"): Card => ({ id, title: `${letterOf(id)} · ${t(id)}`, sub, score, tone });

const scenario: Scenario = {
  id: "advanced-rag",
  title: "Advanced RAG & retrieval quality",
  tagline: "Better queries, better ranking, a tighter context — and numbers that prove it.",
  imagine:
    "Imagine asking a busy library a vague question: “how much leave do new joiners get?”. A great librarian first works out what you really mean, checks both the catalogue and the shelves, skips the out-of-date editions, reads the best few, and hands you a short stack with the right pages marked. Then they ask whether it helped.",
  recap: [
    "Fix the **question** first: rewrite it, add synonyms, or search with a fake answer (HyDE).",
    "Search two ways (keywords + meaning), **filter** out stale or forbidden chunks, **merge** with RRF, then **re-rank** the shortlist.",
    "Pack a short, de-duplicated context, cite every claim, and **measure** recall, MRR and faithfulness on a test set.",
  ],
  overview: {
    plain:
      "Basic RAG looks up a few passages and lets the AI answer from them. Advanced RAG makes every part of that lookup better: a clearer question, two kinds of search, removing out-of-date passages, a careful second ranking, and a short, tidy set of evidence. Then it measures the results so every change is proven, not guessed.",
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
    // 1 ─────────────────────────────────────────────────────────────
    {
      id: "rewrite",
      title: "Fix the question before searching",
      simple: "Vague questions find the wrong pages, so a small AI step first rewrites the question clearly.",
      explain: `People type short questions like “${ORIGINAL}”. The handbook never says “joiners”, so a word search misses. A quick rewrite (asking an AI to restate it) makes it specific: “${REWRITTEN}”, and it now matches the right page better (${f(COS_ORIG, 3)} → ${f(COS_REWRITE, 3)}).`,
      analogy: "A good librarian asks “do you mean annual leave for someone in their first year?” before walking to the shelves.",
      detail:
        "Query transformations, cheapest first:\n\n- **Rewrite**: make it specific and self-contained (also resolves “it” / “that” from earlier chat turns).\n- **Expansion**: add synonyms (joiner → new employee, leave → vacation) so keyword search can match.\n- **Decomposition**: split a compound question (“compare 2022 and 2024 leave”) into sub-questions.\n\nEach one is an extra LLM call, so it adds latency and cost. Measure the gain.",
      stage: cards(
        [
          { ...Q_ZONE(`“${ORIGINAL}”`), cards: [{ id: "q-orig", title: "Original wording", sub: "no match for “joiners”", score: f(COS_ORIG, 3), tone: "slate" }] },
          { id: "rewriter", label: "Rewriter", icon: "librarian", tone: "violet", text: `“${REWRITTEN}”`, cards: [{ id: "q-rewrite", title: "Rewritten question", sub: "specific, standalone, handbook words", score: f(COS_REWRITE, 3), tone: "violet" }] },
        ],
        `score = how close the question is to the right page (${t("p1")}), 1 = perfect`,
      ),
      highlight: ["user", "rewriter"],
      packets: [
        { from: "user", to: "rewriter", label: "vague question", sub: "how much leave … new joiners?", tone: "cyan" },
        { from: "rewriter", to: "rewriter", label: "rewrite + expand", tone: "violet" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: "Ways to improve a query",
        columns: ["Technique", "Output"],
        rows: [
          ["Rewrite", REWRITTEN],
          ["Expansion", "leave OR vacation OR PTO; joiner OR new employee OR new hire"],
          ["Decomposition", "“Compare 2022 and 2024 leave” → (1) 2022 allowance? (2) 2024 allowance?"],
        ],
        caption: `Keyword search on the original wording ranks ${t("p1")} #${rankOf(BM25_ORIG, "p1")}; the rewritten query ranks it #${rankOf(BM25_ALL, "p1")}.`,
      },
      deeper: {
        code: {
          lang: "python",
          src: `
rewritten = llm("Rewrite as a specific, standalone search query: " + q)
expanded  = llm("Add common synonyms for the key terms: " + rewritten)`,
        },
      },
      log: [
        { tone: "cyan", cells: { stage: "input", doc: ORIGINAL, score: f(COS_ORIG, 3), detail: "vague: no match for “joiners”" } },
        { tone: "violet", cells: { stage: "rewrite", doc: REWRITTEN, score: f(COS_REWRITE, 3), detail: "cos to p1" } },
      ],
      interviewTip: "Name the cost of every trick: an extra LLM call adds latency and money. Interviewers want to hear you would measure the gain.",
    },
    // 2 ─────────────────────────────────────────────────────────────
    {
      id: "hyde",
      title: "Search with a fake answer, and several phrasings",
      simple: "Answers look more like handbook pages than questions do, so we also search with a made-up answer.",
      explain: `{{hyde|HyDE}} asks the AI to write a short pretend answer, then searches with its {{embedding}} (its list of meaning numbers). It lands even closer to the right page: **${f(COS_HYDE, 3)}**. **Multi-query** searches ${MULTI.length} different phrasings too, and merges the results, so one unlucky wording can't sink the search.`,
      analogy: "Describing the book you hope exists (“a chapter that says new staff get N days off”) instead of just asking a question.",
      detail:
        "HyDE (Hypothetical Document Embeddings) works because documents and answers share wording and structure, while questions are short and phrased differently. The fake answer is **only used for retrieval**, never shown.\n\nIt can backfire when the model does not know the domain: a confidently wrong fake answer pulls in the wrong documents. Keep the original query in the mix (multi-query) and measure on a golden set.",
      stage: cards(
        [
          { ...Q_ZONE(`“${ORIGINAL}”`), cards: [{ id: "q-orig", title: "Original wording", sub: "kept in the mix", score: f(COS_ORIG, 3), tone: "slate" }] },
          {
            id: "rewriter",
            label: "Rewriter",
            icon: "librarian",
            tone: "violet",
            cards: [
              { id: "q-rewrite", title: "Rewritten question", sub: "specific, standalone, handbook words", score: f(COS_REWRITE, 3), tone: "violet" },
              { id: "q-hyde", title: "HyDE: a pretend answer", sub: "“New employees typically get … days per year”", score: f(COS_HYDE, 3), tone: "green" },
              ...MULTI.map((m, i): Card => ({ id: `q-m${i}`, title: `Phrasing ${i + 1}`, sub: m, tone: "blue" })),
            ],
          },
        ],
        "every query card is searched; their results are merged later",
      ),
      highlight: ["rewriter", "vdb"],
      packets: [
        { from: "rewriter", to: "rewriter", label: "HyDE + 3 variants", tone: "violet" },
        { from: "rewriter", to: "vdb", label: "embed(fake answer)", tone: "green" },
      ],
      viz: {
        only: "interview",
        kind: "bars",
        title: `Cosine similarity to the right chunk (${t("p1")})`,
        items: [
          { label: "original", value: COS_ORIG, tone: "slate" },
          { label: "rewritten", value: COS_REWRITE, tone: "blue" },
          { label: "HyDE", value: COS_HYDE, tone: "green" },
        ],
        max: 1,
        format: "fixed3",
        caption: `HyDE text: “${HYDE}”`,
      },
      deeper: {
        text: "HyDE costs an extra LLM call before retrieval even starts, which adds directly to time-to-first-token.",
        code: {
          lang: "python",
          src: `
hyde_doc  = llm("Write a short passage that answers: " + rewritten)
variants  = llm("Give 3 different phrasings of: " + rewritten).splitlines()
queries   = [q, rewritten, *variants]          # search all, fuse with RRF
hyde_vec  = embed(hyde_doc)                    # search with the fake answer's vector`,
        },
      },
      log: [
        { tone: "green", cells: { stage: "hyde", doc: "fake answer → embed", score: f(COS_HYDE, 3), detail: "cos to p1" } },
        ...MULTI.map((m) => ({ tone: "blue" as const, cells: { stage: "multi-query", doc: m, score: "", detail: "searched too" } })),
      ],
      interviewTip: "HyDE vs multi-query vs decomposition: same intent in better words, several wordings, or several sub-questions. Be crisp about which is which.",
    },
    // 3 ─────────────────────────────────────────────────────────────
    {
      id: "hybrid",
      title: "Keyword and meaning search, side by side",
      simple: "Two searches run at once: one matches exact words, the other matches meaning.",
      explain: `{{bm25|BM25}} (keyword search) rewards pages that share rare words with the question, like “2024” or “vacation”. Vector search compares meaning with {{cosine-similarity|cosine similarity}} (how closely two meaning-arrows point the same way). Notice the **2022** policy: it ranks ${P3_BM25 === P3_VEC ? `#${P3_BM25} in both lists` : `#${P3_BM25} and #${P3_VEC}`}. It looks relevant, but it is out of date.`,
      analogy: "One assistant checks the card catalogue word by word; another walks the shelves looking for books on the same subject.",
      detail:
        "- **BM25** scores exact term matches: great for names, product codes, error messages, numbers. It misses paraphrases (“joiner” vs “new employee”).\n- **Vector search** compares {{embedding|embeddings}}: great for paraphrases and synonyms, weaker on exact identifiers.\n\nRunning both is {{hybrid-search|hybrid search}}. Similarity alone cannot know a document is superseded: that needs metadata (next step).",
      stage: cards(
        [
          { id: "q-zone", label: "Search with", icon: "search", tone: "violet", cards: [{ id: "q-rewrite", title: "Rewritten question", sub: "+ HyDE + phrasings", tone: "violet" }] },
          { id: "keyword", label: "Keyword catalogue (BM25)", icon: "search", tone: "amber", cards: BM25_ALL.slice(0, TOP_N).map(kCard) },
          { id: "meaning", label: "Meaning shelf (vectors)", icon: "shelf", tone: "blue", cards: VEC_ALL.slice(0, TOP_N).map(vCard) },
        ],
        "top 5 from each search · BM25 scores and cosines are on different scales",
      ),
      highlight: ["rewriter", "bm25", "vdb"],
      packets: [
        { from: "rewriter", to: "bm25", label: "BM25: query terms", sub: "vacation days new employees …", tone: "amber" },
        { from: "rewriter", to: "vdb", label: `q = [${Q_REWRITE.join(", ")}]`, tone: "blue" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: "Top 5 from each search (no filter)",
        columns: ["#", "BM25", "score", "Vector", "cosine"],
        rows: Array.from({ length: TOP_N }, (_, i) => [i + 1, `${BM25_ALL[i].id} ${t(BM25_ALL[i].id)}`, f(BM25_ALL[i].score), `${VEC_ALL[i].id} ${t(VEC_ALL[i].id)}`, f(VEC_ALL[i].score, 3)]),
        highlightRow: Math.min(P3_BM25, P3_VEC) - 1,
        caption: `p3 (2022, outdated) ranks #${P3_BM25} in BM25 and #${P3_VEC} in vectors.`,
      },
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
      interviewTip: "Give a concrete example of what each side misses: BM25 misses “joiner” ≈ “new employee”; vectors blur an exact code like “ERR-4031”.",
    },
    // 4 ─────────────────────────────────────────────────────────────
    {
      id: "filter",
      title: "Filter out stale pages",
      simple: "Out-of-date or off-limits pages are removed before ranking, using labels stored with each page.",
      explain: `Every chunk carries labels (its {{metadata-filter|metadata}}: year, team, who may read it). A filter keeps only year = ${FILTER_YEAR}, so the 2022 policy leaves both lists and the next-best pages move up. The same trick enforces **permissions**: people must only find pages they are allowed to read.`,
      analogy: "The librarian pulls last edition's copies off the shelf before you start browsing.",
      detail:
        "Filter **inside** the vector DB query (pre-filter) where possible. Filtering after taking the top-k (post-filter) can leave you with too few results, or none.\n\nFreshness and access control are the two classic reasons. Leaking a document the user may not see is a security bug, not a relevance bug.",
      stage: cards(
        [
          { id: "keyword", label: "Keyword catalogue (BM25)", icon: "search", tone: "amber", cards: BM25_F.slice(0, TOP_N).map(kCard) },
          { id: "meaning", label: "Meaning shelf (vectors)", icon: "shelf", tone: "blue", cards: VEC_F.slice(0, TOP_N).map(vCard) },
          {
            id: "filtered",
            label: `Filtered out (year ≠ ${FILTER_YEAR})`,
            icon: "tray",
            tone: "rose",
            cards: [
              { id: "k-p3", title: t("p3"), sub: "year 2022 · superseded", tone: "amber", struck: true },
              { id: "p3", title: t("p3"), sub: "year 2022 · superseded", tone: "blue", struck: true },
            ],
          },
        ],
        `filter: year = ${FILTER_YEAR} · ${CHUNKS.length - POOL.length} of ${CHUNKS.length} chunks removed before ranking`,
      ),
      highlight: ["bm25", "vdb"],
      packets: [
        { from: "rewriter", to: "vdb", label: `filter year = ${FILTER_YEAR}`, tone: "rose" },
        { from: "rewriter", to: "bm25", label: `filter year = ${FILTER_YEAR}`, tone: "rose" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: "Chunks and their metadata",
        columns: ["Chunk", "year", "kept?"],
        rows: CHUNKS.map((c) => [`${c.id} ${c.title}`, c.year, c.year === FILTER_YEAR ? "yes" : "filtered"]),
      },
      log: CHUNKS.filter((c) => c.year !== FILTER_YEAR).map((c) => ({ tone: "rose" as const, cells: { stage: "filter", doc: `${c.id} ${c.title}`, score: "", detail: `year ${c.year} ≠ ${FILTER_YEAR}` } })),
      interviewTip: "Mention access control as a metadata filter. Interviewers love hearing that permissions are enforced at retrieval time, not in the prompt.",
    },
    // 5 ─────────────────────────────────────────────────────────────
    {
      id: "fuse",
      title: "Merge the two lists with RRF",
      simple: "Each page earns points for ranking high in each list; pages near the top of both win.",
      explain: `The two lists use different scoring scales, so we use places instead of scores. {{rrf|Reciprocal Rank Fusion}} gives each page 1 / (60 + its place) from every list it appears in, then adds them up. The top ${TOP_N} become the shortlist **A–E**.`,
      analogy: "Two judges rank the same contestants with different scoring sheets. Instead of adding incompatible points, you add up how high each contestant placed.",
      detail: `RRF needs no score normalisation and no tuning to start, and k = 60 stops a single #1 from dominating. Here ${FUSED[0].id} and ${FUSED[1].id} tie on ${f(FUSED[0].score, 4)} because each is #1 in one list and #2 in the other. ${DROPPED_RRF.map((x) => `${x.id} (${f(x.score, 4)})`).join(", ")} just misses the shortlist.\n\nMulti-query results (step 2) are merged the same way: every query's ranked list is one more list in the sum.`,
      stage: cards(
        [
          { id: "keyword", label: "Keyword catalogue (BM25)", icon: "search", tone: "amber", cards: BM25_F.slice(0, TOP_N).map(kCard) },
          {
            id: "shortlist",
            label: "Shortlist (RRF)",
            icon: "check",
            tone: "violet",
            cards: CANDIDATES.map((c) => shortlistCard(c.id, f(c.score, 4), `bm25 #${LISTS[0].indexOf(c.id) + 1 || "—"} · vector #${LISTS[1].indexOf(c.id) + 1 || "—"}`)),
          },
          { id: "missed", label: "Missed the cut", icon: "tray", tone: "slate", cards: DROPPED_RRF.map((x): Card => ({ id: x.id, title: t(x.id), sub: `RRF ${f(x.score, 4)} · rank ${FUSED.indexOf(x) + 1}`, tone: "blue", struck: true })) },
        ],
        "RRF score = 1/(60 + BM25 place) + 1/(60 + vector place)",
      ),
      highlight: ["bm25", "vdb", "fusion"],
      packets: [
        { from: "bm25", to: "fusion", label: `top ${TOP_N} ids (year=${FILTER_YEAR})`, tone: "amber" },
        { from: "vdb", to: "fusion", label: `top ${TOP_N} ids (year=${FILTER_YEAR})`, tone: "blue" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: "Fused ranking",
        columns: ["", "Chunk", "BM25 rank", "Vector rank", "RRF"],
        rows: FUSED.map((x, i) => [i < TOP_N ? LETTERS[i] : "—", `${x.id} ${t(x.id)}`, LISTS[0].indexOf(x.id) + 1 || "—", LISTS[1].indexOf(x.id) + 1 || "—", f(x.score, 4)]),
        caption: `Top ${TOP_N} become candidates A–E for the re-ranker.`,
      },
      deeper: {
        math: [
          "RRF(d) = Σ_lists 1 / (k + rank_list(d)),  k = 60",
          `RRF(${FUSED[0].id}) = ${LISTS.map((l) => (l.includes(FUSED[0].id) ? `1/(60+${l.indexOf(FUSED[0].id) + 1})` : "0")).join(" + ")} = ${f(FUSED[0].score, 5)}`,
        ],
        code: {
          lang: "python",
          src: `
def rrf(lists, k=60):
    score = defaultdict(float)
    for ranked in lists:
        for rank, doc in enumerate(ranked, start=1):
            score[doc] += 1 / (k + rank)
    return sorted(score, key=score.get, reverse=True)`,
        },
      },
      log: FUSED.slice(0, TOP_N).map((x, i) => ({ tone: "violet" as const, cells: { stage: `rrf ${LETTERS[i]}`, doc: `${x.id} ${t(x.id)}`, score: f(x.score, 4), detail: `bm25 #${LISTS[0].indexOf(x.id) + 1 || "—"} · vec #${LISTS[1].indexOf(x.id) + 1 || "—"}` } })),
      interviewTip: "Explain why you fuse ranks, not scores: BM25 and cosine live on different, query-dependent scales.",
    },
    // 6 ─────────────────────────────────────────────────────────────
    {
      id: "rerank",
      title: "Re-rank A–E with a careful reader",
      simple: "A slower, smarter model reads the question with each shortlisted page and re-orders them.",
      explain: `The first searches were fast because each page's meaning numbers were worked out in advance. A {{cross-encoder}} (a model that reads the question and one page **together**) is far more accurate, but too slow for the whole library, so it only reads the shortlist. Watch the cards re-order: ${RERANKED[0].letter} (${t(RERANKED[0].id)}) moves to the top.`,
      analogy: "The first round is a quick CV scan; the re-ranker is the interview. You only interview the shortlist.",
      detail:
        "First-stage search uses a {{bi-encoder}}: query and documents are embedded separately, so document vectors are precomputed and lookup is cheap. The query and chunk never “see” each other.\n\nA cross-encoder runs one model pass per (query, chunk) pair and outputs a relevance score. Re-rank the top ~20–100, not the whole corpus. The logits here are made up for the demo; the sigmoid and sorting are real.",
      stage: cards(
        [
          Q_ZONE(`“${REWRITTEN}”`),
          { id: "shortlist", label: "Shortlist, re-ranked", icon: "librarian", tone: "green", cards: RERANKED.map((r) => shortlistCard(r.id, f(r.ce, 3), `relevance · was #${r.first}`, r.ce > 0.5 ? "green" : "slate")) },
        ],
        "relevance 0–1 from the cross-encoder · the cards moved to their new order",
      ),
      highlight: ["fusion", "reranker"],
      packets: [
        { from: "fusion", to: "reranker", label: "5 × (query, chunk) pairs", tone: "violet" },
        { from: "reranker", to: "reranker", label: "score each pair", tone: "green" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: "Before → after re-ranking",
        columns: ["New", "Cand.", "Chunk", "Was", "Relevance"],
        rows: RERANKED.map((r, i) => [i + 1, r.letter, `${r.id} ${t(r.id)}`, `#${r.first}`, f(r.ce, 3)]),
        highlightRow: 0,
        caption: "Relevance = sigmoid(cross-encoder logit).",
      },
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
      interviewTip: "If asked why not use the cross-encoder for everything: cost is one model pass per document, so it only scales to a shortlist.",
    },
    // 7 ─────────────────────────────────────────────────────────────
    {
      id: "assemble",
      title: "Pack a short, tidy context",
      simple: "Only the best pages that fit the space go into the prompt; copies and extras are left out.",
      explain: `The prompt has limited room, and every extra {{token}} (word piece) costs money and time. The FAQ is a near copy of the 2024 policy, so it adds nothing and is dropped. The pages that fit a ${BUDGET}-token budget go in, best first: ${USED} tokens used.`,
      analogy: "Packing a carry-on bag: no two copies of the same shirt, and only what fits.",
      detail: `The context builder:\n\n- **Dedupes**: near-identical vectors (cos ≥ ${DEDUPE_AT}) add nothing.\n- **Fits a budget**: here ${BUDGET} tokens for evidence, leaving room for instructions and the answer.\n- **Orders**: best evidence first, each chunk tagged with its id so the answer can cite it.\n\nModels tend to use the start and end of a long context more reliably than the middle (“lost in the middle”), so a short, well-ordered context usually beats a long one.`,
      stage: cards(
        [
          { id: "context", label: `Context (≤ ${BUDGET} tokens)`, icon: "box", tone: "cyan", cards: KEPT.map((k): Card => ({ id: k.id, title: t(k.id), sub: `${k.tokens} tokens · relevance ${f(k.ce, 2)}`, tone: "cyan" })) },
          {
            id: "left-out",
            label: "Left out",
            icon: "tray",
            tone: "slate",
            cards: SLOTS.filter((s) => s.status !== "kept").map((s): Card => ({ id: s.id, title: t(s.id), sub: s.status.replace("dropped: ", "").slice(0, 50), score: `${s.tokens} tok`, tone: "slate", struck: true })),
          },
        ],
        `${KEPT.length} chunks kept · ${USED} of ${BUDGET} tokens used`,
      ),
      highlight: ["reranker", "context"],
      packets: [{ from: "reranker", to: "context", label: `${RERANKED.length} ranked chunks`, tone: "green" }],
      viz: [
        {
          only: "interview",
          kind: "table",
          title: "Context decisions",
          columns: ["Chunk", "Tokens", "Decision"],
          rows: SLOTS.map((s) => [`${s.id} ${t(s.id)}`, s.tokens, s.status]),
        },
        {
          only: "interview",
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
      interviewTip: "“More context is better” is the wrong answer. Talk about dedupe, budget, ordering and lost-in-the-middle.",
    },
    // 8 ─────────────────────────────────────────────────────────────
    {
      id: "generate",
      title: "Answer with citations, then check each claim",
      simple: "The AI answers from the packed pages, marks where each fact came from, and we check every claim.",
      explain: `Each sentence points to its source page with a sticky note. Checking claim by claim, ${SUPPORTED} of ${CLAIMS.length} are backed by a page. The last one (“paid out at year end”) is in no page at all: a {{hallucination}} (made up). {{faithfulness|Faithfulness}} = ${SUPPORTED} / ${CLAIMS.length} = **${f(FAITHFULNESS)}**.`,
      analogy: "An essay with footnotes: a sentence with no footnote is a sentence you cannot check.",
      detail:
        "Faithfulness (groundedness) = supported claims / total claims. It measures whether the answer sticks to the **retrieved context**, not whether the claim happens to be true in the world.\n\nUsually an LLM judge extracts the claims and checks each against the context. Validate the judge against human labels first, and fix its model and prompt version so scores stay comparable.",
      stage: cards(
        [
          Q_ZONE(`“${REWRITTEN}”`),
          { id: "context", label: "Context", icon: "box", tone: "cyan", cards: KEPT.map((k): Card => ({ id: k.id, title: t(k.id), sub: `${k.tokens} tokens`, tone: "cyan", badge: BADGE.get(k.id) })) },
          { id: "answer", label: "Answer", icon: "answer", tone: "green", text: ANSWER_TEXT },
          {
            id: "check",
            label: "Claim check",
            icon: "check",
            tone: FAITHFULNESS === 1 ? "green" : "rose",
            cards: CLAIMS.map((c, i): Card => ({ id: `claim-${i}`, title: c.text.length > 28 ? `${c.text.slice(0, 26)}…` : c.text, sub: c.source && inContext.has(c.source) ? `backed by [${BADGE.get(c.source)}]` : "no source: made up", tone: c.source && inContext.has(c.source) ? "green" : "rose", struck: !(c.source && inContext.has(c.source)) })),
          },
        ],
        `faithfulness = ${SUPPORTED} / ${CLAIMS.length} = ${f(FAITHFULNESS)}`,
      ),
      highlight: ["context", "llm"],
      packets: [
        { from: "context", to: "llm", label: `prompt ≈ ${SYS_TOKENS + Q_TOKENS + USED} tokens`, tone: "cyan" },
        { from: "llm", to: "eval", label: `answer + ${KEPT.map((k) => `[${k.id}]`).join(" ")}`, tone: "green" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: "Claim-level check",
        columns: ["Claim", "Source", "Supported?"],
        rows: CLAIMS.map((c) => [c.text, c.source ?? "—", c.source && inContext.has(c.source) ? "yes" : "NO"]),
        highlightRow: CLAIMS.length - 1,
      },
      deeper: {
        math: ["faithfulness = supported claims / total claims", `= ${SUPPORTED} / ${CLAIMS.length} = ${f(FAITHFULNESS)}`],
      },
      log: CLAIMS.map((c) => ({ tone: (c.source && inContext.has(c.source) ? "green" : "rose") as Tone, cells: { stage: "claim", doc: c.text, score: c.source && inContext.has(c.source) ? "1" : "0", detail: c.source ? `cites ${c.source}` : "no source" } })),
      interviewTip: "Separate “was the right evidence retrieved?” from “did the answer stick to it?”. They fail for different reasons and have different fixes.",
    },
    // 9 ─────────────────────────────────────────────────────────────
    {
      id: "evaluate",
      title: "Measure retrieval on a test set",
      simple: "Keep a list of real questions with known right pages, and score the search on them after every change.",
      explain: `This list is a **golden set**. {{recall|Recall}} asks: did we find the right pages at all? {{mrr|MRR}} asks: how high was the first right page? {{ndcg|NDCG}} asks: were the most useful pages highest? Here recall is ${f(MEAN.recall)}, but the holidays question finds its page only at #${EVAL[2].ranked.indexOf("p8") + 1}, pulling MRR down to ${f(MEAN.mrr)}.`,
      analogy: "Unit tests for search: a fixed set of questions you re-run every time you change anything.",
      detail: `Score the ranked results @${K}:\n\n- {{recall|Recall@${K}}}: share of the relevant chunks that made the top ${K}.\n- {{precision|Precision@${K}}}: share of the top ${K} that is relevant (capped when a question has fewer than ${K} relevant chunks).\n- {{mrr|MRR}}: mean of 1 / rank of the first relevant result.\n- {{ndcg|NDCG}}: graded relevance with a log position discount, scaled so a perfect order = 1.\n\nRun it on every change (new chunker, embedding model, prompt) like a regression suite.`,
      stage: {
        kind: "viz",
        viz: [
          {
            kind: "table",
            title: `Golden set: retrieval @${K}`,
            columns: ["Question", "Recall", "RR", "NDCG"],
            rows: [...EVAL.map((e) => [e.q, f(e.recall), f(e.rr), f(e.ndcg, 2)]), ["mean", f(MEAN.recall), f(MEAN.mrr), f(MEAN.ndcg, 2)]],
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
      },
      highlight: ["llm", "eval"],
      packets: [{ from: "llm", to: "eval", label: `${EVAL.length} test questions`, tone: "rose" }],
      viz: {
        only: "interview",
        kind: "table",
        title: `Precision@${K} too`,
        columns: ["Question", "Prec."],
        rows: [...EVAL.map((e) => [e.q, f(e.precision)]), ["mean", f(MEAN.precision)]],
        caption: `Precision@${K} looks low because each question has only 1–2 relevant chunks.`,
      },
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
    // 10 ────────────────────────────────────────────────────────────
    {
      id: "feedback",
      title: "Close the loop",
      simple: "Collect the answers users disliked, sort them by what broke, fix the biggest group, add them to the tests.",
      explain: `Thumbs-down clicks and “that's wrong” replies are the best test cases. Tag each failure by **where** it broke. Here retrieval misses are the biggest group (${Math.round((FAILURES[0].value / FAIL_TOTAL) * 100)}% of ${FAIL_TOTAL}), so fix those first, and add each failing question to the golden set so it can never silently break again.`,
      analogy: "The librarian keeps a notebook of every question they couldn't answer well — and that notebook decides what to reorganise next.",
      detail:
        "Keep the loop honest: re-run the full golden set after each fix, compare against the previous run, and only ship changes that improve the target metric without regressing others. Online, confirm with feedback rates and A/B tests.",
      stage: {
        kind: "viz",
        viz: [
          { kind: "bars", title: "Where answers broke (example week)", items: FAILURES.map((x) => ({ label: x.label, value: x.value, tone: x.tone })), format: "int", caption: "Example counts for illustration." },
          { kind: "table", title: "Fix per group", columns: ["Failure", "Share", "Fix"], rows: FAILURES.map((x) => [x.label, `${Math.round((x.value / FAIL_TOTAL) * 100)}%`, x.fix]) },
        ],
      },
      highlight: ["eval", "feedback", "rewriter"],
      packets: [
        { from: "eval", to: "feedback", label: `${FAIL_TOTAL} failures tagged`, tone: "amber" },
        { from: "feedback", to: "rewriter", label: "joiner → new employee", sub: "+ new eval cases", tone: "violet" },
      ],
      deeper: {
        text: "Typical buckets map to stages: retrieval miss → query rewriting, hybrid search, chunking; stale document → ingestion upserts and version metadata; unsupported claim → prompt and faithfulness checks.",
      },
      log: FAILURES.map((x) => ({ tone: x.tone, cells: { stage: "feedback", doc: x.label, score: `${x.value}`, detail: x.fix } })),
      interviewTip: "Say how a production failure becomes a regression test. That is the difference between a demo and a maintained system.",
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
