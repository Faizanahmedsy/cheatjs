import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Article } from "@/components/aws-v2/Article";
import { GENAI_TRACK, findPageBySlug } from "@/lib/aws-v2/pages";

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return GENAI_TRACK.pages.filter((p) => p.slug !== "home").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = findPageBySlug(slug, GENAI_TRACK);
  return { title: page ? `${page.title} | Gen AI | Cheat JS` : "Gen AI" };
}

export default async function GenAIPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = findPageBySlug(slug, GENAI_TRACK);
  if (!page || page.slug === "home") notFound();
  return <Article page={page} track={GENAI_TRACK} />;
}
