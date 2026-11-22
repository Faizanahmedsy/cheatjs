"use client";

import Link from "next/link";
import { BookOpen, Bookmark, Brain, Play } from "lucide-react";
import { useStudy } from "@/lib/study";

export type DashTrack = {
  id: string;
  label: string;
  base: string;
  pages: { slug: string; title: string; icon: string; href: string }[];
};

export function StudyDashboard({
  tracks,
  trackId,
  compact = false,
}: {
  tracks: DashTrack[];
  trackId?: string;
  compact?: boolean;
}) {
  const { study } = useStudy();
  const shown = trackId ? tracks.filter((t) => t.id === trackId) : tracks;
  const last = study.last && (!trackId || study.last.track === trackId) ? study.last : undefined;
  const marks = Object.entries(study.marks)
    .filter(([k]) => !trackId || k.startsWith(`${trackId}:`))
    .sort((a, b) => b[1].t - a[1].t);
  const now = Date.now();
  const cardEntries = Object.entries(study.cards).filter(([k]) => !trackId || k.startsWith(`${trackId}:`));
  const weak = cardEntries.filter(([, c]) => c.weak).length;
  const due = cardEntries.filter(([, c]) => c.due <= now).length;
  const learned = cardEntries.filter(([, c]) => c.box >= 4).length;

  return (
    <section aria-label="Your study progress" className="mb-10 rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
      <h2 className="mb-3 font-headline text-lg font-bold text-slate-100">Your progress</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {shown.map((t) => {
          const pages = t.pages.filter((p) => p.slug !== "home");
          const done = pages.filter((p) => study.done[`${t.id}:${p.slug}`]).length;
          const pct = pages.length ? Math.round((done / pages.length) * 100) : 0;
          return (
            <div key={t.id}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <Link href={t.base} className="font-semibold text-slate-200 hover:text-cyan-300">{t.label}</Link>
                <span className="text-slate-400">{done}/{pages.length} done · {pct}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-700" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-emerald-400 transition-[width]" style={{ width: `${pct}%` }} />
              </div>
              {!compact ? (
                <ul className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  {pages.map((p) => {
                    const d = !!study.done[`${t.id}:${p.slug}`];
                    return (
                      <li key={p.slug}>
                        <Link href={p.href} className={`rounded-full border px-2 py-0.5 ${d ? "border-emerald-400/50 text-emerald-300" : "border-slate-600 text-slate-400 hover:text-slate-200"}`}>
                          {d ? "✓ " : ""}{p.icon} {p.title.replace(/^(AWS SAA-C03|Generative AI):?\s*/i, "")}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {last ? (
          <Link href={`${last.href}?resume=1`} className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-900">
            <Play className="h-4 w-4" /> Continue: {last.title} ({last.pct}%)
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 text-sm text-slate-400"><BookOpen className="h-4 w-4" /> Open any page and your place is saved here.</span>
        )}
        <Link href="/flashcards" className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 hover:border-cyan-400">
          <Brain className="h-4 w-4" /> Flashcards{cardEntries.length ? ` · ${due} due · ${weak} weak · ${learned} learned` : ""}
        </Link>
      </div>

      {marks.length ? (
        <div className="mt-4">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400"><Bookmark className="h-3.5 w-3.5" /> Bookmarks</p>
          <ul className="flex flex-wrap gap-2 text-sm">
            {marks.map(([k, m]) => (
              <li key={k}><Link href={m.href} className="rounded-md border border-amber-400/40 px-2 py-1 text-amber-300 hover:bg-amber-400/10">{m.title}</Link></li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
