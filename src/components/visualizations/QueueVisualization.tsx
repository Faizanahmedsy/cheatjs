'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';

export function QueueVisualization() {
  const [value, setValue] = useState('A');
  const [queue, setQueue] = useState<string[]>(['A', 'B', 'C']);

  const handleEnqueue = () => {
    if (!value) return;
    setQueue(prev => [...prev, value]);
    setValue(String.fromCharCode(value.charCodeAt(0) + 1));
  };

  const handleDequeue = () => {
    if (queue.length === 0) return;
    setQueue(prev => prev.slice(1));
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
        <Button onClick={handleEnqueue} size="sm" className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">Enqueue</Button>
        <Button onClick={handleDequeue} size="sm" variant="destructive" className="bg-red-500/20 text-red-300 hover:bg-red-500/30">Dequeue</Button>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-slate-400 mb-1">Queue (First-In, First-Out):</p>
        <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-md border border-slate-700/50 min-h-[60px]">
          <div className="text-green-400 font-bold">IN</div>
          <ArrowRight className="text-slate-500" />
          <div className="flex-1 flex justify-end gap-1">
            {queue.map((item, index) => (
              <div
                key={index}
                className="w-10 h-10 flex items-center justify-center text-lg font-bold text-slate-100 bg-card border border-slate-600 rounded"
              >
                {item}
              </div>
            ))}
          </div>
          <ArrowRight className="text-slate-500" />
          <div className="text-red-400 font-bold">OUT</div>
        </div>
      </div>
    </div>
  );
}
