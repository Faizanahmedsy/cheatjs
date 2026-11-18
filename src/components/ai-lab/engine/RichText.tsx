"use client";

import { createContext, useContext, type ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { GLOSSARY } from "./glossary";

export type LabTheme = "dark" | "light";
export const LabThemeContext = createContext<LabTheme>("dark");

/** A jargon word with a dotted underline that explains itself on hover or focus. */
export function GlossaryTerm({ k, children }: { k: string; children: ReactNode }) {
  const theme = useContext(LabThemeContext);
  const entry = GLOSSARY[k];
  if (!entry) return <>{children}</>;
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        <span
          tabIndex={0}
          className="cursor-help underline decoration-dotted decoration-lab-accent underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-lab-accent"
        >
          {children}
        </span>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          data-theme={theme}
          className="ai-lab-pop z-[80] max-w-xs rounded-md border border-lab-border bg-lab-panel px-3 py-2 text-[13px] leading-snug text-lab-text shadow-xl"
        >
          <span className="mb-1 block font-labmono text-[11px] font-semibold uppercase tracking-wider text-lab-accent">{entry.term}</span>
          {entry.def}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

const TOKEN = /(\{\{[^}]+\}\}|\*\*[^*]+\*\*|`[^`]+`)/g;

function inline(text: string, keyBase: string): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith("{{")) {
      const [k, shown] = part.slice(2, -2).split("|");
      return (
        <GlossaryTerm key={key} k={k.trim()}>
          {shown ?? k.trim().replace(/-/g, " ")}
        </GlossaryTerm>
      );
    }
    if (part.startsWith("**")) return <strong key={key} className="font-semibold text-lab-text">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`"))
      return (
        <code key={key} className="rounded bg-lab-raised px-1 py-0.5 font-labmono text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
}

/** Renders the light markup used in scenario text. Blank lines start new paragraphs; lines starting "- " become bullets. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className={className}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={bi} className="my-2 list-disc space-y-1 pl-5">
              {lines.map((l, li) => (
                <li key={li}>{inline(l.trim().slice(2), `${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi} className="my-2 first:mt-0 last:mb-0">
            {inline(block.replace(/\n/g, " "), String(bi))}
          </p>
        );
      })}
    </div>
  );
}
