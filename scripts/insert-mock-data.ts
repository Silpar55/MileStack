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
    id: "user-1",
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
    id: "user-2",
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
    id: "user-3",
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
    id: "assignment-1",
    userId: "user-1",
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
    id: "assignment-2",
    userId: "user-1",
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
    id: "assignment-3",
    userId: "user-1",
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
    id: "assignment-4",
    userId: "user-2",
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
    id: "assignment-5",
    userId: "user-2",
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
    id: "assignment-6",
    userId: "user-2",
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
    id: "assignment-7",
    userId: "user-3",
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
    id: "assignment-8",
    userId: "user-3",
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
    id: "assignment-9",
    userId: "user-3",
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

const assignmentAnalyses = [
  {
    assignmentId: "assignment-1",
    concepts: ["binary trees", "recursion", "data structures", "traversal"],
    languages: ["python"],
    difficultyScore: 7 as const,
    prerequisites: [
      "basic programming",
      "recursion",
      "object-oriented programming",
    ],
    estimatedTimeHours: "8.5",
    analysisTimestamp: new Date("2024-02-01T10:30:00"),
  },
  {
    assignmentId: "assignment-2",
    concepts: [
      "graphs",
      "breadth-first search",
      "depth-first search",
      "algorithms",
    ],
    languages: ["python", "java"],
    difficultyScore: 8 as const,
    prerequisites: ["data structures", "algorithms", "graph theory"],
    estimatedTimeHours: "12.0",
    analysisTimestamp: new Date("2024-02-05T14:20:00"),
  },
  {
    assignmentId: "assignment-3",
    concepts: ["sorting", "time complexity", "algorithm analysis"],
    languages: ["python"],
    difficultyScore: 6 as const,
    prerequisites: ["basic programming", "time complexity"],
    estimatedTimeHours: "6.0",
    analysisTimestamp: new Date("2024-02-10T09:15:00"),
  },
  {
    assignmentId: "assignment-4",
    concepts: ["dynamic programming", "optimization", "algorithms"],
    languages: ["python", "java"],
    difficultyScore: 9 as const,
    prerequisites: ["algorithms", "recursion", "mathematical thinking"],
    estimatedTimeHours: "15.0",
    analysisTimestamp: new Date("2024-02-03T16:45:00"),
  },
  {
    assignmentId: "assignment-5",
    concepts: ["hash tables", "collision resolution", "data structures"],
    languages: ["python"],
    difficultyScore: 7 as const,
    prerequisites: ["data structures", "arrays", "linked lists"],
    estimatedTimeHours: "9.0",
    analysisTimestamp: new Date("2024-02-08T11:30:00"),
  },
  {
    assignmentId: "assignment-6",
    concepts: ["recursion", "backtracking", "constraint satisfaction"],
    languages: ["python"],
    difficultyScore: 8 as const,
    prerequisites: ["recursion", "algorithms", "problem solving"],
    estimatedTimeHours: "11.0",
    analysisTimestamp: new Date("2024-02-12T13:20:00"),
  },
  {
    assignmentId: "assignment-7",
    concepts: ["object-oriented programming", "design patterns", "inheritance"],
    languages: ["java", "python"],
    difficultyScore: 6 as const,
    prerequisites: ["programming fundamentals", "object-oriented concepts"],
    estimatedTimeHours: "7.0",
    analysisTimestamp: new Date("2024-02-02T10:15:00"),
  },
  {
    assignmentId: "assignment-8",
    concepts: ["database design", "normalization", "relational model"],
    languages: ["sql"],
    difficultyScore: 5 as const,
    prerequisites: ["database concepts", "sql basics"],
    estimatedTimeHours: "5.0",
    analysisTimestamp: new Date("2024-02-07T14:30:00"),
  },
  {
    assignmentId: "assignment-9",
    concepts: ["web development", "REST APIs", "authentication", "HTTP"],
    languages: ["javascript", "python"],
    difficultyScore: 7 as const,
    prerequisites: ["programming", "web basics", "HTTP"],
    estimatedTimeHours: "10.0",
    analysisTimestamp: new Date("2024-02-11T16:00:00"),
  },
];

async function insertMockData() {
  console.log("🚀 Starting mock data insertion...");

  try {
    // Insert users
    console.log("📝 Inserting users...");
    await db.insert(schema.users).values(users);
    console.log(`✅ Inserted ${users.length} users`);

    // Insert assignments
    console.log("📝 Inserting assignments...");
    await db.insert(assignmentSchema.assignments).values(assignments);
    console.log(`✅ Inserted ${assignments.length} assignments`);

    // Insert assignment analyses
    console.log("📝 Inserting assignment analyses...");
    await db
      .insert(assignmentSchema.assignmentAnalysis)
      .values(assignmentAnalyses);
    console.log(`✅ Inserted ${assignmentAnalyses.length} assignment analyses`);

    console.log("🎉 Mock data insertion completed successfully!");
  } catch (error) {
    console.error("❌ Error inserting mock data:", error);
    throw error;
  }
}

// Run the script
insertMockData()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
