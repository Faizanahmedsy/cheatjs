import type { Scenario, Tone } from "../engine/types";
import { cosine, f, sum } from "../engine/math";

/* ------------------------------------------------------------------ *
 * A travel-assistant chat. Token counts use the common "≈ 4 characters
 * per token" rule of thumb (real tokenizers differ); every count, total,
 * timing and similarity below is computed from the text and vectors.
 * ------------------------------------------------------------------ */

/** Rough token estimate: about 4 characters of English per token. */
const tok = (s: string) => Math.max(1, Math.ceil(s.length / 4));

type Msg = { role: "system" | "user" | "assistant" | "tool"; text: string };

const SYSTEM: Msg = { role: "system", text: "You are a helpful travel assistant. Answer briefly and say when you are unsure." };
const TURNS: [Msg, Msg][] = [
  [
    { role: "user", text: "What's the capital of France?" },
    { role: "assistant", text: "Paris." },
  ],
  [
    { role: "user", text: "What's a good month to visit?" },
    { role: "assistant", text: "Late spring or early autumn: mild weather and smaller crowds than in summer." },
  ],
  [
    { role: "user", text: "How do I get into the city from the main airport?" },
    { role: "assistant", text: "The RER B train runs from Charles de Gaulle into central Paris; taxis are the simpler, pricier option." },
  ],
  [
    { role: "user", text: "Remind me which city we're talking about?" },
    { role: "assistant", text: "Paris." },
  ],
];

/** Input tokens the API receives on call i = system + every earlier message + the new user message. */
const INPUT_PER_CALL = TURNS.map((_, i) => tok(SYSTEM.text) + sum(TURNS.slice(0, i).flatMap(([u, a]) => [tok(u.text), tok(a.text)])) + tok(TURNS[i][0].text));
const TOTAL_INPUT = sum(INPUT_PER_CALL);

/* ---- sliding window: keep the system prompt + the last WINDOW turns ---- */
const WINDOW = 2;
const LAST = TURNS.length - 1;
const KEPT_TURNS = TURNS.slice(Math.max(0, LAST - WINDOW), LAST);
const DROPPED_TURNS = TURNS.slice(0, Math.max(0, LAST - WINDOW));
const WINDOW_INPUT = tok(SYSTEM.text) + sum(KEPT_TURNS.flatMap(([u, a]) => [tok(u.text), tok(a.text)])) + tok(TURNS[LAST][0].text);
const DROPPED_HAS_CITY = DROPPED_TURNS.some(([u, a]) => /Paris/.test(u.text + a.text));
const KEPT_HAS_CITY_ONLY_INDIRECTLY = KEPT_TURNS.some(([, a]) => /Paris/.test(a.text));

/* ---- summarisation memory ---- */
const SUMMARY = "Summary so far: user is planning a trip to Paris (capital of France); asked about the best time to visit (late spring / early autumn).";
const OLD_TURNS_TOKENS = sum(DROPPED_TURNS.flatMap(([u, a]) => [tok(u.text), tok(a.text)]));
const SUMMARY_INPUT = tok(SYSTEM.text) + tok(SUMMARY) + sum(KEPT_TURNS.flatMap(([u, a]) => [tok(u.text), tok(a.text)])) + tok(TURNS[LAST][0].text);

/* ---- vector memory: toy 4-d embeddings [pets, seating, food, home] ---- */
const MEMORIES = [
  { text: "User's dog is called Biscuit", v: [0.9, 0.1, 0.0, 0.2] },
  { text: "User prefers window seats", v: [0.1, 0.9, 0.2, 0.0] },
  { text: "User is vegetarian", v: [0.0, 0.2, 0.9, 0.1] },
  { text: "User lives in Pune", v: [0.2, 0.1, 0.1, 0.9] },
];
const QUERY = { text: "Can I bring my dog on the trip?", v: [0.8, 0.3, 0.0, 0.3] };
const SIMS = MEMORIES.map((m) => cosine(QUERY.v, m.v));
const BEST = SIMS.indexOf(Math.max(...SIMS));

/* ---- SSE streaming ---- */
const ANSWER_CHUNKS = ["Par", "is", " is", " the", " capital", " of", " France", "."];
const TTFT_MS = 350;
const GAP_MS = 30;
const chunkTime = (i: number) => TTFT_MS + i * GAP_MS;
const sseLine = (delta: string) => `data: {"delta":${JSON.stringify(delta)}}`;
const STREAM_DONE_MS = chunkTime(ANSWER_CHUNKS.length - 1);

