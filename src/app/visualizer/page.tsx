import type { Metadata } from "next";
import { JsVisualizer } from "@/components/visualizer/JsVisualizer";

import { pageMeta } from "@/lib/seo";
export const metadata: Metadata = pageMeta({ title: "DSA Visualizer: watch code run line by line", description: "Free DSA visualizer with 174 questions from Pre-DSA to Level 3. Watch arrays, pointers, maps and loops change step by step, with plain-English reasons, a dry-run table, quiz mode and JavaScript, Python, Java and C++ views.", path: "/visualizer", keywords: ["DSA visualizer", "LeetCode visualizer", "dry run", "Two Sum", "NeetCode 150", "pre DSA", "loop patterns"] });

export default function VisualizerPage() {
  return (
    <main className="min-h-full bg-slate-900 font-body text-slate-50">
      <JsVisualizer />
    </main>
  );
}
