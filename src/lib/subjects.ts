/**
 * The four "doors" of Ustad Billu ki Class and the pages behind each one.
 * Every subject has the same three kinds of page: Read (notes), See (a
 * visual lab) and Practice. The navbar, the subject tabs and the home page
 * all read from here, so a new page only needs adding once.
 */

export const BILLU = {
  name: "Ustad Billu",
  site: "https://ustadbillu.vercel.app",
  youtube: "https://www.youtube.com/@ustadbillu.youtube",
  instagram: "https://www.instagram.com/ustad.billu__",
  dsaPlaylist: "https://www.youtube.com/playlist?list=PLclWkBD-dMwM",
  mascot: "/billu.webp",
} as const;

export const SITE_NAME = "Ustad Billu ki Class";

export type TabKind = "read" | "see" | "practice";

export interface SubjectTab {
  kind: TabKind;
  label: string;
  href: string;
  /** Extra path prefixes that count as this tab (article pages, etc). */
  match?: string[];
}

export interface Subject {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
  /** Tailwind classes for the door card accent. */
  accent: string;
  tabs: SubjectTab[];
  /** Where Billu teaches this subject on video. */
  video: { label: string; href: string };
}

export const SUBJECTS: Subject[] = [
  {
    id: "dsa",
    label: "DSA",
    emoji: "🧩",
    blurb: "Pre-DSA warm-ups, then Levels 1–3. Watch 174 questions run line by line.",
    accent: "from-emerald-400/20 border-emerald-400/40 text-emerald-200",
    tabs: [
      { kind: "see", label: "Visualizer", href: "/visualizer" },
      { kind: "read", label: "Notes", href: "/dsa" },
    ],
    video: { label: "LeetCode Ki Soch on YouTube", href: BILLU.dsaPlaylist },
  },
  {
    id: "gen-ai",
    label: "Gen AI",
    emoji: "🤖",
    blurb: "How LLMs, RAG and agents work, in plain words and pictures.",
    accent: "from-violet-400/20 border-violet-400/40 text-violet-200",
    tabs: [
      { kind: "read", label: "Notes", href: "/gen-ai", match: ["/gen-ai/"] },
      { kind: "see", label: "Visual Lab", href: "/ai-engineering/visual-lab" },
      { kind: "practice", label: "Flashcards", href: "/flashcards?track=gen-ai" },
    ],
    video: { label: "Billu on YouTube", href: BILLU.youtube },
  },
  {
    id: "aws",
    label: "AWS",
    emoji: "☁️",
    blurb: "SAA exam notes plus 49 services you can break and watch recover.",
    accent: "from-amber-400/20 border-amber-400/40 text-amber-200",
    tabs: [
      { kind: "read", label: "SAA notes", href: "/aws-saa-v2", match: ["/aws-saa-v2/"] },
      { kind: "see", label: "AWS Lab", href: "/aws-lab" },
      { kind: "practice", label: "Flashcards", href: "/flashcards?track=aws" },
    ],
    video: { label: "Billu on YouTube", href: BILLU.youtube },
  },
  {
    id: "javascript",
    label: "JavaScript",
    emoji: "⚡",
    blurb: "Frontend cheatsheets: JS, React, Next.js and more.",
    accent: "from-cyan-400/20 border-cyan-400/40 text-cyan-200",
    tabs: [{ kind: "read", label: "Cheatsheets", href: "/javascript" }],
    video: { label: "Billu on Instagram", href: BILLU.instagram },
  },
];

export const ARCHIVED = [
  { href: "/features", label: "JS Features (old)" },
  { href: "/ai-engineering", label: "AI Engineering (old)" },
  { href: "/aws-saa", label: "AWS SAA (old)" },
];

function tabMatches(tab: SubjectTab, pathname: string): boolean {
  const base = tab.href.split("?")[0];
  return pathname === base || (tab.match ?? []).some((prefix) => pathname.startsWith(prefix));
}

/** The subject and tab a path belongs to (flashcards follow ?track=). */
export function findSubject(pathname: string, track?: string | null): { subject: Subject; tab: SubjectTab } | null {
  if (pathname === "/flashcards") {
    const subject = SUBJECTS.find((s) => s.id === (track === "gen-ai" ? "gen-ai" : track === "aws" ? "aws" : ""));
    const tab = subject?.tabs.find((t) => t.kind === "practice");
    return subject && tab ? { subject, tab } : null;
  }
  for (const subject of SUBJECTS) {
    const tab = subject.tabs.find((t) => tabMatches(t, pathname));
    if (tab) return { subject, tab };
  }
  return null;
}