/* ---- tool call round trip ---- */
const TOOL_CALL = { name: "get_weather", arguments: { city: "Paris", date: "tomorrow" } };
const TOOL_RESULT = { city: "Paris", rain_chance: 0.7, temp_c: 14 };
const FINAL = `Yes, take one: there's a ${Math.round(TOOL_RESULT.rain_chance * 100)}% chance of rain and about ${TOOL_RESULT.temp_c} °C.`;

const scenario: Scenario = {
  id: "conversational-ai",
  title: "Conversational AI & streaming",
  tagline: "Roles, history, tokens streamed to the browser, memory and tools.",
  overview: {
    definition:
      "A chat app is a loop around a {{stateless}} model API: every turn, **your app** sends the list of messages so far — a {{system-prompt|system prompt}}, the user and assistant turns, and any tool results — and the model replies with the next assistant message, usually streamed token by token over {{sse|SSE}}. Memory, tools and long conversations are all things **the app** manages.",
    analogy:
      "A **brilliant consultant with no memory**. Before every question you hand them the full meeting notes; they answer out loud word by word; and when they need a fact, they ask you to look it up and hand it back.",
    facts: [
      ["Roles", "system (rules), user, assistant, tool (results your code sends back)"],
      ["State", "The model API keeps nothing between calls; the app resends history"],
      ["Streaming", "Server-Sent Events: one HTTP response, many `data:` chunks"],
      ["Limit", "History must fit the {{context-window|context window}} — and you pay for it every turn"],
      ["Memory options", "Sliding window, running summary, vector memory (retrieve relevant facts)"],
      ["Tools", "{{tool-calling|Tool calling}}: the model asks; your code runs the function"],
    ],
    whereUsed: "Every chatbot, copilot and agent. Getting history, streaming and tools right is most of the engineering in an LLM product.",
  },
  objects: [
    { id: "history", kind: "db", label: "Chat history", sub: "messages per thread", at: [2.4, -3.2], tone: "slate" },
    { id: "tool", kind: "tool", label: "get_weather", sub: "your function", at: [7.2, -3.2], tone: "amber" },
    { id: "user", kind: "user", label: "User", sub: "types a message", at: [0, 0], tone: "cyan" },
    { id: "browser", kind: "laptop", label: "Browser", sub: "chat UI", at: [2.4, 0], tone: "cyan" },
    { id: "server", kind: "server", label: "Your backend", sub: "builds the messages", at: [4.8, 0], tone: "blue" },
    { id: "llm", kind: "llm", label: "LLM API", sub: "stateless", at: [7.2, 0], tone: "violet" },
    { id: "summ", kind: "gear", label: "Summariser", sub: "compress old turns", at: [2.4, 3.6], tone: "violet" },
    { id: "vmem", kind: "vectordb", label: "Vector memory", sub: "facts as embeddings", at: [7.2, 3.6], tone: "green" },
  ],
  links: [
    { id: "l1", from: "user", to: "browser" },
    { id: "l2", from: "browser", to: "server" },
    { id: "l3", from: "server", to: "llm" },
    { id: "l4", from: "server", to: "history" },
    { id: "l5", from: "server", to: "tool" },
    { id: "l6", from: "server", to: "summ" },
    { id: "l7", from: "server", to: "vmem" },
  ],
  logTitle: "message & stream log",
  logColumns: [
    { key: "op", label: "Event", width: "18%" },
    { key: "role", label: "Role / channel", width: "14%" },
    { key: "payload", label: "Payload" },
    { key: "tokens", label: "Tokens", align: "right", width: "9%" },
    { key: "t", label: "t (ms)", align: "right", width: "9%" },
  ],
  steps: [
    {
      id: "roles",
      title: "Message roles",
      explain:
        "A chat request is a list of messages, each tagged with a **role**:\n\n- **system** — the developer's rules and persona (the {{system-prompt|system prompt}}).\n- **user** — what the person typed.\n- **assistant** — what the model said earlier.\n- **tool** — results your code sends back after the model asked for a tool.\n\nThe model was trained to treat these differently, e.g. to follow system instructions over casual user requests — though that is a tendency, not a security guarantee.",
      analogy: "A film script: stage directions (system), lines for each character (user, assistant), and props handed in from off-stage (tool).",
      highlight: ["user", "browser", "server", "llm"],
      packets: [
        { from: "user", to: "browser", label: `“${TURNS[0][0].text}”`, tone: "cyan" },
        { from: "browser", to: "server", label: "POST /chat", tone: "cyan" },
        { from: "server", to: "llm", label: "[system, user]", sub: `${INPUT_PER_CALL[0]} tokens`, tone: "blue" },
      ],
      viz: {
        kind: "chat",
        title: "What the API receives",
        messages: [
          { role: "system", text: SYSTEM.text, note: `≈ ${tok(SYSTEM.text)} tokens` },
          { role: "user", text: TURNS[0][0].text, note: `≈ ${tok(TURNS[0][0].text)} tokens` },
          { role: "assistant", text: TURNS[0][1].text, note: "the model's reply" },
        ],
        caption: "Token counts here use the rough “4 characters ≈ 1 token” rule; real tokenizers vary.",
      },
      deeper: {
        code: {
          lang: "json",
          src: `
{
  "messages": [
    { "role": "system",    "content": "${SYSTEM.text}" },
    { "role": "user",      "content": "${TURNS[0][0].text}" }
  ],
  "stream": true
}`,
        },
        text: "Field names vary between providers (some put the system prompt in a separate field), but the idea — an ordered list of role-tagged messages — is the same everywhere.",
      },
      log: [
        { tone: "slate", cells: { op: "build request", role: "system", payload: SYSTEM.text, tokens: tok(SYSTEM.text) } },
        { tone: "cyan", cells: { op: "build request", role: "user", payload: TURNS[0][0].text, tokens: tok(TURNS[0][0].text) } },
        { tone: "green", cells: { op: "response", role: "assistant", payload: TURNS[0][1].text, tokens: tok(TURNS[0][1].text) } },
      ],
      interviewTip: "Say clearly that the system prompt is **not** a security boundary: user text and tool results can still try to override it (prompt injection).",
    },
    {
      id: "history",
      title: "Multi-turn: the app resends the history",
      explain:
        "The model API is {{stateless}}: it does not remember the last call. To answer “Remind me which city we're talking about?”, the backend loads the thread from its database and sends **every earlier message again**.\n\nSo each call's input grows, and you pay for that history every turn. Over a conversation the total input grows roughly with the *square* of the number of turns.",
      highlight: ["server", "history", "llm"],
      packets: [
        { from: "server", to: "history", label: "load thread", tone: "slate" },
        { from: "history", to: "server", label: `${TURNS.length * 2 - 1} earlier messages`, tone: "slate" },
        { from: "server", to: "llm", label: `call ${TURNS.length}: ${INPUT_PER_CALL[LAST]} tokens in`, tone: "blue" },
      ],
      viz: [
        {
          kind: "plot",
          title: "Input tokens per call",
          series: [{ label: "input tokens", points: INPUT_PER_CALL.map((n, i) => [i + 1, n] as [number, number]), tone: "blue" }],
          x: [1, TURNS.length],
          y: [0, Math.ceil(INPUT_PER_CALL[LAST] / 20) * 20],
          xLabel: "turn",
          yLabel: "tokens in",
          markers: INPUT_PER_CALL.map((n, i) => ({ x: i + 1, y: n, label: String(n), tone: "blue" as Tone })),
          caption: `Total input billed over ${TURNS.length} turns: ${TOTAL_INPUT} tokens, though the user typed only ${sum(TURNS.map(([u]) => tok(u.text)))}.`,
        },
        {
          kind: "table",
          title: "What each call contains",
          columns: ["Call", "Messages sent", "≈ Tokens in"],
          rows: INPUT_PER_CALL.map((n, i) => [i + 1, 1 + i * 2 + 1, n]),
        },
      ],
      deeper: {
        math: ["input(call i) = system + Σ_{j<i} (user_j + assistant_j) + user_i", ...INPUT_PER_CALL.map((n, i) => `call ${i + 1}: ${n}`), `total = ${INPUT_PER_CALL.join(" + ")} = ${TOTAL_INPUT}`],
      },
      log: INPUT_PER_CALL.map((n, i) => ({ tone: "blue" as Tone, cells: { op: `call ${i + 1}`, role: "→ llm", payload: `system + ${i * 2} history msgs + “${TURNS[i][0].text}”`, tokens: n } })),
      interviewTip: "“Does the model remember?” — No. The app resends history; that is why long chats get slower and pricier.",
    },
    {
      id: "stream",
      title: "Streaming tokens with SSE",
      explain:
        "Waiting for a full answer feels slow, so the backend asks the model to **stream**. Tokens arrive a few at a time, and the backend forwards them to the browser over {{sse|Server-Sent Events}}: one long HTTP response where each chunk is a line starting with `data:` followed by a blank line.\n\nThe browser appends each chunk as it arrives. The total time barely changes; the *perceived* wait drops to the {{ttft|time to first token}}.",
      analogy: "A radio broadcast instead of mailing a recording: you hear the first words while the rest is still being spoken.",
      highlight: ["llm", "server", "browser"],
      packets: [
        { from: "llm", to: "server", label: "token stream", tone: "violet" },
        ...ANSWER_CHUNKS.slice(0, 4).map((c, i) => ({ from: "server", to: "browser", label: sseLine(c), sub: `${chunkTime(i)} ms`, tone: "green" as Tone })),
      ],
      viz: {
        kind: "table",
        title: "What the browser receives",
        columns: ["t (ms)", "SSE line", "Text so far"],
        rows: ANSWER_CHUNKS.map((c, i) => [chunkTime(i), sseLine(c), ANSWER_CHUNKS.slice(0, i + 1).join("")]),
        caption: `First text on screen at ${TTFT_MS} ms; finished at ${STREAM_DONE_MS} ms. The event shape here is simplified — each provider has its own.`,
      },
      deeper: {
        text: "The browser's built-in `EventSource` only does GET requests, so chat UIs usually `fetch` with POST and read the body as a stream. Watch out for proxies that buffer responses (for nginx, the `X-Accel-Buffering: no` header turns that off).",
        code: {
          lang: "ts",
          src: `
// server (Node / Next route handler)
return new Response(new ReadableStream({
  async start(ctrl) {
    for await (const delta of llm.stream(messages))
      ctrl.enqueue(\`data: \${JSON.stringify({ delta })}\\n\\n\`);
    ctrl.close();
  },
}), { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });

// browser
const res = await fetch("/chat", { method: "POST", body, signal: abort.signal });
const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
for (;;) { const { value, done } = await reader.read(); if (done) break; render(value); }`,
        },
      },
      log: ANSWER_CHUNKS.map((c, i) => ({ tone: "green" as Tone, cells: { op: "sse chunk", role: "server → browser", payload: sseLine(c), tokens: 1, t: chunkTime(i) } })),
      interviewTip: "Mention cancellation (AbortController), saving the partial message, and proxy buffering. That is what separates people who have shipped streaming.",
    },
    {
      id: "window",
      title: "Too long? Sliding window",
      explain:
        "History cannot grow forever: it must fit the {{context-window|context window}}, and every token costs money and time. The simplest fix is a **sliding window**: keep the system prompt and only the last few turns.\n\nIt is cheap and predictable — but whatever falls out of the window is simply gone. Here, with a window of 2 turns, the turn where we learned the city falls out.",
      highlight: ["server", "history", "llm"],
      packets: [
        { from: "server", to: "history", label: `keep last ${WINDOW} turns`, tone: "slate" },
        { from: "server", to: "llm", label: `${WINDOW_INPUT} tokens (was ${INPUT_PER_CALL[LAST]})`, tone: "blue" },
      ],
      viz: {
        kind: "chat",
        title: `Window of ${WINDOW} turns at call ${TURNS.length}`,
        messages: [
          { role: "system", text: SYSTEM.text },
          ...DROPPED_TURNS.flatMap(([u, a]) => [
            { role: "user" as const, text: u.text, dim: true, note: "dropped" },
            { role: "assistant" as const, text: a.text, dim: true, note: "dropped" },
          ]),
          ...KEPT_TURNS.flatMap(([u, a]) => [
            { role: "user" as const, text: u.text },
            { role: "assistant" as const, text: a.text },
          ]),
          { role: "user", text: TURNS[LAST][0].text, note: "new" },
        ],
        caption: DROPPED_HAS_CITY
          ? `The dropped turn held the question about France. ${KEPT_HAS_CITY_ONLY_INDIRECTLY ? "The city still appears in a kept answer, so the model can probably cope this time — but older facts can vanish entirely." : "The city no longer appears anywhere in the prompt."}`
          : "Nothing important was dropped this time.",
      },
      deeper: {
        math: [`window input = system + last ${WINDOW} turns + new message = ${WINDOW_INPUT} tokens`, `full history = ${INPUT_PER_CALL[LAST]} tokens → saved ${INPUT_PER_CALL[LAST] - WINDOW_INPUT}`, "In practice, trim by token budget (count tokens, drop oldest until it fits) rather than by turn count."],
      },
      log: [
        ...DROPPED_TURNS.map(([u]) => ({ tone: "rose" as Tone, cells: { op: "drop", role: "history", payload: `“${u.text}” (+ reply)` } })),
        { tone: "blue", cells: { op: "call", role: "→ llm", payload: `system + last ${WINDOW} turns + new message`, tokens: WINDOW_INPUT } },
      ],
    },
    {
      id: "summary",
      title: "Summarise old turns",
      explain:
        "A smarter option: before dropping old turns, ask a model to **summarise** them into a short note, and send that note instead.\n\nYou keep the gist (“planning a trip to Paris”) for a fraction of the tokens. The risk: summaries lose details and can introduce errors, so keep important facts (names, numbers, decisions) explicitly.",
      analogy: "Minutes of a meeting instead of the full recording.",
      highlight: ["server", "summ", "history"],
      packets: [
        { from: "server", to: "summ", label: `old turns (${OLD_TURNS_TOKENS} tokens)`, tone: "slate" },
        { from: "summ", to: "server", label: `summary (${tok(SUMMARY)} tokens)`, tone: "violet" },
        { from: "server", to: "history", label: "store summary", tone: "slate" },
      ],
      viz: [
        {
          kind: "chat",
          title: "Prompt with a running summary",
          messages: [
            { role: "system", text: `${SYSTEM.text}\n${SUMMARY}`, note: "summary appended to the system message" },
            ...KEPT_TURNS.flatMap(([u, a]) => [
              { role: "user" as const, text: u.text },
              { role: "assistant" as const, text: a.text },
            ]),
            { role: "user", text: TURNS[LAST][0].text },
          ],
        },
        {
          kind: "bars",
          title: "Input tokens at the last call",
          items: [
            { label: "full history", value: INPUT_PER_CALL[LAST], tone: "slate" },
            { label: "sliding window", value: WINDOW_INPUT, tone: "blue" },
            { label: "window + summary", value: SUMMARY_INPUT, tone: "green" },
          ],
          format: "int",
          caption: "In this tiny chat the summary is not much shorter than what it replaces; the saving grows with long conversations.",
        },
      ],
      deeper: {
        text: "Common pattern: when history passes a token budget, summarise the oldest chunk, store the summary on the thread, and keep a few recent turns verbatim. Run the summariser with a small, cheap model and a strict prompt (“keep names, numbers, decisions”).",
      },
      log: [
        { tone: "violet", cells: { op: "summarise", role: "summariser", payload: SUMMARY, tokens: tok(SUMMARY) } },
        { tone: "green", cells: { op: "call", role: "→ llm", payload: "system + summary + last turns + new", tokens: SUMMARY_INPUT } },
      ],
    },
    {
      id: "vector",
      title: "Vector memory: recall what's relevant",
      explain:
        "For facts that matter across many sessions (“my dog is Biscuit”), store each one with an {{embedding}}. On a new message, embed it and fetch only the closest memories by {{cosine-similarity|cosine similarity}}, then put those in the prompt.\n\nThis scales to thousands of facts without bloating every request — the same retrieval idea as {{rag|RAG}}, applied to the user's own history.",
      highlight: ["server", "vmem", "llm"],
      packets: [
        { from: "server", to: "vmem", label: `embed “${QUERY.text}”`, tone: "green" },
        { from: "vmem", to: "server", label: `top-1: ${MEMORIES[BEST].text}`, sub: `cos = ${f(SIMS[BEST], 3)}`, tone: "green" },
        { from: "server", to: "llm", label: "prompt + 1 memory", tone: "blue" },
      ],
      viz: {
        kind: "bars",
        title: `Similarity to “${QUERY.text}”`,
        items: MEMORIES.map((m, i) => ({ label: m.text, value: SIMS[i], tone: (i === BEST ? "green" : "blue") as Tone })),
        max: 1,
        format: "fixed3",
        caption: "Toy 4-number vectors [pets, seating, food, home]; real embeddings have hundreds of dimensions.",
      },
      deeper: {
        math: [
          "cos(q, m) = (q · m) / (|q| |m|)",
          `q = [${QUERY.v.join(", ")}],  m = [${MEMORIES[BEST].v.join(", ")}]`,
          `cos = ${f(SIMS[BEST], 4)}`,
          "Decide when to write memories (e.g. a small model extracts durable facts after each turn), and give users a way to see and delete them.",
        ],
      },
      log: MEMORIES.map((m, i) => ({ tone: (i === BEST ? "green" : "blue") as Tone, cells: { op: i === BEST ? "retrieve ✓" : "score", role: "vector memory", payload: `${m.text} · cos ${f(SIMS[i], 3)}` } })),
      interviewTip: "Name the trade-off: windows are simple but forget; summaries compress but blur; vector memory scales but can retrieve the wrong thing.",
    },
    {
      id: "tools",
      title: "Tool calling round trip",
      explain:
        "Models cannot look things up on their own. With {{tool-calling|tool calling}} you describe functions (name, description, JSON schema for arguments). When useful, the model replies not with text but with a **tool call**: the function name and arguments.\n\nYour backend validates and runs it, sends the result back as a **tool** message, and calls the model again. The model then writes the final answer using the result. The model never runs code itself — your app does.",
      analogy: "A manager who can't use the database: they write a precise request slip, you run the query, and they use the printout to answer the client.",
      highlight: ["server", "llm", "tool"],
      packets: [
        { from: "server", to: "llm", label: "messages + tool schema", tone: "blue" },
        { from: "llm", to: "server", label: `tool_call ${TOOL_CALL.name}`, sub: JSON.stringify(TOOL_CALL.arguments), tone: "amber" },
        { from: "server", to: "tool", label: `${TOOL_CALL.name}("Paris", "tomorrow")`, tone: "amber" },
        { from: "tool", to: "server", label: JSON.stringify({ rain_chance: TOOL_RESULT.rain_chance, temp_c: TOOL_RESULT.temp_c }), tone: "amber" },
        { from: "server", to: "llm", label: "+ tool result message", tone: "blue" },
        { from: "llm", to: "server", label: "final answer", tone: "green" },
      ],
      viz: {
        kind: "chat",
        title: "The full exchange",
        messages: [
          { role: "user", text: "Do I need an umbrella in Paris tomorrow?" },
          { role: "assistant", text: JSON.stringify({ tool_call: TOOL_CALL }), note: "no text — a structured request" },
          { role: "tool", text: JSON.stringify(TOOL_RESULT), note: "your code ran the function" },
          { role: "assistant", text: FINAL },
        ],
        caption: "Two model calls for one user question. Agents repeat this loop until the model stops asking for tools.",
      },
      deeper: {
        code: {
          lang: "ts",
          src: `
const tools = [{
  name: "get_weather",
  description: "Forecast for a city",
  input_schema: { type: "object", properties: { city: { type: "string" }, date: { type: "string" } }, required: ["city"] },
}];
let res = await llm.chat({ messages, tools });
while (res.toolCalls.length) {                       // cap the number of rounds in production
  for (const call of res.toolCalls) {
    const args = schema.parse(call.arguments);       // validate: never trust model output
    messages.push(res.message, { role: "tool", id: call.id, content: JSON.stringify(await run(call.name, args)) });
  }
  res = await llm.chat({ messages, tools });
}`,
        },
      },
      log: [
        { tone: "amber", cells: { op: "tool_call", role: "assistant", payload: JSON.stringify(TOOL_CALL) } },
        { tone: "amber", cells: { op: "execute", role: "backend → tool", payload: `${TOOL_CALL.name} → ${JSON.stringify(TOOL_RESULT)}` } },
        { tone: "blue", cells: { op: "call 2", role: "tool msg → llm", payload: "history + tool result" } },
        { tone: "green", cells: { op: "answer", role: "assistant", payload: FINAL, tokens: tok(FINAL) } },
      ],
      interviewTip: "Stress that **your code** executes tools, validates arguments, and treats tool output as untrusted input to the next model call.",
    },
  ],
  interview: [
    {
      id: "conv-1",
      level: "fresher",
      q: "What are the system, user, assistant and tool roles?",
      answer: "They label who said what in the message list. System holds the developer's instructions and persona; user is the person's input; assistant is the model's earlier replies; tool carries results of functions your code ran at the model's request. Models are trained to weigh them differently, e.g. to follow system instructions.",
      lookFor: "All four roles, and that tool messages come from your code, not the model.",
      wrong: "“The system role is a secure place for secrets the user can never see or override.” It can leak and be overridden by injection.",
    },
    {
      id: "conv-2",
      level: "fresher",
      q: "Does the model remember earlier messages in a chat?",
      answer: "Not by itself. Chat model APIs are stateless: each call is independent, and the app resends the relevant history every time. Any “memory” — history, summaries, stored facts — is something the application builds and sends. (Some platforms offer server-side threads, but they too are just storing and resending context for you.)",
      lookFor: "Stateless API; the app manages history; cost implication of resending.",
      wrong: "“The model learns from each conversation and remembers it.” Inference does not update weights.",
    },
    {
      id: "conv-3",
      level: "fresher",
      q: "Why stream responses instead of returning them at once?",
      answer: "Perceived latency. Generating a long answer can take seconds; streaming shows the first words after the time to first token and fills in as tokens arrive. Total generation time is about the same. It also lets users stop a bad answer early.",
      lookFor: "TTFT vs total time, and better UX.",
      wrong: "“Streaming makes the model generate faster.”",
    },
    {
      id: "conv-4",
      level: "fresher",
      q: "What is a system prompt and what should go in it?",
      answer: "The developer-written instructions sent as the first message: role, tone, rules, output format, what to do when unsure, and allowed tools. Keep it focused and testable. Don't rely on it for security or put secrets in it.",
      lookFor: "Purpose, sensible contents, and the security caveat.",
      wrong: "“Put API keys or private data in the system prompt; users can't see it.”",
    },
    {
      id: "conv-5",
      level: "mid",
      q: "SSE or WebSockets for streaming LLM output?",
      answer: "SSE fits most chat streaming: it is one-way server→client over plain HTTP, simple to implement, and works through standard infrastructure. WebSockets are bidirectional and better when the client must send data continuously during generation (e.g. live voice, collaborative editing). For POST requests, browsers read SSE-formatted bodies with fetch streaming, since EventSource only supports GET.",
      lookFor: "One-way vs two-way, simplicity, and the EventSource GET limitation.",
      wrong: "“SSE can't work with POST so you must use WebSockets.” fetch + ReadableStream handles it.",
    },
    {
      id: "conv-6",
      level: "mid",
      q: "The conversation is longer than the context window. What do you do?",
      answer: "Budget tokens per request and choose a memory strategy: sliding window (drop oldest turns), running summary of older turns, vector memory that retrieves only relevant past messages or facts, or a mix — e.g. system prompt + summary + last few turns + retrieved facts. Count tokens with the real tokenizer and leave room for the output.",
      lookFor: "Several strategies with trade-offs and explicit token budgeting including output.",
      wrong: "“Just send everything; the provider will handle it.” Requests fail or get truncated, and cost grows.",
    },
    {
      id: "conv-7",
      level: "mid",
      q: "How does tool (function) calling actually work?",
      answer: "You send tool definitions (name, description, JSON schema). The model may respond with a structured tool call instead of text. Your code parses and validates the arguments, executes the function, appends the result as a tool message, and calls the model again so it can answer with the result. The loop can repeat for multi-step tasks.",
      lookFor: "Model proposes, app executes, result goes back in a second call.",
      wrong: "“The model executes the function on the provider's servers.”",
    },
    {
      id: "conv-8",
      level: "mid",
      q: "What can go wrong with streaming in production?",
      answer: "Proxies or load balancers buffering the response (stream arrives all at once), idle timeouts on long responses, client disconnects (you should cancel the upstream model call to stop paying), errors mid-stream after a 200 status has been sent (need an in-band error event), and saving partial messages. Handle cancellation with AbortController and send periodic keep-alives if needed.",
      lookFor: "Buffering, cancellation, mid-stream errors and persistence.",
      wrong: "“Nothing — it's just a normal HTTP response.”",
    },
    {
      id: "conv-9",
      level: "senior",
      design: true,
      q: "Design the backend for a chat product with 10k concurrent streaming users.",
      answer:
        "Stateless API servers behind a load balancer that supports long-lived streaming connections; non-blocking I/O so one server holds many open streams. Threads and messages in a database; build prompts from a token budget (system + summary + recent turns + retrieved memory). Rate limits and quotas per user; a queue or concurrency limit toward the model provider with retries and fallback models. Stream via SSE, propagate cancellation to the provider call, persist the final message when the stream ends. Observability: TTFT, tokens/s, error rate, cost per conversation. Cache common system-prompt prefixes where the provider supports it.",
      lookFor: "Connection handling, token budgeting, provider limits/fallbacks, cancellation, and metrics.",
      wrong: "Designing it like a normal request/response API with no thought for open connections, provider rate limits or cost.",
    },
    {
      id: "conv-10",
      level: "senior",
      q: "What are the security risks of tool calling, and how do you mitigate them?",
      answer: "The model can be manipulated (prompt injection, including text hidden in retrieved documents or tool results) into calling tools with harmful arguments. Mitigate with least-privilege tools scoped to the current user, schema validation and allow-lists on arguments, human confirmation for destructive or costly actions, treating all tool output as untrusted data, rate limits and step caps on agent loops, and audit logs.",
      lookFor: "Injection via data, least privilege, validation, confirmation for risky actions.",
      wrong: "“The system prompt tells the model not to misuse tools, so it's safe.”",
    },
    {
      id: "conv-11",
      level: "senior",
      q: "How would you design long-term user memory for an assistant?",
      answer: "Decide what is worth remembering (stable preferences and facts, not every message), extract it with a small model after turns, store it with embeddings and metadata (user, time, source), retrieve the top few relevant items per request, and resolve conflicts (newer fact wins). Let users view, edit and delete memories; respect retention and privacy rules. Evaluate whether retrieved memories actually improve answers.",
      lookFor: "Selective writes, retrieval, conflicts, and user control/privacy.",
      wrong: "“Store the entire chat log and stuff it into every prompt.”",
    },
    {
      id: "conv-12",
      level: "senior",
      q: "How do you handle multi-step tool use (an agent loop) reliably?",
      answer: "Loop: call the model, run any requested tools (in parallel when independent), append results, repeat until it answers without tool calls. Add a max-steps cap, per-tool timeouts, idempotency for side-effecting tools, clear error messages returned as tool results so the model can recover, and logging of every step. Evaluate on end-to-end tasks, not single calls.",
      lookFor: "Termination conditions, error feedback, idempotency, observability.",
      wrong: "An unbounded loop with no step cap or timeout.",
    },
  ],
  quiz: [
    {
      id: "convq-1",
      q: "Who executes a function the model asks to call?",
      options: ["The model itself", "Your application code", "The browser automatically", "The tokenizer"],
      correct: 1,
      explain: "The model only outputs a structured request. Your backend validates and runs it, then sends the result back as a tool message.",
    },
    {
      id: "convq-2",
      q: `In this demo, how many input tokens does call ${TURNS.length} send with the full history?`,
      options: [String(tok(TURNS[LAST][0].text)), String(INPUT_PER_CALL[0]), String(INPUT_PER_CALL[LAST]), String(TOTAL_INPUT)],
      correct: 2,
      explain: `System + all ${LAST} earlier turns + the new message = ${INPUT_PER_CALL[LAST]}. ${TOTAL_INPUT} is the total over all calls.`,
    },
    {
      id: "convq-3",
      q: "What does each SSE message look like on the wire?",
      options: ["A WebSocket frame", "Lines starting with `data:` ending in a blank line", "A separate HTTP request per token", "A JSON array sent at the end"],
      correct: 1,
      explain: "Server-Sent Events are one long HTTP response of `data: …` lines, each event ended by a blank line.",
    },
    {
      id: "convq-4",
      q: "Main downside of a sliding-window memory?",
      options: ["It is expensive", "Older facts outside the window are forgotten", "It needs a vector database", "It breaks streaming"],
      correct: 1,
      explain: "It is cheap and simple, but anything that slides out is gone unless you summarise or store it elsewhere.",
    },
    {
      id: "convq-5",
      q: `Which memory is retrieved for “${QUERY.text}”?`,
      options: MEMORIES.map((m) => m.text),
      correct: BEST,
      explain: `Highest cosine similarity: ${f(SIMS[BEST], 3)}.`,
    },
    {
      id: "convq-6",
      q: "Streaming mainly improves…",
      options: ["Total generation time", "Perceived latency (time until text appears)", "Answer accuracy", "Token cost"],
      correct: 1,
      explain: "Total time is about the same; the user just sees text after the time to first token instead of waiting for the whole answer.",
    },
  ],
};

export default scenario;
