'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Btn, Message, TreeView, boxClass, useFramePlayer, type TNode } from './shared';

type BNode = { val: number; left: BNode | null; right: BNode | null };
type Frame = { root: BNode | null; hi: string[]; visited: string[]; msg: string };

const insertNode = (n: BNode | null, v: number): BNode =>
  !n
    ? { val: v, left: null, right: null }
    : v < n.val
      ? { ...n, left: insertNode(n.left, v) }
      : { ...n, right: insertNode(n.right, v) };

const minNode = (n: BNode): BNode => (n.left ? minNode(n.left) : n);

const deleteNode = (n: BNode | null, v: number): BNode | null => {
  if (!n) return null;
  if (v < n.val) return { ...n, left: deleteNode(n.left, v) };
  if (v > n.val) return { ...n, right: deleteNode(n.right, v) };
  if (!n.left) return n.right;
  if (!n.right) return n.left;
  const next = minNode(n.right);
  return { val: next.val, left: n.left, right: deleteNode(n.right, next.val) };
};

const pathTo = (root: BNode | null, v: number): number[] => {
  const path: number[] = [];
  let cur = root;
  while (cur) {
    path.push(cur.val);
    if (v === cur.val) break;
    cur = v < cur.val ? cur.left : cur.right;
  }
  return path;
};

const toTree = (n: BNode | null): TNode | null =>
  n ? { key: String(n.val), label: String(n.val), children: [toTree(n.left), toTree(n.right)] } : null;

const build = (values: number[]) => values.reduce<BNode | null>((r, v) => insertNode(r, v), null);

const inorder = (n: BNode | null): number[] => (n ? [...inorder(n.left), n.val, ...inorder(n.right)] : []);
const preorder = (n: BNode | null): number[] => (n ? [n.val, ...preorder(n.left), ...preorder(n.right)] : []);
const postorder = (n: BNode | null): number[] => (n ? [...postorder(n.left), ...postorder(n.right), n.val] : []);
const levelOrder = (root: BNode | null): number[] => {
  const out: number[] = [];
  const queue = root ? [root] : [];
  while (queue.length) {
    const n = queue.shift()!;
    out.push(n.val);
    if (n.left) queue.push(n.left);
    if (n.right) queue.push(n.right);
  }
  return out;
};

export function BinarySearchTreeVisualization() {
  const [value, setValue] = useState('45');
  const { state, setState, run, busy } = useFramePlayer<Frame>({
    root: build([50, 30, 70, 20, 40, 60, 80]),
    hi: [],
    visited: [],
    msg: 'Try insert, search, delete, or a traversal. Left is smaller, right is bigger.',
  });
  const { root } = state;
  const num = Number(value);
  const valid = value.trim() !== '' && Number.isFinite(num);

  const walk = (target: number, done: Frame, verb: string): Frame[] => {
    const path = pathTo(root, target);
    const steps: Frame[] = path.map((v, i) => ({
      root,
      hi: [String(v)],
      visited: path.slice(0, i).map(String),
      msg:
        v === target
          ? `${v} equals ${target}. Found it.`
          : `Compare ${target} with ${v}: ${target < v ? 'smaller, go left' : 'bigger, go right'}.`,
    }));
    return [...steps, { ...done, msg: done.msg || verb }];
  };

  const insert = () => {
    if (!valid || busy) return;
    if (inorder(root).length >= 15) return setState({ ...state, msg: 'Tree is full for this demo (15 nodes). Reset it.' });
    if (inorder(root).includes(num)) return setState({ ...state, hi: [String(num)], msg: `${num} is already in the tree. Duplicates are ignored here.` });
    const next = insertNode(root, num);
    run(walk(num, { root: next, hi: [String(num)], visited: [], msg: `Inserted ${num} as a new leaf.` }, ''), 650);
  };

  const search = () => {
    if (!valid || busy) return;
    const found = inorder(root).includes(num);
    run(
      walk(num, { root, hi: found ? [String(num)] : [], visited: [], msg: found ? `Found ${num}.` : `${num} is not in the tree. We fell off a leaf.` }, ''),
      650
    );
  };

  const remove = () => {
    if (!valid || busy) return;
    if (!inorder(root).includes(num)) return setState({ ...state, msg: `${num} is not in the tree, nothing to delete.` });
    run(walk(num, { root: deleteNode(root, num), hi: [], visited: [], msg: `Deleted ${num}. If it had two children, its in-order successor took its place.` }, ''), 650);
  };

  const traverse = (name: string, order: number[]) => {
    if (busy) return;
    run(
      order.map((v, i) => ({
        root,
        hi: [String(v)],
        visited: order.slice(0, i).map(String),
        msg: `${name}: ${order.slice(0, i + 1).join(' → ')}`,
      })),
      600
    );
  };

  const reset = () => setState({ root: build([50, 30, 70, 20, 40, 60, 80]), hi: [], visited: [], msg: 'Tree reset.' });
  const randomTree = () => {
    const values = new Set<number>();
    while (values.size < 7) values.add(10 + Math.floor(Math.random() * 90));
    setState({ root: build([...values]), hi: [], visited: [], msg: 'New random tree built by inserting 7 values in order.' });
  };

  return (
    <div className={boxClass}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-slate-400">Value:</p>
        <Input value={value} onChange={(e) => setValue(e.target.value)} inputMode="numeric" className="w-20 border-slate-600 bg-slate-800" />
        <Btn onClick={insert} disabled={busy}>Insert</Btn>
        <Btn tone="yellow" onClick={search} disabled={busy}>Search</Btn>
        <Btn tone="red" onClick={remove} disabled={busy}>Delete</Btn>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <Btn tone="green" onClick={() => traverse('In-order', inorder(root))} disabled={busy}>In-order</Btn>
        <Btn tone="green" onClick={() => traverse('Pre-order', preorder(root))} disabled={busy}>Pre-order</Btn>
        <Btn tone="green" onClick={() => traverse('Post-order', postorder(root))} disabled={busy}>Post-order</Btn>
        <Btn tone="green" onClick={() => traverse('Level-order (BFS)', levelOrder(root))} disabled={busy}>Level-order</Btn>
        <Btn tone="slate" onClick={randomTree} disabled={busy}>Random</Btn>
        <Btn tone="slate" onClick={reset} disabled={busy}>Reset</Btn>
      </div>
      <TreeView root={toTree(root)} hi={state.hi} visited={state.visited} mode="inorder" />
      <Message>{state.msg}</Message>
    </div>
  );
}
