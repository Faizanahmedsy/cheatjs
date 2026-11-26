import Link from "next/link";
import { computeStats } from "@/lib/aws-v2/convert";
import { loadPage } from "@/lib/aws-v2/notion";
import { AWS_TRACK, hrefFor, type Track } from "@/lib/aws-v2/pages";

export async function HubCards({ track = AWS_TRACK }: { track?: Track }) {
  const pages = track.pages.filter((p) => p.slug !== "home");
  const stats = await Promise.all(
    pages.map(async (p) => computeStats((await loadPage(p, track)).markdown))
  );

  return (
    <section aria-label="Study hub" className="mb-10">
      <h2 className="mb-4 font-headline text-xl font-bold text-slate-100">Study hub</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {pages.map((p, i) => {
          const s = stats[i];
          const isDomain = p.group === "Domains" || p.group === "Parts";
          const title = (
            <h3 className="font-headline text-base font-bold text-slate-100 group-hover:text-cyan-300">
              {p.title}
            </h3>
          );
          return (
            <Link
              key={p.slug}
              href={hrefFor(p.slug, track)}
              className="group rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 transition-colors hover:border-cyan-400/50 hover:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                {track.plain ? title : <span className="text-2xl" aria-hidden>{p.icon}</span>}
                {p.weight ? (
                  <span className="shrink-0 rounded-full bg-cyan-400/10 px-2 py-0.5 text-xs font-semibold text-cyan-300">
                    {p.weight}
                  </span>
                ) : null}
              </div>
              {track.plain ? null : <div className="mt-2">{title}</div>}
              <p className="mt-1 text-sm text-slate-400">{p.blurb}</p>
              {isDomain ? (
                <p className="mt-3 text-xs text-slate-500">
                  <span className="font-semibold text-emerald-300">{s.topics}</span> topics written
                  {s.comingSoon > 0 ? <> · <span className="text-amber-300">{s.comingSoon}</span> sections coming soon</> : null}
                </p>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
