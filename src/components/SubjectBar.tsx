"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Dumbbell, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { BILLU, findSubject, type TabKind } from "@/lib/subjects";

const ICON: Record<TabKind, typeof BookOpen> = { read: BookOpen, see: Eye, practice: Dumbbell };

/** Under the navbar on every subject page: Read / See / Practice for that subject, plus a quiet Billu video link. */
export function SubjectBar() {
  const pathname = usePathname();
  const [track, setTrack] = useState<string | null>(null);
  useEffect(() => setTrack(new URLSearchParams(window.location.search).get("track")), [pathname]);
  const current = findSubject(pathname, track);
  if (!current) return null;
  const { subject, tab } = current;

  return (
    <div className="border-b border-slate-800 bg-slate-900/60 px-3 sm:px-4 lg:px-6 2xl:px-16">
      <div className="container mx-auto flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1 py-1.5">
        <span className="text-sm font-semibold text-slate-200">
          <span aria-hidden="true">{subject.emoji} </span>
          {subject.label}
        </span>
        {subject.tabs.length > 1 && (
          <nav aria-label={`${subject.label} pages`} className="flex gap-1 overflow-x-auto">
            {subject.tabs.map((t) => {
              const Icon = ICON[t.kind];
              const active = t.href === tab.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[13px] transition-colors",
                    active ? "bg-cyan-400 font-semibold text-slate-950" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.label}
                </Link>
              );
            })}
          </nav>
        )}
        <a
          href={subject.video.href}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto hidden items-center gap-2 rounded-full py-0.5 pl-0.5 pr-3 text-xs text-slate-400 transition-colors hover:bg-slate-800 hover:text-orange-200 sm:inline-flex"
        >
          <Image src={BILLU.mascot} alt="" width={22} height={22} className="h-6 w-6 rounded-full bg-amber-50/90 object-contain p-0.5" />
          <span>
            {subject.label} in Hinglish: <span className="text-orange-300">{subject.video.label}</span>
          </span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}
