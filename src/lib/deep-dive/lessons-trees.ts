import type { Lesson, StateRow } from "./types";
import { Recorder, lesson, tree } from "./recorder";

const T = "Trees";
const HP = "Heaps";
const TR = "Tries & Range Trees";

const TREE = [8, 4, 12, 2, 6, 10, 14];
const kids = (i: number, n: number) => [2 * i + 1, 2 * i + 2].filter((k) => k < n);

function traversals(): Lesson {
  const r = new Recorder([]);
  const ids = tree(r, TREE);
  const pre: number[] = [];
  const ino: number[] = [];
  const post: number[] = [];
  const st = (): StateRow[] => [
    { label: "Pre-order (me, left, right)", value: pre.length ? pre.map(String) : ["–"] },
    { label: "In-order (left, me, right)", value: ino.length ? ino.map(String) : ["–"] },
    { label: "Post-order (left, right, me)", value: post.length ? post.map(String) : ["–"] },
  ];
  r.snap("Three ways to walk a tree", "DFS goes deep first. The only difference between the three orders is WHEN you write a node down: before its children, between them, or after them.", [1], st());
  const walk = (i: number) => {
    if (i >= TREE.length) return;
    pre.push(TREE[i]);
    r.node(ids[i]!, { state: "current", tag: "pre" });
    r.snap(`Arrive at ${TREE[i]}`, `First visit to ${TREE[i]}: pre-order writes it now.`, [2], st());
    walk(2 * i + 1);
    ino.push(TREE[i]);
    r.node(ids[i]!, { state: "current", tag: "in" });
    r.snap(`Back at ${TREE[i]} from the left`, `Left side done. In-order writes ${TREE[i]} now. On a BST this gives sorted order.`, [4], st());
    walk(2 * i + 2);
    post.push(TREE[i]);
    r.node(ids[i]!, { state: "done", tag: "post" });
    if (kids(i, TREE.length).length) r.snap(`Leave ${TREE[i]}`, `Both sides done. Post-order writes ${TREE[i]} last, handy for deleting or summing children first.`, [6], st());
  };
  walk(0);
  return lesson(
    { slug: "tree-traversals", title: "Tree Traversals (DFS)", question: "94 / 144 / 145. Binary Tree Traversals", group: T, blurb: "Pre, in and post order.", problem: "Visit every node of a binary tree in pre-order, in-order and post-order." },
    `function walk(node, pre, inorder, post) {
  if (!node) return; pre.push(node.val); // before children
  walk(node.left, pre, inorder, post);
  inorder.push(node.val); // between children
  walk(node.right, pre, inorder, post);
  post.push(node.val); // after children
}`,
    r,
  );
}

function levelOrder(): Lesson {
  const r = new Recorder([]);
  const ids = tree(r, TREE);
  let queue = [0];
  const levels: number[][] = [];
  const st = (): StateRow[] => [{ label: "Queue", value: queue.length ? queue.map((i) => String(TREE[i])) : ["empty"] }, ...levels.map((l, d) => ({ label: `Level ${d}`, value: l.map(String) }))];
  r.node(ids[0]!, { state: "frontier" });
  r.snap("Level by level", "BFS uses a queue: first in, first out. Process one whole level, and queue up the next level's nodes as you go.", [1, 2], st());
  while (queue.length) {
    const level = queue.map((i) => TREE[i]);
    levels.push(level);
    const next = queue.flatMap((i) => kids(i, TREE.length));
    queue.forEach((i) => r.node(ids[i]!, { state: "done" }));
    next.forEach((i) => r.node(ids[i]!, { state: "frontier" }));
    queue = next;
    r.snap(`Level ${levels.length - 1}: ${level.join(", ")}`, `Take all ${level.length} node(s) out of the queue. Their children join the queue for the next round.`, [4, 5, 6, 7], st());
  }
  return lesson(
    { slug: "level-order-bfs", title: "Level Order (BFS)", question: "102. Binary Tree Level Order Traversal", group: T, blurb: "A queue, one level at a time.", problem: "Return the values of a binary tree level by level." },
    `function levelOrder(root) {
  const levels = [], queue = root ? [root] : [];
  while (queue.length) {
    const size = queue.length, level = [];
    for (let k = 0; k < size; k++) {
      const node = queue.shift(); level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    levels.push(level);
  }
  return levels;
}`,
    r,
  );
}

