"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { V2_PAGES, hrefFor } from "@/lib/aws-v2/pages";

const GROUPS = ["Start here", "Domains", "Reference"] as const;

export function V2Nav() {
  const pathname = usePathname();
  const isActive = (slug: string) => pathname === hrefFor(slug);

  return (
    <>
      {/* Mobile: horizontal chips */}
      <nav
        aria-label="AWS SAA v2 pages"
        className="sticky top-14 z-30 flex gap-2 overflow-x-auto border-b border-slate-700/50 bg-slate-900/95 px-3 py-2 backdrop-blur lg:hidden"
      >
        {V2_PAGES.map((p) => (
          <Link
            key={p.slug}
            href={hrefFor(p.slug)}
            className={cn(
              "flex-shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              isActive(p.slug)
                ? "border-cyan-400/60 bg-slate-800 text-cyan-300"
                : "border-slate-700 text-slate-400 hover:text-slate-200"
            )}
          >
            <span className="mr-1">{p.icon}</span>
            {p.slug.startsWith("domain-") ? `Domain ${p.slug.slice(-1)}` : p.title.replace("AWS ", "")}
          </Link>
        ))}
      </nav>

      {/* Desktop: sidebar */}
      <aside className="hidden w-72 flex-shrink-0 border-r border-slate-700/50 bg-slate-900/80 lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
        <nav aria-label="AWS SAA v2 pages" className="flex flex-col gap-1 p-4">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-cyan-400">
            AWS SAA-C03 · v2
          </p>
          {GROUPS.map((group) => (
            <div key={group} className="mb-4">
              <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-slate-500">{group}</p>
              {V2_PAGES.filter((p) => p.group === group).map((p) => (
                <Link
                  key={p.slug}
                  href={hrefFor(p.slug)}
                  className={cn(
                    "flex items-start gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive(p.slug)
                      ? "bg-slate-800 text-cyan-300"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  )}
                >
                  <span aria-hidden className="mt-0.5">{p.icon}</span>
                  <span className="min-w-0">
                    <span className="block leading-snug">{p.title}</span>
                    {p.weight ? <span className="text-xs text-slate-500">{p.weight} of exam</span> : null}
                  </span>
                </Link>
              ))}
            </div>
          ))}
          <Link
            href="/aws-saa"
            className="mt-2 rounded-md border border-slate-700/60 px-3 py-2 text-xs text-slate-500 transition-colors hover:text-slate-300"
          >
            ← Original AWS cheat sheets (v1)
          </Link>
        </nav>
      </aside>
    </>
  );
}
