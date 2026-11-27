import type { Scenario, Tone } from "../engine/types";
import { f, mean } from "../engine/math";

/* ------------------------------------------------------------------ *
 * Classic ML on one story: will a loan applicant repay? Features are
 * income (₹ lakh / year) and credit score (scaled 0–10). Every accuracy,
 * split and centroid below is computed from these points.
 * ------------------------------------------------------------------ */

type P = { x: number; y: number; repaid: boolean };
const DATA: P[] = [
  { x: 3, y: 3, repaid: false }, { x: 4, y: 2, repaid: false }, { x: 5, y: 4, repaid: false }, { x: 2, y: 5, repaid: false },
  { x: 6, y: 3, repaid: false }, { x: 3, y: 6, repaid: false }, { x: 7, y: 5, repaid: true }, { x: 8, y: 7, repaid: true },
  { x: 6, y: 8, repaid: true }, { x: 9, y: 6, repaid: true }, { x: 5, y: 7, repaid: true }, { x: 8, y: 4, repaid: true },
  { x: 4, y: 8, repaid: true }, { x: 7, y: 2, repaid: false }, { x: 2, y: 9, repaid: false }, { x: 5, y: 5, repaid: true },
];
const tone = (p: P): Tone => (p.repaid ? "green" : "rose");
const pts = DATA.map((p) => ({ x: p.x, y: p.y, tone: tone(p) }));
const acc = (rule: (p: P) => boolean) => Math.round((DATA.filter((p) => rule(p) === p.repaid).length / DATA.length) * 100);

// Logistic-style straight boundary: x + y >= 11
const LINE = (p: P) => p.x + p.y >= 11;
const LINE_ACC = acc(LINE);
// Decision tree: credit >= 5 ? (income >= 4 ? yes : no) : (income >= 8 ? yes : no)
const TREE = (p: P) => (p.y >= 5 ? p.x >= 4 : p.x >= 8);
const TREE_ACC = acc(TREE);
const TREE_LEAF = (credit: boolean, income: boolean) =>
  DATA.filter((p) => (p.y >= 5) === credit && (credit ? p.x >= 4 : p.x >= 8) === income);
const leafLabel = (credit: boolean, income: boolean) => {
  const g = TREE_LEAF(credit, income);
  const yes = g.filter((p) => p.repaid).length;
  return `${yes}/${g.length} repaid`;
};

// k-means (k = 2) on customers by spend (x) and visits per month (y), two iterations, computed.
const SHOP = [
  [1, 2], [2, 1], [2, 3], [3, 2], [7, 8], [8, 7], [8, 9], [9, 8], [3, 3], [7, 7],
] as [number, number][];
const assign = (cs: [number, number][]) =>
  SHOP.map(([x, y]) => (Math.hypot(x - cs[0][0], y - cs[0][1]) <= Math.hypot(x - cs[1][0], y - cs[1][1]) ? 0 : 1));
const centre = (lab: number[], k: number): [number, number] => {
  const g = SHOP.filter((_, i) => lab[i] === k);
  return [mean(g.map((p) => p[0])), mean(g.map((p) => p[1]))];
};
const C0: [number, number][] = [[1, 6], [5, 9]];
const L1 = assign(C0);
const C1: [number, number][] = [centre(L1, 0), centre(L1, 1)];
const L2 = assign(C1);
const C2: [number, number][] = [centre(L2, 0), centre(L2, 1)];
const kTone = (k: number): Tone => (k === 0 ? "blue" : "amber");

