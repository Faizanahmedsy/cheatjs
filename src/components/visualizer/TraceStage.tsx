"use client";

import { useMemo } from "react";
import {
  diffSteps,
  explainStep,
  framePointers,
  heapNames,
  pointedArrays,
  visibleHeapIds,
  type CallNode,
  type TimelineMark,
} from "@/lib/visualizer/analysis";
import { frameStrings } from "@/lib/visualizer/cells";
import { stepHints } from "@/lib/visualizer/explain-why";
import type { IterationIndex } from "@/lib/visualizer/iteration-table";
import type { TraceStep, TraceSuccess } from "@/lib/visualizer/types";
import { CallTree } from "./CallTree";
import { ExplanationBar } from "./ExplanationBar";
import { IterationTable } from "./IterationTable";
import { StatePanel } from "./StatePanel";
import type { StepView } from "./view-context";

export interface TraceSummary {
  totals: Map<number, number>;
  marks: TimelineMark[];
  tree: { roots: CallNode[]; recursive: boolean };
  table: IterationIndex;
}

/** Names of the current frame's variables (and their objects) that changed on this step. */
export function changedVarNames(prev: TraceStep | undefined, step: TraceStep): Set<string> {
  const names = new Set<string>();
  if (!prev) return names;
  const changes = diffSteps(prev, step);
  for (const key of changes.vars.keys()) names.add(key.slice(key.indexOf(":") + 1));
  const heap = heapNames(step);
  for (const id of changes.cells.keys()) {
    const name = heap.get(id);
    if (name) names.add(name.split(/[.[]/)[0]);
  }
  return names;
}

interface TraceStageProps {
  trace: TraceSuccess;
  index: number;
  summary: TraceSummary;
  code: string;
  beginner: boolean;
  onJump: (step: number) => void;
}

/** Everything on the right: what happened, the iteration table, the call tree and the state. */
export function TraceStage({ trace, index, summary, code, beginner, onJump }: TraceStageProps) {
  const view = useMemo<StepView>(() => {
    const step = trace.steps[index];
    const prevStep = index > 0 ? trace.steps[index - 1] : undefined;
    return {
      step,
      prevStep,
      stepIndex: index,
      changes: diffSteps(prevStep, step),
      boxed: new Set(visibleHeapIds(step)),
      pointers: framePointers(step),
      pointed: pointedArrays(step),
      names: heapNames(step),
      prevNames: prevStep ? heapNames(prevStep) : new Map(),
      strings: frameStrings(step, prevStep),
      beginner,
    };
  }, [trace, index, beginner]);
  const heapIds = useMemo(() => [...view.boxed], [view.boxed]);
  const lines = useMemo(() => code.split("\n"), [code]);
  const explanation = useMemo(() => explainStep(trace.steps, index), [trace, index]);
  const hints = useMemo(() => stepHints(trace.steps, index, lines), [trace, index, lines]);
  const loop = view.step.loop;
  const loopInfo = loop ? { loop, total: summary.totals.get(loop.instance) ?? loop.iteration, partial: Boolean(trace.notice) } : undefined;
  // Beginner mode only shows the call tree for recursion; otherwise any code with calls gets it.
  const showTree = summary.tree.recursive || (!beginner && summary.tree.roots.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <ExplanationBar explanation={explanation} loopInfo={loopInfo} hints={hints} beginner={beginner} />
      <StatePanel view={view} heapIds={heapIds} />
      <IterationTable steps={trace.steps} table={summary.table} index={index} onJump={onJump} beginner={beginner} />
      {showTree && (
        <CallTree roots={summary.tree.roots} stepIndex={index} activeFrameIds={view.step.frames.slice(1).map((frame) => frame.id)} />
      )}
    </div>
  );
}
