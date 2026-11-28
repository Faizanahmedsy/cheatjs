import { beginnerTopic } from "./_beginner";

/* Topic 8 (Start here): the whole ChatGPT story in plain words, the bridge into the core path. */

const scenario = beginnerTopic({
  id: "how-chatgpt-works",
  title: "How ChatGPT works in 5 minutes",
  tagline: "It reads a huge amount of text, then repeatedly predicts the next word.",
  imagine:
    "Imagine a friend who has read an enormous library and is brilliant at one game: given the start of a sentence, guess the next word. If you ask them to keep playing, word after word, they end up writing whole answers. That is the core of ChatGPT and other chatbots.",
  recap: [
    "A chatbot is a language model that **predicts the next word**, over and over, which produces whole answers.",
    "It first **reads a huge amount of text** to learn language and facts, then is **taught to follow instructions** and be helpful and safe.",
    "It can be **confidently wrong** (hallucination), so check important facts. The next topics show each part in detail.",
  ],
  plain:
    "ChatGPT is a very large neural network trained to guess the next word in a piece of text. By repeating that guess word after word, it writes answers. It learned from a vast amount of text, then was trained again to be helpful. It doesn't look things up by default, so it can sound sure and still be wrong.",
  definition:
    "A {{llm|large language model}} (LLM) is a {{neural-network|neural network}} with billions of {{parameter|parameters}} trained to predict the next {{token}} given the previous ones. {{pretraining|Pre-training}} on huge text corpora gives it language and knowledge; instruction tuning and human feedback make it follow a {{prompt}} helpfully and safely. Text is generated one token at a time, and the model can {{hallucination|hallucinate}}.",
  analogy: "A friend who has read a whole library and plays “guess the next word” brilliantly.",
  facts: [
    ["Core skill", "predict the next word (token)"],
    ["Learned from", "a huge amount of text from books and the web"],
    ["Then taught", "to follow instructions and be helpful and safe"],
    ["Writes by", "repeating the next-word guess, one word at a time"],
    ["Weakness", "can sound sure and be wrong"],
  ],
  whereUsed: "ChatGPT, Claude, Gemini, coding assistants, customer-support bots and writing tools are all built this way.",
  steps: [
    {
      id: "next-word",
      title: "The one trick: guess the next word",
      simple: "Given some text, the AI scores every possible next word and picks a likely one.",
      easy: "Show the AI “The capital of France is”. It doesn't *know* the answer like a person. It scores every possible next word by how likely it is, based on all the text it has read. **“Paris” scores very high**, so that is what it picks. The scores below are an illustration.",
      explain: "A language model outputs a probability distribution over the vocabulary for the next token; decoding picks or samples from it.",
      stage: {
        kind: "tokens",
        mode: "next",
        tokens: ["The", " capital", " of", " France", " is"],
        candidates: [
          { text: " Paris", p: 0.92 },
          { text: " a", p: 0.03 },
          { text: " Lyon", p: 0.02 },
          { text: " the", p: 0.015 },
          { text: " Rome", p: 0.01 },
        ],
        chosen: 0,
        note: "Illustrative probabilities",
      },
    },
    {
      id: "repeat",
      title: "Repeat it, and answers appear",
      simple: "Add the chosen word, guess again, and again. Many guesses in a row make a whole reply.",
      easy: "Now add the chosen word to the text and guess the next one, then again, and again. **Each new word is one more guess**, and together they form a full sentence, a paragraph, or code. That is how a chatbot “writes”: nothing more than a very good next-word guesser in a loop. This is also why you see its reply appear word by word.",
      explain: "Autoregressive generation: feed the output token back as input, sample the next, repeat until an end token.",
      stage: {
        kind: "tokens",
        mode: "generate",
        tokens: ["The", " capital", " of", " France", " is", " Paris", ".", " It", " is", " known", " for", " the", " Eiffel", " Tower", "."],
        promptCount: 5,
        note: "Your text is first. Everything after it is written one word at a time.",
      },
    },
    {
      id: "reading",
      title: "Where its knowledge comes from",
      simple: "It practised on a huge amount of text, so it picked up language, facts and styles.",
      easy: "To get good at guessing the next word, the AI practises on an **enormous** amount of text: books, articles, websites, code. A person might read a billion words in a lifetime, a large AI practises on **trillions**. By doing that it quietly picks up grammar, facts, writing styles and how to code. The practice phase is called **pre-training**, and it needs thousands of GPUs for weeks.",
      explain: "Pre-training: self-supervised next-token prediction over trillions of tokens (order of magnitude); compute is thousands of GPUs for weeks or months.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Rough scale (orders of magnitude)",
          columns: ["Thing", "About how many words"],
          rows: [
            ["A novel", "around 80 thousand"],
            ["Everything one person reads in a lifetime", "around a billion"],
            ["What a large AI practises on", "trillions"],
          ],
          highlightRow: 2,
          caption: "Rounded, to show the gap, not exact figures.",
        },
      },
    },
    {
      id: "taught",
      title: "Then it is taught to be helpful",
      simple: "After practice, it is trained again to follow instructions and give safe, useful answers.",
      easy: "A model fresh from practice is only an **autocomplete**: ask it a question and it might just continue with more questions. So it gets a second round of training. First it studies many examples of **instructions with good answers**. Then people **rate its replies**, and it learns to prefer the helpful, honest, safe ones. That turns an autocomplete into an **assistant**.",
      explain: "Post-training: supervised fine-tuning on instruction–response pairs, then preference optimisation (RLHF / DPO) from human or AI feedback.",
      stage: {
        kind: "cards",
        zones: [
          { id: "a", label: "1. Practice", icon: "doc", tone: "slate", cards: [{ id: "a1", title: "Pre-training", sub: "read trillions of words", tone: "slate" }] },
          { id: "b", label: "2. Instructions", icon: "box", tone: "blue", cards: [{ id: "b1", title: "Learn to follow requests", sub: "examples of good answers", tone: "blue" }] },
          { id: "c", label: "3. Feedback", icon: "check", tone: "green", cards: [{ id: "c1", title: "Prefer helpful, safe replies", sub: "people rate answers", tone: "green" }] },
        ],
      },
    },
    {
      id: "chat",
      title: "What happens when you send a message",
      simple: "Your message becomes tokens, the model writes the reply word by word, and you see it stream in.",
      easy: "When you type a message, it is cut into **tokens** and turned into numbers (you saw this earlier). The model reads them all, guesses the next word, adds it, guesses again, and so on. It also sees the earlier part of your chat, so it can follow the conversation. The reply streams to your screen as it is written.",
      explain: "Prompt + conversation history → tokenisation → forward passes producing tokens until a stop token → detokenise and stream.",
      stage: {
        kind: "chat",
        messages: [
          { role: "user", text: "Give me two tips to study for exams." },
          { role: "assistant", text: "1. Study in short sessions with breaks. 2. Test yourself instead of only re-reading.", note: "written one word at a time" },
        ],
        streamLast: true,
        aside: { title: "It sees", items: ["your new message", "the earlier chat", "instructions from the app"], tone: "violet" },
      },
    },
    {
      id: "wrong",
      title: "Why it is sometimes confidently wrong",
      simple: "It predicts likely words, not checked facts, so it can state false things in a sure tone.",
      easy: "The AI picks words that **sound likely**. It doesn't pause to check a fact. When it doesn't know, it may still produce a smooth, confident answer that is **made up**. This is called a **hallucination**. Below, we asked about something that doesn't exist, and the AI invented a nice answer instead of saying it didn't know. **Always check important facts.**",
      explain: "LLMs optimise plausibility, not truth. Mitigations: retrieval of real sources (RAG), tools, citations, evals, and asking the model to say when it is unsure.",
      stage: {
        kind: "chat",
        messages: [
          { role: "user", text: "Who won the 2031 Mars Olympics 100 m?" },
          { role: "assistant", text: "The 2031 Mars Olympics 100 m was won by Arjun Rao in 9.4 seconds.", note: "invented: there is no such event" },
        ],
      },
    },
    {
      id: "use-well",
      title: "How to use it well, and where to go next",
      simple: "Be clear, check facts that matter, and give it real documents when accuracy counts.",
      easy: "To get good answers: **be specific** about what you want, give **examples** or the text to work on, and **check facts** that matter. For work where accuracy counts, systems feed the AI real documents so it answers from them. You are now ready for the main path: **topic 9** shows the numbers behind learning, and later topics cover the transformer (15), prompting (18) and RAG (21).",
      explain: "Good practice: precise prompts, supplying context, verification, and grounding with retrieval. The next topics build each piece in depth.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Using AI well",
          columns: ["Do", "Why"],
          rows: [
            ["Be specific about what you want", "vague asks get vague answers"],
            ["Paste the text or data to work on", "it answers from what it sees"],
            ["Check facts that matter", "it can be confidently wrong"],
            ["Ask it to say when it is unsure", "reduces made-up answers"],
          ],
        },
      },
    },
  ],
  interview: [
    {
      id: "gc-1",
      level: "fresher",
      q: "How does ChatGPT work at a high level?",
      answer: "It is a large language model, a transformer neural network, pre-trained to predict the next token on a huge text corpus. It then gets instruction tuning and feedback-based training so it follows requests helpfully and safely. At run time it generates a reply one token at a time.",
      lookFor: "Next-token prediction, pre-training, then alignment, autoregressive generation.",
      wrong: "“It searches Google and pastes the result.”",
    },
    {
      id: "gc-2",
      level: "fresher",
      q: "What is a hallucination and why does it happen?",
      answer: "A hallucination is a fluent but false or unsupported output. It happens because the model optimises for plausible next tokens, not verified truth, so when it lacks knowledge it can still produce a confident-sounding answer. Retrieval, tools and verification reduce it.",
      lookFor: "Plausibility vs truth, plus at least one mitigation.",
      wrong: "“The model is lying on purpose.”",
    },
  ],
  quiz: [
    {
      id: "gc-q1",
      q: "What is the basic skill a chatbot repeats?",
      options: ["Searching the web", "Predicting the next word", "Drawing pictures", "Counting letters"],
      correct: 1,
      explain: "It guesses the next token again and again to write a reply.",
    },
    {
      id: "gc-q2",
      q: "What is the first training phase called?",
      options: ["Pre-training on lots of text", "Deployment", "Prompting", "Tokenising"],
      correct: 0,
      explain: "Pre-training: practising next-word prediction on a huge amount of text.",
    },
    {
      id: "gc-q3",
      q: "Why can a chatbot state false things confidently?",
      options: ["It likes to lie", "It picks plausible words and does not check facts", "It has no training", "It is offline"],
      correct: 1,
      explain: "Plausible is not the same as true. That is hallucination.",
    },
    {
      id: "gc-q4",
      q: "What turns a raw autocomplete model into a helpful assistant?",
      options: ["More GPUs only", "Training on instructions and human feedback", "Deleting data", "A faster internet"],
      correct: 1,
      explain: "Instruction tuning plus feedback teach it to help, be honest and stay safe.",
    },
  ],
});

export default scenario;
