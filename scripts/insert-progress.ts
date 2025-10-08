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

// Assignment checkpoint attempts
const checkpointAttempts = [
  // User 1 attempts for assignment 1
  {
    id: "attempt-1-1",
    userId: "user-1",
    milestoneId: "milestone-1-1",
    attemptNumber: 1,
    submittedAnswer:
      "A BST is a binary tree where each node has at most two children, and the left child is less than parent, right child is greater than parent.",
    aiScore: 95,
    passed: true,
    feedback: "Excellent understanding of BST properties!",
    attemptTimestamp: new Date("2024-02-01T11:00:00"),
  },
  {
    id: "attempt-1-2",
    userId: "user-1",
    milestoneId: "milestone-1-2",
    attemptNumber: 1,
    submittedAnswer:
      "class BSTNode { constructor(value) { this.value = value; this.left = null; this.right = null; } }",
    aiScore: 88,
    passed: true,
    feedback: "Good structure, consider adding validation.",
    attemptTimestamp: new Date("2024-02-01T11:30:00"),
  },
  {
    id: "attempt-1-3",
    userId: "user-1",
    milestoneId: "milestone-1-3",
    attemptNumber: 2,
    submittedAnswer:
      "insert(value) { if (!this.root) { this.root = new BSTNode(value); return; } this.insertRecursive(this.root, value); }",
    aiScore: 92,
    passed: true,
    feedback: "Well implemented recursive insertion!",
    attemptTimestamp: new Date("2024-02-01T12:00:00"),
  },
  {
    id: "attempt-1-4",
    userId: "user-1",
    milestoneId: "milestone-1-4",
    attemptNumber: 1,
    submittedAnswer:
      "search(value) { return this.searchRecursive(this.root, value); }",
    aiScore: 90,
    passed: true,
    feedback: "Correct search implementation.",
    attemptTimestamp: new Date("2024-02-01T12:30:00"),
  },
  {
    id: "attempt-1-5",
    userId: "user-1",
    milestoneId: "milestone-1-5",
    attemptNumber: 1,
    submittedAnswer:
      "inorder(node) { if (node) { this.inorder(node.left); console.log(node.value); this.inorder(node.right); } }",
    aiScore: 94,
    passed: true,
    feedback: "Perfect traversal implementation!",
    attemptTimestamp: new Date("2024-02-01T13:00:00"),
  },

  // User 2 attempts for assignment 4
  {
    id: "attempt-2-1",
    userId: "user-2",
    milestoneId: "milestone-4-1",
    attemptNumber: 1,
    submittedAnswer:
      "Knapsack problem can be solved using 2D DP table where dp[i][w] represents maximum value with first i items and weight w.",
    aiScore: 87,
    passed: true,
    feedback: "Good understanding of DP approach.",
    attemptTimestamp: new Date("2024-02-03T17:30:00"),
  },
  {
    id: "attempt-2-2",
    userId: "user-2",
    milestoneId: "milestone-4-2",
    attemptNumber: 2,
    submittedAnswer:
      "LCS can be found using memoization: if (i === 0 || j === 0) return 0; if (str1[i-1] === str2[j-1]) return 1 + lcs(i-1, j-1); return Math.max(lcs(i-1, j), lcs(i, j-1));",
    aiScore: 91,
    passed: true,
    feedback: "Excellent recursive solution with memoization!",
    attemptTimestamp: new Date("2024-02-03T18:00:00"),
  },
  {
    id: "attempt-2-3",
    userId: "user-2",
    milestoneId: "milestone-4-3",
    attemptNumber: 1,
    submittedAnswer:
      "Edit distance uses DP table: if (i === 0) return j; if (j === 0) return i; if (str1[i-1] === str2[j-1]) return dp[i-1][j-1]; return 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);",
    aiScore: 89,
    passed: true,
    feedback: "Correct implementation of edit distance algorithm.",
    attemptTimestamp: new Date("2024-02-03T18:30:00"),
  },

  // User 3 attempts for assignment 7
  {
    id: "attempt-3-1",
    userId: "user-3",
    milestoneId: "milestone-7-1",
    attemptNumber: 1,
    submittedAnswer:
      "Main classes: Library, Book, Member, Loan. Library manages books and members, Book represents individual items, Member represents users, Loan tracks borrowing.",
    aiScore: 85,
    passed: true,
    feedback: "Good class identification, consider adding more details.",
    attemptTimestamp: new Date("2024-02-02T11:00:00"),
  },
  {
    id: "attempt-3-2",
    userId: "user-3",
    milestoneId: "milestone-7-2",
    attemptNumber: 2,
    submittedAnswer:
      "Item (abstract) -> Book, Magazine, DVD. Person (abstract) -> Member, Staff. This allows polymorphism and code reuse.",
    aiScore: 92,
    passed: true,
    feedback: "Excellent inheritance design with proper abstraction!",
    attemptTimestamp: new Date("2024-02-02T11:30:00"),
  },
  {
    id: "attempt-3-3",
    userId: "user-3",
    milestoneId: "milestone-7-3",
    attemptNumber: 1,
    submittedAnswer:
      "Private fields: _id, _title, _author. Public methods: getId(), getTitle(), setTitle(). This protects data integrity.",
    aiScore: 88,
    passed: true,
    feedback: "Good encapsulation with proper access control.",
    attemptTimestamp: new Date("2024-02-02T12:00:00"),
  },

  // Some failed attempts to show variety
  {
    id: "attempt-fail-1",
    userId: "user-1",
    milestoneId: "milestone-2-2",
    attemptNumber: 1,
    submittedAnswer:
      "BFS uses a queue to visit nodes level by level, starting from the root.",
    aiScore: 45,
    passed: false,
    feedback: "Correct concept but missing implementation details and code.",
    attemptTimestamp: new Date("2024-02-05T15:00:00"),
  },
  {
    id: "attempt-fail-2",
    userId: "user-2",
    milestoneId: "milestone-5-2",
    attemptNumber: 1,
    submittedAnswer:
      "Hash table stores key-value pairs using hash function to determine index.",
    aiScore: 38,
    passed: false,
    feedback:
      "Basic understanding but needs implementation of collision resolution.",
    attemptTimestamp: new Date("2024-02-08T12:00:00"),
  },
  {
    id: "attempt-fail-3",
    userId: "user-3",
    milestoneId: "milestone-9-2",
    attemptNumber: 1,
    submittedAnswer: "Authentication can be done with username and password.",
    aiScore: 42,
    passed: false,
    feedback:
      "Too simplistic. Need to address JWT tokens, security, and session management.",
    attemptTimestamp: new Date("2024-02-11T17:00:00"),
  },
];

