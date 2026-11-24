/**
 * Python / Java / C++ versions of the visualizer programs.
 *
 * The trace always runs the JavaScript. A translation is shown instead of the
 * JS code, and every translated line says which JS line it stands for:
 *
 *   "4|    need = target - nums[i]"   → this line is JS line 4
 *   "4,5|  ..."                       → stands for JS lines 4 and 5
 *   "-|import java.util.*;"           → no JS line (setup / closing brace)
 *
 * So the red "runs next" and green "just ran" arrows land on the matching
 * line in whatever language the learner picked.
 */
import { PRE_DSA_TRANSLATIONS } from "./pre-dsa";
import { EXAMPLE_TRANSLATIONS } from "./examples";
import { LEVEL_1_TRANSLATIONS } from "./level-1";
import { LEVEL_2_TRANSLATIONS } from "./level-2";

export type CodeLang = "js" | "python" | "java" | "cpp";

export const LANGS: { id: CodeLang; label: string }[] = [
  { id: "js", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
];

export type TranslationSet = Partial<Record<Exclude<CodeLang, "js">, string>>;

/** Keyed by problem id, or "example:<id>" for the short examples. */
const ALL: Record<string, TranslationSet> = { ...PRE_DSA_TRANSLATIONS, ...EXAMPLE_TRANSLATIONS, ...LEVEL_1_TRANSLATIONS, ...LEVEL_2_TRANSLATIONS };

export interface MappedCode {
  /** Display text of every line. */
  lines: string[];
  /** JS line → display line numbers (1-based). */
  fromJs: Map<number, number[]>;
}

export function parseTranslation(text: string): MappedCode {
  const lines: string[] = [];
  const fromJs = new Map<number, number[]>();
  text
    .replace(/^\n/, "")
    .replace(/\n\s*$/, "")
    .split("\n")
    .forEach((raw, index) => {
      const bar = raw.indexOf("|");
      const tag = bar >= 0 ? raw.slice(0, bar).trim() : "-";
      lines.push(bar >= 0 ? raw.slice(bar + 1) : raw);
      if (tag === "-" || tag === "") return;
      for (const part of tag.split(",")) {
        const js = Number(part);
        if (!Number.isInteger(js)) continue;
        const list = fromJs.get(js) ?? [];
        list.push(index + 1);
        fromJs.set(js, list);
      }
    });
  return { lines, fromJs };
}

export function translationKey(selection: { kind: string; id?: string }): string | null {
  if (selection.kind === "problem" && selection.id) return selection.id;
  if (selection.kind === "example" && selection.id) return `example:${selection.id}`;
  return null;
}

export function getTranslation(key: string | null, lang: CodeLang): MappedCode | null {
  if (!key || lang === "js") return null;
  const text = ALL[key]?.[lang];
  return text ? parseTranslation(text) : null;
}

export function availableLangs(key: string | null): Set<CodeLang> {
  const set = new Set<CodeLang>(["js"]);
  if (!key) return set;
  for (const lang of ["python", "java", "cpp"] as const) if (ALL[key]?.[lang]) set.add(lang);
  return set;
}

/** Every key that has at least one translation (used by the checker script). */
export function translationKeys(): string[] {
  return Object.keys(ALL);
}
