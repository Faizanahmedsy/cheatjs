import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gridRows, valueKey } from "@/lib/visualizer/analysis";
import type { HeapObject, Value } from "@/lib/visualizer/types";
import { ArrayView, GridView } from "./ArrayViews";
import { functionLabel, OldValue, ValueView } from "./ValueView";
import { flashKey, oldText, type StepView } from "./view-context";

function kindLabel(object: HeapObject, isGrid: boolean): string {
  switch (object.kind) {
    case "array":
      return isGrid ? "2D array" : "array";
    case "object":
      return object.className ? `${object.className} instance` : "object";
    case "map":
      return "Map";
    case "set":
      return "Set";
    case "function":
      return object.isClass ? "class" : "function";
    case "other":
      return "value";
  }
}

/** A dictionary (Map or plain object) as a key → value table; changed rows flash, new keys get a badge. */
function KeyValueRows({
  rows,
  changedCells,
  view,
}: {
  rows: { cellKey: string; key: ReactNode; value: Value }[];
  changedCells?: Map<string, Value | null>;
  view: StepView;
}) {
  if (rows.length === 0) return <p className="font-code text-sm italic text-slate-500">empty — no keys yet</p>;
  return (
    <table className="w-full min-w-[10rem] border-collapse text-base">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
          <th scope="col" className="pb-1 pr-3 font-medium">key</th>
          <th scope="col" className="pb-1 font-medium">value</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const isChanged = changedCells?.has(row.cellKey) ?? false;
          const isNewKey = isChanged && changedCells?.get(row.cellKey) === null && view.stepIndex > 0;
          const was = isChanged ? oldText(view, changedCells?.get(row.cellKey)) : null;
          return (
            <tr key={row.cellKey} className={cn("border-t border-slate-700/60", isChanged && "bg-amber-300/10")}>
              <th scope="row" className="py-1.5 pr-3 text-left align-middle font-code text-sm font-normal text-slate-300">
                {row.key}
              </th>
              <td className="py-1.5 align-middle">
                <span
                  key={flashKey(isChanged, view.stepIndex, row.cellKey)}
                  className={cn("inline-flex min-w-[2rem] items-center gap-2 rounded px-1.5 py-0.5", isChanged && "viz-flash")}
                >
                  <ValueView value={row.value} heap={view.step.heap} boxed={view.boxed} />
                  {was && <OldValue text={was} />}
                  {isNewKey && <NewBadge />}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function NewBadge() {
  return <span className="rounded bg-amber-300/20 px-1.5 py-0.5 font-body text-[11px] font-medium text-amber-200">new key</span>;
}

function sizeOf(object: HeapObject): number | null {
  switch (object.kind) {
    case "map":
    case "object":
      return object.entries.length + object.hidden;
    case "set":
    case "array":
      return object.items.length + object.hidden;
    default:
      return null;
  }
}

function Body({ id, object, view }: { id: number; object: HeapObject; view: StepView }) {
  const changedCells = view.changes.cells.get(id);
  switch (object.kind) {
    case "array": {
      const rows = gridRows(object, view.step.heap);
      const rowIds = object.items.map((item) => (item.type === "ref" ? item.id : -1));
      const folded = rows && rowIds.every((rowId) => !view.boxed.has(rowId));
      return folded && rows ? <GridView id={id} rows={rows} rowIds={rowIds} view={view} /> : <ArrayView id={id} object={object} view={view} />;
    }
    case "object":
      return (
        <KeyValueRows
          view={view}
          changedCells={changedCells}
          rows={object.entries.map((entry) => ({ cellKey: entry.key, key: entry.key, value: entry.value }))}
        />
      );
    case "map":
      return (
        <KeyValueRows
          view={view}
          changedCells={changedCells}
          rows={object.entries.map((entry) => ({
            cellKey: valueKey(entry.key),
            key: <ValueView value={entry.key} heap={view.step.heap} boxed={view.boxed} />,
            value: entry.value,
          }))}
        />
      );
    case "set":
      return object.items.length === 0 ? (
        <p className="font-code text-sm italic text-slate-500">empty set</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {object.items.map((item) => {
            const key = valueKey(item);
            const isChanged = changedCells?.has(key) ?? false;
            return (
              <span
                key={flashKey(isChanged, view.stepIndex, key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border-2 border-slate-600 bg-slate-800/80 px-3 py-1 text-lg",
                  isChanged && "viz-flash",
                )}
              >
                <ValueView value={item} heap={view.step.heap} boxed={view.boxed} />
                {isChanged && view.stepIndex > 0 && <span className="text-[11px] font-medium text-amber-200">new</span>}
              </span>
            );
          })}
        </div>
      );
    case "function":
      return <p className="font-code text-sm text-slate-300">{functionLabel(object)}</p>;
    case "other":
      return <p className="font-code text-sm text-slate-300">{object.label}</p>;
  }
}

/** One heap box. `data-viz-heap` is what the arrow layer aims at. */
export function HeapObjectView({ id, view }: { id: number; view: StepView }) {
  const object = view.step.heap[id];
  if (!object) return null;
  const isGrid = object.kind === "array" && gridRows(object, view.step.heap) !== null;
  const isNew = view.changes.newObjects.has(id) && view.stepIndex > 0;
  const name = view.names.get(id);
  const size = sizeOf(object);
  const hidden = "hidden" in object && object.hidden > 0 && object.kind !== "array" ? object.hidden : 0;
  return (
    <section
      key={flashKey(isNew, view.stepIndex, id)}
      data-viz-heap={id}
      aria-label={`${kindLabel(object, isGrid)} #${id}${name ? `, ${name}` : ""}`}
      className={cn("w-fit max-w-full rounded-lg border border-slate-700/70 bg-slate-900/70 p-3", isNew && "viz-flash")}
    >
      <header className="mb-2 flex items-baseline gap-2 text-sm">
        <span className="font-medium text-slate-300">{kindLabel(object, isGrid)}</span>
        {name && <span className="font-code text-slate-400">{name}</span>}
        {size !== null && object.kind !== "array" && <span className="text-xs text-slate-400">size {size}</span>}
        <span className="font-code text-xs text-slate-600">#{id}</span>
      </header>
      <Body id={id} object={object} view={view} />
      {hidden > 0 && <p className="mt-1 text-sm text-slate-500">+{hidden} more</p>}
    </section>
  );
}
