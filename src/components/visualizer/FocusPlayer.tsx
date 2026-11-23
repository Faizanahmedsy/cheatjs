"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  diffSteps,
  framePointers,
  heapNames,
  pointedArrays,
  previewValue,
  topFrame,
  type Pointer,
  type StepChanges,
} from "@/lib/visualizer/analysis";
import { stepHints } from "@/lib/visualizer/explain-why";
import { storyFor } from "@/lib/visualizer/story";
import { workedOut } from "@/lib/visualizer/insights";
import { LANGS, type CodeLang, type MappedCode } from "@/lib/visualizer/translations";
import type { Comparison, TraceStep, Value } from "@/lib/visualizer/types";
import { CodeTraceView } from "./CodeTraceView";
import { SPEEDS, type Speed } from "./PlaybackControls";

interface FocusPlayerProps {
  steps: TraceStep[];
  index: number;
  code: string;
  title: string;
  /** One-line "what are we finding" for problems. */
  goal?: string;
  mapped: MappedCode | null;
  langs: Set<CodeLang>;
  lang: CodeLang;
  onLang: (lang: CodeLang) => void;
  playing: boolean;
  onTogglePlay: () => void;
  speed: Speed;
  onSpeed: (speed: Speed) => void;
  onNext: () => void;
  onBack: () => void;
  onJump: (index: number) => void;
  onExit: () => void;
}

const TONE_EMOJI = { info: "👉", call: "📞", return: "🎁", error: "⚠️", done: "🎉" } as const;

const OP_WORDS: Record<string, string> = {
  "<": "is smaller than",
  ">": "is bigger than",
  "<=": "is smaller than or equal to",
  ">=": "is bigger than or equal to",
  "===": "is equal to",
  "==": "is equal to",
  "!==": "is not equal to",
  "!=": "is not equal to",
};

function side(text: string, value: string) {
  return text.trim() === value.trim() ? value : `${text} (${value})`;
}

/** "i (0) is smaller than nums.length (4)  → Yes" */
function CheckRow({ c }: { c: Comparison }) {
  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-slate-900/60 px-3 py-2 font-code text-[15px] md:text-base">
      <span className="text-slate-100">{side(c.leftText, c.left)}</span>
      <span className="font-body text-slate-400">{OP_WORDS[c.op] ?? c.op}</span>
      <span className="text-slate-100">{side(c.rightText, c.right)}</span>
      <span
        className={cn(
          "ml-auto rounded-full px-2.5 py-0.5 font-body text-sm font-bold",
          c.result ? "bg-emerald-400/20 text-emerald-300" : "bg-rose-400/20 text-rose-300",
        )}
      >
        {c.result ? "Yes ✓" : "No ✗"}
      </span>
    </li>
  );
}

/** One value as a big readable chip. */
function Chip({ text, changed, tone }: { text: string; changed?: boolean; tone?: string }) {
  return (
    <span
      key={changed ? `c-${text}` : text}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border-2 px-2.5 font-code text-lg font-semibold",
        changed ? "fx-pop border-amber-300 bg-amber-300/15 text-amber-50" : "border-slate-600 bg-slate-800 text-slate-50",
        tone,
      )}
    >
      {text}
    </span>
  );
}

function Was({ value, step, names }: { value: Value | null | undefined; step: TraceStep; names: Map<number, string> }) {
  if (value === undefined) return null;
  if (value === null)
    return <span className="rounded-full bg-sky-400/20 px-2 py-0.5 text-xs font-bold text-sky-200">new</span>;
  return (
    <span className="text-xs text-slate-400">
      was <s className="font-code">{previewValue(value, step, names)}</s>
    </span>
  );
}

/** A list drawn as numbered boxes with arrows (i, j, left …) underneath. */
function ListBoxes({ items, changed, pointers, step, names }: { items: Value[]; changed?: Map<string, Value | null>; pointers: Pointer[]; step: TraceStep; names: Map<number, string> }) {
  return (
    <div className="flex flex-wrap gap-x-1.5 gap-y-3">
      {items.map((item, i) => {
        const here = pointers.filter((p) => p.value === i);
        const isChanged = changed?.has(String(i));
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <Chip
              text={previewValue(item, step, names, 1)}
              changed={isChanged}
              tone={here.length > 0 && !isChanged ? cn("ring-2 ring-offset-2 ring-offset-slate-900", here[0].color.ring) : undefined}
            />
            <span className="font-code text-[11px] text-slate-500">{i}</span>
            {here.map((p) => (
              <span key={p.name} className={cn("font-code text-sm font-bold leading-4", p.color.text)}>
                ▲ {p.name}
              </span>
            ))}
          </div>
        );
      })}
      {items.length === 0 && <span className="text-sm italic text-slate-500">empty list</span>}
    </div>
  );
}

