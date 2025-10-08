import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "../shared/schema";
import * as assignmentSchema from "../shared/schema-assignments";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, {
  schema: {
    ...schema,
    ...assignmentSchema,
  },
});

// Challenges data
const challenges = [
  {
    id: "challenge-1",
    title: "Prime Number Generator",
    description:
      "Write a function that returns all prime numbers up to N using the Sieve of Eratosthenes algorithm. The function should be efficient and handle edge cases properly.",
    language: "python",
    difficultyLevel: 6 as const,
    pointsReward: 50,
    createdBy: "user-1",
    createdAt: new Date("2024-01-20T10:00:00"),
    isActive: true,
  },
  {
    id: "challenge-2",
    title: "Two Sum Problem",
    description:
      "Given an array of integers and a target sum, find two numbers that add up to the target. Return the indices of the two numbers. Optimize for time complexity.",
    language: "python",
    difficultyLevel: 4 as const,
    pointsReward: 30,
    createdBy: "user-2",
    createdAt: new Date("2024-01-22T14:30:00"),
    isActive: true,
  },
  {
    id: "challenge-3",
    title: "Palindrome Checker",
    description:
      "Create a function that checks if a string is a palindrome, ignoring case, spaces, and punctuation. Handle both iterative and recursive approaches.",
    language: "javascript",
    difficultyLevel: 3 as const,
    pointsReward: 25,
    createdBy: "user-3",
    createdAt: new Date("2024-01-25T09:15:00"),
    isActive: true,
  },
  {
    id: "challenge-4",
    title: "Binary Tree Level Order Traversal",
    description:
      "Implement a function that performs level-order traversal of a binary tree and returns the values in each level as separate arrays.",
    language: "python",
    difficultyLevel: 7 as const,
    pointsReward: 60,
    createdBy: "user-1",
    createdAt: new Date("2024-02-01T16:00:00"),
    isActive: true,
  },
  {
    id: "challenge-5",
    title: "LRU Cache Implementation",
    description:
      "Design and implement a Least Recently Used (LRU) cache with O(1) time complexity for both get and put operations.",
    language: "python",
    difficultyLevel: 8 as const,
    pointsReward: 80,
    createdBy: "user-2",
    createdAt: new Date("2024-02-05T11:45:00"),
    isActive: true,
  },
];

// Challenge submissions
const challengeSubmissions = [
  {
    id: "submission-1-1",
    challengeId: "challenge-1",
    userId: "user-2",
    code: "def sieve_of_eratosthenes(n):\n    if n < 2:\n        return []\n    \n    is_prime = [True] * (n + 1)\n    is_prime[0] = is_prime[1] = False\n    \n    for i in range(2, int(n ** 0.5) + 1):\n        if is_prime[i]:\n            for j in range(i * i, n + 1, i):\n                is_prime[j] = False\n    \n    return [i for i in range(2, n + 1) if is_prime[i]]\n\n# Test the function\nprint(sieve_of_eratosthenes(30))",
    language: "python",
    isCorrect: true,
    executionTime: 0.045,
    memoryUsage: 1024,
    submittedAt: new Date("2024-01-25T15:30:00"),
  },
  {
    id: "submission-1-2",
    challengeId: "challenge-1",
    userId: "user-3",
    code: "def find_primes(n):\n    primes = []\n    for num in range(2, n + 1):\n        is_prime = True\n        for i in range(2, int(num ** 0.5) + 1):\n            if num % i == 0:\n                is_prime = False\n                break\n        if is_prime:\n            primes.append(num)\n    return primes\n\nprint(find_primes(30))",
    language: "python",
    isCorrect: true,
    executionTime: 0.123,
    memoryUsage: 512,
    submittedAt: new Date("2024-01-28T10:15:00"),
  },
  {
    id: "submission-2-1",
    challengeId: "challenge-2",
    userId: "user-1",
    code: "def two_sum(nums, target):\n    hash_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in hash_map:\n            return [hash_map[complement], i]\n        hash_map[num] = i\n    return []\n\n# Test\nnums = [2, 7, 11, 15]\ntarget = 9\nprint(two_sum(nums, target))  # [0, 1]",
    language: "python",
    isCorrect: true,
    executionTime: 0.012,
    memoryUsage: 256,
    submittedAt: new Date("2024-01-23T14:45:00"),
  },
  {
    id: "submission-2-2",
    challengeId: "challenge-2",
    userId: "user-3",
    code: "function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));",
    language: "javascript",
    isCorrect: true,
    executionTime: 0.008,
    memoryUsage: 128,
    submittedAt: new Date("2024-01-24T16:20:00"),
  },
  {
    id: "submission-3-1",
    challengeId: "challenge-3",
    userId: "user-1",
    code: "function isPalindrome(str) {\n    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');\n    return cleaned === cleaned.split('').reverse().join('');\n}\n\n// Test cases\nconsole.log(isPalindrome('A man, a plan, a canal: Panama')); // true\nconsole.log(isPalindrome('race a car')); // false",
    language: "javascript",
    isCorrect: true,
    executionTime: 0.015,
    memoryUsage: 64,
    submittedAt: new Date("2024-01-26T11:30:00"),
  },
  {
    id: "submission-3-2",
    challengeId: "challenge-3",
    userId: "user-2",
    code: "def is_palindrome(s):\n    cleaned = ''.join(c.lower() for c in s if c.isalnum())\n    left, right = 0, len(cleaned) - 1\n    \n    while left < right:\n        if cleaned[left] != cleaned[right]:\n            return False\n        left += 1\n        right -= 1\n    \n    return True\n\nprint(is_palindrome('A man, a plan, a canal: Panama'))\nprint(is_palindrome('race a car'))",
    language: "python",
    isCorrect: true,
    executionTime: 0.02,
    memoryUsage: 96,
    submittedAt: new Date("2024-01-27T13:45:00"),
  },
  {
    id: "submission-4-1",
    challengeId: "challenge-4",
    userId: "user-2",
    code: "from collections import deque\n\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef level_order(root):\n    if not root:\n        return []\n    \n    result = []\n    queue = deque([root])\n    \n    while queue:\n        level_size = len(queue)\n        level = []\n        \n        for _ in range(level_size):\n            node = queue.popleft()\n            level.append(node.val)\n            \n            if node.left:\n                queue.append(node.left)\n            if node.right:\n                queue.append(node.right)\n        \n        result.append(level)\n    \n    return result",
    language: "python",
    isCorrect: true,
    executionTime: 0.035,
    memoryUsage: 512,
    submittedAt: new Date("2024-02-03T12:00:00"),
  },
  {
    id: "submission-5-1",
    challengeId: "challenge-5",
    userId: "user-3",
    code: "from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.capacity = capacity\n        self.cache = OrderedDict()\n    \n    def get(self, key):\n        if key in self.cache:\n            # Move to end (most recently used)\n            self.cache.move_to_end(key)\n            return self.cache[key]\n        return -1\n    \n    def put(self, key, value):\n        if key in self.cache:\n            # Update existing key\n            self.cache.move_to_end(key)\n        else:\n            # Check capacity\n            if len(self.cache) >= self.capacity:\n                # Remove least recently used (first item)\n                self.cache.popitem(last=False)\n        \n        self.cache[key] = value",
    language: "python",
    isCorrect: true,
    executionTime: 0.025,
    memoryUsage: 256,
    submittedAt: new Date("2024-02-07T15:30:00"),
  },
];

