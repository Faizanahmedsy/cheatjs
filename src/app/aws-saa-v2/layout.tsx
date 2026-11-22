import type { Metadata } from "next";
import { V2Nav } from "@/components/aws-v2/V2Nav";
import { ReaderShell } from "@/components/aws-v2/ReaderShell";

export const metadata: Metadata = {
  title: "AWS SAA-C03 v2 | Cheat JS",
  description:
    "AWS Solutions Architect Associate (SAA-C03) study notes in simple words, powered by Notion.",
};

export default function AWSV2Layout({ children }: { children: React.ReactNode }) {
  return (
    <ReaderShell>
        <V2Nav />
        <div className="min-w-0 flex-1">{children}</div>
    </ReaderShell>
  );
}
