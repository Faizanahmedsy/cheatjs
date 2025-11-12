import { CodeXml } from "lucide-react";

export function Header() {
  return (
    <header className="py-16 bg-background border-b">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center items-center gap-3 mb-4">
          <CodeXml className="h-10 w-10 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter">
            Code Cheatsheets
          </h1>
        </div>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-body">
          Your quick reference for Next.js, React, and advanced frontend
          concepts. Find the snippets you need, right when you need them.
        </p>
      </div>
    </header>
  );
}
