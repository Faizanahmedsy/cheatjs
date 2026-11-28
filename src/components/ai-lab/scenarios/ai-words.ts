import { beginnerTopic } from "./_beginner";

/* Topic 5 (Start here): the vocabulary, one small group at a time. */

const scenario = beginnerTopic({
  id: "ai-words",
  title: "Words you will hear",
  tagline: "The 20 or so terms everyone uses, in plain words.",
  imagine:
    "Imagine walking into a cricket match where everyone says “googly”, “yorker” and “powerplay” and you have never watched the game. You'd be lost until someone explains the words. AI has its own words too. Learn these few groups and every talk, video and interview becomes easy to follow.",
  recap: [
    "**Data words:** dataset, feature, label. **Model words:** model, parameter, algorithm.",
    "**Learning words:** training, loss, epoch, validation, test. **Using words:** inference, prediction, accuracy.",
    "**Trouble words:** overfitting, underfitting, bias, hallucination. **Size words:** parameters (7B), tokens, GPU.",
  ],
  plain:
    "Each term here is a small idea with a simple meaning. They appear in groups: words about the data, the model, the learning, the using, the problems, and the size. Tap any dotted word in later topics to see its meaning again.",
  definition:
    "This topic is a glossary organised by stage of the machine learning workflow: {{dataset|data}}, {{model}}, {{training}}, {{inference}}, failure modes ({{overfitting}}, {{bias}}, {{hallucination}}) and scale ({{parameter|parameters}}, {{token|tokens}}, GPUs).",
  analogy: "Learning the match words before watching your first cricket game.",
  facts: [
    ["Data", "dataset, feature, label"],
    ["Model", "model, parameter, algorithm"],
    ["Learning", "training, loss, epoch, validation, test"],
    ["Using", "inference, prediction, accuracy"],
    ["Problems", "overfitting, underfitting, bias, hallucination"],
  ],
  whereUsed: "Interviews, documentation, papers, courses and team meetings all assume these words.",
  steps: [
    {
      id: "data-words",
      title: "Data words",
      simple: "Dataset, feature, label: the examples, the clues, and the answer.",
      easy: "A **dataset** is the whole collection of examples. A **feature** is one clue about an example, like a house's size. A **label** is the right answer we want to predict, like its price. Datasets hold many rows of features plus a label.",
      explain: "Dataset = collection of examples; feature = input variable; label/target = output to predict.",
      stage: {
        kind: "cards",
        zones: [
          { id: "a", label: "Dataset", icon: "doc", tone: "blue", cards: [{ id: "a1", title: "All your examples", sub: "10,000 emails", tone: "blue" }] },
          { id: "b", label: "Feature", icon: "search", tone: "cyan", cards: [{ id: "b1", title: "One clue", sub: "number of ! marks", tone: "cyan" }] },
          { id: "c", label: "Label", icon: "check", tone: "green", cards: [{ id: "c1", title: "The answer", sub: "spam / not spam", tone: "green" }] },
        ],
      },
    },
    {
      id: "model-words",
      title: "Model words",
      simple: "The model is the learned program. Its parameters are the dials. The algorithm is how it learns.",
      easy: "The **model** is the thing that makes predictions: the learned “brain”. Inside it are **parameters**: the adjustable numbers, like dials. The **algorithm** is the recipe used to turn those dials during learning. You hear “a 7B model”: that means about **7 billion parameters**.",
      explain: "Model = function with parameters; algorithm = procedure that fits the parameters (e.g. gradient descent).",
      stage: {
        kind: "cards",
        zones: [
          { id: "a", label: "Model", icon: "box", tone: "violet", cards: [{ id: "a1", title: "The predictor", sub: "takes clues, gives a guess", tone: "violet" }] },
          { id: "b", label: "Parameters", icon: "tray", tone: "amber", cards: [{ id: "b1", title: "The dials inside", sub: "“7B” = 7 billion", tone: "amber" }] },
          { id: "c", label: "Algorithm", icon: "scissors", tone: "slate", cards: [{ id: "c1", title: "The turning recipe", sub: "how the dials get set", tone: "slate" }] },
        ],
      },
    },
    {
      id: "learning-words",
      title: "Learning words",
      simple: "Training is practice, loss is how wrong it is, an epoch is one pass, test data is the final exam.",
      easy: "**Training** is the practice phase. **Loss** is one number for how wrong the AI is right now: lower is better. One **epoch** means the AI has seen the whole dataset once. **Validation** data is a small set used to check progress while building. **Test** data is the final exam, used once at the end.",
      explain: "Training updates parameters to minimise loss over epochs; validation guides tuning; the test set gives the final unbiased estimate.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Learning words",
          columns: ["word", "plain meaning"],
          rows: [
            ["training", "the practice phase"],
            ["loss", "how wrong it is right now (smaller is better)"],
            ["epoch", "one full pass over all the examples"],
            ["validation data", "a small set to check progress while building"],
            ["test data", "the final exam, used once"],
          ],
        },
      },
    },
    {
      id: "using-words",
      title: "Using words",
      simple: "Inference is using the trained AI. A prediction is its answer. Accuracy is how often it is right.",
      easy: "After training, **inference** means using the AI to get answers. Each answer is a **prediction**. **Accuracy** is the share of predictions that are right: 90 right out of 100 is 90% accuracy. Some AI also reports **confidence**: how sure it is about an answer.",
      explain: "Inference = forward pass of the frozen model; prediction = output; accuracy = correct / total (other metrics come later).",
      stage: {
        kind: "cards",
        zones: [
          { id: "a", label: "Inference", icon: "box", tone: "violet", cards: [{ id: "a1", title: "Using the trained AI", tone: "violet" }] },
          { id: "b", label: "Prediction", icon: "answer", tone: "blue", cards: [{ id: "b1", title: "Its answer", sub: "“this email is spam”", tone: "blue" }] },
          { id: "c", label: "Accuracy", icon: "check", tone: "green", cards: [{ id: "c1", title: "How often it's right", sub: "90 of 100 = 90%", tone: "green" }] },
        ],
      },
    },
    {
      id: "trouble-words",
      title: "Trouble words",
      simple: "Overfitting, underfitting, bias and hallucination are the common ways AI goes wrong.",
      easy: "**Overfitting**: the AI memorised the practice examples, so it fails on new ones. **Underfitting**: it is too simple and never learned the pattern. **Bias**: it is weak or unfair where the data was thin. **Hallucination**: a chatbot confidently says something false that sounds right. Spotting these is half of building good AI.",
      explain: "Overfitting (high variance), underfitting (high bias in the bias-variance sense), dataset/sampling bias, and LLM hallucination (fluent but unsupported output).",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Ways AI goes wrong",
          columns: ["word", "what happened", "everyday picture"],
          rows: [
            ["overfitting", "memorised the examples", "a student who memorised last year's paper"],
            ["underfitting", "too simple to learn the pattern", "a student who never studied"],
            ["bias", "weak where the data was thin", "a chef who only cooked one cuisine"],
            ["hallucination", "confident but false answer", "a friend who invents a fact to sound smart"],
          ],
        },
      },
    },
    {
      id: "size-words",
      title: "Size words",
      simple: "Parameters count the dials, tokens count the text pieces, and a GPU is the chip that does the maths.",
      easy: "**Parameters**: how many dials the AI has. A small model may have millions, big chatbots have billions. **Tokens**: the small chunks of text an AI reads and writes; about 3 to 4 letters each. A **GPU** is the powerful chip that does the huge amount of maths for training and running AI. Bigger models usually need more GPUs.",
      explain: "Model scale: parameter count, training tokens, compute (GPU-hours). Context length is measured in tokens.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Size words",
          columns: ["word", "plain meaning", "rough sense of scale"],
          rows: [
            ["parameter", "one adjustable number (a dial)", "millions to hundreds of billions"],
            ["token", "a small chunk of text", "about ¾ of a word"],
            ["GPU", "the chip that does the AI maths", "training uses thousands of them"],
            ["context window", "how much text it can hold in mind at once", "thousands to millions of tokens"],
          ],
        },
      },
    },
    {
      id: "sentence",
      title: "Put it together in one sentence",
      simple: "Now one sentence full of these words makes sense.",
      easy: "Try reading this: “We trained a model on a dataset of labelled emails. After a few epochs the loss dropped. On the test set its accuracy was 94%, so we deployed it for inference.” You now understand every word of that. The rest of the lab uses these words, and the dotted ones give a quick definition when tapped.",
      explain: "A worked sentence using the vocabulary in order of the ML lifecycle.",
      stage: {
        kind: "chat",
        messages: [
          { role: "user", text: "Explain what you did, in one line." },
          { role: "assistant", text: "We trained a model on a dataset of labelled emails. After a few epochs the loss dropped. On the test set its accuracy was 94%, so we used it for inference.", note: "every word here is now familiar" },
        ],
      },
    },
  ],
  interview: [
    {
      id: "aw-1",
      level: "fresher",
      q: "Explain overfitting and underfitting simply.",
      answer: "Overfitting is when a model learns the training data too closely, including its noise, and so performs poorly on new data. Underfitting is when the model is too simple to learn the pattern and performs poorly even on the training data.",
      lookFor: "Compares training vs new-data performance for both.",
      wrong: "Mixing the two up, or defining only one.",
    },
    {
      id: "aw-2",
      level: "fresher",
      q: "What does “a 7B model” mean?",
      answer: "It has about 7 billion parameters, the adjustable numbers learned during training. Parameter count is a rough measure of a model's size and capacity, and affects memory and compute needs.",
      lookFor: "Parameters, not data size or tokens.",
      wrong: "“It was trained on 7 billion words.”",
    },
  ],
  quiz: [
    {
      id: "aw-q1",
      q: "A label is…",
      options: ["One clue about an example", "The right answer to learn", "The model's size", "A kind of chip"],
      correct: 1,
      explain: "Features are clues, the label is the answer.",
    },
    {
      id: "aw-q2",
      q: "One epoch means…",
      options: ["One wrong answer", "One full pass over all the training data", "One model", "One GPU"],
      correct: 1,
      explain: "The AI has seen every training example once.",
    },
    {
      id: "aw-q3",
      q: "A chatbot confidently states a false fact. This is called…",
      options: ["Overfitting", "Hallucination", "Inference", "Validation"],
      correct: 1,
      explain: "Hallucination is fluent output that is not true or not supported.",
    },
    {
      id: "aw-q4",
      q: "Parameters are…",
      options: ["The training examples", "The adjustable numbers inside the model", "The test questions", "The user's prompts"],
      correct: 1,
      explain: "Parameters are the dials set by training.",
    },
  ],
});

export default scenario;
