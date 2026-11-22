import { Article } from "@/components/aws-v2/Article";
import { StudyDashboard } from "@/components/study/StudyDashboard";
import { DASH_TRACKS } from "@/lib/study-tracks";
import { HubCards } from "@/components/aws-v2/HubCards";
import { GENAI_TRACK, findPageBySlug } from "@/lib/aws-v2/pages";

export const revalidate = 300;

export default function GenAIHome() {
  const page = findPageBySlug("home", GENAI_TRACK)!;
  return <Article page={page} track={GENAI_TRACK} before={<><StudyDashboard tracks={DASH_TRACKS} trackId="gen-ai" compact /><HubCards track={GENAI_TRACK} /></>} />;
}
