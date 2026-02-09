#!/bin/bash
# ==========================================
# Quick restart (AWS browser terminal / SSH)
# Use when the webapp is slow after idle.
# Run on the EC2 instance:
#   cd /var/www/wissen-publication-group && ./restart-on-server.sh
# Or one-liner: cd /var/www/wissen-publication-group && pm2 restart all && pm2 save && pm2 status
# ==========================================

APP_DIR="${1:-/var/www/wissen-publication-group}"
cd "$APP_DIR" || { echo "❌ Directory not found: $APP_DIR"; exit 1; }

echo "🔄 Restarting PM2 apps..."
pm2 restart all || { pm2 start ecosystem.config.js --update-env; pm2 save; }
pm2 save
echo "✅ Done"
pm2 status
