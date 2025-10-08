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

// User points
const userPoints = [
  {
    userId: "user-1",
    totalPoints: 485,
    pointsEarnedToday: 50,
    lastEarnedAt: new Date("2024-02-01T13:00:00"),
    updatedAt: new Date("2024-02-01T13:00:00"),
  },
  {
    userId: "user-2",
    totalPoints: 520,
    pointsEarnedToday: 80,
    lastEarnedAt: new Date("2024-02-07T15:30:00"),
    updatedAt: new Date("2024-02-07T15:30:00"),
  },
  {
    userId: "user-3",
    totalPoints: 445,
    pointsEarnedToday: 35,
    lastEarnedAt: new Date("2024-02-11T18:30:00"),
    updatedAt: new Date("2024-02-11T18:30:00"),
  },
];

// Point transactions
const pointTransactions = [
  // User 1 transactions
  {
    id: "transaction-1-1",
    userId: "user-1",
    points: 10,
    transactionType: "earned" as const,
    sourceType: "milestone" as const,
    sourceId: "milestone-1-1",
    description: "Completed: Understand BST Structure",
    timestamp: new Date("2024-02-01T11:00:00"),
  },
  {
    id: "transaction-1-2",
    userId: "user-1",
    points: 15,
    transactionType: "earned" as const,
    sourceType: "milestone" as const,
    sourceId: "milestone-1-2",
    description: "Completed: Implement BST Construction",
    timestamp: new Date("2024-02-01T11:30:00"),
  },
  {
    id: "transaction-1-3",
    userId: "user-1",
    points: 20,
    transactionType: "earned" as const,
    sourceType: "milestone" as const,
    sourceId: "milestone-1-3",
    description: "Completed: Add Insertion Method",
    timestamp: new Date("2024-02-01T12:00:00"),
  },
  {
    id: "transaction-1-4",
    userId: "user-1",
    points: 15,
    transactionType: "earned" as const,
    sourceType: "milestone" as const,
    sourceId: "milestone-1-4",
    description: "Completed: Implement Search Function",
    timestamp: new Date("2024-02-01T12:30:00"),
  },
  {
    id: "transaction-1-5",
    userId: "user-1",
    points: 20,
    transactionType: "earned" as const,
    sourceType: "milestone" as const,
    sourceId: "milestone-1-5",
    description: "Completed: Add Tree Traversals",
    timestamp: new Date("2024-02-01T13:00:00"),
  },
  {
    id: "transaction-1-6",
    userId: "user-1",
    points: 30,
    transactionType: "earned" as const,
    sourceType: "challenge" as const,
    sourceId: "challenge-2",
    description: "Solved: Two Sum Problem",
    timestamp: new Date("2024-01-23T14:45:00"),
  },
  {
    id: "transaction-1-7",
    userId: "user-1",
    points: 25,
    transactionType: "earned" as const,
    sourceType: "challenge" as const,
    sourceId: "challenge-3",
    description: "Solved: Palindrome Checker",
    timestamp: new Date("2024-01-26T11:30:00"),
  },
  {
    id: "transaction-1-8",
    userId: "user-1",
    points: 10,
    transactionType: "spent" as const,
    sourceType: "ai_assistance" as const,
    sourceId: "ai-log-1",
    description: "AI Assistance: BST hint",
    timestamp: new Date("2024-02-01T10:45:00"),
  },

  // User 2 transactions
  {
    id: "transaction-2-1",
    userId: "user-2",
    points: 30,
    transactionType: "earned" as const,
    sourceType: "milestone" as const,
    sourceId: "milestone-4-1",
    description: "Completed: Knapsack Problem",
    timestamp: new Date("2024-02-03T17:30:00"),
  },
  {
    id: "transaction-2-2",
    userId: "user-2",
    points: 25,
    transactionType: "earned" as const,
    sourceType: "milestone" as const,
    sourceId: "milestone-4-2",
    description: "Completed: Longest Common Subsequence",
    timestamp: new Date("2024-02-03T18:00:00"),
  },
  {
    id: "transaction-2-3",
    userId: "user-2",
    points: 25,
    transactionType: "earned" as const,
    sourceType: "milestone" as const,
    sourceId: "milestone-4-3",
    description: "Completed: Edit Distance",
    timestamp: new Date("2024-02-03T18:30:00"),
  },
  {
    id: "transaction-2-4",
    userId: "user-2",
    points: 20,
    transactionType: "earned" as const,
    sourceType: "milestone" as const,
    sourceId: "milestone-4-4",
    description: "Completed: DP Pattern Analysis",
    timestamp: new Date("2024-02-03T19:00:00"),
  },
  {
    id: "transaction-2-5",
    userId: "user-2",
    points: 50,
    transactionType: "earned" as const,
    sourceType: "challenge" as const,
    sourceId: "challenge-1",
    description: "Solved: Prime Number Generator",
    timestamp: new Date("2024-01-25T15:30:00"),
  },
  {
    id: "transaction-2-6",
    userId: "user-2",
    points: 25,
    transactionType: "earned" as const,
    sourceType: "challenge" as const,
    sourceId: "challenge-3",
    description: "Solved: Palindrome Checker",
    timestamp: new Date("2024-01-27T13:45:00"),
  },
  {
    id: "transaction-2-7",
    userId: "user-2",
    points: 60,
    transactionType: "earned" as const,
    sourceType: "challenge" as const,
    sourceId: "challenge-4",
    description: "Solved: Binary Tree Level Order Traversal",
    timestamp: new Date("2024-02-03T12:00:00"),
  },
  {
    id: "transaction-2-8",
    userId: "user-2",
    points: 15,
    transactionType: "spent" as const,
    sourceType: "ai_assistance" as const,
    sourceId: "ai-log-2",
    description: "AI Assistance: Dynamic Programming hint",
    timestamp: new Date("2024-02-03T16:30:00"),
  },

  // User 3 transactions
  {
    id: "transaction-3-1",
    userId: "user-3",
    points: 20,
    transactionType: "earned" as const,
    sourceType: "milestone" as const,
    sourceId: "milestone-7-1",
    description: "Completed: Class Design",
    timestamp: new Date("2024-02-02T11:00:00"),
  },
  {
    id: "transaction-3-2",
    userId: "user-3",
    points: 25,
    transactionType: "earned" as const,
    sourceType: "milestone" as const,
    sourceId: "milestone-7-2",
    description: "Completed: Inheritance Hierarchy",
    timestamp: new Date("2024-02-02T11:30:00"),
  },
  {
    id: "transaction-3-3",
    userId: "user-3",
    points: 15,
    transactionType: "earned" as const,
    sourceType: "milestone" as const,
    sourceId: "milestone-7-3",
    description: "Completed: Encapsulation",
    timestamp: new Date("2024-02-02T12:00:00"),
  },
  {
    id: "transaction-3-4",
    userId: "user-3",
    points: 20,
    transactionType: "earned" as const,
    sourceType: "milestone" as const,
    sourceId: "milestone-7-4",
    description: "Completed: Polymorphism",
    timestamp: new Date("2024-02-02T13:00:00"),
  },
  {
    id: "transaction-3-5",
    userId: "user-3",
    points: 50,
    transactionType: "earned" as const,
    sourceType: "challenge" as const,
    sourceId: "challenge-1",
    description: "Solved: Prime Number Generator",
    timestamp: new Date("2024-01-28T10:15:00"),
  },
  {
    id: "transaction-3-6",
    userId: "user-3",
    points: 30,
    transactionType: "earned" as const,
    sourceType: "challenge" as const,
    sourceId: "challenge-2",
    description: "Solved: Two Sum Problem",
    timestamp: new Date("2024-01-24T16:20:00"),
  },
  {
    id: "transaction-3-7",
    userId: "user-3",
    points: 80,
    transactionType: "earned" as const,
    sourceType: "challenge" as const,
    sourceId: "challenge-5",
    description: "Solved: LRU Cache Implementation",
    timestamp: new Date("2024-02-07T15:30:00"),
  },
  {
    id: "transaction-3-8",
    userId: "user-3",
    points: 20,
    transactionType: "spent" as const,
    sourceType: "ai_assistance" as const,
    sourceId: "ai-log-3",
    description: "AI Assistance: OOP design review",
    timestamp: new Date("2024-02-02T10:30:00"),
  },
];

