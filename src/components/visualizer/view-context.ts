import { previewValue, type Pointer, type StepChanges } from "@/lib/visualizer/analysis";
import type { StringVar } from "@/lib/visualizer/cells";
import type { TraceStep, Value } from "@/lib/visualizer/types";

/** Everything the state panel's pieces need to draw one step. */
export interface StepView {
  step: TraceStep;
  prevStep?: TraceStep;
  stepIndex: number;
  changes: StepChanges;
  /** Heap ids drawn as boxes. */
  boxed: Set<number>;
  /** Index pointers of the current frame. */
  pointers: Pointer[];
  /** Arrays the current frame refers to — pointers are drawn under these. */
  pointed: Set<number>;
  names: Map<number, string>;
  prevNames: Map<number, string>;
  /** Short string variables of the current frame, drawn as character cells. */
  strings: StringVar[];
  /** Beginner mode: bigger text, fewer panels, explained terms. */
  beginner: boolean;
}

/** Text for a value as it was on the previous step. */
export function oldText(view: StepView, value: Value | null | undefined): string | null {
  if (!value || !view.prevStep) return null;
  return previewValue(value, view.prevStep, view.prevNames, 1);
}

/** Changed elements get a key per step so the flash animation restarts. */
export function flashKey(changed: boolean, stepIndex: number, base: string | number): string {
  return changed ? `${base}-changed-${stepIndex}` : `${base}`;
}
