"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { PRE_DSA_RECOMMENDATION, PRE_DSA_SYLLABUS } from "@/lib/dsa/pre-dsa";

const STORAGE_KEY = "cheatjs:pre-dsa-checklist:v1";
const VALID_IDS = new Set(PRE_DSA_SYLLABUS.map((t) => t.id));

function readSaved(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && VALID_IDS.has(id));
  } catch {
    return [];
  }
}

function writeSaved(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage blocked or full: the checklist still works for this visit.
  }
}

/**
 * 20-topic mastery checklist for the Pre-DSA overview page.
 * Renders all unchecked on the server and first paint, then loads the
 * learner's ticks from localStorage after mount.
 */
export function PreDsaChecklist() {
  const [done, setDone] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setDone(new Set(readSaved()));
  }, []);

  const toggle = (id: string, checked: boolean) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      writeSaved(Array.from(next));
      return next;
    });
  };

  const reset = () => {
    setDone(new Set());
    writeSaved([]);
  };

  const total = PRE_DSA_SYLLABUS.length;
  const count = done.size;
  const percent = Math.round((count / total) * 100);

  return (
    <Card className="bg-slate-800/50 border border-slate-700/50">
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl md:text-2xl font-headline text-cyan-300">
          Mastery checklist
        </CardTitle>
        <p className="text-sm md:text-base text-slate-400">{PRE_DSA_RECOMMENDATION}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">
              {count}/{total} topics mastered
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              disabled={count === 0}
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-700/60"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Reset checklist
            </Button>
          </div>
          <Progress
            value={percent}
            aria-label={`${count} of ${total} topics mastered`}
            className="h-2 bg-slate-700 [&>div]:bg-cyan-400"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-1">
          {PRE_DSA_SYLLABUS.map((topic, index) => {
            const checked = done.has(topic.id);
            const boxId = `pre-dsa-check-${topic.id}`;
            return (
              <li
                key={topic.id}
                className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-slate-700/30"
              >
                <Checkbox
                  id={boxId}
                  checked={checked}
                  onCheckedChange={(value) => toggle(topic.id, value === true)}
                  aria-label={`Mark topic ${index + 1} as mastered`}
                  className="mt-0.5 border-slate-500 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400 data-[state=checked]:text-slate-900"
                />
                <span className="w-6 shrink-0 text-sm tabular-nums text-slate-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Link
                  href={`/dsa?topic=${topic.id}`}
                  className={
                    checked
                      ? "text-sm text-slate-500 line-through decoration-slate-600 hover:text-slate-300"
                      : "text-sm text-slate-200 hover:text-cyan-300"
                  }
                >
                  {topic.title}
                </Link>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
