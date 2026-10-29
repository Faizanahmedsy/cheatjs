import { GitFork, ListTree, TextSearch, Triangle } from "lucide-react";
import type { DSATopic } from "@/lib/dsa";

// Trees, heaps, tries and graphs. Every code block is a standalone program:
// it builds its own small input, runs, and logs the result (expected output in a comment).
export const structureTopics: DSATopic[] = [
  {
    id: "tree-traversals",
    label: "Tree Traversals",
    icon: ListTree,
    href: "/dsa?topic=tree-traversals",
    content: {
      title: "Tree Traversals",
      description:
        "Visit every node of a binary tree in a chosen order: preorder, inorder, postorder (recursively or with an explicit stack) and level order with a queue. Almost every tree problem is one of these walks plus a little bookkeeping.",
      steps: [
        {
          title: "What It Is & When to Use It",
          explanation:
            "A binary tree is a set of nodes where each node holds a value and points to at most two children, left and right. A traversal is just a rule for the order in which you visit the nodes. Depth-first traversals (preorder, inorder, postorder) dive down one branch before trying the next; they differ only in when the node itself is visited relative to its children. Breadth-first (level order) visits the tree row by row. Reach for a traversal whenever a problem says traverse, serialize, depth or height, each level, path from root, subtree, or anything that needs to look at every node once.",
          code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// The tree used in every example on this page:
//
//          1
//         / \\
//        2   3
//       / \\   \\
//      4   5   6
//
const root = new TreeNode(
  1,
  new TreeNode(2, new TreeNode(4), new TreeNode(5)),
  new TreeNode(3, null, new TreeNode(6))
);

// DFS orders - the only question is WHEN you visit the node itself:
//   preorder  (node, left, right): 1 2 4 5 3 6  -> copy / serialize a tree
//   inorder   (left, node, right): 4 2 5 1 3 6  -> sorted order in a BST
//   postorder (left, right, node): 4 5 2 6 3 1  -> children before parent
//                                                 (heights, sizes, deleting)
// BFS order - one level at a time:
//   level order: [[1], [2, 3], [4, 5, 6]]       -> "each level", "min depth",
//                                                 "right side view"

// Smallest possible traversal: count the nodes.
function countNodes(node) {
  if (node === null) return 0; // empty subtree has no nodes
  return 1 + countNodes(node.left) + countNodes(node.right);
}

console.log(countNodes(root)); // 6`,
          language: "javascript",
        },
        {
          title: "The Template",
          explanation:
            "Two skeletons cover almost everything. Recursive DFS: handle the empty node, then recurse left and right, and do your work before (pre), between (in) or after (post) the two calls. BFS: put the root in a queue, and on every round of the outer loop take exactly the nodes that are currently in the queue (one level), adding their children for the next round. Height is the classic postorder computation: you need both children's answers before you can answer for the parent.",
          code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
const root = new TreeNode(
  1,
  new TreeNode(2, new TreeNode(4), new TreeNode(5)),
  new TreeNode(3, null, new TreeNode(6))
);

// ---- DFS template (recursion uses the call stack) ----
function dfs(node, order, out) {
  if (node === null) return out;           // 1. base case: empty subtree
  if (order === "pre") out.push(node.val); // 2a. visit BEFORE children
  dfs(node.left, order, out);              // 3. go left
  if (order === "in") out.push(node.val);  // 2b. visit BETWEEN children
  dfs(node.right, order, out);             // 4. go right
  if (order === "post") out.push(node.val);// 2c. visit AFTER children
  return out;
}

// ---- BFS template (explicit queue, one level per outer loop) ----
function levelOrder(root) {
  const levels = [];
  if (root === null) return levels;
  const queue = [root];
  while (queue.length > 0) {
    const size = queue.length;  // how many nodes are on THIS level
    const level = [];
    for (let i = 0; i < size; i++) {
      const node = queue.shift(); // take from the front
      level.push(node.val);
      if (node.left) queue.push(node.left);   // children go to the back,
      if (node.right) queue.push(node.right); // they form the next level
    }
    levels.push(level);
  }
  return levels;
}

// ---- Height (postorder: children first, then the node) ----
function height(node) {
  if (node === null) return 0;
  const left = height(node.left);
  const right = height(node.right);
  return 1 + Math.max(left, right);
}

console.log(dfs(root, "pre", []).join(" "));  // 1 2 4 5 3 6
console.log(dfs(root, "in", []).join(" "));   // 4 2 5 1 3 6
console.log(dfs(root, "post", []).join(" ")); // 4 5 2 6 3 1
console.log(JSON.stringify(levelOrder(root))); // [[1],[2,3],[4,5,6]]
console.log(height(root)); // 3`,
          language: "javascript",
        },
        {
          title: "Worked Example 1: Iterative Traversals with a Stack",
          explanation:
            "Recursion hides a stack; interviewers often ask you to make it explicit (LeetCode 94, 144, 145). Inorder: keep sliding left and pushing nodes; when you can't go further, pop one, visit it, and move to its right child. Preorder: pop a node, visit it, push right then left so that left comes out first. Postorder: run a mirrored preorder (node, right, left) and reverse the result to get (left, right, node).",
          code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
const root = new TreeNode(
  1,
  new TreeNode(2, new TreeNode(4), new TreeNode(5)),
  new TreeNode(3, null, new TreeNode(6))
);

function inorderIterative(root) {
  const out = [];
  const stack = [];
  let node = root;
  while (node !== null || stack.length > 0) {
    // 1. slide down the left edge, remembering every node on the way
    while (node !== null) {
      stack.push(node);
      node = node.left;
    }
    // 2. the top of the stack is the leftmost node not yet visited
    node = stack.pop();
    out.push(node.val);
    // 3. its left side is done; now handle its right subtree
    node = node.right;
  }
  return out;
}

function preorderIterative(root) {
  if (root === null) return [];
  const out = [];
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    out.push(node.val);                    // visit immediately
    if (node.right) stack.push(node.right); // push right FIRST...
    if (node.left) stack.push(node.left);   // ...so left is popped first
  }
  return out;
}

function postorderIterative(root) {
  if (root === null) return [];
  const out = [];
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    out.push(node.val);                    // builds node, right, left
    if (node.left) stack.push(node.left);
    if (node.right) stack.push(node.right);
  }
  return out.reverse();                    // reversed = left, right, node
}

console.log(inorderIterative(root).join(" "));   // 4 2 5 1 3 6
console.log(preorderIterative(root).join(" "));  // 1 2 4 5 3 6
console.log(postorderIterative(root).join(" ")); // 4 5 2 6 3 1`,
          language: "javascript",
        },
        {
          title: "Dry Run: Iterative Inorder",
          explanation:
            "Follow the stack by hand. Each pass of the outer loop first pushes the whole left edge starting at node, then pops exactly one node, visits it and jumps to its right child. When node is null and the stack is empty, every node has been visited. Notice each node is pushed once and popped once, which is why the walk is linear.",
          code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
//          1
//         / \\
//        2   3
//       / \\   \\
//      4   5   6
const root = new TreeNode(
  1,
  new TreeNode(2, new TreeNode(4), new TreeNode(5)),
  new TreeNode(3, null, new TreeNode(6))
);

function inorderIterative(root) {
  const out = [];
  const stack = [];
  let node = root;
  while (node !== null || stack.length > 0) {
    while (node !== null) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    out.push(node.val);
    node = node.right;
  }
  return out;
}

// Trace (stack shown bottom -> top, by value):
//
// pass | pushed on the way left | stack after pushes | pop | out              | node = popped.right
// -----|------------------------|--------------------|-----|------------------|--------------------
//  1   | 1, 2, 4                | [1, 2, 4]          |  4  | [4]              | null (4 has no right)
//  2   | (node is null)         | [1, 2]             |  2  | [4, 2]           | 5
//  3   | 5                      | [1, 5]             |  5  | [4, 2, 5]        | null
//  4   | (node is null)         | [1]                |  1  | [4, 2, 5, 1]     | 3
//  5   | 3                      | [3]                |  3  | [4, 2, 5, 1, 3]  | 6
//  6   | 6                      | [6]                |  6  | [4,2,5,1,3,6]    | null
// stop: node is null AND stack is empty

console.log(inorderIterative(root)); // [4, 2, 5, 1, 3, 6]`,
          language: "javascript",
        },
        {
          title: "Worked Example 2: Diameter and Maximum Path Sum",
          explanation:
            "The harder tree problems use one postorder DFS that does two jobs at once. Each call returns the best single downward branch from that node (what a parent can extend), while a variable outside the recursion records the best path that bends at the node (left branch + node + right branch). Diameter of Binary Tree (LeetCode 543) counts edges; Binary Tree Maximum Path Sum (LeetCode 124) adds values and drops branches whose sum is negative.",
          code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// Diameter: number of EDGES on the longest path between any two nodes.
function diameterOfBinaryTree(root) {
  let best = 0;
  function depth(node) {
    if (node === null) return 0;
    const left = depth(node.left);
    const right = depth(node.right);
    best = Math.max(best, left + right); // path that bends at this node
    return 1 + Math.max(left, right);    // a parent may extend ONE side only
  }
  depth(root);
  return best;
}

// Max path sum: a path may start and end anywhere.
function maxPathSum(root) {
  let best = -Infinity;
  function gain(node) {
    if (node === null) return 0;
    const left = Math.max(0, gain(node.left));   // a negative branch? skip it
    const right = Math.max(0, gain(node.right));
    best = Math.max(best, node.val + left + right);
    return node.val + Math.max(left, right);
  }
  gain(root);
  return best;
}

//          1
//         / \\
//        2   3          longest path: 4 - 2 - 1 - 3 - 6  (4 edges)
//       / \\   \\
//      4   5   6
const root = new TreeNode(
  1,
  new TreeNode(2, new TreeNode(4), new TreeNode(5)),
  new TreeNode(3, null, new TreeNode(6))
);
console.log(diameterOfBinaryTree(root)); // 4

//        -10
//        /  \\
//       9    20         best path: 15 - 20 - 7 = 42
//           /  \\        (going through -10 only gives 9 - 10 + 35 = 34)
//          15   7
const root2 = new TreeNode(
  -10,
  new TreeNode(9),
  new TreeNode(20, new TreeNode(15), new TreeNode(7))
);
// gain(9) = 9, gain(15) = 15, gain(7) = 7
// at 20: best = 20 + 15 + 7 = 42, returns 20 + 15 = 35
// at -10: candidate = -10 + 9 + 35 = 34 (< 42), so best stays 42
console.log(maxPathSum(root2)); // 42`,
          language: "javascript",
        },
        {
          title: "Time & Space Complexity",
          explanation:
            "Every traversal touches each node a constant number of times, so time is O(n). Space depends on how much you hold at once: DFS holds one root-to-leaf path (the height h), BFS holds one level (up to the width w). On a balanced tree h is about log n; on a skewed tree that looks like a linked list, h becomes n.",
          code: `// Let n = number of nodes, h = height, w = maximum width of a level.
//
// Traversal                     Time   Extra space
// ----------------------------  -----  ------------------------------
// Recursive pre/in/post order   O(n)   O(h) call stack
// Iterative with a stack        O(n)   O(h) explicit stack
// Level order (BFS)             O(n)   O(w) queue (last level ~ n/2)
// Height / diameter / path sum  O(n)   O(h)
//
// Why O(n): every node is pushed once and popped once (or called once).
//
// What h looks like:
//   balanced tree, n = 7  -> h = 3   (about log2 n)
//   skewed tree,   n = 7  -> h = 7   (a "linked list" leaning one way)

// Quick check: the widest level of a perfect tree is about half the nodes.
const nodesPerLevel = [1, 2, 4, 8];
const total = nodesPerLevel.reduce((sum, k) => sum + k, 0);
console.log(total, nodesPerLevel[nodesPerLevel.length - 1]); // 15 8`,
          language: "javascript",
        },
        {
          title: "Common Mistakes & Edge Cases",
          explanation:
            "Most bugs come from the empty tree, from forgetting that recursion depth equals tree height, and from mixing up nodes and edges when counting depth. Also remember that array.shift() is O(n) in JavaScript; for big trees use a head index instead of shifting. Below, a skewed tree shows height growing with n, and the BFS version uses a head index.",
          code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// MISTAKE 1: no null check -> "Cannot read properties of null".
//   function sum(node) { return node.val + sum(node.left) + sum(node.right); }
// FIX: always start with   if (node === null) return 0;

// MISTAKE 2: diameter in nodes instead of edges (off by one).
//   A single node has diameter 0, not 1.

// MISTAKE 3: level order without fixing "size" before the inner loop.
//   for (let i = 0; i < queue.length; i++)  <- queue grows while you loop!

// MISTAKE 4: deep recursion on a skewed tree (stack overflow around ~10k levels).
//   1 -> 2 -> 3 -> 4 (every node only has a right child)
const skewed = new TreeNode(1, null, new TreeNode(2, null, new TreeNode(3, null, new TreeNode(4))));

// FIX: an iterative BFS height that also avoids O(n) shift() with a head index.
function heightBFS(root) {
  if (root === null) return 0;
  const queue = [root];
  let head = 0;          // queue[head] is the front
  let levels = 0;
  while (head < queue.length) {
    const end = queue.length; // this level is queue[head .. end-1]
    for (let i = head; i < end; i++) {
      const node = queue[i];
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    head = end;
    levels++;
  }
  return levels;
}

console.log(heightBFS(skewed)); // 4
console.log(heightBFS(null));   // 0  (empty tree edge case)`,
          language: "javascript",
        },
        {
          title: "Practice Problems",
          explanation:
            "Work through these roughly in order. For each one, first decide which traversal it is (pre, in, post or level order) and what each call should return to its parent; the rest is usually a few lines.",
          code: `// EASY
// - Binary Tree Inorder Traversal
// - Binary Tree Preorder Traversal
// - Maximum Depth of Binary Tree
// - Same Tree
// - Invert Binary Tree
// - Diameter of Binary Tree
//
// MEDIUM
// - Binary Tree Level Order Traversal
// - Binary Tree Right Side View
// - Binary Tree Zigzag Level Order Traversal
// - Construct Binary Tree from Preorder and Inorder Traversal
//
// HARD
// - Binary Tree Maximum Path Sum
// - Serialize and Deserialize Binary Tree`,
          language: "javascript",
        },
      ],
    },
  },
  {
    id: "bst",
    label: "Binary Search Tree",
    icon: GitFork,
    href: "/dsa?topic=bst",
    content: {
      title: "Binary Search Tree (BST)",
      description:
        "A binary tree with an ordering rule: everything in a node's left subtree is smaller, everything in its right subtree is larger. That rule turns search, insert and delete into a single walk from the root, and an inorder traversal into a sorted list.",
      steps: [
        {
          title: "What It Is & When to Use It",
          explanation:
            "A BST stores values so that for every node, all values on its left are smaller and all values on its right are larger. To find a value you compare with the current node and throw away half of the remaining tree each time, exactly like binary search on a sorted array, but the structure can also grow and shrink cheaply. Use a BST when you need sorted data that changes (insert, delete, find the next bigger value, kth smallest) or when a problem gives you a BST and asks for something order-related; the signals are words like sorted, kth smallest, successor, range, closest value or validate.",
          code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

//          5
//        /   \\
//       3     8        left < node < right, at EVERY node
//      / \\   / \\
//     2   4 7   9
const root = new TreeNode(
  5,
  new TreeNode(3, new TreeNode(2), new TreeNode(4)),
  new TreeNode(8, new TreeNode(7), new TreeNode(9))
);

// Search: compare, then go left or right. Never look at the other side.
function search(node, target) {
  while (node !== null) {
    if (target === node.val) return true;
    node = target < node.val ? node.left : node.right;
  }
  return false; // fell off the tree
}

console.log(search(root, 4)); // true   path: 5 -> 3 -> 4
console.log(search(root, 6)); // false  path: 5 -> 8 -> 7 -> (7.left is null)`,
          language: "javascript",
        },
        {
          title: "The Template",
          explanation:
            "Every BST operation is the same walk: compare the target with the current node, go left if smaller, right if larger. Insert walks until it hits an empty spot and hangs the new node there. Writing insert recursively as node.left = insert(node.left, val) is a useful habit, because the same shape is reused for delete. An inorder traversal of any BST comes out sorted, which is the easiest way to check your tree.",
          code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// Insert returns the (possibly new) root of this subtree.
function insert(node, val) {
  if (node === null) return new TreeNode(val); // empty spot found: put it here
  if (val < node.val) node.left = insert(node.left, val);
  else if (val > node.val) node.right = insert(node.right, val);
  // val === node.val: duplicate, ignore it (pick a policy and stick to it)
  return node;
}

// Search, iterative: O(h) time, O(1) space.
function search(node, target) {
  while (node !== null) {
    if (target === node.val) return node;
    node = target < node.val ? node.left : node.right;
  }
  return null;
}

// Inorder of a BST = values in sorted order.
function inorder(node, out = []) {
  if (node === null) return out;
  inorder(node.left, out);
  out.push(node.val);
  inorder(node.right, out);
  return out;
}

let root = null;
for (const val of [5, 3, 8, 2, 4, 7, 9]) {
  root = insert(root, val);
}
//          5
//        /   \\
//       3     8
//      / \\   / \\
//     2   4 7   9

console.log(inorder(root));          // [2, 3, 4, 5, 7, 8, 9]
console.log(search(root, 7) !== null); // true
console.log(search(root, 1) !== null); // false`,
          language: "javascript",
        },
        {
          title: "Worked Example 1: Delete a Node (Three Cases)",
          explanation:
            "Delete Node in a BST (LeetCode 450). First walk to the node. Then: a leaf can simply disappear; a node with one child is replaced by that child; a node with two children copies the value of its inorder successor (the smallest value in its right subtree) and then deletes that successor from the right subtree, which is always case one or two because the successor has no left child.",
          code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
function insert(node, val) {
  if (node === null) return new TreeNode(val);
  if (val < node.val) node.left = insert(node.left, val);
  else if (val > node.val) node.right = insert(node.right, val);
  return node;
}
function inorder(node, out = []) {
  if (node === null) return out;
  inorder(node.left, out);
  out.push(node.val);
  inorder(node.right, out);
  return out;
}

function deleteNode(node, key) {
  if (node === null) return null;               // key not found
  if (key < node.val) {
    node.left = deleteNode(node.left, key);     // it's on the left
  } else if (key > node.val) {
    node.right = deleteNode(node.right, key);   // it's on the right
  } else {
    // found it
    if (node.left === null) return node.right;  // case 1 (leaf) + case 2
    if (node.right === null) return node.left;  // case 2 (only left child)
    // case 3: two children -> find the inorder successor
    let succ = node.right;
    while (succ.left !== null) succ = succ.left;
    node.val = succ.val;                         // copy successor's value
    node.right = deleteNode(node.right, succ.val); // remove the duplicate
  }
  return node;
}

let root = null;
for (const val of [5, 3, 8, 2, 4, 7, 9, 6]) root = insert(root, val);
//            5
//          /   \\
//         3     8
//        / \\   / \\
//       2   4 7   9
//            /
//           6

root = deleteNode(root, 2); // case 1: leaf, just removed
console.log(inorder(root)); // [3, 4, 5, 6, 7, 8, 9]

root = deleteNode(root, 7); // case 2: one child, 6 takes 7's place
console.log(inorder(root)); // [3, 4, 5, 6, 8, 9]

root = deleteNode(root, 5); // case 3: two children, successor 6 moves up
console.log(inorder(root)); // [3, 4, 6, 8, 9]
console.log(root.val);      // 6`,
          language: "javascript",
        },
        {
          title: "Dry Run: Deleting the Root (Two Children)",
          explanation:
            "Trace deleteNode(root, 5) on the tree left after the first two deletions. Each row is one function call; read the return values from the bottom up, because each call hands its result back to the parent, which stores it in node.left or node.right.",
          code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
function deleteNode(node, key) {
  if (node === null) return null;
  if (key < node.val) node.left = deleteNode(node.left, key);
  else if (key > node.val) node.right = deleteNode(node.right, key);
  else {
    if (node.left === null) return node.right;
    if (node.right === null) return node.left;
    let succ = node.right;
    while (succ.left !== null) succ = succ.left;
    node.val = succ.val;
    node.right = deleteNode(node.right, succ.val);
  }
  return node;
}

// Before:            After:
//        5                  6
//       / \\                / \\
//      3   8              3   8
//       \\ / \\              \\   \\
//       4 6  9              4   9
const root = new TreeNode(
  5,
  new TreeNode(3, null, new TreeNode(4)),
  new TreeNode(8, new TreeNode(6), new TreeNode(9))
);

// call                 | node | compare        | action
// ---------------------|------|----------------|--------------------------------------
// deleteNode(5, key=5) |  5   | 5 === 5, found | two children -> look for successor
//   succ loop          |      | succ = 8       | 8.left is 6 -> succ = 6
//   succ loop          |      | succ = 6       | 6.left is null -> stop
//                      |      |                | node.val = 6 (root now holds 6)
// deleteNode(8, key=6) |  8   | 6 < 8          | go left
// deleteNode(6, key=6) |  6   | 6 === 6, found | left is null -> return right (null)
//   back in call on 8  |      |                | 8.left = null, return 8
//   back in root call  |      |                | root.right = 8, return root (6)

const newRoot = deleteNode(root, 5);
console.log(newRoot.val, newRoot.left.val, newRoot.right.val); // 6 3 8
console.log(newRoot.right.left); // null`,
          language: "javascript",
        },
        {
          title: "Worked Example 2: Validate, Kth Smallest, Lowest Common Ancestor",
          explanation:
            "Three classics that each use the ordering rule differently. Validate Binary Search Tree (LeetCode 98) passes down the allowed range (low, high), because checking only a node against its direct children misses violations deeper down. Kth Smallest Element in a BST (LeetCode 230) runs the iterative inorder walk and stops at the kth visit. Lowest Common Ancestor of a BST (LeetCode 235) walks from the root: while both values are on the same side keep going, and the first node where they split (or that equals one of them) is the answer.",
          code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// 1) Validate: every node must sit strictly inside (low, high).
function isValidBST(node, low = -Infinity, high = Infinity) {
  if (node === null) return true;
  if (node.val <= low || node.val >= high) return false;
  return (
    isValidBST(node.left, low, node.val) &&  // left side: upper bound shrinks
    isValidBST(node.right, node.val, high)   // right side: lower bound grows
  );
}

// 2) Kth smallest: inorder visits values in sorted order; stop at visit k.
function kthSmallest(root, k) {
  const stack = [];
  let node = root;
  while (node !== null || stack.length > 0) {
    while (node !== null) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    k--;                          // one more value visited
    if (k === 0) return node.val;
    node = node.right;
  }
  return null; // k larger than the tree
}

// 3) Lowest common ancestor of values p and q.
function lowestCommonAncestor(root, p, q) {
  let node = root;
  while (node !== null) {
    if (p < node.val && q < node.val) node = node.left;       // both left
    else if (p > node.val && q > node.val) node = node.right; // both right
    else return node.val; // they split here (or one of them IS this node)
  }
  return null;
}

//          5
//        /   \\
//       3     8
//      / \\   / \\
//     2   4 7   9
const root = new TreeNode(
  5,
  new TreeNode(3, new TreeNode(2), new TreeNode(4)),
  new TreeNode(8, new TreeNode(7), new TreeNode(9))
);

// Looks fine locally, but 4 is in 5's RIGHT subtree and 4 < 5:
//       5
//      / \\
//     3   8
//        /
//       4
const bad = new TreeNode(5, new TreeNode(3), new TreeNode(8, new TreeNode(4)));

console.log(isValidBST(root)); // true
console.log(isValidBST(bad));  // false (4 is outside the range (5, 8))
console.log(kthSmallest(root, 3)); // 4   (sorted: 2, 3, 4, ...)
console.log(lowestCommonAncestor(root, 2, 4)); // 3
console.log(lowestCommonAncestor(root, 2, 9)); // 5
console.log(lowestCommonAncestor(root, 7, 8)); // 8`,
          language: "javascript",
        },
        {
          title: "Time & Space Complexity",
          explanation:
            "Search, insert and delete each follow one root-to-leaf path, so they cost O(h) where h is the height. A balanced BST has h about log n, which is why BSTs are fast; but inserting already sorted values builds a chain where h equals n, and every operation degrades to O(n). Self-balancing trees (AVL, red-black; JavaScript has none built in) keep h at O(log n) automatically.",
          code: `// h = height of the tree, n = number of nodes
//
// Operation              Balanced (h ~ log n)   Skewed (h = n)   Space
// ---------------------  ---------------------  ---------------  ---------------------
// search                 O(log n)               O(n)             O(1) iterative
// insert / delete        O(log n)               O(n)             O(h) recursive stack
// inorder (sorted list)  O(n)                   O(n)             O(h)
// validate               O(n)                   O(n)             O(h)
// kth smallest           O(h + k)               O(n)             O(h)
// LCA in a BST           O(h)                   O(n)             O(1)
//
// Compare with a sorted array: search O(log n) but insert/delete O(n)
// (shifting elements). A balanced BST gets O(log n) for all three.

// Height of a perfectly balanced BST with n nodes:
for (const n of [7, 1023, 1000000]) {
  console.log(n, Math.ceil(Math.log2(n + 1)));
}
// 7 3
// 1023 10
// 1000000 20`,
          language: "javascript",
        },
        {
          title: "Common Mistakes & Edge Cases",
          explanation:
            "The famous bug is validating with only a node and its direct children. Others: forgetting to assign the result of the recursive insert or delete back into node.left or node.right, so the change is lost; not deciding how duplicates are handled; and assuming the tree is balanced when values arrive in sorted order. The program shows the sorted-input trap.",
          code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
function insert(node, val) {
  if (node === null) return new TreeNode(val);
  if (val < node.val) node.left = insert(node.left, val);
  else if (val > node.val) node.right = insert(node.right, val);
  return node;
}
function height(node) {
  if (node === null) return 0;
  return 1 + Math.max(height(node.left), height(node.right));
}

// MISTAKE 1: local validation  (node.left.val < node.val < node.right.val)
//   passes the "bad" tree from the previous step. Pass (low, high) instead.
//
// MISTAKE 2: calling insert(node.left, val) without "node.left = ...".
//   The new node is created and immediately lost.
//
// MISTAKE 3: using < / > for bounds but forgetting duplicates.
//   Decide: ignore them, count them, or always send them right.
//
// EDGE CASES: empty tree (root = null), deleting a value that isn't there,
//   deleting the root, k larger than the node count, LCA where p is q's parent.

// MISTAKE 4: assuming O(log n). Same five values, different insert order:
let sortedTree = null;
for (const val of [1, 2, 3, 4, 5]) sortedTree = insert(sortedTree, val);
let mixedTree = null;
for (const val of [3, 2, 4, 1, 5]) mixedTree = insert(mixedTree, val);

console.log(height(sortedTree)); // 5  (1 -> 2 -> 3 -> 4 -> 5, a linked list)
console.log(height(mixedTree));  // 3`,
          language: "javascript",
        },
        {
          title: "Practice Problems",
          explanation:
            "Before coding each one, ask which BST fact it relies on: the left/right ordering (walk one path), or inorder being sorted (walk all nodes in order).",
          code: `// EASY
// - Search in a Binary Search Tree
// - Convert Sorted Array to Binary Search Tree
// - Minimum Absolute Difference in BST
// - Two Sum IV - Input is a BST
//
// MEDIUM
// - Insert into a Binary Search Tree
// - Delete Node in a BST
// - Validate Binary Search Tree
// - Kth Smallest Element in a BST
// - Lowest Common Ancestor of a Binary Search Tree
// - Binary Search Tree Iterator
// - Recover Binary Search Tree
//
// HARD
// - Count of Smaller Numbers After Self`,
          language: "javascript",
        },
      ],
    },
  },
  {
    id: "heaps",
    label: "Heaps & Priority Queue",
    icon: Triangle,
    href: "/dsa?topic=heaps",
    content: {
      title: "Heaps & Priority Queues",
      description:
        "A complete binary tree stored in a plain array, where every parent is smaller (min-heap) or larger (max-heap) than its children. It gives you the smallest item in O(1) and adds or removes items in O(log n): the engine behind top-k, kth largest, merging sorted lists, scheduling and Dijkstra.",
      steps: [
        {
          title: "What It Is & When to Use It",
          explanation:
            "A heap keeps exactly one promise: the root is the smallest item (in a min-heap). It does not keep the rest sorted, which is what makes it cheap. Because the tree is always complete (filled level by level, left to right), it fits in an array with no pointers: the children of index i live at 2i + 1 and 2i + 2, and its parent at floor((i - 1) / 2). Reach for a heap when a problem repeatedly asks for the smallest or largest item while items keep arriving: k largest, kth smallest, top k frequent, merge k sorted, closest points, schedule by earliest deadline, or a running median. JavaScript has no built-in heap, so you write a small class (next step).",
          code: `// A min-heap drawn as a tree, and the SAME heap as an array:
//
//            1                 index:  0  1  2  3  4  5
//          /   \\               value: [1, 3, 2, 7, 4, 5]
//         3     2
//        / \\   /
//       7   4 5
//
// Index maths (0-based):
//   parent(i) = Math.floor((i - 1) / 2)
//   left(i)   = 2 * i + 1
//   right(i)  = 2 * i + 2

const heap = [1, 3, 2, 7, 4, 5];

function parent(i) { return Math.floor((i - 1) / 2); }
function left(i) { return 2 * i + 1; }
function right(i) { return 2 * i + 2; }

console.log(parent(4), left(1), right(1)); // 1 3 4
// index 4 holds 4; its parent index 1 holds 3. Children of 3 are 7 and 4.

// Check the heap rule: every child >= its parent.
function isMinHeap(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[parent(i)]) return false;
  }
  return true;
}
console.log(isMinHeap(heap));            // true
console.log(isMinHeap([1, 3, 2, 0]));    // false (0 sits under 3)`,
          language: "javascript",
        },
        {
          title: "The Template: A MinHeap Class",
          explanation:
            "Push adds the new item at the end of the array (the next free leaf) and sifts it up: swap with the parent while it is smaller. Pop takes the root, moves the last item to the root, and sifts it down: swap with the smaller child while a child is smaller. Passing a compare function makes the same class a max-heap or a heap of pairs. Building a heap from an existing array (heapify) sifts down every non-leaf from the bottom up, which takes O(n) in total.",
          code: `class MinHeap {
  constructor(compare = (a, b) => a - b) {
    this.heap = [];
    this.compare = compare; // compare(a, b) < 0 means a goes above b
  }
  size() { return this.heap.length; }
  peek() { return this.heap[0]; }

  push(value) {
    this.heap.push(value);               // 1. new leaf at the end
    this.siftUp(this.heap.length - 1);   // 2. bubble it up
  }

  pop() {
    const heap = this.heap;
    if (heap.length === 0) return undefined;
    const top = heap[0];
    const last = heap.pop();             // 1. remove the last leaf
    if (heap.length > 0) {
      heap[0] = last;                    // 2. put it at the root
      this.siftDown(0);                  // 3. push it down to its place
    }
    return top;
  }

  siftUp(i) {
    const heap = this.heap;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.compare(heap[i], heap[parent]) >= 0) break; // parent is fine
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    }
  }

  siftDown(i) {
    const heap = this.heap;
    const n = heap.length;
    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;
      if (left < n && this.compare(heap[left], heap[smallest]) < 0) smallest = left;
      if (right < n && this.compare(heap[right], heap[smallest]) < 0) smallest = right;
      if (smallest === i) break;                           // both children bigger
      [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
      i = smallest;
    }
  }
}

// Heapify: turn any array into a heap in O(n), bottom-up.
function heapify(arr) {
  const h = new MinHeap();
  h.heap = arr;
  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) h.siftDown(i);
  return h;
}

const h = new MinHeap();
for (const x of [5, 3, 8, 1, 4]) h.push(x);
console.log(h.heap); // [1, 3, 8, 5, 4]   (a valid heap, NOT sorted)

const out = [];
while (h.size() > 0) out.push(h.pop());
console.log(out); // [1, 3, 4, 5, 8]   (popping gives sorted order)

console.log(heapify([9, 4, 7, 1]).heap); // [1, 4, 7, 9]

const maxHeap = new MinHeap((a, b) => b - a); // reversed compare = max-heap
for (const x of [5, 3, 8]) maxHeap.push(x);
console.log(maxHeap.peek()); // 8`,
          language: "javascript",
        },
        {
          title: "Worked Example 1: Kth Largest Element",
          explanation:
            "Kth Largest Element in an Array (LeetCode 215). Keep a min-heap that holds the k largest values seen so far. Push each number; if the heap grows past k, pop its smallest. The values that survive are the k largest, and the smallest of them, the root, is the kth largest. This is the general top-k pattern: to keep the k largest use a min-heap of size k, to keep the k smallest use a max-heap of size k.",
          code: `class MinHeap {
  constructor(compare = (a, b) => a - b) { this.heap = []; this.compare = compare; }
  size() { return this.heap.length; }
  peek() { return this.heap[0]; }
  push(value) { this.heap.push(value); this.siftUp(this.heap.length - 1); }
  pop() {
    const heap = this.heap;
    if (heap.length === 0) return undefined;
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0) { heap[0] = last; this.siftDown(0); }
    return top;
  }
  siftUp(i) {
    const heap = this.heap;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.compare(heap[i], heap[parent]) >= 0) break;
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    }
  }
  siftDown(i) {
    const heap = this.heap;
    const n = heap.length;
    while (true) {
      const left = 2 * i + 1, right = 2 * i + 2;
      let smallest = i;
      if (left < n && this.compare(heap[left], heap[smallest]) < 0) smallest = left;
      if (right < n && this.compare(heap[right], heap[smallest]) < 0) smallest = right;
      if (smallest === i) break;
      [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
      i = smallest;
    }
  }
}

function findKthLargest(nums, k) {
  const heap = new MinHeap();
  for (let i = 0; i < nums.length; i++) {
    heap.push(nums[i]);
    if (heap.size() > k) heap.pop(); // drop the smallest: it can't be in the top k
  }
  return heap.peek(); // smallest of the k largest = kth largest
}

console.log(findKthLargest([3, 2, 1, 5, 6, 4], 2)); // 5
console.log(findKthLargest([7, 10, 4, 3], 3));      // 4`,
          language: "javascript",
        },
        {
          title: "Dry Run: Kth Largest with k = 2",
          explanation:
            "Trace findKthLargest([3, 2, 1, 5, 6, 4], 2) and watch the heap array. After each push the new value sifts up; whenever the size reaches 3 the root is popped, the last element moves to the root and sifts down. The heap never holds more than k + 1 items, so each step is O(log k).",
          code: `class MinHeap {
  constructor() { this.heap = []; }
  size() { return this.heap.length; }
  peek() { return this.heap[0]; }
  push(value) {
    const heap = this.heap;
    heap.push(value);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[i] >= heap[parent]) break;
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    }
  }
  pop() {
    const heap = this.heap;
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;
      while (true) {
        const left = 2 * i + 1, right = 2 * i + 2;
        let smallest = i;
        if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
        if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
        if (smallest === i) break;
        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
        i = smallest;
      }
    }
    return top;
  }
}

// i | num | after push + sift up | size > k? | after pop + sift down
// --|-----|----------------------|-----------|-----------------------------
// 0 |  3  | [3]                  | no        | [3]
// 1 |  2  | [3,2] -> [2,3]       | no        | [2,3]
// 2 |  1  | [2,3,1] -> [1,3,2]   | yes       | pop 1, root=2 -> [2,3]
// 3 |  5  | [2,3,5]              | yes       | pop 2, root=5 -> [5,3] -> [3,5]
// 4 |  6  | [3,5,6]              | yes       | pop 3, root=6 -> [6,5] -> [5,6]
// 5 |  4  | [5,6,4] -> [4,6,5]   | yes       | pop 4, root=5 -> [5,6]
//
// End: heap = [5, 6] (the 2 largest), root = 5 = 2nd largest.

function findKthLargest(nums, k) {
  const heap = new MinHeap();
  for (let i = 0; i < nums.length; i++) {
    heap.push(nums[i]);
    if (heap.size() > k) heap.pop();
  }
  return heap.peek();
}

console.log(findKthLargest([3, 2, 1, 5, 6, 4], 2)); // 5`,
          language: "javascript",
        },
        {
          title: "Worked Example 2: Merge K Sorted Lists and Top K Frequent",
          explanation:
            "With a compare function the heap can order pairs or triples. Merge k Sorted Lists (LeetCode 23, shown with arrays): put the first item of each list in the heap as [value, listIndex, itemIndex]; repeatedly pop the smallest, append it, and push the next item from the same list. The heap never holds more than k items. Top K Frequent Elements (LeetCode 347): count with a Map, then keep a min-heap of [num, count] ordered by count and capped at size k.",
          code: `class MinHeap {
  constructor(compare = (a, b) => a - b) { this.heap = []; this.compare = compare; }
  size() { return this.heap.length; }
  peek() { return this.heap[0]; }
  push(value) { this.heap.push(value); this.siftUp(this.heap.length - 1); }
  pop() {
    const heap = this.heap;
    if (heap.length === 0) return undefined;
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0) { heap[0] = last; this.siftDown(0); }
    return top;
  }
  siftUp(i) {
    const heap = this.heap;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.compare(heap[i], heap[parent]) >= 0) break;
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    }
  }
  siftDown(i) {
    const heap = this.heap;
    const n = heap.length;
    while (true) {
      const left = 2 * i + 1, right = 2 * i + 2;
      let smallest = i;
      if (left < n && this.compare(heap[left], heap[smallest]) < 0) smallest = left;
      if (right < n && this.compare(heap[right], heap[smallest]) < 0) smallest = right;
      if (smallest === i) break;
      [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
      i = smallest;
    }
  }
}

function mergeKSorted(lists) {
  const heap = new MinHeap((a, b) => a[0] - b[0]); // order by value
  for (let i = 0; i < lists.length; i++) {
    if (lists[i].length > 0) heap.push([lists[i][0], i, 0]); // head of each list
  }
  const merged = [];
  while (heap.size() > 0) {
    const [value, i, j] = heap.pop();  // smallest head overall
    merged.push(value);
    if (j + 1 < lists[i].length) {
      heap.push([lists[i][j + 1], i, j + 1]); // its list's next item
    }
  }
  return merged;
}

function topKFrequent(nums, k) {
  const count = new Map();
  for (const num of nums) count.set(num, (count.get(num) || 0) + 1);
  const heap = new MinHeap((a, b) => a[1] - b[1]); // order by count
  for (const [num, freq] of count) {
    heap.push([num, freq]);
    if (heap.size() > k) heap.pop(); // drop the least frequent
  }
  const result = [];
  while (heap.size() > 0) result.push(heap.pop()[0]);
  return result.reverse(); // most frequent first
}

console.log(mergeKSorted([[1, 4, 5], [1, 3, 4], [2, 6]]));
// [1, 1, 2, 3, 4, 4, 5, 6]
console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2)); // [1, 2]`,
          language: "javascript",
        },
        {
          title: "Time & Space Complexity (and Heap Sort)",
          explanation:
            "Push and pop move one item along one root-to-leaf path of a complete tree, so they cost O(log n); peek is O(1). Heapify is O(n) because most nodes are near the bottom and barely move. Heap sort shows the costs together: build a max-heap in O(n), then n times swap the root to the end and sift down in O(log n), for O(n log n) time and O(1) extra space. The program below is an in-place heap sort.",
          code: `// Operation              Time        Why
// ---------------------  ----------  ---------------------------------------
// peek                   O(1)        the answer is heap[0]
// push / pop             O(log n)    one sift along the height (log n)
// heapify (build)        O(n)        most nodes are leaves and don't move
// top k / kth largest    O(n log k)  n pushes into a heap capped at k
// merge k lists (N tot)  O(N log k)  every item passes through a size-k heap
// heap sort              O(n log n)  O(1) extra space, not stable
// space for the heap     O(n)        (O(k) when capped at size k)

function heapSort(arr) {
  const n = arr.length;
  // 1. build a MAX-heap in place (largest at index 0)
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(arr, i, n);
  // 2. move the max to the end, shrink the heap, repair the root
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    siftDown(arr, 0, end); // heap is arr[0 .. end-1]
  }
  return arr;
}

function siftDown(arr, i, n) {
  while (true) {
    const left = 2 * i + 1, right = 2 * i + 2;
    let largest = i;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest === i) break;
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    i = largest;
  }
}

// [4, 10, 3, 5, 1] -> max-heap [10, 5, 3, 4, 1]
// swap 10 to the end, sift: [5, 4, 3, 1 | 10]
// swap 5:                   [4, 1, 3 | 5, 10]
// swap 4:                   [3, 1 | 4, 5, 10]
// swap 3:                   [1 | 3, 4, 5, 10]
console.log(heapSort([4, 10, 3, 5, 1])); // [1, 3, 4, 5, 10]`,
          language: "javascript",
        },
        {
          title: "Common Mistakes & Edge Cases",
          explanation:
            "Heaps are mostly bugs in the index maths or the compare direction. Use the right heap for the job (min-heap of size k for the k largest, not a max-heap of everything), remember that the array is not sorted, check the size before peek or pop, and never sort numbers with the default sort or compare with string order. The program shows the array-is-not-sorted trap and the default sort trap.",
          code: `// MISTAKE 1: 1-based formulas on a 0-based array.
//   0-based: parent = floor((i - 1) / 2), children = 2i + 1, 2i + 2
//   1-based: parent = floor(i / 2),       children = 2i,     2i + 1
//
// MISTAKE 2: sift down that only looks at the LEFT child, or swaps with the
//   first smaller child instead of the SMALLEST child -> heap rule breaks.
//
// MISTAKE 3: wrong heap direction. For the k LARGEST keep a MIN-heap of size k
//   (the root is the weakest survivor, the one to kick out).
//
// MISTAKE 4: compare returning a boolean (a < b). It must return a number.
//
// EDGE CASES: pop/peek on an empty heap, k = 0, k > n, duplicate values,
//   empty lists inside "merge k sorted lists".

// MISTAKE 5: treating the heap array as sorted.
const heapArray = [1, 3, 2, 7, 4, 5]; // a valid min-heap
console.log(heapArray[1]); // 3  -> but the 2nd smallest is actually 2!

// MISTAKE 6: default sort compares as STRINGS.
console.log([10, 1, 5].sort());                // [1, 10, 5]
console.log([10, 1, 5].sort((a, b) => a - b)); // [1, 5, 10]`,
          language: "javascript",
        },
        {
          title: "Practice Problems",
          explanation:
            "For each one, decide what goes in the heap (a value, a pair, a list head), what it is ordered by, and whether its size should be capped at k.",
          code: `// EASY
// - Last Stone Weight
// - Kth Largest Element in a Stream
// - Relative Ranks
//
// MEDIUM
// - Kth Largest Element in an Array
// - Top K Frequent Elements
// - K Closest Points to Origin
// - Task Scheduler
// - Kth Smallest Element in a Sorted Matrix
//
// HARD
// - Merge k Sorted Lists
// - Find Median from Data Stream
// - Sliding Window Maximum`,
          language: "javascript",
        },
      ],
    },
  },
  {
    id: "tries",
    label: "Tries",
    icon: TextSearch,
    href: "/dsa?topic=tries",
    content: {
      title: "Tries (Prefix Trees)",
      description:
        "A tree of characters where every path from the root spells a prefix. Words that share a beginning share a path, so checking a word or a prefix costs time proportional to its length, no matter how many words are stored.",
      steps: [
        {
          title: "What It Is & When to Use It",
          explanation:
            "A trie stores strings one character per level. The root is empty; each node has a map from a character to a child node, plus a flag that says whether a whole word ends here. To store car, cat and cart you walk c, a, then branch into r and t; car and cart share the same path and only cart continues past r. Reach for a trie when a problem talks about prefixes: autocomplete, starts with, word search over many words, longest common prefix, replacing words by their roots, or spell checking. A hash set can answer is this exact word stored, but it cannot answer which stored words start with ca without scanning everything.",
          code: `// Words: "car", "cart", "cat"
//
//   (root)
//     |
//     c
//     |
//     a
//    / \\
//   r*  t*        * = a word ends at this node (isEnd = true)
//   |
//   t*
//
// "ca"   -> path exists, but no * at 'a'  -> a PREFIX, not a word
// "car"  -> path exists and * at 'r'      -> a word
// "cars" -> no 's' under 'r'              -> neither

// The same trie as plain nested objects ("$" marks the end of a word):
const trie = { c: { a: { r: { $: true, t: { $: true } }, t: { $: true } } } };

function hasPrefix(node, prefix) {
  for (const ch of prefix) {
    if (!node[ch]) return false;
    node = node[ch];
  }
  return true;
}

console.log(hasPrefix(trie, "ca"));  // true
console.log(hasPrefix(trie, "cab")); // false`,
          language: "javascript",
        },
        {
          title: "The Template",
          explanation:
            "The whole trie is three loops that walk one character at a time. Insert creates any missing child on the way and marks the last node as the end of a word. Search and startsWith walk the same way and stop with false as soon as a character is missing; the only difference is that search also requires the final node to be marked as a word end. This is Implement Trie (LeetCode 208).",
          code: `class TrieNode {
  constructor() {
    this.children = {};  // char -> TrieNode
    this.isEnd = false;  // does a word end exactly here?
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode(); // make the path
      node = node.children[ch];
    }
    node.isEnd = true; // mark the last character
  }

  // shared walk: returns the node for this prefix, or null
  walk(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return null; // path breaks
      node = node.children[ch];
    }
    return node;
  }

  search(word) {
    const node = this.walk(word);
    return node !== null && node.isEnd; // path exists AND a word ends here
  }

  startsWith(prefix) {
    return this.walk(prefix) !== null;  // path exists, that's enough
  }
}

const trie = new Trie();
for (const word of ["apple", "app", "apt", "bat"]) trie.insert(word);

console.log(trie.search("app"));     // true
console.log(trie.search("ap"));      // false  (prefix only)
console.log(trie.startsWith("ap"));  // true
console.log(trie.search("bat"));     // true
console.log(trie.startsWith("c"));   // false`,
          language: "javascript",
        },
        {
          title: "Worked Example 1: Autocomplete",
          explanation:
            "Autocomplete is the reason tries exist. Walk to the node for the typed prefix, then run a DFS below it, carrying the letters collected so far; every node marked isEnd is a complete suggestion. Because the DFS visits children in the order they were inserted, the suggestions come out in insertion order (sort them if you need alphabetical order). The same idea solves Search Suggestions System (LeetCode 1268).",
          code: `class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }

  autocomplete(prefix) {
    // 1. walk down to the prefix node
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return []; // nothing starts with this prefix
      node = node.children[ch];
    }
    // 2. collect every word below it
    const results = [];
    function dfs(current, path) {
      if (current.isEnd) results.push(path);          // a full word
      for (const ch in current.children) {
        dfs(current.children[ch], path + ch);         // extend by one letter
      }
    }
    dfs(node, prefix);
    return results;
  }
}

const trie = new Trie();
for (const word of ["car", "card", "care", "cat", "dog"]) trie.insert(word);

console.log(trie.autocomplete("car")); // ["car", "card", "care"]
console.log(trie.autocomplete("ca"));  // ["car", "card", "care", "cat"]
console.log(trie.autocomplete("x"));   // []`,
          language: "javascript",
        },
        {
          title: "Dry Run: Insert and Autocomplete",
          explanation:
            "First watch insert build the shared path: only new characters create nodes. Then trace autocomplete(\"ca\"): the walk stops at the a node, and the DFS goes deep into r before trying t, which is why car, card and care come out before cat.",
          code: `class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}
const root = new TrieNode();

function insert(word) {
  let node = root;
  let created = 0;
  for (const ch of word) {
    if (!node.children[ch]) {
      node.children[ch] = new TrieNode();
      created++;
    }
    node = node.children[ch];
  }
  node.isEnd = true;
  return created;
}

// INSERT trace
// word   | characters walked | new nodes | why
// -------|-------------------|-----------|-------------------------------
// "car"  | c a r             | 3         | trie was empty
// "card" | c a r d           | 1         | c-a-r already there, add d
// "care" | c a r e           | 1         | reuse c-a-r, add e
// "cat"  | c a t             | 1         | reuse c-a, add t
console.log(insert("car"), insert("card"), insert("care"), insert("cat")); // 3 1 1 1

// AUTOCOMPLETE("ca") trace: walk c -> a, then dfs(node 'a', "ca")
//
// call             | isEnd? | results so far              | next children
// -----------------|--------|-----------------------------|--------------
// dfs(a, "ca")     | no     | []                          | r, t
// dfs(r, "car")    | yes    | ["car"]                     | d, e
// dfs(d, "card")   | yes    | ["car","card"]              | (none)
// dfs(e, "care")   | yes    | ["car","card","care"]       | (none)
// dfs(t, "cat")    | yes    | ["car","card","care","cat"] | (none)

function autocomplete(prefix) {
  let node = root;
  for (const ch of prefix) {
    if (!node.children[ch]) return [];
    node = node.children[ch];
  }
  const results = [];
  function dfs(current, path) {
    if (current.isEnd) results.push(path);
    for (const ch in current.children) dfs(current.children[ch], path + ch);
  }
  dfs(node, prefix);
  return results;
}

console.log(autocomplete("ca")); // ["car", "card", "care", "cat"]`,
          language: "javascript",
        },
        {
          title: "Worked Example 2: Counting Words and Prefixes, With Erase",
          explanation:
            "Implement Trie II (LeetCode 1804) adds counts. Store two numbers on each node: prefixCount (how many inserted words pass through this node) and endCount (how many inserted words end exactly here). Insert increments them along the path, so countWordsStartingWith is a single walk that reads prefixCount, and duplicates are counted correctly. Erase walks the same path and decrements; check the word exists first so counts never go negative.",
          code: `class TrieNode {
  constructor() {
    this.children = {};
    this.prefixCount = 0; // words that pass through this node
    this.endCount = 0;    // words that end exactly here
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
      node.prefixCount++;
    }
    node.endCount++;
  }

  walk(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return null;
      node = node.children[ch];
    }
    return node;
  }

  countWordsEqualTo(word) {
    const node = this.walk(word);
    return node === null ? 0 : node.endCount;
  }

  countWordsStartingWith(prefix) {
    const node = this.walk(prefix);
    return node === null ? 0 : node.prefixCount;
  }

  erase(word) {
    if (this.countWordsEqualTo(word) === 0) return; // nothing to erase
    let node = this.root;
    for (const ch of word) {
      node = node.children[ch];
      node.prefixCount--;
    }
    node.endCount--;
  }
}

const trie = new Trie();
trie.insert("apple");
trie.insert("apple"); // duplicates count twice
trie.insert("app");

console.log(trie.countWordsEqualTo("apple"));    // 2
console.log(trie.countWordsStartingWith("app")); // 3
trie.erase("apple");
console.log(trie.countWordsEqualTo("apple"));    // 1
console.log(trie.countWordsStartingWith("app")); // 2
trie.erase("banana");                            // not stored: no change
console.log(trie.countWordsStartingWith("a"));   // 2`,
          language: "javascript",
        },
        {
          title: "Time & Space Complexity",
          explanation:
            "Every trie operation walks one character per step, so it costs O(L) for a word or prefix of length L, independent of how many words are stored. Autocomplete adds the size of the subtree it has to explore. Space is the weak point: in the worst case every character of every word gets its own node, so memory is O(total characters), and each node also carries a children map.",
          code: `// L = length of the word / prefix, N = number of words,
// S = total characters across all words, A = alphabet size
//
// Operation                 Time                      Notes
// ------------------------  ------------------------  ---------------------------
// insert(word)              O(L)                      may create up to L nodes
// search(word)              O(L)
// startsWith(prefix)        O(L)
// countWordsStartingWith    O(L)                      with prefixCount stored
// autocomplete(prefix)      O(L + nodes under prefix)
// space                     O(S) nodes                each node: map up to A keys
//
// Versus a Set of words: exact lookup is O(L) too (hashing the string),
// but "all words starting with ca" needs O(S) - scanning every word.

// Shared prefixes save nodes:
const words = ["inter", "internet", "internal", "interval"];
const total = words.reduce((sum, w) => sum + w.length, 0);
// trie nodes: i-n-t-e-r (5) + "net" (3) + "nal" (3) + "val" (3) = 14
console.log(total, 14); // 29 14`,
          language: "javascript",
        },
        {
          title: "Common Mistakes & Edge Cases",
          explanation:
            "The classic bug is returning true from search when only the path exists: search must also check isEnd, otherwise every prefix of a stored word counts as a word. Others: forgetting to mark isEnd at all; erasing a word by deleting nodes that other words still need; and inconsistent case or whitespace in the input. The program shows the isEnd bug next to the fix.",
          code: `class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}
const root = new TrieNode();
function insert(word) {
  let node = root;
  for (const ch of word) {
    if (!node.children[ch]) node.children[ch] = new TrieNode();
    node = node.children[ch];
  }
  node.isEnd = true;
}
insert("apple");

// BUG: only checks that the path exists
function searchWrong(word) {
  let node = root;
  for (const ch of word) {
    if (!node.children[ch]) return false;
    node = node.children[ch];
  }
  return true;
}
// FIX: the last node must be the end of a word
function search(word) {
  let node = root;
  for (const ch of word) {
    if (!node.children[ch]) return false;
    node = node.children[ch];
  }
  return node.isEnd;
}

console.log(searchWrong("app")); // true   <- wrong, "app" was never inserted
console.log(search("app"));      // false
console.log(search("apple"));    // true

// Other traps:
// - empty string "": insert marks root.isEnd; decide if that's allowed.
// - "Apple" vs "apple": normalise with toLowerCase() before insert/search.
// - erase: never delete a node whose prefixCount is still > 0
//   (another word such as "apply" may still use it).
// - using an array of 26 children only works for lowercase a-z;
//   an object or Map works for any character.`,
          language: "javascript",
        },
        {
          title: "Practice Problems",
          explanation:
            "For each problem, decide what each node must store (just isEnd, a count, or the whole word) and whether you walk the trie once per query or explore it with DFS.",
          code: `// EASY
// - Longest Common Prefix
// - Counting Words With a Given Prefix
//
// MEDIUM
// - Implement Trie (Prefix Tree)
// - Design Add and Search Words Data Structure
// - Replace Words
// - Search Suggestions System
// - Map Sum Pairs
// - Implement Trie II (Prefix Tree)
//
// HARD
// - Word Search II
// - Palindrome Pairs`,
          language: "javascript",
        },
      ],
    },
  },
];
