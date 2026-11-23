import { AWS_TRACK, GENAI_TRACK, findPageBySlug, hrefFor } from "@/lib/aws-v2/pages";
import { notionToMarkdown } from "@/lib/aws-v2/convert";
import { loadPage } from "@/lib/aws-v2/notion";
import { absolute } from "@/lib/seo";

export const revalidate = 300;

/**
 * A docs page as plain Markdown: used by "Copy markdown" and by
 * "Open in ChatGPT / Claude", which hand the assistant this URL to read.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ track: string; slug: string }> }) {
  const { track: trackId, slug } = await params;
  const track = trackId === "gen-ai" ? GENAI_TRACK : trackId === "aws" ? AWS_TRACK : null;
  const page = track ? findPageBySlug(slug, track) : undefined;
  if (!track || !page) return new Response("Not found", { status: 404 });
  const loaded = await loadPage(page, track);
  const body = `# ${page.title}

> ${page.blurb}
> Source: ${absolute(hrefFor(page.slug, track))} (Ustad Billu ki Class, free lessons by Ustad Billu)

${notionToMarkdown(loaded.markdown, track)}
`;
  return new Response(body, {
    headers: { "content-type": "text/markdown; charset=utf-8", "cache-control": "public, s-maxage=300, stale-while-revalidate=86400" },
  });
}
