"use client";

import { useRef } from "react";
import { ArrowLayer } from "./ArrowLayer";
import { FramesColumn } from "./FramesColumn";
import { HeapObjectView } from "./HeapObjectView";
import type { StepView } from "./view-context";

/** Frames (left) and objects (right) with reference arrows drawn over both. */
export function StatePanel({ view, heapIds }: { view: StepView; heapIds: number[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/40">
      <div ref={containerRef} className="relative grid min-w-[36rem] grid-cols-[minmax(13rem,2fr)_minmax(0,3fr)] gap-x-12 gap-y-4 p-4">
        <FramesColumn view={view} />
        <div className="flex min-w-0 flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">Objects</h2>
          {heapIds.length === 0 ? (
            <p className="text-sm italic text-slate-500">No objects yet.</p>
          ) : (
            <div className="flex flex-wrap items-start gap-x-10 gap-y-5">
              {heapIds.map((id) => (
                <HeapObjectView key={id} id={id} view={view} />
              ))}
            </div>
          )}
        </div>
        <ArrowLayer containerRef={containerRef} renderKey={`${view.stepIndex}:${heapIds.join(",")}`} />
      </div>
    </div>
  );
}
