#!/bin/bash
# ==========================================
# Quick deploy (SYNC) – build locally, sync to server, run migrations, restart PM2
#
# Usage from Git Bash (Windows) in repo root:
#   SSH_KEY=~/.ssh/wissen-secure-key-2.pem bash quick-deploy-sync.sh
#
# Uses:
#   SERVER     = ubuntu@3.85.82.78
#   SSH_KEY    = path to your PEM (default: ~/.ssh/wissen-secure-key-2.pem)
#   REMOTE_PATH = /var/www/wissen-publication-group
# ==========================================

set -e

SERVER="${SERVER:-ubuntu@3.85.82.78}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/wissen-secure-key-2.pem}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/wissen-publication-group}"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=========================================="
echo "Quick deploy SYNC: local build, sync to $SERVER"
echo "App dir: $APP_DIR"
echo "Remote : $REMOTE_PATH"
echo "SSH key: $SSH_KEY"
echo "=========================================="

cd "$APP_DIR"

echo "Pulling latest (local)..."
git pull

echo "Building backend (local)..."
cd backend
npm install --no-audit --no-fund
npm run build
npm install --omit=dev --no-audit --no-fund 2>/dev/null || true
cd ..

echo "Building frontend (local)..."
cd frontend
frontend_ok=1
for _ in 1 2; do
  if npm install --no-audit --no-fund; then frontend_ok=0; break; fi
  echo "Install failed (file may be locked). Stop 'npm run dev' if running, then retrying in 3s..."
  sleep 3
done
if [ "$frontend_ok" -ne 0 ]; then
  echo "ERROR: Stop the dev server (Ctrl+C) and run again."
  exit 1
fi
npm run build
npm install --omit=dev --no-audit --no-fund 2>/dev/null || true
cd ..

echo "Packing build artifacts (excluding .next/cache to save space)..."
BUILD_TAR="$APP_DIR/build-artifacts.tgz"
rm -f "$BUILD_TAR"

tar czf "$BUILD_TAR" \
  --exclude='frontend/.next/cache' \
  backend/dist \
  backend/package.json backend/package-lock.json \
  frontend/.next frontend/public \
  frontend/package.json frontend/package-lock.json

echo "Uploading artifacts to server..."
scp -i "$SSH_KEY" "$BUILD_TAR" "$SERVER:/tmp/wissen-build-artifacts.tgz"

echo "Deploying on server..."
ssh -i "$SSH_KEY" "$SERVER" bash << 'REMOTEEOF'
set -e
REMOTE_PATH="/var/www/wissen-publication-group"

echo "=========================================="
echo "Freeing disk space on server..."
cd "$REMOTE_PATH"
# Remove old builds to free space (don't keep backups when disk is tight)
rm -rf backend/dist.bak frontend/.next.bak 2>/dev/null || true
rm -rf backend/dist frontend/.next 2>/dev/null || true
# Clear caches to free more space (optional best-effort)
npm cache clean --force 2>/dev/null || true

echo "Applying build artifacts on server..."
tar xzf /tmp/wissen-build-artifacts.tgz
rm -f /tmp/wissen-build-artifacts.tgz

echo "Installing backend prod deps & running migrations..."
cd backend
npm install --omit=dev --no-audit --no-fund
if command -v npx >/dev/null 2>&1; then
  npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss 2>/dev/null || true
fi
cd ..

echo "Installing frontend prod deps..."
cd frontend
npm install --omit=dev --no-audit --no-fund
cd ..

echo "Restarting PM2..."
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart all 2>/dev/null || (pm2 start ecosystem.config.js --update-env && pm2 save)
  pm2 status
else
  echo "WARNING: PM2 not found on server."
fi

echo "Deploy SYNC complete on server."
echo "=========================================="
REMOTEEOF

rm -f "$BUILD_TAR"
echo "=========================================="
echo "Quick deploy SYNC finished."
echo "=========================================="
