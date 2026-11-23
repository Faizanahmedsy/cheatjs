"use client";

import { CheckCircle2, Hourglass, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { answerMatches, expectedAnswer } from "@/lib/visualizer/insights";
import type { Problem } from "@/lib/visualizer/problem-types";
import type { TraceStep } from "@/lib/visualizer/types";

/** "What are we chasing?" pinned above the picture, turning green once the answer is printed. */
export function GoalBar({ problem, step, index, total }: { problem: Problem | null; step: TraceStep; index: number; total: number }) {
  if (!problem) return null;
  const expected = expectedAnswer(problem.example);
  if (!expected) return null;
  const found = answerMatches(step.stdout, expected);
  const finished = step.event === "end";
  const printed = step.stdout.trim().split("\n").pop() ?? "";
  const progress = Math.round(((index + 1) / total) * 100);

  return (
    <section
      aria-label="Goal"
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border px-4 py-3",
        found ? "border-emerald-400/60 bg-emerald-500/10" : "border-slate-700/60 bg-slate-800/40",
      )}
    >
      <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
        <Target className="h-4 w-4 text-cyan-300" aria-hidden="true" /> Goal
      </span>
      <span className="text-base text-slate-200">
        Get the answer <span className="rounded bg-slate-950/70 px-1.5 py-0.5 font-code text-cyan-200">{expected}</span>
      </span>
      <span className="ml-auto flex items-center gap-2 text-sm">
        {found ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
            <span className="font-semibold text-emerald-200">Found it!</span>
          </>
        ) : finished ? (
          <span className="text-amber-200">
            Printed <span className="font-code">{printed || "nothing"}</span>
          </span>
        ) : (
          <>
            <Hourglass className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <span className="text-slate-400">Working on it… {progress}%</span>
          </>
        )}
      </span>
    </section>
  );
}
