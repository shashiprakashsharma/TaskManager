export const baseQuestions = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    difficultyColor: "text-green-600 bg-green-100",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    hints: [
      "Use a hash map to store the complement of each number",
      "For each number, check if its complement exists in the map",
      "Time complexity: O(n), Space complexity: O(n)"
    ],
    testCases: [
      { input: "[2,7,11,15]\n9", output: "[0,1]" },
      { input: "[3,2,4]\n6", output: "[1,2]" },
      { input: "[3,3]\n6", output: "[0,1]" }
    ]
  },
  {
    id: 2,
    title: "Reverse Linked List",
    difficulty: "Easy",
    difficultyColor: "text-green-600 bg-green-100",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
        explanation: "The linked list is reversed."
      }
    ],
    constraints: [
      "The number of nodes in the list is the range [0, 5000]",
      "-5000 <= Node.val <= 5000"
    ],
    hints: [
      "Use three pointers: prev, current, and next",
      "Iterate through the list and reverse the links",
      "Time complexity: O(n), Space complexity: O(1)"
    ],
    testCases: [
      { input: "[1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "[1,2]", output: "[2,1]" },
      { input: "[]", output: "[]" }
    ]
  },
  {
    id: 3,
    title: "Binary Tree Inorder Traversal",
    difficulty: "Medium",
    difficultyColor: "text-yellow-600 bg-yellow-100",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    examples: [
      {
        input: "root = [1,null,2,3]",
        output: "[1,3,2]",
        explanation: "Inorder traversal: left -> root -> right"
      }
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 100]",
      "-100 <= Node.val <= 100"
    ],
    hints: [
      "Use recursion or iterative approach with stack",
      "Inorder: visit left subtree, then root, then right subtree",
      "Time complexity: O(n), Space complexity: O(h) where h is height"
    ],
    testCases: [
      { input: "[1,null,2,3]", output: "[1,3,2]" },
      { input: "[]", output: "[]" },
      { input: "[1]", output: "[1]" }
    ]
  },
  {
    id: 4,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    difficultyColor: "text-yellow-600 bg-yellow-100",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: "The answer is 'abc', with the length of 3."
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: "The answer is 'b', with the length of 1."
      }
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    hints: [
      "Use sliding window technique with two pointers",
      "Use a set to track characters in current window",
      "Time complexity: O(n), Space complexity: O(min(m,n))"
    ],
    testCases: [
      { input: '"abcabcbb"', output: "3" },
      { input: '"bbbbb"', output: "1" },
      { input: '"pwwkew"', output: "3" }
    ]
  },
  {
    id: 5,
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    difficultyColor: "text-red-600 bg-red-100",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
        explanation: "merged array = [1,2,3] and median is 2."
      }
    ],
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m <= 1000",
      "0 <= n <= 1000",
      "1 <= m + n <= 2000",
      "-10^6 <= nums1[i], nums2[i] <= 10^6"
    ],
    hints: [
      "Use binary search on the smaller array",
      "Partition both arrays such that left side has equal or one more element",
      "Time complexity: O(log(min(m,n))), Space complexity: O(1)"
    ],
    testCases: [
      { input: "[1,3]\n[2]", output: "2.00000" },
      { input: "[1,2]\n[3,4]", output: "2.50000" },
      { input: "[0,0]\n[0,0]", output: "0.00000" }
    ]
  }
];

// Programmatically extend to 200 questions to avoid bloating the file
const generated = [...baseQuestions];
const difficulties = [
  { label: 'Easy', color: 'text-green-600 bg-green-100' },
  { label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
  { label: 'Hard', color: 'text-red-600 bg-red-100' }
];

for (let i = baseQuestions.length + 1; i <= 200; i++) {
  const diff = difficulties[(i - 1) % difficulties.length];
  generated.push({
    id: i,
    title: `Practice Problem #${i}`,
    difficulty: diff.label,
    difficultyColor: diff.color,
    topic: ['Array', 'String', 'Hash Table', 'Math', 'Dynamic Programming'][i % 5],
    description: `Solve Practice Problem #${i}. Implement the function to pass all test cases.`,
    examples: [
      {
        input: `input for #${i}`,
        output: `expected output for #${i}`,
        explanation: `Example explanation for problem #${i}.`
      }
    ],
    constraints: [
      'Constraints vary per problem',
      'Aim for optimal time and space complexity'
    ],
    hints: [
      'Start with a brute-force idea and optimize',
      'Think about edge cases and input size limits'
    ],
    testCases: [
      { input: `sample-input-${i}-1`, output: `sample-output-${i}-1` },
      { input: `sample-input-${i}-2`, output: `sample-output-${i}-2` }
    ]
  });
}

export const dsaQuestions = generated;

export const getQuestionById = (id) => {
  return dsaQuestions.find(q => q.id === parseInt(id));
};

export const getQuestionsByDifficulty = (difficulty) => {
  return dsaQuestions.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
};


