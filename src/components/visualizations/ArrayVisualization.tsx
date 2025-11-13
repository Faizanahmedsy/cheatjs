'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ArrayVisualization() {
  const [value, setValue] = useState('A');
  const [array, setArray] = useState<string[]>(['A', 'B', 'C']);
  const [lastAction, setLastAction] = useState<{ type: 'add' | 'remove' | 'find'; index: number | null } | null>(null);

  const handleAdd = () => {
    if (!value) return;
    setArray(prev => [...prev, value]);
    setLastAction({ type: 'add', index: array.length });
    setValue(String.fromCharCode(value.charCodeAt(0) + 1));
  };

  const handleRemove = () => {
    if (array.length === 0) return;
    const removedIndex = array.length - 1;
    setArray(prev => prev.slice(0, -1));
    setLastAction({ type: 'remove', index: removedIndex });
    if (value.charCodeAt(0) > 'A'.charCodeAt(0)) {
      setValue(String.fromCharCode(value.charCodeAt(0) - 1));
    }
  };

  const handleFind = () => {
    if (array.length === 0) return;
    const findIndex = Math.floor(Math.random() * array.length);
    setLastAction({ type: 'find', index: findIndex });
  };

  return (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 font-code text-sm">
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <p className="text-slate-400">Value:</p>
        <Input
          type="text"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-20 bg-slate-800 border-slate-600"
          maxLength={1}
        />
        <Button onClick={handleAdd} size="sm" className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">Add</Button>
        <Button onClick={handleRemove} size="sm" variant="destructive" className="bg-red-500/20 text-red-300 hover:bg-red-500/30">Remove Last</Button>
        <Button onClick={handleFind} size="sm" className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30">Find Random</Button>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-slate-400 mb-1">Array:</p>
        <div className="flex gap-1 bg-slate-800/50 p-2 rounded-md border border-slate-700/50">
          {array.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                style={{
                  backgroundColor: lastAction?.index === index ? 'hsl(var(--primary))' : 'hsl(var(--card))',
                  transition: 'background-color 0.5s ease',
                }}
                className="w-10 h-10 flex items-center justify-center text-lg font-bold text-slate-100 bg-card border border-slate-600 rounded"
              >
                {item}
              </div>
              <div className="text-xs text-slate-400 mt-1">{index}</div>
            </div>
          ))}
          {array.length === 0 && <div className="text-slate-500 h-10 flex items-center">Array is empty</div>}
        </div>
      </div>
    </div>
  );
}
