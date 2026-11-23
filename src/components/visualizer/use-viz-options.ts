"use client";

import { useCallback, useEffect, useState } from "react";

export interface VizOptions {
  /** Hide `//` comments in the code panel. */
  hideComments: boolean;
  /** Play pauses on key moments: a true `if`, a return, a print, the end. */
  smartPlay: boolean;
  /** Next / Back skip the top-level setup lines and stay inside functions. */
  skipSetup: boolean;
  /** Ask "what will x be?" before a step that changes a variable. */
  quiz: boolean;
  /** Fold variables, the dry-run table and the call tree into "More details". */
  focus: boolean;
}

const DEFAULTS: VizOptions = { hideComments: false, smartPlay: true, skipSetup: false, quiz: false, focus: true };
const KEY = "viz-options";

/** Visualizer options, remembered in this browser. */
export function useVizOptions(): [VizOptions, (patch: Partial<VizOptions>) => void] {
  const [options, setOptions] = useState<VizOptions>(DEFAULTS);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved) setOptions({ ...DEFAULTS, ...(JSON.parse(saved) as Partial<VizOptions>) });
    } catch {
      // Storage blocked or bad JSON: keep the defaults.
    }
  }, []);
  const update = useCallback((patch: Partial<VizOptions>) => {
    setOptions((current) => {
      const next = { ...current, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // Storage blocked: lasts for this visit.
      }
      return next;
    });
  }, []);
  return [options, update];
}
