import type { Scenario } from "../engine/types";
import { f } from "../engine/math";

/* ------------------------------------------------------------------ *
 * The ML system design round, worked on one prompt: "Design the
 * 'Recommended for you' row for a food-delivery app." Funnel sizes and
 * the latency budget are computed.
 * ------------------------------------------------------------------ */

const USERS_DAU = 20e6;
const OPENS_PER_DAY = 3;
const QPS_AVG = (USERS_DAU * OPENS_PER_DAY) / 86400;
const QPS_PEAK = QPS_AVG * 4;

const FUNNEL = [
  { stage: "all restaurants in city", n: 40000 },
  { stage: "candidate generation", n: 1000 },
  { stage: "ranking model", n: 100 },
  { stage: "re-rank + business rules", n: 20 },
];
const BUDGET = [
  { label: "candidates (ANN + rules)", value: 25 },
  { label: "feature fetch", value: 30 },
  { label: "ranking model", value: 40 },
  { label: "re-rank + rules", value: 10 },
  { label: "network", value: 20 },
];
const BUDGET_TOTAL = BUDGET.reduce((s, b) => s + b.value, 0);

const scenario: Scenario = {
  id: "ml-system-design",
  title: "ML system design round",
  tagline: "A 45-minute framework, worked on a real prompt: design a recommendations row.",
  imagine:
    "Imagine being asked to design a restaurant's kitchen in 45 minutes. A weak candidate starts drawing ovens. A strong one first asks: how many customers, what menu, what does success look like, what is the budget? Then sketches stations in order, and ends with how they'll know it works. The ML design round rewards exactly that order.",
  recap: [
    "Follow a fixed order: **clarify → metrics → data and labels → features → model (baseline first) → serving → evaluation → monitoring**.",
    "Big catalogues use a **funnel**: cheap candidate generation narrows thousands to hundreds, a heavier ranker orders them, rules finish.",
    "Name **numbers and trade-offs** out loud: QPS, latency budget, offline vs online metrics, cold start, feedback loops, fairness.",
  ],
  overview: {
    plain:
      "In the ML system design interview you design a full machine-learning product, not just a model. Interviewers want to see a clear structure, sensible numbers, simple first versions, and that you know how it will be measured and kept healthy.",
    definition:
      "A structured approach: (1) clarify scope and constraints, (2) define the business and ML objective and {{metrics-online|online/offline metrics}}, (3) data sources and labels (implicit feedback, delayed labels, leakage), (4) features, (5) a baseline then a stronger model, typically a {{two-stage|candidate generation + ranking}} funnel for large catalogues, (6) serving architecture with a latency budget, (7) offline evaluation and A/B testing, (8) monitoring, retraining, {{cold-start|cold start}}, feedback loops and fairness.",
    analogy: "Designing a restaurant kitchen: first the customers and menu, then the stations, then how you'll taste every dish.",
    facts: [
      ["Prompt", "“Recommended for you” row, food delivery"],
      ["Traffic", `${f(USERS_DAU / 1e6, 0)}M daily users × ${OPENS_PER_DAY} opens ≈ ${f(QPS_AVG, 0)} QPS avg, ~${f(QPS_PEAK, 0)} peak`],
      ["Funnel", FUNNEL.map((s) => s.n.toLocaleString()).join(" → ")],
      ["Latency budget", `${BUDGET_TOTAL} ms p99`],
      ["Online metric", "orders per session, conversion"],
      ["Offline metric", "NDCG@10, recall@100 for candidates"],
    ],
    whereUsed: "The ML design round at product companies (feeds, search ranking, fraud, ETA, ads, RAG products). Interviewers judge structure, trade-offs and production sense more than model novelty.",
  },
  objects: [
    { id: "user", kind: "user", label: "User opens app", sub: `~${f(QPS_PEAK, 0)} QPS peak`, at: [0, 1.8], tone: "cyan" },
    { id: "cand", kind: "search", label: "Candidates", sub: "40k → 1k", at: [3, 0], tone: "blue" },
    { id: "feat", kind: "db", label: "Feature store", sub: "user, restaurant, context", at: [3, 3.6], tone: "slate" },
    { id: "rank", kind: "ranker", label: "Ranker", sub: "1k → 100", at: [6, 1.8], tone: "violet" },
    { id: "rules", kind: "gear", label: "Re-rank + rules", sub: "100 → 20", at: [9, 1.8], tone: "amber" },
    { id: "logs", kind: "chart", label: "Logs + A/B", sub: "clicks, orders", at: [9, 4.6], tone: "green" },
  ],
  links: [
    { id: "l1", from: "user", to: "cand" },
    { id: "l2", from: "cand", to: "rank" },
    { id: "l3", from: "feat", to: "rank" },
    { id: "l4", from: "rank", to: "rules" },
    { id: "l5", from: "rules", to: "logs" },
  ],
  logTitle: "Design notes (say these out loud)",
  logColumns: [
    { key: "phase", label: "Phase", width: "18%" },
    { key: "decision", label: "Decision" },
    { key: "why", label: "Why" },
  ],
  steps: [
    {
      id: "clarify",
      title: "1. Clarify before you design",
      simple: "Ask questions first: who, how many, what counts as success, and what limits there are.",
      easy: "Don't jump to models. Spend the first 5 minutes asking: **Who** sees the row (new and returning users)? **How many** users and how fast must it load? What is **success**: clicks or actual orders? Any **rules**: promoted restaurants, only open ones, delivery distance? Then say your assumptions out loud and write them down.",
      explain:
        "Scope the problem: users and scale, latency, freshness, what “good” means for the business, constraints (open restaurants, delivery radius, sponsored slots, diversity), and what exists already (logs, features). State assumptions explicitly; interviewers reward this.",
      stage: {
        kind: "chat",
        messages: [
          { role: "user", text: "Design the “Recommended for you” row for a food-delivery app.", note: "the interviewer" },
          { role: "assistant", text: "Before designing: how many daily users, and what latency do we need? Is success clicks or completed orders? Should we only show open restaurants within delivery range? Any sponsored slots?", note: "you, first 5 minutes" },
          { role: "user", text: "20M daily users, under 200 ms, optimise for orders, open and deliverable only, 2 sponsored slots." },
        ],
      },
      highlight: ["user"],
      log: [{ tone: "cyan", cells: { phase: "clarify", decision: "optimise orders, <200 ms, 20M DAU", why: "sets every later choice" } }],
    },
    {
      id: "metrics",
      title: "2. Pick the metrics",
      simple: "Name one business number to move, a model number to train against, and numbers you must not hurt.",
      easy: "Say three kinds of metric. **Online (business)**: orders per session, because that's the goal. **Offline (model)**: how well the model ranks things people actually ordered, e.g. NDCG@10. **Guardrails**: things that must not get worse, like page load time, cancellations, and fairness to small restaurants.",
      explain:
        "Online: conversion / orders per session (primary), measured by A/B test. Offline: NDCG@k or MAP for the ranker, recall@k for candidate generation, calibrated log loss for predicted order probability. Guardrails: latency, cancellations, diversity and new-restaurant exposure, user complaints.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Metrics plan",
          columns: ["type", "metric", "why"],
          rows: [
            ["online (primary)", "orders per session", "the business goal"],
            ["offline (ranker)", "NDCG@10", "are ordered items near the top?"],
            ["offline (candidates)", "recall@1000", "did the right items survive step 1?"],
            ["guardrails", "p99 latency, cancellations, new-restaurant exposure", "don't win by breaking these"],
          ],
        },
      },
      highlight: ["logs"],
      log: [{ tone: "green", cells: { phase: "metrics", decision: "orders/session; NDCG@10; guardrails", why: "online truth, offline proxy" } }],
    },
    {
      id: "data",
      title: "3. Data, labels and features",
      simple: "Use past views, clicks and orders as labels, and describe user, restaurant and time as features.",
      easy: "Training examples come from **logs**: each time a restaurant was shown, did the user **click**, and did they **order**? Orders are the label we care about; clicks are extra signal. Features: about the **user** (favourite cuisines, usual price, time since last order), the **restaurant** (rating, prep time, price, distance), and the **context** (time of day, weather, day of week). Watch for **position bias**: things shown first get clicked more.",
      explain:
        "Labels: impression → click → order (implicit feedback; negatives are shown-but-not-ordered). Handle position bias (position as a feature at training, fixed at serving, or randomised exploration traffic). Features: user history embeddings, restaurant stats, user×restaurant cross features (past orders there), context. Use point-in-time joins to avoid leakage.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "One training row",
          columns: ["group", "features", "label"],
          rows: [
            ["user", "likes biryani, avg ₹350, last order 3 days ago", ""],
            ["restaurant", "rating 4.3, prep 18 min, 2.1 km, ₹₹", ""],
            ["user × restaurant", "ordered here 4 times", ""],
            ["context", "Friday 8 pm, raining, position 2", ""],
            ["", "", "ordered = 1"],
          ],
        },
      },
      highlight: ["feat"],
      log: [{ tone: "slate", cells: { phase: "data", decision: "impressions → orders; handle position bias", why: "implicit feedback is biased" } }],
    },
    {
      id: "funnel",
      title: "4. The funnel: narrow, then rank",
      simple: "First cheaply pick a thousand likely restaurants, then score those carefully, then apply the rules.",
      easy: `You can't run a heavy model on **${FUNNEL[0].n.toLocaleString()}** restaurants in 200 ms. So use a **funnel**. Step 1, **candidate generation**: cheap methods (similar-users, embeddings, popular nearby) pick about **${FUNNEL[1].n.toLocaleString()}**. Step 2, a strong **ranking model** scores those and keeps the top **${FUNNEL[2].n}**. Step 3, **re-rank**: add variety, sponsored slots and rules, and show **${FUNNEL[3].n}**.`,
      explain:
        "{{two-stage|Two-stage recommender}}: candidate generation (two-tower embedding model + ANN search, plus heuristics like popular-near-you and reorder) optimised for recall; ranking (gradient-boosted trees or a deep model predicting P(order)) optimised for precision at the top; re-ranking for diversity, freshness, business rules and ads.",
      stage: {
        kind: "viz",
        viz: {
          kind: "bars",
          title: "Items left after each stage",
          items: FUNNEL.map((s, i) => ({ label: s.stage, value: s.n, tone: (["slate", "blue", "violet", "amber"] as const)[i] })),
          format: "int",
        },
      },
      highlight: ["cand", "rank", "rules"],
      packets: [
        { from: "user", to: "cand", label: "user + location", tone: "cyan" },
        { from: "cand", to: "rank", label: "1,000", tone: "blue" },
        { from: "rank", to: "rules", label: "top 100", tone: "violet" },
      ],
      log: [{ tone: "violet", cells: { phase: "model", decision: "two-tower candidates → GBDT/deep ranker → re-rank", why: "fit the latency budget" } }],
      interviewTip: "Always propose a baseline first (popular nearby + reorder), then the ML funnel.",
    },
    {
      id: "serving",
      title: "5. Serving and the latency budget",
      simple: "Split the time limit between each step, and plan for peak traffic and failures.",
      easy: `Do the maths aloud. ${f(USERS_DAU / 1e6, 0)} million users opening the app ${OPENS_PER_DAY} times a day is about **${f(QPS_AVG, 0)} requests a second**, maybe **${f(QPS_PEAK, 0)}** at dinner time. Split the **${BUDGET_TOTAL} ms** budget across steps. Precompute what you can (user embeddings overnight), cache popular results, and if the model is slow or down, **fall back** to “popular near you”.`,
      explain: `QPS ≈ ${f(QPS_AVG, 0)} avg, ~${f(QPS_PEAK, 0)} peak. Budget ${BUDGET_TOTAL} ms p99: ${BUDGET.map((b) => `${b.label} ${b.value}`).join(", ")}. Precompute embeddings in batch, keep real-time features in an online store, cache per area, autoscale, and degrade gracefully to a heuristic.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "stack",
          title: `p99 latency budget (${BUDGET_TOTAL} ms)`,
          segments: BUDGET.map((b, i) => ({ label: `${b.label} ${b.value}`, value: b.value, tone: (["blue", "slate", "violet", "amber", "cyan"] as const)[i] })),
        },
      },
      highlight: ["feat", "rank"],
      log: [{ tone: "amber", cells: { phase: "serving", decision: `${BUDGET_TOTAL} ms budget, fallback to popular`, why: `~${f(QPS_PEAK, 0)} QPS at peak` } }],
    },
    {
      id: "evaluate",
      title: "6. Evaluate offline, then A/B test",
      simple: "Check the model on past data first, then prove it with a real experiment on users.",
      easy: "Offline, replay past days: would the new model have put the restaurants people actually ordered from near the top? If it wins, run an **A/B test**: half the users get the new row, half the old. Run it for at least a week (weekends behave differently) and look at orders per session plus the guardrails.",
      explain:
        "Offline: time-based split, NDCG@10 and recall@k, segmented by new vs returning users and city. Online: A/B test with a power calculation for the minimum detectable effect, at least one full weekly cycle, primary metric plus guardrails; watch novelty effects. Offline gains don't always transfer, which is why the A/B test decides.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Evaluation plan",
          columns: ["stage", "how", "decides"],
          rows: [
            ["offline", "time split, NDCG@10 by segment", "is it worth testing?"],
            ["shadow", "score live traffic, don't show", "latency, errors"],
            ["A/B test", "50/50, ≥ 1 week, power-calculated", "ship or not"],
            ["after launch", "dashboards per city and segment", "rollback if guardrails break"],
          ],
        },
      },
      highlight: ["logs"],
    },
    {
      id: "risks",
      title: "7. Cold start, feedback loops, fairness",
      simple: "Plan for new users and restaurants, avoid only showing what's already popular, and keep it fair.",
      easy: "Interviewers love these. **Cold start**: a new user has no history, so start with popular nearby and ask their tastes; a new restaurant gets some guaranteed exposure. **Feedback loop**: the model only learns from what it showed, so popular places get more popular; keep a little **exploration** traffic. **Fairness**: don't bury small restaurants; track their exposure.",
      explain:
        "{{cold-start|Cold start}}: content-based features and popularity priors for new users and items, onboarding preferences, exploration slots. Feedback loops and popularity bias: reserve a small randomised slice (epsilon-greedy or bandits) to collect unbiased data. Fairness: exposure targets for new or small restaurants. Retrain daily; monitor drift by city and season.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Risks and fixes",
          columns: ["risk", "fix"],
          rows: [
            ["new user, no history", "popular nearby + onboarding cuisines"],
            ["new restaurant, no orders", "content features + exploration slots"],
            ["rich-get-richer loop", "5% exploration traffic, bandits"],
            ["small restaurants buried", "exposure guardrail in re-rank"],
            ["festival / rain changes taste", "daily retraining, context features"],
          ],
        },
      },
      highlight: ["rules", "logs"],
      packets: [{ from: "logs", to: "cand", label: "daily retrain", tone: "green" }],
      log: [{ tone: "rose", cells: { phase: "risks", decision: "exploration + cold-start priors", why: "avoid feedback loops" } }],
    },
  ],
  interview: [
    {
      id: "sd-1",
      level: "mid",
      q: "Why do large recommenders use candidate generation and ranking stages?",
      answer: "Scoring every item with a heavy model is too slow for a latency budget. A cheap, recall-focused stage (two-tower embeddings + ANN, heuristics) narrows thousands to hundreds; a precise ranker with rich features orders those; a re-ranker applies diversity and business rules. Each stage has its own metric.",
      lookFor: "Latency reason, recall vs precision, per-stage metrics.",
      wrong: "“Two models are always more accurate than one.”",
    },
    {
      id: "sd-2",
      level: "mid",
      q: "How do you handle position bias in click data?",
      answer: "Items shown higher get more clicks regardless of quality. Include position as a training feature and set it to a fixed value at serving, use inverse propensity weighting estimated from randomised traffic, or collect a small exploration slice where order is randomised.",
      lookFor: "Names the bias and at least two correction methods.",
      wrong: "“Clicks are ground truth, so train on them directly.”",
    },
    {
      id: "sd-3",
      level: "senior",
      design: true,
      q: "Design a fraud-detection system for UPI payments.",
      answer: "Clarify latency (inline, < 100 ms) and the cost of false positives vs fraud loss. Labels from chargebacks (delayed) and analyst reviews. Features: velocity counts, device and location changes, payee risk, graph features. Rules plus a gradient-boosted model scoring in real time with a streaming feature store; thresholds tuned on cost; uncertain cases to review or step-up auth. Evaluate with PR-AUC and recall at a fixed review budget; monitor drift and adversarial adaptation; retrain often.",
      lookFor: "Latency, delayed labels, streaming features, cost-based thresholds, human review, drift.",
      wrong: "“Train a deep network on all transactions and block anything above 0.5.”",
    },
    {
      id: "sd-4",
      level: "senior",
      design: true,
      q: "Design a RAG assistant over 5 million internal documents for 50,000 employees.",
      answer: "Clarify access control, freshness and latency. Ingest with parsing, chunking and metadata (department, ACL), embed and index in a vector DB with hybrid search; filter by ACL at query time; rerank; generate with citations; cache frequent queries. Evaluate with a golden set (retrieval recall, faithfulness), online feedback, cost per query; incremental re-indexing on document change.",
      lookFor: "ACL filtering, hybrid + rerank, citations, evals, freshness, cost.",
      wrong: "“Fine-tune an LLM on all 5 million documents.”",
    },
  ],
  quiz: [
    {
      id: "sdq-1",
      q: "What should you do in the first 5 minutes?",
      options: ["Choose a model", "Clarify scope, scale and success metric", "Write code", "Draw the database schema"],
      correct: 1,
      explain: "Everything later depends on the answers.",
    },
    {
      id: "sdq-2",
      q: "Candidate generation is mainly optimised for…",
      options: ["Precision at the top", "Recall: don't lose good items", "Latency only", "Fairness"],
      correct: 1,
      explain: "The ranker can only order items that survive step 1.",
    },
    {
      id: "sdq-3",
      q: `${f(USERS_DAU / 1e6, 0)}M users × ${OPENS_PER_DAY} opens/day is about how many requests per second on average?`,
      options: ["70", `${f(QPS_AVG, 0)}`, "60,000", "20 million"],
      correct: 1,
      explain: "60 million ÷ 86,400 seconds.",
    },
    {
      id: "sdq-4",
      q: "Best way to stop a rich-get-richer feedback loop?",
      options: ["Retrain more often", "Keep a small exploration slice", "Bigger model", "Remove popular items"],
      correct: 1,
      explain: "Exploration collects data the model wouldn't otherwise see.",
    },
  ],
};

export default scenario;
