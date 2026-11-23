// Dumps every example / problem program as JSON so build.py can check alignment.
import { EXAMPLES } from "../../src/lib/visualizer/examples";
import { ALL_PROBLEMS } from "../../src/lib/visualizer/catalog";
import { writeFileSync } from "node:fs";
const out: Record<string, string> = {};
for (const e of EXAMPLES) out[`example:${e.id}`] = e.code;
for (const p of ALL_PROBLEMS as { id: string; code: string }[]) out[p.id] = p.code;
writeFileSync(process.argv[2] ?? "/tmp/js-code.json", JSON.stringify(out));
