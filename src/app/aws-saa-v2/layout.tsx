import type { Metadata } from "next";
import { V2Nav } from "@/components/aws-v2/V2Nav";
import { ReaderShell } from "@/components/aws-v2/ReaderShell";

import { pageMeta } from "@/lib/seo";
export const metadata: Metadata = pageMeta({ title: "AWS SAA-C03 notes", description: "AWS Solutions Architect Associate (SAA-C03) exam notes by domain, a scenario question playbook and flashcards, written in plain words.", path: "/aws-saa-v2", keywords: ["AWS SAA-C03", "AWS Solutions Architect Associate", "AWS notes", "AWS exam prep"] });

export default function AWSV2Layout({ children }: { children: React.ReactNode }) {
  return (
    <ReaderShell>
        <V2Nav />
        <div className="min-w-0 flex-1">{children}</div>
    </ReaderShell>
  );
}
