import {
    Box,
    GitBranch,
    Network,
    Layers,
    Search,
    ArrowUpDown,
    Shuffle,
    TrendingUp,
    Grid3x3,
    type LucideIcon,
} from 'lucide-react';

type CodeStep = {
    title: string;
    explanation: string;
    code: string;
    language: string;
};

export type DSATopic = {
    id: string;
    label: string;
    icon: LucideIcon;
    href: string;
    content: {
        title: string;
        description: string;
        steps: CodeStep[];
    };
};

export type DSAGroup = {
    name: string;
    topics: DSATopic[];
};

// Overview Group
const overviewTopics: DSATopic[] = [
    {
        id: 'visualizations',
        label: 'Visualizations',
        icon: Grid3x3,
        href: '/dsa?topic=visualizations',
        content: {
            title: 'Data Structure Visualizations',
            description: 'Interactive visualizations to understand how data structures work internally.',
            steps: [],
        },
    },
    {
        id: 'algorithms-overview',
        label: 'Algorithms',
        icon: TrendingUp,
        href: '/dsa?topic=algorithms-overview',
        content: {
            title: 'Algorithm Fundamentals',
            description: 'Core algorithmic concepts and problem-solving techniques.',
            steps: [
                {
                    title: 'Time Complexity',
                    explanation: 'Understanding Big O notation and how to analyze algorithm efficiency.',
                    code: `// O(1) - Constant Time
function getFirst(arr) {
  return arr[0]; // Always takes same time
}

// O(n) - Linear Time
function findElement(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

// O(n²) - Quadratic Time
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
                    language: 'javascript',
                },
            ],
        },
    },
    {
        id: 'patterns-overview',
        label: 'Patterns',
        icon: Shuffle,
        href: '/dsa?topic=patterns-overview',
        content: {
            title: 'Common Problem-Solving Patterns',
            description: 'Learn the most common patterns used to solve coding problems efficiently.',
            steps: [],
        },
    },
];

// Data Structures Group
const dataStructureTopics: DSATopic[] = [
    {
        id: 'arrays',
        label: 'Arrays',
        icon: Box,
        href: '/dsa?topic=arrays',
        content: {
            title: 'Arrays',
            description: 'The most fundamental data structure - a contiguous block of memory storing elements.',
            steps: [
                {
                    title: 'Array Basics',
                    explanation: 'Arrays store elements in contiguous memory locations with O(1) access time by index.',
                    code: `// Creating arrays
const arr1 = [1, 2, 3, 4, 5];
const arr2 = new Array(5); // Creates array with 5 empty slots
const arr3 = Array.from({ length: 5 }, (_, i) => i); // [0,1,2,3,4]

// Accessing elements - O(1)
console.log(arr1[0]); // 1
console.log(arr1[arr1.length - 1]); // 5

// Common operations
arr1.push(6); // Add to end - O(1)
arr1.pop(); // Remove from end - O(1)
arr1.unshift(0); // Add to start - O(n)
arr1.shift(); // Remove from start - O(n)`,
                    language: 'javascript',
                },
                {
                    title: 'Array Methods',
                    explanation: 'Essential array methods for manipulation and transformation.',
                    code: `const numbers = [1, 2, 3, 4, 5];

// map - transform each element
const doubled = numbers.map(n => n * 2); // [2,4,6,8,10]

// filter - keep elements that match condition
const evens = numbers.filter(n => n % 2 === 0); // [2,4]

// reduce - combine all elements into single value
const sum = numbers.reduce((acc, n) => acc + n, 0); // 15

// find - get first matching element
const found = numbers.find(n => n > 3); // 4

// some - check if any element matches
const hasEven = numbers.some(n => n % 2 === 0); // true

// every - check if all elements match
const allPositive = numbers.every(n => n > 0); // true`,
                    language: 'javascript',
                },
            ],
        },
    },
    {
        id: 'linked-lists',
        label: 'Linked Lists',
        icon: GitBranch,
        href: '/dsa?topic=linked-lists',
        content: {
            title: 'Linked Lists',
            description: 'A linear data structure where elements are stored in nodes, each pointing to the next.',
            steps: [
                {
                    title: 'Singly Linked List',
                    explanation: 'Each node contains data and a pointer to the next node.',
                    code: `class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // Add to end - O(n)
  append(data) {
    const newNode = new Node(data);
    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
    this.size++;
  }

  // Add to start - O(1)
  prepend(data) {
    const newNode = new Node(data);
    newNode.next = this.head;
    this.head = newNode;
    this.size++;
  }

  // Delete node - O(n)
  delete(data) {
    if (!this.head) return;
    
    if (this.head.data === data) {
      this.head = this.head.next;
      this.size--;
      return;
    }

    let current = this.head;
    while (current.next) {
      if (current.next.data === data) {
        current.next = current.next.next;
        this.size--;
        return;
      }
      current = current.next;
    }
  }
}`,
                    language: 'javascript',
                },
            ],
        },
    },
    {
        id: 'stacks',
        label: 'Stacks',
        icon: Layers,
        href: '/dsa?topic=stacks',
        content: {
            title: 'Stacks',
            description: 'LIFO (Last In First Out) data structure - like a stack of plates.',
            steps: [
                {
                    title: 'Stack Implementation',
                    explanation: 'Stack supports push, pop, and peek operations, all in O(1) time.',
                    code: `class Stack {
  constructor() {
    this.items = [];
  }

  // Add element to top - O(1)
  push(element) {
    this.items.push(element);
  }

  // Remove and return top element - O(1)
  pop() {
    if (this.isEmpty()) return null;
    return this.items.pop();
  }

  // View top element without removing - O(1)
  peek() {
    if (this.isEmpty()) return null;
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }
}

// Usage
const stack = new Stack();
stack.push(1);
stack.push(2);
stack.push(3);
console.log(stack.pop()); // 3
console.log(stack.peek()); // 2`,
                    language: 'javascript',
                },
            ],
        },
    },
    {
        id: 'queues',
        label: 'Queues',
        icon: ArrowUpDown,
        href: '/dsa?topic=queues',
        content: {
            title: 'Queues',
            description: 'FIFO (First In First Out) data structure - like a line at a store.',
            steps: [
                {
                    title: 'Queue Implementation',
                    explanation: 'Queue supports enqueue (add to back) and dequeue (remove from front).',
                    code: `class Queue {
  constructor() {
    this.items = [];
  }

  // Add element to back - O(1)
  enqueue(element) {
    this.items.push(element);
  }

  // Remove and return front element - O(n) with array
  dequeue() {
    if (this.isEmpty()) return null;
    return this.items.shift();
  }

  // View front element - O(1)
  front() {
    if (this.isEmpty()) return null;
    return this.items[0];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }
}

// Usage
const queue = new Queue();
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);
console.log(queue.dequeue()); // 1
console.log(queue.front()); // 2`,
                    language: 'javascript',
                },
            ],
        },
    },
    {
        id: 'trees',
        label: 'Trees',
        icon: Network,
        href: '/dsa?topic=trees',
        content: {
            title: 'Trees',
            description: 'Hierarchical data structure with a root node and child nodes.',
            steps: [
                {
                    title: 'Binary Tree',
                    explanation: 'Each node has at most two children: left and right.',
                    code: `class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinaryTree {
  constructor() {
    this.root = null;
  }

  // Inorder traversal: Left -> Root -> Right
  inorder(node = this.root, result = []) {
    if (node) {
      this.inorder(node.left, result);
      result.push(node.value);
      this.inorder(node.right, result);
    }
    return result;
  }

  // Preorder traversal: Root -> Left -> Right
  preorder(node = this.root, result = []) {
    if (node) {
      result.push(node.value);
      this.preorder(node.left, result);
      this.preorder(node.right, result);
    }
    return result;
  }

  // Postorder traversal: Left -> Right -> Root
  postorder(node = this.root, result = []) {
    if (node) {
      this.postorder(node.left, result);
      this.postorder(node.right, result);
      result.push(node.value);
    }
    return result;
  }
}`,
                    language: 'javascript',
                },
            ],
        },
    },
    {
        id: 'hash-tables',
        label: 'Hash Tables',
        icon: Grid3x3,
        href: '/dsa?topic=hash-tables',
        content: {
            title: 'Hash Tables',
            description: 'Key-value pairs with O(1) average lookup time using hash functions.',
            steps: [
                {
                    title: 'Hash Table Basics',
                    explanation: 'JavaScript objects and Maps are hash table implementations.',
                    code: `// Using Map (preferred for hash tables)
const map = new Map();

// Set key-value pairs - O(1)
map.set('name', 'Alice');
map.set('age', 25);
map.set(1, 'number key');

// Get values - O(1)
console.log(map.get('name')); // 'Alice'

// Check if key exists - O(1)
console.log(map.has('age')); // true

// Delete key - O(1)
map.delete('age');

// Iterate
for (const [key, value] of map) {
  console.log(key, value);
}

// Using Object
const obj = {};
obj['key1'] = 'value1';
obj['key2'] = 'value2';

// Common use case: frequency counter
function countFrequency(arr) {
  const freq = new Map();
  for (const item of arr) {
    freq.set(item, (freq.get(item) || 0) + 1);
  }
  return freq;
}`,
                    language: 'javascript',
                },
            ],
        },
    },
];

