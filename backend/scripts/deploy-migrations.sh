#!/bin/sh
# Script to deploy database migrations to production
# This script should be run in the Docker container or on the production server

set -e

echo "🔄 Starting database migration deployment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

echo "📋 Checking Prisma CLI..."
if ! command -v npx &> /dev/null; then
  echo "❌ ERROR: npx not found. Make sure Node.js is installed."
  exit 1
fi

echo "🔍 Checking for pending migrations..."
npx prisma migrate status

echo "🚀 Deploying migrations..."
npx prisma migrate deploy

echo "✅ Migrations deployed successfully!"

echo "🔄 Regenerating Prisma Client..."
npx prisma generate

echo "✅ All done! Database is up to date."
