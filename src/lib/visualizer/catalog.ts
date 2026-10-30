/**
 * Everything the picker can load: the 35 practice problems first, then the
 * short examples. A selection is addressed by kind + id so a problem and an
 * example may share an id (both have "two-sum").
 */
import { DEFAULT_EXAMPLE, EXAMPLES, type Example } from "./examples";
import { PROBLEM_GROUPS, type Problem } from "./problem-types";
import { HASHING_PROBLEMS } from "./problems-hashing";
import { POINTER_PROBLEMS } from "./problems-pointers";

export type CatalogEntry =
  | { kind: "problem"; id: string; label: string; code: string; problem: Problem }
  | { kind: "example"; id: string; label: string; code: string; example: Example };

export type Selection = { kind: "problem" | "example"; id: string } | { kind: "custom" };

export const PROBLEMS: Problem[] = [...HASHING_PROBLEMS, ...POINTER_PROBLEMS].sort((a, b) => a.number - b.number);

export function problemLabel(problem: Problem): string {
  return `${problem.number}. ${problem.title}`;
}

export function problemsInGroup(group: (typeof PROBLEM_GROUPS)[number]): Problem[] {
  return PROBLEMS.filter((problem) => problem.group === group);
}

export function findEntry(selection: Selection): CatalogEntry | null {
  if (selection.kind === "problem") {
    const problem = PROBLEMS.find((item) => item.id === selection.id);
    return problem ? { kind: "problem", id: problem.id, label: problemLabel(problem), code: problem.code, problem } : null;
  }
  if (selection.kind === "example") {
    const example = EXAMPLES.find((item) => item.id === selection.id);
    return example ? { kind: "example", id: example.id, label: example.label, code: example.code, example } : null;
  }
  return null;
}

/** Problem 1 (Two Sum); the bubble-sort example if the problem list is ever empty. */
export const DEFAULT_SELECTION: Selection = PROBLEMS[0]
  ? { kind: "problem", id: PROBLEMS[0].id }
  : { kind: "example", id: DEFAULT_EXAMPLE.id };

export const DEFAULT_ENTRY = findEntry(DEFAULT_SELECTION) as CatalogEntry;

/** Reads `?problem=<id>` or `?example=<id>`. */
export function selectionFromSearch(search: string): Selection | null {
  const params = new URLSearchParams(search);
  const problem = params.get("problem");
  if (problem && findEntry({ kind: "problem", id: problem })) return { kind: "problem", id: problem };
  const example = params.get("example");
  if (example && findEntry({ kind: "example", id: example })) return { kind: "example", id: example };
  return null;
}

/** The current URL with the selection written into the query (other params kept). */
export function urlForSelection(href: string, selection: Selection): string {
  const url = new URL(href);
  url.searchParams.delete("problem");
  url.searchParams.delete("example");
  if (selection.kind !== "custom") url.searchParams.set(selection.kind, selection.id);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function sameSelection(a: Selection, b: Selection): boolean {
  if (a.kind === "custom" || b.kind === "custom") return a.kind === b.kind;
  return a.kind === b.kind && a.id === b.id;
}
