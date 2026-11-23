import type { Metadata } from "next";
import { Suspense } from "react";
import { VisualLab } from "@/components/ai-lab/VisualLab";

export const metadata: Metadata = {
  title: "AI Visual Lab · Ustad Billu ki Class",
  description: "Animated, step-by-step scenes for AI engineering: how models learn, neural networks, attention, inference, chat streaming, embeddings and RAG — with interview questions and quizzes.",
};

export default function VisualLabPage() {
  return (
    <Suspense fallback={<div className="grid h-[60vh] place-items-center font-code text-sm text-slate-400">Loading the lab…</div>}>
      <VisualLab />
    </Suspense>
  );
}
