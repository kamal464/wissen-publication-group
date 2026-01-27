#!/bin/bash
# Quick Robust Deployment Script
# Pull, build, deploy, test, and verify everything

set -e

echo "=========================================="
echo "🚀 QUICK ROBUST DEPLOYMENT"
echo "=========================================="
echo ""

cd /var/www/wissen-publication-group

# Pull latest
echo "📥 Pulling latest code..."
git fetch origin
git pull origin main

# Backend
echo "📦 Backend: Installing dependencies..."
cd backend
npm install --production --no-audit --no-fund
echo "🔨 Backend: Building..."
npm run build
cd ..

# Frontend
echo "📦 Frontend: Installing dependencies..."
cd frontend
npm install --production --no-audit --no-fund
echo "🔨 Frontend: Building..."
NODE_OPTIONS="--max-old-space-size=2048" npm run build
cd ..

# Restart services
echo "🔄 Restarting services..."
pm2 restart all --update-env

# Wait
echo "⏳ Waiting for services..."
sleep 20

# Health checks
echo "🏥 Health checks..."
curl -s http://localhost:3001/health && echo " ✅ Backend" || echo " ❌ Backend"
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# Final status
echo ""
pm2 list
echo ""
echo "✅ Deployment complete!"
