import type { Track, V2Page } from "./aws-v2/pages";

export type Card = {
  id: string;
  kind: "term" | "exam" | "qa" | "topic" | "trap";
  track: string;
  slug: string;
  unit: string; // page title
  topic: string;
  front: string;
  back: string;
  options?: string[];
  answer?: string; // letters, e.g. "B" or "A,C"
};

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function plain(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\*\*/g, "")
    .replace(/\\([\\`*_{}[\]()#+\-.!|<>$])/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export function cleanTopic(h: string): string {
  return plain(h).replace(/^\d+(\.\d+)*\.?\s*/, "").replace(/\s*\((Domain|Part)[^)]*\)\s*$/i, "").trim();
}

/** Bullet lines that directly follow a marker line (until a blank line followed by a non-bullet). */
function bulletsAfter(section: string, marker: RegExp): string[] {
  const lines = section.split("\n");
  const i = lines.findIndex((l) => marker.test(l));
  if (i < 0) return [];
  const out: string[] = [];
  for (let j = i + 1; j < lines.length; j++) {
    const l = lines[j];
    if (/^\s*[-*]\s+/.test(l)) out.push(l.replace(/^\s*[-*]\s+/, ""));
    else if (l.trim() === "") continue;
    else break;
  }
  return out;
}

export function buildCards(markdown: string, track: Track, page: V2Page): Card[] {
  const cards: Card[] = [];
  const parts = markdown.split(/\n(?=###\s)/);
  for (const part of parts) {
    const m = /^###\s+(.*)\n/.exec(part);
    if (!m) continue;
    const topic = cleanTopic(m[1]);
    const base = { track: track.id, slug: page.slug, unit: page.title, topic };
    const push = (c: Omit<Card, "id" | "track" | "slug" | "unit" | "topic">) => {
      const card = { ...base, ...c, id: `${track.id}:${page.slug}:${hash(c.kind + c.front)}` };
      cards.push(card);
    };

    // Topic card: explain simply
    const five = /(?:LIKE I'M 5|LIKE I’M 5)<br\s*\/?>\s*([^\n]+)/i.exec(part)?.[1];
    const recap = /ONE-LINE RECAP<br\s*\/?>\s*([^\n]+)/i.exec(part)?.[1];
    const what = bulletsAfter(part, /EXPLAINED SIMPLY/i)[0];
    if (recap || what) {
      push({
        kind: "topic",
        front: `Explain in simple words: ${topic}`,
        back: [what && plain(what), five && `Think of it like this: ${plain(five)}`, recap && `Remember: ${plain(recap)}`]
          .filter(Boolean)
          .join("\n\n"),
      });
    }

    // Jargon box: Term → meaning
    for (const b of bulletsAfter(part, /JARGON BOX/i)) {
      const [term, ...rest] = plain(b).split(/\s*→\s*/);
      const meaning = rest.join(" → ");
      if (term && meaning) push({ kind: "term", front: `What does "${term}" mean?`, back: meaning });
    }

    // Exam lens: "clue" → answer
    for (const b of bulletsAfter(part, /EXAM LENS/i)) {
      const mm = /^["“](.+?)["”]\s*→\s*(.+)$/.exec(plain(b));
      if (mm) push({ kind: "exam", front: `Exam clue: "${mm[1]}"\nWhat should you think of?`, back: mm[2] });
    }

    // Traps
    const traps = bulletsAfter(part, /TRAPS/i);
    if (traps.length) push({ kind: "trap", front: `Common traps: ${topic}`, back: traps.map((t) => `• ${plain(t)}`).join("\n") });

    // Practice question (multiple choice)
    const q = /PRACTICE QUESTION<br\s*\/?>\s*([\s\S]*?)<br\s*\/?>\s*(A\.[^\n]*)\n+\s*<b>Answer:\s*([A-D](?:\s*(?:,|and|&)\s*[A-D])*)\.?<\/b>\s*([^\n]*)/i.exec(part);
    if (q) {
      const options = q[2].split(/\s{2,}(?=[A-D]\.\s)/).map((o) => plain(o));
      const answer = q[3].replace(/\s*(and|&)\s*/gi, ",").replace(/\s+/g, "");
      if (options.length >= 2) {
        push({
          kind: "qa",
          front: plain(q[1]),
          options,
          answer,
          back: `Answer: ${q[3]}\n${plain(q[4])}`,
        });
      }
    }
  }
  return cards;
}
