import { ALL_PROBLEMS } from "@/lib/visualizer/catalog";
import { LEVELS, levelOf } from "@/lib/visualizer/problem-types";
import { HOME_FAQ } from "@/lib/faq";
import { absolute } from "@/lib/seo";
import { BILLU, SUBJECTS } from "@/lib/subjects";

export const dynamic = "force-static";

/** A plain-text guide for AI assistants and answer engines (llms.txt convention). */
export function GET() {
  const counts = LEVELS.map((l) => `${l.label}: ${ALL_PROBLEMS.filter((p) => levelOf(p) === l.id).length} questions. ${l.blurb}`);
  const body = `# Ustad Billu ki Class

> Free visual lessons from Ustad Billu (a teacher cat who explains tech in easy Hinglish) for DSA, Gen AI, AWS and JavaScript. Formerly called Cheat JS. Address: ${absolute("/")}

## Subjects
${SUBJECTS.map((s) => `- [${s.label}](${absolute(s.tabs[0].href)}): ${s.blurb} Pages: ${s.tabs.map((t) => `[${t.label}](${absolute(t.href.split("?")[0])})`).join(", ")}`).join("\n")}

## DSA Visualizer levels
${counts.map((c) => `- ${c}`).join("\n")}
The visualizer runs each solution one line at a time and shows arrays with index pointers, map and set lookups, variables, a dry-run table and a plain-English reason for every step. Open a question with ${absolute("/visualizer")}?problem=<id>, for example ${absolute("/visualizer")}?problem=two-sum.

## FAQ
${HOME_FAQ.map(({ q, a }) => `### ${q}\n${a}`).join("\n\n")}

## Ustad Billu
- YouTube: ${BILLU.youtube}
- DSA playlist (LeetCode Ki Soch): ${BILLU.dsaPlaylist}
- Instagram: ${BILLU.instagram}
- Main site: ${BILLU.site}
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
