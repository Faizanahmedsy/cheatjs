import { pageMeta } from "@/lib/seo";
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
  if (!page) return { title: "AWS" };
  return pageMeta({ title: `${page.title} · AWS`, description: page.blurb || page.subtitle, path: `/aws-saa-v2/${page.slug}`, keywords: [page.title, "AWS"] });
}

export default async function AWSV2Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = findPageBySlug(slug);
  if (!page || page.slug === "home") notFound();
  return <Article page={page} />;
}
