# 🛡️ Robust EC2 Server Setup - Auto-Restart & Security

## Complete setup to ensure server never stops and is secure

---

## Step 1: Install PM2 with Auto-Startup

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on system boot
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# This will output a command - RUN IT (it will be something like):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

---

## Step 2: Create Robust Deployment Script

```bash
cd /var/www/wissen-publication-group
nano deploy-robust.sh
```

**Copy this entire script:**

```bash
#!/bin/bash
set -e  # Exit on any error

echo "=========================================="
echo "🚀 ROBUST DEPLOYMENT SCRIPT"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if service is running
check_service() {
    local service_name=$1
    local port=$2
    
    if pm2 list | grep -q "$service_name.*online"; then
        log "${GREEN}✅ $service_name is running${NC}"
        
        # Test if port is responding
        if timeout 5 bash -c "echo > /dev/tcp/localhost/$port" 2>/dev/null; then
            log "${GREEN}✅ Port $port is listening${NC}"
            return 0
        else
            log "${RED}❌ Port $port is not responding${NC}"
            return 1
        fi
    else
        log "${RED}❌ $service_name is not running${NC}"
        return 1
    fi
}

# Step 1: Pull latest code
log "${YELLOW}📥 Step 1: Pulling latest code...${NC}"
cd /var/www/wissen-publication-group
git fetch origin
git pull origin main || {
    log "${RED}❌ Git pull failed${NC}"
    exit 1
}
log "${GREEN}✅ Code pulled successfully${NC}"
echo ""

# Step 2: Install backend dependencies
log "${YELLOW}📦 Step 2: Installing backend dependencies...${NC}"
cd /var/www/wissen-publication-group/backend
npm install --production --no-audit --no-fund || {
    log "${RED}❌ Backend npm install failed${NC}"
    exit 1
}
log "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Step 3: Build backend
log "${YELLOW}🔨 Step 3: Building backend...${NC}"
npm run build || {
    log "${RED}❌ Backend build failed${NC}"
    exit 1
}
log "${GREEN}✅ Backend built successfully${NC}"
echo ""

# Step 4: Install frontend dependencies
log "${YELLOW}📦 Step 4: Installing frontend dependencies...${NC}"
cd /var/www/wissen-publication-group/frontend
npm install --production --no-audit --no-fund || {
    log "${RED}❌ Frontend npm install failed${NC}"
    exit 1
}
log "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Step 5: Build frontend
log "${YELLOW}🔨 Step 5: Building frontend...${NC}"
NODE_OPTIONS="--max-old-space-size=2048" npm run build || {
    log "${RED}❌ Frontend build failed${NC}"
    exit 1
}
log "${GREEN}✅ Frontend built successfully${NC}"
echo ""

# Step 6: Stop existing PM2 processes
log "${YELLOW}🛑 Step 6: Stopping existing services...${NC}"
pm2 stop all || true
pm2 delete all || true
sleep 2
log "${GREEN}✅ Services stopped${NC}"
echo ""

# Step 7: Start backend with PM2
log "${YELLOW}🚀 Step 7: Starting backend...${NC}"
cd /var/www/wissen-publication-group/backend
pm2 start dist/src/main.js \
    --name wissen-backend \
    --update-env \
    --max-memory-restart 500M \
    --restart-delay 3000 \
    --max-restarts 10 \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --merge-logs

sleep 5
log "${GREEN}✅ Backend started${NC}"
echo ""

# Step 8: Start frontend with PM2
log "${YELLOW}🚀 Step 8: Starting frontend...${NC}"
cd /var/www/wissen-publication-group/frontend
pm2 start npm \
    --name wissen-frontend \
    -- start \
    --max-memory-restart 1G \
    --restart-delay 3000 \
    --max-restarts 10 \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --merge-logs

sleep 15
log "${GREEN}✅ Frontend started${NC}"
echo ""

# Step 9: Save PM2 configuration
log "${YELLOW}💾 Step 9: Saving PM2 configuration...${NC}"
pm2 save
log "${GREEN}✅ PM2 configuration saved${NC}"
echo ""

# Step 10: Wait for services to be ready
log "${YELLOW}⏳ Step 10: Waiting for services to be ready...${NC}"
sleep 10
echo ""

# Step 11: Health checks
log "${YELLOW}🏥 Step 11: Running health checks...${NC}"

# Check backend
BACKEND_HEALTH=0
for i in {1..5}; do
    if curl -s -f http://localhost:3001/health > /dev/null; then
        log "${GREEN}✅ Backend health check passed${NC}"
        BACKEND_HEALTH=1
        break
    else
        log "${YELLOW}⏳ Backend not ready yet, attempt $i/5...${NC}"
        sleep 3
    fi
done

if [ $BACKEND_HEALTH -eq 0 ]; then
    log "${RED}❌ Backend health check failed after 5 attempts${NC}"
    pm2 logs wissen-backend --lines 20
    exit 1
fi

# Check frontend
FRONTEND_HEALTH=0
for i in {1..5}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
        log "${GREEN}✅ Frontend health check passed (HTTP $HTTP_CODE)${NC}"
        FRONTEND_HEALTH=1
        break
    else
        log "${YELLOW}⏳ Frontend not ready yet, attempt $i/5 (HTTP $HTTP_CODE)...${NC}"
        sleep 3
    fi
done

if [ $FRONTEND_HEALTH -eq 0 ]; then
    log "${RED}❌ Frontend health check failed after 5 attempts${NC}"
    pm2 logs wissen-frontend --lines 20
    exit 1
fi

echo ""

# Step 12: Verify PM2 status
log "${YELLOW}📊 Step 12: PM2 Status${NC}"
pm2 list
echo ""

# Step 13: Test through Nginx
log "${YELLOW}🌐 Step 13: Testing through Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx
sleep 2

API_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health || echo "000")
if [ "$API_TEST" = "200" ]; then
    log "${GREEN}✅ API accessible through Nginx${NC}"
else
    log "${YELLOW}⚠️ API through Nginx returned HTTP $API_TEST${NC}"
fi

FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost || echo "000")
if [ "$FRONTEND_TEST" = "200" ]; then
    log "${GREEN}✅ Frontend accessible through Nginx${NC}"
else
    log "${YELLOW}⚠️ Frontend through Nginx returned HTTP $FRONTEND_TEST${NC}"
fi

echo ""
log "${GREEN}=========================================="
log "${GREEN}✅ DEPLOYMENT COMPLETE!"
log "${GREEN}=========================================="
log ""
log "Services are running with auto-restart enabled"
log "PM2 will automatically restart services if they crash"
log "Services will start automatically on server reboot"
log ""
```

