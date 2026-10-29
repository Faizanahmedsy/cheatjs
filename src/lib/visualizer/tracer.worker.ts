/**
 * Runs user code off the main thread. The page terminates this worker on a
 * timeout, so an infinite loop can never freeze the tab.
 */
import { traceProgram } from "./runtime";
import type { TraceResult } from "./types";

export interface TraceRequest {
  code: string;
  maxSteps: number;
}

// Typed locally: the DOM and WebWorker libs can't both be in the project's tsconfig.
const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<TraceRequest>) => void) | null;
  postMessage: (message: TraceResult) => void;
};

workerScope.onmessage = (event) => {
  let result: TraceResult;
  try {
    result = traceProgram(event.data.code, event.data.maxSteps);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    result = { ok: false, kind: "internal", message: `The visualizer hit an internal error: ${message}` };
  }
  workerScope.postMessage(result);
};
