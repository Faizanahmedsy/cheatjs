"use client";

import { createContext, useContext } from "react";

/** Simple = plain words + pictures (default). Interview = today's depth: formulas, code, interview tips. */
export type LabMode = "simple" | "interview";
export const LabModeContext = createContext<LabMode>("simple");
export const useLabMode = () => useContext(LabModeContext);

export const MODE_KEY = "ai-lab-mode";

export function readMode(): LabMode {
  try {
    return window.localStorage.getItem(MODE_KEY) === "interview" ? "interview" : "simple";
  } catch {
    return "simple";
  }
}

export function saveMode(m: LabMode) {
  try {
    window.localStorage.setItem(MODE_KEY, m);
  } catch {
    /* private mode: the choice just won't persist */
  }
}
