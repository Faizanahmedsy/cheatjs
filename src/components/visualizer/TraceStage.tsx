"use client";

import { useMemo } from "react";
import {
  diffSteps,
  explainStep,
  topFrame,
  framePointers,
  heapNames,
  pointedArrays,
  visibleHeapIds,
  type CallNode,
  type TimelineMark,
} from "@/lib/visualizer/analysis";
import { frameStrings } from "@/lib/visualizer/cells";
import { describeCheck, describeLine, lineLookups } from "@/lib/visualizer/insights";
import type { Problem } from "@/lib/visualizer/problem-types";
import { cn } from "@/lib/utils";
import { GoalBar } from "./GoalBar";
import { stepHints } from "@/lib/visualizer/explain-why";
import type { IterationIndex } from "@/lib/visualizer/iteration-table";
import type { TraceStep, TraceSuccess } from "@/lib/visualizer/types";
import { CallTree } from "./CallTree";
import { ConditionCard } from "./ConditionCard";
import { StepStory, type StoryExplanation } from "./StepStory";
import { VariableCards } from "./VariableCards";
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

export type MobileTab = "code" | "picture" | "story";

interface TraceStageProps {
  trace: TraceSuccess;
  index: number;
  summary: TraceSummary;
  code: string;
  beginner: boolean;
  onJump: (step: number) => void;
  problem: Problem | null;
  /** Phones show one tab at a time; desktop shows everything. */
  mobileTab: MobileTab;
}

/** Index of the next step after `from` where the current frame's variable `name` changes, or -1. */
function nextChange(steps: TraceSuccess["steps"], from: number, name: string): number {
  const frameName = topFrame(steps[from]).name;
  const read = (i: number) => {
    const frame = topFrame(steps[i]);
    if (frame.name !== frameName) return undefined;
    const value = frame.vars.find((v) => v.name === name)?.value;
    return value ? (value.type === "ref" ? JSON.stringify(steps[i].heap[value.id]) : value.value) : undefined;
  };
  let last = read(from);
  for (let i = from + 1; i < steps.length; i++) {
    const now = read(i);
    if (now !== undefined && now !== last) return i;
    if (now !== undefined) last = now;
  }
  return -1;
}

/** Everything on the right: what happened, the iteration table, the call tree and the state. */
export function TraceStage({ trace, index, summary, code, beginner, onJump, problem, mobileTab }: TraceStageProps) {
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
      prevPointers: prevStep && topFrame(prevStep).id === topFrame(step).id ? framePointers(prevStep) : [],
      lookups: prevStep ? lineLookups(code.split("\n")[prevStep.line - 1] ?? "", prevStep) : [],
    };
  }, [trace, index, beginner, code]);
  const heapIds = useMemo(() => [...view.boxed], [view.boxed]);
  const lines = useMemo(() => code.split("\n"), [code]);
  const explanation = useMemo<StoryExplanation>(() => {
    const base = explainStep(trace.steps, index);
    const prev = trace.steps[index - 1];
    if (!prev || base.tone === "error" || base.tone === "call" || base.tone === "return") return base;
    if (/^Line \d+: check /.test(base.title) && prev.condition) {
      const isLoop = prev.loop?.line === prev.line;
      return { ...base, title: describeCheck(prev.condition.text, prev.condition.result, isLoop), lineRef: prev.line };
    }
    if (/^Line \d+ ran/.test(base.title)) {
      const plain = describeLine(lines[prev.line - 1] ?? "", prev, trace.steps[index]);
      const finished = base.tone === "done";
      const title = plain ? (finished ? `${plain} — program finished` : plain) : finished ? "Program finished" : base.title;
      return { ...base, title, lineRef: prev.line };
    }
    return base;
  }, [trace, index, lines]);
  const hints = useMemo(() => stepHints(trace.steps, index, lines), [trace, index, lines]);
  // Beginner mode only shows the call tree for recursion; otherwise any code with calls gets it.
  const showTree = summary.tree.recursive || (!beginner && summary.tree.roots.length > 0);

  const tab = (name: MobileTab) => (mobileTab === name ? "" : "max-lg:hidden");

  return (
    <div className="flex flex-col gap-4">
      <div className={tab("picture")}>
        <GoalBar problem={problem} step={view.step} index={index} total={trace.steps.length} />
      </div>
      <div className={cn("flex flex-col gap-4 empty:hidden", tab("picture"))}>
        <StatePanel view={view} heapIds={heapIds} objectsOnly />
      </div>
      <div className={tab("story")}>
      <StepStory
        explanation={explanation}
        hints={hints}
        index={index}
        total={trace.steps.length}
        table={summary.table}
        partial={Boolean(trace.notice)}
        beginner={beginner}
        onJump={onJump}
      />
      </div>
      <div className={cn("empty:hidden", tab("story"))}>
        <ConditionCard prevStep={view.prevStep} />
      </div>
      <div className={tab("picture")}>
        <VariableCards
          view={view}
          onNextChange={(name) => {
            const at = nextChange(trace.steps, index, name);
            if (at >= 0) onJump(at);
          }}
        />
      </div>
      <div className={cn("empty:hidden", tab("story"))}>
        <IterationTable steps={trace.steps} table={summary.table} index={index} onJump={onJump} beginner={beginner} />
      </div>
      {showTree && (
        <div className={tab("story")}>
          <CallTree roots={summary.tree.roots} stepIndex={index} activeFrameIds={view.step.frames.slice(1).map((frame) => frame.id)} />
        </div>
      )}
    </div>
  );
}
