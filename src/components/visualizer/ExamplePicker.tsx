"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { findEntry, problemLabel, problemsInGroup, sameSelection, type Selection } from "@/lib/visualizer/catalog";
import { EXAMPLE_GROUPS, EXAMPLES } from "@/lib/visualizer/examples";
import { PROBLEM_GROUPS } from "@/lib/visualizer/problem-types";
import { DIFFICULTY_STYLE } from "./ProblemPanel";

const GROUP_CLASS = "[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-slate-500";
const ITEM_CLASS = "cursor-pointer text-slate-200 data-[selected=true]:bg-slate-800 data-[selected=true]:text-slate-50";

function Tick({ on }: { on: boolean }) {
  return <Check className={cn("ml-auto h-4 w-4 text-cyan-300", on ? "opacity-100" : "opacity-0")} aria-hidden="true" />;
}

/** "Problems & examples": searchable by number or title, keyboard friendly (↑ ↓ Enter, Esc). */
export function ExamplePicker({ value, onChange }: { value: Selection; onChange: (selection: Selection) => void }) {
  const [open, setOpen] = useState(false);
  const current = value.kind === "custom" ? "My code" : (findEntry(value)?.label ?? "Problems & examples");
  const pick = (selection: Selection) => {
    setOpen(false);
    onChange(selection);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="Problems and examples"
          className="inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 text-left text-sm text-slate-200 hover:bg-slate-700/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:w-80"
        >
          <span className="truncate">{current}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(24rem,calc(100vw-2rem))] border-slate-700 bg-slate-900 p-0 text-slate-200">
        <Command className="bg-slate-900 text-slate-200">
          <CommandInput placeholder="Search by number or title…" className="text-slate-100 placeholder:text-slate-500" />
          <CommandList className="max-h-[min(26rem,60vh)]">
            <CommandEmpty>No problem or example matches.</CommandEmpty>
            {PROBLEM_GROUPS.map((group) => (
              <CommandGroup key={group} heading={group} className={GROUP_CLASS}>
                {problemsInGroup(group).map((problem) => {
                  const selection: Selection = { kind: "problem", id: problem.id };
                  return (
                    <CommandItem
                      key={problem.id}
                      value={`problem ${problemLabel(problem)} ${problem.id}`}
                      keywords={[String(problem.number), problem.difficulty]}
                      onSelect={() => pick(selection)}
                      className={ITEM_CLASS}
                    >
                      <span
                        className={cn("h-2 w-2 shrink-0 rounded-full", DIFFICULTY_STYLE[problem.difficulty].dot)}
                        title={problem.difficulty}
                        aria-hidden="true"
                      />
                      <span className="truncate">{problemLabel(problem)}</span>
                      <span className="sr-only">, {problem.difficulty}</span>
                      <Tick on={sameSelection(value, selection)} />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
            <CommandSeparator className="bg-slate-800" />
            {EXAMPLE_GROUPS.map((group) => (
              <CommandGroup key={group} heading={`Example · ${group}`} className={GROUP_CLASS}>
                {EXAMPLES.filter((example) => example.group === group).map((example) => {
                  const selection: Selection = { kind: "example", id: example.id };
                  return (
                    <CommandItem key={example.id} value={`example ${example.label} ${example.id}`} onSelect={() => pick(selection)} className={ITEM_CLASS}>
                      <span className="truncate">{example.label}</span>
                      <Tick on={sameSelection(value, selection)} />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
            {value.kind === "custom" && (
              <CommandGroup heading="Yours" className={GROUP_CLASS}>
                <CommandItem value="my code custom" onSelect={() => setOpen(false)} className={ITEM_CLASS}>
                  My code
                  <Tick on />
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
