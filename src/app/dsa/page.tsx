import { Suspense } from 'react';
import DSAPageContent from './DSAPageContent';

export default function DSAPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading content...</div>}>
      <DSAPageContent />
    </Suspense>
  );
}