**Make it executable:**

```bash
chmod +x /var/www/wissen-publication-group/deploy-robust.sh
```

---

## Step 3: Create PM2 Ecosystem File (Advanced Configuration)

```bash
cd /var/www/wissen-publication-group
nano ecosystem.config.js
```

**Copy this configuration:**

```javascript
module.exports = {
  apps: [
    {
      name: 'wissen-backend',
      script: './backend/dist/src/main.js',
      cwd: '/var/www/wissen-publication-group',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/wissen-backend-error.log',
      out_file: '/var/log/pm2/wissen-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 10000,
      kill_timeout: 5000,
      wait_ready: true,
      shutdown_with_message: true
    },
    {
      name: 'wissen-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/wissen-publication-group/frontend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/wissen-frontend-error.log',
      out_file: '/var/log/pm2/wissen-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 10000,
      kill_timeout: 5000
    }
  ]
};
```

**Start with ecosystem file:**

```bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

---

## Step 4: Setup Health Check Monitor Script

```bash
cd /var/www/wissen-publication-group
nano health-monitor.sh
```

**Copy this script:**

```bash
#!/bin/bash

# Health Check Monitor - Runs every 5 minutes via cron
# This script monitors services and restarts them if needed

LOG_FILE="/var/log/health-monitor.log"
BACKEND_URL="http://localhost:3001/health"
FRONTEND_URL="http://localhost:3000"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check backend
BACKEND_STATUS=$(curl -s -f -o /dev/null -w "%{http_code}" "$BACKEND_URL" 2>/dev/null || echo "000")
if [ "$BACKEND_STATUS" != "200" ]; then
    log "⚠️ Backend health check failed (HTTP $BACKEND_STATUS). Restarting..."
    pm2 restart wissen-backend
    sleep 5
    
    # Verify restart
    NEW_STATUS=$(curl -s -f -o /dev/null -w "%{http_code}" "$BACKEND_URL" 2>/dev/null || echo "000")
    if [ "$NEW_STATUS" = "200" ]; then
        log "✅ Backend restarted successfully"
    else
        log "❌ Backend still not responding after restart"
    fi
