import type { Metadata } from "next";
import { V2Nav } from "@/components/aws-v2/V2Nav";
import { ReaderShell } from "@/components/aws-v2/ReaderShell";

import { pageMeta } from "@/lib/seo";
export const metadata: Metadata = pageMeta({ title: "Gen AI notes", description: "Generative AI notes for engineers: LLMs, prompting, RAG, agents, evaluation and production, in plain words with flashcards.", path: "/gen-ai", keywords: ["Gen AI notes", "LLM", "RAG", "AI agents", "AI engineer interview"] });

export default function GenAILayout({ children }: { children: React.ReactNode }) {
  return (
    <ReaderShell>
        <V2Nav trackId="gen-ai" />
        <div className="min-w-0 flex-1">{children}</div>
    </ReaderShell>
  );
}
