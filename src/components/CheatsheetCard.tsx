"use client";

import { CodeBlock } from "@/components/ui/code-block";
import type { Snippet } from "@/lib/cheatsheets";
import { cn } from "@/lib/utils";
import { HashMapVisualization } from "./visualizations/HashMapVisualization";
import { ArrayVisualization } from "./visualizations/ArrayVisualization";
import { StackVisualization } from "./visualizations/StackVisualization";
import { QueueVisualization } from "./visualizations/QueueVisualization";
import { LinkedListVisualization } from "./visualizations/LinkedListVisualization";
import { BinarySearchTreeVisualization } from "./visualizations/BinarySearchTreeVisualization";
import { HeapVisualization } from "./visualizations/HeapVisualization";
import { GraphVisualization } from "./visualizations/GraphVisualization";
import { TrieVisualization } from "./visualizations/TrieVisualization";
import { SetVisualization } from "./visualizations/SetVisualization";
import { SortingVisualization } from "./visualizations/SortingVisualization";
import { BinarySearchVisualization } from "./visualizations/BinarySearchVisualization";
import { RecursionVisualization } from "./visualizations/RecursionVisualization";
import { TwoPointersVisualization } from "./visualizations/TwoPointersVisualization";
import { SlidingWindowVisualization } from "./visualizations/SlidingWindowVisualization";
import { FastSlowVisualization } from "./visualizations/FastSlowVisualization";

const colorVariants = {
  cyan: "bg-cyan-400/20 text-cyan-300",
  green: "bg-green-400/20 text-green-300",
  yellow: "bg-yellow-400/20 text-yellow-300",
  red: "bg-red-400/20 text-red-300",
};

import { DPTableVisualization } from "@/components/visualizations/DPTableVisualization";
import { GraphAlgoVisualization } from "@/components/visualizations/GraphAlgoVisualization";
import { UnionFindVisualization } from "@/components/visualizations/UnionFindVisualization";
import { NQueensVisualization } from "@/components/visualizations/NQueensVisualization";
import { ArrayAlgoVisualization } from "@/components/visualizations/ArrayAlgoVisualization";
import { LinkedListReverseVisualization } from "@/components/visualizations/LinkedListReverseVisualization";
import { LRUCacheVisualization } from "@/components/visualizations/LRUCacheVisualization";
import { IntervalsVisualization } from "@/components/visualizations/IntervalsVisualization";
import { SieveVisualization } from "@/components/visualizations/SieveVisualization";

const visualizationComponents: { [key: string]: React.ComponentType<any> } = {
  HashMap: HashMapVisualization,
  Array: ArrayVisualization,
  Stack: StackVisualization,
  Queue: QueueVisualization,
  LinkedList: LinkedListVisualization,
  BinarySearchTree: BinarySearchTreeVisualization,
  Heap: HeapVisualization,
  Graph: GraphVisualization,
  Trie: TrieVisualization,
  Set: SetVisualization,
  Sorting: SortingVisualization,
  BinarySearch: BinarySearchVisualization,
  Recursion: RecursionVisualization,
  TwoPointers: TwoPointersVisualization,
  SlidingWindow: SlidingWindowVisualization,
  FastSlow: FastSlowVisualization,
  DPTable: DPTableVisualization,
  GraphAlgo: GraphAlgoVisualization,
  UnionFind: UnionFindVisualization,
  NQueens: NQueensVisualization,
  ArrayAlgo: ArrayAlgoVisualization,
  LinkedListReverse: LinkedListReverseVisualization,
  LRUCache: LRUCacheVisualization,
  Intervals: IntervalsVisualization,
  Sieve: SieveVisualization,
};

export function CheatsheetCard({
  snippet,
  color = "cyan",
}: {
  snippet: Snippet;
  color: keyof typeof colorVariants;
}) {
  const VisualizationComponent = snippet.visualization
    ? visualizationComponents[snippet.visualization]
    : null;

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden h-full flex flex-col">
      <div className="relative p-4 flex-grow flex flex-col">
        <div
          className={cn(
            "absolute top-0 right-3 text-xs font-bold px-2 py-0.5 rounded-b-md",
            colorVariants[color]
          )}
        >
          {snippet.title}
        </div>
        <p className="mt-6 mb-2 font-body text-[15px] leading-relaxed text-slate-300">
          {snippet.description}
        </p>

        {snippet.pros && snippet.cons && (
          <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ProsCons title="Good" mark="✓" items={snippet.pros} tone="good" />
            <ProsCons title="Watch out" mark="✗" items={snippet.cons} tone="bad" />
          </div>
        )}

        {VisualizationComponent && (
          <div className="my-4">
            <VisualizationComponent />
          </div>
        )}

        <div className="flex-grow mt-auto">
          <CodeBlock code={snippet.code} language={snippet.language} />
        </div>
      </div>
    </div>
  );
}

/** "Fast access: O(1) …" → bold "Fast access" + plain rest, one item per line with a ✓ or ✗. */
function ProsCons({ title, mark, items, tone }: { title: string; mark: string; items: string[]; tone: "good" | "bad" }) {
  return (
    <div className={cn("rounded-lg border p-3", tone === "good" ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5")}>
      <h4 className={cn("mb-2 text-sm font-bold", tone === "good" ? "text-emerald-300" : "text-rose-300")}>{title}</h4>
      <ul className="space-y-2 font-body text-sm leading-relaxed text-slate-300">
        {items.map((item) => {
          const at = item.indexOf(":");
          const head = at > 0 && at < 40 ? item.slice(0, at) : null;
          return (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className={cn("font-bold", tone === "good" ? "text-emerald-400" : "text-rose-400")}>
                {mark}
              </span>
              <span>
                {head ? (
                  <>
                    <strong className="font-semibold text-slate-100">{head}:</strong>
                    {item.slice(at + 1)}
                  </>
                ) : (
                  item
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
