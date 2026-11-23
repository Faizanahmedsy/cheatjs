import { PAIR_CHECK, TRY_ALL, parseGrowth } from "@/lib/visualizer/insights";

const SIZES = [10, 100, 1000, 10000];

function human(n: number): string {
  if (!Number.isFinite(n) || n > 1e15) return "way too many";
  if (n >= 1e9) return `${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)} billion`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)} million`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)} thousand`;
  return String(Math.max(1, Math.round(n)));
}

/** Bar width on a log scale, so 10 and 100 million both fit. */
function width(n: number): string {
  const v = Number.isFinite(n) ? Math.log10(Math.max(n, 1)) : 16;
  return `${Math.max(3, Math.min(100, (v / 16) * 100))}%`;
}

/** "This solution vs trying everything" for growing input sizes. */
export function SpeedCompare({ time }: { time: string }) {
  const mine = parseGrowth(time);
  if (!mine) return null;
  const fast = ["O(1)", "O(log n)", "O(n)", "O(n log n)"].includes(mine.label);
  const brute = fast ? PAIR_CHECK : mine.label === "O(n²)" || mine.label === "O(n³)" ? TRY_ALL : null;

  return (
    <div className="mt-3 rounded-lg border border-slate-700/60 bg-slate-950/40 p-3">
      <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400">How fast is it? (rough number of steps)</h3>
      <p className="mt-1 text-xs text-slate-500">
        <span className="font-code text-cyan-200">{mine.label}</span> this solution
        {brute && (
          <>
            {" "}vs <span className="font-code text-rose-200">{brute.label}</span> {brute === PAIR_CHECK ? "checking every pair (brute force)" : "trying every choice (brute force)"}
          </>
        )}
      </p>
      <table className="mt-2 w-full text-xs">
        <tbody>
          {SIZES.map((n) => (
            <tr key={n}>
              <th scope="row" className="w-20 py-1 pr-2 text-left font-code font-normal text-slate-400">
                n = {n.toLocaleString("en-US")}
              </th>
              <td className="py-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-cyan-400" style={{ width: width(mine.f(n)) }} />
                  <span className="whitespace-nowrap text-cyan-100">{human(mine.f(n))}</span>
                </div>
                {brute && (
                  <div className="mt-0.5 flex items-center gap-2">
                    <div className="h-2 rounded-full bg-rose-400/70" style={{ width: width(brute.f(n)) }} />
                    <span className="whitespace-nowrap text-rose-200">{human(brute.f(n))}</span>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
