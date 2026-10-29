import { cn } from "@/lib/utils";
import type { HeapObject, Value } from "@/lib/visualizer/types";

/** Functions referenced only from variables are shown inline, not as heap boxes. */
export function functionLabel(object: HeapObject): string | null {
  if (object.kind !== "function") return null;
  if (object.isClass) return `class ${object.name}`;
  if (object.isArrow) return `${object.name} = (${object.params}) =>`;
  return `ƒ ${object.name}(${object.params})`;
}

interface ValueViewProps {
  value: Value;
  heap: Record<number, HeapObject>;
  /** Heap ids drawn as boxes; refs to anything else render inline. */
  boxed: Set<number>;
  className?: string;
}

/** A primitive as text, or a reference as a dot that the arrow layer connects to its object. */
export function ValueView({ value, heap, boxed, className }: ValueViewProps) {
  if (value.type === "prim") {
    const muted = value.kind === "uninitialized" || value.kind === "empty" || value.kind === "other";
    return (
      <span className={cn("font-code", muted ? "italic text-slate-500" : "text-slate-100", className)}>
        {value.value}
      </span>
    );
  }
  const object = heap[value.id];
  const inline = object ? functionLabel(object) : null;
  if (inline && !boxed.has(value.id)) {
    return <span className={cn("font-code text-slate-300", className)}>{inline}</span>;
  }
  if (!boxed.has(value.id)) {
    return <span className={cn("font-code italic text-slate-500", className)}>object #{value.id}</span>;
  }
  return (
    <span className={cn("inline-flex items-center", className)}>
      <span
        data-viz-ref={value.id}
        aria-hidden="true"
        className="inline-block h-3 w-3 rounded-full bg-slate-200 ring-2 ring-slate-900"
      />
      <span className="sr-only">→ object #{value.id}</span>
    </span>
  );
}

/** The previous value, struck through, shown for one step next to a changed value. */
export function OldValue({ text, className }: { text: string; className?: string }) {
  return (
    <s className={cn("font-code text-sm text-slate-500 decoration-slate-500", className)}>
      <span className="sr-only">was </span>
      {text}
    </s>
  );
}
