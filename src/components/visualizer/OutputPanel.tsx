/** Everything printed so far, plus the error message on an error step. */
export function OutputPanel({ stdout, error }: { stdout: string; error?: string }) {
  const empty = !stdout && !error;
  return (
    <section aria-label="Print output" className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
      <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-400">Print output</h2>
      <pre className="max-h-48 min-h-[3rem] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-3 font-code text-[15px] leading-6 text-slate-100">
        {empty ? <span className="italic text-slate-600">console.log output appears here</span> : stdout}
        {error && <span className="block text-red-400">{error}</span>}
      </pre>
    </section>
  );
}
