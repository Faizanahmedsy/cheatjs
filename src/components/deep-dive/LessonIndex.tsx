import Link from "next/link";
import type { Lesson } from "@/lib/deep-dive/types";

export function LessonIndex({ lessons, base, title, intro }: { lessons: Lesson[]; base: string; title: string; intro: string }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-slate-100">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-slate-400">{intro}</p>
      <ol className="mt-8 space-y-2">
        {lessons.map((l, i) => (
          <li key={l.slug}>
            {(i === 0 || lessons[i - 1].group !== l.group) && <p className="mb-2 mt-6 px-1 text-[11px] uppercase tracking-wider text-cyan-400">{l.group}</p>}
            <Link href={`${base}/${l.slug}`} className="group flex items-baseline gap-4 rounded-2xl bg-slate-900/70 px-5 py-4 transition hover:bg-slate-800/80">
              <span className="w-6 font-code text-xs text-slate-600">{i + 1}</span>
              <span className="flex-1">
                <span className="font-medium group-hover:underline">{l.title}</span>
                <span className="block text-sm text-slate-500">{l.blurb}</span>
              </span>
              <span className="text-xs text-slate-600">{l.steps.length} steps</span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
