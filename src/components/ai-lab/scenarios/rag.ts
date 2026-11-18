import type { Scenario, Tone } from "../engine/types";
import { cosine, f, sum, vec } from "../engine/math";

/* ------------------------------------------------------------------ *
 * RAG on a "PDF Q&A" example: an employee handbook. Toy 4-dim vectors
 * [leave, pay, conduct, IT] stand in for a real embedding model. Scores
 * and token counts are computed, never typed in.
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

// Prompt assembly
const SYSTEM =
  "You answer questions about the company handbook. Use only the numbered context below. Cite every claim like [1]. If the context does not contain the answer, say you could not find it.";
const CONTEXT = TOP.map((c, i) => `[${i + 1}] (${PDF} p.${c.page}, ${c.section}) ${c.text}`).join("\n");
const PROMPT_TOKENS = { system: approxTokens(SYSTEM), context: approxTokens(CONTEXT), question: approxTokens(QUESTION) };
const PROMPT_TOTAL = sum(Object.values(PROMPT_TOKENS));
const ANSWER_BUDGET = 300;
const WINDOW = 8000; // example window for the budget picture

const ANSWER_LINES = [
  { text: "New full-time employees get 20 days of paid annual leave per calendar year, accrued monthly from their start date [1].", cites: [1] },
  { text: "Up to 5 unused days can be carried over to the next year [2].", cites: [2] },
];
const cited = (n: number) => TOP[n - 1];

// Out-of-scope question
const OOS = "Can I bring my dog to the office?";
const OOS_V = [0.1, 0.15, 0.6, 0.6];
const OOS_RANKED = CHUNKS.map((c) => ({ id: c.id, section: c.section, score: cosine(OOS_V, c.v) })).sort((a, b) => b.score - a.score);
const OOS_PASS = OOS_RANKED.filter((c) => c.score >= THRESHOLD).length;

const scoreTone = (s: number): Tone => (s >= THRESHOLD ? "green" : "slate");

const scenario: Scenario = {
  id: "rag",
  title: "RAG fundamentals",
  tagline: "Look it up first, then answer from what you found.",
  overview: {
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
    {
      id: "load",
      title: "Ingest 1 — load the PDF",
      explain:
        "Everything starts with getting clean text out of the document. A loader reads the PDF page by page and keeps **where** each piece came from: file name, page number, heading.\n\nThis step quietly decides quality. Scanned pages need OCR, tables need special handling, and headers/footers repeated on every page should be stripped — or they pollute every search.",
      analogy: "The librarian catalogues a new book: notes the title, the chapters and which page each topic is on.",
      highlight: ["pdf", "loader"],
      packets: [{ from: "pdf", to: "loader", label: `${PDF}`, sub: `${PAGES.length} relevant pages`, tone: "slate" }],
      viz: {
        kind: "table",
        title: "Pages extracted",
        columns: ["page", "heading", "characters"],
        rows: PAGES.map((p) => [p.page, p.heading, p.chars.toLocaleString("en-US")]),
        caption: "Keep page numbers now — the citations at the end depend on them.",
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
      interviewTip: "Mention parsing problems (scans, tables, headers) — most real RAG failures start here, not in the model.",
    },
    {
      id: "chunk",
      title: "Ingest 2 — chunk with metadata",
      explain:
        "The text is split into {{chunk|chunks}} — here one short policy paragraph each. Each chunk is small enough to be matched precisely, but complete enough to answer a question on its own.\n\nEvery chunk carries **metadata**: source file, page, section. That's what lets the final answer say “handbook.pdf, page 4”, and lets you filter later (e.g. only HR documents).",
      highlight: ["loader", "chunks"],
      packets: [{ from: "loader", to: "chunks", label: `${CHUNKS.length} chunks`, sub: "split on headings", tone: "blue" }],
      viz: {
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
    },
    {
      id: "embed",
      title: "Ingest 3 — embed and store",
      explain:
        "Each chunk goes through the {{embedding}} model, which returns a {{vector}}. The vector, the chunk text and its metadata are saved together in the {{vector-db|vector store}}.\n\nThis is done **once**, ahead of time (and again only when a document changes). Ingest can be slow; questions must be fast.",
      highlight: ["chunks", "embedder", "vdb"],
      packets: [
        { from: "chunks", to: "embedder", label: `${CHUNKS.length} texts`, tone: "blue" },
        { from: "embedder", to: "vdb", label: "upsert(id, vector, metadata)", tone: "violet" },
      ],
      viz: {
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
    {
      id: "ask",
      title: "Query 1 — the question is embedded",
      explain:
        `An employee asks: **“${QUESTION}”**\n\nThe app sends the question through the **same** embedding model used at ingest, so the question vector lives in the same space as the chunk vectors and can be compared with them.`,
      analogy: "The librarian listens to your question and works out which shelf it belongs to.",
      highlight: ["user", "app", "retriever", "embedder"],
      packets: [
        { from: "user", to: "app", label: "“How many days of annual leave…?”", tone: "cyan" },
        { from: "app", to: "retriever", label: "retrieve(question, k=3)", tone: "amber" },
        { from: "retriever", to: "embedder", label: "embed(question)", tone: "violet" },
      ],
      viz: {
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
    },
    {
      id: "retrieve",
      title: "Query 2 — retrieve the top-k",
      explain:
        `The vector store compares the question vector with every chunk vector using {{cosine-similarity|cosine similarity}} and returns the best ${K}.\n\nNotice the second result is about **sick** leave: it is *related* but does not answer the question. Retrieval finds what is similar; it is the model's job, guided by the prompt, to use only what is relevant.\n\nA minimum score (here ${THRESHOLD}) keeps clearly unrelated chunks out.`,
      highlight: ["retriever", "vdb"],
      packets: [
        { from: "retriever", to: "vdb", label: "nearest(q, k=3)", tone: "amber" },
        { from: "vdb", to: "retriever", label: RANKED.slice(0, K).map((c) => c.id).join(", "), sub: RANKED.slice(0, K).map((c) => f(c.score, 3)).join(" · "), tone: "green" },
      ],
      viz: {
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
    {
      id: "augment",
      title: "Query 3 — augment the prompt",
      explain:
        "Now the app builds the prompt: **rules** (answer only from the context, cite sources, admit when the answer is missing), the **numbered chunks** with their page numbers, and finally the **question**.\n\nThis is the “augmented” in RAG. The model sees the evidence right next to the question. The numbers [1], [2], [3] are what it will cite.",
      analogy: "The librarian lays the three pages on the desk, open, with sticky notes numbered 1–3.",
      highlight: ["retriever", "prompt"],
      packets: [{ from: "retriever", to: "prompt", label: `${TOP.length} chunks + rules + question`, sub: `≈ ${PROMPT_TOTAL} tokens`, tone: "amber" }],
      viz: [
        {
          kind: "chat",
          title: "The prompt that is actually sent",
          messages: [
            { role: "system", text: SYSTEM },
            { role: "user", text: `Context:\n${CONTEXT}\n\nQuestion: ${QUESTION}` },
          ],
        },
        {
          kind: "stack",
          title: `Token budget (example ${WINDOW.toLocaleString("en-US")}-token window)`,
          segments: [
            { label: `system ≈${PROMPT_TOKENS.system}`, value: PROMPT_TOKENS.system, tone: "slate" },
            { label: `context ≈${PROMPT_TOKENS.context}`, value: PROMPT_TOKENS.context, tone: "amber" },
            { label: `question ≈${PROMPT_TOKENS.question}`, value: PROMPT_TOKENS.question, tone: "cyan" },
            { label: `answer reserve ${ANSWER_BUDGET}`, value: ANSWER_BUDGET, tone: "green" },
            { label: "unused", value: WINDOW - PROMPT_TOTAL - ANSWER_BUDGET, tone: "blue" },
          ],
          caption: `Prompt ≈ ${PROMPT_TOTAL} tokens + ${ANSWER_BUDGET} reserved for the answer = ${PROMPT_TOTAL + ANSWER_BUDGET} of ${WINDOW.toLocaleString("en-US")}. Every extra chunk costs money and latency on every question.`,
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
    },
    {
      id: "generate",
      title: "Query 4 — generate with citations",
      explain:
        "The LLM writes the answer using the context, tagging each claim with the chunk it came from. The app turns [1] into a link to **handbook.pdf, page 4**.\n\nIt ignored the sick-leave chunk because the question was about annual leave. Citations make the answer **checkable**: a reader (or an automated check) can confirm every sentence against its source. That is {{grounding}}.",
      highlight: ["prompt", "llm", "answer"],
      packets: [
        { from: "prompt", to: "llm", label: `≈ ${PROMPT_TOTAL} tokens in`, tone: "amber" },
        { from: "llm", to: "answer", label: "answer + [1] [2]", tone: "green" },
      ],
      viz: [
        { kind: "chat", title: "Answer", messages: [{ role: "assistant", text: ANSWER_LINES.map((l) => l.text).join(" ") }] },
        {
          kind: "table",
          title: "Every claim traced to a source",
          columns: ["claim", "cites", "source"],
          rows: ANSWER_LINES.map((l) => [l.text.replace(/\s*\[\d\]\.?$/, ""), l.cites.map((n) => `[${n}]`).join(" "), l.cites.map((n) => `${PDF} p.${cited(n).page} (${cited(n).id})`).join("; ")]),
        },
      ],
      deeper: {
        text: "Production tips: ask for structured output (answer + list of cited chunk ids) so citations can be validated in code; drop or flag any citation id that wasn't in the context; show the quoted passage on hover.",
      },
      log: ANSWER_LINES.map((l) => ({ tone: "green" as const, cells: { stage: "answer", item: l.text.length > 70 ? `${l.text.slice(0, 68)}…` : l.text, score: l.cites.map((n) => `[${n}]`).join(""), note: l.cites.map((n) => `p.${cited(n).page}`).join(", ") } })),
      interviewTip: "Citations are not proof by themselves — the model can cite the wrong chunk. Mention checking that the cited text actually supports the claim (faithfulness).",
    },
    {
      id: "not-found",
      title: "When the answer isn't there",
      explain:
        `Now someone asks **“${OOS}”**. The handbook doesn't say. The best match scores only ${f(OOS_RANKED[0].score, 3)}, below the ${THRESHOLD} cut-off, so **nothing** is passed to the model.\n\nThe app (or the prompt's rule) answers “I couldn't find that in the handbook” instead of letting the model guess. A RAG system that says “I don't know” when it should is worth far more than one that always sounds confident — guessing is how {{hallucination|hallucinations}} reach users.`,
      analogy: "A good librarian says “we don't have a book on that” rather than inventing one.",
      highlight: ["retriever", "vdb", "llm", "answer"],
      packets: [
        { from: "retriever", to: "vdb", label: "nearest(q, k=3)", tone: "amber" },
        { from: "vdb", to: "retriever", label: `best ${OOS_RANKED[0].id} ${f(OOS_RANKED[0].score, 3)}`, sub: `< ${THRESHOLD} → 0 chunks`, tone: "rose" },
        { from: "llm", to: "answer", label: "“I couldn't find that.”", tone: "rose" },
      ],
      viz: {
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
