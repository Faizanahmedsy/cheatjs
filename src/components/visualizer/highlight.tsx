import type { ReactNode } from "react";

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while", "do", "break", "continue", "new", "of", "in",
  "class", "switch", "case", "default", "typeof", "throw", "try", "catch", "finally", "async", "await",
  // Python
  "def", "elif", "not", "and", "or", "is", "lambda", "pass", "import", "from", "as", "with", "yield", "global", "nonlocal",
  // Java / C++
  "public", "private", "protected", "static", "void", "int", "long", "double", "float", "boolean", "bool", "char", "String",
  "string", "auto", "final", "struct", "include", "using", "namespace", "std", "vector", "unordered_map", "unordered_set",
  "HashMap", "HashSet", "ArrayList", "List", "Map", "Set", "Integer", "Character", "Boolean", "Deque", "ArrayDeque",
]);
const LITERALS = new Set(["true", "false", "null", "undefined", "this", "NaN", "Infinity", "True", "False", "None", "self", "nullptr"]);

/** comment (// or #) | string | number | identifier */
const TOKEN = /(\/\/.*$|#(?!include).*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;

/** Tiny one-line JavaScript colouring: enough to make code easy on the eye without a parser. */
export function highlightLine(text: string): ReactNode[] {
  const trimmed = text.trimStart();
  if (trimmed.startsWith("/*") || trimmed.startsWith("*")) {
    return [<span key="c" className="italic text-slate-500">{text}</span>];
  }
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(TOKEN)) {
    const at = match.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const [token, comment, string, number, word] = match;
    if (comment) out.push(<span key={key++} className="italic text-slate-500">{token}</span>);
    else if (string) out.push(<span key={key++} className="text-amber-300">{token}</span>);
    else if (number) out.push(<span key={key++} className="text-fuchsia-300">{token}</span>);
    else if (word && KEYWORDS.has(word)) out.push(<span key={key++} className="font-semibold text-sky-300">{token}</span>);
    else if (word && LITERALS.has(word)) out.push(<span key={key++} className="text-violet-300">{token}</span>);
    else if (word && text[at + token.length] === "(") out.push(<span key={key++} className="text-yellow-200">{token}</span>);
    else out.push(token);
    last = at + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
