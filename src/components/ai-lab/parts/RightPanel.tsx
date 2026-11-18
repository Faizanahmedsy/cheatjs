"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Code, GraduationCap, Lightbulb, ListChecks, MessageSquareQuote, Play, Sigma, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InterviewQuestion, Level, Scenario, Viz } from "../engine/types";
import { RichText } from "../engine/RichText";
import { useLabMode, type LabMode } from "../engine/mode";
import { VizView } from "../viz/VizView";
import { toneFill, toneVar } from "../engine/tones";

export type PanelTab = "overview" | "step" | "interview" | "quiz";

type Props = {
  scenario: Scenario | null;
  stepIndex: number;
  tab: PanelTab;
  onTab: (t: PanelTab) => void;
  onPrev: () => void;
  onNext: () => void;
  /** Go to step 1 without auto-play. */
  onStart: () => void;
  onStep: (i: number) => void;
  openQuestion: string | null;
  onOpenQuestion: (id: string | null) => void;
  className?: string;
};

export const LEVEL_LABEL: Record<Level, string> = { fresher: "Fresher", mid: "1–2 yrs", senior: "3 yrs" };
const LEVEL_TONE = { fresher: "green", mid: "blue", senior: "violet" } as const;

const prose = "font-body text-[13.5px] leading-relaxed text-lab-text";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-lab-muted first:mt-0">{children}</p>;
}

function Callout({ icon: Icon, tone, title, children }: { icon: typeof Lightbulb; tone: "amber" | "violet" | "cyan" | "rose" | "green"; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-md border px-3 py-2" style={{ borderColor: toneVar(tone), background: toneFill(tone, 8) }}>
      <p className="mb-0.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: toneVar(tone) }}>
        <Icon className="h-3.5 w-3.5" /> {title}
      </p>
      <div className="font-body text-[13px] leading-snug text-lab-text">{children}</div>
    </div>
  );
}

/** "Step N of M" with a thin bar. Used in the panel and on the centre stage. */
export function StepProgress({ i, total, className }: { i: number; total: number; className?: string }) {
  const pct = total ? (Math.max(0, i + 1) / total) * 100 : 0;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-lab-accent tabular-nums">{i < 0 ? `${total} steps` : `Step ${i + 1} of ${total}`}</span>
      <div className="h-1.5 min-w-[40px] flex-1 overflow-hidden rounded-full bg-lab-raised" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.max(0, i + 1)} aria-label="Progress through the steps">
        <div className="h-full rounded-full bg-lab-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const visibleVizzes = (viz: Viz | Viz[] | undefined, mode: LabMode) => (viz ? (Array.isArray(viz) ? viz : [viz]) : []).filter((v) => !v.only || v.only === mode);

function StartButton({ onStart, label = "Start" }: { onStart: () => void; label?: string }) {
  return (
    <button onClick={onStart} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-lab-accent px-4 py-2.5 text-[13px] font-bold uppercase tracking-wider text-lab-accent hover:bg-lab-raised">
      <Play className="h-4 w-4" /> {label}
    </button>
  );
}

