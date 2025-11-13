import { Header } from "@/components/Header";
import { CheatsheetCard } from "@/components/CheatsheetCard";
import { cheatsheets } from "@/lib/cheatsheets";
import { Github, Linkedin, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const problemSolvingSnippets = cheatsheets.find(
    (c) => c.name === "React"
  )?.snippets;
  const experienceSnippets = cheatsheets.find(
    (c) => c.name === "Next.js"
  )?.snippets;
  const otherSnippets = cheatsheets.find(
    (c) => c.name === "Frontend Concepts"
  )?.snippets;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-headline">
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-900/50 via-slate-900 to-slate-900 opacity-50 z-0"></div>
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-500/10 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-green-500/10 rounded-full filter blur-3xl opacity-20"></div>
        
        <Header />

        <main className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              Hi there, I'm Faizan
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
              I'm a product-minded Software Engineer with a passion for building{" "}
              <span className="highlight-cyan">scalable</span>,{" "}
              <span className="highlight-green">user friendly</span> and{" "}
              <span className="highlight-yellow">beautiful</span> SaaS products and Web applications.
            </p>
          </div>

          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">
                Problem Solving
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {problemSolvingSnippets?.map((snippet) => (
                  <CheatsheetCard key={snippet.title} snippet={snippet} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">
                2.5+ Years of Production Experience
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {experienceSnippets?.map((snippet) => (
                  <CheatsheetCard key={snippet.title} snippet={snippet} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">
                Architectural Impact
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {otherSnippets?.map((snippet) => (
                  <CheatsheetCard key={snippet.title} snippet={snippet} />
                ))}
              </div>
            </div>
          </div>
        </main>

        <footer className="py-8 text-center text-slate-400 text-sm relative z-10">
          <p>Built with Next.js, Tailwind CSS, and lots of ☕</p>
        </footer>
      </div>
    </div>
  );
}