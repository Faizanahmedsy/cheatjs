import {
  Type,
  Repeat,
  Sigma,
  ChartColumn,
  CalendarRange,
  Binary,
  Grid2x2,
} from "lucide-react";
import type { DSATopic } from "@/lib/dsa";

// Pattern topics: strings, recursion, prefix sums, monotonic stack,
// intervals, bit manipulation and matrices.
// Every code block is a self-contained runnable program (no imports,
// no template strings) so it can also be stepped through in the visualizer.

const stringsTopic: DSATopic = {
  id: "strings",
  label: "Strings",
  icon: Type,
  href: "/dsa?topic=strings",
  content: {
    title: "Strings",
    description:
      "Walk a string character by character, count letters with a map, and squeeze from both ends with two pointers. Most string problems are one of these three moves.",
    steps: [
      {
        title: "What It Is & When to Use It",
        explanation:
          'A string is an array of characters you cannot change in place. You read it with s[i] and s.length, just like an array, but to build a new string you collect pieces in an array and join them at the end. Reach for the string toolkit when a problem says: "count the characters", "is it a palindrome", "are these anagrams", "reverse the words", or "ignore case and punctuation".',
        code: `// Strings behave like read-only arrays of characters
const s = "code";

// 1. Traversal with an index
for (let i = 0; i < s.length; i++) {
  console.log(i, s[i]); // 0 c, 1 o, 2 d, 3 e
}

// 2. Strings are IMMUTABLE: this assignment is silently ignored
const t = "cat";
t[0] = "b";
console.log(t); // "cat"

// 3. Build new strings in an array, then join (fast and clear)
const parts = [];
for (let i = s.length - 1; i >= 0; i--) {
  parts.push(s[i]);
}
console.log(parts.join("")); // "edoc"

// Signals in a problem statement:
// - "count / frequency / most common character"  -> frequency map
// - "palindrome", "reverse in place"              -> two pointers
// - "anagram", "same letters"                     -> frequency map or sorted key
// - "words", "sentence"                           -> split into words, then array work`,
        language: "javascript",
      },
      {
        title: "The Template",
        explanation:
          "Two skeletons cover most string problems. The frequency counter walks the string once and stores how often each character appears. The two-pointer squeeze starts at both ends and walks inward, comparing as it goes. Learn both and you can solve anagram and palindrome questions in a few lines.",
        code: `// TEMPLATE 1: frequency counting
function countChars(s) {
  const freq = {};                       // char -> how many times seen
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    freq[ch] = (freq[ch] || 0) + 1;      // first time: 0 + 1
  }
  return freq;
}

// Anagram = same characters with the same counts
function isAnagram(a, b) {
  if (a.length !== b.length) return false; // quick reject
  const freq = countChars(a);
  for (let i = 0; i < b.length; i++) {
    const ch = b[i];
    if (!freq[ch]) return false;         // b has a char a does not (or too many)
    freq[ch]--;                          // use one up
  }
  return true;                           // every count went back to 0
}

// TEMPLATE 2: two pointers squeezing inward
function isPalindromeSimple(s) {
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false; // mismatch: stop early
    left++;                                 // move both pointers inward
    right--;
  }
  return true;
}

console.log(countChars("aab"));            // { a: 2, b: 1 }
console.log(isAnagram("listen", "silent")); // true
console.log(isAnagram("rat", "car"));       // false
console.log(isPalindromeSimple("level"));   // true`,
        language: "javascript",
      },
      {
        title: "Worked Example 1: Valid Palindrome",
        explanation:
          "Return true if the string reads the same forwards and backwards after ignoring case and every character that is not a letter or digit. Use two pointers: skip junk characters on each side, then compare the lowercase letters. No extra string is built, so space stays O(1).",
        code: `function isAlnum(ch) {
  return /[a-z0-9]/i.test(ch);
}

function isPalindrome(s) {
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    // Skip anything that is not a letter or digit
    while (left < right && !isAlnum(s[left])) left++;
    while (left < right && !isAlnum(s[right])) right--;

    // Compare ignoring case
    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}

console.log(isPalindrome("Ab, ba"));     // true
console.log(isPalindrome("race a car")); // false`,
        language: "javascript",
      },
      {
        title: 'Dry Run: isPalindrome("Ab, ba")',
        explanation:
          "Follow the pointers by hand. The string has six characters: index 0 'A', 1 'b', 2 ',', 3 ' ', 4 'b', 5 'a'. Each row is one pass of the outer while loop. Notice how the inner loops skip the comma and the space, and how the loop ends as soon as the pointers cross.",
        code: `// s = "Ab, ba"
// index:  0   1   2   3   4   5
// char:   A   b   ,  ' '  b   a
//
// pass | left | right | after skipping   | compare         | decision
// -----+------+-------+------------------+-----------------+--------------------
//  1   |  0   |  5    | 0 'A', 5 'a'     | "a" === "a"     | match, left=1 right=4
//  2   |  1   |  4    | 1 'b', 4 'b'     | "b" === "b"     | match, left=2 right=3
//  3   |  2   |  3    | ',' skipped:     | " " === " "     | left=4 right=2
//      |      |       | left -> 3, now   | (same index,    |
//      |      |       | left === right   |  always equal)  |
// end  |  4   |  2    | left < right is false -> exit loop | return true

function isAlnum(ch) {
  return /[a-z0-9]/i.test(ch);
}

function isPalindrome(s) {
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    while (left < right && !isAlnum(s[left])) left++;
    while (left < right && !isAlnum(s[right])) right--;
    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
    left++;
    right--;
  }
  return true;
}

console.log(isPalindrome("Ab, ba")); // true`,
        language: "javascript",
      },
      {
        title: "Worked Example 2: Group Anagrams & Reverse Words",
        explanation:
          'Group Anagrams: words that are anagrams share the same letters, so sorting each word\'s letters gives a key that is identical for the whole group ("eat", "tea" and "ate" all become "aet"). Store groups in a Map keyed by that. Reverse Words: split the sentence into words (dropping the empty pieces that extra spaces create), then reverse the word array with two pointers and join with single spaces.',
        code: `// Group Anagrams: sorted letters are the group's fingerprint
function groupAnagrams(words) {
  const groups = new Map();              // key -> list of words
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const key = word.split("").sort().join(""); // "tea" -> "aet"
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return Array.from(groups.values());
}

// Reverse Words: split, two-pointer reverse, join
function reverseWords(s) {
  // split(" ") leaves "" pieces for repeated spaces, so filter them out
  const words = s.split(" ").filter((w) => w !== "");
  let left = 0;
  let right = words.length - 1;
  while (left < right) {
    const temp = words[left];
    words[left] = words[right];
    words[right] = temp;
    left++;
    right--;
  }
  return words.join(" ");
}

console.log(JSON.stringify(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])));
// [["eat","tea","ate"],["tan","nat"],["bat"]]

console.log(reverseWords("  the sky  is blue "));
// "blue is sky the"`,
        language: "javascript",
      },
      {
        title: "Complexity",
        explanation:
          "A single pass over a string of length n is O(n). The frequency map holds at most one entry per distinct character, so for lowercase letters it is O(26), which is O(1). Group Anagrams sorts each word, so it costs O(m * k log k) for m words of length k. Building a string with += inside a loop can copy the string each time, which is why collecting parts and joining once is the safe habit.",
        code: `// isAnagram      time O(n)            space O(1)  (26 letters max)
// isPalindrome   time O(n)            space O(1)  (two pointers, no copy)
// groupAnagrams  time O(m * k log k)  space O(m * k)
// reverseWords   time O(n)            space O(n)  (the words array)

// Faster anagram key: count letters instead of sorting -> O(m * k)
function countKey(word) {
  const counts = new Array(26).fill(0);
  for (let i = 0; i < word.length; i++) {
    counts[word.charCodeAt(i) - 97]++;   // 'a' is char code 97
  }
  return counts.join(",");
}

console.log(countKey("tea") === countKey("eat")); // true
console.log(countKey("tea") === countKey("tan")); // false`,
        language: "javascript",
      },
      {
        title: "Common Mistakes & Edge Cases",
        explanation:
          'The usual bugs: forgetting to lowercase before comparing, trusting split(" ") when the input has double spaces, assuming s.length counts what a human sees (emoji take two code units), and trying to edit a string in place. Always test the empty string, a single character, all-junk input like ",.!", and mixed case.',
        code: `// 1. Case matters unless you normalise it
console.log("A" === "a");                  // false
console.log("A".toLowerCase() === "a");    // true

// 2. split(" ") keeps empty strings for repeated spaces
console.log("a  b".split(" "));            // ["a", "", "b"]
console.log("a  b".split(" ").filter((w) => w !== "")); // ["a", "b"]

// 3. Emoji are two UTF-16 code units
console.log("hi".length);                  // 2
console.log("😀".length);                  // 2, not 1
console.log(Array.from("😀").length);      // 1

// 4. Edge cases for a palindrome check
function isPal(s) {
  const clean = s.toLowerCase().split("").filter((c) => /[a-z0-9]/.test(c));
  let left = 0;
  let right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++;
    right--;
  }
  return true;
}
console.log(isPal(""));     // true  (empty reads the same both ways)
console.log(isPal(",.!"));  // true  (nothing left after cleaning)
console.log(isPal("a"));    // true`,
        language: "javascript",
      },
      {
        title: "Practice List",
        explanation:
          "Work through these in order. The easy ones drill the two templates; the medium ones combine a map with a window or a key; the hard one is a sliding window driven by a frequency map.",
        code: `const practice = {
  easy: [
    "Valid Palindrome",
    "Valid Anagram",
    "Reverse String",
    "First Unique Character in a String",
    "Longest Common Prefix",
  ],
  medium: [
    "Group Anagrams",
    "Reverse Words in a String",
    "Longest Palindromic Substring",
    "String Compression",
  ],
  hard: ["Minimum Window Substring"],
};

console.log(practice.easy.length + practice.medium.length + practice.hard.length); // 10`,
        language: "javascript",
      },
    ],
  },
};

