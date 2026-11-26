import { promises as fs } from "node:fs";
import path from "node:path";
import { AWS_TRACK, type Track, type V2Page } from "./pages";

const NOTION_VERSION = "2026-03-11";
const API = "https://api.notion.com/v1/pages";
const REVALIDATE_SECONDS = 300;

export type LoadedPage = {
  markdown: string;
  source: "notion" | "snapshot";
  /** ISO time the content was last edited in Notion (snapshot value when offline) */
  editedAt: string;
};

type MarkdownResponse = {
  markdown: string;
  truncated: boolean;
  unknown_block_ids?: string[];
};

function getToken(): string | undefined {
  return process.env.NOTION_API_KEY || process.env.NOTION_TOKEN || undefined;
}

async function fetchMarkdown(id: string, token: string): Promise<MarkdownResponse> {
  const res = await fetch(`${API}/${id}/markdown?markdown_version=v2`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
    },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`Notion API ${res.status} for ${id}`);
  }
  return (await res.json()) as MarkdownResponse;
}

async function fetchPageEditedAt(id: string, token: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      headers: { Authorization: `Bearer ${token}`, "Notion-Version": NOTION_VERSION },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return undefined;
    const j = (await res.json()) as { last_edited_time?: string };
    return j.last_edited_time;
  } catch {
    return undefined;
  }
}

/** Large pages come back truncated; each unknown block is a subtree we can fetch separately. */
async function fetchFullMarkdown(id: string, token: string, depth = 0): Promise<string> {
  const first = await fetchMarkdown(id, token);
  let markdown = first.markdown;
  if (!first.truncated || depth >= 3) return markdown;

  const ids = first.unknown_block_ids ?? [];
  for (const unknownId of ids) {
    const plain = unknownId.replace(/-/g, "");
    const re = new RegExp(`<unknown[^>]*${plain.slice(0, 8)}[^>]*\\/>`, "i");
    if (!re.test(markdown)) continue;
    try {
      const sub = await fetchFullMarkdown(unknownId, token, depth + 1);
      markdown = markdown.replace(re, () => sub);
    } catch {
      // inaccessible block: leave the placeholder (it is stripped when rendering)
    }
  }
  return markdown;
}

async function readSnapshot(page: V2Page, track: Track): Promise<string> {
  const file = path.join(process.cwd(), "content", track.dir, `${page.slug}.md`);
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return [
      "<callout icon=\"🔌\" color=\"yellow_bg\">",
      "<b>Coming soon.</b> These notes are not available right now. Please check back in a few minutes.",
      "</callout>",
    ].join("\n");
  }
}

export async function loadPage(page: V2Page, track: Track = AWS_TRACK): Promise<LoadedPage> {
  const token = getToken();
  if (token) {
    try {
      const [markdown, editedAt] = await Promise.all([
        fetchFullMarkdown(page.notionId, token),
        fetchPageEditedAt(page.notionId, token),
      ]);
      return { markdown, source: "notion", editedAt: editedAt ?? new Date().toISOString() };
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      console.warn(`Live Notion fetch failed for ${page.slug} (${message}); showing the saved snapshot.`);
      const markdown = await readSnapshot(page, track);
      return { markdown, source: "snapshot", editedAt: page.snapshotEditedAt };
    }
  }
  const markdown = await readSnapshot(page, track);
  return { markdown, source: "snapshot", editedAt: page.snapshotEditedAt };
}
