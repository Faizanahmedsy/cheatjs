"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AWS_LESSONS } from "@/lib/deep-dive/aws";
import { LessonNav } from "./DeepDiveNav";
import { LessonShell } from "./DeepDive";

export function AwsNav() {
  return <LessonNav lessons={AWS_LESSONS} base="/aws-lab" />;
}

export function AwsLesson({ slug }: { slug: string }) {
  return <LessonShell lessons={AWS_LESSONS} slug={slug} base="/aws-lab" home="AWS Lab" />;
}

/** Old links used /aws-lab?lesson=id; send them to the new page. */
export function AwsLegacyRedirect() {
  const router = useRouter();
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("lesson");
    if (id && AWS_LESSONS.some((l) => l.slug === id)) router.replace(`/aws-lab/${id}`);
  }, [router]);
  return null;
}
