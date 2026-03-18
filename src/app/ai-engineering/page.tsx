import { Suspense } from 'react';
import AIPageContent from './AIPageContent';

export default function AIPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading content...</div>}>
      <AIPageContent />
    </Suspense>
  );
}
