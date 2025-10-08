import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  varchar,
  jsonb,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./schema";

// Core assignment storage (REPLACE old assignments table)
export const assignments = pgTable("assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  originalFilename: varchar("original_filename", { length: 255 }),
  extractedText: text("extracted_text"),
  uploadTimestamp: timestamp("upload_timestamp").defaultNow().notNull(),
  analysisStatus: varchar("analysis_status", { length: 20 })
    .default("pending")
    .notNull(), // 'pending', 'processing', 'complete', 'failed'
  estimatedDifficulty: integer("estimated_difficulty").$type<
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  >(), // CHECK constraint handled in migration
  dueDate: timestamp("due_date"),
  courseName: varchar("course_name", { length: 100 }),
});

// AI analysis results for assignments (NEW TABLE)
export const assignmentAnalysis = pgTable("assignment_analysis", {
  assignmentId: uuid("assignment_id")
    .primaryKey()
    .references(() => assignments.id, { onDelete: "cascade" }),
  concepts: jsonb("concepts"), // ["arrays", "sorting", "recursion"]
  languages: jsonb("languages"), // ["python", "javascript"]
  difficultyScore: integer("difficulty_score").$type<
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  >(), // CHECK constraint handled in migration
  prerequisites: jsonb("prerequisites"), // ["basic programming", "loops"]
  estimatedTimeHours: decimal("estimated_time_hours", {
    precision: 4,
    scale: 2,
  }),
  analysisTimestamp: timestamp("analysis_timestamp").defaultNow().notNull(),
});

// Assignment-specific learning milestones (NEW TABLE - separate from learning paths)
export const learningMilestones = pgTable("learning_milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  milestoneOrder: integer("milestone_order").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  competencyRequirement: text("competency_requirement").notNull(),
  pointsReward: integer("points_reward").notNull(),
  status: varchar("status", { length: 20 }).default("locked").notNull(), // 'locked', 'available', 'in_progress', 'completed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Assignment checkpoint attempts (NEW TABLE - separate from learning path checkpoints)
export const assignmentCheckpointAttempts = pgTable(
  "assignment_checkpoint_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    milestoneId: uuid("milestone_id")
      .notNull()
      .references(() => learningMilestones.id, { onDelete: "cascade" }),
    attemptNumber: integer("attempt_number").default(1).notNull(),
    submittedAnswer: text("submitted_answer"),
    aiScore: integer("ai_score").$type<
      | 0
      | 1
      | 2
      | 3
      | 4
      | 5
      | 6
      | 7
      | 8
      | 9
      | 10
      | 11
      | 12
      | 13
      | 14
      | 15
      | 16
      | 17
      | 18
      | 19
      | 20
      | 21
      | 22
      | 23
      | 24
      | 25
      | 26
      | 27
      | 28
      | 29
      | 30
      | 31
      | 32
      | 33
      | 34
      | 35
      | 36
      | 37
      | 38
      | 39
      | 40
      | 41
      | 42
      | 43
      | 44
      | 45
      | 46
      | 47
      | 48
      | 49
      | 50
      | 51
      | 52
      | 53
      | 54
      | 55
      | 56
      | 57
      | 58
      | 59
      | 60
      | 61
      | 62
      | 63
      | 64
      | 65
      | 66
      | 67
      | 68
      | 69
      | 70
      | 71
      | 72
      | 73
      | 74
      | 75
      | 76
      | 77
      | 78
      | 79
      | 80
      | 81
      | 82
      | 83
      | 84
      | 85
      | 86
      | 87
      | 88
      | 89
      | 90
      | 91
      | 92
      | 93
      | 94
      | 95
      | 96
      | 97
      | 98
      | 99
      | 100
    >(), // CHECK constraint handled in migration
    passed: boolean("passed").default(false).notNull(),
    feedback: text("feedback"),
    attemptTimestamp: timestamp("attempt_timestamp").defaultNow().notNull(),
  }
);

// Assignment progress tracking (NEW TABLE)
export const assignmentUserProgress = pgTable(
  "assignment_user_progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    currentMilestoneId: uuid("current_milestone_id").references(
      () => learningMilestones.id
    ),
    pointsEarned: integer("points_earned").default(0).notNull(),
    totalCheckpointsPassed: integer("total_checkpoints_passed")
      .default(0)
      .notNull(),
    progressPercentage: decimal("progress_percentage", {
      precision: 5,
      scale: 2,
    })
      .default("0")
      .notNull(),
    lastActivity: timestamp("last_activity").defaultNow().notNull(),
  },
  (table) => ({
    pk: { columns: [table.userId, table.assignmentId] },
  })
);

// Code workspace sessions (NEW TABLE)
export const workspaceSessions = pgTable(
  "workspace_sessions",
  {
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    currentCode: text("current_code").default(""),
    language: varchar("language", { length: 50 }).default("python"),
    lastSaveTimestamp: timestamp("last_save_timestamp").defaultNow().notNull(),
    versionNumber: integer("version_number").default(1).notNull(),
  },
  (table) => ({
    pk: { columns: [table.assignmentId, table.userId] },
  })
);

// Relations
export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  user: one(users, {
    fields: [assignments.userId],
    references: [users.id],
  }),
  analysis: one(assignmentAnalysis),
  milestones: many(learningMilestones),
  userProgress: many(assignmentUserProgress),
  workspaceSessions: many(workspaceSessions),
}));

export const assignmentAnalysisRelations = relations(
  assignmentAnalysis,
  ({ one }) => ({
    assignment: one(assignments, {
      fields: [assignmentAnalysis.assignmentId],
      references: [assignments.id],
    }),
  })
);

export const learningMilestonesRelations = relations(
  learningMilestones,
  ({ one, many }) => ({
    assignment: one(assignments, {
      fields: [learningMilestones.assignmentId],
      references: [assignments.id],
    }),
    checkpointAttempts: many(assignmentCheckpointAttempts),
    userProgress: many(assignmentUserProgress),
  })
);

export const assignmentCheckpointAttemptsRelations = relations(
  assignmentCheckpointAttempts,
  ({ one }) => ({
    user: one(users, {
      fields: [assignmentCheckpointAttempts.userId],
      references: [users.id],
    }),
    milestone: one(learningMilestones, {
      fields: [assignmentCheckpointAttempts.milestoneId],
      references: [learningMilestones.id],
    }),
  })
);

export const assignmentUserProgressRelations = relations(
  assignmentUserProgress,
  ({ one }) => ({
    user: one(users, {
      fields: [assignmentUserProgress.userId],
      references: [users.id],
    }),
    assignment: one(assignments, {
      fields: [assignmentUserProgress.assignmentId],
      references: [assignments.id],
    }),
    currentMilestone: one(learningMilestones, {
      fields: [assignmentUserProgress.currentMilestoneId],
      references: [learningMilestones.id],
    }),
  })
);

export const workspaceSessionsRelations = relations(
  workspaceSessions,
  ({ one }) => ({
    assignment: one(assignments, {
      fields: [workspaceSessions.assignmentId],
      references: [assignments.id],
    }),
    user: one(users, {
      fields: [workspaceSessions.userId],
      references: [users.id],
    }),
  })
);