// Assignment user progress
const assignmentProgress = [
  {
    userId: "user-1",
    assignmentId: "assignment-1",
    currentMilestoneId: "milestone-1-5",
    pointsEarned: 80,
    totalCheckpointsPassed: 5,
    progressPercentage: "100.00",
    lastActivity: new Date("2024-02-01T13:00:00"),
  },
  {
    userId: "user-1",
    assignmentId: "assignment-2",
    currentMilestoneId: "milestone-2-3",
    pointsEarned: 65,
    totalCheckpointsPassed: 3,
    progressPercentage: "60.00",
    lastActivity: new Date("2024-02-05T16:00:00"),
  },
  {
    userId: "user-1",
    assignmentId: "assignment-3",
    currentMilestoneId: "milestone-3-4",
    pointsEarned: 80,
    totalCheckpointsPassed: 4,
    progressPercentage: "100.00",
    lastActivity: new Date("2024-02-10T10:00:00"),
  },
  {
    userId: "user-2",
    assignmentId: "assignment-4",
    currentMilestoneId: "milestone-4-4",
    pointsEarned: 100,
    totalCheckpointsPassed: 4,
    progressPercentage: "100.00",
    lastActivity: new Date("2024-02-03T19:00:00"),
  },
  {
    userId: "user-2",
    assignmentId: "assignment-5",
    currentMilestoneId: "milestone-5-3",
    pointsEarned: 65,
    totalCheckpointsPassed: 3,
    progressPercentage: "75.00",
    lastActivity: new Date("2024-02-08T13:00:00"),
  },
  {
    userId: "user-2",
    assignmentId: "assignment-6",
    currentMilestoneId: "milestone-6-2",
    pointsEarned: 65,
    totalCheckpointsPassed: 2,
    progressPercentage: "66.67",
    lastActivity: new Date("2024-02-12T14:00:00"),
  },
  {
    userId: "user-3",
    assignmentId: "assignment-7",
    currentMilestoneId: "milestone-7-4",
    pointsEarned: 80,
    totalCheckpointsPassed: 4,
    progressPercentage: "100.00",
    lastActivity: new Date("2024-02-02T13:00:00"),
  },
  {
    userId: "user-3",
    assignmentId: "assignment-8",
    currentMilestoneId: "milestone-8-4",
    pointsEarned: 60,
    totalCheckpointsPassed: 4,
    progressPercentage: "100.00",
    lastActivity: new Date("2024-02-07T15:30:00"),
  },
  {
    userId: "user-3",
    assignmentId: "assignment-9",
    currentMilestoneId: "milestone-9-3",
    pointsEarned: 70,
    totalCheckpointsPassed: 3,
    progressPercentage: "75.00",
    lastActivity: new Date("2024-02-11T18:00:00"),
  },
];

