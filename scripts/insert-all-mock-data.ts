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

// Mock data arrays
const users = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "student1@test.com",
    firstName: "Alice",
    lastName: "Johnson",
    isEmailVerified: true,
    termsAccepted: true,
    privacyPolicyAccepted: true,
    ferpaConsent: true,
    isProfileComplete: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    email: "student2@test.com",
    firstName: "Bob",
    lastName: "Smith",
    isEmailVerified: true,
    termsAccepted: true,
    privacyPolicyAccepted: true,
    ferpaConsent: true,
    isProfileComplete: true,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    email: "student3@test.com",
    firstName: "Carol",
    lastName: "Davis",
    isEmailVerified: true,
    termsAccepted: true,
    privacyPolicyAccepted: true,
    ferpaConsent: true,
    isProfileComplete: true,
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-01-25"),
  },
];

const assignments = [
  {
    id: "650e8400-e29b-41d4-a716-446655440001",
    userId: "550e8400-e29b-41d4-a716-446655440001",
    title: "Binary Search Tree Implementation",
    originalFilename: "bst_assignment.pdf",
    extractedText:
      "Create a BST class with insertion, search, and delete. Include inorder, preorder traversals. Handle duplicates and empty tree.",
    uploadTimestamp: new Date("2024-02-01"),
    analysisStatus: "complete" as const,
    estimatedDifficulty: 7 as const,
    dueDate: new Date("2024-02-15"),
    courseName: "Data Structures",
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440002",
    userId: "550e8400-e29b-41d4-a716-446655440001",
    title: "Graph Traversal Algorithms",
    originalFilename: "graph_traversal.docx",
    extractedText:
      "Implement BFS and DFS for a weighted graph. Include pathfinding and cycle detection.",
    uploadTimestamp: new Date("2024-02-05"),
    analysisStatus: "complete" as const,
    estimatedDifficulty: 8 as const,
    dueDate: new Date("2024-02-20"),
    courseName: "Algorithms",
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440003",
    userId: "550e8400-e29b-41d4-a716-446655440001",
    title: "Sorting Algorithm Analysis",
    originalFilename: "sorting_analysis.pdf",
    extractedText:
      "Compare performance of bubble sort, quicksort, and mergesort. Include time complexity analysis.",
    uploadTimestamp: new Date("2024-02-10"),
    analysisStatus: "complete" as const,
    estimatedDifficulty: 6 as const,
    dueDate: new Date("2024-02-25"),
    courseName: "Algorithm Analysis",
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440004",
    userId: "550e8400-e29b-41d4-a716-446655440002",
    title: "Dynamic Programming Problems",
    originalFilename: "dp_problems.pdf",
    extractedText:
      "Solve the knapsack problem, longest common subsequence, and edit distance using dynamic programming.",
    uploadTimestamp: new Date("2024-02-03"),
    analysisStatus: "complete" as const,
    estimatedDifficulty: 9 as const,
    dueDate: new Date("2024-02-18"),
    courseName: "Advanced Algorithms",
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440005",
    userId: "550e8400-e29b-41d4-a716-446655440002",
    title: "Hash Table Implementation",
    originalFilename: "hash_table.py",
    extractedText:
      "Implement a hash table with collision resolution using chaining and open addressing.",
    uploadTimestamp: new Date("2024-02-08"),
    analysisStatus: "complete" as const,
    estimatedDifficulty: 7 as const,
    dueDate: new Date("2024-02-23"),
    courseName: "Data Structures",
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440006",
    userId: "550e8400-e29b-41d4-a716-446655440002",
    title: "Recursive Backtracking",
    originalFilename: "backtracking.pdf",
    extractedText:
      "Solve N-Queens problem and Sudoku solver using recursive backtracking.",
    uploadTimestamp: new Date("2024-02-12"),
    analysisStatus: "complete" as const,
    estimatedDifficulty: 8 as const,
    dueDate: new Date("2024-02-28"),
    courseName: "Algorithm Design",
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440007",
    userId: "550e8400-e29b-41d4-a716-446655440003",
    title: "Object-Oriented Design",
    originalFilename: "ood_design.pdf",
    extractedText:
      "Design a library management system with proper inheritance, encapsulation, and polymorphism.",
    uploadTimestamp: new Date("2024-02-02"),
    analysisStatus: "complete" as const,
    estimatedDifficulty: 6 as const,
    dueDate: new Date("2024-02-17"),
    courseName: "Software Design",
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440008",
    userId: "550e8400-e29b-41d4-a716-446655440003",
    title: "Database Normalization",
    originalFilename: "db_normalization.docx",
    extractedText:
      "Normalize a database schema to 3NF and design appropriate indexes.",
    uploadTimestamp: new Date("2024-02-07"),
    analysisStatus: "complete" as const,
    estimatedDifficulty: 5 as const,
    dueDate: new Date("2024-02-22"),
    courseName: "Database Systems",
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440009",
    userId: "550e8400-e29b-41d4-a716-446655440003",
    title: "Web API Development",
    originalFilename: "api_development.pdf",
    extractedText:
      "Create a RESTful API with authentication, CRUD operations, and error handling.",
    uploadTimestamp: new Date("2024-02-11"),
    analysisStatus: "complete" as const,
    estimatedDifficulty: 7 as const,
    dueDate: new Date("2024-02-26"),
    courseName: "Web Development",
  },
];

