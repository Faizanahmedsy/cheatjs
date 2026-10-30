"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  autoColumns,
  candidateColumns,
  rowLines,
  rowValue,
  visibleRows,
  type IterationIndex,
} from "@/lib/visualizer/iteration-table";
import type { TraceStep } from "@/lib/visualizer/types";
import { Term } from "./Term";

interface IterationTableProps {
  steps: TraceStep[];
  table: IterationIndex;
  index: number;
  onJump: (step: number) => void;
  beginner: boolean;
}

const MAX_ROWS = 200;

function conditionCell(step: TraceStep, loopLine?: number) {
  const condition = step.condition;
  if (!condition || step.line !== loopLine || !condition.text) return null;
  const detail = condition.comparisons
    .filter((c) => c.leftText !== c.left || c.rightText !== c.right)
    .map((c) => `${c.left} ${c.op} ${c.right}`)
    .join(", ");
  return { text: condition.text, result: condition.result, detail };
}

/**
 * The dry-run table a student would draw on paper: one row per loop pass,
 * a column per variable that changes, the loop check and the lines that ran.
 */
export function IterationTable({ steps, table, index, onJump, beginner }: IterationTableProps) {
  const position = table.at[index];
  const group = position ? table.groups.get(position.key) : undefined;
  const [picked, setPicked] = useState<Record<string, string[]>>({});
  const currentRef = useRef<HTMLTableRowElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // A new trace starts with fresh column choices.
  useEffect(() => setPicked({}), [steps]);

  const candidates = useMemo(() => (group ? candidateColumns(steps, group, index) : []), [steps, group, index]);
  const auto = useMemo(() => (group ? autoColumns(steps, group, index) : []), [steps, group, index]);
  const columns = group && picked[group.key] ? picked[group.key].filter((name) => candidates.includes(name)) : auto;

  useEffect(() => {
    const row = currentRef.current;
    const box = scrollRef.current;
    if (!row || !box) return;
    const top = row.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    if (top < box.scrollTop + 36 || top + row.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTop = Math.max(0, top - box.clientHeight / 2);
    }
  }, [index, position?.key]);

  if (!group || !position) return null;
  const rows = visibleRows(group, index).slice(-MAX_ROWS);
  const isLoop = group.mode === "loop";
  const showCondition = isLoop && (group.loopKind === "for" || group.loopKind === "while");

  const toggle = (name: string) => {
    const next = columns.includes(name) ? columns.filter((c) => c !== name) : candidates.filter((c) => c === name || columns.includes(c));
    setPicked((all) => ({ ...all, [group.key]: next }));
  };

  const where = group.frameName === "Global frame" ? "global code" : `${group.frameName}()`;
  const title = isLoop ? `${group.loopKind} loop on line ${group.loopLine} · ${where}` : `step by step · ${where}`;

  return (
    <section aria-label="Iteration table" className="rounded-xl border border-cyan-400/30 bg-slate-800/40 p-4">
      <header className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-200">
          <Table2 className="h-4 w-4" aria-hidden="true" />
          {isLoop ? (
            <Term name="iteration" enabled={beginner}>
              Iteration table
            </Term>
          ) : (
            "Dry-run table"
          )}
        </h2>
        <span className="text-sm text-slate-400">{title}</span>
        {position.row === -1 && <span className="text-xs text-slate-500">(loop finished)</span>}
      </header>
      {beginner && (
        <p className="mb-2 text-sm text-slate-400">
          {isLoop
            ? "One row per pass, values as each pass starts — just like a dry run on paper. Click a row to jump there."
            : "No loop here yet, so each row is one step. Click a row to jump there."}
        </p>
      )}

      {candidates.length > 1 && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Columns to show">
          <span className="mr-1 text-xs text-slate-500">Columns:</span>
          {candidates.map((name) => {
            const on = columns.includes(name);
            return (
              <button
                key={name}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(name)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 font-code text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
                  on ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-100" : "border-slate-700 text-slate-500 hover:text-slate-300",
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      <div ref={scrollRef} className="relative max-h-80 overflow-auto rounded-lg border border-slate-700/60">
        <table className={cn("w-full border-collapse font-code", beginner ? "text-[15px]" : "text-sm")}>
          <thead className="sticky top-0 z-10 bg-slate-900 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">{isLoop ? "pass" : "step"}</th>
              {columns.map((name) => (
                <th key={name} scope="col" className="px-3 py-2 font-medium normal-case">
                  {name}
                </th>
              ))}
              {showCondition && <th scope="col" className="px-3 py-2 font-medium">check</th>}
              <th scope="col" className="px-3 py-2 font-medium">lines</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const isCurrent = position.row !== -1 && group.rows[position.row] === row;
              const restarted = rowIndex > 0 && rows[rowIndex - 1].instance !== row.instance;
              const check = showCondition ? conditionCell(steps[row.steps[0]], group.loopLine) : null;
              return (
                <tr
                  key={row.steps[0]}
                  ref={isCurrent ? currentRef : undefined}
                  aria-current={isCurrent ? "step" : undefined}
                  tabIndex={0}
                  onClick={() => onJump(row.steps[0])}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onJump(row.steps[0]);
                    }
                  }}
                  className={cn(
                    "cursor-pointer border-t transition-colors hover:bg-slate-700/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400",
                    restarted ? "border-t-2 border-slate-500" : "border-slate-800",
                    isCurrent && "bg-cyan-400/10 hover:bg-cyan-400/15",
                  )}
                >
                  <td className={cn("whitespace-nowrap px-3 py-1.5", isCurrent ? "font-semibold text-cyan-200" : "text-slate-400")}>
                    {isCurrent && <span aria-hidden="true">▶ </span>}
                    {row.label}
                  </td>
                  {columns.map((name) => (
                    <td key={name} className="whitespace-nowrap px-3 py-1.5 text-slate-100">
                      {rowValue(steps, group, row, name, index) || <span className="text-slate-600">—</span>}
                    </td>
                  ))}
                  {showCondition && (
                    <td className="whitespace-nowrap px-3 py-1.5">
                      {check ? (
                        <span className={check.result ? "text-emerald-300" : "text-red-300"}>
                          {check.detail || check.text} → {String(check.result)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  )}
                  <td className="whitespace-nowrap px-3 py-1.5 text-slate-400">{rowLines(steps, row, index)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {group.rows.length > MAX_ROWS && rows.length === MAX_ROWS && (
        <p className="mt-1 text-xs text-slate-500">Showing the latest {MAX_ROWS} rows.</p>
      )}
    </section>
  );
}
