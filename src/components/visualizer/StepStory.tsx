"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, CornerDownLeft, CornerDownRight, Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Explanation } from "@/lib/visualizer/analysis";
import type { StepHints } from "@/lib/visualizer/explain-why";
import type { IterationIndex } from "@/lib/visualizer/iteration-table";
import { Term } from "./Term";

const TONE_ICON = {
  info: Info,
  call: CornerDownRight,
  return: CornerDownLeft,
  error: AlertTriangle,
  done: CheckCircle2,
} as const;

interface StepStoryProps {
  explanation: Explanation & { lineRef?: number };
  hints: StepHints;
  index: number;
  total: number;
  table: IterationIndex;
  /** True when the trace was cut short, so loop totals may be higher. */
  partial: boolean;
  beginner: boolean;
  onJump: (step: number) => void;
}

/** The loop's passes as numbered dots: where we are, and a click to jump to any pass. */
function LoopTracker({ table, index, partial, onJump }: Pick<StepStoryProps, "table" | "index" | "partial" | "onJump">) {
  const position = table.at[index];
  const group = position ? table.groups.get(position.key) : undefined;
  if (!group || group.mode !== "loop") return null;
  const passes = group.rows.filter((row) => row.label !== "end");
  const current = position.row >= 0 ? group.rows[position.row] : undefined;
  const onCheck = current?.label === "end";
  const currentLabel = current && !onCheck ? current.label : undefined;
  const finished = position.row === -1 || onCheck;
  const where = group.frameName === "Global frame" ? "" : ` in ${group.frameName}()`;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-slate-700/60 bg-slate-900/50 px-3 py-2">
      <p className="text-sm font-medium text-slate-200" title="One dot = one time the loop runs its code. Click a dot to jump to that pass.">
        <span aria-hidden="true">🔁 </span>
        <Term name="iteration">Loop</Term> on line {group.loopLine}
        {where}:{" "}
        {finished ? (
          <span className="text-emerald-300">finished after {passes.length}{partial ? "+" : ""} {passes.length === 1 ? "pass" : "passes"}</span>
        ) : (
          <span className="text-cyan-200">
            pass {currentLabel} of {passes.length}
            {partial ? "+" : ""}
          </span>
        )}
      </p>
      <ol className="flex max-h-20 flex-wrap gap-1.5 overflow-y-auto" aria-label="Loop passes">
        {passes.map((row) => {
          const isCurrent = row.label === currentLabel;
          const isDone = currentLabel !== undefined ? Number(row.label) < Number(currentLabel) : finished;
          return (
            <li key={row.steps[0]}>
              <button
                type="button"
                onClick={() => onJump(row.steps[0])}
                aria-label={`Jump to pass ${row.label}`}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "grid h-8 min-w-8 place-items-center rounded-full border px-2 font-code text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
                  isCurrent
                    ? "border-cyan-300 bg-cyan-400 font-bold text-slate-950"
                    : isDone
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                      : "border-slate-600 bg-slate-800 text-slate-400 hover:bg-slate-700",
                )}
              >
                {row.label}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** The big "what is happening right now" card, in plain words, with the Back / Next buttons right under it. */
export type StoryExplanation = Explanation & { lineRef?: number };

export function StepStory({ explanation, hints, index, total, table, partial, beginner, onJump }: StepStoryProps) {
  const Icon = TONE_ICON[explanation.tone];
  const isError = explanation.tone === "error";
  const atStart = index <= 0;
  const atEnd = index >= total - 1;

  return (
    <section
      aria-label="What is happening"
      aria-live="polite"
      className={cn("rounded-2xl border p-4", isError ? "border-red-500/60 bg-red-950/30" : "border-cyan-400/30 bg-gradient-to-br from-slate-800/80 to-slate-900/80")}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
          What is happening
        </span>
        <span className="font-code text-sm text-slate-400">
          step {index + 1} / {total}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <Icon className={cn("mt-1 h-6 w-6 shrink-0", isError ? "text-red-400" : "text-cyan-300")} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className={cn("break-words font-semibold leading-snug", beginner ? "text-2xl" : "text-xl", isError ? "text-red-100" : "text-slate-50")}>
            {explanation.title}
          </p>
          {explanation.lineRef !== undefined && (
            <p className="mt-0.5 text-xs text-slate-500">
              from <span className="font-code text-emerald-300">line {explanation.lineRef}</span> (green arrow in the code)
            </p>
          )}
          {explanation.details.length > 0 && (
            <ul className="mt-1.5 space-y-0.5">
              {explanation.details.map((detail, i) => (
                <li key={i} className={cn("break-words font-code text-base", isError ? "text-red-300" : "text-slate-300")}>
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {hints.why && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-300/10 px-3 py-2 text-base text-amber-100">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
          <span>
            <span className="font-semibold">Why? </span>
            {hints.why}
          </span>
        </p>
      )}
      {hints.next && (
        <p className="mt-2 flex items-start gap-2 text-base text-slate-300">
          <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
          <span className="min-w-0 break-words">
            Next, the computer will run: <span className="font-code text-slate-100">{hints.next}</span>
          </span>
        </p>
      )}

      <LoopTracker table={table} index={index} partial={partial} onJump={onJump} />

      <div className="mt-4 flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => onJump(index - 1)}
          disabled={atStart}
          className="inline-flex h-12 items-center gap-1 rounded-xl border border-slate-600 bg-slate-800 px-4 text-base font-medium text-slate-100 transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" /> Back
        </button>
        <button
          type="button"
          onClick={() => onJump(index + 1)}
          disabled={atEnd}
          className="inline-flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-cyan-400 px-6 text-lg font-bold text-slate-950 shadow-lg shadow-cyan-400/20 transition-colors hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 disabled:opacity-40"
        >
          {atEnd ? "The end" : "Next step"} <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-2 hidden text-center text-xs text-slate-500 sm:block lg:hidden">Tip: use the ← and → keys on your keyboard.</p>
    </section>
  );
}
