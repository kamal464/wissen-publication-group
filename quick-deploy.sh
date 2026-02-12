#!/bin/bash
# ==========================================
# Quick deploy – build and restart (use for build/deploy)
#
# Git Bash (Windows): from repo root run:
#   bash quick-deploy.sh
# If you see EBUSY/locked: stop the frontend dev server (Ctrl+C in terminal running npm run dev), then run again.
# If you see "bad interpreter" or odd errors, fix line endings first:
#   sed -i 's/\r$//' quick-deploy.sh
# then: bash quick-deploy.sh
#
# Run ON the server:  cd /var/www/wissen-publication-group && ./quick-deploy.sh
# From local (Git Bash or WSL) deploy to server via SSH:
#   SSH_KEY=~/.ssh/wissen-secure-key-2.pem DEPLOY_HOST=ubuntu@3.85.82.78 bash quick-deploy.sh
# ==========================================

set -e

# If DEPLOY_HOST is set, run this script on the remote server via SSH
if [ -n "$DEPLOY_HOST" ]; then
  echo "=========================================="
  echo "Deploying via SSH to $DEPLOY_HOST"
  echo "=========================================="
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  # Use the same path on remote if possible, or default
  REMOTE_PATH="${DEPLOY_PATH:-/var/www/wissen-publication-group}"
  if [ -n "$SSH_KEY" ]; then
    echo "Using SSH key: $SSH_KEY"
    ssh -i "$SSH_KEY" "$DEPLOY_HOST" "cd $REMOTE_PATH && git pull && bash -s" < "$0"
  else
    ssh "$DEPLOY_HOST" "cd $REMOTE_PATH && git pull && bash -s" < "$0"
  fi
  exit $?
fi

APP_DIR="${1:-$(cd "$(dirname "$0")" && pwd)}"
cd "$APP_DIR"

echo "=========================================="
echo "Quick deploy: $APP_DIR"
echo "=========================================="

# Optional quick disk cleanup on server (no-ops on Windows or without sudo)
if command -v sudo &>/dev/null; then
  echo "Freeing disk space (quick cleanup)..."
  sudo journalctl --vacuum-time=3d 2>/dev/null || true
  sudo apt-get clean 2>/dev/null || true
fi
command -v pm2 &>/dev/null && pm2 flush 2>/dev/null || true

echo "Pulling latest..."
git pull

echo "Building backend..."
cd backend
npm install --no-audit --no-fund
npm run build
npm install --omit=dev --no-audit --no-fund 2>/dev/null || true
cd ..

echo "Building frontend..."
cd frontend
# Retry npm install if EBUSY (file locked by dev server / IDE)
frontend_ok=1
for _ in 1 2; do
  if npm install --no-audit --no-fund; then frontend_ok=0; break; fi
  echo "Install failed (file may be locked). Stop 'npm run dev' if running, then retrying in 3s..."
  sleep 3
done
if [ "$frontend_ok" -ne 0 ]; then
  echo "ERROR: Stop the dev server (Ctrl+C) and run: bash quick-deploy.sh"
  exit 1
fi
npm run build
npm install --omit=dev --no-audit --no-fund 2>/dev/null || true
cd ..

echo "Restarting PM2..."
cd "$APP_DIR"
if command -v pm2 &>/dev/null; then
  pm2 restart all 2>/dev/null || (pm2 start ecosystem.config.js --update-env && pm2 save)
  echo "Deploy complete"
  pm2 status
else
  echo "Deploy complete (build only). PM2 not found on this machine."
  echo ""
  echo "To deploy and restart on the server, run one of:"
  echo "  ssh ubuntu@3.85.82.78 'cd /var/www/wissen-publication-group && git pull && ./quick-deploy.sh'"
  echo "  DEPLOY_HOST=ubuntu@3.85.82.78 bash quick-deploy.sh"
fi
echo "=========================================="
