import { formatLogArgs, preview } from "./format";
import { instrument } from "./instrument";
import { DEFAULT_MAX_STEPS } from "./limits";
import { parseProgram } from "./parse";
import { HeapSerializer, UNINITIALIZED } from "./serialize";
import type { Comparison, FrameSnapshot, LoopState, TraceEvent, TraceResult, TraceStep, VarSnapshot } from "./types";

const MAX_STDOUT = 50_000;

/** What the instrumented code passes as a scope reader (see instrument.ts). */
interface Reader {
  n: string[];
  c: number;
  g: (index: number) => unknown;
}

interface Frame {
  id: number;
  name: string;
  endLine: number;
  reader: Reader;
  returned: boolean;
  failed: boolean;
  returnValue?: unknown;
  loops: LoopState[];
}

/** Thrown to unwind the program once the step limit is hit. User catch blocks re-throw it. */
class StopSignal {
  constructor(readonly reason: string) {}
}

const EMPTY_READER: Reader = { n: [], c: 0, g: () => undefined };

function errorText(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return `Uncaught ${preview(error, 80)}`;
}

/** Collects trace steps while the instrumented program runs. */
export class Tracer {
  readonly steps: TraceStep[] = [];
  private readonly stack: Frame[];
  private readonly serializer = new HeapSerializer();
  private stdout = "";
  private nextFrameId = 1;
  private nextLoopInstance = 1;
  private lastLine = 0;
  private snapshotting = false;
  private stopped: StopSignal | null = null;
  private finished = false;
  private readonly reportedErrors = new WeakSet<object>();
  private reportedPrimitiveError = false;

  constructor(private readonly maxSteps = DEFAULT_MAX_STEPS) {
    this.stack = [this.newFrame("Global frame", 0, EMPTY_READER)];
  }

  private newFrame(name: string, endLine: number, reader: Reader): Frame {
    return { id: this.nextFrameId++, name, endLine, reader, returned: false, failed: false, loops: [] };
  }

  private get top(): Frame {
    return this.stack[this.stack.length - 1];
  }

  // ---- API called by instrumented code (bound as `__viz`)

  readonly api = {
    step: (line: number, reader: Reader): number => {
      this.top.reader = reader;
      return this.record("step", line);
    },
    test: (stepIndex: number, value: unknown, text: string): unknown => {
      const step = this.steps[stepIndex];
      if (step) {
        step.condition = { text, result: Boolean(value), comparisons: step.condition?.comparisons ?? [] };
      }
      return value;
    },
    cmp: (stepIndex: number, left: unknown, right: unknown, op: string, leftText: string, rightText: string): boolean => {
      const result = compare(left, right, op);
      const step = this.steps[stepIndex];
      if (step) {
        const comparison: Comparison = { leftText, rightText, op, left: preview(left), right: preview(right), result };
        step.condition ??= { text: "", result: false, comparisons: [] };
        step.condition.comparisons.push(comparison);
      }
      return result;
    },
    enter: (name: string, line: number, endLine: number, reader: Reader): Frame => {
      const frame = this.newFrame(name, endLine, reader);
      this.stack.push(frame);
      this.record("call", line);
      return frame;
    },
    ret: (frame: Frame, line: number, value: unknown): unknown => {
      frame.returned = true;
      frame.returnValue = value;
      this.record("return", line);
      return value;
    },
    fail: (frame: Frame, error: unknown): void => {
      if (error instanceof StopSignal) return;
      frame.failed = true;
      this.reportException(error);
    },
    exit: (frame: Frame): void => {
      try {
        if (!frame.returned && !frame.failed && !this.stopped) {
          frame.returned = true;
          frame.returnValue = undefined;
          this.record("return", frame.endLine);
        }
      } finally {
        const index = this.stack.lastIndexOf(frame);
        if (index > 0) this.stack.length = index;
      }
    },
    loopEnter: (line: number, kind: LoopState["kind"]): void => {
      this.top.loops.push({ line, kind, iteration: 0, instance: this.nextLoopInstance++ });
    },
    loopExit: (): void => {
      this.top.loops.pop();
    },
    iter: (line: number): void => {
      const loop = this.top.loops[this.top.loops.length - 1];
      if (loop && loop.line === line) loop.iteration += 1;
    },
    guard: (error: unknown): void => {
      if (error instanceof StopSignal) throw error;
    },
  };

  readonly console = {
    log: (...args: unknown[]): void => this.print(args),
    info: (...args: unknown[]): void => this.print(args),
    warn: (...args: unknown[]): void => this.print(args),
    error: (...args: unknown[]): void => this.print(args),
    debug: (...args: unknown[]): void => this.print(args),
    table: (...args: unknown[]): void => this.print(args),
  };

