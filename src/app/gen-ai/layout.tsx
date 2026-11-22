import type { Metadata } from "next";
import { V2Nav } from "@/components/aws-v2/V2Nav";

export const metadata: Metadata = {
  title: "Generative AI Mastery | Cheat JS",
  description:
    "LLMs, GPTs, prompting, RAG, agents and MCP explained in simple words, powered by Notion.",
};

export default function GenAILayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-slate-900 text-slate-50 lg:h-[calc(100dvh-3.5rem)] lg:overflow-hidden">
      <div className="mx-auto max-w-[1500px] lg:flex lg:h-full">
        <V2Nav trackId="gen-ai" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