// Learning pathways
const learningPathways = [
  {
    id: "pathway-1",
    title: "Python Basics Crash Course",
    description:
      "Learn the fundamentals of Python programming from variables to functions",
    difficulty: 3 as const,
    estimatedDurationHours: 12,
    isActive: true,
    createdBy: "user-1",
    createdAt: new Date("2024-01-15T09:00:00"),
  },
  {
    id: "pathway-2",
    title: "Data Structures and Algorithms",
    description:
      "Master essential data structures and algorithms for technical interviews",
    difficulty: 7 as const,
    estimatedDurationHours: 40,
    isActive: true,
    createdBy: "user-2",
    createdAt: new Date("2024-01-18T14:30:00"),
  },
  {
    id: "pathway-3",
    title: "Web Development Fundamentals",
    description:
      "Learn HTML, CSS, JavaScript, and basic web development concepts",
    difficulty: 4 as const,
    estimatedDurationHours: 25,
    isActive: true,
    createdBy: "user-3",
    createdAt: new Date("2024-01-22T11:15:00"),
  },
];

// Pathway checkpoints
const pathwayCheckpoints = [
  // Python Basics pathway
  {
    id: "checkpoint-1-1",
    pathwayId: "pathway-1",
    checkpointOrder: 1,
    title: "Variables and Data Types",
    description:
      "Learn about Python variables, strings, numbers, and basic data types",
    competencyRequirement:
      "Understanding of Python variable assignment and data type basics",
    pointsReward: 15,
    status: "available" as const,
    createdAt: new Date("2024-01-15T09:00:00"),
  },
  {
    id: "checkpoint-1-2",
    pathwayId: "pathway-1",
    checkpointOrder: 2,
    title: "Control Flow",
    description: "Master if/else statements, loops, and conditional logic",
    competencyRequirement: "Ability to write conditional statements and loops",
    pointsReward: 20,
    status: "available" as const,
    createdAt: new Date("2024-01-15T09:00:00"),
  },
  {
    id: "checkpoint-1-3",
    pathwayId: "pathway-1",
    checkpointOrder: 3,
    title: "Functions",
    description:
      "Create and use functions, understand parameters and return values",
    competencyRequirement:
      "Function definition, parameters, and return statements",
    pointsReward: 25,
    status: "available" as const,
    createdAt: new Date("2024-01-15T09:00:00"),
  },
  {
    id: "checkpoint-1-4",
    pathwayId: "pathway-1",
    checkpointOrder: 4,
    title: "Lists and Dictionaries",
    description: "Work with Python collections and data structures",
    competencyRequirement: "List and dictionary manipulation and methods",
    pointsReward: 30,
    status: "available" as const,
    createdAt: new Date("2024-01-15T09:00:00"),
  },

  // Data Structures pathway
  {
    id: "checkpoint-2-1",
    pathwayId: "pathway-2",
    checkpointOrder: 1,
    title: "Arrays and Strings",
    description: "Master array manipulation and string algorithms",
    competencyRequirement:
      "Array traversal, string processing, and basic algorithms",
    pointsReward: 25,
    status: "available" as const,
    createdAt: new Date("2024-01-18T14:30:00"),
  },
  {
    id: "checkpoint-2-2",
    pathwayId: "pathway-2",
    checkpointOrder: 2,
    title: "Linked Lists",
    description: "Understand and implement linked list operations",
    competencyRequirement:
      "Linked list traversal, insertion, deletion, and reversal",
    pointsReward: 30,
    status: "available" as const,
    createdAt: new Date("2024-01-18T14:30:00"),
  },
  {
    id: "checkpoint-2-3",
    pathwayId: "pathway-2",
    checkpointOrder: 3,
    title: "Stacks and Queues",
    description: "Implement and use stack and queue data structures",
    competencyRequirement:
      "Stack and queue operations, applications, and implementations",
    pointsReward: 25,
    status: "available" as const,
    createdAt: new Date("2024-01-18T14:30:00"),
  },
  {
    id: "checkpoint-2-4",
    pathwayId: "pathway-2",
    checkpointOrder: 4,
    title: "Trees and Graphs",
    description: "Work with tree and graph data structures and algorithms",
    competencyRequirement: "Tree traversal, graph algorithms, and pathfinding",
    pointsReward: 40,
    status: "available" as const,
    createdAt: new Date("2024-01-18T14:30:00"),
  },

  // Web Development pathway
  {
    id: "checkpoint-3-1",
    pathwayId: "pathway-3",
    checkpointOrder: 1,
    title: "HTML Fundamentals",
    description: "Learn HTML structure, elements, and semantic markup",
    competencyRequirement: "HTML document structure and semantic elements",
    pointsReward: 20,
    status: "available" as const,
    createdAt: new Date("2024-01-22T11:15:00"),
  },
  {
    id: "checkpoint-3-2",
    pathwayId: "pathway-3",
    checkpointOrder: 2,
    title: "CSS Styling",
    description: "Master CSS selectors, layout, and responsive design",
    competencyRequirement: "CSS styling, flexbox, grid, and responsive design",
    pointsReward: 25,
    status: "available" as const,
    createdAt: new Date("2024-01-22T11:15:00"),
  },
  {
    id: "checkpoint-3-3",
    pathwayId: "pathway-3",
    checkpointOrder: 3,
    title: "JavaScript Basics",
    description: "Learn JavaScript fundamentals and DOM manipulation",
    competencyRequirement: "JavaScript syntax, functions, and DOM manipulation",
    pointsReward: 30,
    status: "available" as const,
    createdAt: new Date("2024-01-22T11:15:00"),
  },
  {
    id: "checkpoint-3-4",
    pathwayId: "pathway-3",
    checkpointOrder: 4,
    title: "Interactive Web Pages",
    description: "Create interactive web pages with JavaScript events",
    competencyRequirement:
      "Event handling, form validation, and interactive features",
    pointsReward: 35,
    status: "available" as const,
    createdAt: new Date("2024-01-22T11:15:00"),
  },
];

