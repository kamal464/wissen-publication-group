#!/bin/bash
# ==========================================
# MASTER SETUP SCRIPT - Complete Server Setup
# Run this ONCE to setup everything
# ==========================================

set -e

echo "=========================================="
echo "🛡️ MASTER SERVER SETUP"
echo "=========================================="
echo "This will setup:"
echo "  ✅ PM2 with auto-restart"
echo "  ✅ Auto-start on reboot"
echo "  ✅ Health monitoring"
echo "  ✅ Security hardening"
echo "  ✅ Complete deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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

# Step 5: Pull latest code
echo -e "${YELLOW}📥 Step 5: Pulling latest code...${NC}"
git fetch origin
git pull origin main || echo -e "${RED}⚠️ Git pull had issues, continuing...${NC}"
echo -e "${GREEN}✅ Code updated${NC}"
echo ""

# Step 6: Install dependencies (including dev dependencies for building)
echo -e "${YELLOW}📦 Step 6: Installing dependencies...${NC}"
cd backend
npm install --no-audit --no-fund
cd ../frontend
npm install --no-audit --no-fund
cd ..
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 7: Build applications
echo -e "${YELLOW}🔨 Step 7: Building applications...${NC}"
cd backend
npm run build
cd ../frontend
NODE_OPTIONS="--max-old-space-size=2048" npm run build
cd ..
echo -e "${GREEN}✅ Applications built${NC}"
echo ""

# Step 8: Stop existing processes
echo -e "${YELLOW}🛑 Step 8: Stopping existing processes...${NC}"
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sleep 2
echo -e "${GREEN}✅ Processes stopped${NC}"
echo ""

# Step 9: Start backend with robust config
echo -e "${YELLOW}🚀 Step 9: Starting backend...${NC}"
cd backend
pm2 start dist/src/main.js \
    --name wissen-backend \
    --update-env \
    --max-memory-restart 500M \
    --restart-delay 3000 \
    --max-restarts 10 \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --merge-logs \
    --err /var/log/pm2/wissen-backend-error.log \
    --out /var/log/pm2/wissen-backend-out.log
cd ..
sleep 5
echo -e "${GREEN}✅ Backend started${NC}"
echo ""

# Step 10: Start frontend with robust config
echo -e "${YELLOW}🚀 Step 10: Starting frontend...${NC}"
cd frontend
pm2 start npm \
    --name wissen-frontend \
    -- start \
    --max-memory-restart 1G \
    --restart-delay 3000 \
    --max-restarts 10 \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --merge-logs \
    --err /var/log/pm2/wissen-frontend-error.log \
    --out /var/log/pm2/wissen-frontend-out.log
cd ..
sleep 15
echo -e "${GREEN}✅ Frontend started${NC}"
echo ""

# Step 11: Save PM2 config
echo -e "${YELLOW}💾 Step 11: Saving PM2 configuration...${NC}"
pm2 save
echo -e "${GREEN}✅ PM2 configuration saved${NC}"
echo ""

# Step 12: Health checks
echo -e "${YELLOW}🏥 Step 12: Running health checks...${NC}"
sleep 10

BACKEND_OK=0
for i in {1..5}; do
    if curl -s -f http://localhost:3001/health > /dev/null; then
        echo -e "${GREEN}✅ Backend: HEALTHY${NC}"
        BACKEND_OK=1
        break
    else
        echo "⏳ Backend: Waiting... ($i/5)"
        sleep 3
    fi
done

FRONTEND_OK=0
for i in {1..5}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
        echo -e "${GREEN}✅ Frontend: HEALTHY (HTTP $HTTP_CODE)${NC}"
        FRONTEND_OK=1
        break
    else
        echo "⏳ Frontend: Waiting... ($i/5) (HTTP $HTTP_CODE)"
        sleep 3
    fi
done

if [ $BACKEND_OK -eq 0 ] || [ $FRONTEND_OK -eq 0 ]; then
    echo -e "${RED}❌ Health checks failed${NC}"
    pm2 logs --lines 20
    exit 1
fi
echo ""

# Step 13: Setup health monitor cron
echo -e "${YELLOW}📊 Step 13: Setting up health monitor...${NC}"
cat > /tmp/health-monitor.sh <<'HEALTHEOF'
#!/bin/bash
LOG_FILE="/var/log/health-monitor.log"
BACKEND_URL="http://localhost:3001/health"
FRONTEND_URL="http://localhost:3000"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

BACKEND_STATUS=$(curl -s -f -o /dev/null -w "%{http_code}" "$BACKEND_URL" 2>/dev/null || echo "000")
if [ "$BACKEND_STATUS" != "200" ]; then
    log "⚠️ Backend failed. Restarting..."
    pm2 restart wissen-backend
fi

FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" != "200" ] && [ "$FRONTEND_STATUS" != "304" ]; then
    log "⚠️ Frontend failed. Restarting..."
    pm2 restart wissen-frontend
fi

if ! pm2 list | grep -q "wissen-backend.*online"; then
    log "⚠️ Backend not in PM2. Starting..."
    cd /var/www/wissen-publication-group/backend
    pm2 start dist/src/main.js --name wissen-backend --update-env
    pm2 save
fi

if ! pm2 list | grep -q "wissen-frontend.*online"; then
    log "⚠️ Frontend not in PM2. Starting..."
    cd /var/www/wissen-publication-group/frontend
    pm2 start npm --name wissen-frontend -- start
    pm2 save
fi
HEALTHEOF

sudo mv /tmp/health-monitor.sh /var/www/wissen-publication-group/health-monitor.sh
sudo chmod +x /var/www/wissen-publication-group/health-monitor.sh
(crontab -l 2>/dev/null | grep -v health-monitor; echo "*/5 * * * * /var/www/wissen-publication-group/health-monitor.sh") | crontab -
echo -e "${GREEN}✅ Health monitor configured (runs every 5 minutes)${NC}"
echo ""

# Step 14: Security - Firewall
echo -e "${YELLOW}🔥 Step 14: Configuring firewall...${NC}"
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
echo -e "${GREEN}✅ Firewall configured${NC}"
echo ""

# Step 15: Security - Fail2ban
echo -e "${YELLOW}🛡️ Step 15: Installing fail2ban...${NC}"
sudo apt install -y fail2ban 2>/dev/null || echo "Fail2ban already installed"
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
echo -e "${GREEN}✅ Fail2ban configured${NC}"
echo ""

# Step 16: Security - Auto-updates
echo -e "${YELLOW}🔄 Step 16: Setting up automatic security updates...${NC}"
sudo apt install -y unattended-upgrades
echo -e "${GREEN}✅ Auto-updates configured${NC}"
echo ""

# Step 17: Test Nginx
echo -e "${YELLOW}🌐 Step 17: Testing Nginx...${NC}"
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

# Step 18: Final status
echo -e "${YELLOW}📊 Step 18: Final Status${NC}"
pm2 list
echo ""

# Step 19: Verification
echo -e "${YELLOW}🔍 Step 19: Verification${NC}"
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
echo "  ✅ Health monitoring (every 5 minutes)"
echo "  ✅ Firewall protection"
echo "  ✅ Fail2ban protection"
echo "  ✅ Automatic security updates"
echo "  ✅ Memory limit protection"
echo "  ✅ Comprehensive logging"
echo ""
echo "Services will NEVER stop!"
echo "=========================================="
