/**
 * Plain, structured-clone-safe trace records produced by the tracer and
 * consumed by the visualizer UI. Nothing in here may hold a live object.
 */

export type PrimKind =
  | "number"
  | "string"
  | "boolean"
  | "undefined"
  | "null"
  | "bigint"
  | "symbol"
  /** A let/const/class binding read in its temporal dead zone. */
  | "uninitialized"
  /** An array hole, e.g. `[1, , 3]`. */
  | "empty"
  /** Something we chose not to walk (heap cap, accessor, global object). */
  | "other";

/** A primitive, already formatted for display (strings keep their quotes). */
export interface PrimValue {
  type: "prim";
  kind: PrimKind;
  value: string;
}

/** A pointer to an entry in the step's heap. */
export interface RefValue {
  type: "ref";
  id: number;
}

export type Value = PrimValue | RefValue;

export interface ArrayObject {
  kind: "array";
  items: Value[];
  /** Number of items left out because of the per-object cap. */
  hidden: number;
}

export interface PlainObject {
  kind: "object";
  /** Constructor name for class instances; undefined for plain objects. */
  className?: string;
  entries: { key: string; value: Value }[];
  hidden: number;
}

export interface FunctionObject {
  kind: "function";
  name: string;
  params: string;
  isArrow: boolean;
  isClass: boolean;
}

export interface MapObject {
  kind: "map";
  entries: { key: Value; value: Value }[];
  hidden: number;
}

export interface SetObject {
  kind: "set";
  items: Value[];
  hidden: number;
}

/** Dates, regexps, errors, promises … shown as a single label. */
export interface OtherObject {
  kind: "other";
  label: string;
}

export type HeapObject =
  | ArrayObject
  | PlainObject
  | FunctionObject
  | MapObject
  | SetObject
  | OtherObject;

export interface VarSnapshot {
  name: string;
  value: Value;
  /** True when the variable belongs to an enclosing function (a closure). */
  closure?: boolean;
}

export interface FrameSnapshot {
  /** Unique per call, so React keys stay stable while a frame is alive. */
  id: number;
  name: string;
  vars: VarSnapshot[];
  /** Present once the frame has produced its return value. */
  returnValue?: Value;
}

export type TraceEvent = "step" | "call" | "return" | "exception" | "end";

/** One comparison evaluated inside an `if` / loop condition. */
export interface Comparison {
  /** Source text of each side, e.g. "arr[j]" and "arr[j + 1]". */
  leftText: string;
  rightText: string;
  op: string;
  /** Short console-style previews of the evaluated sides. */
  left: string;
  right: string;
  result: boolean;
}

/** The outcome of the condition evaluated right after this step. */
export interface ConditionResult {
  /** Source text of the whole condition. */
  text: string;
  result: boolean;
  comparisons: Comparison[];
}

/** The innermost loop running in the current frame at this step. */
export interface LoopState {
  line: number;
  /** Unique per time the loop starts (an inner loop restarts per outer pass). */
  instance: number;
  /** 0 before the first pass, then 1, 2, … */
  iteration: number;
  kind: "for" | "while" | "do-while" | "for-of" | "for-in";
}

export interface TraceStep {
  /** 1-based source line; for "end" the last line that ran. */
  line: number;
  event: TraceEvent;
  /** Global frame first, newest call last. */
  frames: FrameSnapshot[];
  heap: Record<number, HeapObject>;
  /** Everything console.log printed up to and including this step. */
  stdout: string;
  /** Only on "exception" steps. */
  error?: string;
  /** Set when an if/loop condition was evaluated on this line. */
  condition?: ConditionResult;
  loop?: LoopState;
}

export interface TraceSuccess {
  ok: true;
  steps: TraceStep[];
  /** e.g. "Stopped after 1000 steps" — the run was cut short. */
  notice?: string;
}

export interface TraceFailure {
  ok: false;
  kind: "syntax" | "unsupported" | "timeout" | "internal";
  message: string;
  line?: number;
  column?: number;
}

export type TraceResult = TraceSuccess | TraceFailure;