function maxDepth(): Lesson {
  const vals = [3, 9, 20, null, null, 15, 7, null, null, null, null, 1];
  const r = new Recorder([]);
  const ids = tree(r, vals);
  const depth = (i: number): number => {
    if (i >= vals.length || vals[i] === null) return 0;
    r.node(ids[i]!, { state: "frontier" });
    const d = 1 + Math.max(depth(2 * i + 1), depth(2 * i + 2));
    r.node(ids[i]!, { state: "done", tag: `h ${d}` });
    r.snap(`${vals[i]} reports ${d}`, `Ask both children for their height, take the bigger one, add 1 for ${vals[i]} itself: ${d}.`, [3], [{ label: "Answer so far", value: [String(d)] }]);
    return d;
  };
  r.snap("How deep is the tree?", "Recursion thinks small: a node's height is 1 + the taller of its two children. An empty spot has height 0.", [1, 2], []);
  depth(0);
  return lesson(
    { slug: "max-depth", title: "Max Depth (Recursion)", question: "104. Maximum Depth of Binary Tree", group: T, blurb: "1 + taller child.", problem: "Find the maximum depth of a binary tree." },
    `function maxDepth(node) {
  if (!node) return 0;
  return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
}`,
    r,
  );
}

function invert(): Lesson {
  const r = new Recorder([]);
  const ids = tree(r, TREE);
  const home = ids.map((id) => ({ x: r.get(id!).x, y: r.get(id!).y }));
  // slot[i] = which layout position node i sits in now
  const slot = TREE.map((_, i) => i);
  r.snap("Mirror the tree", "Swap every node's left and right child, all the way down. Watch whole subtrees fly across.", [1], []);
  const mirrorPos = (i: number) => {
    const level = Math.floor(Math.log2(i + 1));
    const first = 2 ** level - 1;
    return first + (2 ** (level + 1) - 2 - i);
  };
  const order = [0, 1, 2];
  for (const i of order) {
    // Swap the children subtrees of node i: every slot under it mirrors within the subtree.
    const under = (root: number): number[] => (root < TREE.length ? [root, ...under(2 * root + 1), ...under(2 * root + 2)] : []);
    const sub = under(i).filter((k) => k !== i);
    sub.forEach((k) => {
      const lvl = Math.floor(Math.log2(slot[k] + 1)) - Math.floor(Math.log2(slot[i] + 1));
      const base = (slot[i] + 1) * 2 ** lvl - 1;
      slot[k] = base + (2 ** lvl - 1) - (slot[k] - base);
      r.node(ids[k]!, { ...home[slot[k]], state: "frontier" });
    });
    r.node(ids[i]!, { state: "current" });
    r.snap(`Swap ${TREE[i]}'s children`, `${TREE[i]}'s left and right subtrees trade places, taking everything under them along.`, [3, 4], []);
    r.node(ids[i]!, { state: "done" });
  }
  void mirrorPos;
  r.snap("Mirrored", "Every node was visited once: O(n). The famous \"Homebrew\" interview question.", [5], []);
  return lesson(
    { slug: "invert-binary-tree", title: "Invert Binary Tree", question: "226. Invert Binary Tree", group: T, blurb: "Swap left and right everywhere.", problem: "Mirror a binary tree." },
    `function invertTree(node) {
  if (!node) return null;
  [node.left, node.right] = [node.right, node.left];
  invertTree(node.left); invertTree(node.right);
  return node;
}`,
    r,
  );
}

