import { beginnerTopic } from "./_beginner";

/* Topic 6 (Start here): the families of machine learning, and a map of the rest of the lab. */

// Three clumps of customers (spend vs visits). The machine finds the groups with no labels.
const CLUMPS: { x: number; y: number; tone: "blue" | "amber" | "green" }[] = [
  { x: 1.2, y: 1.5, tone: "blue" },
  { x: 1.8, y: 2.2, tone: "blue" },
  { x: 2.3, y: 1.1, tone: "blue" },
  { x: 1.5, y: 2.7, tone: "blue" },
  { x: 5.2, y: 5.4, tone: "amber" },
  { x: 5.8, y: 6.1, tone: "amber" },
  { x: 6.4, y: 5.0, tone: "amber" },
  { x: 5.5, y: 6.7, tone: "amber" },
  { x: 8.6, y: 1.6, tone: "green" },
  { x: 9.1, y: 2.4, tone: "green" },
  { x: 8.2, y: 2.9, tone: "green" },
  { x: 9.4, y: 1.2, tone: "green" },
];

const scenario = beginnerTopic({
  id: "kinds-of-ai",
  title: "Kinds of AI and where this lab goes",
  tagline: "Learning with answers, without answers, by rewards, and by creating.",
  imagine:
    "Imagine three ways to learn. A teacher with an answer key. Sorting a pile of unlabelled photos into groups by yourself. Or learning a video game by playing and noticing which moves score points. Machines learn in exactly these three ways, and a fourth, creating new things, is what you meet in chatbots.",
  recap: [
    "**Supervised:** learn from examples with answers. **Unsupervised:** find groups with no answers. **Reinforcement:** learn by trying and getting rewards.",
    "A supervised job either **predicts a number** (regression) or **picks a category** (classification).",
    "**Generative AI** creates new text, images or code. The rest of this lab climbs from the basics to how chatbots are built and run.",
  ],
  plain:
    "Machine learning comes in a few families depending on what feedback the machine gets: correct answers, none, or rewards. On top of that sits generative AI, which makes new content. Knowing the families lets you name any AI problem you meet.",
  definition:
    "{{supervised|Supervised learning}} trains on labelled examples to predict a label. It is {{regression}} when the label is a number and {{classification}} when it is a category. {{unsupervised|Unsupervised learning}} finds structure (such as clusters) without labels. {{reinforcement|Reinforcement learning}} learns a policy from rewards. {{generative-ai|Generative models}} learn the distribution of data to create new samples.",
  analogy: "Learning with an answer key, by sorting alone, or by playing a game for points.",
  facts: [
    ["Supervised", "examples with answers (spam filter, price guesser)"],
    ["Unsupervised", "no answers, find groups (customer segments)"],
    ["Reinforcement", "rewards for good moves (game players, robots)"],
    ["Regression", "predict a number (price, temperature)"],
    ["Classification", "pick a category (spam or not, cat or dog)"],
  ],
  whereUsed: "Supervised: fraud detection, spam, medical scans. Unsupervised: customer grouping. Reinforcement: games, robotics, tuning chatbots with human feedback. Generative: ChatGPT, image makers.",
  steps: [
    {
      id: "three-ways",
      title: "Three ways a machine can learn",
      simple: "With an answer key, with no answers at all, or by getting rewards for good moves.",
      easy: "A machine can learn in three main ways, depending on what feedback it gets. **Supervised**: every example comes with the right answer, like a teacher's answer key. **Unsupervised**: no answers, the machine finds patterns on its own. **Reinforcement**: no answer key, but a **reward** when it does something good, like points in a game.",
      explain: "The three paradigms differ by the learning signal: labels, none (structure only), or scalar reward from interaction.",
      stage: {
        kind: "cards",
        zones: [
          { id: "s", label: "Supervised", icon: "check", tone: "blue", cards: [{ id: "s1", title: "Has the answers", sub: "like an answer key", tone: "blue" }] },
          { id: "u", label: "Unsupervised", icon: "search", tone: "amber", cards: [{ id: "u1", title: "No answers", sub: "finds groups itself", tone: "amber" }] },
          { id: "r", label: "Reinforcement", icon: "answer", tone: "green", cards: [{ id: "r1", title: "Rewards", sub: "points for good moves", tone: "green" }] },
        ],
      },
    },
    {
      id: "supervised",
      title: "Supervised: learning with an answer key",
      simple: "Every training example has the right answer, so the AI learns to copy that skill on new examples.",
      easy: "This is the most common kind. Each example comes with its answer: an email marked spam, a house with its price, a photo marked “cat”. The AI studies thousands of these, then predicts the answer for ones it hasn't seen. **Most of the AI you use daily is supervised.**",
      explain: "Supervised learning fits f(x) ≈ y from labelled pairs. Evaluation uses held-out labelled data.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Supervised examples",
          columns: ["Clues (features)", "Answer (label)", "Job"],
          rows: [
            ["email text", "spam / not spam", "spam filter"],
            ["house size, area", "price", "price guesser"],
            ["photo pixels", "cat / dog", "photo recogniser"],
            ["card payment details", "fraud / genuine", "fraud alert"],
          ],
        },
      },
    },
    {
      id: "two-jobs",
      title: "Two kinds of supervised job",
      simple: "Either predict a number, or pick one category from a list.",
      easy: "Supervised jobs come in two flavours. If the answer is a **number**, like a price or tomorrow's temperature, it is **regression**. If the answer is **a choice from a list**, like spam or not spam, cat or dog, it is **classification**. Naming which one you have is the very first step of any AI project.",
      explain: "Regression outputs a continuous value (loss often MSE); classification outputs a class or class probabilities (loss often cross-entropy).",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Regression or classification?",
          columns: ["Question", "Answer looks like", "So it is"],
          rows: [
            ["What will this house sell for?", "₹52,00,000", "regression"],
            ["Is this email spam?", "spam or not", "classification"],
            ["How many units will we sell next week?", "340", "regression"],
            ["Which animal is in this photo?", "cat, dog or horse", "classification"],
          ],
        },
      },
    },
    {
      id: "unsupervised",
      title: "Unsupervised: finding groups on its own",
      simple: "With no answers given, the AI still notices which examples look alike and groups them.",
      easy: "Now there is **no answer key**. A shop gives the AI only each customer's spending and visits. It notices three clumps of similar customers: **few visits and low spend**, **medium both**, and **rare but big spenders**. Nobody told it those groups existed. This is **clustering**, and it helps with things like grouping customers or spotting oddities.",
      explain: "Unsupervised methods (k-means, hierarchical clustering, PCA) discover structure without labels; the clusters here are those a clustering algorithm would find.",
      stage: {
        kind: "viz",
        viz: {
          kind: "scatter",
          title: "Customers: spend (across) and visits (up), 3 natural groups",
          points: CLUMPS.map((p) => ({ x: p.x, y: p.y, tone: p.tone })),
          x: [0, 10],
          y: [0, 8],
          caption: "Colours show the groups the AI found. It was never told about them.",
        },
      },
    },
    {
      id: "reinforcement",
      title: "Reinforcement: learning by rewards",
      simple: "The AI tries moves, gets points for good ones, and slowly learns what scores.",
      easy: "Picture a robot in a maze with cheese at the end. It tries a move. Bump into a wall: **minus point**. Reach the cheese: **big plus**. After thousands of tries it learns the path that earns the most reward. This is how game-playing AIs and robots learn. A version of it, with **human feedback**, also helps make chatbots more helpful.",
      explain: "An agent takes actions in an environment and learns a policy that maximises cumulative reward (Q-learning, policy gradients). RLHF applies this idea to language models.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "A robot learning a maze",
          columns: ["try", "what it did", "reward", "it learned"],
          rows: [
            [1, "went left into a wall", "−1", "left is bad here"],
            [2, "went right, then up", "0", "no result yet"],
            [3, "went right, up, up", "+10 (cheese!)", "this path pays"],
            ["…1000", "takes the cheese path every time", "+10", "learned the route"],
          ],
          highlightRow: 2,
        },
      },
    },
    {
      id: "generative",
      title: "Generative AI: creating something new",
      simple: "Generative AI learns what text or pictures look like, then makes new ones.",
      easy: "The AI you chat with is **generative**. It first studies a huge amount of text (or images) and learns how they usually look. Then, given your request, it **creates something new**: an answer, a poem, a picture, some code. ChatGPT, image makers and coding assistants are all generative AI, built on **deep learning**.",
      explain: "Generative models learn p(data) (or conditional p(output | prompt)) and sample new outputs: autoregressive LLMs, diffusion image models.",
      stage: {
        kind: "cards",
        zones: [
          { id: "a", label: "You ask", icon: "person", tone: "blue", cards: [{ id: "a1", title: "“Write a 2-line poem about chai”", tone: "blue" }] },
          { id: "b", label: "Generative model", icon: "llm", tone: "violet", cards: [{ id: "b1", title: "Learned from lots of text", tone: "violet" }] },
          { id: "c", label: "Something new", icon: "answer", tone: "green", cards: [{ id: "c1", title: "A fresh poem", sub: "never written before", tone: "green" }] },
        ],
      },
    },
    {
      id: "roadmap",
      title: "Your path through this lab",
      simple: "First the basics, then the numbers behind learning, then how chatbots are built, used and made safe.",
      easy: "You have finished the starting topics. From here the lab climbs step by step. **Topics 9 to 11** show the actual numbers behind learning and how to score a model. **12 to 15** open up neural networks and the transformer. **16 to 20** show how chatbots are built, prompted and given meaning. **21 to 24** cover search-augmented answers, tuning and agents. **25 to 27** cover testing, running and designing real AI systems.",
      explain: "Roadmap: 9 learning maths, 10 classic ML, 11 metrics, 12 neural nets, 13 training deep nets, 14 architectures, 15 transformers, 16 LLM building, 17 inference, 18 prompting, 19 conversation, 20 embeddings, 21 RAG, 22 advanced RAG, 23 fine-tuning, 24 agents and MCP, 25 evals and guardrails, 26 MLOps, 27 ML system design.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "The road ahead",
          columns: ["Topics", "You will learn"],
          rows: [
            ["9 – 11", "the real numbers of learning, classic models, how to score a model"],
            ["12 – 15", "neural networks, training them, and the transformer"],
            ["16 – 20", "how chatbots are built and run, prompting, memory, embeddings"],
            ["21 – 24", "RAG, fine-tuning, agents and tools"],
            ["25 – 27", "testing, safety, running AI in production, system design"],
          ],
        },
      },
    },
  ],
  interview: [
    {
      id: "ka-1",
      level: "fresher",
      q: "What are the main types of machine learning?",
      answer: "Supervised learning learns from labelled examples; unsupervised learning finds structure such as clusters without labels; reinforcement learning learns by taking actions and receiving rewards. Generative models, which create new content, are usually trained with supervised or self-supervised objectives.",
      lookFor: "Names all three and the learning signal for each.",
      wrong: "Listing algorithm names without the idea.",
    },
    {
      id: "ka-2",
      level: "fresher",
      q: "Regression vs classification: what is the difference?",
      answer: "Regression predicts a continuous number such as a price. Classification predicts a category such as spam or not spam. The choice decides the loss function and the evaluation metrics.",
      lookFor: "Number vs category, with an example of each.",
      wrong: "“Classification is harder than regression.”",
    },
  ],
  quiz: [
    {
      id: "ka-q1",
      q: "A shop groups customers by buying habits with no labels. This is…",
      options: ["Supervised", "Unsupervised", "Reinforcement", "Regression"],
      correct: 1,
      explain: "No answers are given, the machine finds groups itself.",
    },
    {
      id: "ka-q2",
      q: "Predicting tomorrow's temperature is…",
      options: ["Classification", "Regression", "Clustering", "Reinforcement"],
      correct: 1,
      explain: "The answer is a number, so it is regression.",
    },
    {
      id: "ka-q3",
      q: "Which one learns from rewards?",
      options: ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Tokenisation"],
      correct: 2,
      explain: "Reinforcement learning tries actions and learns from the rewards it gets.",
    },
    {
      id: "ka-q4",
      q: "ChatGPT writing a new poem is an example of…",
      options: ["Generative AI", "Clustering", "A spreadsheet", "Reward counting only"],
      correct: 0,
      explain: "It creates new content, which is generative AI.",
    },
  ],
});

export default scenario;
