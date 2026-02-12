#!/bin/bash
# ==========================================
# Quick deploy – build and restart (use for build/deploy)
# Run ON the server:  cd /var/www/wissen-publication-group && ./quick-deploy.sh
# Or from local with SSH:  DEPLOY_HOST=ubuntu@YOUR_EC2_IP ./quick-deploy.sh
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
  ssh "$DEPLOY_HOST" "cd $REMOTE_PATH && git pull && bash -s" < "$0"
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
npm install --no-audit --no-fund
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
  echo "  ssh ubuntu@YOUR_EC2_IP 'cd /var/www/wissen-publication-group && git pull && ./quick-deploy.sh'"
  echo "  DEPLOY_HOST=ubuntu@YOUR_EC2_IP ./quick-deploy.sh"
  echo "(Replace YOUR_EC2_IP with your server IP, e.g. 54.165.116.208)"
fi
echo "=========================================="
