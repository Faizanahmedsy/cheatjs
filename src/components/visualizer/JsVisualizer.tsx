"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GraduationCap, Loader2, MousePointerClick, Pencil, Play, Search, Footprints } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { TooltipProvider } from "@/components/ui/tooltip";
import { buildCallTree, loopTotals, timelineMarks } from "@/lib/visualizer/analysis";
import {
  DEFAULT_ENTRY,
  DEFAULT_SELECTION,
  findEntry,
  PROBLEMS,
  selectionFromSearch,
  urlForSelection,
  type Selection,
} from "@/lib/visualizer/catalog";
import { indexIterations } from "@/lib/visualizer/iteration-table";
import { inlineNotes } from "@/lib/visualizer/inline-notes";
import type { TraceSuccess } from "@/lib/visualizer/types";
import { CodeEditor } from "./CodeEditor";
import { CodeTraceView } from "./CodeTraceView";
import { ExamplePicker } from "./ExamplePicker";
import { Legend } from "./Legend";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MobileControls } from "./MobileControls";
import { OutputPanel } from "./OutputPanel";
import { PlaybackControls, type Speed } from "./PlaybackControls";
import { ProblemPanel } from "./ProblemPanel";
import { TraceStage, changedVarNames, type TraceSummary } from "./TraceStage";
import { useBeginnerMode } from "./use-beginner-mode";
import { useTraceRunner } from "./use-trace-runner";

const BASE_DELAY_MS = 900;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["TEXTAREA", "INPUT", "SELECT"].includes(target.tagName) || target.getAttribute("role") === "combobox";
}

/** Derived, per-trace data that doesn't change while stepping. */
function useTraceSummary(trace: TraceSuccess | null): TraceSummary | null {
  return useMemo(() => {
    if (!trace) return null;
    return {
      totals: loopTotals(trace.steps),
      marks: timelineMarks(trace.steps),
      tree: buildCallTree(trace.steps),
      table: indexIterations(trace.steps),
    };
  }, [trace]);
}

