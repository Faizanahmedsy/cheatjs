"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LESSONS } from "@/lib/deep-dive/lessons";
import { cn } from "@/lib/utils";

const groups = [...new Set(LESSONS.map((l) => l.group))];

function NavList({ onPick }: { onPick?: () => void }) {
  const pathname = usePathname();
  const active = LESSONS.find((l) => pathname.endsWith(`/deep-dive/${l.slug}`));
  const [open, setOpen] = useState<Set<string>>(() => new Set(active ? [active.group] : groups.slice(0, 1)));
  const toggle = (g: string) => setOpen((s) => {
    const n = new Set(s);
    if (n.has(g)) n.delete(g);
    else n.add(g);
    return n;
  });
  return (
    <nav className="space-y-1 p-3">
      <Link href="/deep-dive" onClick={onPick} className="mb-2 flex items-center justify-between rounded-full px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-800/70">
        All topics <span className="text-xs text-slate-500">{LESSONS.length}</span>
      </Link>
      {groups.map((g) => {
        const items = LESSONS.filter((l) => l.group === g);
        const isOpen = open.has(g);
        return (
          <div key={g}>
            <button
              onClick={() => toggle(g)}
              className={cn("flex w-full items-center justify-between rounded-full px-3 py-1.5 text-left text-sm hover:bg-slate-800/70", active?.group === g ? "text-slate-100" : "text-slate-400")}
            >
              <span>
                <span className={cn("mr-2 inline-block text-[10px] text-slate-500 transition-transform", isOpen && "rotate-90")}>▶</span>
                {g}
              </span>
              <span className="text-xs text-slate-600">{items.length}</span>
            </button>
            {isOpen && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-800 pl-2">
                {items.map((l) => (
                  <Link
                    key={l.slug}
                    href={`/deep-dive/${l.slug}`}
                    onClick={onPick}
                    className={cn(
                      "block rounded-full px-3 py-1.5 text-[13px] transition-colors",
                      active?.slug === l.slug ? "bg-cyan-500/15 font-medium text-cyan-300" : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100",
                    )}
                  >
                    {l.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/** Left sidebar on desktop, a slide-in list on phones. */
export function DeepDiveNav() {
  const [mobile, setMobile] = useState(false);
  return (
    <>
      <aside data-chrome className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-800/70 lg:block">
        <NavList />
      </aside>
      <button
        onClick={() => setMobile(true)}
        className="fixed bottom-[calc(1rem+var(--mbar,0px))] left-4 z-40 rounded-full bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg lg:hidden"
      >
        Topics
      </button>
      {mobile && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobile(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-slate-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <NavList onPick={() => setMobile(false)} />
          </div>
        </div>
      )}
    </>
  );
}
