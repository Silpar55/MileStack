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

// Learning milestones for each assignment
const learningMilestones = [
  // Assignment 1: Binary Search Tree Implementation
  {
    id: "milestone-1-1",
    assignmentId: "assignment-1",
    milestoneOrder: 1,
    title: "Understand BST Structure",
    description:
      "Learn the basic properties and structure of Binary Search Trees",
    competencyRequirement:
      "Understanding of tree data structures and binary search properties",
    pointsReward: 10,
    status: "completed" as const,
    createdAt: new Date("2024-02-01T10:30:00"),
  },
  {
    id: "milestone-1-2",
    assignmentId: "assignment-1",
    milestoneOrder: 2,
    title: "Implement BST Construction",
    description:
      "Create the basic BST class with node structure and constructor",
    competencyRequirement: "Object-oriented programming and tree node creation",
    pointsReward: 15,
    status: "completed" as const,
    createdAt: new Date("2024-02-01T10:30:00"),
  },
  {
    id: "milestone-1-3",
    assignmentId: "assignment-1",
    milestoneOrder: 3,
    title: "Add Insertion Method",
    description: "Implement the insert method with proper placement logic",
    competencyRequirement: "Tree traversal and recursive algorithms",
    pointsReward: 20,
    status: "completed" as const,
    createdAt: new Date("2024-02-01T10:30:00"),
  },
  {
    id: "milestone-1-4",
    assignmentId: "assignment-1",
    milestoneOrder: 4,
    title: "Implement Search Function",
    description: "Create search method to find values in the BST",
    competencyRequirement: "Binary search algorithm and tree traversal",
    pointsReward: 15,
    status: "completed" as const,
    createdAt: new Date("2024-02-01T10:30:00"),
  },
  {
    id: "milestone-1-5",
    assignmentId: "assignment-1",
    milestoneOrder: 5,
    title: "Add Tree Traversals",
    description: "Implement inorder, preorder, and postorder traversal methods",
    competencyRequirement: "Tree traversal algorithms and recursion",
    pointsReward: 20,
    status: "completed" as const,
    createdAt: new Date("2024-02-01T10:30:00"),
  },

  // Assignment 2: Graph Traversal Algorithms
  {
    id: "milestone-2-1",
    assignmentId: "assignment-2",
    milestoneOrder: 1,
    title: "Graph Representation",
    description: "Choose and implement appropriate graph data structure",
    competencyRequirement:
      "Understanding of graph data structures (adjacency list/matrix)",
    pointsReward: 15,
    status: "completed" as const,
    createdAt: new Date("2024-02-05T14:20:00"),
  },
  {
    id: "milestone-2-2",
    assignmentId: "assignment-2",
    milestoneOrder: 2,
    title: "Implement BFS",
    description: "Create breadth-first search algorithm with queue",
    competencyRequirement: "Queue data structure and BFS algorithm",
    pointsReward: 25,
    status: "completed" as const,
    createdAt: new Date("2024-02-05T14:20:00"),
  },
  {
    id: "milestone-2-3",
    assignmentId: "assignment-2",
    milestoneOrder: 3,
    title: "Implement DFS",
    description: "Create depth-first search algorithm with recursion/stack",
    competencyRequirement: "Stack data structure and DFS algorithm",
    pointsReward: 25,
    status: "completed" as const,
    createdAt: new Date("2024-02-05T14:20:00"),
  },
  {
    id: "milestone-2-4",
    assignmentId: "assignment-2",
    milestoneOrder: 4,
    title: "Path Finding",
    description: "Modify algorithms to find shortest paths",
    competencyRequirement: "Pathfinding algorithms and graph modifications",
    pointsReward: 20,
    status: "completed" as const,
    createdAt: new Date("2024-02-05T14:20:00"),
  },
  {
    id: "milestone-2-5",
    assignmentId: "assignment-2",
    milestoneOrder: 5,
    title: "Cycle Detection",
    description: "Implement algorithm to detect cycles in the graph",
    competencyRequirement: "Graph cycle detection algorithms",
    pointsReward: 15,
    status: "completed" as const,
    createdAt: new Date("2024-02-05T14:20:00"),
  },

  // Assignment 3: Sorting Algorithm Analysis
  {
    id: "milestone-3-1",
    assignmentId: "assignment-3",
    milestoneOrder: 1,
    title: "Implement Bubble Sort",
    description: "Create bubble sort algorithm with time complexity analysis",
    competencyRequirement: "Basic sorting algorithms and nested loops",
    pointsReward: 10,
    status: "completed" as const,
    createdAt: new Date("2024-02-10T09:15:00"),
  },
  {
    id: "milestone-3-2",
    assignmentId: "assignment-3",
    milestoneOrder: 2,
    title: "Implement Quick Sort",
    description: "Create quicksort with pivot selection and partitioning",
    competencyRequirement: "Divide and conquer algorithms and recursion",
    pointsReward: 25,
    status: "completed" as const,
    createdAt: new Date("2024-02-10T09:15:00"),
  },
  {
    id: "milestone-3-3",
    assignmentId: "assignment-3",
    milestoneOrder: 3,
    title: "Implement Merge Sort",
    description: "Create mergesort with divide and conquer approach",
    competencyRequirement: "Merge algorithms and divide and conquer",
    pointsReward: 25,
    status: "completed" as const,
    createdAt: new Date("2024-02-10T09:15:00"),
  },
  {
    id: "milestone-3-4",
    assignmentId: "assignment-3",
    milestoneOrder: 4,
    title: "Performance Analysis",
    description: "Compare time and space complexity of all three algorithms",
    competencyRequirement: "Algorithm analysis and complexity theory",
    pointsReward: 20,
    status: "completed" as const,
    createdAt: new Date("2024-02-10T09:15:00"),
  },

  // Assignment 4: Dynamic Programming Problems
  {
    id: "milestone-4-1",
    assignmentId: "assignment-4",
    milestoneOrder: 1,
    title: "Knapsack Problem",
    description: "Solve 0/1 knapsack problem using dynamic programming",
    competencyRequirement: "Dynamic programming and optimization",
    pointsReward: 30,
    status: "completed" as const,
    createdAt: new Date("2024-02-03T16:45:00"),
  },
  {
    id: "milestone-4-2",
    assignmentId: "assignment-4",
    milestoneOrder: 2,
    title: "Longest Common Subsequence",
    description: "Implement LCS algorithm with memoization",
    competencyRequirement: "String algorithms and dynamic programming",
    pointsReward: 25,
    status: "completed" as const,
    createdAt: new Date("2024-02-03T16:45:00"),
  },
  {
    id: "milestone-4-3",
    assignmentId: "assignment-4",
    milestoneOrder: 3,
    title: "Edit Distance",
    description: "Calculate minimum edit distance between two strings",
    competencyRequirement: "String manipulation and DP optimization",
    pointsReward: 25,
    status: "completed" as const,
    createdAt: new Date("2024-02-03T16:45:00"),
  },
  {
    id: "milestone-4-4",
    assignmentId: "assignment-4",
    milestoneOrder: 4,
    title: "DP Pattern Analysis",
    description: "Identify common patterns in dynamic programming solutions",
    competencyRequirement: "Pattern recognition and algorithm design",
    pointsReward: 20,
    status: "completed" as const,
    createdAt: new Date("2024-02-03T16:45:00"),
  },

  // Assignment 5: Hash Table Implementation
  {
    id: "milestone-5-1",
    assignmentId: "assignment-5",
    milestoneOrder: 1,
    title: "Hash Function Design",
    description: "Create and test hash functions for different data types",
    competencyRequirement: "Hash function design and collision minimization",
    pointsReward: 15,
    status: "completed" as const,
    createdAt: new Date("2024-02-08T11:30:00"),
  },
  {
    id: "milestone-5-2",
    assignmentId: "assignment-5",
    milestoneOrder: 2,
    title: "Chaining Implementation",
    description:
      "Implement hash table with collision resolution using chaining",
    competencyRequirement: "Linked lists and collision resolution",
    pointsReward: 25,
    status: "completed" as const,
    createdAt: new Date("2024-02-08T11:30:00"),
  },
  {
    id: "milestone-5-3",
    assignmentId: "assignment-5",
    milestoneOrder: 3,
    title: "Open Addressing",
    description: "Implement linear probing and quadratic probing",
    competencyRequirement: "Array manipulation and probing strategies",
    pointsReward: 25,
    status: "completed" as const,
    createdAt: new Date("2024-02-08T11:30:00"),
  },
  {
    id: "milestone-5-4",
    assignmentId: "assignment-5",
    milestoneOrder: 4,
    title: "Performance Comparison",
    description:
      "Compare performance of different collision resolution methods",
    competencyRequirement: "Performance analysis and benchmarking",
    pointsReward: 15,
    status: "completed" as const,
    createdAt: new Date("2024-02-08T11:30:00"),
  },

  // Assignment 6: Recursive Backtracking
  {
    id: "milestone-6-1",
    assignmentId: "assignment-6",
    milestoneOrder: 1,
    title: "N-Queens Problem",
    description: "Solve N-Queens using recursive backtracking",
    competencyRequirement:
      "Backtracking algorithms and constraint satisfaction",
    pointsReward: 30,
    status: "completed" as const,
    createdAt: new Date("2024-02-12T13:20:00"),
  },
  {
    id: "milestone-6-2",
    assignmentId: "assignment-6",
    milestoneOrder: 2,
    title: "Sudoku Solver",
    description: "Implement recursive backtracking for Sudoku puzzle solving",
    competencyRequirement:
      "Constraint satisfaction and recursive problem solving",
    pointsReward: 35,
    status: "completed" as const,
    createdAt: new Date("2024-02-12T13:20:00"),
  },
  {
    id: "milestone-6-3",
    assignmentId: "assignment-6",
    milestoneOrder: 3,
    title: "Optimization Techniques",
    description:
      "Apply pruning and optimization to improve backtracking performance",
    competencyRequirement: "Algorithm optimization and pruning techniques",
    pointsReward: 25,
    status: "completed" as const,
    createdAt: new Date("2024-02-12T13:20:00"),
  },

  // Assignment 7: Object-Oriented Design
  {
    id: "milestone-7-1",
    assignmentId: "assignment-7",
    milestoneOrder: 1,
    title: "Class Design",
    description: "Design main classes for library management system",
    competencyRequirement: "Object-oriented design principles",
    pointsReward: 20,
    status: "completed" as const,
    createdAt: new Date("2024-02-02T10:15:00"),
  },
  {
    id: "milestone-7-2",
    assignmentId: "assignment-7",
    milestoneOrder: 2,
    title: "Inheritance Hierarchy",
    description: "Implement inheritance relationships between classes",
    competencyRequirement: "Inheritance and polymorphism concepts",
    pointsReward: 25,
    status: "completed" as const,
    createdAt: new Date("2024-02-02T10:15:00"),
  },
  {
    id: "milestone-7-3",
    assignmentId: "assignment-7",
    milestoneOrder: 3,
    title: "Encapsulation",
    description: "Apply proper encapsulation with private/public members",
    competencyRequirement: "Data hiding and encapsulation principles",
    pointsReward: 15,
    status: "completed" as const,
    createdAt: new Date("2024-02-02T10:15:00"),
  },
  {
    id: "milestone-7-4",
    assignmentId: "assignment-7",
    milestoneOrder: 4,
    title: "Polymorphism",
    description: "Implement method overriding and dynamic binding",
    competencyRequirement: "Polymorphism and dynamic dispatch",
    pointsReward: 20,
    status: "completed" as const,
    createdAt: new Date("2024-02-02T10:15:00"),
  },

  // Assignment 8: Database Normalization
  {
    id: "milestone-8-1",
    assignmentId: "assignment-8",
    milestoneOrder: 1,
    title: "Identify Dependencies",
    description: "Find functional dependencies in the given schema",
    competencyRequirement: "Database design and functional dependencies",
    pointsReward: 15,
    status: "completed" as const,
    createdAt: new Date("2024-02-07T14:30:00"),
  },
  {
    id: "milestone-8-2",
    assignmentId: "assignment-8",
    milestoneOrder: 2,
    title: "Normalize to 1NF",
    description: "Convert schema to First Normal Form",
    competencyRequirement: "First Normal Form requirements",
    pointsReward: 10,
    status: "completed" as const,
    createdAt: new Date("2024-02-07T14:30:00"),
  },
  {
    id: "milestone-8-3",
    assignmentId: "assignment-8",
    milestoneOrder: 3,
    title: "Normalize to 2NF",
    description: "Convert schema to Second Normal Form",
    competencyRequirement: "Second Normal Form requirements",
    pointsReward: 15,
    status: "completed" as const,
    createdAt: new Date("2024-02-07T14:30:00"),
  },
  {
    id: "milestone-8-4",
    assignmentId: "assignment-8",
    milestoneOrder: 4,
    title: "Normalize to 3NF",
    description: "Convert schema to Third Normal Form",
    competencyRequirement: "Third Normal Form requirements",
    pointsReward: 20,
    status: "completed" as const,
    createdAt: new Date("2024-02-07T14:30:00"),
  },

  // Assignment 9: Web API Development
  {
    id: "milestone-9-1",
    assignmentId: "assignment-9",
    milestoneOrder: 1,
    title: "API Structure",
    description: "Design RESTful API endpoints and routing structure",
    competencyRequirement: "REST API design principles",
    pointsReward: 20,
    status: "completed" as const,
    createdAt: new Date("2024-02-11T16:00:00"),
  },
  {
    id: "milestone-9-2",
    assignmentId: "assignment-9",
    milestoneOrder: 2,
    title: "Authentication System",
    description: "Implement JWT-based authentication and authorization",
    competencyRequirement: "Web security and authentication protocols",
    pointsReward: 25,
    status: "completed" as const,
    createdAt: new Date("2024-02-11T16:00:00"),
  },
  {
    id: "milestone-9-3",
    assignmentId: "assignment-9",
    milestoneOrder: 3,
    title: "CRUD Operations",
    description: "Implement Create, Read, Update, Delete operations",
    competencyRequirement: "Database operations and HTTP methods",
    pointsReward: 25,
    status: "completed" as const,
    createdAt: new Date("2024-02-11T16:00:00"),
  },
  {
    id: "milestone-9-4",
    assignmentId: "assignment-9",
    milestoneOrder: 4,
    title: "Error Handling",
    description: "Implement comprehensive error handling and validation",
    competencyRequirement: "Error handling and input validation",
    pointsReward: 20,
    status: "completed" as const,
    createdAt: new Date("2024-02-11T16:00:00"),
  },
];

async function insertMilestones() {
  console.log("🚀 Starting milestone insertion...");

  try {
    // Insert learning milestones
    console.log("📝 Inserting learning milestones...");
    await db
      .insert(assignmentSchema.learningMilestones)
      .values(learningMilestones);
    console.log(`✅ Inserted ${learningMilestones.length} learning milestones`);

    console.log("🎉 Milestone insertion completed successfully!");
  } catch (error) {
    console.error("❌ Error inserting milestones:", error);
    throw error;
  }
}

// Run the script
insertMilestones()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
