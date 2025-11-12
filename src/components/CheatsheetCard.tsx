import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import type { Snippet } from "@/lib/cheatsheets";

export function CheatsheetCard({ snippet }: { snippet: Snippet }) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="font-headline text-xl">{snippet.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <p className="text-muted-foreground mb-4 text-sm font-body">
          {snippet.description}
        </p>
        <div className="flex-grow">
          <CodeBlock code={snippet.code} language={snippet.language} />
        </div>
      </CardContent>
    </Card>
  );
}
