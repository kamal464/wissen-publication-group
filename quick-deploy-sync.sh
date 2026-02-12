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
#
# If prod shows "Database missing sortOrder" or invalid journal.update(isVisibleOnSite):
#   On server: cd $REMOTE_PATH/backend && source ../.env 2>/dev/null; bash scripts/fix-prod-missing-columns.sh
#   Then: pm2 restart all
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
echo "  (If you have 'npm run dev' running in another terminal, stop it with Ctrl+C first.)"
cd frontend
frontend_ok=1
if [ -n "$SKIP_FRONTEND_INSTALL" ]; then
  echo "  Skipping npm install (SKIP_FRONTEND_INSTALL is set)."
else
  for try in 1 2 3; do
    if npm install --no-audit --no-fund; then frontend_ok=0; break; fi
    echo "  Install failed (file locked?). Stop 'npm run dev' if running, retrying in 5s... (try $try/3)"
    sleep 5
  done
  if [ "$frontend_ok" -ne 0 ]; then
    echo ""
    echo "Frontend install failed (file locked). Trying build with existing node_modules..."
    if ! npm run build 2>/dev/null; then
      echo ""
      echo "ERROR: Build also failed. Stop 'npm run dev' (Ctrl+C), then run this deploy again."
      echo "  Or run: SKIP_FRONTEND_INSTALL=1 SSH_KEY=... bash quick-deploy-sync.sh"
      exit 1
    fi
    echo "  Build with existing node_modules succeeded. Continuing deploy..."
    cd "$APP_DIR"
    # Skip the npm run build below (already done)
    frontend_build_done=1
  fi
fi
if [ -z "$frontend_build_done" ]; then
  npm run build
fi
[ -n "$frontend_build_done" ] && cd "$APP_DIR/frontend"
npm install --omit=dev --no-audit --no-fund 2>/dev/null || true
cd ..

echo "Packing build artifacts (excluding .next/cache to save space)..."
BUILD_TAR="$APP_DIR/build-artifacts.tgz"
rm -f "$BUILD_TAR"

tar czf "$BUILD_TAR" \
  --exclude='frontend/.next/cache' \
  backend/dist \
  backend/prisma \
  backend/package.json backend/package-lock.json \
  frontend/.next frontend/public \
  frontend/package.json frontend/package-lock.json

echo "Uploading artifacts to server..."
scp -i "$SSH_KEY" "$BUILD_TAR" "$SERVER:/tmp/wissen-build-artifacts.tgz"
# Copy verify script so it can be run on the server
[ -f "$APP_DIR/VERIFY_MASTER_SETUP.sh" ] && scp -i "$SSH_KEY" "$APP_DIR/VERIFY_MASTER_SETUP.sh" "$SERVER:$REMOTE_PATH/VERIFY_MASTER_SETUP.sh" 2>/dev/null || true

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
  echo "Running Prisma migrations..."
  npx prisma migrate deploy
  echo "Regenerating Prisma client..."
  npx prisma generate
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
