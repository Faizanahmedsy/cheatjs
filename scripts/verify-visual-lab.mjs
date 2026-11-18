#!/usr/bin/env node
/**
 * Checks the AI Visual Lab topic files without a build.
 *
 *   node scripts/verify-visual-lab.mjs              # every topic
 *   node scripts/verify-visual-lab.mjs rag embeddings
 *   node scripts/verify-visual-lab.mjs neural-networks --text   # also print each step's words
 *
 * Copies the scenario files and the engine's plain modules to a temp folder,
 * adds the `.ts` extensions Node needs, imports each topic with Node's type
 * stripping and checks: ids, links, glossary keys, NaN/Infinity, quiz answers,
 * object spacing, that every step has `simple` + `stage`, the topic's
 * imagine/recap/plain, and the shape of each stage. Exit code 1 on any error.
 */
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lab = join(root, "src/components/ai-lab");
const tmp = mkdtempSync(join(tmpdir(), "ai-lab-verify-"));

const addExt = (src) => src.replace(/(from\s+["'])(\.{1,2}\/[^"']+?)(["'])/g, (m, a, p, b) => (p.endsWith(".ts") ? m : `${a}${p}.ts${b}`));
for (const dir of ["engine", "scenarios"]) {
  cpSync(join(lab, dir), join(tmp, dir), { recursive: true, filter: (s) => !s.endsWith(".tsx") });
  for (const f of readdirSync(join(tmp, dir))) if (f.endsWith(".ts")) writeFileSync(join(tmp, dir, f), addExt(readFileSync(join(tmp, dir, f), "utf8")));
}
writeFileSync(join(tmp, "package.json"), '{"type":"module"}');

const { GLOSSARY } = await import(pathToFileURL(join(tmp, "engine/glossary.ts")).href);
const { SCENARIOS } = await import(pathToFileURL(join(tmp, "scenarios/index.ts")).href);

const showText = process.argv.includes("--text");
const want = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const metas = want.length ? SCENARIOS.filter((m) => want.includes(m.id)) : SCENARIOS;
if (want.length && metas.length !== want.length) console.error(`unknown topic id in: ${want.join(", ")}`);

let errors = 0;
let warnings = 0;
const STAGES = new Set(["neuron", "network", "tokens", "fit", "descent", "map", "cards", "chat", "viz"]);
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

