import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TraceStep } from "@/lib/visualizer/types";

/** The yes / no question the code just asked, with the real values filled in. */
export function ConditionCard({ prevStep }: { prevStep: TraceStep | undefined }) {
  const condition = prevStep?.condition;
  if (!prevStep || !condition || !condition.text) return null;
  const isLoopCheck = prevStep.loop?.line === prevStep.line;
  const yes = condition.result;
  const verdict = isLoopCheck
    ? yes
      ? "YES: run the loop's code once more"
      : "NO: the loop is finished"
    : yes
      ? "YES: go inside this block"
      : "NO: skip this block";

  return (
    <section
      aria-label="The check that was just made"
      className={cn("rounded-2xl border p-4", yes ? "border-emerald-400/40 bg-emerald-950/20" : "border-rose-400/40 bg-rose-950/20")}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
        The question on line {prevStep.line} <span className="font-normal normal-case text-slate-500">(a yes / no check)</span>
      </h2>
      <p className="mt-1 break-words font-code text-base text-slate-200">{condition.text}</p>

      {condition.comparisons.length > 0 && (
        <ul className="mt-3 space-y-2">
          {condition.comparisons.map((comparison, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2 font-code text-base">
              <Side text={comparison.leftText} value={comparison.left} />
              <span className="rounded-md bg-slate-700 px-2 py-1 text-lg font-bold text-slate-100" title="comparison">
                {comparison.op}
              </span>
              <Side text={comparison.rightText} value={comparison.right} />
              <span className={cn("ml-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold", comparison.result ? "bg-emerald-400/20 text-emerald-200" : "bg-rose-400/20 text-rose-200")}>
                {comparison.result ? <Check className="h-4 w-4" aria-hidden="true" /> : <X className="h-4 w-4" aria-hidden="true" />}
                {comparison.result ? "true" : "false"}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className={cn("mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-base font-bold", yes ? "bg-emerald-400/20 text-emerald-100" : "bg-rose-400/20 text-rose-100")}>
        {yes ? <Check className="h-5 w-5" aria-hidden="true" /> : <X className="h-5 w-5" aria-hidden="true" />}
        {verdict}
      </p>
    </section>
  );
}

function Side({ text, value }: { text: string; value: string }) {
  const same = text === value;
  return (
    <span className="inline-flex flex-col rounded-md border border-slate-600 bg-slate-900/70 px-2.5 py-1 leading-tight">
      {!same && <span className="text-xs text-slate-400">{text}</span>}
      <span className="text-lg font-semibold text-slate-50">{value}</span>
    </span>
  );
}