// Algorithms Group
const algorithmTopics: DSATopic[] = [
    {
        id: 'searching',
        label: 'Searching',
        icon: Search,
        href: '/dsa?topic=searching',
        content: {
            title: 'Searching Algorithms',
            description: 'Techniques to find elements in data structures efficiently.',
            steps: [
                {
                    title: 'Linear Search',
                    explanation: 'Check each element one by one. Time: O(n), Space: O(1)',
                    code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // Return index if found
    }
  }
  return -1; // Not found
}

// Usage
const arr = [5, 2, 8, 1, 9];
console.log(linearSearch(arr, 8)); // 2
console.log(linearSearch(arr, 3)); // -1`,
                    language: 'javascript',
                },
                {
                    title: 'Binary Search',
                    explanation: 'Efficient search on sorted arrays. Time: O(log n), Space: O(1)',
                    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid; // Found
    } else if (arr[mid] < target) {
      left = mid + 1; // Search right half
    } else {
      right = mid - 1; // Search left half
    }
  }

  return -1; // Not found
}

// Usage (array must be sorted!)
const sortedArr = [1, 2, 5, 8, 9];
console.log(binarySearch(sortedArr, 8)); // 3
console.log(binarySearch(sortedArr, 3)); // -1`,
                    language: 'javascript',
                },
            ],
        },
    },
    {
        id: 'sorting',
        label: 'Sorting',
        icon: ArrowUpDown,
        href: '/dsa?topic=sorting',
        content: {
            title: 'Sorting Algorithms',
            description: 'Arrange elements in a specific order efficiently.',
            steps: [
                {
                    title: 'Bubble Sort',
                    explanation: 'Repeatedly swap adjacent elements if they are in wrong order. Time: O(n²)',
                    code: `function bubbleSort(arr) {
  const n = arr.length;
  
  for (let i = 0; i < n; i++) {
    // Flag to optimize if array is already sorted
    let swapped = false;
    
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    
    // If no swaps, array is sorted
    if (!swapped) break;
  }
  
  return arr;
}

// Usage
console.log(bubbleSort([64, 34, 25, 12, 22]));
// [12, 22, 25, 34, 64]`,
                    language: 'javascript',
                },
                {
                    title: 'Quick Sort',
                    explanation: 'Divide and conquer algorithm. Average Time: O(n log n)',
                    code: `function quickSort(arr) {
  if (arr.length <= 1) return arr;

  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  return [...quickSort(left), pivot, ...quickSort(right)];
}

// Usage
console.log(quickSort([64, 34, 25, 12, 22]));
// [12, 22, 25, 34, 64]`,
                    language: 'javascript',
                },
                {
                    title: 'Merge Sort',
                    explanation: 'Divide array into halves, sort them, and merge. Time: O(n log n)',
                    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}

// Usage
console.log(mergeSort([64, 34, 25, 12, 22]));
// [12, 22, 25, 34, 64]`,
                    language: 'javascript',
                },
            ],
        },
    },
    {
        id: 'sliding-window',
        label: 'Sliding Window',
        icon: Box,
        href: '/dsa?topic=sliding-window',
        content: {
            title: 'Sliding Window Pattern',
            description: 'Efficiently process subarrays or substrings by maintaining a window.',
            steps: [
                {
                    title: 'Fixed Size Window',
                    explanation: 'Find maximum sum of k consecutive elements.',
                    code: `function maxSumSubarray(arr, k) {
  if (arr.length < k) return null;

  // Calculate sum of first window
  let maxSum = 0;
  for (let i = 0; i < k; i++) {
    maxSum += arr[i];
  }

  let windowSum = maxSum;

  // Slide the window
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum - arr[i - k] + arr[i];
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}

// Usage
console.log(maxSumSubarray([1, 4, 2, 10, 23, 3, 1, 0, 20], 4));
// 39 (10 + 23 + 3 + 1)`,
                    language: 'javascript',
                },
                {
                    title: 'Variable Size Window',
                    explanation: 'Find smallest subarray with sum >= target.',
                    code: `function minSubArrayLen(target, arr) {
  let minLen = Infinity;
  let windowSum = 0;
  let start = 0;

  for (let end = 0; end < arr.length; end++) {
    windowSum += arr[end];

    // Shrink window while sum >= target
    while (windowSum >= target) {
      minLen = Math.min(minLen, end - start + 1);
      windowSum -= arr[start];
      start++;
    }
  }

  return minLen === Infinity ? 0 : minLen;
}

// Usage
console.log(minSubArrayLen(7, [2, 3, 1, 2, 4, 3]));
// 2 (subarray [4, 3])`,
                    language: 'javascript',
                },
            ],
        },
    },
    {
        id: 'two-pointer',
        label: 'Two Pointer',
        icon: ArrowUpDown,
        href: '/dsa?topic=two-pointer',
        content: {
            title: 'Two Pointer Pattern',
            description: 'Use two pointers to solve problems efficiently, often on sorted arrays.',
            steps: [
                {
                    title: 'Two Sum (Sorted Array)',
                    explanation: 'Find two numbers that add up to target in sorted array.',
                    code: `function twoSum(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const sum = arr[left] + arr[right];

    if (sum === target) {
      return [left, right];
    } else if (sum < target) {
      left++; // Need larger sum
    } else {
      right--; // Need smaller sum
    }
  }

  return [-1, -1]; // Not found
}

// Usage
console.log(twoSum([1, 2, 3, 4, 6], 6));
// [1, 3] (2 + 4 = 6)`,
                    language: 'javascript',
                },
                {
                    title: 'Remove Duplicates',
                    explanation: 'Remove duplicates from sorted array in-place.',
                    code: `function removeDuplicates(arr) {
  if (arr.length === 0) return 0;

  let slow = 0;

  for (let fast = 1; fast < arr.length; fast++) {
    if (arr[fast] !== arr[slow]) {
      slow++;
      arr[slow] = arr[fast];
    }
  }

  return slow + 1; // Length of unique elements
}

// Usage
const arr = [1, 1, 2, 2, 3, 4, 4];
const len = removeDuplicates(arr);
console.log(arr.slice(0, len)); // [1, 2, 3, 4]`,
                    language: 'javascript',
                },
            ],
        },
    },
];

// Export groups
export const dsaGroups: DSAGroup[] = [
    {
        name: 'Overview',
        topics: overviewTopics,
    },
    {
        name: 'Deep Dive: Data Structures',
        topics: dataStructureTopics,
    },
    {
        name: 'Algorithms',
        topics: algorithmTopics,
    },
];

// Flat list of all topics for easy lookup
export const allDSATopics = [
    ...overviewTopics,
    ...dataStructureTopics,
    ...algorithmTopics,
];
