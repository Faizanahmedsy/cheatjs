"use client";

import { useRef } from "react";
import { StringView } from "./ArrayViews";
import { ArrowLayer } from "./ArrowLayer";
import { FramesColumn } from "./FramesColumn";
import { HeapObjectView } from "./HeapObjectView";
import { Term } from "./Term";
import type { StepView } from "./view-context";

/** Frames (left) and objects (right) with reference arrows drawn over both. */
export function StatePanel({ view, heapIds }: { view: StepView; heapIds: number[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const empty = heapIds.length === 0 && view.strings.length === 0;
  // Beginner mode: no objects yet → the frames get the whole width.
  const showObjects = !(view.beginner && empty);
  return (
    <section aria-label="Variables and objects" className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/40">
      <div
        ref={containerRef}
        className={
          showObjects
            ? "relative grid min-w-[36rem] grid-cols-[minmax(13rem,2fr)_minmax(0,3fr)] gap-x-12 gap-y-4 p-4"
            : "relative grid grid-cols-1 gap-4 p-4"
        }
      >
        <FramesColumn view={view} />
        {showObjects && (
          <div className="flex min-w-0 flex-col gap-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">
              <Term name="heap" enabled={view.beginner}>Objects</Term>
              {view.strings.length > 0 && " & strings"}
            </h2>
            {empty ? (
              <p className="text-sm italic text-slate-500">No objects yet.</p>
            ) : (
              <div className="flex flex-wrap items-start gap-x-10 gap-y-5">
                {view.strings.map((variable) => (
                  <StringView key={`s-${variable.name}`} variable={variable} view={view} />
                ))}
                {heapIds.map((id) => (
                  <HeapObjectView key={id} id={id} view={view} />
                ))}
              </div>
            )}
          </div>
        )}
        <ArrowLayer containerRef={containerRef} renderKey={`${view.stepIndex}:${heapIds.join(",")}:${showObjects}`} />
      </div>
    </section>
  );
}
