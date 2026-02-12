#!/bin/bash
# ==========================================
# Verify MASTER_SETUP.sh is working on the server
# Run this ON the server (after SSH), not on your local machine!
# ==========================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Detect if running locally (e.g. Windows Git Bash) instead of on server
if [ ! -d /var/www/wissen-publication-group ] && [ ! -d /var/www ]; then
  echo -e "${RED}=========================================="
  echo -e "Wrong place: run this ON THE SERVER"
  echo -e "==========================================${NC}"
  echo ""
  echo "This script checks server config (PM2, firewall, ports)."
  echo "You ran it on your local machine. Do this instead:"
  echo ""
  echo "  1. SSH into your server:"
  echo -e "     ${YELLOW}ssh -i /path/to/your.pem ubuntu@3.85.82.78${NC}"
  echo ""
  echo "  2. Then on the server run:"
  echo -e "     ${YELLOW}cd /var/www/wissen-publication-group${NC}"
  echo -e "     ${YELLOW}bash VERIFY_MASTER_SETUP.sh${NC}"
  echo ""
  echo "  (If the repo isn't there yet, deploy first with quick-deploy-sync.sh)"
  echo ""
  exit 1
fi

# Use app dir if we're on the server
cd /var/www/wissen-publication-group 2>/dev/null || true

echo "=========================================="
echo "Verifying MASTER_SETUP configuration"
echo "=========================================="
echo ""

PASS=0
FAIL=0

check() {
  if [ "$1" = "0" ]; then
    echo -e "${GREEN}✅ $2${NC}"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}❌ $2${NC}"
    FAIL=$((FAIL + 1))
  fi
}

# 1. PM2 installed
command -v pm2 &>/dev/null; check $? "PM2 installed"

# 2. PM2 startup (survives reboot)
pm2 startup 2>/dev/null | grep -q "systemd"; check $? "PM2 startup on reboot configured"

# 3. Backend app in PM2 and online
pm2 list 2>/dev/null | grep -q "wissen-backend.*online"; check $? "Backend (wissen-backend) running in PM2"

# 4. Frontend app in PM2 and online
pm2 list 2>/dev/null | grep -q "wissen-frontend.*online"; check $? "Frontend (wissen-frontend) running in PM2"

# 5. Backend port 3001 listening
sudo ss -tlnp 2>/dev/null | grep -q ":3001"; check $? "Port 3001 (backend) listening"

# 6. Frontend port 3000 listening
sudo ss -tlnp 2>/dev/null | grep -q ":3000"; check $? "Port 3000 (frontend) listening"

# 7. Backend health endpoint
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null || echo "000")
[ "$HTTP" = "200" ]; check $? "Backend health (localhost:3001/health) returns 200"

# 8. Frontend responding
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
[ "$HTTP" = "200" ] || [ "$HTTP" = "304" ]; check $? "Frontend (localhost:3000) responding"

# 9. Firewall active
sudo ufw status 2>/dev/null | grep -q "Status: active"; check $? "Firewall (ufw) active"

# 10. Fail2ban installed/running
command -v fail2ban-client &>/dev/null && sudo systemctl is-active fail2ban &>/dev/null; check $? "Fail2ban installed and active"

# 11. Health monitor cron (runs every 3 min)
crontab -l 2>/dev/null | grep -q "health-monitor"; check $? "Health monitor cron job (every 3 min) configured"

# 12. Health monitor script exists and executable
[ -x /var/www/wissen-publication-group/health-monitor.sh ] 2>/dev/null; check $? "Health monitor script exists and executable"

# 13. Log directory for PM2/health
[ -d /var/log/pm2 ] 2>/dev/null; check $? "Log directory /var/log/pm2 exists"

# 14. Swap (optional but recommended)
swapon --show 2>/dev/null | grep -q .; check $? "Swap enabled"

# 15. Unattended-upgrades (auto security updates)
dpkg -l unattended-upgrades &>/dev/null | grep -q "unattended-upgrades"; check $? "Unattended-upgrades (auto security updates) installed"

echo ""
echo "=========================================="
echo -e "Result: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo "=========================================="
if [ $FAIL -gt 0 ]; then
  echo ""
  echo "If any checks failed:"
  echo "  - Run MASTER_SETUP.sh on the server (once) to fix server config."
  echo "  - Run quick-deploy-sync.sh from your machine to fix app/code."
  exit 1
fi
exit 0
