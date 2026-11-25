import type { ReactNode } from "react";

const KEYWORDS = new Set(["function", "const", "let", "for", "of", "if", "else", "while", "return", "continue", "new", "class", "constructor", "this", "undefined"]);
const TOKEN = /(\/\/.*$)|("[^"]*"|'[^']*'|`[^`]*`)|(\b\d+\b)|(\b[A-Za-z_]\w*\b)|(\s+)|([^\w\s])/g;

/** Small, bright JavaScript highlighter for one code line. */
export function highlightLine(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let m: RegExpExecArray | null;
  let i = 0;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(line))) {
    const [text, comment, str, num, word] = m;
    const after = line.slice(m.index + text.length);
    const cls = comment
      ? "italic text-slate-500"
      : str
        ? "text-emerald-300"
        : num
          ? "text-amber-300"
          : word && KEYWORDS.has(word)
            ? "text-fuchsia-300"
            : word && /^\s*\(/.test(after)
              ? "text-sky-300"
              : word && /^[A-Z]/.test(word)
                ? "text-yellow-200"
                : "text-slate-100";
    out.push(<span key={i++} className={cls}>{text}</span>);
  }
  return out;
}
