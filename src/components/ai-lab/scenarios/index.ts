import type { ScenarioMeta } from "../engine/types";

/**
 * The topic list. Each scenario is its own module, imported only when that
 * topic is opened, so one topic's data and maths never load with another's.
 */
export const SCENARIOS: ScenarioMeta[] = [
  {
    id: "how-machines-learn",
    num: 1,
    title: "How machines learn",
    short: "ML basics",
    tagline: "Data → predict → measure the miss → adjust. Repeat.",
    keywords: "features labels training inference loss mse gradient descent overfitting underfitting split validation test house price",
    load: () => import("./how-machines-learn"),
  },
  {
    id: "neural-networks",
    num: 2,
    title: "Neural networks",
    short: "Deep learning",
    tagline: "Stacks of tiny weighted sums with bends in between.",
    keywords: "perceptron neuron activation relu sigmoid tanh forward pass backprop chain rule bce weights bias layers",
    load: () => import("./neural-networks"),
  },
  {
    id: "transformers",
    num: 3,
    title: "Transformers & attention",
    short: "Attention",
    tagline: "Every token looks at every other token and decides what matters.",
    keywords: "attention query key value qkv softmax multi-head tokenization embeddings positional encoding layernorm residual ffn rnn lstm next token cross-entropy",
    load: () => import("./transformers"),
  },
  {
    id: "llm-inference",
    num: 4,
    title: "LLM inference & model choice",
    short: "Inference",
    tagline: "Prompt in, one token at a time out — and what that costs.",
    keywords: "sampling temperature top-p top-k kv cache prefill decode quantization batching speculative decoding latency cost model selection self-hosted api",
    load: () => import("./llm-inference"),
  },
  {
    id: "conversational-ai",
    num: 5,
    title: "Conversational AI & streaming",
    short: "Chat + SSE",
    tagline: "Roles, history, tokens streamed to the browser, and tools.",
    keywords: "system user assistant tool roles multi-turn context sse streaming memory summarisation window function calling",
    load: () => import("./conversational-ai"),
  },
  {
    id: "embeddings",
    num: 6,
    title: "Embeddings & vector search",
    short: "Embeddings",
    tagline: "Meaning as coordinates; search as 'what is nearby?'",
    keywords: "embedding vector cosine similarity bm25 keyword semantic search vector database hnsw ann chunking",
    load: () => import("./embeddings"),
  },
  {
    id: "rag",
    num: 7,
    title: "RAG fundamentals",
    short: "RAG",
    tagline: "Look it up first, then answer from what you found.",
    keywords: "retrieval augmented generation ingest chunk embed store retrieve augment generate citations pdf q&a",
    load: () => import("./rag"),
  },
  {
    id: "advanced-rag",
    num: 8,
    title: "Advanced RAG & retrieval quality",
    short: "Advanced RAG",
    tagline: "Better queries, better ranking, and proof it works.",
    keywords: "query rewrite expansion hyde multi-query decomposition hybrid search rrf metadata filter rerank cross-encoder recall precision mrr ndcg faithfulness groundedness evaluation feedback",
    load: () => import("./advanced-rag"),
  },
];

export const DEFAULT_SCENARIO = "transformers";
