#!/bin/bash
# Verify server has all items from MASTER_SETUP.sh (lines 245-253).
# Deployed with quick-deploy.sh to $REMOTE_PATH (e.g. /var/www/wissen-publication-group).
# Run ON the server: bash /var/www/wissen-publication-group/check-server-setup.sh
# Or from Git Bash: ssh -i "$DEPLOY_KEY" ubuntu@IP 'bash -s' < check-server-setup.sh  (use LF line endings)

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()  { echo -e "${GREEN}✅ $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️ $1${NC}"; }

echo "=========================================="
echo "Server setup check (MASTER_SETUP.sh items)"
echo "=========================================="
echo ""

# 1. Auto-restart on crash (PM2 autorestart)
echo "1. Auto-restart on crash (PM2 autorestart):"
if grep -q "autorestart.*true" /var/www/wissen-publication-group/ecosystem.config.js 2>/dev/null; then
  ok "ecosystem.config.js has autorestart: true"
else
  fail "ecosystem.config.js missing or autorestart not true"
fi
echo ""

# 2. Auto-start on reboot (PM2 startup systemd)
echo "2. Auto-start on reboot (PM2 startup):"
if systemctl is-enabled pm2-ubuntu 2>/dev/null | grep -q "enabled"; then
  ok "pm2-ubuntu service enabled for boot"
elif pm2 startup 2>/dev/null | grep -q "systemd"; then
  warn "PM2 reports systemd but service may not be enabled (run: systemctl is-enabled pm2-ubuntu)"
else
  fail "PM2 startup not configured (run: pm2 startup && pm2 save)"
fi
echo ""

# 3. Health monitoring (every 5 minutes)
echo "3. Health monitoring (every 5 minutes):"
CRON_OK=0
if [ -x /var/www/wissen-publication-group/health-monitor.sh 2>/dev/null ]; then
  ok "health-monitor.sh exists and executable"
  crontab -l 2>/dev/null | grep -q "health-monitor" && CRON_OK=1
else
  fail "health-monitor.sh missing or not executable"
fi
if [ "$CRON_OK" -eq 1 ]; then
  ok "cron has health-monitor (every 5 min)"
else
  fail "cron does not run health-monitor"
fi
echo ""

# 4. Firewall protection
echo "4. Firewall protection:"
if sudo ufw status 2>/dev/null | grep -q "Status: active"; then
  ok "UFW firewall active"
else
  fail "UFW not active (run: sudo ufw enable)"
fi
echo ""

# 5. Fail2ban protection
echo "5. Fail2ban protection:"
if systemctl is-active fail2ban 2>/dev/null | grep -q "active"; then
  ok "Fail2ban active"
else
  fail "Fail2ban not active (run: sudo systemctl start fail2ban)"
fi
echo ""

# 6. Automatic security updates
echo "6. Automatic security updates:"
if dpkg -l unattended-upgrades 2>/dev/null | grep -q "^ii"; then
  ok "unattended-upgrades installed"
else
  fail "unattended-upgrades not installed (run: sudo apt install unattended-upgrades)"
fi
echo ""

# 7. Memory limit protection
echo "7. Memory limit protection:"
if grep -q "max_memory_restart" /var/www/wissen-publication-group/ecosystem.config.js 2>/dev/null; then
  ok "ecosystem.config.js has max_memory_restart set"
else
  fail "max_memory_restart not set in ecosystem.config.js"
fi
echo ""

# 8. Comprehensive logging
echo "8. Comprehensive logging:"
LOG_OK=0
[ -d /var/www/wissen-publication-group/backend/logs ] && LOG_OK=$((LOG_OK+1))
[ -d /var/www/wissen-publication-group/frontend/logs ] && LOG_OK=$((LOG_OK+1))
[ -f /var/log/health-monitor.log ] || true
if [ "$LOG_OK" -eq 2 ]; then
  ok "PM2 log dirs exist (backend/logs, frontend/logs)"
else
  warn "Some log dirs missing (backend/logs and/or frontend/logs)"
fi
echo ""

echo "=========================================="
echo "Done. Fix any ❌ items and re-run MASTER_SETUP.sh if needed."
echo "=========================================="
