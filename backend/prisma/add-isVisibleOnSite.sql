-- Add isVisibleOnSite to Journal (safe one-off; no other schema changes)
ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "isVisibleOnSite" BOOLEAN NOT NULL DEFAULT true;
