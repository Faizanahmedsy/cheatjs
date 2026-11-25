"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LESSONS, findLesson } from "@/lib/deep-dive/lessons";
import { highlightLine } from "@/components/deep-dive/highlight";
import { IsoStage } from "./IsoStage";
import { cn } from "@/lib/utils";

export function DeepDive({ slug }: { slug: string }) {
  const lesson = findLesson(slug)!;
  const [index, setIndex] = useState(0);
  const step = lesson.steps[index];
  const total = lesson.steps.length;
  const lessonNo = LESSONS.findIndex((l) => l.slug === slug);
  const next = LESSONS[lessonNo + 1];
  const railRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  const go = (i: number) => setIndex(Math.max(0, Math.min(total - 1, i)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName)) return;
      if (e.key === "ArrowRight") setIndex((i) => Math.min(total - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  useEffect(() => {
    railRef.current?.querySelector(`[data-i="${index}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    codeRef.current?.querySelector("[data-hot]")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [index]);

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 text-slate-100 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <Link href="/deep-dive" className="text-xs text-slate-500 hover:text-slate-300">
            Deep Dive
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{lesson.title}</h1>
        </div>
        <p className="text-xs text-slate-500">
          {lesson.question} · {lesson.group} · {lessonNo + 1} of {LESSONS.length}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="relative h-[46vh] min-h-[300px] overflow-hidden rounded-3xl bg-slate-900/40 ring-1 ring-slate-800/60 lg:h-[62vh]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.04),transparent_70%)]" />
            <div className="relative h-full p-4">
              <IsoStage step={step} all={lesson.steps} />
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/70 p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>In this lesson</span>
              <span>
                Step {index + 1} of {total} · ← → keys
              </span>
            </div>
            <div ref={railRef} className="flex gap-1 overflow-x-auto pb-1">
              {lesson.steps.map((s, i) => (
                <button
                  key={i}
                  data-i={i}
                  onClick={() => go(i)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-left text-xs transition-colors",
                    i === index ? "bg-cyan-500 text-white" : i < index ? "text-slate-300 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-800",
                  )}
                >
                  <span className="mr-1.5 font-code opacity-60">{i + 1}</span>
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <section className="rounded-3xl bg-slate-900/70 p-5">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">
              Step {index + 1} / {total}
            </p>
            <AnimatePresence mode="wait">
              <motion.div key={index} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                <h2 className="mt-1 text-lg font-semibold">{step.title}</h2>
                <p className="mt-2 min-h-[7.5rem] text-[15px] leading-relaxed text-slate-300">{step.text}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-3 flex gap-2">
              <button onClick={() => go(index - 1)} disabled={index === 0} className="rounded-full bg-slate-800/80 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-40">
                Back
              </button>
              {index < total - 1 ? (
                <button onClick={() => go(index + 1)} className="flex-1 truncate rounded-full bg-cyan-500 px-4 py-2.5 text-left text-sm font-medium text-white transition hover:bg-cyan-600">
                  Next: {lesson.steps[index + 1].title}
                </button>
              ) : next ? (
                <Link href={`/deep-dive/${next.slug}`} className="flex-1 truncate rounded-full bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-600">
                  Next lesson: {next.title}
                </Link>
              ) : (
                <Link href="/deep-dive" className="flex-1 rounded-full bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white">
                  All lessons
                </Link>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl bg-slate-900/70">
            <p className="px-5 pt-4 pb-2 text-sm font-medium">Code</p>
            <div ref={codeRef} className="max-h-[300px] overflow-auto py-2 font-code text-[12.5px] leading-6">
              {lesson.code.map((line, i) => {
                const hot = step.lines.includes(i + 1);
                return (
                  <div key={i} data-hot={hot || undefined} className={cn("flex border-l-2 pr-3 transition-colors duration-300", hot ? "border-cyan-500 bg-cyan-500/10" : "border-transparent")}>
                    <span className="w-8 shrink-0 select-none pr-2 text-right text-slate-600">{i + 1}</span>
                    <span className="whitespace-pre">{highlightLine(line)}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl bg-slate-900/70 p-5">
            <p className="mb-2 text-sm font-medium">State</p>
            <div className="space-y-2.5">
              {step.state.map((row) => (
                <div key={row.label} className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 w-full text-xs text-slate-500">{row.label}</span>
                  {row.value.map((v, i) => (
                    <motion.span
                      key={`${row.label}-${v}-${i}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-full bg-slate-800 px-2.5 py-0.5 font-code text-xs text-slate-200"
                    >
                      {v}
                    </motion.span>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <details className="mt-6 max-w-3xl text-sm text-slate-400">
        <summary className="cursor-pointer text-slate-500 hover:text-slate-300">The question</summary>
        <p className="mt-2">{lesson.problem}</p>
      </details>
    </main>
  );
}
