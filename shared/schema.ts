import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  varchar,
  jsonb,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password"), // null for OAuth users
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLoginAt: timestamp("last_login_at"),
  loginAttempts: integer("login_attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until"),
  termsAccepted: boolean("terms_accepted").default(false).notNull(),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  privacyPolicyAccepted: boolean("privacy_policy_accepted")
    .default(false)
    .notNull(),
  privacyPolicyAcceptedAt: timestamp("privacy_policy_accepted_at"),
  gdprConsent: jsonb("gdpr_consent"), // Store GDPR consent preferences
  ferpaConsent: boolean("ferpa_consent").default(false).notNull(),
  ferpaConsentAt: timestamp("ferpa_consent_at"),
  profileData: jsonb("profile_data"), // Additional profile information
  profilePicture: text("profile_picture"), // URL or path to profile picture
  profilePictureProvider: varchar("profile_picture_provider", { length: 20 }), // 'local', 'cloudinary', 'oauth'
  oauthAvatarUrl: text("oauth_avatar_url"), // Original OAuth avatar URL
  isProfileComplete: boolean("is_profile_complete").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User sessions table for JWT refresh tokens
export const userSessions = pgTable("user_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  refreshToken: text("refresh_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }), // IPv6 support
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
});

// OAuth accounts table
export const oauthAccounts = pgTable("oauth_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 50 }).notNull(), // 'google', 'github', 'university-sso'
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  tokenType: varchar("token_type", { length: 50 }),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Rate limiting table
export const rateLimits = pgTable("rate_limits", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: varchar("identifier", { length: 255 }).notNull(), // IP address or user ID
  action: varchar("action", { length: 100 }).notNull(), // 'login', 'signup', 'password_reset'
  attempts: integer("attempts").default(1).notNull(),
  windowStart: timestamp("window_start").notNull(),
  blockedUntil: timestamp("blocked_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit log table for security and compliance
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(), // 'login', 'logout', 'password_change', etc.
  resource: varchar("resource", { length: 100 }), // 'user', 'session', etc.
  resourceId: uuid("resource_id"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"), // Additional context
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(userSessions),
  oauthAccounts: many(oauthAccounts),
  auditLogs: many(auditLogs),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const oauthAccountsRelations = relations(oauthAccounts, ({ one }) => ({
  user: one(users, {
    fields: [oauthAccounts.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Challenge system tables
export const challenges = pgTable("challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // 'beginner', 'intermediate', 'advanced', 'expert'
  category: varchar("category", { length: 50 }).notNull(), // 'data-structures', 'algorithms', 'web-dev', 'database', 'system-design'
  subcategory: varchar("subcategory", { length: 100 }), // 'arrays', 'trees', 'sorting', 'react', etc.
  points: integer("points").notNull().default(100),
  timeLimit: integer("time_limit"), // in seconds, null for no limit
  memoryLimit: integer("memory_limit"), // in MB, null for no limit
  prerequisites: jsonb("prerequisites"), // Array of prerequisite challenge IDs
  tags: jsonb("tags"), // Array of tags for filtering
  starterCode: jsonb("starter_code"), // Language-specific starter code
  testCases: jsonb("test_cases").notNull(), // Array of test cases
  expectedOutput: jsonb("expected_output"), // Expected output format
  hints: jsonb("hints"), // Array of hints
  solution: text("solution"), // Official solution (optional)
  isActive: boolean("is_active").default(true).notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  approvedBy: uuid("approved_by").references(() => users.id, {
    onDelete: "set null",
  }),
  approvedAt: timestamp("approved_at"),
  rating: integer("rating").default(0), // Average user rating (1-5)
  ratingCount: integer("rating_count").default(0),
  submissionCount: integer("submission_count").default(0),
  solvedCount: integer("solved_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const challengeSubmissions = pgTable("challenge_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  challengeId: uuid("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  language: varchar("language", { length: 20 }).notNull(), // 'javascript', 'python', 'java', 'cpp', etc.
  status: varchar("status", { length: 20 }).notNull(), // 'pending', 'running', 'passed', 'failed', 'timeout', 'error'
  executionTime: integer("execution_time"), // in milliseconds
  memoryUsed: integer("memory_used"), // in MB
  testResults: jsonb("test_results"), // Detailed test case results
  errorMessage: text("error_message"),
  pointsEarned: integer("points_earned").default(0),
  isFirstSolve: boolean("is_first_solve").default(false),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const challengeRatings = pgTable("challenge_ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  challengeId: uuid("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 stars
  difficultyRating: integer("difficulty_rating"), // 1-5 difficulty
  qualityRating: integer("quality_rating"), // 1-5 quality
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  challengeId: uuid("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).notNull(), // 'not-started', 'in-progress', 'completed', 'skipped'
  attempts: integer("attempts").default(0),
  bestScore: integer("best_score").default(0),
  timeSpent: integer("time_spent").default(0), // in minutes
  hintsUsed: integer("hints_used").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Challenge system relations
export const challengesRelations = relations(challenges, ({ many, one }) => ({
  submissions: many(challengeSubmissions),
  ratings: many(challengeRatings),
  progress: many(userProgress),
  creator: one(users, {
    fields: [challenges.createdBy],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [challenges.approvedBy],
    references: [users.id],
  }),
}));

export const challengeSubmissionsRelations = relations(
  challengeSubmissions,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeSubmissions.challengeId],
      references: [challenges.id],
    }),
    user: one(users, {
      fields: [challengeSubmissions.userId],
      references: [users.id],
    }),
  })
);

export const challengeRatingsRelations = relations(
  challengeRatings,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeRatings.challengeId],
      references: [challenges.id],
    }),
    user: one(users, {
      fields: [challengeRatings.userId],
      references: [users.id],
    }),
  })
);

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [userProgress.challengeId],
    references: [challenges.id],
  }),
}));

