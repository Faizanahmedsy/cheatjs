import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import type { Snippet } from "@/lib/cheatsheets";
import { ArrowUpRight } from "lucide-react";

export function CheatsheetCard({ snippet }: { snippet: Snippet }) {
  return (
    <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-cyan-400/50 hover:shadow-cyan-500/10 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row justify-between items-start pb-2">
        <CardTitle className="font-headline text-lg text-slate-100">
          {snippet.title}
        </CardTitle>
        <a href="#" className="text-slate-400 hover:text-cyan-300 transition-colors">
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col pt-2">
        <p className="text-slate-400 mb-4 text-sm font-body">
          {snippet.description}
        </p>
        <div className="flex-grow mt-auto">
          <CodeBlock code={snippet.code} language={snippet.language} />
        </div>
      </CardContent>
    </Card>
  );
}