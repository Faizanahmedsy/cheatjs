import type { Metadata } from "next";
import { LessonIndex } from "@/components/deep-dive/LessonIndex";
import { AwsLegacyRedirect } from "@/components/deep-dive/AwsDive";
import { AWS_LESSONS } from "@/lib/deep-dive/aws";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "AWS Lab: 49 AWS services, step by step", description: "Watch AWS services work as live 3D diagrams: grow one app from a single server to multi-region, then break parts and see what survives. Covers EC2, S3, VPC, IAM, RDS, Lambda, ELB, CloudFront, KMS and 40 more for SAA-C03.", path: "/aws-lab", keywords: ["AWS lab", "AWS services explained", "SAA-C03", "AWS architecture diagram", "high availability"] });

export default function AwsLabPage() {
  return (
    <>
      <AwsLegacyRedirect />
      <LessonIndex lessons={AWS_LESSONS} base="/aws-lab" title="AWS Lab" intro="49 services as live diagrams. Every lesson ends by breaking something on purpose, so you see what survives." />
    </>
  );
}
