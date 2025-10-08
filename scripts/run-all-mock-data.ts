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

async function runAllMockDataInsertion() {
  console.log("🚀 Starting comprehensive mock data insertion...");
  console.log("=" * 60);

  try {
    // Import and run each script
    console.log("📦 Running basic data insertion...");
    const { default: insertBasic } = await import("./insert-mock-data");
    await insertBasic();

    console.log("\n📦 Running milestones insertion...");
    const { default: insertMilestones } = await import("./insert-milestones");
    await insertMilestones();

    console.log("\n📦 Running progress data insertion...");
    const { default: insertProgress } = await import("./insert-progress");
    await insertProgress();

    console.log("\n📦 Running challenges and pathways insertion...");
    const { default: insertChallengesPaths } = await import(
      "./insert-challenges-paths"
    );
    await insertChallengesPaths();

    console.log("\n📦 Running points and AI assistance insertion...");
    const { default: insertPointsAI } = await import("./insert-points-ai");
    await insertPointsAI();

    console.log("\n" + "=" * 60);
    console.log("🎉 All mock data insertion completed successfully!");

    // Generate summary
    await generateSummary();
  } catch (error) {
    console.error("❌ Error during mock data insertion:", error);
    throw error;
  }
}

async function generateSummary() {
  console.log("\n📊 DATABASE POPULATION SUMMARY");
  console.log("=" * 60);

  try {
    // Count records in each table
    const [
      usersCount,
      assignmentsCount,
      assignmentAnalysesCount,
      learningMilestonesCount,
      checkpointAttemptsCount,
      assignmentProgressCount,
      workspaceSessionsCount,
      challengesCount,
      challengeSubmissionsCount,
      learningPathwaysCount,
      pathwayCheckpointsCount,
      userPointsCount,
      pointTransactionsCount,
      aiAssistanceLogCount,
    ] = await Promise.all([
      db
        .select()
        .from(schema.users)
        .then((r) => r.length),
      db
        .select()
        .from(assignmentSchema.assignments)
        .then((r) => r.length),
      db
        .select()
        .from(assignmentSchema.assignmentAnalysis)
        .then((r) => r.length),
      db
        .select()
        .from(assignmentSchema.learningMilestones)
        .then((r) => r.length),
      db
        .select()
        .from(assignmentSchema.assignmentCheckpointAttempts)
        .then((r) => r.length),
      db
        .select()
        .from(assignmentSchema.assignmentUserProgress)
        .then((r) => r.length),
      db
        .select()
        .from(assignmentSchema.workspaceSessions)
        .then((r) => r.length),
      db
        .select()
        .from(schema.challenges)
        .then((r) => r.length),
      db
        .select()
        .from(schema.challengeSubmissions)
        .then((r) => r.length),
      db
        .select()
        .from(schema.learningPathways)
        .then((r) => r.length),
      db
        .select()
        .from(schema.pathwayCheckpoints)
        .then((r) => r.length),
      db
        .select()
        .from(schema.userPoints)
        .then((r) => r.length),
      db
        .select()
        .from(schema.pointTransactions)
        .then((r) => r.length),
      db
        .select()
        .from(schema.aiAssistanceLog)
        .then((r) => r.length),
    ]);

    console.log("📝 CORE TABLES:");
    console.log(`   Users: ${usersCount}`);
    console.log(`   User Points: ${userPointsCount}`);
    console.log(`   Point Transactions: ${pointTransactionsCount}`);
    console.log(`   AI Assistance Log: ${aiAssistanceLogCount}`);

    console.log("\n📚 ASSIGNMENT SYSTEM:");
    console.log(`   Assignments: ${assignmentsCount}`);
    console.log(`   Assignment Analyses: ${assignmentAnalysesCount}`);
    console.log(`   Learning Milestones: ${learningMilestonesCount}`);
    console.log(`   Checkpoint Attempts: ${checkpointAttemptsCount}`);
    console.log(`   Assignment Progress: ${assignmentProgressCount}`);
    console.log(`   Workspace Sessions: ${workspaceSessionsCount}`);

    console.log("\n🏆 CHALLENGE SYSTEM:");
    console.log(`   Challenges: ${challengesCount}`);
    console.log(`   Challenge Submissions: ${challengeSubmissionsCount}`);

    console.log("\n🛤️  LEARNING PATHWAY SYSTEM:");
    console.log(`   Learning Pathways: ${learningPathwaysCount}`);
    console.log(`   Pathway Checkpoints: ${pathwayCheckpointsCount}`);

    const totalRecords =
      usersCount +
      assignmentsCount +
      assignmentAnalysesCount +
      learningMilestonesCount +
      checkpointAttemptsCount +
      assignmentProgressCount +
      workspaceSessionsCount +
      challengesCount +
      challengeSubmissionsCount +
      learningPathwaysCount +
      pathwayCheckpointsCount +
      userPointsCount +
      pointTransactionsCount +
      aiAssistanceLogCount;

    console.log(`\n📊 TOTAL RECORDS INSERTED: ${totalRecords}`);

    // Generate sample queries
    console.log("\n🔍 SAMPLE VALIDATION QUERIES:");
    console.log("=" * 60);

    console.log(
      "1. Show all assignments and milestone titles for student1@test.com:"
    );
    console.log("   SELECT a.title, lm.title as milestone_title");
    console.log("   FROM assignments a");
    console.log("   JOIN users u ON a.user_id = u.id");
    console.log(
      "   LEFT JOIN learning_milestones lm ON a.id = lm.assignment_id"
    );
    console.log("   WHERE u.email = 'student1@test.com'");
    console.log("   ORDER BY a.title, lm.milestone_order;");

    console.log("\n2. Show user points and recent transactions:");
    console.log(
      "   SELECT u.email, up.total_points, pt.description, pt.points, pt.timestamp"
    );
    console.log("   FROM users u");
    console.log("   JOIN user_points up ON u.id = up.user_id");
    console.log("   LEFT JOIN point_transactions pt ON u.id = pt.user_id");
    console.log("   ORDER BY u.email, pt.timestamp DESC");
    console.log("   LIMIT 20;");

    console.log("\n3. Show AI assistance usage by context type:");
    console.log(
      "   SELECT context_type, assistance_type, COUNT(*) as usage_count, SUM(points_spent) as total_points_spent"
    );
    console.log("   FROM ai_assistance_log");
    console.log("   GROUP BY context_type, assistance_type");
    console.log("   ORDER BY context_type, usage_count DESC;");

    console.log("\n4. Show challenge completion rates:");
    console.log(
      "   SELECT c.title, c.difficulty_level, COUNT(cs.id) as submission_count,"
    );
    console.log(
      "          SUM(CASE WHEN cs.is_correct THEN 1 ELSE 0 END) as correct_submissions"
    );
    console.log("   FROM challenges c");
    console.log(
      "   LEFT JOIN challenge_submissions cs ON c.id = cs.challenge_id"
    );
    console.log("   GROUP BY c.id, c.title, c.difficulty_level");
    console.log("   ORDER BY c.difficulty_level, submission_count DESC;");

    console.log("\n5. Show assignment progress summary:");
    console.log(
      "   SELECT u.email, a.title, aup.progress_percentage, aup.points_earned,"
    );
    console.log("          aup.total_checkpoints_passed");
    console.log("   FROM assignment_user_progress aup");
    console.log("   JOIN users u ON aup.user_id = u.id");
    console.log("   JOIN assignments a ON aup.assignment_id = a.id");
    console.log("   ORDER BY u.email, aup.progress_percentage DESC;");
  } catch (error) {
    console.error("❌ Error generating summary:", error);
  }
}

// Run the master script
runAllMockDataInsertion()
  .then(() => {
    console.log("\n✅ All scripts completed successfully!");
    console.log(
      "🎯 Database is now fully populated with comprehensive mock data!"
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Master script failed:", error);
    process.exit(1);
  });
