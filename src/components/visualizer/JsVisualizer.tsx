"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Play } from "lucide-react";
import {
  buildCallTree,
  diffSteps,
  explainStep,
  framePointers,
  heapNames,
  loopTotals,
  pointedArrays,
  timelineMarks,
  visibleHeapIds,
} from "@/lib/visualizer/analysis";
import { DEFAULT_EXAMPLE, EXAMPLES } from "@/lib/visualizer/examples";
import type { TraceSuccess } from "@/lib/visualizer/types";
import { CallTree } from "./CallTree";
import { CodeEditor } from "./CodeEditor";
import { CodeTraceView } from "./CodeTraceView";
import { ExamplePicker } from "./ExamplePicker";
import { ExplanationBar } from "./ExplanationBar";
import { Legend } from "./Legend";
import { OutputPanel } from "./OutputPanel";
import { PlaybackControls, type Speed } from "./PlaybackControls";
import { StatePanel } from "./StatePanel";
import { useTraceRunner } from "./use-trace-runner";
import type { StepView } from "./view-context";

const BASE_DELAY_MS = 900;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["TEXTAREA", "INPUT", "SELECT"].includes(target.tagName) || target.getAttribute("role") === "combobox";
}

/** Derived, per-trace data that doesn't change while stepping. */
function useTraceSummary(trace: TraceSuccess | null) {
  return useMemo(() => {
    if (!trace) return null;
    return {
      totals: loopTotals(trace.steps),
      marks: timelineMarks(trace.steps),
      tree: buildCallTree(trace.steps),
    };
  }, [trace]);
}

function TraceStage({ trace, index, summary }: { trace: TraceSuccess; index: number; summary: NonNullable<ReturnType<typeof useTraceSummary>> }) {
  const view = useMemo<StepView>(() => {
    const step = trace.steps[index];
    const prevStep = index > 0 ? trace.steps[index - 1] : undefined;
    const heapIds = visibleHeapIds(step);
    return {
      step,
      prevStep,
      stepIndex: index,
      changes: diffSteps(prevStep, step),
      boxed: new Set(heapIds),
      pointers: framePointers(step),
      pointed: pointedArrays(step),
      names: heapNames(step),
      prevNames: prevStep ? heapNames(prevStep) : new Map(),
    };
  }, [trace, index]);
  const heapIds = useMemo(() => [...view.boxed], [view.boxed]);
  const explanation = useMemo(() => explainStep(trace.steps, index), [trace, index]);
  const loop = view.step.loop;
  const loopInfo = loop ? { loop, total: summary.totals.get(loop.instance) ?? loop.iteration, partial: Boolean(trace.notice) } : undefined;

  return (
    <div className="flex flex-col gap-4">
      <ExplanationBar explanation={explanation} loopInfo={loopInfo} />
      {summary.tree.recursive && (
        <CallTree roots={summary.tree.roots} stepIndex={index} activeFrameIds={view.step.frames.slice(1).map((frame) => frame.id)} />
      )}
      <StatePanel view={view} heapIds={heapIds} />
    </div>
  );
}

