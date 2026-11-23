"use client";

import { cn } from "@/lib/utils";
import { SkipForward } from "lucide-react";
import { previewValue, topFrame } from "@/lib/visualizer/analysis";
import type { Value } from "@/lib/visualizer/types";
import { flashKey, oldText, type StepView } from "./view-context";

function kindLabel(value: Value, view: StepView): string {
  if (value.type === "prim") {
    switch (value.kind) {
      case "number":
        return "number";
      case "string":
        return "text";
      case "boolean":
        return "yes / no";
      case "null":
      case "undefined":
        return "nothing yet";
      default:
        return value.kind;
    }
  }
  const object = view.step.heap[value.id];
  if (!object) return "object";
  switch (object.kind) {
    case "array":
      return `list of ${object.items.length + object.hidden}`;
    case "map":
      return `map of ${object.entries.length + object.hidden}`;
    case "set":
      return `set of ${object.items.length + object.hidden}`;
    case "object":
      return object.className ?? "object";
    default:
      return object.kind;
  }
}

function canMiniList(value: Value, view: StepView): boolean {
  if (value.type !== "ref") return false;
  const object = view.step.heap[value.id];
  return Boolean(object && (object.kind === "array" || object.kind === "set") && object.items.every((item) => item.type === "prim"));
}

/** A short list drawn as small boxes instead of "[2, 7, 11, 15]" text that wraps badly. */
function MiniList({ value, view }: { value: Value; view: StepView }) {
  if (value.type !== "ref") return null;
  const object = view.step.heap[value.id];
  if (!object || (object.kind !== "array" && object.kind !== "set")) return null;
  const items = object.items.slice(0, 8);
  const more = object.items.length - items.length + object.hidden;
  if (items.length === 0) return <span className="font-code text-lg text-slate-400">{object.kind === "array" ? "[ ] empty" : "{ } empty"}</span>;
  if (items.some((item) => item.type === "ref")) return null;
  return (
    <span className="flex flex-wrap items-center gap-1">
      {items.map((item, i) => (
        <span key={i} className="grid h-8 min-w-8 place-items-center rounded-md border border-slate-600 bg-slate-800 px-1.5 font-code text-base text-slate-50">
          {item.type === "prim" ? item.value : "…"}
        </span>
      ))}
      {more > 0 && <span className="text-xs text-slate-400">+{more}</span>}
    </span>
  );
}

/**
 * Every variable of the running function as a big card: its name, its value right now,
 * and a glow with "was → now" when the last line changed it.
 */
export function VariableCards({ view, onNextChange }: { view: StepView; onNextChange?: (name: string) => void }) {
  const frame = topFrame(view.step);
  const visible = frame.vars.filter((variable) => {
    if (variable.name === "this") return false;
    if (variable.value.type === "ref" && view.step.heap[variable.value.id]?.kind === "function") return false;
    return true;
  });
  const where = frame.name === "Global frame" ? "the main code" : `${frame.name}()`;

  return (
    <section aria-label="Variables right now" className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-base font-semibold text-slate-100">
          <span aria-hidden="true">📦 </span>Variables right now
          <span className="ml-2 text-sm font-normal text-slate-400">inside {where}</span>
        </h2>
        <span className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-block h-3 w-3 rounded-sm bg-amber-300/30 ring-1 ring-amber-300" aria-hidden="true" /> glowing = changed on the last line
        </span>
      </header>

      {visible.length === 0 ? (
        <p className="text-base italic text-slate-500">No variables yet. They appear here as the code creates them.</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3">
          {visible.map((variable) => {
            const key = `${frame.id}:${variable.name}`;
            const changed = view.changes.vars.has(key);
            const isNew = changed && view.changes.vars.get(key) === null;
            const was = changed && !isNew ? oldText(view, view.changes.vars.get(key)) : null;
            const color = view.pointers.find((pointer) => pointer.name === variable.name)?.color;
            const text = previewValue(variable.value, view.step, view.names);
            return (
              <li
                key={variable.name}
                title={`${variable.name} = ${text}`}
                className={cn(
                  "min-w-0 rounded-xl border bg-slate-900/80 p-3 transition-colors",
                  changed ? "border-amber-300 shadow-[0_0_0_3px_rgb(252_211_77/0.25)]" : "border-slate-700",
                  color && !changed && color.border,
                )}
              >
                <p className="flex items-center justify-between gap-2">
                  <span className={cn("min-w-0 break-all font-code text-base font-bold leading-tight", color ? color.text : "text-cyan-200")}>{variable.name}</span>
                  {changed && (
                    <span className="shrink-0 rounded bg-amber-300 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-950">
                      {isNew ? "new" : "changed"}
                    </span>
                  )}
                </p>
                <div key={flashKey(changed, view.stepIndex, variable.name)} className={cn("mt-1.5 rounded", changed && "viz-flash")}>
                  {canMiniList(variable.value, view) ? (
                    <MiniList value={variable.value} view={view} />
                  ) : (
                    <p
                      className={cn(
                        "break-words font-code font-semibold leading-tight text-slate-50",
                        variable.value.type === "ref" || text.length > 10 ? "text-lg" : "text-2xl",
                      )}
                    >
                      {text}
                    </p>
                  )}
                </div>
                <p className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-2">
                    {kindLabel(variable.value, view)}
                    {onNextChange && (
                      <button
                        type="button"
                        onClick={() => onNextChange(variable.name)}
                        title={`Jump to the next step where ${variable.name} changes`}
                        className="inline-flex items-center gap-0.5 rounded px-1 text-cyan-300/80 hover:bg-slate-800 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                      >
                        <SkipForward className="h-3 w-3" aria-hidden="true" /> next change
                      </button>
                    )}
                  </span>
                  {was !== null && (
                    <span className="truncate font-code text-slate-400">
                      was <s>{was}</s>
                    </span>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
