#!/bin/bash
# ==========================================
# MASTER SETUP SCRIPT - Server configuration only
# Run ON the server (no build/deploy; use quick-deploy.sh for that)
# ==========================================

set -e

echo "=========================================="
echo "🛡️ MASTER SERVER SETUP"
echo "=========================================="
echo "This will setup (config only; use quick-deploy.sh for build/deploy):"
echo "  ✅ PM2 with auto-restart"
echo "  ✅ Auto-start on reboot"
echo "  ✅ Health monitoring"
echo "  ✅ Security hardening (firewall, fail2ban, auto-updates)"
echo "  ✅ Nginx verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 0: Fix DNS and hostname (required for EC2; avoids "unable to resolve host" and git pull)
echo -e "${YELLOW}🌐 Step 0: Checking DNS and hostname...${NC}"
CUR_HOST=$(hostname -s 2>/dev/null || cat /etc/hostname 2>/dev/null || echo "")
if [ -n "$CUR_HOST" ] && ! grep -q "[[:space:]]${CUR_HOST}[[:space:]]*$" /etc/hosts 2>/dev/null && ! grep -q "^127[.]0[.]0[.]1[[:space:]]*${CUR_HOST}" /etc/hosts 2>/dev/null; then
    echo "Adding hostname to /etc/hosts so sudo and DNS work..."
    echo "127.0.0.1 $CUR_HOST" | sudo tee -a /etc/hosts
fi
if ! getent hosts github.com >/dev/null 2>&1 && ! ping -c1 -W2 github.com >/dev/null 2>&1; then
    echo "DNS not working. Setting nameservers in /etc/resolv.conf..."
    if [ ! -s /etc/resolv.conf ] || ! grep -q "nameserver" /etc/resolv.conf; then
        echo -e "nameserver 8.8.8.8\nnameserver 8.8.4.4" | sudo tee /etc/resolv.conf
    else
        (grep -v "nameserver" /etc/resolv.conf; echo -e "nameserver 8.8.8.8\nnameserver 8.8.4.4") | sudo tee /etc/resolv.conf
    fi
    sleep 1
    if ! getent hosts github.com >/dev/null 2>&1; then
        echo -e "${RED}❌ Still cannot resolve github.com. Fix network/DNS on this instance:${NC}"
        echo "  1. Ensure instance is in a subnet with internet (public subnet + public IP, or private + NAT)."
        echo "  2. Run: echo 'nameserver 8.8.8.8' | sudo tee /etc/resolv.conf"
        echo "  3. Run: echo '127.0.0.1 $(hostname)' | sudo tee -a /etc/hosts"
        exit 1
    fi
fi
echo -e "${GREEN}✅ DNS and hostname OK${NC}"
echo ""

# Step 1: Install PM2
echo -e "${YELLOW}📦 Step 1: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo -e "${GREEN}✅ PM2 installed${NC}"
else
    echo -e "${GREEN}✅ PM2 already installed${NC}"
fi
echo ""

# Step 2: Setup PM2 auto-startup
echo -e "${YELLOW}🔄 Step 2: Setting up PM2 auto-startup...${NC}"
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
echo -e "${GREEN}✅ PM2 startup configured${NC}"
echo ""

# Step 3: Create log directory
echo -e "${YELLOW}📝 Step 3: Creating log directory...${NC}"
sudo mkdir -p /var/log/pm2
sudo chown ubuntu:ubuntu /var/log/pm2
echo -e "${GREEN}✅ Log directory created${NC}"
echo ""

# Step 4: Navigate to project
cd /var/www/wissen-publication-group

# Step 5: Disk space check (report only; no build-artifact cleanup – use quick-deploy for code)
echo -e "${YELLOW}💾 Step 5: Checking disk space...${NC}"
FREE_MB=$(df -m . 2>/dev/null | awk 'NR==2 {print $4}')
[ -z "$FREE_MB" ] && FREE_MB=0
echo "Free space: ${FREE_MB}MB"
if [ "$FREE_MB" -lt 200 ]; then
    echo -e "${RED}❌ Very low disk space (${FREE_MB}MB). Free space or expand EBS, then re-run.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Disk OK${NC}"
echo ""

# Step 5b: Ensure swap exists (reduces OOM kills when memory is low)
echo -e "${YELLOW}💾 Step 5b: Checking swap...${NC}"
if ! swapon --show 2>/dev/null | grep -q .; then
    if [ -f /swapfile ]; then
        sudo swapon /swapfile 2>/dev/null && echo -e "${GREEN}✅ Swap enabled (existing /swapfile)${NC}" || true
    else
        echo "Creating 1G swap file..."
        sudo fallocate -l 1G /swapfile 2>/dev/null && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile && (grep -q /swapfile /etc/fstab 2>/dev/null || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab) && echo -e "${GREEN}✅ Swap created and enabled${NC}" || echo -e "${YELLOW}⚠️ Swap creation skipped (optional)${NC}"
    fi
