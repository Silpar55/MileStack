import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  uuid,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Assignment table
export const assignments = pgTable("assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  originalFileName: text("original_file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  fileHash: text("file_hash").notNull(),
  status: text("status").notNull().default("uploaded"), // uploaded, processing, analyzed, error
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Assignment analysis results
export const assignmentAnalyses = pgTable("assignment_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => assignments.id),
  extractedText: text("extracted_text"),
  concepts: jsonb("concepts").notNull(), // Array of programming concepts
  skills: jsonb("skills").notNull(), // Array of required skills
  difficultyLevel: integer("difficulty_level").notNull(), // 1-10 scale
  estimatedTimeHours: decimal("estimated_time_hours", {
    precision: 3,
    scale: 1,
  }),
  prerequisites: jsonb("prerequisites").notNull(), // Array of prerequisite concepts
  learningGaps: jsonb("learning_gaps").notNull(), // Array of identified gaps
  aiAnalysisMetadata: jsonb("ai_analysis_metadata"), // Raw AI response data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Learning pathways generated from assignments
export const learningPathways = pgTable("learning_pathways", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => assignments.id),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  totalPoints: integer("total_points").notNull(),
  estimatedDuration: integer("estimated_duration_days").notNull(),
  difficultyLevel: integer("difficulty_level").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Learning milestones within pathways
export const learningMilestones = pgTable("learning_milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  pathwayId: uuid("pathway_id")
    .notNull()
    .references(() => learningPathways.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(),
  order: integer("order").notNull(),
  competencyRequirements: jsonb("competency_requirements").notNull(),
  resources: jsonb("resources"), // Array of learning resources
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Programming concepts database
export const concepts = pgTable("concepts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(), // data_structures, algorithms, languages, frameworks
  description: text("description"),
  difficultyLevel: integer("difficulty_level").notNull(),
  prerequisites: jsonb("prerequisites"), // Array of concept IDs
  relatedConcepts: jsonb("related_concepts"), // Array of concept IDs
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User progress tracking
export const userProgress = pgTable("user_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  milestoneId: uuid("milestone_id")
    .notNull()
    .references(() => learningMilestones.id),
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed
  progressPercentage: integer("progress_percentage").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  evidence: jsonb("evidence"), // Proof of completion (code, explanations, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  analysis: one(assignmentAnalyses),
  pathway: one(learningPathways),
}));

export const assignmentAnalysesRelations = relations(
  assignmentAnalyses,
  ({ one }) => ({
    assignment: one(assignments, {
      fields: [assignmentAnalyses.assignmentId],
      references: [assignments.id],
    }),
  })
);

export const learningPathwaysRelations = relations(
  learningPathways,
  ({ one, many }) => ({
    assignment: one(assignments, {
      fields: [learningPathways.assignmentId],
      references: [assignments.id],
    }),
    milestones: many(learningMilestones),
  })
);

export const learningMilestonesRelations = relations(
  learningMilestones,
  ({ one, many }) => ({
    pathway: one(learningPathways, {
      fields: [learningMilestones.pathwayId],
      references: [learningPathways.id],
    }),
    userProgress: many(userProgress),
  })
);

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  milestone: one(learningMilestones, {
    fields: [userProgress.milestoneId],
    references: [learningMilestones.id],
  }),
}));
