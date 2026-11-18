import type { Tone } from "./types";

/** CSS colour for a tone. The values live on `.ai-lab` in globals.css so light/dark both work. */
export const toneVar = (t: Tone = "blue") => `var(--t-${t})`;

/** A tinted, opaque fill: `pct` of the tone mixed into the lab background. */
export const toneFill = (t: Tone = "blue", pct = 18) => `color-mix(in srgb, var(--t-${t}) ${pct}%, var(--lab-bg))`;

export const TONE_LABEL: Record<Tone, string> = {
  blue: "data",
  cyan: "request",
  violet: "compute",
  amber: "math",
  green: "result",
  rose: "error / gradient",
  slate: "meta",
};