const recursionTopic: DSATopic = {
  id: "recursion",
  label: "Recursion",
  icon: Repeat,
  href: "/dsa?topic=recursion",
  content: {
    title: "Recursion",
    description:
      "A function that solves a problem by calling itself on a smaller piece of the same problem. Understand the base case, the recursive case and the call stack, and trees, backtracking and divide-and-conquer all follow.",
    steps: [
      {
        title: "What It Is & When to Use It",
        explanation:
          'Recursion means a function calls itself with a smaller input until it reaches an input so small the answer is obvious. Every recursive function has two parts: the base case (stop and return a direct answer) and the recursive case (shrink the problem, call yourself, combine the result). Each call waits on the call stack until the call it made returns. Use it when the problem is defined in terms of itself: trees, nested structures, "all combinations", divide and conquer, or a formula like n! = n * (n - 1)!.',
        code: `function countdown(n) {
  // BASE CASE: nothing smaller to do, so stop
  if (n === 0) {
    console.log("Liftoff!");
    return;
  }
  // RECURSIVE CASE: do one piece of work, then call on a smaller input
  console.log(n);
  countdown(n - 1);
}

countdown(3);
// 3
// 2
// 1
// Liftoff!

// Signals that recursion fits:
// - the input is a tree, a nested list, or a linked list
// - "generate all ..." (subsets, permutations)
// - the answer for n is built from the answer for n - 1 or n / 2`,
        language: "javascript",
      },
      {
        title: "The Template",
        explanation:
          "Write the base case first, always. Then ask: if a helper already solved the smaller problem, how would I use its answer? That is the recursive case. Trust the smaller call; do not trace it in your head while writing. Every call must move toward the base case, or the stack grows until it overflows.",
        code: `// The recursion template
function solve(input) {
  // 1. BASE CASE: the smallest input, answered directly
  if (input === 0) {
    return 1;
  }

  // 2. SHRINK: make the input smaller
  const smaller = input - 1;

  // 3. RECURSE: trust that solve(smaller) returns the right answer
  const sub = solve(smaller);

  // 4. COMBINE: build this answer from the smaller one
  return input * sub;
}

// This is factorial: 4! = 4 * 3 * 2 * 1
console.log(solve(4)); // 24

// Checklist before running:
// [ ] Is there a base case?
// [ ] Does every call get closer to it?
// [ ] Do I RETURN the recursive result?`,
        language: "javascript",
      },
      {
        title: "Worked Example 1: Sum of an Array",
        explanation:
          'The sum of an array is its first element plus the sum of the rest. Instead of slicing the array (which copies it), pass an index i that says where the "rest" starts. When i reaches the end there is nothing left to add, so the base case returns 0.',
        code: `function sum(arr, i) {
  // BASE CASE: past the last element, nothing left to add
  if (i === arr.length) {
    return 0;
  }
  // RECURSIVE CASE: this element + sum of everything after it
  return arr[i] + sum(arr, i + 1);
}

console.log(sum([2, 4, 6], 0)); // 12
console.log(sum([], 0));        // 0`,
        language: "javascript",
      },
      {
        title: "Dry Run: sum([2, 4, 6], 0)",
        explanation:
          "Watch the call stack grow on the way down and unwind on the way up. Each call pauses at arr[i] + sum(...) until the call it made returns a number. Only the base case returns without waiting. Then the answers flow back up, and each paused call finishes its addition.",
        code: `// PHASE 1: the stack GROWS (each call waits for the next)
//
// depth | call          | i | arr[i] | status
// ------+---------------+---+--------+-------------------------------
//   1   | sum(arr, 0)   | 0 |   2    | waiting on 2 + sum(arr, 1)
//   2   | sum(arr, 1)   | 1 |   4    | waiting on 4 + sum(arr, 2)
//   3   | sum(arr, 2)   | 2 |   6    | waiting on 6 + sum(arr, 3)
//   4   | sum(arr, 3)   | 3 |   -    | i === length -> BASE CASE, return 0
//
// Stack at its tallest (top of the stack first):
//   sum(arr, 3)  <- running
//   sum(arr, 2)
//   sum(arr, 1)
//   sum(arr, 0)
//
// PHASE 2: the stack UNWINDS (answers flow back up)
//
// depth | call          | computes  | returns
// ------+---------------+-----------+--------
//   4   | sum(arr, 3)   | base case |   0
//   3   | sum(arr, 2)   | 6 + 0     |   6
//   2   | sum(arr, 1)   | 4 + 6     |  10
//   1   | sum(arr, 0)   | 2 + 10    |  12

function sum(arr, i) {
  if (i === arr.length) return 0;
  return arr[i] + sum(arr, i + 1);
}

console.log(sum([2, 4, 6], 0)); // 12`,
        language: "javascript",
      },
      {
        title: "Worked Example 2: Fast Power & Reverse a String",
        explanation:
          'Fast power: x^n = (x^(n/2))^2 when n is even, and x * (x^(n/2))^2 when n is odd. Computing the half once and squaring it halves n on every call, so 2^10 needs only five calls instead of ten. Reverse a string: the reverse of "hello" is the reverse of "ello" followed by "h". The base case is an empty or one-character string, which is its own reverse.',
        code: `// Fast power: halve n each call
function power(x, n) {
  if (n === 0) return 1;                    // BASE CASE: x^0 = 1
  const half = power(x, Math.floor(n / 2)); // solve the half problem ONCE
  if (n % 2 === 0) {
    return half * half;                     // even: x^n = half^2
  }
  return half * half * x;                   // odd: one extra x
}

// Call chain for power(2, 10):
// power(2,10) -> power(2,5) -> power(2,2) -> power(2,1) -> power(2,0)=1
// unwind: power(2,1)=1*1*2=2, power(2,2)=2*2=4,
//         power(2,5)=4*4*2=32, power(2,10)=32*32=1024

// Reverse a string: reverse(rest) + first char
function reverseString(s) {
  if (s.length <= 1) return s;             // BASE CASE
  return reverseString(s.slice(1)) + s[0];
}

console.log(power(2, 10));           // 1024
console.log(power(3, 3));            // 27
console.log(reverseString("hello")); // "olleh"`,
        language: "javascript",
      },
      {
        title: "Complexity & Recursion vs Iteration",
        explanation:
          "Time is the number of calls times the work per call. Space is at least the deepest the stack gets, because every waiting call keeps its own variables alive. Any recursion can be rewritten as a loop (sometimes with your own stack). Loops avoid stack overflow and are usually faster; recursion is clearer when the data is itself recursive, like trees. A tail call is a recursive call that is the very last thing a function does. Some languages reuse the stack frame for it, but V8 (Chrome and Node) does not, so deep recursion in JavaScript still overflows at roughly ten thousand frames.",
        code: `// sum(arr, i)        time O(n)      stack space O(n)
// power(x, n)        time O(log n)  stack space O(log n)
// reverseString(s)   time O(n^2)    each slice/concat copies the string
// countdown(n)       time O(n)      stack space O(n)

// The same sum as a loop: O(n) time, O(1) space, no stack growth
function sumIterative(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
}

// Tail-recursive form: the recursive call is the LAST action.
// The running total travels down in "acc", so nothing waits on the way up.
function sumTail(arr, i, acc) {
  if (i === arr.length) return acc;
  return sumTail(arr, i + 1, acc + arr[i]);
}

console.log(sumIterative([2, 4, 6]));  // 12
console.log(sumTail([2, 4, 6], 0, 0)); // 12`,
        language: "javascript",
      },
      {
        title: "Common Mistakes & Edge Cases",
        explanation:
          "Three bugs cause almost every broken recursion: no base case (or one that is never reached), forgetting to return the recursive result, and calling yourself with an input that does not shrink. Also watch for recomputing the same subproblem twice, which turns fast power into slow power. Test the base input itself (0, empty array, empty string) and one step above it.",
        code: `// BUG 1: missing return -> the answer is lost, you get undefined
function sumNoReturn(arr, i) {
  if (i === arr.length) return 0;
  arr[i] + sumNoReturn(arr, i + 1);   // computed, then thrown away
}
console.log(sumNoReturn([1, 2], 0));  // undefined

// BUG 2: the input never shrinks -> "Maximum call stack size exceeded"
// function forever(n) { if (n === 0) return 0; return forever(n); }

// BUG 3: base case that can be skipped. n -= 2 jumps over 0 for odd n
// function skip(n) { if (n === 0) return 0; return skip(n - 2); }
// Fix: use n <= 0 as the base case
function safe(n) {
  if (n <= 0) return 0;
  return 1 + safe(n - 2);
}
console.log(safe(5)); // 3

// BUG 4: two recursive calls on the same half -> O(n) instead of O(log n)
function slowPower(x, n) {
  if (n === 0) return 1;
  const h = Math.floor(n / 2);
  return n % 2 === 0
    ? slowPower(x, h) * slowPower(x, h)       // same work done twice
    : slowPower(x, h) * slowPower(x, h) * x;
}
console.log(slowPower(2, 5)); // 32 (right answer, wasted calls)`,
        language: "javascript",
      },
      {
        title: "Practice List",
        explanation:
          "Start with problems that have one recursive call, then move to problems that build the answer from several calls or parse nested input.",
        code: `const practice = {
  easy: [
    "Fibonacci Number",
    "Power of Two",
    "Reverse String",
    "Merge Two Sorted Lists",
  ],
  medium: [
    "Pow(x, n)",
    "Swap Nodes in Pairs",
    "K-th Symbol in Grammar",
    "Decode String",
  ],
  hard: ["Parsing A Boolean Expression"],
};

console.log(practice.easy.length + practice.medium.length + practice.hard.length); // 9`,
        language: "javascript",
      },
    ],
  },
};

