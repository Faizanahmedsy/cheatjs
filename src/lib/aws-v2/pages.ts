import pagesJson from "../../../content/aws-v2/pages.json";

export type V2Page = {
  slug: string;
  notionId: string;
  title: string;
  subtitle: string;
  icon: string;
  blurb: string;
  group: "Start here" | "Domains" | "Reference";
  weight?: string;
  snapshotEditedAt: string;
};

export const V2_PAGES = pagesJson as V2Page[];

export const V2_BASE = "/aws-saa-v2";

export function hrefFor(slug: string): string {
  return slug === "home" ? V2_BASE : `${V2_BASE}/${slug}`;
}

export function notionUrlFor(page: V2Page): string {
  return `https://www.notion.so/${page.notionId.replace(/-/g, "")}`;
}

export function findPageBySlug(slug: string): V2Page | undefined {
  return V2_PAGES.find((p) => p.slug === slug);
}

export function findPageByNotionId(id: string): V2Page | undefined {
  const clean = id.replace(/-/g, "").toLowerCase();
  return V2_PAGES.find((p) => p.notionId.replace(/-/g, "").toLowerCase() === clean);
}
