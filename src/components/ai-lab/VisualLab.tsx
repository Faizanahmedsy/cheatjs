"use client";

import "@fontsource/baloo-2/700.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MotionConfig, useReducedMotion } from "framer-motion";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Eye, GraduationCap, ListChecks, RotateCcw, SkipForward, X, Headphones, Maximize2, Network, PanelLeftClose, PanelLeftOpen, Play, Search, Sparkles, Square, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import { setReadingFocus, useReadingFocus } from "@/lib/reading-focus";
import { DEFAULT_SCENARIO, SCENARIOS } from "./scenarios";
import type { Scenario } from "./engine/types";
import { IsoScene, stepDurationMs } from "./engine/IsoScene";
import { LabThemeContext, RichText, type LabTheme } from "./engine/RichText";
import { LabModeContext, readMode, saveMode, type LabMode } from "./engine/mode";
import { toneFill, toneVar } from "./engine/tones";
import { canSpeak, narrationFor, rankVoices, readVoiceName, sampleVoice, saveVoiceName, speak, stopSpeaking } from "./engine/narrator";
import { StageView, stageDurationMs } from "./stages/StageView";
import { TopicList } from "./parts/TopicList";
import { SequenceView } from "./parts/SequenceView";
import { TracePanel } from "./parts/TracePanel";
import { RightPanel, StepProgress, type PanelTab } from "./parts/RightPanel";
import { CommandPalette, type PaletteTarget } from "./parts/CommandPalette";

