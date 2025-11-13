'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';

type Node = {
  value: string;
  id: number;
};

export function LinkedListVisualization() {
  const [value, setValue] = useState('D');
  const [nodes, setNodes] = useState<Node[]>([
    { value: 'A', id: 1 },
    { value: 'B', id: 2 },
    { value: 'C', id: 3 },
  ]);
  const [lastAction, setLastAction] = useState<{ type: 'add' | 'remove'; id: number | null } | null>(null);

  const handleAdd = () => {
    if (!value) return;
    const newNode = { value, id: Date.now() };
    setNodes(prev => [...prev, newNode]);
    setLastAction({ type: 'add', id: newNode.id });
    setValue(String.fromCharCode(value.charCodeAt(0) + 1));
  };

  const handleRemove = () => {
    if (nodes.length === 0) return;
    const removedNode = nodes[nodes.length - 1];
    setLastAction({ type: 'remove', id: removedNode.id });
    setNodes(prev => prev.slice(0, -1));
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
        <Button onClick={handleAdd} size="sm" className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">Add</Button>
        <Button onClick={handleRemove} size="sm" variant="destructive" className="bg-red-500/20 text-red-300 hover:bg-red-500/30">Remove Last</Button>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-slate-400 mb-1">Linked List:</p>
        <div className="flex flex-wrap items-center gap-2 bg-slate-800/50 p-2 rounded-md border border-slate-700/50 min-h-[60px]">
          <div className="text-sm font-bold text-slate-400">HEAD</div>
          <ArrowRight className="text-slate-500" />
          {nodes.map((node, index) => (
            <div key={node.id} className="flex items-center gap-2">
              <div
                style={{
                  borderColor: lastAction?.id === node.id ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                  transition: 'border-color 0.5s ease',
                }}
                className="flex bg-card border-2 rounded"
              >
                <div className="w-10 h-10 flex items-center justify-center text-lg font-bold text-slate-100 border-r border-slate-600">
                  {node.value}
                </div>
                <div className="w-4 h-10 flex items-center justify-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                </div>
              </div>
              {index < nodes.length - 1 && <ArrowRight className="text-slate-500" />}
            </div>
          ))}
          {nodes.length > 0 && <ArrowRight className="text-slate-500" />}
          <div className="text-sm font-bold text-slate-400">NULL</div>
        </div>
      </div>
    </div>
  );
}