const prefixSumTopic: DSATopic = {
  id: "prefix-sum",
  label: "Prefix Sum",
  icon: Sigma,
  href: "/dsa?topic=prefix-sum",
  content: {
    title: "Prefix Sum",
    description:
      "Precompute running totals once, then answer any range-sum question with one subtraction. Pair it with a Map to count subarrays that hit a target sum.",
    steps: [
      {
        title: "What It Is & When to Use It",
        explanation:
          'A prefix sum array stores, at each position, the total of everything before it. Once you have it, the sum of any slice is just the running total at the end minus the running total at the start, so every range query costs O(1) instead of a loop. Signals: "sum of elements between i and j" asked many times, "number of subarrays whose sum equals k", "subarray sum divisible by k", or the array may contain negative numbers (which breaks a sliding window).',
        code: `const nums = [3, 1, 4, 1, 5];

// Without prefix sums: every query loops over the range -> O(n) each
function slowRangeSum(nums, left, right) {
  let total = 0;
  for (let i = left; i <= right; i++) total += nums[i];
  return total;
}
console.log(slowRangeSum(nums, 1, 3)); // 6

// The idea:
// nums    =    [3, 1, 4, 1, 5]
// prefix  = [0, 3, 4, 8, 9, 14]   prefix[i] = sum of the first i numbers
//
// sum(1..3) = prefix[4] - prefix[1] = 9 - 3 = 6
//             (first 4 numbers) - (first 1 number)`,
        language: "javascript",
      },
      {
        title: "The Template",
        explanation:
          "Make the prefix array one longer than the input and put 0 in front. That extra slot means a range starting at index 0 needs no special case: the sum of nums[left..right] is always prefix[right + 1] - prefix[left].",
        code: `// Build once: O(n)
function buildPrefix(nums) {
  const prefix = new Array(nums.length + 1).fill(0); // prefix[0] = 0
  for (let i = 0; i < nums.length; i++) {
    prefix[i + 1] = prefix[i] + nums[i];            // running total
  }
  return prefix;
}

// Query: O(1). Sum of nums[left..right], both ends included
function rangeSum(prefix, left, right) {
  return prefix[right + 1] - prefix[left];
}

const nums = [3, 1, 4, 1, 5];
const prefix = buildPrefix(nums);

console.log(prefix);                  // [0, 3, 4, 8, 9, 14]
console.log(rangeSum(prefix, 0, 2));  // 8   (3 + 1 + 4)
console.log(rangeSum(prefix, 1, 3));  // 6   (1 + 4 + 1)
console.log(rangeSum(prefix, 2, 4));  // 10  (4 + 1 + 5)`,
        language: "javascript",
      },
      {
        title: "Worked Example 1: Subarray Sum Equals K",
        explanation:
          'Count the contiguous subarrays whose sum is exactly k. If the running sum now is sum, and some earlier running sum was sum - k, then the numbers between those two points add up to k. So keep a Map from "running sum seen" to "how many times", and at each step add the count of sum - k. Seed the Map with {0: 1} so a subarray starting at index 0 is counted.',
        code: `function subarraySum(nums, k) {
  const seen = new Map();   // running sum -> how many times we have seen it
  seen.set(0, 1);           // empty prefix: lets subarrays start at index 0
  let sum = 0;
  let count = 0;

  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];                        // running sum up to i
    const need = sum - k;                  // earlier sum that would leave k
    if (seen.has(need)) {
      count += seen.get(need);             // each one marks a valid start
    }
    seen.set(sum, (seen.get(sum) || 0) + 1);
  }
  return count;
}

console.log(subarraySum([1, 2, 1, 2, 1], 3)); // 4
console.log(subarraySum([1, 1, 1], 2));       // 2`,
        language: "javascript",
      },
      {
        title: "Dry Run: subarraySum([1, 2, 1, 2, 1], 3)",
        explanation:
          "Each row is one loop iteration. sum is the running total, need is sum - k, and found is how many times need was already in the Map. Every hit is a subarray ending at i that sums to 3. The four found subarrays are [1,2], [2,1], [1,2] and [2,1].",
        code: `// k = 3, seen starts as {0: 1}
//
//  i | nums[i] | sum | need = sum-3 | found | count | seen after
// ---+---------+-----+--------------+-------+-------+---------------------------
//  0 |    1    |  1  |     -2       |   0   |   0   | {0:1, 1:1}
//  1 |    2    |  3  |      0       |   1   |   1   | {0:1, 1:1, 3:1}
//  2 |    1    |  4  |      1       |   1   |   2   | {0:1, 1:1, 3:1, 4:1}
//  3 |    2    |  6  |      3       |   1   |   3   | {..., 6:1}
//  4 |    1    |  7  |      4       |   1   |   4   | {..., 7:1}
//
// i=1: need 0 -> the prefix before index 0 -> subarray [0..1] = [1,2]
// i=2: need 1 -> prefix ending at 0       -> subarray [1..2] = [2,1]
// i=3: need 3 -> prefix ending at 1       -> subarray [2..3] = [1,2]
// i=4: need 4 -> prefix ending at 2       -> subarray [3..4] = [2,1]

function subarraySum(nums, k) {
  const seen = new Map();
  seen.set(0, 1);
  let sum = 0;
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
    const need = sum - k;
    if (seen.has(need)) count += seen.get(need);
    seen.set(sum, (seen.get(sum) || 0) + 1);
  }
  return count;
}

console.log(subarraySum([1, 2, 1, 2, 1], 3)); // 4`,
        language: "javascript",
      },
      {
        title: "Worked Example 2: 2D Prefix Sum",
        explanation:
          "The same idea on a grid. P[row + 1][col + 1] holds the sum of the rectangle from the top-left corner to (row, col). Build it by adding the cell, the area above and the area to the left, then subtracting the top-left overlap that was added twice. Any sub-rectangle sum is then four lookups: the big rectangle, minus the strip above, minus the strip to the left, plus the corner that was subtracted twice.",
        code: `function build2D(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  // (rows + 1) x (cols + 1), first row and column are zeros
  const P = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      P[row + 1][col + 1] =
        matrix[row][col] + P[row][col + 1] + P[row + 1][col] - P[row][col];
    }
  }
  return P;
}

// Sum of the rectangle with corners (r1, c1) and (r2, c2), inclusive
function sumRegion(P, r1, c1, r2, c2) {
  return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1];
}

const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
const P = build2D(matrix);

console.log(JSON.stringify(P));
// [[0,0,0,0],[0,1,3,6],[0,5,12,21],[0,12,27,45]]

console.log(sumRegion(P, 1, 1, 2, 2)); // 28  (5 + 6 + 8 + 9)
console.log(sumRegion(P, 0, 0, 1, 1)); // 12  (1 + 2 + 4 + 5)`,
        language: "javascript",
      },
      {
        title: "Complexity",
        explanation:
          "Building a 1D prefix array is O(n) time and O(n) space, and each query is then O(1). For q queries that is O(n + q) instead of O(n * q). Subarray Sum Equals K is one pass with a Map: O(n) time and O(n) space. The 2D version costs O(rows * cols) to build and O(1) per rectangle query.",
        code: `// buildPrefix       time O(n)            space O(n)
// rangeSum          time O(1)
// subarraySum       time O(n)            space O(n)  (the Map)
// build2D           time O(rows * cols)  space O(rows * cols)
// sumRegion         time O(1)

// Why it matters: 3 queries on 5 numbers
const nums = [3, 1, 4, 1, 5];
const queries = [[0, 2], [1, 3], [2, 4]];

let loopSteps = 0;                       // brute force: walk every range
for (let k = 0; k < queries.length; k++) {
  for (let i = queries[k][0]; i <= queries[k][1]; i++) loopSteps++;
}
console.log(loopSteps);                  // 9 additions

const prefixSteps = nums.length + queries.length; // build + 1 subtraction each
console.log(prefixSteps);                // 8, and the gap grows with more queries`,
        language: "javascript",
      },
      {
        title: "Common Mistakes & Edge Cases",
        explanation:
          "Off-by-one errors are the classic bug: decide on the n + 1 layout and always use prefix[right + 1] - prefix[left]. In the Map version, forgetting seen.set(0, 1) misses every subarray that starts at index 0, and adding sum to the Map before checking it counts empty subarrays when k is 0. Do not reach for a sliding window when numbers can be negative; the running sum can go down, so shrinking the window is not safe. Prefix sums handle negatives fine.",
        code: `function subarraySum(nums, k) {
  const seen = new Map();
  seen.set(0, 1);            // forget this and [1, -1] below is missed
  let sum = 0;
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
    if (seen.has(sum - k)) count += seen.get(sum - k); // check FIRST
    seen.set(sum, (seen.get(sum) || 0) + 1);           // then record
  }
  return count;
}

// Negatives and zeros: works where a sliding window would not
console.log(subarraySum([1, -1, 0], 0)); // 3  ([1,-1], [0], [1,-1,0])

// Empty input
console.log(subarraySum([], 3));          // 0

// Single element equal to k
console.log(subarraySum([3], 3));         // 1`,
        language: "javascript",
      },
      {
        title: "Practice List",
        explanation:
          "The easy problems are pure prefix arrays. The medium ones add a Map keyed by running sum (or running sum mod k, or a balance of 1s and 0s). The hard one runs the 1D Map trick across every pair of rows.",
        code: `const practice = {
  easy: [
    "Running Sum of 1d Array",
    "Range Sum Query - Immutable",
    "Find Pivot Index",
  ],
  medium: [
    "Subarray Sum Equals K",
    "Continuous Subarray Sum",
    "Contiguous Array",
    "Product of Array Except Self",
    "Range Sum Query 2D - Immutable",
  ],
  hard: ["Number of Submatrices That Sum to Target"],
};

console.log(practice.easy.length + practice.medium.length + practice.hard.length); // 9`,
        language: "javascript",
      },
    ],
  },
};

