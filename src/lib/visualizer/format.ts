/** Console-style formatting, close to what a browser console prints. */

const MAX_DEPTH = 2;
const MAX_ITEMS = 30;

function className(value: object): string | undefined {
  const proto: unknown = Object.getPrototypeOf(value);
  if (proto === null || proto === Object.prototype) return undefined;
  const ctor = Object.getOwnPropertyDescriptor(proto as object, "constructor")?.value as unknown;
  return typeof ctor === "function" && ctor.name ? ctor.name : undefined;
}

function list(items: string[], total: number): string {
  const more = total > items.length ? `, … ${total - items.length} more` : "";
  return items.join(", ") + more;
}

function inspect(value: unknown, depth: number, seen: Set<object>): string {
  if (typeof value === "string") return depth === 0 ? value : `'${value}'`;
  if (value === null || typeof value !== "object") {
    if (typeof value === "function") return `ƒ ${value.name || "anonymous"}()`;
    if (typeof value === "bigint") return `${value}n`;
    if (typeof value === "symbol") return value.toString();
    if (typeof value === "number" && Object.is(value, -0)) return "-0";
    return String(value);
  }
  if (seen.has(value)) return "[Circular]";
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof RegExp) return String(value);

  const nested = depth >= MAX_DEPTH;
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      if (nested) return `Array(${value.length})`;
      const items = value.slice(0, MAX_ITEMS).map((item) => inspect(item, depth + 1, seen));
      return `[${list(items, value.length)}]`;
    }
    if (value instanceof Map) {
      if (nested) return `Map(${value.size})`;
      const items = [...value].slice(0, MAX_ITEMS).map(([k, v]) => `${inspect(k, depth + 1, seen)} => ${inspect(v, depth + 1, seen)}`);
      return `Map(${value.size}) {${list(items, value.size)}}`;
    }
    if (value instanceof Set) {
      if (nested) return `Set(${value.size})`;
      const items = [...value].slice(0, MAX_ITEMS).map((item) => inspect(item, depth + 1, seen));
      return `Set(${value.size}) {${list(items, value.size)}}`;
    }
    const name = className(value);
    const prefix = name ? `${name} ` : "";
    if (nested) return `${prefix}{…}`;
    const keys = Object.keys(value);
    const items = keys.slice(0, MAX_ITEMS).map((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      const shown = descriptor && "value" in descriptor ? inspect(descriptor.value, depth + 1, seen) : "[Getter]";
      return `${key}: ${shown}`;
    });
    return `${prefix}{${list(items, keys.length)}}`;
  } finally {
    seen.delete(value);
  }
}

/** Formats `console.log(a, b, …)` arguments into one output line. */
export function formatLogArgs(args: unknown[]): string {
  return args.map((arg) => inspect(arg, 0, new Set())).join(" ");
}

/** A short one-line preview, strings quoted — used in step explanations. */
export function preview(value: unknown, maxLength = 40): string {
  const text = typeof value === "string" ? JSON.stringify(value) : inspect(value, 1, new Set());
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}
