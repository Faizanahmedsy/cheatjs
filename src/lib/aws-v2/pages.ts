import awsPagesJson from "../../../content/aws-v2/pages.json";
import genAiPagesJson from "../../../content/gen-ai/pages.json";

export type V2Page = {
  slug: string;
  notionId: string;
  title: string;
  subtitle: string;
  icon: string;
  blurb: string;
  group: "Start here" | "Domains" | "Parts" | "Reference";
  weight?: string;
  snapshotEditedAt: string;
};

export type Track = {
  id: "aws" | "gen-ai";
  base: string;
  dir: string;
  label: string;
  shortLabel: string;
  groups: readonly V2Page["group"][];
  unitName: "Domain" | "Part";
  backHref: string;
  backLabel: string;
  /** Show this track without emoji: no page icons, and an emoji-free home page. */
  plain?: boolean;
  pages: V2Page[];
};

export const AWS_TRACK: Track = {
  id: "aws",
  base: "/aws-saa-v2",
  dir: "aws-v2",
  label: "AWS SAA-C03 · v2",
  shortLabel: "AWS SAA v2",
  groups: ["Start here", "Domains", "Reference"],
  unitName: "Domain",
  backHref: "/aws-saa",
  backLabel: "← Original AWS cheat sheets (v1)",
  pages: awsPagesJson as V2Page[],
};

export const GENAI_TRACK: Track = {
  id: "gen-ai",
  base: "/gen-ai",
  dir: "gen-ai",
  label: "Generative AI Mastery",
  shortLabel: "Gen AI",
  groups: ["Start here", "Parts", "Reference"],
  unitName: "Part",
  backHref: "/ai-engineering",
  backLabel: "← AI Engineering cheat sheets",
  plain: true,
  pages: genAiPagesJson as V2Page[],
};

export const V2_PAGES = AWS_TRACK.pages;
export const V2_BASE = AWS_TRACK.base;

export function hrefFor(slug: string, track: Track = AWS_TRACK): string {
  return slug === "home" ? track.base : `${track.base}/${slug}`;
}

export function findPageBySlug(slug: string, track: Track = AWS_TRACK): V2Page | undefined {
  return track.pages.find((p) => p.slug === slug);
}

export function findPageByNotionId(id: string, track: Track = AWS_TRACK): V2Page | undefined {
  const clean = id.replace(/-/g, "").toLowerCase();
  return track.pages.find((p) => p.notionId.replace(/-/g, "").toLowerCase() === clean);
}

/** Pages in the order the sidebar shows them (group by group), including the home page. */
export function orderedPages(track: Track = AWS_TRACK): V2Page[] {
  return track.groups.flatMap((group) => track.pages.filter((p) => p.group === group));
}

export function neighboursOf(slug: string, track: Track = AWS_TRACK): { prev?: V2Page; next?: V2Page } {
  const list = orderedPages(track);
  const at = list.findIndex((p) => p.slug === slug);
  if (at < 0) return {};
  return { prev: list[at - 1], next: list[at + 1] };
}
