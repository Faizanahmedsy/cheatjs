import type { Problem } from "./problem-types";

/** Binary Trees & BST (66–80) and Graphs & Grids (81–90). */
export const TREE_GRAPH_PROBLEMS: Problem[] = [
  // ─────────────────────────── Binary Trees & BST ───────────────────────────
  {
    id: "maximum-depth-of-binary-tree",
    number: 66,
    title: "Maximum Depth of Binary Tree",
    group: "Binary Trees & BST",
    difficulty: "Easy",
    statement:
      "Given the root of a binary tree, return its depth: the number of nodes on the longest path from the root down to a leaf.",
    example: "root = [3,9,20,null,null,15,7] → 3",
    approach:
      "The depth of a tree is 1 (for the root) plus the deeper of its two subtrees. An empty tree has depth 0, which stops the recursion. Each node is visited once, and its answer is built from its children's answers on the way back up.",
    watch: [
      "every call first checks `node === null`: an empty spot returns 0",
      "`left` and `right` hold the depths of the two subtrees once their calls return",
      "the answer for a node is `1 + Math.max(left, right)`",
      "the call stack grows down one branch, then unwinds with the depths",
    ],
    complexity: { time: "O(n)", space: "O(h)" },
    code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function maxDepth(node) {
  if (node === null) return 0; // empty tree has no depth
  const left = maxDepth(node.left); // depth of the left subtree
  const right = maxDepth(node.right); // depth of the right subtree
  return 1 + Math.max(left, right); // this node + the deeper side
}

//      3
//     / \\
//    9   20
//       /  \\
//      15   7
const root = new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)));
console.log(maxDepth(root)); // expected: 3`,
  },
  {
    id: "same-tree",
    number: 67,
    title: "Same Tree",
    group: "Binary Trees & BST",
    difficulty: "Easy",
    statement:
      "Given the roots of two binary trees, decide whether they are the same: identical shape, and equal values in every matching position.",
    example: "p = [1,2,3], q = [1,2,3] → true",
    approach:
      "Walk both trees together. Two empty spots match; one empty and one not, or two different values, means the trees differ. Otherwise the trees are the same only if both the left pair and the right pair are the same.",
    watch: [
      "`p` and `q` always point at matching positions in the two trees",
      "both `null` means this spot matches: return true",
      "one `null`, or `p.val !== q.val`, ends the comparison with false",
      "the left pair is checked fully before the right pair starts",
    ],
    complexity: { time: "O(n)", space: "O(h)" },
    code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function isSameTree(p, q) {
  if (p === null && q === null) return true; // both empty: same
  if (p === null || q === null) return false; // only one empty: different
  if (p.val !== q.val) return false; // values differ
  // both subtrees must match too
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}

const p = new TreeNode(1, new TreeNode(2), new TreeNode(3));
const q = new TreeNode(1, new TreeNode(2), new TreeNode(3));
console.log(isSameTree(p, q)); // expected: true`,
  },
  {
    id: "invert-binary-tree",
    number: 68,
    title: "Invert Binary Tree",
    group: "Binary Trees & BST",
    difficulty: "Easy",
    statement:
      "Given the root of a binary tree, mirror it: every node's left and right children swap places. Return the root of the mirrored tree.",
    example: "root = [4,2,7,1,3,6,9] → [4,7,2,9,6,3,1]",
    approach:
      "Swap the two children of the current node, then do the same for each child's subtree. Every node gets its children swapped exactly once, so the whole tree ends up mirrored. The result is printed level by level.",
    watch: [
      "`temp` holds the old left child while the swap happens",
      "after the swap, `node.left` and `node.right` arrows point the other way",
      "the recursion then inverts each subtree in turn",
      "`toLevels` reads the finished tree row by row with a `queue` and `head`",
    ],
    complexity: { time: "O(n)", space: "O(h)" },
    code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function invertTree(node) {
  if (node === null) return null; // nothing to swap
  const temp = node.left; // swap the two children
  node.left = node.right;
  node.right = temp;
  invertTree(node.left); // then mirror each subtree
  invertTree(node.right);
  return node;
}

// read the tree level by level into a plain array
function toLevels(root) {
  const out = [];
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    out.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return out;
}

const root = new TreeNode(
  4,
  new TreeNode(2, new TreeNode(1), new TreeNode(3)),
  new TreeNode(7, new TreeNode(6), new TreeNode(9))
);
console.log(toLevels(invertTree(root))); // expected: [4, 7, 2, 9, 6, 3, 1]`,
  },
  {
    id: "symmetric-tree",
    number: 69,
    title: "Symmetric Tree",
    group: "Binary Trees & BST",
    difficulty: "Easy",
    statement:
      "Given the root of a binary tree, decide whether it is a mirror image of itself around its centre line.",
    example: "root = [1,2,2,3,4,4,3] → true",
    approach:
      "The tree is symmetric when its left and right subtrees mirror each other. Two subtrees mirror each other when their roots have the same value, the outer pair (a.left, b.right) mirrors, and the inner pair (a.right, b.left) mirrors. It is Same Tree with one side flipped.",
    watch: [
      "`a` walks the left half while `b` walks the right half in mirror order",
      "the outer pair `a.left` / `b.right` is compared first",
      "then the inner pair `a.right` / `b.left`",
      "a `null` meeting a node, or two different values, returns false",
    ],
    complexity: { time: "O(n)", space: "O(h)" },
    code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function isMirror(a, b) {
  if (a === null && b === null) return true; // both empty
  if (a === null || b === null) return false; // one side missing
  if (a.val !== b.val) return false; // values differ
  // outer pair and inner pair must both mirror
  return isMirror(a.left, b.right) && isMirror(a.right, b.left);
}

function isSymmetric(root) {
  return isMirror(root.left, root.right);
}

//        1
//      /   \\
//     2     2
//    / \\   / \\
//   3   4 4   3
const root = new TreeNode(
  1,
  new TreeNode(2, new TreeNode(3), new TreeNode(4)),
  new TreeNode(2, new TreeNode(4), new TreeNode(3))
);
console.log(isSymmetric(root)); // expected: true`,
  },
  {
    id: "path-sum",
    number: 70,
    title: "Path Sum",
    group: "Binary Trees & BST",
    difficulty: "Easy",
    statement:
      "Given the root of a binary tree and a target, decide whether some path from the root down to a leaf has values adding up exactly to the target.",
    example: "root = [5,4,8,11,null,13,4], targetSum = 20 → true",
    approach:
      "Subtract each node's value from the target as you go down. When you reach a leaf, the path works if what is left is exactly 0. The answer is true if either subtree finds such a path.",
    watch: [
      "`remaining` shrinks by `node.val` at every level",
      "a leaf is a node with no `left` and no `right`: that is where the check happens",
      "at leaf 11, `remaining` is 0, so the left side returns true",
      "`||` means the right subtree is never searched once the left one succeeds",
    ],
    complexity: { time: "O(n)", space: "O(h)" },
    code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function hasPathSum(node, target) {
  if (node === null) return false; // no path through an empty spot
  const remaining = target - node.val; // what the rest of the path must add up to
  if (node.left === null && node.right === null) {
    return remaining === 0; // at a leaf: did we hit the target exactly?
  }
  // try going left, then right
  return hasPathSum(node.left, remaining) || hasPathSum(node.right, remaining);
}

//        5
//       / \\
//      4   8
//     /   / \\
//    11  13  4
const root = new TreeNode(
  5,
  new TreeNode(4, new TreeNode(11)),
  new TreeNode(8, new TreeNode(13), new TreeNode(4))
);
console.log(hasPathSum(root, 20)); // expected: true`,
  },
  {
    id: "binary-tree-preorder-traversal",
    number: 71,
    title: "Binary Tree Preorder Traversal",
    group: "Binary Trees & BST",
    difficulty: "Easy",
    statement:
      "Given the root of a binary tree, list its values in preorder: the node first, then its left subtree, then its right subtree.",
    example: "root = [1,2,3,4,5] → [1,2,4,5,3]",
    approach:
      "Use a stack instead of recursion. Pop a node, record it, then push its right child and then its left child. Because a stack is last-in first-out, the left child comes off next, which gives node → left → right.",
    watch: [
      "`stack` starts with just the root",
      "each pass pops one `node` and pushes its value onto `result`",
      "right is pushed before left, so left is popped first",
      "the loop ends when `stack` is empty",
    ],
    complexity: { time: "O(n)", space: "O(h)" },
    code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function preorderTraversal(root) {
  const result = [];
  const stack = [root]; // nodes waiting to be visited
  while (stack.length > 0) {
    const node = stack.pop(); // visit the most recent one
    result.push(node.val); // node first
    if (node.right) stack.push(node.right); // right waits longer
    if (node.left) stack.push(node.left); // left comes off next
  }
  return result;
}

//       1
//      / \\
//     2   3
//    / \\
//   4   5
const root = new TreeNode(1, new TreeNode(2, new TreeNode(4), new TreeNode(5)), new TreeNode(3));
console.log(preorderTraversal(root)); // expected: [1, 2, 4, 5, 3]`,
  },
  {
    id: "binary-tree-inorder-traversal",
    number: 72,
    title: "Binary Tree Inorder Traversal",
    group: "Binary Trees & BST",
    difficulty: "Easy",
    statement:
      "Given the root of a binary tree, list its values in inorder: the left subtree first, then the node, then the right subtree.",
    example: "root = [1,2,3,4,5] → [4,2,5,1,3]",
    approach:
      "Walk left as far as possible, pushing every node on the way onto a stack. When there is nothing further left, pop a node, record it, then move to its right child and repeat. The stack remembers the nodes whose left side is still being explored.",
    watch: [
      "`curr` slides down the left edge, filling `stack`",
      "when `curr` becomes null, the top of `stack` is the next node to record",
      "after recording, `curr` jumps to that node's right child",
      "the loop runs while `curr` is not null or `stack` still has nodes",
    ],
    complexity: { time: "O(n)", space: "O(h)" },
    code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function inorderTraversal(root) {
  const result = [];
  const stack = []; // nodes whose left side we are still exploring
  let curr = root;
  while (curr !== null || stack.length > 0) {
    // go as far left as possible
    while (curr !== null) {
      stack.push(curr);
      curr = curr.left;
    }
    curr = stack.pop(); // leftmost unvisited node
    result.push(curr.val); // record it
    curr = curr.right; // then explore its right side
  }
  return result;
}

//       1
//      / \\
//     2   3
//    / \\
//   4   5
const root = new TreeNode(1, new TreeNode(2, new TreeNode(4), new TreeNode(5)), new TreeNode(3));
console.log(inorderTraversal(root)); // expected: [4, 2, 5, 1, 3]`,
  },
  {
    id: "binary-tree-postorder-traversal",
    number: 73,
    title: "Binary Tree Postorder Traversal",
    group: "Binary Trees & BST",
    difficulty: "Easy",
    statement:
      "Given the root of a binary tree, list its values in postorder: the left subtree first, then the right subtree, then the node itself.",
    example: "root = [1,2,3,4,5] → [4,5,2,3,1]",
    approach:
      "A short recursive walk does it: visit the left subtree, visit the right subtree, and only then record the node. A node is recorded after both of its children are finished, so the root always comes last.",
    watch: [
      "`visit` returns straight away on a `null` child",
      "a node's value is pushed only after both of its recursive calls return",
      "leaves 4 and 5 are recorded before their parent 2",
      "the root 1 is the very last value added to `result`",
    ],
    complexity: { time: "O(n)", space: "O(h)" },
    code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function postorderTraversal(root) {
  const result = [];
  function visit(node) {
    if (node === null) return; // empty spot: nothing to do
    visit(node.left); // left subtree first
    visit(node.right); // then right subtree
    result.push(node.val); // node last
  }
  visit(root);
  return result;
}

//       1
//      / \\
//     2   3
//    / \\
//   4   5
const root = new TreeNode(1, new TreeNode(2, new TreeNode(4), new TreeNode(5)), new TreeNode(3));
console.log(postorderTraversal(root)); // expected: [4, 5, 2, 3, 1]`,
  },
  {
    id: "binary-tree-level-order-traversal",
    number: 74,
    title: "Binary Tree Level Order Traversal",
    group: "Binary Trees & BST",
    difficulty: "Medium",
    statement:
      "Given the root of a binary tree, return its values level by level, from top to bottom and left to right within each level.",
    example: "root = [3,9,20,null,null,15,7] → [[3],[9,20],[15,7]]",
    approach:
      "Breadth-first search with a queue. At the start of each level, the queue holds exactly that level's nodes, so count them first. Take that many nodes off the queue, record their values, and add their children, which form the next level.",
    watch: [
      "`queue` grows at the back while `head` moves forward to read from the front",
      "`size` is fixed at the start of each level: that is how levels are kept apart",
      "`level` collects one row, then is pushed onto `result`",
      "children added during a level are only read in the next level",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function levelOrder(root) {
  const result = [];
  const queue = [root];
  let head = 0; // index of the next node to take from the queue
  while (head < queue.length) {
    const size = queue.length - head; // nodes on this level
    const level = [];
    for (let i = 0; i < size; i++) {
      const node = queue[head++]; // take from the front
      level.push(node.val);
      if (node.left) queue.push(node.left); // next level waits behind
      if (node.right) queue.push(node.right);
    }
    result.push(level); // one finished row
  }
  return result;
}

const root = new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)));
console.log(levelOrder(root)); // expected: [[3], [9, 20], [15, 7]]`,
  },
  {
    id: "diameter-of-binary-tree",
    number: 75,
    title: "Diameter of Binary Tree",
    group: "Binary Trees & BST",
    difficulty: "Easy",
    statement:
      "Given the root of a binary tree, return its diameter: the number of edges on the longest path between any two nodes. The path does not have to pass through the root.",
    example: "root = [1,2,3,4,5] → 3",
    approach:
      "Compute each node's height bottom-up. The longest path that bends at a node uses its left height plus its right height, so check that against the best so far. Returning the height and updating the best in the same walk visits each node only once.",
    watch: [
      "`height` returns 0 for an empty spot",
      "`left + right` is the longest path that turns at this node",
      "`best` only ever grows: watch it jump to 3 at the root (4→2→1→3)",
      "each call returns `1 + Math.max(left, right)` to its parent",
    ],
    complexity: { time: "O(n)", space: "O(h)" },
    code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function diameterOfBinaryTree(root) {
  let best = 0; // longest path found so far, in edges
  function height(node) {
    if (node === null) return 0;
    const left = height(node.left); // height of the left side
    const right = height(node.right); // height of the right side
    best = Math.max(best, left + right); // path bending at this node
    return 1 + Math.max(left, right);
  }
  height(root);
  return best;
}

//       1
//      / \\
//     2   3
//    / \\
//   4   5
const root = new TreeNode(1, new TreeNode(2, new TreeNode(4), new TreeNode(5)), new TreeNode(3));
console.log(diameterOfBinaryTree(root)); // expected: 3`,
  },
  {
    id: "balanced-binary-tree",
    number: 76,
    title: "Balanced Binary Tree",
    group: "Binary Trees & BST",
    difficulty: "Easy",
    statement:
      "Given the root of a binary tree, decide whether it is height-balanced: at every node, the heights of the left and right subtrees differ by at most 1.",
    example: "root = [3,9,20,null,null,15,7] → true",
    approach:
      "Compute heights bottom-up, but use -1 as a signal for 'not balanced'. If either child reports -1, or the two heights differ by more than 1, pass -1 straight up. The tree is balanced when the root does not return -1.",
    watch: [
      "`left` and `right` are the heights of the two subtrees",
      "`Math.abs(left - right) > 1` is the balance test at each node",
      "a -1 from any child is passed straight up without more work",
      "at the root, 9 has height 1 and 20 has height 2: a difference of 1 is fine",
    ],
    complexity: { time: "O(n)", space: "O(h)" },
    code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// returns the height, or -1 if the subtree is not balanced
function check(node) {
  if (node === null) return 0;
  const left = check(node.left);
  if (left === -1) return -1; // left side already unbalanced
  const right = check(node.right);
  if (right === -1) return -1; // right side already unbalanced
  if (Math.abs(left - right) > 1) return -1; // this node is unbalanced
  return 1 + Math.max(left, right);
}

function isBalanced(root) {
  return check(root) !== -1;
}

const root = new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)));
console.log(isBalanced(root)); // expected: true`,
  },
  {
    id: "convert-sorted-array-to-bst",
    number: 77,
    title: "Convert Sorted Array to Binary Search Tree",
    group: "Binary Trees & BST",
    difficulty: "Easy",
    statement:
      "Given a sorted array, build a height-balanced binary search tree from it. The program prints the new tree's values level by level.",
    example: "nums = [-10,-3,0,5,9] → [0,-10,5,-3,9]",
    approach:
      "The middle element becomes the root, so half the values go left and half go right. Build the left subtree from the left half and the right subtree from the right half the same way. Picking the middle every time keeps the two sides within one node of each other.",
    watch: [
      "`lo` and `hi` mark the part of `nums` this call is building from",
      "`mid` is the middle of that part: its value becomes the new node",
      "the left call works on `lo..mid-1`, the right call on `mid+1..hi`",
      "when `lo > hi` the range is empty and the call returns null",
    ],
    complexity: { time: "O(n)", space: "O(log n)" },
    code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function sortedArrayToBST(nums) {
  function build(lo, hi) {
    if (lo > hi) return null; // empty range: no node
    const mid = Math.floor((lo + hi) / 2); // middle value is the root
    const node = new TreeNode(nums[mid]);
    node.left = build(lo, mid - 1); // smaller values go left
    node.right = build(mid + 1, hi); // larger values go right
    return node;
  }
  return build(0, nums.length - 1);
}

// read the tree level by level into a plain array
function toLevels(root) {
  const out = [];
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    out.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return out;
}

const nums = [-10, -3, 0, 5, 9];
console.log(toLevels(sortedArrayToBST(nums))); // expected: [0, -10, 5, -3, 9]`,
  },
  {
    id: "validate-binary-search-tree",
    number: 78,
    title: "Validate Binary Search Tree",
    group: "Binary Trees & BST",
    difficulty: "Medium",
    statement:
      "Given the root of a binary tree, decide whether it is a valid binary search tree: every value in a node's left subtree is smaller than it, and every value in its right subtree is larger.",
    example: "root = [5,3,7,1,6] → false",
    approach:
      "Checking each node only against its own children is not enough. Instead, pass down a range (`low`, `high`) that every value in the subtree must fit inside. Going left lowers the upper limit to the parent's value; going right raises the lower limit.",
    watch: [
      "`low` and `high` start at -Infinity and Infinity",
      "going left, `high` becomes the parent's value; going right, `low` does",
      "node 6 is a fine right child of 3, but it sits in 5's left subtree",
      "at node 6 the range is (3, 5), so 6 fails and false comes back up",
    ],
    complexity: { time: "O(n)", space: "O(h)" },
    code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function isValidBST(node, low = -Infinity, high = Infinity) {
  if (node === null) return true; // an empty tree is valid
  if (node.val <= low || node.val >= high) return false; // outside the allowed range
  // left values must stay below node.val, right values above it
  return isValidBST(node.left, low, node.val) && isValidBST(node.right, node.val, high);
}

//        5
//       / \\
//      3   7
//     / \\
//    1   6   <- 6 is bigger than 5 but sits on 5's left
const root = new TreeNode(5, new TreeNode(3, new TreeNode(1), new TreeNode(6)), new TreeNode(7));
console.log(isValidBST(root)); // expected: false`,
  },
  {
    id: "kth-smallest-element-in-a-bst",
    number: 79,
    title: "Kth Smallest Element in a BST",
    group: "Binary Trees & BST",
    difficulty: "Medium",
    statement:
      "Given the root of a binary search tree and a number k, return the k-th smallest value in the tree (counting from 1).",
    example: "root = [5,3,6,2,4,null,null,1], k = 3 → 3",
    approach:
      "An inorder walk of a binary search tree visits the values in sorted order. So walk inorder with a stack and count the nodes as they are visited; the k-th one visited is the answer, and the walk can stop right there.",
    watch: [
      "`curr` runs down the left edge, filling `stack` with 5, 3, 2, 1",
      "each pop is the next smallest value, and `count` goes up by one",
      "when `count === k` the walk stops early without touching the rest",
    ],
    complexity: { time: "O(h + k)", space: "O(h)" },
    code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function kthSmallest(root, k) {
  const stack = [];
  let curr = root;
  let count = 0; // how many values we have visited in sorted order
  while (curr !== null || stack.length > 0) {
    while (curr !== null) {
      stack.push(curr); // go as far left as possible
      curr = curr.left;
    }
    curr = stack.pop(); // next smallest value
    count++;
    if (count === k) return curr.val; // found the k-th one
    curr = curr.right;
  }
  return -1; // k is larger than the tree
}

//          5
//         / \\
//        3   6
//       / \\
//      2   4
//     /
//    1
const root = new TreeNode(5, new TreeNode(3, new TreeNode(2, new TreeNode(1)), new TreeNode(4)), new TreeNode(6));
console.log(kthSmallest(root, 3)); // expected: 3`,
  },
  {
    id: "lowest-common-ancestor-of-a-bst",
    number: 80,
    title: "Lowest Common Ancestor of a Binary Search Tree",
    group: "Binary Trees & BST",
    difficulty: "Medium",
    statement:
      "Given a binary search tree and two values p and q in it, return the lowest node that has both of them in its subtree. A node counts as being in its own subtree.",
    example: "root = [6,2,8,0,4,7,9], p = 0, q = 4 → 2",
    approach:
      "Start at the root. If both values are smaller than the current node, the answer is in the left subtree; if both are larger, it is in the right subtree. The first node where they split (or where one of them equals the node) is the lowest common ancestor.",
    watch: [
      "`node` moves down one level per pass; no recursion and no stack",
      "at 6, both 0 and 4 are smaller, so `node` goes left",
      "at 2, 0 is smaller and 4 is larger: they split here, so 2 is the answer",
    ],
    complexity: { time: "O(h)", space: "O(1)" },
    code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function lowestCommonAncestor(root, p, q) {
  let node = root;
  while (node !== null) {
    if (p < node.val && q < node.val) {
      node = node.left; // both are smaller: go left
    } else if (p > node.val && q > node.val) {
      node = node.right; // both are larger: go right
    } else {
      return node.val; // they split here (or one of them is here)
    }
  }
  return null;
}

//        6
//      /   \\
//     2     8
//    / \\   / \\
//   0   4 7   9
const root = new TreeNode(
  6,
  new TreeNode(2, new TreeNode(0), new TreeNode(4)),
  new TreeNode(8, new TreeNode(7), new TreeNode(9))
);
console.log(lowestCommonAncestor(root, 0, 4)); // expected: 2`,
  },

  // ───────────────────────────── Graphs & Grids ─────────────────────────────
  {
    id: "number-of-islands",
    number: 81,
    title: "Number of Islands",
    group: "Graphs & Grids",
    difficulty: "Medium",
    statement:
      'Given a grid of "1" (land) and "0" (water), count the islands. An island is a group of land cells joined up, down, left or right.',
    example: 'grid = [["1","1","0","0"],["1","0","0","1"],["0","0","1","1"]] → 2',
    approach:
      "Scan every cell. When you find land that has not been counted yet, that is a new island: add one, then sink the whole island by turning every connected land cell into water with a depth-first search. Sunk cells are never counted again.",
    watch: [
      "`row` and `col` scan the grid cell by cell",
      'a "1" found by the scan adds one to `count` and starts `sink`',
      'inside `sink`, each land cell becomes "0", then its four neighbours are tried',
      "calls on water or off the grid return straight away",
    ],
    complexity: { time: "O(m·n)", space: "O(m·n)" },
    code: `function numIslands(grid) {
  const rows = grid.length;
  const cols = grid[0].length;

  // turn this land cell and all land joined to it into water
  function sink(row, col) {
    if (row < 0 || col < 0 || row >= rows || col >= cols) return; // off the grid
    if (grid[row][col] !== "1") return; // water, or already sunk
    grid[row][col] = "0";
    sink(row + 1, col); // down
    sink(row - 1, col); // up
    sink(row, col + 1); // right
    sink(row, col - 1); // left
  }

  let count = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] === "1") {
        count++; // a new island
        sink(row, col); // so it is not counted again
      }
    }
  }
  return count;
}

const grid = [
  ["1", "1", "0", "0"],
  ["1", "0", "0", "1"],
  ["0", "0", "1", "1"],
];
console.log(numIslands(grid)); // expected: 2`,
  },
  {
    id: "clone-graph",
    number: 82,
    title: "Clone Graph",
    group: "Graphs & Grids",
    difficulty: "Medium",
    statement:
      "Given one node of a connected undirected graph, return a deep copy of the whole graph: brand-new nodes with the same values and the same connections.",
    example: "adjList = [[2,4],[1,3],[2,4],[1,3]] → [[2,4],[1,3],[2,4],[1,3]]",
    approach:
      "Walk the graph with depth-first search and keep a Map from each original node to its copy. Before copying a node, check the Map: if it is already there, reuse that copy. That stops the walk from going round the cycle forever and makes shared neighbours point to the same copy.",
    watch: [
      "`copies` maps every original node to its new twin",
      "a copy is stored in `copies` before its neighbours are visited — that breaks the cycle",
      "when a neighbour is already in `copies`, the stored copy is reused",
      "the original nodes and the copies are separate objects with the same shape",
    ],
    complexity: { time: "O(V + E)", space: "O(V)" },
    code: `class Node {
  constructor(val, neighbors = []) {
    this.val = val;
    this.neighbors = neighbors;
  }
}

function cloneGraph(node) {
  const copies = new Map(); // original node -> its copy
  function clone(original) {
    if (copies.has(original)) return copies.get(original); // already copied
    const copy = new Node(original.val);
    copies.set(original, copy); // store first so cycles stop here
    for (const next of original.neighbors) {
      copy.neighbors.push(clone(next)); // copy each neighbour
    }
    return copy;
  }
  return clone(node);
}

// a square: 1 - 2 - 3 - 4 - 1
const n1 = new Node(1);
const n2 = new Node(2);
const n3 = new Node(3);
const n4 = new Node(4);
n1.neighbors = [n2, n4];
n2.neighbors = [n1, n3];
n3.neighbors = [n2, n4];
n4.neighbors = [n1, n3];

const c1 = cloneGraph(n1);
// list each copied node's neighbour values, in node order 1..4
const c2 = c1.neighbors[0];
const c3 = c2.neighbors[1];
const c4 = c1.neighbors[1];
const adj = [c1, c2, c3, c4].map((n) => n.neighbors.map((m) => m.val));
console.log(adj); // expected: [[2, 4], [1, 3], [2, 4], [1, 3]]`,
  },
  {
    id: "max-area-of-island",
    number: 83,
    title: "Max Area of Island",
    group: "Graphs & Grids",
    difficulty: "Medium",
    statement:
      "Given a grid of 1s (land) and 0s (water), return the size of the largest island. An island is land joined up, down, left or right; its area is its number of cells.",
    example: "grid = [[1,1,0,0],[0,1,0,1],[0,0,1,1],[0,0,1,0]] → 4",
    approach:
      "Scan every cell. When you hit land, measure its island with a depth-first search that returns how many cells it sank: 1 for this cell plus the areas found through its four neighbours. Keep the biggest area seen.",
    watch: [
      "`area` returns 0 for water or off-grid cells",
      "each land cell is set to 0 before its neighbours are explored, so it is counted once",
      "the first island has 3 cells, the second has 4",
      "`best` keeps the largest result",
    ],
    complexity: { time: "O(m·n)", space: "O(m·n)" },
    code: `function maxAreaOfIsland(grid) {
  const rows = grid.length;
  const cols = grid[0].length;

  // sink this island and return how many cells it had
  function area(row, col) {
    if (row < 0 || col < 0 || row >= rows || col >= cols) return 0; // off the grid
    if (grid[row][col] === 0) return 0; // water or already counted
    grid[row][col] = 0; // mark as counted
    return 1 + area(row + 1, col) + area(row - 1, col) + area(row, col + 1) + area(row, col - 1);
  }

  let best = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] === 1) {
        best = Math.max(best, area(row, col)); // measure this island
      }
    }
  }
  return best;
}

const grid = [
  [1, 1, 0, 0],
  [0, 1, 0, 1],
  [0, 0, 1, 1],
  [0, 0, 1, 0],
];
console.log(maxAreaOfIsland(grid)); // expected: 4`,
  },
  {
    id: "flood-fill",
    number: 84,
    title: "Flood Fill",
    group: "Graphs & Grids",
    difficulty: "Easy",
    statement:
      "Given an image as a grid of colours, a starting pixel and a new colour, repaint the starting pixel and every pixel joined to it (up, down, left, right) that had the same original colour.",
    example: "image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2 → [[2,2,2],[2,2,0],[2,0,1]]",
    approach:
      "Remember the starting pixel's colour, then run a depth-first search from it. Each pixel with that colour is repainted and its four neighbours are tried. If the new colour equals the old one there is nothing to do, which also prevents an endless loop.",
    watch: [
      "`start` is the colour being replaced (1)",
      "each matching pixel turns to 2 as soon as it is reached",
      "a repainted pixel no longer matches `start`, so it is never visited twice",
      "the 1 in the bottom-right corner is not joined to the start, so it stays 1",
    ],
    complexity: { time: "O(m·n)", space: "O(m·n)" },
    code: `function floodFill(image, sr, sc, color) {
  const start = image[sr][sc]; // the colour we are replacing
  if (start === color) return image; // nothing would change

  function fill(row, col) {
    if (row < 0 || col < 0 || row >= image.length || col >= image[0].length) return; // off the image
    if (image[row][col] !== start) return; // a different colour: stop
    image[row][col] = color; // repaint
    fill(row + 1, col);
    fill(row - 1, col);
    fill(row, col + 1);
    fill(row, col - 1);
  }

  fill(sr, sc);
  return image;
}

const image = [
  [1, 1, 1],
  [1, 1, 0],
  [1, 0, 1],
];
console.log(floodFill(image, 1, 1, 2)); // expected: [[2, 2, 2], [2, 2, 0], [2, 0, 1]]`,
  },
  {
    id: "rotting-oranges",
    number: 85,
    title: "Rotting Oranges",
    group: "Graphs & Grids",
    difficulty: "Medium",
    statement:
      "In a grid, 0 is empty, 1 is a fresh orange and 2 is a rotten one. Every minute, each rotten orange rots its fresh neighbours (up, down, left, right). Return the minutes until no fresh orange is left, or -1 if some can never rot.",
    example: "grid = [[2,1,1],[1,1,0],[0,1,1]] → 4",
    approach:
      "Breadth-first search starting from all rotten oranges at once. The queue is processed one minute (one level) at a time; every fresh neighbour rots and joins the queue for the next minute. Count fresh oranges up front, so at the end you can tell whether any were never reached.",
    watch: [
      "`queue` starts with every rotten orange; `fresh` counts the fresh ones",
      "`size` fixes how many oranges rot others during this minute",
      "each newly rotten orange lowers `fresh` and joins the back of `queue`",
      "`minutes` goes up once per level, only while fresh oranges remain",
    ],
    complexity: { time: "O(m·n)", space: "O(m·n)" },
    code: `function orangesRotting(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const queue = []; // [row, col] of rotten oranges
  let fresh = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] === 2) queue.push([row, col]);
      if (grid[row][col] === 1) fresh++;
    }
  }

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let head = 0;
  let minutes = 0;
  while (head < queue.length && fresh > 0) {
    const size = queue.length - head; // oranges that spread rot this minute
    for (let i = 0; i < size; i++) {
      const [row, col] = queue[head++];
      for (const [dr, dc] of dirs) {
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && c >= 0 && r < rows && c < cols && grid[r][c] === 1) {
          grid[r][c] = 2; // it rots
          fresh--;
          queue.push([r, c]); // and spreads next minute
        }
      }
    }
    minutes++; // one minute has passed
  }
  return fresh === 0 ? minutes : -1;
}

const grid = [
  [2, 1, 1],
  [1, 1, 0],
  [0, 1, 1],
];
console.log(orangesRotting(grid)); // expected: 4`,
  },
  {
    id: "01-matrix",
    number: 86,
    title: "01 Matrix",
    group: "Graphs & Grids",
    difficulty: "Medium",
    statement:
      "Given a grid of 0s and 1s, return a grid of the same size where each cell holds the distance to its nearest 0, moving up, down, left or right.",
    example: "mat = [[0,0,0],[0,1,0],[1,1,1]] → [[0,0,0],[0,1,0],[1,2,1]]",
    approach:
      "Instead of searching outward from every 1, search outward from all the 0s at once (a multi-source breadth-first search). Every 0 has distance 0; a neighbour reached for the first time is one step further than the cell it was reached from. BFS reaches each cell first by its shortest route.",
    watch: [
      "`dist` starts at 0 for every 0 and -1 (not reached yet) for every 1",
      "`queue` starts with all the 0 cells",
      "a neighbour with `dist` -1 gets the current distance + 1 and joins the queue",
      "the bottom-middle cell is reached last, with distance 2",
    ],
    complexity: { time: "O(m·n)", space: "O(m·n)" },
    code: `function updateMatrix(mat) {
  const rows = mat.length;
  const cols = mat[0].length;
  const dist = [];
  const queue = [];
  for (let row = 0; row < rows; row++) {
    dist.push([]);
    for (let col = 0; col < cols; col++) {
      if (mat[row][col] === 0) {
        dist[row].push(0); // a 0 is its own nearest 0
        queue.push([row, col]);
      } else {
        dist[row].push(-1); // not reached yet
      }
    }
  }

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let head = 0;
  while (head < queue.length) {
    const [row, col] = queue[head++];
    for (const [dr, dc] of dirs) {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && c >= 0 && r < rows && c < cols && dist[r][c] === -1) {
        dist[r][c] = dist[row][col] + 1; // one step further than its parent
        queue.push([r, c]);
      }
    }
  }
  return dist;
}

const mat = [
  [0, 0, 0],
  [0, 1, 0],
  [1, 1, 1],
];
console.log(updateMatrix(mat)); // expected: [[0, 0, 0], [0, 1, 0], [1, 2, 1]]`,
  },
  {
    id: "course-schedule",
    number: 87,
    title: "Course Schedule",
    group: "Graphs & Grids",
    difficulty: "Medium",
    statement:
      "There are numCourses courses, and each pair [a, b] says course b must be taken before course a. Decide whether it is possible to finish every course.",
    example: "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]] → true",
    approach:
      "Count how many prerequisites each course still waits on (its in-degree). Start with the courses that wait on nothing, take them one by one, and lower the count of every course that depended on them; any course that drops to 0 can now be taken. If every course gets taken, there is no cycle (Kahn's algorithm).",
    watch: [
      "`graph[b]` lists the courses that unlock after `b`",
      "`indegree[c]` is how many prerequisites course `c` is still waiting for",
      "`queue` holds the courses ready to take; `head` reads from its front",
      "`taken` must reach `numCourses` for the answer to be true",
    ],
    complexity: { time: "O(V + E)", space: "O(V + E)" },
    code: `function canFinish(numCourses, prerequisites) {
  const graph = []; // graph[b] = courses that need b first
  const indegree = []; // how many prerequisites each course still waits on
  for (let i = 0; i < numCourses; i++) {
    graph.push([]);
    indegree.push(0);
  }
  for (const [a, b] of prerequisites) {
    graph[b].push(a);
    indegree[a]++;
  }

  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (indegree[i] === 0) queue.push(i); // ready right away
  }

  let head = 0;
  let taken = 0;
  while (head < queue.length) {
    const course = queue[head++]; // take this course
    taken++;
    for (const next of graph[course]) {
      indegree[next]--; // one fewer prerequisite left
      if (indegree[next] === 0) queue.push(next); // now ready
    }
  }
  return taken === numCourses; // false means a cycle blocked some courses
}

const prerequisites = [[1, 0], [2, 0], [3, 1], [3, 2]];
console.log(canFinish(4, prerequisites)); // expected: true`,
  },
  {
    id: "course-schedule-ii",
    number: 88,
    title: "Course Schedule II",
    group: "Graphs & Grids",
    difficulty: "Medium",
    statement:
      "There are numCourses courses, and each pair [a, b] says course b must be taken before course a. Return an order in which all courses can be taken, or an empty array if it is impossible.",
    example: "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]] → [0,1,2,3]",
    approach:
      "Same idea as Course Schedule (Kahn's algorithm), but record each course as it is taken. Because a course only enters the queue once all its prerequisites have been taken, the order of the queue is a valid order. If it holds fewer than numCourses courses, a cycle got in the way.",
    watch: [
      "`indegree` starts as [0, 1, 1, 2]: only course 0 is ready",
      "taking 0 frees courses 1 and 2",
      "course 3 joins `queue` only after both 1 and 2 are taken",
      "`queue` itself is the answer once every course is in it",
    ],
    complexity: { time: "O(V + E)", space: "O(V + E)" },
    code: `function findOrder(numCourses, prerequisites) {
  const graph = []; // graph[b] = courses that need b first
  const indegree = [];
  for (let i = 0; i < numCourses; i++) {
    graph.push([]);
    indegree.push(0);
  }
  for (const [a, b] of prerequisites) {
    graph[b].push(a);
    indegree[a]++;
  }

  const queue = []; // also the order the courses are taken in
  for (let i = 0; i < numCourses; i++) {
    if (indegree[i] === 0) queue.push(i);
  }

  let head = 0;
  while (head < queue.length) {
    const course = queue[head++];
    for (const next of graph[course]) {
      indegree[next]--;
      if (indegree[next] === 0) queue.push(next); // all its prerequisites are done
    }
  }
  return queue.length === numCourses ? queue : []; // empty means a cycle
}

const prerequisites = [[1, 0], [2, 0], [3, 1], [3, 2]];
console.log(findOrder(4, prerequisites)); // expected: [0, 1, 2, 3]`,
  },
  {
    id: "pacific-atlantic-water-flow",
    number: 89,
    title: "Pacific Atlantic Water Flow",
    group: "Graphs & Grids",
    difficulty: "Medium",
    statement:
      "A grid of heights has the Pacific ocean on its top and left edges and the Atlantic on its bottom and right edges. Rain flows to a neighbour of equal or lower height. Return the cells from which water can reach both oceans.",
    example: "heights = [[1,2,3],[8,9,4]] → [[0,2],[1,0],[1,1],[1,2]]",
    approach:
      "Work backwards from the oceans: start at the edge cells and climb to neighbours that are equal or higher, since water could flow down that path. Do this once from the Pacific edges and once from the Atlantic edges, marking what each can reach. The answer is every cell marked by both.",
    watch: [
      "`pacific` and `atlantic` are grids of true/false: which cells drain to that ocean",
      "`climb` only moves to a neighbour whose height is at least the current one",
      "the top-left 1 reaches only the Pacific: it is lower than everything around it",
      "the final loop keeps cells where both grids are true",
    ],
    complexity: { time: "O(m·n)", space: "O(m·n)" },
    code: `function pacificAtlantic(heights) {
  const rows = heights.length;
  const cols = heights[0].length;
  const pacific = [];
  const atlantic = [];
  for (let row = 0; row < rows; row++) {
    pacific.push(new Array(cols).fill(false)); // nothing reached yet
    atlantic.push(new Array(cols).fill(false));
  }

  // mark every cell that can drain into this ocean, climbing uphill from it
  function climb(row, col, seen, prev) {
    if (row < 0 || col < 0 || row >= rows || col >= cols) return; // off the grid
    if (seen[row][col] || heights[row][col] < prev) return; // done, or water cannot flow down to here
    seen[row][col] = true;
    const h = heights[row][col];
    climb(row + 1, col, seen, h);
    climb(row - 1, col, seen, h);
    climb(row, col + 1, seen, h);
    climb(row, col - 1, seen, h);
  }

  for (let row = 0; row < rows; row++) {
    climb(row, 0, pacific, 0); // left edge
    climb(row, cols - 1, atlantic, 0); // right edge
  }
  for (let col = 0; col < cols; col++) {
    climb(0, col, pacific, 0); // top edge
    climb(rows - 1, col, atlantic, 0); // bottom edge
  }

  const result = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (pacific[row][col] && atlantic[row][col]) result.push([row, col]);
    }
  }
  return result;
}

const heights = [
  [1, 2, 3],
  [8, 9, 4],
];
console.log(pacificAtlantic(heights)); // expected: [[0, 2], [1, 0], [1, 1], [1, 2]]`,
  },
  {
    id: "shortest-path-in-binary-matrix",
    number: 90,
    title: "Shortest Path in Binary Matrix",
    group: "Graphs & Grids",
    difficulty: "Medium",
    statement:
      "In a square grid of 0s (open) and 1s (blocked), find the length of the shortest path of open cells from the top-left to the bottom-right corner. Moves can go in all 8 directions, and the length counts cells. Return -1 if there is no path.",
    example: "grid = [[0,0,0],[1,1,0],[1,1,0]] → 4",
    approach:
      "Breadth-first search from the top-left cell. BFS explores cells in order of distance, so the first time it reaches the bottom-right corner, that distance is the shortest. Mark cells as visited when they join the queue so none is added twice.",
    watch: [
      "each queue entry is `[row, col, length]`: the path length to that cell",
      "a cell is set to 1 when it joins the queue, so it is never added again",
      "all 8 neighbours are tried, including diagonals",
      "the first time `row` and `col` are the bottom-right corner, `length` is the answer",
    ],
    complexity: { time: "O(n²)", space: "O(n²)" },
    code: `function shortestPathBinaryMatrix(grid) {
  const n = grid.length;
  if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1; // start or end is blocked
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const queue = [[0, 0, 1]]; // [row, col, path length so far]
  grid[0][0] = 1; // mark as visited
  let head = 0;
  while (head < queue.length) {
    const [row, col, length] = queue[head++];
    if (row === n - 1 && col === n - 1) return length; // reached the corner first: shortest
    for (const [dr, dc] of dirs) {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && c >= 0 && r < n && c < n && grid[r][c] === 0) {
        grid[r][c] = 1; // visited
        queue.push([r, c, length + 1]);
      }
    }
  }
  return -1; // the corner was never reached
}

const grid = [
  [0, 0, 0],
  [1, 1, 0],
  [1, 1, 0],
];
console.log(shortestPathBinaryMatrix(grid)); // expected: 4`,
  },
];