for (const meta of metas) {
  const s = (await import(pathToFileURL(join(tmp, "scenarios", `${meta.id}.ts`)).href)).default;
  const err = (m) => (errors++, console.log(`  ✗ ${m}`));
  const warn = (m) => (warnings++, console.log(`  ! ${m}`));
  console.log(`\n${meta.id} — ${s.steps.length} steps, ${s.interview.length} questions, ${s.quiz.length} quiz`);
  if (s.id !== meta.id) err(`id "${s.id}" does not match the index entry "${meta.id}"`);
  if (showText) {
    console.log(`  IMAGINE: ${s.imagine}\n  PLAIN: ${s.overview.plain}\n  RECAP: ${(s.recap ?? []).join(" / ")}`);
    s.steps.forEach((st, i) => console.log(`  ${i + 1}. ${st.title} [${st.stage?.kind ?? "-"}${st.stage?.mode ? `:${st.stage.mode}` : ""}]\n     SIMPLE: ${st.simple}\n     EXPLAIN: ${st.explain}`));
  }

  // NaN / Infinity anywhere, numbers or text (interview answers may talk about NaN losses, so they are skipped)
  const walk = (v, path) => {
    if (path.endsWith(".interview") || path.endsWith(".interviewTip")) return;
    if (typeof v === "number" && !Number.isFinite(v)) err(`${path} is ${v}`);
    else if (typeof v === "string" && /\bNaN\b|\bInfinity\b|\bundefined\b/.test(v)) err(`${path} contains "${v.match(/\bNaN\b|\bInfinity\b|\bundefined\b/)[0]}": ${v.slice(0, 80)}`);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (typeof x !== "function") walk(x, `${path}.${k}`);
  };
  walk(s, s.id);

  // glossary keys in every string
  const gloss = (v, path) => {
    if (typeof v === "string") for (const m of v.matchAll(/\{\{([^}|]+)(\|[^}]*)?\}\}/g)) if (!GLOSSARY[m[1].trim()]) err(`${path}: unknown glossary key {{${m[1]}}}`);
    if (Array.isArray(v)) v.forEach((x, i) => gloss(x, `${path}[${i}]`));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) gloss(x, `${path}.${k}`);
  };
  gloss(s, s.id);

  // unique ids
  const uniq = (list, what) => {
    const seen = new Set();
    for (const x of list) {
      if (seen.has(x.id)) err(`duplicate ${what} id "${x.id}"`);
      seen.add(x.id);
    }
  };
  uniq(s.objects, "object");
  uniq(s.links, "link");
  uniq(s.steps, "step");
  uniq(s.interview, "interview");
  uniq(s.quiz, "quiz");

  // scene references and spacing
  const ids = new Set(s.objects.map((o) => o.id));
  for (const l of s.links) for (const end of [l.from, l.to]) if (!ids.has(end)) err(`link ${l.id} points at missing object "${end}"`);
  for (let i = 0; i < s.objects.length; i++)
    for (let j = i + 1; j < s.objects.length; j++) {
      const [a, b] = [s.objects[i], s.objects[j]];
      if (Math.abs(a.at[0] - b.at[0]) < 2 && Math.abs(a.at[1] - b.at[1]) < 3) err(`objects "${a.id}" and "${b.id}" are too close (${a.at} vs ${b.at})`);
    }

  // topic-level simple-mode fields
  if (!s.imagine) err("no imagine");
  else if (!/^Imagine/.test(s.imagine)) warn(`imagine should start with "Imagine": ${s.imagine.slice(0, 40)}`);
  if (!s.recap || s.recap.length !== 3) err("recap must have exactly 3 bullets");
  if (!s.overview.plain) err("no overview.plain");

  const cols = new Set(s.logColumns.map((c) => c.key));
  s.steps.forEach((st, si) => {
    const at = `step ${si + 1} "${st.id}"`;
    if (!st.simple) err(`${at}: no simple`);
    else if (words(st.simple) > 22) warn(`${at}: simple has ${words(st.simple)} words (aim for ≤ 20)`);
    if (!st.stage) err(`${at}: no stage`);
    else if (!STAGES.has(st.stage.kind)) err(`${at}: unknown stage kind "${st.stage.kind}"`);
    if (words(st.explain) > 90) warn(`${at}: explain has ${words(st.explain)} words (keep it to 2–3 short sentences)`);
    for (const h of st.highlight ?? []) if (!ids.has(h)) err(`${at}: highlight "${h}" is not an object`);
    for (const p of st.packets ?? []) for (const end of [p.from, p.to]) if (!ids.has(end)) err(`${at}: packet "${p.label}" uses missing object "${end}"`);
    for (const r of st.log ?? []) for (const k of Object.keys(r.cells)) if (!cols.has(k)) err(`${at}: log cell "${k}" is not a log column`);
    const vs = st.viz ? (Array.isArray(st.viz) ? st.viz : [st.viz]) : [];
    for (const v of vs) if (v.only && v.only !== "simple" && v.only !== "interview") err(`${at}: viz.only "${v.only}"`);

    const g = st.stage;
    if (!g) return;
    const bad = (m) => err(`${at} (${g.kind}): ${m}`);
    switch (g.kind) {
      case "neuron":
        if (g.inputs.length !== g.weights.length) bad("inputs and weights differ in length");
        break;
      case "network":
        if (g.weights.length !== g.layers.length - 1) bad("weights must have layers − 1 matrices");
        g.weights.forEach((m, l) => {
          if (m.length !== g.layers[l].nodes.length || m.some((row) => row.length !== g.layers[l + 1].nodes.length)) bad(`weights[${l}] shape does not match the layers`);
        });
        if (g.mode === "update" && !g.newWeights) bad("update mode needs newWeights");
        if (g.blame && g.blame.some((b, l) => b.length && b.length !== g.layers[l].nodes.length)) bad("blame shape does not match the layers (use [] for a layer with no blame)");
        break;
      case "tokens":
        if (g.ids && g.ids.length !== g.tokens.length) bad("ids length ≠ tokens");
        if (g.vectors && g.vectors.length !== g.tokens.length) bad("vectors length ≠ tokens");
        if (g.attention && (g.attention.length !== g.tokens.length || g.attention.some((r) => r.length !== g.tokens.length))) bad("attention must be tokens × tokens");
        if (g.attention) g.attention.forEach((r, i) => Math.abs(r.reduce((a, b) => a + b, 0) - 1) > 0.02 && bad(`attention row ${i} sums to ${r.reduce((a, b) => a + b, 0).toFixed(3)}, not 1`));
        if (g.mode === "attention" && !g.attention) bad("attention mode needs attention");
        if ((g.mode === "next" || g.mode === "generate") && g.chosen !== undefined && !g.candidates?.[g.chosen]) bad("chosen is not a candidate");
        break;
      case "fit":
        if (!g.points.length) bad("no points");
        if (g.mode === "train" && (!g.lines?.length || (g.losses && g.losses.length !== g.lines.length))) bad("train needs lines, and losses of the same length");
        if (g.mode === "fits" && !g.curves?.length) bad("fits mode needs curves");
        if (g.callout && !g.points[g.callout.index]) bad("callout index out of range");
        break;
      case "descent":
        if (g.curve.length < 3) bad("curve needs points");
        if (!g.steps.length) bad("no steps");
        break;
      case "map":
        for (const n of g.neighbours ?? []) if (!g.points[n]) bad(`neighbour ${n} out of range`);
        for (const p of g.pairs ?? []) if (!g.points[p.a] || !g.points[p.b]) bad("pair index out of range");
        if (g.mode === "angle" && !g.pairs?.length) bad("angle mode needs pairs");
        break;
      case "cards": {
        const seen = new Set();
        for (const z of g.zones)
          for (const c of z.cards ?? []) {
            if (seen.has(c.id)) bad(`card id "${c.id}" appears twice in one step`);
            seen.add(c.id);
          }
        break;
      }
      case "chat":
        if (!g.messages.length) bad("no messages");
        break;
      case "viz":
        if (!g.viz || (Array.isArray(g.viz) && !g.viz.length)) bad("no viz");
        break;
    }
  });

  for (const q of s.quiz) {
    if (!(q.correct >= 0 && q.correct < q.options.length)) err(`quiz ${q.id}: correct index ${q.correct} out of range`);
    if (new Set(q.options).size !== q.options.length) err(`quiz ${q.id}: duplicate options ${JSON.stringify(q.options)}`);
  }
}

rmSync(tmp, { recursive: true, force: true });
console.log(`\n${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