function validateBST(): Lesson {
  const vals = [8, 4, 12, 2, 9, 10, 14];
  const r = new Recorder([]);
  const ids = tree(r, vals);
  let bad = false;
  const check = (i: number, lo: number, hi: number) => {
    if (bad || i >= vals.length) return;
    const ok = lo < vals[i] && vals[i] < hi;
    r.node(ids[i]!, { state: ok ? "done" : "current", tag: `${lo === -Infinity ? "-∞" : lo}..${hi === Infinity ? "∞" : hi}` });
    r.snap(ok ? `${vals[i]} fits` : `${vals[i]} breaks the rule`, ok ? `${vals[i]} must be between ${lo === -Infinity ? "-∞" : lo} and ${hi === Infinity ? "∞" : hi}. It is.` : `${vals[i]} sits in 8's left side, so it must be below 8. It's not. Checking only parent vs child would miss this!`, ok ? [3, 4] : [3], []);
    if (!ok) return void (bad = true);
    check(2 * i + 1, lo, vals[i]);
    check(2 * i + 2, vals[i], hi);
  };
  r.snap("Is it a real BST?", "In a BST every node in the left side is smaller and every node in the right side is bigger, not just the direct children. Pass down an allowed range.", [1], []);
  check(0, -Infinity, Infinity);
  return lesson(
    { slug: "validate-bst", title: "Validate BST", question: "98. Validate Binary Search Tree", group: T, blurb: "Pass an allowed range down.", problem: "Check whether a binary tree is a valid binary search tree." },
    `function isValidBST(node, low = -Infinity, high = Infinity) {
  if (!node) return true;
  if (node.val <= low || node.val >= high) return false;
  return isValidBST(node.left, low, node.val) && // left: below me
    isValidBST(node.right, node.val, high); // right: above me
}`,
    r,
  );
}

function bstOps(): Lesson {
  const r = new Recorder([]);
  const vals: (number | null)[] = [8, 4, 12, 2, 6, 10, 14, null, null, null, null, null, null, null, null];
  const ids = tree(r, vals.map((v, i) => (i < 7 ? v : i === 11 ? 9 : null)));
  r.node(ids[11]!, { state: "hidden" });
  r.edges.forEach((e) => e.b === ids[11] && (e.state = "hidden"));
  r.snap("Binary search tree", "Smaller to the left, bigger to the right. Searching is like binary search: each step skips half the tree.", [1], []);
  const path = [0, 2, 5];
  for (const i of path) {
    r.node(ids[i]!, { state: "current" });
    r.snap(`Search 9: at ${vals[i]}`, 9 < (vals[i] as number) ? `9 < ${vals[i]}, go left.` : `9 > ${vals[i]}, go right.`, [3, 4], []);
    r.node(ids[i]!, { state: "frontier" });
  }
  r.node(ids[11]!, { state: "current", tag: "new" });
  r.edges.forEach((e) => e.b === ids[11] && (e.state = "chosen"));
  r.snap("Insert 9 here", "10's left is empty: 9 isn't in the tree, and this empty spot is exactly where it belongs. O(height): O(log n) if balanced, O(n) if it's a straight line.", [5, 6], []);
  return lesson(
    { slug: "bst-search-insert", title: "BST Search & Insert", question: "701. Insert into a BST", group: T, blurb: "Go left or right, like binary search.", problem: "Search for and insert a value into a binary search tree." },
    `function insert(node, value) {
  if (!node) return { val: value, left: null, right: null };
  if (value < node.val) node.left = insert(node.left, value);
  else node.right = insert(node.right, value);
  return node;
}
// search walks the same path and stops when it finds the value`,
    r,
  );
}

