import { beginnerTopic } from "./_beginner";

/* Topic 7 (Start here): neural networks as a team of tiny voters. The neuron's numbers are computed. */

const INPUTS = [
  { label: "cloudy", value: 1 },
  { label: "forecast", value: 1 },
  { label: "windy", value: 0 },
];
const WEIGHTS = [0.5, 0.9, 0.1]; // how much each clue matters
const BIAS = -0.8; // a general reluctance to carry an umbrella
const SUM = INPUTS.reduce((s, x, i) => s + x.value * WEIGHTS[i], 0) + BIAS;
const OUT = 1 / (1 + Math.exp(-SUM));
const r2 = (n: number) => Math.round(n * 100) / 100;

const scenario = beginnerTopic({
  id: "neural-net-idea",
  title: "Neural networks: the big idea",
  tagline: "A team of tiny voters, arranged in layers, that learn how much to trust each clue.",
  imagine:
    "Imagine deciding whether to carry an umbrella. You weigh a few clues: cloudy sky, a rain forecast, wind. Some clues matter more to you than others. Add up what you feel, and if it is strong enough, you take the umbrella. One tiny decision-maker like that is a neuron. Connect thousands of them in layers and you get a neural network.",
  recap: [
    "A **neuron** takes clues, multiplies each by how much it matters (its **weight**), adds them up, and decides whether to “fire”.",
    "A **neural network** is many neurons in **layers**. Early layers spot simple things, later layers combine them into bigger ideas.",
    "**Learning** means adjusting all the weights, the same guess-check-adjust loop as before. “Deep” just means many layers.",
  ],
  plain:
    "A neural network is a large team of very simple decision-makers. Each one weighs its clues, adds them up and passes a signal on. Stack them in layers and the team can recognise faces, understand speech and write text. Training adjusts how much each one trusts each clue.",
  definition:
    "An artificial {{neuron}} computes a weighted sum of its inputs plus a {{bias}}, then applies an {{activation|activation function}}. A {{neural-network|neural network}} stacks neurons into {{layer|layers}}; {{weight|weights}} are the {{parameter|parameters}} that {{training}} adjusts. {{deep-learning|Deep learning}} means networks with many layers.",
  analogy: "Deciding on an umbrella by weighing a few clues, then thousands of such deciders in layers.",
  facts: [
    ["Neuron", "weigh clues, add up, decide whether to fire"],
    ["Weight", "how much a clue matters"],
    ["Layer", "a row of neurons working side by side"],
    ["Deep", "many layers"],
    ["Learning", "adjust the weights to cut mistakes"],
  ],
  whereUsed: "Face unlock, voice assistants, translation, medical imaging, and every large chatbot are neural networks.",
  steps: [
    {
      id: "inputs",
      title: "A neuron weighs clues",
      simple: "A neuron looks at a few clues and multiplies each by how much it matters.",
      easy: `Our umbrella neuron has three clues: **cloudy sky** (yes = 1), **rain in forecast** (yes = 1), **windy** (no = 0). Each clue has a **weight** for how much it matters: forecast ${WEIGHTS[1]}, cloudy ${WEIGHTS[0]}, wind only ${WEIGHTS[2]}. Multiply each clue by its weight and you get that clue's vote.`,
      explain: "Step 1 of a neuron: element-wise product of inputs and weights.",
      stage: { kind: "neuron", inputs: INPUTS, weights: WEIGHTS, bias: BIAS, activation: "sigmoid", phase: "inputs", outputLabel: "take umbrella?" },
      analogy: "Each clue gets a vote, some votes count more.",
    },
    {
      id: "sum",
      title: "Add up the votes",
      simple: "Add all the votes together, plus a small starting lean.",
      easy: `Now add the votes: ${INPUTS.map((x, i) => `${x.value} × ${WEIGHTS[i]}`).join(" + ")} = **${r2(INPUTS.reduce((s, x, i) => s + x.value * WEIGHTS[i], 0))}**. Then add a small built-in lean called the **bias** (here ${BIAS}, a general reluctance to carry an umbrella). Total: **${r2(SUM)}**.`,
      explain: `z = Σ wᵢxᵢ + b = ${r2(SUM)}.`,
      stage: { kind: "neuron", inputs: INPUTS, weights: WEIGHTS, bias: BIAS, activation: "sigmoid", phase: "sum", outputLabel: "take umbrella?" },
    },
    {
      id: "fire",
      title: "Decide how strongly to fire",
      simple: "The total is squashed into a score between 0 and 1: how strongly the neuron says yes.",
      easy: `The total ${r2(SUM)} is passed through a small **squashing step** (called an *activation*) that turns any number into a score between 0 and 1. Here it gives **${r2(OUT)}**: a moderate yes, take the umbrella. Without this step, stacking many neurons would just be one big straight-line sum and could not learn complicated patterns.`,
      explain: `a = σ(z) = 1 / (1 + e^−z) = ${r2(OUT)}. Non-linear activations are what make deep networks more expressive than a single linear map.`,
      stage: { kind: "neuron", inputs: INPUTS, weights: WEIGHTS, bias: BIAS, activation: "sigmoid", phase: "activate", outputLabel: "take umbrella?" },
    },
    {
      id: "layers",
      title: "Connect many neurons in layers",
      simple: "Put neurons in rows. Each row's answers become the next row's clues.",
      easy: "One neuron is simple. The power comes from **teams**. Arrange neurons in rows called **layers**. The first row receives the raw clues. Each neuron's answer becomes a clue for every neuron in the next row, and so on, until the last row gives the final answer. This picture has 3 inputs, two middle layers of 4 neurons, and 1 output.",
      explain: "A fully connected feed-forward network: input layer, hidden layers, output layer. Each connection has its own weight.",
      stage: { kind: "viz", viz: { kind: "nn", title: "A small neural network", layers: [3, 4, 4, 1], layerNames: ["clues in", "middle 1", "middle 2", "answer"], flow: "forward", caption: "Every line is a weight the network can adjust." } },
    },
    {
      id: "learns",
      title: "Learning = adjusting the weights",
      simple: "When it guesses wrong, the network nudges its weights, so the right clues count for more.",
      easy: "Training uses the same loop you already know. The network guesses, we compare with the right answer, and every weight is nudged a little so that next time the guess is closer. Clues that helped get **more weight**, clues that misled get **less**. After many rounds the network trusts the right clues. (Illustration: how weights might change.)",
      explain: "Backpropagation computes how each weight affects the loss, and an optimiser (gradient descent) updates every weight. Numbers shown are illustrative.",
      stage: {
        kind: "viz",
        viz: {
          kind: "bars",
          title: "Illustration: the umbrella neuron's weights, before and after training",
          items: [
            { label: "cloudy (before)", value: 0.5, tone: "slate" },
            { label: "cloudy (after)", value: 0.3, tone: "cyan" },
            { label: "forecast (before)", value: 0.9, tone: "slate" },
            { label: "forecast (after)", value: 1.6, tone: "green" },
            { label: "windy (before)", value: 0.1, tone: "slate" },
            { label: "windy (after)", value: 0.0, tone: "rose" },
          ],
          max: 2,
          format: "fixed1",
          caption: "Made-up values: the forecast clue earned more trust, wind none.",
        },
      },
    },
    {
      id: "deep",
      title: "Deep means many layers",
      simple: "Early layers spot small things, later layers combine them into big ideas.",
      easy: "Make the network **deep** (many layers) and something clever happens. In a photo network, the **first layers spot tiny things** like edges and colours. **Middle layers combine them** into eyes, ears and wheels. **The last layers** decide “that's a cat”. Nobody tells it to do this. It figures out the useful steps by itself during training.",
      explain: "Hierarchical feature learning: depth composes simple features into abstract ones. This is why deep networks excel on perception tasks.",
      stage: {
        kind: "cards",
        zones: [
          { id: "l1", label: "Early layers", icon: "box", tone: "slate", cards: [{ id: "a", title: "edges, colours", tone: "slate" }] },
          { id: "l2", label: "Middle layers", icon: "box", tone: "amber", cards: [{ id: "b", title: "eyes, ears, whiskers", tone: "amber" }] },
          { id: "l3", label: "Last layers", icon: "check", tone: "green", cards: [{ id: "c", title: "“cat” 94%", tone: "green" }] },
        ],
        note: "Simple ideas build into bigger ideas, layer by layer",
      },
    },
    {
      id: "why-now",
      title: "Why neural networks took off now",
      simple: "Three things arrived together: huge data, powerful GPUs, and better training tricks.",
      easy: "The idea of neural networks is old, from the 1950s. It took off in the 2010s because three things arrived together: **huge amounts of data** from the internet, **GPU chips** that can do millions of small sums at once, and **better training tricks**. Put those together and networks suddenly got good at images, speech and language.",
      explain: "Deep learning's breakthrough: large labelled datasets (ImageNet), GPU compute, and algorithmic advances (ReLU, better initialisation, dropout, residual connections, attention).",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Why now",
          columns: ["Ingredient", "What changed"],
          rows: [
            ["Data", "billions of photos, texts and clicks online"],
            ["Compute", "GPUs doing millions of small sums at once"],
            ["Tricks", "better ways to train deep stacks of layers"],
            ["Result", "AI that sees, listens, reads and writes well"],
          ],
        },
      },
    },
  ],
  interview: [
    {
      id: "nn-1",
      level: "fresher",
      q: "What is a neural network, in simple terms?",
      answer: "It is a model made of many simple units called neurons arranged in layers. Each neuron takes a weighted sum of its inputs plus a bias and applies an activation function. Training adjusts the weights so the network's output gets closer to the correct answers.",
      lookFor: "Weighted sum, activation, layers, learning by adjusting weights.",
      wrong: "“It copies the human brain exactly.”",
    },
    {
      id: "nn-2",
      level: "fresher",
      q: "Why do we need an activation function?",
      answer: "Without a non-linear activation, any number of stacked layers collapses into a single linear transformation, so the network could only learn straight-line relationships. Activations let it model complex, curved patterns.",
      lookFor: "Non-linearity and the collapse-to-linear argument.",
      wrong: "“To make the numbers smaller.”",
    },
  ],
  quiz: [
    {
      id: "nn-q1",
      q: "What does a weight tell a neuron?",
      options: ["The size of the dataset", "How much a clue matters", "How many layers exist", "The learning speed"],
      correct: 1,
      explain: "A bigger weight means that clue pushes the decision more.",
    },
    {
      id: "nn-q2",
      q: "What does “deep” mean in deep learning?",
      options: ["A lot of data", "Many layers", "A slow model", "A secret method"],
      correct: 1,
      explain: "Deep networks have many layers of neurons.",
    },
    {
      id: "nn-q3",
      q: "How does a network learn?",
      options: ["Someone rewrites its code", "It adjusts its weights to reduce mistakes", "It deletes neurons", "It reads the internet live"],
      correct: 1,
      explain: "Same guess, check, adjust loop, applied to all the weights.",
    },
    {
      id: "nn-q4",
      q: "In a photo network, which layers spot edges and colours?",
      options: ["The last layers", "The early layers", "None of them", "Only the output"],
      correct: 1,
      explain: "Early layers find simple features. Later layers combine them.",
    },
  ],
});

export default scenario;
