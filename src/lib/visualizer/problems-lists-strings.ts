import type { Problem } from "./problem-types";

/** Linked Lists (56–65) and Strings & Parsing (134–143). */
export const LIST_STRING_PROBLEMS: Problem[] = [
  // ───────────────────────────── Linked Lists ─────────────────────────────
  {
    id: "reverse-linked-list",
    number: 56,
    title: "Reverse Linked List",
    group: "Linked Lists",
    difficulty: "Easy",
    statement:
      "You are given the head of a singly linked list. Reverse the list so the last node comes first, and return the new head.",
    example: "head = [1,2,3,4] → [4,3,2,1]",
    approach:
      "Walk the list once and flip each arrow as you pass it. Keep three references: `prev` (the part already reversed), `curr` (the node being flipped) and `next` (saved so the rest of the list is not lost). When `curr` falls off the end, `prev` is the new head.",
    watch: [
      "`next` is saved before `curr.next` is overwritten, otherwise the rest of the list would be lost",
      "after each pass one more arrow points backwards, towards `prev`",
      "`prev` and `curr` each move one node to the right per pass",
      "the loop ends when `curr` is null: `prev` now holds the old tail, the new head",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `class ListNode {
  constructor(val, next = null) {
    this.val = val; // the value in this node
    this.next = next; // the following node (null at the end)
  }
}

function reverseList(head) {
  let prev = null; // the reversed part starts empty
  let curr = head; // the node we are about to flip
  while (curr) {
    const next = curr.next; // remember the rest of the list
    curr.next = prev; // flip the arrow backwards
    prev = curr; // the reversed part grows by one
    curr = next; // step forward
  }
  return prev; // the old tail is the new head
}

// print a list as a plain array
function toArray(head) {
  const out = [];
  for (let node = head; node; node = node.next) out.push(node.val);
  return out;
}

const head = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4))));
console.log(toArray(reverseList(head))); // expected: [4, 3, 2, 1]`,
  },
  {
    id: "merge-two-sorted-lists",
    number: 57,
    title: "Merge Two Sorted Lists",
    group: "Linked Lists",
    difficulty: "Easy",
    statement:
      "Two linked lists are each sorted from small to large. Join them into one sorted list by relinking their nodes, and return its head.",
    example: "list1 = [1,3,5], list2 = [2,3,4] → [1,2,3,3,4,5]",
    approach:
      "Start from a dummy node so there is always something to attach to. Compare the front nodes of the two lists, attach the smaller one to `tail`, and move that list forward. When one list runs out, the other is already sorted, so attach the rest in one go.",
    watch: [
      "`p` and `q` are the front nodes of the two lists; the smaller value wins each pass",
      "`tail` always sits on the last node of the merged list and moves one step per pass",
      "on equal values `p` goes first (`<=`), which keeps the merge stable",
      "when one list is empty, the leftover list is attached in a single step",
    ],
    complexity: { time: "O(n + m)", space: "O(1)" },
    code: `class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function mergeTwoLists(list1, list2) {
  const dummy = new ListNode(0); // placeholder in front of the answer
  let tail = dummy; // last node of the merged list
  let p = list1; // front of the first list
  let q = list2; // front of the second list
  while (p && q) {
    if (p.val <= q.val) {
      tail.next = p; // take from the first list
      p = p.next;
    } else {
      tail.next = q; // take from the second list
      q = q.next;
    }
    tail = tail.next; // the merged list grew by one
  }
  tail.next = p ? p : q; // attach whatever is left
  return dummy.next; // skip the placeholder
}

function toArray(head) {
  const out = [];
  for (let node = head; node; node = node.next) out.push(node.val);
  return out;
}

const list1 = new ListNode(1, new ListNode(3, new ListNode(5)));
const list2 = new ListNode(2, new ListNode(3, new ListNode(4)));
console.log(toArray(mergeTwoLists(list1, list2))); // expected: [1, 2, 3, 3, 4, 5]`,
  },
  {
    id: "linked-list-cycle",
    number: 58,
    title: "Linked List Cycle",
    group: "Linked Lists",
    difficulty: "Easy",
    statement:
      "Given the head of a linked list, decide whether it has a cycle: some node whose `next` points back to an earlier node, so walking the list never ends.",
    example: "head = [3,2,0,4], tail links back to index 1 → true",
    approach:
      "Use two runners (Floyd's tortoise and hare): `slow` moves one node at a time, `fast` moves two. If the list ends, `fast` reaches null and there is no cycle. If there is a cycle, `fast` laps around and must land on the same node as `slow`.",
    watch: [
      "`slow` takes one step per pass, `fast` takes two",
      "the check `fast && fast.next` stops the loop if the list has an end",
      "inside the cycle the gap between them shrinks by one each pass",
      "`slow === fast` compares nodes, not values: same node means a cycle",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function hasCycle(head) {
  let slow = head; // moves one step at a time
  let fast = head; // moves two steps at a time
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true; // the runners met: there is a loop
  }
  return false; // fast reached the end: no loop
}

// build 3 -> 2 -> 0 -> 4, then link 4 back to 2
const second = new ListNode(2);
const tailNode = new ListNode(4);
second.next = new ListNode(0, tailNode);
const head = new ListNode(3, second);
tailNode.next = second; // this creates the cycle

console.log(hasCycle(head)); // expected: true`,
  },
  {
    id: "middle-of-the-linked-list",
    number: 59,
    title: "Middle of the Linked List",
    group: "Linked Lists",
    difficulty: "Easy",
    statement:
      "Return the middle node of a linked list. If there are two middle nodes (an even length), return the second one.",
    example: "head = [1,2,3,4,5,6] → [4,5,6]",
    approach:
      "Send two pointers from the head: `slow` takes one step, `fast` takes two. When `fast` reaches the end, `slow` has covered exactly half the distance, so it sits on the middle. No need to count the length first.",
    watch: [
      "`fast` moves twice as far as `slow` on every pass",
      "with 6 nodes `fast` ends on null, which leaves `slow` on the second middle (4)",
      "the loop condition `fast && fast.next` guards both odd and even lengths",
      "the printed array is the list from the middle node onwards",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function middleNode(head) {
  let slow = head; // one step per pass
  let fast = head; // two steps per pass
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow; // fast hit the end, so slow is halfway
}

// build a list from an array, back to front
function fromArray(arr) {
  let head = null;
  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);
  return head;
}

function toArray(head) {
  const out = [];
  for (let node = head; node; node = node.next) out.push(node.val);
  return out;
}

const head = fromArray([1, 2, 3, 4, 5, 6]);
console.log(toArray(middleNode(head))); // expected: [4, 5, 6]`,
  },
  {
    id: "remove-nth-node-from-end-of-list",
    number: 60,
    title: "Remove Nth Node From End of List",
    group: "Linked Lists",
    difficulty: "Medium",
    statement:
      "Remove the n-th node counting from the end of a linked list and return the head. Try to do it in a single pass.",
    example: "head = [1,2,3,4,5], n = 2 → [1,2,3,5]",
    approach:
      "Give `fast` a head start of n + 1 nodes from a dummy node in front of the list. Then move `slow` and `fast` together; when `fast` falls off the end, `slow` sits just before the node to remove. Skip that node with `slow.next = slow.next.next`.",
    watch: [
      "the first loop moves only `fast`, opening a gap of n + 1 nodes",
      "the second loop moves both pointers, keeping the gap fixed",
      "when `fast` is null, `slow` is right before the node to delete (3, before 4)",
      "the dummy node handles removing the head itself without a special case",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head); // sits in front of the head
  let fast = dummy;
  let slow = dummy;
  // give fast a head start of n + 1 nodes
  for (let i = 0; i <= n; i++) fast = fast.next;
  // move both until fast falls off the end
  while (fast) {
    fast = fast.next;
    slow = slow.next;
  }
  slow.next = slow.next.next; // skip the n-th node from the end
  return dummy.next;
}

function fromArray(arr) {
  let head = null;
  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);
  return head;
}

function toArray(head) {
  const out = [];
  for (let node = head; node; node = node.next) out.push(node.val);
  return out;
}

const head = fromArray([1, 2, 3, 4, 5]);
console.log(toArray(removeNthFromEnd(head, 2))); // expected: [1, 2, 3, 5]`,
  },
  {
    id: "palindrome-linked-list",
    number: 61,
    title: "Palindrome Linked List",
    group: "Linked Lists",
    difficulty: "Easy",
    statement:
      "Given the head of a singly linked list, decide whether its values read the same forwards and backwards.",
    example: "head = [1,2,2,1] → true",
    approach:
      "Find the middle with a slow and a fast pointer, then reverse the second half in place. Now walk one pointer from the head and one from the start of the reversed half, comparing values. Any mismatch means it is not a palindrome; this uses no extra array.",
    watch: [
      "first `slow`/`fast` find the middle: `slow` stops at the second 2",
      "then `prev`/`curr` reverse the second half, so it reads 1 → 2",
      "`p` (from the head) and `q` (from the reversed half) step together comparing values",
      "the compare loop only runs while `q` exists: the second half is the shorter one",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function isPalindrome(head) {
  // 1) find the middle
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  // 2) reverse the second half
  let prev = null;
  let curr = slow;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  // 3) compare the first half with the reversed second half
  let p = head;
  let q = prev;
  while (q) {
    if (p.val !== q.val) return false; // mismatch
    p = p.next;
    q = q.next;
  }
  return true;
}

const head = new ListNode(1, new ListNode(2, new ListNode(2, new ListNode(1))));
console.log(isPalindrome(head)); // expected: true`,
  },
  {
    id: "intersection-of-two-linked-lists",
    number: 62,
    title: "Intersection of Two Linked Lists",
    group: "Linked Lists",
    difficulty: "Easy",
    statement:
      "Two linked lists may join at some node and share every node after it. Return the node where they meet, or null if they never meet.",
    example: "listA = [4,1,8,4,5], listB = [5,6,1,8,4,5], shared from 8 → 8",
    approach:
      "Walk `p` along list A and `q` along list B. When a pointer reaches the end, restart it at the head of the other list. Both then travel the same total distance (A + B), so they arrive at the shared node on the same step, or both reach null together if there is none.",
    watch: [
      "`p` starts on list A and `q` on list B",
      "when one hits null it jumps to the other list's head, which cancels out the length difference",
      "`p === q` compares nodes, not values: the first 1 in each list is a different node",
      "they meet on the node holding 8 after the switch",
    ],
    complexity: { time: "O(n + m)", space: "O(1)" },
    code: `class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function getIntersectionNode(headA, headB) {
  let p = headA; // walks A, then B
  let q = headB; // walks B, then A
  while (p !== q) {
    p = p ? p.next : headB; // at the end, switch to the other list
    q = q ? q.next : headA;
  }
  return p; // the shared node, or null if none
}

// the shared tail 8 -> 4 -> 5
const shared = new ListNode(8, new ListNode(4, new ListNode(5)));
const headA = new ListNode(4, new ListNode(1, shared));
const headB = new ListNode(5, new ListNode(6, new ListNode(1, shared)));

const node = getIntersectionNode(headA, headB);
console.log(node ? node.val : null); // expected: 8`,
  },
  {
    id: "remove-duplicates-from-sorted-list",
    number: 63,
    title: "Remove Duplicates from Sorted List",
    group: "Linked Lists",
    difficulty: "Easy",
    statement:
      "A linked list is sorted, so equal values sit next to each other. Remove the extra copies so each value appears once, and return the head.",
    example: "head = [1,1,2,3,3] → [1,2,3]",
    approach:
      "Walk the list with `curr`. If the next node has the same value, unlink it by pointing `curr.next` past it and stay put (there may be more copies). Otherwise move on. Because the list is sorted, every duplicate is right next to its original.",
    watch: [
      "`curr.val === curr.next.val` means the next node is a copy",
      "on a copy, `curr` does not move; only its `next` arrow skips ahead",
      "on a new value, `curr` steps forward",
      "the loop stops when `curr` is the last node",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function deleteDuplicates(head) {
  let curr = head;
  while (curr && curr.next) {
    if (curr.val === curr.next.val) {
      curr.next = curr.next.next; // unlink the copy, stay here
    } else {
      curr = curr.next; // a new value: move on
    }
  }
  return head;
}

function fromArray(arr) {
  let head = null;
  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);
  return head;
}

function toArray(head) {
  const out = [];
  for (let node = head; node; node = node.next) out.push(node.val);
  return out;
}

const head = fromArray([1, 1, 2, 3, 3]);
console.log(toArray(deleteDuplicates(head))); // expected: [1, 2, 3]`,
  },
  {
    id: "add-two-numbers",
    number: 64,
    title: "Add Two Numbers",
    group: "Linked Lists",
    difficulty: "Medium",
    statement:
      "Two numbers are stored as linked lists with their digits in reverse order (ones digit first). Add them and return the sum as a list in the same reverse order.",
    example: "l1 = [2,4,3], l2 = [5,6,4] → [7,0,8]",
    approach:
      "This is school addition, and the reverse order helps: the ones digits come first. Add the two digits plus the `carry`, keep `sum % 10` as the new node and carry `Math.floor(sum / 10)` to the next column. Keep going while either list has digits or a carry is left.",
    watch: [
      "`p` and `q` walk the two lists one digit at a time; a missing digit counts as 0",
      "`sum` includes the `carry` from the previous column",
      "4 + 6 = 10 writes 0 and sets `carry` to 1, which turns 3 + 4 into 8",
      "`tail` grows the answer list one node per column",
    ],
    complexity: { time: "O(max(n, m))", space: "O(max(n, m))" },
    code: `class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function addTwoNumbers(l1, l2) {
  const dummy = new ListNode(0); // placeholder in front of the answer
  let tail = dummy;
  let p = l1;
  let q = l2;
  let carry = 0;
  while (p || q || carry) {
    const sum = (p ? p.val : 0) + (q ? q.val : 0) + carry;
    carry = Math.floor(sum / 10); // the tens part moves to the next column
    tail.next = new ListNode(sum % 10); // the ones part stays here
    tail = tail.next;
    if (p) p = p.next;
    if (q) q = q.next;
  }
  return dummy.next;
}

function toArray(head) {
  const out = [];
  for (let node = head; node; node = node.next) out.push(node.val);
  return out;
}

const l1 = new ListNode(2, new ListNode(4, new ListNode(3))); // 342
const l2 = new ListNode(5, new ListNode(6, new ListNode(4))); // 465
console.log(toArray(addTwoNumbers(l1, l2))); // expected: [7, 0, 8]`,
  },
  {
    id: "reorder-list",
    number: 65,
    title: "Reorder List",
    group: "Linked Lists",
    difficulty: "Medium",
    statement:
      "Reorder a linked list L0 → L1 → … → Ln into L0 → Ln → L1 → Ln-1 → … by relinking nodes, not by changing values.",
    example: "head = [1,2,3,4,5] → [1,5,2,4,3]",
    approach:
      "Three steps you already know: find the middle with slow/fast pointers, cut the list there and reverse the second half, then weave the two halves together by taking one node from each in turn.",
    watch: [
      "`slow` stops on 3; `slow.next = null` cuts the first half off at 3",
      "`prev` ends up as the head of the reversed second half: 5 → 4",
      "in the weave, `p` walks the first half and `q` the reversed half",
      "each pass links `p` to `q`, then `q` to `p`'s old next",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reorderList(head) {
  // 1) find the middle
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  // 2) reverse the second half and cut the list in two
  let prev = null;
  let curr = slow.next;
  slow.next = null; // the first half ends at the middle
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  // 3) weave: one node from each half in turn
  let p = head;
  let q = prev;
  while (q) {
    const pNext = p.next;
    const qNext = q.next;
    p.next = q; // first-half node, then a second-half node
    q.next = pNext;
    p = pNext;
    q = qNext;
  }
}

function fromArray(arr) {
  let head = null;
  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);
  return head;
}

function toArray(head) {
  const out = [];
  for (let node = head; node; node = node.next) out.push(node.val);
  return out;
}

const head = fromArray([1, 2, 3, 4, 5]);
reorderList(head);
console.log(toArray(head)); // expected: [1, 5, 2, 4, 3]`,
  },

  // ─────────────────────────── Strings & Parsing ───────────────────────────
  {
    id: "longest-common-prefix",
    number: 134,
    title: "Longest Common Prefix",
    group: "Strings & Parsing",
    difficulty: "Easy",
    statement:
      "Given a list of words, return the longest starting piece that all of them share. Return an empty string if they share nothing.",
    example: 'strs = ["flower","flow","flight"] → "fl"',
    approach:
      "Scan column by column: take the character at position `i` in the first word and check that every other word has the same character there. The first column where a word is too short or differs ends the prefix, so return everything before it.",
    watch: [
      "`i` is the column; `ch` is the first word's letter in that column",
      "`j` checks every other word at the same column",
      "at `i = 2`, \"flight\" has `i` instead of `o`, so the scan stops",
      "the answer is `strs[0].slice(0, i)`: everything before the failed column",
    ],
    complexity: { time: "O(n·m)", space: "O(1)" },
    code: `function longestCommonPrefix(strs) {
  const first = strs[0];
  for (let i = 0; i < first.length; i++) {
    const ch = first[i]; // the letter every word must have here
    for (let j = 1; j < strs.length; j++) {
      // a word is too short or differs: the prefix ends before i
      if (i >= strs[j].length || strs[j][i] !== ch) {
        return first.slice(0, i);
      }
    }
  }
  return first; // the whole first word is shared
}

const strs = ["flower", "flow", "flight"];
console.log(longestCommonPrefix(strs)); // expected: fl`,
  },
  {
    id: "length-of-last-word",
    number: 135,
    title: "Length of Last Word",
    group: "Strings & Parsing",
    difficulty: "Easy",
    statement:
      "A string holds words separated by spaces, possibly with extra spaces at the ends. Return the length of the last word.",
    example: 's = "fly me   to the moon  " → 4',
    approach:
      "Start at the end of the string. First skip the trailing spaces, then count letters until you hit a space or the start. There is no need to split the whole string, because only the last word matters.",
    watch: [
      "`i` starts on the last character and only ever moves left",
      "the first loop skips the two trailing spaces",
      "the second loop counts `moon`: `length` goes 1, 2, 3, 4",
      "the space before `moon` stops the count",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function lengthOfLastWord(s) {
  let i = s.length - 1; // start at the end
  // skip trailing spaces
  while (i >= 0 && s[i] === " ") i--;
  let length = 0;
  // count letters until a space or the start
  while (i >= 0 && s[i] !== " ") {
    length++;
    i--;
  }
  return length;
}

console.log(lengthOfLastWord("fly me   to the moon  ")); // expected: 4`,
  },
  {
    id: "find-the-index-of-the-first-occurrence-in-a-string",
    number: 136,
    title: "Find the Index of the First Occurrence in a String",
    group: "Strings & Parsing",
    difficulty: "Easy",
    statement:
      "Return the index where `needle` first appears inside `haystack`, or -1 if it never appears.",
    example: 'haystack = "sadbutsad", needle = "but" → 3',
    approach:
      "Try every start position `i` where the needle could still fit. From there, compare the needle letter by letter with `j`; stop at the first mismatch. If `j` reaches the needle's length, every letter matched and `i` is the answer.",
    watch: [
      "`i` is the start being tried; it only goes up to `haystack.length - needle.length`",
      "`j` walks the needle and compares `haystack[i + j]` with `needle[j]`",
      "most starts fail on the first letter, so `j` stays at 0",
      "at `i = 3`, `j` reaches 3: the whole needle matched",
    ],
    complexity: { time: "O(n·m)", space: "O(1)" },
    code: `function strStr(haystack, needle) {
  // try every start where the needle still fits
  for (let i = 0; i <= haystack.length - needle.length; i++) {
    let j = 0;
    // compare letter by letter until a mismatch
    while (j < needle.length && haystack[i + j] === needle[j]) {
      j++;
    }
    if (j === needle.length) return i; // every letter matched
  }
  return -1; // never found
}

console.log(strStr("sadbutsad", "but")); // expected: 3`,
  },
  {
    id: "reverse-words-in-a-string",
    number: 137,
    title: "Reverse Words in a String",
    group: "Strings & Parsing",
    difficulty: "Medium",
    statement:
      "Reverse the order of the words in a string. The answer must have single spaces between words and no spaces at the ends, even if the input has extra spaces.",
    example: 's = "  the sky  is blue " → "blue is sky the"',
    approach:
      "Read the string from right to left. Skip spaces, mark where a word ends, move left until the word starts, and cut that word out. Words come out last-first, which is exactly the reversed order, and extra spaces are never copied.",
    watch: [
      "`i` moves from the right end to the left",
      "`end` marks the last letter of the current word",
      "`s.slice(i + 1, end + 1)` cuts out one word once `i` reaches the space before it",
      "`words` fills as blue, is, sky, the",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function reverseWords(s) {
  const words = [];
  let i = s.length - 1; // read from the right
  while (i >= 0) {
    // skip spaces
    while (i >= 0 && s[i] === " ") i--;
    if (i < 0) break; // only spaces were left
    const end = i; // last letter of this word
    // move to the space before the word
    while (i >= 0 && s[i] !== " ") i--;
    words.push(s.slice(i + 1, end + 1)); // cut out the word
  }
  return words.join(" "); // single spaces between words
}

console.log(reverseWords("  the sky  is blue ")); // expected: blue is sky the`,
  },
  {
    id: "zigzag-conversion",
    number: 138,
    title: "Zigzag Conversion",
    group: "Strings & Parsing",
    difficulty: "Medium",
    statement:
      "Write a string in a zigzag down and up across a given number of rows, then read the rows left to right, top to bottom.",
    example: 's = "PAYPALISHIRING", numRows = 3 → "PAHNAPLSIIGYIR"',
    approach:
      "Keep one string per row and a `row` pointer that bounces between the top and bottom row. Each character is appended to the current row, then `row` moves by `step` (+1 going down, -1 going up). The step flips at the top and bottom rows. Joining the rows gives the answer.",
    watch: [
      "`row` goes 0, 1, 2, 1, 0, 1, 2 …: a bounce",
      "`step` flips sign whenever `row` is 0 or the last row",
      "`rows` grows one character per pass in whichever row is current",
      "the answer is the three rows glued together",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function convert(s, numRows) {
  if (numRows === 1) return s; // no zigzag possible
  const rows = [];
  for (let r = 0; r < numRows; r++) rows.push(""); // one string per row
  let row = 0; // the row we are writing into
  let step = 1; // +1 going down, -1 going up
  for (const ch of s) {
    rows[row] += ch;
    // bounce at the top and the bottom
    if (row === 0) step = 1;
    else if (row === numRows - 1) step = -1;
    row += step;
  }
  return rows.join(""); // read the rows top to bottom
}

console.log(convert("PAYPALISHIRING", 3)); // expected: PAHNAPLSIIGYIR`,
  },
  {
    id: "string-to-integer-atoi",
    number: 139,
    title: "String to Integer (atoi)",
    group: "Strings & Parsing",
    difficulty: "Medium",
    statement:
      "Turn a string into a 32-bit integer: skip leading spaces, read an optional + or - sign, then read digits until the first non-digit. Clamp the result to the 32-bit range.",
    example: 's = "   -42abc" → -42',
    approach:
      "Parse with one index `i` in three phases: skip spaces, read the sign, read digits. Each digit is added with `result = result * 10 + digit`, the same way you read a number left to right. Stop at the first non-digit, then apply the sign and clamp.",
    watch: [
      "`i` first skips the three spaces",
      "the `-` sets `sign` to -1 and `i` moves past it",
      "`result` grows 4, then 42; the letter `a` stops the digit loop",
      "the clamp only matters for huge numbers; here the answer is just `sign * result`",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function myAtoi(s) {
  let i = 0;
  // 1) skip leading spaces
  while (i < s.length && s[i] === " ") i++;
  // 2) optional sign
  let sign = 1;
  if (s[i] === "-" || s[i] === "+") {
    if (s[i] === "-") sign = -1;
    i++;
  }
  // 3) read digits until the first non-digit
  let result = 0;
  while (i < s.length && s[i] >= "0" && s[i] <= "9") {
    result = result * 10 + Number(s[i]);
    i++;
  }
  result = sign * result;
  // clamp to the 32-bit range
  const MAX = 2147483647;
  const MIN = -2147483648;
  if (result > MAX) return MAX;
  if (result < MIN) return MIN;
  return result;
}

console.log(myAtoi("   -42abc")); // expected: -42`,
  },
  {
    id: "multiply-strings",
    number: 140,
    title: "Multiply Strings",
    group: "Strings & Parsing",
    difficulty: "Medium",
    statement:
      "Two non-negative numbers are given as strings. Return their product as a string, without converting the whole strings to numbers.",
    example: 'num1 = "123", num2 = "45" → "5535"',
    approach:
      "Do long multiplication by hand. The product of digits `num1[i]` and `num2[j]` lands in positions `i + j` (the carry) and `i + j + 1` (the ones digit) of a result array of length m + n. Adding each product there and carrying immediately keeps every cell a single digit.",
    watch: [
      "`i` walks `num1` from the right, `j` walks `num2` from the right",
      "`pos` is an array of m + n zeros that collects the answer digits",
      "each product is added at `pos[i + j + 1]`, and its tens spill into `pos[i + j]`",
      "leading zeros are skipped when the digits are joined",
    ],
    complexity: { time: "O(m·n)", space: "O(m + n)" },
    code: `function multiply(num1, num2) {
  const m = num1.length;
  const n = num2.length;
  const pos = [];
  for (let k = 0; k < m + n; k++) pos.push(0); // room for every digit
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const product = Number(num1[i]) * Number(num2[j]);
      const sum = product + pos[i + j + 1]; // add what is already there
      pos[i + j + 1] = sum % 10; // ones digit stays
      pos[i + j] += Math.floor(sum / 10); // tens carry left
    }
  }
  // join the digits, skipping leading zeros
  let result = "";
  for (const d of pos) {
    if (result === "" && d === 0) continue;
    result += d;
  }
  return result === "" ? "0" : result;
}

console.log(multiply("123", "45")); // expected: 5535`,
  },
  {
    id: "simplify-path",
    number: 141,
    title: "Simplify Path",
    group: "Strings & Parsing",
    difficulty: "Medium",
    statement:
      "Given an absolute Unix-style path, return its simplest form. A `.` means the current folder, `..` means the parent folder, and repeated slashes count as one.",
    example: 'path = "/home//foo/../bar/./" → "/home/bar"',
    approach:
      "Split the path on `/` and treat the folders as a stack. A normal name is pushed, `..` pops the last folder (if any), and empty parts or `.` are ignored. Joining the stack with `/` after a leading slash gives the clean path.",
    watch: [
      "`parts` contains empty strings where slashes were doubled; they are skipped",
      "`stack` grows on `home` and `foo`",
      "`..` pops `foo` off the stack",
      "`.` changes nothing, so the stack ends as [home, bar]",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function simplifyPath(path) {
  const parts = path.split("/"); // the pieces between slashes
  const stack = []; // folders on the way down
  for (const part of parts) {
    if (part === "" || part === ".") continue; // nothing to do
    if (part === "..") {
      if (stack.length > 0) stack.pop(); // go up one folder
    } else {
      stack.push(part); // go into this folder
    }
  }
  return "/" + stack.join("/");
}

console.log(simplifyPath("/home//foo/../bar/./")); // expected: /home/bar`,
  },
  {
    id: "compare-version-numbers",
    number: 142,
    title: "Compare Version Numbers",
    group: "Strings & Parsing",
    difficulty: "Medium",
    statement:
      "Compare two version strings like \"1.2\" and \"1.10\" part by part, as numbers. Return -1 if the first is smaller, 1 if it is bigger, and 0 if they are equal; a missing part counts as 0.",
    example: 'version1 = "1.2", version2 = "1.10" → -1',
    approach:
      "Split both versions on the dots and compare the parts at the same position as numbers, so \"10\" beats \"2\" and \"01\" equals \"1\". The first position that differs decides the answer. If one version is shorter, its missing parts count as 0.",
    watch: [
      "`a` and `b` are the two lists of parts",
      "`i` walks both lists together up to the longer length",
      "`x` and `y` are numbers, so 2 < 10 even though \"2\" > \"10\" as text",
      "the first unequal pair returns straight away",
    ],
    complexity: { time: "O(n + m)", space: "O(n + m)" },
    code: `function compareVersion(version1, version2) {
  const a = version1.split("."); // parts of the first version
  const b = version2.split("."); // parts of the second version
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    // a missing part counts as 0
    const x = i < a.length ? Number(a[i]) : 0;
    const y = i < b.length ? Number(b[i]) : 0;
    if (x < y) return -1;
    if (x > y) return 1;
  }
  return 0; // every part was equal
}

console.log(compareVersion("1.2", "1.10")); // expected: -1`,
  },
  {
    id: "decode-string",
    number: 143,
    title: "Decode String",
    group: "Strings & Parsing",
    difficulty: "Medium",
    statement:
      "A string is encoded as `k[text]`, meaning `text` repeated k times, and these can be nested. Return the decoded string.",
    example: 's = "3[a2[c]]" → "accaccacc"',
    approach:
      "Use two stacks: one for repeat counts and one for the text built so far. On `[`, push the current count and text and start fresh. On `]`, pop them and set `curr = before + curr repeated count`. Digits build the count, letters extend `curr`.",
    watch: [
      "`num` collects the digits before a `[`",
      "on `[`, `counts` and `texts` each get one entry and `curr` resets to empty",
      "on the inner `]`, `curr` becomes `a` + `cc` = `acc`",
      "on the outer `]`, `acc` is repeated 3 times",
    ],
    complexity: { time: "O(output length)", space: "O(output length)" },
    code: `function decodeString(s) {
  const counts = []; // repeat counts waiting for their ]
  const texts = []; // text built before each [
  let curr = ""; // text inside the current brackets
  let num = 0; // the number being read
  for (const ch of s) {
    if (ch >= "0" && ch <= "9") {
      num = num * 10 + Number(ch); // build multi-digit counts
    } else if (ch === "[") {
      counts.push(num); // save the count and the text so far
      texts.push(curr);
      num = 0;
      curr = "";
    } else if (ch === "]") {
      const k = counts.pop();
      const before = texts.pop();
      curr = before + curr.repeat(k); // close the bracket
    } else {
      curr += ch; // a plain letter
    }
  }
  return curr;
}

console.log(decodeString("3[a2[c]]")); // expected: accaccacc`,
  },
];
