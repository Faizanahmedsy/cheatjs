import type { Metadata } from "next";
import { V2Nav } from "@/components/aws-v2/V2Nav";
import { ReaderShell } from "@/components/aws-v2/ReaderShell";

export const metadata: Metadata = {
  title: "Gen AI notes · Ustad Billu ki Class",
  description:
    "LLMs, GPTs, prompting, RAG, agents and MCP explained in simple words, powered by Notion.",
};

export default function GenAILayout({ children }: { children: React.ReactNode }) {
  return (
    <ReaderShell>
        <V2Nav trackId="gen-ai" />
        <div className="min-w-0 flex-1">{children}</div>
    </ReaderShell>
  );
}
