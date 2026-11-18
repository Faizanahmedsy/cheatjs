"use client";

import { Fragment, useEffect, useRef } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { Bot, Box, CircleCheck, FileText, Inbox, Library, MessageSquareText, Scissors, Search, User, UserSearch, type LucideIcon } from "lucide-react";
import type { CardsStage as CardsStageSpec } from "../engine/types";
import { toneFill, toneVar } from "../engine/tones";
import type { StageProps } from "./common";

const ICONS: Record<NonNullable<CardsStageSpec["zones"][number]["icon"]>, LucideIcon> = {
  doc: FileText,
  scissors: Scissors,
  shelf: Library,
  person: User,
  librarian: UserSearch,
  tray: Inbox,
  llm: Bot,
  answer: MessageSquareText,
  box: Box,
  search: Search,
  check: CircleCheck,
};

/** Zone text with `[n]` turned into little sticky-note citations. */
function Cited({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[\d+\])/).map((part, i) =>
        /^\[\d+\]$/.test(part) ? (
          <span
            key={i}
            className="mx-0.5 inline-flex h-[18px] min-w-[18px] -rotate-3 items-center justify-center rounded-sm px-1 align-middle font-labmono text-[10.5px] font-bold shadow-sm"
            style={{ background: toneFill("amber", 55), color: "var(--lab-text)" }}
            title={`source ${part.slice(1, -1)}`}
          >
            {part.slice(1, -1)}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/**
 * Zones laid out left to right (two per row on phones) holding cards. A card
 * keeps its id across steps, so when the next step puts it in another zone it
 * flies there. This component is keyed per topic, not per step, so it stays
 * mounted and framer can animate the move.
 */
export default function CardsStage({ stage, animate, speed }: StageProps<CardsStageSpec>) {
  const seen = useRef<Set<string>>(new Set());
  const ids = stage.zones.flatMap((z) => (z.cards ?? []).map((c) => c.id));
  const before = seen.current;
  useEffect(() => {
    seen.current = new Set(ids);
  });
  const dur = (s: number) => (animate ? s / speed : 0);
  let fresh = 0;

  return (
    <LayoutGroup>
      <div className="flex h-full w-full flex-col gap-2 overflow-y-auto p-3 font-labmono sm:p-4">
        <div
          className="grid flex-1 grid-cols-2 content-start gap-2.5 md:content-stretch md:gap-4 md:[grid-template-columns:repeat(var(--zones),minmax(0,1fr))]"
          style={{ ["--zones" as string]: stage.zones.length }}
        >
          {stage.zones.map((z, zi) => {
            const Icon = z.icon ? ICONS[z.icon] : null;
            const tone = z.tone ?? "slate";
            return (
              <div key={z.id} className="relative flex min-w-0 flex-col rounded-lg border p-2 sm:p-2.5" style={{ borderColor: toneVar(tone), background: toneFill(tone, 6) }}>
                {zi < stage.zones.length - 1 && (
                  <span aria-hidden className="absolute -right-[15px] top-1/2 z-10 hidden -translate-y-1/2 text-[15px] font-bold md:block" style={{ color: "var(--lab-muted)" }}>
                    →
                  </span>
                )}
                <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: toneVar(tone) }}>
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{z.label}</span>
                </p>
                {z.text && (
                  <motion.div
                    key={z.text}
                    initial={animate ? { opacity: 0, y: 6 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: dur(0.4), delay: dur(0.3) }}
                    className="mb-2 rounded-md border px-2 py-1.5 font-body text-[12.5px] leading-snug text-lab-text"
                    style={{ borderColor: "var(--lab-border)", background: "var(--lab-panel)" }}
                  >
                    <Cited text={z.text} />
                  </motion.div>
                )}
                <div className="flex flex-col gap-1.5">
                  {(z.cards ?? []).map((c) => {
                    const ctone = c.tone ?? "blue";
                    const isNew = !before.has(c.id);
                    const delay = isNew ? 0.2 + fresh++ * 0.12 : 0;
                    return (
                      <motion.div
                        key={c.id}
                        layoutId={c.id}
                        layout
                        initial={animate && isNew ? { opacity: 0, scale: 0.92 } : false}
                        animate={{ opacity: c.struck ? 0.45 : 1, scale: 1 }}
                        transition={{ duration: dur(0.35), delay: dur(delay), layout: { duration: dur(0.8), ease: [0.3, 0.7, 0.2, 1] } }}
                        className="relative rounded-md border px-2 py-1.5"
                        style={{ borderColor: toneVar(ctone), background: toneFill(ctone, 14) }}
                      >
                        {c.badge && (
                          <span className="absolute -right-1.5 -top-2 rotate-6 rounded-sm px-1.5 text-[10.5px] font-bold shadow-sm" style={{ background: toneFill("amber", 55), color: "var(--lab-text)" }}>
                            {c.badge}
                          </span>
                        )}
                        <div className="flex items-start gap-2">
                          <span className={`min-w-0 flex-1 text-[12px] font-semibold leading-snug text-lab-text ${c.struck ? "line-through" : ""}`}>{c.title}</span>
                          {c.score && (
                            <span className="shrink-0 rounded px-1 text-[10.5px] font-bold tabular-nums" style={{ color: toneVar(ctone), background: "var(--lab-panel)" }}>
                              {c.score}
                            </span>
                          )}
                        </div>
                        {c.sub && <p className="mt-0.5 font-body text-[11px] leading-snug text-lab-muted">{c.sub}</p>}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {stage.note && <p className="text-center text-[12px] text-lab-muted">{stage.note}</p>}
      </div>
    </LayoutGroup>
  );
}
