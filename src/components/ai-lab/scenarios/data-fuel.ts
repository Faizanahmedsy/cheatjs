import { beginnerTopic } from "./_beginner";

/* Topic 2 (Start here): data, features, labels, quality, bias, the test set. */

// Illustration curve: accuracy climbs fast, then flattens.
const CURVE: [number, number][] = [0, 50, 100, 200, 400, 700, 1000, 1500, 2000].map((n) => [n, Math.round(50 + 48 * (1 - Math.exp(-n / 350)))]);

const scenario = beginnerTopic({
  id: "data-fuel",
  title: "Data: the fuel of AI",
  tagline: "Examples in, skill out. Good data makes good AI.",
  imagine:
    "Imagine a chef who learns only from the dishes you give them to taste. Give them fresh, varied food and they become great. Give them stale or one kind of dish, and everything they cook tastes wrong. AI is that chef, and data is the food.",
  recap: [
    "**Data** is the examples. Each row is one example, made of **features** (the clues) and a **label** (the right answer).",
    "More examples help, but **quality and variety matter more** than raw size. Wrong labels and one-sided data teach wrong lessons.",
    "Always keep **test data aside** that the AI never learns from, so you can check it honestly.",
  ],
  plain:
    "An AI learns only from the data you give it. Every example has clues (features) and, for learning with answers, the correct result (label). Good, varied, correct data makes a good AI. Poor data makes a poor or unfair one, however clever the method.",
  definition:
    "A {{dataset}} is a collection of examples. Each example has {{feature|features}} (inputs the model looks at) and usually a {{label}} (the correct answer). The dataset is split into training data, used to learn, and a {{test-set|test set}} held back to measure performance honestly. Data quality problems (wrong labels, missing cases, {{bias|biased}} samples) become model problems.",
  analogy: "A chef who can only cook what they have tasted: the ingredients decide the cooking.",
  facts: [
    ["One example", "one row: clues + answer"],
    ["Features", "the clues the AI looks at"],
    ["Label", "the correct answer to learn"],
    ["Typical split", "70% train, 15% check while building, 15% final test"],
    ["Rule of thumb", "garbage in, garbage out"],
  ],
  whereUsed: "Every AI product starts with a dataset: bank transactions for fraud detection, labelled photos for vision, support chats for assistants, past sales for forecasting.",
  steps: [
    {
      id: "what",
      title: "What counts as data?",
      simple: "Data is any recorded information: numbers, text, photos, sound, clicks.",
      easy: "Data is just **recorded information**. A spreadsheet of sales is data. So are photos, voice recordings, emails, the videos you watch and even the places your phone has been. AI can learn from all of these, as long as they are saved as examples it can study.",
      explain: "Structured data (tables) and unstructured data (text, images, audio, video) are both usable once converted to numbers (next topics).",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Kinds of data",
          columns: ["Kind", "Example", "AI that uses it"],
          rows: [
            ["Numbers in a table", "house sizes and prices", "price predictors"],
            ["Text", "emails, chats, books", "spam filters, chatbots"],
            ["Images", "photos of cats and dogs", "face unlock, medical scans"],
            ["Sound", "voice recordings", "voice assistants"],
            ["Clicks and views", "what you watched and skipped", "video suggestions"],
          ],
        },
      },
    },
    {
      id: "row",
      title: "One row = one example",
      simple: "Each row is one example: the clues about it, and the right answer.",
      easy: "Here is a tiny spam dataset. **Each row is one email.** The first columns are the **clues**: how many exclamation marks, whether it has the word “free”, whether you know the sender. The last column is the **answer**: spam or not spam. The AI studies many rows like this and learns which clues point to which answer.",
      explain: "A supervised dataset is a table X (features) and y (labels). The model learns a mapping from X to y.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "A tiny spam dataset",
          columns: ["email", "! marks", "has “free”", "known sender", "answer"],
          rows: [
            ["#1", 6, "yes", "no", "spam"],
            ["#2", 0, "no", "yes", "not spam"],
            ["#3", 4, "yes", "no", "spam"],
            ["#4", 1, "no", "yes", "not spam"],
            ["#5", 5, "no", "no", "spam"],
          ],
          highlightRow: 0,
        },
      },
    },
    {
      id: "features-label",
      title: "Features are clues, the label is the answer",
      simple: "Features are the clues the AI sees. The label is the correct answer it should learn.",
      easy: "Split every example into two parts. **Features** are what the AI is allowed to look at: the clues. The **label** is the right answer, which the AI is trying to learn to predict. When a trained AI meets a brand new email, it gets only the features and must guess the label itself.",
      explain: "Features (inputs, X) and label (target, y). At inference time only the features are available; the model outputs a predicted label.",
      stage: {
        kind: "cards",
        zones: [
          {
            id: "f",
            label: "Features (the clues)",
            icon: "search",
            tone: "blue",
            cards: [
              { id: "f1", title: "6 exclamation marks", tone: "blue" },
              { id: "f2", title: "contains “free”", tone: "blue" },
              { id: "f3", title: "unknown sender", tone: "blue" },
            ],
          },
          { id: "m", label: "The AI", icon: "box", tone: "violet", cards: [{ id: "mm", title: "Looks at the clues", tone: "violet" }] },
          { id: "l", label: "Label (the answer)", icon: "check", tone: "green", cards: [{ id: "l1", title: "SPAM", sub: "the right answer to learn", tone: "rose", badge: "label" }] },
        ],
      },
    },
    {
      id: "amount",
      title: "More data helps, then it flattens",
      simple: "More examples improve the AI fast at first, then the gains get smaller.",
      easy: "With very few examples the AI is almost guessing. As you add examples it improves quickly. But after a while each extra example adds less and less. So you don't need infinite data, you need **enough varied, good data**. The curve below is an illustration of that shape.",
      explain: "Learning curves show diminishing returns: error falls roughly as a power law in data size. Collecting more of the same data eventually stops helping; coverage of new cases helps more.",
      stage: {
        kind: "viz",
        viz: {
          kind: "plot",
          title: "Illustration: accuracy as examples grow",
          series: [{ label: "accuracy (%)", points: CURVE, tone: "green" }],
          x: [0, 2000],
          y: [40, 100],
          xLabel: "examples seen",
          yLabel: "accuracy %",
          caption: "Shape only, not real measurements.",
        },
      },
    },
    {
      id: "quality",
      title: "Quality beats quantity",
      simple: "Wrong answers in the data teach the AI wrong lessons.",
      easy: "Imagine a teacher who marks some answers wrongly. The student learns the wrong thing and gets confused. Data is the same. If 10 in 100 examples carry the wrong label, accuracy drops a bit. If 30 in 100 are wrong, it drops a lot. **Clean, correctly labelled data is worth more than a mountain of messy data.**",
      explain: "Label noise degrades generalisation; models can memorise noisy labels. Data cleaning, review of labels and deduplication are often higher-leverage than a bigger model. (Numbers are illustrative.)",
      stage: {
        kind: "viz",
        viz: {
          kind: "bars",
          title: "Illustration: accuracy when some labels are wrong (%)",
          items: [
            { label: "0% wrong labels", value: 95, tone: "green" },
            { label: "10% wrong labels", value: 88, tone: "cyan" },
            { label: "30% wrong labels", value: 71, tone: "amber" },
            { label: "50% wrong labels", value: 52, tone: "rose" },
          ],
          max: 100,
          format: "fixed1",
          caption: "Made-up numbers to show the trend.",
        },
      },
      interviewTip: "“Garbage in, garbage out” is the one-line answer. Then add: audit labels before buying a bigger model.",
    },
    {
      id: "bias",
      title: "One-sided data makes a one-sided AI",
      simple: "If the examples miss some situations, the AI will do badly in exactly those situations.",
      easy: "Say a photo app is trained mostly on **bright daytime photos**. It will be great in daylight and poor at night, because it hardly saw any night photos. The same happens with people, languages and places: **whatever the data leaves out, the AI is weak at.** That is called **bias**, and the fix is to collect data that covers everyone and every situation the AI will meet.",
      explain: "Sampling bias and coverage gaps produce uneven performance across groups or conditions. Evaluate per segment, not only on the overall average, and fix with better sampling, re-weighting or more data.",
      stage: {
        kind: "viz",
        viz: {
          kind: "bars",
          title: "Illustration: a photo AI trained mostly on daytime photos (%)",
          items: [
            { label: "daytime photos", value: 96, tone: "green", note: "most of the training data" },
            { label: "indoor photos", value: 84, tone: "amber" },
            { label: "night photos", value: 61, tone: "rose", note: "hardly any training data" },
          ],
          max: 100,
          format: "fixed1",
          caption: "Made-up numbers. The average hides the weak spot.",
        },
      },
    },
    {
      id: "split",
      title: "Keep some data hidden for the final test",
      simple: "Hold some examples back, and use them only at the end to see how good the AI really is.",
      easy: "A student who sees the exam questions in advance will score full marks without learning anything. So we **hide a portion of the data** and never let the AI learn from it. Most is for **training**. A bit is for **checking while we build**. The rest is the **final test**, used once at the end for an honest score.",
      explain: "Train / validation / test split (commonly 70/15/15). The test set is touched once to avoid leaking information into model choices.",
      stage: {
        kind: "viz",
        viz: {
          kind: "stack",
          title: "Splitting 1,000 examples",
          segments: [
            { label: "training: 700 (learn from these)", value: 700, tone: "blue" },
            { label: "checking: 150 (tune while building)", value: 150, tone: "amber" },
            { label: "final test: 150 (look once at the end)", value: 150, tone: "green" },
          ],
        },
      },
    },
  ],
  interview: [
    {
      id: "df-1",
      level: "fresher",
      q: "What are features and labels?",
      answer: "Features are the input variables the model looks at, such as the size of a house. The label is the correct output we want it to predict, such as the price. In training we give both; at prediction time we give only features and the model outputs the label.",
      lookFor: "Inputs vs target, and when each is available.",
      wrong: "Mixing them up or saying features are the answers.",
    },
    {
      id: "df-2",
      level: "fresher",
      q: "Why do we keep a separate test set?",
      answer: "To measure how the model performs on data it has never seen. If we tested on the data it trained on, a model that merely memorised would look perfect. The test set gives an honest estimate of real-world performance.",
      lookFor: "Generalisation and avoiding memorisation or leakage.",
      wrong: "“To have more data.”",
    },
  ],
  quiz: [
    {
      id: "df-q1",
      q: "In a spam dataset, which is the label?",
      options: ["Number of exclamation marks", "Whether the sender is known", "“spam” or “not spam”", "The email's length"],
      correct: 2,
      explain: "The label is the answer to learn. The others are features (clues).",
    },
    {
      id: "df-q2",
      q: "What usually helps more?",
      options: ["Many messy examples", "Fewer but clean, varied examples", "Only examples that look alike", "Removing all labels"],
      correct: 1,
      explain: "Quality and variety beat sheer quantity. Messy or one-sided data teaches wrong lessons.",
    },
    {
      id: "df-q3",
      q: "A photo AI trained mostly on daytime photos will probably…",
      options: ["Work equally well at night", "Be weak at night", "Refuse to run at night", "Become more accurate at night"],
      correct: 1,
      explain: "It hardly saw night examples, so it is weak there. This is data bias.",
    },
    {
      id: "df-q4",
      q: "Why hide a test set?",
      options: ["To save disk space", "So the AI can't memorise the answers and we get an honest score", "To train faster", "It is required by law"],
      correct: 1,
      explain: "Data the AI never saw is the only fair way to measure it.",
    },
  ],
});

export default scenario;
