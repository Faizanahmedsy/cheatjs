"use client";

import { Maximize2 } from "lucide-react";
import { setReadingFocus } from "@/lib/reading-focus";

/** "Focus" next to Open in LLM: hide everything but the note. */
export function ReadingFocusButton() {
  return (
    <button
      type="button"
      onClick={() => setReadingFocus(true)}
      title="Focus: hide everything but the note (F)"
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800"
    >
      <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
      Focus
    </button>
  );
}
