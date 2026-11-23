import type { Metadata } from "next";
import { Suspense } from "react";
import { VisualLab } from "@/components/ai-lab/VisualLab";

import { pageMeta } from "@/lib/seo";
export const metadata: Metadata = pageMeta({ title: "Gen AI Visual Lab", description: "Animated step-by-step scenes that explain how AI works: how models learn, neural networks, attention, inference, chat streaming, embeddings and RAG, with interview questions and quizzes.", path: "/ai-engineering/visual-lab", keywords: ["how LLMs work", "RAG explained", "embeddings", "attention", "AI engineering"] });

export default function VisualLabPage() {
  return (
    <Suspense fallback={<div className="grid h-[60vh] place-items-center font-code text-sm text-slate-400">Loading the lab…</div>}>
      <VisualLab />
    </Suspense>
  );
}
