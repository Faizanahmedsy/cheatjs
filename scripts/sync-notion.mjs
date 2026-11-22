#!/usr/bin/env node
// Refresh the committed snapshots in content/aws-v2 from Notion.
//   NOTION_API_KEY=secret_xxx node scripts/sync-notion.mjs
// The Notion integration must be connected to the "Exam Preparation" page.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const token = process.env.NOTION_API_KEY || process.env.NOTION_TOKEN;
if (!token) {
  console.error("Set NOTION_API_KEY first.");
  process.exit(1);
}

const dir = path.join(process.cwd(), "content", "aws-v2");
const pages = JSON.parse(await readFile(path.join(dir, "pages.json"), "utf8"));
const headers = { Authorization: `Bearer ${token}`, "Notion-Version": "2026-03-11" };

async function md(id) {
  const res = await fetch(`https://api.notion.com/v1/pages/${id}/markdown?markdown_version=v2`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

async function full(id, depth = 0) {
  const first = await md(id);
  let out = first.markdown;
  if (!first.truncated || depth >= 3) return out;
  for (const u of first.unknown_block_ids ?? []) {
    const re = new RegExp(`<unknown[^>]*${u.replace(/-/g, "").slice(0, 8)}[^>]*\\/>`, "i");
    if (!re.test(out)) continue;
    try {
      const sub = await full(u, depth + 1);
      out = out.replace(re, () => sub);
    } catch {}
  }
  return out;
}

for (const page of pages) {
  const body = await full(page.notionId);
  const meta = await fetch(`https://api.notion.com/v1/pages/${page.notionId}`, { headers }).then((r) => r.json());
  await writeFile(path.join(dir, `${page.slug}.md`), body.endsWith("\n") ? body : body + "\n");
  if (meta.last_edited_time) page.snapshotEditedAt = meta.last_edited_time;
  console.log(`synced ${page.slug} (${body.length} chars)`);
}
await writeFile(path.join(dir, "pages.json"), JSON.stringify(pages, null, 2) + "\n");
