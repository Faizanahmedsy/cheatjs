import type { Scenario } from "../engine/types";
import { f } from "../engine/math";

/* ------------------------------------------------------------------ *
 * MLOps on a food-delivery ETA model ("how many minutes until my
 * biryani arrives?"). Drift, latency and A/B numbers are computed.
 * ------------------------------------------------------------------ */

// Weekly mean absolute error (minutes) after launch; rain season starts in week 6.
const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const MAE = [4.1, 4.0, 4.2, 4.1, 4.0, 5.3, 6.4, 7.2, 4.3, 4.1];
const RETRAIN_WEEK = 8;
const ALERT = 5.5;
const FIRST_ALERT = WEEKS[MAE.findIndex((m) => m > ALERT)];

// Feature drift: share of orders placed while raining, training vs live (bins).
const RAIN_TRAIN = [0.92, 0.06, 0.02];
const RAIN_LIVE = [0.48, 0.32, 0.2];
/** Population stability index over the bins. */
const PSI = RAIN_TRAIN.reduce((s, e, i) => s + (RAIN_LIVE[i] - e) * Math.log(RAIN_LIVE[i] / e), 0);

// Serving latency budget (ms) for one prediction.
const LAT = [
  { label: "fetch features", value: 18 },
  { label: "model predict", value: 6 },
  { label: "network + JSON", value: 9 },
];
const LAT_TOTAL = LAT.reduce((s, x) => s + x.value, 0);

// A/B test: share of orders where ETA was within ±5 min.
const A = { n: 20000, ok: 0.71 };
const B = { n: 20000, ok: 0.74 };
const SE = Math.sqrt((A.ok * (1 - A.ok)) / A.n + (B.ok * (1 - B.ok)) / B.n);
const Z = (B.ok - A.ok) / SE;

