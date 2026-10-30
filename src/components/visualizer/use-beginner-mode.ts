"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "viz-beginner-mode";

/** Beginner mode is on by default; the learner's choice is remembered in this browser. */
export function useBeginnerMode(): [boolean, (next: boolean) => void] {
  const [beginner, setBeginner] = useState(true);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "off") setBeginner(false);
    } catch {
      // Storage blocked: keep the default.
    }
  }, []);

  const update = useCallback((next: boolean) => {
    setBeginner(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      // Storage blocked: the choice lasts for this visit only.
    }
  }, []);

  return [beginner, update];
}
