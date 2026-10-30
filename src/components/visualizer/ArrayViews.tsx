import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Pointer } from "@/lib/visualizer/analysis";
import { windowRange, type StringVar, type WindowRange } from "@/lib/visualizer/cells";
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

/** The shaded band under cells between two window pointers, with its size. */
function WindowCaption({ range }: { range: WindowRange }) {
  const size = range.to - range.from + 1;
  return (
    <p className="mt-1 text-sm text-amber-200/90">
      <span className="mr-1.5 inline-block h-2.5 w-4 rounded-sm bg-amber-300/25 align-middle ring-1 ring-amber-300/50" aria-hidden="true" />
      window <span className="font-code">{range.label}</span> = index {range.from} to {range.to} ({size} {size === 1 ? "item" : "items"})
    </p>
  );
}

export interface Cell {
  content: ReactNode;
  changed: boolean;
  was: string | null;
  /** Index the value slid in from (swaps / shifts). */
  from?: number;
}

/** A horizontal row of cells, index under each, pointer variables under that, window band behind. */
export function CellRow({ cells, pointers, view, hidden = 0, label }: { cells: Cell[]; pointers: Pointer[]; view: StepView; hidden?: number; label: string }) {
  const range = windowRange(pointers, cells.length);
  return (
    <div>
      <div className="flex flex-wrap items-start gap-1" role="list" aria-label={label}>
        {cells.map((cell, index) => {
          const here = pointers.filter((p) => p.value === index);
          const inWindow = range !== null && index >= range.from && index <= range.to;
          const style = cell.from === undefined ? undefined : ({ "--viz-shift": `${(cell.from - index) * CELL_PITCH_PX}px` } as CSSProperties);
          return (
            <div key={index} role="listitem" className={cn("flex w-12 flex-col items-center rounded-md", inWindow && "bg-amber-300/15")}>
              <div className="flex h-5 items-end">{cell.was && <OldValue text={cell.was} className="text-xs" />}</div>
              <div
                key={flashKey(cell.changed, view.stepIndex, index)}
                style={style}
                className={cn(
                  "flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border-2 bg-slate-800/80 text-lg",
                  here[0] ? here[0].color.border : inWindow ? "border-amber-300/50" : "border-slate-600",
                  cell.changed && "viz-flash",
                  cell.from !== undefined && "viz-slide",
                )}
              >
                {cell.content}
              </div>
              <span className="mt-1 font-code text-xs text-slate-400">{index}</span>
              <PointerTags pointers={here} className="mt-0.5" />
            </div>
          );
        })}
        {hidden > 0 && <span className="self-center px-2 text-sm text-slate-500">+{hidden} more</span>}
      </div>
      {range && <WindowCaption range={range} />}
    </div>
  );
}

/** An array as a row of cells. */
export function ArrayView({ id, object, view }: { id: number; object: ArrayObject; view: StepView }) {
  const changed = view.changes.cells.get(id);
  const moves = view.changes.moves.get(id);
  const pointers = view.pointed.has(id) ? view.pointers.filter((p) => p.value < object.items.length) : [];

  if (object.items.length === 0) {
    return <p className="font-code text-sm italic text-slate-500">empty array []</p>;
  }
  const cells: Cell[] = object.items.map((item, index) => {
    const isChanged = changed?.has(String(index)) ?? false;
    return {
      content: <ValueView value={item} heap={view.step.heap} boxed={view.boxed} className="truncate px-0.5" />,
      changed: isChanged,
      was: isChanged ? oldText(view, changed?.get(String(index))) : null,
      from: moves?.get(index),
    };
  });
  return <CellRow cells={cells} pointers={pointers} view={view} hidden={object.hidden} label={`array ${view.names.get(id) ?? ""}`} />;
}

/** A string as character cells, so string pointers (left/right, i/j) can be drawn under it. */
export function StringView({ variable, view }: { variable: StringVar; view: StepView }) {
  const pointers = view.pointers.filter((p) => p.value < variable.chars.length);
  const cells: Cell[] = variable.chars.map((char, index) => {
    const old = variable.before?.[index];
    const changed = variable.before !== null && old !== char;
    return {
      content: <span className={cn("font-code", char === " " ? "text-slate-500" : "text-slate-100")}>{char === " " ? "␣" : char}</span>,
      changed,
      was: changed && old !== undefined ? old : null,
    };
  });
  return (
    <section className="w-fit max-w-full rounded-lg border border-slate-700/70 bg-slate-900/70 p-3" aria-label={`string ${variable.name}`}>
      <header className="mb-2 flex items-baseline gap-2 text-sm">
        <span className="font-medium text-slate-300">string</span>
        <span className="font-code text-slate-400">{variable.name}</span>
        <span className="text-xs text-slate-500">length {variable.chars.length}</span>
      </header>
      <CellRow cells={cells} pointers={pointers} view={view} label={`characters of ${variable.name}`} />
    </section>
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
