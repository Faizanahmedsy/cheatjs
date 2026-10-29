/**
 * Pure helpers that read a finished trace and derive what the UI highlights:
 * what changed, which variables point into which array, the plain-English
 * explanation of a step, loop totals and the recursion call tree.
 */
import type { ArrayObject, FrameSnapshot, HeapObject, TraceStep, Value } from "./types";

// ---------------------------------------------------------------- values

export function valueKey(value: Value): string {
  return value.type === "ref" ? `ref:${value.id}` : `${value.kind}:${value.value}`;
}

export function sameValue(a: Value, b: Value): boolean {
  return valueKey(a) === valueKey(b);
}

export function topFrame(step: TraceStep): FrameSnapshot {
  return step.frames[step.frames.length - 1];
}

/** Variable names that make sense as array indexes. */
const POINTER_NAME =
  /^(i|j|k|l|r|p|q|m|c|x|y|idx|index|left|right|lo|hi|low|high|mid|start|end|slow|fast|front|rear|head|tail|top|row|col|cur|curr|pos|ptr)$|(Idx|Index|Ptr|Pointer)$/;
const ROW_NAME = /^(i|r|row|y|rowIdx|rowIndex)$/;
const COL_NAME = /^(j|c|col|x|colIdx|colIndex|column)$/;

/** Fixed pointer palette — order matters: first pointer in a frame gets the first colour. */
export const POINTER_COLORS = [
  { text: "text-sky-300", bg: "bg-sky-400", soft: "bg-sky-400/15", ring: "ring-sky-400", border: "border-sky-400" },
  { text: "text-fuchsia-300", bg: "bg-fuchsia-400", soft: "bg-fuchsia-400/15", ring: "ring-fuchsia-400", border: "border-fuchsia-400" },
  { text: "text-lime-300", bg: "bg-lime-400", soft: "bg-lime-400/15", ring: "ring-lime-400", border: "border-lime-400" },
  { text: "text-orange-300", bg: "bg-orange-400", soft: "bg-orange-400/15", ring: "ring-orange-400", border: "border-orange-400" },
  { text: "text-violet-300", bg: "bg-violet-400", soft: "bg-violet-400/15", ring: "ring-violet-400", border: "border-violet-400" },
  { text: "text-rose-300", bg: "bg-rose-400", soft: "bg-rose-400/15", ring: "ring-rose-400", border: "border-rose-400" },
] as const;

export type PointerColor = (typeof POINTER_COLORS)[number];

export interface Pointer {
  name: string;
  value: number;
  color: PointerColor;
  /** Hints for 2D arrays. */
  axis: "row" | "col" | "any";
}

