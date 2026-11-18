"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCENARIOS } from "../scenarios";
import { GLOSSARY } from "../engine/glossary";
import type { Scenario } from "../engine/types";
import type { LabTheme } from "../engine/RichText";
import { LEVEL_LABEL } from "./RightPanel";

export type PaletteTarget =
  | { kind: "topic"; topic: string }
  | { kind: "step"; topic: string; step: number }
  | { kind: "question"; topic: string; id: string };

type Item = { key: string; group: string; title: string; sub: string; hay: string; target?: PaletteTarget };

/** Ctrl/⌘K search over topics, steps, interview questions and glossary terms. */
export function CommandPalette({ theme, onClose, onPick }: { theme: LabTheme; onClose: () => void; onPick: (t: PaletteTarget) => void }) {
  const [q, setQ] = useState("");
  const [loaded, setLoaded] = useState<Scenario[]>([]);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    input.current?.focus();
    // Searching needs every topic's steps and questions, so load them all (each is its own small chunk).
    let live = true;
    Promise.all(SCENARIOS.map((m) => m.load().then((x) => x.default))).then((all) => live && setLoaded(all));
    return () => {
      live = false;
    };
  }, []);

  const items = useMemo<Item[]>(() => {
    const out: Item[] = SCENARIOS.map((m) => ({
      key: `t-${m.id}`,
      group: "Topics",
      title: `${String(m.num).padStart(2, "0")} ${m.title}`,
      sub: m.tagline,
      hay: `${m.title} ${m.tagline} ${m.keywords}`.toLowerCase(),
      target: { kind: "topic", topic: m.id },
    }));
    for (const s of loaded) {
      s.steps.forEach((st, i) =>
        out.push({
          key: `s-${s.id}-${st.id}`,
          group: "Steps",
          title: st.title,
          sub: `${s.title} · step ${i + 1}`,
          hay: `${st.title} ${s.title} ${st.explain}`.toLowerCase(),
          target: { kind: "step", topic: s.id, step: i },
        }),
      );
      s.interview.forEach((iq) =>
        out.push({
          key: `q-${s.id}-${iq.id}`,
          group: "Interview questions",
          title: iq.q,
          sub: `${s.title} · ${LEVEL_LABEL[iq.level]}${iq.design ? " · design" : ""}`,
          hay: `${iq.q} ${iq.answer}`.toLowerCase(),
          target: { kind: "question", topic: s.id, id: iq.id },
        }),
      );
    }
    Object.entries(GLOSSARY).forEach(([k, g]) => out.push({ key: `g-${k}`, group: "Glossary", title: g.term, sub: g.def, hay: `${g.term} ${k} ${g.def}`.toLowerCase() }));
    return out;
  }, [loaded]);

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return items.filter((i) => i.group === "Topics");
    const scored = items
      .filter((i) => words.every((w) => i.hay.includes(w)))
      .map((i) => ({ i, score: words.reduce((s, w) => s + (i.title.toLowerCase().includes(w) ? 2 : 0), 0) }))
      .sort((a, b) => b.score - a.score);
    // Keep groups together in a stable order.
    const order = ["Topics", "Steps", "Interview questions", "Glossary"];
    return order.flatMap((g) => scored.filter((x) => x.i.group === g).slice(0, 8).map((x) => x.i));
  }, [items, q]);

  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    list.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (it: Item | undefined) => {
    if (it?.target) onPick(it.target);
  };

  return (
    <div className="ai-lab-pop fixed inset-0 z-[90] flex items-start justify-center bg-black/50 p-4 pt-[12vh]" data-theme={theme} onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the lab"
        className="w-full max-w-xl overflow-hidden rounded-lg border border-lab-border bg-lab-panel font-labmono shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(results.length - 1, a + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          } else if (e.key === "Enter") {
            e.preventDefault();
            choose(results[active]);
          }
        }}
      >
        <div className="flex items-center gap-2 border-b border-lab-border px-3">
          <Search className="h-4 w-4 text-lab-muted" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search topics, steps, interview questions, terms…"
            className="h-11 flex-1 bg-transparent text-[13px] text-lab-text outline-none placeholder:text-lab-muted"
            aria-label="Search"
          />
          <kbd className="rounded border border-lab-border px-1 text-[10px] text-lab-muted">Esc</kbd>
        </div>
        <ul ref={list} className="max-h-[55vh] overflow-y-auto py-1" role="listbox">
          {results.length === 0 && <li className="px-4 py-6 text-center text-[12px] text-lab-muted">{loaded.length ? "No matches." : "Loading topics…"}</li>}
          {results.map((r, idx) => (
            <li key={r.key} role="option" aria-selected={idx === active}>
              {(idx === 0 || results[idx - 1].group !== r.group) && <p className="px-4 pb-1 pt-2 text-[9.5px] uppercase tracking-[0.16em] text-lab-muted">{r.group}</p>}
              <button
                data-idx={idx}
                onMouseEnter={() => setActive(idx)}
                onClick={() => choose(r)}
                className={cn("block w-full px-4 py-1.5 text-left", idx === active && "bg-lab-raised", !r.target && "cursor-default")}
              >
                <span className="block truncate text-[12.5px] text-lab-text">{r.title}</span>
                <span className={cn("block font-body text-[11.5px] text-lab-muted", r.target ? "truncate" : "whitespace-normal")}>{r.sub}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
