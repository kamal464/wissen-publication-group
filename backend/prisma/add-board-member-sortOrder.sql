-- Add sortOrder to BoardMember for editorial board drag-and-drop order
-- Safe to run: uses IF NOT EXISTS so existing prod DBs get the column
ALTER TABLE "BoardMember" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;