function asIndex(value: Value): number | null {
  if (value.type !== "prim" || value.kind !== "number") return null;
  const n = Number(value.value);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

/** Integer variables of the current frame whose names read like indexes. */
export function framePointers(step: TraceStep): Pointer[] {
  const pointers: Pointer[] = [];
  for (const variable of topFrame(step).vars) {
    if (variable.closure || !POINTER_NAME.test(variable.name)) continue;
    const index = asIndex(variable.value);
    if (index === null) continue;
    const axis = ROW_NAME.test(variable.name) ? "row" : COL_NAME.test(variable.name) ? "col" : "any";
    pointers.push({ name: variable.name, value: index, color: POINTER_COLORS[pointers.length % POINTER_COLORS.length], axis });
  }
  return pointers;
}

/** Arrays the current frame refers to directly — the ones pointers are drawn under. */
export function pointedArrays(step: TraceStep): Set<number> {
  const ids = new Set<number>();
  for (const variable of topFrame(step).vars) {
    if (variable.value.type === "ref" && step.heap[variable.value.id]?.kind === "array") ids.add(variable.value.id);
  }
  return ids;
}

// ---------------------------------------------------------------- 2D arrays

/** An array of arrays of primitives — drawn as a grid. Returns the row ids. */
export function gridRows(object: HeapObject, heap: Record<number, HeapObject>): ArrayObject[] | null {
  if (object.kind !== "array" || object.items.length === 0 || object.hidden > 0) return null;
  const rows: ArrayObject[] = [];
  for (const item of object.items) {
    if (item.type !== "ref") return null;
    const row = heap[item.id];
    if (!row || row.kind !== "array" || row.items.some((cell) => cell.type === "ref")) return null;
    rows.push(row);
  }
  return rows;
}

function referencesTo(step: TraceStep, includeFrames: boolean): Map<number, number> {
  const counts = new Map<number, number>();
  const bump = (value: Value) => {
    if (value.type === "ref") counts.set(value.id, (counts.get(value.id) ?? 0) + 1);
  };
  if (includeFrames) {
    for (const frame of step.frames) {
      frame.vars.forEach((v) => bump(v.value));
      if (frame.returnValue) bump(frame.returnValue);
    }
  }
  for (const object of Object.values(step.heap)) {
    if (object.kind === "array" || object.kind === "set") object.items.forEach(bump);
    else if (object.kind === "object") object.entries.forEach((e) => bump(e.value));
    else if (object.kind === "map") object.entries.forEach((e) => (bump(e.key), bump(e.value)));
  }
  return counts;
}

/**
 * Heap objects drawn as boxes, in stable id order. Grid rows only referenced
 * by their grid are folded into it, and functions only referenced by
 * variables are shown inline in the frame instead (less arrow clutter).
 */
export function visibleHeapIds(step: TraceStep): number[] {
  const all = referencesTo(step, true);
  const fromHeap = referencesTo(step, false);
  const hidden = new Set<number>();
  for (const [key, object] of Object.entries(step.heap)) {
    if (object.kind === "function" && !fromHeap.has(Number(key))) hidden.add(Number(key));
    if (object.kind !== "array" || !gridRows(object, step.heap)) continue;
    for (const item of object.items) if (item.type === "ref" && all.get(item.id) === 1) hidden.add(item.id);
  }
  return Object.keys(step.heap)
    .map(Number)
    .filter((id) => !hidden.has(id))
    .sort((a, b) => a - b);
}

// ---------------------------------------------------------------- what changed

export interface StepChanges {
  /** `${frameId}:${name}` → previous value (null when the variable is new). */
  vars: Map<string, Value | null>;
  /** heap id → cell key (index or property) → previous value (null when new). */
  cells: Map<number, Map<string, Value | null>>;
  /** heap id → index → index the value slid in from. */
  moves: Map<number, Map<number, number>>;
  newObjects: Set<number>;
  returnValues: Set<number>;
}

function cellMap(object: HeapObject): Map<string, Value> | null {
  switch (object.kind) {
    case "array":
      return new Map(object.items.map((item, index) => [String(index), item]));
    case "object":
      return new Map(object.entries.map((entry) => [entry.key, entry.value]));
    case "map":
      return new Map(object.entries.map((entry) => [valueKey(entry.key), entry.value]));
    case "set":
      return new Map(object.items.map((item) => [valueKey(item), item]));
    default:
      return null;
  }
}

function detectMoves(before: ArrayObject, after: ArrayObject, changed: Map<string, Value | null>): Map<number, number> {
  const moves = new Map<number, number>();
  if (before.items.length !== after.items.length) return moves;
  for (const key of changed.keys()) {
    const to = Number(key);
    const wanted = valueKey(after.items[to]);
    let best: number | null = null;
    before.items.forEach((item, from) => {
      if (from === to || valueKey(item) !== wanted) return;
      const better = best === null || Math.abs(from - to) < Math.abs(best - to) || (changed.has(String(from)) && !changed.has(String(best)));
      if (better) best = from;
    });
    if (best !== null) moves.set(to, best);
  }
  return moves;
}

export function diffSteps(prev: TraceStep | undefined, cur: TraceStep): StepChanges {
  const changes: StepChanges = { vars: new Map(), cells: new Map(), moves: new Map(), newObjects: new Set(), returnValues: new Set() };
  if (!prev) return changes;

  const prevFrames = new Map(prev.frames.map((frame) => [frame.id, frame]));
  for (const frame of cur.frames) {
    const before = prevFrames.get(frame.id);
    if (!before) continue; // a brand-new frame: the whole frame is the news
    const beforeVars = new Map(before.vars.map((v) => [v.name, v.value]));
    for (const variable of frame.vars) {
      const old = beforeVars.get(variable.name);
      if (old === undefined) changes.vars.set(`${frame.id}:${variable.name}`, null);
      else if (!sameValue(old, variable.value)) changes.vars.set(`${frame.id}:${variable.name}`, old);
    }
    if (frame.returnValue && !before.returnValue) changes.returnValues.add(frame.id);
  }

  for (const [key, object] of Object.entries(cur.heap)) {
    const id = Number(key);
    const before = prev.heap[id];
    if (!before) {
      changes.newObjects.add(id);
      continue;
    }
    const afterCells = cellMap(object);
    const beforeCells = cellMap(before);
    if (!afterCells || !beforeCells) continue;
    const changed = new Map<string, Value | null>();
    for (const [cell, value] of afterCells) {
      const old = beforeCells.get(cell);
      if (old === undefined) changed.set(cell, null);
      else if (!sameValue(old, value)) changed.set(cell, old);
    }
    if (changed.size === 0) continue;
    changes.cells.set(id, changed);
    if (object.kind === "array" && before.kind === "array") {
      const moves = detectMoves(before, object, changed);
      if (moves.size > 0) changes.moves.set(id, moves);
    }
  }
  return changes;
}

// ---------------------------------------------------------------- naming & previews

/** Best human name for each heap object: the variable that points at it. */
export function heapNames(step: TraceStep): Map<number, string> {
  const names = new Map<number, string>();
  // Current frame wins; within a frame the latest-declared name wins (curr over head).
  const frames = [...step.frames].reverse();
  for (const frame of frames) {
    for (const variable of [...frame.vars].reverse()) {
      if (variable.value.type === "ref" && !names.has(variable.value.id) && variable.name !== "this") {
        names.set(variable.value.id, variable.name);
      }
    }
  }
  const self = topFrame(step).vars.find((v) => v.name === "this");
  if (self?.value.type === "ref" && !names.has(self.value.id)) names.set(self.value.id, "this");
  // One level deeper: grid rows and object fields, e.g. grid[1] or node.next.
  for (const [id, name] of [...names]) {
    const object = step.heap[id];
    if (object?.kind === "array") {
      object.items.forEach((item, index) => {
        if (item.type === "ref" && !names.has(item.id)) names.set(item.id, `${name}[${index}]`);
      });
    } else if (object?.kind === "object") {
      for (const entry of object.entries) {
        if (entry.value.type === "ref" && !names.has(entry.value.id)) names.set(entry.value.id, `${name}.${entry.key}`);
      }
    }
  }
  return names;
}

/**
 * Short text for a value. The top level is shown by content (`[5, 3, 8]`,
 * `Node {value: 1, next: …}`); nested objects use their variable name if known.
 */
export function previewValue(value: Value, step: TraceStep, names?: Map<number, string>, depth = 0): string {
  if (value.type === "prim") return value.value;
  const object = step.heap[value.id];
  if (!object) return `#${value.id}`;
  const nested = depth > 0;
  const named = names?.get(value.id);
  switch (object.kind) {
    case "array": {
      if (nested) return named ?? "[…]";
      const items = object.items.slice(0, 8).map((item) => previewValue(item, step, names, depth + 1));
      return `[${items.join(", ")}${object.items.length > 8 || object.hidden ? ", …" : ""}]`;
    }
    case "object": {
      const prefix = object.className ? `${object.className} ` : "";
      if (nested) return named ?? `${prefix}{…}`;
      const entries = object.entries.slice(0, 3).map((e) => `${e.key}: ${previewValue(e.value, step, names, depth + 1)}`);
      return `${prefix}{${entries.join(", ")}${object.entries.length > 3 || object.hidden ? ", …" : ""}}`;
    }
    case "function":
      return object.isClass ? `class ${object.name}` : `${object.name}()`;
    case "map":
      return (nested && named) || `Map(${object.entries.length + object.hidden})`;
    case "set":
      return (nested && named) || `Set(${object.items.length + object.hidden})`;
    case "other":
      return object.label;
  }
}

// ---------------------------------------------------------------- explanations

export interface Explanation {
  tone: "info" | "call" | "return" | "error" | "done";
  title: string;
  details: string[];
}

function callArguments(frame: FrameSnapshot, step: TraceStep, names: Map<number, string>): string {
  return frame.vars
    .filter((v) => !v.closure && v.name !== "this")
    .map((v) => (v.value.type === "ref" && names.has(v.value.id) ? (names.get(v.value.id) as string) : previewValue(v.value, step, names)))
    .join(", ");
}

function cellLabel(objectName: string, object: HeapObject, key: string): string {
  if (object.kind === "array") return `${objectName}[${key}]`;
  if (object.kind === "object") return `${objectName}.${key}`;
  return `${objectName} entry`;
}

/** Plain-English description of what happened to get from step i-1 to step i. */
export function explainStep(steps: TraceStep[], index: number): Explanation {
  const step = steps[index];
  const prev = index > 0 ? steps[index - 1] : undefined;
  const names = heapNames(step);
  const frame = topFrame(step);

  if (step.event === "exception") {
    return { tone: "error", title: `Error on line ${step.line}`, details: [step.error ?? "Uncaught error"] };
  }
  if (step.event === "call") {
    const prevNames = prev ? heapNames(prev) : names;
    const args = callArguments(frame, step, new Map([...prevNames, ...names]));
    return { tone: "call", title: `Call ${frame.name}(${args})`, details: [`A new frame for ${frame.name} is pushed on the stack.`] };
  }
  if (step.event === "return" && frame.returnValue) {
    return {
      tone: "return",
      title: `${frame.name} returns ${previewValue(frame.returnValue, step, names)}`,
      details: [`Line ${step.line}: the frame is about to be removed from the stack.`],
    };
  }
  if (!prev) {
    return { tone: "info", title: "Program starts", details: [`Line ${step.line} runs next. Press Forward (→) to step.`] };
  }

  if (prev.event === "call" && step.event !== "end") {
    const prevFrame = topFrame(prev);
    const params = prevFrame.vars.filter((v) => !v.closure && v.name !== "this");
    return {
      tone: "info",
      title: `Inside ${prevFrame.name}`,
      details: params.length
        ? [`Parameters: ${params.map((v) => `${v.name} = ${previewValue(v.value, prev, heapNames(prev))}`).join(", ")}`]
        : ["No parameters."],
    };
  }
  if (prev.event === "return" && step.event !== "end") {
    const done = topFrame(prev);
    const value = done.returnValue ? previewValue(done.returnValue, prev) : "undefined";
    return { tone: "return", title: `Back in ${frame.name === "Global frame" ? "the global code" : frame.name}`, details: [`${done.name} gave back ${value}.`] };
  }

  const details: string[] = [];
  const condition = prev.condition;
  let title = step.event === "end" ? `Line ${prev.line} ran — program finished` : `Line ${prev.line} ran`;
  if (condition) {
    const verdict = condition.result ? "true" : "false";
    const side = (text: string, shown: string) => (text === shown ? text : `${text} (${shown})`);
    const comparisons = condition.comparisons
      .filter((c) => c.leftText !== c.left || c.rightText !== c.right)
      .map((c) => `${side(c.leftText, c.left)} ${c.op} ${side(c.rightText, c.right)} → ${c.result}`);
    title = `Line ${prev.line}: check ${condition.text} → ${verdict}`;
    details.push(...comparisons);
    if (prev.loop && prev.loop.line === prev.line) {
      details.push(condition.result ? "Condition holds, so the loop body runs." : "Condition fails, so the loop ends.");
    }
  }

  const changes = diffSteps(prev, step);
  const prevNames = heapNames(prev);
  const describe = (value: Value | null, from: TraceStep, nameMap: Map<number, string>) =>
    value ? previewValue(value, from, nameMap) : "";

  // Swaps first: two cells that traded values.
  const reported = new Set<string>();
  for (const [id, moves] of changes.moves) {
    const objectName = names.get(id) ?? `#${id}`;
    for (const [to, from] of moves) {
      if (moves.get(from) === to && to < from) {
        details.push(`swap ${objectName}[${to}] ↔ ${objectName}[${from}]`);
        reported.add(`${id}:${to}`);
        reported.add(`${id}:${from}`);
      }
    }
  }
  for (const [id, cells] of changes.cells) {
    const object = step.heap[id];
    const objectName = names.get(id) ?? `#${id}`;
    for (const [key, old] of cells) {
      if (reported.has(`${id}:${key}`)) continue;
      const value = cellValue(object, key);
      if (!value) continue;
      const label = cellLabel(objectName, object, key);
      const now = previewValue(value, step, names);
      details.push(old ? `${label} = ${now} (was ${describe(old, prev, prevNames)})` : `${label} = ${now} (new)`);
    }
  }
  for (const variable of frame.vars) {
    const key = `${frame.id}:${variable.name}`;
    if (!changes.vars.has(key)) continue;
    const old = changes.vars.get(key) ?? null;
    const now = previewValue(variable.value, step, names);
    details.push(old ? `${variable.name} changes ${describe(old, prev, prevNames)} → ${now}` : `${variable.name} = ${now}`);
  }
  for (const id of changes.newObjects) {
    const object = step.heap[id];
    if (object.kind === "function") continue;
    if (!details.some((d) => d.includes(`#${id}`))) {
      const name = names.get(id);
      if (!name) details.push(`new ${object.kind} created`);
    }
  }
  if (step.stdout.length > prev.stdout.length) {
    const printed = step.stdout.slice(prev.stdout.length).trimEnd();
    details.push(`prints: ${printed.length > 60 ? `${printed.slice(0, 59)}…` : printed}`);
  }
  if (step.event === "end") return { tone: "done", title, details };
  if (details.length === 0 && !condition) details.push("Nothing visible changed.");
  return { tone: "info", title, details };
}

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

// ---------------------------------------------------------------- loops & timeline

/** Highest pass number each loop instance reached over the whole trace. */
export function loopTotals(steps: TraceStep[]): Map<number, number> {
  const totals = new Map<number, number>();
  for (const step of steps) {
    if (step.loop) totals.set(step.loop.instance, Math.max(totals.get(step.loop.instance) ?? 0, step.loop.iteration));
  }
  return totals;
}

export type TimelineMark = { index: number; kind: "call" | "iteration" | "error" };

export function timelineMarks(steps: TraceStep[]): TimelineMark[] {
  const marks: TimelineMark[] = [];
  steps.forEach((step, index) => {
    if (step.event === "call") marks.push({ index, kind: "call" });
    else if (step.event === "exception") marks.push({ index, kind: "error" });
    else {
      const before = steps[index - 1]?.loop;
      if (step.loop && step.loop.iteration > 0 && (!before || before.instance !== step.loop.instance || before.iteration !== step.loop.iteration)) {
        marks.push({ index, kind: "iteration" });
      }
    }
  });
  return marks;
}

// ---------------------------------------------------------------- recursion call tree

export interface CallNode {
  frameId: number;
  name: string;
  args: string;
  parentId: number | null;
  children: CallNode[];
  startStep: number;
  /** Step where it returned / threw; undefined while still running at the trace end. */
  endStep?: number;
  result?: string;
}

/** Calls in the order they happened. Only built when some function calls itself. */
export function buildCallTree(steps: TraceStep[]): { roots: CallNode[]; recursive: boolean } {
  const nodes = new Map<number, CallNode>();
  const roots: CallNode[] = [];
  let recursive = false;
  steps.forEach((step, index) => {
    const frame = topFrame(step);
    if (step.event === "call") {
      const parent = step.frames.length > 2 ? step.frames[step.frames.length - 2] : null;
      const node: CallNode = {
        frameId: frame.id,
        name: frame.name,
        args: callArguments(frame, step, heapNames(step)),
        parentId: parent?.id ?? null,
        children: [],
        startStep: index,
      };
      nodes.set(frame.id, node);
      const parentNode = parent ? nodes.get(parent.id) : undefined;
      if (parentNode) {
        parentNode.children.push(node);
        for (let up: CallNode | undefined = parentNode; up; up = up.parentId ? nodes.get(up.parentId) : undefined) {
          if (up.name === node.name) recursive = true;
        }
      } else {
        roots.push(node);
      }
    } else if (step.event === "return" || step.event === "exception") {
      const node = nodes.get(frame.id);
      if (node && node.endStep === undefined) {
        node.endStep = index;
        node.result = step.event === "return" && frame.returnValue ? previewValue(frame.returnValue, step) : "error";
      }
    }
  });
  return { roots, recursive };
}
