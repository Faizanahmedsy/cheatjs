import { Suspense } from 'react';
import AWSPageContent from './AWSPageContent';

export default function AWSPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading content...</div>}>
      <AWSPageContent />
    </Suspense>
  );
}