const monotonicStackTopic: DSATopic = {
  id: "monotonic-stack",
  label: "Monotonic Stack",
  icon: ChartColumn,
  href: "/dsa?topic=monotonic-stack",
  content: {
    title: "Monotonic Stack",
    description:
      'A stack kept in sorted order. Every element is pushed once and popped once, which turns "find the next bigger thing" from O(n^2) into O(n).',
    steps: [
      {
        title: "What It Is & When to Use It",
        explanation:
          'A monotonic stack keeps its values in one direction only, for example always decreasing from bottom to top. When a new value arrives that would break the order, you pop the smaller values off, and for each popped value the new arrival is its answer: the first bigger value to its right. Signals: "next greater element", "next warmer day", "how many days until", "previous smaller", "stock span", or the largest rectangle under bars.',
        code: `// Brute force "next greater": for each i, scan right -> O(n^2)
function nextGreaterSlow(nums) {
  const ans = [];
  for (let i = 0; i < nums.length; i++) {
    let found = -1;
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[j] > nums[i]) {
        found = nums[j];
        break;
      }
    }
    ans.push(found);
  }
  return ans;
}

console.log(nextGreaterSlow([2, 1, 2, 4, 3])); // [4, 2, 4, -1, -1]

// The monotonic stack gets the same answer in ONE pass.
// Picture people of different heights in a queue looking right:
// a short person is "answered" the moment someone taller arrives,
// and can then leave the stack for good.`,
        language: "javascript",
      },
      {
        title: "The Template",
        explanation:
          "Store indices, not values, so you can write answers into the right slot and measure distances. Loop once. While the stack is not empty and the current value beats the value at the top index, pop that index and record the current value as its answer. Then push the current index. Anything still on the stack at the end has no answer.",
        code: `// Next Greater Element (decreasing stack of indices)
function nextGreater(nums) {
  const ans = new Array(nums.length).fill(-1); // default: no greater value
  const stack = [];                             // indices, values decreasing

  for (let i = 0; i < nums.length; i++) {
    // Current value is bigger than the top: it is the top's answer
    while (stack.length > 0 && nums[i] > nums[stack[stack.length - 1]]) {
      const top = stack.pop();
      ans[top] = nums[i];
    }
    stack.push(i);                              // wait for our own answer
  }
  return ans;                                   // leftovers keep -1
}

console.log(nextGreater([2, 1, 2, 4, 3])); // [4, 2, 4, -1, -1]

// Variations:
// next SMALLER     -> flip the comparison: nums[i] < nums[top]
// PREVIOUS greater -> loop from right to left
// distance         -> store i - top instead of nums[i]`,
        language: "javascript",
      },
      {
        title: "Worked Example 1: Daily Temperatures",
        explanation:
          "For each day, how many days until a warmer temperature? Return 0 if none. This is next greater element, except the answer is the distance between indices rather than the warmer temperature itself.",
        code: `function dailyTemperatures(temps) {
  const ans = new Array(temps.length).fill(0);
  const stack = []; // indices of days still waiting for a warmer day

  for (let i = 0; i < temps.length; i++) {
    while (stack.length > 0 && temps[i] > temps[stack[stack.length - 1]]) {
      const top = stack.pop();
      ans[top] = i - top;       // days waited
    }
    stack.push(i);
  }
  return ans;
}

console.log(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]));
// [1, 1, 4, 2, 1, 1, 0, 0]`,
        language: "javascript",
      },
      {
        title: "Dry Run: dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73])",
        explanation:
          "The stack column shows indices with their temperatures in brackets. Watch day 5 (72): it pops two colder days in one go. Day 6 (76) clears everything left. Days 6 and 7 never find a warmer day, so they keep 0.",
        code: `//  i | temp | pops (index: answer)          | stack after (index[temp])
// ---+------+--------------------------------+---------------------------
//  0 |  73  | -                              | 0[73]
//  1 |  74  | 0: 1-0 = 1                     | 1[74]
//  2 |  75  | 1: 2-1 = 1                     | 2[75]
//  3 |  71  | - (71 < 75)                    | 2[75] 3[71]
//  4 |  69  | - (69 < 71)                    | 2[75] 3[71] 4[69]
//  5 |  72  | 4: 5-4 = 1, 3: 5-3 = 2         | 2[75] 5[72]
//  6 |  76  | 5: 6-5 = 1, 2: 6-2 = 4         | 6[76]
//  7 |  73  | - (73 < 76)                    | 6[76] 7[73]
// end: indices 6 and 7 never popped -> answer stays 0
//
// ans = [1, 1, 4, 2, 1, 1, 0, 0]

function dailyTemperatures(temps) {
  const ans = new Array(temps.length).fill(0);
  const stack = [];
  for (let i = 0; i < temps.length; i++) {
    while (stack.length > 0 && temps[i] > temps[stack[stack.length - 1]]) {
      const top = stack.pop();
      ans[top] = i - top;
    }
    stack.push(i);
  }
  return ans;
}

console.log(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]));
// [1, 1, 4, 2, 1, 1, 0, 0]`,
        language: "javascript",
      },
      {
        title: "Worked Example 2: Largest Rectangle in Histogram",
        explanation:
          "Find the biggest rectangle that fits under a bar chart. Keep an increasing stack of bar indices. When a shorter bar arrives, every taller bar on top can no longer stretch right, so pop it and compute its rectangle: its height times the width between the new bar and the bar now below it on the stack. A height-0 bar at the end (i === n) flushes whatever is left.",
        code: `function largestRectangleArea(heights) {
  const stack = []; // indices, heights increasing
  let best = 0;

  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i]; // 0 flushes the stack

    while (stack.length > 0 && h < heights[stack[stack.length - 1]]) {
      const height = heights[stack.pop()];
      // Left wall: the index now on top (or -1 if empty). Right wall: i
      const left = stack.length === 0 ? -1 : stack[stack.length - 1];
      const width = i - left - 1;
      best = Math.max(best, height * width);
    }
    stack.push(i);
  }
  return best;
}

console.log(largestRectangleArea([2, 1, 5, 6, 2, 3])); // 10

// Trace of the pops:
//  i=1 (h=1): pop height 2, width 1 -> 2
//  i=4 (h=2): pop height 6, width 1 -> 6
//             pop height 5, width 2 -> 10   <- best
//  i=6 (h=0): pop height 3, width 1 -> 3
//             pop height 2, width 4 -> 8
//             pop height 1, width 6 -> 6`,
        language: "javascript",
      },
      {
        title: "Complexity",
        explanation:
          'The inner while loop looks like it makes this O(n^2), but each index is pushed exactly once and popped at most once. Across the whole run there are at most n pushes and n pops, so the total work is O(n). The stack can hold every index when the input is already sorted the "wrong" way, so space is O(n).',
        code: `// nextGreater            time O(n)  space O(n)
// dailyTemperatures      time O(n)  space O(n)
// largestRectangleArea   time O(n)  space O(n)

// Count the operations to see the "each index popped once" rule
function countOps(nums) {
  const stack = [];
  let pushes = 0;
  let pops = 0;
  for (let i = 0; i < nums.length; i++) {
    while (stack.length > 0 && nums[i] > nums[stack[stack.length - 1]]) {
      stack.pop();
      pops++;
    }
    stack.push(i);
    pushes++;
  }
  return { pushes, pops };
}

console.log(countOps([73, 74, 75, 71, 69, 72, 76, 73])); // { pushes: 8, pops: 6 }
// pops can never exceed pushes, so total work <= 2n`,
        language: "javascript",
      },
      {
        title: "Common Mistakes & Edge Cases",
        explanation:
          "Push indices, not values, or you cannot fill in the answer slot or measure a distance. Choose strict or non-strict comparison on purpose: with > equal values wait for something strictly bigger. Forgetting to flush the stack at the end leaves bars uncounted in the histogram problem. For a circular array, loop twice (i from 0 to 2n - 1, use i % n) and only push during the first lap.",
        code: `// Next Greater Element II: the array wraps around
function nextGreaterCircular(nums) {
  const n = nums.length;
  const ans = new Array(n).fill(-1);
  const stack = [];

  for (let i = 0; i < 2 * n; i++) {
    const idx = i % n;                        // wrap the index
    while (stack.length > 0 && nums[idx] > nums[stack[stack.length - 1]]) {
      ans[stack.pop()] = nums[idx];
    }
    if (i < n) stack.push(idx);               // push only in the first lap
  }
  return ans;
}

console.log(nextGreaterCircular([1, 2, 1])); // [2, -1, 2]

// Edge cases worth testing:
console.log(nextGreaterCircular([]));        // []
console.log(nextGreaterCircular([5, 5]));    // [-1, -1] (equal is not greater)`,
        language: "javascript",
      },
      {
        title: "Practice List",
        explanation:
          "The easy problems are the template almost as is. The medium ones change what you store or which direction you scan. The hard ones use the stack to find both walls of a region, like the histogram.",
        code: `const practice = {
  easy: [
    "Next Greater Element I",
    "Final Prices With a Special Discount in a Shop",
  ],
  medium: [
    "Daily Temperatures",
    "Next Greater Element II",
    "Online Stock Span",
    "Remove K Digits",
    "Sum of Subarray Minimums",
  ],
  hard: [
    "Largest Rectangle in Histogram",
    "Maximal Rectangle",
    "Trapping Rain Water",
  ],
};

console.log(practice.easy.length + practice.medium.length + practice.hard.length); // 10`,
        language: "javascript",
      },
    ],
  },
};

