"use client";

import type { Transition } from "framer-motion";

export type StageProps<S> = { stage: S; animate: boolean; speed: number; runKey: string };

/** Transition helper: real timings when animating, instant otherwise (reduced motion / step mode). */
export function timing(animate: boolean, speed: number) {
  return (duration: number, delay = 0, extra: Transition = {}): Transition =>
    animate ? { duration: duration / speed, delay: delay / speed, ease: "easeOut", ...extra } : { duration: 0 };
}

export const W = 900;
export const H = 460;

export const fmtNum = (v: number, dp = 2) => {
  const s = v.toFixed(dp);
  return s === `-${(0).toFixed(dp)}` ? (0).toFixed(dp) : s;
};
