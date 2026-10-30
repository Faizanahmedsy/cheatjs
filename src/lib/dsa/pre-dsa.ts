import {
  GraduationCap,
  Variable,
  Split,
  Repeat,
  RefreshCw,
  Repeat1,
  ArrowLeftRight,
  Footprints,
  Ruler,
  CircleStop,
  Layers,
  Grid3x3,
  Sigma,
  ArrowUpDown,
  ClipboardList,
  List,
  Type,
  MoveHorizontal,
  Columns3,
  Wrench,
  Gauge,
} from "lucide-react";
import type { DSATopic } from "@/lib/dsa";

// Pre-DSA: 20 topics that teach loops and logic before real DSA problems.
// Every code block is a self-contained runnable program (no imports, no
// template strings, small inputs) so it can be pasted into the JS Visualizer.
// Dry-run tables live in code comments because `explanation` renders as
// plain text.

// Titles of the 20 topics, in the order they should be studied. Used by the
// overview page and the mastery checklist.
export const PRE_DSA_SYLLABUS: { id: string; title: string }[] = [
  { id: "pre-dsa-01-variables", title: "Variables, data types, operators & expressions" },
  { id: "pre-dsa-02-conditions", title: "If-else, nested conditions, logical operators & ternary" },
  { id: "pre-dsa-03-for-loops", title: "For loops — initialization, condition, increment & decrement" },
  { id: "pre-dsa-04-while-loops", title: "While loops — when to use, condition-based iteration & termination" },
  { id: "pre-dsa-05-do-while", title: "Do-while loops — execution and use cases" },
  { id: "pre-dsa-06-loop-directions", title: "Loop directions — forward, backward & reverse iteration" },
  { id: "pre-dsa-07-loop-movements", title: "Loop movements — jumping, skipping indices & custom increments" },
  { id: "pre-dsa-08-loop-conditions", title: "Loop conditions — boundaries, dynamic conditions & off-by-one errors" },
  { id: "pre-dsa-09-break-continue", title: "Break, continue, early exits & infinite-loop prevention" },
  { id: "pre-dsa-10-nested-loops", title: "Nested loops — for/while combinations and multiple levels" },
  { id: "pre-dsa-11-nested-variations", title: "Nested loop variations — j=i, j=i+1, j<i, j<n-i & pair comparisons" },
  { id: "pre-dsa-12-accumulators", title: "Accumulator patterns — sum, product, count, min, max & frequency" },
  { id: "pre-dsa-13-variable-manipulation", title: "Variable manipulation — swapping, tracking, previous/current & multiple variables" },
  { id: "pre-dsa-14-dry-running", title: "Dry running — iteration tables, tracing, debugging & output prediction" },
  { id: "pre-dsa-15-array-traversal", title: "Array traversal — searching, filtering, modifying & in-place operations" },
  { id: "pre-dsa-16-string-traversal", title: "String traversal — character iteration, frequency & string manipulation" },
  { id: "pre-dsa-17-two-pointers", title: "Two pointers — opposite direction, same direction & slow/fast pointers" },
  { id: "pre-dsa-18-sliding-window", title: "Sliding window — fixed size, variable size, expand & shrink" },
  { id: "pre-dsa-19-other-patterns", title: "Other DSA patterns — prefix/suffix sum, read/write pointers, HashMap, HashSet & Floyd's cycle detection" },
  { id: "pre-dsa-20-problem-solving", title: "Problem-solving & complexity — translating problems into loops, brute force, optimization & Big-O" },
];

export const PRE_DSA_RECOMMENDATION =
  "Complete the topics in order. For every topic, practise 5 small exercises before moving on. After all 20 you are ready for Easy–Medium LeetCode array and string problems.";