const scenario: Scenario = {
  id: "classic-ml",
  title: "Classic ML models",
  tagline: "Lines, trees, forests and clusters: the models that still run most of the world.",
  imagine:
    "Imagine a bank manager deciding loans. A new manager draws one rule: high income plus a good credit score means yes. An experienced one asks a chain of questions. A committee of 100 managers votes. And when there are no past answers at all, the manager just groups similar customers together. Those four habits are the four families of classic ML.",
  recap: [
    "**Logistic regression** draws one straight boundary and gives a probability; simple, fast, easy to explain.",
    "**Decision trees** ask yes/no questions; **random forests** and **gradient boosting (XGBoost)** combine many trees and win on table data.",
    "**k-means** finds groups when there are no labels; **feature engineering** and **regularisation** often matter more than the model choice.",
  ],
  overview: {
    plain:
      "Before deep learning, and still today for spreadsheet-style data, most predictions use a few simple model families: straight-line models, decision trees, groups of trees, and clustering. They train fast, need little data, and are easy to explain.",
    definition:
      "For **supervised** tabular problems: {{logistic|logistic regression}} (linear boundary + sigmoid probability), {{decision-tree|decision trees}} (recursive splits that reduce impurity), and ensembles: {{random-forest|random forests}} (bagging many de-correlated trees) and {{boosting|gradient boosting}} (XGBoost, LightGBM: each tree fixes the previous trees' errors). For **unsupervised** grouping: {{kmeans|k-means}}. {{regularisation|Regularisation}} (L1/L2) and good features keep them from overfitting.",
    analogy: "One rule of thumb (line), a flowchart of questions (tree), a committee vote (forest), and sorting people into groups by how alike they are (clusters).",
    facts: [
      ["Line (this data)", `${LINE_ACC}% accuracy`],
      ["Tree (depth 2)", `${TREE_ACC}% accuracy`],
      ["Tabular champion", "gradient-boosted trees (XGBoost, LightGBM, CatBoost)"],
      ["Needs scaling", "logistic regression, k-means, SVM; trees don't"],
      ["No labels?", "clustering (k-means, DBSCAN) or anomaly detection"],
      ["Explain it", "coefficients (linear), feature importance or SHAP (trees)"],
    ],
    whereUsed: "Credit scoring, fraud flags, churn prediction, demand forecasting, ad click prediction, customer segmentation and most Kaggle tabular competitions.",
  },
  objects: [
    { id: "data", kind: "table", label: "Applicants", sub: "income, credit, repaid?", at: [0, 1.8], tone: "blue" },
    { id: "line", kind: "chart", label: "Logistic regression", sub: "one boundary", at: [3.4, 0], tone: "cyan" },
    { id: "tree", kind: "gear", label: "Decision tree", sub: "yes/no splits", at: [3.4, 3.6], tone: "amber" },
    { id: "forest", kind: "box", label: "Forest / boosting", sub: "many trees", at: [6.8, 3.6], tone: "green" },
    { id: "pred", kind: "gauge", label: "Prediction", sub: "repay probability", at: [10, 1.8], tone: "green" },
  ],
  links: [
    { id: "l1", from: "data", to: "line" },
    { id: "l2", from: "data", to: "tree" },
    { id: "l3", from: "tree", to: "forest" },
    { id: "l4", from: "line", to: "pred" },
    { id: "l5", from: "forest", to: "pred" },
  ],
  logTitle: "Model comparison",
  logColumns: [
    { key: "model", label: "Model", width: "28%" },
    { key: "result", label: "Result" },
    { key: "acc", label: "Accuracy", align: "right", width: "14%" },
  ],
  steps: [
    {
      id: "data",
      title: "Rows, features and a label",
      simple: "Each applicant is a row: income and credit score are the clues, repaid or not is the answer.",
      easy: `Most business data looks like a spreadsheet. Each **row** is a past applicant. The columns we use as **clues** are income and credit score: these are **features**. The column we want to predict, repaid or not, is the **label**. Here we have ${DATA.length} past applicants: green repaid, red didn't.`,
      explain: `Tabular, supervised learning: ${DATA.length} rows, 2 {{feature|features}} (income, credit score), a binary {{label}} (repaid). Green dots repaid, red didn't. Real problems have dozens of features, but the ideas are the same.`,
      stage: {
        kind: "viz",
        viz: { kind: "scatter", title: "Past applicants", points: pts, x: [0, 10], y: [0, 10], caption: "x = income (₹ lakh/yr), y = credit score (0–10). Green = repaid." },
      },
      highlight: ["data"],
    },
    {
      id: "logistic",
      title: "Logistic regression: one straight boundary",
      simple: "Draw one straight line. Above it means likely to repay, below it means likely not.",
      easy: `The simplest model draws **one straight line**. Points on the upper-right side are predicted “will repay”. It also gives a **probability**: far from the line means very sure, close to it means unsure. On this data it is right **${LINE_ACC}%** of the time. Two applicants end up on the wrong side: a straight line can't bend around them.`,
      explain: `{{logistic|Logistic regression}} computes z = w₁·income + w₂·credit + b and squashes it with a sigmoid to a 0–1 probability. The boundary is where p = 0.5, a straight line (here income + credit ≥ 11). Accuracy: ${LINE_ACC}%. Fast, explainable via its weights, but only linear.`,
      stage: {
        kind: "viz",
        viz: { kind: "scatter", title: "Boundary: income + credit = 11", points: pts, boundary: [[1, 10], [10, 1]], x: [0, 10], y: [0, 10], caption: `${LINE_ACC}% of applicants on the correct side` },
      },
      highlight: ["line"],
      log: [{ tone: "cyan", cells: { model: "logistic regression", result: "one straight boundary", acc: `${LINE_ACC}%` } }],
      deeper: { math: ["p(repay) = σ(w₁·x₁ + w₂·x₂ + b)", "σ(z) = 1 / (1 + e^(−z))", "loss = binary cross-entropy"] },
    },
    {
      id: "tree",
      title: "Decision tree: ask yes/no questions",
      simple: "A tree asks a question, splits the people, then asks another question in each group.",
      easy: `A **decision tree** works like a flowchart. First question: “credit score 5 or more?” Then, in each group, another question about income. Each end box (a **leaf**) gives an answer. It can carve **boxes**, not just lines, so it reaches **${TREE_ACC}%** here, and you can read exactly why it decided.`,
      explain: `A {{decision-tree|decision tree}} picks the split that best separates the classes (lowest Gini impurity or entropy), then repeats inside each branch. Depth 2 here gives ${TREE_ACC}%. No scaling needed and easy to read, but deep trees memorise noise.`,
      stage: {
        kind: "viz",
        viz: [
          {
            kind: "tree",
            title: "Learned tree (depth 2)",
            root: {
              label: "credit ≥ 5?",
              tone: "amber",
              children: [
                { edge: "yes", node: { label: "income ≥ 4?", tone: "amber", children: [
                  { edge: "yes", node: { label: `repay · ${leafLabel(true, true)}`, tone: "green" } },
                  { edge: "no", node: { label: `no · ${leafLabel(true, false)}`, tone: "rose" } },
                ] } },
                { edge: "no", node: { label: "income ≥ 8?", tone: "amber", children: [
                  { edge: "yes", node: { label: `repay · ${leafLabel(false, true)}`, tone: "green" } },
                  { edge: "no", node: { label: `no · ${leafLabel(false, false)}`, tone: "rose" } },
                ] } },
              ],
            },
          },
          { kind: "scatter", title: "Boxes the tree carves", points: pts, boundary: [[4, 10], [4, 5], [8, 5], [8, 0]], x: [0, 10], y: [0, 10] },
        ],
      },
      highlight: ["tree"],
      log: [{ tone: "amber", cells: { model: "decision tree (depth 2)", result: "two questions", acc: `${TREE_ACC}%` } }],
      interviewTip: "Mention the split criterion (Gini or entropy for classification, variance for regression) and that trees need no feature scaling.",
    },
    {
      id: "overfit",
      title: "A tree that grows too deep memorises",
      simple: "Let a tree keep splitting and it makes a box for every single point, then fails on new people.",
      easy: "If you let a tree ask **unlimited questions**, it can make a tiny box around every single applicant. Training accuracy becomes **100%**, but it has learned the **noise**, not the pattern. On new applicants it does worse. Fixes: limit depth, need a minimum number of people per leaf, or use many trees together.",
      explain:
        "Unlimited depth drives training error to 0 and test error up: high {{variance}}. Control it with max depth, min samples per leaf and pruning, or average many trees. The same idea appears everywhere as the bias–variance trade-off.",
      stage: {
        kind: "viz",
        viz: {
          kind: "plot",
          title: "Accuracy vs tree depth (typical shape)",
          series: [
            { label: "training", points: [[1, 72], [2, 86], [3, 92], [4, 96], [6, 99], [8, 100], [10, 100]], tone: "blue" },
            { label: "test", points: [[1, 70], [2, 82], [3, 84], [4, 83], [6, 78], [8, 74], [10, 72]], tone: "rose" },
          ],
          x: [1, 10],
          y: [60, 100],
          xLabel: "max depth",
          yLabel: "accuracy %",
          markers: [{ x: 3, y: 84, label: "sweet spot", tone: "green" }],
          caption: "Illustrative curves, not from the 14 points above.",
        },
      },
      highlight: ["tree"],
    },
    {
      id: "ensembles",
      title: "Many trees beat one: forests and boosting",
      simple: "A forest lets many trees vote. Boosting builds trees one by one, each fixing the last one's mistakes.",
      easy: "One tree is shaky. Two fixes use **many trees**. A **random forest** trains hundreds of trees, each on a random sample of rows and columns, and lets them **vote**, so mistakes cancel out. **Gradient boosting** (XGBoost, LightGBM) builds trees **one after another**, each one focused on what the previous ones got wrong. On spreadsheet-style data, boosting usually wins.",
      explain:
        "{{random-forest|Random forest}} = bagging (bootstrap rows) + random feature subsets per split, then majority vote: lowers variance. {{boosting|Gradient boosting}} fits each new shallow tree to the residual errors (gradients) of the current ensemble with a small learning rate: lowers bias. XGBoost/LightGBM add regularisation, missing-value handling and speed.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Ensembles compared",
          columns: ["", "Random forest", "Gradient boosting"],
          rows: [
            ["trees built", "in parallel, independent", "one after another"],
            ["each tree", "deep, on random data", "shallow, fixes past errors"],
            ["mainly reduces", "variance", "bias"],
            ["tuning", "forgiving", "needs care (learning rate, depth)"],
            ["typical winner", "good baseline", "best on tabular data"],
          ],
        },
      },
      highlight: ["forest"],
      packets: [{ from: "tree", to: "forest", label: "× 300 trees", tone: "green" }],
      log: [{ tone: "green", cells: { model: "gradient boosting", result: "usual tabular winner", acc: "—" } }],
      interviewTip: "Bagging lowers variance, boosting lowers bias. That one line answers many follow-ups.",
    },
    {
      id: "features",
      title: "Features and regularisation matter most",
      simple: "Good clues beat a fancy model. Penalties stop the model leaning too hard on any one clue.",
      easy: "A model can only use the clues you give it. **Making better clues** (like “loan amount ÷ income” instead of each alone) often helps more than switching models. Also, put numbers on the **same scale** for line-based models. And add a small **penalty** for big weights (regularisation) so the model doesn't over-trust any one clue.",
      explain:
        "Feature engineering: ratios, dates → day-of-week, one-hot or target encoding for categories, log for skewed money values. Scale features for linear models and k-means. {{regularisation|Regularisation}}: L2 (ridge) shrinks all weights; L1 (lasso) pushes some to exactly 0 (feature selection). Avoid target leakage: no feature that uses future information.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Turning raw columns into good features",
          columns: ["raw", "feature", "why"],
          rows: [
            ["loan ₹8L, income ₹10L", "loan / income = 0.8", "risk is about the ratio"],
            ["city = Pune", "one-hot: is_pune = 1", "models need numbers"],
            ["salary ₹2L…₹2Cr", "log(salary)", "tames huge ranges"],
            ["applied_on date", "day of month", "salary-day effect"],
            ["“defaulted later” flag", "never use", "leaks the answer"],
          ],
          highlightRow: 4,
        },
      },
      deeper: { math: ["Ridge: loss + λ·Σ wᵢ²", "Lasso: loss + λ·Σ |wᵢ|"] },
    },
    {
      id: "kmeans",
      title: "No labels? Group by similarity (k-means)",
      simple: "With no right answers, k-means drops k centres, gives each point to the nearest, and moves the centres.",
      easy: `Sometimes there is **no label**, just data, like shop customers' spend and visits. **k-means** finds groups: drop **k** centre pins (here 2), give every customer to the **nearest pin**, move each pin to the **middle of its group**, and repeat until nothing moves. After one round the pins jump to (${f(C2[0][0], 1)}, ${f(C2[0][1], 1)}) and (${f(C2[1][0], 1)}, ${f(C2[1][1], 1)}) and stop moving: “casual” and “regular” shoppers. A bad starting spot can give silly groups, so real tools try several starts.`,
      explain: `{{kmeans|k-means}}: initialise k centroids, assign each point to the nearest (Euclidean), recompute centroids as means, repeat until stable. Here centroids moved from (1,6),(5,9) to (${f(C1[0][0], 1)}, ${f(C1[0][1], 1)}),(${f(C1[1][0], 1)}, ${f(C1[1][1], 1)}) then (${f(C2[0][0], 1)}, ${f(C2[0][1], 1)}),(${f(C2[1][0], 1)}, ${f(C2[1][1], 1)}). Choose k with the elbow method or silhouette; scale features first.`,
      stage: {
        kind: "viz",
        viz: [
          { kind: "scatter", title: "Round 1: nearest pin", points: [...SHOP.map(([x, y], i) => ({ x, y, tone: kTone(L1[i]) })), ...C0.map(([x, y], k) => ({ x, y, label: `pin ${k + 1}`, tone: "slate" as const }))], x: [0, 10], y: [0, 10] },
          { kind: "scatter", title: "Round 2: pins moved to group middles", points: [...SHOP.map(([x, y], i) => ({ x, y, tone: kTone(L2[i]) })), ...C2.map(([x, y], k) => ({ x, y, label: `pin ${k + 1}`, tone: "slate" as const }))], x: [0, 10], y: [0, 10], caption: "x = monthly spend, y = visits" },
        ],
      },
      highlight: ["data"],
      log: [{ tone: "blue", cells: { model: "k-means (k = 2)", result: "casual vs regular shoppers", acc: "no labels" } }],
    },
  ],
  interview: [
    {
      id: "cm-1",
      level: "fresher",
      q: "Logistic regression vs decision tree: when would you use each?",
      answer: "Logistic regression when the relationship is roughly linear, you need calibrated probabilities and easy explanation through weights, and features are scaled. A tree when interactions and thresholds matter, features are mixed types and unscaled, and you want readable rules. In practice, a tree ensemble usually beats both on tabular data.",
      lookFor: "Linear vs non-linear, interpretability, scaling, ensembles as the practical choice.",
      wrong: "“Logistic regression is for regression problems.” It is a classifier.",
    },
    {
      id: "cm-2",
      level: "mid",
      q: "Explain bagging vs boosting.",
      answer: "Bagging trains many models independently on bootstrap samples and averages them, which reduces variance (random forest also randomises features). Boosting trains models sequentially, each fitting the errors of the ensemble so far with a learning rate, which reduces bias (XGBoost, LightGBM). Boosting is usually more accurate but easier to overfit and needs tuning.",
      lookFor: "Parallel vs sequential, variance vs bias, examples, tuning cost.",
      wrong: "“They are the same thing with different libraries.”",
    },
    {
      id: "cm-3",
      level: "mid",
      q: "What is the difference between L1 and L2 regularisation?",
      answer: "Both add a penalty on weight size to the loss. L2 adds the sum of squares and shrinks all weights smoothly. L1 adds the sum of absolute values and drives some weights exactly to zero, acting as feature selection. Elastic net mixes both.",
      lookFor: "Penalty forms, shrink vs sparsity, why it fights overfitting.",
      wrong: "“L1 is faster than L2.”",
    },
    {
      id: "cm-4",
      level: "senior",
      design: true,
      q: "Build a churn model for a telecom. Walk me through it.",
      answer: "Define churn and the prediction window, build features only from data before the cutoff (usage trends, complaints, plan changes) to avoid leakage, split by time, start with a logistic baseline then gradient boosting, handle imbalance with class weights, evaluate with PR-AUC and recall at a fixed contact budget, explain with SHAP, and monitor drift after launch.",
      lookFor: "Leakage-safe features, time split, baseline first, right metric for imbalance, monitoring.",
      wrong: "“Use a deep neural network on all columns and report accuracy.”",
    },
  ],
  quiz: [
    {
      id: "cmq-1",
      q: `On this data the depth-2 tree scored ${TREE_ACC}% vs the line's ${LINE_ACC}%. Why can the tree do better?`,
      options: ["It uses more data", "It can carve boxes, not just one straight line", "It is always more accurate", "It scales features"],
      correct: 1,
      explain: "Axis-aligned splits can wrap around points a single line can't.",
    },
    {
      id: "cmq-2",
      q: "Which mainly reduces variance?",
      options: ["Gradient boosting", "Random forest (bagging)", "L1 penalty", "A deeper tree"],
      correct: 1,
      explain: "Averaging many independent trees cancels their individual noise.",
    },
    {
      id: "cmq-3",
      q: "Which model needs features on the same scale?",
      options: ["Decision tree", "Random forest", "k-means", "XGBoost"],
      correct: 2,
      explain: "k-means uses distances, so a feature in rupees would swamp one in visits.",
    },
    {
      id: "cmq-4",
      q: "A feature “defaulted_later” gives 99% accuracy. What is wrong?",
      options: ["Nothing, ship it", "Target leakage", "Too few trees", "Learning rate too high"],
      correct: 1,
      explain: "It uses information from the future that won't exist at prediction time.",
    },
  ],
};

export default scenario;
