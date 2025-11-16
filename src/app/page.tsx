

import { Suspense } from 'react';
import { CheatsheetTabs } from '@/components/CheatsheetTabs';

export default function Home() {
  return (
    <div className="min-h-full bg-background text-slate-50 font-sans">
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-900/10 via-background to-background opacity-50 z-0"></div>
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-500/5 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-green-500/5 rounded-full filter blur-3xl opacity-20"></div>

        <main className="relative z-10">
          <div className="container mx-auto px-4 max-w-screen-xl">
            <div className="text-center py-16">
              <h1 className="font-headline text-5xl font-bold text-slate-100">
                Cheat JS
              </h1>
              <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                The easiest to understand resource to learn frontend development on planet earth. Cheatsheets to help you learn and master modern web technologies.
              </p>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
              <CheatsheetTabs />
            </Suspense>

          </div>
        </main>

        <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm relative z-10 mt-16">
          <div className="container mx-auto px-4">
            <p className="mb-2">
              Built by{' '}
              <a
                href="https://faizansaiyed.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                Faizan
              </a>
              . Find me on{' '}
              <a
                href="https://www.linkedin.com/in/faizanahmed-saiyed/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                LinkedIn
              </a>
              .
            </p>
            <p>&copy; {new Date().getFullYear()} Cheat JS. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
