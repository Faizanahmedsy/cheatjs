/**
 * Helpers for drawing strings as character cells and for the shaded
 * "window" between two pointers (left..right) on an array or string.
 */
import { topFrame, type Pointer } from "./analysis";
import type { TraceStep, Value } from "./types";

/** Longest string drawn as cells; longer ones stay plain text. */
export const MAX_STRING_CELLS = 40;

/** The characters of a string value, or null if it was cut short by the serializer. */
export function stringChars(value: Value): string[] | null {
  if (value.type !== "prim" || value.kind !== "string") return null;
  if (value.value.endsWith('…"')) return null;
  try {
    const text = JSON.parse(value.value) as unknown;
    return typeof text === "string" ? Array.from(text) : null;
  } catch {
    return null;
  }
}

export interface StringVar {
  name: string;
  chars: string[];
  /** Characters as they were on the previous step (same variable), for flashing. */
  before: string[] | null;
}

/** String variables of the current frame worth drawing as cells (2..40 characters). */
export function frameStrings(step: TraceStep, prev?: TraceStep): StringVar[] {
  const frame = topFrame(step);
  const prevFrame = prev?.frames.find((f) => f.id === frame.id);
  const out: StringVar[] = [];
  for (const variable of frame.vars) {
    if (variable.closure) continue;
    const chars = stringChars(variable.value);
    if (!chars || chars.length < 2 || chars.length > MAX_STRING_CELLS) continue;
    const old = prevFrame?.vars.find((v) => v.name === variable.name);
    out.push({ name: variable.name, chars, before: old ? stringChars(old.value) : null });
  }
  return out;
}

/** Pointer pairs that read as a window, most specific first. */
const PAIRS: [RegExp, RegExp][] = [
  [/^(left|l)$/, /^(right|r)$/],
  [/^(lo|low)$/, /^(hi|high)$/],
  [/^(start|windowStart|winStart)$/, /^(end|windowEnd|winEnd)$/],
  [/^(slow)$/, /^(fast)$/],
  [/Start$/, /End$/],
];

export interface WindowRange {
  from: number;
  to: number;
  label: string;
}

/** The shaded band between a left/right style pointer pair, if both sit inside the cells. */
export function windowRange(pointers: Pointer[], length: number): WindowRange | null {
  for (const [startName, endName] of PAIRS) {
    const start = pointers.find((p) => startName.test(p.name));
    const end = pointers.find((p) => endName.test(p.name));
    if (!start || !end || start.value > end.value) continue;
    const to = Math.min(end.value, length - 1);
    if (start.value >= length) continue;
    return { from: start.value, to, label: `${start.name}..${end.name}` };
  }
  return null;
}
