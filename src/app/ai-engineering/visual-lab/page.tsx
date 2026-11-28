import type { Metadata } from "next";
import { Suspense } from "react";
import { VisualLab } from "@/components/ai-lab/VisualLab";

import { pageMeta } from "@/lib/seo";
export const metadata: Metadata = pageMeta({ title: "Gen AI Visual Lab", description: "27 animated step-by-step topics, from what is AI for complete beginners to AI/ML engineer interviews: data, how machines learn, neural networks, classic ML, metrics, neural networks, training, CNNs and transformers, how LLMs are built, prompting, RAG, fine-tuning, agents and MCP, evals, MLOps and ML system design, with interview questions and quizzes.", path: "/ai-engineering/visual-lab", keywords: ["learn AI from scratch", "AI for beginners", "what is machine learning", "AI ML interview preparation", "how LLMs work", "RAG explained", "fine-tuning LoRA", "MCP agents", "ML system design", "MLOps"] });

export default function VisualLabPage() {
  return (
    <Suspense fallback={<div className="grid h-[60vh] place-items-center font-code text-sm text-slate-400">Loading the lab…</div>}>
      <VisualLab />
    </Suspense>
  );
}
