import type { Scenario, Tone } from "../engine/types";
import { f } from "../engine/math";

/* ------------------------------------------------------------------ *
 * A fraud model scores 1,000 UPI payments; 20 are really fraud. Every
 * metric below is computed from the confusion-matrix counts at each
 * threshold, never typed in.
 * ------------------------------------------------------------------ */

const TOTAL = 1000;
const FRAUD = 20;
const LEGIT = TOTAL - FRAUD;

/** Counts at each threshold (how many fraud / legit payments score above it). */
const AT = [
  { t: 0.9, fraudAbove: 9, legitAbove: 2 },
  { t: 0.7, fraudAbove: 14, legitAbove: 8 },
  { t: 0.5, fraudAbove: 16, legitAbove: 20 },
  { t: 0.3, fraudAbove: 18, legitAbove: 60 },
  { t: 0.1, fraudAbove: 20, legitAbove: 200 },
];
const metrics = (a: (typeof AT)[number]) => {
  const tp = a.fraudAbove, fp = a.legitAbove, fn = FRAUD - tp, tn = LEGIT - fp;
  const precision = tp / (tp + fp);
  const recall = tp / FRAUD;
  return { ...a, tp, fp, fn, tn, precision, recall, f1: (2 * precision * recall) / (precision + recall), accuracy: (tp + tn) / TOTAL, fpr: fp / LEGIT };
};
const ROWS = AT.map(metrics);
const MAIN = ROWS[2]; // threshold 0.5
const LAZY_ACC = LEGIT / TOTAL; // always say "not fraud"
const pc = (x: number) => `${f(x * 100, 1)}%`;
const BEST_F1 = ROWS.reduce((a, b) => (a.f1 >= b.f1 ? a : b));

// ROC points (FPR, TPR) incl. the corners, and a trapezoid AUC.
const ROC: [number, number][] = [[0, 0], ...ROWS.map((r) => [r.fpr, r.recall] as [number, number]), [1, 1]];
const AUC = ROC.slice(1).reduce((s, [x, y], i) => s + (x - ROC[i][0]) * (y + ROC[i][1]) / 2, 0);

// 5-fold cross-validation scores
const FOLDS = [0.81, 0.78, 0.84, 0.8, 0.79];
const CV_MEAN = FOLDS.reduce((a, b) => a + b, 0) / FOLDS.length;
const CV_SD = Math.sqrt(FOLDS.reduce((s, x) => s + (x - CV_MEAN) ** 2, 0) / FOLDS.length);

const cellTone = (good: boolean): Tone => (good ? "green" : "rose");

