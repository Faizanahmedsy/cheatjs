"use client";

import { useEffect, useMemo, useRef } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Scenario, Tone } from "../engine/types";
import { toneFill, toneVar } from "../engine/tones";

type Props = {
  scenario: Scenario | null;
  stepIndex: number;
  playing: boolean;
  reduced: boolean;
  speed: number;
  onSpeed: (s: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
};

const SPEEDS = [0.5, 1, 1.5, 2];

function CtrlButton({ onClick, disabled, label, children, primary }: { onClick: () => void; disabled?: boolean; label: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-40",
        primary ? "border-lab-accent bg-lab-raised text-lab-accent" : "border-lab-border text-lab-muted hover:text-lab-text",
      )}
    >
      {children}
    </button>
  );
}

/** The bottom "trace": controls plus a numbered, colour-coded log that fills in as steps run. */
export function TracePanel({ scenario, stepIndex, playing, reduced, speed, onSpeed, onPlay, onPause, onNext, onPrev, onReset }: Props) {
  const rows = useMemo(() => {
    if (!scenario) return [];
    const out: { step: number; tone: Tone; cells: Record<string, string | number>; latest: boolean }[] = [];
    scenario.steps.slice(0, stepIndex + 1).forEach((s, si) => {
      (s.log ?? []).forEach((r) => out.push({ step: si, tone: r.tone ?? "blue", cells: r.cells, latest: si === stepIndex }));
    });
    return out;
  }, [scenario, stepIndex]);

  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = body.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [rows.length, reduced]);

  const total = scenario?.steps.length ?? 0;
  const atEnd = stepIndex >= total - 1;

  return (
    <div className="flex h-auto flex-col border-t border-lab-border bg-lab-panel lg:h-[clamp(190px,30vh,260px)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-lab-border px-3 py-2">
        <span className="mr-1 text-[10px] uppercase tracking-[0.16em] text-lab-muted">
          Trace · <span className="text-lab-text">{scenario?.logTitle ?? "…"}</span>
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {playing ? (
            <CtrlButton onClick={onPause} label="Pause (Space)" primary>
              <Pause className="h-3 w-3" /> Pause
            </CtrlButton>
          ) : (
            <CtrlButton onClick={onPlay} disabled={reduced || !scenario} label={reduced ? "Auto-play is off because your system asks for reduced motion — use Step" : "Play (Space)"} primary>
              <Play className="h-3 w-3" /> Play
            </CtrlButton>
          )}
          <CtrlButton onClick={onPrev} disabled={stepIndex < 0} label="Back one step (←)">
            <SkipBack className="h-3 w-3" />
            <span className="sr-only">Back</span>
          </CtrlButton>
          <CtrlButton onClick={onNext} disabled={!scenario || atEnd} label="Next step (→)">
            <SkipForward className="h-3 w-3" /> Step
          </CtrlButton>
          <CtrlButton onClick={onReset} label="Reset (R)">
            <RotateCcw className="h-3 w-3" /> Reset
          </CtrlButton>
          <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-lab-muted">
            Speed
            <select
              value={speed}
              onChange={(e) => onSpeed(Number(e.target.value))}
              className="rounded border border-lab-border bg-lab-raised px-1 py-0.5 text-[11px] text-lab-text"
            >
              {SPEEDS.map((s) => (
                <option key={s} value={s}>
                  {s}×
                </option>
              ))}
            </select>
          </label>
          <span className="w-16 text-right text-[10px] tabular-nums text-lab-muted">{stepIndex < 0 ? `0/${total}` : `${stepIndex + 1}/${total}`}</span>
        </div>
      </div>
      <div ref={body} className="max-h-64 min-h-[120px] flex-1 overflow-auto lg:max-h-none">
        {rows.length === 0 ? (
          <p className="p-4 text-[11px] text-lab-muted">Press PLAY (or → to go one step at a time). Each step adds its rows here, so you can read the whole run back.</p>
        ) : (
          <table className="w-full min-w-[560px] border-collapse text-[11px]">
            <thead className="sticky top-0 bg-lab-panel">
              <tr className="text-left text-[10px] uppercase tracking-wider text-lab-muted">
                <th className="w-10 px-2 py-1.5 font-semibold">#</th>
                <th className="w-12 px-2 py-1.5 font-semibold">Step</th>
                {scenario!.logColumns.map((c) => (
                  <th key={c.key} className={cn("px-2 py-1.5 font-semibold", c.align === "right" && "text-right")} style={c.width ? { width: c.width } : undefined}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={i}
                  className="border-t border-lab-border"
                  style={{ background: r.latest ? toneFill(r.tone, 9) : undefined, boxShadow: `inset 3px 0 0 ${toneVar(r.tone)}` }}
                >
                  <td className="px-2 py-1 tabular-nums" style={{ color: toneVar(r.tone) }}>
                    {i + 1}
                  </td>
                  <td className="px-2 py-1 tabular-nums text-lab-muted">{String(r.step + 1).padStart(2, "0")}</td>
                  {scenario!.logColumns.map((c) => (
                    <td key={c.key} className={cn("px-2 py-1 tabular-nums", c.align === "right" && "text-right", r.latest ? "text-lab-text" : "text-lab-muted")}>
                      {r.cells[c.key] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
