import type { CardsStage, Scenario, Tone } from "../engine/types";
import { cosine, f, sum, vec } from "../engine/math";

/* ------------------------------------------------------------------ *
 * RAG on a "PDF Q&A" example: an employee handbook. Toy 4-dim vectors
 * [leave, pay, conduct, IT] stand in for a real embedding model. Scores
 * and token counts are computed, never typed in.
 *
 * The centre stage tells one library story with cards that keep their
 * ids, so they fly between zones: the PDF is cut into chunk cards, the
 * cards go on shelves, the librarian pulls the best ones, they land in
 * the prompt tray, and the answer cites them with sticky notes.
 * ------------------------------------------------------------------ */

/** Rough token estimate: ~0.75 English words per token (≈ 1.33 tokens per word). Real counts come from the model's tokenizer. */
const approxTokens = (text: string) => Math.ceil(text.trim().split(/\s+/).length * (4 / 3));

const PDF = "handbook.pdf";
const CHUNKS = [
  { id: "c1", page: 4, section: "Annual leave", text: "Full-time employees receive 20 days of paid annual leave per calendar year, accrued monthly from their start date.", v: [0.95, 0.1, 0.05, 0.0] },
  { id: "c2", page: 4, section: "Carry-over", text: "Up to 5 unused annual leave days may be carried into the next year; any remaining days lapse on 31 March.", v: [0.8, 0.1, 0.25, 0.0] },
  { id: "c3", page: 6, section: "Sick leave", text: "Sick leave is separate from annual leave: 10 paid days per year, with a doctor's note after 3 consecutive days.", v: [0.7, 0.1, 0.1, 0.15] },
  { id: "c4", page: 9, section: "Payroll", text: "Salaries are paid on the last working day of each month by bank transfer.", v: [0.05, 0.95, 0.05, 0.05] },
  { id: "c5", page: 12, section: "Code of conduct", text: "Employees must report any conflict of interest to their manager in writing.", v: [0.0, 0.05, 0.95, 0.05] },
  { id: "c6", page: 15, section: "Laptops", text: "IT issues every new joiner a laptop; lost devices must be reported within 24 hours.", v: [0.05, 0.0, 0.1, 0.95] },
].map((c) => ({ ...c, tokens: approxTokens(c.text) }));

const PAGES = [
  { page: 4, heading: "Leave", chars: 2140 },
  { page: 6, heading: "Sick leave", chars: 1630 },
  { page: 9, heading: "Pay", chars: 1210 },
  { page: 12, heading: "Conduct", chars: 1880 },
  { page: 15, heading: "Equipment", chars: 990 },
];

const QUESTION = "How many days of annual leave do new employees get?";
const QV = [0.9, 0.15, 0.05, 0.05];
const K = 3;
const THRESHOLD = 0.8;
const RANKED = CHUNKS.map((c) => ({ ...c, score: cosine(QV, c.v) })).sort((a, b) => b.score - a.score);
const TOP = RANKED.slice(0, K).filter((c) => c.score >= THRESHOLD);
const scoreOf = (id: string) => RANKED.find((c) => c.id === id)!.score;

// Prompt assembly
const SYSTEM =
  "You answer questions about the company handbook. Use only the numbered context below. Cite every claim like [1]. If the context does not contain the answer, say you could not find it.";
const CONTEXT = TOP.map((c, i) => `[${i + 1}] (${PDF} p.${c.page}, ${c.section}) ${c.text}`).join("\n");
const PROMPT_TOKENS = { system: approxTokens(SYSTEM), context: approxTokens(CONTEXT), question: approxTokens(QUESTION) };
const PROMPT_TOTAL = sum(Object.values(PROMPT_TOKENS));
const ANSWER_BUDGET = 300;
const WINDOW = 8000; // example window for the budget picture

/** Citation number of a chunk = its position in the prompt's context (1-based). */
const citeOf = (id: string) => TOP.findIndex((c) => c.id === id) + 1;
const ANSWER_LINES = [
  { text: `New full-time employees get 20 days of paid annual leave per calendar year, accrued monthly from their start date [${citeOf("c1")}].`, cites: [citeOf("c1")] },
  { text: `Up to 5 unused days can be carried over to the next year [${citeOf("c2")}].`, cites: [citeOf("c2")] },
];
const cited = (n: number) => TOP[n - 1];
const CITED_IDS = new Set(ANSWER_LINES.flatMap((l) => l.cites).map((n) => cited(n).id));
const UNUSED = TOP.filter((c) => !CITED_IDS.has(c.id));
const ANSWER_TEXT = ANSWER_LINES.map((l) => l.text).join(" ");

// Out-of-scope question
const OOS = "Can I bring my dog to the office?";
const OOS_V = [0.1, 0.15, 0.6, 0.6];
const OOS_RANKED = CHUNKS.map((c) => ({ id: c.id, section: c.section, score: cosine(OOS_V, c.v) })).sort((a, b) => b.score - a.score);
const OOS_PASS = OOS_RANKED.filter((c) => c.score >= THRESHOLD).length;

const scoreTone = (s: number): Tone => (s >= THRESHOLD ? "green" : "slate");

