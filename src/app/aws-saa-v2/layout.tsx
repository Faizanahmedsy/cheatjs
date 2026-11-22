import type { Metadata } from "next";
import { V2Nav } from "@/components/aws-v2/V2Nav";

export const metadata: Metadata = {
  title: "AWS SAA-C03 v2 | Cheat JS",
  description:
    "AWS Solutions Architect Associate (SAA-C03) study notes in simple words, powered by Notion.",
};

export default function AWSV2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-900 text-slate-50">
      <div className="mx-auto max-w-[1500px] lg:flex">
        <V2Nav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
