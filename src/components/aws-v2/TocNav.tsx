"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Item = { id: string; text: string; level: number };

/**
 * The "On this page" list with a live highlight of the section being read,
 * smooth jumps, and J / K to go to the next / previous section.
 */
export function TocNav({ toc }: { toc: Item[] }) {
  const [active, setActive] = useState<string | null>(toc[0]?.id ?? null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>("[data-reader-scroll]");
    const target: HTMLElement | Window = el && el.scrollHeight > el.clientHeight ? el : window;
    const headings = () => toc.map((t) => document.getElementById(t.id)).filter((h): h is HTMLElement => Boolean(h));
    const onScroll = () => {
      const limit = 110;
      let current: string | null = toc[0]?.id ?? null;
      for (const h of headings()) if (h.getBoundingClientRect().top <= limit + 70) current = h.id;
      setActive(current);
    };
    onScroll();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [toc]);

  // Keep the highlighted item visible inside the side panel.
  useEffect(() => {
    const list = listRef.current;
    const item = list?.querySelector<HTMLElement>(`[data-toc="${active}"]`);
    const panel = list?.closest("aside");
    if (!item || !panel) return;
    const top = item.offsetTop - panel.clientHeight / 2;
    panel.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [active]);

  // J / K: next / previous section.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const t = event.target as HTMLElement;
      if (event.ctrlKey || event.metaKey || event.altKey || /INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable) return;
      if (event.key !== "j" && event.key !== "k") return;
      const index = Math.max(0, toc.findIndex((x) => x.id === active));
      const next = toc[event.key === "j" ? Math.min(toc.length - 1, index + 1) : Math.max(0, index - 1)];
      document.getElementById(next.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toc, active]);

  const parentOf = (index: number) => {
    for (let i = index; i >= 0; i--) if (toc[i].level === 2) return toc[i].id;
    return null;
  };
  const activeIndex = toc.findIndex((t) => t.id === active);
  const activeParent = activeIndex >= 0 ? parentOf(activeIndex) : null;

  return (
    <>
      <p className="mb-3 flex items-center justify-between text-[15px] font-semibold text-slate-100">
        In this article
        <span className="text-[11px] font-normal text-slate-500" title="Press J for next section, K for previous">
          <kbd className="rounded border border-slate-700 px-1">J</kbd> <kbd className="rounded border border-slate-700 px-1">K</kbd>
        </span>
      </p>
      <ul ref={listRef} className="space-y-0.5 text-sm">
        {toc.map((t, index) => {
          const on = t.id === active;
          // Sub-sections only show under the main section being read, so the list stays short.
          if (t.level === 3 && parentOf(index) !== activeParent) return null;
          return (
            <li key={t.id} data-toc={t.id}>
              <a
                href={`#${t.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById(t.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  history.replaceState(null, "", `#${t.id}`);
                }}
                className={cn(
                  "block rounded-md py-1 pr-2 transition-colors",
                  t.level === 3 ? "pl-5 text-[13px]" : "pl-2 text-[14px]",
                  on ? "bg-slate-800 font-medium text-slate-50" : "text-slate-400 hover:text-slate-100",
                )}
              >
                {t.text}
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}
