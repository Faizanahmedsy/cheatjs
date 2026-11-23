"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "site-mode";

/** Dark / white mode for the whole site, remembered in this browser. */
export function ModeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => setLight(document.documentElement.dataset.mode === "light"), []);
  const flip = () => {
    const next = !light;
    setLight(next);
    if (next) document.documentElement.dataset.mode = "light";
    else delete document.documentElement.dataset.mode;
    try {
      window.localStorage.setItem(KEY, next ? "light" : "dark");
    } catch {
      // Storage blocked: lasts for this visit.
    }
  };
  return (
    <button
      type="button"
      onClick={flip}
      aria-label={light ? "Switch to dark mode" : "Switch to white mode"}
      title={light ? "Dark mode" : "White mode"}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:text-slate-100"
    >
      {light ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}

/** Runs before paint so a white-mode visitor never sees a dark flash. */
export const MODE_SCRIPT = `try{if(localStorage.getItem("${KEY}")==="light")document.documentElement.dataset.mode="light"}catch(e){}`;
