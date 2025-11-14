import { Suspense } from 'react';
import FeaturesLayoutClient from './FeaturesLayoutClient';

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading sidebar...</div>}>
      <FeaturesLayoutClient>{children}</FeaturesLayoutClient>
    </Suspense>
  );
}
