import { Suspense } from 'react';
import FeaturesPageClient from './FeaturesPageClient';

export default function FeaturesPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading content...</div>}>
      <FeaturesPageClient />
    </Suspense>
  );
}