/** The picture of what a variable holds. Lists, maps and objects get drawn; everything else is a chip. */
function Holding({ value, step, names, changes, pointers, pointed }: { value: Value; step: TraceStep; names: Map<number, string>; changes: StepChanges; pointers: Pointer[]; pointed: Set<number> }) {
  if (value.type === "prim") return null;
  const object = step.heap[value.id];
  if (!object) return null;
  const cells = changes.cells.get(value.id);
  if (object.kind === "array") {
    const rows = object.items.every((it) => it.type === "ref" && step.heap[it.id]?.kind === "array") && object.items.length > 0;
    if (rows) {
      return (
        <div className="flex flex-col gap-2">
          {object.items.map((row, r) => {
            const inner = row.type === "ref" ? step.heap[row.id] : undefined;
            if (!inner || inner.kind !== "array") return null;
            return (
              <div key={r} className="flex items-start gap-2">
                <span className="w-6 pt-3 text-right font-code text-[11px] text-slate-500">{r}</span>
                <ListBoxes items={inner.items} changed={row.type === "ref" ? changes.cells.get(row.id) : undefined} pointers={[]} step={step} names={names} />
              </div>
            );
          })}
        </div>
      );
    }
    return <ListBoxes items={object.items} changed={cells} pointers={pointed.has(value.id) ? pointers : []} step={step} names={names} />;
  }
  if (object.kind === "map" || object.kind === "object") {
    const entries =
      object.kind === "map"
        ? object.entries.map((e) => ({ key: previewValue(e.key, step, names, 1), keyId: previewValue(e.key, step), value: e.value }))
        : object.entries.map((e) => ({ key: e.key, keyId: e.key, value: e.value }));
    if (entries.length === 0) return <span className="text-sm italic text-slate-500">empty — nothing saved yet</span>;
    return (
      <ul className="flex flex-wrap gap-2">
        {entries.map((e) => {
          const isChanged = cells ? [...cells.keys()].some((k) => k === e.keyId || k === e.key || k.endsWith(`:${e.keyId}`)) : false;
          return (
            <li
              key={e.key}
              className={cn(
                "flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 font-code text-base",
                isChanged ? "fx-pop border-amber-300 bg-amber-300/15" : "border-slate-600 bg-slate-800",
              )}
            >
              <span className="text-sky-200">{e.key}</span>
              <span className="text-slate-500" aria-label="maps to">→</span>
              <span className="font-semibold text-slate-50">{previewValue(e.value, step, names, 1)}</span>
            </li>
          );
        })}
      </ul>
    );
  }
  if (object.kind === "set") {
    return (
      <div className="flex flex-wrap gap-1.5">
        {object.items.map((it, i) => (
          <Chip key={i} text={previewValue(it, step, names, 1)} />
        ))}
        {object.items.length === 0 && <span className="text-sm italic text-slate-500">empty set</span>}
      </div>
    );
  }
  return <Chip text={previewValue(value, step, names)} />;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h2>
      {children}
    </section>
  );
}