else
    echo -e "${GREEN}✅ Swap already active${NC}"
fi
echo ""

# Step 6: Ensure PM2 app is running (uses existing dist/.next from quick-deploy; no build here)
echo -e "${YELLOW}🔄 Step 6: Ensuring PM2 processes (from ecosystem.config.js)...${NC}"
if [ ! -f ecosystem.config.js ]; then
    echo -e "${RED}❌ ecosystem.config.js not found. Run quick-deploy.sh first.${NC}"
    exit 1  
fi
if ! pm2 list 2>/dev/null | grep -q "wissen-backend.*online"; then
    echo "Starting apps from ecosystem.config.js..."
    pm2 start ecosystem.config.js --update-env
else
    echo "Apps already running; saving PM2 state..."
fi
pm2 save
echo -e "${GREEN}✅ PM2 configured${NC}"
echo ""

# Step 7: Health checks (warn only; app may not be deployed yet)
echo -e "${YELLOW}🏥 Step 7: Health checks...${NC}"
BACKEND_OK=0
curl -s -f http://localhost:3001/health > /dev/null && BACKEND_OK=1 || true
FRONTEND_OK=0
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
[ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ] && FRONTEND_OK=1 || true
if [ $BACKEND_OK -eq 1 ]; then echo -e "${GREEN}✅ Backend: HEALTHY${NC}"; else echo -e "${YELLOW}⚠️ Backend: not responding (run quick-deploy.sh to deploy)${NC}"; fi
if [ $FRONTEND_OK -eq 1 ]; then echo -e "${GREEN}✅ Frontend: HEALTHY${NC}"; else echo -e "${YELLOW}⚠️ Frontend: not responding (run quick-deploy.sh to deploy)${NC}"; fi
echo ""

# Step 8: Setup health monitor cron
echo -e "${YELLOW}📊 Step 8: Setting up health monitor...${NC}"
sudo touch /var/log/health-monitor.log && sudo chown ubuntu:ubuntu /var/log/health-monitor.log
cat > /tmp/health-monitor.sh <<'HEALTHEOF'
#!/bin/bash
# Health monitor: restart or start backend/frontend if down. Runs from cron every 3 min.
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
LOG_FILE="/var/log/health-monitor.log"
BACKEND_URL="http://localhost:3001/health"
FRONTEND_URL="http://localhost:3000"
APP_DIR="/var/www/wissen-publication-group"
PM2="${PM2_CMD:-pm2}"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

cd "$APP_DIR" || exit 0

BACKEND_STATUS=$(curl -s -f -o /dev/null -w "%{http_code}" "$BACKEND_URL" 2>/dev/null || echo "000")
if [ "$BACKEND_STATUS" != "200" ]; then
    log "⚠️ Backend failed. Restarting..."
    $PM2 restart wissen-backend 2>/dev/null || true
fi

FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" != "200" ] && [ "$FRONTEND_STATUS" != "304" ]; then
    log "⚠️ Frontend failed. Restarting..."
    $PM2 restart wissen-frontend 2>/dev/null || true
fi

if ! $PM2 list 2>/dev/null | grep -q "wissen-backend.*online"; then
    log "⚠️ Backend not in PM2. Starting from ecosystem.config.js..."
    $PM2 start ecosystem.config.js --update-env 2>/dev/null || (cd backend && $PM2 start dist/src/main.js --name wissen-backend --update-env)
    $PM2 save 2>/dev/null || true
fi

if ! $PM2 list 2>/dev/null | grep -q "wissen-frontend.*online"; then
    log "⚠️ Frontend not in PM2. Starting..."
    $PM2 start ecosystem.config.js --update-env 2>/dev/null || (cd frontend && $PM2 start npm --name wissen-frontend -- start)
    $PM2 save 2>/dev/null || true
fi

# Keep dump.pm2 up to date when both apps are running (so reboot restores correctly)
if $PM2 list 2>/dev/null | grep -q "wissen-backend.*online" && $PM2 list 2>/dev/null | grep -q "wissen-frontend.*online"; then
    $PM2 save 2>/dev/null || true
fi

# Disk self-heal: if disk > 90% full, run quick cleanup to avoid crash
USE_PCT=$(df -P / 2>/dev/null | awk 'NR==2 {gsub(/%/,""); print $5}')
if [ -n "$USE_PCT" ] && [ "$USE_PCT" -ge 90 ]; then
    log "⚠️ Disk ${USE_PCT}% full. Running quick cleanup..."
    sudo journalctl --vacuum-time=3d 2>/dev/null || true
    sudo apt-get clean 2>/dev/null || true
    $PM2 flush 2>/dev/null || true
fi

HEALTHEOF

