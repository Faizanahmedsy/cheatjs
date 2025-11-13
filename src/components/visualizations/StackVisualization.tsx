'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function StackVisualization() {
  const [value, setValue] = useState('D');
  const [stack, setStack] = useState<string[]>(['A', 'B', 'C']);

  const handlePush = () => {
    if (!value) return;
    setStack(prev => [...prev, value]);
    setValue(String.fromCharCode(value.charCodeAt(0) + 1));
  };

  const handlePop = () => {
    if (stack.length === 0) return;
    setStack(prev => prev.slice(0, -1));
    if (value.charCodeAt(0) > 'A'.charCodeAt(0)) {
      setValue(String.fromCharCode(value.charCodeAt(0) - 1));
    }
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
        <Button onClick={handlePush} size="sm" className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">Push</Button>
        <Button onClick={handlePop} size="sm" variant="destructive" className="bg-red-500/20 text-red-300 hover:bg-red-500/30">Pop</Button>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-slate-400 mb-1">Stack (Last-In, First-Out):</p>
        <div className="flex flex-col-reverse items-center gap-1 bg-slate-800/50 p-2 rounded-md border border-slate-700/50 min-h-[150px]">
          {stack.map((item, index) => (
            <div
              key={index}
              className="w-24 h-10 flex items-center justify-center text-lg font-bold text-slate-100 bg-card border border-slate-600 rounded"
            >
              {item}
            </div>
          ))}
          {stack.length === 0 && <div className="text-slate-500">Stack is empty</div>}
        </div>
      </div>
    </div>
  );
}
