-- Add lyzr_asset_ids column to assignments table
ALTER TABLE "assignments" ADD COLUMN "lyzr_asset_ids" jsonb;