  private print(args: unknown[]): void {
    if (this.stdout.length >= MAX_STDOUT) return;
    this.stdout += `${formatLogArgs(args)}\n`;
  }

  // ---- recording

  private record(event: TraceEvent, line: number, error?: string): number {
    if (this.finished || this.snapshotting) return -1;
    if (this.stopped) throw this.stopped;
    if (this.steps.length >= this.maxSteps) {
      this.stopped = new StopSignal(`Stopped after ${this.maxSteps} steps — the visualizer caps long runs. Try smaller input.`);
      throw this.stopped;
    }
    if (line > 0) this.lastLine = line;
    this.snapshotting = true;
    try {
      const snapshot = this.serializer.begin();
      const frames: FrameSnapshot[] = this.stack.map((frame) => {
        const vars: VarSnapshot[] = frame.reader.n.map((name, index) => {
          let value;
          try {
            value = snapshot.encode(frame.reader.g(index));
          } catch {
            value = UNINITIALIZED;
          }
          return index >= frame.reader.c ? { name, value, closure: true } : { name, value };
        });
        const out: FrameSnapshot = { id: frame.id, name: frame.name, vars };
        if (frame.returned) out.returnValue = snapshot.encode(frame.returnValue);
        return out;
      });
      const loop = this.top.loops[this.top.loops.length - 1];
      const step: TraceStep = {
        line: line > 0 ? line : this.lastLine,
        event,
        frames,
        heap: snapshot.finish(),
        stdout: this.stdout,
      };
      if (loop) step.loop = { ...loop };
      if (error) step.error = error;
      this.steps.push(step);
      return this.steps.length - 1;
    } finally {
      this.snapshotting = false;
    }
  }

  private alreadyReported(error: unknown): boolean {
    if (typeof error === "object" && error !== null) {
      if (this.reportedErrors.has(error)) return true;
      this.reportedErrors.add(error);
      return false;
    }
    // Thrown primitives can't be tracked by identity; report the first one.
    if (this.reportedPrimitiveError) return true;
    this.reportedPrimitiveError = true;
    return false;
  }

  private reportException(error: unknown): void {
    if (this.alreadyReported(error)) return;
    try {
      this.record("exception", this.lastLine, errorText(error));
    } catch {
      // Hitting the step limit while reporting: the stop notice covers it.
    }
  }

  /** Runs the instrumented program to completion and returns the trace. */
  execute(run: () => void): TraceResult {
    let notice: string | undefined;
    try {
      run();
      this.stack.length = 1;
      this.record("end", 0);
    } catch (error) {
      if (error instanceof StopSignal) {
        notice = error.reason;
      } else {
        this.stack.length = 1;
        this.reportException(error);
      }
    }
    this.finished = true;
    return { ok: true, steps: this.steps, notice };
  }
}

function compare(left: unknown, right: unknown, op: string): boolean {
  // Mirrors the JS operators exactly; the operands were already evaluated in order.
  const l = left as number;
  const r = right as number;
  switch (op) {
    case "<":
      return l < r;
    case "<=":
      return l <= r;
    case ">":
      return l > r;
    case ">=":
      return l >= r;
    case "==":
      return left == right;
    case "!=":
      return left != right;
    case "===":
      return left === right;
    case "!==":
      return left !== right;
    default:
      throw new Error(`Unknown comparison ${op}`);
  }
}

function unsupportedGlobal(name: string): () => never {
  return () => {
    throw new Error(`${name} is not supported in the visualizer — it only follows synchronous code.`);
  };
}

/** Parse → instrument → run, all synchronously. Meant to run inside the worker. */
export function traceProgram(code: string, maxSteps = DEFAULT_MAX_STEPS): TraceResult {
  const parsed = parseProgram(code);
  if (!parsed.ok) return parsed;

  let source: string;
  try {
    source = instrument(parsed.ast, code);
  } catch (error) {
    return { ok: false, kind: "internal", message: `Could not prepare this code: ${errorText(error)}` };
  }

  const tracer = new Tracer(maxSteps);
  const shadowed = ["setTimeout", "setInterval", "queueMicrotask", "requestAnimationFrame", "fetch", "importScripts"];
  let program: (...args: unknown[]) => void;
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- running user code is the point; it is isolated in a worker.
    program = new Function("__viz", "console", ...shadowed, source) as (...args: unknown[]) => void;
  } catch (error) {
    return { ok: false, kind: "internal", message: `Could not prepare this code: ${errorText(error)}` };
  }
  return tracer.execute(() => program(tracer.api, tracer.console, ...shadowed.map(unsupportedGlobal)));
}
