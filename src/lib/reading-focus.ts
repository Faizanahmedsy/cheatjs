"use client";

import { useSyncExternalStore } from "react";

/** Site-wide reading focus: hides every menu and bar, only the note stays. Lasts for this browser tab. */
const KEY = "reading-focus";
const listeners = new Set<() => void>();

export function isReadingFocus(): boolean {
  return typeof document !== "undefined" && document.documentElement.dataset.readingFocus === "1";
}

export function setReadingFocus(on: boolean) {
  if (on) document.documentElement.dataset.readingFocus = "1";
  else delete document.documentElement.dataset.readingFocus;
  try {
    window.sessionStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    // storage blocked
  }
  listeners.forEach((l) => l());
}

export function restoreReadingFocus() {
  try {
    if (window.sessionStorage.getItem(KEY) === "1") setReadingFocus(true);
  } catch {
    // storage blocked
  }
}

export function useReadingFocus(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    isReadingFocus,
    () => false,
  );
}
