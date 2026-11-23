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

  return (
    <>
      <p className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
        On this page
        <span className="normal-case tracking-normal text-slate-600" title="Press J for next section, K for previous">
          <kbd className="rounded border border-slate-700 px-1">J</kbd> <kbd className="rounded border border-slate-700 px-1">K</kbd>
        </span>
      </p>
      <ul ref={listRef} className="space-y-0.5 border-l border-slate-700/60 text-sm">
        {toc.map((t) => {
          const on = t.id === active;
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
                  "-ml-px block border-l-2 py-1 transition-colors",
                  t.level === 3 ? "pl-6 text-[13px]" : "pl-3 font-medium",
                  on ? "border-cyan-400 bg-cyan-400/10 text-cyan-200" : "border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-200",
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
