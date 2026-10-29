import { cn } from "@/lib/utils";
import type { FrameSnapshot } from "@/lib/visualizer/types";
import { OldValue, ValueView } from "./ValueView";
import { flashKey, oldText, type StepView } from "./view-context";

const MAX_INDENT = 6;

function FrameCard({ frame, depth, isCurrent, view }: { frame: FrameSnapshot; depth: number; isCurrent: boolean; view: StepView }) {
  const isError = isCurrent && view.step.event === "exception";
  const pointerColor = (name: string) => (isCurrent ? view.pointers.find((p) => p.name === name)?.color : undefined);
  const returnChanged = view.changes.returnValues.has(frame.id);

  return (
    <section
      aria-label={`${frame.name}${isCurrent ? " (current frame)" : ""}`}
      style={{ marginLeft: `${Math.min(depth, MAX_INDENT) * 14}px` }}
      className={cn(
        "rounded-lg border bg-slate-900/70 p-3 transition-colors duration-300",
        isError ? "border-red-500/70" : isCurrent ? "border-cyan-400/70" : "border-slate-700/70",
      )}
    >
      <h3 className={cn("mb-2 font-code text-base font-medium", isCurrent ? "text-cyan-300" : "text-slate-400")}>
        {frame.name}
        {depth > 0 && <span className="ml-2 font-body text-xs font-normal text-slate-500">depth {depth}</span>}
      </h3>
      {frame.vars.length === 0 && !frame.returnValue ? (
        <p className="text-sm italic text-slate-500">no variables yet</p>
      ) : (
        <table className="w-full border-collapse">
          <tbody>
            {frame.vars.map((variable) => {
              const changeKey = `${frame.id}:${variable.name}`;
              const isChanged = view.changes.vars.has(changeKey);
              const was = isChanged ? oldText(view, view.changes.vars.get(changeKey)) : null;
              const color = pointerColor(variable.name);
              return (
                <tr key={variable.name} className="border-t border-slate-800 first:border-t-0">
                  <th scope="row" className="w-px whitespace-nowrap py-1.5 pr-4 text-left align-middle font-normal">
                    <span className={cn("font-code text-base", color ? cn("font-bold", color.text) : "text-slate-300")}>
                      {variable.name}
                    </span>
                    {variable.closure && (
                      <span className="ml-1.5 rounded bg-slate-800 px-1 py-0.5 text-[11px] text-slate-400">closure</span>
                    )}
                  </th>
                  <td className="py-1.5 align-middle">
                    <span
                      key={flashKey(isChanged, view.stepIndex, variable.name)}
                      className={cn("inline-flex items-center gap-2 rounded px-1.5 py-0.5 text-base", isChanged && "viz-flash")}
                    >
                      <ValueView value={variable.value} heap={view.step.heap} boxed={view.boxed} />
                      {was && <OldValue text={was} />}
                    </span>
                  </td>
                </tr>
              );
            })}
            {frame.returnValue && (
              <tr className="border-t border-slate-800">
                <th scope="row" className="whitespace-nowrap py-1.5 pr-4 text-left align-middle text-sm font-medium text-slate-300">
                  Return value
                </th>
                <td className="py-1.5 align-middle">
                  <span
                    key={flashKey(returnChanged, view.stepIndex, "return")}
                    className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-base", returnChanged && "viz-flash")}
                  >
                    <ValueView value={frame.returnValue} heap={view.step.heap} boxed={view.boxed} />
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}

/** Global frame on top, newest call at the bottom; calls are indented by depth. */
export function FramesColumn({ view }: { view: StepView }) {
  const frames = view.step.frames;
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">Frames</h2>
      {frames.map((frame, index) => (
        <FrameCard key={frame.id} frame={frame} depth={index} isCurrent={index === frames.length - 1} view={view} />
      ))}
    </div>
  );
}
