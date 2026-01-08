#!/bin/bash
# Fix CORS by rebuilding frontend with origin-matching logic
# Run this on EC2: bash FIX_CORS_REBUILD.sh

cd /var/www/wissen-publication-group

echo "🔄 Pulling latest changes..."
git pull origin main || echo "⚠️  Git pull failed, continuing with existing code..."

echo "🔧 Rebuilding frontend with CORS fix..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Build the frontend
echo "🏗️  Building frontend..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "🔄 Restarting frontend..."
cd /var/www/wissen-publication-group
pm2 restart wissen-frontend

echo "⏳ Waiting 10 seconds for frontend to start..."
sleep 10

echo "✅ Checking frontend status..."
pm2 status wissen-frontend

echo ""
echo "✅ Frontend rebuilt and restarted!"
echo "🌐 Test your site now - CORS errors should be fixed."
echo ""
echo "The frontend will now automatically use the same origin as the page"
echo "when accessing via IP (http://54.165.116.208) or domain (http://wissenpublicationgroup.com)"