const scenario: Scenario = {
  id: "model-metrics",
  title: "Model metrics & validation",
  tagline: "Accuracy lies. Ask which mistakes, how many, and at what cost.",
  imagine:
    "Imagine a security guard who lets everyone through. In a mall where 1 in 50 visitors is a pickpocket, that guard is “98% accurate” and completely useless. Good metrics ask a sharper question: of the thieves, how many did you stop, and how many innocent shoppers did you annoy?",
  recap: [
    "Count four outcomes (**TP, FP, FN, TN**); every metric is a ratio of them. Accuracy hides rare classes.",
    "**Precision** = of the alarms, how many were real. **Recall** = of the real cases, how many we caught. The **threshold** trades one for the other.",
    "Compare models with **PR-AUC / ROC-AUC** and **cross-validation**, then pick the threshold that matches the business cost.",
  ],
  overview: {
    plain:
      "A model's score should match what matters to the business. With rare events like fraud, accuracy looks great even for a useless model. Precision and recall show how many alarms were right and how many real cases were caught, and the cut-off score decides the balance.",
    definition:
      "For classification, the {{confusion|confusion matrix}} counts true/false positives and negatives. From it: {{precision}} = TP/(TP+FP), {{recall}} = TP/(TP+FN), {{f1|F1}} = their harmonic mean, and false-positive rate = FP/(FP+TN). Sweeping the decision threshold traces the {{roc|ROC}} and precision–recall curves; their areas summarise ranking quality. {{cross-validation|Cross-validation}} averages scores over several train/test splits for a more reliable estimate.",
    analogy: "A mall guard: catching thieves (recall) vs not stopping innocent shoppers (precision).",
    facts: [
      ["Data", `${TOTAL} payments, ${FRAUD} fraud (${pc(FRAUD / TOTAL)})`],
      ["Lazy model", `always “legit” = ${pc(LAZY_ACC)} accuracy, 0% recall`],
      [`At t = ${MAIN.t}`, `precision ${pc(MAIN.precision)}, recall ${pc(MAIN.recall)}, F1 ${f(MAIN.f1, 2)}`],
      ["ROC-AUC", f(AUC, 3)],
      ["5-fold CV", `${f(CV_MEAN, 3)} ± ${f(CV_SD, 3)}`],
      ["Regression", "MAE, RMSE, R²; ranking: MRR, NDCG"],
    ],
    whereUsed: "Every model review: fraud and spam (precision vs recall), medical screening (recall first), recommendations (ranking metrics), forecasting (MAE/RMSE), and A/B tests that confirm offline gains online.",
  },
  objects: [
    { id: "pay", kind: "table", label: "Payments", sub: `${TOTAL}, ${FRAUD} fraud`, at: [0, 1.8], tone: "blue" },
    { id: "model", kind: "llm", label: "Fraud model", sub: "score 0–1", at: [3, 1.8], tone: "violet" },
    { id: "cut", kind: "gauge", label: "Threshold", sub: `t = ${MAIN.t}`, at: [6, 1.8], tone: "amber" },
    { id: "flag", kind: "box", label: "Flagged", sub: "sent to review", at: [9, 0], tone: "rose" },
    { id: "pass", kind: "box", label: "Passed", sub: "goes through", at: [9, 3.6], tone: "green" },
  ],
  links: [
    { id: "l1", from: "pay", to: "model" },
    { id: "l2", from: "model", to: "cut" },
    { id: "l3", from: "cut", to: "flag" },
    { id: "l4", from: "cut", to: "pass" },
  ],
  logTitle: "Metrics",
  logColumns: [
    { key: "what", label: "What" },
    { key: "value", label: "Value", align: "right", width: "18%" },
    { key: "note", label: "Note" },
  ],
  steps: [
    {
      id: "trap",
      title: "The 98% accurate model that catches nothing",
      simple: "When fraud is rare, a model that never says “fraud” still looks 98% accurate.",
      easy: `Out of ${TOTAL} payments only **${FRAUD} are fraud**. A lazy model that always says “not fraud” is right ${LEGIT} times: **${pc(LAZY_ACC)} accuracy**. Sounds great, but it **catches zero fraud**. So for rare events, accuracy is the wrong score.`,
      explain: `With ${pc(FRAUD / TOTAL)} positives, predicting the majority class gives ${pc(LAZY_ACC)} {{accuracy}} and 0 recall. This is {{imbalance|class imbalance}}: use precision, recall and PR-AUC instead, and compare against this trivial baseline.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "bars",
          title: "Lazy model: always “legit”",
          items: [
            { label: "accuracy", value: LAZY_ACC * 100, tone: "green" },
            { label: "fraud caught (recall)", value: 0, tone: "rose" },
          ],
          max: 100,
          format: "int",
        },
      },
      highlight: ["pay"],
      log: [{ tone: "rose", cells: { what: "lazy model accuracy", value: pc(LAZY_ACC), note: "catches 0 fraud" } }],
    },
    {
      id: "matrix",
      title: "Count the four outcomes",
      simple: "Every prediction is one of four boxes: caught, false alarm, missed, or correctly let through.",
      easy: `Our real model at cut-off ${MAIN.t}: **${MAIN.tp} fraud caught**, **${MAIN.fn} fraud missed**, **${MAIN.fp} honest payments wrongly flagged**, and ${MAIN.tn} honest payments let through. These four counts make the **confusion matrix**, and every metric comes from them.`,
      explain: `{{confusion|Confusion matrix}} at t = ${MAIN.t}: TP ${MAIN.tp}, FN ${MAIN.fn}, FP ${MAIN.fp}, TN ${MAIN.tn}. Rows = truth, columns = prediction. Write it down first in any metrics discussion.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: `Confusion matrix at t = ${MAIN.t}`,
          columns: ["truth ↓ / model →", "flagged", "passed"],
          rows: [
            ["really fraud", `TP ${MAIN.tp}`, `FN ${MAIN.fn}`],
            ["really legit", `FP ${MAIN.fp}`, `TN ${MAIN.tn}`],
          ],
          caption: "TP = caught, FN = missed, FP = false alarm, TN = correctly passed",
        },
      },
      highlight: ["cut", "flag", "pass"],
      packets: [
        { from: "cut", to: "flag", label: `${MAIN.tp + MAIN.fp} flagged`, tone: "rose" },
        { from: "cut", to: "pass", label: `${MAIN.fn + MAIN.tn} passed`, tone: "green" },
      ],
    },
    {
      id: "pr",
      title: "Precision and recall",
      simple: "Precision: of the alarms, how many were real. Recall: of the real fraud, how many we caught.",
      easy: `Two questions. **Precision**: of the ${MAIN.tp + MAIN.fp} payments we flagged, how many were really fraud? ${MAIN.tp} of ${MAIN.tp + MAIN.fp} = **${pc(MAIN.precision)}**. **Recall**: of the ${FRAUD} real frauds, how many did we catch? ${MAIN.tp} of ${FRAUD} = **${pc(MAIN.recall)}**. **F1** blends both into one number: ${f(MAIN.f1, 2)}.`,
      explain: `{{precision|Precision}} = TP/(TP+FP) = ${MAIN.tp}/${MAIN.tp + MAIN.fp} = ${pc(MAIN.precision)}. {{recall|Recall}} = TP/(TP+FN) = ${MAIN.tp}/${FRAUD} = ${pc(MAIN.recall)}. {{f1|F1}} = 2PR/(P+R) = ${f(MAIN.f1, 3)}. Accuracy here is ${pc(MAIN.accuracy)}, barely above the lazy model, which is why we ignore it.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "bars",
          title: `At t = ${MAIN.t}`,
          items: [
            { label: "precision", value: MAIN.precision * 100, tone: "violet" },
            { label: "recall", value: MAIN.recall * 100, tone: "amber" },
            { label: "F1 × 100", value: MAIN.f1 * 100, tone: "green" },
            { label: "accuracy", value: MAIN.accuracy * 100, tone: "slate", note: "misleading here" },
          ],
          max: 100,
          format: "int",
        },
      },
      deeper: { math: ["precision = TP / (TP + FP)", "recall = TP / (TP + FN)", "F1 = 2 · P · R / (P + R)"] },
      log: [
        { tone: "violet", cells: { what: "precision", value: pc(MAIN.precision), note: `${MAIN.tp}/${MAIN.tp + MAIN.fp}` } },
        { tone: "amber", cells: { what: "recall", value: pc(MAIN.recall), note: `${MAIN.tp}/${FRAUD}` } },
      ],
      interviewTip: "Tie each to a cost: low precision = wasted reviewer time; low recall = money lost to fraud.",
    },
    {
      id: "threshold",
      title: "Slide the threshold, trade one for the other",
      simple: "A lower cut-off catches more fraud but raises more false alarms. A higher one does the opposite.",
      easy: `The model gives each payment a score. Where you put the **cut-off** decides who gets flagged. At **0.9**, alarms are very reliable but you catch only ${ROWS[0].tp} of ${FRAUD}. At **0.1**, you catch all ${FRAUD} but flag ${ROWS[4].fp} honest people. There is no free lunch: you choose the balance the business can live with.`,
      explain: `Lowering t raises recall and lowers precision. Best F1 here is at t = ${BEST_F1.t} (${f(BEST_F1.f1, 2)}), but the right threshold comes from costs: e.g. a missed fraud costs ₹5,000 and a review costs ₹50, so recall matters more.`,
      stage: {
        kind: "viz",
        viz: [
          {
            kind: "table",
            title: "Same model, different cut-offs",
            columns: ["threshold", "flagged", "caught", "false alarms", "precision", "recall", "F1"],
            rows: ROWS.map((r) => [r.t, r.tp + r.fp, `${r.tp}/${FRAUD}`, r.fp, pc(r.precision), pc(r.recall), f(r.f1, 2)]),
            highlightRow: ROWS.indexOf(BEST_F1),
          },
          {
            kind: "plot",
            title: "Precision–recall curve",
            series: [{ label: "model", points: ROWS.map((r) => [r.recall, r.precision]), tone: "violet" }],
            x: [0, 1],
            y: [0, 1],
            xLabel: "recall",
            yLabel: "precision",
            markers: ROWS.map((r) => ({ x: r.recall, y: r.precision, label: `t=${r.t}`, tone: (r.t === BEST_F1.t ? "green" : "slate") as Tone })),
          },
        ],
      },
      highlight: ["cut"],
    },
    {
      id: "roc",
      title: "ROC and AUC: one score for ranking quality",
      simple: "AUC asks: if you pick one fraud and one honest payment, how often does the fraud get the higher score?",
      easy: `To compare **models** (not cut-offs), plot every threshold at once. The ROC curve shows fraud caught against honest payments flagged. The **area under it (AUC)** is ${f(AUC, 2)} here: pick a random fraud and a random honest payment, and the model gives the fraud a higher score about ${Math.round(AUC * 100)}% of the time. 0.5 is a coin toss, 1.0 is perfect.`,
      explain: `{{roc|ROC}} plots TPR (recall) vs FPR = FP/(FP+TN) across thresholds. ROC-AUC = ${f(AUC, 3)} (trapezoid estimate from 5 thresholds). With heavy imbalance, FPR stays tiny even with many false alarms, so prefer the **PR curve and PR-AUC** for rare-event problems.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "plot",
          title: `ROC curve (AUC ≈ ${f(AUC, 2)})`,
          series: [
            { label: "model", points: ROC, tone: "violet" },
            { label: "coin toss", points: [[0, 0], [1, 1]], tone: "slate", dashed: true },
          ],
          x: [0, 1],
          y: [0, 1],
          xLabel: "false positive rate",
          yLabel: "recall (true positive rate)",
        },
      },
      log: [{ tone: "violet", cells: { what: "ROC-AUC", value: f(AUC, 3), note: "threshold-free ranking quality" } }],
    },
    {
      id: "cv",
      title: "Cross-validation: don't trust one lucky split",
      simple: "Test the model on five different slices of data and average, so one lucky split can't fool you.",
      easy: `One train/test split might be lucky. **k-fold cross-validation** cuts the data into 5 slices, trains on 4 and tests on the 5th, five times, each slice taking a turn as the test. Scores: ${FOLDS.join(", ")}. Average **${f(CV_MEAN, 3)}**, spread ±${f(CV_SD, 3)}. A small spread means the score is trustworthy.`,
      explain: `{{cross-validation|k-fold CV}} (k = 5) gives a mean of ${f(CV_MEAN, 3)} ± ${f(CV_SD, 3)} (PR-AUC per fold, example values). Use **stratified** folds for imbalance, **time-based** splits for time series, and group splits when one user has many rows. Tune on CV, report once on an untouched test set.`,
      stage: {
        kind: "viz",
        viz: {
          kind: "bars",
          title: "Score per fold",
          items: FOLDS.map((v, i) => ({ label: `fold ${i + 1}`, value: v, tone: cellTone(v >= CV_MEAN) })),
          max: 1,
          format: "fixed2",
          caption: `mean ${f(CV_MEAN, 3)}, standard deviation ${f(CV_SD, 3)}`,
        },
      },
      highlight: ["pay", "model"],
    },
    {
      id: "regression",
      title: "Predicting a number? Different scores",
      simple: "For numbers like prices, measure how far off the guesses are, on average.",
      easy: "If the model predicts a **number** (a flat's rent), there's no right/wrong box. You measure **how far off** it is. **MAE** is the average miss in rupees. **RMSE** punishes big misses more. **R²** says how much better you are than always guessing the average (1 is perfect, 0 is no better).",
      explain:
        "Regression metrics: MAE = mean |y − ŷ| (robust, same units), RMSE = √mean (y − ŷ)² (penalises large errors), R² = 1 − SSE/SST. Ranking and search use MRR and NDCG; generation uses task evals.",
      stage: {
        kind: "viz",
        viz: {
          kind: "table",
          title: "Rent predictions (₹ thousand / month)",
          columns: ["flat", "real", "predicted", "miss"],
          rows: [["A", 20, 22, 2], ["B", 35, 31, 4], ["C", 18, 18, 0], ["D", 50, 40, 10]],
          caption: `MAE = ${f((2 + 4 + 0 + 10) / 4, 1)}k · RMSE = ${f(Math.sqrt((4 + 16 + 0 + 100) / 4), 1)}k (the 10k miss pulls RMSE up)`,
        },
      },
      deeper: { math: ["MAE = (1/n) Σ |yᵢ − ŷᵢ|", "RMSE = √((1/n) Σ (yᵢ − ŷᵢ)²)", "R² = 1 − Σ(yᵢ − ŷᵢ)² / Σ(yᵢ − ȳ)²"] },
    },
  ],
  interview: [
    {
      id: "mm-1",
      level: "fresher",
      q: "Why is accuracy a bad metric for fraud detection?",
      answer: `Fraud is rare, so predicting “not fraud” every time already gives very high accuracy (${pc(LAZY_ACC)} here) while catching nothing. Use precision, recall, F1 or PR-AUC, which focus on the rare class.`,
      lookFor: "Class imbalance, trivial baseline, the right alternative metrics.",
      wrong: "“Accuracy is fine if it's above 95%.”",
    },
    {
      id: "mm-2",
      level: "mid",
      q: "When do you favour recall over precision, and vice versa?",
      answer: "Favour recall when missing a positive is costly (cancer screening, fraud with a cheap review step). Favour precision when false alarms are costly or annoying (spam filters deleting real mail, auto-blocking a card). Choose the threshold from the cost of each error, not by default 0.5.",
      lookFor: "Examples both ways, cost-based thresholding.",
      wrong: "“Always maximise F1.”",
    },
    {
      id: "mm-3",
      level: "mid",
      q: "ROC-AUC or PR-AUC for heavily imbalanced data?",
      answer: "PR-AUC. ROC uses the false-positive rate, whose denominator is the huge negative class, so many false alarms still look like a small FPR and ROC-AUC looks optimistic. PR-AUC reflects precision directly, which is what suffers.",
      lookFor: "Explains the FPR denominator effect.",
      wrong: "“They always rank models the same, so it doesn't matter.”",
    },
    {
      id: "mm-4",
      level: "senior",
      q: "Your offline AUC improved but the business metric didn't. Why might that be?",
      answer: "Offline/online mismatch: data leakage or a non-representative split, the threshold not re-tuned, the metric not aligned with business cost, feedback loops, or distribution shift since training. Check with time-based splits, calibrated thresholds, and confirm with an online A/B test.",
      lookFor: "Leakage, split choice, threshold, alignment, A/B testing.",
      wrong: "“The business metric must be broken.”",
    },
  ],
  quiz: [
    {
      id: "mmq-1",
      q: `At t = ${MAIN.t}, precision is ${pc(MAIN.precision)}. What does that mean?`,
      options: ["We caught that share of all fraud", "That share of flagged payments were really fraud", "That share of all payments are fraud", "The model is that accurate"],
      correct: 1,
      explain: "Precision is about the alarms: TP / (TP + FP).",
    },
    {
      id: "mmq-2",
      q: "Lowering the threshold usually…",
      options: ["raises precision, lowers recall", "raises recall, lowers precision", "raises both", "changes nothing"],
      correct: 1,
      explain: "More payments get flagged: more fraud caught, more false alarms.",
    },
    {
      id: "mmq-3",
      q: "ROC-AUC of 0.5 means…",
      options: ["Perfect model", "No better than random ranking", "50% accuracy", "Half the data is positive"],
      correct: 1,
      explain: "It ranks a random positive above a random negative only half the time.",
    },
    {
      id: "mmq-4",
      q: "Which split for predicting next month's sales?",
      options: ["Random k-fold", "Time-based split", "Stratified by store", "Leave-one-out"],
      correct: 1,
      explain: "Train on the past, test on the future, or the model peeks ahead.",
    },
  ],
};

export default scenario;
