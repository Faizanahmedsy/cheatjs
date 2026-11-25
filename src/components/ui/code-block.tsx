"use client";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  return (
    <div className="relative rounded-md bg-slate-900/70 text-sm font-code shadow-inner border border-slate-700/80 overflow-hidden">
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        wrapLongLines
        customStyle={{
          margin: 0,
          padding: "1rem",
          backgroundColor: "transparent",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowX: "hidden",
        }}
        codeTagProps={{
          style: {
            fontFamily: "inherit",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