const scenario: Scenario = {
  id: "mlops",
  title: "MLOps: shipping & running models",
  tagline: "A notebook score is the start. Serve it, watch it, retrain it.",
  imagine:
    "Imagine a delivery app that tells you “biryani in 32 minutes”. The model that guesses that number was trained in March. In July the monsoon arrives, roads flood, and every guess is 10 minutes too low. Nobody changed the code, yet the app got worse. MLOps is the work of noticing that, and fixing it safely.",
  recap: [
    "A model in production is a **pipeline**: versioned data and features, training, a registry, serving, and monitoring.",
    "Watch for **drift**: inputs change (feature drift) or the meaning changes (concept drift); alert on live error and input statistics.",
    "Ship changes safely: **shadow → canary → A/B test**, keep the old version ready to roll back, and retrain on fresh data.",
  ],
  overview: {
    plain:
      "MLOps is everything needed to keep a model useful after it leaves the notebook: serving it fast, keeping the same features in training and live, watching its accuracy as the world changes, and retraining and releasing new versions without breaking things.",
    definition:
      "{{mlops|MLOps}} applies DevOps practice to ML: versioned data, code and models; reproducible training pipelines; a {{feature-store|feature store}} so training and serving compute features the same way; a model registry; online or batch serving with latency SLOs; monitoring for {{drift|data and concept drift}}; and safe rollout with shadow, canary and A/B tests.",
    analogy: "Not just cooking a great dish once, but running the restaurant: same recipe every day, tasting, adjusting for the season.",
    facts: [
      ["Model", "food-delivery ETA (minutes)"],
      ["Alert", `MAE > ${ALERT} min (first fired week ${FIRST_ALERT})`],
      ["Rain feature PSI", `${f(PSI, 2)} (> 0.25 = big shift)`],
      ["Latency budget", `${LAT_TOTAL} ms per prediction`],
      ["A/B result", `${f(A.ok * 100, 0)}% → ${f(B.ok * 100, 0)}% on time, z ≈ ${f(Z, 1)}`],
      ["Tools", "MLflow, Feast, Airflow/Kubeflow, BentoML, SageMaker, Vertex AI"],
    ],
    whereUsed: "Any model customers rely on: ETAs, pricing, fraud, recommendations, search ranking, and LLM apps too (prompt versions, eval gates, cost and latency monitoring).",
  },
  objects: [
    { id: "data", kind: "db", label: "Data + features", sub: "versioned", at: [0, 1.8], tone: "blue" },
    { id: "train", kind: "gear", label: "Training pipeline", sub: "scheduled", at: [3, 0], tone: "amber" },
    { id: "registry", kind: "box", label: "Model registry", sub: "v1, v2 …", at: [6, 0], tone: "violet" },
    { id: "serve", kind: "server", label: "Serving API", sub: `~${LAT_TOTAL} ms`, at: [6, 3.6], tone: "cyan" },
    { id: "app", kind: "user", label: "Delivery app", sub: "asks for ETA", at: [9, 3.6], tone: "cyan" },
    { id: "monitor", kind: "chart", label: "Monitoring", sub: "error + drift", at: [9, 0], tone: "green" },
  ],
  links: [
    { id: "l1", from: "data", to: "train" },
    { id: "l2", from: "train", to: "registry" },
    { id: "l3", from: "registry", to: "serve" },
    { id: "l4", from: "app", to: "serve" },
    { id: "l5", from: "serve", to: "monitor" },
    { id: "l6", from: "monitor", to: "train" },
  ],
  logTitle: "Ops log",
  logColumns: [
    { key: "when", label: "When", width: "12%" },
    { key: "event", label: "Event" },
    { key: "value", label: "Value", align: "right", width: "18%" },
  ],
  steps: [
    {
      id: "gap",
      title: "The notebook is 10% of the job",
      simple: "Training a good model is the start. Running it reliably for real users is most of the work.",
      easy: "In the notebook, the ETA model scored well. But to be useful it must answer **millions of requests fast**, use **exactly the same inputs** as in training, keep working when the **world changes**, and be **replaced safely** when a better one exists. All that surrounding work is **MLOps**.",
      explain:
        "The model code is a small box in a large system: data pipelines, feature computation, training orchestration, a registry, serving, monitoring and rollout. {{mlops|MLOps}} makes that loop reproducible and safe.",
      stage: {
        kind: "viz",
        viz: {
          kind: "stack",
          title: "Typical effort in a production ML system (rough)",
          segments: [
            { label: "model code", value: 10, tone: "violet" },
            { label: "data + features", value: 35, tone: "blue" },
            { label: "serving + infra", value: 25, tone: "cyan" },
            { label: "monitoring + retraining", value: 20, tone: "green" },
            { label: "testing + release", value: 10, tone: "amber" },
          ],
        },
      },
      highlight: ["data", "train", "registry", "serve", "monitor"],
    },
    {
      id: "features",
      title: "Same features in training and serving",
      simple: "If training and the live app compute an input differently, the model gets confused and quietly fails.",
      easy: "The model learned using “average restaurant prep time over the **last 7 days**”. If the live app accidentally uses the **last 30 days**, the model gets a different number than it was trained on and makes worse guesses, **with no error message**. A **feature store** computes each input once, the same way for both.",
      explain:
        "{{skew|Training–serving skew}}: features computed differently offline and online. A {{feature-store|feature store}} defines each feature once, serves it at low latency online, and gives point-in-time-correct values for training (no future leakage).",
      stage: {
        kind: "cards",
        zones: [
          { id: "def", label: "feature definition (once)", icon: "doc", tone: "violet", text: "prep_time_7d = mean(prep minutes, last 7 days, per restaurant)" },
          { id: "off", label: "training (offline)", icon: "box", tone: "blue", cards: [{ id: "f1", title: "prep_time_7d as of each past order", sub: "point-in-time correct", tone: "blue" }] },
          { id: "on", label: "serving (online)", icon: "search", tone: "cyan", cards: [{ id: "f2", title: "prep_time_7d right now", sub: "low-latency lookup", tone: "cyan" }] },
        ],
        note: "one definition, two consumers: no skew",
      },
      highlight: ["data", "serve"],
    },
    {
      id: "registry",
      title: "Version everything, register the model",
      simple: "Save each model with its data version, code version and scores, so you can reproduce or roll back.",
      easy: "Every trained model gets a **version number** in a **registry**, together with which data it used, which code, its settings and its test scores. Then you can always answer “which model is live and why?”, rebuild it exactly, or **roll back** to the previous one in seconds.",
      explain:
        "Track experiments (params, metrics, artefacts) and register models with lineage: data snapshot, code commit, feature set, eval report. Promote by stage (staging → production) with approvals. Tools: MLflow, Weights & Biases, SageMaker or Vertex registries.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Model registry: eta-model",
          columns: ["version", "data", "code", "test MAE", "stage"],
          rows: [
            ["v7", "orders until 2026-03", "a1f3c9e", "4.0 min", "production"],
            ["v8", "orders until 2026-07 (incl. rain)", "a1f3c9e", "4.2 min", "staging"],
            ["v6", "orders until 2025-12", "9be20d1", "4.4 min", "archived"],
          ],
          highlightRow: 0,
        },
      },
      highlight: ["registry"],
      log: [{ tone: "violet", cells: { when: "Mar", event: "v7 promoted to production", value: "MAE 4.0" } }],
    },
    {
      id: "serve",
      title: "Serving: online, batch, and the latency budget",
      simple: "The app needs an answer in a few milliseconds, so every part of the request has a time budget.",
      easy: `When you open the app it asks “how long?”, and the answer must come back almost instantly. Here one prediction takes **${LAT_TOTAL} ms**: most of it is **fetching inputs**, not the model itself. Some jobs don't need instant answers (tomorrow's demand forecast), so they run in **batches** overnight, which is cheaper.`,
      explain: `Online serving behind an API with a p99 latency SLO; here ${LAT_TOTAL} ms, dominated by feature lookups (${LAT[0].value} ms). Batch scoring for non-urgent predictions. Scale with autoscaling and caching; for big models use GPUs, batching and quantisation.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "stack",
          title: `One ETA request (${LAT_TOTAL} ms)`,
          segments: LAT.map((x, i) => ({ label: `${x.label} ${x.value} ms`, value: x.value, tone: (["blue", "violet", "slate"] as const)[i] })),
        },
      },
      highlight: ["app", "serve"],
      packets: [
        { from: "app", to: "serve", label: "order #8812", tone: "cyan" },
        { from: "serve", to: "app", label: "ETA 32 min", tone: "green" },
      ],
      log: [{ tone: "cyan", cells: { when: "live", event: "p99 latency", value: `${LAT_TOTAL} ms` } }],
    },
    {
      id: "drift",
      title: "The monsoon arrives: error climbs",
      simple: "The world changed, so the model's guesses got worse even though nobody touched the code.",
      easy: `For five weeks the average miss is about **4 minutes**. Then the rains start. Roads flood, deliveries slow down, and the model, trained on dry months, keeps guessing too low. In week ${FIRST_ALERT} the error crosses the **${ALERT}-minute alert line**, and the team gets a message.`,
      explain: `Monitor live error once the true delivery time is known. Weekly MAE rose from ~4.0 to ${Math.max(...MAE)} min; the alert at ${ALERT} min fired in week ${FIRST_ALERT}. This is {{drift|concept drift}}: the link between inputs and the answer changed.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "plot",
          title: "Live ETA error per week (minutes)",
          series: [
            { label: "MAE", points: WEEKS.map((w, i) => [w, MAE[i]]), tone: "rose" },
            { label: "alert line", points: [[1, ALERT], [10, ALERT]], tone: "slate", dashed: true },
          ],
          x: [1, 10],
          y: [0, 8],
          xLabel: "week after launch",
          yLabel: "MAE (min)",
          markers: [
            { x: FIRST_ALERT, y: MAE[FIRST_ALERT - 1], label: "alert", tone: "rose" },
            { x: RETRAIN_WEEK, y: MAE[RETRAIN_WEEK - 1], label: "retrain", tone: "green" },
          ],
        },
      },
      highlight: ["monitor"],
      packets: [{ from: "serve", to: "monitor", label: "predictions + actuals", tone: "rose" }],
      log: [{ tone: "rose", cells: { when: `week ${FIRST_ALERT}`, event: "MAE alert fired", value: `${MAE[FIRST_ALERT - 1]} min` } }],
    },
    {
      id: "psi",
      title: "Catch it earlier: watch the inputs too",
      simple: "Even before true answers arrive, you can notice that today's inputs look different from training.",
      easy: `True delivery times arrive only after the food does. A faster warning: compare **today's inputs** with the training data. In training, only ${f(RAIN_TRAIN[2] * 100, 0)}% of orders were in heavy rain. Now it's ${f(RAIN_LIVE[2] * 100, 0)}%. A drift score called **PSI** comes out at **${f(PSI, 2)}**, far above the usual 0.25 “big change” mark.`,
      explain: `{{drift|Feature drift}} detection compares live input distributions with training ones, using PSI, KL divergence or KS tests. Rain bins (none / light / heavy) give PSI = ${f(PSI, 2)} (> 0.25 = significant). It fires before labels arrive, but drift doesn't always hurt accuracy, so pair it with error monitoring.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Rain at order time: training vs live",
          columns: ["bin", "training", "live"],
          rows: [
            ["no rain", `${f(RAIN_TRAIN[0] * 100, 0)}%`, `${f(RAIN_LIVE[0] * 100, 0)}%`],
            ["light rain", `${f(RAIN_TRAIN[1] * 100, 0)}%`, `${f(RAIN_LIVE[1] * 100, 0)}%`],
            ["heavy rain", `${f(RAIN_TRAIN[2] * 100, 0)}%`, `${f(RAIN_LIVE[2] * 100, 0)}%`],
          ],
          highlightRow: 2,
          caption: `PSI = Σ (live − train) · ln(live / train) = ${f(PSI, 2)}`,
        },
      },
      highlight: ["monitor", "data"],
      deeper: { math: ["PSI = Σᵢ (liveᵢ − trainᵢ) · ln(liveᵢ / trainᵢ)", "< 0.1 stable · 0.1–0.25 watch · > 0.25 act"] },
    },
    {
      id: "rollout",
      title: "Retrain, then roll out carefully",
      simple: "Train a new version on fresh data, test it quietly, give it to a few users, then everyone.",
      easy: `The team retrains on data that **includes the rainy weeks** (v8). They don't switch everyone at once. First **shadow**: v8 guesses silently beside v7. Then a **canary**: 5% of users get v8. Then an **A/B test**: v8's ETAs were within 5 minutes **${f(B.ok * 100, 0)}%** of the time vs **${f(A.ok * 100, 0)}%**. With 20,000 orders each that gap is clearly real (z ≈ ${f(Z, 1)}), so v8 goes live, and v7 stays ready for rollback.`,
      explain: `Release ladder: offline eval → {{shadow|shadow}} (no user impact) → canary (small %) → A/B test on the business metric. Here on-time rate ${f(A.ok * 100, 0)}% → ${f(B.ok * 100, 0)}% with n = ${A.n.toLocaleString()} per arm: z ≈ ${f(Z, 1)}, well past 1.96 (95%). Automate retraining on a schedule or a drift trigger, but keep a human approval for promotion.`,
      stage: {
        kind: "viz",
        viz: [
          {
            kind: "table",
            title: "Safe rollout",
            columns: ["stage", "who sees v8", "checks"],
            rows: [
              ["offline eval", "nobody", "MAE on recent weeks"],
              ["shadow", "nobody (logged only)", "latency, errors, disagreement"],
              ["canary", "5% of users", "crash rate, complaints"],
              ["A/B test", "50%", "on-time rate, cancellations"],
              ["full rollout", "100%", "keep v7 for rollback"],
            ],
            highlightRow: 3,
          },
          {
            kind: "bars",
            title: "A/B: ETA within ±5 min",
            items: [
              { label: "v7 (control)", value: A.ok * 100, tone: "slate" },
              { label: "v8 (rain-aware)", value: B.ok * 100, tone: "green" },
            ],
            max: 100,
            format: "int",
          },
        ],
      },
      highlight: ["train", "registry", "serve"],
      packets: [
        { from: "monitor", to: "train", label: "drift → retrain", tone: "amber" },
        { from: "registry", to: "serve", label: "v8 canary 5%", tone: "violet" },
      ],
      log: [
        { tone: "amber", cells: { when: `week ${RETRAIN_WEEK}`, event: "v8 trained on rain data", value: "MAE 4.2 offline" } },
        { tone: "green", cells: { when: "week 9", event: "v8 wins A/B, promoted", value: `z ≈ ${f(Z, 1)}` } },
      ],
      interviewTip: "Mention rollback and that promotion is gated on the business metric, not just offline loss.",
    },
  ],
  interview: [
    {
      id: "mo-1",
      level: "fresher",
      q: "What is data drift and how do you detect it?",
      answer: "Drift is when live data differs from training data. Feature drift: input distributions shift, detected with PSI, KL or KS tests against a training baseline. Concept drift: the input-to-label relationship changes, detected by monitoring live error once labels arrive. Alert on thresholds and investigate before retraining.",
      lookFor: "Both kinds, a statistic for each, label delay.",
      wrong: "“Retrain every day and you never need to check.”",
    },
    {
      id: "mo-2",
      level: "mid",
      q: "What is training–serving skew and how do you prevent it?",
      answer: "When features are computed differently in training and in production, the model sees inputs it wasn't trained on and degrades silently. Prevent it with one feature definition shared by both (a feature store), point-in-time joins for training data, logging served features, and comparing their distributions with training.",
      lookFor: "Silent failure, shared definitions, logging and comparison.",
      wrong: "“Use the same programming language in both places.”",
    },
    {
      id: "mo-3",
      level: "mid",
      q: "How do you roll out a new model version safely?",
      answer: "Offline evaluation on recent data, then shadow mode to compare predictions and latency without user impact, a small canary, then an A/B test on the business metric with enough traffic for significance. Keep the previous version in the registry for instant rollback and automate the guardrails.",
      lookFor: "Ladder of stages, business metric, rollback.",
      wrong: "“Replace the model file on the server.”",
    },
    {
      id: "mo-4",
      level: "senior",
      design: true,
      q: "Design the ML platform for a food-delivery ETA model.",
      answer: "Event data into a warehouse; a feature store with streaming features (live traffic, kitchen load) and batch ones; scheduled training pipeline with experiment tracking and a registry; online serving with a p99 budget and fallbacks to a heuristic; monitoring of latency, error by city and weather, and input drift; drift- or schedule-triggered retraining; shadow, canary and A/B rollout with rollback.",
      lookFor: "End-to-end loop, streaming features, fallback, segmented monitoring, safe release.",
      wrong: "“Train in a notebook, export a pickle, done.”",
    },
  ],
  quiz: [
    {
      id: "moq-1",
      q: "Roads flood and deliveries slow, so the same inputs now mean longer times. This is…",
      options: ["Training–serving skew", "Concept drift", "Overfitting", "A latency problem"],
      correct: 1,
      explain: "The relationship between inputs and the answer changed.",
    },
    {
      id: "moq-2",
      q: `PSI of ${f(PSI, 2)} on the rain feature suggests…`,
      options: ["Stable", "Watch it", "A significant shift", "Nothing, PSI is for labels"],
      correct: 2,
      explain: "Above 0.25 is usually treated as a significant change.",
    },
    {
      id: "moq-3",
      q: "In shadow mode, the new model…",
      options: ["Serves 5% of users", "Predicts silently, users see the old model", "Replaces the old model", "Is only tested offline"],
      correct: 1,
      explain: "Shadow compares behaviour on real traffic with zero user impact.",
    },
    {
      id: "moq-4",
      q: `Where does most of the ${LAT_TOTAL} ms go?`,
      options: ["The model's maths", "Fetching features", "Logging", "DNS"],
      correct: 1,
      explain: `${LAT[0].value} ms of ${LAT_TOTAL} ms is the feature lookup.`,
    },
  ],
};

export default scenario;
