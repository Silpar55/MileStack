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

// Mock data arrays with proper UUIDs
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
    id: "650e8400-e29b-41d4-a716-446655440003",
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
];

const learningPathways = [
  {
    id: "850e8400-e29b-41d4-a716-446655440001",
    title: "Python Basics Crash Course",
    description:
      "Learn the fundamentals of Python programming from variables to functions",
    category: "programming",
    difficulty: "beginner",
    totalPoints: 100,
    estimatedDuration: 12,
    isActive: true,
    isPublic: true,
    createdBy: "550e8400-e29b-41d4-a716-446655440001",
    createdAt: new Date("2024-01-15T09:00:00"),
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440002",
    title: "Data Structures and Algorithms",
    description:
      "Master essential data structures and algorithms for technical interviews",
    category: "algorithms",
    difficulty: "advanced",
    totalPoints: 300,
    estimatedDuration: 40,
    isActive: true,
    isPublic: true,
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

async function clearAndInsertMockData() {
  console.log("🚀 Starting database cleanup and mock data insertion...");

  try {
    // Clear existing data (in reverse dependency order)
    console.log("🧹 Clearing existing data...");

    // Clear AI assistance logs first
    await db.delete(schema.aiAssistanceLog);
    console.log("✅ Cleared AI assistance logs");

    // Clear point transactions
    await db.delete(schema.pointTransactions);
    console.log("✅ Cleared point transactions");

    // Clear user points
    await db.delete(schema.userPoints);
    console.log("✅ Cleared user points");

    // Clear challenge submissions
    await db.delete(schema.challengeSubmissions);
    console.log("✅ Cleared challenge submissions");

    // Clear challenges
    await db.delete(schema.challenges);
    console.log("✅ Cleared challenges");

    // Clear learning pathways
    await db.delete(schema.learningPathways);
    console.log("✅ Cleared learning pathways");

    // Clear assignments
    await db.delete(assignmentSchema.assignments);
    console.log("✅ Cleared assignments");

    // Clear users last (due to foreign key constraints)
    await db.delete(schema.users);
    console.log("✅ Cleared users");

    console.log("\n📝 Inserting new mock data...");

    // Insert users
    await db.insert(schema.users).values(users);
    console.log(`✅ Inserted ${users.length} users`);

    // Insert assignments
    await db.insert(assignmentSchema.assignments).values(assignments);
    console.log(`✅ Inserted ${assignments.length} assignments`);

    // Insert challenges
    await db.insert(schema.challenges).values(challenges);
    console.log(`✅ Inserted ${challenges.length} challenges`);

    // Insert learning pathways
    await db.insert(schema.learningPathways).values(learningPathways);
    console.log(`✅ Inserted ${learningPathways.length} learning pathways`);

    // Insert user points
    await db.insert(schema.userPoints).values(userPoints);
    console.log(`✅ Inserted ${userPoints.length} user points records`);

    // Insert AI assistance logs
    await db.insert(schema.aiAssistanceLog).values(aiAssistanceLog);
    console.log(`✅ Inserted ${aiAssistanceLog.length} AI assistance logs`);

    console.log("\n🎉 Mock data insertion completed successfully!");

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

    console.log("\n🔍 SAMPLE VALIDATION QUERIES:");
    console.log("=" * 60);

    console.log("1. Show all users and their points:");
    console.log(
      "   SELECT u.email, u.first_name, u.last_name, up.total_points"
    );
    console.log("   FROM users u");
    console.log("   LEFT JOIN user_points up ON u.id = up.user_id");
    console.log("   ORDER BY up.total_points DESC;");

    console.log("\n2. Show assignments by user:");
    console.log("   SELECT u.email, a.title, a.course_name, a.analysis_status");
    console.log("   FROM assignments a");
    console.log("   JOIN users u ON a.user_id = u.id");
    console.log("   ORDER BY u.email, a.title;");

    console.log("\n3. Show challenges by difficulty:");
    console.log("   SELECT title, difficulty, category, points");
    console.log("   FROM challenges");
    console.log("   ORDER BY difficulty, points DESC;");

    console.log("\n4. Show AI assistance usage:");
    console.log(
      "   SELECT context_type, assistance_type, COUNT(*) as usage_count"
    );
    console.log("   FROM ai_assistance_log");
    console.log("   GROUP BY context_type, assistance_type");
    console.log("   ORDER BY usage_count DESC;");
  } catch (error) {
    console.error("❌ Error during mock data insertion:", error);
    throw error;
  }
}

// Run the script
clearAndInsertMockData()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    console.log(
      "🎯 Database is now fully populated with comprehensive mock data!"
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