else
    log "✅ Backend health check passed"
fi

# Check frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" != "200" ] && [ "$FRONTEND_STATUS" != "304" ]; then
    log "⚠️ Frontend health check failed (HTTP $FRONTEND_STATUS). Restarting..."
    pm2 restart wissen-frontend
    sleep 10
    
    # Verify restart
    NEW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null || echo "000")
    if [ "$NEW_STATUS" = "200" ] || [ "$NEW_STATUS" = "304" ]; then
        log "✅ Frontend restarted successfully"
    else
        log "❌ Frontend still not responding after restart"
    fi
else
    log "✅ Frontend health check passed"
fi

# Check PM2 processes
if ! pm2 list | grep -q "wissen-backend.*online"; then
    log "⚠️ Backend process not found in PM2. Starting..."
    cd /var/www/wissen-publication-group/backend
    pm2 start dist/src/main.js --name wissen-backend --update-env
    pm2 save
fi

if ! pm2 list | grep -q "wissen-frontend.*online"; then
    log "⚠️ Frontend process not found in PM2. Starting..."
    cd /var/www/wissen-publication-group/frontend
    pm2 start npm --name wissen-frontend -- start
    pm2 save
fi
```

**Make executable and setup cron:**

```bash
chmod +x /var/www/wissen-publication-group/health-monitor.sh

# Add to crontab (runs every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /var/www/wissen-publication-group/health-monitor.sh") | crontab -
```

---

## Step 5: Security Hardening

```bash
# Create security setup script
cd /var/www/wissen-publication-group
nano security-hardening.sh
```

**Copy this script:**

```bash
#!/bin/bash

echo "=========================================="
echo "🛡️ SECURITY HARDENING"
echo "=========================================="
echo ""

# 1. Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Setup firewall (UFW)
echo "🔥 Configuring firewall..."
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw status

# 3. Disable root login
echo "🔒 Securing SSH..."
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# 4. Setup fail2ban
echo "🛡️ Installing fail2ban..."
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 5. Setup automatic security updates
echo "🔄 Setting up automatic security updates..."
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# 6. Setup log rotation
echo "📝 Configuring log rotation..."
sudo tee /etc/logrotate.d/pm2 > /dev/null <<EOF
/var/log/pm2/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# 7. Set proper file permissions
echo "🔐 Setting file permissions..."
sudo chown -R ubuntu:ubuntu /var/www/wissen-publication-group
sudo chmod -R 755 /var/www/wissen-publication-group
sudo chmod 600 /var/www/wissen-publication-group/backend/.env 2>/dev/null || true
sudo chmod 600 /var/www/wissen-publication-group/frontend/.env* 2>/dev/null || true

