"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, RotateCcw, Shuffle, X } from "lucide-react";
import type { Card } from "@/lib/flashcards";
import { useStudy } from "@/lib/study";
import { cn } from "@/lib/utils";

type Unit = { track: string; slug: string; title: string; trackLabel: string };
type Mode = "cards" | "quiz";
type Scope = "due" | "weak" | "all";

const KIND_LABEL: Record<Card["kind"], string> = {
  term: "Term",
  exam: "Exam clue",
  qa: "Question",
  topic: "Concept",
  trap: "Traps",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const chip = (on: boolean) =>
  cn(
    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
    on ? "border-cyan-400 bg-cyan-400/15 text-cyan-300" : "border-slate-600 text-slate-300 hover:border-slate-400"
  );

export function FlashcardApp({ cards, units }: { cards: Card[]; units: Unit[] }) {
  const { study, grade, resetCards } = useStudy();
  const [mode, setMode] = useState<Mode>("cards");
  const [scope, setScope] = useState<Scope>("due");
  const [trackF, setTrackF] = useState<string>("all");
  const [unitF, setUnitF] = useState<string>("all");
  const [kinds, setKinds] = useState<Set<Card["kind"]>>(new Set(["term", "exam", "topic", "trap", "qa"]));
  const [order, setOrder] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [session, setSession] = useState({ right: 0, wrong: 0 });
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);

  const pool = useMemo(() => {
    const now = Date.now();
    return cards.filter((c) => {
      if (mode === "quiz" ? c.kind !== "qa" : !kinds.has(c.kind)) return false;
      if (trackF !== "all" && c.track !== trackF) return false;
      if (unitF !== "all" && `${c.track}:${c.slug}` !== unitF) return false;
      const st = study.cards[c.id];
      if (scope === "weak") return !!st?.weak;
      if (scope === "due") return !st || st.due <= now;
      return true;
    });
  }, [cards, mode, kinds, trackF, unitF, scope, study.cards]);

  // Rebuild the deck only when the filters change, not after every grade
  const poolKey = pool.map((c) => c.id).join("|");
  const filterKey = `${mode}|${scope}|${trackF}|${unitF}|${[...kinds].sort().join(",")}`;
  useEffect(() => {
    setOrder(shuffle(pool.map((c) => c.id)));
    setIdx(0);
    setFlipped(false);
    setPicked([]);
    setRevealed(false);
    setSession({ right: 0, wrong: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, hydrated]);

  const card = order[idx] ? byId.get(order[idx]) : undefined;
  const finished = order.length > 0 && idx >= order.length;

  const next = useCallback(() => {
    setIdx((i) => i + 1);
    setFlipped(false);
    setPicked([]);
    setRevealed(false);
  }, []);

  const rate = useCallback(
    (good: boolean) => {
      if (!card) return;
      grade(card.id, good);
      setSession((s) => ({ right: s.right + (good ? 1 : 0), wrong: s.wrong + (good ? 0 : 1) }));
      next();
    },
    [card, grade, next]
  );

  useEffect(() => {
    if (mode !== "cards") return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "SELECT") return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped((f) => !f); }
      else if (flipped && (e.key === "ArrowLeft" || e.key === "1")) rate(false);
      else if (flipped && (e.key === "ArrowRight" || e.key === "2")) rate(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, flipped, rate]);

  const letters = card?.answer?.split(",") ?? [];
  const multi = letters.length > 1;
  const submitQuiz = () => {
    if (!card) return;
    const good = picked.length === letters.length && picked.every((p) => letters.includes(p));
    grade(card.id, good);
    setSession((s) => ({ right: s.right + (good ? 1 : 0), wrong: s.wrong + (good ? 0 : 1) }));
    setRevealed(true);
  };

  const all = cards.length;
  const stats = {
    learned: cards.filter((c) => (study.cards[c.id]?.box ?? 0) >= 4).length,
    weak: cards.filter((c) => study.cards[c.id]?.weak).length,
    seen: cards.filter((c) => study.cards[c.id]).length,
  };
  const visibleUnits = units.filter((u) => trackF === "all" || u.track === trackF);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-slate-50">
      <h1 className="font-headline text-3xl font-bold text-slate-100">Flashcards and quiz</h1>
      <p className="mt-1 text-sm text-slate-400">
        Made automatically from your Notion notes: {all} cards. Cards you get wrong come back sooner. Progress is saved in this browser.
      </p>
      <p className="mt-2 text-xs text-slate-500">{stats.seen} seen · {stats.learned} learned · {stats.weak} weak</p>

      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button className={chip(mode === "cards")} onClick={() => setMode("cards")}>Flashcards</button>
          <button className={chip(mode === "quiz")} onClick={() => setMode("quiz")}>Quiz (multiple choice)</button>
          <span className="mx-1 text-slate-600">|</span>
          {(["due", "weak", "all"] as Scope[]).map((s) => (
            <button key={s} className={chip(scope === s)} onClick={() => setScope(s)}>
              {s === "due" ? "Due + new" : s === "weak" ? "Weak only" : "Everything"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Track" value={trackF} onChange={(e) => { setTrackF(e.target.value); setUnitF("all"); }} className="rounded-md border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm">
            <option value="all">All tracks</option>
            <option value="aws">AWS SAA</option>
            <option value="gen-ai">Gen AI</option>
          </select>
          <select aria-label="Chapter" value={unitF} onChange={(e) => setUnitF(e.target.value)} className="max-w-full rounded-md border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm">
            <option value="all">All chapters</option>
            {visibleUnits.map((u) => <option key={`${u.track}:${u.slug}`} value={`${u.track}:${u.slug}`}>{u.trackLabel}: {u.title}</option>)}
          </select>
        </div>
        {mode === "cards" ? (
          <div className="flex flex-wrap gap-2">
            {(Object.keys(KIND_LABEL) as Card["kind"][]).map((k) => (
              <button key={k} className={chip(kinds.has(k))} onClick={() => setKinds((prev) => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; })}>
                {KIND_LABEL[k]}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        {!hydrated ? null : order.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-6 text-center text-slate-300">
            No cards here. {scope !== "all" ? "Try “Everything”, or come back when cards are due." : "Pick other filters, or connect more Notion pages."}
          </div>
        ) : finished ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-6 text-center">
            <p className="text-lg font-bold text-slate-100">Round finished</p>
            <p className="mt-1 text-slate-300">{session.right} right · {session.wrong} to practise again</p>
            <div className="mt-4 flex justify-center gap-2">
              <button className={chip(true)} onClick={() => { setOrder(shuffle(pool.map((c) => c.id))); setIdx(0); setSession({ right: 0, wrong: 0 }); }}>
                <Shuffle className="mr-1 inline h-3.5 w-3.5" /> Go again
              </button>
              <button className={chip(false)} onClick={() => setScope("weak")}>Practise weak cards</button>
            </div>
          </div>
        ) : card ? (
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span>{idx + 1} / {order.length} · {card.unit.replace(/^(AWS SAA-C03|Generative AI):?\s*/i, "")} · {card.topic}</span>
              <span>{KIND_LABEL[card.kind]}</span>
            </div>

            {mode === "cards" ? (
              <>
                <button
                  type="button"
                  onClick={() => setFlipped((f) => !f)}
                  className="flex min-h-[14rem] w-full flex-col justify-center rounded-xl border border-slate-600 bg-slate-800 p-6 text-left shadow-lg"
                  aria-label="Flip card"
                >
                  <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">{flipped ? "Answer" : "Question"}</span>
                  <span className="whitespace-pre-line text-lg leading-relaxed text-slate-100">{flipped ? card.back : card.front}</span>
                  {!flipped && card.options ? (
                    <span className="mt-3 block space-y-1 text-sm text-slate-300">{card.options.map((o) => <span key={o} className="block">{o}</span>)}</span>
                  ) : null}
                  {!flipped ? <span className="mt-4 text-xs text-slate-500">Tap or press Space to flip</span> : null}
                </button>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button disabled={!flipped} onClick={() => rate(false)} className="flex items-center justify-center gap-2 rounded-lg border border-red-400/50 bg-red-400/10 py-3 text-sm font-semibold text-red-300 disabled:opacity-40"><X className="h-4 w-4" /> Again (←)</button>
                  <button disabled={!flipped} onClick={() => rate(true)} className="flex items-center justify-center gap-2 rounded-lg border border-emerald-400/50 bg-emerald-400/10 py-3 text-sm font-semibold text-emerald-300 disabled:opacity-40"><Check className="h-4 w-4" /> Got it (→)</button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-slate-600 bg-slate-800 p-5">
                <p className="whitespace-pre-line text-lg text-slate-100">{card.front}</p>
                {multi ? <p className="mt-1 text-xs text-amber-300">Choose {letters.length} answers</p> : null}
                <div className="mt-4 space-y-2">
                  {card.options?.map((o) => {
                    const letter = o[0];
                    const on = picked.includes(letter);
                    const right = letters.includes(letter);
                    return (
                      <button
                        key={o}
                        disabled={revealed}
                        onClick={() => setPicked((p) => (multi ? (on ? p.filter((x) => x !== letter) : [...p, letter]) : [letter]))}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                          revealed
                            ? right ? "border-emerald-400 bg-emerald-400/15 text-emerald-200" : on ? "border-red-400 bg-red-400/15 text-red-200" : "border-slate-700 text-slate-400"
                            : on ? "border-cyan-400 bg-cyan-400/15 text-cyan-200" : "border-slate-600 text-slate-200 hover:border-slate-400"
                        )}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
                {revealed ? (
                  <>
                    <p className="mt-4 whitespace-pre-line text-sm text-slate-300">{card.back}</p>
                    <button onClick={next} className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900">Next question</button>
                  </>
                ) : (
                  <button disabled={picked.length === 0} onClick={submitQuiz} className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-40">Check answer</button>
                )}
                <p className="mt-3 text-xs text-slate-500">This round: {session.right} right · {session.wrong} wrong</p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <button onClick={() => { if (confirm("Clear all flashcard progress?")) resetCards(); }} className="mt-8 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300">
        <RotateCcw className="h-3.5 w-3.5" /> Reset flashcard progress
      </button>
      <span className="hidden">{poolKey.length}</span>
    </main>
  );
}
