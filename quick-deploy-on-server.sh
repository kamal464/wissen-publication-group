#!/bin/bash
# ==========================================
# Quick deploy ON the EC2 instance (AWS)
# Run this in the browser terminal on the server:
#   cd /var/www/wissen-publication-group
#   chmod +x quick-deploy-on-server.sh && ./quick-deploy-on-server.sh
#   # or without chmod:  bash quick-deploy-on-server.sh
# ==========================================

set -e
APP_DIR="${1:-$(cd "$(dirname "$0")" && pwd)}"
cd "$APP_DIR"

echo "=========================================="
echo "Quick deploy on server: $APP_DIR"
echo "=========================================="

echo "💾 Freeing disk space (quick cleanup)..."
sudo journalctl --vacuum-time=3d 2>/dev/null || true
sudo apt-get clean 2>/dev/null || true
pm2 flush 2>/dev/null || true

echo "📥 Pulling latest..."
git pull

echo "🔨 Building backend..."
cd backend
npm install --no-audit --no-fund
npm run build
npm install --omit=dev --no-audit --no-fund
cd ..

echo "🔨 Building frontend..."
cd frontend
npm install --no-audit --no-fund
npm run build
npm install --omit=dev --no-audit --no-fund
cd ..

echo "🔄 Restarting PM2..."
cd "$APP_DIR"
pm2 restart all || (pm2 start backend/dist/src/main.js --name wissen-backend; pm2 start 'npm -- start' --name wissen-frontend --cwd frontend; pm2 save)

echo "✅ Deploy complete"
pm2 status
echo "=========================================="
