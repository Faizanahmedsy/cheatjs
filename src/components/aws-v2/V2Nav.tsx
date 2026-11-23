"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStudy } from "@/lib/study";
import { AWS_TRACK, GENAI_TRACK, hrefFor, type Track } from "@/lib/aws-v2/pages";

const TRACKS: Record<Track["id"], Track> = { aws: AWS_TRACK, "gen-ai": GENAI_TRACK };

export function V2Nav({ trackId = "aws" }: { trackId?: Track["id"] }) {
  const track = TRACKS[trackId];
  const GROUPS = track.groups;
  const pathname = usePathname();
  const { study } = useStudy();
  const mark = (slug: string) => (study.done[`${track.id}:${slug}`] ? "✓ " : "");
  const isActive = (slug: string) => pathname === hrefFor(slug, track);

  return (
    <>
      {/* Mobile: horizontal chips */}
      <nav
        data-reader-hide
        aria-label={`${track.shortLabel} pages`}
        className="sticky top-14 z-30 flex gap-2 overflow-x-auto border-b border-slate-700/50 bg-slate-900/95 px-3 py-2 backdrop-blur lg:hidden"
      >
        {track.pages.map((p) => (
          <Link
            key={p.slug}
            href={hrefFor(p.slug, track)}
            className={cn(
              "flex-shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              isActive(p.slug)
                ? "border-cyan-400/60 bg-slate-800 text-cyan-300"
                : "border-slate-700 text-slate-400 hover:text-slate-200"
            )}
          >
            <span className="mr-1">{mark(p.slug)}{p.icon}</span>
            {p.group === "Domains" || p.group === "Parts" ? `${track.unitName} ${p.slug.slice(-1)}` : p.title.replace("AWS ", "")}
          </Link>
        ))}
      </nav>

      {/* Desktop: sidebar */}
      <aside data-reader-hide className="hidden w-72 flex-shrink-0 border-r border-slate-700/50 bg-transparent lg:block lg:h-full lg:overflow-y-auto scroll-quiet">
        <nav aria-label={`${track.shortLabel} pages`} className="flex flex-col gap-0 px-5 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {track.label}
          </p>
          {track.id === "aws" && (
            <Link href="/aws-lab" className="mb-4 px-3 text-sm text-sky-300 underline decoration-sky-300/40 underline-offset-[3px] hover:decoration-sky-300">
              Try the AWS Lab →
            </Link>
          )}
          {GROUPS.map((group) => (
            <div key={group} className="mb-5">
              <p className="mb-1.5 px-3 text-[13px] font-semibold text-slate-100">{group}</p>
              <div className="flex flex-col gap-0.5">
              {track.pages.filter((p) => p.group === group).map((p) => (
                <Link
                  key={p.slug}
                  href={hrefFor(p.slug, track)}
                  className={cn(
                    "flex items-baseline justify-between gap-3 rounded-lg px-3 py-1.5 text-[15px] transition-colors",
                    isActive(p.slug)
                      ? "bg-slate-800 font-medium text-slate-50"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-slate-50"
                  )}
                >
                  <span className="min-w-0 leading-snug">{study.done[`${track.id}:${p.slug}`] ? <span className="text-emerald-400">✓ </span> : null}{p.title}</span>
                  {p.weight ? <span className="shrink-0 text-xs text-slate-500">{track.id === "aws" ? p.weight : p.weight.replace(" topics", "")}</span> : null}
                </Link>
              ))}
              </div>
            </div>
          ))}
          <Link
            href={track.backHref}
            className="mt-2 rounded-md border border-slate-700/60 px-3 py-2 text-xs text-slate-500 transition-colors hover:text-slate-300"
          >
            {track.backLabel}
          </Link>
        </nav>
      </aside>
    </>
  );
}