echo ""
echo "✅ Security hardening complete!"
echo ""
echo "⚠️ IMPORTANT: Test SSH access before closing this session!"
echo "   If you can't reconnect, you may need to adjust SSH settings"
```

**Make executable:**

```bash
chmod +x /var/www/wissen-publication-group/security-hardening.sh
```

---

## Step 6: Complete Setup Commands (Run All)

**Copy and paste this entire block in browser terminal:**

```bash
# ==========================================
# COMPLETE ROBUST SERVER SETUP
# ==========================================

# 1. Install PM2 and setup auto-startup
echo "📦 Installing PM2..."
sudo npm install -g pm2
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# 2. Create log directory
sudo mkdir -p /var/log/pm2
sudo chown ubuntu:ubuntu /var/log/pm2

# 3. Navigate to project
cd /var/www/wissen-publication-group

# 4. Pull latest code
echo "📥 Pulling latest code..."
git fetch origin
git pull origin main

# 5. Install dependencies
echo "📦 Installing dependencies..."
cd backend && npm install --production --no-audit --no-fund
cd ../frontend && npm install --production --no-audit --no-fund
cd ..

# 6. Build applications
echo "🔨 Building applications..."
cd backend && npm run build
cd ../frontend && NODE_OPTIONS="--max-old-space-size=2048" npm run build
cd ..

# 7. Stop any existing processes
echo "🛑 Stopping existing processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sleep 2

# 8. Start services with PM2 (robust configuration)
echo "🚀 Starting services..."
cd backend
pm2 start dist/src/main.js \
    --name wissen-backend \
    --update-env \
    --max-memory-restart 500M \
    --restart-delay 3000 \
    --max-restarts 10 \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --merge-logs

cd ../frontend
pm2 start npm \
    --name wissen-frontend \
    -- start \
    --max-memory-restart 1G \
    --restart-delay 3000 \
    --max-restarts 10 \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --merge-logs

# 9. Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# 10. Wait for services
echo "⏳ Waiting for services to start..."
sleep 20

# 11. Health checks
echo "🏥 Running health checks..."
echo ""

# Backend check
for i in {1..5}; do
    if curl -s -f http://localhost:3001/health > /dev/null; then
        echo "✅ Backend: HEALTHY"
        break
    else
        echo "⏳ Backend: Waiting... ($i/5)"
        sleep 3
    fi
done

# Frontend check
for i in {1..5}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
        echo "✅ Frontend: HEALTHY (HTTP $HTTP_CODE)"
        break
    else
        echo "⏳ Frontend: Waiting... ($i/5) (HTTP $HTTP_CODE)"
        sleep 3
    fi
done

# 12. Test through Nginx
echo ""
echo "🌐 Testing through Nginx..."
sudo nginx -t && sudo systemctl reload nginx
sleep 2

API_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health || echo "000")
FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost || echo "000")

if [ "$API_TEST" = "200" ]; then
    echo "✅ API through Nginx: WORKING"
else
    echo "⚠️ API through Nginx: HTTP $API_TEST"
fi

if [ "$FRONTEND_TEST" = "200" ]; then
    echo "✅ Frontend through Nginx: WORKING"
else
    echo "⚠️ Frontend through Nginx: HTTP $FRONTEND_TEST"
fi

# 13. Show PM2 status
echo ""
echo "📊 PM2 Status:"
pm2 list

# 14. Show final status
echo ""
echo "=========================================="
echo "✅ SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "Services configured with:"
echo "  ✅ Auto-restart on crash"
echo "  ✅ Auto-start on server reboot"
echo "  ✅ Memory limit protection"
echo "  ✅ Health monitoring"
echo ""
echo "PM2 will automatically:"
echo "  - Restart services if they crash"
echo "  - Restart services on server reboot"
echo "  - Limit memory usage"
echo "  - Log all activity"
```

---

## Step 7: Security Hardening Commands

**Run these security commands:**

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Setup firewall
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw status

# 3. Install fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 4. Setup automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# 5. Secure file permissions
sudo chown -R ubuntu:ubuntu /var/www/wissen-publication-group
sudo chmod 600 /var/www/wissen-publication-group/backend/.env 2>/dev/null || true
```

