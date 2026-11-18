"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { TokensStage as TokensStageSpec } from "../engine/types";
import { toneFill, toneVar } from "../engine/tones";
import { fmtNum, GEN_TOKEN_S, H, timing, W, type StageProps } from "./common";

const ROW_Y = 300;
const BLOCK_H = 46;

/** Lays word blocks out in centred rows that fit the stage width. */
function layout(tokens: string[], maxWidth: number, gap = 12) {
  const widths = tokens.map((t) => Math.max(64, t.length * 12 + 26));
  const rows: number[][] = [[]];
  let rowW = 0;
  widths.forEach((w, i) => {
    if (rowW + w > maxWidth && rows[rows.length - 1].length) {
      rows.push([]);
      rowW = 0;
    }
    rows[rows.length - 1].push(i);
    rowW += w + gap;
  });
  const pos: { x: number; w: number; row: number }[] = [];
  rows.forEach((r, ri) => {
    const total = r.reduce((s, i) => s + widths[i], 0) + gap * (r.length - 1);
    let x = (maxWidth - total) / 2;
    r.forEach((i) => {
      pos[i] = { x, w: widths[i], row: ri };
      x += widths[i] + gap;
    });
  });
  return { pos, rows: rows.length };
}

const shown = (t: string) => t.replace(/^ /, "␣").replace(/\n/g, "⏎");

/**
 * Words as blocks. Modes: split (a sentence cut into blocks), ids (each block's
 * number), vectors (each block's list of numbers), qkv (three cards per word),
 * attention (curved lines, thickness = attention — hover a word to switch),
 * next (candidate next words) and generate (words appearing one by one, with
 * the KV cache as a notebook that fills up).
 */
