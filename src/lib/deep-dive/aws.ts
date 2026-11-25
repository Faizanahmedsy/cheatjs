import type { Lesson, SceneEdge, SceneNode, Step } from "./types";
import type { AwsLesson, AwsNode, AwsScene, NodeKind } from "@/components/aws-lab/types";
import { LESSONS as AWS } from "@/components/aws-lab/lessons";

/** Short words printed on each block; the full name sits in the tag above it. */
const ABBR: Record<NodeKind, string> = {
  user: "You", internet: "Web", server: "VM", lb: "LB", db: "DB", replica: "Copy", cache: "Fast", bucket: "S3", file: "File", queue: "Queue", topic: "Topic",
  lambda: "λ", cdn: "CDN", dns: "DNS", gateway: "API", firewall: "Wall", key: "Key", table: "Tbl", autoscale: "Auto", disk: "Disk", nat: "NAT", role: "Role",
  policy: "Rule", monitor: "Watch", box: "Box",
};

/** Turn a flat 1000×500 diagram position into platform coordinates that still read left-to-right, top-to-bottom. */
function place(n: AwsNode) {
  const across = n.x / 62;
  const down = n.y / 42;
  return { x: (across + down) / 2 + 3, y: (down - across) / 2 + 6 };
}

const plain = (s: string) => s.replace(/\*\*/g, "");
const short = (s: string) => (s.length > 18 ? `${s.slice(0, 17)}…` : s);

function scene(sc: AwsScene, down: string[] = []): { nodes: SceneNode[]; edges: SceneEdge[] } {
  const dead = new Set(sc.nodes.filter((n) => down.includes(n.id) || (n.zone && down.includes(n.zone))).map((n) => n.id));
  const nodes = sc.nodes.map((n) => ({
    id: n.id,
    label: ABBR[n.kind] ?? n.kind,
    ...place(n),
    state: dead.has(n.id) ? ("dim" as const) : n.goal ? ("current" as const) : n.kind === "user" ? ("frontier" as const) : ("idle" as const),
    tag: dead.has(n.id) ? "down" : short(n.label),
  }));
  const edges = sc.links.map((l) => ({
    a: l.from,
    b: l.to,
    directed: true,
    state: dead.has(l.from) || dead.has(l.to) ? ("dim" as const) : l.flow ? ("active" as const) : l.dashed ? ("dim" as const) : ("idle" as const),
  }));
  return { nodes, edges };
}

const legend = (sc: AwsScene) => [{ label: "On screen", value: sc.nodes.map((n) => `${ABBR[n.kind] ?? n.kind} = ${n.label}`) }];

function convert(l: AwsLesson): Lesson {
  const steps: Step[] = [];
  const first = l.steps[0];
  steps.push({ title: l.title, text: plain(l.imagine), lines: [], ...scene(first.scene), state: legend(first.scene), note: l.tagline });
  for (const s of l.steps) {
    steps.push({ title: s.title, text: plain(s.easy), lines: [], ...scene(s.scene), state: legend(s.scene), note: s.tip ?? s.analogy ? plain(s.tip ?? s.analogy ?? "") : undefined });
    if (s.chaos) {
      const merged: AwsScene = {
        nodes: [...s.scene.nodes, ...(s.chaos.add?.nodes ?? [])],
        links: [...s.scene.links, ...(s.chaos.add?.links ?? [])],
        zones: s.scene.zones,
      };
      steps.push({ title: `Break it: ${s.chaos.label}`, text: plain(s.chaos.result), lines: [], ...scene(merged, s.chaos.down), state: legend(merged) });
    }
  }
  const last = l.steps[l.steps.length - 1];
  steps.push({ title: "What you learned", text: plain(l.recap.join(" ")), lines: [], ...scene(last.scene), state: legend(last.scene) });
  return { slug: l.id, title: l.title, question: l.short, group: l.category, blurb: l.short, problem: l.imagine, code: [], steps, stateTitle: "Legend" };
}

export const AWS_LESSONS: Lesson[] = AWS.map(convert);
