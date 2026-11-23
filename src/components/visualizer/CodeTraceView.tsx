"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InlineNote } from "@/lib/visualizer/inline-notes";
import { stripComment } from "@/lib/visualizer/insights";
import { highlightLine } from "./highlight";

interface CodeTraceViewProps {
  code: string;
  /** Next line to run (red arrow). 0 when the program has finished. */
  nextLine: number;
  /** Line that just ran (green arrow). */
  doneLine: number;
  /** The step is an error: the next-line band turns into the error band. */
  isError: boolean;
  /** Beginner mode: bigger text. */
  large?: boolean;
  /** What the line that just ran changed, shown beside that line. */
  notes?: InlineNote[];
  /** Drop `//` comments from the display (line numbers stay the same). */
  hideComments?: boolean;
}

/** Read-only code with Python Tutor style arrows: green = just ran, red = runs next. */
export function CodeTraceView({ code, nextLine, doneLine, isError, large = false, notes = [], hideComments = false }: CodeTraceViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lines = code.split("\n");

  // Keep the next line in view without scrolling the whole page.
  useEffect(() => {
    const container = containerRef.current;
    const target = container?.querySelector<HTMLElement>(`[data-line="${nextLine || doneLine}"]`);
    if (!container || !target) return;
    const top = target.offsetTop;
    const bottom = top + target.offsetHeight;
    if (top < container.scrollTop + 24) container.scrollTop = Math.max(0, top - 48);
    else if (bottom > container.scrollTop + container.clientHeight - 24) container.scrollTop = bottom - container.clientHeight + 48;
  }, [nextLine, doneLine]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-[22rem] overflow-auto rounded-lg border border-slate-700/60 bg-slate-950 py-3 font-code lg:h-[calc(100vh-var(--viz-top,10rem)-2.5rem)] lg:min-h-[22rem]",
        large ? "text-[17px] leading-8" : "text-[15px] leading-7",
      )}
      aria-label="Code being visualized"
      role="region"
    >
      {lines.map((raw, index) => {
        const text = hideComments ? stripComment(raw) : raw;
        const line = index + 1;
        const isNext = line === nextLine;
        const isDone = line === doneLine;
        return (
          <div
            key={index}
            data-line={line}
            aria-current={isNext ? "step" : undefined}
            className={cn(
              "flex flex-wrap items-stretch pr-4 transition-colors duration-200 motion-reduce:transition-none",
              isNext && (isError ? "bg-red-500/20" : "bg-red-500/10"),
              !isNext && isDone && "bg-emerald-500/10",
            )}
          >
            <span className="flex w-12 shrink-0 items-center justify-end gap-0.5 pr-1" aria-hidden="true">
              {isDone && <ArrowRight className="h-4 w-4 text-emerald-400" strokeWidth={3} />}
              {isNext && <ArrowRight className="h-4 w-4 text-red-400" strokeWidth={3} />}
            </span>
            <span className="w-8 shrink-0 select-none pr-3 text-right text-slate-600" aria-hidden="true">
              {line}
            </span>
            <span
              className="min-w-0 flex-1 whitespace-pre-wrap break-words text-slate-200"
              style={{ paddingLeft: `${(text.length - text.trimStart().length) + 2}ch`, textIndent: "-2ch" }}
            >
              {text.trim() ? highlightLine(text.trimStart()) : " "}
              {isNext && <span className="sr-only"> (runs next)</span>}
              {isDone && <span className="sr-only"> (just ran)</span>}
            </span>
            {isDone && notes.length > 0 && (
              <span className="flex basis-full flex-wrap items-center gap-2 pb-1 pl-20 font-code text-[0.8em]" aria-label="What this line changed">
                {notes.map((note) => (
                  <span key={note.name} className="inline-flex items-center gap-1 rounded-md bg-amber-300/15 px-2 py-0.5 text-amber-100 ring-1 ring-amber-300/40">
                    <span className="font-semibold">{note.name}</span>
                    {note.was !== undefined && (
                      <>
                        <s className="text-slate-400">{note.was}</s>
                        <span aria-hidden="true">→</span>
                      </>
                    )}
                    {note.was === undefined && <span aria-hidden="true">=</span>}
                    <span className="font-semibold text-amber-50">{note.now}</span>
                  </span>
                ))}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
