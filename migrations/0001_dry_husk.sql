CREATE TABLE "honor_code_signatures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"signature" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"version" varchar(20) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"institution" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"university" varchar(255),
	"major" varchar(255) NOT NULL,
	"year" varchar(50) NOT NULL,
	"programming_languages" jsonb DEFAULT '{}'::jsonb,
	"experience_level" varchar(50) DEFAULT 'beginner',
	"learning_goals" jsonb DEFAULT '[]'::jsonb,
	"institution_id" varchar(100),
	"institution_name" varchar(255),
	"data_usage_consent" boolean DEFAULT false NOT NULL,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"research_participation" boolean DEFAULT false NOT NULL,
	"is_profile_complete" boolean DEFAULT false NOT NULL,
	"profile_completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_profile_complete" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "honor_code_signatures" ADD CONSTRAINT "honor_code_signatures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;