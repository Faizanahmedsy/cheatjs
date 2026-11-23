import type { MetadataRoute } from "next";
import { AWS_TRACK, GENAI_TRACK } from "@/lib/aws-v2/pages";
import { absolute } from "@/lib/seo";

/** Served at ustadbillu.vercel.app/class/sitemap.xml (listed in the main site's robots.txt). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const main = ["/", "/visualizer", "/dsa", "/gen-ai", "/ai-engineering/visual-lab", "/aws-saa-v2", "/aws-lab", "/javascript", "/flashcards"];
  const articles = [
    ...AWS_TRACK.pages.filter((p) => p.slug !== "home").map((p) => `/aws-saa-v2/${p.slug}`),
    ...GENAI_TRACK.pages.filter((p) => p.slug !== "home").map((p) => `/gen-ai/${p.slug}`),
  ];
  return [
    ...main.map((path, i) => ({ url: absolute(path), lastModified: now, changeFrequency: "weekly" as const, priority: i === 0 ? 1 : 0.8 })),
    ...articles.map((path) => ({ url: absolute(path), lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