function SimpleOverview({ s, onStart, onStep }: { s: Scenario; onStart: () => void; onStep: (i: number) => void }) {
  return (
    <div>
      <h2 className="text-[16px] font-semibold leading-snug text-lab-text">{s.title}</h2>
      <p className="mt-1 font-body text-[12.5px] text-lab-muted">{s.tagline}</p>
      {s.imagine && (
        <Callout icon={Sparkles} tone="amber" title="Imagine">
          <RichText text={s.imagine} className="text-[14px] leading-relaxed" />
        </Callout>
      )}
      <SectionLabel>In plain words</SectionLabel>
      <RichText text={s.overview.plain ?? s.overview.definition} className={prose} />
      <SectionLabel>What you will see</SectionLabel>
      <ol className="space-y-1">
        {s.steps.map((st, i) => (
          <li key={st.id}>
            <button onClick={() => onStep(i)} className="flex w-full items-start gap-2 rounded-md px-1.5 py-1 text-left font-body text-[13px] leading-snug text-lab-text hover:bg-lab-raised">
              <span className="w-5 shrink-0 font-labmono text-[11px] tabular-nums text-lab-accent">{i + 1}</span>
              <span>{st.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <StartButton onStart={onStart} />
      <p className="mt-2 text-center font-body text-[11.5px] text-lab-muted">
        Want the terms and the questions too? Switch to <span className="font-semibold text-lab-text">Interview</span> at the top.
      </p>
    </div>
  );
}

function InterviewOverview({ s, onStart }: { s: Scenario; onStart: () => void }) {
  return (
    <div>
      <h2 className="text-[15px] font-semibold leading-snug text-lab-text">{s.title}</h2>
      <p className="mt-1 font-body text-[12.5px] text-lab-muted">{s.tagline}</p>
      <SectionLabel>Definition</SectionLabel>
      <RichText text={s.overview.definition} className={prose} />
      <Callout icon={Lightbulb} tone="amber" title="Analogy">
        <RichText text={s.overview.analogy} />
      </Callout>
      <SectionLabel>Key facts</SectionLabel>
      <table className="w-full text-[11.5px]">
        <tbody>
          {s.overview.facts.map(([k, v]) => (
            <tr key={k} className="border-b border-lab-border last:border-0">
              <th className="w-[38%] py-1.5 pr-2 text-left align-top font-semibold text-lab-muted">{k}</th>
              <td className="py-1.5 align-top font-body text-[12.5px] text-lab-text">
                <RichText text={v} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {s.overview.whereUsed && (
        <>
          <SectionLabel>Where you meet it</SectionLabel>
          <RichText text={s.overview.whereUsed} className={prose} />
        </>
      )}
      <StartButton onStart={onStart} />
      <p className="mt-3 rounded-md border border-dashed border-lab-border p-2.5 text-[11px] text-lab-muted">
        <span className="text-lab-text">Start</span> walks the {s.steps.length} steps one at a time (<span className="text-lab-text">→</span> for the next), and <span className="text-lab-text">Play</span> runs them all. The{" "}
        <span className="text-lab-text">Interview</span> tab has {s.interview.length} questions and the <span className="text-lab-text">Quiz</span> has {s.quiz.length}.
      </p>
    </div>
  );
}

function Toggle({ open, onClick, icon: Icon, children }: { open: boolean; onClick: () => void; icon: typeof Sigma; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-expanded={open}
      className="flex w-full items-center gap-1.5 rounded-md border border-lab-border px-2.5 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-lab-muted hover:text-lab-text"
    >
      <Icon className="h-3.5 w-3.5" /> {children}
      <ChevronDown className={cn("ml-auto h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
    </button>
  );
}

function StepDetails({ s, i, onPrev, onNext, onStart, onQuiz }: { s: Scenario; i: number; onPrev: () => void; onNext: () => void; onStart: () => void; onQuiz: () => void }) {
  const mode = useLabMode();
  const [maths, setMaths] = useState(false);
  const [code, setCode] = useState(false);
  const step = s.steps[i];
  useEffect(() => {
    setMaths(false);
    setCode(false);
  }, [s.id, i]);
  if (!step)
    return (
      <div className="font-body text-[13px] text-lab-muted">
        Nothing running yet.
        <StartButton onStart={onStart} />
      </div>
    );
  const vizzes = visibleVizzes(step.viz, mode);
  const isLast = i >= s.steps.length - 1;
  const nextStep = s.steps[i + 1];
  const hasMaths = !!(step.deeper?.text || step.deeper?.math?.length);
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <button onClick={onPrev} className="flex shrink-0 items-center gap-1 rounded-md border border-lab-border px-2 py-1 text-[11px] text-lab-muted hover:text-lab-text" aria-label="Back one step">
          <ChevronLeft className="h-3.5 w-3.5" /> Back
        </button>
        <StepProgress i={i} total={s.steps.length} className="min-w-0 flex-1" />
        <button
          onClick={onNext}
          disabled={isLast}
          className="flex shrink-0 items-center gap-1 rounded-md border border-lab-accent px-2 py-1 text-[11px] font-semibold text-lab-accent disabled:border-lab-border disabled:text-lab-muted disabled:opacity-40"
          aria-label="Next step"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <h2 className="text-[16px] font-semibold leading-snug text-lab-text">{step.title}</h2>
      {step.simple && (
        <div className="mt-2.5 rounded-lg border-l-4 px-3 py-2.5" style={{ borderColor: toneVar("cyan"), background: toneFill("cyan", 9) }}>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: toneVar("cyan") }}>
            In simple words
          </p>
          <p className="font-body text-[16px] font-medium leading-snug text-lab-text">{step.simple}</p>
        </div>
      )}
      <RichText text={step.explain} className={cn(prose, "mt-3")} />
      {step.analogy && (
        <Callout icon={Lightbulb} tone="amber" title="Think of it like">
          <RichText text={step.analogy} />
        </Callout>
      )}
      {vizzes.length > 0 && (
        <div className="mt-3 space-y-2">
          {vizzes.map((v, k) => (
            <VizView key={`${s.id}-${i}-${k}`} viz={v} />
          ))}
        </div>
      )}

      {mode === "interview" && (
        <>
          {step.detail && (
            <div className="mt-4 rounded-md border border-lab-border bg-lab-raised px-3 py-2.5">
              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-lab-accent">
                <GraduationCap className="h-3.5 w-3.5" /> Interview depth
              </p>
              <RichText text={step.detail} className={prose} />
            </div>
          )}
          {(hasMaths || step.deeper?.code) && (
            <div className="mt-3 space-y-2">
              {hasMaths && (
                <div>
                  <Toggle open={maths} onClick={() => setMaths((d) => !d)} icon={Sigma}>
                    Show the maths
                  </Toggle>
                  {maths && (
                    <div className="mt-2 space-y-2">
                      {step.deeper?.text && <RichText text={step.deeper.text} className={prose} />}
                      {step.deeper?.math && (
                        <div className="space-y-1 rounded-md border border-lab-border bg-lab-raised p-2.5 text-[11.5px] leading-relaxed text-lab-text">
                          {step.deeper.math.map((m, k) => (
                            <div key={k} className="whitespace-pre-wrap break-words">
                              {m}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {step.deeper?.code && (
                <div>
                  <Toggle open={code} onClick={() => setCode((d) => !d)} icon={Code}>
                    Show the code
                  </Toggle>
                  {code && (
                    <pre className="mt-2 overflow-x-auto rounded-md border border-lab-border bg-lab-raised p-2.5 text-[11px] leading-relaxed text-lab-text">
                      <code>{step.deeper.code.src.trim()}</code>
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
          {step.interviewTip && (
            <Callout icon={MessageSquareQuote} tone="violet" title="In an interview">
              <RichText text={step.interviewTip} />
            </Callout>
          )}
        </>
      )}

      {isLast ? (
        <div className="mt-5 rounded-lg border px-3 py-3" style={{ borderColor: toneVar("green"), background: toneFill("green", 8) }}>
          <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: toneVar("green") }}>
            <ListChecks className="h-3.5 w-3.5" /> What you just learned
          </p>
          {s.recap ? (
            <ul className="list-disc space-y-1 pl-5 font-body text-[13.5px] leading-snug text-lab-text">
              {s.recap.map((r) => (
                <li key={r}>
                  <RichText text={r} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-body text-[13px] text-lab-text">{s.tagline}</p>
          )}
          <button onClick={onQuiz} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-[12px] font-bold uppercase tracking-wider" style={{ borderColor: toneVar("green"), color: toneVar("green") }}>
            Take the quiz <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={onNext}
          className="mt-5 flex w-full items-center justify-between gap-2 rounded-lg border border-lab-accent px-3 py-2.5 text-left text-lab-accent hover:bg-lab-raised"
        >
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em]">Next step</span>
            <span className="block truncate font-body text-[13px] font-medium text-lab-text">{nextStep?.title}</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </button>
      )}
    </div>
  );
}

function QuestionCard({ q, open, onToggle }: { q: InterviewQuestion; open: boolean; onToggle: () => void }) {
  return (
    <div id={`q-${q.id}`} className="rounded-md border border-lab-border bg-lab-raised">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-2 px-3 py-2 text-left">
        <span className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: toneVar(LEVEL_TONE[q.level]), background: toneFill(LEVEL_TONE[q.level], 14) }}>
          {LEVEL_LABEL[q.level]}
        </span>
        <span className="flex-1 font-body text-[13px] font-medium leading-snug text-lab-text">
          {q.q}
          {q.design && <span className="ml-1.5 rounded border border-lab-border px-1 font-labmono text-[9px] uppercase tracking-wider text-lab-muted">design</span>}
        </span>
        <ChevronDown className={cn("mt-0.5 h-3.5 w-3.5 shrink-0 text-lab-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-2 border-t border-lab-border px-3 pb-3 pt-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lab-accent">Model answer</p>
            <RichText text={q.answer} className={prose} />
          </div>
          <div className="rounded border-l-2 pl-2" style={{ borderColor: toneVar("green") }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: toneVar("green") }}>
              What interviewers look for
            </p>
            <RichText text={q.lookFor} className="font-body text-[12.5px] leading-snug text-lab-text" />
          </div>
          <div className="rounded border-l-2 pl-2" style={{ borderColor: toneVar("rose") }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: toneVar("rose") }}>
              Common wrong answer
            </p>
            <RichText text={q.wrong} className="font-body text-[12.5px] leading-snug text-lab-text" />
          </div>
        </div>
      )}
    </div>
  );
}

function Interview({ s, openId, onOpen }: { s: Scenario; openId: string | null; onOpen: (id: string | null) => void }) {
  const [level, setLevel] = useState<Level | "all" | "design">("all");
  const counts = useMemo(
    () => ({
      all: s.interview.length,
      fresher: s.interview.filter((q) => q.level === "fresher").length,
      mid: s.interview.filter((q) => q.level === "mid").length,
      senior: s.interview.filter((q) => q.level === "senior").length,
      design: s.interview.filter((q) => q.design).length,
    }),
    [s],
  );
  const list = s.interview.filter((q) => (level === "all" ? true : level === "design" ? q.design : q.level === level));
  useEffect(() => {
    if (!openId) return;
    setLevel("all");
    const t = window.setTimeout(() => document.getElementById(`q-${openId}`)?.scrollIntoView({ block: "nearest" }), 50);
    return () => window.clearTimeout(t);
  }, [openId]);
  const filters: [typeof level, string][] = [
    ["all", "All"],
    ["fresher", "Fresher"],
    ["mid", "1–2 yrs"],
    ["senior", "3 yrs"],
    ["design", "Design"],
  ];
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1">
        {filters.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setLevel(k)}
            className={cn("rounded-md border px-2 py-1 text-[10.5px]", level === k ? "border-lab-accent text-lab-accent" : "border-lab-border text-lab-muted hover:text-lab-text")}
          >
            {label} <span className="tabular-nums opacity-70">{counts[k]}</span>
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        {list.map((q) => (
          <QuestionCard key={q.id} q={q} open={openId === q.id} onToggle={() => onOpen(openId === q.id ? null : q.id)} />
        ))}
      </div>
    </div>
  );
}

function Quiz({ s }: { s: Scenario }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  useEffect(() => {
    setI(0);
    setPicked(null);
    setScore(0);
  }, [s.id]);
  const done = i >= s.quiz.length;
  if (done)
    return (
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.16em] text-lab-muted">Quiz complete</p>
        <p className="mt-2 text-3xl font-bold tabular-nums text-lab-accent">
          {score}/{s.quiz.length}
        </p>
        <p className="mt-2 font-body text-[13px] text-lab-muted">{score === s.quiz.length ? "Clean sweep." : "Re-run the steps for the ones you missed, then try again."}</p>
        <button
          onClick={() => {
            setI(0);
            setPicked(null);
            setScore(0);
          }}
          className="mt-4 rounded-md border border-lab-accent px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-lab-accent"
        >
          Try again
        </button>
      </div>
    );
  const q = s.quiz[i];
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-lab-muted">
        <span>
          Question {i + 1} / {s.quiz.length}
        </span>
        <span className="tabular-nums">score {score}</span>
      </div>
      <div className="mb-3 h-1 rounded bg-lab-raised">
        <div className="h-1 rounded bg-lab-accent transition-[width]" style={{ width: `${(i / s.quiz.length) * 100}%` }} />
      </div>
      <p className="font-body text-[14px] font-medium leading-snug text-lab-text">{q.q}</p>
      <div className="mt-3 space-y-1.5" role="radiogroup">
        {q.options.map((o, k) => {
          const isRight = k === q.correct;
          const state = picked === null ? "idle" : isRight ? "right" : picked === k ? "wrong" : "idle";
          return (
            <button
              key={k}
              role="radio"
              aria-checked={picked === k}
              disabled={picked !== null}
              onClick={() => {
                setPicked(k);
                if (isRight) setScore((x) => x + 1);
              }}
              className={cn("flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left font-body text-[13px] leading-snug", picked === null && "hover:border-lab-accent")}
              style={{
                borderColor: state === "right" ? toneVar("green") : state === "wrong" ? toneVar("rose") : "var(--lab-border)",
                background: state === "right" ? toneFill("green", 12) : state === "wrong" ? toneFill("rose", 12) : undefined,
              }}
            >
              <span className="font-labmono text-[11px] text-lab-muted">{String.fromCharCode(65 + k)}</span>
              <span className="text-lab-text">{o}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <>
          <Callout icon={Lightbulb} tone={picked === q.correct ? "green" : "rose"} title={picked === q.correct ? "Correct" : `Not quite — it's ${String.fromCharCode(65 + q.correct)}`}>
            <RichText text={q.explain} />
          </Callout>
          <button
            onClick={() => {
              setI((x) => x + 1);
              setPicked(null);
            }}
            className="mt-3 w-full rounded-md border border-lab-accent px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-lab-accent"
          >
            {i === s.quiz.length - 1 ? "See score" : "Next question"}
          </button>
        </>
      )}
    </div>
  );
}

export function RightPanel({ scenario, stepIndex, tab, onTab, onPrev, onNext, onStart, onStep, openQuestion, onOpenQuestion, className }: Props) {
  const mode = useLabMode();
  const tabs: [PanelTab, string][] = [
    ["overview", "Overview"],
    ["step", mode === "simple" ? "Explain" : "Step details"],
    ["interview", "Interview"],
    ["quiz", "Quiz"],
  ];
  return (
    <aside className={cn("flex min-h-0 flex-col border-t border-lab-border bg-lab-panel lg:border-t-0", className)}>
      <div className="flex border-b border-lab-border" role="tablist" aria-label="Panel">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => onTab(k)}
            className={cn(
              "flex-1 border-b-2 px-1 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider",
              tab === k ? "border-lab-accent text-lab-accent" : "border-transparent text-lab-muted hover:text-lab-text",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4" role="tabpanel">
        {!scenario ? (
          <p className="text-[11px] text-lab-muted">loading…</p>
        ) : tab === "overview" ? (
          mode === "simple" ? (
            <SimpleOverview s={scenario} onStart={onStart} onStep={onStep} />
          ) : (
            <InterviewOverview s={scenario} onStart={onStart} />
          )
        ) : tab === "step" ? (
          <StepDetails s={scenario} i={stepIndex} onPrev={onPrev} onNext={onNext} onStart={onStart} onQuiz={() => onTab("quiz")} />
        ) : tab === "interview" ? (
          <Interview s={scenario} openId={openQuestion} onOpen={onOpenQuestion} />
        ) : (
          <Quiz s={scenario} />
        )}
      </div>
    </aside>
  );
}
