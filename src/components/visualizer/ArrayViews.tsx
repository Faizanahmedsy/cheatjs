import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { Pointer } from "@/lib/visualizer/analysis";
import type { ArrayObject } from "@/lib/visualizer/types";
import { OldValue, ValueView } from "./ValueView";
import { flashKey, oldText, type StepView } from "./view-context";

/** Cell width (w-12 = 48px) + gap (4px): how far a value slides per index. */
const CELL_PITCH_PX = 52;

function PointerTags({ pointers, className }: { pointers: Pointer[]; className?: string }) {
  if (pointers.length === 0) return null;
  return (
    <div className={cn("flex flex-col items-center gap-0.5", className)}>
      {pointers.map((pointer) => (
        <span key={pointer.name} className={cn("font-code text-sm font-bold leading-4", pointer.color.text)}>
          <span aria-hidden="true">▲ </span>
          {pointer.name}
        </span>
      ))}
    </div>
  );
}

/** A horizontal row of cells, index under each, pointer variables under that. */
export function ArrayView({ id, object, view }: { id: number; object: ArrayObject; view: StepView }) {
  const changed = view.changes.cells.get(id);
  const moves = view.changes.moves.get(id);
  const pointers = view.pointed.has(id) ? view.pointers.filter((p) => p.value < object.items.length) : [];

  if (object.items.length === 0) {
    return <p className="font-code text-sm italic text-slate-500">empty array []</p>;
  }

  return (
    <div className="flex flex-wrap items-start gap-1">
      {object.items.map((item, index) => {
        const isChanged = changed?.has(String(index)) ?? false;
        const was = isChanged ? oldText(view, changed?.get(String(index))) : null;
        const from = moves?.get(index);
        const here = pointers.filter((p) => p.value === index);
        const style = from === undefined ? undefined : ({ "--viz-shift": `${(from - index) * CELL_PITCH_PX}px` } as CSSProperties);
        return (
          <div key={index} className="flex w-12 flex-col items-center">
            <div className="flex h-5 items-end">{was && <OldValue text={was} className="text-xs" />}</div>
            <div
              key={flashKey(isChanged, view.stepIndex, index)}
              style={style}
              className={cn(
                "flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border-2 bg-slate-800/80 text-lg",
                here[0] ? here[0].color.border : "border-slate-600",
                isChanged && "viz-flash",
                from !== undefined && "viz-slide",
              )}
            >
              <ValueView value={item} heap={view.step.heap} boxed={view.boxed} className="truncate px-0.5" />
            </div>
            <span className="mt-1 font-code text-xs text-slate-500">{index}</span>
            <PointerTags pointers={here} className="mt-0.5" />
          </div>
        );
      })}
      {object.hidden > 0 && <span className="self-center px-2 text-sm text-slate-500">+{object.hidden} more</span>}
    </div>
  );
}

/** An array of rows drawn as a grid; row/col pointer variables highlight their row, column and cell. */
export function GridView({ id, rows, rowIds, view }: { id: number; rows: ArrayObject[]; rowIds: number[]; view: StepView }) {
  const width = Math.max(...rows.map((row) => row.items.length));
  const active = view.pointed.has(id);
  const rowPointers = active ? view.pointers.filter((p) => p.axis === "row" && p.value < rows.length) : [];
  const colPointers = active ? view.pointers.filter((p) => p.axis === "col" && p.value < width) : [];
  const rowColor = (r: number) => rowPointers.find((p) => p.value === r)?.color;
  const colColor = (c: number) => colPointers.find((p) => p.value === c)?.color;

  return (
    <table className="border-separate border-spacing-1" aria-label={`grid with ${rows.length} rows and ${width} columns`}>
      <thead>
        <tr>
          <th scope="col" className="w-8" />
          {Array.from({ length: width }, (_, c) => (
            <th key={c} scope="col" className={cn("h-6 font-code text-xs font-normal", colColor(c)?.text ?? "text-slate-500")}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => {
          const changed = view.changes.cells.get(rowIds[r]);
          const rc = rowColor(r);
          return (
            <tr key={rowIds[r]}>
              <th scope="row" className={cn("pr-1 text-right font-code text-xs font-normal", rc?.text ?? "text-slate-500")}>
                {r}
              </th>
              {row.items.map((item, c) => {
                const isChanged = changed?.has(String(c)) ?? false;
                const cc = colColor(c);
                const isTarget = Boolean(rc && cc);
                return (
                  <td key={flashKey(isChanged, view.stepIndex, c)} className="p-0">
                    <div
                      className={cn(
                        "relative flex h-12 w-12 items-center justify-center rounded-md border-2 text-lg transition-colors duration-300",
                        isTarget ? cn(rc?.border, rc?.soft) : rc ? "border-slate-600 bg-slate-700/60" : cc ? "border-slate-600 bg-slate-700/60" : "border-slate-700 bg-slate-800/80",
                        isChanged && "viz-flash",
                      )}
                    >
                      <ValueView value={item} heap={view.step.heap} boxed={view.boxed} />
                      {isChanged && (
                        <OldValue text={oldText(view, changed?.get(String(c))) ?? ""} className="absolute right-1 top-0 text-[10px]" />
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
      {(rowPointers.length > 0 || colPointers.length > 0) && (
        <caption className="caption-bottom pt-2 text-left text-sm">
          {[...rowPointers.map((p) => ({ p, label: `row ${p.value}` })), ...colPointers.map((p) => ({ p, label: `col ${p.value}` }))].map(({ p, label }) => (
            <span key={p.name} className={cn("mr-3 font-code font-bold", p.color.text)}>
              {p.name} → {label}
            </span>
          ))}
        </caption>
      )}
    </table>
  );
}
