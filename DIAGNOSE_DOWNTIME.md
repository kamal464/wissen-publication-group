# 🔍 Diagnose Frequent Downtime - wissenpublicationgroup.com

**Run these diagnostic commands in AWS Session Manager to find why the site goes down frequently**

---

## 🚨 **IMMEDIATE STATUS CHECK**

Run this first to see current state:

```bash
cd /var/www/wissen-publication-group && \
echo "==========================================" && \
echo "🔍 IMMEDIATE STATUS CHECK" && \
echo "==========================================" && \
echo "" && \
echo "1. PM2 Services Status:" && \
pm2 list && \
echo "" && \
echo "2. PM2 Process Details:" && \
pm2 describe wissen-backend 2>/dev/null | head -20 && \
pm2 describe wissen-frontend 2>/dev/null | head -20 && \
echo "" && \
echo "3. Recent PM2 Restarts (crashes):" && \
pm2 monit 2>/dev/null | head -10 || echo "Check: pm2 logs wissen-backend --err --lines 50" && \
echo "" && \
echo "4. System Resources:" && \
echo "   Memory:" && \
free -h && \
echo "   Disk:" && \
df -h / && \
echo "   CPU Load:" && \
uptime && \
echo "" && \
echo "5. Port Status:" && \
sudo ss -tlnp | grep -E ":3000|:3001|:80|:443" && \
echo "" && \
echo "6. Service Health Tests:" && \
echo "   Backend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3001/api/health || echo "❌ Backend DOWN" && \
echo "   Frontend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 || echo "❌ Frontend DOWN" && \
echo "" && \
echo "7. Nginx Status:" && \
sudo systemctl status nginx --no-pager | head -5 && \
echo "" && \
echo "8. Recent Errors (last 30 lines):" && \
pm2 logs wissen-backend --err --lines 30 --nostream 2>/dev/null | tail -10 && \
pm2 logs wissen-frontend --err --lines 30 --nostream 2>/dev/null | tail -10
```

---

## 🔴 **COMMON CAUSES OF FREQUENT DOWNTIME**

### **1. PM2 Processes Crashing (Most Common)**

**Symptoms:**
- PM2 shows processes as "errored" or "stopped"
- High restart count in `pm2 list`
- Errors in logs

**Check:**
```bash
pm2 list
# Look for high numbers in "↺" (restart) column
# Look for status: "errored" or "stopped"
```

**Fix:**
```bash
# Check error logs
pm2 logs wissen-backend --err --lines 100
pm2 logs wissen-frontend --err --lines 100

# Restart with auto-restart enabled
pm2 delete all
cd /var/www/wissen-publication-group/backend && \
pm2 start dist/src/main.js --name wissen-backend \
  --max-memory-restart 500M \
  --exp-backoff-restart-delay=100 \
  --update-env \
  --instances 1

cd /var/www/wissen-publication-group/frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 500M \
  --exp-backoff-restart-delay=100 \
  --update-env \
  -- start

pm2 save
pm2 startup
```

---

### **2. Out of Memory (OOM)**

**Symptoms:**
- Processes killed by system
- High memory usage
- System becomes unresponsive

**Check:**
```bash
# Check memory usage
free -h
# Check if processes were killed
dmesg | grep -i "killed process" | tail -20
# Check PM2 memory
pm2 list
# Look at "mem" column - if > 500MB, might be issue
```

**Fix:**
```bash
# Add memory limits to PM2
pm2 delete all
cd /var/www/wissen-publication-group/backend && \
pm2 start dist/src/main.js --name wissen-backend \
  --max-memory-restart 400M \
  --update-env

cd /var/www/wissen-publication-group/frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start

pm2 save
```

---

### **3. PM2 Not Starting on Reboot**

**Symptoms:**
- Site down after EC2 restart
- PM2 processes missing after reboot

**Check:**
```bash
# Check if PM2 startup is configured
pm2 startup
# Should show a command to run with sudo
```

**Fix:**
```bash
# Configure PM2 to start on boot
pm2 save
pm2 startup
# Copy and run the command it shows (usually starts with "sudo env PATH=...")
```

---

### **4. Database Connection Failures**

**Symptoms:**
- Backend crashes with Prisma/database errors
- 500 errors on API calls

**Check:**
```bash
# Check database connection
cd /var/www/wissen-publication-group/backend && \
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('✅ DB Connected')).catch(e => console.error('❌ DB Error:', e.message)).finally(() => prisma.\$disconnect())"

# Check PostgreSQL status
sudo systemctl status postgresql
```

**Fix:**
```bash
# Restart PostgreSQL if needed
sudo systemctl restart postgresql
# Check connection string in .env
cat /var/www/wissen-publication-group/backend/.env | grep DATABASE_URL
```

---

### **5. Nginx Configuration Issues**

**Symptoms:**
- 502 Bad Gateway errors
- Site accessible on port 3000/3001 but not via domain

**Check:**
```bash
# Test Nginx config
sudo nginx -t

# Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Check if Nginx can reach backend/frontend
curl http://localhost:3001/api/health
curl http://localhost:3000
```

**Fix:**
```bash
# Restart Nginx
sudo systemctl restart nginx
# Check Nginx config file
sudo cat /etc/nginx/sites-available/wissenpublicationgroup.com
```

---

### **6. EC2 Instance Issues**

**Symptoms:**
- High CPU usage
- Network issues
- Instance health checks failing

**Check:**
```bash
# CPU usage
top -bn1 | head -20

# Check CloudWatch metrics (if configured)
# Or check system load
uptime

# Check network
ping -c 3 8.8.8.8
```

---

