"use client";

import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCENARIOS } from "../scenarios";
import type { Scenario } from "../engine/types";

type Props = {
  activeId: string;
  scenario: Scenario | null;
  stepIndex: number;
  onTopic: (id: string) => void;
  onStep: (i: number) => void;
};

/** Left rail: every topic, with the open one expanded into its numbered steps. */
export function TopicList({ activeId, scenario, stepIndex, onTopic, onStep }: Props) {
  return (
    <aside className="min-h-0 border-b border-lab-border bg-lab-panel lg:overflow-y-auto lg:border-b-0">
      <p className="px-4 pb-1 pt-3 text-[10px] uppercase tracking-[0.18em] text-lab-muted">Topics</p>
      {/* Narrow screens: a horizontal strip of topics. */}
      <div className="flex gap-1.5 overflow-x-auto px-3 pb-2 lg:hidden">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => onTopic(s.id)}
            className={cn(
              "shrink-0 rounded-md border px-2.5 py-1.5 text-[11px]",
              s.id === activeId ? "border-lab-accent bg-lab-raised text-lab-accent" : "border-lab-border text-lab-muted",
            )}
          >
            {String(s.num).padStart(2, "0")} {s.short}
          </button>
        ))}
      </div>
      <nav className="hidden pb-4 lg:block" aria-label="Topics">
        {SCENARIOS.map((s) => {
          const open = s.id === activeId;
          return (
            <div key={s.id} className="px-2">
              <button
                onClick={() => onTopic(s.id)}
                aria-expanded={open}
                className={cn(
                  "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-[12px] leading-snug",
                  open ? "bg-lab-raised text-lab-text" : "text-lab-muted hover:bg-lab-raised hover:text-lab-text",
                )}
              >
                {open ? <ChevronDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lab-accent" /> : <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                <span className={cn("shrink-0 tabular-nums", open && "text-lab-accent")}>{String(s.num).padStart(2, "0")}</span>
                <span>{s.title}</span>
              </button>
              {open && (
                <ol className="mb-2 ml-[22px] mt-1 border-l border-lab-border">
                  {!scenario && <li className="px-3 py-1 text-[11px] text-lab-muted">loading…</li>}
                  {scenario?.steps.map((st, i) => {
                    const done = i < stepIndex;
                    const current = i === stepIndex;
                    return (
                      <li key={st.id}>
                        <button
                          onClick={() => onStep(i)}
                          aria-current={current ? "step" : undefined}
                          className={cn(
                            "-ml-px flex w-full items-start gap-2 border-l-2 py-1 pl-3 pr-2 text-left text-[11px] leading-snug",
                            current ? "border-lab-accent text-lab-text" : done ? "border-transparent text-lab-muted" : "border-transparent text-lab-muted hover:text-lab-text",
                          )}
                        >
                          <span className={cn("w-4 shrink-0 tabular-nums", current && "text-lab-accent")}>{done ? <Check className="mt-0.5 h-3 w-3" /> : i + 1}</span>
                          <span>{st.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          );
        })}
        <div className="mx-4 mt-4 space-y-1 rounded-md border border-lab-border p-3 text-[10.5px] text-lab-muted">
          <p className="mb-1 uppercase tracking-[0.14em]">Keys</p>
          <p>
            <kbd className="text-lab-text">Space</kbd> play / pause
          </p>
          <p>
            <kbd className="text-lab-text">→ ←</kbd> step / back
          </p>
          <p>
            <kbd className="text-lab-text">R</kbd> reset · <kbd className="text-lab-text">Ctrl K</kbd> search
          </p>
        </div>
      </nav>
    </aside>
  );
}
