"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Bomb, Check, GraduationCap, Moon, RotateCcw, Sparkles, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneFill, toneVar } from "@/components/ai-lab/engine/tones";
import { readMode, saveMode, type LabMode } from "@/components/ai-lab/engine/mode";
import { ArchCanvas } from "./ArchCanvas";
import { LESSONS } from "./lessons";
import type { AwsLesson } from "./types";

const THEME_KEY = "aws-lab-theme";

/** **bold** and `code` only. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) =>
        p.startsWith("**") ? (
          <strong key={i} className="font-semibold text-lab-text">{p.slice(2, -2)}</strong>
        ) : p.startsWith("`") ? (
          <code key={i} className="rounded bg-lab-raised px-1 py-0.5 text-[0.9em]">{p.slice(1, -1)}</code>
        ) : (
          p
        )
      )}
    </>
  );
}

function Quiz({ lesson }: { lesson: AwsLesson }) {
  const [picked, setPicked] = useState<Record<string, number>>({});
  const score = lesson.quiz.filter((q) => picked[q.id] === q.correct).length;
  const done = lesson.quiz.every((q) => picked[q.id] !== undefined);
  return (
    <div className="space-y-4">
      {lesson.quiz.map((q, qi) => (
        <div key={q.id} className="rounded-xl border border-lab-border bg-lab-raised p-3">
          <p className="mb-2 text-[14px] font-semibold leading-snug text-lab-text">{qi + 1}. {q.q}</p>
          <div className="space-y-1.5">
            {q.options.map((o, oi) => {
              const chosen = picked[q.id];
              const show = chosen !== undefined;
              const right = oi === q.correct;
              return (
                <button
                  key={oi}
                  disabled={show}
                  onClick={() => setPicked((p) => ({ ...p, [q.id]: oi }))}
                  className={cn("flex w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-left text-[13px] leading-snug transition-colors", !show && "border-lab-border text-lab-text hover:border-lab-accent")}
                  style={show ? { borderColor: right ? toneVar("green") : chosen === oi ? toneVar("rose") : "var(--lab-border)", background: right ? toneFill("green", 14) : chosen === oi ? toneFill("rose", 14) : undefined, color: "var(--lab-text)" } : undefined}
                >
                  <span className="mt-0.5 shrink-0">{show && right ? <Check className="h-3.5 w-3.5" style={{ color: toneVar("green") }} /> : show && chosen === oi ? <X className="h-3.5 w-3.5" style={{ color: toneVar("rose") }} /> : <span className="inline-block h-3.5 w-3.5 rounded-full border border-lab-border" />}</span>
                  <span>{o}</span>
                </button>
              );
            })}
          </div>
          {picked[q.id] !== undefined && <p className="mt-2 text-[13px] leading-snug text-lab-muted"><Rich text={q.explain} /></p>}
        </div>
      ))}
      {done && (
        <p className="rounded-lg p-3 text-center text-[14px] font-bold" style={{ background: toneFill("cyan", 12), color: toneVar("cyan") }}>
          You got {score} of {lesson.quiz.length}.
          <button className="ml-3 inline-flex items-center gap-1 text-[12px] font-semibold underline" onClick={() => setPicked({})}><RotateCcw className="h-3 w-3" /> again</button>
        </p>
      )}
    </div>
  );
}

export function AwsLab() {
  const params = useSearchParams();
  const urlLesson = params.get("lesson");
  const urlStep = params.get("step");
  const startLesson = LESSONS.find((l) => l.id === urlLesson) ?? LESSONS[0];

  const [lessonId, setLessonId] = useState(startLesson.id);
  const lesson = LESSONS.find((l) => l.id === lessonId) ?? LESSONS[0];
  // -1 = the "Imagine…" opener, steps.length = the recap.
  const [stepIndex, setStepIndex] = useState(() => {
    const n = Number(urlStep);
    return urlStep !== null && Number.isFinite(n) ? Math.max(-1, Math.min(startLesson.steps.length, n - 1)) : -1;
  });
  const [tab, setTab] = useState<"learn" | "quiz">("learn");
  const [broken, setBroken] = useState(false);
  const [mode, setMode] = useState<LabMode>("simple");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const ready = useRef(false);

  useEffect(() => {
    setMode(readMode());
    try {
      if (window.localStorage.getItem(THEME_KEY) === "light") setTheme("light");
    } catch { /* ignore */ }
    ready.current = true;
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    const q = new URLSearchParams();
    q.set("lesson", lessonId);
    if (stepIndex >= 0) q.set("step", String(stepIndex + 1));
    window.history.replaceState(null, "", `${window.location.pathname}?${q.toString()}`);
  }, [lessonId, stepIndex]);

  const steps = lesson.steps;
  const onRecap = stepIndex >= steps.length;
  const step = stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : undefined;
  const sceneStep = step ?? (stepIndex < 0 ? steps[0] : steps[steps.length - 1]);

  const go = useCallback(
    (i: number) => {
      setBroken(false);
      setTab("learn");
      setStepIndex(Math.max(-1, Math.min(steps.length, i)));
    },
    [steps.length]
  );
  const pick = (id: string) => {
    setLessonId(id);
    setBroken(false);
    setTab("learn");
    setStepIndex(-1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea,select")) return;
      if (e.key === "ArrowRight") go(stepIndex + 1);
      if (e.key === "ArrowLeft") go(stepIndex - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, stepIndex]);

  const chooseMode = (m: LabMode) => { setMode(m); saveMode(m); };
  const toggleTheme = () => {
    const t = theme === "dark" ? "light" : "dark";
    setTheme(t);
    try { window.localStorage.setItem(THEME_KEY, t); } catch { /* ignore */ }
  };

  const nextLesson = LESSONS[LESSONS.findIndex((l) => l.id === lesson.id) + 1];

  return (
    <div data-theme={theme} className="ai-lab flex min-h-[calc(100dvh-3.5rem)] flex-col bg-lab-bg font-body text-lab-text lg:h-[calc(100dvh-3.5rem)] lg:min-h-0">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-lab-border bg-lab-panel px-4 py-2">
        <Link href="/aws-saa-v2" className="flex items-center gap-1 text-[12px] text-lab-muted hover:text-lab-text"><ArrowLeft className="h-3.5 w-3.5" /> AWS SAA v2 notes</Link>
        <div className="flex min-w-0 items-center gap-2 text-[13px]">
          <span className="font-bold tracking-[0.2em] text-lab-accent">AWS LAB</span>
          <span className="text-lab-muted">/</span>
          <span className="truncate">{lesson.title}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-lab-border text-[12px]" role="radiogroup" aria-label="Explanation level">
            {([["simple", "Simple", Sparkles], ["interview", "Interview", GraduationCap]] as const).map(([m, label, Icon]) => (
              <button key={m} role="radio" aria-checked={mode === m} onClick={() => chooseMode(m)} className={cn("flex items-center gap-1.5 px-2.5 py-1.5 font-semibold", mode === m ? "text-lab-bg" : "text-lab-muted hover:text-lab-text")} style={mode === m ? { background: toneVar(m === "simple" ? "cyan" : "violet") } : undefined}>
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
          <button onClick={toggleTheme} className="rounded-md border border-lab-border p-1.5 text-lab-muted hover:text-lab-text" aria-label="Switch theme">{theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}</button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)_390px]">
        {/* lessons */}
        <nav aria-label="Lessons" className="flex gap-2 overflow-x-auto border-b border-lab-border bg-lab-panel p-2 lg:block lg:space-y-1 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-3">
          <p className="mb-2 hidden px-2 text-[11px] font-semibold uppercase tracking-wider text-lab-muted lg:block">Lessons</p>
          {LESSONS.map((l) => (
            <button key={l.id} onClick={() => pick(l.id)} className={cn("shrink-0 rounded-lg px-3 py-2 text-left transition-colors lg:w-full", l.id === lessonId ? "bg-lab-raised text-lab-accent" : "text-lab-muted hover:bg-lab-raised/60 hover:text-lab-text")}>
              <span className="block whitespace-nowrap text-[13px] font-semibold lg:whitespace-normal">{String(l.num).padStart(2, "0")} {l.short}</span>
              <span className="mt-0.5 hidden text-[11.5px] leading-snug opacity-80 lg:block">{l.tagline}</span>
            </button>
          ))}
        </nav>

        {/* picture */}
        <section className="flex min-h-0 min-w-0 flex-col bg-lab-scene">
          <div className="flex items-center gap-3 border-b border-lab-border px-3 py-2">
            <div className="flex gap-1" aria-label="Progress">
              {steps.map((s, i) => (
                <button key={s.id} onClick={() => go(i)} aria-label={`Step ${i + 1}: ${s.title}`} className="h-2 w-5 rounded-full transition-colors" style={{ background: i <= stepIndex ? toneVar("cyan") : "var(--lab-border)" }} />
              ))}
            </div>
            <span className="min-w-0 truncate text-[14px] font-semibold">{step ? `${stepIndex + 1}. ${step.title}` : onRecap ? "Recap" : "Start"}</span>
          </div>
          {step && <p className="border-b border-lab-border px-3 py-2 text-[15px] font-medium leading-snug lg:hidden" style={{ background: toneFill("cyan", 6) }}>{step.simple}</p>}
          <div className="relative h-[min(58vh,420px)] min-h-[280px] lg:h-auto lg:flex-1">
            <ArchCanvas scene={sceneStep.scene} chaos={step?.chaos} broken={broken && !!step?.chaos} />
            {step?.chaos && (
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
                <button onClick={() => setBroken((b) => !b)} className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold shadow-lg transition-transform hover:scale-105" style={{ background: broken ? toneFill("green", 30) : toneFill("rose", 30), color: broken ? toneVar("green") : toneVar("rose"), border: `1px solid ${broken ? toneVar("green") : toneVar("rose")}` }}>
                  {broken ? <><RotateCcw className="h-4 w-4" /> Fix it</> : <><Bomb className="h-4 w-4" /> {step.chaos.label}</>}
                </button>
                {broken && <p className="min-w-0 flex-1 rounded-lg border border-lab-border bg-lab-panel/95 px-3 py-2 text-[13px] leading-snug"><Rich text={step.chaos.result} /></p>}
              </div>
            )}
          </div>
        </section>

        {/* explanation */}
        <aside className="flex min-h-0 flex-col border-t border-lab-border bg-lab-panel lg:border-l lg:border-t-0">
          <div className="flex border-b border-lab-border text-[12px] font-semibold">
            {(["learn", "quiz"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cn("flex-1 px-3 py-2.5 uppercase tracking-wider", tab === t ? "bg-lab-raised text-lab-accent" : "text-lab-muted hover:text-lab-text")}>{t === "learn" ? "Learn" : `Quiz (${lesson.quiz.length})`}</button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {tab === "quiz" ? (
              <Quiz key={lesson.id} lesson={lesson} />
            ) : stepIndex < 0 ? (
              <div>
                <h2 className="mb-1 text-[18px] font-bold">{lesson.title}</h2>
                <p className="mb-3 text-[13px] text-lab-muted">{lesson.tagline}</p>
                <p className="rounded-xl border border-lab-border p-3 text-[15px] leading-relaxed" style={{ background: toneFill("amber", 8) }}>{lesson.imagine}</p>
                <button onClick={() => go(0)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-bold text-lab-bg" style={{ background: toneVar("cyan") }}>Start <ArrowRight className="h-4 w-4" /></button>
              </div>
            ) : onRecap ? (
              <div>
                <h2 className="mb-3 text-[18px] font-bold">What you just learned</h2>
                <ul className="space-y-2">
                  {lesson.recap.map((r, i) => (
                    <li key={i} className="flex gap-2 rounded-xl border border-lab-border bg-lab-raised p-3 text-[14px] leading-snug"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: toneVar("green") }} /><Rich text={r} /></li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-col gap-2">
                  <button onClick={() => setTab("quiz")} className="rounded-xl py-2.5 text-[14px] font-bold text-lab-bg" style={{ background: toneVar("violet") }}>Test yourself</button>
                  {nextLesson && <button onClick={() => pick(nextLesson.id)} className="flex items-center justify-center gap-2 rounded-xl border border-lab-border py-2.5 text-[14px] font-semibold hover:border-lab-accent">Next lesson: {nextLesson.short} <ArrowRight className="h-4 w-4" /></button>}
                  {lesson.notes && <Link href={lesson.notes.href} className="rounded-xl border border-lab-border py-2.5 text-center text-[13px] text-lab-muted hover:text-lab-text">{lesson.notes.label}</Link>}
                </div>
              </div>
            ) : step ? (
              <div key={`${lesson.id}-${stepIndex}`}>
                <p className="mb-3 hidden rounded-xl p-3 text-[16px] font-semibold leading-snug lg:block" style={{ background: toneFill("cyan", 9), border: `1px solid ${toneFill("cyan", 30)}` }}>{step.simple}</p>
                <p className="mb-3 text-[14.5px] leading-relaxed text-lab-text"><Rich text={mode === "simple" ? step.easy : step.detail ?? step.easy} /></p>
                {mode === "interview" && step.detail && <p className="mb-3 text-[13px] leading-relaxed text-lab-muted"><Rich text={step.easy} /></p>}
                {step.analogy && <p className="mb-3 rounded-xl p-3 text-[13.5px] leading-snug" style={{ background: toneFill("amber", 9), border: `1px solid ${toneFill("amber", 28)}` }}>💡 <Rich text={step.analogy} /></p>}
                {mode === "interview" && step.tip && <p className="mb-3 rounded-xl p-3 text-[13px] leading-snug" style={{ background: toneFill("violet", 10), border: `1px solid ${toneFill("violet", 30)}` }}>🎓 <Rich text={step.tip} /></p>}
                {step.chaos && !broken && <p className="text-[13px] text-lab-muted">👉 Press <strong className="text-lab-text">{step.chaos.label}</strong> under the picture and watch.</p>}
              </div>
            ) : null}
          </div>
          {tab === "learn" && (
            <div className="grid grid-cols-2 gap-2 border-t border-lab-border p-3">
              <button disabled={stepIndex < 0} onClick={() => go(stepIndex - 1)} className="flex items-center justify-center gap-2 rounded-xl border border-lab-border py-3 text-[14px] font-bold disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Back</button>
              <button disabled={onRecap} onClick={() => go(stepIndex + 1)} className="flex items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-bold text-lab-bg disabled:opacity-40" style={{ background: toneVar("cyan") }}>{stepIndex === steps.length - 1 ? "Finish" : "Next"} <ArrowRight className="h-4 w-4" /></button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