## 📊 **COMPREHENSIVE DIAGNOSTIC SCRIPT**

Run this complete diagnostic:

```bash
cd /var/www/wissen-publication-group && \
echo "==========================================" && \
echo "🔍 COMPREHENSIVE DOWNTIME DIAGNOSTIC" && \
echo "==========================================" && \
echo "Timestamp: $(date)" && \
echo "" && \
echo "=== 1. PM2 STATUS ===" && \
pm2 list && \
echo "" && \
echo "=== 2. PM2 RESTART COUNTS (High = Frequent Crashes) ===" && \
pm2 jlist | jq -r '.[] | "\(.name): \(.pm2_env.restart_time) restarts, Status: \(.pm2_env.status)"' 2>/dev/null || pm2 list && \
echo "" && \
echo "=== 3. SYSTEM RESOURCES ===" && \
echo "Memory:" && \
free -h && \
echo "Disk:" && \
df -h / && \
echo "CPU Load:" && \
uptime && \
echo "" && \
echo "=== 4. PROCESS HEALTH ===" && \
echo "Backend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3001/api/health || echo "❌ DOWN" && \
echo "Frontend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 || echo "❌ DOWN" && \
echo "" && \
echo "=== 5. PORT STATUS ===" && \
sudo ss -tlnp | grep -E ":3000|:3001|:80|:443" && \
echo "" && \
echo "=== 6. RECENT ERRORS (Last 20 lines) ===" && \
echo "Backend Errors:" && \
pm2 logs wissen-backend --err --lines 20 --nostream 2>/dev/null | tail -10 || echo "No backend errors" && \
echo "" && \
echo "Frontend Errors:" && \
pm2 logs wissen-frontend --err --lines 20 --nostream 2>/dev/null | tail -10 || echo "No frontend errors" && \
echo "" && \
echo "=== 7. NGINX STATUS ===" && \
sudo systemctl status nginx --no-pager | head -10 && \
echo "" && \
echo "=== 8. DATABASE STATUS ===" && \
sudo systemctl status postgresql --no-pager | head -5 2>/dev/null || echo "PostgreSQL status check failed" && \
echo "" && \
echo "=== 9. PM2 STARTUP CONFIG ===" && \
pm2 startup 2>/dev/null | head -3 || echo "PM2 startup not configured" && \
echo "" && \
echo "=== 10. SYSTEM LOGS (OOM Kills) ===" && \
dmesg | grep -i "killed process" | tail -5 || echo "No OOM kills found" && \
echo "" && \
echo "==========================================" && \
echo "✅ Diagnostic Complete" && \
echo "=========================================="
```

---

## 🛠️ **QUICK FIXES**

### **If PM2 Processes Are Down:**
```bash
cd /var/www/wissen-publication-group && \
pm2 delete all && \
cd backend && \
pm2 start dist/src/main.js --name wissen-backend --max-memory-restart 400M --update-env && \
cd ../frontend && \
pm2 start npm --name wissen-frontend --max-memory-restart 400M --update-env -- start && \
cd .. && \
pm2 save && \
pm2 list
```

### **If Everything Is Down:**
```bash
cd /var/www/wissen-publication-group && \
echo "Restarting all services..." && \
pm2 delete all 2>/dev/null || true && \
sleep 3 && \
cd backend && \
pm2 start dist/src/main.js --name wissen-backend --max-memory-restart 400M --update-env && \
cd ../frontend && \
pm2 start npm --name wissen-frontend --max-memory-restart 400M --update-env -- start && \
cd .. && \
pm2 save && \
sudo systemctl restart nginx && \
sleep 5 && \
pm2 list && \
echo "" && \
echo "Testing services..." && \
curl -s http://localhost:3001/api/health && echo "" && \
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000
```

---

## 🔄 **PREVENT FUTURE DOWNTIME**

### **1. Configure PM2 Auto-Restart with Limits:**
```bash
pm2 delete all
cd /var/www/wissen-publication-group/backend && \
pm2 start dist/src/main.js --name wissen-backend \
  --max-memory-restart 400M \
  --min-uptime 10000 \
  --max-restarts 10 \
  --exp-backoff-restart-delay=100 \
  --update-env

cd /var/www/wissen-publication-group/frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --min-uptime 10000 \
  --max-restarts 10 \
  --exp-backoff-restart-delay=100 \
  --update-env \
  -- start

pm2 save
pm2 startup
# Run the command it shows
```

### **2. Set Up Monitoring:**
```bash
# Install PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### **3. Create Health Check Script:**
Create `/var/www/wissen-publication-group/health-check.sh`:
```bash
#!/bin/bash
BACKEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$BACKEND" != "200" ] || [ "$FRONTEND" != "200" ]; then
  echo "Service down! Restarting..."
  pm2 restart all
  # Optional: Send alert email/webhook
fi
```

Add to crontab (check every 5 minutes):
```bash
crontab -e
# Add: */5 * * * * /var/www/wissen-publication-group/health-check.sh
```

---

## 📝 **WHAT TO CHECK FIRST**

1. **Run the Immediate Status Check** (above)
2. **Check PM2 restart counts** - High numbers = frequent crashes
3. **Check error logs** - `pm2 logs wissen-backend --err --lines 50`
4. **Check memory usage** - `free -h`
5. **Check if PM2 starts on reboot** - `pm2 startup`

---

## 🆘 **IF SITE IS DOWN RIGHT NOW**

```bash
cd /var/www/wissen-publication-group && \
pm2 restart all && \
sleep 10 && \
pm2 list && \
sudo systemctl restart nginx && \
curl -s http://localhost:3001/api/health && echo "" && \
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000
```
