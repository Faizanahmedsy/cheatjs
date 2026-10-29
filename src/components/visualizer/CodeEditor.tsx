"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  /** Line with a syntax error, marked in the gutter. */
  errorLine?: number;
}

const INDENT = "  ";

/** A plain textarea with a line-number gutter that scrolls with it. */
export function CodeEditor({ code, onChange, errorLine }: CodeEditorProps) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const lineCount = code.split("\n").length;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Tab" || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const area = event.currentTarget;
    const { selectionStart, selectionEnd } = area;
    onChange(code.slice(0, selectionStart) + INDENT + code.slice(selectionEnd));
    requestAnimationFrame(() => {
      area.selectionStart = area.selectionEnd = selectionStart + INDENT.length;
    });
  };

  return (
    <div className="flex h-[22rem] overflow-hidden rounded-lg border border-slate-700/60 bg-slate-950 font-code text-[15px] leading-7 lg:h-[30rem]">
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="shrink-0 select-none overflow-hidden border-r border-slate-800 py-3 pl-3 pr-3 text-right text-slate-600"
      >
        {Array.from({ length: lineCount }, (_, index) => (
          <div key={index} className={cn(errorLine === index + 1 && "font-semibold text-red-400")}>
            {index + 1}
          </div>
        ))}
      </div>
      <textarea
        value={code}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={(event) => {
          if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop;
        }}
        aria-label="JavaScript code"
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        wrap="off"
        className="min-w-0 flex-1 resize-none overflow-auto whitespace-pre bg-transparent px-3 py-3 text-slate-100 caret-cyan-300 outline-none selection:bg-cyan-400/25 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400/50"
      />
    </div>
  );
}