const intervalsTopic: DSATopic = {
  id: "intervals",
  label: "Intervals",
  icon: CalendarRange,
  href: "/dsa?topic=intervals",
  content: {
    title: "Intervals",
    description:
      "Sort ranges by their start, then sweep left to right comparing each one with the last. Merging, inserting and counting overlaps all follow from that one move.",
    steps: [
      {
        title: "What It Is & When to Use It",
        explanation:
          'An interval is a pair [start, end], like a meeting from 9 to 11. Two intervals overlap when each one starts before the other ends. Once intervals are sorted by start, any interval can only overlap the ones right before it, so a single left-to-right sweep is enough. Signals: "meetings", "bookings", "time ranges", "merge overlapping", "minimum rooms", "remove the fewest to stop overlaps".',
        code: `// Do [a0, a1] and [b0, b1] overlap?
function overlaps(a, b) {
  return a[0] <= b[1] && b[0] <= a[1];
}

console.log(overlaps([1, 3], [2, 6])); // true   (2 is inside 1..3)
console.log(overlaps([1, 2], [3, 4])); // false  (gap between 2 and 3)
console.log(overlaps([1, 2], [2, 3])); // true   (they touch at 2)

// Whether touching counts as overlapping depends on the problem:
// merge intervals: [1,2] + [2,3] -> [1,3]   (touching merges)
// meeting rooms:   9-10 and 10-11 can share a room (touching is fine)`,
        language: "javascript",
      },
      {
        title: "The Template",
        explanation:
          "Sort by start with an explicit comparator. Keep a result list and look only at its last interval. If the current interval starts before the last one ends, they overlap: extend the last one's end. Otherwise there is a gap, so push the current interval as a new block.",
        code: `function sweep(intervals) {
  // 1. Sort by start. Copy first so the caller's array is not changed
  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);
  const result = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const last = result[result.length - 1];

    if (last && current[0] <= last[1]) {
      // 2. Overlap: grow the last block (use max, current may be inside it)
      last[1] = Math.max(last[1], current[1]);
    } else {
      // 3. Gap: start a new block (copy so we never mutate the input)
      result.push([current[0], current[1]]);
    }
  }
  return result;
}

console.log(JSON.stringify(sweep([[1, 4], [2, 3], [6, 8]])));
// [[1,4],[6,8]]`,
        language: "javascript",
      },
      {
        title: "Worked Example 1: Merge Intervals",
        explanation:
          "Given a list of intervals in any order, merge every group that overlaps and return the non-overlapping result. This is the template exactly; the only work is sorting first so overlapping intervals end up next to each other.",
        code: `function merge(intervals) {
  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);
  const merged = [];

  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i][0];
    const end = sorted[i][1];
    const last = merged[merged.length - 1];

    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);   // overlap: extend
    } else {
      merged.push([start, end]);          // gap: new interval
    }
  }
  return merged;
}

console.log(JSON.stringify(merge([[8, 10], [1, 3], [15, 18], [2, 6]])));
// [[1,6],[8,10],[15,18]]`,
        language: "javascript",
      },
      {
        title: "Dry Run: merge([[8,10], [1,3], [15,18], [2,6]])",
        explanation:
          "First the sort puts the intervals in start order. Then each row is one loop iteration: compare the current start with the end of the last merged interval and either extend it or push a new one.",
        code: `// After sorting by start: [[1,3], [2,6], [8,10], [15,18]]
//
//  i | current | last merged | start <= last end? | action          | merged after
// ---+---------+-------------+--------------------+-----------------+----------------------
//  0 | [1,3]   | none        | -                  | push            | [1,3]
//  1 | [2,6]   | [1,3]       | 2 <= 3  yes        | end = max(3,6)  | [1,6]
//  2 | [8,10]  | [1,6]       | 8 <= 6  no         | push            | [1,6] [8,10]
//  3 | [15,18] | [8,10]      | 15 <= 10 no        | push            | [1,6] [8,10] [15,18]

function merge(intervals) {
  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i][0];
    const end = sorted[i][1];
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}

console.log(JSON.stringify(merge([[8, 10], [1, 3], [15, 18], [2, 6]])));
// [[1,6],[8,10],[15,18]]`,
        language: "javascript",
      },
      {
        title: "Worked Example 2: Insert Interval & Meeting Rooms",
        explanation:
          "Insert Interval: the list is already sorted and non-overlapping, so walk it in three phases with one index i: copy everything that ends before the new interval, merge everything that overlaps it, then copy the rest. Meeting Rooms II: how many rooms are needed at once? Sort the start times and end times separately. Walk the starts; if a meeting starts before the earliest unfinished meeting ends, you need another room, otherwise a room frees up and is reused.",
        code: `// Insert Interval: three phases, one pointer
function insert(intervals, newInterval) {
  const result = [];
  let start = newInterval[0];
  let end = newInterval[1];
  let i = 0;

  // Phase 1: entirely before the new interval
  while (i < intervals.length && intervals[i][1] < start) {
    result.push(intervals[i]);
    i++;
  }
  // Phase 2: overlapping -> absorb into [start, end]
  while (i < intervals.length && intervals[i][0] <= end) {
    start = Math.min(start, intervals[i][0]);
    end = Math.max(end, intervals[i][1]);
    i++;
  }
  result.push([start, end]);
  // Phase 3: entirely after
  while (i < intervals.length) {
    result.push(intervals[i]);
    i++;
  }
  return result;
}

// Meeting Rooms II: count overlapping meetings with two sorted lists
function minMeetingRooms(meetings) {
  const starts = meetings.map((m) => m[0]).sort((a, b) => a - b);
  const ends = meetings.map((m) => m[1]).sort((a, b) => a - b);
  let rooms = 0;
  let j = 0;                      // earliest meeting that has not ended
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] < ends[j]) {
      rooms++;                    // nobody has left yet: open a new room
    } else {
      j++;                        // a meeting ended: reuse its room
    }
  }
  return rooms;
}

console.log(JSON.stringify(insert([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8])));
// [[1,2],[3,10],[12,16]]

console.log(minMeetingRooms([[0, 30], [5, 10], [15, 20]])); // 2
console.log(minMeetingRooms([[7, 10], [2, 4]]));            // 1`,
        language: "javascript",
      },
      {
        title: "Complexity",
        explanation:
          "Sorting dominates: O(n log n) time. The sweep after it is a single O(n) pass. Insert Interval skips the sort because the input is already sorted, so it is O(n). Space is O(n) for the output (or for the copied, sorted arrays in Meeting Rooms).",
        code: `// merge            time O(n log n)  (sort) + O(n) sweep   space O(n)
// insert           time O(n)        (already sorted)      space O(n)
// minMeetingRooms  time O(n log n)  (two sorts)           space O(n)

// The sweep itself touches each interval once:
function countVisits(intervals) {
  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);
  let visits = 0;
  for (let i = 0; i < sorted.length; i++) visits++;
  return visits;
}

console.log(countVisits([[8, 10], [1, 3], [15, 18], [2, 6]])); // 4`,
        language: "javascript",
      },
      {
        title: "Common Mistakes & Edge Cases",
        explanation:
          "Calling sort() with no comparator sorts arrays as strings, so [10, 12] lands before [2, 3]. When extending, use Math.max: an interval fully inside the previous one must not shrink it. Decide whether touching endpoints merge (< versus <=). Test the empty list, a single interval, one interval containing all the others, and intervals that only touch.",
        code: `// 1. Default sort compares as strings: "10,12" < "2,3"
console.log(JSON.stringify([[10, 12], [2, 3]].sort()));
// [[10,12],[2,3]]   wrong order
console.log(JSON.stringify([[10, 12], [2, 3]].sort((a, b) => a[0] - b[0])));
// [[2,3],[10,12]]   right

function merge(intervals) {
  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (let i = 0; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (last && sorted[i][0] <= last[1]) {
      last[1] = Math.max(last[1], sorted[i][1]); // max, not sorted[i][1]
    } else {
      merged.push([sorted[i][0], sorted[i][1]]);
    }
  }
  return merged;
}

// 2. Contained interval: without Math.max this would become [1,3]
console.log(JSON.stringify(merge([[1, 10], [2, 3]]))); // [[1,10]]

// 3. Touching intervals merge with <=
console.log(JSON.stringify(merge([[1, 4], [4, 5]]))); // [[1,5]]

// 4. Empty input
console.log(JSON.stringify(merge([])));              // []`,
        language: "javascript",
      },
      {
        title: "Practice List",
        explanation:
          'Every problem here starts with "sort by start" (or by end, for the greedy ones like Non-overlapping Intervals). Try to spot which comparison decides overlap before you code.',
        code: `const practice = {
  easy: ["Meeting Rooms", "Summary Ranges"],
  medium: [
    "Merge Intervals",
    "Insert Interval",
    "Non-overlapping Intervals",
    "Meeting Rooms II",
    "Minimum Number of Arrows to Burst Balloons",
    "Interval List Intersections",
  ],
  hard: ["Employee Free Time", "Data Stream as Disjoint Intervals"],
};

console.log(practice.easy.length + practice.medium.length + practice.hard.length); // 10`,
        language: "javascript",
      },
    ],
  },
};