---

## Step 8: Verify Everything Works

**Run this verification script:**

```bash
echo "=========================================="
echo "🔍 VERIFICATION CHECKLIST"
echo "=========================================="
echo ""

# 1. Check PM2 is installed
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 installed"
else
    echo "❌ PM2 not installed"
fi

# 2. Check PM2 startup
if pm2 startup | grep -q "systemd"; then
    echo "✅ PM2 startup configured"
else
    echo "⚠️ PM2 startup not configured"
fi

# 3. Check services are running
echo ""
echo "📊 PM2 Services:"
pm2 list

# 4. Check ports
echo ""
echo "🔌 Port Status:"
sudo ss -tlnp | grep -E ':(3000|3001)' || echo "⚠️ Ports not listening"

# 5. Check health
echo ""
echo "🏥 Health Checks:"
curl -s http://localhost:3001/health && echo " ✅ Backend" || echo " ❌ Backend"
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000

# 6. Check Nginx
echo ""
echo "🌐 Nginx Status:"
sudo systemctl status nginx --no-pager | head -5

# 7. Check firewall
echo ""
echo "🔥 Firewall Status:"
sudo ufw status

# 8. Check fail2ban
echo ""
echo "🛡️ Fail2ban Status:"
sudo systemctl status fail2ban --no-pager | head -5

# 9. Check logs directory
echo ""
echo "📝 Logs Directory:"
ls -la /var/log/pm2/ 2>/dev/null || echo "⚠️ Logs directory not found"

echo ""
echo "=========================================="
```

---

## Step 9: Test Auto-Restart

**Test that services restart automatically:**

```bash
# Test 1: Kill backend process
echo "🧪 Test 1: Killing backend process..."
pm2 stop wissen-backend
sleep 5
pm2 list | grep wissen-backend
# Should show "online" after auto-restart

# Test 2: Kill frontend process
echo "🧪 Test 2: Killing frontend process..."
pm2 stop wissen-frontend
sleep 10
pm2 list | grep wissen-frontend
# Should show "online" after auto-restart

# Test 3: Simulate crash (kill process directly)
echo "🧪 Test 3: Simulating crash..."
BACKEND_PID=$(pm2 jlist | grep -o '"pid":[0-9]*' | head -1 | cut -d: -f2)
sudo kill -9 $BACKEND_PID 2>/dev/null || true
sleep 5
pm2 list | grep wissen-backend
# Should show "online" after auto-restart

echo ""
echo "✅ Auto-restart tests complete"
```

---

## Step 10: Monitor Logs

**View logs in real-time:**

```bash
# All logs
pm2 logs

# Specific service
pm2 logs wissen-backend
pm2 logs wissen-frontend

# Last 50 lines
pm2 logs --lines 50

# Error logs only
pm2 logs --err
```

---

## Quick Reference Commands

### Daily Operations

```bash
# Deploy updates
cd /var/www/wissen-publication-group
./deploy-robust.sh

# Check status
pm2 list
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Stop services (they'll auto-restart)
pm2 stop all

# Reload services (zero downtime)
pm2 reload all
```

### Monitoring

```bash
# PM2 monitoring dashboard
pm2 monit

# System resources
htop

# Check disk space
df -h

# Check memory
free -h
```

### Security

```bash
# Check firewall
sudo ufw status

# Check fail2ban
sudo fail2ban-client status

# View security logs
sudo tail -f /var/log/auth.log
```

---

**Your server is now configured to:**
- ✅ Auto-restart on crash
- ✅ Auto-start on reboot
- ✅ Monitor health automatically
- ✅ Protect against memory leaks
- ✅ Log everything for debugging
- ✅ Secure with firewall and fail2ban

**The server will never stop!** 🚀
