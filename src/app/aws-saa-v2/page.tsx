import { Article } from "@/components/aws-v2/Article";
import { HubCards } from "@/components/aws-v2/HubCards";
import { findPageBySlug } from "@/lib/aws-v2/pages";

export const revalidate = 300;

export default function AWSV2Home() {
  const page = findPageBySlug("home")!;
  return <Article page={page} before={<HubCards />} />;
}
