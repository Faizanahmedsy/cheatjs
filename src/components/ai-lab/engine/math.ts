/**
 * Small, dependency-free maths used by the scenarios. Every number the lab
 * shows is computed here (or from these) at module load, never typed in by hand.
 */

export type Vec = number[];
export type Mat = number[][];

export const sum = (v: Vec) => v.reduce((a, b) => a + b, 0);
export const mean = (v: Vec) => sum(v) / v.length;
export const dot = (a: Vec, b: Vec) => a.reduce((s, x, i) => s + x * b[i], 0);
export const norm = (v: Vec) => Math.sqrt(dot(v, v));
export const cosine = (a: Vec, b: Vec) => dot(a, b) / (norm(a) * norm(b));
export const add = (a: Vec, b: Vec) => a.map((x, i) => x + b[i]);
export const scale = (v: Vec, k: number) => v.map((x) => x * k);

export const transpose = (m: Mat): Mat => m[0].map((_, j) => m.map((row) => row[j]));
export const matmul = (a: Mat, b: Mat): Mat => a.map((row) => b[0].map((_, j) => row.reduce((s, x, k) => s + x * b[k][j], 0)));
export const mapMat = (m: Mat, f: (x: number) => number): Mat => m.map((r) => r.map(f));

/** Numerically stable softmax (subtracts the max first, like real libraries do). */
export function softmax(v: Vec, temperature = 1): Vec {
  const t = v.map((x) => x / temperature);
  const m = Math.max(...t);
  const e = t.map((x) => Math.exp(x - m));
  const s = sum(e);
  return e.map((x) => x / s);
}

export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
export const relu = (x: number) => Math.max(0, x);
export const leakyRelu = (x: number, a = 0.01) => (x > 0 ? x : a * x);
export const tanh = (x: number) => Math.tanh(x);

export const mse = (pred: Vec, actual: Vec) => mean(pred.map((p, i) => (p - actual[i]) ** 2));
/** Binary cross-entropy for one example. */
export const bce = (p: number, y: number) => -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
/** Cross-entropy given the probability of the correct class. */
export const crossEntropy = (pCorrect: number) => -Math.log(pCorrect);

/** Layer normalisation without learned scale/shift (gamma=1, beta=0). */
export function layerNorm(v: Vec, eps = 1e-5): Vec {
  const mu = mean(v);
  const variance = mean(v.map((x) => (x - mu) ** 2));
  return v.map((x) => (x - mu) / Math.sqrt(variance + eps));
}

/** Sinusoidal positional encoding from "Attention Is All You Need". */
export function positionalEncoding(pos: number, d: number): Vec {
  return Array.from({ length: d }, (_, i) => {
    const pair = Math.floor(i / 2);
    const angle = pos / Math.pow(10000, (2 * pair) / d);
    return i % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
  });
}

/** Top-k: keep the k largest probabilities and renormalise. */
export function topK(probs: Vec, k: number): Vec {
  const cutoff = [...probs].sort((a, b) => b - a)[k - 1];
  const kept = probs.map((p) => (p >= cutoff ? p : 0));
  const s = sum(kept);
  return kept.map((p) => p / s);
}

/** Top-p (nucleus): keep the smallest set whose cumulative probability reaches p. */
export function topP(probs: Vec, p: number): Vec {
  const order = probs.map((x, i) => [x, i] as const).sort((a, b) => b[0] - a[0]);
  const keep = new Set<number>();
  let cum = 0;
  for (const [x, i] of order) {
    keep.add(i);
    cum += x;
    if (cum >= p) break;
  }
  const kept = probs.map((x, i) => (keep.has(i) ? x : 0));
  const s = sum(kept);
  return kept.map((x) => x / s);
}

/** Deterministic pseudo-random numbers so "random" data is identical on every render. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Standard normal sample from a seeded uniform source (Box–Muller). */
export function gaussian(rand: () => number) {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export const linspace = (a: number, b: number, n: number) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));

// ---------- formatting ----------

export const f = (x: number, dp = 2) => {
  const s = x.toFixed(dp);
  return s === `-${(0).toFixed(dp)}` ? (0).toFixed(dp) : s;
};
export const pct = (x: number, dp = 1) => `${(x * 100).toFixed(dp)}%`;
export const vec = (v: Vec, dp = 2) => `[${v.map((x) => f(x, dp)).join(", ")}]`;

// ---------- retrieval metrics ----------

/** Recall@k: share of all relevant docs that appear in the top k. */
export function recallAtK(ranked: string[], relevant: Set<string>, k: number) {
  const hits = ranked.slice(0, k).filter((d) => relevant.has(d)).length;
  return hits / relevant.size;
}
/** Precision@k: share of the top k that is relevant. */
export function precisionAtK(ranked: string[], relevant: Set<string>, k: number) {
  return ranked.slice(0, k).filter((d) => relevant.has(d)).length / k;
}
/** Reciprocal rank of the first relevant result (0 if none). */
export function reciprocalRank(ranked: string[], relevant: Set<string>) {
  const i = ranked.findIndex((d) => relevant.has(d));
  return i < 0 ? 0 : 1 / (i + 1);
}
/** NDCG@k with graded relevance (gain = rel, discount = log2(rank+1)). */
export function ndcgAtK(ranked: string[], rel: Record<string, number>, k: number) {
  const dcg = ranked.slice(0, k).reduce((s, d, i) => s + (rel[d] ?? 0) / Math.log2(i + 2), 0);
  const ideal = Object.values(rel)
    .sort((a, b) => b - a)
    .slice(0, k)
    .reduce((s, r, i) => s + r / Math.log2(i + 2), 0);
  return ideal === 0 ? 0 : dcg / ideal;
}

/** BM25 score of one document for a query (k1=1.2, b=0.75 by default). */
export function bm25(queryTerms: string[], doc: string[], corpus: string[][], k1 = 1.2, b = 0.75) {
  const N = corpus.length;
  const avgdl = mean(corpus.map((d) => d.length));
  return queryTerms.reduce((score, term) => {
    const n = corpus.filter((d) => d.includes(term)).length;
    if (n === 0) return score;
    const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
    const tf = doc.filter((w) => w === term).length;
    return score + idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * doc.length) / avgdl)));
  }, 0);
}

/** Reciprocal Rank Fusion score for one doc across several rankings (k=60 is the common default). */
export function rrf(rankings: string[][], doc: string, k = 60) {
  return rankings.reduce((s, r) => {
    const i = r.indexOf(doc);
    return i < 0 ? s : s + 1 / (k + i + 1);
  }, 0);
}