function lca(): Lesson {
  const r = new Recorder([]);
  const ids = tree(r, TREE);
  const [p, q] = [2, 6];
  r.node(ids[3]!, { state: "frontier", tag: "p" });
  r.node(ids[4]!, { state: "frontier", tag: "q" });
  r.snap(`Common boss of ${p} and ${q}`, "The lowest common ancestor is the deepest node that has both under it. In a BST: if both are smaller, go left; both bigger, go right; otherwise they split here.", [1], []);
  r.node(ids[0]!, { state: "current" });
  r.snap("At 8", `${p} and ${q} are both below 8. Go left.`, [3], []);
  r.node(ids[0]!, { state: "done" });
  r.node(ids[1]!, { state: "current", tag: "LCA" });
  r.snap("At 4: they split", `${p} < 4 < ${q}: one goes left, one right. 4 is the answer. O(height).`, [5], []);
  return lesson(
    { slug: "lowest-common-ancestor", title: "Lowest Common Ancestor", question: "235. LCA of a BST", group: T, blurb: "Where the two paths split.", problem: "Find the lowest common ancestor of two nodes in a BST." },
    `function lowestCommonAncestor(node, p, q) {
  while (node) {
    if (p.val < node.val && q.val < node.val) node = node.left;
    else if (p.val > node.val && q.val > node.val) node = node.right;
    else return node; // they split here
  }
}`,
    r,
  );
}

function diameter(): Lesson {
  const vals = [1, 2, 3, 4, 5, null, null, 8, null, null, 9];
  const r = new Recorder([]);
  const ids = tree(r, vals);
  let best = 0;
  const h = (i: number): number => {
    if (i >= vals.length || vals[i] === null) return 0;
    const L = h(2 * i + 1);
    const R = h(2 * i + 2);
    best = Math.max(best, L + R);
    r.node(ids[i]!, { state: "done", tag: `${L}+${R}` });
    r.snap(`At ${vals[i]}: ${L} + ${R}`, `The longest path bending at ${vals[i]} uses ${L} edges down the left and ${R} down the right. Best so far ${best}. Return height ${1 + Math.max(L, R)} to the parent.`, [3, 4, 5], [{ label: "Best", value: [String(best)] }]);
    return 1 + Math.max(L, R);
  };
  r.snap("Longest path in a tree", "The longest path bends at some node: down its left side plus down its right side. One post-order walk checks every bend.", [1], []);
  h(0);
  return lesson(
    { slug: "tree-diameter", title: "Diameter of a Tree", question: "543. Diameter of Binary Tree", group: T, blurb: "Left height + right height.", problem: "Find the length of the longest path between any two nodes." },
    `function diameterOfBinaryTree(root) {
  let best = 0;
  const height = (node) => { if (!node) return 0;
    const left = height(node.left), right = height(node.right);
    best = Math.max(best, left + right); return 1 + Math.max(left, right); };
  height(root); return best;
}`,
    r,
  );
}

/* ----------------------------------------------------------------- Heaps */
function heapView(r: Recorder, heap: number[], hot: number[] = [], prefix = "h") {
  const fresh = new Recorder([]);
  const ids = tree(fresh, Array.from({ length: 7 }, (_, i) => (i < heap.length ? heap[i] : null)), prefix);
  for (let i = 0; i < 7; i++) {
    const id = `${prefix}${i}`;
    const pos = fresh.nodes.get(id);
    if (!r.has(id)) {
      const tmp = new Recorder([]);
      tree(tmp, Array(7).fill(0), prefix);
      const p = tmp.get(id);
      r.add(id, p.x, p.y, "", { state: "hidden" });
    }
    r.node(id, pos ? { label: String(heap[i]), state: hot.includes(i) ? "current" : "idle", tag: i === 0 ? "top" : undefined } : { state: "hidden" });
  }
  r.edges = fresh.edges;
  return ids;
}

