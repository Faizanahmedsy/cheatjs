import type { Metadata } from "next";
import { Suspense } from 'react';
import FeaturesPageClient from './FeaturesPageClient';

import { pageMeta } from "@/lib/seo";
export const metadata: Metadata = pageMeta({ title: "JS Features (archived)", description: "Older list of modern JavaScript features, kept for reference.", path: "/features", keywords: ["JavaScript features"] });

export default function FeaturesPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading content...</div>}>
      <FeaturesPageClient />
    </Suspense>
  );
}