export default function TokensStage({ stage, animate, speed, runKey }: StageProps<TokensStageSpec>) {
  const t = timing(animate, speed);
  const { mode, tokens } = stage;
  const [focus, setFocus] = useState(stage.focus ?? tokens.length - 1);
  useEffect(() => setFocus(stage.focus ?? tokens.length - 1), [stage.focus, tokens.length, runKey]);

  const notebookW = mode === "generate" && stage.notebook ? 230 : 0;
  const areaW = W - 60 - notebookW;
  const { pos } = layout(mode === "next" ? [...tokens, "?"] : tokens, areaW);
  const X0 = 30;
  const rowY = (row: number) =>
    mode === "generate" ? 120 + row * 70 : mode === "attention" ? ROW_Y + 40 : mode === "next" ? 80 + row * 70 : mode === "qkv" || mode === "vectors" ? 110 + row * 70 : ROW_Y - 60 + row * 70;

  const promptCount = stage.promptCount ?? tokens.length;
  const genDelay = (i: number) => (i < promptCount ? 0 : 0.6 + (i - promptCount) * GEN_TOKEN_S);

  const block = (i: number, label: string, tone: "blue" | "green" | "amber" | "slate" = "blue", extra?: React.ReactNode, delay = 0) => {
    const p = pos[i];
    const x = X0 + p.x;
    const y = rowY(p.row);
    const active = mode === "attention" && i === focus;
    return (
      <motion.g
        key={`b-${i}`}
        initial={animate && delay > 0 ? { opacity: 0, y: -12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.4, delay)}
        onMouseEnter={mode === "attention" ? () => setFocus(i) : undefined}
        onFocus={mode === "attention" ? () => setFocus(i) : undefined}
        tabIndex={mode === "attention" ? 0 : undefined}
        style={{ cursor: mode === "attention" ? "pointer" : undefined, outline: "none" }}
      >
        <rect x={x} y={y} width={p.w} height={BLOCK_H} rx={8} strokeWidth={active ? 3 : 1.8} style={{ fill: toneFill(active ? "amber" : tone, active ? 26 : 16), stroke: toneVar(active ? "amber" : tone) }} />
        <text x={x + p.w / 2} y={y + 29} textAnchor="middle" fontSize={17} fontWeight={600} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)", whiteSpace: "pre" }}>
          {label}
        </text>
        {extra}
      </motion.g>
    );
  };

  const centre = (i: number) => X0 + pos[i].x + pos[i].w / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={`Tokens: ${tokens.join("")}`}>
      {/* split: the whole sentence first, then the blocks */}
      {mode === "split" && stage.text && (
        <g>
          <rect x={90} y={70} width={W - 180} height={56} rx={10} style={{ fill: toneFill("cyan", 12), stroke: toneVar("cyan") }} />
          <text x={W / 2} y={106} textAnchor="middle" fontSize={22} fontWeight={600} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
            “{stage.text}”
          </text>
          <text x={W / 2} y={168} textAnchor="middle" fontSize={14} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
            ✂ the tokenizer cuts it into pieces ↓
          </text>
        </g>
      )}

      {mode !== "generate" &&
        tokens.map((tok, i) =>
          block(
            i,
            shown(tok),
            "blue",
            <>
              {mode === "ids" && stage.ids?.[i] !== undefined && (
                <motion.g initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={t(0.4, 0.4 + i * 0.3)}>
                  <line x1={centre(i)} y1={rowY(pos[i].row) + BLOCK_H} x2={centre(i)} y2={rowY(pos[i].row) + BLOCK_H + 24} strokeWidth={2} style={{ stroke: toneVar("violet") }} />
                  <rect x={centre(i) - 38} y={rowY(pos[i].row) + BLOCK_H + 24} width={76} height={30} rx={15} style={{ fill: toneFill("violet", 20), stroke: toneVar("violet") }} />
                  <text x={centre(i)} y={rowY(pos[i].row) + BLOCK_H + 44} textAnchor="middle" fontSize={14} fontWeight={700} style={{ fill: toneVar("violet"), fontFamily: "var(--lab-mono)" }}>
                    {stage.ids[i]}
                  </text>
                </motion.g>
              )}
              {mode === "vectors" && stage.vectors?.[i] && (
                <g>
                  {stage.vectors[i].map((v, k, arr) => {
                    const bw = Math.min(14, (pos[i].w - 10) / arr.length - 3);
                    const total = arr.length * (bw + 3) - 3;
                    const bx = centre(i) - total / 2 + k * (bw + 3);
                    const base = rowY(pos[i].row) + BLOCK_H + 60;
                    const max = Math.max(...stage.vectors!.flat().map(Math.abs), 1e-9);
                    const h = (Math.abs(v) / max) * 40;
                    return (
                      <motion.rect
                        key={k}
                        x={bx}
                        y={v >= 0 ? base - h : base}
                        width={bw}
                        height={Math.max(1, h)}
                        initial={animate ? { scaleY: 0 } : false}
                        animate={{ scaleY: 1 }}
                        transition={t(0.4, 0.3 + i * 0.25 + k * 0.05)}
                        style={{ fill: toneVar(v >= 0 ? "blue" : "rose"), originY: v >= 0 ? 1 : 0 }}
                      >
                        <title>{fmtNum(v, 2)}</title>
                      </motion.rect>
                    );
                  })}
                  <line x1={centre(i) - pos[i].w / 2 + 4} x2={centre(i) + pos[i].w / 2 - 4} y1={rowY(pos[i].row) + BLOCK_H + 60} y2={rowY(pos[i].row) + BLOCK_H + 60} style={{ stroke: "var(--lab-border)" }} />
                </g>
              )}
              {mode === "qkv" &&
                (
                  [
                    ["Q", "looking for", "cyan"],
                    ["K", "label", "violet"],
                    ["V", "info", "green"],
                  ] as const
                ).map(([k, sub, tone], c) => (
                  <motion.g key={k} initial={animate ? { opacity: 0, y: -8 } : false} animate={{ opacity: 1, y: 0 }} transition={t(0.35, 0.3 + i * 0.2 + c * 0.15)}>
                    <rect x={centre(i) - 46} y={rowY(pos[i].row) + BLOCK_H + 14 + c * 42} width={92} height={34} rx={6} style={{ fill: toneFill(tone, 18), stroke: toneVar(tone) }} />
                    <text x={centre(i) - 36} y={rowY(pos[i].row) + BLOCK_H + 36 + c * 42} fontSize={15} fontWeight={800} style={{ fill: toneVar(tone), fontFamily: "var(--lab-mono)" }}>
                      {k}
                    </text>
                    <text x={centre(i) - 18} y={rowY(pos[i].row) + BLOCK_H + 35 + c * 42} fontSize={10.5} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
                      {sub}
                    </text>
                  </motion.g>
                ))}
            </>,
            mode === "split" ? 0.5 + i * 0.25 : 0,
          ),
        )}

      {/* attention: curved lines from the focused word, thickness = attention */}
      {mode === "attention" && stage.attention && (
        <g>
          {stage.attention[focus].map((a, j) => {
            const x1 = centre(focus);
            const x2 = centre(j);
            const y = rowY(0) - 4;
            const lift = j === focus ? 60 : Math.min(290, 50 + Math.abs(x1 - x2) * 0.42);
            const d = j === focus ? `M ${x1 - 14} ${y} C ${x1 - 40} ${y - lift}, ${x1 + 40} ${y - lift}, ${x1 + 14} ${y}` : `M ${x1} ${y} C ${x1} ${y - lift}, ${x2} ${y - lift}, ${x2} ${y}`;
            const peakX = j === focus ? x1 : (x1 + x2) / 2;
            const peakY = y - lift * 0.75 - 8;
            return (
              <g key={`${focus}-${j}`}>
                <motion.path
                  d={d}
                  fill="none"
                  strokeLinecap="round"
                  strokeWidth={1.5 + a * 16}
                  initial={animate ? { pathLength: 0, opacity: 0 } : false}
                  animate={{ pathLength: 1, opacity: 0.35 + a * 0.65 }}
                  transition={t(0.7, 0.15 + j * 0.12)}
                  style={{ stroke: toneVar("amber") }}
                >
                  <title>{`${shown(tokens[focus])} → ${shown(tokens[j])}: ${(a * 100).toFixed(1)}%`}</title>
                </motion.path>
                <motion.g initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={t(0.3, 0.6 + j * 0.12)}>
                  <rect x={peakX - 28} y={peakY - 14} width={56} height={22} rx={11} style={{ fill: "var(--lab-panel)", stroke: toneVar("amber") }} />
                  <text x={peakX} y={peakY + 2} textAnchor="middle" fontSize={12} fontWeight={700} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
                    {(a * 100).toFixed(0)}%
                  </text>
                </motion.g>
              </g>
            );
          })}
          <text x={W / 2} y={rowY(0) + BLOCK_H + 34} textAnchor="middle" fontSize={13} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
            Showing where “{shown(tokens[focus]).replace("␣", "")}” looks. Hover or tab to another word to switch.
          </text>
        </g>
      )}

      {/* next: candidate next words */}
      {mode === "next" && (
        <g>
          {block(tokens.length, "?", "green")}
          {(stage.candidates ?? []).map((c, k) => {
            const y = 170 + k * 36;
            const chosen = k === stage.chosen;
            return (
              <motion.g key={c.text} initial={animate ? { opacity: 0, x: 20 } : false} animate={{ opacity: 1, x: 0 }} transition={t(0.4, 0.3 + k * 0.15)}>
                <text x={250} y={y + 17} textAnchor="end" fontSize={15} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)", whiteSpace: "pre" }}>
                  {shown(c.text)}
                </text>
                <rect x={262} y={y + 2} width={420} height={22} rx={4} style={{ fill: "var(--lab-raised)" }} />
                <motion.rect
                  x={262}
                  y={y + 2}
                  height={22}
                  rx={4}
                  initial={animate ? { width: 0 } : false}
                  animate={{ width: 420 * c.p }}
                  transition={t(0.6, 0.4 + k * 0.15)}
                  style={{ fill: toneVar(chosen ? "green" : "blue") }}
                />
                <text x={694} y={y + 18} fontSize={14} fontWeight={700} style={{ fill: chosen ? toneVar("green") : "var(--lab-text)", fontFamily: "var(--lab-mono)" }}>
                  {(c.p * 100).toFixed(1)}%{chosen ? "  ← picked" : ""}
                </text>
              </motion.g>
            );
          })}
        </g>
      )}

      {/* generate: prompt, then new words one at a time */}
      {mode === "generate" && (
        <g>
          <text x={X0} y={92} fontSize={13} fontWeight={700} letterSpacing={1.2} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
            PROMPT + ANSWER, ONE WORD AT A TIME
          </text>
          {tokens.map((tok, i) => block(i, shown(tok), i < promptCount ? "slate" : "green", undefined, genDelay(i)))}
          {stage.notebook && (
            <g transform={`translate(${W - notebookW - 10} 70)`}>
              <rect width={notebookW} height={330} rx={10} style={{ fill: toneFill("amber", 8), stroke: toneVar("amber") }} />
              <text x={16} y={28} fontSize={14} fontWeight={700} style={{ fill: toneVar("amber"), fontFamily: "var(--lab-mono)" }}>
                KV cache = a notebook
              </text>
              {tokens.slice(0, 12).map((tok, i) => (
                <motion.g key={i} initial={animate && genDelay(i) > 0 ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={t(0.3, genDelay(i) + 0.2)}>
                  <line x1={14} x2={notebookW - 14} y1={48 + i * 23} y2={48 + i * 23} style={{ stroke: "var(--lab-border)" }} />
                  <text x={16} y={64 + i * 23} fontSize={12} style={{ fill: "var(--lab-text)", fontFamily: "var(--lab-mono)", whiteSpace: "pre" }}>
                    {`${String(i + 1).padStart(2, " ")}. ${shown(tok).slice(0, 12).padEnd(12, " ")} K,V saved`}
                  </text>
                </motion.g>
              ))}
            </g>
          )}
        </g>
      )}

      {stage.note && (
        <text x={W / 2} y={H - 14} textAnchor="middle" fontSize={13} style={{ fill: "var(--lab-muted)", fontFamily: "var(--lab-mono)" }}>
          {stage.note}
        </text>
      )}
    </svg>
  );
}
