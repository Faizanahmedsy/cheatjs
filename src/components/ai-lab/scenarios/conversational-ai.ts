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

/** A question asked with no history at all: the model has nothing to go on. */
const FORGOT_Q = TURNS[LAST][0].text;
const FORGOT_A = "Sorry, I'm not sure which city you mean. Could you tell me?";
const SORTED_MEMS = MEMORIES.map((m, i) => ({ ...m, s: SIMS[i], i })).sort((a, b) => b.s - a.s);
const MEM_ANSWER = `Good news for ${MEMORIES[BEST].text.replace("User's dog is called ", "")}: most trains in France allow dogs. Want me to check the rules for your route?`;
const SSE_SHOWN = 5;

const scenario: Scenario = {
  id: "conversational-ai",
  title: "Conversational AI & streaming",
  tagline: "Roles, history, tokens streamed to the browser, memory and tools.",
  imagine:
    "Imagine chatting with a brilliant helper who forgets everything the moment they finish a sentence. To keep the conversation going, you hand them the whole chat so far before every new question. That is how every chatbot works: the app does the remembering, the model just answers.",
  recap: [
    "Every message has a **role** (system, user, assistant, tool), and the model remembers nothing: the app resends the history every turn.",
    "Replies are **streamed** token by token over SSE, so text appears almost at once.",
    "Long chats need **memory tricks** (a sliding window, summaries, vector memory), and **tools** let the model ask your code to look things up.",
  ],
  overview: {
    plain:
      "A chatbot is an app wrapped around a language model. Each time you send a message, the app sends the model the rules, the chat so far and your new message, and the model writes the next reply word by word. Remembering, looking things up and keeping chats short enough are all the app's job.",
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
    // 1 ─────────────────────────────────────────────────────────────
    {
      id: "roles",
      title: "Every message has a role",
      simple: "A chat is a list of messages, and each one is labelled with who said it.",
      easy: "A chat with an AI is just a **list of messages**, and every message has a label saying who said it. **System** is the hidden rulebook from the people who built the app. **User** is what you typed. **Assistant** is what the AI replied. Later we will meet a fourth label, **tool**, for answers that the app looks up for the AI.",
      explain:
        "The **system** message holds the app maker's rules (the {{system-prompt|system prompt}}). **User** is what you typed, **assistant** is what the model replied. Later we will meet a fourth role, **tool**, for answers your own code looks up.",
      analogy: "A film script: stage directions (system), lines for each character (user, assistant), and props handed in from off-stage (tool).",
      detail:
        "A chat request is an ordered list of role-tagged messages. The model was trained to treat the roles differently, e.g. to follow system instructions over casual user requests — but that is a tendency, not a security guarantee. User text and tool results can still try to override the rules (prompt injection).\n\nField names vary between providers (some put the system prompt in a separate field), but the idea is the same everywhere.",
      stage: {
        kind: "chat",
        messages: [
          { role: "system", text: SYSTEM.text, note: `≈ ${tok(SYSTEM.text)} tokens · the rules` },
          { role: "user", text: TURNS[0][0].text, note: `≈ ${tok(TURNS[0][0].text)} tokens` },
          { role: "assistant", text: TURNS[0][1].text, note: "the model's reply" },
        ],
        aside: { title: "The roles", items: ["system: the app's rules", "user: what you type", "assistant: the model's replies", "tool: results your code sends back"], tone: "slate" },
      },
      highlight: ["user", "browser", "server", "llm"],
      packets: [
        { from: "user", to: "browser", label: `“${TURNS[0][0].text}”`, tone: "cyan" },
        { from: "browser", to: "server", label: "POST /chat", tone: "cyan" },
        { from: "server", to: "llm", label: "[system, user]", sub: `${INPUT_PER_CALL[0]} tokens`, tone: "blue" },
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: "What the API receives",
        columns: ["role", "content", "≈ tokens"],
        rows: [
          ["system", SYSTEM.text, tok(SYSTEM.text)],
          ["user", TURNS[0][0].text, tok(TURNS[0][0].text)],
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
      },
      log: [
        { tone: "slate", cells: { op: "build request", role: "system", payload: SYSTEM.text, tokens: tok(SYSTEM.text) } },
        { tone: "cyan", cells: { op: "build request", role: "user", payload: TURNS[0][0].text, tokens: tok(TURNS[0][0].text) } },
        { tone: "green", cells: { op: "response", role: "assistant", payload: TURNS[0][1].text, tokens: tok(TURNS[0][1].text) } },
      ],
      interviewTip: "Say clearly that the system prompt is **not** a security boundary: user text and tool results can still try to override it (prompt injection).",
    },
    // 2 ─────────────────────────────────────────────────────────────
    {
      id: "forgets",
      title: "The model remembers nothing",
      simple: "Each time the app calls the AI, it starts fresh. It has no idea what was said before.",
      easy: "Here is the surprising part: the AI **remembers nothing** between messages. Every time the app calls it, it is like talking to someone with no memory. If the app sends only “Remind me which city we’re talking about?”, the AI has no idea. It has never heard of Paris. It can only guess or ask.",
      explain:
        "The model API is {{stateless}} (it keeps nothing between calls). If the app sends only “Remind me which city we're talking about?”, the model has never heard of Paris. It can only guess or ask.",
      analogy: "Phoning a help desk where a different person picks up every time and nobody takes notes.",
      detail:
        "Chat model APIs are stateless: each call is independent and inference never updates the weights, so nothing is learned from your chat. Any “memory” — history, summaries, stored facts — is something the application builds and sends. Some platforms offer server-side threads, but they too just store and resend context for you.",
      stage: {
        kind: "chat",
        messages: [
          { role: "system", text: SYSTEM.text },
          { role: "user", text: FORGOT_Q, note: "sent on its own, no history" },
          { role: "assistant", text: FORGOT_A, note: "it cannot know" },
        ],
        streamLast: true,
        aside: { title: "Sent to the model this turn", items: ["system prompt", `“${FORGOT_Q}”`, `≈ ${tok(SYSTEM.text) + tok(FORGOT_Q)} tokens, no earlier turns`], tone: "rose" },
      },
      highlight: ["server", "llm"],
      packets: [{ from: "server", to: "llm", label: "[system, new message]", sub: `${tok(SYSTEM.text) + tok(FORGOT_Q)} tokens`, tone: "rose" }],
      log: [{ tone: "rose", cells: { op: "call (no history)", role: "→ llm", payload: FORGOT_Q, tokens: tok(SYSTEM.text) + tok(FORGOT_Q) } }],
      interviewTip: "“Does the model remember?” — No. The app resends history; inference does not update weights.",
    },
    // 3 ─────────────────────────────────────────────────────────────
    {
      id: "history",
      title: "So the app resends the whole chat",
      simple: "So before every reply, the app sends the whole chat again. Each call gets bigger.",
      easy: `So how does a chat feel like a real conversation? Simple: before every reply, the app **sends the whole chat again**: every old message plus your new one. By call ${TURNS.length} it sends ${INPUT_PER_CALL[LAST]} small pieces of text, even though you only typed ${tok(TURNS[LAST][0].text)} of them. You pay for all of that history on every single turn.`,
      explain: `The backend loads the chat from its database and sends **every earlier message** plus the new one. Call ${TURNS.length} sends ${INPUT_PER_CALL[LAST]} {{token|tokens}} (small chunks of text), though you only typed ${tok(TURNS[LAST][0].text)}. You pay for that history on every turn.`,
      detail: `Each call's input = system + every earlier message + the new user message, so input grows each turn and the **total** over a conversation grows roughly with the square of the number of turns. Here: ${INPUT_PER_CALL.join(" + ")} = **${TOTAL_INPUT}** input tokens over ${TURNS.length} calls, while the user typed only ${sum(TURNS.map(([u]) => tok(u.text)))}. Long chats get slower and pricier for this reason.`,
      stage: {
        kind: "chat",
        messages: [
          { role: "system", text: SYSTEM.text },
          { role: "user", text: TURNS[LAST - 1][0].text, dim: true, note: `+ ${LAST - 1} earlier turns, also resent` },
          { role: "assistant", text: TURNS[LAST - 1][1].text, dim: true },
          { role: "user", text: TURNS[LAST][0].text, note: "new" },
          { role: "assistant", text: TURNS[LAST][1].text },
        ],
        aside: {
          title: "Tokens sent per call",
          items: [...INPUT_PER_CALL.map((n, i) => `call ${i + 1}: ${n} tokens${i === LAST ? " (this one)" : ""}`), `total: ${TOTAL_INPUT} tokens`],
          tone: "blue",
        },
      },
      highlight: ["server", "history", "llm"],
      packets: [
        { from: "server", to: "history", label: "load thread", tone: "slate" },
        { from: "history", to: "server", label: `${TURNS.length * 2 - 1} earlier messages`, tone: "slate" },
        { from: "server", to: "llm", label: `call ${TURNS.length}: ${INPUT_PER_CALL[LAST]} tokens in`, tone: "blue" },
      ],
      viz: [
        {
          only: "interview",
          kind: "plot",
          title: "Input tokens per call",
          series: [{ label: "input tokens", points: INPUT_PER_CALL.map((n, i) => [i + 1, n] as [number, number]), tone: "blue" }],
          x: [1, TURNS.length],
          y: [0, Math.ceil(INPUT_PER_CALL[LAST] / 20) * 20],
          xLabel: "turn",
          yLabel: "tokens in",
          markers: INPUT_PER_CALL.map((n, i) => ({ x: i + 1, y: n, label: String(n), tone: "blue" as Tone })),
          caption: `Total input billed over ${TURNS.length} turns: ${TOTAL_INPUT} tokens.`,
        },
        {
          only: "interview",
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
      interviewTip: "Mention the cost curve: resending history makes total input grow roughly quadratically with turns.",
    },
    // 4 ─────────────────────────────────────────────────────────────
    {
      id: "stream",
      title: "Words arrive as they are written",
      simple: "Instead of waiting for the whole answer, the reply is sent piece by piece and appears as it is written.",
      easy: `Waiting for the whole answer feels slow. So the answer is sent **piece by piece**, like a live radio broadcast. The server keeps one line open and pushes each new piece as soon as it is ready. The first words show up after ${TTFT_MS} ms instead of waiting for the whole answer.`,
      explain: `This is **streaming**. The server keeps one connection open and pushes each new piece as a small message, using {{sse|Server-Sent Events}} (lines that start with \`data:\`). The first words show up after ${TTFT_MS} ms instead of after the whole answer.`,
      analogy: "A radio broadcast instead of mailing a recording: you hear the first words while the rest is still being spoken.",
      detail: `The total time barely changes; the *perceived* wait drops to the {{ttft|time to first token}} (${TTFT_MS} ms here, finished at ${STREAM_DONE_MS} ms). Each SSE event is a \`data: …\` line ended by a blank line. The browser's built-in \`EventSource\` only does GET, so chat UIs usually \`fetch\` with POST and read the body as a stream. Watch out for proxies that buffer responses (for nginx, \`X-Accel-Buffering: no\`), cancel the upstream call when the user disconnects, and save the partial message.`,
      stage: {
        kind: "chat",
        messages: [
          { role: "user", text: TURNS[0][0].text },
          { role: "assistant", text: ANSWER_CHUNKS.join(""), note: `first piece at ${TTFT_MS} ms, done at ${STREAM_DONE_MS} ms` },
        ],
        streamLast: true,
        aside: { title: "What the browser receives", items: [...ANSWER_CHUNKS.slice(0, SSE_SHOWN).map((c, i) => `${chunkTime(i)} ms  ${sseLine(c)}`), `… ${ANSWER_CHUNKS.length - SSE_SHOWN} more`], tone: "green" },
      },
      highlight: ["llm", "server", "browser"],
      packets: [
        { from: "llm", to: "server", label: "token stream", tone: "violet" },
        ...ANSWER_CHUNKS.slice(0, 4).map((c, i) => ({ from: "server", to: "browser", label: sseLine(c), sub: `${chunkTime(i)} ms`, tone: "green" as Tone })),
      ],
      viz: {
        only: "interview",
        kind: "table",
        title: "Every SSE chunk",
        columns: ["t (ms)", "SSE line", "Text so far"],
        rows: ANSWER_CHUNKS.map((c, i) => [chunkTime(i), sseLine(c), ANSWER_CHUNKS.slice(0, i + 1).join("")]),
        caption: "The event shape here is simplified — each provider has its own.",
      },
      deeper: {
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
    // 5 ─────────────────────────────────────────────────────────────
    {
      id: "window",
      title: "Too long? Keep only the latest turns",
      simple: "When the chat gets too long, the app sends only the last few turns and drops the oldest ones.",
      easy: `The AI can only read a limited amount of text at once, and every piece of text costs money. So a long chat has to be shortened. The easiest way is a **sliding window**: keep the rulebook and only the last ${WINDOW} turns. That sends ${WINDOW_INPUT} pieces instead of ${INPUT_PER_CALL[LAST]}. It is cheap and simple, but the old turns are simply forgotten.`,
      explain: `The chat must fit the {{context-window|context window}} (the most text a model can read at once), and every token costs money. A **sliding window** keeps the rules plus the last ${WINDOW} turns: ${WINDOW_INPUT} tokens instead of ${INPUT_PER_CALL[LAST]}. Cheap and simple, but the dropped turns are simply gone.`,
      detail: `Here the oldest turn — the one that mentioned France — falls out. ${
        KEPT_HAS_CITY_ONLY_INDIRECTLY ? "The city still appears in a kept answer, so the model copes this time, but older facts can vanish entirely." : "The city no longer appears anywhere in the prompt."
      } In practice, trim by a **token budget** (count with the real tokenizer, drop the oldest until it fits, and leave room for the reply) rather than by turn count.`,
      stage: {
        kind: "chat",
        messages: [
          { role: "system", text: SYSTEM.text },
          ...DROPPED_TURNS.flatMap(([u, a]) => [
            { role: "user" as const, text: u.text, dim: true, note: "dropped" },
            { role: "assistant" as const, text: a.text, dim: true },
          ]),
          { role: "assistant", text: KEPT_TURNS[KEPT_TURNS.length - 1][1].text, note: `kept: the last ${WINDOW} turns` },
          { role: "user", text: TURNS[LAST][0].text, note: "new" },
        ],
        aside: {
          title: `Sent this turn: ${WINDOW_INPUT} tokens`,
          items: ["system prompt", ...KEPT_TURNS.map(([u]) => `turn: “${u.text}”`), "the new message", `saved ${INPUT_PER_CALL[LAST] - WINDOW_INPUT} tokens`],
          tone: "blue",
        },
      },
      highlight: ["server", "history", "llm"],
      packets: [
        { from: "server", to: "history", label: `keep last ${WINDOW} turns`, tone: "slate" },
        { from: "server", to: "llm", label: `${WINDOW_INPUT} tokens (was ${INPUT_PER_CALL[LAST]})`, tone: "blue" },
      ],
      deeper: {
        math: [`window input = system + last ${WINDOW} turns + new message = ${WINDOW_INPUT} tokens`, `full history = ${INPUT_PER_CALL[LAST]} tokens → saved ${INPUT_PER_CALL[LAST] - WINDOW_INPUT}`],
      },
      log: [
        ...DROPPED_TURNS.map(([u]) => ({ tone: "rose" as Tone, cells: { op: "drop", role: "history", payload: `“${u.text}” (+ reply)` } })),
        { tone: "blue", cells: { op: "call", role: "→ llm", payload: `system + last ${WINDOW} turns + new message`, tokens: WINDOW_INPUT } },
      ],
      interviewTip: "Always budget tokens for the output too: prompt + max reply must fit the context window.",
    },
    // 6 ─────────────────────────────────────────────────────────────
    {
      id: "summary",
      title: "Or squeeze old turns into a summary",
      simple: "Before dropping old turns, the app asks a model to write a short note about them, and keeps the note.",
      easy: `A smarter way: before dropping old turns, ask the AI to write a **short note** about them, like “planning a trip to Paris”, and keep that note. The note costs only ${tok(SUMMARY)} pieces, so the AI still knows the city. The risk: a summary can lose small details, or even get something wrong.`,
      explain: `The note (“planning a trip to Paris”) keeps the gist for ${tok(SUMMARY)} tokens. Rules + note + recent turns come to ${SUMMARY_INPUT} tokens: ${SUMMARY_INPUT > WINDOW_INPUT ? `more than the window alone (${WINDOW_INPUT}) in a chat this short, but the city is not lost` : `less than the full ${INPUT_PER_CALL[LAST]}`}. The risk: summaries lose details and can get things wrong.`,
      analogy: "Minutes of a meeting instead of the full recording.",
      detail: `Common pattern: when history passes a token budget, summarise the oldest chunk (${OLD_TURNS_TOKENS} tokens here), store the summary on the thread, and keep a few recent turns verbatim. Run the summariser with a small, cheap model and a strict prompt (“keep names, numbers, decisions”). In this tiny chat the summary is not much shorter than what it replaces; the saving grows with long conversations.`,
      stage: {
        kind: "chat",
        messages: [
          { role: "system", text: SUMMARY, note: "the note, added to the system message" },
          { role: "user", text: KEPT_TURNS[KEPT_TURNS.length - 1][0].text },
          { role: "assistant", text: KEPT_TURNS[KEPT_TURNS.length - 1][1].text },
          { role: "user", text: TURNS[LAST][0].text, note: "new" },
          { role: "assistant", text: TURNS[LAST][1].text },
        ],
        streamLast: true,
        aside: {
          title: "Tokens at the last call",
          items: [`full history: ${INPUT_PER_CALL[LAST]}`, `sliding window: ${WINDOW_INPUT}`, `window + summary: ${SUMMARY_INPUT}`],
          tone: "violet",
        },
      },
      highlight: ["server", "summ", "history"],
      packets: [
        { from: "server", to: "summ", label: `old turns (${OLD_TURNS_TOKENS} tokens)`, tone: "slate" },
        { from: "summ", to: "server", label: `summary (${tok(SUMMARY)} tokens)`, tone: "violet" },
        { from: "server", to: "history", label: "store summary", tone: "slate" },
      ],
      viz: {
        only: "interview",
        kind: "bars",
        title: "Input tokens at the last call",
        items: [
          { label: "full history", value: INPUT_PER_CALL[LAST], tone: "slate" },
          { label: "sliding window", value: WINDOW_INPUT, tone: "blue" },
          { label: "window + summary", value: SUMMARY_INPUT, tone: "green" },
        ],
        format: "int",
      },
      log: [
        { tone: "violet", cells: { op: "summarise", role: "summariser", payload: SUMMARY, tokens: tok(SUMMARY) } },
        { tone: "green", cells: { op: "call", role: "→ llm", payload: "system + summary + last turns + new", tokens: SUMMARY_INPUT } },
      ],
      interviewTip: "Name the risk of summaries: they blur details and can introduce errors, so pin critical facts explicitly.",
    },
    // 7 ─────────────────────────────────────────────────────────────
    {
      id: "vector",
      title: "Remember facts for later",
      simple: "Important facts are saved, and only the ones that match the new question are added to the prompt.",
      easy: `For a very long relationship, even a summary is not enough. So the app **saves important facts** separately, like notes about a friend. Each fact is turned into a list of numbers that captures its meaning. When you ask “${QUERY.text}”, the app finds the saved fact whose meaning is **closest**: “${MEMORIES[BEST].text}” (match score ${f(SIMS[BEST], 2)} out of 1). Only that one fact is added to the prompt.`,
      explain: `Each saved fact is turned into an {{embedding}} (a list of numbers that captures its meaning). For “${QUERY.text}”, the app finds the closest fact by {{cosine-similarity|cosine similarity}}: “${MEMORIES[BEST].text}” scores ${f(SIMS[BEST], 2)}. Only that fact goes into the prompt.`,
      analogy: "A notebook about each friend: before replying you flip to the page that matters, not read the whole book.",
      detail: `This scales to thousands of facts without bloating every request — the same retrieval idea as {{rag|RAG}}, applied to the user's own history. Decide when to write memories (e.g. a small model extracts durable facts after each turn), resolve conflicts (newer fact wins), and let users see and delete them.\n\nTrade-offs: windows are simple but forget; summaries compress but blur; vector memory scales but can retrieve the wrong thing.`,
      stage: {
        kind: "chat",
        messages: [
          { role: "system", text: `Known about this user: ${MEMORIES[BEST].text}.`, note: "added by the app from memory" },
          { role: "user", text: QUERY.text },
          { role: "assistant", text: MEM_ANSWER },
        ],
        streamLast: true,
        aside: { title: "Memory notebook (match score)", items: SORTED_MEMS.map((m) => `${m.i === BEST ? "✓ " : ""}${m.text} · ${f(m.s, 2)}`), tone: "green" },
      },
      highlight: ["server", "vmem", "llm"],
      packets: [
        { from: "server", to: "vmem", label: `embed “${QUERY.text}”`, tone: "green" },
        { from: "vmem", to: "server", label: `top-1: ${MEMORIES[BEST].text}`, sub: `cos = ${f(SIMS[BEST], 3)}`, tone: "green" },
        { from: "server", to: "llm", label: "prompt + 1 memory", tone: "blue" },
      ],
      viz: {
        only: "interview",
        kind: "bars",
        title: `Similarity to “${QUERY.text}”`,
        items: MEMORIES.map((m, i) => ({ label: m.text, value: SIMS[i], tone: (i === BEST ? "green" : "blue") as Tone })),
        max: 1,
        format: "fixed3",
        caption: "Toy 4-number vectors [pets, seating, food, home]; real embeddings have hundreds of dimensions.",
      },
      deeper: {
        math: ["cos(q, m) = (q · m) / (|q| |m|)", `q = [${QUERY.v.join(", ")}],  m = [${MEMORIES[BEST].v.join(", ")}]`, `cos = ${f(SIMS[BEST], 4)}`],
      },
      log: MEMORIES.map((m, i) => ({ tone: (i === BEST ? "green" : "blue") as Tone, cells: { op: i === BEST ? "retrieve ✓" : "score", role: "vector memory", payload: `${m.text} · cos ${f(SIMS[i], 3)}` } })),
      interviewTip: "Name the trade-off: windows are simple but forget; summaries compress but blur; vector memory scales but can retrieve the wrong thing.",
    },
    // 8 ─────────────────────────────────────────────────────────────
    {
      id: "tools",
      title: "Asking your code for help (tools)",
      simple: "The AI cannot look things up itself, so it asks your app to run a task and then uses the result.",
      easy: `The AI writes well, but it cannot check today’s weather by itself. So we give it a **menu of tasks** it may ask for. Asked about rain, it replies with a request: run “${TOOL_CALL.name}” for ${TOOL_CALL.arguments.city}. The app runs the task, hands the result back, and the AI writes the final answer using it.`,
      explain: `With {{tool-calling|tool calling}} you describe functions the model may use. Asked about rain, it replies with a request: run \`${TOOL_CALL.name}\` for ${TOOL_CALL.arguments.city}. Your code runs it, sends the result back as a **tool** message, and the model writes the answer.`,
      analogy: "A manager who can't use the database: they write a precise request slip, you run the query, and they use the printout to answer the client.",
      detail:
        "You send tool definitions (name, description, JSON schema for the arguments). The model may respond with a structured tool call instead of text. Your backend **validates** the arguments, executes the function, appends the result as a tool message, and calls the model again. That is two model calls for one question; agents repeat the loop until the model stops asking for tools. The model never runs code itself, and tool output is untrusted input to the next call (it can carry prompt injection).",
      stage: {
        kind: "chat",
        messages: [
          { role: "user", text: "Do I need an umbrella in Paris tomorrow?" },
          { role: "assistant", text: JSON.stringify({ tool_call: TOOL_CALL }), note: "not text: a request to run a function" },
          { role: "tool", text: JSON.stringify(TOOL_RESULT), note: "your code ran it" },
          { role: "assistant", text: FINAL, note: "second model call" },
        ],
        streamLast: true,
        aside: { title: "The round trip", items: ["1. app sends messages + tool list", `2. model asks for ${TOOL_CALL.name}`, "3. app checks the arguments and runs it", "4. app sends the result back", "5. model writes the answer"], tone: "amber" },
      },
      highlight: ["server", "llm", "tool"],
      packets: [
        { from: "server", to: "llm", label: "messages + tool schema", tone: "blue" },
        { from: "llm", to: "server", label: `tool_call ${TOOL_CALL.name}`, sub: JSON.stringify(TOOL_CALL.arguments), tone: "amber" },
        { from: "server", to: "tool", label: `${TOOL_CALL.name}("Paris", "tomorrow")`, tone: "amber" },
        { from: "tool", to: "server", label: JSON.stringify({ rain_chance: TOOL_RESULT.rain_chance, temp_c: TOOL_RESULT.temp_c }), tone: "amber" },
        { from: "server", to: "llm", label: "+ tool result message", tone: "blue" },
        { from: "llm", to: "server", label: "final answer", tone: "green" },
      ],
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
