"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { runInWorker, type TraceRun } from "@/lib/visualizer/run-in-worker";
import type { TraceFailure, TraceSuccess } from "@/lib/visualizer/types";

export type RunState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; trace: TraceSuccess }
  | { status: "failed"; failure: TraceFailure };

/** Runs code in the tracer worker; a new run cancels the previous one. */
export function useTraceRunner() {
  const [state, setState] = useState<RunState>({ status: "idle" });
  const current = useRef<TraceRun | null>(null);

  const run = useCallback(async (code: string): Promise<RunState> => {
    current.current?.cancel();
    const handle = runInWorker(code);
    current.current = handle;
    setState({ status: "running" });
    const result = await handle.result;
    if (current.current !== handle) return { status: "idle" }; // superseded
    current.current = null;
    const next: RunState = result.ok ? { status: "done", trace: result } : { status: "failed", failure: result };
    setState(next);
    return next;
  }, []);

  useEffect(() => () => current.current?.cancel(), []);

  return { state, run };
}
