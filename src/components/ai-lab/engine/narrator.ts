"use client";

import type { Scenario } from "./types";

/** Voiceover with the browser's own speech engine: free, no server, works offline. */

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

const VOICE_KEY = "ai-lab-voice";
export const readVoicePref = (): boolean => {
  try {
    return window.localStorage.getItem(VOICE_KEY) === "1";
  } catch {
    return false;
  }
};
export const saveVoicePref = (on: boolean) => {
  try {
    window.localStorage.setItem(VOICE_KEY, on ? "1" : "0");
  } catch {
    /* private mode */
  }
};

/** Turn the lab's light markup into text that sounds right when spoken. */
export function cleanForSpeech(raw: string): string {
  return raw
    .replace(/\{\{([^}|]+)\|([^}]+)\}\}/g, "$2")
    .replace(/\{\{([^}]+)\}\}/g, (_, k: string) => k.replace(/-/g, " "))
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/→|->/g, " to ")
    .replace(/×/g, " times ")
    .replace(/÷/g, " divided by ")
    .replace(/≈/g, " about ")
    .replace(/≥/g, " at least ")
    .replace(/≤/g, " at most ")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
    .replace(/[·•|]/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

const endDot = (t: string) => (/[.!?]$/.test(t) ? t : `${t}.`);

/** Everything a learner needs from one step, in simple mode, as one spoken script. */
export function narrationFor(scenario: Scenario, stepIndex: number): string {
  const total = scenario.steps.length;
  if (stepIndex < 0) return cleanForSpeech(scenario.imagine ?? scenario.overview.plain ?? scenario.tagline);
  const st = scenario.steps[stepIndex];
  if (!st) return "";
  const parts = [`Step ${stepIndex + 1} of ${total}. ${st.title}`];
  const body = st.easy ?? st.explain;
  if (st.simple && !body.toLowerCase().includes(st.simple.toLowerCase().slice(0, 24))) parts.push(st.simple);
  parts.push(body);
  if (st.analogy) parts.push(`Here is a way to picture it. ${st.analogy}`);
  if (stepIndex === total - 1) parts.push("That is the end of this topic. Well done.");
  return parts.map((p) => endDot(cleanForSpeech(p))).join(" ");
}

/** Split into sentences: long utterances get cut off by some browsers, short ones do not. */
function chunks(text: string): string[] {
  const out: string[] = [];
  for (const s of text.match(/[^.!?]+[.!?]*/g) ?? [text]) {
    const t = s.trim();
    if (!t) continue;
    if (t.length <= 220) out.push(t);
    else for (const piece of t.match(/.{1,200}(\s|$)/g) ?? [t]) out.push(piece.trim());
  }
  return out;
}

const NAME_KEY = "ai-lab-voice-name";
export const englishVoices = (): SpeechSynthesisVoice[] => (canSpeak() ? window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en")) : []);
export const readVoiceName = (): string => {
  try {
    return window.localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
};
export const saveVoiceName = (n: string) => {
  try {
    window.localStorage.setItem(NAME_KEY, n);
  } catch {
    /* private mode */
  }
};
/** Best-sounding voices first: enhanced / premium / neural ones, then the rest. */
export const rankVoices = (): SpeechSynthesisVoice[] => {
  const q = (v: SpeechSynthesisVoice) => (/enhanced|premium|neural|natural/i.test(v.name) ? 100 : 0) + (/google/i.test(v.name) ? 30 : 0) + (v.lang.toLowerCase() === "en-in" ? 3 : 0);
  return [...englishVoices()].sort((a, b) => q(b) - q(a));
};

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = englishVoices();
  if (!voices.length) return null;
  const chosen = readVoiceName();
  const mine = voices.find((v) => v.name === chosen);
  if (mine) return mine;
  const score = (v: SpeechSynthesisVoice) =>
    (/natural|neural|premium|enhanced/i.test(v.name) ? 40 : 0) +
    (/google|samantha|daniel|karen|aaron|rishi|veena|ravi|heera/i.test(v.name) ? 15 : 0) +
    (v.lang.toLowerCase() === "en-in" ? 12 : v.lang.toLowerCase() === "en-us" ? 8 : v.lang.toLowerCase() === "en-gb" ? 6 : 0) +
    (v.localService ? 2 : 0);
  return [...voices].sort((a, b) => score(b) - score(a))[0];
}

/**
 * Speak `text` sentence by sentence. Returns a stop function.
 * `onDone` fires once, after the last sentence (also when the browser fails to speak, so autoplay never gets stuck).
 */
export function speak(text: string, rate: number, onDone: () => void): () => void {
  if (!canSpeak() || !text) {
    const t = window.setTimeout(onDone, 0);
    return () => window.clearTimeout(t);
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const parts = chunks(text);
  let stopped = false;
  let finished = false;
  let i = 0;
  const voice = pickVoice();
  // If the engine never reports back (some iPad / Safari cases), move on after a safe estimate.
  const guard = window.setTimeout(() => finish(), Math.max(4000, (text.length / 13) * 1000 / Math.max(0.6, rate) + 6000));

  function finish() {
    if (finished || stopped) return;
    finished = true;
    window.clearTimeout(guard);
    onDone();
  }
  function next() {
    if (stopped || finished) return;
    if (i >= parts.length) return finish();
    const u = new SpeechSynthesisUtterance(parts[i++]);
    u.lang = voice?.lang ?? "en-US";
    if (voice) u.voice = voice;
    u.rate = Math.min(1.6, Math.max(0.7, rate * 0.95));
    u.onend = next;
    u.onerror = (e) => {
      if (e.error === "canceled" || e.error === "interrupted") return;
      finish();
    };
    synth.speak(u);
  }
  next();
  return () => {
    stopped = true;
    window.clearTimeout(guard);
    synth.cancel();
  };
}

/** Say a short sample so the learner can hear a voice before choosing it. */
export function sampleVoice() {
  speak("Hi, this is how I will explain things to you.", 1, () => {});
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}
