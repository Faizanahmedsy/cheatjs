import { Article } from "@/components/aws-v2/Article";
import { HubCards } from "@/components/aws-v2/HubCards";
import { GENAI_TRACK, findPageBySlug } from "@/lib/aws-v2/pages";

export const revalidate = 300;

export default function GenAIHome() {
  const page = findPageBySlug("home", GENAI_TRACK)!;
  return <Article page={page} track={GENAI_TRACK} before={<HubCards track={GENAI_TRACK} />} />;
}
