import GithubSlugger from "github-slugger";
import { cheatsheets, type Snippet } from "@/lib/cheatsheets";
import { buildCards, cleanTopic, plain } from "@/lib/flashcards";
import { extractToc, notionToMarkdown } from "@/lib/aws-v2/convert";
import { loadPage } from "@/lib/aws-v2/notion";
import { AWS_TRACK, GENAI_TRACK, hrefFor } from "@/lib/aws-v2/pages";

export const revalidate = 3600;
export const dynamic = "force-static";

type Entry = { t: string; s: string; h: string; k: string; x?: string };

export async function GET() {
  const entries: Entry[] = [];

  // Cheatsheets on the home page
  for (const cat of cheatsheets) {
    const base = `/?category=${encodeURIComponent(cat.name)}`;
    const add = (sn: Snippet, sub?: string, href = base) =>
      entries.push({
        t: sn.title,
        s: sub ? `${cat.name} › ${sub}` : cat.name,
        h: href,
        k: "Cheatsheet",
        x: sn.description.slice(0, 220),
      });
    cat.snippets?.forEach((sn) => add(sn));
    cat.subCategories?.forEach((sub) => {
      const param = cat.name === "DSA" ? "dsa" : cat.name === "React" ? "level" : "";
      const href = param ? `${base}&${param}=${encodeURIComponent(sub.name)}` : base;
      sub.snippets?.forEach((sn) => add(sn, sub.name, href));
      sub.sections?.forEach((sec) => sec.snippets.forEach((sn) => add(sn, `${sub.name} › ${sec.heading}`, href)));
    });
  }

  // Notion study pages
  for (const track of [AWS_TRACK, GENAI_TRACK]) {
    for (const page of track.pages) {
      const href = hrefFor(page.slug, track);
      entries.push({ t: page.title, s: track.shortLabel, h: href, k: "Study", x: page.blurb });
      let md = "";
      try {
        md = notionToMarkdown((await loadPage(page, track)).markdown, track);
      } catch {
        continue;
      }
      const toc = extractToc(md, new GithubSlugger());
      for (const item of toc) {
        entries.push({ t: plain(item.text), s: `${track.shortLabel} › ${page.title}`, h: `${href}#${item.id}`, k: "Section" });
      }
      if (page.slug === "home") continue;
      for (const c of buildCards(md, track, page)) {
        if (c.kind !== "term") continue;
        const topicItem = toc.find((i) => cleanTopic(i.text) === c.topic);
        const term = /^What does "(.*)" mean\?$/.exec(c.front)?.[1] ?? c.front;
        entries.push({
          t: term,
          s: `${track.shortLabel} › ${c.topic}`,
          h: topicItem ? `${href}#${topicItem.id}` : href,
          k: "Term",
          x: c.back,
        });
      }
    }
  }

  return Response.json(entries, { headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" } });
}
