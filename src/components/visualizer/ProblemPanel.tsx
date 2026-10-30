"use client";

import { useState } from "react";
import { ChevronDown, Clock, Eye, HardDrive } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { Problem } from "@/lib/visualizer/problem-types";
import { RichText } from "./RichText";

export const DIFFICULTY_STYLE: Record<Problem["difficulty"], { dot: string; badge: string }> = {
  Easy: { dot: "bg-emerald-400", badge: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200" },
  Medium: { dot: "bg-amber-400", badge: "border-amber-400/40 bg-amber-400/10 text-amber-200" },
  Hard: { dot: "bg-rose-400", badge: "border-rose-400/40 bg-rose-400/10 text-rose-200" },
};

export function DifficultyBadge({ difficulty }: { difficulty: Problem["difficulty"] }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium", DIFFICULTY_STYLE[difficulty].badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", DIFFICULTY_STYLE[difficulty].dot)} aria-hidden="true" />
      {difficulty}
    </span>
  );
}

const WORD = /`([^`]+)`|[A-Za-z_$][\w$]*/g;

/** True when a "what to watch" bullet names a variable that changed on this step. */
function mentionsChanged(text: string, changed: Set<string>): boolean {
  if (changed.size === 0) return false;
  for (const match of text.matchAll(WORD)) {
    const token = match[1] ?? match[0];
    const quoted = match[1] !== undefined;
    for (const name of token.split(/[^\w$]+/)) {
      if (changed.has(name) && (quoted || name.length >= 3)) return true;
    }
  }
  return false;
}

function Chip({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1 text-sm text-slate-300">
      <Icon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
      {label} <span className="font-code text-slate-100">{value}</span>
    </span>
  );
}

/** What the problem asks, one worked example, the idea, and what to watch while stepping. */
export function ProblemPanel({ problem, changedNames, beginner }: { problem: Problem; changedNames: Set<string>; beginner: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <section aria-label={`Problem ${problem.number}: ${problem.title}`} className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="font-headline text-xl font-bold text-slate-100">
          <span className="text-slate-400">{problem.number}.</span> {problem.title}
        </h2>
        <DifficultyBadge difficulty={problem.difficulty} />
        <span className="text-xs text-slate-500">{problem.group}</span>
      </header>

      <p className={cn("mt-2 text-slate-300", beginner ? "text-base" : "text-sm")}>
        <RichText text={problem.statement} />
      </p>
      <p className="mt-2 rounded-lg bg-slate-950/60 px-3 py-2 font-code text-sm text-slate-200">
        <span className="font-body text-slate-400">Example: </span>
        {problem.example}
      </p>

      <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
        <CollapsibleTrigger className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-cyan-300 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
          <ChevronDown className={cn("h-4 w-4 transition-transform motion-reduce:transition-none", open && "rotate-180")} aria-hidden="true" />
          How it works
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            <RichText text={problem.approach} />
          </p>
        </CollapsibleContent>
      </Collapsible>

      {problem.watch.length > 0 && (
        <div className="mt-3">
          <h3 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            <Eye className="h-3.5 w-3.5" aria-hidden="true" /> What to watch
          </h3>
          <ul className="mt-1.5 space-y-1">
            {problem.watch.map((item, index) => {
              const live = mentionsChanged(item, changedNames);
              return (
                <li
                  key={index}
                  className={cn(
                    "flex gap-2 rounded-md px-2 py-1 text-sm transition-colors duration-300 motion-reduce:transition-none",
                    live ? "bg-amber-300/10 text-amber-100" : "text-slate-300",
                  )}
                >
                  <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", live ? "bg-amber-300" : "bg-slate-500")} aria-hidden="true" />
                  <span>
                    <RichText text={item} />
                    {live && <span className="sr-only"> (just changed)</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Chip icon={Clock} label="Time" value={problem.complexity.time} />
        <Chip icon={HardDrive} label="Space" value={problem.complexity.space} />
      </div>
    </section>
  );
}
