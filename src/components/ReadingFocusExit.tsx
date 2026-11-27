"use client";

import { useEffect } from "react";
import { Minimize2 } from "lucide-react";
import { restoreReadingFocus, setReadingFocus, useReadingFocus } from "@/lib/reading-focus";

/** The only control left while reading focus is on. Esc also leaves. */
export function ReadingFocusExit() {
  const on = useReadingFocus();
  useEffect(() => restoreReadingFocus(), []);
  useEffect(() => {
    if (!on) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector('[role="dialog"]')) setReadingFocus(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on]);
  if (!on) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex h-11 items-center justify-end border-b border-slate-800/70 bg-background px-3">
    <button
      type="button"
      onClick={() => setReadingFocus(false)}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-slate-50"
    >
      <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
      Exit focus
    </button>
    </div>
  );
}
