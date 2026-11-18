"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MotionConfig, useReducedMotion } from "framer-motion";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ArrowLeft, Moon, Network, Search, Sun, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_SCENARIO, SCENARIOS } from "./scenarios";
import type { Scenario } from "./engine/types";
import { IsoScene, stepDurationMs } from "./engine/IsoScene";
import { LabThemeContext, type LabTheme } from "./engine/RichText";
import { TopicList } from "./parts/TopicList";
import { SequenceView } from "./parts/SequenceView";
import { TracePanel } from "./parts/TracePanel";
import { RightPanel, type PanelTab } from "./parts/RightPanel";
import { CommandPalette, type PaletteTarget } from "./parts/CommandPalette";

const THEME_KEY = "ai-lab-theme";

function readTheme(): LabTheme {
  try {
    return window.localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

/** Loaded scenario modules, kept for the session so switching back is instant. */
const cache = new Map<string, Scenario>();

export async function loadScenario(id: string): Promise<Scenario | null> {
  const hit = cache.get(id);
  if (hit) return hit;
  const meta = SCENARIOS.find((s) => s.id === id);
  if (!meta) return null;
  const mod = await meta.load();
  cache.set(id, mod.default);
  return mod.default;
}

export function VisualLab() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const topicId = SCENARIOS.some((s) => s.id === params.get("topic")) ? params.get("topic")! : DEFAULT_SCENARIO;
  const meta = SCENARIOS.find((s) => s.id === topicId)!;

  const [scenario, setScenario] = useState<Scenario | null>(() => cache.get(topicId) ?? null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [run, setRun] = useState(0);
  const [view, setView] = useState<"scene" | "sequence">("scene");
  const [tab, setTab] = useState<PanelTab>("overview");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [theme, setTheme] = useState<LabTheme>("dark");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pendingStep = useRef<number | null>(null);

  const reduced = useReducedMotion() ?? false;
  const animate = !reduced;

  useEffect(() => setTheme(readTheme()), []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode: theme just won't persist */
    }
  };

  // Load the topic's module whenever the topic changes.
  useEffect(() => {
    let live = true;
    setPlaying(false);
    setScenario(cache.get(topicId) ?? null);
    loadScenario(topicId).then((s) => {
      if (!live || !s) return;
      setScenario(s);
      const target = pendingStep.current;
      pendingStep.current = null;
      if (target !== null) {
        setStepIndex(target);
        setTab("step");
      } else {
        setStepIndex(-1);
      }
      setRun((r) => r + 1);
    });
    return () => {
      live = false;
    };
  }, [topicId]);

  const steps = scenario?.steps ?? [];
  const step = stepIndex >= 0 ? steps[stepIndex] ?? null : null;

  const goTo = useCallback(
    (i: number) => {
      if (!scenario) return;
      const clamped = Math.max(-1, Math.min(scenario.steps.length - 1, i));
      setStepIndex(clamped);
      setRun((r) => r + 1);
      if (clamped >= 0) setTab((t) => (t === "overview" ? "step" : t));
    },
    [scenario],
  );

  const selectTopic = useCallback(
    (id: string, stepTo?: number) => {
      if (id === topicId) {
        if (stepTo !== undefined) {
          setPlaying(false);
          goTo(stepTo);
          setTab("step");
        }
        return;
      }
      pendingStep.current = stepTo ?? null;
      setTab(stepTo !== undefined ? "step" : "overview");
      setOpenQuestion(null);
      router.replace(`${pathname}?topic=${id}`, { scroll: false });
    },
    [goTo, pathname, router, topicId],
  );

  // Auto-advance while playing.
  useEffect(() => {
    if (!playing || !scenario) return;
    const ms = stepIndex < 0 ? 250 : stepDurationMs(step ?? undefined) / speed;
    const t = window.setTimeout(() => {
      if (stepIndex >= scenario.steps.length - 1) setPlaying(false);
      else goTo(stepIndex + 1);
    }, ms);
    return () => window.clearTimeout(t);
  }, [playing, stepIndex, speed, scenario, step, goTo, run]);

  const play = useCallback(() => {
    if (reduced || !scenario) return;
    if (stepIndex >= scenario.steps.length - 1) goTo(0);
    setPlaying(true);
    setTab((t) => (t === "overview" ? "step" : t));
  }, [goTo, reduced, scenario, stepIndex]);
  const pause = useCallback(() => setPlaying(false), []);
  const next = useCallback(() => {
    setPlaying(false);
    goTo(stepIndex + 1);
  }, [goTo, stepIndex]);
  const prev = useCallback(() => {
    setPlaying(false);
    goTo(stepIndex - 1);
  }, [goTo, stepIndex]);
  const reset = useCallback(() => {
    setPlaying(false);
    setStepIndex(-1);
    setRun((r) => r + 1);
    setTab("overview");
  }, []);

  // Keyboard: space play/pause, → step, ← back, R reset, Ctrl/⌘K search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (paletteOpen || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el?.isContentEditable) return;
      if (e.key === " ") {
        // Let a focused button or link handle its own Space press.
        if (tag === "BUTTON" || tag === "A" || el?.getAttribute("role") === "button") return;
        e.preventDefault();
        if (playing) pause();
        else play();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "r" || e.key === "R") {
        reset();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, pause, play, playing, prev, reset, paletteOpen]);

  const onPalettePick = (t: PaletteTarget) => {
    setPaletteOpen(false);
    if (t.kind === "topic") selectTopic(t.topic);
    else if (t.kind === "step") selectTopic(t.topic, t.step);
    else if (t.kind === "question") {
      if (t.topic !== topicId) {
        pendingStep.current = null;
        router.replace(`${pathname}?topic=${t.topic}`, { scroll: false });
      }
      setTab("interview");
      setOpenQuestion(t.id);
    }
  };

  const runKey = `${topicId}-${stepIndex}-${run}`;
  const stepLabel = useMemo(() => (step ? `${String(stepIndex + 1).padStart(2, "0")} / ${String(steps.length).padStart(2, "0")}` : "OVERVIEW"), [step, stepIndex, steps.length]);

  return (
    <LabThemeContext.Provider value={theme}>
      <TooltipPrimitive.Provider delayDuration={150}>
        <MotionConfig reducedMotion="user">
          <div data-theme={theme} className="ai-lab flex min-h-[calc(100dvh-3.5rem)] flex-col bg-lab-bg font-labmono text-lab-text lg:h-[calc(100dvh-3.5rem)] lg:min-h-0">
            {/* top bar */}
            <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-lab-border bg-lab-panel px-4 py-2">
              <Link href="/ai-engineering" className="flex items-center gap-1 text-[11px] text-lab-muted hover:text-lab-text">
                <ArrowLeft className="h-3.5 w-3.5" /> AI Engineering
              </Link>
              <div className="flex min-w-0 items-center gap-2 text-[12px]">
                <span className="font-bold tracking-[0.2em] text-lab-accent">AI VISUAL LAB</span>
                <span className="text-lab-muted">/</span>
                <span className="truncate">
                  {String(meta.num).padStart(2, "0")} {meta.title}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex overflow-hidden rounded-md border border-lab-border text-[11px]" role="tablist" aria-label="View">
                  {(
                    [
                      ["scene", "Network", Network],
                      ["sequence", "Sequence", Workflow],
                    ] as const
                  ).map(([v, label, Icon]) => (
                    <button
                      key={v}
                      role="tab"
                      aria-selected={view === v}
                      onClick={() => setView(v)}
                      className={cn("flex items-center gap-1.5 px-2.5 py-1.5 uppercase tracking-wider", view === v ? "bg-lab-raised text-lab-accent" : "text-lab-muted hover:text-lab-text")}
                    >
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPaletteOpen(true)}
                  className="flex items-center gap-2 rounded-md border border-lab-border px-2.5 py-1.5 text-[11px] text-lab-muted hover:text-lab-text"
                  aria-label="Search topics, steps, questions and terms"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Search</span>
                  <kbd className="hidden rounded border border-lab-border px-1 text-[10px] sm:inline">Ctrl K</kbd>
                </button>
                <button onClick={toggleTheme} className="rounded-md border border-lab-border p-1.5 text-lab-muted hover:text-lab-text" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
                  {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                </button>
              </div>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)_minmax(340px,390px)]">
              <TopicList activeId={topicId} scenario={scenario} stepIndex={stepIndex} onTopic={(id) => selectTopic(id)} onStep={(i) => selectTopic(topicId, i)} />

              <section className="flex min-h-0 min-w-0 flex-col border-lab-border lg:border-x">
                <div className="relative h-[52vh] min-h-[300px] bg-lab-scene lg:h-auto lg:min-h-[240px] lg:flex-1">
                  <div className="pointer-events-none absolute left-3 top-2 z-10 max-w-[70%] text-[10px] uppercase tracking-[0.16em] text-lab-muted">
                    <span className="text-lab-accent">{stepLabel}</span>
                    {step && <span className="ml-2 normal-case tracking-normal text-lab-text">{step.title}</span>}
                  </div>
                  {reduced && (
                    <div className="absolute right-3 top-2 z-10 rounded border border-lab-border bg-lab-panel px-2 py-0.5 text-[10px] text-lab-muted">reduced motion: step mode</div>
                  )}
                  {!scenario ? (
                    <div className="grid h-full place-items-center text-xs text-lab-muted">loading {meta.title.toLowerCase()}…</div>
                  ) : view === "scene" ? (
                    <div className="h-full p-2 pt-6">
                      <IsoScene scenario={scenario} step={step} runKey={runKey} animate={animate} speed={speed} />
                    </div>
                  ) : (
                    <SequenceView scenario={scenario} stepIndex={stepIndex} onStep={(i) => selectTopic(topicId, i)} />
                  )}
                </div>
                <TracePanel
                  scenario={scenario}
                  stepIndex={stepIndex}
                  playing={playing}
                  reduced={reduced}
                  speed={speed}
                  onSpeed={setSpeed}
                  onPlay={play}
                  onPause={pause}
                  onNext={next}
                  onPrev={prev}
                  onReset={reset}
                />
              </section>

              <RightPanel
                scenario={scenario}
                stepIndex={stepIndex}
                tab={tab}
                onTab={setTab}
                onPrev={prev}
                onNext={next}
                openQuestion={openQuestion}
                onOpenQuestion={setOpenQuestion}
              />
            </div>

            {paletteOpen && <CommandPalette theme={theme} onClose={() => setPaletteOpen(false)} onPick={onPalettePick} />}
          </div>
        </MotionConfig>
      </TooltipPrimitive.Provider>
    </LabThemeContext.Provider>
  );
}
