"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, LayoutGrid, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PROBLEMS } from "@/lib/visualizer/catalog";
import { PROBLEM_GROUPS, type Problem } from "@/lib/visualizer/problem-types";
import { DIFFICULTY_STYLE } from "./ProblemPanel";

type Status = "all" | "todo" | "done";
const DIFFICULTIES: (Problem["difficulty"] | "All")[] = ["All", "Easy", "Medium", "Hard"];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
        on ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-slate-700 bg-slate-800 text-slate-300 hover:text-slate-100",
      )}
    >
      {children}
    </button>
  );
}

/** Every question as a filterable grid: search, difficulty, pattern, done / to do. */
export function ProblemBrowser({ currentId, done, onPick }: { currentId: string | null; done: Set<string>; onPick: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Problem["difficulty"] | "All">("All");
  const [group, setGroup] = useState<string>("All");
  const [status, setStatus] = useState<Status>("all");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROBLEMS.filter(
      (p) =>
        (difficulty === "All" || p.difficulty === difficulty) &&
        (group === "All" || p.group === group) &&
        (status === "all" || (status === "done" ? done.has(p.id) : !done.has(p.id))) &&
        (!q || p.title.toLowerCase().includes(q) || String(p.number) === q || p.group.toLowerCase().includes(q)),
    );
  }, [query, difficulty, group, status, done]);

  const doneCount = PROBLEMS.filter((p) => done.has(p.id)).length;
  const percent = Math.round((doneCount / PROBLEMS.length) * 100);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          All questions
          <span className="rounded bg-emerald-500/20 px-1.5 text-xs text-emerald-200">
            {doneCount}/{PROBLEMS.length}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col gap-3 border-slate-700 bg-slate-900 text-slate-100">
        <DialogHeader>
          <DialogTitle>All {PROBLEMS.length} questions</DialogTitle>
          <DialogDescription className="text-slate-400">
            You finished {doneCount} ({percent}%). A question is ticked when you step through it to the end.
          </DialogDescription>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800" aria-hidden="true">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${percent}%` }} />
          </div>
        </DialogHeader>

        <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3">
          <Search className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, number or pattern…"
            aria-label="Search questions"
            className="h-10 w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Difficulty and status">
          {DIFFICULTIES.map((d) => (
            <Chip key={d} on={difficulty === d} onClick={() => setDifficulty(d)}>
              {d}
            </Chip>
          ))}
          <span className="mx-1 w-px self-stretch bg-slate-700" aria-hidden="true" />
          {(["all", "todo", "done"] as Status[]).map((s) => (
            <Chip key={s} on={status === s} onClick={() => setStatus(s)}>
              {s === "all" ? "Any status" : s === "todo" ? "To do" : "Done ✓"}
            </Chip>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Pattern">
          {["All", ...PROBLEM_GROUPS].map((g) => (
            <Chip key={g} on={group === g} onClick={() => setGroup(g)}>
              {g === "All" ? "All patterns" : g}
            </Chip>
          ))}
        </div>

        <ul className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => {
            const isDone = done.has(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onPick(p.id);
                  }}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
                    p.id === currentId ? "border-cyan-400 bg-cyan-400/10" : "border-slate-700/70 bg-slate-900",
                  )}
                >
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", DIFFICULTY_STYLE[p.difficulty].dot)} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-100">
                      <span className="text-slate-500">{p.number}.</span> {p.title}
                    </span>
                    <span className="text-xs text-slate-400">
                      {p.group} · {p.difficulty}
                    </span>
                  </span>
                  {isDone && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-label="done" />}
                </button>
              </li>
            );
          })}
          {list.length === 0 && <li className="col-span-full py-8 text-center text-sm text-slate-500">No question matches these filters.</li>}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
