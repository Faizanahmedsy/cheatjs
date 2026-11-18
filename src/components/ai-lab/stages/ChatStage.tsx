"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ChatStage as ChatStageSpec } from "../engine/types";
import { toneFill, toneVar } from "../engine/tones";
import { MSG_S, WORD_S, type StageProps } from "./common";


const ROLE = {
  system: { tone: "slate", label: "system", align: "center" },
  user: { tone: "cyan", label: "you", align: "end" },
  assistant: { tone: "green", label: "assistant", align: "start" },
  tool: { tone: "amber", label: "tool result", align: "start" },
} as const;

/**
 * A chat window: the system note, your messages on the right, the assistant's
 * on the left, tool results in amber. The last message can be typed out word
 * by word (streaming). An optional side box shows what the app sends, a
 * memory notebook, or similar.
 */
export default function ChatStage({ stage, animate, speed, runKey }: StageProps<ChatStageSpec>) {
  const { messages } = stage;
  const last = messages[messages.length - 1];
  const words = last ? last.text.split(/(\s+)/) : [];
  const stream = !!stage.streamLast && animate && !!last;
  const [count, setCount] = useState(stream ? 0 : words.length);

  useEffect(() => {
    if (!stream) {
      setCount(words.length);
      return;
    }
    setCount(0);
    let k = 0;
    let id = 0;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        k += 2; // a word and the space after it
        setCount(Math.min(words.length, k));
        if (k >= words.length) window.clearInterval(id);
      }, (WORD_S * 1000) / speed);
    }, (MSG_S * 1000 * Math.max(0, messages.length - 1) + 300) / speed);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [stream, words.length, messages.length, speed, runKey]);

  const dur = (s: number) => (animate ? s / speed : 0);

  return (
    <div className="flex h-full w-full flex-col gap-3 overflow-y-auto p-3 sm:p-4 md:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        {messages.map((m, i) => {
          const r = ROLE[m.role];
          const isLast = i === messages.length - 1;
          const text = isLast && stage.streamLast ? words.slice(0, count).join("") : m.text;
          const typing = isLast && stage.streamLast && count < words.length;
          return (
            <motion.div
              key={`${i}-${m.role}`}
              initial={animate ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: m.dim ? 0.4 : 1, y: 0 }}
              transition={{ duration: dur(0.3), delay: dur(i * MSG_S) }}
              className={r.align === "center" ? "self-center text-center" : r.align === "end" ? "self-end" : "self-start"}
              style={{ maxWidth: r.align === "center" ? "92%" : "82%" }}
            >
              <p className={`mb-0.5 font-labmono text-[10px] font-bold uppercase tracking-[0.14em] ${r.align === "end" ? "text-right" : ""}`} style={{ color: toneVar(r.tone) }}>
                {r.label}
              </p>
              <div
                className={`rounded-2xl border px-3 py-2 leading-snug text-lab-text ${m.role === "tool" ? "font-labmono text-[12px]" : "font-body text-[14px]"} ${r.align === "end" ? "rounded-br-sm" : r.align === "start" ? "rounded-bl-sm" : "rounded-lg text-[12.5px]"}`}
                style={{ borderColor: toneVar(r.tone), background: toneFill(r.tone, r.align === "center" ? 8 : 14) }}
              >
                <span className="whitespace-pre-wrap break-words">{text}</span>
                {typing && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse" style={{ background: toneVar(r.tone) }} />}
              </div>
              {m.note && <p className={`mt-0.5 font-labmono text-[11px] text-lab-muted ${r.align === "end" ? "text-right" : ""}`}>{m.note}</p>}
            </motion.div>
          );
        })}
        {stage.note && <p className="mt-auto pt-1 text-center font-labmono text-[12px] text-lab-muted">{stage.note}</p>}
      </div>
      {stage.aside && (
        <motion.aside
          initial={animate ? { opacity: 0, x: 12 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: dur(0.4), delay: dur(0.2) }}
          className="shrink-0 rounded-lg border p-3 md:w-[240px]"
          style={{ borderColor: toneVar(stage.aside.tone ?? "amber"), background: toneFill(stage.aside.tone ?? "amber", 7) }}
        >
          <p className="mb-2 font-labmono text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: toneVar(stage.aside.tone ?? "amber") }}>
            {stage.aside.title}
          </p>
          <ol className="space-y-1.5">
            {stage.aside.items.map((it, k) => (
              <motion.li
                key={k}
                initial={animate ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: dur(0.3), delay: dur(0.4 + k * 0.15) }}
                className="rounded border px-2 py-1 font-labmono text-[11.5px] leading-snug text-lab-text"
                style={{ borderColor: "var(--lab-border)", background: "var(--lab-panel)" }}
              >
                {it}
              </motion.li>
            ))}
          </ol>
        </motion.aside>
      )}
    </div>
  );
}
