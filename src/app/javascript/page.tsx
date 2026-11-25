import { Suspense } from "react";
import type { Metadata } from "next";
import { CheatsheetTabs } from "@/components/CheatsheetTabs";

import { pageMeta } from "@/lib/seo";
export const metadata: Metadata = pageMeta({ title: "JavaScript cheatsheets", description: "Easy frontend cheatsheets for JavaScript, React, Next.js and DSA basics, with code examples and small visual demos.", path: "/javascript", keywords: ["JavaScript cheatsheet", "React cheatsheet", "Next.js cheatsheet", "frontend interview"] });

export default function JavaScriptPage() {
  return (
    <div className="min-h-full bg-background text-slate-50 font-sans">
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-900/10 via-background to-background opacity-50 z-0"></div>
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-500/5 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-green-500/5 rounded-full filter blur-3xl opacity-20"></div>

        <main className="relative z-10">
          <div className="mx-auto w-full max-w-[2000px] px-4 pt-6 sm:px-6 lg:px-10">
            <h1 className="sr-only">JavaScript cheatsheets</h1>
            <Suspense fallback={<div>Loading...</div>}>
              <CheatsheetTabs />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
