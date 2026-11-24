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
    <button
      type="button"
      onClick={() => setReadingFocus(false)}
      className="fixed right-3 top-3 z-[60] inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 opacity-60 shadow-lg backdrop-blur transition-opacity hover:opacity-100 focus-visible:opacity-100"
    >
      <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
      Exit focus
    </button>
  );
}
