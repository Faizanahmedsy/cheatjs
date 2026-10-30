import { AlertTriangle, ArrowRight, CheckCircle2, CornerDownLeft, CornerDownRight, Info, Lightbulb, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Explanation } from "@/lib/visualizer/analysis";
import type { StepHints } from "@/lib/visualizer/explain-why";
import type { LoopState } from "@/lib/visualizer/types";
import { Term } from "./Term";

const TONE_ICON = {
  info: Info,
  call: CornerDownRight,
  return: CornerDownLeft,
  error: AlertTriangle,
  done: CheckCircle2,
} as const;

interface LoopInfo {
  loop: LoopState;
  total: number;
  /** The run was cut short, so the total may be higher. */
  partial: boolean;
}

function loopText({ loop, total, partial }: LoopInfo): string {
  const of = partial ? `${total}+` : `${total}`;
  const label = `${loop.kind} loop on line ${loop.line}`;
  if (loop.iteration === 0) return `${label} · starting (${of} ${total === 1 ? "pass" : "passes"} in total)`;
  return `${label} · pass ${loop.iteration} of ${of}`;
}

/** "What just happened" in plain words, plus where we are in the current loop. */
export function ExplanationBar({
  explanation,
  loopInfo,
  hints,
  beginner,
}: {
  explanation: Explanation;
  loopInfo?: LoopInfo;
  hints: StepHints;
  beginner: boolean;
}) {
  const Icon = TONE_ICON[explanation.tone];
  const isError = explanation.tone === "error";
  return (
    <div
      aria-live="polite"
      className={cn(
        "rounded-xl border bg-slate-800/50 px-4 py-3",
        isError ? "border-red-500/60 bg-red-950/30" : "border-slate-700/50",
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-1 h-5 w-5 shrink-0", isError ? "text-red-400" : "text-slate-400")} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className={cn("font-code leading-snug", beginner ? "text-xl" : "text-lg", isError ? "text-red-200" : "text-slate-100")}>
            {explanation.title}
          </p>
          {hints.why && (
            <p className={cn("mt-1 flex items-start gap-1.5 text-amber-100/90", beginner ? "text-base" : "text-sm")}>
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
              <span>{hints.why}</span>
            </p>
          )}
          {explanation.details.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {explanation.details.map((detail, index) => (
                <li key={index} className={cn("break-words font-code", beginner ? "text-base" : "text-sm", isError ? "text-red-300" : "text-slate-300")}>
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {(loopInfo || hints.next) && (
        <div className="mt-2 flex flex-col gap-1 border-t border-slate-700/50 pt-2 text-sm text-slate-400 sm:flex-row sm:flex-wrap sm:gap-x-6">
          {hints.next && (
            <p className="flex min-w-0 items-start gap-2">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
              <span className="min-w-0 break-words">
                Next: <span className="font-code text-slate-200">{hints.next}</span>
              </span>
            </p>
          )}
          {loopInfo && (
            <p className="flex items-center gap-2">
              <Repeat className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {loopText(loopInfo)}{" "}
                {beginner && (
                  <span className="text-slate-500">
                    (<Term name="iteration">what is a pass?</Term>)
                  </span>
                )}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