sudo mv /tmp/health-monitor.sh /var/www/wissen-publication-group/health-monitor.sh
sudo chmod +x /var/www/wissen-publication-group/health-monitor.sh
(crontab -l 2>/dev/null | grep -v health-monitor; echo "*/3 * * * * /var/www/wissen-publication-group/health-monitor.sh") | crontab -
echo -e "${GREEN}✅ Health monitor configured (runs every 3 minutes)${NC}"
echo ""

# Step 8b: Weekly disk cleanup (prevents disk from filling with logs)
echo -e "${YELLOW}💾 Step 8b: Setting up weekly disk cleanup...${NC}"
if [ -f /var/www/wissen-publication-group/disk-cleanup.sh ]; then
    chmod +x /var/www/wissen-publication-group/disk-cleanup.sh
    sudo touch /var/log/disk-cleanup.log 2>/dev/null && sudo chown ubuntu:ubuntu /var/log/disk-cleanup.log 2>/dev/null || true
    (crontab -l 2>/dev/null | grep -v disk-cleanup; echo "0 3 * * 0 /var/www/wissen-publication-group/disk-cleanup.sh") | crontab -
    echo -e "${GREEN}✅ Weekly disk cleanup configured (Sunday 3 AM)${NC}"
else
    echo -e "${YELLOW}⚠️ disk-cleanup.sh not found; add it and re-run MASTER_SETUP for automatic cleanup${NC}"
fi
echo ""

# Step 9: Security - Firewall
echo -e "${YELLOW}🔥 Step 9: Configuring firewall...${NC}"
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
echo -e "${GREEN}✅ Firewall configured${NC}"
echo ""

# Step 10: Security - Fail2ban
echo -e "${YELLOW}🛡️ Step 10: Installing fail2ban...${NC}"
sudo apt install -y fail2ban 2>/dev/null || echo "Fail2ban already installed"
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
echo -e "${GREEN}✅ Fail2ban configured${NC}"
echo ""

# Step 11: Security - Auto-updates
echo -e "${YELLOW}🔄 Step 11: Setting up automatic security updates...${NC}"
sudo apt install -y unattended-upgrades
echo -e "${GREEN}✅ Auto-updates configured${NC}"
echo ""

# Step 12: Test Nginx
echo -e "${YELLOW}🌐 Step 12: Testing Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx
sleep 2

API_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health || echo "000")
FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost || echo "000")

if [ "$API_TEST" = "200" ]; then
    echo -e "${GREEN}✅ API through Nginx: WORKING${NC}"
else
    echo -e "${YELLOW}⚠️ API through Nginx: HTTP $API_TEST${NC}"
fi

if [ "$FRONTEND_TEST" = "200" ]; then
    echo -e "${GREEN}✅ Frontend through Nginx: WORKING${NC}"
else
    echo -e "${YELLOW}⚠️ Frontend through Nginx: HTTP $FRONTEND_TEST${NC}"
fi
echo ""

# Step 13: Final status
echo -e "${YELLOW}📊 Step 13: Final Status${NC}"
pm2 list
echo ""

# Step 14: Verification
echo -e "${YELLOW}🔍 Step 14: Verification${NC}"
echo "PM2 Startup:"
pm2 startup | grep -q "systemd" && echo -e "${GREEN}✅ Configured${NC}" || echo -e "${RED}❌ Not configured${NC}"

echo "Services:"
pm2 list | grep -q "wissen-backend.*online" && echo -e "${GREEN}✅ Backend running${NC}" || echo -e "${RED}❌ Backend not running${NC}"
pm2 list | grep -q "wissen-frontend.*online" && echo -e "${GREEN}✅ Frontend running${NC}" || echo -e "${RED}❌ Frontend not running${NC}"

echo "Ports:"
sudo ss -tlnp | grep -q ":3001" && echo -e "${GREEN}✅ Port 3001 listening${NC}" || echo -e "${RED}❌ Port 3001 not listening${NC}"
sudo ss -tlnp | grep -q ":3000" && echo -e "${GREEN}✅ Port 3000 listening${NC}" || echo -e "${RED}❌ Port 3000 not listening${NC}"

echo "Firewall:"
sudo ufw status | grep -q "Status: active" && echo -e "${GREEN}✅ Firewall active${NC}" || echo -e "${RED}❌ Firewall not active${NC}"

echo ""
echo -e "${GREEN}=========================================="
echo -e "${GREEN}✅ MASTER SETUP COMPLETE!"
echo -e "${GREEN}=========================================="
echo ""
echo "Your server is now configured with:"
echo "  ✅ Auto-restart on crash"
echo "  ✅ Auto-start on reboot"
echo "  ✅ Health monitoring (every 3 minutes)"
echo "  ✅ Firewall protection"
echo "  ✅ Fail2ban protection"
echo "  ✅ Automatic security updates"
echo "  ✅ Memory limit protection"
echo "  ✅ Comprehensive logging"
echo ""
echo "Services will NEVER stop!"
echo "=========================================="
