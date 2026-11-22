"use client";

import { useEffect, useRef } from "react";
import { Bookmark, BookmarkCheck, CheckCircle2, Circle } from "lucide-react";
import { useStudy } from "@/lib/study";
import { cn } from "@/lib/utils";

function scroller(): HTMLElement | null {
  const el = document.querySelector<HTMLElement>("[data-reader-scroll]");
  return el && el.scrollHeight > el.clientHeight + 4 ? el : null;
}

export function PageActions({
  id,
  title,
  href,
  track,
}: {
  id: string;
  title: string;
  href: string;
  track: string;
}) {
  const { study, toggleDone, toggleMark, setLast } = useStudy();
  const done = !!study.done[id];
  const marked = !!study.marks[id];
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resume the saved scroll position when opened from "Continue reading"
  useEffect(() => {
    if (!window.location.search.includes("resume=1")) return;
    const pct = study.last?.href === href ? study.last.pct : 0;
    if (!pct) return;
    const t = setTimeout(() => {
      const el = scroller();
      if (el) el.scrollTop = ((el.scrollHeight - el.clientHeight) * pct) / 100;
      else window.scrollTo(0, ((document.documentElement.scrollHeight - window.innerHeight) * pct) / 100);
    }, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [href]);

  // Remember where the reader is (throttled)
  useEffect(() => {
    const save = () => {
      const el = scroller();
      const top = el ? el.scrollTop : window.scrollY;
      const max = el ? el.scrollHeight - el.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.round((top / max) * 100) : 0;
      setLast({ href, title, pct, t: Date.now(), track });
    };
    const onScroll = (e: Event) => {
      const t = e.target;
      const ok = t instanceof Document || (t instanceof HTMLElement && t.hasAttribute("data-reader-scroll"));
      if (!ok) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(save, 400);
    };
    document.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("scroll", onScroll, true);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [href, title, track, setLast]);

  const btn = "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors";
  return (
    <div className="mt-4 flex flex-wrap gap-2" data-reader-hide>
      <button
        type="button"
        onClick={() => toggleDone(id)}
        aria-pressed={done}
        className={cn(btn, done ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300" : "border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-400")}
      >
        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
        {done ? "Done" : "Mark as done"}
      </button>
      <button
        type="button"
        onClick={() => toggleMark(id, title, href)}
        aria-pressed={marked}
        className={cn(btn, marked ? "border-amber-400/60 bg-amber-400/10 text-amber-300" : "border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-400")}
      >
        {marked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
        {marked ? "Bookmarked" : "Bookmark"}
      </button>
    </div>
  );
}