const challenges = [
  {
    id: "750e8400-e29b-41d4-a716-446655440001",
    title: "Prime Number Generator",
    description:
      "Write a function that returns all prime numbers up to N using the Sieve of Eratosthenes algorithm. The function should be efficient and handle edge cases properly.",
    difficulty: "intermediate",
    category: "algorithms",
    subcategory: "mathematics",
    points: 50,
    testCases: [
      {
        input: "30",
        expectedOutput: "[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]",
        description: "Basic test case",
      },
    ],
    createdBy: "550e8400-e29b-41d4-a716-446655440001",
    createdAt: new Date("2024-01-20T10:00:00"),
    isActive: true,
    isPublic: true,
  },
  {
    id: "750e8400-e29b-41d4-a716-446655440002",
    title: "Two Sum Problem",
    description:
      "Given an array of integers and a target sum, find two numbers that add up to the target. Return the indices of the two numbers. Optimize for time complexity.",
    difficulty: "beginner",
    category: "algorithms",
    subcategory: "arrays",
    points: 30,
    testCases: [
      {
        input: "[2, 7, 11, 15], 9",
        expectedOutput: "[0, 1]",
        description: "Basic two sum test",
      },
    ],
    createdBy: "550e8400-e29b-41d4-a716-446655440002",
    createdAt: new Date("2024-01-22T14:30:00"),
    isActive: true,
    isPublic: true,
  },
  {
    id: "750e8400-e29b-41d4-a716-446655440003",
    title: "Palindrome Checker",
    description:
      "Create a function that checks if a string is a palindrome, ignoring case, spaces, and punctuation. Handle both iterative and recursive approaches.",
    difficulty: "beginner",
    category: "algorithms",
    subcategory: "strings",
    points: 25,
    testCases: [
      {
        input: "'A man, a plan, a canal: Panama'",
        expectedOutput: "true",
        description: "Complex palindrome with punctuation",
      },
    ],
    createdBy: "550e8400-e29b-41d4-a716-446655440003",
    createdAt: new Date("2024-01-25T09:15:00"),
    isActive: true,
    isPublic: true,
  },
];

const learningPathways = [
  {
    id: "850e8400-e29b-41d4-a716-446655440001",
    title: "Python Basics Crash Course",
    description:
      "Learn the fundamentals of Python programming from variables to functions",
    difficulty: 3 as const,
    estimatedDurationHours: 12,
    isActive: true,
    createdBy: "550e8400-e29b-41d4-a716-446655440001",
    createdAt: new Date("2024-01-15T09:00:00"),
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440002",
    title: "Data Structures and Algorithms",
    description:
      "Master essential data structures and algorithms for technical interviews",
    difficulty: 7 as const,
    estimatedDurationHours: 40,
    isActive: true,
    createdBy: "550e8400-e29b-41d4-a716-446655440002",
    createdAt: new Date("2024-01-18T14:30:00"),
  },
];

const userPoints = [
  {
    userId: "550e8400-e29b-41d4-a716-446655440001",
    totalPoints: 485,
    pointsEarnedToday: 50,
    lastEarnedAt: new Date("2024-02-01T13:00:00"),
    updatedAt: new Date("2024-02-01T13:00:00"),
  },
  {
    userId: "550e8400-e29b-41d4-a716-446655440002",
    totalPoints: 520,
    pointsEarnedToday: 80,
    lastEarnedAt: new Date("2024-02-07T15:30:00"),
    updatedAt: new Date("2024-02-07T15:30:00"),
  },
  {
    userId: "550e8400-e29b-41d4-a716-446655440003",
    totalPoints: 445,
    pointsEarnedToday: 35,
    lastEarnedAt: new Date("2024-02-11T18:30:00"),
    updatedAt: new Date("2024-02-11T18:30:00"),
  },
];

