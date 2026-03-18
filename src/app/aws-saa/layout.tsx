import { Suspense } from 'react';
import AWSLayoutClient from './AWSLayoutClient';

export default function AWSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading sidebar...</div>}>
      <AWSLayoutClient>{children}</AWSLayoutClient>
    </Suspense>
  );
}
