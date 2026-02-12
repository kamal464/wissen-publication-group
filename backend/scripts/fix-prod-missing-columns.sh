#!/bin/sh
# One-time fix for prod: add missing columns (sortOrder on BoardMember, isVisibleOnSite on Journal)
# Run from repo root or backend: DATABASE_URL=... bash backend/scripts/fix-prod-missing-columns.sh
# Or on server: cd /var/www/wissen-publication-group/backend && bash scripts/fix-prod-missing-columns.sh

set -e
cd "$(dirname "$0")/.."

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: Set DATABASE_URL (e.g. from .env or export)"
  exit 1
fi

echo "Applying add-board-member-sortOrder.sql..."
npx prisma db execute --file prisma/add-board-member-sortOrder.sql --schema prisma/schema.prisma
echo "Applying add-isVisibleOnSite.sql..."
npx prisma db execute --file prisma/add-isVisibleOnSite.sql --schema prisma/schema.prisma
echo "Regenerating Prisma client..."
npx prisma generate
echo "Done. Restart the backend (e.g. pm2 restart all) so the new client is used."