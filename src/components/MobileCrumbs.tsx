"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Home } from "lucide-react";
import { ARCHIVED, findSubject } from "@/lib/subjects";

/** The last crumb (the page you are on). Pages set it with <CrumbLeaf>. */
type Leaf = { label: string; onOpen?: () => void } | null;
let leaf: Leaf = null;
const listeners = new Set<() => void>();
function setLeaf(next: Leaf) {
  leaf = next;
  listeners.forEach((l) => l());
}
function useLeaf(): Leaf {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => leaf,
    () => null,
  );
}

/** Put this on a page to name it in the breadcrumbs. `onOpen` makes the name a button (e.g. open the topic list). */
export function CrumbLeaf({ label, onOpen }: { label: string; onOpen?: () => void }) {
  useEffect(() => {
    setLeaf({ label, onOpen });
    return () => setLeaf(null);
  }, [label, onOpen]);
  return null;
}

type Crumb = { label: string; href?: string };

/** Phones and iPad portrait: Home › Subject › Page › This page. */
export function MobileCrumbs() {
  const pathname = usePathname();
  const current = useLeaf();
  const [track, setTrack] = useState<string | null>(null);
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => setTrack(new URLSearchParams(window.location.search).get("track")), [pathname]);
  // Keep the current page (the end of the trail) in view on narrow screens.
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [pathname, current?.label]);
  if (pathname === "/") return null;

  const crumbs: Crumb[] = [];
  const found = findSubject(pathname, track);
  if (found) {
    crumbs.push({ label: `${found.subject.emoji} ${found.subject.label}`, href: found.subject.tabs[0].href });
    if (found.subject.tabs.length > 1 || current) crumbs.push({ label: found.tab.label, href: found.tab.href });
  } else {
    const old = ARCHIVED.find((a) => pathname.startsWith(a.href));
    if (old) {
      crumbs.push({ label: "Archived" });
      crumbs.push({ label: old.label, href: old.href });
    } else if (pathname.startsWith("/study")) crumbs.push({ label: "My progress", href: "/study" });
    else if (pathname.startsWith("/flashcards")) crumbs.push({ label: "Flashcards", href: "/flashcards" });
  }
  // Don't repeat the tab name as the page name.
  const leafLabel = current && current.label !== crumbs[crumbs.length - 1]?.label ? current : null;

  return (
    <nav aria-label="Breadcrumb" className="border-b border-slate-800 bg-slate-950/40 px-3 lg:hidden">
      <ol ref={list} className="scroll-quiet flex h-9 items-center gap-1 overflow-x-auto whitespace-nowrap text-[13px]">
        <li className="shrink-0">
          <Link href="/" aria-label="Billu Class home" className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-100">
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1 && !leafLabel;
          return (
            <Fragment key={c.label + i}>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-600" aria-hidden="true" />
              <li className="shrink-0">
                {c.href && !last ? (
                  <Link href={c.href} className="rounded-md px-1.5 py-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined} className={last ? "px-1.5 font-medium text-slate-100" : "px-1.5 text-slate-500"}>
                    {c.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
        {leafLabel && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-600" aria-hidden="true" />
            <li className="min-w-0">
              {leafLabel.onOpen ? (
                <button
                  type="button"
                  onClick={leafLabel.onOpen}
                  aria-current="page"
                  className="inline-flex max-w-[60vw] items-center gap-1 rounded-md bg-slate-800 px-2 py-1 font-medium text-slate-100"
                >
                  <span className="truncate">{leafLabel.label}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                  <span className="sr-only"> — show all topics</span>
                </button>
              ) : (
                <span aria-current="page" className="block max-w-[60vw] truncate px-1.5 font-medium text-slate-100">
                  {leafLabel.label}
                </span>
              )}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
