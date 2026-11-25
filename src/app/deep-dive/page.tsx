import type { Metadata } from "next";
import Link from "next/link";
import { LESSONS } from "@/lib/deep-dive/lessons";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Deep Dive: hard algorithms, animated",
  description: "Dijkstra, Bellman-Ford, topological sort, Kruskal, Prim, Word Ladder, bridges and LRU cache, animated step by step in plain words.",
  path: "/deep-dive",
  keywords: ["Dijkstra visualizer", "graph algorithms", "LRU cache", "Kruskal", "topological sort"],
});

export default function DeepDiveIndex() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-slate-100">
      <h1 className="text-3xl font-semibold tracking-tight">Deep Dive</h1>
      <p className="mt-2 text-slate-400">The hard ones, one idea per step. Use ← → to move.</p>
      <ol className="mt-8 divide-y divide-slate-800 border-y border-slate-800">
        {LESSONS.map((l, i) => (
          <li key={l.slug}>
            <Link href={`/deep-dive/${l.slug}`} className="group flex items-baseline gap-4 py-4">
              <span className="w-5 font-code text-xs text-slate-600">{i + 1}</span>
              <span className="flex-1">
                <span className="font-medium group-hover:underline">{l.title}</span>
                <span className="block text-sm text-slate-500">
                  {l.blurb} · {l.question}
                </span>
              </span>
              <span className="text-xs text-slate-600">{l.steps.length} steps</span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
