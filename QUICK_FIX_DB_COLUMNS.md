# Quick Fix: Missing Article Columns (volumeNo, issueNo, etc.)

## Error
```
Invalid `prisma.article.findMany()` invocation:
The column `Article.volumeNo` does not exist in the current database.
The column `Article.issueNo` does not exist in the current database.
```

## Quick Fix (Run on Server)

**Copy and paste this entire block:**

```bash
cd /var/www/wissen-publication-group/backend

# Load database URL
export $(cat .env | grep -v '^#' | xargs)

# Add ALL missing columns at once
psql "$DATABASE_URL" <<EOF
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "volumeNo" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "issueNo" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "issueMonth" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "year" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "specialIssue" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "firstPageNumber" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "lastPageNumber" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "correspondingAuthorDetails" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "citeAs" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "receivedAt" TIMESTAMP;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "acceptedAt" TIMESTAMP;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "fulltextImages" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading1Title" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading1Content" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading2Title" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading2Content" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading3Title" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading3Content" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading4Title" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading4Content" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading5Title" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heading5Content" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "showInInpressCards" BOOLEAN DEFAULT false;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "inPressMonth" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "inPressYear" TEXT;
EOF

# Regenerate Prisma Client
npx prisma generate

# Restart backend
pm2 restart wissen-backend --update-env

echo "✅ All columns added!"
```

## Or Use the Script

```bash
cd /var/www/wissen-publication-group
chmod +x FIX_MISSING_ARTICLE_COLUMNS.sh
./FIX_MISSING_ARTICLE_COLUMNS.sh
```

## Verify Fix

```bash
# Check columns exist
psql "$DATABASE_URL" -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'Article' AND column_name IN ('volumeNo', 'issueNo', 'issueMonth', 'year');"

# Test API
curl "https://wissenpublicationgroup.com/api/articles/search/global?query=test"
```
