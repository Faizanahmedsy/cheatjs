import GithubSlugger from "github-slugger";
import { CrumbLeaf } from "@/components/MobileCrumbs";
import { ReadingFocusButton } from "@/components/ReadingFocusButton";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Markdown } from "./Markdown";
import { extractToc, notionToMarkdown } from "@/lib/aws-v2/convert";
import { loadPage } from "@/lib/aws-v2/notion";
import { AWS_TRACK, type Track, type V2Page } from "@/lib/aws-v2/pages";
import { cn } from "@/lib/utils";
import { PageActions } from "@/components/study/PageActions";
import { hrefFor, neighboursOf } from "@/lib/aws-v2/pages";
import { FastScroller } from "./FastScroller";
import { TocNav } from "./TocNav";
import { AskLlm } from "./AskLlm";
import { absolute } from "@/lib/seo";

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
  const noEmoji = !!track.plain && page.slug === "home";
  const markdown = notionToMarkdown(loaded.markdown, track, { noEmoji });
  const toc = extractToc(markdown, new GithubSlugger());
  const live = loaded.source === "notion";
  const { prev, next } = neighboursOf(page.slug, track);

  return (
    <div
      key={`${track.id}-${page.slug}`}
      className="lg:h-full lg:overflow-hidden xl:grid xl:grid-cols-[minmax(0,1fr)_17rem] xl:grid-rows-[minmax(0,1fr)]"
    >
      {/* Centre column: scrolls on its own on desktop, with the big fast-scroll handle on its right edge */}
      <div className="relative min-w-0 lg:h-full lg:min-h-0 lg:overflow-hidden">
      <div data-reader-scroll className="no-native-scrollbar min-w-0 px-4 pb-24 pt-8 sm:px-8 lg:h-full lg:overflow-y-auto xl:pr-12">
      <article className="reader-article mx-auto w-full min-w-0 max-w-3xl">
        <CrumbLeaf label={page.title} />
        <header className="mb-8">
          <p data-chrome className="text-sm font-medium text-slate-500">{page.subtitle}</p>
          <h1 className="mt-1 font-body text-[1.75rem] font-semibold leading-tight tracking-tight text-slate-50 md:text-[2rem]">{page.title}</h1>
          <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-slate-300">{page.blurb}</p>
          <div data-chrome className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <span
              className={cn("inline-flex items-center gap-1.5", live ? "text-emerald-300" : "text-slate-400")}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-emerald-400" : "bg-slate-500")} aria-hidden />
              {live ? "Live" : "Snapshot"} · updated {formatDate(loaded.editedAt)}
            </span>
            <span className="text-slate-500">~{Math.max(1, Math.round(markdown.split(/\s+/).length / 200))} min read</span>
          </div>
          <div data-chrome className="mt-4 flex flex-wrap items-center gap-2">
            <AskLlm title={page.title} mdUrl={absolute(`/md/${track.id}/${page.slug}`)} pageUrl={absolute(hrefFor(page.slug, track))} />
            <ReadingFocusButton />
            <PageActions id={`${track.id}:${page.slug}`} title={page.title} href={hrefFor(page.slug, track)} track={track.id} />
          </div>
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

        <Markdown noEmoji={noEmoji}>{markdown}</Markdown>

        {/* Previous / next page, in sidebar order */}
        {prev || next ? (
          <nav data-reader-hide aria-label="Previous and next page" className="mt-12 grid gap-3 border-t border-slate-700/60 pt-6 sm:grid-cols-2">
            {prev ? (
              <Link
                data-shortcut="prev"
                href={hrefFor(prev.slug, track)}
                className="group flex flex-col gap-1 rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 transition-colors hover:border-cyan-400/60 hover:bg-slate-800"
              >
                <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Previous
                </span>
                <span className="font-body text-base font-semibold text-slate-100 group-hover:text-cyan-300">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next ? (
              <Link
                data-shortcut="next"
                href={hrefFor(next.slug, track)}
                className="group flex flex-col items-end gap-1 rounded-xl border border-cyan-400/40 bg-cyan-400/5 p-4 text-right transition-colors hover:border-cyan-300 hover:bg-cyan-400/10 sm:col-start-2"
              >
                <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-cyan-300">
                  Next <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="font-body text-base font-semibold text-slate-50 group-hover:text-cyan-200">
                  {next.title}
                </span>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </article>
      </div>
      <FastScroller />
      </div>

      {/* Desktop table of contents */}
      {toc.length > 0 ? (
        <aside data-reader-hide className="scroll-quiet hidden xl:block xl:h-full xl:overflow-y-auto xl:pb-24 xl:pl-4 xl:pr-0 xl:pt-8">
          <div>
            <TocNav toc={toc} />
          </div>
        </aside>
      ) : null}
    </div>
  );
}
