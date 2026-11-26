import type { MetadataRoute } from "next";
import { AWS_TRACK, GENAI_TRACK } from "@/lib/aws-v2/pages";
import { LESSONS } from "@/lib/deep-dive/lessons";
import { AWS_LESSONS } from "@/lib/deep-dive/aws";
import { absolute } from "@/lib/seo";

/**
 * Served at ustadbillu.vercel.app/class/sitemap.xml. Crawlers find it through the
 * "Sitemap:" line in the main site's root robots.txt (ustadbillu-site repo);
 * they never read /class/robots.txt.
 * No lastModified: there is no reliable per-page date, and a fake "now" on every
 * build teaches search engines to ignore the field.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const main = ["/", "/visualizer", "/dsa", "/gen-ai", "/ai-engineering/visual-lab", "/aws-saa-v2", "/aws-lab", "/deep-dive", "/javascript", "/flashcards"];
  const articles = [
    ...AWS_TRACK.pages.filter((p) => p.slug !== "home").map((p) => `/aws-saa-v2/${p.slug}`),
    ...GENAI_TRACK.pages.filter((p) => p.slug !== "home").map((p) => `/gen-ai/${p.slug}`),
  ];
  const lessons = [...LESSONS.map((l) => `/deep-dive/${l.slug}`), ...AWS_LESSONS.map((l) => `/aws-lab/${l.slug}`)];
  return [
    ...main.map((path, i) => ({ url: absolute(path), changeFrequency: "weekly" as const, priority: i === 0 ? 1 : 0.8 })),
    ...articles.map((path) => ({ url: absolute(path), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...lessons.map((path) => ({ url: absolute(path), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
