"use client";

import { useCallback, useEffect, useLayoutEffect, useState, type RefObject } from "react";

interface Arrow {
  key: string;
  d: string;
}

const HEAD_GAP = 3;

/** Bezier from a reference dot to its heap box, chosen so arrows rarely cut through boxes. */
function arrowPath(from: DOMRect, to: DOMRect, base: DOMRect): string {
  const x1 = from.left + from.width / 2 - base.left;
  const y1 = from.top + from.height / 2 - base.top;
  if (to.left >= from.right - 2) {
    // Target to the right: aim at its left edge, near the top.
    const x2 = to.left - base.left - HEAD_GAP;
    const y2 = to.top - base.top + 18;
    const pull = Math.max(30, (x2 - x1) / 2);
    return `M ${x1} ${y1} C ${x1 + pull} ${y1}, ${x2 - pull} ${y2}, ${x2} ${y2}`;
  }
  // Target left of / under the source (heap → heap): come in from above or below.
  const below = to.top >= from.bottom;
  const x2 = Math.min(Math.max(x1, to.left - base.left + 16), to.right - base.left - 16);
  const y2 = below ? to.top - base.top - HEAD_GAP : to.bottom - base.top + HEAD_GAP;
  const bend = below ? 40 : -40;
  return `M ${x1} ${y1} C ${x1 + 40} ${y1 + bend / 2}, ${x2} ${y2 - bend}, ${x2} ${y2}`;
}

/**
 * SVG overlay drawing an arrow from every `[data-viz-ref]` dot to the matching
 * `[data-viz-heap]` box inside `containerRef`. Recomputed after each render
 * key change and whenever the container resizes.
 */
export function ArrowLayer({ containerRef, renderKey }: { containerRef: RefObject<HTMLDivElement | null>; renderKey: string }) {
  const [arrows, setArrows] = useState<Arrow[]>([]);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const base = container.getBoundingClientRect();
    const next: Arrow[] = [];
    container.querySelectorAll<HTMLElement>("[data-viz-ref]").forEach((dot, index) => {
      const target = container.querySelector<HTMLElement>(`[data-viz-heap="${dot.dataset.vizRef}"]`);
      if (!target) return;
      next.push({ key: `${index}-${dot.dataset.vizRef}`, d: arrowPath(dot.getBoundingClientRect(), target.getBoundingClientRect(), base) });
    });
    setArrows((previous) =>
      previous.length === next.length && previous.every((arrow, i) => arrow.d === next[i].d) ? previous : next,
    );
  }, [containerRef]);

  useLayoutEffect(() => {
    measure();
    // Slides move cells for ~320ms; arrows aim at boxes, but re-measure once settled.
    const settle = window.setTimeout(measure, 360);
    return () => window.clearTimeout(settle);
  }, [measure, renderKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef, measure]);

  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-slate-400">
      <defs>
        <marker id="viz-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
      {arrows.map((arrow) => (
        <path key={arrow.key} d={arrow.d} fill="none" stroke="currentColor" strokeWidth={1.75} markerEnd="url(#viz-arrowhead)" />
      ))}
    </svg>
  );
}