const bitManipulationTopic: DSATopic = {
  id: "bit-manipulation",
  label: "Bit Manipulation",
  icon: Binary,
  href: "/dsa?topic=bit-manipulation",
  content: {
    title: "Bit Manipulation",
    description:
      "Work directly on the binary digits of a number with AND, OR, XOR and shifts. A handful of one-line tricks solve parity, counting, uniqueness and subset problems with O(1) extra space.",
    steps: [
      {
        title: "What It Is & When to Use It",
        explanation:
          'Every integer is stored as binary digits (bits). The bitwise operators work on those bits one position at a time: AND keeps a bit only if both sides have it, OR keeps it if either side does, XOR keeps it if exactly one side does, and shifts slide all bits left or right (left by one doubles, right by one halves). JavaScript runs bitwise operators on 32-bit signed integers. Signals: "without extra space", "every element appears twice except one", "power of two", "count the 1 bits", "all subsets" of a small set (n up to about 20).',
        code: `// 5 = 101, 3 = 011
console.log(5 & 3);   // 1   (001)  AND: both bits on
console.log(5 | 3);   // 7   (111)  OR: either bit on
console.log(5 ^ 3);   // 6   (110)  XOR: exactly one bit on
console.log(~5);      // -6         NOT: flips every bit (two's complement)
console.log(5 << 1);  // 10  (1010) shift left = multiply by 2
console.log(5 >> 1);  // 2   (10)   shift right = divide by 2, rounding down

// Seeing the bits
console.log((5).toString(2));     // "101"
console.log(parseInt("101", 2));  // 5

// XOR facts that power many tricks:
console.log(7 ^ 7);  // 0   x ^ x = 0
console.log(7 ^ 0);  // 7   x ^ 0 = x`,
        language: "javascript",
      },
      {
        title: "The Template",
        explanation:
          "These one-liners are the whole toolbox. To read bit i, shift it down to position 0 and AND with 1. To set, clear or toggle bit i, build a mask 1 << i and combine with OR, AND-NOT or XOR. The key trick is n & (n - 1): subtracting 1 flips the lowest 1 bit and everything below it, so the AND erases exactly that lowest 1 bit.",
        code: `const isOdd = (n) => (n & 1) === 1;            // last bit is the 1s place
const getBit = (n, i) => (n >> i) & 1;          // read bit i
const setBit = (n, i) => n | (1 << i);          // force bit i to 1
const clearBit = (n, i) => n & ~(1 << i);       // force bit i to 0
const toggleBit = (n, i) => n ^ (1 << i);       // flip bit i
const dropLowest = (n) => n & (n - 1);          // erase the lowest 1 bit
const isPowerOfTwo = (n) => n > 0 && (n & (n - 1)) === 0; // exactly one 1 bit

console.log(isOdd(7));          // true
console.log(isOdd(10));         // false
console.log(getBit(5, 0));      // 1   (101 -> bit 0 is 1)
console.log(getBit(5, 1));      // 0
console.log(setBit(5, 1));      // 7   (101 -> 111)
console.log(clearBit(5, 0));    // 4   (101 -> 100)
console.log(toggleBit(5, 2));   // 1   (101 -> 001)
console.log(dropLowest(12));    // 8   (1100 -> 1000)
console.log(isPowerOfTwo(16));  // true  (10000)
console.log(isPowerOfTwo(18));  // false (10010)`,
        language: "javascript",
      },
      {
        title: "Worked Example 1: Count Set Bits & Single Number",
        explanation:
          "Count Set Bits (Brian Kernighan's trick): keep erasing the lowest 1 bit with n & (n - 1) until n is 0; the number of erasures is the number of 1 bits. Single Number: every value appears twice except one. XOR all values together: equal pairs cancel to 0 (x ^ x = 0), and 0 ^ x = x, so only the lonely value survives. Order does not matter because XOR is commutative.",
        code: `// Number of 1 bits
function countSetBits(n) {
  let count = 0;
  while (n !== 0) {
    n = n & (n - 1);   // erase the lowest 1 bit
    count++;
  }
  return count;
}

// The one value without a pair
function singleNumber(nums) {
  let result = 0;
  for (let i = 0; i < nums.length; i++) {
    result ^= nums[i]; // pairs cancel out
  }
  return result;
}

console.log(countSetBits(13));            // 3  (1101)
console.log(countSetBits(0));             // 0
console.log(singleNumber([4, 1, 2, 1, 2])); // 4`,
        language: "javascript",
      },
      {
        title: "Dry Run: countSetBits(13) and singleNumber([4, 1, 2, 1, 2])",
        explanation:
          "Write the numbers in binary and follow each bit. In the first table, every iteration removes exactly one 1 bit. In the second, watch result: the 1 and the 2 switch their bits on and then off again, leaving only the bits of 4.",
        code: `// countSetBits(13)
//
// iter | n (binary) | n - 1 (binary) | n & (n-1)   | count
// -----+------------+----------------+-------------+------
//  1   | 1101 (13)  | 1100 (12)      | 1100 (12)   |  1
//  2   | 1100 (12)  | 1011 (11)      | 1000 (8)    |  2
//  3   | 1000 (8)   | 0111 (7)       | 0000 (0)    |  3
// n is 0 -> stop, return 3

// singleNumber([4, 1, 2, 1, 2])
//
//  i | nums[i] | result before | result ^ nums[i]
// ---+---------+---------------+------------------
//  0 |    4    | 000 (0)       | 100 (4)
//  1 |    1    | 100 (4)       | 101 (5)
//  2 |    2    | 101 (5)       | 111 (7)
//  3 |    1    | 111 (7)       | 110 (6)   the 1 bit turns off again
//  4 |    2    | 110 (6)       | 100 (4)   the 2 bit turns off again
// return 4

function countSetBits(n) {
  let count = 0;
  while (n !== 0) {
    n = n & (n - 1);
    count++;
  }
  return count;
}

function singleNumber(nums) {
  let result = 0;
  for (let i = 0; i < nums.length; i++) result ^= nums[i];
  return result;
}

console.log(countSetBits(13));              // 3
console.log(singleNumber([4, 1, 2, 1, 2])); // 4`,
        language: "javascript",
      },
      {
        title: "Worked Example 2: Subsets via Bitmask",
        explanation:
          'A set of n items has 2^n subsets, and the numbers 0 to 2^n - 1 written in binary list every on/off pattern exactly once. Treat each number as a mask: bit j on means "include nums[j]". The outer loop walks the masks, the inner loop reads each bit. No recursion needed.',
        code: `function subsets(nums) {
  const n = nums.length;
  const result = [];

  for (let mask = 0; mask < (1 << n); mask++) {  // 0 .. 2^n - 1
    const subset = [];
    for (let j = 0; j < n; j++) {
      if (mask & (1 << j)) {                     // is bit j on?
        subset.push(nums[j]);
      }
    }
    result.push(subset);
  }
  return result;
}

console.log(JSON.stringify(subsets([1, 2, 3])));
// [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]

// mask | binary | bits on | subset
// -----+--------+---------+--------
//   0  |  000   |  -      | []
//   1  |  001   |  0      | [1]
//   2  |  010   |  1      | [2]
//   3  |  011   |  0,1    | [1,2]
//   4  |  100   |  2      | [3]
//   5  |  101   |  0,2    | [1,3]
//   6  |  110   |  1,2    | [2,3]
//   7  |  111   |  0,1,2  | [1,2,3]`,
        language: "javascript",
      },
      {
        title: "Complexity",
        explanation:
          "Each bitwise operation is O(1). countSetBits loops once per 1 bit, so at most 32 times for a 32-bit number. singleNumber is one pass with a single variable: O(n) time, O(1) space, which beats a hash map's O(n) space. Subsets via bitmask visits 2^n masks and reads n bits for each, so O(n * 2^n) time, the same as the recursive version, and only practical for small n.",
        code: `// isOdd / getBit / setBit / isPowerOfTwo   time O(1)
// countSetBits(n)    time O(number of 1 bits) <= 32
// singleNumber       time O(n)        space O(1)
// subsets            time O(n * 2^n)  space O(n * 2^n) for the output

// How fast 2^n grows:
for (let n = 1; n <= 4; n++) {
  console.log(n, 1 << n);
}
// 1 2
// 2 4
// 3 8
// 4 16`,
        language: "javascript",
      },
      {
        title: "Common Mistakes & Edge Cases",
        explanation:
          "Operator precedence is the top bug: === binds tighter than &, so n & 1 === 0 is really n & (1 === 0). Always wrap the bitwise part in parentheses. JavaScript bitwise operators work on signed 32-bit integers, so 1 << 31 is negative and numbers above 2^31 - 1 wrap around; use >>> 0 to read a value as unsigned. Power of two must reject 0 and negatives.",
        code: `// 1. Precedence: === runs before &
const n = 4;
console.log(n & 1 === 0);    // 0     means n & false, NOT what you meant
console.log((n & 1) === 0);  // true  4 is even

// 2. 32-bit signed results
console.log(1 << 31);        // -2147483648
console.log((1 << 31) >>> 0); // 2147483648 (read as unsigned)
console.log(2 ** 32 | 0);    // 0  (the high bits are dropped)

// 3. Power of two edge cases
const isPowerOfTwo = (x) => x > 0 && (x & (x - 1)) === 0;
console.log(isPowerOfTwo(0));  // false (0 & -1 is 0, so the x > 0 guard matters)
console.log(isPowerOfTwo(1));  // true  (2^0)
console.log(isPowerOfTwo(-8)); // false`,
        language: "javascript",
      },
      {
        title: "Practice List",
        explanation:
          "The easy problems each use one trick from the template. The medium ones combine tricks or count bits per position. Keep a binary table on paper while you solve them.",
        code: `const practice = {
  easy: [
    "Number of 1 Bits",
    "Single Number",
    "Power of Two",
    "Counting Bits",
    "Missing Number",
    "Reverse Bits",
  ],
  medium: [
    "Subsets",
    "Single Number II",
    "Sum of Two Integers",
    "Bitwise AND of Numbers Range",
  ],
  hard: ["Minimum One Bit Operations to Make Integers Zero"],
};

console.log(practice.easy.length + practice.medium.length + practice.hard.length); // 11`,
        language: "javascript",
      },
    ],
  },
};

