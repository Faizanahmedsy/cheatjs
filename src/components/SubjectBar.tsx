"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { findSubject } from "@/lib/subjects";


/** Under the navbar on every subject page: Read / See / Practice for that subject, plus a quiet Billu video link. */
export function SubjectBar() {
  const pathname = usePathname();
  const [track, setTrack] = useState<string | null>(null);
  useEffect(() => setTrack(new URLSearchParams(window.location.search).get("track")), [pathname]);
  const current = findSubject(pathname, track);
  if (!current || current.subject.tabs.length < 2) return null;
  const { subject, tab } = current;

  return (
    <div data-chrome className="border-b border-slate-800 px-3 sm:px-4 lg:px-6 2xl:px-16">
      <div className="container mx-auto flex h-10 items-center gap-4">
        {subject.tabs.length > 1 && (
          <nav aria-label={`${subject.label} pages`} className="flex gap-1 overflow-x-auto">
            {subject.tabs.map((t) => {
              const active = t.href === tab.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "shrink-0 border-b-2 px-2 py-2 text-[13px] transition-colors",
                    active ? "border-slate-100 text-slate-50" : "border-transparent text-slate-500 hover:text-slate-200",
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
