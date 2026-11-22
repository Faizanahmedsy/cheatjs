'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Btn, Message, boxClass } from './shared';

const CAP = 3;

export function LRUCacheVisualization() {
  const [items, setItems] = useState<[string, string][]>([['a', '1'], ['b', '2']]); // most recent first
  const [key, setKey] = useState('c');
  const [val, setVal] = useState('3');
  const [msg, setMsg] = useState(`Capacity is ${CAP}. Most recently used item sits on the left. When full, the right-most (least recent) item is removed.`);
  const [flash, setFlash] = useState<string | null>(null);

  const put = () => {
    if (!key.trim()) return;
    const k = key.trim().slice(0, 4), v = val.trim().slice(0, 4) || '0';
    const exists = items.some(([x]) => x === k);
    let next = items.filter(([x]) => x !== k);
    let note = exists ? `Updated "${k}" and moved it to the front.` : `Added "${k}" at the front.`;
    next = [[k, v], ...next];
    if (next.length > CAP) {
      const [ek] = next.pop()!;
      note += ` Cache was full, so least recently used "${ek}" was evicted.`;
    }
    setItems(next); setFlash(k); setMsg(note);
  };
  const get = () => {
    const k = key.trim();
    const hit = items.find(([x]) => x === k);
    if (!hit) { setFlash(null); return setMsg(`get("${k}") → -1 (miss). Nothing changes.`); }
    setItems([hit, ...items.filter(([x]) => x !== k)]);
    setFlash(k);
    setMsg(`get("${k}") → ${hit[1]} (hit). It is now the most recently used, moved to the front.`);
  };

  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input value={key} onChange={(e) => setKey(e.target.value)} className="w-16 border-slate-600 bg-slate-800" aria-label="Key" placeholder="key" />
        <Input value={val} onChange={(e) => setVal(e.target.value)} className="w-16 border-slate-600 bg-slate-800" aria-label="Value" placeholder="value" />
        <Btn onClick={put}>put(key, value)</Btn>
        <Btn tone="green" onClick={get}>get(key)</Btn>
        <Btn tone="slate" onClick={() => { setItems([]); setFlash(null); setMsg('Cache cleared.'); }}>Clear</Btn>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-slate-500"><span>most recent</span><span className="flex-1 border-t border-dashed border-slate-600" /><span>least recent</span></div>
      <div className="mt-2 flex min-h-[3.5rem] gap-2">
        {items.map(([k, v]) => (
          <div key={k} className={`flex h-14 w-16 flex-col items-center justify-center rounded border text-xs font-bold ${flash === k ? 'border-yellow-400 bg-yellow-400/20 text-yellow-200' : 'border-slate-600 bg-slate-800 text-slate-100'}`}>
            <span>{k}</span><span className="text-cyan-300">{v}</span>
          </div>
        ))}
        {Array.from({ length: CAP - items.length }, (_, i) => <div key={i} className="h-14 w-16 rounded border border-dashed border-slate-700" />)}
      </div>
      <Message>{msg}</Message>
    </div>
  );
}