function heapBasics(): Lesson {
  const r = new Recorder([]);
  const heap: number[] = [];
  const st = (): StateRow[] => [{ label: "Array form", value: heap.length ? heap.map(String) : ["empty"] }];
  r.snap("Min-heap", "A heap keeps the smallest item on top. Each parent is smaller than its children. It's stored as a plain array: children of i are at 2i+1 and 2i+2.", [1], st());
  for (const v of [5, 3, 8, 1, 4]) {
    heap.push(v);
    let i = heap.length - 1;
    heapView(r, heap, [i]);
    r.snap(`push ${v}`, `Add ${v} at the bottom.`, [3], st());
    while (i > 0 && heap[(i - 1) >> 1] > heap[i]) {
      const p = (i - 1) >> 1;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
      heapView(r, heap, [i]);
      r.snap(`${v} bubbles up`, `${v} is smaller than its parent, so they swap. O(log n) swaps at most.`, [4, 5], st());
    }
  }
  const top = heap[0];
  heap[0] = heap.pop()!;
  let i = 0;
  heapView(r, heap, [0]);
  r.snap(`pop → ${top}`, `Take the top (${top}). Move the last item to the top, then let it sink.`, [7, 8], st());
  for (;;) {
    const kidsIdx = [2 * i + 1, 2 * i + 2].filter((k) => k < heap.length);
    const small = kidsIdx.reduce((a, b) => (heap[b] < heap[a] ? b : a), i);
    if (small === i) break;
    [heap[i], heap[small]] = [heap[small], heap[i]];
    i = small;
    heapView(r, heap, [i]);
    r.snap(`${heap[i]} sinks`, "Swap with the smaller child until both children are bigger.", [9, 10], st());
  }
  r.snap("Why heaps", "Push and pop are O(log n), peek is O(1). Perfect for \"give me the smallest next\": Dijkstra, schedulers, top-k.", [12], st());
  return lesson(
    { slug: "heap-push-pop", title: "Heap: Push & Pop", question: "Heap basics", group: HP, blurb: "Bubble up, sink down.", problem: "Keep the smallest item on top with O(log n) push and pop." },
    `class MinHeap {
  items = [];
  push(value) { this.items.push(value);
    let i = this.items.length - 1; // bubble up
    while (i > 0 && this.items[parent(i)] > this.items[i]) { swap(this.items, i, parent(i)); i = parent(i); }
  }
  pop() { const top = this.items[0];
    this.items[0] = this.items.pop(); // last item to the top
    let i = 0; // sink down
    while (smallerChild(i) !== -1) { const child = smallerChild(i); swap(this.items, i, child); i = child; }
    return top;
  }
} // push, pop: O(log n)`,
    r,
  );
}

function kthLargest(): Lesson {
  const nums = [3, 2, 1, 5, 6, 4];
  const k = 3;
  const r = new Recorder([]);
  const heap: number[] = [];
  const st = (): StateRow[] => [{ label: "Min-heap of the top 3", value: heap.length ? [...heap].sort((a, b) => a - b).map(String) : ["empty"] }];
  r.snap("3rd largest", "Keep a min-heap of size 3 holding the 3 biggest so far. Its top (smallest of them) is the 3rd largest.", [1], st());
  for (const v of nums) {
    heap.push(v);
    heap.sort((a, b) => a - b);
    let note = `Add ${v}.`;
    if (heap.length > k) {
      const out = heap.shift();
      note = `Add ${v}, now 4 items, so throw out the smallest (${out}).`;
    }
    heapView(r, heap, [heap.indexOf(v)]);
    r.snap(`See ${v}`, `${note} Top is ${heap[0]}.`, [3, 4], st());
  }
  r.snap(`Answer: ${heap[0]}`, "O(n log k), much better than sorting when k is small.", [6], st());
  return lesson(
    { slug: "kth-largest", title: "Kth Largest (Heap)", question: "215. Kth Largest Element in an Array", group: HP, blurb: "A size-k min-heap.", problem: "Find the kth largest element." },
    `function findKthLargest(nums, k) {
  const heap = new MinHeap();
  for (const num of nums) {
    heap.push(num);
    if (heap.size > k) heap.pop(); // drop the smallest
  }
  return heap.peek();
}`,
    r,
  );
}

