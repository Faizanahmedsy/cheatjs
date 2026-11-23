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
import { TraceStage, changedVarNames, type MobileTab, type TraceSummary } from "./TraceStage";
import { guessTarget, insideFunction, isKeyMoment } from "@/lib/visualizer/insights";
import { cn } from "@/lib/utils";
import { ProblemBrowser } from "./ProblemBrowser";
import { QuizCard, type QuizState } from "./QuizCard";
import { ViewOptions } from "./ViewOptions";
import { useProgress } from "./use-progress";
import { useVizOptions } from "./use-viz-options";
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
  const [options, setOptions] = useVizOptions();
  const { done, markDone } = useProgress();
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("picture");
  const quizzedAt = useRef<number>(-1);
  const touchX = useRef<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(80);
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
      setQuiz(null);
      goTo(next);
    },
    [goTo],
  );

  const steps = trace?.steps;
  const hasCalls = useMemo(() => Boolean(steps?.some(insideFunction)), [steps]);
  /** One step forward or back, hopping over top-level setup lines when that option is on. */
  const stepFrom = useCallback(
    (from: number, dir: 1 | -1) => {
      if (!steps) return from;
      let i = from + dir;
      if (options.skipSetup && hasCalls) {
        while (i > 0 && i < steps.length - 1 && !insideFunction(steps[i])) i += dir;
      }
      return Math.max(0, Math.min(i, steps.length - 1));
    },
    [steps, options.skipSetup, hasCalls],
  );

  const forward = useCallback(() => {
    if (!steps || safeIndex >= steps.length - 1) return;
    setPlaying(false);
    const target = stepFrom(safeIndex, 1);
    if (options.quiz && quizzedAt.current !== safeIndex) {
      const guess = guessTarget(steps[safeIndex], steps[target]);
      if (guess) {
        setQuiz({ from: safeIndex, to: target, name: guess.name, answer: guess.answer, line: steps[safeIndex].line, guess: "", checked: false });
        return;
      }
    }
    setQuiz(null);
    goTo(target);
  }, [steps, safeIndex, stepFrom, options.quiz, goTo]);

  const back = useCallback(() => {
    setPlaying(false);
    setQuiz(null);
    goTo(stepFrom(safeIndex, -1));
  }, [goTo, stepFrom, safeIndex]);

  /** Every control funnels through here, so ±1 moves get quiz + skip-setup behaviour. */
  const navigate = useCallback(
    (next: number) => {
      if (next === safeIndex + 1) forward();
      else if (next === safeIndex - 1) back();
      else jump(next);
    },
    [safeIndex, forward, back, jump],
  );

  // Auto-play; smart play stops on key moments.
  useEffect(() => {
    if (!playing || mode !== "view" || !steps) return;
    if (index >= total - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      const next = stepFrom(index, 1);
      setIndex(next);
      if (options.smartPlay && isKeyMoment(steps, next)) setPlaying(false);
    }, BASE_DELAY_MS / speed);
    return () => window.clearTimeout(timer);
  }, [playing, index, total, speed, mode, steps, stepFrom, options.smartPlay]);

  // ← / → when focus isn't in a text field.
  useEffect(() => {
    if (mode !== "view") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        forward();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, forward, back]);

  // Reaching the last step of a problem ticks it as done.
  useEffect(() => {
    if (problem && total > 0 && safeIndex === total - 1 && mode === "view") markDone(problem.id);
  }, [problem, total, safeIndex, mode, markDone]);

  // The sticky code column sits right under the sticky control bar, whatever its height.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const observer = new ResizeObserver(() => setBarHeight(bar.offsetHeight));
    observer.observe(bar);
    return () => observer.disconnect();
  });

  const choose = (next: Selection) => {
    const picked = findEntry(next);
    if (!picked) return;
    setQuiz(null);
    quizzedAt.current = -1;
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
              <ExamplePicker value={selection} onChange={choose} done={done} />
              <ProblemBrowser currentId={problem?.id ?? null} done={done} onPick={(id) => choose({ kind: "problem", id })} />
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
              Watch code run one line at a time, like a dry run on paper. 40 Pre-DSA warm-ups, then {PROBLEMS.length} questions in Levels 1–3.{" "}
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
          {problem && (
            <ProblemPanel problem={problem} changedNames={changedNames} beginner={beginner} done={done} onPick={(id) => choose({ kind: "problem", id })} />
          )}
        </header>

        {/* Playback sits above both columns and stays pinned under the navbar,
            so Forward / Back are always at hand while reading the code and the
            state side by side (it used to sit under the code, off screen). */}
        {viewing && (
      <div ref={barRef} className="sticky top-16 z-30 mb-4 hidden rounded-xl border border-slate-700/60 bg-slate-800/95 px-3 py-2 backdrop-blur shadow-lg shadow-slate-950/40 lg:block">
            <PlaybackControls
              index={safeIndex}
              total={total}
              onChange={navigate}
              playing={playing}
              onTogglePlay={() => {
                setQuiz(null);
                setPlaying((p) => !p);
              }}
              speed={speed}
              onSpeedChange={setSpeed}
              marks={summary.marks}
              extra={<ViewOptions options={options} onChange={setOptions} />}
            />
            {trace.notice && <p className="mt-3 rounded-lg bg-amber-400/10 px-3 py-2 text-sm text-amber-200">{trace.notice}</p>}
          </div>
        )}

        {viewing && (
          <div className="sticky top-16 z-30 -mx-4 mb-3 flex items-center gap-2 border-b border-slate-800 bg-slate-900/95 px-4 py-2 backdrop-blur lg:hidden" role="tablist" aria-label="View">
            {(
              [
                ["code", "Code"],
                ["picture", "Picture"],
                ["story", "Story"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mobileTab === key}
                onClick={() => setMobileTab(key)}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  mobileTab === key ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-300",
                )}
              >
                {label}
              </button>
            ))}
            <ViewOptions options={options} onChange={setOptions} />
          </div>
        )}

        <div
          className="grid grid-cols-1 gap-5 lg:grid-cols-2"
          style={{ ["--viz-top" as string]: `${64 + barHeight + 28}px` }}
          onTouchStart={(event) => {
            touchX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const start = touchX.current;
            touchX.current = null;
            const end = event.changedTouches[0]?.clientX;
            if (start === null || end === undefined || Math.abs(end - start) < 70 || !viewing) return;
            const order: MobileTab[] = ["code", "picture", "story"];
            const at = order.indexOf(mobileTab) + (end < start ? 1 : -1);
            if (at >= 0 && at < order.length) setMobileTab(order[at]);
          }}
        >
          {/* Left: code */}
          <div
            className={cn("flex min-w-0 flex-col gap-4 lg:sticky lg:top-[var(--viz-top)] lg:self-start", viewing && mobileTab !== "code" && "max-lg:hidden")}
          >
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-3">
              {viewing ? (
                <CodeTraceView
                  code={code}
                  nextLine={step.event === "end" ? 0 : step.line}
                  doneLine={prevStep?.line ?? 0}
                  isError={step.event === "exception"}
                  large={beginner}
                  notes={notes}
                  hideComments={options.hideComments}
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
                {quiz && (
                  <QuizCard
                    quiz={quiz}
                    onGuess={(guess) => setQuiz({ ...quiz, guess })}
                    onCheck={() => setQuiz({ ...quiz, checked: true })}
                    onContinue={() => {
                      quizzedAt.current = quiz.from;
                      setQuiz(null);
                      goTo(quiz.to);
                    }}
                  />
                )}
                <TraceStage
                  trace={trace}
                  index={safeIndex}
                  summary={summary}
                  code={code}
                  beginner={beginner}
                  onJump={navigate}
                  problem={problem}
                  mobileTab={mobileTab}
                  focus={options.focus}
                />
                <div className={cn(mobileTab !== "story" && "max-lg:hidden")}>
                  <OutputPanel stdout={step.stdout} error={step.event === "exception" ? step.error : undefined} />
                </div>
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
          <MobileControls index={safeIndex} total={total} playing={playing} onChange={navigate} onTogglePlay={() => setPlaying((p) => !p)} />
        )}
      </div>
    </TooltipProvider>
  );
}
