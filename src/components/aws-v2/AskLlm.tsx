"use client";

import { useState } from "react";
import { Check, ChevronDown, Copy, ExternalLink, FileText, Sparkles } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

/**
 * "Open in LLM" menu on every docs page: copy the page as Markdown, or open
 * ChatGPT / Claude with a prompt that points at the page's Markdown version,
 * so the learner can ask follow-up questions about exactly this lesson.
 */
export function AskLlm({ title, mdUrl, pageUrl }: { title: string; mdUrl: string; pageUrl: string }) {
  const [copied, setCopied] = useState(false);
  const prompt = `Read ${mdUrl} . It is the "${title}" lesson from Billu Class (${pageUrl}). Teach it to me in simple words with small examples, then quiz me with 3 questions one at a time and correct my answers.`;
  const q = encodeURIComponent(prompt);

  const copy = async () => {
    try {
      const res = await fetch(mdUrl.replace(/^https?:\/\/[^/]+/, ""));
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.open(mdUrl, "_blank", "noopener");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-shortcut="llm"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400 hover:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
          {copied ? "Copied!" : "Open in LLM"}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 border-slate-700 bg-slate-900 text-slate-200">
        <DropdownMenuLabel className="text-xs font-normal text-slate-400">Learn more about this page with AI</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <a href={`https://chatgpt.com/?hints=search&q=${q}`} target="_blank" rel="noopener noreferrer" className="flex cursor-pointer items-center gap-2">
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> Open in ChatGPT
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`https://claude.ai/new?q=${q}`} target="_blank" rel="noopener noreferrer" className="flex cursor-pointer items-center gap-2">
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> Open in Claude
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem onSelect={() => void copy()} className="flex cursor-pointer items-center gap-2">
          {copied ? <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          Copy page as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={mdUrl} target="_blank" rel="noopener noreferrer" className="flex cursor-pointer items-center gap-2">
            <FileText className="h-4 w-4" aria-hidden="true" /> View as Markdown
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