function medianStream(): Lesson {
  const r = new Recorder([]);
  const low: number[] = [];
  const high: number[] = [];
  const draw = () => {
    [...r.nodes.keys()].forEach((k) => r.node(k, { state: "hidden" }));
    [...low].sort((a, b) => b - a).forEach((v, i) => r.add(`l${v}`, 0, i * 1.5, String(v), { tag: i === 0 ? "max" : undefined, state: i === 0 ? "current" : "idle" }));
    [...high].sort((a, b) => a - b).forEach((v, i) => r.add(`g${v}`, 3.5, i * 1.5, String(v), { tag: i === 0 ? "min" : undefined, state: i === 0 ? "frontier" : "idle" }));
  };
  const med = () => (low.length > high.length ? Math.max(...low) : (Math.max(...low) + Math.min(...high)) / 2);
  const st = (): StateRow[] => [{ label: "Lower half (max-heap)", value: low.map(String) }, { label: "Upper half (min-heap)", value: high.length ? high.map(String) : ["empty"] }, { label: "Median", value: [String(med())] }];
  r.snap("Median of a stream", "Numbers arrive one by one; give the middle anytime. Keep two heaps: a max-heap for the lower half and a min-heap for the upper half. The middle is at their tops.", [1, 2], [{ label: "Median", value: ["–"] }]);
  for (const v of [5, 15, 1, 3, 8]) {
    low.push(v);
    const m = Math.max(...low);
    low.splice(low.indexOf(m), 1);
    high.push(m);
    if (high.length > low.length) {
      const n = Math.min(...high);
      high.splice(high.indexOf(n), 1);
      low.push(n);
    }
    draw();
    r.snap(`Add ${v}: median ${med()}`, `${v} goes in, the halves are rebalanced so the lower half has the same size or one more. Median = ${low.length > high.length ? "top of lower" : "average of both tops"} = ${med()}.`, [4, 5, 6], st());
  }
  return lesson(
    { slug: "median-two-heaps", title: "Median: Two Heaps", question: "295. Find Median from Data Stream", group: HP, blurb: "Max-heap low half, min-heap high half.", problem: "Support adding numbers and returning the running median." },
    `class MedianFinder {
  lower = new MaxHeap(); upper = new MinHeap();
  addNum(num) {
    this.lower.push(num); this.upper.push(this.lower.pop()); // pass the biggest up
    if (this.upper.size > this.lower.size) this.lower.push(this.upper.pop());
  }
  findMedian() {
    return this.lower.size > this.upper.size ? this.lower.peek() : (this.lower.peek() + this.upper.peek()) / 2;
  }
}`,
    r,
  );
}

function mergeK(): Lesson {
  const lists = [[1, 4, 7], [2, 5, 8], [3, 6, 9]];
  const r = new Recorder([]);
  lists.forEach((l, li) => l.forEach((v, i) => r.add(`v${v}`, i * 1.8, li * 2, String(v))));
  const out: number[] = [];
  const ptr = [0, 0, 0];
  const st = (): StateRow[] => [{ label: "Heap (one front from each list)", value: ptr.map((p, li) => (p < 3 ? String(lists[li][p]) : "–")) }, { label: "Merged", value: out.length ? out.map(String) : ["empty"] }];
  const fronts = () => ptr.forEach((p, li) => p < 3 && r.node(`v${lists[li][p]}`, { state: "frontier", tag: "front" }));
  fronts();
  r.snap("Merge k sorted lists", "Only the fronts can be next. Keep the k fronts in a min-heap: pop the smallest, push its list's next item.", [1, 2], st());
  for (let s = 0; s < 9; s++) {
    let li = -1;
    ptr.forEach((p, j) => p < 3 && (li < 0 || lists[j][p] < lists[li][ptr[li]]) && (li = j));
    const v = lists[li][ptr[li]++];
    out.push(v);
    r.node(`v${v}`, { x: (out.length - 1) * 1.1 - 0.5, y: 7.5, state: "done", tag: undefined });
    fronts();
    if (s < 4 || s === 8) r.snap(`Pop ${v}`, `${v} is the smallest front. It goes to the answer, and its list's next item joins the heap.`, [4, 5, 6], st());
  }
  r.snap("O(N log k)", "Every item passes through a heap of size k once. Merging lists one by one would be O(N·k).", [8], st());
  return lesson(
    { slug: "merge-k-sorted-lists", title: "Merge K Sorted Lists", question: "23. Merge k Sorted Lists", group: HP, blurb: "A heap of the k fronts.", problem: "Merge k sorted linked lists into one sorted list." },
    `function mergeKLists(lists) {
  const heap = new MinHeap((a, b) => a.val - b.val), result = [];
  for (const head of lists) if (head) heap.push(head);
  while (heap.size) {
    const smallest = heap.pop(); result.push(smallest.val);
    if (smallest.next) heap.push(smallest.next);
  }
  return result;
}
`,
    r,
  );
}

