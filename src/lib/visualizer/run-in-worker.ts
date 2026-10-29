import { DEFAULT_MAX_STEPS, RUN_TIMEOUT_MS } from "./limits";
import type { TraceRequest } from "./tracer.worker";
import type { TraceResult } from "./types";

export interface TraceRun {
  result: Promise<TraceResult>;
  cancel: () => void;
}

/** Traces code in a fresh worker, killing it after `timeoutMs`. Browser only. */
export function runInWorker(code: string, timeoutMs = RUN_TIMEOUT_MS, maxSteps = DEFAULT_MAX_STEPS): TraceRun {
  const worker = new Worker(new URL("./tracer.worker.ts", import.meta.url), { type: "module" });
  let settle: (result: TraceResult) => void = () => undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const result = new Promise<TraceResult>((resolve) => {
    let done = false;
    settle = (value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      worker.terminate();
      resolve(value);
    };
  });

  timer = setTimeout(() => {
    settle({
      ok: false,
      kind: "timeout",
      message: `Stopped after ${timeoutMs / 1000} seconds — the code ran too long (an infinite loop, or a very large input?).`,
    });
  }, timeoutMs);

  worker.onmessage = (event: MessageEvent<TraceResult>) => settle(event.data);
  worker.onerror = (event) => {
    event.preventDefault();
    settle({ ok: false, kind: "internal", message: `The visualizer worker failed: ${event.message || "unknown error"}` });
  };

  const request: TraceRequest = { code, maxSteps };
  worker.postMessage(request);

  return {
    result,
    cancel: () => settle({ ok: false, kind: "internal", message: "Cancelled." }),
  };
}