// Learning Pathway System Tables
export const learningPathways = pgTable("learning_pathways", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // 'data-structures', 'algorithms', 'web-dev', etc.
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // 'beginner', 'intermediate', 'advanced', 'expert'
  totalPoints: integer("total_points").notNull().default(0),
  estimatedDuration: integer("estimated_duration"), // in hours
  prerequisites: jsonb("prerequisites"), // Array of prerequisite pathway IDs
  tags: jsonb("tags"), // Array of tags for filtering
  isActive: boolean("is_active").default(true).notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  approvedBy: uuid("approved_by").references(() => users.id, {
    onDelete: "set null",
  }),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pathwayCheckpoints = pgTable("pathway_checkpoints", {
  id: uuid("id").primaryKey().defaultRandom(),
  pathwayId: uuid("pathway_id")
    .notNull()
    .references(() => learningPathways.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 30 }).notNull(), // 'concept-explanation', 'skill-assessment', 'code-review'
  order: integer("order").notNull(),
  points: integer("points").notNull(),
  timeLimit: integer("time_limit"), // in minutes
  maxAttempts: integer("max_attempts").default(3),
  passingScore: integer("passing_score").default(80), // percentage
  prerequisites: jsonb("prerequisites"), // Array of prerequisite checkpoint IDs
  content: jsonb("content").notNull(), // Assessment content and questions
  feedback: jsonb("feedback"), // Feedback templates
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const checkpointAttempts = pgTable("checkpoint_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  checkpointId: uuid("checkpoint_id")
    .notNull()
    .references(() => pathwayCheckpoints.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  attemptNumber: integer("attempt_number").notNull(),
  responses: jsonb("responses").notNull(), // Student's answers
  score: integer("score"), // percentage score
  pointsEarned: integer("points_earned").default(0),
  timeSpent: integer("time_spent"), // in minutes
  feedback: jsonb("feedback"), // AI-generated feedback
  status: varchar("status", { length: 20 }).notNull(), // 'in-progress', 'completed', 'failed'
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pathwayProgress = pgTable("pathway_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  pathwayId: uuid("pathway_id")
    .notNull()
    .references(() => learningPathways.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).notNull(), // 'not-started', 'in-progress', 'completed', 'locked'
  currentCheckpoint: uuid("current_checkpoint").references(
    () => pathwayCheckpoints.id
  ),
  totalPoints: integer("total_points").default(0),
  completedCheckpoints: integer("completed_checkpoints").default(0),
  totalCheckpoints: integer("total_checkpoints").notNull(),
  timeSpent: integer("time_spent").default(0), // in minutes
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const competencyAssessments = pgTable("competency_assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  checkpointId: uuid("checkpoint_id")
    .notNull()
    .references(() => pathwayCheckpoints.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assessmentType: varchar("assessment_type", { length: 30 }).notNull(), // 'concept-explanation', 'skill-assessment', 'code-review'
  content: jsonb("content").notNull(), // Assessment content
  aiAnalysis: jsonb("ai_analysis"), // AI analysis results
  comprehensionScore: integer("comprehension_score"), // 0-100
  accuracyScore: integer("accuracy_score"), // 0-100
  overallScore: integer("overall_score"), // 0-100
  feedback: text("feedback"),
  isPassed: boolean("is_passed").default(false),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  evaluatedAt: timestamp("evaluated_at"),
});

// Learning Pathway Relations
export const learningPathwaysRelations = relations(
  learningPathways,
  ({ many, one }) => ({
    checkpoints: many(pathwayCheckpoints),
    progress: many(pathwayProgress),
    creator: one(users, {
      fields: [learningPathways.createdBy],
      references: [users.id],
    }),
    approver: one(users, {
      fields: [learningPathways.approvedBy],
      references: [users.id],
    }),
  })
);

export const pathwayCheckpointsRelations = relations(
  pathwayCheckpoints,
  ({ one, many }) => ({
    pathway: one(learningPathways, {
      fields: [pathwayCheckpoints.pathwayId],
      references: [learningPathways.id],
    }),
    attempts: many(checkpointAttempts),
    assessments: many(competencyAssessments),
  })
);

export const checkpointAttemptsRelations = relations(
  checkpointAttempts,
  ({ one }) => ({
    checkpoint: one(pathwayCheckpoints, {
      fields: [checkpointAttempts.checkpointId],
      references: [pathwayCheckpoints.id],
    }),
    user: one(users, {
      fields: [checkpointAttempts.userId],
      references: [users.id],
    }),
  })
);

export const pathwayProgressRelations = relations(
  pathwayProgress,
  ({ one }) => ({
    pathway: one(learningPathways, {
      fields: [pathwayProgress.pathwayId],
      references: [learningPathways.id],
    }),
    user: one(users, {
      fields: [pathwayProgress.userId],
      references: [users.id],
    }),
    currentCheckpoint: one(pathwayCheckpoints, {
      fields: [pathwayProgress.currentCheckpoint],
      references: [pathwayCheckpoints.id],
    }),
  })
);

export const competencyAssessmentsRelations = relations(
  competencyAssessments,
  ({ one }) => ({
    checkpoint: one(pathwayCheckpoints, {
      fields: [competencyAssessments.checkpointId],
      references: [pathwayCheckpoints.id],
    }),
    user: one(users, {
      fields: [competencyAssessments.userId],
      references: [users.id],
    }),
  })
);

// Points and Achievements System Tables
export const userPoints = pgTable("user_points", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  currentBalance: integer("current_balance").default(0).notNull(),
  totalEarned: integer("total_earned").default(0).notNull(),
  totalSpent: integer("total_spent").default(0).notNull(),
  dailyEarned: integer("daily_earned").default(0).notNull(),
  lastEarnedDate: date("last_earned_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pointTransactions = pgTable("point_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // Positive for earned, negative for spent
  type: varchar("type", { length: 50 }).notNull(), // 'earned' or 'spent'
  category: varchar("category", { length: 50 }).notNull(), // 'concept-explanation', 'mini-challenge', etc.
  reason: text("reason").notNull(),
  sourceId: uuid("source_id"), // ID of the activity that generated points
  sourceType: varchar("source_type", { length: 50 }), // 'checkpoint', 'peer-help', 'ai-usage'
  qualityScore: integer("quality_score"), // For anti-gaming measures
  verified: boolean("verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: uuid("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  achievementId: varchar("achievement_id", { length: 100 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // 'streak', 'mastery', 'collaboration', 'integrity'
  icon: varchar("icon", { length: 100 }),
  points: integer("points").default(0).notNull(),
  criteria: jsonb("criteria").notNull(), // JSON object with criteria details
  progress: jsonb("progress").notNull(), // Current progress towards achievement
  unlockedAt: timestamp("unlocked_at"),
  isUnlocked: boolean("is_unlocked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievementTemplates = pgTable("achievement_templates", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  icon: varchar("icon", { length: 100 }),
  points: integer("points").default(0).notNull(),
  criteria: jsonb("criteria").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fraudDetectionLogs = pgTable("fraud_detection_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  activityType: varchar("activity_type", { length: 50 }).notNull(),
  riskScore: integer("risk_score").notNull(), // 0-100
  flags: jsonb("flags").notNull(), // Array of detected issues
  details: jsonb("details").notNull(), // Additional context
  action: varchar("action", { length: 50 }).notNull(), // 'none', 'flag', 'block', 'review'
  reviewed: boolean("reviewed").default(false).notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Profiles table for extended profile information
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  university: varchar("university", { length: 255 }),
  major: varchar("major", { length: 255 }).notNull(),
  year: varchar("year", { length: 50 }).notNull(),
  programmingLanguages: jsonb("programming_languages").default({}),
  experienceLevel: varchar("experience_level", { length: 50 }).default(
    "beginner"
  ),
  learningGoals: jsonb("learning_goals").default([]),
  institutionId: varchar("institution_id", { length: 100 }),
  institutionName: varchar("institution_name", { length: 255 }),
  dataUsageConsent: boolean("data_usage_consent").default(false).notNull(),
  marketingConsent: boolean("marketing_consent").default(false).notNull(),
  researchParticipation: boolean("research_participation")
    .default(false)
    .notNull(),
  isProfileComplete: boolean("is_profile_complete").default(false).notNull(),
  profileCompletedAt: timestamp("profile_completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Honor Code Signatures table
export const honorCodeSignatures = pgTable("honor_code_signatures", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  signature: text("signature").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  version: varchar("version", { length: 20 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  institution: varchar("institution", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Points and Achievements Relations
export const userPointsRelations = relations(userPoints, ({ one }) => ({
  user: one(users, {
    fields: [userPoints.userId],
    references: [users.id],
  }),
}));

export const pointTransactionsRelations = relations(
  pointTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [pointTransactions.userId],
      references: [users.id],
    }),
    verifier: one(users, {
      fields: [pointTransactions.verifiedBy],
      references: [users.id],
    }),
  })
);

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

export const fraudDetectionLogsRelations = relations(
  fraudDetectionLogs,
  ({ one }) => ({
    user: one(users, {
      fields: [fraudDetectionLogs.userId],
      references: [users.id],
    }),
    reviewer: one(users, {
      fields: [fraudDetectionLogs.reviewedBy],
      references: [users.id],
    }),
  })
);

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const honorCodeSignaturesRelations = relations(
  honorCodeSignatures,
  ({ one }) => ({
    user: one(users, {
      fields: [honorCodeSignatures.userId],
      references: [users.id],
    }),
  })
);

// AI Assistance System Table - works across all learning systems
export const aiAssistanceLog = pgTable("ai_assistance_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contextType: varchar("context_type", { length: 20 }).notNull(), // 'assignment', 'challenge', 'learning_path'
  contextId: uuid("context_id").notNull(), // ID of assignment, challenge, or learning path
  assistanceType: varchar("assistance_type", { length: 20 }).notNull(), // 'hint', 'pseudocode', 'review', 'copilot'
  pointsSpent: integer("points_spent").notNull(),
  questionAsked: text("question_asked"),
  aiResponse: text("ai_response"),
  usageTimestamp: timestamp("usage_timestamp").defaultNow().notNull(),
});

export const aiAssistanceLogRelations = relations(
  aiAssistanceLog,
  ({ one }) => ({
    user: one(users, {
      fields: [aiAssistanceLog.userId],
      references: [users.id],
    }),
  })
);
