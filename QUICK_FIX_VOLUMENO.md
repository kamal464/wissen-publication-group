# Quick Fix: Missing volumeNo Column Error

## Error
```
Invalid `prisma.article.findMany()` invocation:
The column `Article.volumeNo` does not exist in the current database.
```

## Quick Fix (Run on Server)

**Copy and paste this entire block:**

```bash
cd /var/www/wissen-publication-group/backend

# Load database URL
export $(cat .env | grep -v '^#' | xargs)

# Add missing volumeNo column
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "volumeNo" TEXT;'

# Add other missing columns if needed
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "issueNo" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "issueMonth" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "year" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "specialIssue" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "firstPageNumber" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "lastPageNumber" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "correspondingAuthorDetails" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "citeAs" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "country" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "receivedAt" TIMESTAMP;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "acceptedAt" TIMESTAMP;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "fulltextImages" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading1Title" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading1Content" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading2Title" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading2Content" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading3Title" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading3Content" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading4Title" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading4Content" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading5Title" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading5Content" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "showInInpressCards" BOOLEAN DEFAULT false;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "inPressMonth" TEXT;'
psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "inPressYear" TEXT;'

# Regenerate Prisma Client
npx prisma generate

# Restart backend
pm2 restart wissen-backend --update-env

echo "✅ Fixed! volumeNo column added to database."
```

## Or Use the Script

```bash
cd /var/www/wissen-publication-group
chmod +x FIX_VOLUMENO_COLUMN.sh
./FIX_VOLUMENO_COLUMN.sh
```

## Verify Fix

```bash
# Check column exists
psql "$DATABASE_URL" -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'Article' AND column_name = 'volumeNo';"

# Test API
curl http://localhost:3001/api/articles/search/global?query=test
```
