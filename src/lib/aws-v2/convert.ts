import { AWS_TRACK, findPageByNotionId, hrefFor, type Track } from "./pages";

const EMOJI = "(?![©®™\\u2194-\\u21AA])\\p{Extended_Pictographic}(?:[\\uFE0F\\u200D\\u{1F3FB}-\\u{1F3FF}]|\\p{Extended_Pictographic})*";

/** Removes emoji, including brackets that held nothing but emoji. */
export function stripEmoji(text: string): string {
  return text
    .replace(new RegExp(`[ \\t]*\\((?:\\s*${EMOJI})+\\s*\\)`, "gu"), "")
    .replace(new RegExp(`${EMOJI}[ \\t]*`, "gu"), "");
}

/**
 * Turns Notion-flavored markdown into markdown that react-markdown + rehype-raw
 * can render. Only the Notion-specific block tags need work; <b>, <br /> and
 * friends are handled by rehype-raw.
 */
export function notionToMarkdown(source: string, track: Track = AWS_TRACK, options: { noEmoji?: boolean } = {}): string {
  let s = source.replace(/\r\n/g, "\n");
  if (options.noEmoji) s = stripEmoji(s);

  // <callout icon="x" color="blue_bg">body</callout>  ->  styled div with markdown body
  s = s.replace(
    /<callout([^>]*)>\n?([\s\S]*?)\n?<\/callout>/g,
    (_m, attrs: string, body: string) => {
      const icon = /icon="([^"]*)"/.exec(attrs)?.[1] ?? "💡";
      const color = /color="([^"]*)"/.exec(attrs)?.[1] ?? "gray_bg";
      const tone = color.replace(/_bg$/, "");
      return `<div class="nb-callout" data-icon="${icon}" data-tone="${tone}">\n\n${body.trim()}\n\n</div>`;
    }
  );

  // Child page references -> links to the matching v2 route
  s = s.replace(
    /<page\s+url="([^"]*)"[^>]*>\n?([\s\S]*?)\n?<\/page>/g,
    (_m, url: string, title: string) => {
      const id = /([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i.exec(url)?.[1];
      const page = id ? findPageByNotionId(id, track) : undefined;
      if (!page) return "";
      const label = track.plain ? title.trim() : `${page.icon} ${title.trim()}`;
      return `- [${label}](${hrefFor(page.slug, track)})`;
    }
  );

  s = s
    .replace(/<table-of-contents[^>]*\/>/g, "")
    .replace(/<unknown[^>]*\/>/g, "")
    .replace(/<p\s*\/>/g, "")
    .replace(/<p><\/p>/g, "");

  return s;
}

export type TocItem = { id: string; text: string; level: 2 | 3 };

/** Headings (h2/h3) for the "On this page" list. Skips fenced code blocks. */
export function extractToc(markdown: string, slugger: { slug: (s: string) => string }): TocItem[] {
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{1,3})\s+(.*?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = m[2]
      .replace(/<[^>]+>/g, "")
      .replace(/\\([\\`*_{}[\]()#+\-.!|<>$])/g, "$1")
      .replace(/[*_`]/g, "")
      .trim();
    // h1 is rare in Notion bodies; still run it through the slugger so duplicate ids stay in sync
    const id = slugger.slug(text);
    if (m[1].length === 1) continue;
    items.push({ id, text, level: m[1].length as 2 | 3 });
  }
  return items;
}

export type PageStats = { topics: number; comingSoon: number; checked: number; unchecked: number };

export function computeStats(markdown: string): PageStats {
  const topics = (markdown.match(/^###\s+\d+\.\s/gm) ?? []).length;
  const comingSoon = (markdown.match(/Coming soon/gi) ?? []).length;
  const checked = (markdown.match(/^- \[x\]/gim) ?? []).length;
  const unchecked = (markdown.match(/^- \[ \]/gm) ?? []).length;
  return { topics, comingSoon, checked, unchecked };
}