const matrixTopic: DSATopic = {
  id: "matrix",
  label: "Matrix / 2D Arrays",
  icon: Grid2x2,
  href: "/dsa?topic=matrix",
  content: {
    title: "Matrix / 2D Arrays",
    description:
      "A grid is an array of rows. Master row and column loops, boundary-shrinking for spirals, in-place rotation, the staircase search and DFS flood fill on cells.",
    steps: [
      {
        title: "What It Is & When to Use It",
        explanation:
          'A matrix is an array of arrays: grid[row] is one row and grid[row][col] is one cell. rows is grid.length and cols is grid[0].length. Moving to a neighbour means adding a direction to (row, col) and checking it stays inside the grid. Signals: "grid", "board", "image", "island", "walk in a spiral", "rotate the image", or a matrix sorted along its rows and columns.',
        code: `const grid = [
  [1, 2, 3],
  [4, 5, 6],
];

const rows = grid.length;     // 2
const cols = grid[0].length;  // 3

console.log(rows, cols);      // 2 3
console.log(grid[1][2]);      // 6   row 1, column 2
console.log(grid[0]);         // [1, 2, 3]  a whole row

// A column has to be collected cell by cell
const column1 = [];
for (let row = 0; row < rows; row++) {
  column1.push(grid[row][1]);
}
console.log(column1);         // [2, 5]`,
        language: "javascript",
      },
      {
        title: "The Template",
        explanation:
          "Three loops cover most grid work. Row-major: outer loop on rows, inner on columns (reading order). Column-major: swap the loops. Neighbours: keep a list of four direction offsets and skip any neighbour that falls outside the grid. That bounds check is the heart of every grid DFS and BFS.",
        code: `const grid = [
  [1, 2, 3],
  [4, 5, 6],
];
const rows = grid.length;
const cols = grid[0].length;

// 1. Row by row
const rowSums = [];
for (let row = 0; row < rows; row++) {
  let total = 0;
  for (let col = 0; col < cols; col++) total += grid[row][col];
  rowSums.push(total);
}
console.log(rowSums); // [6, 15]

// 2. Column by column (loops swapped)
const colSums = [];
for (let col = 0; col < cols; col++) {
  let total = 0;
  for (let row = 0; row < rows; row++) total += grid[row][col];
  colSums.push(total);
}
console.log(colSums); // [5, 7, 9]

// 3. Four neighbours with a bounds check
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
function neighbours(row, col) {
  const out = [];
  for (let k = 0; k < DIRS.length; k++) {
    const r = row + DIRS[k][0];
    const c = col + DIRS[k][1];
    if (r >= 0 && r < rows && c >= 0 && c < cols) out.push(grid[r][c]);
  }
  return out;
}
console.log(neighbours(0, 1)); // [5, 1, 3]  (up is off the grid)`,
        language: "javascript",
      },
      {
        title: "Worked Example 1: Spiral Order",
        explanation:
          "Read a matrix in a clockwise spiral. Keep four walls: top, bottom, left and right. Walk the top row left to right and move the top wall down; walk the right column top to bottom and move the right wall in; walk the bottom row backwards and move the bottom wall up; walk the left column upwards and move the left wall in. Repeat until the walls cross. The two if checks stop a single leftover row or column from being read twice.",
        code: `function spiralOrder(matrix) {
  const result = [];
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    for (let col = left; col <= right; col++) result.push(matrix[top][col]);
    top++;                                       // top row done
    for (let row = top; row <= bottom; row++) result.push(matrix[row][right]);
    right--;                                     // right column done
    if (top <= bottom) {
      for (let col = right; col >= left; col--) result.push(matrix[bottom][col]);
      bottom--;                                  // bottom row done
    }
    if (left <= right) {
      for (let row = bottom; row >= top; row--) result.push(matrix[row][left]);
      left++;                                    // left column done
    }
  }
  return result;
}

console.log(spiralOrder([
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
])); // [1, 2, 3, 6, 9, 8, 7, 4, 5]`,
        language: "javascript",
      },
      {
        title: "Dry Run: spiralOrder of a 3 x 3 matrix",
        explanation:
          "Each row of the trace is one side of the spiral. The walls column shows top, bottom, left and right after that side is finished. On the second lap only the centre is left: the top-row walk reads 5, and every other walk is skipped because its range is empty or the walls have crossed.",
        code: `// matrix:     col 0  col 1  col 2
//   row 0       1      2      3
//   row 1       4      5      6
//   row 2       7      8      9
//
// lap | side             | cells read            | walls after (T,B,L,R) | result
// ----+------------------+-----------------------+-----------------------+--------------------
//  1  | top row  ->      | (0,0) (0,1) (0,2)     | 1, 2, 0, 2            | 1 2 3
//  1  | right col down   | (1,2) (2,2)           | 1, 2, 0, 1            | 1 2 3 6 9
//  1  | bottom row <-    | (2,1) (2,0)           | 1, 1, 0, 1            | ... 8 7
//  1  | left col up      | (1,0)                 | 1, 1, 1, 1            | ... 4
//  2  | top row  ->      | (1,1)                 | 2, 1, 1, 1            | ... 5
//  2  | right col down   | row 2..1 empty        | 2, 1, 1, 0            |
//  2  | bottom row       | skipped: top > bottom |                       |
//  2  | left col         | skipped: left > right |                       |
// loop check: top 2 <= bottom 1 is false -> stop

function spiralOrder(matrix) {
  const result = [];
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let col = left; col <= right; col++) result.push(matrix[top][col]);
    top++;
    for (let row = top; row <= bottom; row++) result.push(matrix[row][right]);
    right--;
    if (top <= bottom) {
      for (let col = right; col >= left; col--) result.push(matrix[bottom][col]);
      bottom--;
    }
    if (left <= right) {
      for (let row = bottom; row >= top; row--) result.push(matrix[row][left]);
      left++;
    }
  }
  return result;
}

console.log(spiralOrder([[1, 2, 3], [4, 5, 6], [7, 8, 9]]));
// [1, 2, 3, 6, 9, 8, 7, 4, 5]`,
        language: "javascript",
      },
      {
        title: "Worked Example 2: Rotate 90 Degrees & Search a Sorted Matrix",
        explanation:
          "Rotate an n x n matrix clockwise in place: first transpose (swap grid[row][col] with grid[col][row], only above the diagonal so each pair swaps once), then reverse every row. Search a matrix whose rows and columns are both sorted: start at the top-right corner. If the cell is too big, everything below it in that column is bigger too, so move left; if it is too small, everything to its left is smaller, so move down. Each step throws away a whole row or column.",
        code: `// Rotate clockwise = transpose, then reverse each row
function rotate(matrix) {
  const n = matrix.length;
  for (let row = 0; row < n; row++) {
    for (let col = row + 1; col < n; col++) {     // above the diagonal only
      const temp = matrix[row][col];
      matrix[row][col] = matrix[col][row];
      matrix[col][row] = temp;
    }
  }
  for (let row = 0; row < n; row++) {
    matrix[row].reverse();
  }
  return matrix;
}

// Staircase search from the top-right corner
function searchMatrix(matrix, target) {
  let row = 0;
  let col = matrix[0].length - 1;
  while (row < matrix.length && col >= 0) {
    const value = matrix[row][col];
    if (value === target) return true;
    if (value > target) col--;   // too big: drop this column
    else row++;                  // too small: drop this row
  }
  return false;
}

console.log(JSON.stringify(rotate([[1, 2, 3], [4, 5, 6], [7, 8, 9]])));
// [[7,4,1],[8,5,2],[9,6,3]]

const sorted = [
  [1, 4, 7, 11],
  [2, 5, 8, 12],
  [3, 6, 9, 16],
];
console.log(searchMatrix(sorted, 5));  // true   path: 11 -> 7 -> 4 -> 5
console.log(searchMatrix(sorted, 10)); // false  path: 11 -> 7 -> 8 -> 9 -> off the grid`,
        language: "javascript",
      },
      {
        title: "Flood Fill: DFS on a Grid",
        explanation:
          'Flood fill is the paint-bucket tool: starting from one cell, recolour it and every cell connected to it (up, down, left, right) that had the same original colour. Depth-first search does it naturally. The recursive helper stops on three conditions: off the grid, a different colour, or already painted. Painting a cell before visiting its neighbours is what stops it being visited twice. This same shape solves Number of Islands and most "connected region" grid problems.',
        code: `function floodFill(image, sr, sc, color) {
  const original = image[sr][sc];
  if (original === color) return image;   // nothing to do (and avoids looping forever)
  const rows = image.length;
  const cols = image[0].length;

  function dfs(row, col) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return; // off the grid
    if (image[row][col] !== original) return;                       // wrong colour or done
    image[row][col] = color;                                        // paint first
    dfs(row + 1, col);   // down
    dfs(row - 1, col);   // up
    dfs(row, col + 1);   // right
    dfs(row, col - 1);   // left
  }

  dfs(sr, sc);
  return image;
}

const image = [
  [1, 1, 1],
  [1, 1, 0],
  [1, 0, 1],
];
console.log(JSON.stringify(floodFill(image, 1, 1, 2)));
// [[2,2,2],[2,2,0],[2,0,1]]
// The bottom-right 1 is not connected (0s on both sides), so it stays 1.`,
        language: "javascript",
      },
      {
        title: "Complexity, Mistakes & Edge Cases",
        explanation:
          "Any full traversal (sums, spiral, rotate, flood fill) visits each cell a constant number of times: O(rows * cols). Rotate works in place, O(1) extra space. The staircase search is O(rows + cols) because each step removes a row or a column. Flood fill's recursion can go as deep as the number of cells. Common bugs: mixing up rows and cols on a non-square grid, using grid[x][y] with x as the column, creating rows with Array(n).fill([]) so every row is the same array, and forgetting the original === color check in flood fill, which recurses forever. Test a 1 x 1 grid, a single row, a single column and an empty grid.",
        code: `// spiralOrder / rotate / floodFill  time O(rows * cols)
// rotate                           extra space O(1)
// searchMatrix                     time O(rows + cols)
// floodFill                        stack depth up to O(rows * cols)

// BUG: fill() puts the SAME row array in every slot
const bad = new Array(2).fill([0, 0]);
bad[0][0] = 1;
console.log(JSON.stringify(bad));   // [[1,0],[1,0]]  both rows changed

// FIX: build a fresh array for each row
const good = Array.from({ length: 2 }, () => [0, 0]);
good[0][0] = 1;
console.log(JSON.stringify(good));  // [[1,0],[0,0]]

// Non-square grid: rows and cols differ, loop bounds must match
const wide = [[1, 2, 3, 4]];        // 1 row, 4 columns
console.log(wide.length, wide[0].length); // 1 4

// Guard against an empty grid before reading grid[0].length
const empty = [];
console.log(empty.length === 0 ? 0 : empty[0].length); // 0`,
        language: "javascript",
      },
      {
        title: "Practice List",
        explanation:
          "Pair the easy problems with the traversal template, the medium ones with spiral, rotate, staircase or DFS, and save the hard one for after you are comfortable with DFS plus memoisation on a grid.",
        code: `const practice = {
  easy: ["Flood Fill", "Transpose Matrix", "Toeplitz Matrix"],
  medium: [
    "Spiral Matrix",
    "Rotate Image",
    "Search a 2D Matrix II",
    "Set Matrix Zeroes",
    "Number of Islands",
    "Game of Life",
  ],
  hard: ["Longest Increasing Path in a Matrix"],
};

console.log(practice.easy.length + practice.medium.length + practice.hard.length); // 10`,
        language: "javascript",
      },
    ],
  },
};

export const patternTopics: DSATopic[] = [
  stringsTopic,
  recursionTopic,
  prefixSumTopic,
  monotonicStackTopic,
  intervalsTopic,
  bitManipulationTopic,
  matrixTopic,
];
