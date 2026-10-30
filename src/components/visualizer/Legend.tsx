import { ArrowRight } from "lucide-react";

/** What each colour means — colour is only used for these. */
export function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400" aria-label="Legend">
      <li className="flex items-center gap-1.5">
        <ArrowRight className="h-4 w-4 text-emerald-400" strokeWidth={3} aria-hidden="true" />
        line that just ran
      </li>
      <li className="flex items-center gap-1.5">
        <ArrowRight className="h-4 w-4 text-red-400" strokeWidth={3} aria-hidden="true" />
        next line to run
      </li>
      <li className="flex items-center gap-1.5">
        <span className="inline-block h-4 w-4 rounded border-2 border-slate-600 shadow-[0_0_0_2px_rgb(251_191_36)]" aria-hidden="true" />
        changed this step <s className="text-slate-500">old</s>
      </li>
      <li className="flex items-center gap-1.5">
        <span className="font-code font-bold text-sky-300" aria-hidden="true">▲ i</span>
        index pointer (coloured per variable)
      </li>
      <li className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-5 rounded-sm bg-amber-300/25 ring-1 ring-amber-300/50" aria-hidden="true" />
        window between two pointers (left..right)
      </li>
      <li className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full bg-slate-200" aria-hidden="true" />
        reference → object
      </li>
    </ul>
  );
}
