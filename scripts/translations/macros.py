"""Shared helper blocks. Write %NAME on its own line inside a language section."""
M = {}
M["LIST"] = {
 "python": ["class ListNode:", "    def __init__(self, value, next_node=None):", "        self.val = value", "        self.next = next_node", ".", "."],
 "java": ["static class ListNode {", "~    int val; ListNode next;", "~    ListNode(int value) { this(value, null); }", "    ListNode(int value, ListNode nextNode) {", "        this.val = value;", "        this.next = nextNode;", "    }", "}"],
 "cpp": ["struct ListNode {", "~    int val; ListNode* next;", "    ListNode(int value, ListNode* nextNode = nullptr) {", "        this->val = value;", "        this->next = nextNode;", "    }", "};"],
}
M["TREE"] = {
 "python": ["class TreeNode:", "    def __init__(self, value, left=None, right=None):", "        self.val = value", "        self.left = left", "        self.right = right", ".", "."],
 "java": ["static class TreeNode {", "~    int val; TreeNode left, right;", "~    TreeNode(int value) { this(value, null, null); }", "    TreeNode(int value, TreeNode left, TreeNode right) {", "        this.val = value;", "        this.left = left;", "        this.right = right;", "    }", "}"],
 "cpp": ["struct TreeNode {", "~    int val; TreeNode *left, *right;", "    TreeNode(int value, TreeNode* left = nullptr, TreeNode* right = nullptr) {", "        this->val = value;", "        this->left = left;", "        this->right = right;", "    }", "};"],
}
M["FROMARRAY"] = {
 "python": ["def from_array(values):", "    list_head = None", "    for value_index in range(len(values) - 1, -1, -1): list_head = ListNode(values[value_index], list_head)", "    return list_head", "."],
 "java": ["static ListNode fromArray(int[] values) {", "    ListNode listHead = null;", "    for (int valueIndex = values.length - 1; valueIndex >= 0; valueIndex--) listHead = new ListNode(values[valueIndex], listHead);", "    return listHead;", "}"],
 "cpp": ["ListNode* fromArray(vector<int> values) {", "    ListNode* listHead = nullptr;", "    for (int valueIndex = values.size() - 1; valueIndex >= 0; valueIndex--) listHead = new ListNode(values[valueIndex], listHead);", "    return listHead;", "}"],
}
M["TOARRAY"] = {
 "python": ["def to_array(list_head):", "    result = []", "    current_node = list_head", "~    while current_node: result.append(current_node.val); current_node = current_node.next", "    return result", "."],
 "java": ["static List<Integer> toArray(ListNode listHead) {", "    List<Integer> result = new ArrayList<>();", "    for (ListNode currentNode = listHead; currentNode != null; currentNode = currentNode.next) result.add(currentNode.val);", "    return result;", "}"],
 "cpp": ["vector<int> toArray(ListNode* listHead) {", "    vector<int> result;", "    for (ListNode* currentNode = listHead; currentNode; currentNode = currentNode->next) result.push_back(currentNode->val);", "    return result;", "}"],
}
# toLevels: 12 JS lines (function ... closing brace)
M["TOLEVELS"] = {
 "python": ["def to_levels(tree_root):", "    result = []", "    queue = [tree_root]", "    queue_front_index = 0", "    while queue_front_index < len(queue):", "        current_node = queue[queue_front_index]; queue_front_index += 1", "        result.append(current_node.val)", "        if current_node.left: queue.append(current_node.left)", "        if current_node.right: queue.append(current_node.right)", ".", "    return result", "."],
 "java": ["static List<Integer> toLevels(TreeNode treeRoot) {", "    List<Integer> result = new ArrayList<>();", "    List<TreeNode> queue = new ArrayList<>(List.of(treeRoot));", "    int queueFrontIndex = 0;", "    while (queueFrontIndex < queue.size()) {", "        TreeNode currentNode = queue.get(queueFrontIndex++);", "        result.add(currentNode.val);", "        if (currentNode.left != null) queue.add(currentNode.left);", "        if (currentNode.right != null) queue.add(currentNode.right);", "    }", "    return result;", "}"],
 "cpp": ["vector<int> toLevels(TreeNode* treeRoot) {", "    vector<int> result;", "    vector<TreeNode*> queue = {treeRoot};", "    int queueFrontIndex = 0;", "    while (queueFrontIndex < queue.size()) {", "        TreeNode* currentNode = queue[queueFrontIndex++];", "        result.push_back(currentNode->val);", "        if (currentNode->left) queue.push_back(currentNode->left);", "        if (currentNode->right) queue.push_back(currentNode->right);", "    }", "    return result;", "}"],
}
