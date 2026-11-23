/** The one-line plain story for a step (shared by the normal view and Focus mode). */
import { explainStep, type Explanation } from "./analysis";
import { describeCheck, describeLine } from "./insights";
import type { TraceStep } from "./types";

export type Story = Explanation & { lineRef?: number };

export function storyFor(steps: TraceStep[], index: number, lines: string[]): Story {
  const base = explainStep(steps, index);
  const prev = steps[index - 1];
  if (!prev || base.tone === "error" || base.tone === "call" || base.tone === "return") return base;
  if (/^Line \d+: check /.test(base.title) && prev.condition) {
    const isLoop = prev.loop?.line === prev.line;
    return { ...base, title: describeCheck(prev.condition.text, prev.condition.result, isLoop), lineRef: prev.line };
  }
  if (/^Line \d+ ran/.test(base.title)) {
    const plain = describeLine(lines[prev.line - 1] ?? "", prev, steps[index]);
    const finished = base.tone === "done";
    const title = plain ? (finished ? `${plain} — program finished` : plain) : finished ? "Program finished" : base.title;
    return { ...base, title, lineRef: prev.line };
  }
  return base;
}