export function JsVisualizer() {
  const [code, setCode] = useState(DEFAULT_ENTRY.code);
  const [selection, setSelection] = useState<Selection>(DEFAULT_SELECTION);
  const [mode, setMode] = useState<"edit" | "view">("edit");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [beginner, setBeginner] = useBeginnerMode();
  const { state, run } = useTraceRunner();
  // ?step=7 in the URL: reopen on the same step after a refresh or a shared link.
  const startStep = useRef<number | null>(null);

  const trace = state.status === "done" ? state.trace : null;
  const summary = useTraceSummary(trace);
  const total = trace?.steps.length ?? 0;
  const safeIndex = Math.min(index, Math.max(total - 1, 0));
  const step = trace?.steps[safeIndex];
  const prevStep = trace && safeIndex > 0 ? trace.steps[safeIndex - 1] : undefined;
  const entry = selection.kind === "custom" ? null : findEntry(selection);
  const problem = entry?.kind === "problem" ? entry.problem : null;

  const visualize = useCallback(
    async (source: string) => {
      setPlaying(false);
      const next = await run(source);
      if (next.status === "done") {
        const wanted = startStep.current;
        startStep.current = null;
        setIndex(wanted !== null ? Math.max(0, Math.min(wanted, next.trace.steps.length - 1)) : 0);
        setMode("view");
      } else if (next.status === "failed") {
        setMode("edit");
      }
    },
    [run],
  );

  // On load: open the problem / example named in the URL (default: problem 1) and run it straight away.
  useEffect(() => {
    const stepParam = Number.parseInt(new URLSearchParams(window.location.search).get("step") ?? "", 10);
    startStep.current = Number.isFinite(stepParam) && stepParam >= 1 ? stepParam - 1 : null;
    const fromUrl = selectionFromSearch(window.location.search);
    const start = fromUrl ? findEntry(fromUrl) : null;
    if (fromUrl && start) {
      setSelection(fromUrl);
      setCode(start.code);
      void visualize(start.code);
    } else {
      void visualize(DEFAULT_ENTRY.code);
    }
  }, [visualize]);

  const goTo = useCallback((next: number) => setIndex(Math.max(0, Math.min(next, total - 1))), [total]);
  const jump = useCallback(
    (next: number) => {
      setPlaying(false);
      goTo(next);
    },
    [goTo],
  );

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

  const choose = (next: Selection) => {
    const picked = findEntry(next);
    if (!picked) return;
    setSelection(next);
    setCode(picked.code);
    window.history.replaceState(window.history.state, "", urlForSelection(window.location.href, next));
    void visualize(picked.code);
  };

  const editCode = (next: string) => {
    setCode(next);
    if (selection.kind !== "custom") {
      setSelection({ kind: "custom" });
      window.history.replaceState(window.history.state, "", urlForSelection(window.location.href, { kind: "custom" }));
    }
  };

  const notes = useMemo(() => (step ? inlineNotes(prevStep, step) : []), [prevStep, step]);
  const changedNames = useMemo(() => (step ? changedVarNames(prevStep, step) : new Set<string>()), [prevStep, step]);

  const failure = state.status === "failed" ? state.failure : null;
  const running = state.status === "running";
  const viewing = mode === "view" && trace && step && summary;

  // Keep ?step= in the URL while stepping (no new history entry).
  useEffect(() => {
    if (!viewing) return;
    const url = new URL(window.location.href);
    if (safeIndex > 0) url.searchParams.set("step", String(safeIndex + 1));
    else url.searchParams.delete("step");
    const next = `${url.pathname}${url.search}${url.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, "", next);
    }
  }, [viewing, safeIndex]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className={viewing ? "mx-auto w-full max-w-[1500px] px-4 pb-24 pt-6 sm:px-6 lg:py-8" : "mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:py-8"}>
        <header className="mb-4 space-y-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <h1 className="font-headline text-2xl font-bold text-slate-100 md:text-3xl">DSA Visualizer</h1>
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center lg:max-w-2xl">
              <ExamplePicker value={selection} onChange={choose} />
              {mode === "view" ? (
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    setMode("edit");
                  }}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Edit code
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void visualize(code)}
                  disabled={running}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:opacity-60"
                >
                  {running ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
                  {running ? "Running…" : "Visualize"}
                </button>
              )}
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-200 sm:ml-auto">
              <GraduationCap className="h-4 w-4 text-cyan-300" aria-hidden="true" />
              Big text and tips
              <Switch checked={beginner} onCheckedChange={setBeginner} aria-label="Big text and tips" />
            </label>
          </div>
          <Collapsible>
            <p className="text-sm text-slate-400">
              Watch code run one line at a time, like a dry run on paper. {PROBLEMS.length} questions ready.{" "}
              <CollapsibleTrigger className="font-medium text-cyan-300 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                How to read this screen?
              </CollapsibleTrigger>
            </p>
            <CollapsibleContent className="mt-3 space-y-3">
              <ol className="grid gap-3 sm:grid-cols-3" aria-label="How to use">
                {[
                  { icon: Search, title: "1. Read the question", text: "The box at the top says what the code must find." },
                  { icon: Footprints, title: "2. Press Next step", text: "The code moves one line. Red arrow = runs next. Green = just ran." },
                  { icon: MousePointerClick, title: "3. Look at the picture", text: "Boxes show the data, arrows show where i / j point. Glowing = just changed." },
                ].map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-800/40 p-3">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" aria-hidden="true" />
                    <span>
                      <span className="block font-semibold text-slate-100">{title}</span>
                      <span className="text-sm text-slate-400">{text}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <Legend />
            </CollapsibleContent>
          </Collapsible>
          {problem && <ProblemPanel problem={problem} changedNames={changedNames} beginner={beginner} />}
        </header>

        {/* Playback sits above both columns and stays pinned under the navbar,
            so Forward / Back are always at hand while reading the code and the
            state side by side (it used to sit under the code, off screen). */}
        {viewing && (
      <div className="sticky top-16 z-30 mb-4 hidden rounded-xl border border-slate-700/60 bg-slate-800/95 px-3 py-2 backdrop-blur shadow-lg shadow-slate-950/40 lg:block">
            <PlaybackControls
              index={safeIndex}
              total={total}
              onChange={jump}
              playing={playing}
              onTogglePlay={() => setPlaying((p) => !p)}
              speed={speed}
              onSpeedChange={setSpeed}
              marks={summary.marks}
            />
            {trace.notice && <p className="mt-3 rounded-lg bg-amber-400/10 px-3 py-2 text-sm text-amber-200">{trace.notice}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Left: code, problem, output */}
          <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-[9.75rem] lg:self-start">
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-3">
              {viewing ? (
                <CodeTraceView
                  code={code}
                  nextLine={step.event === "end" ? 0 : step.line}
                  doneLine={prevStep?.line ?? 0}
                  isError={step.event === "exception"}
                  large={beginner}
                  notes={notes}
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

          </div>

          {/* Right: explanation, iteration table, call tree, frames + objects */}
          <div className="min-w-0">
            {viewing ? (
              <div className="flex flex-col gap-4">
                <TraceStage trace={trace} index={safeIndex} summary={summary} code={code} beginner={beginner} onJump={jump} />
                <OutputPanel stdout={step.stdout} error={step.event === "exception" ? step.error : undefined} />
              </div>
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

        {viewing && (
          <MobileControls index={safeIndex} total={total} playing={playing} onChange={jump} onTogglePlay={() => setPlaying((p) => !p)} />
        )}
      </div>
    </TooltipProvider>
  );
}
