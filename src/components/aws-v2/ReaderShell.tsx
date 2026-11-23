"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Minus, Plus, RotateCcw, Settings2, Volume2, X, Square } from "lucide-react";
import { cn } from "@/lib/utils";

type Settings = {
  scale: number; // 0.8 - 1.9
  lineHeight: number; // 1.4 - 2.3
  theme: "dark" | "midnight" | "dim" | "sepia" | "paper" | "light" | "contrast";
  font: "sans" | "serif" | "mono" | "readable";
  width: "narrow" | "medium" | "wide" | "full";
  align: "left" | "justify";
  paragraph: "tight" | "normal" | "loose";
  letter: "normal" | "wide";
  focus: boolean;
  progress: boolean;
  speechRate: number;
};

const DEFAULTS: Settings = {
  scale: 1,
  lineHeight: 1.75,
  theme: "dark",
  font: "sans",
  width: "medium",
  align: "left",
  paragraph: "normal",
  letter: "normal",
  focus: false,
  progress: true,
  speechRate: 1,
};

const KEY = "cheatjs-reader-v1";

const THEMES: { id: Settings["theme"]; label: string; bg: string; fg: string }[] = [
  { id: "dark", label: "Dark", bg: "#0f172a", fg: "#e2e8f0" },
  { id: "midnight", label: "Black", bg: "#000000", fg: "#e5e5e5" },
  { id: "dim", label: "Dim", bg: "#1f2937", fg: "#e5e7eb" },
  { id: "sepia", label: "Sepia", bg: "#f4ecd8", fg: "#433422" },
  { id: "paper", label: "Paper", bg: "#eceae4", fg: "#2b2b2b" },
  { id: "light", label: "Light", bg: "#ffffff", fg: "#1e293b" },
  { id: "contrast", label: "Contrast", bg: "#000000", fg: "#ffff66" },
];

const FONTS: { id: Settings["font"]; label: string }[] = [
  { id: "sans", label: "Sans" },
  { id: "serif", label: "Serif" },
  { id: "mono", label: "Mono" },
  { id: "readable", label: "Easy read" },
];

const WIDTHS: { id: Settings["width"]; label: string }[] = [
  { id: "narrow", label: "Narrow" },
  { id: "medium", label: "Medium" },
  { id: "wide", label: "Wide" },
  { id: "full", label: "Full" },
];

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
            value === o.id
              ? "border-cyan-400 bg-cyan-400/15 text-cyan-300"
              : "border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-400"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      {children}
    </div>
  );
}

