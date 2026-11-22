"use client";

import { useState } from "react";
import { DownloadCloud } from "lucide-react";

export function OfflineButton({ urls }: { urls: string[] }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "unsupported">("idle");
  const [n, setN] = useState(0);

  const run = async () => {
    if (!("serviceWorker" in navigator)) return setState("unsupported");
    setState("busy");
    setN(0);
    const seen = new Set<string>();
    for (const u of urls) {
      try {
        const res = await fetch(u, { headers: { Accept: "text/html" } });
        const html = await res.text();
        // also warm the JS/CSS the page needs so it opens offline
        const assets = Array.from(html.matchAll(/\/_next\/static\/[^"'\\\s)<>]+/g)).map((m) => m[0]);
        for (const a of assets) {
          if (seen.has(a)) continue;
          seen.add(a);
          try { await fetch(a); } catch { /* ignore */ }
        }
      } catch { /* page unreachable: skip */ }
      setN((v) => v + 1);
    }
    setState("done");
  };

  return (
    <div className="mt-6 rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
      <h2 className="mb-1 font-headline text-lg font-bold text-slate-100">Read offline</h2>
      <p className="mb-3 text-sm text-slate-400">Save every study page to this device so it opens with no internet. Run it again to refresh the saved copy.</p>
      <button type="button" onClick={run} disabled={state === "busy"} className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60">
        <DownloadCloud className="h-4 w-4" />
        {state === "busy" ? `Saving… ${n}/${urls.length}` : state === "done" ? "Saved. Save again" : "Save for offline"}
      </button>
      {state === "unsupported" ? <p className="mt-2 text-sm text-amber-300">This browser does not support offline mode.</p> : null}
    </div>
  );
}
