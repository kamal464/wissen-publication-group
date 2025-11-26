-- Add optional metadata fields to the Journal model
ALTER TABLE "Journal"
  ADD COLUMN "coverImage" TEXT,
  ADD COLUMN "publisher" TEXT,
  ADD COLUMN "accessType" TEXT,
  ADD COLUMN "subjectArea" TEXT,
  ADD COLUMN "category" TEXT,
  ADD COLUMN "discipline" TEXT,
  ADD COLUMN "impactFactor" TEXT;
