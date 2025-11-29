#!/bin/sh
# Run Prisma migrations
# This script is used in Docker containers and CI/CD pipelines

set -e

echo "🔄 Running Prisma migrations..."

# Generate Prisma Client (if not already generated)
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🚀 Applying database migrations..."
npx prisma migrate deploy

echo "✅ Migrations completed successfully!"

