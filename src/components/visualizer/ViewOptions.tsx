"use client";

import { Settings2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import type { VizOptions } from "./use-viz-options";

const ROWS: { key: keyof VizOptions; title: string; text: string }[] = [
  { key: "focus", title: "Tidy panels", text: "Show only the code, the picture and what is happening. Variables and the dry-run table fold into More details." },
  { key: "quiz", title: "Quiz me (predict)", text: "Before a line changes a variable, guess the new value first." },
  { key: "smartPlay", title: "Smart play", text: "Play stops by itself at key moments: a true if, a return, a print, the end." },
  { key: "skipSetup", title: "Skip setup lines", text: "Next / Back jump over the top-level setup and stay inside the function." },
  { key: "hideComments", title: "Hide comments", text: "Remove // notes from the code so lines are shorter." },
];

/** The ⚙ menu in the control bar. */
export function ViewOptions({ options, onChange }: { options: VizOptions; onChange: (patch: Partial<VizOptions>) => void }) {
  const count = ROWS.filter((row) => row.key !== "focus" && options[row.key]).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Options"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-200 transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <Settings2 className="h-4 w-4" aria-hidden="true" />
          <span className="hidden 2xl:inline">Options</span>
          {count > 0 && <span className="rounded bg-cyan-400/20 px-1 text-xs text-cyan-200">{count}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 border-slate-700 bg-slate-900 p-2 text-slate-200">
        {ROWS.map((row) => (
          <label key={row.key} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-slate-800">
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-100">{row.title}</span>
              <span className="text-xs text-slate-400">{row.text}</span>
            </span>
            <Switch checked={options[row.key]} onCheckedChange={(on) => onChange({ [row.key]: on })} aria-label={row.title} />
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}