/** The lab follows the site's dark / white mode (set on <html data-mode>). */
function readTheme(): LabTheme {
  return document.documentElement.dataset.mode === "light" ? "light" : "dark";
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

type CentreView = "visual" | "scene" | "sequence";

/** Before step 1: the "Imagine…" card and one big Start button over the topic's map. */
function StartOverlay({ s, onStart, onPlay, reduced }: { s: Scenario; onStart: () => void; onPlay: () => void; reduced: boolean }) {
  return (
    <div className="absolute inset-0 z-20 flex overflow-y-auto p-3 sm:p-6" style={{ background: "color-mix(in srgb, var(--lab-scene) 84%, transparent)", backdropFilter: "blur(3px)" }}>
      <div className="m-auto w-full max-w-lg rounded-3xl bg-lab-panel p-5 shadow-2xl sm:p-7">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-lab-accent">
          <Sparkles className="h-3.5 w-3.5" /> {s.title}
        </p>
        <RichText text={s.imagine ?? s.overview.plain ?? s.tagline} className="font-body text-[15px] leading-relaxed text-lab-text sm:text-[16px]" />
        <button
          onClick={onStart}
          autoFocus
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#e5603a] px-4 py-3 text-[15px] font-medium text-white shadow-lg transition hover:bg-[#c2532f]"
        >
          <Play className="h-5 w-5" /> Start
        </button>
        <p className="mt-2.5 text-center font-body text-[12px] text-lab-muted">
          {s.steps.length} short steps. Go at your own pace with Next, or{" "}
          {reduced ? (
            "use Next to step through."
          ) : (
            <button onClick={onPlay} className="font-semibold underline decoration-dotted underline-offset-4 hover:text-lab-text">
              play them all
            </button>
          )}
          {reduced ? "" : "."}
        </p>
      </div>
    </div>
  );
}

const PANEL_TABS: PanelTab[] = ["overview", "step", "interview", "quiz"];
const CENTRE_VIEWS: CentreView[] = ["visual", "scene", "sequence"];

export function VisualLab() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const topicId = SCENARIOS.some((s) => s.id === params.get("topic")) ? params.get("topic")! : DEFAULT_SCENARIO;
  const meta = SCENARIOS.find((s) => s.id === topicId)!;

  const hadTopic = useRef(SCENARIOS.some((x) => x.id === params.get("topic")));
  const [scenario, setScenario] = useState<Scenario | null>(() => cache.get(topicId) ?? null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [run, setRun] = useState(0);
  // The page the URL names: ?topic=…&step=3&tab=step&view=scene. Reading it on first render keeps a refresh on the same page.
  const urlTab = PANEL_TABS.find((t) => t === params.get("tab")) ?? null;
  const urlStep = Number.parseInt(params.get("step") ?? "", 10);
  const [view, setView] = useState<CentreView>(() => CENTRE_VIEWS.find((v) => v === params.get("view")) ?? "visual");
  const [tab, setTab] = useState<PanelTab>(() => urlTab ?? "overview");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [theme, setTheme] = useState<LabTheme>("dark");
  const [mode, setMode] = useState<LabMode>("simple");
  const [traceOpen, setTraceOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [voice, setVoice] = useState(false);
  const [endPrompt, setEndPrompt] = useState(false);
  const autoplayNext = useRef(false);
  // True from the moment a topic finishes until the learner moves: the voice must not start the last step over.
  const finished = useRef(false);
  const [voiceOk, setVoiceOk] = useState(false);
  const [voiceList, setVoiceList] = useState<string[]>([]);
  const [voiceName, setVoiceName] = useState("");
  const [listOpen, setListOpen] = useState(true);
  const focus = useReadingFocus();
  const pendingStep = useRef<number | null>(Number.isFinite(urlStep) && urlStep >= 1 ? urlStep - 1 : null);
  const restoreTab = useRef<PanelTab | null>(urlTab);

  const reduced = useReducedMotion() ?? false;
  const animate = !reduced;

  useEffect(() => {
    setTheme(readTheme());
    const watch = new MutationObserver(() => setTheme(readTheme()));
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
    const m = readMode();
    setMode(m);
    setTraceOpen(m === "interview");
    setVoiceOk(canSpeak());
    // A returning learner resumes at the topic they last had open.
    if (!hadTopic.current) {
      try {
        const last = window.localStorage.getItem("ai-lab-last-topic");
        if (last && SCENARIOS.some((x) => x.id === last) && last !== DEFAULT_SCENARIO) router.replace(`${pathname}?topic=${last}`, { scroll: false });
      } catch {
        /* ignore */
      }
    }
    const loadVoices = () => {
      const r = rankVoices();
      setVoiceList(r.map((v) => v.name));
      setVoiceName(readVoiceName() || r[0]?.name || "");
    };
    loadVoices();
    if (canSpeak()) window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    try {
      setListOpen(window.localStorage.getItem("ai-lab-list") !== "0");
    } catch {
      /* ignore */
    }
    return () => {
      watch.disconnect();
      if (canSpeak()) window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const toggleList = () =>
    setListOpen((o) => {
      try {
        window.localStorage.setItem("ai-lab-list", o ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !o;
    });
  // The voice only exists in Simple mode.
  const voiceActive = voice && voiceOk && mode === "simple";
  const chooseMode = (m: LabMode) => {
    setMode(m);
    saveMode(m);
    // Simple keeps the screen calm; Interview opens the full trace.
    setTraceOpen(m === "interview");
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
      const savedTab = restoreTab.current;
      restoreTab.current = null;
      if (autoplayNext.current) {
        autoplayNext.current = false;
        setStepIndex(0);
        setTab("step");
        setPlaying(true);
      } else if (target !== null) {
        setStepIndex(Math.min(target, s.steps.length - 1));
        setTab(savedTab ?? "step");
      } else {
        setStepIndex(-1);
        if (savedTab) setTab(savedTab);
      }
      setRun((r) => r + 1);
    });
    return () => {
      live = false;
    };
  }, [topicId]);

  // Write the current page into the URL (no new history entry), so refresh and shared links land on the same step.
  useEffect(() => {
    if (!scenario || scenario.id !== topicId) return;
    const url = new URL(window.location.href);
    url.searchParams.set("topic", topicId);
    const put = (key: string, value: string | null) => (value === null ? url.searchParams.delete(key) : url.searchParams.set(key, value));
    put("step", stepIndex >= 0 ? String(stepIndex + 1) : null);
    put("tab", tab === "overview" ? null : tab);
    put("view", view === "visual" ? null : view);
    const next = `${url.pathname}${url.search}${url.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, "", next);
    }
  }, [scenario, topicId, stepIndex, tab, view]);

  useEffect(() => {
    if (!scenario || scenario.id !== topicId) return;
    try {
      window.localStorage.setItem("ai-lab-last-topic", topicId);
    } catch {
      /* ignore */
    }
  }, [scenario, topicId]);

  useEffect(() => {
    finished.current = false;
    setEndPrompt(false);
  }, [topicId, stepIndex]);

  const nextMeta = SCENARIOS[SCENARIOS.findIndex((x) => x.id === topicId) + 1];
  const goNextTopic = () => {
    if (!nextMeta) return;
    setEndPrompt(false);
    autoplayNext.current = voiceActive;
    selectTopic(nextMeta.id);
  };

  const steps = scenario?.steps ?? [];
  const step = stepIndex >= 0 ? steps[stepIndex] ?? null : null;
  const showStage = view === "visual" && !!step?.stage;

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

  // Auto-advance while playing. A step with a big visual waits for it to finish.
  useEffect(() => {
    if (!playing || !scenario || voiceActive) return;
    const ms = stepIndex < 0 ? 250 : Math.max(stepDurationMs(step ?? undefined), showStage ? stageDurationMs(step?.stage) : 0) / speed;
    const t = window.setTimeout(() => {
      if (stepIndex >= scenario.steps.length - 1) {
        finished.current = true;
        setPlaying(false);
        setEndPrompt(true);
      } else goTo(stepIndex + 1);
    }, ms);
    return () => window.clearTimeout(t);
  }, [playing, stepIndex, speed, scenario, step, goTo, run, showStage, voiceActive]);

  // Voiceover: read the step aloud. While playing, the next step starts once the voice and the picture have both finished.
  useEffect(() => {
    if (!voiceActive || !scenario || scenario.id !== topicId) return;
    if (finished.current && !playing) return;
    let timer = 0;
    const startedAt = Date.now();
    const minMs = stepIndex < 0 ? 0 : Math.max(stepDurationMs(step ?? undefined), showStage ? stageDurationMs(step?.stage) : 0) / speed;
    const last = scenario.steps.length - 1;
    const stop = speak(stepIndex < 0 && playing ? "" : narrationFor(scenario, stepIndex), speed, () => {
      if (!playing) return;
      const wait = Math.max(0, minMs - (Date.now() - startedAt)) + 700;
      timer = window.setTimeout(() => {
        if (stepIndex >= last) {
          finished.current = true;
          setPlaying(false);
          setEndPrompt(true);
        } else goTo(stepIndex + 1);
      }, wait);
    });
    return () => {
      stop();
      window.clearTimeout(timer);
    };
  }, [voiceActive, playing, scenario, topicId, stepIndex, run, speed, step, showStage, goTo]);

  const listen = () => {
    if (voice) {
      setVoice(false);
      stopSpeaking();
      setPlaying(false);
    } else {
      setVoice(true);
      if (!reduced && scenario) {
        if (stepIndex >= scenario.steps.length - 1) goTo(0);
        setPlaying(true);
        setTab((t) => (t === "overview" ? "step" : t));
      }
    }
  };

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
  const start = useCallback(() => {
    setPlaying(false);
    goTo(0);
    setTab("step");
  }, [goTo]);
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
        // This page has its own topic search; stop the site-wide search opening too.
        e.preventDefault();
        e.stopImmediatePropagation();
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
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
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
  const views: [CentreView, string, typeof Eye][] = [
    ["visual", "Visual", Eye],
    ["scene", "Flow", Network],
    ["sequence", "Sequence", Workflow],
  ];

  return (
    <LabThemeContext.Provider value={theme}>
      <LabModeContext.Provider value={mode}>
        <TooltipPrimitive.Provider delayDuration={150}>
          <MotionConfig reducedMotion="user">
            <div data-theme={theme} className="ai-lab reader-root flex min-h-[calc(100dvh-6.375rem)] flex-col bg-lab-bg font-labmono text-lab-text lg:h-[calc(100dvh-6.375rem)] lg:min-h-0">
              {/* top bar */}
              <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-lab-border bg-lab-panel px-4 py-2">
                <button
                  onClick={toggleList}
                  className="hidden items-center rounded-md border border-lab-border p-1.5 text-lab-muted hover:text-lab-text lg:flex"
                  aria-label={listOpen && !focus ? "Hide the topic list" : "Show the topic list"}
                  title={listOpen && !focus ? "Hide the topic list" : "Show the topic list"}
                  style={focus ? { display: "none" } : undefined}
                >
                  {listOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                </button>
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="text-[12px] text-lab-muted">Topic {meta.num}</span>
                  <span className="truncate text-[15px] font-semibold">{meta.title}</span>
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  {/* Simple | Interview */}
                  <div className="flex overflow-hidden rounded-md border border-lab-border text-[11px]" role="radiogroup" aria-label="Explanation level">
                    {(
                      [
                        ["simple", "Simple", Sparkles, "Plain words, one idea per step"],
                        ["interview", "Interview", GraduationCap, "Adds the terms, the maths, the code and typical questions"],
                      ] as const
                    ).map(([m, label, Icon, hint]) => (
                      <button
                        key={m}
                        role="radio"
                        aria-checked={mode === m}
                        title={hint}
                        onClick={() => chooseMode(m)}
                        className={cn("flex items-center gap-1.5 px-2.5 py-1.5 font-semibold uppercase tracking-wider", mode === m ? "text-lab-bg" : "text-lab-muted hover:text-lab-text")}
                        style={mode === m ? { background: toneVar(m === "simple" ? "cyan" : "violet") } : undefined}
                      >
                        <Icon className="h-3.5 w-3.5" /> {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex overflow-hidden rounded-md border border-lab-border text-[11px]" role="tablist" aria-label="Centre view">
                    {views.map(([v, label, Icon]) => (
                      <button
                        key={v}
                        role="tab"
                        aria-selected={view === v}
                        onClick={() => setView(v)}
                        title={v === "visual" ? "The big picture for each step" : v === "scene" ? "The whole system as a flow diagram" : "Every message in order"}
                        className={cn("flex items-center gap-1.5 px-2.5 py-1.5 uppercase tracking-wider", view === v ? "bg-lab-raised text-lab-accent" : "text-lab-muted hover:text-lab-text")}
                      >
                        <Icon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                  {mode === "simple" && voiceOk && (
                    <button
                      onClick={listen}
                      aria-pressed={voiceActive}
                      title={voiceActive ? "Stop the voice" : "Read every step aloud and move on by itself"}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider",
                        voiceActive ? "border-lab-accent bg-lab-raised text-lab-accent" : "border-lab-border text-lab-muted hover:text-lab-text",
                      )}
                    >
                      {voiceActive ? <Square className="h-3.5 w-3.5" /> : <Headphones className="h-3.5 w-3.5" />}
                      <span>{voiceActive ? "Stop voice" : "Listen"}</span>
                    </button>
                  )}
                  {mode === "simple" && voiceOk && voiceList.length > 1 && (
                    <select
                      value={voiceName}
                      aria-label="Voice"
                      title="Pick a voice. Names with Enhanced or Premium sound best."
                      onChange={(e) => {
                        setVoiceName(e.target.value);
                        saveVoiceName(e.target.value);
                        sampleVoice();
                      }}
                      className="max-w-[9.5rem] rounded-md border border-lab-border bg-lab-panel px-2 py-1.5 text-[11px] text-lab-muted"
                    >
                      {voiceList.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => setReadingFocus(!focus)}
                    aria-pressed={focus}
                    title="Focus: hide the site menus and the topic list"
                    className="flex items-center gap-1.5 rounded-md border border-lab-border px-2.5 py-1.5 text-[11px] text-lab-muted hover:text-lab-text"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline uppercase tracking-wider">{focus ? "Unfocus" : "Focus"}</span>
                  </button>
                  <button
                    onClick={() => setPaletteOpen(true)}
                    className={cn("flex items-center gap-2 rounded-md border border-lab-border px-2.5 py-1.5 text-[11px] text-lab-muted hover:text-lab-text", focus && "hidden")}
                    aria-label="Search topics, steps, questions and terms"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Search</span>
                    <kbd className="hidden rounded border border-lab-border px-1 text-[10px] sm:inline">Ctrl K</kbd>
                  </button>
                </div>
              </header>

              {/* Phones: topics → visual → explanation → trace. Desktop: topics | visual over trace | explanation. */}
              <div className={cn("grid min-h-0 flex-1 grid-cols-1 [grid-template-areas:'list'_'scene'_'panel'_'trace'] lg:grid-rows-[minmax(0,1fr)_auto] lg:[grid-template-areas:'list_scene_panel'_'list_trace_panel']", listOpen && !focus ? "lg:grid-cols-[250px_minmax(0,1fr)_minmax(340px,390px)]" : "lg:grid-cols-[0px_minmax(0,1fr)_minmax(340px,390px)]")}>
                <TopicList className={cn("[grid-area:list]", focus ? "hidden" : !listOpen && "lg:hidden")} activeId={topicId} scenario={scenario} stepIndex={stepIndex} onTopic={(id) => selectTopic(id)} onStep={(i) => selectTopic(topicId, i)} />

                <section className="flex min-h-0 min-w-0 flex-col border-lab-border bg-lab-scene [grid-area:scene] lg:border-x">
                  <div className="flex items-center gap-3 border-b border-lab-border px-3 py-1.5">
                    <StepProgress i={stepIndex} total={steps.length} className="w-[min(46%,260px)] shrink-0" />
                    <span className="min-w-0 truncate font-body text-[13px] font-medium text-lab-text">{step ? step.title : "Overview"}</span>
                    {reduced && <span className="ml-auto shrink-0 rounded border border-lab-border bg-lab-panel px-2 py-0.5 text-[10px] text-lab-muted">reduced motion: step mode</span>}
                  </div>
                  {/* the step in one plain sentence, right above the picture (desktop shows it first in the panel beside it) */}
                  {step?.simple && (
                    <p className="border-b border-lab-border px-3 py-1.5 font-body text-[14px] font-medium leading-snug text-lab-text sm:text-[15px] lg:hidden" style={{ background: toneFill("cyan", 6) }}>
                      {step.simple}
                    </p>
                  )}
                  <div className="lab-toy relative h-[min(62vh,440px)] min-h-[300px] lg:h-auto lg:min-h-[240px] lg:flex-1">
                    {!scenario ? (
                      <div className="grid h-full place-items-center text-xs text-lab-muted">loading {meta.title.toLowerCase()}…</div>
                    ) : view === "sequence" ? (
                      <SequenceView scenario={scenario} stepIndex={stepIndex} onStep={(i) => selectTopic(topicId, i)} />
                    ) : showStage && step?.stage ? (
                      <StageView stage={step.stage} animate={animate} speed={speed} runKey={runKey} scenarioId={scenario.id} />
                    ) : (
                      <div className="h-full p-2 pt-4">
                        <IsoScene scenario={scenario} step={step} runKey={runKey} animate={animate} speed={speed} />
                      </div>
                    )}
                    {endPrompt && scenario && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center p-4" style={{ background: "color-mix(in srgb, var(--lab-scene) 80%, transparent)", backdropFilter: "blur(3px)" }}>
                        <div className="relative w-full max-w-sm rounded-3xl bg-lab-panel p-5 shadow-2xl">
                          <button onClick={() => setEndPrompt(false)} aria-label="Close" className="absolute right-3 top-3 rounded-full p-1 text-lab-muted hover:text-lab-text">
                            <X className="h-4 w-4" />
                          </button>
                          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-lab-accent">
                            <Sparkles className="h-3.5 w-3.5" /> Topic finished
                          </p>
                          <p className="font-body text-[16px] font-semibold leading-snug text-lab-text">{scenario.title}</p>
                          <p className="mt-1 font-body text-[13px] text-lab-muted">What next?</p>
                          <div className="mt-4 grid gap-2">
                            <button
                              onClick={() => {
                                setEndPrompt(false);
                                setTab("quiz");
                              }}
                              className="flex items-center justify-center gap-2 rounded-full bg-[#e5603a] px-4 py-2.5 text-[14px] font-medium text-white hover:bg-[#c2532f]"
                            >
                              <ListChecks className="h-4 w-4" /> Take the quiz
                            </button>
                            {nextMeta && (
                              <button onClick={goNextTopic} className="flex items-center justify-center gap-2 rounded-full border border-lab-accent px-4 py-2.5 text-[14px] font-medium text-lab-accent hover:bg-lab-raised">
                                <SkipForward className="h-4 w-4" /> Next: {nextMeta.title}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEndPrompt(false);
                                goTo(0);
                                setPlaying(true);
                              }}
                              className="flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] text-lab-muted hover:text-lab-text"
                            >
                              <RotateCcw className="h-3.5 w-3.5" /> Replay this topic
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {scenario && stepIndex < 0 && view === "visual" && <StartOverlay s={scenario} onStart={start} onPlay={play} reduced={reduced} />}
                  </div>
                </section>

                <TracePanel
                  className="[grid-area:trace]"
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
                  open={traceOpen}
                  onToggle={() => setTraceOpen((o) => !o)}
                />

                <RightPanel
                  className="[grid-area:panel]"
                  scenario={scenario}
                  stepIndex={stepIndex}
                  tab={tab}
                  onTab={setTab}
                  onPrev={prev}
                  onNext={next}
                  onStart={start}
                  onStep={(i) => selectTopic(topicId, i)}
                  openQuestion={openQuestion}
                  onOpenQuestion={setOpenQuestion}
                />
              </div>

              {paletteOpen && <CommandPalette theme={theme} onClose={() => setPaletteOpen(false)} onPick={onPalettePick} />}
            </div>
          </MotionConfig>
        </TooltipPrimitive.Provider>
      </LabModeContext.Provider>
    </LabThemeContext.Provider>
  );
}
