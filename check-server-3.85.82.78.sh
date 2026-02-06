#!/bin/bash
# Connect to EC2 3.85.82.78 and diagnose why server is not coming up
# Run from Git Bash: ./check-server-3.85.82.78.sh

set -e
KEY="${DEPLOY_KEY:-$HOME/.ssh/wissen-secure-key-2.pem}"
HOST="ubuntu@3.85.82.78"
REMOTE_PATH="/var/www/wissen-publication-group"

if [ ! -f "$KEY" ]; then
  echo "Key not found: $KEY"
  echo "Set DEPLOY_KEY or put your .pem at ~/.ssh/wissen-secure-key-2.pem"
  exit 1
fi

echo "Connecting to $HOST ..."
echo ""

ssh -i "$KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new "$HOST" bash -s << 'REMOTE'
set -e
echo "=== 1. PM2 processes ==="
pm2 list 2>/dev/null || echo "PM2 not running or not installed"

echo ""
echo "=== 2. Backend health (port 3001) ==="
curl -s -m 5 http://localhost:3001/health 2>/dev/null && echo "" || echo "Backend not responding"

echo ""
echo "=== 3. Frontend (port 3000) ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" -m 5 http://localhost:3000/ 2>/dev/null || echo "Frontend not responding"

echo ""
echo "=== 4. Nginx ==="
sudo systemctl is-active nginx 2>/dev/null || echo "nginx not active"

echo ""
echo "=== 5. App directory exists? ==="
ls -la /var/www/wissen-publication-group 2>/dev/null | head -5 || echo "Directory not found"

echo ""
echo "=== 6. Backend .env present? ==="
[ -f /var/www/wissen-publication-group/backend/.env ] && echo "Yes" || echo "No (missing - backend will fail)"

echo ""
echo "=== 7. Last 15 lines PM2 backend error log ==="
pm2 show wissen-backend 2>/dev/null | tail -20 || cat /var/www/wissen-publication-group/backend/logs/backend-error.log 2>/dev/null | tail -15 || echo "No backend log"

echo ""
echo "=== 8. Last 10 lines PM2 frontend error log ==="
pm2 show wissen-frontend 2>/dev/null | tail -15 || cat /var/www/wissen-publication-group/frontend/logs/frontend-error.log 2>/dev/null | tail -10 || echo "No frontend log"

echo ""
echo "=== 9. Disk space ==="
df -h / | tail -1

echo ""
echo "=== 10. Node version ==="
node --version 2>/dev/null || echo "Node not found"

echo ""
echo "=== 11. MASTER_SETUP items (lines 245-253) ==="
APP="/var/www/wissen-publication-group"
grep -q "autorestart.*true" "$APP/ecosystem.config.js" 2>/dev/null && echo "  ✅ Auto-restart on crash (PM2)" || echo "  ❌ Auto-restart: check ecosystem.config.js"
systemctl is-enabled pm2-ubuntu 2>/dev/null | grep -q "enabled" && echo "  ✅ Auto-start on reboot (pm2-ubuntu)" || echo "  ❌ Auto-start: run pm2 startup && pm2 save"
[ -x "$APP/health-monitor.sh" ] && crontab -l 2>/dev/null | grep -q "health-monitor" && echo "  ✅ Health monitoring (every 5 min)" || echo "  ❌ Health monitor: script or cron missing" || echo "  ❌ Health monitor: script missing"
sudo ufw status 2>/dev/null | grep -q "Status: active" && echo "  ✅ Firewall (UFW) active" || echo "  ❌ Firewall not active"
systemctl is-active fail2ban 2>/dev/null | grep -q "active" && echo "  ✅ Fail2ban active" || echo "  ❌ Fail2ban not active"
dpkg -l unattended-upgrades 2>/dev/null | grep -q "^ii" && echo "  ✅ Automatic security updates (unattended-upgrades)" || echo "  ❌ unattended-upgrades not installed"
grep -q "max_memory_restart" "$APP/ecosystem.config.js" 2>/dev/null && echo "  ✅ Memory limit (max_memory_restart)" || echo "  ❌ max_memory_restart not in ecosystem.config.js"
[ -d "$APP/backend/logs" ] && [ -d "$APP/frontend/logs" ] && echo "  ✅ Logging (backend + frontend log dirs)" || echo "  ⚠️ Log dirs missing (PM2 will create on start)"
REMOTE

echo ""
echo "Done. If PM2 shows stopped/errored, run on server:"
echo "  cd /var/www/wissen-publication-group && pm2 restart all && pm2 save"
echo "If backend .env is missing, copy from backend/prod.env and redeploy."
