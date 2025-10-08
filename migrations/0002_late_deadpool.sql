ALTER TABLE "users" ADD COLUMN "profile_picture" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_picture_provider" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "oauth_avatar_url" text;