import { Suspense } from 'react';
import DSALayoutClient from './DSALayoutClient';

export default function DSALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading sidebar...</div>}>
      <DSALayoutClient>{children}</DSALayoutClient>
    </Suspense>
  );
}