export function FocusPlayer(props: FocusPlayerProps) {
  const { steps, index, code, title, goal, mapped, langs, lang, onLang, playing, onTogglePlay, speed, onSpeed, onNext, onBack, onJump, onExit } = props;
  const total = steps.length;
  const step = steps[index];
  const prev = index > 0 ? steps[index - 1] : undefined;
  const lines = useMemo(() => code.split("\n"), [code]);
  const story = useMemo(() => storyFor(steps, index, lines), [steps, index, lines]);
  const hints = useMemo(() => stepHints(steps, index, lines), [steps, index, lines]);
  const touchX = useRef<number | null>(null);
  const sum = useMemo(() => (prev && step.event !== "call" ? workedOut(lines[prev.line - 1] ?? "", prev, step) : null), [lines, prev, step]);
  // Phones: normal code size so lines don't wrap; tablets and up: big.
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const view = useMemo(() => {
    const frame = topFrame(step);
    return {
      frame,
      names: heapNames(step),
      changes: diffSteps(prev, step),
      pointers: framePointers(step),
      pointed: pointedArrays(step),
    };
  }, [prev, step]);

  // Full screen: no page scroll behind; Space plays, Esc leaves. (← / → are handled by the page.)
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Escape") onExit();
      else if (e.key === " ") {
        e.preventDefault();
        onTogglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = before;
      window.removeEventListener("keydown", onKey);
    };
  }, [onExit, onTogglePlay]);

  const { frame, names, changes, pointers, pointed } = view;
  const vars = frame.vars.filter((v) => {
    if (v.name === "this") return false;
    if (v.value.type === "ref") {
      const kind = step.heap[v.value.id]?.kind;
      if (kind === "function") return false;
    }
    return true;
  });
  const small = vars.filter((v) => v.value.type === "prim");
  const big = vars.filter((v) => v.value.type === "ref");
  const calls = step.frames.slice(1);
  const isCheck = /^(Is |Keep looping)/.test(story.title);
  const finished = step.event === "end";
  const output = step.stdout.trim();
  const pointerColor = new Map(pointers.map((p) => [p.name, p.color]));
  const pct = total > 1 ? (index / (total - 1)) * 100 : 100;

  const storyCard = (
    <div key={index} className="fx-in rounded-2xl border border-slate-700/60 bg-slate-800/70 p-4 md:p-5">
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none md:text-4xl" aria-hidden="true">
          {isCheck ? "🤔" : TONE_EMOJI[story.tone]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {finished ? "All done" : isCheck ? "The computer checks" : "What just happened"}
          </p>
          <p className="mt-1 text-xl font-semibold leading-snug text-slate-50 md:text-2xl">{story.title}</p>
        </div>
      </div>
      {sum && (
        <div className="mt-3 rounded-xl bg-slate-900/70 px-4 py-3 font-code text-lg leading-relaxed md:text-xl">
          <div>
            <span className="text-sky-200">{sum.name}</span> <span className="text-slate-500">=</span> <span className="text-slate-300">{sum.expr}</span>
          </div>
          {sum.filled && (
            <div className="pl-[calc(var(--w)*1ch)]" style={{ ["--w" as string]: sum.name.length + 1 }}>
              <span className="text-slate-500">=</span> <span className="text-slate-100">{sum.filled}</span>
            </div>
          )}
          <div className="pl-[calc(var(--w)*1ch)]" style={{ ["--w" as string]: sum.name.length + 1 }}>
            <span className="text-slate-500">=</span> <span className="rounded-md bg-amber-300/20 px-1.5 font-bold text-amber-100">{sum.result}</span>
          </div>
        </div>
      )}
      {isCheck && prev?.condition && prev.condition.comparisons.length > 0 && (
        <ul className="mt-3 space-y-2">
          {prev.condition.comparisons.map((c, i) => (
            <CheckRow key={i} c={c} />
          ))}
        </ul>
      )}
      {hints.why && !finished && <p className="mt-3 text-base leading-relaxed text-slate-300 md:text-lg">{hints.why}</p>}
      {story.tone === "error" && <p className="mt-3 text-base text-rose-300">{story.details[0]}</p>}
      {hints.next && !finished && (
        <p className="mt-3 flex items-start gap-2 border-t border-slate-700/60 pt-3 text-sm text-slate-400 md:text-base">
          <span className="font-semibold text-red-300">Next →</span>
          <span className="font-code text-slate-300">{hints.next}</span>
        </p>
      )}
      {finished && output && (
        <p className="mt-3 text-lg text-slate-200">
          Answer: <span className="rounded-lg bg-emerald-400/15 px-2 py-0.5 font-code font-bold text-emerald-200">{output.split("\n").pop()}</span>
        </p>
      )}
    </div>
  );

  const picture = (
    <div className="flex flex-col gap-3">
      {calls.length > 0 && (
        <p className="flex flex-wrap items-center gap-1.5 text-sm text-slate-400">
          <span>Running inside</span>
          {calls.map((f, i) => (
            <span key={f.id} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">→</span>}
              <span className={cn("rounded-md px-2 py-0.5 font-code", i === calls.length - 1 ? "bg-cyan-400/15 text-cyan-200" : "bg-slate-800 text-slate-400")}>
                {f.name}(
                {calls.length > 1 && f.vars
                  .filter((v) => !v.closure && v.name !== "this" && v.value.type === "prim")
                  .slice(0, 2)
                  .map((v) => (v.value.type === "prim" ? v.value.value : ""))
                  .join(", ")}
                )
              </span>
            </span>
          ))}
          {calls.length > 1 && <span className="text-xs">({calls.length} calls deep)</span>}
        </p>
      )}

      {small.length > 0 && (
        <Section title="📦 Boxes (variables)">
          <div className="flex flex-wrap gap-3">
            {small.map((v) => {
              const key = `${frame.id}:${v.name}`;
              const isChanged = changes.vars.has(key);
              const color = pointerColor.get(v.name);
              return (
                <div key={v.name} className="flex flex-col items-center gap-1">
                  <span className={cn("font-code text-sm font-semibold", color ? color.text : "text-slate-300")}>{v.name}</span>
                  <span
                    key={isChanged ? `${v.name}-${index}` : v.name}
                    className={cn(
                      "inline-flex min-h-14 min-w-16 items-center justify-center rounded-2xl border-2 px-3 font-code text-2xl font-bold",
                      isChanged ? "fx-pop border-amber-300 bg-amber-300/15 text-amber-50" : color ? cn(color.border, "bg-slate-900 text-slate-50") : "border-slate-600 bg-slate-900 text-slate-50",
                    )}
                  >
                    {v.value.type === "prim" ? v.value.value : ""}
                  </span>
                  {isChanged && <Was value={changes.vars.get(key)} step={prev ?? step} names={names} />}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {big.map((v) => {
        const key = `${frame.id}:${v.name}`;
        const object = v.value.type === "ref" ? step.heap[v.value.id] : undefined;
        const kind = object?.kind === "array" ? "list" : object?.kind === "map" ? "map (key → value)" : object?.kind === "set" ? "set" : object?.kind === "object" ? (object.className ?? "object") : "";
        return (
          <section key={v.name} className={cn("rounded-2xl border bg-slate-800/40 p-4", changes.vars.has(key) ? "border-amber-300/70" : "border-slate-700/60")}>
            <h2 className="mb-3 flex items-baseline gap-2">
              <span className="font-code text-base font-bold text-slate-100">{v.name}</span>
              <span className="text-xs text-slate-500">{kind}</span>
              {changes.vars.has(key) && <span className="ml-auto"><Was value={changes.vars.get(key)} step={prev ?? step} names={names} /></span>}
            </h2>
            <Holding value={v.value} step={step} names={names} changes={changes} pointers={pointers} pointed={pointed} />
          </section>
        );
      })}

      {frame.returnValue && (
        <div className="fx-in rounded-2xl border-2 border-emerald-400/60 bg-emerald-400/10 p-4 text-lg text-emerald-100">
          🎁 {frame.name}() gives back <span className="font-code font-bold">{previewValue(frame.returnValue, step, names)}</span>
        </div>
      )}

      {small.length === 0 && big.length === 0 && !frame.returnValue && (
        <p className="rounded-2xl border border-dashed border-slate-700 p-4 text-center text-sm text-slate-500">No boxes yet. Press Next to start.</p>
      )}

      {output && (
        <Section title="🖨️ Printed on screen">
          <pre className="whitespace-pre-wrap font-code text-base text-emerald-200">{output.split("\n").slice(-4).join("\n")}</pre>
        </Section>
      )}
    </div>
  );

  const nextSpeed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Focus mode"
      className="fixed inset-0 z-[70] flex flex-col bg-slate-950 text-slate-200"
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        const end = e.changedTouches[0]?.clientX;
        if (start === null || end === undefined || Math.abs(end - start) < 70) return;
        if (end < start) onNext();
        else onBack();
      }}
    >
      {/* Top: title, language, exit */}
      <header className="flex items-center gap-3 border-b border-slate-800 px-3 py-2 md:px-5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-100 md:text-base">{title}</p>
          {goal && <p className="hidden truncate text-xs text-slate-400 md:block">{goal}</p>}
        </div>
        {langs.size > 1 && (
          <div role="tablist" aria-label="Code language" className="flex shrink-0 gap-0.5 rounded-lg bg-slate-900 p-0.5">
            {LANGS.filter((l) => langs.has(l.id)).map((l) => (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={lang === l.id}
                onClick={() => onLang(l.id)}
                className={cn("rounded-md px-2 py-1 text-xs font-medium", lang === l.id ? "bg-slate-700 text-slate-50" : "text-slate-400 hover:text-slate-200")}
              >
                {l.id === "js" ? "JS" : l.label}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={onExit}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Exit focus</span>
        </button>
      </header>

      {/* Middle: code + story/picture. Stacks on phones and iPad portrait. */}
      <main className="min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:overflow-hidden">
        <div className="flex flex-col gap-3 p-3 md:p-4 lg:hidden">{storyCard}</div>
        <div className="md:grid md:grid-cols-2 md:items-start lg:contents">
        <div className="h-[30vh] px-3 md:sticky md:top-0 md:h-[62vh] md:pl-4 md:pr-2 lg:static lg:h-full lg:py-4 lg:pl-5 lg:pr-2">
          <CodeTraceView
            fill
            large={wide}
            code={code}
            mapped={mapped}
            nextLine={finished ? 0 : step.line}
            doneLine={prev?.line ?? 0}
            isError={step.event === "exception"}
          />
        </div>
        <div className="scroll-quiet flex flex-col gap-3 p-3 md:pb-4 md:pl-2 md:pr-4 md:pt-0 lg:overflow-y-auto lg:py-4 lg:pl-2 lg:pr-5">
          <div className="hidden lg:block">{storyCard}</div>
          {picture}
        </div>
        </div>
      </main>

      {/* Bottom: the only controls */}
      <footer className="border-t border-slate-800 bg-slate-900/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:px-5">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <span className="w-16 shrink-0 text-xs text-slate-400 tabular-nums">
            {index + 1} / {total}
          </span>
          <div className="relative h-2 flex-1 rounded-full bg-slate-800">
            <div className="absolute inset-y-0 left-0 rounded-full bg-cyan-500" style={{ width: `${pct}%` }} />
            <input
              type="range"
              min={0}
              max={Math.max(total - 1, 0)}
              value={index}
              onChange={(e) => onJump(Number(e.target.value))}
              aria-label="Step"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
          <button
            type="button"
            onClick={() => onSpeed(nextSpeed)}
            className="w-12 shrink-0 rounded-md border border-slate-700 py-0.5 text-xs text-slate-300 hover:bg-slate-800"
            aria-label={`Speed ${speed}x, tap to change`}
          >
            {speed}×
          </button>
        </div>
        <div className="mx-auto mt-2 flex max-w-3xl items-center justify-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => onJump(0)}
            disabled={index === 0}
            aria-label="Start again"
            className="grid h-12 w-12 place-items-center rounded-full text-slate-400 hover:bg-slate-800 disabled:opacity-30"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onBack}
            disabled={index === 0}
            className="inline-flex h-14 items-center gap-1 rounded-2xl border border-slate-600 bg-slate-800 px-4 text-base font-semibold text-slate-100 hover:bg-slate-700 disabled:opacity-40 md:px-6"
          >
            <ChevronLeft className="h-5 w-5" /> Back
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={finished}
            aria-label={playing ? "Pause" : "Play"}
            className="grid h-14 w-14 place-items-center rounded-full border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:opacity-40"
          >
            {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={finished}
            className="inline-flex h-14 flex-1 items-center justify-center gap-1 rounded-2xl bg-cyan-500 px-5 text-lg font-bold text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 disabled:opacity-40 sm:flex-none sm:px-10"
          >
            {finished ? "Done 🎉" : "Next"} {!finished && <ChevronRight className="h-6 w-6" />}
          </button>
        </div>
        <p className="mt-1 hidden text-center text-[11px] text-slate-500 md:block">← → keys or swipe · Space to play · Esc to exit</p>
      </footer>
    </div>
  );
}
