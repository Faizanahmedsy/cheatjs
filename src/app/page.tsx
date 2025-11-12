import { Header } from "@/components/Header";
import { CheatsheetCard } from "@/components/CheatsheetCard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cheatsheets } from "@/lib/cheatsheets";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <Tabs defaultValue={cheatsheets[0].name} className="w-full">
          <div className="flex justify-center">
            <ScrollArea className="max-w-full">
              <TabsList className="inline-flex h-auto">
                {cheatsheets.map((category) => (
                  <TabsTrigger
                    key={category.name}
                    value={category.name}
                    className="flex items-center gap-2 px-6 py-3 text-base"
                  >
                    <category.icon className="h-5 w-5" />
                    <span className="font-headline">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {cheatsheets.map((category) => (
            <TabsContent
              key={category.name}
              value={category.name}
              className="mt-8 focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {category.snippets.map((snippet) => (
                  <CheatsheetCard key={snippet.title} snippet={snippet} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
      <footer className="py-6 text-center text-muted-foreground text-sm">
        <p>Built with ❤️, Next.js, and Tailwind CSS.</p>
      </footer>
    </div>
  );
}