// ---------- the library cards (same ids in every step, so they fly between zones) ----------
type Card = NonNullable<CardsStage["zones"][number]["cards"]>[number];
const short = (s: string, n = 48) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const hint = (v: number[]) => `[${v.map((x) => f(x, 1)).join(", ")}]`;
const chunkCard = (c: (typeof CHUNKS)[number], extra: Partial<Card> = {}): Card => ({ id: c.id, title: `p.${c.page} ${c.section}`, sub: short(c.text), tone: "blue", ...extra });
const shelfCard = (c: (typeof CHUNKS)[number], extra: Partial<Card> = {}): Card => chunkCard(c, { sub: `vector ${hint(c.v)}`, tone: "violet", ...extra });
const pdfCard = (sub: string): Card => ({ id: "pdf", title: PDF, sub, tone: "slate" });
const qCard = (sub: string): Card => ({ id: "q", title: "the question", sub, tone: "cyan" });
const LEAVE = CHUNKS.filter((c) => c.v[0] >= 0.5);
const OTHER = CHUNKS.filter((c) => c.v[0] < 0.5);
/** Shelves, split so no zone holds more than 5 cards. */
const shelves = (keep: (c: (typeof CHUNKS)[number]) => boolean, card: (c: (typeof CHUNKS)[number]) => Card = (c) => shelfCard(c)): CardsStage["zones"] => [
  { id: "shelf-a", label: "shelf: leave", icon: "shelf", tone: "violet", cards: LEAVE.filter(keep).map(card) },
  { id: "shelf-b", label: "shelf: other", icon: "shelf", tone: "violet", cards: OTHER.filter(keep).map(card) },
];
const QV_HINT = `vector ${hint(QV)}`;
const inTop = new Set(TOP.map((c) => c.id));
const pulled = (c: (typeof CHUNKS)[number], extra: Partial<Card> = {}): Card => shelfCard(c, { score: f(scoreOf(c.id), 2), tone: "amber", ...extra });

