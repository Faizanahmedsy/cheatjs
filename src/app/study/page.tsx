import type { Metadata } from "next";
import { StudyDashboard } from "@/components/study/StudyDashboard";
import { OfflineButton } from "@/components/study/OfflineButton";
import { DASH_TRACKS } from "@/lib/study-tracks";
import { AWS_TRACK, GENAI_TRACK, hrefFor } from "@/lib/aws-v2/pages";

export const metadata: Metadata = { title: "Study | Cheat JS" };

export default function StudyPage() {
  const urls = [AWS_TRACK, GENAI_TRACK].flatMap((t) => t.pages.map((p) => hrefFor(p.slug, t)));
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 text-slate-50">
      <h1 className="mb-1 font-headline text-3xl font-bold text-slate-100">Study</h1>
      <p className="mb-6 text-slate-400">Your progress, bookmarks and flashcards. Everything is saved in this browser only.</p>
      <StudyDashboard tracks={DASH_TRACKS} />
      <OfflineButton urls={["/", "/study", "/flashcards", ...urls]} />
    </main>
  );
}
