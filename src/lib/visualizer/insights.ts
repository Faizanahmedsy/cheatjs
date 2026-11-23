/**
 * Small heuristics that turn a trace step into beginner-friendly hints:
 * a plain-English title for the line that just ran, which map / set key a
 * line looked up, the answer the program is chasing, and the "key moments"
 * smart play stops on. Everything here is best effort: when a pattern is
 * not recognised the caller keeps its generic text.
 */
import { previewValue, topFrame, valueKey } from "./analysis";
import type { FrameSnapshot, HeapObject, TraceStep, Value } from "./types";

/** The code of one line without its trailing `//` comment and semicolon. */
export function stripComment(text: string): string {
  let quote: string | null = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "/" && text[i + 1] === "/") return text.slice(0, i).trimEnd();
  }
  return text.trimEnd();
}

function codeOf(line: string): string {
  return stripComment(line).trim().replace(/;$/, "").trim();
}

function findVar(frame: FrameSnapshot, name: string): Value | undefined {
  return frame.vars.find((v) => v.name === name)?.value;
}

/** Resolve a tiny expression (name, literal, a[b], a.length, a ± b) against a frame. */
export function resolveExpr(expr: string, step: TraceStep, depth = 0): Value | undefined {
  const text = expr.trim();
  if (!text || depth > 4) return undefined;
  const frame = topFrame(step);
  if (/^-?\d+(\.\d+)?$/.test(text)) return { type: "prim", kind: "number", value: text };
  if (/^(['"]).*\1$/.test(text)) return { type: "prim", kind: "string", value: `"${text.slice(1, -1)}"` };
  if (/^(true|false)$/.test(text)) return { type: "prim", kind: "boolean", value: text };
  if (/^[A-Za-z_$][\w$]*$/.test(text)) return findVar(frame, text);
  const len = /^([A-Za-z_$][\w$]*)\.length$/.exec(text);
  if (len) {
    const base = findVar(frame, len[1]);
    const object = base?.type === "ref" ? step.heap[base.id] : undefined;
    if (object?.kind === "array") return { type: "prim", kind: "number", value: String(object.items.length + object.hidden) };
    if (base?.type === "prim" && base.kind === "string") return { type: "prim", kind: "number", value: String(base.value.length - 2) };
    return undefined;
  }
  const index = /^([A-Za-z_$][\w$]*)\[(.+)\]$/.exec(text);
  if (index && !index[2].includes("]")) {
    const base = findVar(frame, index[1]);
    const at = resolveExpr(index[2], step, depth + 1);
    const object = base?.type === "ref" ? step.heap[base.id] : undefined;
    if (object?.kind === "array" && at?.type === "prim" && at.kind === "number") return object.items[Number(at.value)];
    if (base?.type === "prim" && base.kind === "string" && at?.type === "prim" && at.kind === "number") {
      const ch = base.value.slice(1, -1)[Number(at.value)];
      return ch === undefined ? undefined : { type: "prim", kind: "string", value: `"${ch}"` };
    }
    return undefined;
  }
  const math = /^(.+?)\s*([+\-*])\s*(.+)$/.exec(text);
  if (math) {
    const a = resolveExpr(math[1], step, depth + 1);
    const b = resolveExpr(math[3], step, depth + 1);
    if (a?.type === "prim" && b?.type === "prim" && a.kind === "number" && b.kind === "number") {
      const x = Number(a.value);
      const y = Number(b.value);
      const r = math[2] === "+" ? x + y : math[2] === "-" ? x - y : x * y;
      return { type: "prim", kind: "number", value: String(r) };
    }
  }
  return undefined;
}

/** Split a call's argument list on top-level commas. */
function splitArgs(args: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of args) {
    if ("([{".includes(ch)) depth++;
    if (")]}".includes(ch)) depth--;
    if (ch === "," && depth === 0) {
      out.push(current.trim());
      current = "";
    } else current += ch;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

function show(value: Value | undefined, step: TraceStep, fallback: string): string {
  return value ? previewValue(value, step) : fallback;
}

/** A plain sentence for the line that just ran, or null when it isn't recognised. */
export function describeLine(lineText: string, before: TraceStep, after: TraceStep): string | null {
  const code = codeOf(lineText);
  if (!code || /^[{}]+$/.test(code)) return null;
  const now = (name: string) => {
    const value = findVar(topFrame(after), name);
    return value ? previewValue(value, after) : null;
  };
  let m: RegExpExecArray | null;

  if ((m = /^console\.log\((.*)\)$/.exec(code))) return "Print the result on the screen";
  if ((m = /^\[(.+)\]\s*=\s*\[(.+)\]$/.exec(code))) {
    const [a, b] = splitArgs(m[1]);
    if (a && b) {
      const va = resolveExpr(a, before);
      const vb = resolveExpr(b, before);
      return `Swap ${a} and ${b}${va && vb ? ` (${previewValue(va, before)} ↔ ${previewValue(vb, before)})` : ""}`;
    }
  }
  if ((m = /^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(.+)$/.exec(code))) {
    const [, name, expr] = m;
    if (/^new Map\(\)$/.test(expr)) return `Make an empty map called ${name} (a lookup table: key → value)`;
    if (/^new Set\(\)$/.test(expr)) return `Make an empty set called ${name} (a bag of unique items)`;
    if (expr === "[]") return `Make an empty list called ${name}`;
    if (expr === "{}") return `Make an empty object called ${name}`;
    const value = now(name);
    return value ? `Make ${name} = ${value}` : `Make ${name}`;
  }
  if ((m = /^(?:const|let|var)\s+[[{]/.exec(code))) return "Unpack values into new variables";
  if ((m = /^([A-Za-z_$][\w$.[\]]*)\.set\((.+)\)$/.exec(code))) {
    const [key, value] = splitArgs(m[2]);
    return `Save ${show(resolveExpr(key ?? "", before), before, key ?? "key")} → ${show(resolveExpr(value ?? "", before), before, value ?? "value")} in ${m[1]}`;
  }
  if ((m = /^([A-Za-z_$][\w$.[\]]*)\.push\((.+)\)$/.exec(code))) return `Add ${show(resolveExpr(m[2], before), before, m[2])} to the end of ${m[1]}`;
  if ((m = /^([A-Za-z_$][\w$.[\]]*)\.unshift\((.+)\)$/.exec(code))) return `Add ${show(resolveExpr(m[2], before), before, m[2])} to the front of ${m[1]}`;
  if ((m = /^([A-Za-z_$][\w$.[\]]*)\.add\((.+)\)$/.exec(code))) return `Put ${show(resolveExpr(m[2], before), before, m[2])} into the set ${m[1]}`;
  if ((m = /^([A-Za-z_$][\w$.[\]]*)\.delete\((.+)\)$/.exec(code))) return `Remove ${show(resolveExpr(m[2], before), before, m[2])} from ${m[1]}`;
  if ((m = /^([A-Za-z_$][\w$.[\]]*)\.pop\(\)$/.exec(code))) return `Take the last item off ${m[1]}`;
  if ((m = /^([A-Za-z_$][\w$.[\]]*)\.shift\(\)$/.exec(code))) return `Take the first item off ${m[1]}`;
  if ((m = /^([A-Za-z_$][\w$]*)\+\+$|^\+\+([A-Za-z_$][\w$]*)$/.exec(code))) {
    const name = m[1] ?? m[2];
    return `Add 1 to ${name}${now(name) ? ` (now ${now(name)})` : ""}`;
  }
  if ((m = /^([A-Za-z_$][\w$]*)--$|^--([A-Za-z_$][\w$]*)$/.exec(code))) {
    const name = m[1] ?? m[2];
    return `Take 1 from ${name}${now(name) ? ` (now ${now(name)})` : ""}`;
  }
  if ((m = /^([A-Za-z_$][\w$]*)\s*([+\-*/])=\s*(.+)$/.exec(code))) {
    const [, name, op, amount] = m;
    const value = now(name);
    const verb = op === "+" ? `Add ${amount} to ${name}` : op === "-" ? `Subtract ${amount} from ${name}` : op === "*" ? `Multiply ${name} by ${amount}` : `Divide ${name} by ${amount}`;
    return `${verb}${value ? ` (now ${value})` : ""}`;
  }
  if ((m = /^([A-Za-z_$][\w$]*)\[(.+)\]\s*=\s*(.+)$/.exec(code))) {
    const at = resolveExpr(m[2], before);
    return `Write ${show(resolveExpr(m[3], before), before, m[3])} into ${m[1]}[${at ? previewValue(at, before) : m[2]}]`;
  }
  if ((m = /^([A-Za-z_$][\w$]*)\s*=\s*(.+)$/.exec(code))) {
    const value = now(m[1]);
    return value ? `${m[1]} becomes ${value}` : `Change ${m[1]}`;
  }
  if (/^(break)$/.test(code)) return "Stop the loop early (break)";
  if (/^(continue)$/.test(code)) return "Skip the rest of this pass (continue)";
  return null;
}

/** "Is x < y? Yes" style title for a condition check. */
export function describeCheck(text: string, result: boolean, isLoop: boolean): string {
  const answer = result ? "Yes" : "No";
  if (isLoop) return `Keep looping? Is ${text}? ${answer}${result ? " → run the loop body" : " → loop ends"}`;
  return `Is ${text}? ${answer}${result ? " → go inside the if" : " → skip it"}`;
}

export interface Lookup {
  heapId: number;
  /** valueKey() of the key that was looked up. */
  key: string;
  label: string;
  verb: "has" | "get" | "set" | "delete" | "add";
  found: boolean;
}

/** Map / Set lookups made by the line that just ran (`seen.has(x)`, `map.get(k)`). */
export function lineLookups(lineText: string, before: TraceStep): Lookup[] {
  const code = stripComment(lineText);
  const out: Lookup[] = [];
  const pattern = /([A-Za-z_$][\w$]*)\.(has|get|set|delete|add)\(/g;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(code))) {
    // Read the argument list up to the matching ")".
    let depth = 1;
    let i = pattern.lastIndex;
    for (; i < code.length && depth > 0; i++) {
      if (code[i] === "(") depth++;
      if (code[i] === ")") depth--;
    }
    const args = splitArgs(code.slice(pattern.lastIndex, i - 1));
    const target = findVar(topFrame(before), m[1]);
    if (!target || target.type !== "ref") continue;
    const object: HeapObject | undefined = before.heap[target.id];
    if (!object || (object.kind !== "map" && object.kind !== "set")) continue;
    const key = resolveExpr(args[0] ?? "", before);
    if (!key) continue;
    const k = valueKey(key);
    const found = object.kind === "map" ? object.entries.some((e) => valueKey(e.key) === k) : object.items.some((v) => valueKey(v) === k);
    out.push({ heapId: target.id, key: k, label: previewValue(key, before), verb: m[2] as Lookup["verb"], found });
  }
  return out;
}

/** The answer part of a problem example: "nums = [..] → [0,1]" gives "[0,1]". */
export function expectedAnswer(example: string): string | null {
  const at = example.lastIndexOf("→");
  return at === -1 ? null : example.slice(at + 1).trim();
}

/** Compare printed output loosely: ignore spaces, quotes and Map/Set wrappers. */
const norm = (text: string) =>
  text
    .replace(/\b(Map|Set)\(\d+\)/g, "")
    .replace(/=>/g, ":")
    .replace(/["'\s]/g, "")
    .toLowerCase();

/** Does the printed output contain the expected answer? */
export function answerMatches(stdout: string, expected: string): boolean {
  const printed = norm(stdout);
  return printed.length > 0 && printed.includes(norm(expected));
}

/** Steps worth stopping on during smart play. */
export function isKeyMoment(steps: TraceStep[], index: number): boolean {
  const step = steps[index];
  const prev = steps[index - 1];
  if (!step || !prev) return false;
  if (step.event === "return" || step.event === "exception" || step.event === "end") return true;
  if (step.stdout.length > prev.stdout.length) return true;
  const isLoopCheck = prev.loop?.line === prev.line;
  return Boolean(prev.condition?.result && !isLoopCheck);
}

/** True when the step runs inside a function (not the top-level setup code). */
export function insideFunction(step: TraceStep): boolean {
  return step.frames.length > 1;
}

/** First primitive variable of the next step's top frame that this step changes — the thing to guess. */
export function guessTarget(before: TraceStep, after: TraceStep): { name: string; answer: string } | null {
  const a = topFrame(before);
  const b = topFrame(after);
  if (a.id !== b.id || after.event !== "step") return null;
  for (const variable of b.vars) {
    if (variable.closure || variable.value.type !== "prim") continue;
    if (variable.value.kind === "uninitialized" || variable.value.kind === "undefined") continue;
    const old = a.vars.find((v) => v.name === variable.name)?.value;
    if (!old || old.type !== "prim" || old.value !== variable.value.value) return { name: variable.name, answer: variable.value.value };
  }
  return null;
}

export function sameAnswer(guess: string, answer: string): boolean {
  return norm(guess).replace(/^"|"$/g, "") === norm(answer).replace(/^"|"$/g, "");
}

// ---------------------------------------------------------------- growth

type Growth = { label: string; f: (n: number) => number };

const GROWTHS: { test: RegExp; g: Growth }[] = [
  { test: /2\^n|2ⁿ/, g: { label: "O(2ⁿ)", f: (n) => 2 ** Math.min(n, 60) } },
  { test: /n\s*!/, g: { label: "O(n!)", f: (n) => (n > 20 ? Infinity : Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a * b, 1)) } },
  { test: /n\s*(\^|\*\*)\s*3|n³/, g: { label: "O(n³)", f: (n) => n ** 3 } },
  { test: /n\s*(\^|\*\*)\s*2|n²|n\s*[·*×]\s*n/, g: { label: "O(n²)", f: (n) => n * n } },
  { test: /n\s*log/, g: { label: "O(n log n)", f: (n) => n * Math.log2(n) } },
  { test: /log/, g: { label: "O(log n)", f: (n) => Math.log2(n) } },
  { test: /\b(n|m|k|v|e)\b|[nmvek]\s*\+|·|\*/, g: { label: "O(n)", f: (n) => n } },
  { test: /1/, g: { label: "O(1)", f: () => 1 } },
];

export function parseGrowth(time: string): Growth | null {
  const inner = time.replace(/^O\(|\)$/g, "");
  return GROWTHS.find(({ test }) => test.test(inner))?.g ?? null;
}

export const PAIR_CHECK: Growth = { label: "O(n²)", f: (n) => n * n };
export const TRY_ALL: Growth = { label: "O(2ⁿ)", f: (n) => 2 ** Math.min(n, 60) };

export interface WorkedOut {
  name: string;
  /** The right-hand side as written, e.g. "target - nums[i]". */
  expr: string;
  /** The same with values filled in, e.g. "26 - 7". */
  filled: string;
  /** The new value, e.g. "19". */
  result: string;
}

const NOT_A_VALUE = new Set(["Math", "true", "false", "null", "undefined", "new", "typeof", "Infinity", "NaN"]);

/** For an assignment line, the sum worked out with real values: need = target - nums[i] = 26 - 7 = 19. */
export function workedOut(lineText: string, before: TraceStep, after: TraceStep): WorkedOut | null {
  const code = codeOf(lineText);
  const m = /^(?:const\s+|let\s+|var\s+)?([A-Za-z_$][\w$]*)\s*([+\-*/%]?)=\s*([^=].*)$/.exec(code);
  if (!m) return null;
  const [, name, op, rhs] = m;
  const expr = op ? `${name} ${op} ${rhs.trim()}` : rhs.trim();
  if (/^-?\d+(\.\d+)?$|^(['"]).*\2$|^\[\]$|^\{\}$|^new\s/.test(expr)) return null;
  let replaced = 0;
  const filled = expr.replace(/[A-Za-z_$][\w$]*(?:\.length|\[[^\]\[]+\])?/g, (token, offset: number, all: string) => {
    const before1 = all[offset - 1];
    const after1 = all[offset + token.length];
    if (before1 === "." || after1 === "(" || after1 === "." || NOT_A_VALUE.has(token)) return token;
    const value = resolveExpr(token, before);
    if (!value || value.type !== "prim") return token;
    replaced++;
    return value.value;
  });
  if (replaced === 0) return null;
  const now = findVar(topFrame(after), name);
  if (!now) return null;
  const result = previewValue(now, after);
  if (filled.trim() === result.trim()) return { name, expr, filled: "", result };
  return { name, expr, filled, result };
}
