import { AlertTriangle, CheckCircle2, CornerDownLeft, CornerDownRight, Info, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Explanation } from "@/lib/visualizer/analysis";
import type { LoopState } from "@/lib/visualizer/types";

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
export function ExplanationBar({ explanation, loopInfo }: { explanation: Explanation; loopInfo?: LoopInfo }) {
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
          <p className={cn("font-code text-lg leading-snug", isError ? "text-red-200" : "text-slate-100")}>{explanation.title}</p>
          {explanation.details.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {explanation.details.map((detail, index) => (
                <li key={index} className={cn("break-words font-code text-base", isError ? "text-red-300" : "text-slate-300")}>
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {loopInfo && (
        <p className="mt-2 flex items-center gap-2 border-t border-slate-700/50 pt-2 text-sm text-slate-400">
          <Repeat className="h-4 w-4" aria-hidden="true" />
          {loopText(loopInfo)}
        </p>
      )}
    </div>
  );
}
