"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Full-screen reader and lab pages scroll inside themselves, so a footer under them would add a second page scrollbar. */
const APP_PAGES = ["/gen-ai", "/aws-saa-v2", "/aws-lab", "/ai-engineering/visual-lab"];

export function FooterGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (APP_PAGES.some((page) => pathname === page || pathname.startsWith(`${page}/`))) return null;
  return <>{children}</>;
}
