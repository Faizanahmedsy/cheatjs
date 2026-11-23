/**
 * "What did the line that just ran change?" as short name / was / now notes,
 * shown right beside that line in the code view (like a debugger's inline values).
 */
import { diffSteps, heapNames, previewValue, valueKey } from "./analysis";
import type { HeapObject, TraceStep, Value } from "./types";

export interface InlineNote {
  name: string;
  /** Absent when the variable or cell is new. */
  was?: string;
  now: string;
}

const MAX_NOTES = 4;

function cellValue(object: HeapObject, key: string): Value | undefined {
  switch (object.kind) {
    case "array":
      return object.items[Number(key)];
    case "object":
      return object.entries.find((entry) => entry.key === key)?.value;
    case "map":
      return object.entries.find((entry) => valueKey(entry.key) === key)?.value;
    case "set":
      return object.items.find((item) => valueKey(item) === key);
    default:
      return undefined;
  }
}

function cellName(base: string, object: HeapObject, key: string): string {
  if (object.kind === "object") return `${base}.${key}`;
  if (object.kind === "set") return `${base} has ${key}`;
  return `${base}[${key}]`;
}

export function inlineNotes(prev: TraceStep | undefined, step: TraceStep): InlineNote[] {
  if (!prev) return [];
  const changes = diffSteps(prev, step);
  const names = heapNames(step);
  const prevNames = heapNames(prev);
  const notes: InlineNote[] = [];

  for (const [key, old] of changes.vars) {
    const frameId = Number(key.slice(0, key.indexOf(":")));
    const name = key.slice(key.indexOf(":") + 1);
    const frame = step.frames.find((candidate) => candidate.id === frameId);
    const value = frame?.vars.find((variable) => variable.name === name)?.value;
    if (!value) continue;
    // A function declaration being hoisted is not news for a learner.
    if (value.type === "ref" && step.heap[value.id]?.kind === "function") continue;
    notes.push({
      name,
      was: old ? previewValue(old, prev, prevNames, 1) : undefined,
      now: previewValue(value, step, names, 1),
    });
  }

  for (const [id, cells] of changes.cells) {
    const object = step.heap[id];
    if (!object) continue;
    const base = names.get(id) ?? "object";
    for (const [cell, old] of cells) {
      const value = cellValue(object, cell);
      if (!value) continue;
      notes.push({
        name: cellName(base, object, cell),
        was: old ? previewValue(old, prev, prevNames, 1) : undefined,
        now: previewValue(value, step, names, 1),
      });
    }
  }
  return notes.slice(0, MAX_NOTES);
}
