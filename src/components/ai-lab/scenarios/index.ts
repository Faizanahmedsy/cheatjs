import type { ScenarioMeta } from "../engine/types";

/**
 * The topic list. Each scenario is its own module, imported only when that
 * topic is opened, so one topic's data and maths never load with another's.
 */
export const SCENARIOS: ScenarioMeta[] = [
  {
    id: "transformers",
    num: 3,
    title: "Transformers & attention",
    short: "Attention",
    tagline: "Every token looks at every other token and decides what matters.",
    keywords: "attention query key value qkv softmax multi-head tokenization embeddings positional encoding layernorm residual ffn rnn lstm next token cross-entropy",
    load: () => import("./transformers"),
  },
];

export const DEFAULT_SCENARIO = "transformers";
