"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
      <div className="container mx-auto flex h-12 items-center gap-4">
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
                    "relative isolate shrink-0 rounded-full px-3.5 py-1.5 text-[13px] transition-colors",
                    active ? "font-medium text-cyan-300" : "text-slate-400 hover:text-slate-100",
                  )}
                >
                  {active && <motion.span layoutId="subject-pill" className="absolute inset-0 -z-10 rounded-full bg-cyan-500/15" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
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
