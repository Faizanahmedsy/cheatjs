'use client';

import { CheatsheetCard } from "@/components/CheatsheetCard";
import { cheatsheets } from "@/lib/cheatsheets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from "react";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryTab = searchParams.get('category') ?? 'React';
  const reactTab = searchParams.get('level') ?? 'Beginner';

  const reactCategory = cheatsheets.find(c => c.name === 'React');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const setCategoryTab = (value: string) => {
    router.push(pathname + '?' + createQueryString('category', value));
  };

  const setReactTab = (value: string) => {
    router.push(pathname + '?' + createQueryString('level', value));
  };


  return (
    <div className="min-h-full bg-slate-900 text-slate-50 font-sans">
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-900/10 via-slate-900 to-slate-900 opacity-50 z-0"></div>
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-500/5 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-green-500/5 rounded-full filter blur-3xl opacity-20"></div>

        <main className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center mb-12">
            <h1 className="font-headline text-5xl font-bold text-slate-100">
              Code Cheatsheets
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              A curated collection of snippets for Next.js, React, and advanced frontend concepts.
            </p>
          </div>

          <Tabs value={categoryTab} onValueChange={setCategoryTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-slate-800/50 border border-slate-700/50 mb-8">
              <TabsTrigger value="React" className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-300">React</TabsTrigger>
              <TabsTrigger value="Next.js" className="data-[state=active]:bg-slate-700 data-[state=active]:text-green-300">Next.js</TabsTrigger>
              <TabsTrigger value="Frontend Concepts" className="data-[state=active]:bg-slate-700 data-[state=active]:text-yellow-300">Frontend Concepts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="React">
              <Tabs value={reactTab} onValueChange={setReactTab} className="w-full">
                <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 bg-slate-800/50 border border-slate-700/50 mb-8">
                  <TabsTrigger value="Beginner" className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-300">Beginner</TabsTrigger>
                  <TabsTrigger value="Intermediate" className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-300">Intermediate</TabsTrigger>
                  <TabsTrigger value="Advanced" className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-300">Advanced</TabsTrigger>
                </TabsList>
                <TabsContent value="Beginner">
                  <div className="grid gap-6 md:grid-cols-2">
                    {reactCategory?.subCategories?.find(sc => sc.name === 'Beginner')?.snippets.map((snippet) => (
                      <CheatsheetCard key={snippet.title} snippet={snippet} color="cyan" />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="Intermediate">
                  <div className="grid gap-6 md:grid-cols-2">
                    {reactCategory?.subCategories?.find(sc => sc.name === 'Intermediate')?.snippets.map((snippet) => (
                      <CheatsheetCard key={snippet.title} snippet={snippet} color="cyan" />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="Advanced">
                  <div className="grid gap-6 md:grid-cols-2">
                    {reactCategory?.subCategories?.find(sc => sc.name === 'Advanced')?.snippets.map((snippet) => (
                      <CheatsheetCard key={snippet.title} snippet={snippet} color="cyan" />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
            
            <TabsContent value="Next.js">
              <div className="grid gap-6 md:grid-cols-2">
                 {cheatsheets.find(c => c.name === 'Next.js')?.snippets.map((snippet) => (
                  <CheatsheetCard key={snippet.title} snippet={snippet} color="green" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="Frontend Concepts">
              <div className="grid gap-6 md:grid-cols-2">
                {cheatsheets.find(c => c.name === 'Frontend Concepts')?.snippets.map((snippet) => (
                  <CheatsheetCard key={snippet.title} snippet={snippet} color="yellow" />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <footer className="py-8 text-center text-slate-500 text-sm relative z-10">
          <p>
            Made by{' '}
            <a
              href="https://faizansaiyed.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              Faizan Saiyed
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
          <p className="mt-2">Built with Next.js & Tailwind CSS.</p>
        </footer>
      </div>
    </div>
  );
}
