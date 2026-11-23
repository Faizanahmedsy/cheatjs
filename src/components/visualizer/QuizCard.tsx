"use client";

import { useEffect, useRef } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { sameAnswer } from "@/lib/visualizer/insights";

export interface QuizState {
  from: number;
  to: number;
  name: string;
  answer: string;
  line: number;
  guess: string;
  checked: boolean;
}

/** "What will x be after line 4?" — shown before the step runs when Quiz me is on. */
export function QuizCard({
  quiz,
  onGuess,
  onCheck,
  onContinue,
}: {
  quiz: QuizState;
  onGuess: (guess: string) => void;
  onCheck: () => void;
  onContinue: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), [quiz.from]);
  const right = quiz.checked && sameAnswer(quiz.guess, quiz.answer);

  return (
    <section aria-label="Quiz" className="rounded-2xl border-2 border-violet-400/60 bg-violet-950/30 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-violet-200">
        <HelpCircle className="h-4 w-4" aria-hidden="true" /> Your turn: predict
      </p>
      <p className="mt-2 text-lg text-slate-100">
        After <span className="font-code text-red-300">line {quiz.line}</span> runs, what will{" "}
        <span className="font-code font-bold text-cyan-200">{quiz.name}</span> be?
      </p>
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (quiz.checked) onContinue();
          else onCheck();
        }}
      >
        <input
          ref={inputRef}
          value={quiz.guess}
          onChange={(event) => onGuess(event.target.value)}
          disabled={quiz.checked}
          placeholder="your guess"
          aria-label={`Your guess for ${quiz.name}`}
          className="h-11 min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-950 px-3 font-code text-lg text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        />
        {!quiz.checked ? (
          <>
            <button type="submit" className="h-11 rounded-lg bg-violet-400 px-5 font-semibold text-slate-950 hover:bg-violet-300">
              Check
            </button>
            <button type="button" onClick={onContinue} className="h-11 rounded-lg border border-slate-600 px-4 text-slate-300 hover:bg-slate-800">
              Skip
            </button>
          </>
        ) : (
          <button type="submit" className="h-11 rounded-lg bg-cyan-400 px-5 font-semibold text-slate-950 hover:bg-cyan-300">
            Run the line →
          </button>
        )}
      </form>
      {quiz.checked && (
        <p className={cn("mt-3 rounded-lg px-3 py-2 text-base", right ? "bg-emerald-500/15 text-emerald-100" : "bg-amber-400/10 text-amber-100")}>
          {right ? "✅ Correct! " : "Not quite. "}
          {quiz.name} will be <span className="font-code font-bold">{quiz.answer}</span>.
        </p>
      )}
    </section>
  );
}
