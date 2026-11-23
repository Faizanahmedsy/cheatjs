import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Article } from "@/components/aws-v2/Article";
import { V2_PAGES, findPageBySlug } from "@/lib/aws-v2/pages";

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return V2_PAGES.filter((p) => p.slug !== "home").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = findPageBySlug(slug);
  return { title: page ? `${page.title} · AWS · Ustad Billu ki Class` : "AWS SAA v2" };
}

export default async function AWSV2Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = findPageBySlug(slug);
  if (!page || page.slug === "home") notFound();
  return <Article page={page} />;
}
