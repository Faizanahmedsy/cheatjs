import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeepDive } from "@/components/deep-dive/DeepDive";
import { LESSONS, findLesson } from "@/lib/deep-dive/lessons";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const lesson = findLesson((await params).slug);
  if (!lesson) return {};
  return pageMeta({ title: `${lesson.title}: animated step by step`, description: lesson.problem, path: `/deep-dive/${lesson.slug}`, keywords: [lesson.title, lesson.question, "DSA visualizer"] });
}

export default async function DeepDivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!findLesson(slug)) notFound();
  return <DeepDive slug={slug} />;
}
