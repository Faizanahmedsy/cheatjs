import type { FunctionObject, HeapObject, PrimValue, Value } from "./types";

export interface SerializerLimits {
  /** Objects walked per snapshot. */
  maxObjects: number;
  /** Items / keys shown per object. */
  maxEntries: number;
}

const DEFAULT_LIMITS: SerializerLimits = { maxObjects: 150, maxEntries: 60 };
const MAX_STRING = 80;

function prim(kind: PrimValue["kind"], value: string): PrimValue {
  return { type: "prim", kind, value };
}

/** Encodes a primitive, or returns null for objects and functions. */
export function encodePrimitive(value: unknown): PrimValue | null {
  switch (typeof value) {
    case "undefined":
      return prim("undefined", "undefined");
    case "number":
      return prim("number", Object.is(value, -0) ? "-0" : String(value));
    case "boolean":
      return prim("boolean", String(value));
    case "bigint":
      return prim("bigint", `${value}n`);
    case "symbol":
      return prim("symbol", value.toString());
    case "string": {
      const text = JSON.stringify(value);
      return prim("string", text.length > MAX_STRING ? `${text.slice(0, MAX_STRING - 2)}…"` : text);
    }
    default:
      return value === null ? prim("null", "null") : null;
  }
}

export const UNINITIALIZED: PrimValue = prim("uninitialized", "uninitialized");

/** Reads `name(params)` out of a function's source text. */
export function describeFunction(fn: (...args: never[]) => unknown): FunctionObject {
  const name = fn.name || "anonymous";
  let source = "";
  try {
    source = Function.prototype.toString.call(fn);
  } catch {
    // Some exotic functions refuse toString — fall back to the name.
  }
  const isClass = /^class[\s{]/.test(source);
  const braceAt = source.indexOf("{");
  const header = braceAt === -1 ? source : source.slice(0, braceAt);
  const arrowAt = header.indexOf("=>");
  const isArrow = !isClass && arrowAt !== -1;
  let params = "";
  if (isArrow) {
    params = header.slice(0, arrowAt).trim().replace(/^\(|\)$/g, "");
  } else if (!isClass) {
    const open = header.indexOf("(");
    const close = header.lastIndexOf(")");
    params = open !== -1 && close > open ? header.slice(open + 1, close) : "";
  }
  return { kind: "function", name, params: params.trim(), isArrow, isClass };
}

function instanceClassName(value: object): string | undefined {
  const proto: unknown = Object.getPrototypeOf(value);
  if (proto === null || proto === Object.prototype) return undefined;
  const ctor = Object.getOwnPropertyDescriptor(proto as object, "constructor")?.value as unknown;
  return typeof ctor === "function" ? ctor.name || "anonymous" : "Object";
}

/**
 * Turns live values into serialisable `Value`s plus a heap of reachable
 * objects. Ids come from a WeakMap that lives as long as the serializer, so an
 * object keeps the same id on every step (arrows stay put between steps).
 */
export class HeapSerializer {
  private readonly ids = new WeakMap<object, number>();
  private nextId = 1;
  private readonly limits: SerializerLimits;

  constructor(limits: Partial<SerializerLimits> = {}) {
    this.limits = { ...DEFAULT_LIMITS, ...limits };
  }

  private idOf(value: object): number {
    let id = this.ids.get(value);
    if (id === undefined) {
      id = this.nextId++;
      this.ids.set(value, id);
    }
    return id;
  }

  /** Starts one snapshot: encode roots, then `finish()` to walk the heap. */
  begin(): HeapSnapshot {
    return new HeapSnapshot(this.limits, (value) => this.idOf(value));
  }
}

export class HeapSnapshot {
  private readonly heap: Record<number, HeapObject> = {};
  private readonly queued = new Map<number, object>();
  private readonly queue: object[] = [];

  constructor(
    private readonly limits: SerializerLimits,
    private readonly idOf: (value: object) => number,
  ) {}

  encode(value: unknown): Value {
    const primitive = encodePrimitive(value);
    if (primitive) return primitive;
    const object = value as object;
    if (object === globalThis) return prim("other", "globalThis");
    const id = this.idOf(object);
    if (!this.queued.has(id)) {
      if (this.queued.size >= this.limits.maxObjects) return prim("other", "…");
      this.queued.set(id, object);
      this.queue.push(object);
    }
    return { type: "ref", id };
  }

  finish(): Record<number, HeapObject> {
    for (let index = 0; index < this.queue.length; index++) {
      const object = this.queue[index];
      this.heap[this.idOf(object)] = this.describe(object);
    }
    return this.heap;
  }

  private describe(value: object): HeapObject {
    const max = this.limits.maxEntries;
    if (typeof value === "function") return describeFunction(value as (...args: never[]) => unknown);
    if (Array.isArray(value)) {
      const items: Value[] = [];
      const shown = Math.min(value.length, max);
      for (let i = 0; i < shown; i++) {
        const descriptor = Object.getOwnPropertyDescriptor(value, i);
        if (!descriptor) items.push(prim("empty", "empty"));
        else items.push("value" in descriptor ? this.encode(descriptor.value) : prim("other", "[getter]"));
      }
      return { kind: "array", items, hidden: value.length - shown };
    }
    if (value instanceof Map) {
      const entries: { key: Value; value: Value }[] = [];
      for (const [key, item] of Map.prototype.entries.call(value)) {
        if (entries.length >= max) break;
        entries.push({ key: this.encode(key), value: this.encode(item) });
      }
      return { kind: "map", entries, hidden: value.size - entries.length };
    }
    if (value instanceof Set) {
      const items: Value[] = [];
      for (const item of Set.prototype.values.call(value)) {
        if (items.length >= max) break;
        items.push(this.encode(item));
      }
      return { kind: "set", items, hidden: value.size - items.length };
    }
    if (value instanceof Error) return { kind: "other", label: `${value.name}: ${value.message}` };
    if (value instanceof Date) return { kind: "other", label: `Date ${Number.isNaN(value.getTime()) ? "Invalid Date" : value.toISOString()}` };
    if (value instanceof RegExp) return { kind: "other", label: String(value) };
    if (value instanceof Promise) return { kind: "other", label: "Promise" };
    if (value instanceof WeakMap || value instanceof WeakSet) return { kind: "other", label: instanceClassName(value) ?? "Weak collection" };
    if (ArrayBuffer.isView(value)) return { kind: "other", label: instanceClassName(value) ?? "TypedArray" };

    const keys = Object.keys(value);
    const entries = keys.slice(0, max).map((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return {
        key,
        value: descriptor && "value" in descriptor ? this.encode(descriptor.value) : prim("other", "[getter]"),
      };
    });
    return { kind: "object", className: instanceClassName(value), entries, hidden: keys.length - entries.length };
  }
}
