export interface Example {
  id: string;
  label: string;
  group: "Searching" | "Sorting" | "Patterns" | "Recursion" | "Data structures" | "JavaScript basics";
  code: string;
}

export const EXAMPLES: Example[] = [
  {
    id: "linear-search",
    label: "Linear search",
    group: "Searching",
    code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}

const nums = [7, 2, 9, 4, 5];
console.log(linearSearch(nums, 4));`,
  },
  {
    id: "binary-search",
    label: "Binary search",
    group: "Searching",
    code: `function binarySearch(arr, target) {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return -1;
}

const sorted = [1, 3, 5, 7, 9, 11, 13];
console.log(binarySearch(sorted, 11));`,
  },
  {
    id: "reverse-two-pointers",
    label: "Two pointers: reverse an array",
    group: "Patterns",
    code: `const arr = [1, 2, 3, 4, 5, 6];
let left = 0;
let right = arr.length - 1;

while (left < right) {
  [arr[left], arr[right]] = [arr[right], arr[left]];
  left++;
  right--;
}

console.log(arr);`,
  },
  {
    id: "pair-sum",
    label: "Two pointers: pair sum (sorted)",
    group: "Patterns",
    code: `function pairSum(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) {
      return [left, right];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  return null;
}

console.log(pairSum([1, 2, 4, 6, 8, 11], 10));`,
  },
  {
    id: "sliding-window",
    label: "Sliding window: max sum of k",
    group: "Patterns",
    code: `function maxSumOfK(arr, k) {
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  let best = windowSum;
  for (let end = k; end < arr.length; end++) {
    const start = end - k;
    windowSum += arr[end] - arr[start];
    best = Math.max(best, windowSum);
  }
  return best;
}

console.log(maxSumOfK([2, 1, 5, 1, 3, 2], 3));`,
  },
  {
    id: "bubble-sort",
    label: "Bubble sort",
    group: "Sorting",
    code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

console.log(bubbleSort([5, 3, 8, 1, 4]));`,
  },
  {
    id: "selection-sort",
    label: "Selection sort",
    group: "Sorting",
    code: `function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}

console.log(selectionSort([29, 10, 14, 37, 13]));`,
  },
  {
    id: "insertion-sort",
    label: "Insertion sort",
    group: "Sorting",
    code: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

console.log(insertionSort([4, 3, 5, 1, 2]));`,
  },
  {
    id: "two-sum",
    label: "Two sum with a Map",
    group: "Patterns",
    code: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) {
      return [seen.get(need), i];
    }
    seen.set(nums[i], i);
  }
  return null;
}

console.log(twoSum([2, 7, 11, 15], 26));`,
  },
  {
    id: "fibonacci",
    label: "Fibonacci (recursion)",
    group: "Recursion",
    code: `function fib(n) {
  if (n <= 1) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}

console.log(fib(4));`,
  },
  {
    id: "factorial",
    label: "Factorial (recursion)",
    group: "Recursion",
    code: `function factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

console.log(factorial(4));`,
  },
  {
    id: "balanced-brackets",
    label: "Stack: balanced brackets",
    group: "Data structures",
    code: `function isBalanced(text) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const ch of text) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);
    } else if (stack.pop() !== pairs[ch]) {
      return false;
    }
  }
  return stack.length === 0;
}

console.log(isBalanced("{[()]}"));`,
  },
  {
    id: "queue",
    label: "Queue: first in, first out",
    group: "Data structures",
    code: `const queue = [];
queue.push("Ana");
queue.push("Ben");
queue.push("Cy");

while (queue.length > 0) {
  const person = queue.shift();
  console.log("Serving", person);
}`,
  },
  {
    id: "reverse-linked-list",
    label: "Reverse a linked list",
    group: "Data structures",
    code: `class Node {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
  }
}

let head = new Node(1, new Node(2, new Node(3)));

let prev = null;
let curr = head;
while (curr !== null) {
  const next = curr.next;
  curr.next = prev;
  prev = curr;
  curr = next;
}
head = prev;
console.log(head.value);`,
  },
  {
    id: "matrix",
    label: "Matrix traversal (2D array)",
    group: "Data structures",
    code: `const grid = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

let total = 0;
for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[row].length; col++) {
    total += grid[row][col];
  }
}
console.log("Sum:", total);`,
  },
  {
    id: "sum-array",
    label: "Sum an array with a loop",
    group: "JavaScript basics",
    code: `const prices = [12, 5, 8, 20];
let sum = 0;

for (let i = 0; i < prices.length; i++) {
  sum = sum + prices[i];
}

console.log("Total:", sum);`,
  },
  {
    id: "references",
    label: "Objects, nested arrays & aliasing",
    group: "JavaScript basics",
    code: `const user = { name: "Ada", tags: ["math", "code"] };
const alias = user;          // same object, two names
alias.name = "Ada Lovelace";

const copy = { ...user };    // new object, but tags is shared!
copy.tags.push("poetry");

const matrix = [[1, 2], [3, 4]];
matrix[1][0] = 99;
console.log(user.name, user.tags, matrix);`,
  },
  {
    id: "closure",
    label: "Closure counter",
    group: "JavaScript basics",
    code: `function makeCounter() {
  let count = 0;
  return function increment() {
    count = count + 1;
    return count;
  };
}

const counter = makeCounter();
counter();
counter();
console.log(counter());`,
  },
  {
    id: "class",
    label: "A class with methods",
    group: "JavaScript basics",
    code: `class BankAccount {
  constructor(owner) {
    this.owner = owner;
    this.balance = 0;
  }

  deposit(amount) {
    this.balance += amount;
    return this.balance;
  }
}

const account = new BankAccount("Sam");
account.deposit(50);
account.deposit(25);
console.log(account);`,
  },
];

export const EXAMPLE_GROUPS: Example["group"][] = [
  "Searching",
  "Sorting",
  "Patterns",
  "Recursion",
  "Data structures",
  "JavaScript basics",
];

export const DEFAULT_EXAMPLE = EXAMPLES.find((example) => example.id === "bubble-sort") ?? EXAMPLES[0];
