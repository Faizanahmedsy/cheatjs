import { AWS_TRACK, GENAI_TRACK, hrefFor } from "@/lib/aws-v2/pages";
import type { DashTrack } from "@/components/study/StudyDashboard";

export const DASH_TRACKS: DashTrack[] = [AWS_TRACK, GENAI_TRACK].map((t) => ({
  id: t.id,
  label: t.label,
  base: t.base,
  pages: t.pages.map((p) => ({ slug: p.slug, title: p.title, icon: p.icon, href: hrefFor(p.slug, t) })),
}));