// Workspace sessions
const workspaceSessions = [
  {
    assignmentId: "assignment-1",
    userId: "user-1",
    currentCode:
      "class BSTNode {\n  constructor(value) {\n    this.value = value;\n    this.left = null;\n    this.right = null;\n  }\n}\n\nclass BST {\n  constructor() {\n    this.root = null;\n  }\n  \n  insert(value) {\n    if (!this.root) {\n      this.root = new BSTNode(value);\n      return;\n    }\n    this.insertRecursive(this.root, value);\n  }\n  \n  insertRecursive(node, value) {\n    if (value < node.value) {\n      if (!node.left) {\n        node.left = new BSTNode(value);\n      } else {\n        this.insertRecursive(node.left, value);\n      }\n    } else {\n      if (!node.right) {\n        node.right = new BSTNode(value);\n      } else {\n        this.insertRecursive(node.right, value);\n      }\n    }\n  }\n}",
    language: "javascript",
    lastSaveTimestamp: new Date("2024-02-01T13:15:00"),
    versionNumber: 15,
  },
  {
    assignmentId: "assignment-2",
    userId: "user-1",
    currentCode:
      "from collections import deque\n\nclass Graph:\n    def __init__(self):\n        self.adjacency_list = {}\n    \n    def add_edge(self, u, v):\n        if u not in self.adjacency_list:\n            self.adjacency_list[u] = []\n        if v not in self.adjacency_list:\n            self.adjacency_list[v] = []\n        self.adjacency_list[u].append(v)\n        self.adjacency_list[v].append(u)\n    \n    def bfs(self, start):\n        visited = set()\n        queue = deque([start])\n        result = []\n        \n        while queue:\n            node = queue.popleft()\n            if node not in visited:\n                visited.add(node)\n                result.append(node)\n                for neighbor in self.adjacency_list.get(node, []):\n                    if neighbor not in visited:\n                        queue.append(neighbor)\n        \n        return result",
    language: "python",
    lastSaveTimestamp: new Date("2024-02-05T16:30:00"),
    versionNumber: 12,
  },
  {
    assignmentId: "assignment-4",
    userId: "user-2",
    currentCode:
      'def knapsack_dp(weights, values, capacity):\n    n = len(weights)\n    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]\n    \n    for i in range(1, n + 1):\n        for w in range(1, capacity + 1):\n            if weights[i-1] <= w:\n                dp[i][w] = max(\n                    values[i-1] + dp[i-1][w - weights[i-1]],\n                    dp[i-1][w]\n                )\n            else:\n                dp[i][w] = dp[i-1][w]\n    \n    return dp[n][capacity]\n\n# Example usage\nweights = [10, 20, 30]\nvalues = [60, 100, 120]\ncapacity = 50\nprint(f"Maximum value: {knapsack_dp(weights, values, capacity)}")',
    language: "python",
    lastSaveTimestamp: new Date("2024-02-03T19:15:00"),
    versionNumber: 8,
  },
  {
    assignmentId: "assignment-7",
    userId: "user-3",
    currentCode:
      "// Abstract base class for library items\nclass Item {\n    constructor(id, title) {\n        this._id = id;\n        this._title = title;\n        this._available = true;\n    }\n    \n    getId() { return this._id; }\n    getTitle() { return this._title; }\n    isAvailable() { return this._available; }\n    \n    setAvailable(status) { this._available = status; }\n}\n\n// Book class extending Item\nclass Book extends Item {\n    constructor(id, title, author, isbn) {\n        super(id, title);\n        this._author = author;\n        this._isbn = isbn;\n    }\n    \n    getAuthor() { return this._author; }\n    getISBN() { return this._isbn; }\n    \n    getDetails() {\n        return `${this._title} by ${this._author} (ISBN: ${this._isbn})`;\n    }\n}",
    language: "javascript",
    lastSaveTimestamp: new Date("2024-02-02T13:30:00"),
    versionNumber: 22,
  },
  {
    assignmentId: "assignment-9",
    userId: "user-3",
    currentCode:
      "const express = require('express');\nconst jwt = require('jsonwebtoken');\nconst bcrypt = require('bcrypt');\n\nconst app = express();\napp.use(express.json());\n\n// Mock user database\nconst users = [];\n\n// Authentication middleware\nconst authenticateToken = (req, res, next) => {\n    const authHeader = req.headers['authorization'];\n    const token = authHeader && authHeader.split(' ')[1];\n    \n    if (!token) {\n        return res.sendStatus(401);\n    }\n    \n    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {\n        if (err) return res.sendStatus(403);\n        req.user = user;\n        next();\n    });\n};\n\n// Protected route example\napp.get('/api/profile', authenticateToken, (req, res) => {\n    res.json({ user: req.user });\n});",
    language: "javascript",
    lastSaveTimestamp: new Date("2024-02-11T18:30:00"),
    versionNumber: 18,
  },
];

async function insertProgress() {
  console.log("🚀 Starting progress data insertion...");

  try {
    // Insert checkpoint attempts
    console.log("📝 Inserting checkpoint attempts...");
    await db
      .insert(assignmentSchema.assignmentCheckpointAttempts)
      .values(checkpointAttempts);
    console.log(`✅ Inserted ${checkpointAttempts.length} checkpoint attempts`);

    // Insert assignment progress
    console.log("📝 Inserting assignment progress...");
    await db
      .insert(assignmentSchema.assignmentUserProgress)
      .values(assignmentProgress);
    console.log(
      `✅ Inserted ${assignmentProgress.length} assignment progress records`
    );

    // Insert workspace sessions
    console.log("📝 Inserting workspace sessions...");
    await db
      .insert(assignmentSchema.workspaceSessions)
      .values(workspaceSessions);
    console.log(`✅ Inserted ${workspaceSessions.length} workspace sessions`);

    console.log("🎉 Progress data insertion completed successfully!");
  } catch (error) {
    console.error("❌ Error inserting progress data:", error);
    throw error;
  }
}

// Run the script
insertProgress()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
