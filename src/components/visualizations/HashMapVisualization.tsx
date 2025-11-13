'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

// A simple hash function for demonstration
const simpleHash = (key: string, tableSize: number) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash + key.charCodeAt(i) * (i + 1)) % tableSize;
  }
  return hash;
};

const TABLE_SIZE = 7;

type Entry = {
  key: string;
  value: string;
  hash: number;
};

export function HashMapVisualization() {
  const [key, setKey] = useState('name');
  const [value, setValue] = useState('Alice');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [lastAction, setLastAction] = useState<{ type: 'add' | 'remove' | 'find', key: string, hash: number | null } | null>(null);

  const buckets = useMemo(() => {
    const newBuckets: (Entry[])[] = Array.from({ length: TABLE_SIZE }, () => []);
    entries.forEach(entry => {
      if (newBuckets[entry.hash]) {
        newBuckets[entry.hash].push(entry);
      }
    });
    return newBuckets;
  }, [entries]);

  const handleAdd = () => {
    if (!key) return;
    const hash = simpleHash(key, TABLE_SIZE);
    setEntries(prev => {
      // Remove existing key if it exists to update it
      const filtered = prev.filter(e => e.key !== key);
      return [...filtered, { key, value, hash }];
    });
    setLastAction({ type: 'add', key, hash });
  };
  
  const handleRemove = () => {
    if (!key) return;
    setEntries(prev => prev.filter(e => e.key !== key));
    setLastAction({ type: 'remove', key, hash: simpleHash(key, TABLE_SIZE) });
  };
  
  const handleFind = () => {
    if (!key) return;
    const hash = simpleHash(key, TABLE_SIZE);
    setLastAction({ type: 'find', key, hash });
  }

  return (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 font-code text-sm">
      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          type="text"
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-24 bg-slate-800 border-slate-600"
        />
        <Input
          type="text"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24 bg-slate-800 border-slate-600"
        />
        <Button onClick={handleAdd} size="sm" className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">Set</Button>
        <Button onClick={handleFind} size="sm" className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30">Find</Button>
        <Button onClick={handleRemove} size="sm" variant="destructive" className="bg-red-500/20 text-red-300 hover:bg-red-500/30">Remove</Button>
      </div>

      <div className="flex gap-4">
        <div className="w-1/3">
          <p className="text-slate-400 mb-2">Hash Function:</p>
          <div className="text-xs text-slate-500 bg-slate-800 p-2 rounded">
             {lastAction && `hash('${lastAction.key}') % ${TABLE_SIZE} = ${lastAction.hash}`}
             {!lastAction && `hash(key) % ${TABLE_SIZE}`}
          </div>
        </div>

        <div className="w-2/3 flex flex-col gap-2">
           <p className="text-slate-400 mb-2">Internal Array:</p>
          {buckets.map((bucket, index) => (
            <motion.div
              key={index}
              animate={{
                backgroundColor: lastAction?.hash === index ? ['hsl(var(--primary))', 'hsl(var(--card))'] : 'hsl(var(--card))'
              }}
              transition={{ duration: 1.5 }}
              className="flex items-center gap-2 bg-card p-1 rounded border border-slate-700/50"
            >
              <div className="bg-slate-700 text-slate-300 font-bold text-xs w-6 h-6 flex items-center justify-center rounded-sm flex-shrink-0">{index}</div>
              <div className="flex flex-wrap gap-1 min-h-[24px]">
                <AnimatePresence>
                {bucket.map((entry) => (
                   <motion.div
                    key={entry.key}
                    layout
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className={cn(
                      "flex items-center text-xs rounded-sm px-1.5 py-0.5",
                      lastAction?.type === 'find' && lastAction.key === entry.key ? "bg-yellow-400/30 ring-2 ring-yellow-400" : "bg-slate-800"
                    )}
                   >
                     <span className="text-cyan-300 mr-1">{`'${entry.key}':`}</span>
                     <span className="text-yellow-300">{`'${entry.value}'`}</span>
                   </motion.div>
                ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
