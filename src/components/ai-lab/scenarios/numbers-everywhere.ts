import { beginnerTopic } from "./_beginner";

/* Topic 3 (Start here): everything the AI touches becomes numbers. */

// A 5×5 picture of the letter "L": 9 = dark ink, 0 = white paper.
const L = [
  [9, 0, 0, 0, 0],
  [9, 0, 0, 0, 0],
  [9, 0, 0, 0, 0],
  [9, 0, 0, 0, 0],
  [9, 9, 9, 9, 9],
];

// A sound wave: one second sampled at a few instants.
const WAVE: [number, number][] = Array.from({ length: 25 }, (_, i) => [i, Math.round(Math.sin((i / 24) * Math.PI * 4) * 100) / 100]);

const scenario = beginnerTopic({
  id: "numbers-everywhere",
  title: "Everything becomes numbers",
  tagline: "Pictures, words and sound are turned into numbers before AI can read them.",
  imagine:
    "Imagine a calculator that wants to read a poem or look at a photo. It can't: it only understands numbers. So we translate everything into numbers first: every dot of a photo, every word of a sentence, every moment of a sound. Once it is all numbers, the AI can work.",
  recap: [
    "Computers only do maths, so **pictures, words and sound are converted to numbers** first.",
    "A **picture** is a grid of numbers (one per tiny dot, called a pixel). A **colour** is three numbers: red, green, blue.",
    "**Words** become number codes (tokens), and then lists of numbers that capture meaning, so similar words sit close together.",
  ],
  plain:
    "AI never sees a photo or a sentence the way you do. It receives long lists of numbers. A photo becomes a grid of brightness numbers, a word becomes a code, and a sound becomes a wiggly line of numbers. This translation step comes before any learning.",
  definition:
    "Machine learning models are mathematical functions, so inputs must be numeric. Images are arrays of {{pixel|pixels}} (each with {{rgb|RGB}} values), text is split into {{token|tokens}} mapped to integer ids and then to {{embedding|embedding}} vectors that place similar meanings close together, and audio is a sequence of amplitude samples over time.",
  analogy: "Translating a poem into a language the calculator speaks: numbers.",
  facts: [
    ["Pixel", "one tiny dot of a picture, stored as numbers"],
    ["RGB", "a colour as three numbers: red, green, blue (0 to 255)"],
    ["Token", "a small chunk of text, given a number code"],
    ["Embedding", "a list of numbers that captures meaning"],
    ["Audio", "air pressure measured thousands of times a second"],
  ],
  whereUsed: "Every AI product does this first step: photo apps, voice assistants, translators and chatbots all convert their input into numbers before anything else happens.",
  steps: [
    {
      id: "why",
      title: "Computers only understand numbers",
      simple: "A computer can only calculate, so everything must become numbers first.",
      easy: "Inside, a computer can only add, multiply and compare **numbers**. It has no eyes or ears. So before an AI can look at a photo, read a sentence or listen to a voice, we **translate that thing into numbers**. The next steps show how, for pictures, colours, words, meaning and sound.",
      explain: "Models compute with tensors of floating-point numbers; all modalities are encoded numerically as the first stage of the pipeline.",
      stage: {
        kind: "cards",
        zones: [
          { id: "a", label: "What you see", icon: "person", tone: "blue", cards: [{ id: "a1", title: "a photo", tone: "blue" }, { id: "a2", title: "a sentence", tone: "blue" }, { id: "a3", title: "a voice", tone: "blue" }] },
          { id: "b", label: "Translate", icon: "box", tone: "violet", cards: [{ id: "b1", title: "turn into numbers", tone: "violet" }] },
          { id: "c", label: "What the AI gets", icon: "tray", tone: "green", cards: [{ id: "c1", title: "0.2, 0.9, 0.1, 0.7 …", sub: "only numbers", tone: "green" }] },
        ],
      },
    },
    {
      id: "picture",
      title: "A picture is a grid of numbers",
      simple: "Cut a picture into tiny dots and give each dot a number for how dark it is.",
      easy: "Cut a picture into a grid of tiny dots called **pixels**. Give each dot a number for how dark it is: 0 for white paper, 9 for thick ink. Here is the letter **L** drawn in a 5 by 5 grid. Look at the numbers: the 9s trace the shape. A real photo works the same way, just with millions of dots.",
      explain: "A greyscale image is a 2-D array of intensities (usually 0 to 255). A 1000×1000 photo has a million numbers per channel.",
      stage: {
        kind: "viz",
        viz: { kind: "matrices", title: "The letter L as numbers (9 = ink, 0 = paper)", items: [{ name: "5×5 pixels", values: L, tone: "slate" }], format: "int", caption: "A computer sees only the numbers, not the letter." },
      },
    },
    {
      id: "colour",
      title: "A colour is three numbers",
      simple: "Every colour is a mix of red, green and blue, each given a number from 0 to 255.",
      easy: "A coloured dot needs three numbers: how much **red**, **green** and **blue**, each from 0 (none) to 255 (full). Full red with no green or blue is red. Red and green together make **yellow**. All three full make **white**, none at all is **black**. A coloured photo is three grids of numbers stacked together.",
      explain: "RGB colour model: each pixel has 3 channels, so a colour image is height × width × 3 numbers.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Colours as numbers (R, G, B)",
          columns: ["colour", "red", "green", "blue"],
          rows: [
            ["red", 255, 0, 0],
            ["green", 0, 255, 0],
            ["yellow", 255, 255, 0],
            ["orange", 255, 165, 0],
            ["white", 255, 255, 255],
            ["black", 0, 0, 0],
          ],
          highlightRow: 2,
        },
      },
    },
    {
      id: "words",
      title: "Words become number codes",
      simple: "A sentence is cut into small pieces called tokens, and each piece gets a number code.",
      easy: "To a computer a sentence is just letters. So we cut it into small pieces called **tokens**, usually words or word parts, and give each a **number code** from a big dictionary. “I love chai” might become 40, 1842, 2991. Now the sentence is a list of numbers. (The codes here are made up, real ones differ by AI.)",
      explain: "Tokenisation (e.g. byte-pair encoding) maps text to integer ids from a fixed vocabulary of tens of thousands of pieces.",
      stage: {
        kind: "viz",
        viz: {
          kind: "tokens",
          title: "“I love chai” as tokens and codes",
          tokens: [
            { text: "I", id: 40, tone: "blue" },
            { text: " love", id: 1842, tone: "violet" },
            { text: " chai", id: 2991, tone: "amber" },
          ],
          caption: "Illustrative ids. Every AI has its own dictionary.",
        },
      },
    },
    {
      id: "meaning",
      title: "Numbers can hold meaning",
      simple: "Each word gets a list of numbers placed so that similar words end up close together.",
      easy: "A plain code like 1842 says nothing about meaning. So the AI also gives each word a **list of numbers that acts like a position on a map**. Words with similar meaning land **close together**: cat near dog, car near bus. The AI can then tell that “cat” and “dog” are alike, and that “car” is different. This is called an **embedding**. (Map below is simplified to two numbers.)",
      explain: "Embeddings are learned dense vectors (hundreds to thousands of dimensions). Distance or angle between vectors measures semantic similarity. Shown here projected to 2-D.",
      stage: {
        kind: "map",
        mode: "map",
        points: [
          { x: 1.2, y: 8, label: "cat", tone: "amber" },
          { x: 2, y: 7.2, label: "dog", tone: "amber" },
          { x: 1.6, y: 8.8, label: "kitten", tone: "amber" },
          { x: 8, y: 2, label: "car", tone: "blue" },
          { x: 8.9, y: 1.2, label: "bus", tone: "blue" },
          { x: 7.4, y: 1.1, label: "truck", tone: "blue" },
          { x: 5, y: 5, label: "tea", tone: "green" },
        ],
        note: "close together = similar meaning",
      },
    },
    {
      id: "sound",
      title: "Sound is numbers over time",
      simple: "A sound is measured thousands of times a second, and each measurement is a number.",
      easy: "Sound is air wobbling. A microphone **measures that wobble many thousands of times a second**, and each measurement is a number going up and down. Plot them and you get a wavy line. A voice assistant turns that long list of numbers into words. A pure steady tone, like this one, is a smooth wave.",
      explain: "Audio is a 1-D time series of amplitude samples (e.g. 16,000 per second), often turned into a spectrogram before modelling.",
      stage: {
        kind: "viz",
        viz: { kind: "plot", title: "A sound wave as numbers", series: [{ label: "wobble", points: WAVE, tone: "cyan" }], x: [0, 24], y: [-1.2, 1.2], xLabel: "time", yLabel: "loudness", caption: "Each dot is one measurement." },
      },
    },
    {
      id: "all",
      title: "The same trick for everything",
      simple: "Photos, text, sound, even clicks: turn it into numbers, then the AI can learn.",
      easy: "That is the whole trick. **Whatever the AI must handle, we turn it into numbers first.** Then it can spot patterns in those numbers. The rest of this lab is about what the AI does with them next.",
      explain: "A unified numeric representation is what lets one family of models (neural networks) handle every modality.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "How each kind of data becomes numbers",
          columns: ["Data", "Becomes", "Example"],
          rows: [
            ["Photo", "grid of pixel numbers", "1000 × 1000 × 3"],
            ["Colour", "3 numbers", "yellow = 255, 255, 0"],
            ["Text", "token codes, then meaning lists", "“chai” → 2991 → [0.2, 0.7, …]"],
            ["Sound", "measurements over time", "16,000 numbers a second"],
            ["Your viewing history", "counts and scores", "watched 12 cricket clips"],
          ],
        },
      },
    },
  ],
  interview: [
    {
      id: "ne-1",
      level: "fresher",
      q: "How does a model read an image or a sentence?",
      answer: "It can't read them directly. An image is converted to a grid of pixel values and text is tokenised into integer ids and then mapped to embedding vectors. The model then does maths on those numbers.",
      lookFor: "Pixel arrays for images, tokenisation plus embeddings for text.",
      wrong: "“It looks at the picture like a human.”",
    },
    {
      id: "ne-2",
      level: "fresher",
      q: "What is an embedding, in simple terms?",
      answer: "A list of numbers that represents the meaning of something such as a word, so that similar things have similar numbers, which means they sit close together in space.",
      lookFor: "Meaning as position; similar items close together.",
      wrong: "“An embedding is a word's spelling.”",
    },
  ],
  quiz: [
    {
      id: "ne-q1",
      q: "Why must data be turned into numbers?",
      options: ["Numbers use less storage", "Models are maths and only compute with numbers", "It makes the data private", "AI cannot store text"],
      correct: 1,
      explain: "A model is a mathematical function, so its inputs must be numeric.",
    },
    {
      id: "ne-q2",
      q: "How many numbers describe one colour dot (RGB)?",
      options: ["1", "2", "3", "256"],
      correct: 2,
      explain: "Red, green and blue: three numbers, each from 0 to 255.",
    },
    {
      id: "ne-q3",
      q: "On the meaning map, which words sit close together?",
      options: ["cat and dog", "cat and bus", "car and tea", "dog and truck"],
      correct: 0,
      explain: "Words with similar meaning get similar numbers, so they land near each other.",
    },
    {
      id: "ne-q4",
      q: "What is a token?",
      options: ["A password", "A small chunk of text given a number code", "A type of image", "A GPU part"],
      correct: 1,
      explain: "Text is cut into tokens (words or word parts) and each gets an id.",
    },
  ],
});

export default scenario;
