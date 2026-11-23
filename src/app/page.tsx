import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Dumbbell, Eye, Youtube } from "lucide-react";
import { BILLU, SITE_NAME, SUBJECTS, type TabKind } from "@/lib/subjects";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { HOME_FAQ } from "@/lib/faq";
import { JsonLd, absolute, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: SITE_NAME,
  description:
    "Free visual lessons from Ustad Billu: watch 174 DSA questions run line by line (Pre-DSA to Level 3), break AWS services in the AWS Lab, see how Gen AI works, and revise JavaScript cheatsheets.",
  path: "/",
  keywords: ["DSA visualizer", "learn DSA in Hinglish", "AWS SAA-C03", "Gen AI explained", "JavaScript cheatsheet"],
});

const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

const COURSES_LD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Ustad Billu ki Class subjects",
  itemListElement: SUBJECTS.map((subject, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Course",
      name: `${subject.label} · ${SITE_NAME}`,
      description: subject.blurb,
      url: absolute(subject.tabs[0].href),
      isAccessibleForFree: true,
      inLanguage: "en-IN",
      provider: { "@type": "Organization", name: "Ustad Billu", sameAs: BILLU.youtube },
      hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "PT1H" },
      offers: { "@type": "Offer", price: 0, priceCurrency: "INR", category: "Free" },
    },
  })),
};

const ICON: Record<TabKind, typeof BookOpen> = { read: BookOpen, see: Eye, practice: Dumbbell };
const KIND: Record<TabKind, string> = { read: "Read", see: "See it", practice: "Practice" };

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-10 text-slate-50 md:pt-14">
      <JsonLd data={[FAQ_LD, COURSES_LD]} />
      <section className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
        <Image
          src={BILLU.mascot}
          alt="Ustad Billu, a white cat with round gold glasses and a red cap"
          width={180}
          height={180}
          priority
          className="h-36 w-36 shrink-0 rounded-[2rem] bg-[#fdf3dc] object-contain p-3 shadow-xl shadow-orange-900/20 md:h-44 md:w-44"
        />
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-300">Ustad Billu presents</p>
          <h1 className="mt-1 font-headline text-4xl font-bold text-slate-100 md:text-5xl">{SITE_NAME}</h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-300">
            Mushkil tech, aasaan tareeke se. Free visual lessons where you <span className="text-cyan-300">watch the code run</span>, break AWS on
            purpose, and see how AI really works.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link href="/visualizer" className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300">
              Start with DSA <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href={BILLU.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:border-orange-300 hover:text-orange-200"
            >
              <Youtube className="h-4 w-4 text-rose-400" aria-hidden="true" /> Watch Billu on YouTube
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </section>

      <h2 className="mt-14 text-sm font-semibold uppercase tracking-widest text-slate-500">Pick a subject</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {SUBJECTS.map((subject) => (
          <li key={subject.id} className={cn("rounded-3xl border bg-gradient-to-br to-slate-900/40 p-6", subject.accent)}>
            <Link href={subject.tabs[0].href} className="group block">
              <p className="text-4xl" aria-hidden="true">
                {subject.emoji}
              </p>
              <h3 className="mt-2 flex items-center gap-2 font-headline text-2xl font-bold text-slate-100">
                {subject.label}
                <ArrowRight className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              </h3>
              <p className="mt-1 text-slate-300">{subject.blurb}</p>
            </Link>
            <div className="mt-4 flex flex-wrap gap-2">
              {subject.tabs.map((tab) => {
                const Icon = ICON[tab.kind];
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-500"
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="text-slate-500">{KIND[tab.kind]}:</span> {tab.label}
                  </Link>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-orange-300/30 bg-gradient-to-r from-orange-500/10 to-rose-500/10 p-6 text-center sm:flex-row sm:text-left">
        <Image src={BILLU.mascot} alt="" width={64} height={64} className="h-16 w-16 rounded-2xl bg-[#fdf3dc] object-contain p-1" />
        <div className="flex-1">
          <p className="font-headline text-lg font-bold text-slate-100">Learn faster with Billu&apos;s videos</p>
          <p className="text-slate-300">Short Hinglish reels and the LeetCode Ki Soch playlist. Funny first, easy to understand second.</p>
        </div>
        <div className="flex gap-2">
          <a href={BILLU.dsaPlaylist} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2 font-semibold text-white hover:brightness-110">
            DSA playlist
          </a>
          <a href={BILLU.instagram} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-700 px-4 py-2 font-semibold text-slate-200 hover:border-orange-300">
            Instagram
          </a>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="mt-14">
        <h2 id="faq-title" className="font-headline text-2xl font-bold text-slate-100">
          Questions people ask
        </h2>
        <div className="mt-4 divide-y divide-slate-800 rounded-2xl border border-slate-800">
          {HOME_FAQ.map(({ q, a }) => (
            <details key={q} className="group px-5 py-4">
              <summary className="cursor-pointer list-none font-semibold text-slate-100 [&::-webkit-details-marker]:hidden">
                <span className="mr-2 inline-block text-cyan-300 transition-transform group-open:rotate-90" aria-hidden="true">
                  ▸
                </span>
                {q}
              </summary>
              <p className="mt-2 pl-5 text-slate-300">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
