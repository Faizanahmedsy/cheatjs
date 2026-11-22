"use client";

import { useCallback, useSyncExternalStore } from "react";

export type CardState = { box: number; due: number; weak?: boolean };
export type Study = {
  done: Record<string, number>;
  marks: Record<string, { title: string; href: string; t: number }>;
  last?: { href: string; title: string; pct: number; t: number; track: string };
  cards: Record<string, CardState>;
};

const KEY = "cheatjs-study-v1";
const EVENT = "cheatjs-study-change";
const EMPTY: Study = { done: {}, marks: {}, cards: {} };

let cache: Study = EMPTY;
let cacheRaw: string | null = null;

function read(): Study {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cache;
  }
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Study>) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: Study) {
  try {
    const raw = JSON.stringify(next);
    localStorage.setItem(KEY, raw);
    cacheRaw = raw;
  } catch {
    /* storage full or blocked */
  }
  cache = next;
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function mutateStudy(fn: (s: Study) => Study) {
  write(fn(read()));
}

export function useStudy() {
  const study = useSyncExternalStore(subscribe, read, () => EMPTY);

  const toggleDone = useCallback((key: string) => {
    mutateStudy((s) => {
      const done = { ...s.done };
      if (done[key]) delete done[key];
      else done[key] = Date.now();
      return { ...s, done };
    });
  }, []);

  const toggleMark = useCallback((key: string, title: string, href: string) => {
    mutateStudy((s) => {
      const marks = { ...s.marks };
      if (marks[key]) delete marks[key];
      else marks[key] = { title, href, t: Date.now() };
      return { ...s, marks };
    });
  }, []);

  const setLast = useCallback((last: NonNullable<Study["last"]>) => {
    mutateStudy((s) => ({ ...s, last }));
  }, []);

  const grade = useCallback((id: string, good: boolean) => {
    mutateStudy((s) => {
      const prev = s.cards[id] ?? { box: 0, due: 0 };
      const DAYS = [0, 1, 3, 7, 14, 30];
      const box = good ? Math.min(5, prev.box + 1) : 1;
      const due = Date.now() + (good ? DAYS[box] : 0) * 86_400_000;
      return { ...s, cards: { ...s.cards, [id]: { box, due, weak: !good } } };
    });
  }, []);

  const resetCards = useCallback(() => {
    mutateStudy((s) => ({ ...s, cards: {} }));
  }, []);

  return { study, toggleDone, toggleMark, setLast, grade, resetCards };
}
