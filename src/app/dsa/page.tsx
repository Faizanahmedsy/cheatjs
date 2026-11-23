import type { Metadata } from "next";
import { Suspense } from 'react';
import DSAPageContent from './DSAPageContent';

import { pageMeta } from "@/lib/seo";
export const metadata: Metadata = pageMeta({ title: "DSA notes", description: "DSA notes and patterns in plain words: arrays, hashing, two pointers, sliding window, stacks, binary search, trees, graphs and dynamic programming.", path: "/dsa", keywords: ["DSA notes", "DSA patterns", "data structures and algorithms"] });

export default function DSAPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading content...</div>}>
      <DSAPageContent />
    </Suspense>
  );
}
