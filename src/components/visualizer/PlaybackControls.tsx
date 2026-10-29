import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pause, Play } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { TimelineMark } from "@/lib/visualizer/analysis";

export const SPEEDS = [0.5, 1, 1.5, 2, 3] as const;
export type Speed = (typeof SPEEDS)[number];

interface PlaybackControlsProps {
  index: number;
  total: number;
  onChange: (index: number) => void;
  playing: boolean;
  onTogglePlay: () => void;
  speed: Speed;
  onSpeedChange: (speed: Speed) => void;
  marks: TimelineMark[];
}

function NavButton({ label, onClick, disabled, children, wide }: { label: string; onClick: () => void; disabled: boolean; children: ReactNode; wide?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-200 transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-40",
        wide && "min-w-[6.5rem]",
      )}
    >
      {children}
    </button>
  );
}

const MARK_COLOR: Record<TimelineMark["kind"], string> = {
  call: "bg-cyan-400",
  iteration: "bg-slate-500",
  error: "bg-red-400",
};

export function PlaybackControls({ index, total, onChange, playing, onTogglePlay, speed, onSpeedChange, marks }: PlaybackControlsProps) {
  const last = total - 1;
  const atStart = index <= 0;
  const atEnd = index >= last;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <NavButton label="First step" onClick={() => onChange(0)} disabled={atStart}>
          <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">First</span>
        </NavButton>
        <NavButton label="Back one step" onClick={() => onChange(index - 1)} disabled={atStart}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Back</span>
        </NavButton>
        <NavButton label={playing ? "Pause" : "Play"} onClick={onTogglePlay} disabled={atEnd && !playing} wide>
          {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          {playing ? "Pause" : "Play"}
        </NavButton>
        <NavButton label="Forward one step" onClick={() => onChange(index + 1)} disabled={atEnd}>
          <span className="hidden sm:inline">Forward</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </NavButton>
        <NavButton label="Last step" onClick={() => onChange(last)} disabled={atEnd}>
          <span className="hidden sm:inline">Last</span>
          <ChevronsRight className="h-4 w-4" aria-hidden="true" />
        </NavButton>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-400">
          Speed
          <select
            value={speed}
            onChange={(event) => onSpeedChange(Number(event.target.value) as Speed)}
            className="h-10 rounded-lg border border-slate-700 bg-slate-800 px-2 text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {SPEEDS.map((value) => (
              <option key={value} value={value}>
                {value}×
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <input
          type="range"
          min={0}
          max={Math.max(last, 0)}
          value={index}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label="Step"
          aria-valuetext={`Step ${index + 1} of ${total}`}
          className="w-full accent-cyan-400"
        />
        {/* Timeline ticks: calls (cyan), loop passes (grey), errors (red). Inset ≈ the thumb radius. */}
        <div className="relative mx-2 h-2" aria-hidden="true">
          {last > 0 &&
            marks.map((mark) => (
              <span
                key={`${mark.kind}-${mark.index}`}
                className={cn("absolute top-0 h-2 w-0.5 -translate-x-1/2 rounded-full", MARK_COLOR[mark.kind])}
                style={{ left: `${(mark.index / last) * 100}%` }}
              />
            ))}
        </div>
        <div className="mt-1 flex items-center justify-between text-sm text-slate-400">
          <span>
            Step <span className="font-code text-slate-200">{index + 1}</span> of <span className="font-code">{total}</span>
          </span>
          <span className="hidden text-xs text-slate-500 sm:inline">← / → keys step · ticks: cyan = call, grey = loop pass</span>
        </div>
      </div>
    </div>
  );
}
