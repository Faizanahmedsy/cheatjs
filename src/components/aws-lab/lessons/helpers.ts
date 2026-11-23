import type { AwsLesson, AwsLink, AwsNode, AwsScene, AwsStep, NodeKind, StepDef, Tone } from "../types";

export const N = (id: string, kind: NodeKind, label: string, x: number, y: number, extra: Partial<AwsNode> = {}): AwsNode => ({ id, kind, label, x, y, ...extra });

export const L = (from: string, to: string, extra: Partial<AwsLink> = {}): AwsLink => ({ id: `${from}>${to}`, from, to, flow: true, ...extra });

export const tone = (t: Tone) => ({ tone: t });

/** Turns a list of changes into full scenes, one per step. */
export function build(defs: StepDef[]): AwsStep[] {
  let scene: AwsScene = { nodes: [], links: [], zones: [] };
  return defs.map((d) => {
    const removed = new Set(d.remove ?? []);
    const nodes = scene.nodes.filter((n) => !removed.has(n.id)).map((n) => (d.update?.[n.id] ? { ...n, ...d.update[n.id] } : n));
    const links = scene.links.filter((l) => !removed.has(l.id) && !removed.has(l.from) && !removed.has(l.to));
    for (const n of d.add?.nodes ?? []) {
      const at = nodes.findIndex((x) => x.id === n.id);
      if (at >= 0) nodes[at] = n;
      else nodes.push(n);
    }
    for (const l of d.add?.links ?? []) if (!links.some((x) => x.id === l.id)) links.push(l);
    const zones = [...scene.zones.filter((z) => !removed.has(z.id))];
    for (const z of d.add?.zones ?? []) {
      const at = zones.findIndex((x) => x.id === z.id);
      if (at >= 0) zones[at] = z;
      else zones.push(z);
    }
    scene = { nodes, links, zones };
    const { add: _a, remove: _r, update: _u, ...rest } = d;
    void _a; void _r; void _u;
    return { ...rest, scene };
  });
}

export const lesson = (l: Omit<AwsLesson, "steps" | "category"> & { steps: StepDef[]; category?: AwsLesson["category"] }): AwsLesson => ({ category: "Start", ...l, steps: build(l.steps) });

// ---------- compact service lessons ----------

const KINDS: NodeKind[] = ["user", "internet", "server", "lb", "db", "replica", "cache", "bucket", "file", "queue", "topic", "lambda", "cdn", "dns", "gateway", "firewall", "key", "table", "autoscale", "disk", "nat", "role", "policy", "monitor", "box"];
const TONES: Partial<Record<NodeKind, Tone>> = { user: "cyan", internet: "cyan", db: "amber", table: "amber", bucket: "amber", cache: "amber", queue: "amber", topic: "amber", lambda: "violet", lb: "violet", firewall: "green", key: "rose", role: "green", policy: "green", monitor: "green", autoscale: "green", cdn: "green" };

/** "id:kind:Label:sub@col,row" (add * to mark the thing the lesson is about). Grid: col 0-6, row 0-2. */
function parseNodes(spec: string): AwsNode[] {
  return spec.split("|").map((raw) => {
    const t = raw.trim();
    const goal = t.endsWith("*");
    const [body, pos] = t.replace(/\*$/, "").split("@");
    const [id, kind, label, sub] = body.split(":");
    const [c, r] = pos.split(",").map(Number);
    if (!KINDS.includes(kind as NodeKind)) throw new Error(`bad kind ${kind} in ${id}`);
    return { id, kind: kind as NodeKind, label, sub, x: 80 + c * 140, y: 90 + r * 160, goal: goal || undefined, tone: TONES[kind as NodeKind] };
  });
}

/** "a>b:label, b>c" (a leading ~ makes it a dashed, traffic-free line). */
function parseLinks(spec: string): AwsLink[] {
  return spec.split(",").map((raw) => {
    const t = raw.trim();
    const quiet = t.startsWith("~");
    const [pair, label] = t.replace(/^~/, "").split(":");
    const [from, to] = pair.split(">");
    return L(from.trim(), to.trim(), { label, ...(quiet ? { flow: false, dashed: true } : {}) });
  });
}

export type ServiceSpec = {
  id: string;
  num: number;
  title: string;
  short: string;
  category: AwsLesson["category"];
  tagline: string;
  imagine: string;
  /** simple, easy, detail */
  what: [string, string, string];
  nodes: string;
  links: string;
  how: [string, string, string];
  /** simple, easy, tip */
  use: [string, string, string];
  analogy?: string;
  /** button label, ids that stop working, what happened */
  chaos?: [string, string, string];
  quiz: [string, [string, string, string, string], number, string][];
};

export function service(s: ServiceSpec): AwsLesson {
  const nodes = parseNodes(s.nodes);
  const links = parseLinks(s.links);
  const goal = nodes.find((n) => n.goal) ?? nodes[1];
  const first = nodes[0];
  const intro = { nodes: [first, goal], links: [L(first.id, goal.id)], zones: [] };
  const full = { nodes, links, zones: [] };
  return {
    id: s.id,
    num: s.num,
    title: s.title,
    short: s.short,
    category: s.category,
    tagline: s.tagline,
    imagine: s.imagine,
    recap: [`**${s.short}**: ${s.what[0]}`, s.how[0], s.use[0]],
    notes: { label: "Read the matching study notes", href: "/aws-saa-v2" },
    steps: [
      { id: "what", title: `What is ${s.short}?`, simple: s.what[0], easy: s.what[1], detail: s.what[2], analogy: s.analogy, scene: { ...intro, nodes: intro.nodes.map((n) => ({ ...n, x: n === first ? 200 : 700, y: 250 })) } },
      { id: "how", title: "How it works", simple: s.how[0], easy: s.how[1], detail: s.how[2], scene: full },
      { id: "use", title: "When to use it", simple: s.use[0], easy: s.use[1], tip: s.use[2], scene: full, chaos: s.chaos ? { label: s.chaos[0], down: s.chaos[1].split(",").map((x) => x.trim()), result: s.chaos[2] } : undefined },
    ],
    quiz: s.quiz.map(([q, options, correct, explain], i) => ({ id: `${s.id}${i}`, q, options, correct, explain })),
  };
}