const scenario: Scenario = {
  id: "rag",
  title: "RAG fundamentals",
  tagline: "Look it up first, then answer from what you found.",
  imagine:
    "Imagine asking a very well-read friend about your company's leave policy. They have read millions of books, but never your handbook, so they guess. Now imagine they first walk to the shelf, pull out the right page, and answer while pointing at it. That second friend is RAG.",
  recap: [
    "An AI model doesn't know your documents, so **RAG looks them up first** and puts the best pieces in front of it.",
    "Ahead of time, documents are cut into small **chunks**, turned into number lists (vectors) and stored on a shelf.",
    "Per question, the closest chunks are pulled, the model answers **only from them** and cites them, or says it couldn't find it.",
  ],
  overview: {
    plain:
      "RAG means the app looks things up before the AI answers. Your documents are cut into small pieces and stored so they can be searched by meaning. When a question comes in, the closest pieces are handed to the model, which answers from them and says which page each fact came from.",
    definition:
      "{{rag|Retrieval-augmented generation}} gives a language model an open book. Before answering, the app searches your documents for the most relevant passages and pastes them into the prompt. The model then answers **from those passages**, with citations — instead of from whatever it half-remembers from training.\n\nIt has two halves: **ingest** (load → chunk → embed → store, done ahead of time) and **query** (retrieve → augment → generate, done per question).",
    analogy:
      "A **librarian**. You ask a question; the librarian doesn't answer from memory — they walk to the shelves, pull the three most relevant pages, read them, and answer while pointing at the page numbers.",
    facts: [
      ["Ingest", "load → chunk → embed → store (offline, batch)"],
      ["Query", "retrieve → augment → generate (online, per question)"],
      ["Fixes", "stale knowledge, private data, {{hallucination|hallucinations}} (reduces, doesn't eliminate)"],
      ["Doesn't fix", "bad retrieval: if the right chunk isn't found, the answer can't be right"],
      ["Must-have", "citations back to source + page, and an “I don't know” path"],
      ["vs fine-tuning", "RAG adds knowledge you can update daily; fine-tuning mainly changes behaviour/style"],
    ],
    whereUsed: "Internal knowledge assistants, customer-support bots, PDF and contract Q&A, search-with-answers over docs, and coding assistants that look up your repository.",
  },
  objects: [
    { id: "pdf", kind: "doc", label: "PDF", sub: PDF, at: [0, 0], tone: "slate" },
    { id: "loader", kind: "tool", label: "Loader", sub: "parse text + pages", at: [2.4, 0], tone: "violet" },
    { id: "chunks", kind: "table", label: "Chunks", sub: "text + metadata", at: [4.8, 0], tone: "blue" },
    { id: "embedder", kind: "layer", label: "Embedding model", sub: "text → vector", at: [7.2, 0], tone: "violet" },
    { id: "vdb", kind: "vectordb", label: "Vector store", sub: "vectors + metadata", at: [9.6, 0], tone: "blue" },
    { id: "user", kind: "user", label: "Employee", sub: "asks a question", at: [0, 3.6], tone: "cyan" },
    { id: "app", kind: "server", label: "RAG app", sub: "orchestrates", at: [2.4, 3.6], tone: "cyan" },
    { id: "retriever", kind: "search", label: "Retriever", sub: `top-k = ${K}`, at: [4.8, 3.6], tone: "amber" },
    { id: "prompt", kind: "doc", label: "Augmented prompt", sub: "rules + context + Q", at: [7.2, 3.6], tone: "amber" },
    { id: "llm", kind: "llm", label: "LLM", sub: "generates", at: [9.6, 3.6], tone: "green" },
    { id: "answer", kind: "chat", label: "Answer", sub: "with citations", at: [12, 3.6], tone: "green" },
  ],
  links: [
    { id: "i1", from: "pdf", to: "loader" },
    { id: "i2", from: "loader", to: "chunks" },
    { id: "i3", from: "chunks", to: "embedder" },
    { id: "i4", from: "embedder", to: "vdb" },
    { id: "q1", from: "user", to: "app" },
    { id: "q2", from: "app", to: "retriever" },
    { id: "q3", from: "retriever", to: "embedder" },
    { id: "q4", from: "retriever", to: "vdb" },
    { id: "q5", from: "retriever", to: "prompt" },
    { id: "q6", from: "prompt", to: "llm" },
    { id: "q7", from: "llm", to: "answer" },
  ],
  logTitle: "RAG trace",
  logColumns: [
    { key: "stage", label: "Stage", width: "16%" },
    { key: "item", label: "Item" },
    { key: "score", label: "Score / size", align: "right", width: "15%" },
    { key: "note", label: "Note" },
  ],
  steps: [
    // 1 ─────────────────────────────────────────────────────────────
    {
      id: "problem",
      title: "The model hasn't read your PDF",
      simple: "An AI model only knows what it read in training. It has never seen your company's handbook.",
      explain:
        "Ask a plain chatbot how much leave new employees get and it can only guess from the internet. It sounds sure, but the number may be wrong. A confident made-up answer is called a {{hallucination}}. {{rag|RAG}} (retrieval-augmented generation) fixes this by looking the answer up first.",
      analogy: "A brilliant new colleague on day one: smart, but hasn't read the handbook yet.",
      detail:
        "{{rag|Retrieval-augmented generation}} gives a language model an open book. Before answering, the app searches your documents for the most relevant passages and pastes them into the prompt. The model then answers **from those passages**, with citations, instead of from whatever it half-remembers from training.\n\nIt has two halves: **ingest** (load → chunk → embed → store, done ahead of time) and **query** (retrieve → augment → generate, done per question). No model weights change: that is the key difference from fine-tuning.",
      stage: {
        kind: "cards",
        zones: [
          { id: "ask", label: "employee asks", icon: "person", tone: "cyan", text: QUESTION },
          { id: "llm", label: "AI model alone", icon: "llm", tone: "rose", text: "“Usually around 15 to 25 days.” (a guess: it has never seen the handbook)" },
          { id: "library", label: "your documents", icon: "doc", tone: "slate", cards: [pdfCard("unread by the model")] },
        ],
        note: "the right answer is sitting in the PDF, but the model can't see it",
      },
      highlight: ["user", "llm", "pdf"],
      packets: [{ from: "user", to: "app", label: "“How many days of annual leave…?”", tone: "cyan" }],
      log: [{ tone: "rose", cells: { stage: "no RAG", item: QUESTION, score: "guess", note: "model has never seen the handbook" } }],
      interviewTip: "Open with the one-line definition: retrieve relevant text, put it in the prompt, generate from it. Then say what it does not do: it does not retrain the model.",
    },
    // 2 ─────────────────────────────────────────────────────────────
    {
      id: "load",
      title: "Load the PDF, keep the page numbers",
      simple: "First the app reads the text out of the PDF, page by page, and remembers which page each part came from.",
      explain: `A loader (a small program that reads files) pulls the text out of **${PDF}**, ${PAGES.length} pages with policy text. It keeps the file name and page number with every piece. Those page numbers are what the answer will point to at the end.`,
      analogy: "The librarian catalogues a new book: the title, the chapters, and which page each topic is on.",
      detail:
        "This step quietly decides quality. Scanned pages have no text layer and need OCR, tables need a layout-aware parser, and headers/footers repeated on every page should be stripped, or they pollute every search.\n\nMost real RAG failures start here, not in the model: if the text comes out garbled, nothing downstream can recover it.",
      stage: {
        kind: "cards",
        zones: [
          { id: "library", label: "your documents", icon: "doc", tone: "slate", cards: [pdfCard(`${PAGES.length} pages with text`)] },
          {
            id: "pages",
            label: "pages read",
            icon: "doc",
            tone: "slate",
            cards: PAGES.map((p) => ({ id: `p${p.page}`, title: `page ${p.page}: ${p.heading}`, sub: `${p.chars.toLocaleString("en-US")} characters`, tone: "slate" as const })),
          },
        ],
        note: "every piece of text keeps its file name and page number",
      },
      highlight: ["pdf", "loader"],
      packets: [{ from: "pdf", to: "loader", label: `${PDF}`, sub: `${PAGES.length} relevant pages`, tone: "slate" }],
      viz: {
        only: "interview",
        kind: "table",
        title: "Pages extracted",
        columns: ["page", "heading", "characters"],
        rows: PAGES.map((p) => [p.page, p.heading, p.chars.toLocaleString("en-US")]),
        caption: "Keep page numbers now: the citations at the end depend on them.",
      },
      deeper: {
        code: {
          lang: "python",
          src: `
from pypdf import PdfReader
pages = [
    {"page": i + 1, "text": p.extract_text() or ""}
    for i, p in enumerate(PdfReader("handbook.pdf").pages)
]
# scanned page? extract_text() is empty -> send it to OCR`,
        },
      },
      log: PAGES.map((p) => ({ tone: "slate" as const, cells: { stage: "load", item: `p.${p.page} ${p.heading}`, score: `${p.chars} ch`, note: "text + page kept" } })),
      interviewTip: "Mention parsing problems (scans, tables, headers): most real RAG failures start here, not in the model.",
    },
    // 3 ─────────────────────────────────────────────────────────────
    {
      id: "chunk",
      title: "Cut it into small cards",
      simple: "The text is cut into small pieces, one idea each, like index cards. Each card notes its page.",
      explain: `Each piece is a {{chunk}} (a short slice of a document). Here the handbook becomes **${CHUNKS.length} cards**, one policy paragraph each. Small cards can be matched precisely; each still makes sense on its own.`,
      analogy: "Cutting a cookbook into recipe cards, so you can hand someone exactly the one recipe they asked for.",
      detail: `Every chunk carries **metadata**: source file, page, section. That is what lets the final answer say “${PDF}, page 4”, and lets you filter later (e.g. only HR documents, only this year).\n\nChunk size is a trade-off: too small and a chunk loses its context ("it" refers to what?), too large and it mixes topics and wastes prompt tokens. Common starting points are a few hundred tokens with a small overlap, split on headings or paragraphs. Total here ≈ ${sum(CHUNKS.map((c) => c.tokens))} tokens.`,
      stage: {
        kind: "cards",
        zones: [
          { id: "library", label: "your documents", icon: "doc", tone: "slate", cards: [pdfCard(`cut into ${CHUNKS.length} chunks`)] },
          { id: "cut-a", label: "chunks p.4–6", icon: "scissors", tone: "blue", cards: CHUNKS.filter((c) => c.page <= 6).map((c) => chunkCard(c, { score: `≈${c.tokens} tok` })) },
          { id: "cut-b", label: "chunks p.9–15", icon: "scissors", tone: "blue", cards: CHUNKS.filter((c) => c.page > 6).map((c) => chunkCard(c, { score: `≈${c.tokens} tok` })) },
        ],
        note: "one card per policy paragraph · each card remembers its page",
      },
      highlight: ["loader", "chunks"],
      packets: [{ from: "loader", to: "chunks", label: `${CHUNKS.length} chunks`, sub: "split on headings", tone: "blue" }],
      viz: {
        only: "interview",
        kind: "table",
        title: "Chunks (≈ tokens)",
        columns: ["id", "page", "section", "≈ tokens"],
        rows: CHUNKS.map((c) => [c.id, c.page, c.section, c.tokens]),
        caption: `≈ tokens = words × 4/3, a rule of thumb for English. Total ≈ ${sum(CHUNKS.map((c) => c.tokens))} tokens.`,
      },
      deeper: {
        code: {
          lang: "json",
          src: `
{ "id": "c1", "text": "Full-time employees receive 20 days ...",
  "metadata": { "source": "handbook.pdf", "page": 4, "section": "Annual leave" } }`,
        },
      },
      log: CHUNKS.map((c) => ({ tone: "blue" as const, cells: { stage: "chunk", item: `${c.id} p.${c.page} ${c.section}`, score: `≈${c.tokens} tok`, note: "" } })),
      interviewTip: "Have an opinion on chunk size and overlap, and say you would tune it on real questions rather than guess.",
    },
    // 4 ─────────────────────────────────────────────────────────────
    {
      id: "embed",
      title: "Turn each card into numbers and shelve it",
      simple: "Each card gets a list of numbers that captures its meaning, then goes on a searchable shelf.",
      explain:
        "An {{embedding}} model turns each card's text into a {{vector}} (a list of numbers). Cards with similar meaning get similar numbers, so all the leave cards end up close together. Vector, text and page are stored together in a {{vector-db|vector store}}.",
      analogy: "Shelving library cards by topic, so cards about the same thing sit side by side.",
      detail:
        "This is done **once**, ahead of time (and again only when a document changes). Ingest can be slow; questions must be fast.\n\nThe toy vectors here have 4 labelled numbers (leave, pay, conduct, IT) so you can read them. Real embeddings have hundreds or thousands of numbers with no human-readable meaning. Use stable chunk IDs (document id + position) so re-ingesting an edited PDF replaces old chunks instead of duplicating them.",
      stage: { kind: "cards", zones: [{ id: "library", label: "your documents", icon: "doc", tone: "slate", cards: [pdfCard("indexed")] }, ...shelves(() => true)], note: "vector hint = [leave, pay, conduct, IT] (real vectors have ~1,000 numbers)" },
      highlight: ["chunks", "embedder", "vdb"],
      packets: [
        { from: "chunks", to: "embedder", label: `${CHUNKS.length} texts`, tone: "blue" },
        { from: "embedder", to: "vdb", label: "upsert(id, vector, metadata)", tone: "violet" },
      ],
      viz: {
        only: "interview",
        kind: "matrices",
        title: "Stored vectors (toy dims: leave, pay, conduct, IT)",
        items: [{ name: "vectors", rowLabels: CHUNKS.map((c) => c.id), colLabels: ["leave", "pay", "cond.", "IT"], values: CHUNKS.map((c) => c.v), tone: "violet" }],
        format: "fixed2",
        caption: "Real vectors have hundreds of dimensions with no human-readable meaning; these are labelled only to make the demo readable.",
      },
      deeper: {
        code: {
          lang: "python",
          src: `
vectors = embed([c["text"] for c in chunks])      # one batch call
store.upsert([
    {"id": c["id"], "vector": v, "metadata": c["metadata"], "text": c["text"]}
    for c, v in zip(chunks, vectors)
])`,
        },
      },
      log: CHUNKS.map((c) => ({ tone: "violet" as const, cells: { stage: "upsert", item: `${c.id} → ${vec(c.v)}`, score: "", note: `p.${c.page}` } })),
      interviewTip: "Use stable chunk IDs (e.g. doc id + position) so re-ingesting an edited PDF updates or deletes old chunks instead of duplicating them.",
    },
    // 5 ─────────────────────────────────────────────────────────────
    {
      id: "ask",
      title: "The question becomes numbers too",
      simple: "When someone asks, the question is turned into numbers the same way, so it can be compared with the cards.",
      explain: `An employee asks: **“${QUESTION}”** The app sends it through the **same** embedding model used for the cards. Its numbers point strongly at “leave”, so it will land near the leave cards.`,
      analogy: "The librarian listens to your question and works out which shelf it belongs to.",
      detail:
        "The query must use the same embedding model (and version) as the documents: each model defines its own coordinate system, so comparing vectors from two models is meaningless. If you change embedding models, you must re-embed the whole collection.\n\nThis is the first step of the **query** half, which runs on every question and must be fast (a single embedding call is typically milliseconds to tens of milliseconds).",
      stage: { kind: "cards", zones: [{ id: "ask", label: "employee asks", icon: "person", tone: "cyan", text: QUESTION, cards: [qCard(QV_HINT)] }, ...shelves(() => true)], note: "same embedding model as the cards, so the numbers are comparable" },
      highlight: ["user", "app", "retriever", "embedder"],
      packets: [
        { from: "user", to: "app", label: "“How many days of annual leave…?”", tone: "cyan" },
        { from: "app", to: "retriever", label: `retrieve(question, k=${K})`, tone: "amber" },
        { from: "retriever", to: "embedder", label: "embed(question)", tone: "violet" },
      ],
      viz: {
        only: "interview",
        kind: "bars",
        title: "Question vector",
        items: ["leave", "pay", "conduct", "IT"].map((d, i) => ({ label: d, value: QV[i], tone: i === 0 ? ("green" as const) : ("blue" as const) })),
        max: 1,
        format: "fixed2",
        caption: "Points strongly in the “leave” direction.",
      },
      log: [
        { tone: "cyan", cells: { stage: "question", item: QUESTION, score: `≈${approxTokens(QUESTION)} tok`, note: "" } },
        { tone: "violet", cells: { stage: "embed", item: `q = ${vec(QV)}`, score: "", note: "same model as ingest" } },
      ],
      interviewTip: "If asked what breaks when you upgrade the embedding model: every stored vector must be re-embedded, or search silently degrades.",
    },
    // 6 ─────────────────────────────────────────────────────────────
    {
      id: "retrieve",
      title: `The librarian pulls the best ${K}`,
      simple: `The cards whose numbers are closest to the question are pulled off the shelf: the top ${K}.`,
      explain: `Closeness is measured with {{cosine-similarity|cosine similarity}} (1.00 = same direction, 0 = unrelated). The best card, “${RANKED[0].section}”, scores **${f(RANKED[0].score, 3)}**. Note that “${RANKED[1].section}” comes second: it is related, but it doesn't answer the question.`,
      analogy: "The librarian pulls the three cards that look most like your question. Looking alike isn't the same as answering it.",
      detail: `The vector store compares the question vector with every chunk vector and returns the best ${K}. A minimum score (here ${THRESHOLD}) keeps clearly unrelated chunks out.\n\nRetrieval finds what is **similar**; it is the model's job, guided by the prompt, to use only what is **relevant**. And the generator can only be as good as retrieval: if the right chunk isn't in the top-k, no prompt fixes it. At scale the store uses an approximate index (e.g. HNSW) instead of checking every vector.`,
      stage: {
        kind: "cards",
        zones: [
          { id: "ask", label: "employee asks", icon: "person", tone: "cyan", cards: [qCard(QV_HINT)] },
          { id: "librarian", label: `librarian: top ${K}`, icon: "librarian", tone: "amber", cards: TOP.map((c) => pulled(c)) },
          ...shelves((c) => !inTop.has(c.id), (c) => shelfCard(c, { score: f(scoreOf(c.id), 2), tone: "slate" })),
        ],
        note: `score = cosine similarity with the question · cut-off ${THRESHOLD}`,
      },
      highlight: ["retriever", "vdb"],
      packets: [
        { from: "retriever", to: "vdb", label: `nearest(q, k=${K})`, tone: "amber" },
        { from: "vdb", to: "retriever", label: RANKED.slice(0, K).map((c) => c.id).join(", "), sub: RANKED.slice(0, K).map((c) => f(c.score, 3)).join(" · "), tone: "green" },
      ],
      viz: {
        only: "interview",
        kind: "bars",
        title: "Cosine similarity to the question",
        items: RANKED.map((c, i) => ({ label: `${c.id} ${c.section}`, value: c.score, tone: i < K && c.score >= THRESHOLD ? ("green" as const) : ("slate" as const) })),
        max: 1,
        format: "fixed3",
        caption: `Top ${K} kept: ${TOP.map((c) => c.id).join(", ")}.`,
      },
      deeper: {
        math: [`cos(q, c1) = ${vec(QV)} · ${vec(CHUNKS[0].v)} / (‖q‖·‖c1‖) = ${f(cosine(QV, CHUNKS[0].v), 4)}`, "Choosing k: too small misses evidence; too large dilutes the prompt and costs tokens. Tune it with retrieval metrics (see Advanced RAG)."],
      },
      log: RANKED.map((c, i) => ({ tone: (i < K && c.score >= THRESHOLD ? "green" : "slate") as Tone, cells: { stage: `rank ${i + 1}`, item: `${c.id} p.${c.page} ${c.section}`, score: f(c.score, 3), note: i < K && c.score >= THRESHOLD ? "→ prompt" : "dropped" } })),
      interviewTip: "Say out loud that the generator can only be as good as retrieval. If the right chunk isn't in the top-k, no prompt fixes it.",
    },
    // 7 ─────────────────────────────────────────────────────────────
    {
      id: "augment",
      title: "Put the cards next to the question",
      simple: "The pulled cards, numbered 1, 2, 3, are placed in the prompt together with the question and a few rules.",
      explain: `This is the “augmented” in RAG. The prompt (the text sent to the model) has **rules** (answer only from the cards, cite them, admit if the answer is missing), the **numbered cards** with their pages, then the **question**. About **${PROMPT_TOTAL} tokens** in all.`,
      analogy: "The librarian lays the three pages open on the desk, with sticky notes numbered 1 to 3.",
      detail: `Prompt ≈ ${PROMPT_TOTAL} tokens (system ≈${PROMPT_TOKENS.system}, context ≈${PROMPT_TOKENS.context}, question ≈${PROMPT_TOKENS.question}) + ${ANSWER_BUDGET} reserved for the answer, out of an example ${WINDOW.toLocaleString("en-US")}-token window. Every extra chunk costs money and latency on **every** question, and long noisy context can lower answer quality.\n\nPut the rules in the system message, the evidence in the user message, and number the chunks so citations can be checked in code.`,
      stage: {
        kind: "cards",
        zones: [
          {
            id: "tray",
            label: "prompt tray",
            icon: "tray",
            tone: "amber",
            text: QUESTION,
            cards: [{ id: "rules", title: "rules", sub: "only use the cards · cite [n] · else say so", tone: "slate" as const }, ...TOP.map((c, i) => pulled(c, { badge: String(i + 1) }))],
          },
          ...shelves((c) => !inTop.has(c.id), (c) => shelfCard(c, { tone: "slate" })),
        ],
        note: `rules + ${TOP.length} numbered cards + question ≈ ${PROMPT_TOTAL} tokens`,
      },
      highlight: ["retriever", "prompt"],
      packets: [{ from: "retriever", to: "prompt", label: `${TOP.length} chunks + rules + question`, sub: `≈ ${PROMPT_TOTAL} tokens`, tone: "amber" }],
      viz: [
        {
          only: "interview",
          kind: "chat",
          title: "The prompt that is actually sent",
          messages: [
            { role: "system", text: SYSTEM },
            { role: "user", text: `Context:\n${CONTEXT}\n\nQuestion: ${QUESTION}` },
          ],
        },
        {
          only: "interview",
          kind: "stack",
          title: `Token budget (example ${WINDOW.toLocaleString("en-US")}-token window)`,
          segments: [
            { label: `system ≈${PROMPT_TOKENS.system}`, value: PROMPT_TOKENS.system, tone: "slate" },
            { label: `context ≈${PROMPT_TOKENS.context}`, value: PROMPT_TOKENS.context, tone: "amber" },
            { label: `question ≈${PROMPT_TOKENS.question}`, value: PROMPT_TOKENS.question, tone: "cyan" },
            { label: `answer reserve ${ANSWER_BUDGET}`, value: ANSWER_BUDGET, tone: "green" },
            { label: "unused", value: WINDOW - PROMPT_TOTAL - ANSWER_BUDGET, tone: "blue" },
          ],
          caption: `Prompt ≈ ${PROMPT_TOTAL} tokens + ${ANSWER_BUDGET} reserved for the answer = ${PROMPT_TOTAL + ANSWER_BUDGET} of ${WINDOW.toLocaleString("en-US")}.`,
        },
      ],
      deeper: {
        code: {
          lang: "python",
          src: `
context = "\\n".join(
    f"[{i+1}] ({c.source} p.{c.page}, {c.section}) {c.text}"
    for i, c in enumerate(top_chunks)
)
messages = [
    {"role": "system", "content": RULES},
    {"role": "user", "content": f"Context:\\n{context}\\n\\nQuestion: {question}"},
]`,
        },
      },
      log: [
        { tone: "slate", cells: { stage: "prompt", item: "system rules", score: `≈${PROMPT_TOKENS.system} tok`, note: "" } },
        { tone: "amber", cells: { stage: "prompt", item: `context [1]–[${TOP.length}]`, score: `≈${PROMPT_TOKENS.context} tok`, note: TOP.map((c) => `${c.id}`).join(", ") } },
        { tone: "cyan", cells: { stage: "prompt", item: "question", score: `≈${PROMPT_TOKENS.question} tok`, note: "" } },
        { tone: "green", cells: { stage: "total", item: "prompt tokens", score: `≈${PROMPT_TOTAL}`, note: `+ ${ANSWER_BUDGET} answer reserve` } },
      ],
      interviewTip: "Know the token arithmetic: k chunks × chunk size is paid on every request, so retrieve many, re-rank, and send few.",
    },
    // 8 ─────────────────────────────────────────────────────────────
    {
      id: "generate",
      title: "Answer, with sticky-note citations",
      simple: "The model writes the answer from the cards and marks each fact with the card it came from.",
      explain: `Each [number] links back to a card and its page, so anyone can check it. The “${UNUSED.map((c) => c.section).join(", ")}” card was in the prompt but not used, because it doesn't answer the question. Tying every claim to its source is called {{grounding}}.`,
      analogy: "A good essay with footnotes: every claim points to the page it came from.",
      detail:
        "The LLM writes the answer using the context, tagging each claim with the chunk it came from, and the app turns [1] into a link to the source page.\n\nCitations are not proof by themselves: the model can cite the wrong chunk. Production tips: ask for structured output (answer + list of cited chunk ids) so citations can be validated in code; drop or flag any citation id that wasn't in the context; check that the cited text actually supports the claim (faithfulness); show the quoted passage on hover.",
      stage: {
        kind: "cards",
        zones: [
          { id: "tray", label: "prompt tray", icon: "tray", tone: "amber", cards: TOP.map((c, i) => pulled(c, { badge: String(i + 1), tone: CITED_IDS.has(c.id) ? "green" : "slate", struck: !CITED_IDS.has(c.id) })) },
          { id: "answer", label: "answer", icon: "answer", tone: "green", text: ANSWER_TEXT },
        ],
        note: "sticky notes = citations · the crossed-out card was related but not used",
      },
      highlight: ["prompt", "llm", "answer"],
      packets: [
        { from: "prompt", to: "llm", label: `≈ ${PROMPT_TOTAL} tokens in`, tone: "amber" },
        { from: "llm", to: "answer", label: `answer + ${ANSWER_LINES.flatMap((l) => l.cites).map((n) => `[${n}]`).join(" ")}`, tone: "green" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: "Every claim traced to a source",
        columns: ["claim", "cites", "source"],
        rows: ANSWER_LINES.map((l) => [l.text.replace(/\s*\[\d\]\.?$/, ""), l.cites.map((n) => `[${n}]`).join(" "), l.cites.map((n) => `${PDF} p.${cited(n).page} (${cited(n).id})`).join("; ")]),
      },
      deeper: {
        text: "Production tips: ask for structured output (answer + list of cited chunk ids) so citations can be validated in code; drop or flag any citation id that wasn't in the context; show the quoted passage on hover.",
      },
      log: ANSWER_LINES.map((l) => ({ tone: "green" as const, cells: { stage: "answer", item: l.text.length > 70 ? `${l.text.slice(0, 68)}…` : l.text, score: l.cites.map((n) => `[${n}]`).join(""), note: l.cites.map((n) => `p.${cited(n).page}`).join(", ") } })),
      interviewTip: "Citations are not proof by themselves — the model can cite the wrong chunk. Mention checking that the cited text actually supports the claim (faithfulness).",
    },
    // 9 ─────────────────────────────────────────────────────────────
    {
      id: "not-found",
      title: "When the answer isn't there",
      simple: "If no card is close enough to the question, the honest answer is “I couldn't find that”.",
      explain: `Someone asks **“${OOS}”** The handbook doesn't say. The best card scores only **${f(OOS_RANKED[0].score, 2)}**, below the ${THRESHOLD} cut-off, so no card goes to the model and it answers “I couldn't find that in the handbook” instead of guessing.`,
      analogy: "A good librarian says “we don't have a book on that” rather than inventing one.",
      detail:
        "A RAG system that says “I don't know” when it should is worth far more than one that always sounds confident: guessing is how {{hallucination|hallucinations}} reach users.\n\nTwo safety nets: a retrieval threshold (cheap, coarse; calibrate it per embedding model on labelled examples) and a prompt rule to refuse when the context doesn't contain the answer (catches related-but-unhelpful chunks). Track how often each fires: a rising “not found” rate often means missing documents, not a model problem.",
      stage: {
        kind: "cards",
        zones: [
          { id: "ask", label: "employee asks", icon: "person", tone: "cyan", text: OOS },
          { id: "librarian", label: "librarian", icon: "librarian", tone: "rose", text: `nothing scores ${THRESHOLD} or more` },
          ...shelves(
            () => true,
            (c) => shelfCard(c, { score: f(OOS_RANKED.find((o) => o.id === c.id)!.score, 2), tone: "slate" }),
          ),
          { id: "answer", label: "answer", icon: "answer", tone: "rose", text: "I couldn't find that in the handbook." },
        ],
        note: `scores for the new question · ${OOS_PASS} card(s) pass the ${THRESHOLD} cut-off`,
      },
      highlight: ["retriever", "vdb", "llm", "answer"],
      packets: [
        { from: "retriever", to: "vdb", label: `nearest(q, k=${K})`, tone: "amber" },
        { from: "vdb", to: "retriever", label: `best ${OOS_RANKED[0].id} ${f(OOS_RANKED[0].score, 3)}`, sub: `< ${THRESHOLD} → 0 chunks`, tone: "rose" },
        { from: "llm", to: "answer", label: "“I couldn't find that.”", tone: "rose" },
      ],
      viz: {
        only: "interview",
        kind: "bars",
        title: `Scores for “${OOS}”`,
        items: OOS_RANKED.map((c) => ({ label: `${c.id} ${c.section}`, value: c.score, tone: scoreTone(c.score) })),
        max: 1,
        format: "fixed3",
        caption: `${OOS_PASS} chunk(s) pass the ${THRESHOLD} cut-off. Thresholds depend on the embedding model — calibrate on labelled examples.`,
      },
      deeper: {
        text: "Two safety nets: a retrieval threshold (cheap, coarse) and a prompt rule to refuse when the context doesn't contain the answer (catches related-but-unhelpful chunks). Track how often each fires — a rising “not found” rate often means missing documents, not a model problem.",
      },
      log: [
        ...OOS_RANKED.slice(0, K).map((c, i) => ({ tone: "rose" as const, cells: { stage: `rank ${i + 1}`, item: `${c.id} ${c.section}`, score: f(c.score, 3), note: `below ${THRESHOLD}` } })),
        { tone: "rose", cells: { stage: "answer", item: "“I couldn't find that in the handbook.”", score: "0 cites", note: "no guess" } },
      ],
      interviewTip: "Always include unanswerable questions in your test set, and measure how often the system correctly refuses.",
    },
  ],
  interview: [
    {
      id: "rag-1",
      level: "fresher",
      q: "What is RAG and what problem does it solve?",
      answer: "Retrieval-augmented generation: retrieve relevant passages from your own data and include them in the prompt so the model answers from them. It solves the model not knowing your private or recent information, and reduces (but does not eliminate) made-up answers, while enabling citations.",
      lookFor: "Retrieve → augment → generate; private/fresh knowledge; citations; “reduces” not “eliminates” hallucination.",
      wrong: "“RAG trains the model on your documents.” No weights change; the documents are provided at question time.",
    },
    {
      id: "rag-2",
      level: "fresher",
      q: "What are the steps of a basic RAG pipeline?",
      answer: "Ingest (offline): load documents, split into chunks, embed each chunk, store vectors with text and metadata. Query (online): embed the question with the same model, retrieve the top-k similar chunks, build a prompt with instructions + chunks + question, generate an answer with citations.",
      lookFor: "Both phases, same embedding model, metadata for citations.",
      wrong: "Skipping ingest entirely, or embedding the question with a different model.",
    },
    {
      id: "rag-3",
      level: "fresher",
      q: "RAG or fine-tuning — how do you choose?",
      answer: "Use RAG to give the model knowledge that changes or must be cited (docs, policies, tickets) — updating means re-indexing, not retraining. Use fine-tuning to change behaviour: format, tone, a narrow task, or domain style. They combine well: a fine-tuned model can still use RAG.",
      lookFor: "Knowledge vs behaviour; cost of updates; citations; they are not mutually exclusive.",
      wrong: "“Fine-tuning is the better way to add facts.” It is costly to update, hard to cite, and the model may still misremember.",
    },
    {
      id: "rag-4",
      level: "fresher",
      q: "Why do RAG answers include citations?",
      answer: "So users can verify claims against the source, so you can detect unsupported answers automatically, and to build trust. It requires keeping source/page metadata with every chunk from ingest onwards.",
      lookFor: "Verifiability, evaluation, metadata requirement.",
      wrong: "“To make the answer look more professional.”",
    },
    {
      id: "rag-5",
      level: "mid",
      q: "How do you stop the model answering from its own memory when the documents don't contain the answer?",
      answer: "Instruct it to answer only from the provided context and to say it could not find the answer otherwise; apply a retrieval score threshold so weak matches aren't passed; ask for structured output with cited chunk ids and reject answers with missing or invalid citations; evaluate with unanswerable questions in the test set.",
      lookFor: "Prompt rule + threshold + citation validation + testing with unanswerable questions.",
      wrong: "“Set temperature to 0 and it won't hallucinate.” Low temperature makes outputs more deterministic, not more grounded.",
    },
    {
      id: "rag-6",
      level: "mid",
      q: "How do you handle PDFs with tables and scanned pages?",
      answer: "Detect pages with no extractable text and run OCR; use a layout-aware parser for tables and keep them as structured text (e.g. markdown rows with the header repeated per chunk) rather than flattening columns; strip repeated headers and footers; keep page numbers. Spot-check extracted text, because parsing errors silently ruin retrieval.",
      lookFor: "OCR fallback, table-aware parsing, header repetition, manual QA of extraction.",
      wrong: "“PDF text extraction is solved — just call extract_text().”",
    },
    {
      id: "rag-7",
      level: "mid",
      q: "How do you keep the index in sync when documents change or are deleted?",
      answer: "Give chunks deterministic ids derived from document id + position (or content hash); on update, delete the document's old chunks and upsert the new ones; on delete, remove by document id; store a document version or hash to skip unchanged files; run ingest from a queue triggered by changes, and monitor for orphans.",
      lookFor: "Deterministic ids, delete-by-document, change detection, pipeline triggering.",
      wrong: "“Re-run ingest and append the new chunks.” That duplicates content and keeps stale answers alive.",
    },
    {
      id: "rag-8",
      level: "mid",
      q: "How do you choose top-k?",
      answer: "Start from your retrieval evaluation: measure recall@k on labelled questions for several k, and pick the smallest k that captures the needed evidence most of the time, within your token and latency budget. Often you retrieve more (e.g. 20–50) and re-rank down to a handful for the prompt.",
      lookFor: "Data-driven choice, recall vs cost, retrieve-many-then-rerank pattern.",
      wrong: "“More context is always better, use k = 20 in the prompt.” Long noisy context can lower answer quality and costs more.",
    },
    {
      id: "rag-9",
      level: "senior",
      design: true,
      q: "Design a RAG system for 10,000 PDFs.",
      answer:
        "Ingest: a queue-driven pipeline that parses PDFs (OCR fallback, table-aware), cleans, chunks on structure with size limits, and stores chunk text, vectors and metadata (doc id, page, section, date, owner/permissions) with deterministic ids; incremental updates by content hash. Storage: a vector index plus a keyword index for hybrid search (10k PDFs might be a few hundred thousand to a few million chunks — estimate memory). Query: optional query rewriting, hybrid retrieval with metadata/permission filters applied at query time, re-rank the top ~50 with a cross-encoder down to ~5, prompt with rules and numbered sources, generate with validated citations and an “I don't know” path. Ops: evaluation set of real questions (retrieval recall, faithfulness, answer quality), tracing of every request, latency and cost budgets, caching, and feedback capture.",
      lookFor: "Covers ingest, hybrid retrieval, permissions, re-ranking, citations, evaluation, freshness, and sizes the problem with numbers.",
      wrong: "“Put all PDFs in one prompt” or a design with no evaluation and no access control.",
    },
    {
      id: "rag-10",
      level: "senior",
      q: "Different users may see different documents. How do you enforce that in RAG?",
      answer: "Store access-control metadata (tenant, group, document ACL) on every chunk and apply it as a filter inside the retrieval query, using the authenticated user's identity — never rely on the LLM to withhold content it was shown. Use per-tenant partitions or namespaces for strong isolation, propagate ACL changes to the index quickly, and test for leakage.",
      lookFor: "Filter at retrieval time, identity from auth not from the prompt, isolation options, ACL freshness.",
      wrong: "“Tell the model in the system prompt not to reveal documents the user can't see.”",
    },
    {
      id: "rag-11",
      level: "senior",
      q: "A user says an answer is wrong. How do you debug a RAG pipeline?",
      answer: "Look at the trace for that request: was the right document ingested and parsed correctly; was the right chunk retrieved (and at what rank); did it make it into the prompt; did the model use it correctly or contradict it. Each answer points to a different fix — parsing, chunking, embeddings/hybrid/re-ranking, k and prompt assembly, or generation instructions/model. Then add the case to your evaluation set.",
      lookFor: "Stage-by-stage isolation using traces, and closing the loop into the eval set.",
      wrong: "“Switch to a bigger model.” Often retrieval is the failure.",
    },
    {
      id: "rag-12",
      level: "senior",
      q: "What drives latency and cost in RAG, and how do you cut them?",
      answer: "Per request: query embedding, vector/keyword search, re-ranking, and above all LLM input tokens (prefill) and output tokens. Cut by retrieving many but sending few chunks (re-rank), trimming chunk text, caching embeddings and frequent answers, streaming the answer, using a smaller model where quality allows, and running retrieval steps in parallel. Measure each stage separately.",
      lookFor: "Per-stage breakdown, tokens as the main cost, concrete levers, measurement.",
      wrong: "“The vector database is the bottleneck.” It usually takes milliseconds; the LLM dominates.",
    },
  ],
  quiz: [
    {
      id: "ragq-1",
      q: "Which happens ahead of time, not per question?",
      options: ["Embedding the question", "Chunking and embedding the documents", "Building the augmented prompt", "Generating the answer"],
      correct: 1,
      explain: "Ingest — load, chunk, embed, store — runs offline. Everything else happens when a question arrives.",
    },
    {
      id: "ragq-2",
      q: `In the demo, which chunk scored highest for “${QUESTION}”?`,
      options: CHUNKS.slice(0, 4).map((c) => `${c.id} ${c.section}`),
      correct: CHUNKS.findIndex((c) => c.id === RANKED[0].id),
      explain: `${RANKED[0].id} (${RANKED[0].section}) scored ${f(RANKED[0].score, 3)}. ${RANKED[1].id} (${RANKED[1].section}) was close behind at ${f(RANKED[1].score, 3)} — related but not the answer.`,
    },
    {
      id: "ragq-3",
      q: "Why must the question be embedded with the same model as the documents?",
      options: ["It's cheaper", "Vectors from different models aren't comparable", "The LLM requires it", "To get citations"],
      correct: 1,
      explain: "Each model defines its own coordinate system. Cosine between vectors from different models is meaningless.",
    },
    {
      id: "ragq-4",
      q: "The best chunk scores well below your threshold. What should the system do?",
      options: ["Answer anyway from the model's memory", "Pass the best chunk anyway", "Say it couldn't find the answer", "Raise the temperature"],
      correct: 2,
      explain: "Refusing to guess is the correct behaviour; it's also a signal that a document may be missing from the index.",
    },
    {
      id: "ragq-5",
      q: `The prompt here is ≈${PROMPT_TOTAL} tokens. Doubling k from 3 to 6 with similar chunks would roughly…`,
      options: ["halve the prompt", "add another context block of about the same size", "not change cost", "remove the need for citations"],
      correct: 1,
      explain: `Context was ≈${PROMPT_TOKENS.context} tokens for 3 chunks; three more similar chunks add about that much again — paid on every question.`,
    },
    {
      id: "ragq-6",
      q: "What is the main reason to store page numbers with each chunk?",
      options: ["Faster vector search", "Citations that point to the source", "Smaller embeddings", "Better tokenisation"],
      correct: 1,
      explain: "Metadata like source and page is what turns [1] into “handbook.pdf, p.4”, so answers can be checked.",
    },
  ],
};

export default scenario;