const overviewTopic: DSATopic = {
  id: "pre-dsa-overview",
  label: "Start here: Pre-DSA",
  icon: GraduationCap,
  href: "/dsa?topic=pre-dsa-overview",
  content: {
    title: "Start here: Pre-DSA",
    description:
      "20 small topics that teach you to think in loops and logic. Finish these and array and string problems stop feeling scary.",
    steps: [
      {
        title: "Why Pre-DSA?",
        explanation:
          "DSA (Data Structures and Algorithms) problems look hard, but almost every one of them is built from the same few bricks: a variable that remembers something, an if that makes a choice, and a loop that repeats work. If those bricks feel shaky, every problem feels impossible. This section builds the bricks one at a time, in a fixed order, with very small examples you can run and trace by hand. Each topic page has the same shape: the idea in plain words, the smallest template, an example with a dry-run table, common mistakes, 5 practice exercises and a quick check.",
        code: `// Almost every DSA solution is made of three bricks:

// 1. A variable that remembers something
let biggest = -Infinity;

// 2. A loop that repeats work
const marks = [42, 87, 65];
for (let i = 0; i < marks.length; i++) {
  // 3. An if that makes a choice
  if (marks[i] > biggest) {
    biggest = marks[i];
  }
}

console.log(biggest); // 87`,
        language: "javascript",
      },
      {
        title: "How to study one topic",
        explanation:
          "Read the idea first and say it back in your own words. Type the template yourself instead of copying it. Then cover the dry-run table, trace the example on paper, and compare. Read the common mistakes so you recognise them later. Finally, solve the 5 practice exercises without looking at the answers, run them in the JS Visualizer to watch every step, and do the quick check. Tick the topic in the checklist above only when all 5 exercises feel easy.",
        code: `// Your routine for every topic (about 45-60 minutes)
const routine = [
  "1. Read 'The idea in plain words'",
  "2. Type the template yourself",
  "3. Trace the example on paper, then check the table",
  "4. Read the common mistakes",
  "5. Solve the 5 practice exercises",
  "6. Answer the quick check without running it",
];

for (let i = 0; i < routine.length; i++) {
  console.log(routine[i]);
}`,
        language: "javascript",
      },
      {
        title: "Recommendation",
        explanation: PRE_DSA_RECOMMENDATION,
        code: `// The path, in order
// 01-05  Basics: variables, if-else, for, while, do-while
// 06-09  Loop control: direction, movement, conditions, break/continue
// 10-11  Nested loops and their shapes
// 12-14  Accumulators, variable tracking, dry running
// 15-16  Arrays and strings
// 17-19  First real patterns: two pointers, sliding window, and friends
// 20     Turning a problem into loops, and Big-O

const topicsDone = 20;
const exercisesPerTopic = 5;
console.log(topicsDone * exercisesPerTopic); // 100
// 100 small exercises later -> Easy-Medium LeetCode array and string problems`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 01 · Variables & operators
// ---------------------------------------------------------------------------
const t01: DSATopic = {
  id: "pre-dsa-01-variables",
  label: "01 · Variables & operators",
  icon: Variable,
  href: "/dsa?topic=pre-dsa-01-variables",
  content: {
    title: "01 · Variables, data types, operators & expressions",
    description:
      "Variables are labelled boxes. Operators are the tools that combine what is inside them. Everything else in programming is built on this.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "A variable is a box with a name label on it. You put a value inside the box and later ask for it by name. 'let' makes a box you can open and refill; 'const' makes a sealed box that keeps its first value forever. The kind of thing inside the box is its data type: a number (5, 3.14), a string, which means text in quotes (\"Riya\"), a boolean, which means only true or false, plus null (empty on purpose) and undefined (nothing put in yet). An operator is a tool like + or > that works on values, and an expression is any piece of code that produces a value, like apples + 2.",
        code: `// A variable is a labelled box that holds a value
let apples = 5;        // box "apples" holds the number 5
const name = "Riya";   // const = sealed box, its value never changes
let isHungry = true;   // boolean: only true or false

// Take 5 out, add 2, put 7 back into the same box
apples = apples + 2;

console.log(name, "has", apples, "apples"); // Riya has 7 apples
console.log(typeof apples, typeof name, typeof isHungry); // number string boolean`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "These are all the operators you need for loops and DSA. % (remainder) is the star: n % 2 tells you even or odd, and n % 10 gives the last digit of a number. Always compare with === (strict equal), never ==.",
        code: `let count = 0;            // number, can change later (let)
const greeting = "hi";    // string: text inside quotes
const done = false;       // boolean: true or false
let nothing = null;       // empty on purpose
let notSet;               // undefined: no value given yet

// Arithmetic: each line is an expression that makes a new value
console.log(7 + 2);             // 9    add
console.log(7 - 2);             // 5    subtract
console.log(7 * 2);             // 14   multiply
console.log(7 / 2);             // 3.5  divide (keeps the decimal)
console.log(7 % 2);             // 1    remainder: what is left over
console.log(2 ** 3);            // 8    power: 2 * 2 * 2
console.log(Math.floor(7 / 2)); // 3    whole-number division

// Comparison: the answer is always true or false
console.log(5 === 5);  // true   same value and same type
console.log(5 !== 3);  // true   not equal
console.log(5 >= 6);   // false

// Short ways to update a box
count += 3;  // same as count = count + 3, so count is 3
count++;     // same as count = count + 1, so count is 4

console.log(count, greeting, done, nothing, notSet); // 4 hi false null undefined`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "A shop bill worked out one line at a time. A dry run means you act like the computer: go line by line and write down what is inside every box after each line. There is no loop yet, so each row is one line of code instead of one iteration.",
        code: `const price = 40;
const qty = 3;
const discount = 10;

let total = price * qty;    // line A
total = total - discount;   // line B
const tax = total % 7;      // line C
const isBig = total > 100;  // line D

console.log(total, tax, isBig); // 110 5 true

// Operator order: * / % happen before + -, brackets go first
console.log(2 + 3 * 4);   // 14
console.log((2 + 3) * 4); // 20

// Dry run:
// line | what runs            | total | tax | isBig
// A    | total = 40 * 3       | 120   |  -  |  -
// B    | total = 120 - 10     | 110   |  -  |  -
// C    | tax = 110 % 7        | 110   | 5   |  -      (7 * 15 = 105, 110 - 105 = 5)
// D    | isBig = 110 > 100    | 110   | 5   | true
// output: 110 5 true`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "Five traps that cause most beginner bugs. Each one shows the wrong version (commented out or printed) next to the right version.",
        code: `// 1. One = puts a value in; three === compares
let x = 3;
// WRONG: if (x = 5) { ... }  -> this sets x to 5 and is always true
// RIGHT:
console.log(x === 5); // false

// 2. == converts types before comparing, === does not
console.log("5" == 5);  // true   (surprising!)
console.log("5" === 5); // false  (what you want)

// 3. + with a string glues text together instead of adding
console.log("5" + 2);         // 52
console.log(Number("5") + 2); // 7

// 4. A const box cannot be refilled
// WRONG: const total = 1; total = 2;  -> TypeError
let total = 1;
total = 2;
console.log(total); // 2

// 5. / keeps decimals; use Math.floor for whole-number division
console.log(7 / 2);             // 3.5
console.log(Math.floor(7 / 2)); // 3`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Try writing each function yourself first, then compare with the solution and check the expected output in the comment. They get a little harder as you go. Exercise 4 is the trick behind every 'digits of a number' problem.",
        code: `// 1. Area of a rectangle with width w and height h
function area(w, h) {
  return w * h;
}
console.log(area(4, 5)); // 20

// 2. Is n even? (hint: remainder after dividing by 2)
function isEven(n) {
  return n % 2 === 0;
}
console.log(isEven(7)); // false

// 3. Turn minutes into "Xh Ym"
function toHours(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h + "h " + m + "m";
}
console.log(toHours(135)); // 2h 15m

// 4. Split a number into [last digit, the rest]
function splitLast(n) {
  const last = n % 10;
  const rest = Math.floor(n / 10);
  return [last, rest];
}
console.log(splitLast(4827)); // [7, 482]

// 5. Average of three numbers, rounded to 2 decimals
function avg3(a, b, c) {
  const avg = (a + b + c) / 3;
  return Math.round(avg * 100) / 100;
}
console.log(avg3(4, 5, 7)); // 5.33`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation:
          "Predict each output before you run it. Answers are at the bottom.",
        code: `console.log(10 % 3);      // Q1
console.log("3" + 4 + 5); // Q2
console.log(3 + 4 + "5"); // Q3

// Answers:
// Q1 -> 1    (10 = 3 * 3 + 1)
// Q2 -> 345  (starts with a string, so everything is glued as text)
// Q3 -> 75   (3 + 4 = 7 first, then 7 + "5" glues to "75")`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 02 · If-else & logic
// ---------------------------------------------------------------------------
const t02: DSATopic = {
  id: "pre-dsa-02-conditions",
  label: "02 · If-else & logic",
  icon: Split,
  href: "/dsa?topic=pre-dsa-02-conditions",
  content: {
    title: "02 · If-else, nested conditions, logical operators & ternary",
    description:
      "Conditions let your program choose. Every loop you will ever write has a condition hiding inside it.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "An if is a fork in the road. The computer asks a yes/no question (the condition). If the answer is yes (true) it takes one road, otherwise (else) it takes the other. 'else if' adds more roads, checked top to bottom, and only the first matching road is taken. A nested condition is a question inside a question: 'Is it the weekend? If yes, is it raining?'. Logical operators join questions: && means AND (both must be true), || means OR (at least one is true), ! means NOT (flip true and false). The ternary 'a ? b : c' is a one-line if-else that picks a value.",
        code: `const isWeekend = true;
const isRaining = false;

if (isWeekend) {
  // nested question: only asked on weekends
  if (isRaining) {
    console.log("Watch a movie");
  } else {
    console.log("Go to the park"); // Go to the park
  }
} else {
  console.log("Go to school");
}`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "The full if / else if / else ladder, the three logical operators, and the ternary. The condition inside the brackets must end up as true or false.",
        code: `const age = 15;

if (age >= 18) {             // question 1
  console.log("adult");
} else if (age >= 13) {      // asked only if question 1 was false
  console.log("teen");       // teen
} else {                     // runs when no question above was true
  console.log("child");
}

const hasTicket = true;
const isVip = false;
console.log(hasTicket && isVip); // false  AND: both must be true
console.log(hasTicket || isVip); // true   OR: at least one is true
console.log(!isVip);             // true   NOT: flips the value

// Ternary: condition ? valueIfTrue : valueIfFalse
const label = age >= 18 ? "adult" : "minor";
console.log(label); // minor`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "A grade calculator checks conditions from the top down and stops at the first true one. The leap-year check is a classic nested condition. The table shows which question gave the answer for each input.",
        code: `function grade(marks) {
  if (marks < 0 || marks > 100) return "invalid";
  if (marks >= 90) return "A";
  else if (marks >= 75) return "B";
  else if (marks >= 50) return "C";
  return "F";
}
console.log(grade(95), grade(80), grade(50), grade(30), grade(120)); // A B C F invalid

// marks | <0 or >100 | >=90  | >=75  | >=50  | result
// 95    | false      | true  |  -    |  -    | A
// 80    | false      | false | true  |  -    | B
// 50    | false      | false | false | true  | C
// 30    | false      | false | false | false | F
// 120   | true       |  -    |  -    |  -    | invalid

function isLeap(year) {
  if (year % 4 === 0) {
    if (year % 100 === 0) {
      return year % 400 === 0; // century years need 400
    }
    return true;
  }
  return false;
}
console.log(isLeap(2024), isLeap(1900), isLeap(2000), isLeap(2023)); // true false true false

// year | %4===0 | %100===0 | %400===0 | result
// 2024 | true   | false    |   -      | true
// 1900 | true   | true     | false    | false
// 2000 | true   | true     | true     | true
// 2023 | false  |   -      |   -      | false`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "Order matters in an else-if ladder, each side of && or || needs a full comparison, and long nested ternaries are hard to read.",
        code: `const m = 95;

// 1. Wrong order: the loosest check first swallows everything
function gradeWrong(n) {
  if (n >= 50) return "C";   // 95 stops here!
  if (n >= 90) return "A";
  return "F";
}
function gradeRight(n) {
  if (n >= 90) return "A";   // strictest check first
  if (n >= 50) return "C";
  return "F";
}
console.log(gradeWrong(m), gradeRight(m)); // C A

// 2. Each side of && needs its own comparison
// WRONG: if (m > 5 && < 100)   -> syntax error
console.log(m > 5 && m < 100); // true

// 3. "x is 1 or 2" must repeat x
const x = 7;
console.log(x === 1 || 2);        // 2   (always truthy: WRONG)
console.log(x === 1 || x === 2);  // false

// 4. Nested ternaries get unreadable fast; use if-else instead
const t = m > 90 ? "A" : m > 75 ? "B" : "C"; // works, but hard to read
console.log(t); // A`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Each function is one decision problem. Write it first, then check against the expected output.",
        code: `// 1. Bigger of two numbers (no Math.max)
function bigger(a, b) {
  return a > b ? a : b;
}
console.log(bigger(3, 9)); // 9

// 2. "positive", "negative" or "zero"
function sign(n) {
  if (n > 0) return "positive";
  else if (n < 0) return "negative";
  return "zero";
}
console.log(sign(-4)); // negative

// 3. FizzBuzz for one number
function fizzBuzz(n) {
  if (n % 15 === 0) return "FizzBuzz"; // check the strictest case first
  if (n % 3 === 0) return "Fizz";
  if (n % 5 === 0) return "Buzz";
  return n;
}
console.log(fizzBuzz(9), fizzBuzz(10), fizzBuzz(30), fizzBuzz(7)); // Fizz Buzz FizzBuzz 7

// 4. Largest of three numbers
function largest(a, b, c) {
  if (a >= b && a >= c) return a;
  if (b >= c) return b;
  return c;
}
console.log(largest(4, 11, 7)); // 11

// 5. Type of triangle from its three sides
function triangle(a, b, c) {
  if (a + b <= c || a + c <= b || b + c <= a) return "invalid";
  if (a === b && b === c) return "equilateral";
  if (a === b || b === c || a === c) return "isosceles";
  return "scalene";
}
console.log(triangle(3, 3, 3), triangle(3, 3, 5), triangle(3, 4, 5), triangle(1, 2, 9)); // equilateral isosceles scalene invalid`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `console.log(5 > 3 && 2 > 4);           // Q1
console.log(0 || "default");           // Q2
console.log(10 > 5 ? "yes" : "no");    // Q3

// Answers:
// Q1 -> false    (5 > 3 is true, 2 > 4 is false, AND needs both)
// Q2 -> default  (0 counts as false, so OR gives the right side)
// Q3 -> yes`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 03 · For loops
// ---------------------------------------------------------------------------
const t03: DSATopic = {
  id: "pre-dsa-03-for-loops",
  label: "03 · For loops",
  icon: Repeat,
  href: "/dsa?topic=pre-dsa-03-for-loops",
  content: {
    title: "03 · For loops — initialization, condition, increment & decrement",
    description:
      "A for loop repeats code a known number of times. Learn its three parts and you can read 80% of the loops in DSA.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "Think of climbing stairs. You start on step 0 (initialization), you keep climbing while you are below the top step (condition), and after each step you move up by one (increment). If you are coming down the stairs, you start at the top and move down by one each time (decrement). One trip through the loop body is called an iteration. A for loop is the right choice when you know, or can calculate, how many times to repeat, for example 'once for every item in this list'.",
        code: `// Climb 3 stairs
for (let step = 1; step <= 3; step++) {
  console.log("on step", step); // on step 1, on step 2, on step 3
}
console.log("reached the top"); // reached the top`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "The three parts sit inside the brackets, separated by semicolons. Order of events: init runs once, then [check condition -> run body -> run update] repeats until the condition is false.",
        code: `//   1. init     2. condition   4. update
for (let i = 0;   i < 5;         i++) {
  // 3. body: runs once per iteration
  console.log(i); // 0 1 2 3 4
}
// i < 5 starting at 0 runs exactly 5 times

// Decrement: count down
for (let i = 3; i > 0; i--) {
  console.log(i); // 3 2 1
}

// Looping over an array by index
const fruits = ["apple", "kiwi", "fig"];
for (let i = 0; i < fruits.length; i++) {
  console.log(i, fruits[i]); // 0 apple, 1 kiwi, 2 fig
}`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "Adding the numbers 1 to 4. Notice the last row: the condition is checked one extra time, finds false, and the loop ends. That final failed check is where most off-by-one bugs hide.",
        code: `let sum = 0;
for (let i = 1; i <= 4; i++) {
  sum = sum + i;
}
console.log(sum); // 10

// iteration | i | i <= 4 | sum after body | output
// 1         | 1 | true   | 0 + 1 = 1      |  -
// 2         | 2 | true   | 1 + 2 = 3      |  -
// 3         | 3 | true   | 3 + 3 = 6      |  -
// 4         | 4 | true   | 6 + 4 = 10     |  -
// stop      | 5 | false  | loop ends      | 10

// Second example: the 3 times table, collected in an array
const table = [];
for (let i = 1; i <= 5; i++) {
  table.push(3 * i);
}
console.log(table); // [3, 6, 9, 12, 15]`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "The infinite-loop versions are commented out on purpose. Read them, do not run them.",
        code: `const arr = [10, 20, 30];

// 1. <= length goes one step too far
// WRONG: for (let i = 0; i <= arr.length; i++)  -> last arr[i] is undefined
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]); // 10 20 30
}

// 2. Wrong direction: counting up while the condition wants you to go down
// WRONG: for (let i = 5; i > 0; i++)  -> i grows forever, infinite loop
for (let i = 5; i > 0; i--) {} // RIGHT: decrement when going down

// 3. A semicolon after the brackets makes an empty loop
let hits = 0;
for (let i = 0; i < 3; i++); { hits++; } // the block runs only once!
console.log(hits); // 1

// 4. Changing i inside the body makes the loop skip
let seen = [];
for (let i = 0; i < 6; i++) {
  seen.push(i);
  i++; // extra increment: skips every other value
}
console.log(seen); // [0, 2, 4]`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Each one is a single for loop. Pay attention to where you start, where you stop, and how you step.",
        code: `// 1. The numbers 1 to 5 in an array
function oneToFive() {
  const out = [];
  for (let i = 1; i <= 5; i++) out.push(i);
  return out;
}
console.log(oneToFive()); // [1, 2, 3, 4, 5]

// 2. Sum of the even numbers from 1 to 10
function sumEvens() {
  let sum = 0;
  for (let i = 1; i <= 10; i++) {
    if (i % 2 === 0) sum += i;
  }
  return sum;
}
console.log(sumEvens()); // 30

// 3. Times table of n up to n x 5
function timesTable(n) {
  const out = [];
  for (let i = 1; i <= 5; i++) out.push(n * i);
  return out;
}
console.log(timesTable(7)); // [7, 14, 21, 28, 35]

// 4. Factorial: 5! = 5 x 4 x 3 x 2 x 1
function factorial(n) {
  let result = 1;
  for (let i = n; i >= 1; i--) result *= i;
  return result;
}
console.log(factorial(5)); // 120

// 5. Count down from 10 to 0 in steps of 2
function countDown() {
  const out = [];
  for (let i = 10; i >= 0; i -= 2) out.push(i);
  return out;
}
console.log(countDown()); // [10, 8, 6, 4, 2, 0]`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `// Q1
for (let i = 0; i < 3; i++) console.log(i * 2);

// Q2: how many times does the body run?
let runs = 0;
for (let i = 5; i < 5; i++) runs++;
console.log(runs);

// Q3
for (let i = 10; i >= 0; i -= 5) console.log(i);

// Answers:
// Q1 -> 0, 2, 4
// Q2 -> 0   (5 < 5 is false on the very first check)
// Q3 -> 10, 5, 0`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 04 · While loops
// ---------------------------------------------------------------------------
const t04: DSATopic = {
  id: "pre-dsa-04-while-loops",
  label: "04 · While loops",
  icon: RefreshCw,
  href: "/dsa?topic=pre-dsa-04-while-loops",
  content: {
    title: "04 · While loops — when to use, condition-based iteration & termination",
    description:
      "A while loop repeats as long as something is true. Use it when you do not know in advance how many times you will loop.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "'Keep eating while you are hungry.' You do not know how many bites that will take, you just keep checking. A while loop asks its question before every round: if the answer is true it runs the body, if false it stops. Termination means 'the loop stops'. A while loop only stops if something inside the body changes the answer to false, so every while loop needs three things: set up a variable before the loop, check it in the condition, and change it inside the body. Use for when you know the count, use while when you know the stopping rule.",
        code: `// Halve a number until it is small. How many halvings? We don't know yet.
let n = 40;
let halvings = 0;
while (n > 5) {
  n = n / 2;
  halvings++;
}
console.log(n, halvings); // 5 3`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "Setup, check, change. Forget the change and the loop never ends.",
        code: `let n = 1;           // 1. setup before the loop
while (n <= 3) {     // 2. check BEFORE every round
  console.log(n);    // 1 2 3
  n++;               // 3. change something the condition depends on
}

// Any for loop can be written as a while loop:
// for (let i = 0; i < 3; i++) { body }
let i = 0;
while (i < 3) {
  // body
  i++;
}
console.log(i); // 3`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "Adding up the digits of 472. We do not know how many digits a number has, so we loop while there are digits left. % 10 takes the last digit and Math.floor(num / 10) chops it off.",
        code: `let num = 472;
let digitSum = 0;
while (num > 0) {
  const last = num % 10;       // last digit
  digitSum += last;            // add it
  num = Math.floor(num / 10);  // remove it
}
console.log(digitSum); // 13

// iteration | num (start) | num > 0 | last | digitSum | num (end)
// 1         | 472         | true    | 2    | 2        | 47
// 2         | 47          | true    | 7    | 9        | 4
// 3         | 4           | true    | 4    | 13       | 0
// stop      | 0           | false   |  -   | 13       | output 13`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "Almost every while-loop bug is an infinite loop or a loop that stops one step early or late. The dangerous versions are commented out.",
        code: `// 1. Forgetting to change the variable -> infinite loop
// WRONG:
// let a = 0;
// while (a < 3) { console.log(a); }   // a is always 0
let a = 0;
while (a < 3) a++; // RIGHT
console.log(a); // 3

// 2. Changing the wrong variable
// WRONG: while (b < 3) { c++; }  -> b never moves

// 3. A condition that can jump over its target
// WRONG: let k = 1; while (k !== 10) { k += 2; }  -> 1, 3, ..., 9, 11, never 10
let k = 1;
while (k < 10) k += 2; // RIGHT: use < instead of !==
console.log(k); // 11

// 4. < vs <= changes the number of rounds
let r1 = 0, x = 0;
while (x < 3) { x++; r1++; }
let r2 = 0, y = 0;
while (y <= 3) { y++; r2++; }
console.log(r1, r2); // 3 4`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Each of these has an unknown number of rounds, which is exactly when while shines.",
        code: `// 1. How many digits does n have?
function countDigits(n) {
  let count = 0;
  while (n > 0) {
    n = Math.floor(n / 10);
    count++;
  }
  return count;
}
console.log(countDigits(90210)); // 5

// 2. Reverse the digits of a number
function reverseNumber(n) {
  let rev = 0;
  while (n > 0) {
    rev = rev * 10 + (n % 10);
    n = Math.floor(n / 10);
  }
  return rev;
}
console.log(reverseNumber(1234)); // 4321

// 3. Smallest power of 2 that is >= target
function powerOfTwoAtLeast(target) {
  let p = 1;
  while (p < target) p *= 2;
  return p;
}
console.log(powerOfTwoAtLeast(50)); // 64

// 4. Collatz steps: even -> n/2, odd -> 3n+1, until n is 1
function collatzSteps(n) {
  let steps = 0;
  while (n !== 1) {
    n = n % 2 === 0 ? n / 2 : 3 * n + 1;
    steps++;
  }
  return steps;
}
console.log(collatzSteps(6)); // 8

// 5. Add 1 + 2 + 3 + ... until the total is more than limit. How many numbers?
function countUntil(limit) {
  let total = 0;
  let k = 0;
  while (total <= limit) {
    k++;
    total += k;
  }
  return k;
}
console.log(countUntil(20)); // 6`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `// Q1: how many rounds?
let i = 10, rounds = 0;
while (i < 5) { rounds++; i++; }
console.log(rounds);

// Q2
let x = 1;
while (x < 20) x *= 3;
console.log(x);

// Q3
let c = 0, k = 5;
while (k > 0) { k -= 2; c++; }
console.log(c, k);

// Answers:
// Q1 -> 0      (10 < 5 is false at the first check)
// Q2 -> 27     (1, 3, 9, 27; 27 < 20 is false)
// Q3 -> 3 -1   (k: 5 -> 3 -> 1 -> -1)`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 05 · Do-while loops
// ---------------------------------------------------------------------------
const t05: DSATopic = {
  id: "pre-dsa-05-do-while",
  label: "05 · Do-while loops",
  icon: Repeat1,
  href: "/dsa?topic=pre-dsa-05-do-while",
  content: {
    title: "05 · Do-while loops — execution and use cases",
    description:
      "A do-while loop runs its body first and asks the question afterwards, so the body always runs at least once.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "Taste first, then decide if you want more. With a while loop you check before every bite, so if you are not hungry you never take one. With a do-while loop you always take the first bite, then check. That is the only difference: do-while runs the body at least once even when the condition is false from the start. Use it when the first round must happen no matter what, for example showing a menu once before asking whether to show it again, or counting the digits of 0 (which has one digit).",
        code: `let hungry = false;

while (hungry) {
  console.log("while: bite");    // never runs
}

do {
  console.log("do-while: bite"); // do-while: bite
} while (hungry);`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "The condition moves to the bottom and is followed by a semicolon. Like a while loop, something in the body must change, or it never stops.",
        code: `let tries = 0;
do {
  tries++;                     // body runs FIRST
  console.log("try", tries);   // try 1, try 2, try 3
} while (tries < 3);           // checked AFTER the body; note the ;

console.log("done after", tries); // done after 3`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "Rolling a pretend dice until we get a 6. We must roll at least once before we can check the result, which is the perfect do-while case. The rolls come from a fixed list so the program always stops.",
        code: `const rolls = [3, 5, 6, 2]; // pretend dice results
let idx = 0;
let roll;
do {
  roll = rolls[idx];
  idx++;
  console.log("rolled", roll); // rolled 3, rolled 5, rolled 6
} while (roll !== 6);

console.log("got a 6 after", idx, "rolls"); // got a 6 after 3 rolls

// iteration | idx before | roll | idx after | output     | roll !== 6 (checked after)
// 1         | 0          | 3    | 1         | rolled 3   | true  -> go again
// 2         | 1          | 5    | 2         | rolled 5   | true  -> go again
// 3         | 2          | 6    | 3         | rolled 6   | false -> stop`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "The 'at least once' rule is a feature, but it bites you when zero rounds was the right answer.",
        code: `// 1. Running once when it should not run at all
let balance = 0;
let withdrawn = 0;
do {
  withdrawn += 10;   // takes money even though balance is 0!
  balance -= 10;
} while (balance > 0);
console.log(balance, withdrawn); // -10 10
// RIGHT: use while when zero rounds is possible
let balance2 = 0;
while (balance2 > 0) balance2 -= 10;
console.log(balance2); // 0

// 2. Forgetting to change anything -> infinite loop (do not run)
// let n = 1;
// do { console.log(n); } while (n < 5);

// 3. Counting digits: while gets 0 wrong, do-while gets it right
function digitsWhile(n) {
  let c = 0;
  while (n > 0) { n = Math.floor(n / 10); c++; }
  return c;
}
function digitsDoWhile(n) {
  let c = 0;
  do { n = Math.floor(n / 10); c++; } while (n > 0);
  return c;
}
console.log(digitsWhile(0), digitsDoWhile(0)); // 0 1`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Each uses do-while because the first round must always happen.",
        code: `// 1. Count digits (0 has one digit)
function countDigits(n) {
  let count = 0;
  do {
    count++;
    n = Math.floor(n / 10);
  } while (n > 0);
  return count;
}
console.log(countDigits(0), countDigits(12345)); // 1 5

// 2. Sum of digits
function digitSum(n) {
  let sum = 0;
  do {
    sum += n % 10;
    n = Math.floor(n / 10);
  } while (n > 0);
  return sum;
}
console.log(digitSum(9045)); // 18

// 3. How many halvings until the number is below 1?
function halveCount(x) {
  let count = 0;
  do {
    x = x / 2;
    count++;
  } while (x >= 1);
  return count;
}
console.log(halveCount(10)); // 4

// 4. Read "user inputs" until a positive one arrives
function firstPositive(inputs) {
  let i = 0;
  let value;
  do {
    value = inputs[i];
    i++;
  } while (value <= 0 && i < inputs.length);
  return value;
}
console.log(firstPositive([-3, 0, 7, 2])); // 7

// 5. Guessing game: how many guesses to hit the target?
function attempts(guesses, target) {
  let i = 0;
  do {
    i++;
  } while (guesses[i - 1] !== target && i < guesses.length);
  return i;
}
console.log(attempts([50, 25, 37, 31], 31)); // 4`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `// Q1
let i = 5;
do { console.log(i); i++; } while (i < 3);

// Q2
let n = 0;
do { n += 2; } while (n < 7);
console.log(n);

// Q3
let s = "";
let k = 3;
do { s += k; k--; } while (k > 0);
console.log(s);

// Answers:
// Q1 -> 5     (runs once, then 6 < 3 is false)
// Q2 -> 8     (2, 4, 6, 8; 8 < 7 is false)
// Q3 -> 321`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 06 · Loop directions
// ---------------------------------------------------------------------------
const t06: DSATopic = {
  id: "pre-dsa-06-loop-directions",
  label: "06 · Loop directions",
  icon: ArrowLeftRight,
  href: "/dsa?topic=pre-dsa-06-loop-directions",
  content: {
    title: "06 · Loop directions — forward, backward & reverse iteration",
    description:
      "Walk an array front to back, back to front, or mirror one index against the other. Same items, different order.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "Imagine a hallway with rooms numbered 0, 1, 2, 3. Walking forward you start at the front door (room 0) and stop after the last room (length - 1). Walking backward you start at the last room and stop after room 0. Nothing about the rooms changes, only the order you visit them. Going backward is useful when the answer is near the end (the last even number), when you build something reversed, or when removing items would otherwise shift what is still ahead of you.",
        code: `const hallway = ["door", "lamp", "desk", "window"];

// Front to back
for (let i = 0; i < hallway.length; i++) {
  console.log(hallway[i]); // door lamp desk window
}

// Back to front
for (let i = hallway.length - 1; i >= 0; i--) {
  console.log(hallway[i]); // window desk lamp door
}`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "Forward starts at 0 and stops before n. Backward starts at n - 1 and stops after 0 (i >= 0). The mirror trick arr[n - 1 - i] lets a forward loop read from the back.",
        code: `const arr = [10, 20, 30, 40];
const n = arr.length; // 4: indexes are 0, 1, 2, 3

// FORWARD: start 0, keep going while i < n, step +1
for (let i = 0; i < n; i++) {
  console.log(i, arr[i]); // 0 10, 1 20, 2 30, 3 40
}

// BACKWARD: start n - 1, keep going while i >= 0, step -1
for (let i = n - 1; i >= 0; i--) {
  console.log(i, arr[i]); // 3 40, 2 30, 1 20, 0 10
}

// for...of: always forward, gives values without indexes
for (const v of arr) {
  console.log(v); // 10 20 30 40
}

// MIRROR: when i counts up from the front, n - 1 - i counts down from the back
for (let i = 0; i < n; i++) {
  console.log(arr[n - 1 - i]); // 40 30 20 10
}`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "Reversing a word by walking it backward and adding each letter to a new string. Then a backward search that finds the last even number quickly. (break means 'stop the loop now', covered in topic 09.)",
        code: `const word = "hello";
let reversed = "";
for (let i = word.length - 1; i >= 0; i--) {
  reversed += word[i];
}
console.log(reversed); // olleh

// iteration | i  | i >= 0 | word[i] | reversed
// 1         | 4  | true   | o       | o
// 2         | 3  | true   | l       | ol
// 3         | 2  | true   | l       | oll
// 4         | 1  | true   | e       | olle
// 5         | 0  | true   | h       | olleh
// stop      | -1 | false  |  -      | output olleh

const nums = [3, 8, 5, 6, 7];
let lastEven = -1;
for (let i = nums.length - 1; i >= 0; i--) {
  if (nums[i] % 2 === 0) {
    lastEven = nums[i];
    break; // found from the back, no need to look further
  }
}
console.log(lastEven); // 6`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "Backward loops break at the two ends: starting one past the last item, or stopping before index 0.",
        code: `const arr = [1, 2, 3];

// 1. Starting at length instead of length - 1
for (let i = arr.length; i >= 0; i--) {
  console.log(arr[i]); // undefined 3 2 1   (arr[3] does not exist)
}

// 2. i > 0 forgets index 0
const out = [];
for (let i = arr.length - 1; i > 0; i--) out.push(arr[i]);
console.log(out); // [3, 2]   (1 is missing; use i >= 0)

// 3. i++ in a backward loop -> infinite loop (do not run)
// for (let i = 2; i >= 0; i++) {}

// 4. arr.reverse() flips the ORIGINAL array; copy first if you need both
const original = [1, 2, 3];
const copy = original.slice().reverse();
console.log(original, copy); // [1, 2, 3] [3, 2, 1]`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "All five need a backward loop or the mirror index. Try them without .reverse().",
        code: `// 1. Reverse an array into a new array
function reverseArray(arr) {
  const out = [];
  for (let i = arr.length - 1; i >= 0; i--) out.push(arr[i]);
  return out;
}
console.log(reverseArray([1, 2, 3, 4])); // [4, 3, 2, 1]

// 2. Reverse a string
function reverseString(s) {
  let out = "";
  for (let i = s.length - 1; i >= 0; i--) out += s[i];
  return out;
}
console.log(reverseString("stressed")); // desserts

// 3. Index of the LAST time target appears (-1 if never)
function lastIndex(arr, target) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === target) return i;
  }
  return -1;
}
console.log(lastIndex([5, 3, 5, 1], 5)); // 2

// 4. "5,4,3,2,1" for n = 5
function countdown(n) {
  const parts = [];
  for (let i = n; i >= 1; i--) parts.push(i);
  return parts.join(",");
}
console.log(countdown(5)); // 5,4,3,2,1

// 5. Sum of the last k items
function sumLastK(arr, k) {
  let sum = 0;
  for (let i = arr.length - 1; i >= arr.length - k; i--) sum += arr[i];
  return sum;
}
console.log(sumLastK([4, 7, 1, 9, 2], 3)); // 12`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `// Q1
for (let i = 4; i >= 0; i -= 2) console.log(i);

// Q2
const a = ["x", "y", "z"];
let s = "";
for (let i = a.length - 1; i >= 0; i--) s += a[i];
console.log(s);

// Q3
const b = [1, 2, 3, 4];
console.log(b[b.length - 1], b[b.length - 4]);

// Answers:
// Q1 -> 4, 2, 0
// Q2 -> zyx
// Q3 -> 4 1`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 07 · Loop movements
// ---------------------------------------------------------------------------
const t07: DSATopic = {
  id: "pre-dsa-07-loop-movements",
  label: "07 · Loop movements",
  icon: Footprints,
  href: "/dsa?topic=pre-dsa-07-loop-movements",
  content: {
    title: "07 · Loop movements — jumping, skipping indices & custom increments",
    description:
      "The update part of a loop does not have to be i++. Jump by 2, by 3, or double each time.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "Think of hopscotch. You do not have to land on every square: you can hop on every second one, every third one, or make each jump twice as long as the last. In a loop, the update part decides the size of each hop. i += 2 visits every second index, i += 3 every third, i *= 2 doubles (1, 2, 4, 8...). Skipping indices is useful for 'every other item', for working on pairs, and for things that grow quickly like powers of two.",
        code: `// Hopscotch squares 0..9, land on every second one
for (let sq = 0; sq < 10; sq += 2) {
  console.log("hop on", sq); // hop on 0, hop on 2, hop on 4, hop on 6, hop on 8
}`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "Only the update changes. Where you start decides which squares you land on: start at 0 with += 2 for even positions, start at 1 for odd positions.",
        code: `for (let i = 0; i < 10; i += 2) console.log(i); // 0 2 4 6 8       even positions
for (let i = 1; i < 10; i += 2) console.log(i); // 1 3 5 7 9       odd positions
for (let i = 0; i < 10; i += 3) console.log(i); // 0 3 6 9         every 3rd
for (let i = 1; i < 50; i *= 2) console.log(i); // 1 2 4 8 16 32   doubling
for (let i = 9; i >= 0; i -= 3) console.log(i); // 9 6 3 0         backward jumps

// Custom step stored in a variable
const step = 4;
for (let i = 0; i < 13; i += step) console.log(i); // 0 4 8 12`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "Picking every second letter, then counting how many times you can multiply by 3 before passing 100.",
        code: `const letters = ["a", "b", "c", "d", "e", "f", "g"];
const picked = [];
for (let i = 0; i < letters.length; i += 2) {
  picked.push(letters[i]);
}
console.log(picked); // ["a", "c", "e", "g"]

// iteration | i | i < 7 | letters[i] | picked
// 1         | 0 | true  | a          | [a]
// 2         | 2 | true  | c          | [a, c]
// 3         | 4 | true  | e          | [a, c, e]
// 4         | 6 | true  | g          | [a, c, e, g]
// stop      | 8 | false |  -         | output [a, c, e, g]

let rounds = 0;
for (let p = 1; p <= 100; p *= 3) {
  rounds++;
}
console.log(rounds); // 5

// iteration | p   | p <= 100 | rounds
// 1         | 1   | true     | 1
// 2         | 3   | true     | 2
// 3         | 9   | true     | 3
// 4         | 27  | true     | 4
// 5         | 81  | true     | 5
// stop      | 243 | false    | output 5`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "Big hops can jump over your stopping point or off the end of the array.",
        code: `// 1. Multiplying from 0 never moves (0 * 2 = 0) -> infinite loop (do not run)
// for (let i = 0; i < 10; i *= 2) {}
// RIGHT: start doubling loops at 1

// 2. !== can be jumped over (do not run)
// for (let i = 0; i !== 9; i += 2) {}   // 0, 2, ..., 8, 10, ... never 9
// RIGHT: use < or <=

// 3. Reading arr[i + 1] while hopping by 2 can fall off the end
const arr = [1, 2, 3, 4, 5];
const sums = [];
for (let i = 0; i < arr.length; i += 2) sums.push(arr[i] + arr[i + 1]);
console.log(sums); // [3, 7, NaN]   (arr[5] is undefined)
const fixed = [];
for (let i = 0; i + 1 < arr.length; i += 2) fixed.push(arr[i] + arr[i + 1]);
console.log(fixed); // [3, 7]

// 4. Odd positions start at 1, not 0
const oddPositions = [];
for (let i = 1; i < arr.length; i += 2) oddPositions.push(arr[i]);
console.log(oddPositions); // [2, 4]`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Pick the right start, condition and hop size for each.",
        code: `// 1. Odd numbers from 1 to 15
function odds() {
  const out = [];
  for (let i = 1; i <= 15; i += 2) out.push(i);
  return out;
}
console.log(odds()); // [1, 3, 5, 7, 9, 11, 13, 15]

// 2. Multiples of 5 up to 30
function multiplesOf5() {
  const out = [];
  for (let i = 5; i <= 30; i += 5) out.push(i);
  return out;
}
console.log(multiplesOf5()); // [5, 10, 15, 20, 25, 30]

// 3. Every k-th item, starting with the first
function everyKth(arr, k) {
  const out = [];
  for (let i = 0; i < arr.length; i += k) out.push(arr[i]);
  return out;
}
console.log(everyKth([10, 20, 30, 40, 50, 60, 70], 3)); // [10, 40, 70]

// 4. Powers of 3 below 100
function powersOf3() {
  const out = [];
  for (let p = 1; p < 100; p *= 3) out.push(p);
  return out;
}
console.log(powersOf3()); // [1, 3, 9, 27, 81]

// 5. Add items in pairs: [1,2,3,4,5,6] -> [1+2, 3+4, 5+6]
function pairSums(arr) {
  const out = [];
  for (let i = 0; i + 1 < arr.length; i += 2) out.push(arr[i] + arr[i + 1]);
  return out;
}
console.log(pairSums([1, 2, 3, 4, 5, 6])); // [3, 7, 11]`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `// Q1
for (let i = 2; i < 12; i += 4) console.log(i);

// Q2: how many rounds?
let c = 0;
for (let i = 1; i <= 64; i *= 2) c++;
console.log(c);

// Q3
for (let i = 20; i > 0; i -= 6) console.log(i);

// Answers:
// Q1 -> 2, 6, 10
// Q2 -> 7   (1, 2, 4, 8, 16, 32, 64)
// Q3 -> 20, 14, 8, 2`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 08 · Loop conditions & off-by-one
// ---------------------------------------------------------------------------
const t08: DSATopic = {
  id: "pre-dsa-08-loop-conditions",
  label: "08 · Boundaries & off-by-one",
  icon: Ruler,
  href: "/dsa?topic=pre-dsa-08-loop-conditions",
  content: {
    title: "08 · Loop conditions — boundaries, dynamic conditions & off-by-one errors",
    description:
      "Most loop bugs are one step too many or one step too few. Learn the four boundary rules and they disappear.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "Build a 4-metre fence with a post every metre. How many posts? Not 4, but 5 (at 0, 1, 2, 3 and 4). How many gaps? 4. Mixing those up is called an off-by-one error, and it is the most common loop bug in the world. A boundary is the edge of your data: the first valid index is 0 and the last is length - 1. A dynamic condition is a stopping rule that depends on more than a fixed number, for example 'stop at the end of the list OR when my bag is full'.",
        code: `// Posts at metre 0, 1, 2, 3, 4 of a 4-metre fence
let posts = 0;
for (let m = 0; m <= 4; m++) posts++;
console.log(posts); // 5

// Gaps between the posts
let gaps = 0;
for (let m = 0; m < 4; m++) gaps++;
console.log(gaps); // 4`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "Four rules cover almost every case. When you read arr[i + 1], stop one early. With two stopping reasons, put the boundary check first so you never read outside the array.",
        code: `const arr = [7, 3, 9, 4];
const n = arr.length; // 4

// Rule 1: i < n      visits 0..n-1      -> n rounds (use this for arrays)
// Rule 2: i <= n     visits 0..n        -> n + 1 rounds (one too many for arrays)
// Rule 3: a to b inclusive              -> b - a + 1 rounds
// Rule 4: reading arr[i + 1]?           -> stop at i < n - 1

for (let i = 0; i < n - 1; i++) {
  console.log(arr[i], "vs", arr[i + 1]); // 7 vs 3, 3 vs 9, 9 vs 4
}

// Dynamic condition: stop at the end OR when the next item would pass 12
let i = 0;
let sum = 0;
while (i < n && sum + arr[i] <= 12) {
  sum += arr[i];
  i++;
}
console.log(sum, i); // 10 2`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "Counting how many times a number is bigger than the one before it. Because we read arr[i + 1], the loop must stop at i < n - 1. Watch the last row: the condition fails exactly when there is no next item left.",
        code: `const arr = [3, 5, 4, 6, 8];
let increases = 0;
for (let i = 0; i < arr.length - 1; i++) {
  if (arr[i + 1] > arr[i]) increases++;
}
console.log(increases); // 3

// iteration | i | i < 4 | arr[i], arr[i+1] | bigger? | increases
// 1         | 0 | true  | 3, 5             | yes     | 1
// 2         | 1 | true  | 5, 4             | no      | 1
// 3         | 2 | true  | 4, 6             | yes     | 2
// 4         | 3 | true  | 6, 8             | yes     | 3
// stop      | 4 | false |  -               |  -      | output 3`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "Each one shows the wrong result printed, so you can recognise the symptom (NaN, undefined, a missing item) when it happens to you.",
        code: `const arr = [2, 4, 6];

// 1. <= length reads one past the end
let total = 0;
for (let i = 0; i <= arr.length; i++) total += arr[i];
console.log(total); // NaN   (2 + 4 + 6 + undefined)

// 2. Neighbour loop running to the last index
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i] < arr[i + 1]); // true true false   (last one is 6 < undefined)
}
// RIGHT: i < arr.length - 1

// 3. Check the boundary FIRST in a dynamic condition
// WRONG order: while (arr[j] !== 99 && j < arr.length)  reads arr[3] before checking j
let j = 0;
while (j < arr.length && arr[j] !== 99) j++;
console.log(j); // 3   (not found: j stops at length)

// 4. Empty arrays: length - 1 is -1, so this loop must simply not run
const empty = [];
let rounds = 0;
for (let k = 0; k < empty.length - 1; k++) rounds++;
console.log(rounds); // 0

// 5. Inclusive ranges have one more item than you think
let c = 0;
for (let x = 3; x <= 9; x++) c++;
console.log(c, 9 - 3 + 1); // 7 7`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Before running each one, say out loud how many rounds the loop should make.",
        code: `// 1. How many whole numbers from a to b, inclusive?
function countInRange(a, b) {
  let count = 0;
  for (let x = a; x <= b; x++) count++;
  return count;
}
console.log(countInRange(3, 9)); // 7

// 2. How many times is the next number bigger?
function countIncreases(arr) {
  let count = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i + 1] > arr[i]) count++;
  }
  return count;
}
console.log(countIncreases([1, 2, 2, 5, 3, 4])); // 3

// 3. Buy items in order until the next one does not fit the budget
function itemsBought(prices, budget) {
  let i = 0;
  let spent = 0;
  while (i < prices.length && spent + prices[i] <= budget) {
    spent += prices[i];
    i++;
  }
  return i;
}
console.log(itemsBought([4, 3, 5, 2], 10)); // 2

// 4. Is the array sorted from small to big?
function isSorted(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false;
  }
  return true;
}
console.log(isSorted([1, 3, 3, 7]), isSorted([1, 5, 2])); // true false

// 5. Sum of a to b, inclusive
function sumRange(a, b) {
  let sum = 0;
  for (let x = a; x <= b; x++) sum += x;
  return sum;
}
console.log(sumRange(5, 10)); // 45`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `// Q1: how many rounds?
let c = 0;
for (let i = 0; i <= 10; i += 2) c++;
console.log(c);

// Q2
const a = [1, 2, 3];
let s = 0;
for (let i = 1; i < a.length; i++) s += a[i];
console.log(s);

// Q3
const b = [5, 5, 8, 5];
let i = 0;
while (i < b.length && b[i] === 5) i++;
console.log(i);

// Answers:
// Q1 -> 6   (0, 2, 4, 6, 8, 10)
// Q2 -> 5   (starts at index 1, so a[0] is skipped)
// Q3 -> 2   (stops at the 8)`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 09 · Break, continue & early exits
// ---------------------------------------------------------------------------
const t09: DSATopic = {
  id: "pre-dsa-09-break-continue",
  label: "09 · Break, continue & exits",
  icon: CircleStop,
  href: "/dsa?topic=pre-dsa-09-break-continue",
  content: {
    title: "09 · Break, continue, early exits & infinite-loop prevention",
    description:
      "Stop a loop the moment you have your answer, skip the rounds you do not care about, and make sure every loop ends.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "You are searching a drawer for your keys. The moment you find them you stop searching: that is break. You are sorting laundry and want only shirts, so when you pick up a sock you put it aside and grab the next item: that is continue (skip the rest of this round, start the next one). Inside a function, return leaves the loop and the whole function at once: an early exit. An infinite loop is a loop that never ends because its condition never becomes false. Prevent it by making sure every round moves you closer to the end, and by giving while(true) loops a break plus a safety counter.",
        code: `const drawer = ["pen", "coin", "keys", "tape"];
for (let i = 0; i < drawer.length; i++) {
  console.log("checking", drawer[i]); // checking pen, checking coin, checking keys
  if (drawer[i] === "keys") break;    // found them: stop, never check "tape"
}`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "break leaves the loop, continue jumps to the next round, return leaves the function. A while(true) loop must always have a break and a guard.",
        code: `// break: leave the loop now
for (let i = 1; i <= 10; i++) {
  if (i === 4) break;
  console.log("break demo", i); // break demo 1, break demo 2, break demo 3
}

// continue: skip the rest of THIS round, go to the next one
for (let i = 1; i <= 5; i++) {
  if (i % 2 === 0) continue;
  console.log("odd", i); // odd 1, odd 3, odd 5
}

// return: leave the loop AND the function
function firstBig(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > 10) return arr[i];
  }
  return -1; // reached only when nothing was found
}
console.log(firstBig([3, 12, 40])); // 12

// Safe while(true): a break for the normal exit, a guard for safety
let rounds = 0;
const MAX_ROUNDS = 100;
while (true) {
  rounds++;
  if (rounds === 3) break;          // normal exit
  if (rounds >= MAX_ROUNDS) break;  // safety net
}
console.log(rounds); // 3`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "Add up the numbers, skip negatives, and stop completely at the first 0. Then a loop with a guard: it ends normally, but it would also end if something went wrong.",
        code: `const nums = [4, -2, 5, -1, 0, 9];
let sum = 0;
for (let i = 0; i < nums.length; i++) {
  if (nums[i] === 0) break;
  if (nums[i] < 0) continue;
  sum += nums[i];
}
console.log(sum); // 9

// iteration | i | nums[i] | === 0? | < 0? | action   | sum
// 1         | 0 | 4       | no     | no   | add      | 4
// 2         | 1 | -2      | no     | yes  | continue | 4
// 3         | 2 | 5       | no     | no   | add      | 9
// 4         | 3 | -1      | no     | yes  | continue | 9
// 5         | 4 | 0       | yes    |  -   | break    | 9
// (9 is never visited)                               output 9

// Guarded loop: Collatz steps for 6, with a safety limit
let x = 6;
let steps = 0;
const MAX_STEPS = 50;
while (x !== 1 && steps < MAX_STEPS) {
  x = x % 2 === 0 ? x / 2 : 3 * x + 1;
  steps++;
}
console.log(x, steps); // 1 8`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "break only leaves one loop, continue can skip your update, and an else-return inside a loop gives up too early.",
        code: `// 1. break only leaves the innermost loop
let found = false;
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i * j === 2) {
      found = true;
      break;          // leaves the j loop only
    }
  }
  if (found) break;   // so leave the i loop too
}
console.log(found); // true

// 2. continue before the update -> infinite loop (do not run)
// let k = 0;
// while (k < 5) { if (k === 2) continue; k++; }   // k stays 2 forever
let k = 0;
let skipped = 0;
while (k < 5) {
  k++;                                  // RIGHT: update BEFORE any continue
  if (k === 2) { skipped++; continue; }
}
console.log(k, skipped); // 5 1

// 3. else return -1 inside the loop gives up after the first item
function findWrong(arr, t) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === t) return i;
    else return -1;
  }
}
function findRight(arr, t) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === t) return i;
  }
  return -1; // only after checking everything
}
console.log(findWrong([5, 7], 7), findRight([5, 7], 7)); // -1 1

// 4. break does not work inside arr.forEach(...): use a for loop when you need to stop early`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Each one should stop or skip as early as possible.",
        code: `// 1. First multiple of 7 (or -1)
function firstMultipleOf7(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] % 7 === 0) return arr[i];
  }
  return -1;
}
console.log(firstMultipleOf7([3, 10, 14, 21])); // 14

// 2. Sum 1..n but skip multiples of 3
function sumSkipThrees(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0) continue;
    sum += i;
  }
  return sum;
}
console.log(sumSkipThrees(10)); // 37

// 3. Are two side-by-side items equal?
function hasAdjacentDuplicate(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) return true; // early exit
  }
  return false;
}
console.log(hasAdjacentDuplicate([1, 2, 2, 3]), hasAdjacentDuplicate([1, 2, 3])); // true false

// 4. How many items come before the first 0?
function countBeforeZero(arr) {
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === 0) break;
    count++;
  }
  return count;
}
console.log(countBeforeZero([5, 3, 8, 0, 4])); // 3

// 5. Index where the running total first goes over limit (-1 if never)
function firstOverLimit(arr, limit) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
    if (total > limit) return i;
  }
  return -1;
}
console.log(firstOverLimit([3, 4, 2, 6, 1], 10)); // 3`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `// Q1
for (let i = 0; i < 5; i++) {
  if (i === 3) break;
  console.log(i);
}

// Q2
for (let i = 0; i < 5; i++) {
  if (i === 3) continue;
  console.log(i);
}

// Q3
let n = 0;
while (true) {
  n += 3;
  if (n > 10) break;
}
console.log(n);

// Answers:
// Q1 -> 0, 1, 2
// Q2 -> 0, 1, 2, 4
// Q3 -> 12   (3, 6, 9, 12)`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 10 · Nested loops
// ---------------------------------------------------------------------------
const t10: DSATopic = {
  id: "pre-dsa-10-nested-loops",
  label: "10 · Nested loops",
  icon: Layers,
  href: "/dsa?topic=pre-dsa-10-nested-loops",
  content: {
    title: "10 · Nested loops — for/while combinations and multiple levels",
    description:
      "A loop inside a loop. For every round of the outer loop, the inner loop runs all the way through.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "Think of a clock. For every single hour, the minute hand goes all the way round. The hour hand is the outer loop, the minute hand is the inner loop. Or a classroom: for each row of desks (outer), visit every desk in that row (inner). The total work is outer rounds times inner rounds: 2 rows of 3 desks is 6 visits. You can put a while inside a for, or a for inside a while, and you can go three levels deep (2 x 2 x 2 = 8 rounds). Nested loops are how you walk grids, compare pairs, and print patterns.",
        code: `const rows = 2;
const desks = 3;
for (let r = 1; r <= rows; r++) {
  for (let d = 1; d <= desks; d++) {
    console.log("row", r, "desk", d); // row 1 desk 1, row 1 desk 2, row 1 desk 3, row 2 desk 1, row 2 desk 2, row 2 desk 3
  }
}`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "Use i for the outer loop and j for the inner one. Anything that belongs to one outer round (like the current line) is created inside the outer loop, before the inner loop starts.",
        code: `for (let i = 0; i < 3; i++) {     // outer: 3 rounds
  let line = "";                  // fresh for every outer round
  for (let j = 0; j < 4; j++) {   // inner: 4 rounds for EACH i
    line += "*";
  }
  console.log(line); // ****, ****, ****
}

// for outside, while inside
const words = ["hi", "cat"];
for (let w = 0; w < words.length; w++) {
  let k = 0;                      // reset for every word!
  let spelled = "";
  while (k < words[w].length) {
    spelled += words[w][k] + "-";
    k++;
  }
  console.log(spelled); // h-i-, c-a-t-
}

// Three levels: 2 x 2 x 2 = 8 rounds
let count = 0;
for (let a = 0; a < 2; a++) {
  for (let b = 0; b < 2; b++) {
    for (let c = 0; c < 2; c++) {
      count++;
    }
  }
}
console.log(count); // 8`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "A 3 x 3 multiplication grid. Each outer round builds one row, then prints it. In the table, notice j going 1, 2, 3 and then starting again at 1 when i moves on.",
        code: `for (let i = 1; i <= 3; i++) {
  const row = [];
  for (let j = 1; j <= 3; j++) {
    row.push(i * j);
  }
  console.log(row); // [1, 2, 3], [2, 4, 6], [3, 6, 9]
}

// i | j | i * j | row after push | output
// 1 | 1 | 1     | [1]            |
// 1 | 2 | 2     | [1, 2]         |
// 1 | 3 | 3     | [1, 2, 3]      | [1, 2, 3]
// 2 | 1 | 2     | [2]            |
// 2 | 2 | 4     | [2, 4]         |
// 2 | 3 | 6     | [2, 4, 6]      | [2, 4, 6]
// 3 | 1 | 3     | [3]            |
// 3 | 2 | 6     | [3, 6]         |
// 3 | 3 | 9     | [3, 6, 9]      | [3, 6, 9]
// total inner rounds: 3 x 3 = 9`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "The classic nested-loop bugs: a counter that is never reset, rows and columns swapped, and forgetting how fast the work grows.",
        code: `// 1. Forgetting to reset the inner counter
let j = 0;
let pairs = 0;
for (let i = 0; i < 3; i++) {
  while (j < 2) { pairs++; j++; }  // j is never reset: inner loop works only for i = 0
}
console.log(pairs); // 2   (expected 6)

let pairs2 = 0;
for (let i = 0; i < 3; i++) {
  let jj = 0;                      // RIGHT: reset inside the outer loop
  while (jj < 2) { pairs2++; jj++; }
}
console.log(pairs2); // 6

// 2. Rows vs columns: grid[row][col]
const grid = [[1, 2, 3], [4, 5, 6]];
console.log(grid.length, grid[0].length); // 2 3   (2 rows, 3 columns)
console.log(grid[1][0]); // 4   (row 1, column 0)

// 3. Same name for both loop variables: the inner one hides the outer one.
//    Always use different names (i and j).

// 4. Work grows fast: 1,000 x 1,000 = 1,000,000 rounds.
let work = 0;
for (let a = 0; a < 10; a++) {
  for (let b = 0; b < 10; b++) work++;
}
console.log(work); // 100`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Patterns and grids. For each one, decide first what the outer loop counts and what the inner loop counts.",
        code: `// 1. n x n square of stars
function square(n) {
  const lines = [];
  for (let i = 0; i < n; i++) {
    let line = "";
    for (let j = 0; j < n; j++) line += "*";
    lines.push(line);
  }
  return lines;
}
console.log(square(3)); // ["***", "***", "***"]

// 2. Right triangle: row i has i stars
function triangle(n) {
  const lines = [];
  for (let i = 1; i <= n; i++) {
    let line = "";
    for (let j = 1; j <= i; j++) line += "*";
    lines.push(line);
  }
  return lines;
}
console.log(triangle(4)); // ["*", "**", "***", "****"]

// 3. How many (i, j) with i and j from 0 to n add up to n?
function countPairsSum(n) {
  let count = 0;
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n; j++) {
      if (i + j === n) count++;
    }
  }
  return count;
}
console.log(countPairsSum(4)); // 5

// 4. Sum of every number in a grid
function gridSum(grid) {
  let sum = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) sum += grid[r][c];
  }
  return sum;
}
console.log(gridSum([[1, 2], [3, 4], [5, 6]])); // 21

// 5. Find [row, col] of a target in a grid
function findInGrid(grid, target) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === target) return [r, c];
    }
  }
  return [-1, -1];
}
console.log(findInGrid([[5, 1], [7, 3], [9, 2]], 3)); // [1, 1]`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `// Q1
let c = 0;
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 4; j++) c++;
}
console.log(c);

// Q2
for (let i = 0; i < 2; i++) {
  for (let j = 0; j < 2; j++) console.log(i + "" + j);
}

// Q3
let s = 0;
for (let i = 1; i <= 3; i++) {
  for (let j = 1; j <= i; j++) s++;
}
console.log(s);

// Answers:
// Q1 -> 12              (3 x 4)
// Q2 -> 00, 01, 10, 11
// Q3 -> 6               (1 + 2 + 3)`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 11 · Nested loop variations
// ---------------------------------------------------------------------------
const t11: DSATopic = {
  id: "pre-dsa-11-nested-variations",
  label: "11 · Nested loop shapes",
  icon: Grid3x3,
  href: "/dsa?topic=pre-dsa-11-nested-variations",
  content: {
    title: "11 · Nested loop variations — j=i, j=i+1, j<i, j<n-i & pair comparisons",
    description:
      "Where the inner loop starts and stops decides which pairs you visit. Five shapes cover almost every pair problem.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "Four friends at a party each shake hands with every other friend exactly once. How do you make sure nobody shakes hands twice, and nobody shakes their own hand? Each person only shakes hands with the people standing after them in the line. In code, that is the inner loop starting at j = i + 1. Changing where j starts (0, i, i + 1) or where it stops (n, i, n - i) changes the shape of what you visit: a full square, a triangle with or without the diagonal, or rows that get shorter each time.",
        code: `const friends = ["Ana", "Ben", "Cal", "Dev"];
let handshakes = 0;
for (let i = 0; i < friends.length; i++) {
  // only shake hands with people AFTER me in the line
  for (let j = i + 1; j < friends.length; j++) {
    handshakes++;
  }
}
console.log(handshakes); // 6`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "The five shapes for n = 4. A star means 'this (i, j) pair is visited'. Rows are i, columns are j.",
        code: `// j from 0       j = i          j = i + 1      j < i          j < n - i
// * * * *        * * * *        . * * *        . . . .        * * * *
// * * * *        . * * *        . . * *        * . . .        * * * .
// * * * *        . . * *        . . . *        * * . .        * * . .
// * * * *        . . . *        . . . .        * * * .        * . . .
// all pairs      pairs + self   unique pairs   pairs before   shrinking rows
// n * n = 16     10             6              6              4+3+2+1 = 10

const n = 4;
let full = 0, withSelf = 0, unique = 0, before = 0, shrinking = 0;
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) full++;           // every (i, j)
  for (let j = i; j < n; j++) withSelf++;       // includes (i, i)
  for (let j = i + 1; j < n; j++) unique++;     // each pair once, never yourself
  for (let j = 0; j < i; j++) before++;         // only items before i
  for (let j = 0; j < n - i; j++) shrinking++;  // bubble-sort shape
}
console.log(full, withSelf, unique, before, shrinking); // 16 10 6 6 10`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "Pair comparison: how many pairs add up to 5? With j = i + 1 every pair is checked exactly once.",
        code: `const arr = [1, 2, 3, 4];
const target = 5;
let count = 0;
for (let i = 0; i < arr.length; i++) {
  for (let j = i + 1; j < arr.length; j++) {
    if (arr[i] + arr[j] === target) count++;
  }
}
console.log(count); // 2

// i | j | arr[i] + arr[j] | === 5? | count
// 0 | 1 | 1 + 2 = 3       | no     | 0
// 0 | 2 | 1 + 3 = 4       | no     | 0
// 0 | 3 | 1 + 4 = 5       | yes    | 1
// 1 | 2 | 2 + 3 = 5       | yes    | 2
// 1 | 3 | 2 + 4 = 6       | no     | 2
// 2 | 3 | 3 + 4 = 7       | no     | 2
// 3 | - | j = 4, 4 < 4 is false, inner loop does not run
// output 2   (6 pairs checked = 4 * 3 / 2)`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "Starting j at the wrong place double-counts; stopping it one too late reads past the end.",
        code: `const arr = [1, 2, 3, 4];

// 1. j = 0 for "pairs" counts every pair twice (and pairs with itself)
let wrong = 0;
for (let i = 0; i < arr.length; i++) {
  for (let j = 0; j < arr.length; j++) {
    if (arr[i] + arr[j] === 5) wrong++;
  }
}
console.log(wrong); // 4   ((1,4) and (4,1) both counted; RIGHT answer is 2)

// 2. Bubble sort: j < n - i reads arr[j + 1] past the end
let pastEnd = 0;
for (let i = 0; i < arr.length; i++) {
  for (let j = 0; j < arr.length - i; j++) {
    if (arr[j + 1] === undefined) pastEnd++;
  }
}
console.log(pastEnd); // 1   (use j < n - i - 1 and this becomes 0)

// 3. Typing i++ in the inner loop -> infinite loop (do not run)
// for (let j = 0; j < n; i++) {}

// 4. j < i vs j > i: decide if you want items BEFORE i or AFTER i
const beforeTwo = [];
for (let j = 0; j < 2; j++) beforeTwo.push(arr[j]);
console.log(beforeTwo); // [1, 2]   (items before index 2)`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "For each one, decide which shape you need before you write the inner loop.",
        code: `// 1. How many unique pairs can n people make?
function uniquePairs(n) {
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) count++;
  }
  return count;
}
console.log(uniquePairs(5)); // 10

// 2. Two Sum (brute force): indexes of two numbers that add to target
function twoSum(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] + arr[j] === target) return [i, j];
    }
  }
  return [];
}
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]

// 3. Count pairs where the earlier number is bigger
function countInversions(arr) {
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) count++;
    }
  }
  return count;
}
console.log(countInversions([3, 1, 2])); // 2

// 4. Number triangle using j <= i
function numberTriangle(n) {
  const lines = [];
  for (let i = 1; i <= n; i++) {
    let line = "";
    for (let j = 1; j <= i; j++) line += j;
    lines.push(line);
  }
  return lines;
}
console.log(numberTriangle(4)); // ["1", "12", "123", "1234"]

// 5. Bubble sort: the j < n - i - 1 shape
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}
console.log(bubbleSort([5, 1, 4, 2])); // [1, 2, 4, 5]`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `// Q1
let c1 = 0;
for (let i = 0; i < 5; i++) {
  for (let j = i + 1; j < 5; j++) c1++;
}
console.log(c1);

// Q2
const a = [1, 2, 3];
for (let i = 0; i < a.length; i++) {
  for (let j = 0; j < i; j++) console.log(a[j], a[i]);
}

// Q3
let c3 = 0;
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4 - i - 1; j++) c3++;
}
console.log(c3);

// Answers:
// Q1 -> 10                 (4 + 3 + 2 + 1)
// Q2 -> 1 2, 1 3, 2 3
// Q3 -> 6                  (3 + 2 + 1 + 0)`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 12 · Accumulator patterns
// ---------------------------------------------------------------------------
const t12: DSATopic = {
  id: "pre-dsa-12-accumulators",
  label: "12 · Accumulators",
  icon: Sigma,
  href: "/dsa?topic=pre-dsa-12-accumulators",
  content: {
    title: "12 · Accumulator patterns — sum, product, count, min, max & frequency",
    description:
      "Start with an empty container, add a little on every round, and read the answer at the end. Six starting values to remember.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "A piggy bank starts empty. Every day you drop a coin in. At the end you open it and read the total. That is an accumulator: a variable created before the loop, updated inside the loop, and read after the loop. The only thing to think about is the starting value. Adding starts at 0. Multiplying starts at 1 (starting at 0 would make everything 0). Counting starts at 0. The smallest so far starts at Infinity, so the first real number always beats it. The biggest so far starts at -Infinity. A frequency count starts as an empty object {} that remembers 'value -> how many times'.",
        code: `const coins = [5, 10, 2];
let bank = 0;                  // the empty piggy bank
for (let i = 0; i < coins.length; i++) {
  bank += coins[i];            // drop in one coin per round
}
console.log(bank); // 17`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "All six accumulators in one loop. Memorise the starting values in the comments.",
        code: `const nums = [3, 1, 4, 1, 5];

let sum = 0;          // adding: start at 0
let product = 1;      // multiplying: start at 1
let oddCount = 0;     // counting: start at 0
let min = Infinity;   // every number is smaller than Infinity
let max = -Infinity;  // every number is bigger than -Infinity
const freq = {};      // value -> how many times seen

for (let i = 0; i < nums.length; i++) {
  const x = nums[i];
  sum += x;
  product *= x;
  if (x % 2 === 1) oddCount++;
  if (x < min) min = x;
  if (x > max) max = x;
  freq[x] = (freq[x] || 0) + 1;   // first time: (undefined || 0) + 1 = 1
}

console.log(sum, product, oddCount, min, max); // 14 60 4 1 5
console.log(freq); // { "1": 2, "3": 1, "4": 1, "5": 1 }`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "Finding the biggest score and where it is. Using > (not >=) keeps the first position when there is a tie.",
        code: `const scores = [4, 9, 2, 9, 7];
let best = -Infinity;
let bestIndex = -1;
for (let i = 0; i < scores.length; i++) {
  if (scores[i] > best) {
    best = scores[i];
    bestIndex = i;
  }
}
console.log(best, bestIndex); // 9 1

// iteration | i | scores[i] | > best?        | best | bestIndex
// start     | - |  -        |  -             | -Inf | -1
// 1         | 0 | 4         | 4 > -Inf yes   | 4    | 0
// 2         | 1 | 9         | 9 > 4 yes      | 9    | 1
// 3         | 2 | 2         | 2 > 9 no       | 9    | 1
// 4         | 3 | 9         | 9 > 9 no (tie) | 9    | 1
// 5         | 4 | 7         | 7 > 9 no       | 9    | 1
// output 9 1`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "Wrong starting values and accumulators in the wrong place give answers that look reasonable but are wrong.",
        code: `const nums = [2, 3, 4];

// 1. Product starting at 0
let p = 0;
for (const x of nums) p *= x;
console.log(p); // 0   (start at 1 instead)

// 2. Max starting at 0 fails when every number is negative
const neg = [-5, -2, -9];
let maxWrong = 0;
let maxRight = -Infinity;
for (const x of neg) {
  if (x > maxWrong) maxWrong = x;
  if (x > maxRight) maxRight = x;
}
console.log(maxWrong, maxRight); // 0 -2

// 3. Resetting the accumulator INSIDE the loop
let sumWrong = 0;
for (const x of nums) {
  sumWrong = 0;        // wipes the total every round
  sumWrong += x;
}
console.log(sumWrong); // 4   (only the last item)

// 4. freq[x]++ on a value never seen before
const f = {};
f["a"]++;
console.log(f["a"]); // NaN   (undefined + 1)
const g = {};
g["a"] = (g["a"] || 0) + 1;
console.log(g["a"]); // 1

// 5. Returning inside the loop stops after the first item
function total(arr) {
  let s = 0;
  for (const x of arr) {
    s += x;
    // return s;   <- WRONG here, it would return 2
  }
  return s;        // RIGHT: after the loop
}
console.log(total(nums)); // 9`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Pick the right accumulator and starting value for each.",
        code: `// 1. Average
function average(arr) {
  let sum = 0;
  for (const x of arr) sum += x;
  return sum / arr.length;
}
console.log(average([2, 4, 9])); // 5

// 2. Count the vowels
function countVowels(s) {
  let count = 0;
  for (const ch of s) {
    if ("aeiou".includes(ch)) count++;
  }
  return count;
}
console.log(countVowels("education")); // 5

// 3. Range = biggest - smallest
function range(arr) {
  let min = Infinity;
  let max = -Infinity;
  for (const x of arr) {
    if (x < min) min = x;
    if (x > max) max = x;
  }
  return max - min;
}
console.log(range([7, 2, 9, 4])); // 7

// 4. Most frequent value
function mostFrequent(arr) {
  const freq = {};
  let best = null;
  let bestCount = 0;
  for (const x of arr) {
    freq[x] = (freq[x] || 0) + 1;
    if (freq[x] > bestCount) {
      bestCount = freq[x];
      best = x;
    }
  }
  return best;
}
console.log(mostFrequent([2, 3, 2, 5, 3, 2])); // 2

// 5. Second largest distinct value (two accumulators)
function secondLargest(arr) {
  let first = -Infinity;
  let second = -Infinity;
  for (const x of arr) {
    if (x > first) {
      second = first;   // old best drops to second place
      first = x;
    } else if (x < first && x > second) {
      second = x;
    }
  }
  return second;
}
console.log(secondLargest([5, 8, 3, 8, 6])); // 6`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `// Q1
let p = 1;
for (let i = 1; i <= 4; i++) p *= i;
console.log(p);

// Q2
let m = Infinity;
for (const x of [4, -1, 7]) {
  if (x < m) m = x;
}
console.log(m);

// Q3
const f = {};
for (const ch of "abca") f[ch] = (f[ch] || 0) + 1;
console.log(f.a, f.b, f.z);

// Answers:
// Q1 -> 24               (1 * 2 * 3 * 4)
// Q2 -> -1
// Q3 -> 2 1 undefined    (z was never counted)`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 13 · Variable manipulation
// ---------------------------------------------------------------------------
const t13: DSATopic = {
  id: "pre-dsa-13-variable-manipulation",
  label: "13 · Swap, track, prev/curr",
  icon: ArrowUpDown,
  href: "/dsa?topic=pre-dsa-13-variable-manipulation",
  content: {
    title: "13 · Variable manipulation — swapping, tracking, previous/current & multiple variables",
    description:
      "Swap two values safely, remember what you saw last round, and juggle several variables that each have one job.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "You have juice in cup A and milk in cup B and want to swap them. You cannot pour A into B, it is full. You need a third, empty cup: pour A into the empty cup, B into A, then the empty cup into B. That third cup is the temp variable. Tracking means keeping notes while you walk through data, such as 'best so far' or 'where I saw it'. Previous/current means remembering the last thing you saw so you can compare it with the thing you see now, then moving 'now' into 'last' before the next round. When you use several variables, give each one a single clear job and a clear name.",
        code: `let cupA = "juice";
let cupB = "milk";

const emptyCup = cupA; // pour A into the empty cup
cupA = cupB;           // pour B into A
cupB = emptyCup;       // pour the empty cup into B

console.log(cupA, cupB); // milk juice`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "Two ways to swap, how to swap array items, and the previous/current loop. The line 'prev = curr' at the end of the loop is what moves you forward.",
        code: `// 1. Swap with a temp variable
let a = 1;
let b = 2;
const temp = a;
a = b;
b = temp;
console.log(a, b); // 2 1

// 2. Swap with destructuring (same result, one line)
[a, b] = [b, a];
console.log(a, b); // 1 2

// 3. Swap two items in an array
const arr = [10, 20, 30];
[arr[0], arr[2]] = [arr[2], arr[0]];
console.log(arr); // [30, 20, 10]

// 4. Previous / current
const temps = [20, 22, 21, 25];
let prev = temps[0];
for (let i = 1; i < temps.length; i++) {
  const curr = temps[i];
  console.log(prev, "->", curr, curr > prev ? "warmer" : "cooler"); // 20 -> 22 warmer, 22 -> 21 cooler, 21 -> 25 warmer
  prev = curr; // today becomes yesterday for the next round
}`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "Fibonacci: every number is the sum of the two before it. Two variables (prev and curr) slide forward together. Compute next first, then shift.",
        code: `let prev = 0;
let curr = 1;
const fib = [prev, curr];
for (let i = 2; i < 7; i++) {
  const next = prev + curr;
  fib.push(next);
  prev = curr;
  curr = next;
}
console.log(fib); // [0, 1, 1, 2, 3, 5, 8]

// iteration | i | next = prev + curr | prev | curr | fib
// start     | - |  -                 | 0    | 1    | [0, 1]
// 1         | 2 | 0 + 1 = 1          | 1    | 1    | [0, 1, 1]
// 2         | 3 | 1 + 1 = 2          | 1    | 2    | [0, 1, 1, 2]
// 3         | 4 | 1 + 2 = 3          | 2    | 3    | [0, 1, 1, 2, 3]
// 4         | 5 | 2 + 3 = 5          | 3    | 5    | [0, 1, 1, 2, 3, 5]
// 5         | 6 | 3 + 5 = 8          | 5    | 8    | [0, 1, 1, 2, 3, 5, 8]
// stop      | 7 | 7 < 7 is false     |      |      | output`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "Losing a value by overwriting it too early is the root of every mistake here.",
        code: `// 1. Swapping without a temp loses one value
let a = 1;
let b = 2;
a = b;   // a is 2, the 1 is gone
b = a;   // b is 2 as well
console.log(a, b); // 2 2

// 2. Shifting prev before using it
let p = 0, c = 1;
for (let i = 0; i < 4; i++) {
  p = c;        // old p is lost
  c = p + c;    // so this just doubles c
}
let p2 = 0, c2 = 1;
for (let i = 0; i < 4; i++) {
  const next = p2 + c2; // RIGHT: compute first
  p2 = c2;
  c2 = next;
}
console.log(c, c2); // 16 5

// 3. A destructuring swap right after a line with no semicolon
// let x = 1
// let y = 2
// [x, y] = [y, x]   -> read as "2[x, y] = ...", crashes. End the line before with ;

// 4. Mixing up the best VALUE and the best INDEX
const scores = [40, 90, 70];
let wrongIdx = 0;
let bestIdx = 0;
for (let i = 1; i < scores.length; i++) {
  if (scores[i] > wrongIdx) wrongIdx = i;          // compares a score with an index!
  if (scores[i] > scores[bestIdx]) bestIdx = i;    // compares score with score
}
console.log(wrongIdx, bestIdx); // 2 1`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Swap, compare with the previous item, and keep several trackers in one pass.",
        code: `// 1. Swap the first and last items in place
function swapEnds(arr) {
  const last = arr.length - 1;
  const temp = arr[0];
  arr[0] = arr[last];
  arr[last] = temp;
  return arr;
}
console.log(swapEnds([1, 2, 3, 4])); // [4, 2, 3, 1]

// 2. How many times does the value change from one item to the next?
function countChanges(arr) {
  let changes = 0;
  let prev = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== prev) changes++;
    prev = arr[i];
  }
  return changes;
}
console.log(countChanges([1, 1, 2, 2, 2, 3, 1])); // 3

// 3. Longest run of equal values in a row
function longestRun(arr) {
  let best = 1;
  let run = 1;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === arr[i - 1]) run++;
    else run = 1;
    if (run > best) best = run;
  }
  return best;
}
console.log(longestRun([1, 1, 2, 2, 2, 3, 1])); // 3

// 4. n-th Fibonacci number (fib(0) = 0, fib(1) = 1)
function fib(n) {
  let prev = 0;
  let curr = 1;
  for (let i = 0; i < n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }
  return prev;
}
console.log(fib(10)); // 55

// 5. Smallest and biggest in a single pass
function minMax(arr) {
  let min = arr[0];
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) min = arr[i];
    if (arr[i] > max) max = arr[i];
  }
  return [min, max];
}
console.log(minMax([4, -2, 9, 0])); // [-2, 9]`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `// Q1
let x = 5;
let y = 8;
x = y;
y = x;
console.log(x, y);

// Q2
let a = 1, b = 2, c = 3;
[a, b, c] = [c, a, b];
console.log(a, b, c);

// Q3
let prev = null;
let groups = 0;
for (const v of [3, 3, 4, 4, 4, 5]) {
  if (v !== prev) groups++;
  prev = v;
}
console.log(groups);

// Answers:
// Q1 -> 8 8     (no temp, the 5 is lost)
// Q2 -> 3 1 2
// Q3 -> 3       (groups: 3s, 4s, 5)`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 14 · Dry running
// ---------------------------------------------------------------------------
const t14: DSATopic = {
  id: "pre-dsa-14-dry-running",
  label: "14 · Dry running",
  icon: ClipboardList,
  href: "/dsa?topic=pre-dsa-14-dry-running",
  content: {
    title: "14 · Dry running — iteration tables, tracing, debugging & output prediction",
    description:
      "Pretend to be the computer with a pencil and a table. It is the single most useful skill for reading, writing and fixing loops.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "A dry run means running the code in your head (or on paper) without a computer. You draw a table: one column for every variable that changes, one for the condition, one for the output, and one row for every round of the loop. Then you go line by line and fill in the boxes. The computer never guesses and never skips a line, so you must not either. Tracing is the same thing, but you let the program print the table for you with console.log. Debugging is comparing what the table says should happen with what actually happens, to find the first row where they disagree.",
        code: `let total = 0;
for (let i = 1; i <= 3; i++) {
  total += i * i;
}
console.log(total); // 14

// Cover this table, fill it in yourself, then compare:
// iteration | i | i <= 3 | i * i | total
// 1         | 1 | true   | 1     | 1
// 2         | 2 | true   | 4     | 5
// 3         | 3 | true   | 9     | 14
// stop      | 4 | false  |  -    | output 14`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "The five-step method, and how to make the program print its own trace.",
        code: `// HOW TO DRY RUN
// 1. One column for every variable that changes, plus condition and output.
// 2. Write the starting values in the first row.
// 3. Check the condition. False? Stop and write the output.
// 4. Run the body one line at a time. Change ONLY the cells that change.
// 5. Run the update (i++), start a new row, go back to step 3.

// TRACING: let the computer print your table
let a = 10;
for (let i = 0; i < 3; i++) {
  a = a - i;
  console.log("i =", i, "a =", a); // i = 0 a = 10, i = 1 a = 9, i = 2 a = 7
}
console.log("final", a); // final 7`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "A loop with an if-else inside. Then a real debugging session: the table shows exactly which value was never added.",
        code: `let a = 1;
let b = 0;
for (let i = 0; i < 4; i++) {
  if (i % 2 === 0) a = a * 2;
  else b = b + a;
}
console.log(a, b); // 4 6

// iteration | i | i < 4 | i % 2 === 0 | a | b
// 1         | 0 | true  | true        | 2 | 0
// 2         | 1 | true  | false       | 2 | 2
// 3         | 2 | true  | true        | 4 | 2
// 4         | 3 | true  | false       | 4 | 6
// stop      | 4 | false |  -          | output 4 6

// DEBUGGING: average of [4, 4, 4] should be 4
function averageBuggy(arr) {
  let sum = 0;
  for (let i = 1; i < arr.length; i++) sum += arr[i];
  return sum / arr.length;
}
console.log(averageBuggy([4, 4, 4])); // 2.6666666666666665
// Table: i = 1 -> sum 4, i = 2 -> sum 8, stop. 8 / 3 is not 4.
// arr[0] never appears in the table: the loop starts at 1. Fix: i = 0.
function average(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  return sum / arr.length;
}
console.log(average([4, 4, 4])); // 4`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "These are mistakes people make while dry running, not while coding.",
        code: `// 1. Forgetting the last, failed check: i ends one PAST the last round
let i;
for (i = 0; i < 3; i++) {}
console.log(i); // 3

// 2. Using an old value: each line sees what the line before it wrote
let x = 1;
let y = 0;
x = x + 1;
y = x * 2; // uses the NEW x (2), not the old one
console.log(x, y); // 2 4

// 3. Not resetting the inner variable in your table for every outer round
for (let r = 0; r < 2; r++) {
  let s = 0; // back to 0 on every outer round
  for (let j = 0; j < 3; j++) s += j;
  console.log(s); // 3, 3
}

// 4. Guessing a pattern after two rows instead of tracing every row
let v = 1;
const seen = [];
for (let k = 0; k < 5; k++) {
  v = v * 2 - 1 + k;
  seen.push(v);
}
console.log(seen); // [1, 2, 5, 12, 27]   (looked like "stays 1" after one row)

// 5. Only tracing the happy case: also trace empty input
function average(arr) {
  let sum = 0;
  for (let n = 0; n < arr.length; n++) sum += arr[n];
  return sum / arr.length;
}
console.log(average([])); // NaN   (0 / 0)`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Five mystery functions. Do NOT run them first: draw the table, predict the output, then run them (or step through them in the JS Visualizer) to check.",
        code: `// 1.
function mystery1(n) {
  let r = 0;
  for (let i = 1; i <= n; i++) {
    if (i % 2 === 1) r += i;
  }
  return r;
}
console.log(mystery1(5)); // 9

// 2.
function mystery2(s) {
  let out = "";
  for (let i = 0; i < s.length; i++) out = s[i] + out;
  return out;
}
console.log(mystery2("abc")); // cba

// 3.
function mystery3(n) {
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) {
    const t = a + b;
    a = b;
    b = t;
  }
  return a;
}
console.log(mystery3(4)); // 3

// 4.
function mystery4(arr) {
  let best = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > arr[best]) best = i;
  }
  return best;
}
console.log(mystery4([3, 8, 1, 9, 4])); // 3

// 5.
function mystery5(n) {
  let s = "";
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) s += i;
    s += "|";
  }
  return s;
}
console.log(mystery5(3)); // 1|22|333|`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output with a table, then run it. Answers are at the bottom.",
        code: `// Q1
let x = 0;
for (let i = 0; i < 3; i++) {
  x += i;
  i++;
}
console.log(x);

// Q2
let n = 10;
let steps = 0;
while (n > 1) {
  n = n % 2 === 0 ? n / 2 : n - 1;
  steps++;
}
console.log(steps);

// Q3
const a = [1, 2, 3];
for (let i = 0; i < a.length; i++) a[i] = a[i] * a.length;
console.log(a);

// Answers:
// Q1 -> 2           (i = 0: x = 0; i becomes 2: x = 2; i becomes 4: stop)
// Q2 -> 4           (10 -> 5 -> 4 -> 2 -> 1)
// Q3 -> [3, 6, 9]`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 15 · Array traversal
// ---------------------------------------------------------------------------
const t15: DSATopic = {
  id: "pre-dsa-15-array-traversal",
  label: "15 · Array traversal",
  icon: List,
  href: "/dsa?topic=pre-dsa-15-array-traversal",
  content: {
    title: "15 · Array traversal — searching, filtering, modifying & in-place operations",
    description:
      "Visit every item of an array to find something, keep some items, change items, or rearrange the array without making a new one.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "An array is a bookshelf with numbered spots: 0, 1, 2 and so on. Traversal means visiting the spots one by one. Searching is looking at each book until you find the one you want. Filtering is taking only the books you want and putting them on a new shelf. Modifying is putting a sticker on every book. In-place means changing or rearranging the books on the same shelf without using a second shelf, which saves space (DSA problems often ask for this).",
        code: `const shelf = ["maths", "story", "comics", "science"];
for (let i = 0; i < shelf.length; i++) {
  if (shelf[i] === "comics") {
    console.log("found comics at spot", i); // found comics at spot 2
  }
}`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "Four templates. Search returns as soon as it finds; filter and modify build a new array; in-place writes back into the same array.",
        code: `const arr = [4, -2, 7, 0, -5];

// SEARCH: index of the first match, or -1
function indexOf(list, target) {
  for (let i = 0; i < list.length; i++) {
    if (list[i] === target) return i;
  }
  return -1;
}
console.log(indexOf(arr, 7)); // 2

// FILTER: keep some items, in a NEW array
const positives = [];
for (let i = 0; i < arr.length; i++) {
  if (arr[i] > 0) positives.push(arr[i]);
}
console.log(positives); // [4, 7]

// MODIFY: change every item, in a NEW array
const doubled = [];
for (let i = 0; i < arr.length; i++) doubled.push(arr[i] * 2);
console.log(doubled); // [8, -4, 14, 0, -10]

// IN-PLACE: write back into the SAME array, no extra array
for (let i = 0; i < arr.length; i++) {
  if (arr[i] < 0) arr[i] = 0;
}
console.log(arr); // [4, 0, 7, 0, 0]`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "Linear search stops early once it finds the target. Then an in-place change: the array itself is the only thing that changes.",
        code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}
console.log(linearSearch([4, 2, 7, 1], 7)); // 2

// iteration | i | i < 4 | arr[i] | === 7? | action
// 1         | 0 | true  | 4      | no     | keep going
// 2         | 1 | true  | 2      | no     | keep going
// 3         | 2 | true  | 7      | yes    | return 2  (index 3 never visited)

const nums = [3, -1, -4, 2];
for (let i = 0; i < nums.length; i++) {
  if (nums[i] < 0) nums[i] = 0;
}
console.log(nums); // [3, 0, 0, 2]

// iteration | i | nums[i] | < 0? | nums after
// 1         | 0 | 3       | no   | [3, -1, -4, 2]
// 2         | 1 | -1      | yes  | [3, 0, -4, 2]
// 3         | 2 | -4      | yes  | [3, 0, 0, 2]
// 4         | 3 | 2       | no   | [3, 0, 0, 2]`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "Removing while walking forward skips items, for...in gives text keys, and filter does not change the original.",
        code: `// 1. Removing items while walking forward skips the next item
const a = [2, 4, 5, 6];
for (let i = 0; i < a.length; i++) {
  if (a[i] % 2 === 0) a.splice(i, 1); // everything shifts left, i++ jumps over one
}
console.log(a); // [4, 5]   (4 was skipped)
const b = [2, 4, 5, 6];
for (let i = b.length - 1; i >= 0; i--) {   // RIGHT: walk backward
  if (b[i] % 2 === 0) b.splice(i, 1);
}
console.log(b); // [5]

// 2. for...in on an array gives the indexes as TEXT
for (const k in [7, 8]) console.log(typeof k); // string string
// use for (let i = 0; ...) or for (const v of arr) instead

// 3. filter makes a new array; forgetting to keep it does nothing
const nums = [1, 2, 3];
nums.filter((x) => x > 1);           // result thrown away
console.log(nums); // [1, 2, 3]
const big = nums.filter((x) => x > 1);
console.log(big); // [2, 3]

// 4. Changing an array inside a function changes the caller's array too
function doubleAll(list) {
  for (let i = 0; i < list.length; i++) list[i] *= 2;
  return list;
}
const mine = [1, 2];
doubleAll(mine);
console.log(mine); // [2, 4]   (copy first with list.slice() if that is not wanted)`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Search, filter, and two in-place operations. Do the in-place ones without creating a second array.",
        code: `// 1. Index of the biggest value (first one if tied)
function indexOfMax(arr) {
  let best = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > arr[best]) best = i;
  }
  return best;
}
console.log(indexOfMax([3, 9, 4, 9])); // 1

// 2. How many items are above the average? (two passes)
function countAboveAverage(arr) {
  let sum = 0;
  for (const x of arr) sum += x;
  const avg = sum / arr.length;
  let count = 0;
  for (const x of arr) {
    if (x > avg) count++;
  }
  return count;
}
console.log(countAboveAverage([1, 2, 3, 4, 10])); // 1

// 3. Keep only the even numbers
function filterEvens(arr) {
  const out = [];
  for (const x of arr) {
    if (x % 2 === 0) out.push(x);
  }
  return out;
}
console.log(filterEvens([5, 2, 8, 3, 6])); // [2, 8, 6]

// 4. Reverse in place: swap item i with its mirror n - 1 - i, up to the middle
function reverseInPlace(arr) {
  const n = arr.length;
  for (let i = 0; i < Math.floor(n / 2); i++) {
    const temp = arr[i];
    arr[i] = arr[n - 1 - i];
    arr[n - 1 - i] = temp;
  }
  return arr;
}
console.log(reverseInPlace([1, 2, 3, 4, 5])); // [5, 4, 3, 2, 1]

// 5. Rotate right by one in place: [1, 2, 3, 4] -> [4, 1, 2, 3]
function rotateRight(arr) {
  const last = arr[arr.length - 1];
  for (let i = arr.length - 1; i > 0; i--) {
    arr[i] = arr[i - 1];   // shift right, walking backward so nothing is overwritten
  }
  arr[0] = last;
  return arr;
}
console.log(rotateRight([1, 2, 3, 4])); // [4, 1, 2, 3]`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `// Q1
const a = [5, 1, 5, 2];
let c = 0;
for (const x of a) {
  if (x === 5) c++;
}
console.log(c);

// Q2
const b = [1, 2, 3];
for (let i = 0; i < b.length; i++) b[i] += i;
console.log(b);

// Q3
const d = [3, 8, 2];
let pos = -1;
for (let i = 0; i < d.length; i++) {
  if (d[i] > 5) {
    pos = i;
    break;
  }
}
console.log(pos);

// Answers:
// Q1 -> 2
// Q2 -> [1, 3, 5]
// Q3 -> 1`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 16 · String traversal
// ---------------------------------------------------------------------------
const t16: DSATopic = {
  id: "pre-dsa-16-string-traversal",
  label: "16 · String traversal",
  icon: Type,
  href: "/dsa?topic=pre-dsa-16-string-traversal",
  content: {
    title: "16 · String traversal — character iteration, frequency & string manipulation",
    description:
      "Read a string one character at a time, count its letters, and build new strings from old ones.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "A string is a row of letter tiles glued to a board. You can read any tile by its position, s[0], s[1] and so on, and s.length tells you how many tiles there are, exactly like an array. But the tiles are glued: you cannot swap one out. To 'change' a string you build a brand-new one, tile by tile. Spaces, commas and digits are tiles too. Almost every string problem is one of three moves: walk the characters, count the characters, or build a new string.",
        code: `const name = "Mia";
for (let i = 0; i < name.length; i++) {
  console.log(i, name[i]); // 0 M, 1 i, 2 a
}
console.log(name.length); // 3`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "Index loop, for...of, frequency counting, building a new string, and the helper methods you will use most.",
        code: `const s = "Hello World";

// 1. Index loop: when you need the position
for (let i = 0; i < s.length; i++) {
  // s[i] is the character at position i
}

// 2. for...of: when you only need the characters
let upper = 0;
for (const ch of s) {
  if (ch >= "A" && ch <= "Z") upper++;
}
console.log(upper); // 2

// 3. Frequency: character -> how many times
const freq = {};
for (const ch of "hello") freq[ch] = (freq[ch] || 0) + 1;
console.log(freq); // { h: 1, e: 1, l: 2, o: 1 }

// 4. Build a new string (strings cannot be changed in place)
let shout = "";
for (const ch of "hi there") shout += ch === " " ? "_" : ch.toUpperCase();
console.log(shout); // HI_THERE

// 5. Helpers
console.log(s.toLowerCase(), s.split(" "), "abc".split("")); // hello world ["Hello", "World"] ["a", "b", "c"]`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "Counting one letter, then capitalising the first letter of every word. A character starts a word if it is at position 0 or the character before it is a space.",
        code: `const word = "hello";
let count = 0;
for (let i = 0; i < word.length; i++) {
  if (word[i] === "l") count++;
}
console.log(count); // 2

// iteration | i | word[i] | === "l"? | count
// 1         | 0 | h       | no       | 0
// 2         | 1 | e       | no       | 0
// 3         | 2 | l       | yes      | 1
// 4         | 3 | l       | yes      | 2
// 5         | 4 | o       | no       | 2
// stop      | 5 | (5 < 5 is false)   | output 2

function capitalizeWords(s) {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const startsWord = i === 0 || s[i - 1] === " ";
    out += startsWord ? s[i].toUpperCase() : s[i];
  }
  return out;
}
console.log(capitalizeWords("the big fox")); // The Big Fox

// i | s[i] | s[i-1] | startsWord | out
// 0 | t    |  -     | yes (i=0)  | T
// 1 | h    | t      | no         | Th
// 2 | e    | h      | no         | The
// 3 | " "  | e      | no         | "The "
// 4 | b    | " "    | yes        | "The B"
// ...the same for "ig fox"       | The Big Fox`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "Strings look like arrays but are read-only, case-sensitive, and their digits are text, not numbers.",
        code: `// 1. You cannot change a character in place
let s = "jam";
// s[0] = "J";   -> silently ignored (or an error in strict mode)
s = "J" + s.slice(1); // RIGHT: build a new string
console.log(s); // Jam

// 2. Upper and lower case are different characters
console.log("A" === "a"); // false
console.log("Apple".toLowerCase() === "apple"); // true

// 3. Digits in a string are text: + glues them
let wrong = 0;
let right = 0;
for (const ch of "123") {
  wrong += ch;          // 0 + "1" = "01", then "012", then "0123"
  right += Number(ch);  // 1, 3, 6
}
console.log(wrong, right); // 0123 6

// 4. Spaces and punctuation count as characters
console.log("a b!".length); // 4

// 5. Reading s[i + 1] at the last index gives undefined
const t = "ab";
console.log(t[t.length - 1], t[t.length]); // b undefined`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Walk, count, build. Each exercise uses one or two of those moves.",
        code: `// 1. How many times does ch appear in s?
function countChar(s, ch) {
  let count = 0;
  for (const c of s) {
    if (c === ch) count++;
  }
  return count;
}
console.log(countChar("mississippi", "s")); // 4

// 2. Palindrome: reads the same backward
function isPalindrome(s) {
  let reversed = "";
  for (let i = s.length - 1; i >= 0; i--) reversed += s[i];
  return reversed === s;
}
console.log(isPalindrome("level"), isPalindrome("lever")); // true false

// 3. Count words (any number of spaces between them)
function countWords(s) {
  let count = 0;
  for (let i = 0; i < s.length; i++) {
    const startsWord = s[i] !== " " && (i === 0 || s[i - 1] === " ");
    if (startsWord) count++;
  }
  return count;
}
console.log(countWords("  hi there   friend ")); // 3

// 4. Most frequent character (first one wins a tie)
function mostFrequentChar(s) {
  const freq = {};
  let best = "";
  let bestCount = 0;
  for (const ch of s) {
    freq[ch] = (freq[ch] || 0) + 1;
    if (freq[ch] > bestCount) {
      bestCount = freq[ch];
      best = ch;
    }
  }
  return best;
}
console.log(mostFrequentChar("programming")); // r

// 5. Compress runs: "aaabbc" -> "a3b2c1"
function compress(s) {
  let out = "";
  let run = 1;
  for (let i = 1; i <= s.length; i++) {
    if (s[i] === s[i - 1]) {
      run++;
    } else {
      out += s[i - 1] + run;  // the run ended at i - 1
      run = 1;
    }
  }
  return out;
}
console.log(compress("aaabbc")); // a3b2c1`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `// Q1
console.log("abc"[1], "abc".length);

// Q2
let out = "";
for (const ch of "a1b2") {
  if (ch >= "0" && ch <= "9") out += ch;
}
console.log(out);

// Q3
console.log("Cat" === "cat", "Cat".toLowerCase() === "cat");

// Answers:
// Q1 -> b 3
// Q2 -> 12          (only the digit characters, glued as text)
// Q3 -> false true`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 17 · Two pointers
// ---------------------------------------------------------------------------
const t17: DSATopic = {
  id: "pre-dsa-17-two-pointers",
  label: "17 · Two pointers",
  icon: MoveHorizontal,
  href: "/dsa?topic=pre-dsa-17-two-pointers",
  content: {
    title: "17 · Two pointers — opposite direction, same direction & slow/fast pointers",
    description:
      "Two index variables walking the same data. It turns many 'check every pair' problems into a single pass.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "A pointer here is just a variable holding an index. Two friends sit at the two ends of a bench and walk toward each other, one seat at a time, until they meet in the middle: that is opposite-direction pointers (palindromes, reversing, pair sums in a sorted list). Two friends walk the same way, each at their own speed or each along their own list: that is same-direction pointers (merging two sorted lists). One friend walks and one runs twice as fast: when the runner reaches the end, the walker is in the middle. That is slow/fast pointers, and it also detects loops (topic 19).",
        code: `const bench = ["A", "B", "C", "D", "E"];
let left = 0;
let right = bench.length - 1;
while (left < right) {
  console.log(bench[left], "meets", bench[right]); // A meets E, B meets D
  left++;
  right--;
}
// they stop when they meet at "C" in the middle
console.log(bench[left]); // C`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "One template for each of the three kinds. In every one, each round must move at least one pointer, or the loop never ends.",
        code: `// 1. OPPOSITE DIRECTION: start at both ends, walk toward each other
function isPalindrome(s) {
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}
console.log(isPalindrome("racecar")); // true

// 2. SAME DIRECTION: i walks list a, j walks list b, take the smaller each time
function merge(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) {
      out.push(a[i]);
      i++;
    } else {
      out.push(b[j]);
      j++;
    }
  }
  while (i < a.length) { out.push(a[i]); i++; } // leftovers of a
  while (j < b.length) { out.push(b[j]); j++; } // leftovers of b
  return out;
}
console.log(merge([1, 4, 6], [2, 3, 7])); // [1, 2, 3, 4, 6, 7]

// 3. SLOW / FAST: fast moves 2 for every 1 of slow
function middleIndex(arr) {
  let slow = 0;
  let fast = 0;
  while (fast + 1 < arr.length) {
    slow++;
    fast += 2;
  }
  return slow;
}
console.log(middleIndex([10, 20, 30, 40, 50])); // 2`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "Pair sum in a SORTED array. If the sum is too small, the only way to grow it is to move left up. If it is too big, move right down. Each round throws away one number for good, so it takes at most n rounds instead of checking every pair.",
        code: `function pairSum(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;  // need bigger
    else right--;              // need smaller
  }
  return [];
}
console.log(pairSum([1, 2, 4, 6, 8, 9], 12)); // [2, 4]

// round | left | right | arr[l] + arr[r] | vs 12    | move
// 1     | 0    | 5     | 1 + 9 = 10      | too small| left++
// 2     | 1    | 5     | 2 + 9 = 11      | too small| left++
// 3     | 2    | 5     | 4 + 9 = 13      | too big  | right--
// 4     | 2    | 4     | 4 + 8 = 12      | equal    | return [2, 4]`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "The pair-sum trick needs sorted data, the loop must use < (not <=) for pairs, and every round must move a pointer.",
        code: `function pairValues(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [arr[left], arr[right]];
    if (sum < target) left++;
    else right--;
  }
  return [];
}

// 1. Unsorted input: the "move left or right" logic no longer makes sense
console.log(pairValues([8, 1, 5, 3], 6)); // []        (misses 1 + 5)
console.log(pairValues([1, 3, 5, 8], 6)); // [1, 5]    (sorted first)

// 2. left <= right lets a number pair with itself
const arr = [3, 5];
let l = 0;
let r = 1;
let foundWrong = false;
while (l <= r) {
  if (arr[l] + arr[r] === 6) { foundWrong = true; break; }  // 3 + 3 at l = r = 0
  if (arr[l] + arr[r] < 6) l++;
  else r--;
}
console.log(foundWrong, pairValues(arr, 6)); // true []

// 3. Forgetting to move a pointer -> infinite loop (do not run)
// while (left < right) { if (s[left] !== s[right]) return false; }

// 4. Slow/fast: check fast + 1 before jumping 2, or you read past the end`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Two opposite-direction, two same-direction, and one that fills the answer from the back.",
        code: `// 1. Reverse an array in place
function reverse(arr) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;
    left++;
    right--;
  }
  return arr;
}
console.log(reverse(["a", "b", "c", "d"])); // ["d", "c", "b", "a"]

// 2. Palindrome check
function isPalindrome(s) {
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}
console.log(isPalindrome("noon"), isPalindrome("abca")); // true false

// 3. Indexes of two numbers in a sorted array that add up to target
function pairSum(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return [];
}
console.log(pairSum([1, 3, 4, 6, 9], 7)); // [0, 3]

// 4. Merge two sorted arrays
function merge(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (j >= b.length || (i < a.length && a[i] <= b[j])) {
      out.push(a[i]);
      i++;
    } else {
      out.push(b[j]);
      j++;
    }
  }
  return out;
}
console.log(merge([1, 5, 9], [2, 3, 10, 12])); // [1, 2, 3, 5, 9, 10, 12]

// 5. Squares of a sorted array, still sorted. The biggest square is at one of the ends.
function sortedSquares(arr) {
  const out = new Array(arr.length);
  let left = 0;
  let right = arr.length - 1;
  for (let k = arr.length - 1; k >= 0; k--) {
    const ls = arr[left] * arr[left];
    const rs = arr[right] * arr[right];
    if (ls > rs) {
      out[k] = ls;
      left++;
    } else {
      out[k] = rs;
      right--;
    }
  }
  return out;
}
console.log(sortedSquares([-4, -1, 0, 3, 10])); // [0, 1, 9, 16, 100]`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `// Q1: how many rounds?
let l = 0;
let r = 5;
let rounds = 0;
while (l < r) {
  l++;
  r--;
  rounds++;
}
console.log(rounds);

// Q2
const s = "abcba";
let a = 0;
let b = s.length - 1;
let ok = true;
while (a < b) {
  if (s[a] !== s[b]) ok = false;
  a++;
  b--;
}
console.log(ok);

// Q3
let slow = 0;
let fast = 0;
const n = 7;
while (fast + 1 < n) {
  slow++;
  fast += 2;
}
console.log(slow, fast);

// Answers:
// Q1 -> 3      ((0,5) -> (1,4) -> (2,3) -> (3,2) stops)
// Q2 -> true
// Q3 -> 3 6    (slow lands on the middle of 7 items)`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 18 · Sliding window
// ---------------------------------------------------------------------------
const t18: DSATopic = {
  id: "pre-dsa-18-sliding-window",
  label: "18 · Sliding window",
  icon: Columns3,
  href: "/dsa?topic=pre-dsa-18-sliding-window",
  content: {
    title: "18 · Sliding window — fixed size, variable size, expand & shrink",
    description:
      "Look at a block of neighbouring items, then slide the block along by adding one item and removing one, instead of starting over.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "You sit on a train and your window shows 3 houses at a time. When the train moves one house forward, one house disappears on the left and one appears on the right. You do not need to look at all 3 again: you just forget the one that left and notice the one that came in. That is a fixed-size sliding window. In a variable-size window the window can stretch and shrink: you expand the right edge to take in more, and while the window breaks a rule (too big a sum, a repeated letter) you shrink it from the left. Use it whenever a problem says 'contiguous', 'subarray', 'substring' or 'k in a row'.",
        code: `const houses = [2, 1, 5, 1, 3, 2];

// First view: houses 0, 1, 2
let inView = houses[0] + houses[1] + houses[2];
console.log(inView); // 8

// Train moves one step: house 0 leaves, house 3 enters
inView = inView - houses[0] + houses[3];
console.log(inView); // 7`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "Fixed size: build the first window, then slide with 'add the new one, remove the old one'. Variable size: a for loop moves right (expand), and a while loop inside moves left (shrink) for as long as needed.",
        code: `// FIXED SIZE k: biggest sum of k items in a row
function maxSumK(arr, k) {
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];   // first window
  let best = windowSum;
  for (let right = k; right < arr.length; right++) {
    windowSum += arr[right] - arr[right - k];        // add new, remove old
    if (windowSum > best) best = windowSum;
  }
  return best;
}
console.log(maxSumK([2, 1, 5, 1, 3, 2], 3)); // 9

// VARIABLE SIZE: shortest block whose sum is at least target
function shortestAtLeast(arr, target) {
  let left = 0;
  let sum = 0;
  let best = Infinity;
  for (let right = 0; right < arr.length; right++) {
    sum += arr[right];                 // EXPAND to the right
    while (sum >= target) {            // valid: record it, then try smaller
      best = Math.min(best, right - left + 1);
      sum -= arr[left];                // SHRINK from the left
      left++;
    }
  }
  return best === Infinity ? 0 : best;
}
console.log(shortestAtLeast([2, 1, 5, 2, 3, 2], 7)); // 2`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "First the fixed window from the template, traced. Then a variable window: the longest block with a sum of at most 6. Watch the left edge jump forward when the sum gets too big.",
        code: `function maxSumK(arr, k) {
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  let best = windowSum;
  for (let right = k; right < arr.length; right++) {
    windowSum += arr[right] - arr[right - k];
    if (windowSum > best) best = windowSum;
  }
  return best;
}
console.log(maxSumK([2, 1, 5, 1, 3, 2], 3)); // 9

// step  | right | add | remove | windowSum | window    | best
// build | 0..2  | 2,1,5 |  -   | 8         | [2, 1, 5] | 8
// 1     | 3     | 1   | 2      | 7         | [1, 5, 1] | 8
// 2     | 4     | 3   | 1      | 9         | [5, 1, 3] | 9
// 3     | 5     | 2   | 5      | 6         | [1, 3, 2] | 9

function longestAtMost(arr, limit) {
  let left = 0;
  let sum = 0;
  let best = 0;
  for (let right = 0; right < arr.length; right++) {
    sum += arr[right];
    while (sum > limit) {
      sum -= arr[left];
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
console.log(longestAtMost([3, 1, 2, 4, 1], 6)); // 3

// right | add | sum after add | shrink?               | left | window       | best
// 0     | 3   | 3             | no                    | 0    | [3]          | 1
// 1     | 1   | 4             | no                    | 0    | [3, 1]       | 2
// 2     | 2   | 6             | no                    | 0    | [3, 1, 2]    | 3
// 3     | 4   | 10            | -3 -> 7, -1 -> 6      | 2    | [2, 4]       | 3
// 4     | 1   | 7             | -2 -> 5               | 3    | [4, 1]       | 3`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "Recounting every window, removing the wrong item, and shrinking only once.",
        code: `const arr = [2, 1, 5, 1, 3, 2];

// 1. Recounting the whole window every time does k times more work
let slowWork = 0;
for (let start = 0; start + 3 <= arr.length; start++) {
  for (let i = start; i < start + 3; i++) slowWork++;
}
console.log(slowWork); // 12   (sliding needs only 6: 3 to build + 3 slides)

// 2. Removing the wrong item: the one leaving is arr[right - k]
let sum = arr[0] + arr[1] + arr[2];
let best = sum;
for (let right = 3; right < arr.length; right++) {
  sum += arr[right] - arr[right - 3 + 1]; // WRONG index
  if (sum > best) best = sum;
}
console.log(best); // 8   (the right answer is 9)

// 3. Shrinking with if instead of while
function shortestIf(a, target) {
  let left = 0, s = 0, b = Infinity;
  for (let right = 0; right < a.length; right++) {
    s += a[right];
    if (s >= target) {          // shrinks only one step per round
      b = Math.min(b, right - left + 1);
      s -= a[left];
      left++;
    }
  }
  return b;
}
console.log(shortestIf([2, 1, 5, 2, 3, 2], 7)); // 3   (the right answer is 2)

// 4. Window bigger than the array: the first window reads undefined
let first = 0;
for (let i = 0; i < 4; i++) first += [1, 2][i];
console.log(first); // NaN   (check k <= arr.length first)`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Three fixed windows, then two variable ones. For the variable ones, ask: what makes the window invalid, and how do I shrink it?",
        code: `// 1. Average of every window of size k
function windowAverages(arr, k) {
  const out = [];
  let sum = 0;
  for (let right = 0; right < arr.length; right++) {
    sum += arr[right];
    if (right >= k) sum -= arr[right - k];
    if (right >= k - 1) out.push(sum / k);
  }
  return out;
}
console.log(windowAverages([1, 3, 2, 6, -1], 2)); // [2, 2.5, 4, 2.5]

// 2. Biggest sum of k items in a row
function maxSumK(arr, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += arr[i];
  let best = sum;
  for (let right = k; right < arr.length; right++) {
    sum += arr[right] - arr[right - k];
    best = Math.max(best, sum);
  }
  return best;
}
console.log(maxSumK([4, 2, 1, 7, 8, 1, 2, 8, 1, 0], 3)); // 16

// 3. How many windows of size k have a sum of at least min?
function countWindows(arr, k, min) {
  let sum = 0;
  let count = 0;
  for (let right = 0; right < arr.length; right++) {
    sum += arr[right];
    if (right >= k) sum -= arr[right - k];
    if (right >= k - 1 && sum >= min) count++;
  }
  return count;
}
console.log(countWindows([1, 2, 3, 4, 5], 3, 9)); // 2

// 4. Longest substring with no repeated letter
function longestUnique(s) {
  const inWindow = new Set();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    while (inWindow.has(s[right])) {   // repeat: shrink until it is gone
      inWindow.delete(s[left]);
      left++;
    }
    inWindow.add(s[right]);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
console.log(longestUnique("abcabcbb")); // 3

// 5. Shortest block with sum at least target (0 if none)
function shortestAtLeast(arr, target) {
  let left = 0;
  let sum = 0;
  let best = Infinity;
  for (let right = 0; right < arr.length; right++) {
    sum += arr[right];
    while (sum >= target) {
      best = Math.min(best, right - left + 1);
      sum -= arr[left];
      left++;
    }
  }
  return best === Infinity ? 0 : best;
}
console.log(shortestAtLeast([2, 3, 1, 2, 4, 3], 7)); // 2`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `// Q1
const a = [1, 2, 3, 4];
const sums = [];
let s = a[0] + a[1];
sums.push(s);
for (let right = 2; right < a.length; right++) {
  s += a[right] - a[right - 2];
  sums.push(s);
}
console.log(sums);

// Q2
const b = [5, 1, 1, 5];
let w = b[0] + b[1];
w += b[2] - b[0];
console.log(w);

// Q3: how many windows of size 3 fit in 7 items?
let windows = 0;
for (let right = 2; right < 7; right++) windows++;
console.log(windows);

// Answers:
// Q1 -> [3, 5, 7]
// Q2 -> 2     (window moved from [5, 1] to [1, 1])
// Q3 -> 5     (7 - 3 + 1)`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 19 · Other DSA patterns
// ---------------------------------------------------------------------------
const t19: DSATopic = {
  id: "pre-dsa-19-other-patterns",
  label: "19 · Prefix, Map, Set, Floyd",
  icon: Wrench,
  href: "/dsa?topic=pre-dsa-19-other-patterns",
  content: {
    title: "19 · Other DSA patterns — prefix/suffix sum, read/write pointers, HashMap, HashSet & Floyd's cycle detection",
    description:
      "Five small tools that show up in a huge number of array problems. Each one is a loop you already know plus one clever idea.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "Prefix sum: a receipt that shows a running total after every item. To know what you spent between item 2 and item 4 you subtract two running totals instead of adding again. Suffix sum is the same, from the back. Read/write pointers: a conveyor belt where one hand reads every item and the other hand only puts down the items you keep, so the array is cleaned in place. HashMap (Map in JavaScript): a phone's contact list, name -> number, found instantly without searching. HashSet (Set): a guest list that only answers 'is this name on it?', instantly. Floyd's cycle detection: a tortoise and a hare on a track. If the track loops, the faster hare eventually laps the tortoise and they meet. If it does not loop, the hare simply reaches the end.",
        code: `const spent = [3, 5, 2, 6];   // money spent each day
const running = [0];           // running[i] = total spent before day i
for (let i = 0; i < spent.length; i++) {
  running.push(running[i] + spent[i]);
}
console.log(running); // [0, 3, 8, 10, 16]

// Spent on days 1 and 2 (5 + 2), without adding again:
console.log(running[3] - running[1]); // 7`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "The smallest working version of each of the five tools.",
        code: `// 1. PREFIX SUM: prefix[i] = sum of the first i items
const arr = [2, 4, 1, 3];
const prefix = [0];
for (let i = 0; i < arr.length; i++) prefix.push(prefix[i] + arr[i]);
console.log(prefix); // [0, 2, 6, 7, 10]
// sum of arr[l..r] = prefix[r + 1] - prefix[l]
console.log(prefix[3] - prefix[1]); // 5   (4 + 1)

// SUFFIX SUM: suffix[i] = sum from i to the end
const suffix = new Array(arr.length + 1).fill(0);
for (let i = arr.length - 1; i >= 0; i--) suffix[i] = suffix[i + 1] + arr[i];
console.log(suffix); // [10, 8, 4, 3, 0]

// 2. READ / WRITE POINTERS: read every item, write only the keepers
const nums = [0, 1, 0, 3, 12];
let write = 0;
for (let read = 0; read < nums.length; read++) {
  if (nums[read] !== 0) {
    nums[write] = nums[read];
    write++;
  }
}
console.log(nums.slice(0, write)); // [1, 3, 12]

// 3. HASHMAP (Map): key -> value, instant lookup
const ages = new Map();
ages.set("ana", 12);
ages.set("ben", 13);
console.log(ages.get("ben"), ages.has("cal")); // 13 false

// 4. HASHSET (Set): "have I seen this before?"
const seen = new Set();
for (const x of [3, 1, 3]) {
  if (seen.has(x)) console.log("repeat", x); // repeat 3
  seen.add(x);
}

// 5. FLOYD'S CYCLE DETECTION
// next[i] = where you go from i (-1 = the end). Here 0 -> 1 -> 2 -> 3 -> 1 ... loops.
const next = [1, 2, 3, 1];
let slow = 0;
let fast = 0;
let cycle = false;
while (fast !== -1 && next[fast] !== -1) {
  slow = next[slow];         // tortoise: 1 step
  fast = next[next[fast]];   // hare: 2 steps
  if (slow === fast) {
    cycle = true;
    break;
  }
}
console.log(cycle); // true`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "Building a prefix array and answering two range questions with one subtraction each. Then the tortoise and hare, traced until they meet.",
        code: `const arr = [2, 4, 1, 3];
const prefix = [0];
for (let i = 0; i < arr.length; i++) {
  prefix.push(prefix[i] + arr[i]);
}
console.log(prefix); // [0, 2, 6, 7, 10]

// i | arr[i] | prefix[i] | prefix[i + 1] = prefix[i] + arr[i]
// 0 | 2      | 0         | 2
// 1 | 4      | 2         | 6
// 2 | 1      | 6         | 7
// 3 | 3      | 7         | 10

console.log(prefix[4] - prefix[1]); // 8   sum of arr[1..3] = 4 + 1 + 3
console.log(prefix[2] - prefix[0]); // 6   sum of arr[0..1] = 2 + 4

const next = [1, 2, 3, 1]; // 0 -> 1 -> 2 -> 3 -> back to 1
let slow = 0;
let fast = 0;
let rounds = 0;
while (fast !== -1 && next[fast] !== -1) {
  slow = next[slow];
  fast = next[next[fast]];
  rounds++;
  if (slow === fast) break;
}
console.log(slow === fast, rounds); // true 3

// round | slow       | fast                    | same?
// start | 0          | 0                       |  -
// 1     | next[0]=1  | next[next[0]]=next[1]=2 | no
// 2     | next[1]=2  | next[next[2]]=next[3]=1 | no
// 3     | next[2]=3  | next[next[1]]=next[2]=3 | yes -> there is a cycle`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "Off-by-one in prefix sums, object keys turning into text, and Sets not recognising equal-looking arrays.",
        code: `// 1. Prefix sums: arr[l..r] is prefix[r + 1] - prefix[l]
const arr = [2, 4, 1, 3];
const prefix = [0, 2, 6, 7, 10];
console.log(prefix[3] - prefix[1]); // 5   WRONG for arr[1..3] (misses the 3)
console.log(prefix[4] - prefix[1]); // 8   RIGHT

// 2. Plain objects turn keys into text; Map keeps the real type
const obj = {};
obj[1] = "a";
console.log(Object.keys(obj)); // ["1"]
const m = new Map();
m.set(1, "a");
console.log(m.has("1"), m.has(1)); // false true

// 3. A Set compares arrays by identity, not by contents
const pairs = new Set();
pairs.add([1, 2]);
console.log(pairs.has([1, 2])); // false   (a different array)
const keys = new Set();
keys.add([1, 2].join(","));
console.log(keys.has("1,2")); // true    (use a text key)

// 4. Read/write: forgetting write++ keeps overwriting the same spot
const nums = [5, 0, 7, 8];
let w = 0;
for (let r = 0; r < nums.length; r++) {
  if (nums[r] !== 0) nums[w] = nums[r]; // WRONG: w never moves
}
console.log(nums[0]); // 8

// 5. Floyd: check fast AND next[fast] before jumping two steps,
//    otherwise next[-1] is undefined and the loop goes wrong.`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "One exercise for each tool.",
        code: `// 1. Prefix sum: answer several range-sum questions quickly
function rangeSums(arr, queries) {
  const prefix = [0];
  for (let i = 0; i < arr.length; i++) prefix.push(prefix[i] + arr[i]);
  const out = [];
  for (const q of queries) out.push(prefix[q[1] + 1] - prefix[q[0]]);
  return out;
}
console.log(rangeSums([3, 1, 4, 1, 5], [[0, 2], [1, 3], [2, 4]])); // [8, 6, 10]

// 2. Read/write: remove every val in place, return what is kept
function removeValue(arr, val) {
  let write = 0;
  for (let read = 0; read < arr.length; read++) {
    if (arr[read] !== val) {
      arr[write] = arr[read];
      write++;
    }
  }
  return arr.slice(0, write);
}
console.log(removeValue([3, 2, 2, 3, 4], 3)); // [2, 2, 4]

// 3. Map: Two Sum in one pass (value -> index)
function twoSum(arr, target) {
  const indexOf = new Map();
  for (let i = 0; i < arr.length; i++) {
    const need = target - arr[i];
    if (indexOf.has(need)) return [indexOf.get(need), i];
    indexOf.set(arr[i], i);
  }
  return [];
}
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]

// 4. Set: the first value that appears a second time
function firstRepeat(arr) {
  const seen = new Set();
  for (const x of arr) {
    if (seen.has(x)) return x;
    seen.add(x);
  }
  return null;
}
console.log(firstRepeat([5, 1, 4, 1, 5])); // 1

// 5. Floyd: does following next[] ever loop?
function hasCycle(next) {
  let slow = 0;
  let fast = 0;
  while (fast !== -1 && next[fast] !== -1) {
    slow = next[slow];
    fast = next[next[fast]];
    if (slow === fast) return true;
  }
  return false;
}
console.log(hasCycle([1, 2, 0]), hasCycle([1, 2, -1])); // true false`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict each output, then run it. Answers are at the bottom.",
        code: `// Q1
const prefix = [0, 1, 3, 6]; // prefix sums of [1, 2, 3]
console.log(prefix[3] - prefix[1]);

// Q2
const s = new Set([1, 2, 2, 3, 3, 3]);
console.log(s.size);

// Q3
const m = new Map();
for (const ch of "aab") m.set(ch, (m.get(ch) || 0) + 1);
console.log(m.get("a"), m.get("b"));

// Answers:
// Q1 -> 5     (2 + 3)
// Q2 -> 3     (a Set keeps each value once)
// Q3 -> 2 1`,
        language: "javascript",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 20 · Problem-solving & complexity
// ---------------------------------------------------------------------------
const t20: DSATopic = {
  id: "pre-dsa-20-problem-solving",
  label: "20 · Problem-solving & Big-O",
  icon: Gauge,
  href: "/dsa?topic=pre-dsa-20-problem-solving",
  content: {
    title: "20 · Problem-solving & complexity — translating problems into loops, brute force, optimization & Big-O",
    description:
      "A repeatable way to go from a problem in words to working loops, then to faster loops, and how to say how fast they are.",
    steps: [
      {
        title: "The idea in plain words",
        explanation:
          "Solving a problem is like following a recipe. First understand what goes in and what comes out. Then work a tiny example by hand. Then write the simplest solution you are sure is correct, even if it is slow: that is brute force. Only then look for repeated work you can remove: that is optimisation. Big-O is how we describe speed: not in seconds, but in how the amount of work grows when the input grows. If doubling the input doubles the work, that is O(n). If doubling the input makes four times the work, that is O(n²), usually two nested loops. O(1) means the work does not grow at all, and O(log n) means each step halves what is left, like guessing a number with 'higher or lower'.",
        code: `function countWork(n) {
  let single = 0;
  let nested = 0;
  for (let i = 0; i < n; i++) single++;   // O(n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) nested++; // O(n^2)
  }
  return [single, nested];
}
console.log(countWork(4)); // [4, 16]
console.log(countWork(8)); // [8, 64]
// double n: the single loop does 2x the work, the nested loop 4x`,
        language: "javascript",
      },
      {
        title: "Syntax / template",
        explanation:
          "The four-step plan, a phrasebook that turns problem words into loop parts, and a Big-O cheat sheet. Then the plan applied to a small problem.",
        code: `// THE PLAN
// 1. Understand: what goes in, what comes out? Say it in one sentence.
// 2. Examples by hand: a small normal case + edge cases (empty, one item, all the same).
// 3. Brute force: the simplest loops that are obviously correct.
// 4. Optimise: find repeated work and remove it.

// PHRASEBOOK: problem words -> code
// "for each item"           -> for (let i = 0; i < n; i++)
// "every pair"              -> nested loop with j = i + 1
// "until ..."               -> while (...)
// "how many"                -> count accumulator
// "biggest / smallest"      -> max / min accumulator
// "seen before? / unique"   -> Set
// "how many times each"     -> Map or frequency object
// "k in a row / substring"  -> sliding window
// "sorted + pair"           -> two pointers
// "sum between i and j"     -> prefix sum

// BIG-O CHEAT SHEET
// O(1)        no loop over the input               arr[0], arr.length
// O(log n)    halve what is left each round        binary search
// O(n)        one loop (or several, one after another)
// O(n log n)  a good sort
// O(n^2)      a loop inside a loop over the same input

// Plan applied: "How many students scored above the class average?"
// 1. In: array of marks. Out: a count.
// 2. [40, 60, 80] -> average 60 -> only 80 is above -> 1
// 3. Pass 1: sum -> average. Pass 2: count marks > average. Two loops one after another = O(n).
function aboveAverage(marks) {
  let sum = 0;
  for (const m of marks) sum += m;
  const avg = sum / marks.length;
  let count = 0;
  for (const m of marks) {
    if (m > avg) count++;
  }
  return count;
}
console.log(aboveAverage([40, 60, 80])); // 1`,
        language: "javascript",
      },
      {
        title: "Example with a dry-run table",
        explanation:
          "'Does the array contain a duplicate?' Brute force compares every pair, O(n²). The optimised version remembers what it has seen in a Set, O(n). Both return [answer, number of checks], so you can watch the gap grow.",
        code: `function hasDuplicateBrute(arr) {
  let checks = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      checks++;
      if (arr[i] === arr[j]) return [true, checks];
    }
  }
  return [false, checks];
}

function hasDuplicateSet(arr) {
  let checks = 0;
  const seen = new Set();
  for (const x of arr) {
    checks++;
    if (seen.has(x)) return [true, checks];
    seen.add(x);
  }
  return [false, checks];
}

const small = [1, 2, 3, 4];
const big = [1, 2, 3, 4, 5, 6, 7, 8];
console.log(hasDuplicateBrute(small), hasDuplicateSet(small)); // [false, 6] [false, 4]
console.log(hasDuplicateBrute(big), hasDuplicateSet(big)); // [false, 28] [false, 8]

// n     | brute checks = n(n-1)/2 | Set checks = n
// 4     | 6                       | 4
// 8     | 28                      | 8
// 1000  | 499,500                 | 1,000
// Doubling n roughly quadruples brute force but only doubles the Set version.`,
        language: "javascript",
      },
      {
        title: "Common mistakes",
        explanation:
          "Mistakes in thinking, not typing: forgetting edge cases, miscounting Big-O, and missing the hidden loop.",
        code: `// 1. Forgetting the edge cases you wrote down in step 2
function maxOf(arr) {
  if (arr.length === 0) return null; // without this, an empty array gives -Infinity
  let best = -Infinity;
  for (const x of arr) if (x > best) best = x;
  return best;
}
console.log(maxOf([]), maxOf([3, 9, 2])); // null 9

// 2. Two loops ONE AFTER ANOTHER are O(n + n) = O(n), not O(n^2)
let work = 0;
const n = 5;
for (let i = 0; i < n; i++) work++;
for (let i = 0; i < n; i++) work++;
console.log(work); // 10   (2n, still O(n))

// 3. Hidden loops: includes() walks the array, so this is O(n^2)
function uniqueSlow(arr) {
  const out = [];
  for (const x of arr) {
    if (!out.includes(x)) out.push(x); // a loop inside the loop!
  }
  return out;
}
function uniqueFast(arr) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    if (!seen.has(x)) { seen.add(x); out.push(x); }  // Set lookup is O(1)
  }
  return out;
}
console.log(uniqueSlow([1, 2, 1, 3]), uniqueFast([1, 2, 1, 3])); // [1, 2, 3] [1, 2, 3]

// 4. Optimising before you have anything that works.
//    Brute force first: it gives you correct answers to test the fast version against.

// 5. Keeping constants: O(2n) and O(n + 5) are both just O(n).`,
        language: "javascript",
      },
      {
        title: "5 practice exercises",
        explanation:
          "Translate each sentence into loops. For each, say its Big-O before you check the comment.",
        code: `// 1. How many numbers are bigger than the one before them?   O(n)
function countRises(arr) {
  let count = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > arr[i - 1]) count++;
  }
  return count;
}
console.log(countRises([3, 5, 2, 8, 9])); // 3

// 2. Best profit from buying one day and selling a later day
//    Brute force O(n^2) vs one pass O(n): same answer
function maxProfitBrute(prices) {
  let best = 0;
  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      best = Math.max(best, prices[j] - prices[i]);
    }
  }
  return best;
}
function maxProfit(prices) {
  let cheapest = Infinity;
  let best = 0;
  for (const p of prices) {
    cheapest = Math.min(cheapest, p);    // cheapest day so far
    best = Math.max(best, p - cheapest); // sell today?
  }
  return best;
}
console.log(maxProfitBrute([7, 1, 5, 3, 6, 4]), maxProfit([7, 1, 5, 3, 6, 4])); // 5 5

// 3. Does any value appear twice?   O(n) with a Set
function containsDuplicate(arr) {
  const seen = new Set();
  for (const x of arr) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}
console.log(containsDuplicate([1, 2, 3, 1])); // true

// 4. Numbers 0..n with one missing: find it.   O(n)
function missingNumber(arr) {
  const n = arr.length;
  let expected = (n * (n + 1)) / 2; // sum of 0..n
  for (const x of arr) expected -= x;
  return expected;
}
console.log(missingNumber([3, 0, 1])); // 2

// 5. How many halvings to get from n down to 1?   O(log n)
function halvings(n) {
  let steps = 0;
  while (n > 1) {
    n = Math.floor(n / 2);
    steps++;
  }
  return steps;
}
console.log(halvings(16), halvings(1024)); // 4 10`,
        language: "javascript",
      },
      {
        title: "Quick check",
        explanation: "Predict the printed count AND the Big-O of each snippet. Answers are at the bottom.",
        code: `// Q1
let c = 0;
for (let i = 0; i < 10; i++) c++;
for (let j = 0; j < 10; j++) c++;
console.log(c);

// Q2
let d = 0;
for (let i = 0; i < 10; i++) {
  for (let j = i + 1; j < 10; j++) d++;
}
console.log(d);

// Q3
let e = 0;
for (let i = 1; i < 100; i *= 2) e++;
console.log(e);

// Answers:
// Q1 -> 20   O(n)        (two loops one after another)
// Q2 -> 45   O(n^2)      (every pair: 10 * 9 / 2)
// Q3 -> 7    O(log n)    (1, 2, 4, 8, 16, 32, 64)`,
        language: "javascript",
      },
    ],
  },
};

export const preDsaTopics: DSATopic[] = [
  overviewTopic,
  t01,
  t02,
  t03,
  t04,
  t05,
  t06,
  t07,
  t08,
  t09,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
];
