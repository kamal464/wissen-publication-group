#!/bin/bash
# Fix missing volumeNo column in Article table
# Run this on the production server

set -e

echo "=========================================="
echo "🔧 Fixing Missing volumeNo Column"
echo "=========================================="
echo ""

cd /var/www/wissen-publication-group/backend

# Load database URL from .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if column exists
echo "📊 Checking if volumeNo column exists..."
COLUMN_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'Article' AND column_name = 'volumeNo';" 2>/dev/null | xargs)

if [ "$COLUMN_EXISTS" = "1" ]; then
    echo "✅ volumeNo column already exists"
else
    echo "⚠️ volumeNo column missing. Adding it..."
    
    # Add volumeNo column
    psql "$DATABASE_URL" -c 'ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "volumeNo" TEXT;' || {
        echo "❌ Failed to add volumeNo column"
        exit 1
    }
    
    echo "✅ volumeNo column added"
fi

# Check and add other missing columns from schema
echo ""
echo "📊 Checking for other missing columns..."

MISSING_COLUMNS=(
    "issueNo"
    "issueMonth"
    "year"
    "specialIssue"
    "firstPageNumber"
    "lastPageNumber"
    "correspondingAuthorDetails"
    "citeAs"
    "country"
    "receivedAt"
    "acceptedAt"
    "fulltextImages"
    "heading1Title"
    "heading1Content"
    "heading2Title"
    "heading2Content"
    "heading3Title"
    "heading3Content"
    "heading4Title"
    "heading4Content"
    "heading5Title"
    "heading5Content"
    "showInInpressCards"
    "inPressMonth"
    "inPressYear"
)

for column in "${MISSING_COLUMNS[@]}"; do
    COLUMN_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'Article' AND column_name = '$column';" 2>/dev/null | xargs)
    
    if [ "$COLUMN_EXISTS" = "0" ]; then
        echo "⚠️ Adding missing column: $column"
        
        # Determine column type based on column name
        if [[ "$column" == *"Content" ]] || [[ "$column" == "correspondingAuthorDetails" ]] || [[ "$column" == "citeAs" ]] || [[ "$column" == "fulltextImages" ]]; then
            COLUMN_TYPE="TEXT"
        elif [[ "$column" == *"At" ]]; then
            COLUMN_TYPE="TIMESTAMP"
        elif [[ "$column" == "showInInpressCards" ]]; then
            COLUMN_TYPE="BOOLEAN DEFAULT false"
        else
            COLUMN_TYPE="TEXT"
        fi
        
        psql "$DATABASE_URL" -c "ALTER TABLE \"Article\" ADD COLUMN IF NOT EXISTS \"$column\" $COLUMN_TYPE;" || {
            echo "⚠️ Failed to add $column (may already exist or have different type)"
        }
    fi
done

echo ""
echo "🔄 Regenerating Prisma Client..."
npx prisma generate

echo ""
echo "✅ Database columns fixed!"
echo ""
echo "📊 Verifying volumeNo column..."
psql "$DATABASE_URL" -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Article' AND column_name IN ('volumeNo', 'issueNo', 'year', 'issueMonth');"

echo ""
echo "🔄 Restarting backend..."
pm2 restart wissen-backend --update-env
sleep 5

echo ""
echo "✅ Fix complete! Backend restarted."