export function ReaderShell({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const loaded = useRef(false);
  const queue = useRef<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }, [s]);

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setS((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Reading progress: listens to every scroll (window or the inner article column)
  useEffect(() => {
    const onScroll = (e: Event) => {
      const t = e.target as Element | Document;
      const el =
        t instanceof Document
          ? document.scrollingElement
          : (t as HTMLElement).hasAttribute?.("data-reader-scroll")
            ? (t as HTMLElement)
            : null;
      if (!el) return;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
      setShowTop(el.scrollTop > 600);
    };
    document.addEventListener("scroll", onScroll, true);
    return () => document.removeEventListener("scroll", onScroll, true);
  }, []);

  const scrollTop = () => {
    const el = document.querySelector<HTMLElement>("[data-reader-scroll]");
    if (el && el.scrollHeight > el.clientHeight) el.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stopSpeech = useCallback(() => {
    queue.current = [];
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speakNext = useCallback(() => {
    const next = queue.current.shift();
    if (!next) return setSpeaking(false);
    const u = new SpeechSynthesisUtterance(next);
    u.rate = s.speechRate;
    u.onend = speakNext;
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [s.speechRate]);

  const readAloud = () => {
    if (!("speechSynthesis" in window)) return;
    if (speaking) return stopSpeech();
    const nodes = document.querySelectorAll<HTMLElement>(".reader-article h1, .reader-article h2, .reader-article h3, .reader-article p, .reader-article li");
    queue.current = Array.from(nodes)
      .map((n) => n.innerText.trim())
      .filter((t) => t.length > 1);
    setSpeaking(true);
    window.speechSynthesis.cancel();
    speakNext();
  };

  useEffect(() => () => stopSpeech(), [stopSpeech]);

  const widthMap = { narrow: "36rem", medium: "48rem", wide: "64rem", full: "100%" } as const;
  const fontMap = {
    sans: "Inter, system-ui, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    mono: "'Source Code Pro', ui-monospace, monospace",
    readable: "Verdana, Tahoma, 'Trebuchet MS', sans-serif",
  } as const;
  const gapMap = { tight: "0.5rem", normal: "1rem", loose: "1.6rem" } as const;

  const style = {
    "--reader-scale": s.scale,
    "--reader-lh": s.lineHeight,
    "--reader-width": widthMap[s.width],
    "--reader-font": fontMap[s.font],
    "--reader-gap": gapMap[s.paragraph],
    "--reader-letter": s.letter === "wide" ? "0.04em" : "normal",
    "--reader-word": s.letter === "wide" ? "0.12em" : "normal",
    "--reader-align": s.align === "justify" ? "justify" : "left",
  } as React.CSSProperties;

  return (
    <div
      className="reader-root min-h-[calc(100dvh-6.375rem)] bg-slate-900 text-slate-50 lg:h-[calc(100dvh-6.375rem)] lg:overflow-hidden"
      data-theme={s.theme}
      data-focus={s.focus ? "1" : "0"}
      style={style}
    >
      {s.progress ? (
        <div className="pointer-events-none fixed left-0 right-0 top-14 z-40 h-1 bg-transparent">
          <div className="h-full bg-cyan-400 transition-[width] duration-150" style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      <div className="mx-auto max-w-[1500px] lg:flex lg:h-full">{children}</div>

      {/* Floating buttons */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
        {showTop ? (
          <button
            type="button"
            onClick={scrollTop}
            aria-label="Scroll to top"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-slate-200 shadow-lg"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Reading settings"
          aria-expanded={open}
          className="flex h-12 items-center gap-2 rounded-full bg-cyan-500 px-4 text-sm font-bold text-slate-900 shadow-lg"
        >
          <Settings2 className="h-5 w-5" /> Aa
        </button>
      </div>

      {open ? (
        <div
          role="dialog"
          aria-label="Reading settings"
          className="fixed bottom-20 right-4 z-50 max-h-[75dvh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-slate-600 bg-slate-900 p-4 text-slate-200 shadow-2xl"
          style={{ colorScheme: "dark" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100">Reading settings</h2>
            <div className="flex gap-1">
              <button type="button" onClick={() => setS(DEFAULTS)} className="rounded p-1.5 text-slate-400 hover:text-slate-100" aria-label="Reset settings">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setOpen(false)} className="rounded p-1.5 text-slate-400 hover:text-slate-100" aria-label="Close settings">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Row label={`Text size ${Math.round(s.scale * 100)}%`}>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => update("scale", Math.max(0.8, +(s.scale - 0.05).toFixed(2)))} className="rounded-md border border-slate-600 bg-slate-800 p-2" aria-label="Smaller text"><Minus className="h-4 w-4" /></button>
              <input type="range" min={0.8} max={1.9} step={0.05} value={s.scale} onChange={(e) => update("scale", Number(e.target.value))} className="flex-1 accent-cyan-400" aria-label="Text size" />
              <button type="button" onClick={() => update("scale", Math.min(1.9, +(s.scale + 0.05).toFixed(2)))} className="rounded-md border border-slate-600 bg-slate-800 p-2" aria-label="Bigger text"><Plus className="h-4 w-4" /></button>
            </div>
          </Row>

          <Row label="Theme">
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update("theme", t.id)}
                  className={cn("flex flex-col items-center gap-1 rounded-md border p-1.5 text-[11px]", s.theme === t.id ? "border-cyan-400 text-cyan-300" : "border-slate-600 text-slate-300")}
                >
                  <span className="flex h-8 w-full items-center justify-center rounded text-sm font-bold" style={{ background: t.bg, color: t.fg }}>Aa</span>
                  {t.label}
                </button>
              ))}
            </div>
          </Row>

          <Row label="Font"><Segmented value={s.font} options={FONTS} onChange={(v) => update("font", v)} /></Row>

          <Row label={`Line spacing ${s.lineHeight.toFixed(2)}`}>
            <input type="range" min={1.4} max={2.3} step={0.05} value={s.lineHeight} onChange={(e) => update("lineHeight", Number(e.target.value))} className="w-full accent-cyan-400" aria-label="Line spacing" />
          </Row>

          <Row label="Paragraph spacing">
            <Segmented value={s.paragraph} options={[{ id: "tight", label: "Tight" }, { id: "normal", label: "Normal" }, { id: "loose", label: "Loose" }]} onChange={(v) => update("paragraph", v)} />
          </Row>

          <Row label="Content width"><Segmented value={s.width} options={WIDTHS} onChange={(v) => update("width", v)} /></Row>

          <Row label="Alignment">
            <Segmented value={s.align} options={[{ id: "left", label: "Left" }, { id: "justify", label: "Justify" }]} onChange={(v) => update("align", v)} />
          </Row>

          <Row label="Letter spacing">
            <Segmented value={s.letter} options={[{ id: "normal", label: "Normal" }, { id: "wide", label: "Wide" }]} onChange={(v) => update("letter", v)} />
          </Row>

          <Row label="Reading aids">
            <div className="flex flex-col gap-2 text-sm">
              <label className="flex items-center justify-between gap-3">
                Focus mode (hide menus)
                <input type="checkbox" checked={s.focus} onChange={(e) => update("focus", e.target.checked)} className="h-4 w-4 accent-cyan-400" />
              </label>
              <label className="flex items-center justify-between gap-3">
                Reading progress bar
                <input type="checkbox" checked={s.progress} onChange={(e) => update("progress", e.target.checked)} className="h-4 w-4 accent-cyan-400" />
              </label>
            </div>
          </Row>

          <Row label={`Read aloud (speed ${s.speechRate.toFixed(1)}x)`}>
            <div className="flex items-center gap-2">
              <button type="button" onClick={readAloud} className="flex items-center gap-1.5 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-medium">
                {speaking ? <><Square className="h-3.5 w-3.5" /> Stop</> : <><Volume2 className="h-3.5 w-3.5" /> Read page</>}
              </button>
              <input type="range" min={0.6} max={2} step={0.1} value={s.speechRate} onChange={(e) => update("speechRate", Number(e.target.value))} className="flex-1 accent-cyan-400" aria-label="Speech speed" />
            </div>
          </Row>
        </div>
      ) : null}
    </div>
  );
}
