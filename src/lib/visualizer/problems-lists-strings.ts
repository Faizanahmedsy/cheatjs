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
    example: "listHead = [1,2,3,4] → [4,3,2,1]",
    approach:
      "Walk the list once and flip each arrow as you pass it. Keep three references: `previousNode` (the part already reversed), `currentNode` (the node being flipped) and `nextNode` (saved so the rest of the list is not lost). When `currentNode` falls off the end, `previousNode` is the new head.",
    watch: [
      "`nextNode` is saved before `currentNode.next` is overwritten, otherwise the rest of the list would be lost",
      "after each pass one more arrow points backwards, towards `previousNode`",
      "`previousNode` and `currentNode` each move one node to the right per pass",
      "the loop ends when `currentNode` is null: `previousNode` now holds the old tail, the new head",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `class ListNode {
  constructor(value, nextNode = null) {
    this.val = value; // the value in this node
    this.next = nextNode; // the following node (null at the end)
  }
}

function reverseList(listHead) {
  let previousNode = null; // the reversed part starts empty
  let currentNode = listHead; // the node we are about to flip
  while (currentNode) {
    const nextNode = currentNode.next; // remember the rest of the list
    currentNode.next = previousNode; // flip the arrow backwards
    previousNode = currentNode; // the reversed part grows by one
    currentNode = nextNode; // step forward
  }
  return previousNode; // the old tail is the new head
}

// print a list as a plain array
function toArray(listHead) {
  const result = [];
  for (let currentNode = listHead; currentNode; currentNode = currentNode.next) result.push(currentNode.val);
  return result;
}

const listHead = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4))));
console.log(toArray(reverseList(listHead))); // expected: [4, 3, 2, 1]`,
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
      "Start from a dummy node so there is always something to attach to. Compare the front nodes of the two lists, attach the smaller one to `tailNode`, and move that list forward. When one list runs out, the other is already sorted, so attach the rest in one go.",
    watch: [
      "`firstNode` and `secondNode` are the front nodes of the two lists; the smaller value wins each pass",
      "`tailNode` always sits on the last node of the merged list and moves one step per pass",
      "on equal values `firstNode` goes first (`<=`), which keeps the merge stable",
      "when one list is empty, the leftover list is attached in a single step",
    ],
    complexity: { time: "O(n + m)", space: "O(1)" },
    code: `class ListNode {
  constructor(value, nextNode = null) {
    this.val = value;
    this.next = nextNode;
  }
}

function mergeTwoLists(list1, list2) {
  const dummy = new ListNode(0); // placeholder in front of the answer
  let tailNode = dummy; // last node of the merged list
  let firstNode = list1; // front of the first list
  let secondNode = list2; // front of the second list
  while (firstNode && secondNode) {
    if (firstNode.val <= secondNode.val) {
      tailNode.next = firstNode; // take from the first list
      firstNode = firstNode.next;
    } else {
      tailNode.next = secondNode; // take from the second list
      secondNode = secondNode.next;
    }
    tailNode = tailNode.next; // the merged list grew by one
  }
  tailNode.next = firstNode ? firstNode : secondNode; // attach whatever is left
  return dummy.next; // skip the placeholder
}

function toArray(listHead) {
  const result = [];
  for (let currentNode = listHead; currentNode; currentNode = currentNode.next) result.push(currentNode.val);
  return result;
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
      "Given the head of a linked list, decide whether it has a cycle: some node whose `nextNode` points back to an earlier node, so walking the list never ends.",
    example: "listHead = [3,2,0,4], tail links back to index 1 → true",
    approach:
      "Use two runners (Floyd's tortoise and hare): `slowPointer` moves one node at a time, `fastPointer` moves two. If the list ends, `fastPointer` reaches null and there is no cycle. If there is a cycle, `fastPointer` laps around and must land on the same node as `slowPointer`.",
    watch: [
      "`slowPointer` takes one step per pass, `fastPointer` takes two",
      "the check `fastPointer && fastPointer.next` stops the loop if the list has an end",
      "inside the cycle the gap between them shrinks by one each pass",
      "`slowPointer === fastPointer` compares nodes, not values: same node means a cycle",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `class ListNode {
  constructor(value, nextNode = null) {
    this.val = value;
    this.next = nextNode;
  }
}

function hasCycle(listHead) {
  let slowPointer = listHead; // moves one step at a time
  let fastPointer = listHead; // moves two steps at a time
  while (fastPointer && fastPointer.next) {
    slowPointer = slowPointer.next;
    fastPointer = fastPointer.next.next;
    if (slowPointer === fastPointer) return true; // the runners met: there is a loop
  }
  return false; // fast reached the end: no loop
}

// build 3 -> 2 -> 0 -> 4, then link 4 back to 2
const second = new ListNode(2);
const tailNode = new ListNode(4);
second.next = new ListNode(0, tailNode);
const listHead = new ListNode(3, second);
tailNode.next = second; // this creates the cycle

console.log(hasCycle(listHead)); // expected: true`,
  },
  {
    id: "middle-of-the-linked-list",
    number: 59,
    title: "Middle of the Linked List",
    group: "Linked Lists",
    difficulty: "Easy",
    statement:
      "Return the middle node of a linked list. If there are two middle nodes (an even length), return the second one.",
    example: "listHead = [1,2,3,4,5,6] → [4,5,6]",
    approach:
      "Send two pointers from the head: `slowPointer` takes one step, `fastPointer` takes two. When `fastPointer` reaches the end, `slowPointer` has covered exactly half the distance, so it sits on the middle. No need to count the length first.",
    watch: [
      "`fastPointer` moves twice as far as `slowPointer` on every pass",
      "with 6 nodes `fastPointer` ends on null, which leaves `slowPointer` on the second middle (4)",
      "the loop condition `fastPointer && fastPointer.next` guards both odd and even lengths",
      "the printed array is the list from the middle node onwards",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `class ListNode {
  constructor(value, nextNode = null) {
    this.val = value;
    this.next = nextNode;
  }
}

function middleNode(listHead) {
  let slowPointer = listHead; // one step per pass
  let fastPointer = listHead; // two steps per pass
  while (fastPointer && fastPointer.next) {
    slowPointer = slowPointer.next;
    fastPointer = fastPointer.next.next;
  }
  return slowPointer; // fast hit the end, so slow is halfway
}

// build a list from an array, back to front
function fromArray(values) {
  let listHead = null;
  for (let valueIndex = values.length - 1; valueIndex >= 0; valueIndex--) listHead = new ListNode(values[valueIndex], listHead);
  return listHead;
}

function toArray(listHead) {
  const result = [];
  for (let currentNode = listHead; currentNode; currentNode = currentNode.next) result.push(currentNode.val);
  return result;
}

const listHead = fromArray([1, 2, 3, 4, 5, 6]);
console.log(toArray(middleNode(listHead))); // expected: [4, 5, 6]`,
  },
  {
    id: "remove-nth-node-from-end-of-list",
    number: 60,
    title: "Remove Nth Node From End of List",
    group: "Linked Lists",
    difficulty: "Medium",
    statement:
      "Remove the n-th node counting from the end of a linked list and return the head. Try to do it in a single pass.",
    example: "listHead = [1,2,3,4,5], positionFromEnd = 2 → [1,2,3,5]",
    approach:
      "Give `fastPointer` a head start of n + 1 nodes from a dummy node in front of the list. Then move `slowPointer` and `fastPointer` together; when `fastPointer` falls off the end, `slowPointer` sits just before the node to remove. Skip that node with `slowPointer.next = slowPointer.next.next`.",
    watch: [
      "the first loop moves only `fastPointer`, opening a gap of n + 1 nodes",
      "the second loop moves both pointers, keeping the gap fixed",
      "when `fastPointer` is null, `slowPointer` is right before the node to delete (3, before 4)",
      "the dummy node handles removing the head itself without a special case",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `class ListNode {
  constructor(value, nextNode = null) {
    this.val = value;
    this.next = nextNode;
  }
}

function removeNthFromEnd(listHead, positionFromEnd) {
  const dummy = new ListNode(0, listHead); // sits in front of the head
  let fastPointer = dummy;
  let slowPointer = dummy;
  // give fast a head start of positionFromEnd + 1 nodes
  for (let stepCount = 0; stepCount <= positionFromEnd; stepCount++) fastPointer = fastPointer.next;
  // move both until fast falls off the end
  while (fastPointer) {
    fastPointer = fastPointer.next;
    slowPointer = slowPointer.next;
  }
  slowPointer.next = slowPointer.next.next; // skip the n-th node from the end
  return dummy.next;
}

function fromArray(values) {
  let listHead = null;
  for (let stepCount = values.length - 1; stepCount >= 0; stepCount--) listHead = new ListNode(values[stepCount], listHead);
  return listHead;
}

function toArray(listHead) {
  const result = [];
  for (let currentNode = listHead; currentNode; currentNode = currentNode.next) result.push(currentNode.val);
  return result;
}

const listHead = fromArray([1, 2, 3, 4, 5]);
console.log(toArray(removeNthFromEnd(listHead, 2))); // expected: [1, 2, 3, 5]`,
  },
  {
    id: "palindrome-linked-list",
    number: 61,
    title: "Palindrome Linked List",
    group: "Linked Lists",
    difficulty: "Easy",
    statement:
      "Given the head of a singly linked list, decide whether its values read the same forwards and backwards.",
    example: "listHead = [1,2,2,1] → true",
    approach:
      "Find the middle with a slow and a fast pointer, then reverse the second half in place. Now walk one pointer from the head and one from the start of the reversed half, comparing values. Any mismatch means it is not a palindrome; this uses no extra array.",
    watch: [
      "first `slowPointer`/`fastPointer` find the middle: `slowPointer` stops at the second 2",
      "then `previousNode`/`currentNode` reverse the second half, so it reads 1 → 2",
      "`frontNode` (from the head) and `backNode` (from the reversed half) step together comparing values",
      "the compare loop only runs while `backNode` exists: the second half is the shorter one",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `class ListNode {
  constructor(value, nextNode = null) {
    this.val = value;
    this.next = nextNode;
  }
}

function isPalindrome(listHead) {
  // 1) find the middle
  let slowPointer = listHead;
  let fastPointer = listHead;
  while (fastPointer && fastPointer.next) {
    slowPointer = slowPointer.next;
    fastPointer = fastPointer.next.next;
  }
  // 2) reverse the second half
  let previousNode = null;
  let currentNode = slowPointer;
  while (currentNode) {
    const nextNode = currentNode.next;
    currentNode.next = previousNode;
    previousNode = currentNode;
    currentNode = nextNode;
  }
  // 3) compare the first half with the reversed second half
  let frontNode = listHead;
  let backNode = previousNode;
  while (backNode) {
    if (frontNode.val !== backNode.val) return false; // mismatch
    frontNode = frontNode.next;
    backNode = backNode.next;
  }
  return true;
}

const listHead = new ListNode(1, new ListNode(2, new ListNode(2, new ListNode(1))));
console.log(isPalindrome(listHead)); // expected: true`,
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
      "Walk `walkerFromA` along list A and `walkerFromB` along list B. When a pointer reaches the end, restart it at the head of the other list. Both then travel the same total distance (A + B), so they arrive at the shared node on the same step, or both reach null together if there is none.",
    watch: [
      "`walkerFromA` starts on list A and `walkerFromB` on list B",
      "when one hits null it jumps to the other list's head, which cancels out the length difference",
      "`walkerFromA === walkerFromB` compares nodes, not values: the first 1 in each list is a different node",
      "they meet on the node holding 8 after the switch",
    ],
    complexity: { time: "O(n + m)", space: "O(1)" },
    code: `class ListNode {
  constructor(value, nextNode = null) {
    this.val = value;
    this.next = nextNode;
  }
}

function getIntersectionNode(headA, headB) {
  let walkerFromA = headA; // walks A, then B
  let walkerFromB = headB; // walks B, then A
  while (walkerFromA !== walkerFromB) {
    walkerFromA = walkerFromA ? walkerFromA.next : headB; // at the end, switch to the other list
    walkerFromB = walkerFromB ? walkerFromB.next : headA;
  }
  return walkerFromA; // the shared node, or null if none
}

// the shared tail 8 -> 4 -> 5
const shared = new ListNode(8, new ListNode(4, new ListNode(5)));
const headA = new ListNode(4, new ListNode(1, shared));
const headB = new ListNode(5, new ListNode(6, new ListNode(1, shared)));

const currentNode = getIntersectionNode(headA, headB);
console.log(currentNode ? currentNode.val : null); // expected: 8`,
  },
  {
    id: "remove-duplicates-from-sorted-list",
    number: 63,
    title: "Remove Duplicates from Sorted List",
    group: "Linked Lists",
    difficulty: "Easy",
    statement:
      "A linked list is sorted, so equal values sit next to each other. Remove the extra copies so each value appears once, and return the head.",
    example: "listHead = [1,1,2,3,3] → [1,2,3]",
    approach:
      "Walk the list with `currentNode`. If the next node has the same value, unlink it by pointing `currentNode.next` past it and stay put (there may be more copies). Otherwise move on. Because the list is sorted, every duplicate is right next to its original.",
    watch: [
      "`currentNode.val === currentNode.next.val` means the next node is a copy",
      "on a copy, `currentNode` does not move; only its `nextNode` arrow skips ahead",
      "on a new value, `currentNode` steps forward",
      "the loop stops when `currentNode` is the last node",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `class ListNode {
  constructor(value, nextNode = null) {
    this.val = value;
    this.next = nextNode;
  }
}

function deleteDuplicates(listHead) {
  let currentNode = listHead;
  while (currentNode && currentNode.next) {
    if (currentNode.val === currentNode.next.val) {
      currentNode.next = currentNode.next.next; // unlink the copy, stay here
    } else {
      currentNode = currentNode.next; // a new value: move on
    }
  }
  return listHead;
}

function fromArray(values) {
  let listHead = null;
  for (let valueIndex = values.length - 1; valueIndex >= 0; valueIndex--) listHead = new ListNode(values[valueIndex], listHead);
  return listHead;
}

function toArray(listHead) {
  const result = [];
  for (let currentNode = listHead; currentNode; currentNode = currentNode.next) result.push(currentNode.val);
  return result;
}

const listHead = fromArray([1, 1, 2, 3, 3]);
console.log(toArray(deleteDuplicates(listHead))); // expected: [1, 2, 3]`,
  },
  {
    id: "add-two-numbers",
    number: 64,
    title: "Add Two Numbers",
    group: "Linked Lists",
    difficulty: "Medium",
    statement:
      "Two numbers are stored as linked lists with their digits in reverse order (ones digit first). Add them and return the sum as a list in the same reverse order.",
    example: "firstNumber = [2,4,3], secondNumber = [5,6,4] → [7,0,8]",
    approach:
      "This is school addition, and the reverse order helps: the ones digits come first. Add the two digits plus the `carry`, keep `columnSum % 10` as the new node and carry `Math.floor(columnSum / 10)` to the next column. Keep going while either list has digits or a carry is left.",
    watch: [
      "`firstNode` and `secondNode` walk the two lists one digit at a time; a missing digit counts as 0",
      "`columnSum` includes the `carry` from the previous column",
      "4 + 6 = 10 writes 0 and sets `carry` to 1, which turns 3 + 4 into 8",
      "`tailNode` grows the answer list one node per column",
    ],
    complexity: { time: "O(max(n, m))", space: "O(max(n, m))" },
    code: `class ListNode {
  constructor(value, nextNode = null) {
    this.val = value;
    this.next = nextNode;
  }
}

function addTwoNumbers(firstNumber, secondNumber) {
  const dummy = new ListNode(0); // placeholder in front of the answer
  let tailNode = dummy;
  let firstNode = firstNumber;
  let secondNode = secondNumber;
  let carry = 0;
  while (firstNode || secondNode || carry) {
    const columnSum = (firstNode ? firstNode.val : 0) + (secondNode ? secondNode.val : 0) + carry;
    carry = Math.floor(columnSum / 10); // the tens part moves to the next column
    tailNode.next = new ListNode(columnSum % 10); // the ones part stays here
    tailNode = tailNode.next;
    if (firstNode) firstNode = firstNode.next;
    if (secondNode) secondNode = secondNode.next;
  }
  return dummy.next;
}

function toArray(listHead) {
  const result = [];
  for (let currentNode = listHead; currentNode; currentNode = currentNode.next) result.push(currentNode.val);
  return result;
}

const firstNumber = new ListNode(2, new ListNode(4, new ListNode(3))); // 342
const secondNumber = new ListNode(5, new ListNode(6, new ListNode(4))); // 465
console.log(toArray(addTwoNumbers(firstNumber, secondNumber))); // expected: [7, 0, 8]`,
  },
  {
    id: "reorder-list",
    number: 65,
    title: "Reorder List",
    group: "Linked Lists",
    difficulty: "Medium",
    statement:
      "Reorder a linked list L0 → L1 → … → Ln into L0 → Ln → L1 → Ln-1 → … by relinking nodes, not by changing values.",
    example: "listHead = [1,2,3,4,5] → [1,5,2,4,3]",
    approach:
      "Three steps you already know: find the middle with slow/fast pointers, cut the list there and reverse the second half, then weave the two halves together by taking one node from each in turn.",
    watch: [
      "`slowPointer` stops on 3; `slowPointer.next = null` cuts the first half off at 3",
      "`previousNode` ends up as the head of the reversed second half: 5 → 4",
      "in the weave, `frontNode` walks the first half and `backNode` the reversed half",
      "each pass links `frontNode` to `backNode`, then `backNode` to `frontNode`'s old next",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `class ListNode {
  constructor(value, nextNode = null) {
    this.val = value;
    this.next = nextNode;
  }
}

function reorderList(listHead) {
  // 1) find the middle
  let slowPointer = listHead;
  let fastPointer = listHead;
  while (fastPointer && fastPointer.next) {
    slowPointer = slowPointer.next;
    fastPointer = fastPointer.next.next;
  }
  // 2) reverse the second half and cut the list in two
  let previousNode = null;
  let currentNode = slowPointer.next;
  slowPointer.next = null; // the first half ends at the middle
  while (currentNode) {
    const nextNode = currentNode.next;
    currentNode.next = previousNode;
    previousNode = currentNode;
    currentNode = nextNode;
  }
  // 3) weave: one node from each half in turn
  let frontNode = listHead;
  let backNode = previousNode;
  while (backNode) {
    const frontNextNode = frontNode.next;
    const backNextNode = backNode.next;
    frontNode.next = backNode; // first-half node, then a second-half node
    backNode.next = frontNextNode;
    frontNode = frontNextNode;
    backNode = backNextNode;
  }
}

function fromArray(values) {
  let listHead = null;
  for (let valueIndex = values.length - 1; valueIndex >= 0; valueIndex--) listHead = new ListNode(values[valueIndex], listHead);
  return listHead;
}

function toArray(listHead) {
  const result = [];
  for (let currentNode = listHead; currentNode; currentNode = currentNode.next) result.push(currentNode.val);
  return result;
}

const listHead = fromArray([1, 2, 3, 4, 5]);
reorderList(listHead);
console.log(toArray(listHead)); // expected: [1, 5, 2, 4, 3]`,
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
      "Scan column by column: take the character at position `characterIndex` in the first word and check that every other word has the same character there. The first column where a word is too short or differs ends the prefix, so return everything before it.",
    watch: [
      "`characterIndex` is the column; `character` is the first word's letter in that column",
      "`wordIndex` checks every other word at the same column",
      "at `characterIndex = 2`, \"flight\" has `characterIndex` instead of `o`, so the scan stops",
      "the answer is `strs[0].slice(0, characterIndex)`: everything before the failed column",
    ],
    complexity: { time: "O(n·m)", space: "O(1)" },
    code: `function longestCommonPrefix(strs) {
  const first = strs[0];
  for (let characterIndex = 0; characterIndex < first.length; characterIndex++) {
    const character = first[characterIndex]; // the letter every word must have here
    for (let wordIndex = 1; wordIndex < strs.length; wordIndex++) {
      // a word is too short or differs: the prefix ends before i
      if (characterIndex >= strs[wordIndex].length || strs[wordIndex][characterIndex] !== character) {
        return first.slice(0, characterIndex);
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
    example: 'text = "fly me   to the moon  " → 4',
    approach:
      "Start at the end of the string. First skip the trailing spaces, then count letters until you hit a space or the start. There is no need to split the whole string, because only the last word matters.",
    watch: [
      "`charIndex` starts on the last character and only ever moves left",
      "the first loop skips the two trailing spaces",
      "the second loop counts `moon`: `length` goes 1, 2, 3, 4",
      "the space before `moon` stops the count",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function lengthOfLastWord(text) {
  let charIndex = text.length - 1; // start at the end
  // skip trailing spaces
  while (charIndex >= 0 && text[charIndex] === " ") charIndex--;
  let length = 0;
  // count letters until a space or the start
  while (charIndex >= 0 && text[charIndex] !== " ") {
    length++;
    charIndex--;
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
      "Try every start position `startPosition` where the needle could still fit. From there, compare the needle letter by letter with `matchedLength`; stop at the first mismatch. If `matchedLength` reaches the needle's length, every letter matched and `startPosition` is the answer.",
    watch: [
      "`startPosition` is the start being tried; it only goes up to `haystack.length - needle.length`",
      "`matchedLength` walks the needle and compares `haystack[startPosition + matchedLength]` with `needle[matchedLength]`",
      "most starts fail on the first letter, so `matchedLength` stays at 0",
      "at `startPosition = 3`, `matchedLength` reaches 3: the whole needle matched",
    ],
    complexity: { time: "O(n·m)", space: "O(1)" },
    code: `function strStr(haystack, needle) {
  // try every start where the needle still fits
  for (let startPosition = 0; startPosition <= haystack.length - needle.length; startPosition++) {
    let matchedLength = 0;
    // compare letter by letter until a mismatch
    while (matchedLength < needle.length && haystack[startPosition + matchedLength] === needle[matchedLength]) {
      matchedLength++;
    }
    if (matchedLength === needle.length) return startPosition; // every letter matched
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
    example: 'text = "  the sky  is blue " → "blue is sky the"',
    approach:
      "Read the string from right to left. Skip spaces, mark where a word ends, move left until the word starts, and cut that word out. Words come out last-first, which is exactly the reversed order, and extra spaces are never copied.",
    watch: [
      "`charIndex` moves from the right end to the left",
      "`end` marks the last letter of the current word",
      "`text.slice(charIndex + 1, end + 1)` cuts out one word once `charIndex` reaches the space before it",
      "`words` fills as blue, is, sky, the",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function reverseWords(text) {
  const words = [];
  let charIndex = text.length - 1; // read from the right
  while (charIndex >= 0) {
    // skip spaces
    while (charIndex >= 0 && text[charIndex] === " ") charIndex--;
    if (charIndex < 0) break; // only spaces were left
    const end = charIndex; // last letter of this word
    // move to the space before the word
    while (charIndex >= 0 && text[charIndex] !== " ") charIndex--;
    words.push(text.slice(charIndex + 1, end + 1)); // cut out the word
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
    example: 'text = "PAYPALISHIRING", numRows = 3 → "PAHNAPLSIIGYIR"',
    approach:
      "Keep one string per row and a `currentRowIndex` pointer that bounces between the top and bottom row. Each character is appended to the current row, then `currentRowIndex` moves by `step` (+1 going down, -1 going up). The step flips at the top and bottom rows. Joining the rows gives the answer.",
    watch: [
      "`currentRowIndex` goes 0, 1, 2, 1, 0, 1, 2 …: a bounce",
      "`step` flips sign whenever `currentRowIndex` is 0 or the last row",
      "`rowStrings` grows one character per pass in whichever row is current",
      "the answer is the three rows glued together",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function convert(text, numRows) {
  if (numRows === 1) return text; // no zigzag possible
  const rowStrings = [];
  for (let rowNumber = 0; rowNumber < numRows; rowNumber++) rowStrings.push(""); // one string per row
  let currentRowIndex = 0; // the row we are writing into
  let step = 1; // +1 going down, -1 going up
  for (const character of text) {
    rowStrings[currentRowIndex] += character;
    // bounce at the top and the bottom
    if (currentRowIndex === 0) step = 1;
    else if (currentRowIndex === numRows - 1) step = -1;
    currentRowIndex += step;
  }
  return rowStrings.join(""); // read the rows top to bottom
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
    example: 'text = "   -42abc" → -42',
    approach:
      "Parse with one index `charIndex` in three phases: skip spaces, read the sign, read digits. Each digit is added with `result = result * 10 + digit`, the same way you read a number left to right. Stop at the first non-digit, then apply the sign and clamp.",
    watch: [
      "`charIndex` first skips the three spaces",
      "the `-` sets `sign` to -1 and `charIndex` moves past it",
      "`result` grows 4, then 42; the letter `a` stops the digit loop",
      "the clamp only matters for huge numbers; here the answer is just `sign * result`",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    code: `function myAtoi(text) {
  let charIndex = 0;
  // 1) skip leading spaces
  while (charIndex < text.length && text[charIndex] === " ") charIndex++;
  // 2) optional sign
  let sign = 1;
  if (text[charIndex] === "-" || text[charIndex] === "+") {
    if (text[charIndex] === "-") sign = -1;
    charIndex++;
  }
  // 3) read digits until the first non-digit
  let result = 0;
  while (charIndex < text.length && text[charIndex] >= "0" && text[charIndex] <= "9") {
    result = result * 10 + Number(text[charIndex]);
    charIndex++;
  }
  result = sign * result;
  // clamp to the 32-bit range
  const INT_MAX = 2147483647;
  const INT_MIN = -2147483648;
  if (result > INT_MAX) return INT_MAX;
  if (result < INT_MIN) return INT_MIN;
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
      "Do long multiplication by hand. The product of digits `num1[firstDigitIndex]` and `num2[secondDigitIndex]` lands in positions `firstDigitIndex + secondDigitIndex` (the carry) and `firstDigitIndex + secondDigitIndex + 1` (the ones digit) of a result array of length m + n. Adding each product there and carrying immediately keeps every cell a single digit.",
    watch: [
      "`firstDigitIndex` walks `num1` from the right, `secondDigitIndex` walks `num2` from the right",
      "`digitSlots` is an array of m + n zeros that collects the answer digits",
      "each product is added at `digitSlots[firstDigitIndex + secondDigitIndex + 1]`, and its tens spill into `digitSlots[firstDigitIndex + secondDigitIndex]`",
      "leading zeros are skipped when the digits are joined",
    ],
    complexity: { time: "O(m·n)", space: "O(m + n)" },
    code: `function multiply(num1, num2) {
  const firstLength = num1.length;
  const secondLength = num2.length;
  const digitSlots = [];
  for (let slotIndex = 0; slotIndex < firstLength + secondLength; slotIndex++) digitSlots.push(0); // room for every digit
  for (let firstDigitIndex = firstLength - 1; firstDigitIndex >= 0; firstDigitIndex--) {
    for (let secondDigitIndex = secondLength - 1; secondDigitIndex >= 0; secondDigitIndex--) {
      const product = Number(num1[firstDigitIndex]) * Number(num2[secondDigitIndex]);
      const columnSum = product + digitSlots[firstDigitIndex + secondDigitIndex + 1]; // add what is already there
      digitSlots[firstDigitIndex + secondDigitIndex + 1] = columnSum % 10; // ones digit stays
      digitSlots[firstDigitIndex + secondDigitIndex] += Math.floor(columnSum / 10); // tens carry left
    }
  }
  // join the digits, skipping leading zeros
  let result = "";
  for (const digitSlot of digitSlots) {
    if (result === "" && digitSlot === 0) continue;
    result += digitSlot;
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
    example: 'inputPath = "/home//foo/../bar/./" → "/home/bar"',
    approach:
      "Split the path on `/` and treat the folders as a stack. A normal name is pushed, `..` pops the last folder (if any), and empty parts or `.` are ignored. Joining the stack with `/` after a leading slash gives the clean path.",
    watch: [
      "`parts` contains empty strings where slashes were doubled; they are skipped",
      "`stack` grows on `home` and `foo`",
      "`..` pops `foo` off the stack",
      "`.` changes nothing, so the stack ends as [home, bar]",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    code: `function simplifyPath(inputPath) {
  const parts = inputPath.split("/"); // the pieces between slashes
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
      "`firstParts` and `secondParts` are the two lists of parts",
      "`partIndex` walks both lists together up to the longer length",
      "`firstPart` and `secondPart` are numbers, so 2 < 10 even though \"2\" > \"10\" as text",
      "the first unequal pair returns straight away",
    ],
    complexity: { time: "O(n + m)", space: "O(n + m)" },
    code: `function compareVersion(version1, version2) {
  const firstParts = version1.split("."); // parts of the first version
  const secondParts = version2.split("."); // parts of the second version
  const partCount = Math.max(firstParts.length, secondParts.length);
  for (let partIndex = 0; partIndex < partCount; partIndex++) {
    // a missing part counts as 0
    const firstPart = partIndex < firstParts.length ? Number(firstParts[partIndex]) : 0;
    const secondPart = partIndex < secondParts.length ? Number(secondParts[partIndex]) : 0;
    if (firstPart < secondPart) return -1;
    if (firstPart > secondPart) return 1;
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
      "A string is encoded as `repeatCount[text]`, meaning `text` repeated k times, and these can be nested. Return the decoded string.",
    example: 'text = "3[a2[c]]" → "accaccacc"',
    approach:
      "Use two stacks: one for repeat counts and one for the text built so far. On `[`, push the current count and text and start fresh. On `]`, pop them and set `currentText = before + currentText repeated count`. Digits build the count, letters extend `currentText`.",
    watch: [
      "`currentNumber` collects the digits before a `[`",
      "on `[`, `counts` and `texts` each get one entry and `currentText` resets to empty",
      "on the inner `]`, `currentText` becomes `a` + `cc` = `acc`",
      "on the outer `]`, `acc` is repeated 3 times",
    ],
    complexity: { time: "O(output length)", space: "O(output length)" },
    code: `function decodeString(text) {
  const counts = []; // repeat counts waiting for their ]
  const texts = []; // text built before each [
  let currentText = ""; // text inside the current brackets
  let currentNumber = 0; // the number being read
  for (const character of text) {
    if (character >= "0" && character <= "9") {
      currentNumber = currentNumber * 10 + Number(character); // build multi-digit counts
    } else if (character === "[") {
      counts.push(currentNumber); // save the count and the text so far
      texts.push(currentText);
      currentNumber = 0;
      currentText = "";
    } else if (character === "]") {
      const repeatCount = counts.pop();
      const before = texts.pop();
      currentText = before + currentText.repeat(repeatCount); // close the bracket
    } else {
      currentText += character; // a plain letter
    }
  }
  return currentText;
}

console.log(decodeString("3[a2[c]]")); // expected: accaccacc`,
  },
];
