'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Btn, Message, boxClass } from './shared';

export function SetVisualization() {
  const [value, setValue] = useState('D');
  const [items, setItems] = useState<string[]>(['A', 'B', 'C']);
  const [flash, setFlash] = useState<string | null>(null);
  const [msg, setMsg] = useState('A Set keeps only unique values and answers "is it inside?" in O(1) on average.');

  const add = () => {
    if (!value) return;
    if (items.includes(value)) {
      setFlash(value);
      return setMsg(`"${value}" is already in the Set, so nothing changes. No duplicates allowed.`);
    }
    setItems([...items, value]);
    setFlash(value);
    setMsg(`Added "${value}".`);
  };
  const remove = () => {
    if (!items.includes(value)) return setMsg(`"${value}" is not in the Set.`);
    setItems(items.filter((i) => i !== value));
    setFlash(null);
    setMsg(`Removed "${value}".`);
  };
  const has = () => {
    setFlash(items.includes(value) ? value : null);
    setMsg(`set.has("${value}") → ${items.includes(value)}`);
  };

  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-slate-400">Value:</p>
        <Input value={value} onChange={(e) => setValue(e.target.value)} maxLength={3} className="w-20 border-slate-600 bg-slate-800" />
        <Btn onClick={add}>add</Btn>
        <Btn tone="red" onClick={remove}>delete</Btn>
        <Btn tone="yellow" onClick={has}>has</Btn>
      </div>
      <p className="mb-1 text-slate-400">Set ({items.length}):</p>
      <div className="flex min-h-[70px] flex-wrap items-center gap-2 rounded-md border border-slate-700/50 bg-slate-800/50 p-3">
        {items.map((i) => (
          <span key={i} className={`rounded-full border px-3 py-1 font-bold ${flash === i ? 'border-yellow-400 bg-yellow-400/20 text-yellow-200' : 'border-slate-600 bg-slate-800 text-slate-100'}`}>
            {i}
          </span>
        ))}
        {items.length === 0 && <span className="text-slate-500">Set is empty</span>}
      </div>
      <Message>{msg}</Message>
    </div>
  );
}
