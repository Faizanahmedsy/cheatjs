import type { TranslationSet } from "./index";

/** Keys are "example:<id>". Format of each line: "<JS line>|<code>" (see index.ts). */
export const EXAMPLE_TRANSLATIONS: Record<string, TranslationSet> = {
  "example:linear-search": {
    python: `
1|def linear_search(arr, target):
2|    for i in range(len(arr)):
3|        if arr[i] == target:
4|            return i
7|    return -1
-|
10|nums = [7, 2, 9, 4, 5]
11|print(linear_search(nums, 4))
`,
    java: `
-|public class Main {
1|    static int linearSearch(int[] arr, int target) {
2|        for (int i = 0; i < arr.length; i++) {
3|            if (arr[i] == target) {
4|                return i;
5|            }
6|        }
7|        return -1;
8|    }
-|
-|    public static void main(String[] args) {
10|        int[] nums = {7, 2, 9, 4, 5};
11|        System.out.println(linearSearch(nums, 4));
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|#include <vector>
-|using namespace std;
-|
1|int linearSearch(vector<int>& arr, int target) {
2|    for (int i = 0; i < arr.size(); i++) {
3|        if (arr[i] == target) {
4|            return i;
5|        }
6|    }
7|    return -1;
8|}
-|
-|int main() {
10|    vector<int> nums = {7, 2, 9, 4, 5};
11|    cout << linearSearch(nums, 4) << endl;
-|}
`,
  },

  "example:binary-search": {
    python: `
1|def binary_search(arr, target):
2|    lo = 0
3|    hi = len(arr) - 1
4|    while lo <= hi:
5|        mid = (lo + hi) // 2
6|        if arr[mid] == target:
7|            return mid
8|        elif arr[mid] < target:
9|            lo = mid + 1
10|        else:
11|            hi = mid - 1
14|    return -1
-|
17|sorted_nums = [1, 3, 5, 7, 9, 11, 13]
18|print(binary_search(sorted_nums, 11))
`,
    java: `
-|public class Main {
1|    static int binarySearch(int[] arr, int target) {
2|        int lo = 0;
3|        int hi = arr.length - 1;
4|        while (lo <= hi) {
5|            int mid = (lo + hi) / 2;
6|            if (arr[mid] == target) {
7|                return mid;
8|            } else if (arr[mid] < target) {
9|                lo = mid + 1;
10|            } else {
11|                hi = mid - 1;
12|            }
13|        }
14|        return -1;
15|    }
-|
-|    public static void main(String[] args) {
17|        int[] sorted = {1, 3, 5, 7, 9, 11, 13};
18|        System.out.println(binarySearch(sorted, 11));
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|#include <vector>
-|using namespace std;
-|
1|int binarySearch(vector<int>& arr, int target) {
2|    int lo = 0;
3|    int hi = arr.size() - 1;
4|    while (lo <= hi) {
5|        int mid = (lo + hi) / 2;
6|        if (arr[mid] == target) {
7|            return mid;
8|        } else if (arr[mid] < target) {
9|            lo = mid + 1;
10|        } else {
11|            hi = mid - 1;
12|        }
13|    }
14|    return -1;
15|}
-|
-|int main() {
17|    vector<int> sorted = {1, 3, 5, 7, 9, 11, 13};
18|    cout << binarySearch(sorted, 11) << endl;
-|}
`,
  },

  "example:reverse-two-pointers": {
    python: `
1|def reverse_array(arr):
2|    left = 0
3|    right = len(arr) - 1
4|    while left < right:
5|        arr[left], arr[right] = arr[right], arr[left]
6|        left += 1
7|        right -= 1
9|    return arr
-|
12|print(reverse_array([1, 2, 3, 4, 5, 6]))
`,
    java: `
-|import java.util.*;
-|
-|public class Main {
1|    static int[] reverseArray(int[] arr) {
2|        int left = 0;
3|        int right = arr.length - 1;
4|        while (left < right) {
5|            int tmp = arr[left]; arr[left] = arr[right]; arr[right] = tmp;
6|            left++;
7|            right--;
8|        }
9|        return arr;
10|    }
-|
-|    public static void main(String[] args) {
12|        System.out.println(Arrays.toString(reverseArray(new int[]{1, 2, 3, 4, 5, 6})));
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|#include <vector>
-|#include <algorithm>
-|using namespace std;
-|
1|vector<int> reverseArray(vector<int> arr) {
2|    int left = 0;
3|    int right = arr.size() - 1;
4|    while (left < right) {
5|        swap(arr[left], arr[right]);
6|        left++;
7|        right--;
8|    }
9|    return arr;
10|}
-|
-|int main() {
12|    for (int x : reverseArray({1, 2, 3, 4, 5, 6})) cout << x << " ";
-|}
`,
  },

  "example:pair-sum": {
    python: `
1|def pair_sum(arr, target):
2|    left = 0
3|    right = len(arr) - 1
4|    while left < right:
5|        total = arr[left] + arr[right]
6|        if total == target:
7|            return [left, right]
8|        elif total < target:
9|            left += 1
10|        else:
11|            right -= 1
14|    return None
-|
17|print(pair_sum([1, 2, 4, 6, 8, 11], 10))
`,
    java: `
-|import java.util.*;
-|
-|public class Main {
1|    static int[] pairSum(int[] arr, int target) {
2|        int left = 0;
3|        int right = arr.length - 1;
4|        while (left < right) {
5|            int sum = arr[left] + arr[right];
6|            if (sum == target) {
7|                return new int[]{left, right};
8|            } else if (sum < target) {
9|                left++;
10|            } else {
11|                right--;
12|            }
13|        }
14|        return null;
15|    }
-|
-|    public static void main(String[] args) {
17|        System.out.println(Arrays.toString(pairSum(new int[]{1, 2, 4, 6, 8, 11}, 10)));
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|#include <vector>
-|using namespace std;
-|
1|vector<int> pairSum(vector<int>& arr, int target) {
2|    int left = 0;
3|    int right = arr.size() - 1;
4|    while (left < right) {
5|        int sum = arr[left] + arr[right];
6|        if (sum == target) {
7|            return {left, right};
8|        } else if (sum < target) {
9|            left++;
10|        } else {
11|            right--;
12|        }
13|    }
14|    return {};
15|}
-|
-|int main() {
16|    vector<int> a = {1, 2, 4, 6, 8, 11};
17|    for (int x : pairSum(a, 10)) cout << x << " ";
-|}
`,
  },

  "example:sliding-window": {
    python: `
1|def max_sum_of_k(arr, k):
2|    window_sum = 0
3|    for i in range(k):
4|        window_sum += arr[i]
6|    best = window_sum
7|    for end in range(k, len(arr)):
8|        start = end - k
9|        window_sum += arr[end] - arr[start]
10|        best = max(best, window_sum)
12|    return best
-|
15|print(max_sum_of_k([2, 1, 5, 1, 3, 2], 3))
`,
    java: `
-|public class Main {
1|    static int maxSumOfK(int[] arr, int k) {
2|        int windowSum = 0;
3|        for (int i = 0; i < k; i++) {
4|            windowSum += arr[i];
5|        }
6|        int best = windowSum;
7|        for (int end = k; end < arr.length; end++) {
8|            int start = end - k;
9|            windowSum += arr[end] - arr[start];
10|            best = Math.max(best, windowSum);
11|        }
12|        return best;
13|    }
-|
-|    public static void main(String[] args) {
15|        System.out.println(maxSumOfK(new int[]{2, 1, 5, 1, 3, 2}, 3));
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|#include <vector>
-|#include <algorithm>
-|using namespace std;
-|
1|int maxSumOfK(vector<int>& arr, int k) {
2|    int windowSum = 0;
3|    for (int i = 0; i < k; i++) {
4|        windowSum += arr[i];
5|    }
6|    int best = windowSum;
7|    for (int end = k; end < arr.size(); end++) {
8|        int start = end - k;
9|        windowSum += arr[end] - arr[start];
10|        best = max(best, windowSum);
11|    }
12|    return best;
13|}
-|
-|int main() {
-|    vector<int> a = {2, 1, 5, 1, 3, 2};
15|    cout << maxSumOfK(a, 3) << endl;
-|}
`,
  },

  "example:bubble-sort": {
    python: `
1|def bubble_sort(arr):
2|    n = len(arr)
3|    for i in range(n - 1):
4|        for j in range(n - 1 - i):
5|            if arr[j] > arr[j + 1]:
6|                arr[j], arr[j + 1] = arr[j + 1], arr[j]
10|    return arr
-|
13|print(bubble_sort([5, 3, 8, 1, 4]))
`,
    java: `
-|import java.util.*;
-|
-|public class Main {
1|    static int[] bubbleSort(int[] arr) {
2|        int n = arr.length;
3|        for (int i = 0; i < n - 1; i++) {
4|            for (int j = 0; j < n - 1 - i; j++) {
5|                if (arr[j] > arr[j + 1]) {
6|                    int tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp;
7|                }
8|            }
9|        }
10|        return arr;
11|    }
-|
-|    public static void main(String[] args) {
13|        System.out.println(Arrays.toString(bubbleSort(new int[]{5, 3, 8, 1, 4})));
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|#include <vector>
-|#include <algorithm>
-|using namespace std;
-|
1|vector<int> bubbleSort(vector<int> arr) {
2|    int n = arr.size();
3|    for (int i = 0; i < n - 1; i++) {
4|        for (int j = 0; j < n - 1 - i; j++) {
5|            if (arr[j] > arr[j + 1]) {
6|                swap(arr[j], arr[j + 1]);
7|            }
8|        }
9|    }
10|    return arr;
11|}
-|
-|int main() {
13|    for (int x : bubbleSort({5, 3, 8, 1, 4})) cout << x << " ";
-|}
`,
  },

  "example:selection-sort": {
    python: `
1|def selection_sort(arr):
2|    for i in range(len(arr) - 1):
3|        min_idx = i
4|        for j in range(i + 1, len(arr)):
5|            if arr[j] < arr[min_idx]:
6|                min_idx = j
9|        if min_idx != i:
10|            arr[i], arr[min_idx] = arr[min_idx], arr[i]
13|    return arr
-|
16|print(selection_sort([29, 10, 14, 37, 13]))
`,
    java: `
-|import java.util.*;
-|
-|public class Main {
1|    static int[] selectionSort(int[] arr) {
2|        for (int i = 0; i < arr.length - 1; i++) {
3|            int minIdx = i;
4|            for (int j = i + 1; j < arr.length; j++) {
5|                if (arr[j] < arr[minIdx]) {
6|                    minIdx = j;
7|                }
8|            }
9|            if (minIdx != i) {
10|                int tmp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = tmp;
11|            }
12|        }
13|        return arr;
14|    }
-|
-|    public static void main(String[] args) {
16|        System.out.println(Arrays.toString(selectionSort(new int[]{29, 10, 14, 37, 13})));
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|#include <vector>
-|#include <algorithm>
-|using namespace std;
-|
1|vector<int> selectionSort(vector<int> arr) {
2|    for (int i = 0; i < arr.size() - 1; i++) {
3|        int minIdx = i;
4|        for (int j = i + 1; j < arr.size(); j++) {
5|            if (arr[j] < arr[minIdx]) {
6|                minIdx = j;
7|            }
8|        }
9|        if (minIdx != i) {
10|            swap(arr[i], arr[minIdx]);
11|        }
12|    }
13|    return arr;
14|}
-|
-|int main() {
16|    for (int x : selectionSort({29, 10, 14, 37, 13})) cout << x << " ";
-|}
`,
  },

  "example:insertion-sort": {
    python: `
1|def insertion_sort(arr):
2|    for i in range(1, len(arr)):
3|        key = arr[i]
4|        j = i - 1
5|        while j >= 0 and arr[j] > key:
6|            arr[j + 1] = arr[j]
7|            j -= 1
9|        arr[j + 1] = key
11|    return arr
-|
14|print(insertion_sort([4, 3, 5, 1, 2]))
`,
    java: `
-|import java.util.*;
-|
-|public class Main {
1|    static int[] insertionSort(int[] arr) {
2|        for (int i = 1; i < arr.length; i++) {
3|            int key = arr[i];
4|            int j = i - 1;
5|            while (j >= 0 && arr[j] > key) {
6|                arr[j + 1] = arr[j];
7|                j--;
8|            }
9|            arr[j + 1] = key;
10|        }
11|        return arr;
12|    }
-|
-|    public static void main(String[] args) {
14|        System.out.println(Arrays.toString(insertionSort(new int[]{4, 3, 5, 1, 2})));
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|#include <vector>
-|using namespace std;
-|
1|vector<int> insertionSort(vector<int> arr) {
2|    for (int i = 1; i < arr.size(); i++) {
3|        int key = arr[i];
4|        int j = i - 1;
5|        while (j >= 0 && arr[j] > key) {
6|            arr[j + 1] = arr[j];
7|            j--;
8|        }
9|        arr[j + 1] = key;
10|    }
11|    return arr;
12|}
-|
-|int main() {
14|    for (int x : insertionSort({4, 3, 5, 1, 2})) cout << x << " ";
-|}
`,
  },

  "example:two-sum": {
    python: `
1|def two_sum(nums, target):
2|    seen = {}
3|    for i in range(len(nums)):
4|        need = target - nums[i]
5|        if need in seen:
6|            return [seen[need], i]
8|        seen[nums[i]] = i
10|    return None
-|
13|print(two_sum([2, 7, 11, 15], 26))
`,
    java: `
-|import java.util.*;
-|
-|public class Main {
1|    static int[] twoSum(int[] nums, int target) {
2|        Map<Integer, Integer> seen = new HashMap<>();
3|        for (int i = 0; i < nums.length; i++) {
4|            int need = target - nums[i];
5|            if (seen.containsKey(need)) {
6|                return new int[]{seen.get(need), i};
7|            }
8|            seen.put(nums[i], i);
9|        }
10|        return null;
11|    }
-|
-|    public static void main(String[] args) {
13|        System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 26)));
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|#include <vector>
-|#include <unordered_map>
-|using namespace std;
-|
1|vector<int> twoSum(vector<int>& nums, int target) {
2|    unordered_map<int, int> seen;
3|    for (int i = 0; i < nums.size(); i++) {
4|        int need = target - nums[i];
5|        if (seen.count(need)) {
6|            return {seen[need], i};
7|        }
8|        seen[nums[i]] = i;
9|    }
10|    return {};
11|}
-|
-|int main() {
-|    vector<int> nums = {2, 7, 11, 15};
13|    for (int x : twoSum(nums, 26)) cout << x << " ";
-|}
`,
  },

  "example:fibonacci": {
    python: `
1|def fib(n):
2|    if n <= 1:
3|        return n
5|    return fib(n - 1) + fib(n - 2)
-|
8|print(fib(4))
`,
    java: `
-|public class Main {
1|    static int fib(int n) {
2|        if (n <= 1) {
3|            return n;
4|        }
5|        return fib(n - 1) + fib(n - 2);
6|    }
-|
-|    public static void main(String[] args) {
8|        System.out.println(fib(4));
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|using namespace std;
-|
1|int fib(int n) {
2|    if (n <= 1) {
3|        return n;
4|    }
5|    return fib(n - 1) + fib(n - 2);
6|}
-|
-|int main() {
8|    cout << fib(4) << endl;
-|}
`,
  },

  "example:factorial": {
    python: `
1|def factorial(n):
2|    if n <= 1:
3|        return 1
5|    return n * factorial(n - 1)
-|
8|print(factorial(4))
`,
    java: `
-|public class Main {
1|    static int factorial(int n) {
2|        if (n <= 1) {
3|            return 1;
4|        }
5|        return n * factorial(n - 1);
6|    }
-|
-|    public static void main(String[] args) {
8|        System.out.println(factorial(4));
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|using namespace std;
-|
1|int factorial(int n) {
2|    if (n <= 1) {
3|        return 1;
4|    }
5|    return n * factorial(n - 1);
6|}
-|
-|int main() {
8|    cout << factorial(4) << endl;
-|}
`,
  },

  "example:balanced-brackets": {
    python: `
1|def is_balanced(text):
2|    pairs = {")": "(", "]": "[", "}": "{"}
3|    stack = []
4|    for ch in text:
5|        if ch == "(" or ch == "[" or ch == "{":
6|            stack.append(ch)
7|        elif (stack.pop() if stack else None) != pairs.get(ch):
8|            return False
11|    return len(stack) == 0
-|
14|print(is_balanced("{[()]}"))
`,
    java: `
-|import java.util.*;
-|
-|public class Main {
1|    static boolean isBalanced(String text) {
2|        Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');
3|        Deque<Character> stack = new ArrayDeque<>();
4|        for (char ch : text.toCharArray()) {
5|            if (ch == '(' || ch == '[' || ch == '{') {
6|                stack.push(ch);
7|            } else if (stack.isEmpty() || !stack.pop().equals(pairs.get(ch))) {
8|                return false;
9|            }
10|        }
11|        return stack.isEmpty();
12|    }
-|
-|    public static void main(String[] args) {
14|        System.out.println(isBalanced("{[()]}"));
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|#include <stack>
-|#include <unordered_map>
-|#include <string>
-|using namespace std;
-|
1|bool isBalanced(string text) {
2|    unordered_map<char, char> pairs = {{')', '('}, {']', '['}, {'}', '{'}};
3|    stack<char> st;
4|    for (char ch : text) {
5|        if (ch == '(' || ch == '[' || ch == '{') {
6|            st.push(ch);
7|        } else if (st.empty() || st.top() != pairs[ch]) {
8|            return false;
9|        } else {
-|            st.pop();
9|        }
10|    }
11|    return st.empty();
12|}
-|
-|int main() {
14|    cout << boolalpha << isBalanced("{[()]}") << endl;
-|}
`,
  },

  "example:queue": {
    python: `
-|from collections import deque
-|
1|def serve_queue(people):
2|    queue = deque()
3|    for person in people:
4|        queue.append(person)
6|    served = []
7|    while len(queue) > 0:
8|        person = queue.popleft()
9|        served.append(person)
11|    return served
-|
14|print(serve_queue(["Ana", "Ben", "Cy"]))
`,
    java: `
-|import java.util.*;
-|
-|public class Main {
1|    static List<String> serveQueue(String[] people) {
2|        Queue<String> queue = new LinkedList<>();
3|        for (String person : people) {
4|            queue.add(person);
5|        }
6|        List<String> served = new ArrayList<>();
7|        while (queue.size() > 0) {
8|            String person = queue.poll();
9|            served.add(person);
10|        }
11|        return served;
12|    }
-|
-|    public static void main(String[] args) {
14|        System.out.println(serveQueue(new String[]{"Ana", "Ben", "Cy"}));
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|#include <queue>
-|#include <vector>
-|#include <string>
-|using namespace std;
-|
1|vector<string> serveQueue(vector<string>& people) {
2|    queue<string> q;
3|    for (string person : people) {
4|        q.push(person);
5|    }
6|    vector<string> served;
7|    while (q.size() > 0) {
8|        string person = q.front(); q.pop();
9|        served.push_back(person);
10|    }
11|    return served;
12|}
-|
-|int main() {
-|    vector<string> people = {"Ana", "Ben", "Cy"};
14|    for (string s : serveQueue(people)) cout << s << " ";
-|}
`,
  },

  "example:reverse-linked-list": {
    python: `
1|class Node:
2|    def __init__(self, value, next=None):
3|        self.value = value
4|        self.next = next
-|
-|
8|def reverse_list(head):
9|    prev = None
10|    curr = head
11|    while curr is not None:
12|        nxt = curr.next
13|        curr.next = prev
14|        prev = curr
15|        curr = nxt
17|    return prev
-|
-|
20|head = Node(1, Node(2, Node(3)))
21|print(reverse_list(head).value)
`,
    java: `
-|public class Main {
1|    static class Node {
2|        int value; Node next;
2|        Node(int value, Node next) {
3|            this.value = value;
4|            this.next = next;
5|        }
6|    }
-|
8|    static Node reverseList(Node head) {
9|        Node prev = null;
10|        Node curr = head;
11|        while (curr != null) {
12|            Node next = curr.next;
13|            curr.next = prev;
14|            prev = curr;
15|            curr = next;
16|        }
17|        return prev;
18|    }
-|
-|    public static void main(String[] args) {
20|        Node head = new Node(1, new Node(2, new Node(3, null)));
21|        System.out.println(reverseList(head).value);
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|using namespace std;
-|
1|struct Node {
2|    int value; Node* next;
2|    Node(int value, Node* next = nullptr) {
3|        this->value = value;
4|        this->next = next;
5|    }
6|};
-|
8|Node* reverseList(Node* head) {
9|    Node* prev = nullptr;
10|    Node* curr = head;
11|    while (curr != nullptr) {
12|        Node* next = curr->next;
13|        curr->next = prev;
14|        prev = curr;
15|        curr = next;
16|    }
17|    return prev;
18|}
-|
-|int main() {
20|    Node* head = new Node(1, new Node(2, new Node(3)));
21|    cout << reverseList(head)->value << endl;
-|}
`,
  },

  "example:matrix": {
    python: `
1|def grid_sum(grid):
2|    total = 0
3|    for row in range(len(grid)):
4|        for col in range(len(grid[row])):
5|            total += grid[row][col]
8|    return total
-|
11|grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
12|print(grid_sum(grid))
`,
    java: `
-|public class Main {
1|    static int gridSum(int[][] grid) {
2|        int total = 0;
3|        for (int row = 0; row < grid.length; row++) {
4|            for (int col = 0; col < grid[row].length; col++) {
5|                total += grid[row][col];
6|            }
7|        }
8|        return total;
9|    }
-|
-|    public static void main(String[] args) {
11|        int[][] grid = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
12|        System.out.println(gridSum(grid));
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|#include <vector>
-|using namespace std;
-|
1|int gridSum(vector<vector<int>>& grid) {
2|    int total = 0;
3|    for (int row = 0; row < grid.size(); row++) {
4|        for (int col = 0; col < grid[row].size(); col++) {
5|            total += grid[row][col];
6|        }
7|    }
8|    return total;
9|}
-|
-|int main() {
11|    vector<vector<int>> grid = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
12|    cout << gridSum(grid) << endl;
-|}
`,
  },

  "example:sum-array": {
    python: `
1|def sum_array(prices):
2|    total = 0
3|    for i in range(len(prices)):
4|        total = total + prices[i]
6|    return total
-|
9|print(sum_array([12, 5, 8, 20]))
`,
    java: `
-|public class Main {
1|    static int sumArray(int[] prices) {
2|        int sum = 0;
3|        for (int i = 0; i < prices.length; i++) {
4|            sum = sum + prices[i];
5|        }
6|        return sum;
7|    }
-|
-|    public static void main(String[] args) {
9|        System.out.println(sumArray(new int[]{12, 5, 8, 20}));
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|#include <vector>
-|using namespace std;
-|
1|int sumArray(vector<int>& prices) {
2|    int sum = 0;
3|    for (int i = 0; i < prices.size(); i++) {
4|        sum = sum + prices[i];
5|    }
6|    return sum;
7|}
-|
-|int main() {
-|    vector<int> prices = {12, 5, 8, 20};
9|    cout << sumArray(prices) << endl;
-|}
`,
  },

  "example:class": {
    python: `
1|class BankAccount:
2|    def __init__(self, owner):
3|        self.owner = owner
4|        self.balance = 0
-|
7|    def deposit(self, amount):
8|        self.balance += amount
9|        return self.balance
-|
-|
13|account = BankAccount("Sam")
14|account.deposit(50)
15|account.deposit(25)
16|print(vars(account))
`,
    java: `
-|public class Main {
1|    static class BankAccount {
2|        String owner; int balance;
2|        BankAccount(String owner) {
3|            this.owner = owner;
4|            this.balance = 0;
5|        }
-|
7|        int deposit(int amount) {
8|            this.balance += amount;
9|            return this.balance;
10|        }
11|    }
-|
-|    public static void main(String[] args) {
13|        BankAccount account = new BankAccount("Sam");
14|        account.deposit(50);
15|        account.deposit(25);
16|        System.out.println(account.owner + " " + account.balance);
-|    }
-|}
`,
    cpp: `
-|#include <iostream>
-|#include <string>
-|using namespace std;
-|
1|struct BankAccount {
2|    string owner; int balance;
2|    BankAccount(string owner) {
3|        this->owner = owner;
4|        this->balance = 0;
5|    }
-|
7|    int deposit(int amount) {
8|        this->balance += amount;
9|        return this->balance;
10|    }
11|};
-|
-|int main() {
13|    BankAccount account("Sam");
14|    account.deposit(50);
15|    account.deposit(25);
16|    cout << account.owner << " " << account.balance << endl;
-|}
`,
  },
};
