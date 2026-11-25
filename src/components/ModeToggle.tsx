"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { Moon02Icon, Sun03Icon } from "hugeicons-react";

const KEY = "site-mode";

/** Dark / white mode for the whole site, remembered in this browser. */
export function ModeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => setLight(document.documentElement.dataset.mode === "light"), []);
  const apply = (next: boolean) => {
    setLight(next);
    if (next) document.documentElement.dataset.mode = "light";
    else delete document.documentElement.dataset.mode;
    try {
      window.localStorage.setItem(KEY, next ? "light" : "dark");
    } catch {
      // Storage blocked: lasts for this visit.
    }
  };
  // A circle of the new theme grows out of the button (View Transitions), with a plain switch as fallback.
  const flip = (e?: MouseEvent) => {
    const next = !light;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || reduce) return apply(next);
    const fromPointer = !!e && e.detail > 0;
    const x = fromPointer ? e!.clientX : window.innerWidth - 80;
    const y = fromPointer ? e!.clientY : 28;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const t = doc.startViewTransition(() => apply(next));
    t.ready.then(() =>
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 550, easing: "cubic-bezier(.4,0,.2,1)", pseudoElement: "::view-transition-new(root)" },
      ),
    );
  };
  return (
    <button
      type="button"
      data-shortcut="theme"
      onClick={flip}
      aria-label={light ? "Switch to dark mode" : "Switch to white mode"}
      title={light ? "Dark mode" : "White mode"}
      className="group grid h-9 w-9 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
    >
      <span key={light ? "moon" : "sun"} className="animate-[mode-spin_.45s_cubic-bezier(.34,1.56,.64,1)]">
        {light ? <Moon02Icon size={18} /> : <Sun03Icon size={18} />}
      </span>
    </button>
  );
}

/** Runs before paint so a white-mode visitor never sees a dark flash. */
export const MODE_SCRIPT = `try{if(localStorage.getItem("${KEY}")==="light")document.documentElement.dataset.mode="light"}catch(e){}`;
