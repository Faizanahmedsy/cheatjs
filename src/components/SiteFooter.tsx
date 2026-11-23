import Image from "next/image";
import Link from "next/link";
import { ARCHIVED, BILLU, SITE_NAME, SUBJECTS } from "@/lib/subjects";

/** Every page ends with this: the subjects, the Ustad Billu links and the old pages. */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950/60 px-4 py-10 text-sm text-slate-400">
      <div className="container mx-auto grid max-w-6xl gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="flex items-start gap-3">
          <Image src={BILLU.mascot} alt="Ustad Billu, a white cat with gold glasses and a red cap" width={56} height={56} className="h-14 w-14 shrink-0 rounded-2xl bg-amber-50 object-contain p-1" />
          <div>
            <p className="font-headline text-base font-bold text-slate-100">{SITE_NAME}</p>
            <p className="mt-1">
              Free visual lessons from <span className="text-orange-300">Ustad Billu</span>, the cat who explains tech in easy Hinglish.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={BILLU.youtube} target="_blank" rel="noopener noreferrer" className="rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1 text-xs font-semibold text-white hover:brightness-110">
                YouTube
              </a>
              <a href={BILLU.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-orange-300">
                Instagram
              </a>
              <a href={BILLU.site} target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-orange-300">
                ustadbillu.vercel.app
              </a>
            </div>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Subjects</p>
          <ul className="space-y-1.5">
            {SUBJECTS.map((s) => (
              <li key={s.id}>
                <Link href={s.tabs[0].href} className="hover:text-cyan-300">
                  {s.emoji} {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Study</p>
          <ul className="space-y-1.5">
            <li>
              <Link href="/study" className="hover:text-cyan-300">My progress</Link>
            </li>
            <li>
              <Link href="/flashcards" className="hover:text-cyan-300">All flashcards</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Archived</p>
          <ul className="space-y-1.5">
            {ARCHIVED.map((a) => (
              <li key={a.href}>
                <Link href={a.href} className="text-slate-500 hover:text-cyan-300">{a.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-slate-600">
        Made by{" "}
        <a href="https://faizansaiyed.vercel.app" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-300">
          Faizan
        </a>{" "}
        · {SITE_NAME} (formerly Cheat JS) · © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
