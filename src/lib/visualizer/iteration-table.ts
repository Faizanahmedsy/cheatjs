/**
 * The "Iteration table": a paper-style dry-run table built from a trace.
 *
 * Steps are grouped by (frame, loop line). Each pass of the loop is one row:
 * for `for` / `while` loops a row starts at the condition check, so the last
 * row is the check that came out false and ended the loop. A frame with no
 * loop gets one row per step instead.
 */
import { previewValue, topFrame } from "./analysis";
import type { HeapObject, TraceStep, Value } from "./types";

export interface TableRow {
  /** Step indexes in this row, ascending (an inner loop's steps belong to its own table). */
  steps: number[];
  /** Loop instance the row belongs to — a new instance means the loop restarted. */
  instance: number;
  /** "1", "2", … or "end" for the check that stopped the loop; step number in step mode. */
  label: string;
}

export interface IterationGroup {
  key: string;
  frameId: number;
  frameName: string;
  mode: "loop" | "steps";
  loopLine?: number;
  loopKind?: string;
  rows: TableRow[];
}

export interface IterationIndex {
  groups: Map<string, IterationGroup>;
  /** Per step: the group to show and the row it falls in (-1 when frozen). */
  at: { key: string; row: number }[];
}

const MAX_STEP_ROWS = 80;

function startsWithCheck(kind: string): boolean {
  return kind === "for" || kind === "while";
}

export function indexIterations(steps: TraceStep[]): IterationIndex {
  const groups = new Map<string, IterationGroup>();
  const at: IterationIndex["at"] = [];
  const lastLoopKey = new Map<number, string>();

  const group = (key: string, init: () => IterationGroup) => {
    let found = groups.get(key);
    if (!found) {
      found = init();
      groups.set(key, found);
    }
    return found;
  };

  steps.forEach((step, index) => {
    // The program-finished step keeps showing the table the learner was just looking at.
    if (step.event === "end" && at.length > 0) {
      at.push({ key: at[at.length - 1].key, row: -1 });
      return;
    }
    const frame = topFrame(step);
    const loop = step.event === "call" ? undefined : step.loop;
    if (loop) {
      const key = `${frame.id}:${loop.line}`;
      const g = group(key, () => ({ key, frameId: frame.id, frameName: frame.name, mode: "loop", loopLine: loop.line, loopKind: loop.kind, rows: [] }));
      const last = g.rows[g.rows.length - 1];
      const check = Boolean(step.condition) && step.line === loop.line && step.event === "step";
      const isNewRow =
        !last ||
        last.instance !== loop.instance ||
        (startsWithCheck(loop.kind) ? check : Number(last.label) !== loop.iteration && loop.iteration > 0);
      if (isNewRow) {
        const label = startsWithCheck(loop.kind)
          ? check && step.condition && !step.condition.result
            ? "end"
            : String(loop.iteration + 1)
          : String(Math.max(loop.iteration, 1));
        g.rows.push({ steps: [index], instance: loop.instance, label });
      } else {
        last.steps.push(index);
      }
      lastLoopKey.set(frame.id, key);
      at.push({ key, row: g.rows.length - 1 });
      return;
    }
    const frozen = lastLoopKey.get(frame.id);
    if (frozen && step.event !== "call") {
      at.push({ key: frozen, row: -1 });
      return;
    }
    const key = `${frame.id}:steps`;
    const g = group(key, () => ({ key, frameId: frame.id, frameName: frame.name, mode: "steps", rows: [] }));
    g.rows.push({ steps: [index], instance: 0, label: String(index + 1) });
    at.push({ key, row: g.rows.length - 1 });
  });

  for (const g of groups.values()) {
    if (g.mode === "steps" && g.rows.length > MAX_STEP_ROWS) g.rows = g.rows.slice(-MAX_STEP_ROWS);
  }
  return { groups, at };
}

// ---------------------------------------------------------------- cell text

function clip(text: string, max = 28): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** Compact text for a table cell: maps and sets by content, not just their size. */
export function cellText(value: Value, step: TraceStep): string {
  if (value.type === "prim") return value.value;
  const object: HeapObject | undefined = step.heap[value.id];
  if (!object) return "…";
  const inner = (v: Value) => (v.type === "prim" ? v.value : previewValue(v, step, undefined, 1));
  switch (object.kind) {
    case "map":
      return clip(`{${object.entries.map((e) => `${inner(e.key)}→${inner(e.value)}`).join(", ")}${object.hidden ? ", …" : ""}}`);
    case "set":
      return clip(`{${object.items.map(inner).join(", ")}${object.hidden ? ", …" : ""}}`);
    case "object":
      if (!object.className) return clip(`{${object.entries.map((e) => `${e.key}: ${inner(e.value)}`).join(", ")}}`);
      return clip(previewValue(value, step));
    default:
      return clip(previewValue(value, step));
  }
}

// ---------------------------------------------------------------- columns & values

function frameVars(step: TraceStep, frameId: number) {
  return step.frames.find((frame) => frame.id === frameId)?.vars ?? [];
}

function usable(value: Value, step: TraceStep): boolean {
  if (value.type === "prim") return value.kind !== "uninitialized";
  return step.heap[value.id]?.kind !== "function";
}

/** Every variable name seen in the group's frame, in first-seen order. */
export function candidateColumns(steps: TraceStep[], group: IterationGroup, upTo: number): string[] {
  const names: string[] = [];
  for (const row of group.rows) {
    for (const index of row.steps) {
      if (index > upTo) break;
      for (const variable of frameVars(steps[index], group.frameId)) {
        if (variable.closure || variable.name === "this" || names.includes(variable.name)) continue;
        if (usable(variable.value, steps[index])) names.push(variable.name);
      }
    }
  }
  return names;
}

/**
 * A row's value for a variable: what it was when the pass started; a
 * variable that only exists inside the body shows what the pass set it to.
 */
export function rowValue(steps: TraceStep[], group: IterationGroup, row: TableRow, name: string, upTo: number): string {
  const first = steps[row.steps[0]];
  const atStart = frameVars(first, group.frameId).find((v) => v.name === name);
  if (atStart && usable(atStart.value, first)) return cellText(atStart.value, first);
  let text = "";
  for (const index of row.steps) {
    if (index > upTo) break;
    const found = frameVars(steps[index], group.frameId).find((v) => v.name === name);
    if (found && usable(found.value, steps[index])) text = cellText(found.value, steps[index]);
  }
  return text;
}

/** Columns that change from row to row (the interesting ones), capped at `max`. */
export function autoColumns(steps: TraceStep[], group: IterationGroup, upTo: number, max = 6): string[] {
  const candidates = candidateColumns(steps, group, upTo);
  const rows = visibleRows(group, upTo);
  const changing = candidates.filter((name) => {
    const seen = new Set(rows.map((row) => rowValue(steps, group, row, name, upTo)).filter(Boolean));
    return seen.size > 1;
  });
  return (changing.length > 0 ? changing : candidates).slice(0, max);
}

export function visibleRows(group: IterationGroup, upTo: number): TableRow[] {
  return group.rows.filter((row) => row.steps[0] <= upTo);
}

/** Lines that ran in the row so far, e.g. "3 → 4 → 6". */
export function rowLines(steps: TraceStep[], row: TableRow, upTo: number): string {
  const lines: number[] = [];
  for (const index of row.steps) {
    if (index > upTo) break;
    const line = steps[index].line;
    if (lines[lines.length - 1] !== line) lines.push(line);
  }
  return lines.length > 6 ? `${lines.slice(0, 5).join(" → ")} → …` : lines.join(" → ");
}
