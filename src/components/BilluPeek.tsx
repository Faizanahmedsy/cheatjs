"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { BILLU, findSubject } from "@/lib/subjects";

const KEY = "billu-peek-seen";
const DELAY_MS = 25_000;

/**
 * Billu peeks in from the bottom-left corner once per visit, after the
 * learner has been on a page for a while. One tap closes him for the visit.
 */
export function BilluPeek() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen || pathname === "/") return;
    const timer = window.setTimeout(() => {
      setShow(true);
      try {
        window.sessionStorage.setItem(KEY, "1");
      } catch {
        // Storage blocked: Billu may peek again next page.
      }
    }, DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!show) return null;
  const subject = findSubject(pathname)?.subject;
  const href = subject?.video.href ?? BILLU.youtube;

  return (
    <div data-chrome className="billu-peek fixed bottom-0 left-4 z-40 hidden items-end gap-2 md:flex" role="complementary" aria-label="Ustad Billu">
      <Image src={BILLU.mascot} alt="Ustad Billu peeking" width={84} height={84} className="h-20 w-20 translate-y-3 object-contain drop-shadow-lg" />
      <div className="relative mb-6 max-w-[15rem] rounded-2xl rounded-bl-sm border border-orange-300/40 bg-slate-900/95 px-3 py-2 text-sm text-slate-200 shadow-xl">
        <button type="button" onClick={() => setShow(false)} aria-label="Close" className="absolute -right-2 -top-2 rounded-full bg-slate-800 p-1 text-slate-400 hover:text-slate-100">
          <X className="h-3 w-3" />
        </button>
        Shagird, stuck? I explain {subject ? subject.label : "this"} in easy Hinglish.{" "}
        <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-orange-300 hover:underline" onClick={() => setShow(false)}>
          Watch now 🎬
        </a>
      </div>
    </div>
  );
}
