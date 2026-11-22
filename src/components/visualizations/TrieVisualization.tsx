'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Btn, Message, TreeView, boxClass, useFramePlayer, type TNode } from './shared';

type TrieNode = { ch: string; end: boolean; kids: Map<string, TrieNode> };
const newNode = (ch: string): TrieNode => ({ ch, end: false, kids: new Map() });

const build = (words: string[]) => {
  const root = newNode('•');
  words.forEach((w) => {
    let cur = root;
    for (const ch of w) {
      if (!cur.kids.has(ch)) cur.kids.set(ch, newNode(ch));
      cur = cur.kids.get(ch)!;
    }
    cur.end = true;
  });
  return root;
};

const toTree = (n: TrieNode, key = ''): TNode => ({
  key,
  label: n.ch,
  mark: n.end,
  children: [...n.kids.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([c, kid]) => toTree(kid, key + c)),
});

type Frame = { words: string[]; hi: string[]; msg: string };

export function TrieVisualization() {
  const [value, setValue] = useState('can');
  const { state, setState, run, busy } = useFramePlayer<Frame>({
    words: ['cat', 'car', 'dog'],
    hi: [],
    msg: 'Each path from the top spells a word. Green ring = a word ends here. Words share their common prefix.',
  });
  const word = value.toLowerCase().replace(/[^a-z]/g, '');

  const prefixKeys = (w: string) => ['', ...[...w].map((_, i) => w.slice(0, i + 1))];

  const insert = () => {
    if (!word || busy) return;
    if (state.words.includes(word)) return setState({ ...state, hi: prefixKeys(word), msg: `"${word}" is already stored.` });
    const words = [...state.words, word];
    const trie = build(state.words);
    const frames: Frame[] = [];
    let cur = trie;
    prefixKeys(word).forEach((k, i) => {
      const ch = k.slice(-1);
      const existed = i === 0 || cur.kids.has(ch);
      if (i > 0 && existed) cur = cur.kids.get(ch)!;
      frames.push({
        words: state.words,
        hi: prefixKeys(word).slice(0, i + 1),
        msg: i === 0 ? `Start at the root to insert "${word}".` : existed ? `Letter "${ch}" already exists, reuse it.` : `Letter "${ch}" is new, create a node.`,
      });
    });
    frames.push({ words, hi: prefixKeys(word), msg: `Inserted "${word}". The last letter is marked as a word end.` });
    run(frames, 650);
  };

  const lookup = (prefixOnly: boolean) => {
    if (!word || busy) return;
    const trie = build(state.words);
    const frames: Frame[] = [];
    let cur: TrieNode | undefined = trie;
    const keys = prefixKeys(word);
    for (let i = 0; i < keys.length; i += 1) {
      if (i > 0) cur = cur?.kids.get(word[i - 1]);
      if (!cur) {
        frames.push({ words: state.words, hi: keys.slice(0, i), msg: `No "${word[i - 1]}" after "${word.slice(0, i - 1)}". Not found.` });
        return run(frames, 650);
      }
      frames.push({ words: state.words, hi: keys.slice(0, i + 1), msg: i === 0 ? 'Start at the root.' : `Follow "${word[i - 1]}".` });
    }
    const ok = prefixOnly ? true : !!cur?.end;
    frames.push({
      words: state.words,
      hi: keys,
      msg: prefixOnly
        ? `Yes, some stored word starts with "${word}".`
        : ok
          ? `"${word}" is a stored word.`
          : `Path "${word}" exists, but no word ends here (only a prefix).`,
    });
    run(frames, 650);
  };

  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-slate-400">Word:</p>
        <Input value={value} onChange={(e) => setValue(e.target.value)} maxLength={8} className="w-28 border-slate-600 bg-slate-800" />
        <Btn onClick={insert} disabled={busy}>Insert</Btn>
        <Btn tone="yellow" onClick={() => lookup(false)} disabled={busy}>Search</Btn>
        <Btn tone="green" onClick={() => lookup(true)} disabled={busy}>Starts with</Btn>
        <Btn tone="slate" onClick={() => setState({ words: ['cat', 'car', 'dog'], hi: [], msg: 'Reset.' })} disabled={busy}>Reset</Btn>
      </div>
      <TreeView root={toTree(build(state.words))} hi={state.hi} />
      <p className="mt-2 text-xs text-slate-400">Stored words: {state.words.join(', ') || 'none'}</p>
      <Message>{state.msg}</Message>
    </div>
  );
}
