import { cn } from "@/lib/utils";
import type { CallNode } from "@/lib/visualizer/analysis";

interface CallTreeProps {
  roots: CallNode[];
  stepIndex: number;
  /** Frame ids on the stack at this step; the last one is the current call. */
  activeFrameIds: number[];
}

const MAX_NODES = 80;

function NodeView({ node, stepIndex, active, current, budget }: { node: CallNode; stepIndex: number; active: Set<number>; current: number; budget: { left: number } }) {
  if (node.startStep > stepIndex || budget.left <= 0) return null;
  budget.left -= 1;
  const finished = node.endStep !== undefined && node.endStep <= stepIndex;
  const isCurrent = node.frameId === current;
  const visibleChildren = node.children.filter((child) => child.startStep <= stepIndex);
  return (
    <li className="relative">
      <span
        aria-current={isCurrent ? "step" : undefined}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-code text-sm transition-colors duration-300",
          isCurrent
            ? "border-cyan-400/80 bg-cyan-400/10 text-cyan-200"
            : active.has(node.frameId)
              ? "border-slate-500 text-slate-200"
              : "border-slate-700 text-slate-500",
        )}
      >
        {node.name}({node.args})
        {finished && <span className="text-slate-400">→ {node.result}</span>}
      </span>
      {visibleChildren.length > 0 && (
        <ul className="ml-3 mt-1 space-y-1 border-l border-slate-700 pl-3">
          {visibleChildren.map((child) => (
            <NodeView key={child.frameId} node={child} stepIndex={stepIndex} active={active} current={current} budget={budget} />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Recursion mini-map: every call so far, the current one highlighted, finished ones with their result. */
export function CallTree({ roots, stepIndex, activeFrameIds }: CallTreeProps) {
  const visible = roots.filter((root) => root.startStep <= stepIndex);
  const budget = { left: MAX_NODES };
  return (
    <section aria-label="Recursion call tree" className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
      <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-400">Call tree</h2>
      {visible.length === 0 ? (
        <p className="text-sm italic text-slate-500">No calls yet.</p>
      ) : (
        <ul className="max-h-64 space-y-1 overflow-auto">
          {visible.map((root) => (
            <NodeView
              key={root.frameId}
              node={root}
              stepIndex={stepIndex}
              active={new Set(activeFrameIds)}
              current={activeFrameIds[activeFrameIds.length - 1]}
              budget={budget}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
