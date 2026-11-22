'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Btn, Cells, Message, boxClass } from './shared';

const N = 8;
const fresh = () => ({ parent: Array.from({ length: N }, (_, i) => i), size: Array(N).fill(1) as number[] });

export function UnionFindVisualization() {
  const [uf, setUf] = useState(fresh);
  const [x, setX] = useState('0');
  const [y, setY] = useState('1');
  const [msg, setMsg] = useState('Every element starts as its own group (its own parent). Union joins two groups, Find returns the group leader.');
  const [hi, setHi] = useState<number[]>([]);

  const find = (p: number[], v: number, path: number[] = []): number => {
    path.push(v);
    if (p[v] === v) return v;
    const root = find(p, p[v], path);
    p[v] = root; // path compression
    return root;
  };
  const ok = (v: string) => /^\d+$/.test(v) && Number(v) < N;

  const union = () => {
    if (!ok(x) || !ok(y)) return setMsg(`Use numbers from 0 to ${N - 1}.`);
    const parent = [...uf.parent], size = [...uf.size];
    const a = find(parent, Number(x)), b = find(parent, Number(y));
    if (a === b) { setMsg(`${x} and ${y} already share leader ${a}. Nothing to do.`); setHi([a]); return setUf({ parent, size }); }
    const [big, small] = size[a] >= size[b] ? [a, b] : [b, a];
    parent[small] = big;
    size[big] += size[small];
    setHi([big, small]);
    setMsg(`Leaders ${a} and ${b} differ. Attach the smaller group (${small}) under the bigger one (${big}). Path compression flattens the tree.`);
    setUf({ parent, size });
  };

  const findOnly = () => {
    if (!ok(x)) return setMsg(`Use a number from 0 to ${N - 1}.`);
    const parent = [...uf.parent], path: number[] = [];
    const r = find(parent, Number(x), path);
    setHi(path);
    setMsg(`find(${x}) walks ${path.join(' → ')} and returns leader ${r}.`);
    setUf({ parent, size: uf.size });
  };

  const groups = new Map<number, number[]>();
  uf.parent.forEach((_, i) => {
    const r = find([...uf.parent], i);
    groups.set(r, [...(groups.get(r) ?? []), i]);
  });

  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input value={x} onChange={(e) => setX(e.target.value)} inputMode="numeric" className="w-16 border-slate-600 bg-slate-800" aria-label="First element" />
        <Input value={y} onChange={(e) => setY(e.target.value)} inputMode="numeric" className="w-16 border-slate-600 bg-slate-800" aria-label="Second element" />
        <Btn onClick={union}>Union</Btn>
        <Btn tone="green" onClick={findOnly}>Find (first)</Btn>
        <Btn tone="slate" onClick={() => { setUf(fresh()); setHi([]); setMsg('Reset: eight separate groups.'); }}>Reset</Btn>
      </div>
      <p className="mb-1 text-xs text-slate-400">parent[] array</p>
      <Cells items={uf.parent.map((p, i) => ({ label: p, state: hi.includes(i) ? 'active' : p === i ? 'default' : 'range' }))} />
      <p className="mb-1 mt-3 text-xs text-slate-400">Groups ({groups.size})</p>
      <div className="flex flex-wrap gap-2">
        {[...groups.entries()].map(([r, m]) => (
          <span key={r} className="rounded-md border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200">leader {r}: {'{'}{m.join(', ')}{'}'}</span>
        ))}
      </div>
      <Message>{msg}</Message>
    </div>
  );
}
