"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

/** Read-only code with Python Tutor style arrows: green = just ran, red = runs next. */
export function CodeTraceView({ code, nextLine, doneLine, isError, large = false }: CodeTraceViewProps) {
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
        "relative h-[22rem] overflow-auto rounded-lg border border-slate-700/60 bg-slate-950 py-3 font-code lg:h-[30rem]",
        large ? "text-[17px] leading-8" : "text-[15px] leading-7",
      )}
      aria-label="Code being visualized"
      role="region"
    >
      {lines.map((text, index) => {
        const line = index + 1;
        const isNext = line === nextLine;
        const isDone = line === doneLine;
        return (
          <div
            key={index}
            data-line={line}
            aria-current={isNext ? "step" : undefined}
            className={cn(
              "flex min-w-max items-stretch pr-4 transition-colors duration-200 motion-reduce:transition-none",
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
            <span className="whitespace-pre text-slate-200">
              {text || " "}
              {isNext && <span className="sr-only"> (runs next)</span>}
              {isDone && <span className="sr-only"> (just ran)</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
