"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, Clock, Eye, HardDrive, Puzzle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { Problem } from "@/lib/visualizer/problem-types";
import { problemsInGroup } from "@/lib/visualizer/catalog";
import { PATTERN_INFO } from "@/lib/visualizer/patterns";
import { RichText } from "./RichText";
import { SpeedCompare } from "./SpeedCompare";

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
export function ProblemPanel({
  problem,
  changedNames,
  beginner,
  done,
  onPick,
}: {
  problem: Problem;
  changedNames: Set<string>;
  beginner: boolean;
  done?: Set<string>;
  onPick?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const pattern = PATTERN_INFO[problem.group];
  const similar = problemsInGroup(problem.group).filter((p) => p.id !== problem.id);
  return (
    <section aria-label={`Problem ${problem.number}: ${problem.title}`} className="rounded-xl border border-cyan-400/20 bg-slate-800/50 p-4">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="rounded-full bg-cyan-400/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-cyan-200">The question</span>
        <h2 className="font-headline text-xl font-bold text-slate-100">
          <span className="text-slate-400">{problem.number}.</span> {problem.title}
        </h2>
        <DifficultyBadge difficulty={problem.difficulty} />
        <span className="text-xs text-slate-500">{problem.group}</span>
      </header>

      <div className="mt-2 grid gap-2 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
      <p className={cn("text-slate-300", beginner ? "text-base" : "text-sm")}>
        <RichText text={problem.statement} />
      </p>
      <p className="rounded-lg bg-slate-950/60 px-3 py-2 font-code text-sm text-slate-200">
        <span className="font-body text-slate-400">Example: </span>
        {problem.example}
      </p>
      </div>

      {pattern && (
        <p className="mt-2 flex items-start gap-2 text-sm text-slate-300">
          <Puzzle className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" aria-hidden="true" />
          <span>
            <span className="font-semibold text-violet-200">Pattern: {problem.group}.</span> {pattern.idea}
          </span>
        </p>
      )}
      <Collapsible open={open} onOpenChange={setOpen} className="mt-2">
        <CollapsibleTrigger className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-cyan-300 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
          <ChevronDown className={cn("h-4 w-4 transition-transform motion-reduce:transition-none", open && "rotate-180")} aria-hidden="true" />
          {open ? "Hide details" : "Show the idea, what to watch, speed and similar questions"}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            <RichText text={problem.approach} />
          </p>
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

      {pattern && (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950/60 px-3 py-2 font-code text-xs leading-5 text-violet-100">{pattern.picture}</pre>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Chip icon={Clock} label="Time" value={problem.complexity.time} />
        <Chip icon={HardDrive} label="Space" value={problem.complexity.space} />
      </div>
      <SpeedCompare time={problem.complexity.time} />
      {onPick && similar.length > 0 && (
        <div className="mt-3">
          <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400">Similar questions ({problem.group})</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {similar.slice(0, 10).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPick(p.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 hover:border-cyan-400/60 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", DIFFICULTY_STYLE[p.difficulty].dot)} aria-hidden="true" />
                {p.number}. {p.title}
                {done?.has(p.id) && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-label="done" />}
              </button>
            ))}
          </div>
        </div>
      )}
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
