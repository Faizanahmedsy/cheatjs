/**
 * Beginner-level "why" and "what happens next" lines that sit under the
 * one-line step explanation. Kept apart from analysis.ts so each stays small.
 */
import { diffSteps, framePointers, heapNames, topFrame } from "./analysis";
import type { TraceStep, Value } from "./types";

export interface StepHints {
  /** Why the step went the way it did, in plain words. */
  why?: string;
  /** The line that runs next, described in plain words. */
  next?: string;
}

const HAS_CALL = /\.has\(|\bin\s+\w|\.includes\(|\.get\(|hasOwnProperty\(/;

function lineText(lines: string[], line: number): string {
  return (lines[line - 1] ?? "").trim();
}

function asNumber(value: Value | null | undefined): number | null {
  if (!value || value.type !== "prim" || value.kind !== "number") return null;
  return Number(value.value);
}

function conditionWhy(prev: TraceStep, text: string): string {
  const condition = prev.condition!;
  const isLoopCheck = prev.loop?.line === prev.line && condition.text !== "";
  const lookup = HAS_CALL.test(condition.text);
  if (isLoopCheck) {
    if (prev.loop?.kind === "do-while") {
      return condition.result ? "The condition is true, so the loop body runs again." : "The condition is false, so the loop ends here.";
    }
    const pass = (prev.loop?.iteration ?? 0) + 1;
    return condition.result
      ? `The loop condition is true, so we go into the loop body (pass ${pass}).`
      : "The loop condition is false, so the loop ends and the code after it runs.";
  }
  const negated = /^\s*!/.test(condition.text);
  if (lookup) {
    // `!map.has(x)` true means "not found".
    const found = negated ? !condition.result : condition.result;
    const seen = found ? "It is already stored — we have seen it before" : "It is not stored yet — not seen before";
    return `${seen}, so the condition is ${condition.result} and we ${condition.result ? "enter the if block" : "skip the if block"}.`;
  }
  const isElseIf = /^\}?\s*else\s+if\b/.test(text);
  if (condition.result) return `The condition is true, so we enter ${isElseIf ? "this else-if" : "the if"} block.`;
  return "The condition is false, so we skip that block (and go to the else part if there is one).";
}

function changeWhy(prev: TraceStep, step: TraceStep): string | undefined {
  const changes = diffSteps(prev, step);
  const names = heapNames(step);
  for (const [id, cells] of changes.cells) {
    const object = step.heap[id];
    const name = names.get(id) ?? "the object";
    if (object.kind === "map" || (object.kind === "object" && !object.className)) {
      const added = [...cells.values()].some((old) => old === null);
      return added
        ? `A new key is stored in ${name}, so later we can look it up instantly.`
        : `A key already in ${name} gets a new value.`;
    }
    if (object.kind === "set") return `A new value is added to the set ${name} — sets keep each value once.`;
  }
  if (changes.moves.size > 0) return "Two cells traded places.";
  const frame = topFrame(step);
  const pointers = new Set(framePointers(step).map((p) => p.name));
  for (const variable of frame.vars) {
    const key = `${frame.id}:${variable.name}`;
    if (!changes.vars.has(key)) continue;
    const before = asNumber(changes.vars.get(key));
    const after = asNumber(variable.value);
    if (before === null || after === null) continue;
    const delta = after - before;
    if (pointers.has(variable.name) && Math.abs(delta) === 1) {
      return `${variable.name} moves one place ${delta > 0 ? "right" : "left"} (to index ${after}).`;
    }
    if (pointers.has(variable.name)) return `${variable.name} jumps to index ${after}.`;
  }
  return undefined;
}

/** Plain words for a line of code that is about to run. */
function stripComment(text: string): string {
  let quote: string | null = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "/" && text[i + 1] === "/") return text.slice(0, i);
  }
  return text;
}

export function describeLine(text: string): string {
  const t = stripComment(text).trim().replace(/;$/, "").trim();
  let m: RegExpMatchArray | null;
  if ((m = t.match(/^(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:function\b|\(.*\)\s*=>|\w+\s*=>))/))) return `start running ${m[1] ?? m[2]}`;
  if ((m = t.match(/^(?:\}\s*)?else\s+if\s*\((.*)\)\s*\{?$/))) return `check ${m[1]}`;
  if ((m = t.match(/^if\s*\((.*)\)\s*\{?$/))) return `check whether ${m[1]}`;
  if ((m = t.match(/^while\s*\((.*)\)\s*\{?$/))) return `check the loop condition ${m[1]}`;
  if ((m = t.match(/^for\s*\((?:const|let|var)\s+(\w+)\s+of\s+(.*)\)\s*\{?$/))) return `take the next item of ${m[2]} as ${m[1]}`;
  if ((m = t.match(/^for\s*\((?:const|let|var)\s+(\w+)\s+in\s+(.*)\)\s*\{?$/))) return `take the next key of ${m[2]} as ${m[1]}`;
  if ((m = t.match(/^for\s*\(.*;(.*);.*\)\s*\{?$/))) return `check the loop condition${m[1].trim() ? ` ${m[1].trim()}` : ""}`;
  if ((m = t.match(/^return\s*(.*)$/))) return m[1] ? `return ${m[1]} — hand the answer back` : "return — leave the function";
  if ((m = t.match(/^(?:const|let|var)\s+\[(.*)\]\s*=\s*(.*)$/))) return `unpack ${m[2]} into ${m[1]}`;
  if ((m = t.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(.*)$/))) return `create ${m[1]} = ${m[2]}`;
  if ((m = t.match(/^(?:const|let|var)\s+(\w+)$/))) return `declare ${m[1]}`;
  if ((m = t.match(/^console\.log\((.*)\)$/))) return `print ${m[1]}`;
  if ((m = t.match(/^(\w+)\+\+$|^\+\+(\w+)$/))) return `add 1 to ${m[1] ?? m[2]}`;
  if ((m = t.match(/^(\w+)--$|^--(\w+)$/))) return `subtract 1 from ${m[1] ?? m[2]}`;
  if ((m = t.match(/^([\w.[\]]+)\s*([+\-*/])=\s*(.*)$/))) return `update ${m[1]} ${m[2]}= ${m[3]}`;
  if ((m = t.match(/^(\w+)\.set\((.*)\)$/))) return `store ${m[2]} in ${m[1]}`;
  if ((m = t.match(/^(\w+)\.add\((.*)\)$/))) return `add ${m[2]} to ${m[1]}`;
  if ((m = t.match(/^(\w+)\.push\((.*)\)$/))) return `push ${m[2]} onto the end of ${m[1]}`;
  if ((m = t.match(/^(\w+)\.pop\(\)$/))) return `remove the last item of ${m[1]}`;
  if ((m = t.match(/^(\w+)\.delete\((.*)\)$/))) return `remove ${m[2]} from ${m[1]}`;
  if ((m = t.match(/^\[(.*)\]\s*=\s*\[(.*)\]$/))) return `swap ${m[1]}`;
  if ((m = t.match(/^([\w.[\]]+)\s*=\s*(.*)$/))) return `set ${m[1]} = ${m[2]}`;
  if (/^break$/.test(t)) return "break — leave the loop now";
  if (/^continue$/.test(t)) return "continue — skip to the next pass";
  return t.length > 60 ? `${t.slice(0, 59)}…` : t;
}

/** Why the last step went the way it did, and what runs next. */
export function stepHints(steps: TraceStep[], index: number, lines: string[]): StepHints {
  const step = steps[index];
  const prev = index > 0 ? steps[index - 1] : undefined;
  const hints: StepHints = {};
  if (step.event !== "end" && step.event !== "exception") {
    const text = lineText(lines, step.line);
    if (text && step.event !== "return") hints.next = describeLine(text);
  }
  if (step.event === "call") {
    hints.why = "The program jumps into the function. A new frame (a box for its own variables) is created.";
    return hints;
  }
  if (step.event === "return") {
    hints.why = "The function is done: it hands this value back to whoever called it, and its frame goes away.";
    return hints;
  }
  if (step.event === "exception") {
    hints.why = "Something went wrong on this line, so the program stops here.";
    return hints;
  }
  if (!prev) return hints;
  if (prev.event === "return") {
    hints.why = "We are back where the function was called, and the returned value is used here.";
    return hints;
  }
  if (prev.condition && prev.condition.text) hints.why = conditionWhy(prev, lineText(lines, prev.line));
  else if (step.event !== "end") hints.why = changeWhy(prev, step);
  if (step.event === "end") hints.why = "There are no more lines to run, so the program has finished.";
  return hints;
}