async function insertChallengesAndPaths() {
  console.log("🚀 Starting challenges and pathways insertion...");

  try {
    // Insert challenges
    console.log("📝 Inserting challenges...");
    await db.insert(schema.challenges).values(challenges);
    console.log(`✅ Inserted ${challenges.length} challenges`);

    // Insert challenge submissions
    console.log("📝 Inserting challenge submissions...");
    await db.insert(schema.challengeSubmissions).values(challengeSubmissions);
    console.log(
      `✅ Inserted ${challengeSubmissions.length} challenge submissions`
    );

    // Insert learning pathways
    console.log("📝 Inserting learning pathways...");
    await db.insert(schema.learningPathways).values(learningPathways);
    console.log(`✅ Inserted ${learningPathways.length} learning pathways`);

    // Insert pathway checkpoints
    console.log("📝 Inserting pathway checkpoints...");
    await db.insert(schema.pathwayCheckpoints).values(pathwayCheckpoints);
    console.log(`✅ Inserted ${pathwayCheckpoints.length} pathway checkpoints`);

    console.log("🎉 Challenges and pathways insertion completed successfully!");
  } catch (error) {
    console.error("❌ Error inserting challenges and pathways:", error);
    throw error;
  }
}

// Run the script
insertChallengesAndPaths()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
