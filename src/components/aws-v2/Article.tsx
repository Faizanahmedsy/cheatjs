import GithubSlugger from "github-slugger";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Markdown } from "./Markdown";
import { extractToc, notionToMarkdown } from "@/lib/aws-v2/convert";
import { loadPage } from "@/lib/aws-v2/notion";
import { AWS_TRACK, notionUrlFor, type Track, type V2Page } from "@/lib/aws-v2/pages";
import { cn } from "@/lib/utils";
import { PageActions } from "@/components/study/PageActions";
import { hrefFor, neighboursOf } from "@/lib/aws-v2/pages";

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export async function Article({
  page,
  before,
  track = AWS_TRACK,
}: {
  page: V2Page;
  before?: React.ReactNode;
  track?: Track;
}) {
  const loaded = await loadPage(page, track);
  const markdown = notionToMarkdown(loaded.markdown, track);
  const toc = extractToc(markdown, new GithubSlugger());
  const live = loaded.source === "notion";
  const { prev, next } = neighboursOf(page.slug, track);

  return (
    <div
      key={`${track.id}-${page.slug}`}
      className="lg:h-full lg:overflow-hidden xl:grid xl:grid-cols-[minmax(0,1fr)_17rem]"
    >
      {/* Centre column: scrolls on its own on desktop */}
      <div data-reader-scroll className="min-w-0 px-4 pb-24 pt-8 sm:px-8 lg:h-full lg:overflow-y-auto xl:pr-10">
      <article className="reader-article mx-auto w-full min-w-0 max-w-3xl">
        <header className="mb-8">
          <p className="text-sm text-slate-500">{page.subtitle}</p>
          <h1 className="mt-1 font-headline text-3xl font-bold text-slate-100 md:text-4xl">
            <span className="mr-3" aria-hidden>{page.icon}</span>
            {page.title}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-400">{page.blurb}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 font-medium",
                live
                  ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                  : "border-slate-600 bg-slate-800 text-slate-300"
              )}
            >
              {live ? "Live from Notion" : "Notion snapshot"} · edited {formatDate(loaded.editedAt)}
            </span>
            <span className="text-slate-500">~{Math.max(1, Math.round(markdown.split(/\s+/).length / 200))} min read</span>
            <a
              href={notionUrlFor(page)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-cyan-300 hover:underline"
            >
              Open in Notion <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <PageActions id={`${track.id}:${page.slug}`} title={page.title} href={hrefFor(page.slug, track)} track={track.id} />
          {loaded.note ? <p className="mt-3 text-xs text-amber-300">{loaded.note}</p> : null}
        </header>

        {before}

        {/* Mobile / tablet table of contents */}
        {toc.length > 0 ? (
          <details data-reader-hide className="mb-8 rounded-xl border border-slate-700/60 bg-slate-800/40 xl:hidden">
            <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-slate-200">
              On this page ({toc.length} sections)
            </summary>
            <ul className="scroll-quiet max-h-80 space-y-1 overflow-y-auto px-4 pb-4 text-sm">
              {toc.map((t) => (
                <li key={t.id} className={t.level === 3 ? "pl-4" : "mt-2 font-medium"}>
                  <a href={`#${t.id}`} className="text-slate-400 hover:text-cyan-300">{t.text}</a>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        <Markdown>{markdown}</Markdown>

        {/* Previous / next page, in sidebar order */}
        {prev || next ? (
          <nav data-reader-hide aria-label="Previous and next page" className="mt-12 grid gap-3 border-t border-slate-700/60 pt-6 sm:grid-cols-2">
            {prev ? (
              <Link
                href={hrefFor(prev.slug, track)}
                className="group flex flex-col gap-1 rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 transition-colors hover:border-cyan-400/60 hover:bg-slate-800"
              >
                <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Previous
                </span>
                <span className="font-headline text-base font-semibold text-slate-200 group-hover:text-cyan-300">
                  <span aria-hidden className="mr-2">{prev.icon}</span>
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next ? (
              <Link
                href={hrefFor(next.slug, track)}
                className="group flex flex-col items-end gap-1 rounded-xl border border-cyan-400/40 bg-cyan-400/5 p-4 text-right transition-colors hover:border-cyan-300 hover:bg-cyan-400/10 sm:col-start-2"
              >
                <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-cyan-300">
                  Next <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="font-headline text-base font-semibold text-slate-100 group-hover:text-cyan-200">
                  <span aria-hidden className="mr-2">{next.icon}</span>
                  {next.title}
                </span>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </article>
      </div>

      {/* Desktop table of contents */}
      {toc.length > 0 ? (
        <aside data-reader-hide className="scroll-quiet hidden xl:block xl:h-full xl:overflow-y-auto xl:pb-24 xl:pr-6 xl:pt-8">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">On this page</p>
            <ul className="space-y-1 border-l border-slate-700/60 text-sm">
              {toc.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className={cn(
                      "block -ml-px border-l border-transparent py-0.5 text-slate-400 hover:border-cyan-400 hover:text-cyan-300",
                      t.level === 3 ? "pl-6 text-[13px]" : "pl-3 font-medium text-slate-300"
                    )}
                  >
                    {t.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
