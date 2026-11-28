import { beginnerTopic } from "./_beginner";

/* Topic 4 (Start here): the learning loop with one dial and no formulas. Every score below is computed from the fruit list. */

type Fruit = { name: "apple" | "banana"; yellow: number; y: number };
const TRAIN: Fruit[] = [
  { name: "apple", yellow: 1, y: 3 },
  { name: "apple", yellow: 2, y: 7 },
  { name: "apple", yellow: 2.5, y: 4.5 },
  { name: "apple", yellow: 3, y: 6 },
  { name: "apple", yellow: 4.5, y: 2.5 },
  { name: "banana", yellow: 5.5, y: 7.5 },
  { name: "banana", yellow: 7, y: 3.5 },
  { name: "banana", yellow: 8, y: 6.5 },
  { name: "banana", yellow: 8.5, y: 2 },
  { name: "banana", yellow: 9.5, y: 5 },
];
const TEST: Fruit[] = [
  { name: "apple", yellow: 3.5, y: 4 },
  { name: "apple", yellow: 4.8, y: 6.5 },
  { name: "banana", yellow: 6, y: 3 },
  { name: "banana", yellow: 9, y: 7 },
];

/** The dial: anything yellower than `t` is called a banana. */
const guess = (f: Fruit, t: number) => (f.yellow > t ? "banana" : "apple");
const wrong = (set: Fruit[], t: number) => set.filter((f) => guess(f, t) !== f.name);
const acc = (set: Fruit[], t: number) => Math.round(((set.length - wrong(set, t).length) / set.length) * 100);

const T1 = 1.5; // first, random-looking dial setting
const T2 = 3.5; // after one correction
const T3 = 5.0; // after more
const pts = (set: Fruit[]) => set.map((f) => ({ x: f.yellow, y: f.y, tone: (f.name === "apple" ? "rose" : "amber") as "rose" | "amber", label: f.name }));
const line = (t: number): [number, number][] => [
  [t, 0],
  [t, 10],
];

