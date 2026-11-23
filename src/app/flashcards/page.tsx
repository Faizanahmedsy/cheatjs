import type { Metadata } from "next";
import { FlashcardApp } from "@/components/study/FlashcardApp";
import { buildCards, type Card } from "@/lib/flashcards";
import { notionToMarkdown } from "@/lib/aws-v2/convert";
import { loadPage } from "@/lib/aws-v2/notion";
import { AWS_TRACK, GENAI_TRACK } from "@/lib/aws-v2/pages";

import { pageMeta } from "@/lib/seo";
export const revalidate = 300;
export const metadata: Metadata = { ...pageMeta({ title: "Flashcards", description: "Flashcards for AWS SAA-C03 and Gen AI notes, with spaced repetition saved in your browser.", path: "/flashcards" }) };

export default async function FlashcardsPage() {
  const cards: Card[] = [];
  for (const track of [AWS_TRACK, GENAI_TRACK]) {
    const pages = track.pages.filter((p) => p.slug !== "home");
    const loaded = await Promise.all(pages.map((p) => loadPage(p, track)));
    pages.forEach((p, i) => cards.push(...buildCards(notionToMarkdown(loaded[i].markdown, track), track, p)));
  }
  const units = [AWS_TRACK, GENAI_TRACK].flatMap((t) =>
    t.pages.filter((p) => p.slug !== "home").map((p) => ({ track: t.id, slug: p.slug, title: p.title, trackLabel: t.shortLabel }))
  );
  return <FlashcardApp cards={cards} units={units} />;
}
