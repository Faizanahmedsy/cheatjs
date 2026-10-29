import { parse, type AnyNode, type Program } from "acorn";
import { full } from "acorn-walk";
import type { TraceFailure } from "./types";

/** Every identifier the instrumenter injects starts with this. */
export const RESERVED_PREFIX = "__viz";

export type ParseOutcome = { ok: true; ast: Program } | TraceFailure;

interface AcornSyntaxError extends SyntaxError {
  loc?: { line: number; column: number };
}

function isAcornError(error: unknown): error is AcornSyntaxError {
  return error instanceof SyntaxError;
}

/** Strips acorn's trailing " (3:4)" position — we show the line separately. */
function cleanMessage(message: string): string {
  return message.replace(/\s*\(\d+:\d+\)$/, "");
}

function unsupported(message: string, node: AnyNode): TraceFailure {
  return {
    ok: false,
    kind: "unsupported",
    message,
    line: node.loc?.start.line,
    column: node.loc ? node.loc.start.column + 1 : undefined,
  };
}

/** Finds the first construct the step-by-step tracer cannot follow. */
function findUnsupported(ast: Program): TraceFailure | null {
  let found: TraceFailure | null = null;
  full(ast, (node) => {
    if (found) return;
    switch (node.type) {
      case "AwaitExpression":
        found = unsupported("await / async code is not supported in the visualizer — it only follows synchronous code.", node);
        return;
      case "YieldExpression":
        found = unsupported("Generators (yield) are not supported in the visualizer.", node);
        return;
      case "ImportExpression":
      case "ImportDeclaration":
      case "ExportNamedDeclaration":
      case "ExportDefaultDeclaration":
      case "ExportAllDeclaration":
        found = unsupported("import / export is not supported — paste everything into one script.", node);
        return;
      case "WithStatement":
        found = unsupported("`with` statements are not supported.", node);
        return;
      case "ForOfStatement":
        if (node.await) {
          found = unsupported("`for await` is not supported — the visualizer only follows synchronous code.", node);
        }
        return;
      case "FunctionDeclaration":
      case "FunctionExpression":
      case "ArrowFunctionExpression":
        if (node.async) {
          found = unsupported("async functions are not supported — the visualizer only follows synchronous code.", node);
        } else if (node.generator) {
          found = unsupported("Generator functions (function*) are not supported in the visualizer.", node);
        }
        return;
      case "Identifier":
        if (node.name.startsWith(RESERVED_PREFIX)) {
          found = unsupported(`Names starting with "${RESERVED_PREFIX}" are reserved by the visualizer — please rename it.`, node);
        }
        return;
      default:
        return;
    }
  });
  return found;
}

/** Parses a script and rejects what the tracer cannot follow, with a friendly message. */
export function parseProgram(code: string): ParseOutcome {
  let ast: Program;
  try {
    ast = parse(code, {
      ecmaVersion: "latest",
      sourceType: "script",
      locations: true,
      // Parse top-level await so we can explain it instead of "Unexpected token".
      allowAwaitOutsideFunction: true,
    });
  } catch (error) {
    if (!isAcornError(error)) throw error;
    const message = cleanMessage(error.message);
    if (message.includes("sourceType: module")) {
      return {
        ok: false,
        kind: "unsupported",
        message: "import / export is not supported — paste everything into one script.",
        line: error.loc?.line,
      };
    }
    return {
      ok: false,
      kind: "syntax",
      message: `SyntaxError: ${message}`,
      line: error.loc?.line,
      column: error.loc ? error.loc.column + 1 : undefined,
    };
  }
  return findUnsupported(ast) ?? { ok: true, ast };
}
