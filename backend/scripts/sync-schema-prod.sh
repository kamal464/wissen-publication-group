#!/bin/bash

# Script to sync Prisma schema with production database
# This ensures all migrations are applied after push

set -e

echo "🚀 Syncing Prisma schema with production database..."
echo "📋 Current directory: $(pwd)"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set!"
  echo "Please set it to your production database URL."
  exit 1
fi

# Navigate to backend directory if not already there
if [ ! -f "prisma/schema.prisma" ]; then
  if [ -d "backend" ]; then
    cd backend
  else
    echo "❌ ERROR: Cannot find prisma/schema.prisma file"
    exit 1
  fi
fi

echo "📊 Checking migration status..."
npx prisma migrate status || echo "⚠️ Some migrations may be pending"

echo "🔄 Deploying migrations to production..."
npx prisma migrate deploy

echo "📦 Regenerating Prisma Client..."
npx prisma generate

echo "✅ Schema sync completed successfully!"