const scenario = beginnerTopic({
  id: "how-ai-learns",
  title: "How a machine learns, in pictures",
  tagline: "Guess, check, adjust, repeat. No formulas yet.",
  imagine:
    "Imagine a fruit seller's new helper who must sort apples from bananas. They have one dial: “how yellow counts as a banana?”. They guess, the seller says “wrong!”, and they turn the dial a little. After many tries the dial sits in the right place. That turning-the-dial loop is what all machine learning does.",
  recap: [
    "The machine **guesses**, is **told how wrong it was**, **adjusts a dial**, and repeats. Each round it gets a bit better.",
    "**Training** is the learning phase. After that the dial is frozen and we **use** the AI on new things.",
    "We then test it on **fruit it has never seen**, to check it truly learned the idea and didn't just memorise.",
  ],
  plain:
    "Learning here means turning an inner dial until the guesses are good. The machine guesses, gets told which guesses were wrong, nudges the dial and tries again. Real AI has billions of dials instead of one, but the loop is exactly this.",
  definition:
    "{{training|Training}} repeats four moves: predict, compare with the correct answer to measure the error ({{loss}}), adjust the model's {{parameter|parameters}} to reduce it, and repeat. Once good, parameters are frozen and the model is used for {{inference}} on new data, and scored on held-out examples it never trained on.",
  analogy: "A helper turning one dial after each “wrong!” from the seller until the sorting is right.",
  facts: [
    ["Dial", "a parameter: a number the AI can adjust"],
    ["Guess", "the AI's prediction for one example"],
    ["Mistakes", "guesses that don't match the right answer"],
    ["Loop", "guess, check, adjust, repeat"],
    ["Real models", "billions of dials, same loop"],
  ],
  whereUsed: "Every trained AI, from a spam filter with a few hundred dials to a chatbot with billions, learned by this same loop.",
  steps: [
    {
      id: "examples",
      title: "Start with examples that have answers",
      simple: "We have 10 fruits. We know how yellow each is, and whether it is an apple or banana.",
      easy: "Here are **10 fruits** we already know the answer for. Left to right shows how **yellow** each one is. Red dots are apples, yellow dots are bananas. Apples are mostly less yellow and bananas more yellow, but the two kinds meet in the middle, so it isn't trivial. Up and down is just spreading the dots out so you can see them.",
      explain: "A labelled 1-feature dataset (yellowness) with two classes. The decision is a threshold on that feature, the single parameter we will learn.",
      stage: { kind: "viz", viz: { kind: "scatter", title: "10 known fruits", points: pts(TRAIN), x: [0, 11], y: [0, 10], caption: "red = apple, yellow = banana. Side to side = how yellow." } },
    },
    {
      id: "first-guess",
      title: "The first guess is poor",
      simple: "The dial starts in a bad place, so many fruits are sorted wrongly.",
      easy: `The helper starts with the dial at **${T1}**: “anything yellower than ${T1} is a banana”. The dashed line shows the dial. That is a bad setting. It calls most apples bananas. Out of 10 fruits, **${wrong(TRAIN, T1).length} are wrong**, so only **${acc(TRAIN, T1)}%** are correct. Everyone starts bad, and that is fine.`,
      explain: `Initial threshold t = ${T1}: accuracy ${acc(TRAIN, T1)}% (${wrong(TRAIN, T1).length} errors of ${TRAIN.length}). Real models start from random parameters.`,
      stage: { kind: "viz", viz: { kind: "scatter", title: `Dial at ${T1}: ${acc(TRAIN, T1)}% correct`, points: pts(TRAIN), boundary: line(T1), x: [0, 11], y: [0, 10], caption: "Right of the line = called banana. Left = called apple." } },
    },
    {
      id: "mistakes",
      title: "Check which guesses were wrong",
      simple: "We compare each guess with the real answer and list the mistakes.",
      easy: "Now the seller checks. For every fruit we compare the **guess** with the **real answer**. The mistakes are the useful part: they tell the helper which way to turn the dial. Here the wrong ones are real apples that were called bananas.",
      explain: "The error signal (loss) counts or weights the mismatches. Training uses it to decide the direction and size of the next adjustment.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: `Checking with the dial at ${T1}`,
          columns: ["fruit", "how yellow", "AI said", "real answer", "result"],
          rows: TRAIN.map((f) => [f.name, f.yellow, guess(f, T1), f.name, guess(f, T1) === f.name ? "right" : "WRONG"]),
          highlightRow: TRAIN.findIndex((f) => guess(f, T1) !== f.name),
        },
      },
    },
    {
      id: "adjust",
      title: "Turn the dial a little",
      simple: "The mistakes say “move the dial right”, so the helper turns it up a bit.",
      easy: `Most mistakes were apples called bananas, so the dial is **too low**. The helper turns it up to **${T2}**. Now fewer apples are called bananas: **${acc(TRAIN, T2)}%** correct, up from ${acc(TRAIN, T1)}%. One small turn made it better. The size of each turn matters: too big and you overshoot, too small and it takes forever.`,
      explain: `One update moves t from ${T1} to ${T2}; accuracy ${acc(TRAIN, T1)}% → ${acc(TRAIN, T2)}%. In real training the step comes from the gradient of the loss, scaled by the learning rate.`,
      stage: { kind: "viz", viz: { kind: "scatter", title: `Dial at ${T2}: ${acc(TRAIN, T2)}% correct`, points: pts(TRAIN), boundary: line(T2), x: [0, 11], y: [0, 10], caption: "The line moved right and fixed some mistakes." } },
    },
    {
      id: "repeat",
      title: "Repeat until it is good",
      simple: "Guess, check, adjust again and again. Each round it improves, until it stops getting better.",
      easy: `The helper repeats: guess, check, turn. Round by round the score climbs, and the dial settles around **${T3}**, where all ${TRAIN.length} fruits are sorted right. When more turns stop helping, training is done. This loop, run millions of times with billions of dials, is how every modern AI is trained.`,
      explain: "Gradient-descent style loop: predict, measure loss, update parameters, repeat until the validation score stops improving (convergence / early stopping).",
      stage: {
        kind: "viz",
        viz: {
          kind: "bars",
          title: "Correct guesses on the 10 known fruits (%)",
          items: [
            { label: `round 1 (dial ${T1})`, value: acc(TRAIN, T1), tone: "rose" },
            { label: `round 2 (dial ${T2})`, value: acc(TRAIN, T2), tone: "amber" },
            { label: `round 3 (dial ${T3})`, value: acc(TRAIN, T3), tone: "green" },
          ],
          max: 100,
          format: "fixed1",
        },
      },
    },
    {
      id: "use",
      title: "Training is over, now we use it",
      simple: "The dial is now frozen. We show it a new fruit and it answers instantly.",
      easy: "Learning has two phases. **Training** is practice: the dial keeps moving. Then comes **using** it (called *inference*): the dial is **frozen** and we simply hand it new fruit to sort. A phone's face unlock works this way. It learned long ago on powerful computers, and now just answers quickly.",
      explain: "Training updates parameters and is expensive; inference runs the frozen model forward only, and is what users experience.",
      stage: {
        kind: "cards",
        zones: [
          { id: "t", label: "Training (practice)", icon: "box", tone: "amber", cards: [{ id: "t1", title: "Dial keeps moving", sub: "uses known fruits", tone: "amber" }] },
          { id: "f", label: "Frozen AI", icon: "check", tone: "violet", cards: [{ id: "f1", title: `Dial fixed at ${T3}`, tone: "violet" }] },
          { id: "n", label: "Using it", icon: "answer", tone: "green", cards: [{ id: "n1", title: "New fruit: 6.0 yellow", sub: "answer: banana", tone: "green" }] },
        ],
      },
    },
    {
      id: "unseen",
      title: "The real test: fruit it has never seen",
      simple: "We check the AI on fruits it never practised on, to be sure it really learned.",
      easy: `A helper who memorised the ten fruits would look perfect on them. So we test on **${TEST.length} new fruits** hidden during practice. With the dial at ${T3}, the score on these unseen fruits is **${acc(TEST, T3)}%**. That is the honest number. If the score on new fruit is much worse than on practice fruit, the AI memorised instead of learning, which is called **overfitting**.`,
      explain: `Held-out test accuracy at t = ${T3}: ${acc(TEST, T3)}% on ${TEST.length} unseen examples. A large gap between training and test accuracy signals overfitting.`,
      stage: { kind: "viz", viz: { kind: "scatter", title: `New fruits, dial at ${T3}: ${acc(TEST, T3)}% correct`, points: pts(TEST), boundary: line(T3), x: [0, 11], y: [0, 10], caption: "These 4 fruits were never used for learning." } },
      interviewTip: "Always say “on held-out data” when you quote a model's accuracy.",
    },
  ],
  interview: [
    {
      id: "hl-1",
      level: "fresher",
      q: "Explain how a machine learning model learns, in simple terms.",
      answer: "It starts with random parameters, makes predictions on training examples, compares them with the correct answers to measure the error, adjusts the parameters slightly to reduce that error, and repeats this many times until the error stops improving.",
      lookFor: "Predict, measure error, adjust, repeat; parameters being adjusted.",
      wrong: "“It memorises the answers.”",
    },
    {
      id: "hl-2",
      level: "fresher",
      q: "What is the difference between training and inference?",
      answer: "Training is the learning phase where parameters are updated from data. Inference is using the finished, frozen model to make predictions on new inputs, with no learning happening.",
      lookFor: "Parameters update vs frozen; cost difference.",
      wrong: "Saying inference is the same as testing a few times.",
    },
  ],
  quiz: [
    {
      id: "hl-q1",
      q: "What does the helper do after finding mistakes?",
      options: ["Throws the fruit away", "Turns the dial a little in the right direction", "Stops forever", "Buys more fruit"],
      correct: 1,
      explain: "Mistakes show which way to adjust, so the dial is nudged and the loop repeats.",
    },
    {
      id: "hl-q2",
      q: "During inference (using the AI), the dial…",
      options: ["Keeps moving", "Is frozen", "Is reset to zero", "Is deleted"],
      correct: 1,
      explain: "Learning is finished. The frozen model just answers.",
    },
    {
      id: "hl-q3",
      q: "Why test on fruit the AI never practised on?",
      options: ["To make it slower", "To be sure it learned and did not just memorise", "Because new fruit is cheaper", "To change the dial"],
      correct: 1,
      explain: "Unseen examples give an honest score. A big drop from practice means overfitting.",
    },
    {
      id: "hl-q4",
      q: "A real AI differs from this fruit helper mainly because it has…",
      options: ["No loop", "Billions of dials instead of one", "No data", "No mistakes"],
      correct: 1,
      explain: "The loop is the same. The model just has many more adjustable numbers.",
    },
  ],
});

export default scenario;
