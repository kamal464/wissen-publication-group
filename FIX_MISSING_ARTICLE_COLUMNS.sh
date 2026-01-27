#!/bin/bash
# Fix ALL missing columns in Article table
# Run this on the production server

set -e

echo "=========================================="
echo "🔧 Fixing Missing Article Columns"
echo "=========================================="
echo ""

cd /var/www/wissen-publication-group/backend

# Load database URL from .env
if [ -f .env ]; then
    # Source .env file properly
    set -a
    source .env
    set +a
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in .env"
    exit 1
fi

echo "📊 Adding missing columns to Article table..."
echo ""

# Add ALL missing columns at once using a single SQL block
psql "$DATABASE_URL" <<'SQL'
-- Add all missing columns
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
SQL

if [ $? -eq 0 ]; then
    echo "✅ All columns added successfully!"
else
    echo "❌ Error adding columns"
    exit 1
fi

echo ""
echo "🔄 Regenerating Prisma Client..."
npx prisma generate

echo ""
echo "📊 Verifying columns..."
psql "$DATABASE_URL" -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Article' AND column_name IN ('volumeNo', 'issueNo', 'issueMonth', 'year', 'specialIssue', 'showInInpressCards', 'inPressMonth', 'inPressYear') ORDER BY column_name;"

echo ""
echo "🔄 Restarting backend..."
pm2 restart wissen-backend --update-env
sleep 5

echo ""
echo "✅ Fix complete! Backend restarted."
echo ""
echo "🧪 Testing API..."
sleep 2
curl -s "http://localhost:3001/api/articles/search/global?query=test" | head -20 || echo "API test completed"
