import { CheatsheetCard } from "@/components/CheatsheetCard";
import { cheatsheets } from "@/lib/cheatsheets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans">
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

          <Tabs defaultValue="React" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-slate-800/50 border border-slate-700/50 mb-8">
              <TabsTrigger value="React" className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-300">React</TabsTrigger>
              <TabsTrigger value="Next.js" className="data-[state=active]:bg-slate-700 data-[state=active]:text-green-300">Next.js</TabsTrigger>
              <TabsTrigger value="Frontend Concepts" className="data-[state=active]:bg-slate-700 data-[state=active]:text-yellow-300">Frontend Concepts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="React">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cheatsheets.find(c => c.name === 'React')?.snippets.map((snippet) => (
                  <CheatsheetCard key={snippet.title} snippet={snippet} color="cyan" />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="Next.js">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                 {cheatsheets.find(c => c.name === 'Next.js')?.snippets.map((snippet) => (
                  <CheatsheetCard key={snippet.title} snippet={snippet} color="green" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="Frontend Concepts">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cheatsheets.find(c => c.name === 'Frontend Concepts')?.snippets.map((snippet) => (
                  <CheatsheetCard key={snippet.title} snippet={snippet} color="yellow" />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <footer className="py-8 text-center text-slate-500 text-sm relative z-10">
          <p>Built with Next.js & Tailwind CSS.</p>
        </footer>
      </div>
    </div>
  );
}