// AI Assistance Log
const aiAssistanceLog = [
  {
    id: "ai-log-1",
    userId: "user-1",
    contextType: "assignment" as const,
    contextId: "assignment-1",
    assistanceType: "hint" as const,
    pointsSpent: 10,
    questionAsked: "How do I handle duplicate values in a BST insertion?",
    aiResponse:
      "For duplicate values, you have a few options: 1) Allow duplicates by placing them in the right subtree, 2) Use a counter to track frequency, or 3) Replace the existing value. The most common approach is to place duplicates in the right subtree to maintain BST properties.",
    usageTimestamp: new Date("2024-02-01T10:45:00"),
  },
  {
    id: "ai-log-2",
    userId: "user-2",
    contextType: "assignment" as const,
    contextId: "assignment-4",
    assistanceType: "pseudocode" as const,
    pointsSpent: 15,
    questionAsked: "Can you provide pseudocode for the knapsack DP solution?",
    aiResponse:
      "Here's the pseudocode for 0/1 knapsack:\n\n```\nfor i = 1 to n:\n  for w = 1 to capacity:\n    if weight[i-1] <= w:\n      dp[i][w] = max(value[i-1] + dp[i-1][w-weight[i-1]], dp[i-1][w])\n    else:\n      dp[i][w] = dp[i-1][w]\n```\n\nThe key insight is that dp[i][w] represents the maximum value using the first i items with capacity w.",
    usageTimestamp: new Date("2024-02-03T16:30:00"),
  },
  {
    id: "ai-log-3",
    userId: "user-3",
    contextType: "assignment" as const,
    contextId: "assignment-7",
    assistanceType: "review" as const,
    pointsSpent: 20,
    questionAsked: "Please review my library management system class design",
    aiResponse:
      "Your class design looks good! Here are some suggestions: 1) Consider making the Item class abstract with an abstract method like getDetails(), 2) Add validation in constructors, 3) Consider using enums for item types and loan status, 4) Add proper error handling for edge cases like trying to borrow unavailable items.",
    usageTimestamp: new Date("2024-02-02T10:30:00"),
  },
  {
    id: "ai-log-4",
    userId: "user-1",
    contextType: "challenge" as const,
    contextId: "challenge-2",
    assistanceType: "copilot" as const,
    pointsSpent: 5,
    questionAsked: "Help me optimize my two-sum solution",
    aiResponse:
      "Your hash map approach is already optimal! You're achieving O(n) time complexity. One small optimization: you can return immediately when you find the complement instead of storing all values first. Also, consider edge cases like empty arrays or no solution.",
    usageTimestamp: new Date("2024-01-23T14:30:00"),
  },
  {
    id: "ai-log-5",
    userId: "user-2",
    contextType: "learning_path" as const,
    contextId: "pathway-2",
    assistanceType: "hint" as const,
    pointsSpent: 8,
    questionAsked:
      "What's the difference between BFS and DFS for graph traversal?",
    aiResponse:
      "BFS (Breadth-First Search) explores nodes level by level using a queue, finding shortest paths in unweighted graphs. DFS (Depth-First Search) explores as far as possible using a stack/recursion, useful for cycle detection and topological sorting. BFS is better for shortest path problems, while DFS is better for exploring all possibilities.",
    usageTimestamp: new Date("2024-02-03T14:00:00"),
  },
  {
    id: "ai-log-6",
    userId: "user-3",
    contextType: "challenge" as const,
    contextId: "challenge-5",
    assistanceType: "pseudocode" as const,
    pointsSpent: 12,
    questionAsked: "How do I implement LRU cache with O(1) operations?",
    aiResponse:
      "Use a combination of HashMap and Doubly Linked List:\n\n1. HashMap stores key -> node mapping\n2. Doubly Linked List maintains access order (most recent at tail)\n\nOperations:\n- GET: Move node to tail, return value\n- PUT: If key exists, update value and move to tail. If new, add to tail and remove head if over capacity\n\nThis gives O(1) for both get and put operations.",
    usageTimestamp: new Date("2024-02-07T14:30:00"),
  },
  {
    id: "ai-log-7",
    userId: "user-1",
    contextType: "assignment" as const,
    contextId: "assignment-2",
    assistanceType: "hint" as const,
    pointsSpent: 10,
    questionAsked: "How do I detect cycles in a directed graph?",
    aiResponse:
      "Use DFS with three states for each node: WHITE (unvisited), GRAY (currently visiting), BLACK (visited). A cycle exists if you encounter a GRAY node during DFS. Alternatively, you can use topological sorting - if you can't complete the topological sort, there's a cycle.",
    usageTimestamp: new Date("2024-02-05T15:30:00"),
  },
  {
    id: "ai-log-8",
    userId: "user-2",
    contextType: "challenge" as const,
    contextId: "challenge-4",
    assistanceType: "review" as const,
    pointsSpent: 15,
    questionAsked: "Review my level-order traversal implementation",
    aiResponse:
      "Excellent implementation! You're using BFS with a queue correctly. The level_size approach is perfect for separating levels. One small suggestion: you could add a check for null root at the beginning. Also, consider what happens with a very large tree - your current approach handles it well, but you might want to add a maximum depth check for safety.",
    usageTimestamp: new Date("2024-02-03T11:30:00"),
  },
];

async function insertPointsAndAI() {
  console.log("🚀 Starting points and AI assistance insertion...");

  try {
    // Insert user points
    console.log("📝 Inserting user points...");
    await db.insert(schema.userPoints).values(userPoints);
    console.log(`✅ Inserted ${userPoints.length} user points records`);

    // Insert point transactions
    console.log("📝 Inserting point transactions...");
    await db.insert(schema.pointTransactions).values(pointTransactions);
    console.log(`✅ Inserted ${pointTransactions.length} point transactions`);

    // Insert AI assistance logs
    console.log("📝 Inserting AI assistance logs...");
    await db.insert(schema.aiAssistanceLog).values(aiAssistanceLog);
    console.log(`✅ Inserted ${aiAssistanceLog.length} AI assistance logs`);

    console.log(
      "🎉 Points and AI assistance insertion completed successfully!"
    );
  } catch (error) {
    console.error("❌ Error inserting points and AI assistance:", error);
    throw error;
  }
}

// Run the script
insertPointsAndAI()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