export function JsVisualizer() {
  const [code, setCode] = useState(DEFAULT_EXAMPLE.code);
  const [exampleId, setExampleId] = useState(DEFAULT_EXAMPLE.id);
  const [mode, setMode] = useState<"edit" | "view">("edit");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const { state, run } = useTraceRunner();

  const trace = state.status === "done" ? state.trace : null;
  const summary = useTraceSummary(trace);
  const total = trace?.steps.length ?? 0;
  const step = trace?.steps[Math.min(index, total - 1)];
  const prevStep = trace && index > 0 ? trace.steps[index - 1] : undefined;

  const visualize = useCallback(
    async (source: string) => {
      setPlaying(false);
      const next = await run(source);
      if (next.status === "done") {
        setIndex(0);
        setMode("view");
      } else if (next.status === "failed") {
        setMode("edit");
      }
    },
    [run],
  );

  // Show something moving straight away: trace the default example on load.
  useEffect(() => {
    void visualize(DEFAULT_EXAMPLE.code);
  }, [visualize]);

  const goTo = useCallback((next: number) => setIndex(Math.max(0, Math.min(next, total - 1))), [total]);

  // Auto-play.
  useEffect(() => {
    if (!playing || mode !== "view") return;
    if (index >= total - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setIndex((i) => i + 1), BASE_DELAY_MS / speed);
    return () => window.clearTimeout(timer);
  }, [playing, index, total, speed, mode]);

  // ← / → when focus isn't in a text field.
  useEffect(() => {
    if (mode !== "view") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setPlaying(false);
        setIndex((i) => Math.min(i + 1, total - 1));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPlaying(false);
        setIndex((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, total]);

  const chooseExample = (id: string) => {
    setExampleId(id);
    const example = EXAMPLES.find((item) => item.id === id);
    if (!example) return;
    setCode(example.code);
    void visualize(example.code);
  };

  const editCode = (next: string) => {
    setCode(next);
    if (exampleId !== "custom") setExampleId("custom");
  };

  const failure = state.status === "failed" ? state.failure : null;
  const running = state.status === "running";
  const viewing = mode === "view" && trace && step && summary;

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:py-8">
      <header className="mb-6 space-y-3">
        <h1 className="font-headline text-3xl font-bold text-slate-100 md:text-4xl">JS Visualizer</h1>
        <p className="max-w-3xl text-base text-slate-400 md:text-lg">
          Watch JavaScript run one line at a time — variables, arrays, objects and the call stack. Built for dry-running
          loops, pointers, sorting and recursion.
        </p>
        <Legend />
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Left: code + playback + output */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <ExamplePicker value={exampleId} onChange={chooseExample} />
              <div className="flex gap-2 sm:ml-auto">
                {mode === "view" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPlaying(false);
                      setMode("edit");
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Edit code
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void visualize(code)}
                    disabled={running}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:opacity-60"
                  >
                    {running ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
                    {running ? "Running…" : "Visualize"}
                  </button>
                )}
              </div>
            </div>

            {viewing ? (
              <CodeTraceView
                code={code}
                nextLine={step.event === "end" ? 0 : step.line}
                doneLine={prevStep?.line ?? 0}
                isError={step.event === "exception"}
              />
            ) : (
              <CodeEditor code={code} onChange={editCode} errorLine={failure?.line} />
            )}

            {failure && mode === "edit" && (
              <div role="alert" className="mt-3 rounded-lg border border-red-500/50 bg-red-950/40 px-4 py-3 text-red-200">
                <p className="font-code text-base">{failure.message}</p>
                {failure.line !== undefined && (
                  <p className="mt-1 text-sm text-red-300/80">
                    Line {failure.line}
                    {failure.column !== undefined ? `, column ${failure.column}` : ""}
                  </p>
                )}
              </div>
            )}
          </div>

          {viewing && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
              <PlaybackControls
                index={index}
                total={total}
                onChange={(next) => {
                  setPlaying(false);
                  goTo(next);
                }}
                playing={playing}
                onTogglePlay={() => setPlaying((p) => !p)}
                speed={speed}
                onSpeedChange={setSpeed}
                marks={summary.marks}
              />
              {trace.notice && <p className="mt-3 rounded-lg bg-amber-400/10 px-3 py-2 text-sm text-amber-200">{trace.notice}</p>}
            </div>
          )}

          {viewing && <OutputPanel stdout={step.stdout} error={step.event === "exception" ? step.error : undefined} />}
        </div>

        {/* Right: explanation, call tree, frames + objects */}
        <div className="min-w-0">
          {viewing ? (
            <TraceStage trace={trace} index={Math.min(index, total - 1)} summary={summary} />
          ) : (
            <div className="flex h-full min-h-[16rem] items-center justify-center rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
              {running ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Tracing your code…
                </span>
              ) : (
                <span>
                  Press <strong className="text-slate-200">Visualize</strong> to step through the code.
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
