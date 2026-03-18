import { Suspense } from 'react';
import AILayoutClient from './AILayoutClient';

export default function AILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading sidebar...</div>}>
      <AILayoutClient>{children}</AILayoutClient>
    </Suspense>
  );
}
