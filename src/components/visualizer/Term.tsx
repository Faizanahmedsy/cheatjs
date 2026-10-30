import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Beginner definitions for the words the visualizer uses. */
export const TERMS = {
  frame: "A frame is a box holding one function call's own variables. Each call gets a new frame; it disappears when the call returns.",
  heap: "Objects, arrays, Maps and Sets live here. A variable doesn't hold the array itself — it holds an arrow (a reference) to it.",
  pointer: "A pointer is just a number variable used as an index, like i or left. The coloured ▲ shows which cell it points at.",
  iteration: "One iteration (or pass) is one trip through the loop body. Each row of the table is one pass.",
  window: "The window is the stretch of cells between two pointers (e.g. left..right). Sliding-window code grows and shrinks it.",
  dictionary: "A Map (or plain object) stores key → value pairs. Looking a key up is instant, which is why hashing solutions are fast.",
} as const;

export type TermName = keyof typeof TERMS;

/** A word with a dotted underline that explains itself on hover / focus. Plain text when `enabled` is false. */
export function Term({ name, children, enabled = true }: { name: TermName; children: ReactNode; enabled?: boolean }) {
  if (!enabled) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="cursor-help underline decoration-slate-500 decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs border-slate-700 bg-slate-900 text-sm normal-case tracking-normal text-slate-200">{TERMS[name]}</TooltipContent>
    </Tooltip>
  );
}
