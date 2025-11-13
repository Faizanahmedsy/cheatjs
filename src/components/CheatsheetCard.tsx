import { CodeBlock } from "@/components/ui/code-block";
import type { Snippet } from "@/lib/cheatsheets";
import { cn } from "@/lib/utils";
import { HashMapVisualization } from "./visualizations/HashMapVisualization";

const colorVariants = {
  cyan: "bg-cyan-400/20 text-cyan-300",
  green: "bg-green-400/20 text-green-300",
  yellow: "bg-yellow-400/20 text-yellow-300",
  red: "bg-red-400/20 text-red-300",
};

const visualizationComponents: { [key: string]: React.ComponentType<any> } = {
  'HashMap': HashMapVisualization,
};

export function CheatsheetCard({
  snippet,
  color = "cyan",
}: {
  snippet: Snippet;
  color: keyof typeof colorVariants;
}) {
  const VisualizationComponent = snippet.visualization ? visualizationComponents[snippet.visualization] : null;

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden h-full flex flex-col">
      <div className="relative p-4 flex-grow flex flex-col">
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

        {VisualizationComponent && (
          <div className="my-4">
            <VisualizationComponent />
          </div>
        )}

        <div className="flex-grow mt-auto">
          <CodeBlock code={snippet.code} language={snippet.language} />
        </div>
      </div>
    </div>
  );
}
