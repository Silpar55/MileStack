CREATE TABLE "achievement_templates" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"icon" varchar(100),
	"points" integer DEFAULT 0 NOT NULL,
	"criteria" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"achievement_id" varchar(100) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"icon" varchar(100),
	"points" integer DEFAULT 0 NOT NULL,
	"criteria" jsonb NOT NULL,
	"progress" jsonb NOT NULL,
	"unlocked_at" timestamp,
	"is_unlocked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"resource" varchar(100),
	"resource_id" uuid,
	"ip_address" varchar(45),
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"difficulty_rating" integer,
	"quality_rating" integer,
	"feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"code" text NOT NULL,
	"language" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"execution_time" integer,
	"memory_used" integer,
	"test_results" jsonb,
	"error_message" text,
	"points_earned" integer DEFAULT 0,
	"is_first_solve" boolean DEFAULT false,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"difficulty" varchar(20) NOT NULL,
	"category" varchar(50) NOT NULL,
	"subcategory" varchar(100),
	"points" integer DEFAULT 100 NOT NULL,
	"time_limit" integer,
	"memory_limit" integer,
	"prerequisites" jsonb,
	"tags" jsonb,
	"starter_code" jsonb,
	"test_cases" jsonb NOT NULL,
	"expected_output" jsonb,
	"hints" jsonb,
	"solution" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"approved_by" uuid,
	"approved_at" timestamp,
	"rating" integer DEFAULT 0,
	"rating_count" integer DEFAULT 0,
	"submission_count" integer DEFAULT 0,
	"solved_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkpoint_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"checkpoint_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"attempt_number" integer NOT NULL,
	"responses" jsonb NOT NULL,
	"score" integer,
	"points_earned" integer DEFAULT 0,
	"time_spent" integer,
	"feedback" jsonb,
	"status" varchar(20) NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competency_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"checkpoint_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"assessment_type" varchar(30) NOT NULL,
	"content" jsonb NOT NULL,
	"ai_analysis" jsonb,
	"comprehension_score" integer,
	"accuracy_score" integer,
	"overall_score" integer,
	"feedback" text,
	"is_passed" boolean DEFAULT false,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"evaluated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "fraud_detection_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"risk_score" integer NOT NULL,
	"flags" jsonb NOT NULL,
	"details" jsonb NOT NULL,
	"action" varchar(50) NOT NULL,
	"reviewed" boolean DEFAULT false NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaderboards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" varchar(50),
	"points" integer DEFAULT 0 NOT NULL,
	"rank" integer,
	"challenges_solved" integer DEFAULT 0,
	"average_time" integer,
	"streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"last_solved_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_pathways" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"difficulty" varchar(20) NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"estimated_duration" integer,
	"prerequisites" jsonb,
	"tags" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"approved_by" uuid,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp,
	"token_type" varchar(50),
	"scope" text,
	"id_token" text,
	"session_state" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pathway_checkpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pathway_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"type" varchar(30) NOT NULL,
	"order" integer NOT NULL,
	"points" integer NOT NULL,
	"time_limit" integer,
	"max_attempts" integer DEFAULT 3,
	"passing_score" integer DEFAULT 80,
	"prerequisites" jsonb,
	"content" jsonb NOT NULL,
	"feedback" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pathway_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pathway_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" varchar(20) NOT NULL,
	"current_checkpoint" uuid,
	"total_points" integer DEFAULT 0,
	"completed_checkpoints" integer DEFAULT 0,
	"total_checkpoints" integer NOT NULL,
	"time_spent" integer DEFAULT 0,
	"started_at" timestamp,
	"completed_at" timestamp,
	"last_accessed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "point_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"category" varchar(50) NOT NULL,
	"reason" text NOT NULL,
	"source_id" uuid,
	"source_type" varchar(50),
	"quality_score" integer,
	"verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"verified_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"action" varchar(100) NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"window_start" timestamp NOT NULL,
	"blocked_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"current_balance" integer DEFAULT 0 NOT NULL,
	"total_earned" integer DEFAULT 0 NOT NULL,
	"total_spent" integer DEFAULT 0 NOT NULL,
	"daily_earned" integer DEFAULT 0 NOT NULL,
	"last_earned_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"challenge_id" uuid NOT NULL,
	"status" varchar(20) NOT NULL,
	"attempts" integer DEFAULT 0,
	"best_score" integer DEFAULT 0,
	"time_spent" integer DEFAULT 0,
	"hints_used" integer DEFAULT 0,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"user_agent" text,
	"ip_address" varchar(45),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_sessions_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"email_verification_token" text,
	"email_verification_expires" timestamp,
	"password_reset_token" text,
	"password_reset_expires" timestamp,
	"last_login_at" timestamp,
	"login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp,
	"terms_accepted" boolean DEFAULT false NOT NULL,
	"terms_accepted_at" timestamp,
	"privacy_policy_accepted" boolean DEFAULT false NOT NULL,
	"privacy_policy_accepted_at" timestamp,
	"gdpr_consent" jsonb,
	"ferpa_consent" boolean DEFAULT false NOT NULL,
	"ferpa_consent_at" timestamp,
	"profile_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_ratings" ADD CONSTRAINT "challenge_ratings_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_ratings" ADD CONSTRAINT "challenge_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_submissions" ADD CONSTRAINT "challenge_submissions_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_submissions" ADD CONSTRAINT "challenge_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkpoint_attempts" ADD CONSTRAINT "checkpoint_attempts_checkpoint_id_pathway_checkpoints_id_fk" FOREIGN KEY ("checkpoint_id") REFERENCES "public"."pathway_checkpoints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkpoint_attempts" ADD CONSTRAINT "checkpoint_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_assessments" ADD CONSTRAINT "competency_assessments_checkpoint_id_pathway_checkpoints_id_fk" FOREIGN KEY ("checkpoint_id") REFERENCES "public"."pathway_checkpoints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_assessments" ADD CONSTRAINT "competency_assessments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_detection_logs" ADD CONSTRAINT "fraud_detection_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_detection_logs" ADD CONSTRAINT "fraud_detection_logs_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboards" ADD CONSTRAINT "leaderboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_pathways" ADD CONSTRAINT "learning_pathways_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_pathways" ADD CONSTRAINT "learning_pathways_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_checkpoints" ADD CONSTRAINT "pathway_checkpoints_pathway_id_learning_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."learning_pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_progress" ADD CONSTRAINT "pathway_progress_pathway_id_learning_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."learning_pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_progress" ADD CONSTRAINT "pathway_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_progress" ADD CONSTRAINT "pathway_progress_current_checkpoint_pathway_checkpoints_id_fk" FOREIGN KEY ("current_checkpoint") REFERENCES "public"."pathway_checkpoints"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_points" ADD CONSTRAINT "user_points_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;