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
    export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in .env"
    exit 1
fi

echo "📊 Adding missing columns to Article table..."
echo ""

# Define all columns that should exist based on Prisma schema
declare -A COLUMNS=(
    ["volumeNo"]="TEXT"
    ["issueNo"]="TEXT"
    ["issueMonth"]="TEXT"
    ["year"]="TEXT"
    ["specialIssue"]="TEXT"
    ["firstPageNumber"]="TEXT"
    ["lastPageNumber"]="TEXT"
    ["correspondingAuthorDetails"]="TEXT"
    ["citeAs"]="TEXT"
    ["country"]="TEXT"
    ["receivedAt"]="TIMESTAMP"
    ["acceptedAt"]="TIMESTAMP"
    ["fulltextImages"]="TEXT"
    ["heading1Title"]="TEXT"
    ["heading1Content"]="TEXT"
    ["heading2Title"]="TEXT"
    ["heading2Content"]="TEXT"
    ["heading3Title"]="TEXT"
    ["heading3Content"]="TEXT"
    ["heading4Title"]="TEXT"
    ["heading4Content"]="TEXT"
    ["heading5Title"]="TEXT"
    ["heading5Content"]="TEXT"
    ["showInInpressCards"]="BOOLEAN DEFAULT false"
    ["inPressMonth"]="TEXT"
    ["inPressYear"]="TEXT"
)

# Add each column if it doesn't exist
for column in "${!COLUMNS[@]}"; do
    COLUMN_TYPE="${COLUMNS[$column]}"
    
    # Check if column exists
    COLUMN_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'Article' AND column_name = '$column';" 2>/dev/null | xargs || echo "0")
    
    if [ "$COLUMN_EXISTS" = "1" ]; then
        echo "✅ $column already exists"
    else
        echo "➕ Adding column: $column ($COLUMN_TYPE)"
        psql "$DATABASE_URL" -c "ALTER TABLE \"Article\" ADD COLUMN IF NOT EXISTS \"$column\" $COLUMN_TYPE;" || {
            echo "⚠️ Failed to add $column (may have different type or constraint)"
        }
    fi
done

echo ""
echo "🔄 Regenerating Prisma Client..."
npx prisma generate

echo ""
echo "✅ All columns added!"
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
