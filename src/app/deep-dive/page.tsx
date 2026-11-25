import type { Metadata } from "next";
import { LessonIndex } from "@/components/deep-dive/LessonIndex";
import { LESSONS } from "@/lib/deep-dive/lessons";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Deep Dive: every DSA topic, animated",
  description: "78 animated lessons: arrays, sorting, linked lists, stacks, hashing, trees, heaps, tries, backtracking, dynamic programming and graph algorithms, step by step in plain words.",
  path: "/deep-dive",
  keywords: ["Dijkstra visualizer", "DSA visualizer", "graph algorithms", "dynamic programming visualized", "LRU cache"],
});

export default function DeepDiveIndex() {
  return <LessonIndex lessons={LESSONS} base="/deep-dive" title="Deep Dive" intro="Every core topic, one idea per step. Use ← → to move." />;
}
