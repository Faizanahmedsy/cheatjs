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

export const lesson = (l: Omit<AwsLesson, "steps"> & { steps: StepDef[] }): AwsLesson => ({ ...l, steps: build(l.steps) });