/* --------------------------------------------------- Trie, segment tree */
function trie(): Lesson {
  const r = new Recorder([]);
  r.add("root", 4, 0, "*", { state: "done" });
  const pos: Record<string, [number, number]> = { c: [1.5, 2], a: [1.5, 4], t: [0.5, 6], r: [2.5, 6], o: [6, 2], w: [6, 4] };
  const added = new Set<string>();
  const st = (words: string[]): StateRow[] => [{ label: "Words", value: words.length ? words : ["none"] }];
  r.snap("A tree of letters", "A trie stores words letter by letter. Words that share a start share a path, so prefix questions are fast.", [1], st([]));
  const words: string[] = [];
  for (const w of ["cat", "car", "cow"]) {
    let parent = "root";
    let path = "";
    for (const ch of w) {
      path += ch;
      const id = `p${path}`;
      const key = path === "co" ? "o" : path === "cow" ? "w" : ch;
      if (!added.has(id)) {
        added.add(id);
        r.add(id, pos[key][0], pos[key][1], ch, { state: "current" });
        r.link(parent, id, { directed: true, state: "chosen" });
      } else r.node(id, { state: "frontier" });
      parent = id;
    }
    r.node(parent, { tag: "end" });
    words.push(w);
    r.snap(`Insert "${w}"`, `Follow existing letters and create the missing ones. Mark the last letter as a word end.`, [3, 4, 5, 6], st(words));
    [...added].forEach((id) => r.node(id, { state: "idle" }));
    r.edges.forEach((e) => (e.state = "idle"));
  }
  ["pc", "pca"].forEach((id) => r.node(id, { state: "current" }));
  r.snap('startsWith("ca")', "Walk c → a. Both letters exist, so some word starts with \"ca\". O(length of the prefix), no matter how many words are stored.", [8], st(words));
  return lesson(
    { slug: "trie", title: "Trie (Prefix Tree)", question: "208. Implement Trie", group: TR, blurb: "Shared prefixes share a path.", problem: "Insert words and check words or prefixes in O(length)." },
    `class Trie {
  root = {};
  insert(word) {
    let node = this.root;
    for (const letter of word) node = node[letter] ??= {};
    node.isEnd = true;
  }
  startsWith(prefix) { let node = this.root;
    for (const letter of prefix) { node = node[letter]; if (!node) return false; } return true; }
}`,
    r,
  );
}

