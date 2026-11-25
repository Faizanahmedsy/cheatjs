"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, ArrowUpRight, BarChart3, ChevronUp, Download, Layers, Maximize2, Menu, Moon, Search, Share2, Sun, X, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { ARCHIVED, BILLU, SUBJECTS, type Subject } from "@/lib/subjects";
import { setReadingFocus } from "@/lib/reading-focus";

interface MobileBarProps {
  current: Subject | null;
  onSearch: () => void;
  /** Only on pages that can export a PDF. */
  onPdf?: () => void;
}

/**
 * Phones only. One quiet row: search on the left, the subject switcher in the
 * middle (tap: the four subjects pop up above), everything else behind ☰
 * (an Opera-style panel).
 */
export function MobileBar({ current, onSearch, onPdf }: MobileBarProps) {
  const pathname = usePathname();
  const [subjects, setSubjects] = useState(false);
  const [more, setMore] = useState(false);
  const [light, setLight] = useState(false);

  useEffect(() => {
    setSubjects(false);
    setMore(false);
  }, [pathname]);
  useEffect(() => {
    if (more) setLight(document.documentElement.dataset.mode === "light");
  }, [more]);
  useEffect(() => {
    if (!subjects && !more) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSubjects(false);
        setMore(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [subjects, more]);

  const flipTheme = () => {
    // The navbar's theme button owns the saved setting; press it.
    document.querySelector<HTMLElement>('[data-shortcut="theme"]')?.click();
    setLight((v) => !v);
  };
  const share = async () => {
    const data = { title: document.title, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard.writeText(data.url);
    } catch {
      // Cancelled.
    }
  };

  const round = "grid h-12 w-12 shrink-0 place-items-center rounded-full border border-slate-700 bg-slate-900/95 text-slate-200 shadow-lg shadow-black/30 backdrop-blur";

  return (
    <>
      {(subjects || more) && (
        <button
          type="button"
          aria-label="Close"
          tabIndex={-1}
          onClick={() => {
            setSubjects(false);
            setMore(false);
          }}
          data-chrome
          className="fixed inset-0 z-[49] bg-black/40 backdrop-blur-[1px] md:hidden"
        />
      )}

      <div data-chrome className="mobile-bar fixed inset-x-3 bottom-3 z-50 md:hidden">
        {/* Subjects pop-up */}
        {subjects && (
          <nav aria-label="Subjects" className="fx-in absolute inset-x-0 bottom-full mb-2 flex justify-around rounded-full border border-slate-700 bg-slate-900 p-1.5 shadow-xl shadow-black/40">
            {SUBJECTS.map((s) => {
              const on = current?.id === s.id;
              return (
                <Link
                  key={s.id}
                  href={s.tabs[0].href}
                  onClick={() => setSubjects(false)}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex flex-1 flex-col items-center rounded-full py-1.5 text-[11px] font-semibold leading-tight",
                    on ? "bg-cyan-500 text-white" : "text-slate-300 hover:bg-slate-800",
                  )}
                >
                  <span aria-hidden="true" className="text-xl leading-none">{s.emoji}</span>
                  {s.label === "JavaScript" ? "JS" : s.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* More panel (Opera style) */}
        {more && (
          <div role="dialog" aria-label="More" className="fx-in absolute inset-x-0 bottom-full mb-2 space-y-3 rounded-3xl border border-slate-700 bg-slate-900 p-3 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-800/70 p-3">
              <Image src={BILLU.mascot} alt="" width={44} height={44} className="h-11 w-11 rounded-full bg-[#fdf3dc] object-contain p-0.5" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-50">Billu Class</p>
                <p className="truncate text-xs text-slate-400">Free lessons by Ustad Billu</p>
              </div>
              <a href={BILLU.site} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200">
                Ustad Billu <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: light ? "Dark mode" : "White mode", icon: light ? Moon : Sun, onClick: flipTheme, on: light },
                { label: "YouTube", icon: Youtube, href: BILLU.youtube },
                { label: "Focus", icon: Maximize2, onClick: () => { setMore(false); setReadingFocus(true); } },
                { label: "Share", icon: Share2, onClick: share },
              ].map((t) => {
                const inner = (
                  <>
                    <span className={cn("grid h-12 w-full place-items-center rounded-2xl", t.on ? "bg-cyan-500/90 text-white" : "bg-slate-800 text-slate-200")}>
                      <t.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-[11px] text-slate-300">{t.label}</span>
                  </>
                );
                return t.href ? (
                  <a key={t.label} href={t.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1">
                    {inner}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <button key={t.label} type="button" onClick={t.onClick} className="flex flex-col items-center gap-1">
                    {inner}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link href="/study" className="flex items-center gap-2.5 rounded-2xl bg-slate-800 px-3 py-3 text-sm font-medium text-slate-100">
                <BarChart3 className="h-4 w-4 text-cyan-300" aria-hidden="true" /> My progress
              </Link>
              <Link href="/flashcards" className="flex items-center gap-2.5 rounded-2xl bg-slate-800 px-3 py-3 text-sm font-medium text-slate-100">
                <Layers className="h-4 w-4 text-cyan-300" aria-hidden="true" /> Flashcards
              </Link>
              {onPdf && (
                <button
                  type="button"
                  onClick={() => {
                    setMore(false);
                    onPdf();
                  }}
                  className="col-span-2 flex items-center gap-2.5 rounded-2xl bg-slate-800 px-3 py-3 text-sm font-medium text-slate-100"
                >
                  <Download className="h-4 w-4 text-cyan-300" aria-hidden="true" /> Download cheatsheets as PDF
                </button>
              )}
            </div>

            <div className="rounded-2xl bg-slate-800/50 p-2">
              <p className="flex items-center gap-1.5 px-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <Archive className="h-3 w-3" aria-hidden="true" /> Archived
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ARCHIVED.map((a) => (
                  <Link key={a.href} href={a.href} className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300">
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* The bar itself: one row */}
        <nav aria-label="Quick navigation" className="flex items-center gap-2">
          <button type="button" onClick={onSearch} aria-label="Search" className={round}>
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setMore(false);
              setSubjects((v) => !v);
            }}
            aria-expanded={subjects}
            aria-label="Choose a subject"
            className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/95 px-4 text-sm font-semibold text-slate-100 shadow-lg shadow-black/30 backdrop-blur"
          >
            <span aria-hidden="true" className="text-lg leading-none">{current?.emoji ?? ""}</span>
            <span className="truncate">{current?.label ?? "Subjects"}</span>
            <ChevronUp className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", subjects ? "" : "rotate-180")} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSubjects(false);
              setMore((v) => !v);
            }}
            aria-expanded={more}
            aria-label={more ? "Close menu" : "More"}
            className={cn(round, more && "bg-slate-100 text-slate-900")}
          >
            {more ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>
    </>
  );
}
