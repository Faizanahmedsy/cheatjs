"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";

type Item = { keys: string[][]; label: string };
type Group = { title: string; items: Item[] };

// keys: each inner array is one chord; several chords mean "press in order".
const GROUPS: Group[] = [
  {
    title: "General",
    items: [
      { keys: [["Ctrl", "/"]], label: "Show keyboard shortcuts" },
      { keys: [["Hold Ctrl"]], label: "Peek at shortcuts" },
      { keys: [["Ctrl", "K"]], label: "Search" },
      { keys: [["T"]], label: "Switch white / dark mode" },
      { keys: [["Esc"]], label: "Close panel" },
    ],
  },
  {
    title: "Go to",
    items: [
      { keys: [["G"], ["H"]], label: "Home" },
      { keys: [["G"], ["D"]], label: "DSA visualizer" },
      { keys: [["G"], ["N"]], label: "DSA notes" },
      { keys: [["G"], ["A"]], label: "Gen AI notes" },
      { keys: [["G"], ["V"]], label: "Gen AI visual lab" },
      { keys: [["G"], ["W"]], label: "AWS notes" },
      { keys: [["G"], ["L"]], label: "AWS lab" },
      { keys: [["G"], ["J"]], label: "JavaScript" },
      { keys: [["G"], ["F"]], label: "Flashcards" },
      { keys: [["G"], ["P"]], label: "My progress" },
    ],
  },
  {
    title: "Reading notes",
    items: [
      { keys: [["J"]], label: "Next section" },
      { keys: [["K"]], label: "Previous section" },
      { keys: [["]"]], label: "Next page" },
      { keys: [["["]], label: "Previous page" },
      { keys: [["M"]], label: "Mark page as done" },
      { keys: [["B"]], label: "Bookmark page" },
      { keys: [["O"]], label: "Open in LLM menu" },
      { keys: [["Home"]], label: "Top of page" },
      { keys: [["End"]], label: "Bottom of page" },
    ],
  },
];

const GOTO: Record<string, string> = {
  h: "/",
  d: "/visualizer",
  n: "/dsa",
  a: "/gen-ai",
  v: "/ai-engineering/visual-lab",
  w: "/aws-saa-v2",
  l: "/aws-lab",
  j: "/javascript",
  f: "/flashcards",
  p: "/study",
};

function isTyping(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  if (!el) return false;
  return /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable;
}

function click(name: string) {
  const el = document.querySelector<HTMLElement>(`[data-shortcut="${name}"]`);
  if (el) el.click();
  return !!el;
}

export function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState(false);
  const pendingG = useRef<number | null>(null);
  const holdTimer = useRef<number | null>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const clearHold = () => {
      if (holdTimer.current) window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    };

    const onDown = (e: KeyboardEvent) => {
      // Hold Ctrl alone to peek.
      if (e.key === "Control" && !e.repeat && !e.shiftKey && !e.altKey && !e.metaKey) {
        clearHold();
        holdTimer.current = window.setTimeout(() => setPeek(true), 600);
        return;
      }
      clearHold();
      if (e.ctrlKey || e.metaKey) setPeek(false);

      if ((e.ctrlKey || e.metaKey) && (e.key === "/" || e.key === "?")) {
        e.preventDefault();
        setPeek(false);
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
        setPeek(false);
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target) || e.defaultPrevented) return;
      // A menu or dialog already handles its own keys.
      if (document.querySelector('[role="menu"], [role="dialog"]:not([data-shortcuts-panel])')) return;

      const k = e.key.toLowerCase();

      if (pendingG.current) {
        window.clearTimeout(pendingG.current);
        pendingG.current = null;
        const to = GOTO[k];
        if (to) {
          e.preventDefault();
          setOpen(false);
          router.push(to);
        }
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (k === "g") {
        pendingG.current = window.setTimeout(() => (pendingG.current = null), 1200);
        return;
      }
      if (k === "t") return void (click("theme") && e.preventDefault());
      if (e.key === "]") return void (click("next") && e.preventDefault());
      if (e.key === "[") return void (click("prev") && e.preventDefault());
      if (k === "m") return void (click("done") && e.preventDefault());
      if (k === "b") return void (click("bookmark") && e.preventDefault());
      if (k === "o") {
        const el = document.querySelector<HTMLElement>('[data-shortcut="llm"]');
        if (el) {
          e.preventDefault();
          el.focus();
          el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, pointerType: "mouse" }));
        }
      }
    };

    const onUp = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        clearHold();
        setPeek(false);
      }
    };
    const onBlur = () => {
      clearHold();
      setPeek(false);
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [router]);

  if (!open && !peek) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        data-shortcuts-panel
        onClick={(e) => e.stopPropagation()}
        className="scroll-quiet max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-200 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-body text-lg font-semibold text-slate-50">Keyboard shortcuts</h2>
          {open ? (
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <span className="text-xs text-slate-500">Release Ctrl to close</span>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{g.title}</h3>
              <ul className="space-y-1.5">
                {g.items.map((it) => (
                  <li key={it.label + it.keys.flat().join("")} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-300">{it.label}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {it.keys.map((chord, ci) => (
                        <span key={ci} className="flex items-center gap-1">
                          {ci > 0 && <span className="text-[11px] text-slate-500">then</span>}
                          {chord.map((key) => (
                            <kbd
                              key={key}
                              className="min-w-[1.5rem] rounded-md border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-center font-mono text-[11px] text-slate-100"
                            >
                              {key}
                            </kbd>
                          ))}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-6 text-xs text-slate-500">
          Shortcuts are off while you type in a box. Press <kbd className="rounded border border-slate-600 px-1">Ctrl</kbd>{" "}
          <kbd className="rounded border border-slate-600 px-1">/</kbd> (or <kbd className="rounded border border-slate-600 px-1">?</kbd>) any time to open this.{" "}
          <kbd className="rounded border border-slate-600 px-1">/</kbd> also opens search.
        </p>
      </div>
    </div>
  );
}
