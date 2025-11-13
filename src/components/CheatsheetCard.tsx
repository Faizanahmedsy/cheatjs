import { CodeBlock } from "@/components/ui/code-block";
import type { Snippet } from "@/lib/cheatsheets";
import { cn } from "@/lib/utils";

const colorVariants = {
  cyan: "bg-cyan-400/20 text-cyan-300",
  green: "bg-green-400/20 text-green-300",
  yellow: "bg-yellow-400/20 text-yellow-300",
};

export function CheatsheetCard({
  snippet,
  color = "cyan",
}: {
  snippet: Snippet;
  color: keyof typeof colorVariants;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden h-full flex flex-col">
      <div className="relative p-4">
        <div
          className={cn(
            "absolute top-0 right-3 text-xs font-bold px-2 py-0.5 rounded-b-md",
            colorVariants[color]
          )}
        >
          {snippet.title}
        </div>
        <p className="text-slate-400 mt-6 mb-2 text-sm font-body">
          {snippet.description}
        </p>
        <div className="flex-grow mt-auto">
          <CodeBlock code={snippet.code} language={snippet.language} />
        </div>
      </div>
    </div>
  );
}
