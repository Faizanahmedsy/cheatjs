import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

interface MobileControlsProps {
  index: number;
  total: number;
  playing: boolean;
  onChange: (index: number) => void;
  onTogglePlay: () => void;
}

const BUTTON =
  "inline-flex h-11 items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:opacity-40";

/** Back / Play / Next pinned to the bottom of the screen on phones, so stepping works while scrolled down. */
export function MobileControls({ index, total, playing, onChange, onTogglePlay }: MobileControlsProps) {
  const atStart = index <= 0;
  const atEnd = index >= total - 1;
  return (
    <div
      role="toolbar"
      aria-label="Step controls"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-700 bg-slate-900/95 px-4 py-2 backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-xl items-center gap-2">
        <button type="button" className={BUTTON} onClick={() => onChange(index - 1)} disabled={atStart} aria-label="Back one step">
          <ChevronLeft className="h-5 w-5" aria-hidden="true" /> Back
        </button>
        <button
          type="button"
          className={`${BUTTON} flex-1 border-cyan-400/50 text-cyan-100`}
          onClick={onTogglePlay}
          disabled={atEnd && !playing}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="h-5 w-5" aria-hidden="true" /> : <Play className="h-5 w-5" aria-hidden="true" />}
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" className={BUTTON} onClick={() => onChange(index + 1)} disabled={atEnd} aria-label="Next step">
          Next <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="ml-1 whitespace-nowrap font-code text-xs text-slate-400" aria-live="off">
          {index + 1}/{total}
        </span>
      </div>
    </div>
  );
}