const aiAssistanceLog = [
  {
    id: "950e8400-e29b-41d4-a716-446655440001",
    userId: "550e8400-e29b-41d4-a716-446655440001",
    contextType: "assignment" as const,
    contextId: "650e8400-e29b-41d4-a716-446655440001",
    assistanceType: "hint" as const,
    pointsSpent: 10,
    questionAsked: "How do I handle duplicate values in a BST insertion?",
    aiResponse:
      "For duplicate values, you have a few options: 1) Allow duplicates by placing them in the right subtree, 2) Use a counter to track frequency, or 3) Replace the existing value. The most common approach is to place duplicates in the right subtree to maintain BST properties.",
    usageTimestamp: new Date("2024-02-01T10:45:00"),
  },
  {
    id: "950e8400-e29b-41d4-a716-446655440002",
    userId: "550e8400-e29b-41d4-a716-446655440002",
    contextType: "challenge" as const,
    contextId: "750e8400-e29b-41d4-a716-446655440001",
    assistanceType: "pseudocode" as const,
    pointsSpent: 15,
    questionAsked: "Can you provide pseudocode for the Sieve of Eratosthenes?",
    aiResponse:
      "Here's the pseudocode for Sieve of Eratosthenes:\n\n```\n1. Create boolean array is_prime[0..n], initialize all as true\n2. Mark is_prime[0] and is_prime[1] as false\n3. For i from 2 to sqrt(n):\n   - If is_prime[i] is true:\n     - For j from i*i to n, step i:\n       - Mark is_prime[j] as false\n4. Return all i where is_prime[i] is true\n```",
    usageTimestamp: new Date("2024-01-25T14:30:00"),
  },
  {
    id: "950e8400-e29b-41d4-a716-446655440003",
    userId: "550e8400-e29b-41d4-a716-446655440003",
    contextType: "learning_path" as const,
    contextId: "850e8400-e29b-41d4-a716-446655440001",
    assistanceType: "review" as const,
    pointsSpent: 20,
    questionAsked: "Please review my Python function implementation",
    aiResponse:
      "Your function looks good! Here are some suggestions: 1) Add type hints for better code documentation, 2) Consider adding docstrings for function documentation, 3) Add input validation to handle edge cases, 4) Consider using list comprehensions where appropriate for more Pythonic code.",
    usageTimestamp: new Date("2024-01-26T10:30:00"),
  },
];

async function insertAllMockData() {
  console.log("🚀 Starting comprehensive mock data insertion...");

  try {
    // Insert users
    console.log("📝 Inserting users...");
    await db.insert(schema.users).values(users);
    console.log(`✅ Inserted ${users.length} users`);

    // Insert assignments
    console.log("📝 Inserting assignments...");
    await db.insert(assignmentSchema.assignments).values(assignments);
    console.log(`✅ Inserted ${assignments.length} assignments`);

    // Insert challenges
    console.log("📝 Inserting challenges...");
    await db.insert(schema.challenges).values(challenges);
    console.log(`✅ Inserted ${challenges.length} challenges`);

    // Insert learning pathways
    console.log("📝 Inserting learning pathways...");
    await db.insert(schema.learningPathways).values(learningPathways);
    console.log(`✅ Inserted ${learningPathways.length} learning pathways`);

    // Insert user points
    console.log("📝 Inserting user points...");
    await db.insert(schema.userPoints).values(userPoints);
    console.log(`✅ Inserted ${userPoints.length} user points records`);

    // Insert AI assistance logs
    console.log("📝 Inserting AI assistance logs...");
    await db.insert(schema.aiAssistanceLog).values(aiAssistanceLog);
    console.log(`✅ Inserted ${aiAssistanceLog.length} AI assistance logs`);

    console.log("🎉 Mock data insertion completed successfully!");

    // Generate summary
    console.log("\n📊 DATABASE POPULATION SUMMARY");
    console.log("=" * 60);
    console.log(`Users: ${users.length}`);
    console.log(`Assignments: ${assignments.length}`);
    console.log(`Challenges: ${challenges.length}`);
    console.log(`Learning Pathways: ${learningPathways.length}`);
    console.log(`User Points: ${userPoints.length}`);
    console.log(`AI Assistance Logs: ${aiAssistanceLog.length}`);

    const totalRecords =
      users.length +
      assignments.length +
      challenges.length +
      learningPathways.length +
      userPoints.length +
      aiAssistanceLog.length;
    console.log(`\n📊 TOTAL RECORDS INSERTED: ${totalRecords}`);
  } catch (error) {
    console.error("❌ Error inserting mock data:", error);
    throw error;
  }
}

// Run the script
insertAllMockData()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    console.log("🎯 Database is now populated with comprehensive mock data!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
