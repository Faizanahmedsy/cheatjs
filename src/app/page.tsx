import Link from "next/link";
import { BILLU, SITE_NAME, SUBJECTS } from "@/lib/subjects";
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
  name: "Billu Class subjects",
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


export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-12 pt-14 text-slate-50 md:pt-20">
      <JsonLd data={[FAQ_LD, COURSES_LD]} />
      <section>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-50 md:text-5xl">{SITE_NAME}</h1>
        <p className="mt-3 max-w-xl text-lg text-slate-400">
          Free visual lessons by <span className="text-cyan-400">Ustad Billu</span>. Watch code run, break AWS on purpose, and see how AI works.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/visualizer" className="rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-900/30 transition hover:bg-cyan-600">
            Start with DSA
          </Link>
          <Link href="/deep-dive" className="rounded-full bg-slate-800/70 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800">
            Deep Dive: hard algorithms
          </Link>
        </div>
      </section>

      <ul className="mt-14 grid gap-3 sm:grid-cols-2">
        {SUBJECTS.map((subject) => (
          <li key={subject.id} className="flex flex-col justify-between gap-4 rounded-3xl bg-slate-900 p-6 transition hover:bg-slate-800/80">
            <Link href={subject.tabs[0].href} className="group">
              <h2 className="text-lg font-medium text-slate-100 group-hover:underline">{subject.label}</h2>
              <p className="text-sm text-slate-500">{subject.blurb}</p>
            </Link>
            <div className="flex flex-wrap gap-3 text-sm">
              {subject.tabs.map((tab) => (
                <Link key={tab.href} href={tab.href} className="rounded-full bg-slate-800/80 px-3 py-1 text-slate-300 hover:text-cyan-300">
                  {tab.label}
                </Link>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <section aria-labelledby="faq-title" className="mt-14">
        <details className="group">
          <summary id="faq-title" className="cursor-pointer list-none text-sm text-slate-500 hover:text-slate-300 [&::-webkit-details-marker]:hidden">
            Questions people ask
          </summary>
          <div className="mt-4 divide-y divide-slate-800">
            {HOME_FAQ.map(({ q, a }) => (
              <div key={q} className="py-4">
                <p className="font-medium text-slate-200">{q}</p>
                <p className="mt-1 text-sm text-slate-400">{a}</p>
              </div>
            ))}
          </div>
        </details>
      </section>
    </main>
  );
}