function segmentTree(): Lesson {
  const arr = [2, 4, 5, 7];
  const sums = [18, 6, 12, 2, 4, 5, 7];
  const r = new Recorder([]);
  const ids = tree(r, sums);
  ids.forEach((id, i) => r.node(id!, { tag: i === 0 ? "0-3" : i === 1 ? "0-1" : i === 2 ? "2-3" : `${i - 3}` }));
  r.snap("Sums of ranges", `Each node stores the sum of a range of [${arr.join(", ")}]. Leaves are single items; each parent adds its two children.`, [1, 2], []);
  [2].forEach((i) => r.node(ids[i]!, { state: "current" }));
  r.node(ids[4]!, { state: "current" });
  r.snap("Sum of 1..3 = 4 + 12", "Instead of adding 3 numbers, take two stored pieces that exactly cover the range: [1] = 4 and [2-3] = 12. Any range needs at most about 2 log n pieces.", [4, 5, 6], [{ label: "Answer", value: ["16"] }]);
  [ids[2], ids[4]].forEach((id) => r.node(id!, { state: "idle" }));
  for (const [i, v] of [[5, 9], [2, 16], [0, 22]] as const) {
    r.node(ids[i]!, { label: String(v), state: "current" });
    r.snap(i === 5 ? "Update: 5 becomes 9" : `Fix parent: ${v}`, i === 5 ? "Change one item, then walk up fixing only its parents." : "Recompute this sum from its two children.", [8, 9], []);
  }
  r.snap("O(log n) both ways", "A plain array gives O(1) update but O(n) range sums; prefix sums give the opposite. A segment tree makes both O(log n).", [10], []);
  return lesson(
    { slug: "segment-tree", title: "Segment Tree", question: "307. Range Sum Query - Mutable", group: TR, blurb: "Range sums and updates in log n.", problem: "Answer range-sum queries while values keep changing." },
    `class SegmentTree {
  // node i covers a range; its value is the sum of that range
  query(node, low, high, from, to) {
    if (to < low || high < from) return 0; // no overlap
    if (from <= low && high <= to) return this.sums[node]; // fully inside
    const mid = (low + high) >> 1; return this.query(2 * node + 1, low, mid, from, to) + this.query(2 * node + 2, mid + 1, high, from, to);
  }
  update(index, value) {
    // set the leaf, then walk up fixing each parent:
    // sums[parent] = sums[left] + sums[right]
  }
}`,
    r,
  );
}

function unionFind(): Lesson {
  const r = new Recorder([["A", 1, 1], ["B", 3.5, 0], ["C", 6, 1], ["D", 1, 4], ["E", 3.5, 5], ["F", 6, 4]]);
  const parent: Record<string, string> = { A: "A", B: "B", C: "C", D: "D", E: "E", F: "F" };
  const find = (x: string): string => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const st = (): StateRow[] => [{ label: "Leader", value: Object.keys(parent).map((k) => `${k}→${find(k)}`) }, { label: "Groups", value: [String(new Set(Object.keys(parent).map(find)).size)] }];
  Object.keys(parent).forEach((k) => r.node(k, { tag: k }));
  r.snap("Union-Find", "Track which friends are in the same group. Each person points to a leader; two people are in one group if they have the same leader.", [1], st());
  for (const [a, b] of [["A", "B"], ["D", "E"], ["B", "C"], ["E", "A"]]) {
    const ra = find(a);
    const rb = find(b);
    parent[ra] = rb;
    r.link(a, b, { state: "chosen" });
    Object.keys(parent).forEach((k) => r.node(k, { tag: find(k), state: find(k) === rb ? "current" : "idle" }));
    r.snap(`union(${a}, ${b})`, `${a}'s leader is ${ra}, ${b}'s is ${rb}. Point ${ra} at ${rb}: the two groups become one.`, [3, 4, 5], st());
  }
  r.snap("Path compression", "find() also points everyone it passes straight at the leader, so later finds are almost instant: nearly O(1).", [2], st());
  return lesson(
    { slug: "union-find", title: "Union-Find", question: "547. Number of Provinces", group: "Graph search", blurb: "Leaders and merging groups.", problem: "Keep track of connected groups as connections are added." },
    `const parent = {};
const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x]))); // path compression
function union(a, b) {
  const leaderA = find(a), leaderB = find(b);
  if (leaderA !== leaderB) parent[leaderA] = leaderB; // merge groups
}`,
    r,
  );
}

export const TREE_LESSONS: Lesson[] = [traversals(), levelOrder(), maxDepth(), invert(), validateBST(), bstOps(), lca(), diameter(), heapBasics(), kthLargest(), medianStream(), mergeK(), trie(), segmentTree(), unionFind()];
