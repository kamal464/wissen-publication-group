-- Add sortOrder to BoardMember for drag-and-drop display order
ALTER TABLE "BoardMember" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Set initial order for existing rows (by id)
UPDATE "BoardMember" SET "sortOrder" = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "journalId" ORDER BY id) - 1 AS rn
  FROM "BoardMember"
) sub
WHERE "BoardMember".id = sub.id;
