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

/** Stage timings at 1x, in seconds. Kept here so the player can size a step without loading the stage. */
export const HOP_S = 0.45; // descent: one hop of the ball
export const MSG_S = 0.35; // chat: gap between messages appearing
export const WORD_S = 0.11; // chat: one streamed word
export const TRAIN_FRAME_S = 0.48; // fit: one training frame
export const GEN_TOKEN_S = 0.7; // tokens: one generated token

export const fmtNum = (v: number, dp = 2) => {
  const s = v.toFixed(dp);
  return s === `-${(0).toFixed(dp)}` ? (0).toFixed(dp) : s;
};
