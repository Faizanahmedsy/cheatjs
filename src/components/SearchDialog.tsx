"use client";

import { withBase } from "@/lib/base-path";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Entry = { t: string; s: string; h: string; k: string; x?: string };

const KIND_COLOR: Record<string, string> = {
  Cheatsheet: "text-cyan-300 border-cyan-400/40",
  Study: "text-emerald-300 border-emerald-400/40",
  Section: "text-slate-300 border-slate-500",
  Term: "text-amber-300 border-amber-400/40",
};

function score(e: Entry & { _l: string; _t: string }, tokens: string[]): number {
  let s = 0;
  for (const tok of tokens) {
    if (!e._l.includes(tok)) return 0;
    if (e._t === tok) s += 12;
    else if (e._t.startsWith(tok)) s += 8;
    else if (e._t.includes(tok)) s += 5;
    else s += 1;
  }
  if (e.k === "Study" || e.k === "Cheatsheet") s += 1;
  return s;
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [index, setIndex] = useState<(Entry & { _l: string; _t: string })[] | null>(null);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [failed, setFailed] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || index || failed) return;
    fetch(withBase("/search-index.json"))
      .then((r) => r.json() as Promise<Entry[]>)
      .then((list) =>
        setIndex(list.map((e) => ({ ...e, _t: e.t.toLowerCase(), _l: `${e.t} ${e.s} ${e.x ?? ""}`.toLowerCase() })))
      )
      .catch(() => setFailed(true));
  }, [open, index, failed]);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => input.current?.focus(), 30);
    }
  }, [open]);

  const results = useMemo(() => {
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!index || tokens.length === 0) return [];
    return index
      .map((e) => ({ e, s: score(e, tokens) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 40)
      .map((r) => r.e);
  }, [index, q]);

  const go = useCallback(
    (e: Entry) => {
      onClose();
      router.push(e.h);
    },
    [onClose, router]
  );

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 p-3 pt-[10vh]" onMouseDown={onClose} role="dialog" aria-label="Search">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-600 bg-slate-900 shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-slate-700 px-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            ref={input}
            value={q}
            onChange={(e) => { setQ(e.target.value); setSel(0); }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              else if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
              else if (e.key === "Enter" && results[sel]) go(results[sel]);
            }}
            placeholder="Search cheatsheets, AWS, Gen AI, terms…"
            className="h-12 flex-1 bg-transparent text-base text-slate-100 outline-none placeholder:text-slate-500"
            aria-label="Search"
          />
          <button onClick={onClose} aria-label="Close search" className="p-1 text-slate-400 hover:text-slate-200"><X className="h-4 w-4" /></button>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto p-2">
          {failed ? <li className="p-4 text-sm text-amber-300">Search is not available right now.</li> : null}
          {!failed && !index ? <li className="p-4 text-sm text-slate-400">Loading…</li> : null}
          {index && q.trim() && results.length === 0 ? <li className="p-4 text-sm text-slate-400">No results for “{q}”.</li> : null}
          {index && !q.trim() ? <li className="p-4 text-sm text-slate-500">Type to search. Use ↑ ↓ and Enter. Press Esc to close.</li> : null}
          {results.map((r, i) => (
            <li key={`${r.h}-${r.t}-${i}`}>
              <button
                onMouseEnter={() => setSel(i)}
                onClick={() => go(r)}
                className={cn("w-full rounded-lg px-3 py-2 text-left", i === sel ? "bg-slate-800" : "")}
              >
                <span className="flex items-center gap-2">
                  <span className={cn("rounded border px-1.5 text-[10px] font-semibold uppercase", KIND_COLOR[r.k] ?? "")}>{r.k}</span>
                  <span className="truncate text-sm font-medium text-slate-100">{r.t}</span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-400">{r.s}{r.x ? ` · ${r.x}` : ""}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
