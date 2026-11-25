import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AwsLesson } from "@/components/deep-dive/AwsDive";
import { AWS_LESSONS } from "@/lib/deep-dive/aws";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return AWS_LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const l = AWS_LESSONS.find((x) => x.slug === slug);
  return l ? pageMeta({ title: `${l.title}: AWS Lab`, description: l.problem, path: `/aws-lab/${l.slug}`, keywords: [l.title, "AWS", "SAA-C03"] }) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!AWS_LESSONS.some((l) => l.slug === slug)) notFound();
  return <AwsLesson slug={slug} />;
}
