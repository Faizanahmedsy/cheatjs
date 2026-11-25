import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  /** Extra controls at the end of the button row (the options menu). */
  extra?: ReactNode;
}

function NavButton({ label, onClick, disabled, children, wide, primary }: { label: string; onClick: () => void; disabled: boolean; children: ReactNode; wide?: boolean; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-1 rounded-full bg-slate-800 px-4 text-sm text-slate-200 transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-40",
        wide && "min-w-[6.5rem]",
        primary && "h-11 min-w-[9rem] bg-cyan-500 px-6 text-base font-semibold text-white shadow-lg shadow-cyan-900/30 hover:bg-cyan-600",
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

export function PlaybackControls({ index, total, onChange, playing, onTogglePlay, speed, onSpeedChange, marks, extra }: PlaybackControlsProps) {
  const passes = marks.filter((mark) => mark.kind === "iteration").map((mark) => mark.index);
  const prevPass = [...passes].reverse().find((at) => at < index);
  const nextPass = passes.find((at) => at > index);
  const last = total - 1;
  const atStart = index <= 0;
  const atEnd = index >= last;
  return (
    <div className="space-y-3 xl:flex xl:items-center xl:gap-4 xl:space-y-0">
      <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
        <NavButton label="Back one step" onClick={() => onChange(index - 1)} disabled={atStart}>
          Back
        </NavButton>
        <NavButton label={playing ? "Pause" : "Play"} onClick={onTogglePlay} disabled={atEnd && !playing} wide>
          {playing ? "Pause" : "Play"}
        </NavButton>
        <NavButton label="Next step" onClick={() => onChange(index + 1)} disabled={atEnd} primary>
          {atEnd ? "The end" : "Next step"}
        </NavButton>
        <Popover>
          <PopoverTrigger className="h-10 rounded-full px-4 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100">More</PopoverTrigger>
          <PopoverContent align="start" className="w-64 space-y-3 rounded-2xl border-slate-800 bg-slate-900 text-slate-200">
            <div className="grid grid-cols-2 gap-2">
              <NavButton label="First step" onClick={() => onChange(0)} disabled={atStart}>First step</NavButton>
              <NavButton label="Skip to the answer (last step)" onClick={() => onChange(last)} disabled={atEnd}>Answer</NavButton>
              <NavButton label="Previous loop pass" onClick={() => prevPass !== undefined && onChange(prevPass)} disabled={prevPass === undefined}>Prev pass</NavButton>
              <NavButton label="Next loop pass" onClick={() => nextPass !== undefined && onChange(nextPass)} disabled={nextPass === undefined}>Next pass</NavButton>
            </div>
            <label className="flex items-center justify-between gap-2 text-sm text-slate-400">
              Speed
              <select
                value={speed}
                onChange={(event) => onSpeedChange(Number(event.target.value) as Speed)}
                className="h-9 rounded-md border border-slate-700 bg-slate-800 px-2 text-slate-200"
              >
                {SPEEDS.map((value) => (
                  <option key={value} value={value}>
                    {value}×
                  </option>
                ))}
              </select>
            </label>
            {extra}
          </PopoverContent>
        </Popover>
      </div>

      <div className="xl:min-w-[14rem] xl:flex-1">
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
        </div>
      </div>
    </div>
  );
}
