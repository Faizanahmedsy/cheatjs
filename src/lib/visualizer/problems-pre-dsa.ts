import type { Problem, ProblemGroup } from "./problem-types";

/**
 * Pre-DSA: 40 tiny warm-ups, grouped by the loop patterns from Faizan's
 * DSA hub (counter, accumulator, best so far, flags, nested pairs,
 * frequency). Numbers 1001–1040 show as P1–P40.
 */
function pre(
  n: number,
  id: string,
  title: string,
  group: ProblemGroup,
  statement: string,
  example: string,
  approach: string,
  watch: string[],
  time: string,
  space: string,
  code: string,
): Problem {
  return { id: `pre-${id}`, number: 1000 + n, title, group, difficulty: "Easy", statement, example, approach, watch, complexity: { time, space }, code };
}

const F = "Pre-DSA · Functions & maths";
const C = "Pre-DSA · Conditions";
const S = "Pre-DSA · Strings";
const CO = "Pre-DSA · Counter";
const A = "Pre-DSA · Accumulator";
const B = "Pre-DSA · Best so far";
const FL = "Pre-DSA · Flags & early exit";
const N = "Pre-DSA · Nested loops";
const FR = "Pre-DSA · Frequency count";

export const PRE_DSA_PROBLEMS: Problem[] = [
  // ---------------------------------------------------------------- functions & maths
  pre(1, "rectangle-area", "Area of a rectangle", F,
    "Given the width and height of a rectangle, return its area.",
    "width = 4, height = 3 → 12",
    "A function takes inputs, does one calculation and returns the answer. Area is width times height.",
    ["`area` is created from the two inputs.", "The function returns the value; console.log prints it."],
    "O(1)", "O(1)",
    `function rectangleArea(width, height) {
  const area = width * height;
  return area;
}

console.log(rectangleArea(4, 3));`),
  pre(2, "minutes-to-seconds", "Minutes to seconds", F,
    "Convert a number of minutes into seconds.",
    "minutes = 5 → 300",
    "One minute has 60 seconds, so multiply by 60.",
    ["`seconds` = minutes × 60."],
    "O(1)", "O(1)",
    `function toSeconds(minutes) {
  const seconds = minutes * 60;
  return seconds;
}

console.log(toSeconds(5));`),
  pre(3, "opposite-number", "Opposite number", F,
    "Return the opposite of a number: positive becomes negative and negative becomes positive.",
    "number = 7 → -7",
    "Multiply by -1 (or subtract from 0).",
    ["`opposite` flips the sign."],
    "O(1)", "O(1)",
    `function opposite(number) {
  const result = number * -1;
  return result;
}

console.log(opposite(7));`),
  pre(4, "remainder", "Find the remainder", F,
    "Given two numbers, return the remainder when the first is divided by the second.",
    "dividend = 17, divisor = 5 → 2",
    "The % operator gives what is left over after dividing.",
    ["`leftOver` = 17 % 5 = 2 because 5 fits 3 times (15) and 2 is left."],
    "O(1)", "O(1)",
    `function remainder(dividend, divisor) {
  const leftOver = dividend % divisor;
  return leftOver;
}

console.log(remainder(17, 5));`),
  pre(5, "average-of-three", "Average of three numbers", F,
    "Return the average of three numbers.",
    "a = 4, b = 8, c = 6 → 6",
    "Add them, then divide the total by how many numbers there are.",
    ["`total` is built first, then `average` = total / 3."],
    "O(1)", "O(1)",
    `function averageOfThree(a, b, c) {
  const total = a + b + c;
  const average = total / 3;
  return average;
}

console.log(averageOfThree(4, 8, 6));`),

  // ---------------------------------------------------------------- conditions
  pre(6, "is-even", "Is the number even?", C,
    "Return true when a number is even, false when it is odd.",
    "number = 6 → true",
    "A number is even when dividing by 2 leaves remainder 0.",
    ["Watch the yes / no check `number % 2 === 0`."],
    "O(1)", "O(1)",
    `function isEven(number) {
  if (number % 2 === 0) {
    return true;
  }
  return false;
}

console.log(isEven(6));`),
  pre(7, "sign-of-number", "Positive, negative or zero", C,
    "Say whether a number is positive, negative or zero.",
    "number = -4 → \"negative\"",
    "Check one rule at a time with if / else if / else. Only one branch runs.",
    ["Each check is shown as a yes / no; the first yes wins."],
    "O(1)", "O(1)",
    `function signOf(number) {
  if (number > 0) {
    return "positive";
  } else if (number < 0) {
    return "negative";
  } else {
    return "zero";
  }
}

console.log(signOf(-4));`),
  pre(8, "larger-of-two", "Larger of two numbers", C,
    "Return the larger of two numbers.",
    "a = 12, b = 9 → 12",
    "Compare them once; return whichever wins.",
    ["The check `a > b` decides which value is returned."],
    "O(1)", "O(1)",
    `function largerOfTwo(a, b) {
  if (a > b) {
    return a;
  }
  return b;
}

console.log(largerOfTwo(12, 9));`),
  pre(9, "leap-year", "Leap year", C,
    "A year is a leap year if it divides by 4, except years that divide by 100, unless they also divide by 400.",
    "year = 2024 → true",
    "Check the special rules first (400, then 100), then the general rule (4).",
    ["Watch which check is true first: 400? 100? 4?"],
    "O(1)", "O(1)",
    `function isLeapYear(year) {
  if (year % 400 === 0) {
    return true;
  }
  if (year % 100 === 0) {
    return false;
  }
  return year % 4 === 0;
}

console.log(isLeapYear(2024));`),
  pre(10, "grade-from-score", "Grade from a score", C,
    "Turn a score out of 100 into a grade: 90+ is A, 75+ is B, 50+ is C, else F.",
    "score = 82 → \"B\"",
    "Go from the highest band down; the first band the score reaches is the grade.",
    ["Watch the checks fail one by one until `score >= 75` is true."],
    "O(1)", "O(1)",
    `function gradeOf(score) {
  if (score >= 90) {
    return "A";
  } else if (score >= 75) {
    return "B";
  } else if (score >= 50) {
    return "C";
  }
  return "F";
}

console.log(gradeOf(82));`),

  // ---------------------------------------------------------------- strings
  pre(11, "first-and-last-char", "First and last character", S,
    "Return the first and the last character of a word, joined together.",
    "word = \"hello\" → \"ho\"",
    "Index 0 is the first character; length - 1 is the last one.",
    ["`lastIndex` is length - 1, because counting starts at 0."],
    "O(1)", "O(1)",
    `function firstAndLast(word) {
  const first = word[0];
  const lastIndex = word.length - 1;
  const last = word[lastIndex];
  return first + last;
}

console.log(firstAndLast("hello"));`),
  pre(12, "reverse-string", "Reverse a string", S,
    "Return the word written backwards.",
    "word = \"code\" → \"edoc\"",
    "Start at the last character and walk back to the first, adding each one to the result.",
    ["`index` counts down; `reversed` grows one character per pass."],
    "O(n)", "O(n)",
    `function reverseString(word) {
  let reversed = "";
  for (let index = word.length - 1; index >= 0; index--) {
    reversed = reversed + word[index];
  }
  return reversed;
}

console.log(reverseString("code"));`),
  pre(13, "remove-spaces", "Remove spaces", S,
    "Return the sentence with every space removed.",
    "text = \"a b c\" → \"abc\"",
    "Walk through each character; keep it only when it is not a space.",
    ["The check skips spaces; `result` only grows for letters."],
    "O(n)", "O(n)",
    `function removeSpaces(text) {
  let result = "";
  for (let index = 0; index < text.length; index++) {
    if (text[index] !== " ") {
      result = result + text[index];
    }
  }
  return result;
}

console.log(removeSpaces("a b c"));`),
  pre(14, "capitalize-first", "Capitalise the first letter", S,
    "Return the word with its first letter in capitals.",
    "word = \"billu\" → \"Billu\"",
    "Make the first character upper case and add the rest of the word unchanged.",
    ["`rest` is everything from index 1 onwards."],
    "O(n)", "O(n)",
    `function capitalize(word) {
  const first = word[0].toUpperCase();
  const rest = word.slice(1);
  return first + rest;
}

console.log(capitalize("billu"));`),

  // ---------------------------------------------------------------- counter
  pre(15, "count-evens", "Count even numbers", CO,
    "Count how many numbers in the list are even.",
    "numbers = [3, 8, 5, 6, 2] → 3",
    "Counter pattern: start at 0 and add 1 every time an item matches the rule.",
    ["`count` only goes up when the check is true."],
    "O(n)", "O(1)",
    `function countEvens(numbers) {
  let count = 0;
  for (let index = 0; index < numbers.length; index++) {
    if (numbers[index] % 2 === 0) {
      count++;
    }
  }
  return count;
}

console.log(countEvens([3, 8, 5, 6, 2]));`),
  pre(16, "count-vowels", "Count vowels", CO,
    "Count the vowels (a, e, i, o, u) in a word.",
    "word = \"education\" → 5",
    "Counter pattern on characters: add 1 whenever the character is one of the vowels.",
    ["`count` goes up on e, u, a, i, o."],
    "O(n)", "O(1)",
    `function countVowels(word) {
  const vowels = "aeiou";
  let count = 0;
  for (let index = 0; index < word.length; index++) {
    if (vowels.includes(word[index])) {
      count++;
    }
  }
  return count;
}

console.log(countVowels("education"));`),
  pre(17, "count-above", "Count numbers above a limit", CO,
    "Count how many numbers are bigger than a given limit.",
    "numbers = [4, 11, 7, 15], limit = 6 → 3",
    "Counter pattern with a comparison as the rule.",
    ["Watch `numbers[index] > limit` for each item."],
    "O(n)", "O(1)",
    `function countAbove(numbers, limit) {
  let count = 0;
  for (let index = 0; index < numbers.length; index++) {
    if (numbers[index] > limit) {
      count++;
    }
  }
  return count;
}

console.log(countAbove([4, 11, 7, 15], 6));`),
  pre(18, "count-occurrences", "Count a target value", CO,
    "Count how many times a target value appears in the list.",
    "numbers = [2, 5, 2, 9, 2], target = 2 → 3",
    "Counter pattern where the rule is \"equals the target\".",
    ["`count` goes 1, 2, 3 on the three 2s."],
    "O(n)", "O(1)",
    `function countOccurrences(numbers, target) {
  let count = 0;
  for (let index = 0; index < numbers.length; index++) {
    if (numbers[index] === target) {
      count++;
    }
  }
  return count;
}

console.log(countOccurrences([2, 5, 2, 9, 2], 2));`),
  pre(19, "count-sheep", "Count the sheep", CO,
    "A list says true when a sheep is present and false when it is missing. Count the sheep.",
    "present = [true, false, true, true] → 3",
    "Counter pattern where the item itself is the yes / no.",
    ["`count` skips the false item."],
    "O(n)", "O(1)",
    `function countSheep(present) {
  let count = 0;
  for (let index = 0; index < present.length; index++) {
    if (present[index] === true) {
      count++;
    }
  }
  return count;
}

console.log(countSheep([true, false, true, true]));`),

  // ---------------------------------------------------------------- accumulator
  pre(20, "sum-of-list", "Sum of a list", A,
    "Add up every number in the list.",
    "numbers = [4, 7, 1, 8] → 20",
    "Accumulator pattern: start with 0 and add each item to a running total.",
    ["`total` grows 4, 11, 12, 20."],
    "O(n)", "O(1)",
    `function sumOf(numbers) {
  let total = 0;
  for (let index = 0; index < numbers.length; index++) {
    total = total + numbers[index];
  }
  return total;
}

console.log(sumOf([4, 7, 1, 8]));`),
  pre(21, "product-of-list", "Product of a list", A,
    "Multiply every number in the list together.",
    "numbers = [2, 3, 4] → 24",
    "Accumulator with multiply. Start at 1, not 0, because anything times 0 is 0.",
    ["`product` goes 2, 6, 24."],
    "O(n)", "O(1)",
    `function productOf(numbers) {
  let product = 1;
  for (let index = 0; index < numbers.length; index++) {
    product = product * numbers[index];
  }
  return product;
}

console.log(productOf([2, 3, 4]));`),
  pre(22, "sum-1-to-n", "Sum from 1 to n", A,
    "Add all whole numbers from 1 up to n.",
    "n = 5 → 15",
    "Accumulator where the loop counter itself is the value being added.",
    ["`total` grows 1, 3, 6, 10, 15."],
    "O(n)", "O(1)",
    `function sumUpTo(n) {
  let total = 0;
  for (let value = 1; value <= n; value++) {
    total = total + value;
  }
  return total;
}

console.log(sumUpTo(5));`),
  pre(23, "average-of-list", "Average of a list", A,
    "Return the average of the numbers in the list.",
    "numbers = [10, 20, 30, 40] → 25",
    "Accumulate the total first, then divide by how many items there are.",
    ["`total` is built in the loop; the divide happens once, after the loop."],
    "O(n)", "O(1)",
    `function averageOf(numbers) {
  let total = 0;
  for (let index = 0; index < numbers.length; index++) {
    total = total + numbers[index];
  }
  return total / numbers.length;
}

console.log(averageOf([10, 20, 30, 40]));`),
  pre(24, "build-doubled-list", "Double every number", A,
    "Return a new list where every number is doubled.",
    "numbers = [1, 4, 6] → [2, 8, 12]",
    "Accumulator that builds a list: start empty and push one new item per pass.",
    ["`doubled` gains one item per pass."],
    "O(n)", "O(n)",
    `function doubleAll(numbers) {
  const doubled = [];
  for (let index = 0; index < numbers.length; index++) {
    doubled.push(numbers[index] * 2);
  }
  return doubled;
}

console.log(doubleAll([1, 4, 6]));`),

  // ---------------------------------------------------------------- best so far
  pre(25, "largest-number", "Largest number", B,
    "Return the largest number in the list.",
    "numbers = [7, 3, 12, 5] → 12",
    "Best-so-far pattern: remember the biggest seen so far and replace it when a bigger one shows up.",
    ["`largest` only changes when a bigger number appears."],
    "O(n)", "O(1)",
    `function largestOf(numbers) {
  let largest = numbers[0];
  for (let index = 1; index < numbers.length; index++) {
    if (numbers[index] > largest) {
      largest = numbers[index];
    }
  }
  return largest;
}

console.log(largestOf([7, 3, 12, 5]));`),
  pre(26, "smallest-number", "Smallest number", B,
    "Return the smallest number in the list.",
    "numbers = [7, 3, 12, 5] → 3",
    "Same as largest, but the comparison flips to less-than.",
    ["`smallest` changes from 7 to 3 and then stays."],
    "O(n)", "O(1)",
    `function smallestOf(numbers) {
  let smallest = numbers[0];
  for (let index = 1; index < numbers.length; index++) {
    if (numbers[index] < smallest) {
      smallest = numbers[index];
    }
  }
  return smallest;
}

console.log(smallestOf([7, 3, 12, 5]));`),
  pre(27, "position-of-largest", "Position of the largest", B,
    "Return the index where the largest number sits.",
    "numbers = [4, 9, 2, 9, 1] → 1",
    "Track the best position, not the value. Use > (not >=) so the first largest wins.",
    ["`bestIndex` points at the winner so far."],
    "O(n)", "O(1)",
    `function indexOfLargest(numbers) {
  let bestIndex = 0;
  for (let index = 1; index < numbers.length; index++) {
    if (numbers[index] > numbers[bestIndex]) {
      bestIndex = index;
    }
  }
  return bestIndex;
}

console.log(indexOfLargest([4, 9, 2, 9, 1]));`),
  pre(28, "longest-word", "Longest word", B,
    "Return the longest word in the list.",
    "words = [\"cat\", \"zebra\", \"dog\"] → \"zebra\"",
    "Best-so-far comparing lengths instead of values.",
    ["`longest` changes when a word is longer than the current best."],
    "O(n)", "O(1)",
    `function longestWord(words) {
  let longest = words[0];
  for (let index = 1; index < words.length; index++) {
    if (words[index].length > longest.length) {
      longest = words[index];
    }
  }
  return longest;
}

console.log(longestWord(["cat", "zebra", "dog"]));`),
  pre(29, "second-largest", "Second largest", B,
    "Return the second largest distinct number.",
    "numbers = [5, 9, 3, 9, 7] → 7",
    "Keep two best values. A new biggest pushes the old biggest down to second place.",
    ["Watch `largest` and `second` swap roles when 9 arrives.", "The second 9 changes nothing because it is not bigger."],
    "O(n)", "O(1)",
    `function secondLargest(numbers) {
  let largest = -Infinity;
  let second = -Infinity;
  for (let index = 0; index < numbers.length; index++) {
    const value = numbers[index];
    if (value > largest) {
      second = largest;
      largest = value;
    } else if (value > second && value < largest) {
      second = value;
    }
  }
  return second;
}

console.log(secondLargest([5, 9, 3, 9, 7]));`),

  // ---------------------------------------------------------------- flags & early exit
  pre(30, "contains-value", "Does the list contain it?", FL,
    "Return true if the target is in the list, false otherwise.",
    "numbers = [4, 8, 15], target = 8 → true",
    "Early exit: as soon as you find it, return. Only say false after checking everything.",
    ["The loop stops at index 1; it never looks at 15."],
    "O(n)", "O(1)",
    `function contains(numbers, target) {
  for (let index = 0; index < numbers.length; index++) {
    if (numbers[index] === target) {
      return true;
    }
  }
  return false;
}

console.log(contains([4, 8, 15], 8));`),
  pre(31, "is-sorted", "Is the list sorted?", FL,
    "Return true if every number is less than or equal to the next one.",
    "numbers = [1, 3, 3, 7] → true",
    "Look for a single broken pair. One bad pair is enough to say false.",
    ["Each check compares a number with its right-hand neighbour."],
    "O(n)", "O(1)",
    `function isSorted(numbers) {
  for (let index = 0; index < numbers.length - 1; index++) {
    if (numbers[index] > numbers[index + 1]) {
      return false;
    }
  }
  return true;
}

console.log(isSorted([1, 3, 3, 7]));`),
  pre(32, "all-positive", "Are all numbers positive?", FL,
    "Return true only if every number is above zero.",
    "numbers = [3, 6, -1, 8] → false",
    "Flag pattern: assume yes, and switch the flag off the moment one number breaks the rule.",
    ["`allPositive` flips to false at -1 and the loop breaks."],
    "O(n)", "O(1)",
    `function allPositive(numbers) {
  let allPositive = true;
  for (let index = 0; index < numbers.length; index++) {
    if (numbers[index] <= 0) {
      allPositive = false;
      break;
    }
  }
  return allPositive;
}

console.log(allPositive([3, 6, -1, 8]));`),
  pre(33, "first-negative", "First negative number", FL,
    "Return the position of the first negative number, or -1 if there is none.",
    "numbers = [4, 2, -5, 7, -1] → 2",
    "Early exit with a position: return the index the moment you find a match.",
    ["The loop ends at index 2; -1 at the end is never reached."],
    "O(n)", "O(1)",
    `function firstNegative(numbers) {
  for (let index = 0; index < numbers.length; index++) {
    if (numbers[index] < 0) {
      return index;
    }
  }
  return -1;
}

console.log(firstNegative([4, 2, -5, 7, -1]));`),

  // ---------------------------------------------------------------- nested loops
  pre(34, "has-duplicate-pairs", "Any duplicate? (pair check)", N,
    "Return true if any value appears twice, by comparing every pair.",
    "numbers = [3, 1, 4, 1] → true",
    "Outer loop picks one item; inner loop compares it with every item after it. Start the inner loop at outer + 1 so no item is compared with itself.",
    ["`second` always starts one place after `first`.", "This checks every pair, so it is O(n²)."],
    "O(n²)", "O(1)",
    `function hasDuplicate(numbers) {
  for (let first = 0; first < numbers.length; first++) {
    for (let second = first + 1; second < numbers.length; second++) {
      if (numbers[first] === numbers[second]) {
        return true;
      }
    }
  }
  return false;
}

console.log(hasDuplicate([3, 1, 4, 1]));`),
  pre(35, "pair-with-sum", "Pair that adds to a target", N,
    "Return the two positions whose values add up to the target, checking every pair.",
    "numbers = [5, 2, 8, 3], target = 11 → [2, 3]",
    "The brute-force version of Two Sum: try every pair once.",
    ["Watch `numbers[first] + numbers[second]` for each pair."],
    "O(n²)", "O(1)",
    `function pairWithSum(numbers, target) {
  for (let first = 0; first < numbers.length; first++) {
    for (let second = first + 1; second < numbers.length; second++) {
      if (numbers[first] + numbers[second] === target) {
        return [first, second];
      }
    }
  }
  return [];
}

console.log(pairWithSum([5, 2, 8, 3], 11));`),
  pre(36, "multiplication-table", "Small multiplication table", N,
    "Build a table where row r and column c hold (r + 1) × (c + 1).",
    "size = 3 → [[1,2,3],[2,4,6],[3,6,9]]",
    "Outer loop makes each row, inner loop fills that row's columns.",
    ["`row` is a fresh list each outer pass; the inner loop fills it."],
    "O(n²)", "O(n²)",
    `function timesTable(size) {
  const table = [];
  for (let rowIndex = 0; rowIndex < size; rowIndex++) {
    const row = [];
    for (let colIndex = 0; colIndex < size; colIndex++) {
      row.push((rowIndex + 1) * (colIndex + 1));
    }
    table.push(row);
  }
  return table;
}

console.log(timesTable(3));`),
  pre(37, "count-pairs-sum", "Count pairs with a sum", N,
    "Count how many pairs of positions add up to the target.",
    "numbers = [1, 5, 3, 3, 7], target = 6 → 2",
    "Nested-pair loop plus a counter.",
    ["`count` goes up for (1, 5) and (3, 3)."],
    "O(n²)", "O(1)",
    `function countPairs(numbers, target) {
  let count = 0;
  for (let first = 0; first < numbers.length; first++) {
    for (let second = first + 1; second < numbers.length; second++) {
      if (numbers[first] + numbers[second] === target) {
        count++;
      }
    }
  }
  return count;
}

console.log(countPairs([1, 5, 3, 3, 7], 6));`),

  // ---------------------------------------------------------------- frequency
  pre(38, "letter-counts", "Count each letter", FR,
    "Count how many times each letter appears in a word.",
    "word = \"banana\" → { b: 1, a: 3, n: 2 }",
    "Frequency pattern: a map from item to count. Add 1 to that item's count each time you see it.",
    ["`counts` gains a key the first time a letter appears, then that key grows."],
    "O(n)", "O(k)",
    `function letterCounts(word) {
  const counts = new Map();
  for (let index = 0; index < word.length; index++) {
    const letter = word[index];
    counts.set(letter, (counts.get(letter) || 0) + 1);
  }
  return counts;
}

console.log(letterCounts("banana"));`),
  pre(39, "most-common", "Most common number", FR,
    "Return the number that appears the most times.",
    "numbers = [4, 1, 4, 2, 4, 1] → 4",
    "Count with a map, then use best-so-far on the counts.",
    ["First loop fills `counts`; second loop picks the biggest count."],
    "O(n)", "O(k)",
    `function mostCommon(numbers) {
  const counts = new Map();
  for (const value of numbers) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  let best = numbers[0];
  for (const [value, count] of counts) {
    if (count > counts.get(best)) {
      best = value;
    }
  }
  return best;
}

console.log(mostCommon([4, 1, 4, 2, 4, 1]));`),
  pre(40, "first-unique-char", "First non-repeating letter", FR,
    "Return the first letter that appears only once, or an empty string if none does.",
    "word = \"swiss\" → \"w\"",
    "Two passes: count every letter, then walk the word again and return the first letter whose count is 1.",
    ["After the first loop `counts` is s:3, w:1, i:1.", "The second loop stops at w."],
    "O(n)", "O(k)",
    `function firstUnique(word) {
  const counts = new Map();
  for (const letter of word) {
    counts.set(letter, (counts.get(letter) || 0) + 1);
  }
  for (const letter of word) {
    if (counts.get(letter) === 1) {
      return letter;
    }
  }
  return "";
}

console.log(firstUnique("swiss"));`),
];
