"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "viz-done-problems";
const EVENT = "viz-progress";

function read(): Set<string> {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

/** Problems the learner stepped through to the end, kept in this browser. */
export function useProgress(): { done: Set<string>; markDone: (id: string) => void; toggle: (id: string) => void } {
  const [done, setDone] = useState<Set<string>>(new Set());
  useEffect(() => {
    setDone(read());
    const sync = () => setDone(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const save = useCallback((next: Set<string>) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...next]));
    } catch {
      // Storage blocked: progress lasts for this visit.
    }
    setDone(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);
  const markDone = useCallback(
    (id: string) => {
      const current = read();
      if (current.has(id)) return;
      current.add(id);
      save(current);
    },
    [save],
  );
  const toggle = useCallback(
    (id: string) => {
      const current = read();
      if (current.has(id)) current.delete(id);
      else current.add(id);
      save(current);
    },
    [save],
  );
  return { done, markDone, toggle };
}
