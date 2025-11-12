"use client";

import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
    });
  };

  return (
    <div className="relative rounded-lg bg-slate-900 text-sm text-slate-50 font-code shadow-lg h-full">
      <div className="flex justify-between items-center px-4 py-2 border-b border-slate-700">
        <span className="text-xs uppercase font-semibold text-slate-400">
          {language}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto h-full">
        <code className={cn("language-", language)}>{code}</code>
      </pre>
    </div>
  );
}
