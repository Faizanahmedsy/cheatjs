import type { Metadata } from "next";
import { Suspense } from "react";
import { AwsLab } from "@/components/aws-lab/AwsLab";

import { pageMeta } from "@/lib/seo";
export const metadata: Metadata = pageMeta({ title: "AWS Lab: 49 AWS services, step by step", description: "Watch AWS services work as live diagrams: grow one app from a single server to multi-region, then break parts and see what survives. Covers EC2, S3, VPC, IAM, RDS, Lambda, ELB, CloudFront, KMS and 40 more for SAA-C03.", path: "/aws-lab", keywords: ["AWS lab", "AWS services explained", "SAA-C03", "AWS architecture diagram", "high availability"] });

export default function AwsLabPage() {
  return (
    <Suspense fallback={<div className="grid h-[60vh] place-items-center text-sm text-slate-400">Loading the lab…</div>}>
      <AwsLab />
    </Suspense>
  );
}
