import type { Metadata } from "next";
import { Suspense } from "react";
import { AwsLab } from "@/components/aws-lab/AwsLab";

export const metadata: Metadata = {
  title: "AWS Lab · Ustad Billu ki Class",
  description: "Watch AWS services work, step by step. Grow one app from a single server to a multi-region setup, break parts and see what survives.",
};

export default function AwsLabPage() {
  return (
    <Suspense fallback={<div className="grid h-[60vh] place-items-center text-sm text-slate-400">Loading the lab…</div>}>
      <AwsLab />
    </Suspense>
  );
}
