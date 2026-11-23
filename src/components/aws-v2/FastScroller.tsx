"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  text: string;
  level: number;
  /** 0..1 position of the heading inside the scroll area. */
  at: number;
}

const HANDLE = 56;

function scroller(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-reader-scroll]");
}

/** Headings of the article with their position, in reading order. */
function readSections(el: HTMLElement): Section[] {
  const max = Math.max(1, el.scrollHeight - el.clientHeight);
  const base = el.getBoundingClientRect().top - el.scrollTop;
  return Array.from(el.querySelectorAll<HTMLElement>(".reader-article h2[id], .reader-article h3[id]")).map((h) => ({
    id: h.id,
    text: (h.textContent ?? "").trim(),
    level: h.tagName === "H2" ? 2 : 3,
    at: Math.min(1, Math.max(0, (h.getBoundingClientRect().top - base - 16) / max)),
  }));
}

/** The section the reader is in: the last heading above the top of the view. */
export function currentSectionIndex(sections: Section[], el: HTMLElement): number {
  const top = el.scrollTop + 96;
  const max = Math.max(1, el.scrollHeight - el.clientHeight);
  let index = -1;
  for (let i = 0; i < sections.length; i++) if (sections[i].at * max <= top) index = i;
  return index;
}

/**
 * A big Android-style fast-scroll handle on the right of the article. Drag it
 * and a bubble shows the section you are passing; dots on the track mark
 * every main section and jump there on click. It fades away when idle.
 */
export function FastScroller() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [ratio, setRatio] = useState(0);
  const [active, setActive] = useState(-1);
  const [dragging, setDragging] = useState(false);
  const [awake, setAwake] = useState(false);
  const [hoverTick, setHoverTick] = useState<number | null>(null);
  const [scrollable, setScrollable] = useState(false);
  const sleepTimer = useRef<number | undefined>(undefined);

  const wake = useCallback(() => {
    setAwake(true);
    window.clearTimeout(sleepTimer.current);
    sleepTimer.current = window.setTimeout(() => setAwake(false), 1400);
  }, []);

  // Measure headings now and whenever the article changes size (images, fonts, details opening).
  useEffect(() => {
    const el = scroller();
    if (!el) return;
    const measure = () => {
      setSections(readSections(el));
      setScrollable(el.scrollHeight > el.clientHeight + 40);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    const article = el.querySelector(".reader-article");
    if (article) observer.observe(article);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = scroller();
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setRatio(max > 0 ? el.scrollTop / max : 0);
      setActive(currentSectionIndex(sections, el));
      wake();
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [sections, wake]);

  const scrollToRatio = (r: number, smooth = false) => {
    const el = scroller();
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    el.scrollTo({ top: Math.min(1, Math.max(0, r)) * max, behavior: smooth ? "smooth" : "instant" });
  };

  const ratioFromPointer = (clientY: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    return (clientY - rect.top - HANDLE / 2) / Math.max(1, rect.height - HANDLE);
  };

  if (!scrollable) return null;
  const trackHeight = trackRef.current?.clientHeight ?? 0;
  const handleTop = ratio * Math.max(0, trackHeight - HANDLE);
  const shown = awake || dragging || hoverTick !== null;
  const bubble = dragging ? sections[active] : hoverTick !== null ? sections[hoverTick] : null;
  const mainCount = sections.filter((s) => s.level === 2).length;

  return (
    <div
      className="pointer-events-none absolute inset-y-2 right-0 z-20 hidden w-10 lg:block"
      onPointerEnter={wake}
      aria-hidden="true"
    >
      <div
        ref={trackRef}
        className="pointer-events-auto absolute inset-y-0 right-1 w-7 cursor-pointer"
        onPointerMove={wake}
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).dataset.handle) return;
          scrollToRatio(ratioFromPointer(event.clientY), true);
        }}
      >
        {/* rail */}
        <div className={cn("absolute inset-y-0 right-3 w-1 rounded-full bg-slate-700/40 transition-opacity duration-300", shown ? "opacity-100" : "opacity-0")} />

        {/* section dots (main sections only, so the rail stays calm) */}
        {sections.map((section, index) =>
          section.level === 2 || mainCount === 0 ? (
            <button
              key={section.id}
              type="button"
              tabIndex={-1}
              className={cn(
                "absolute right-[9px] h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 transition-all duration-300",
                index <= active ? "border-cyan-400 bg-cyan-400" : "border-slate-500 bg-slate-900",
                shown ? "opacity-100" : "opacity-0",
                hoverTick === index && "scale-150",
              )}
              style={{ top: `calc(${HANDLE / 2}px + ${section.at} * (100% - ${HANDLE}px))` }}
              onPointerEnter={() => setHoverTick(index)}
              onPointerLeave={() => setHoverTick(null)}
              onPointerDown={(event) => {
                event.stopPropagation();
                document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          ) : null,
        )}

        {/* the big handle: a half-pill tab hugging the right edge */}
        <div
          data-handle="1"
          className={cn(
            "absolute right-0 flex w-5 touch-none select-none flex-col items-center justify-center gap-1 rounded-l-full border border-r-0 shadow-lg transition-[width,background-color,opacity] duration-200",
            dragging ? "w-7 cursor-grabbing border-cyan-300 bg-cyan-400" : "cursor-grab border-slate-600 bg-slate-800 hover:w-7 hover:bg-slate-700",
            shown ? "opacity-100" : "opacity-60",
          )}
          style={{ top: handleTop, height: HANDLE }}
          onPointerDown={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
            setDragging(true);
            wake();
          }}
          onPointerMove={(event) => {
            if (!dragging) return;
            scrollToRatio(ratioFromPointer(event.clientY));
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} data-handle="1" className={cn("h-0.5 w-2.5 rounded-full", dragging ? "bg-slate-950/70" : "bg-slate-400")} />
          ))}
        </div>

        {/* section bubble next to the handle (or the hovered dot) */}
        {bubble && (
          <div
            className="pointer-events-none absolute right-10 w-max max-w-[20rem] -translate-y-1/2 rounded-2xl rounded-r-md border border-cyan-400/50 bg-slate-900/95 px-4 py-2 shadow-2xl backdrop-blur"
            style={{
              top:
                dragging || hoverTick === null
                  ? handleTop + HANDLE / 2
                  : `calc(${HANDLE / 2}px + ${sections[hoverTick].at} * (100% - ${HANDLE}px))`,
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
              Section {sections.indexOf(bubble) + 1} of {sections.length}
            </p>
            <p className={cn("font-semibold leading-snug text-slate-100", bubble.level === 2 ? "text-base" : "text-sm")}>{bubble.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
