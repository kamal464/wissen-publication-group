# 🔍 Find Root Cause - Why Services Stopped

**Run these commands to find WHY the PM2 processes stopped before restarting**

---

## 🚨 **STEP 1: Check PM2 History & Logs**

```bash
cd /var/www/wissen-publication-group && \
echo "==========================================" && \
echo "🔍 STEP 1: PM2 History & Logs" && \
echo "==========================================" && \
echo "" && \
echo "1. PM2 Saved Processes (what PM2 remembers):" && \
pm2 jlist 2>/dev/null | jq -r '.[] | "\(.name): Status=\(.pm2_env.status), Restarts=\(.pm2_env.restart_time), Last Exit=\(.pm2_env.exit_code)"' || \
cat ~/.pm2/dump.pm2 2>/dev/null | head -20 || \
echo "No saved PM2 config found" && \
echo "" && \
echo "2. PM2 Log Files (check for crash logs):" && \
ls -lth ~/.pm2/logs/ 2>/dev/null | head -10 || echo "No PM2 logs directory" && \
echo "" && \
echo "3. Recent PM2 Error Logs:" && \
tail -50 ~/.pm2/logs/wissen-backend-error.log 2>/dev/null || echo "No backend error log" && \
echo "" && \
tail -50 ~/.pm2/logs/wissen-frontend-error.log 2>/dev/null || echo "No frontend error log" && \
echo "" && \
echo "4. Recent PM2 Out Logs:" && \
tail -30 ~/.pm2/logs/wissen-backend-out.log 2>/dev/null || echo "No backend out log" && \
echo "" && \
tail -30 ~/.pm2/logs/wissen-frontend-out.log 2>/dev/null || echo "No frontend out log"
```

---

## 🔍 **STEP 2: Check System Logs for Crashes**

```bash
echo "==========================================" && \
echo "🔍 STEP 2: System Logs (Crashes/Kills)" && \
echo "==========================================" && \
echo "" && \
echo "1. Check for OOM (Out of Memory) Kills:" && \
dmesg | grep -i "killed process" | tail -20 || echo "No OOM kills found" && \
echo "" && \
echo "2. Check systemd journal for PM2/Node crashes:" && \
sudo journalctl -u pm2-* --no-pager -n 50 2>/dev/null || \
sudo journalctl | grep -i "pm2\|node\|wissen" | tail -30 || \
echo "No systemd logs found" && \
echo "" && \
echo "3. Check for process kills in syslog:" && \
sudo grep -i "killed\|oom\|segfault" /var/log/syslog 2>/dev/null | tail -20 || \
sudo grep -i "killed\|oom\|segfault" /var/log/messages 2>/dev/null | tail -20 || \
echo "No kill logs found"
```

---

## 💾 **STEP 3: Check System Resources**

```bash
echo "==========================================" && \
echo "🔍 STEP 3: System Resources" && \
echo "==========================================" && \
echo "" && \
echo "1. Current Memory Usage:" && \
free -h && \
echo "" && \
echo "2. Memory History (if available):" && \
sar -r 1 1 2>/dev/null || echo "sar not available" && \
echo "" && \
echo "3. Disk Space:" && \
df -h / && \
echo "" && \
echo "4. Disk Inodes:" && \
df -i / && \
echo "" && \
echo "5. CPU Load:" && \
uptime && \
echo "" && \
echo "6. Top Memory Consumers:" && \
ps aux --sort=-%mem | head -10
```

---

## 🔧 **STEP 4: Check Build Files & Dependencies**

```bash
echo "==========================================" && \
echo "🔍 STEP 4: Build Files & Dependencies" && \
echo "==========================================" && \
echo "" && \
echo "1. Backend Build File:" && \
ls -lh /var/www/wissen-publication-group/backend/dist/src/main.js 2>/dev/null || echo "❌ Backend build file MISSING" && \
echo "" && \
echo "2. Frontend Build Directory:" && \
ls -ld /var/www/wissen-publication-group/frontend/.next 2>/dev/null || echo "❌ Frontend build directory MISSING" && \
echo "" && \
echo "3. Backend node_modules:" && \
ls -d /var/www/wissen-publication-group/backend/node_modules 2>/dev/null && echo "✅ Backend node_modules exists" || echo "❌ Backend node_modules MISSING" && \
echo "" && \
echo "4. Frontend node_modules:" && \
ls -d /var/www/wissen-publication-group/frontend/node_modules 2>/dev/null && echo "✅ Frontend node_modules exists" || echo "❌ Frontend node_modules MISSING" && \
echo "" && \
echo "5. Check Prisma Client:" && \
ls -d /var/www/wissen-publication-group/backend/node_modules/.prisma 2>/dev/null && echo "✅ Prisma client exists" || echo "❌ Prisma client MISSING"
```

---

## 🗄️ **STEP 5: Check Database Connection**

```bash
echo "==========================================" && \
echo "🔍 STEP 5: Database Status" && \
echo "==========================================" && \
echo "" && \
echo "1. PostgreSQL Status:" && \
sudo systemctl status postgresql --no-pager | head -10 2>/dev/null || echo "PostgreSQL service not found" && \
echo "" && \
echo "2. Database Connection Test:" && \
cd /var/www/wissen-publication-group/backend && \
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => { console.log('✅ DB Connected'); process.exit(0); }).catch(e => { console.error('❌ DB Error:', e.message); process.exit(1); }).finally(() => prisma.\$disconnect());" 2>&1 || echo "Database connection test failed"
```

---

## 🔄 **STEP 6: Check When Services Last Ran**

```bash
echo "==========================================" && \
echo "🔍 STEP 6: Service Timeline" && \
echo "==========================================" && \
echo "" && \
echo "1. Last PM2 Save Time:" && \
stat ~/.pm2/dump.pm2 2>/dev/null | grep Modify || echo "No PM2 dump file" && \
echo "" && \
echo "2. Last Log File Modification:" && \
stat ~/.pm2/logs/wissen-backend-error.log 2>/dev/null | grep Modify || echo "No backend error log" && \
stat ~/.pm2/logs/wissen-frontend-error.log 2>/dev/null | grep Modify || echo "No frontend error log" && \
echo "" && \
echo "3. System Uptime (when was last reboot?):" && \
uptime -s && \
echo "" && \
echo "4. Last System Reboot:" && \
who -b 2>/dev/null || last reboot | head -1
```

---

## 🚨 **STEP 7: Check for Manual Stops**

```bash
echo "==========================================" && \
echo "🔍 STEP 7: Check for Manual Interventions" && \
echo "==========================================" && \
echo "" && \
echo "1. Recent PM2 Commands in History:" && \
history | grep -i "pm2.*delete\|pm2.*stop\|pm2.*kill" | tail -10 || echo "No PM2 stop commands in history" && \
echo "" && \
echo "2. Check if processes were manually killed:" && \
sudo journalctl | grep -i "wissen-backend\|wissen-frontend" | tail -20 || echo "No process kill logs" && \
echo "" && \
echo "3. Check for system shutdown/restart:" && \
last -x | head -5
```

---

## 📊 **STEP 8: Complete Diagnostic Summary**

```bash
cd /var/www/wissen-publication-group && \
echo "==========================================" && \
echo "🔍 COMPLETE ROOT CAUSE ANALYSIS" && \
echo "==========================================" && \
echo "Timestamp: $(date)" && \
echo "" && \
echo "=== SUMMARY ===" && \
echo "" && \
echo "1. PM2 Status:" && \
pm2 list && \
echo "" && \
echo "2. PM2 Saved Config:" && \
pm2 jlist 2>/dev/null | jq -r '.[] | "\(.name): \(.pm2_env.status), Restarts=\(.pm2_env.restart_time), Exit=\(.pm2_env.exit_code)"' || echo "No saved processes" && \
echo "" && \
echo "3. System Resources:" && \
echo "   Memory: $(free -h | grep Mem | awk '{print $3 "/" $2 " (" $5 " used)"}')" && \
echo "   Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')" && \
echo "   Load: $(uptime | awk -F'load average:' '{print $2}')" && \
echo "" && \
echo "4. OOM Kills:" && \
dmesg | grep -i "killed process" | wc -l && echo "processes killed by OOM" && \
echo "" && \
echo "5. Build Files:" && \
[ -f backend/dist/src/main.js ] && echo "   ✅ Backend built" || echo "   ❌ Backend NOT built" && \
[ -d frontend/.next ] && echo "   ✅ Frontend built" || echo "   ❌ Frontend NOT built" && \
echo "" && \
echo "6. Last Error Logs:" && \
echo "   Backend:" && \
tail -3 ~/.pm2/logs/wissen-backend-error.log 2>/dev/null | head -1 || echo "   No backend errors" && \
echo "   Frontend:" && \
tail -3 ~/.pm2/logs/wissen-frontend-error.log 2>/dev/null | head -1 || echo "   No frontend errors" && \
echo "" && \
echo "==========================================" && \
echo "✅ Diagnostic Complete" && \
echo "=========================================="
```

---

## 🎯 **MOST LIKELY CAUSES (Based on Empty PM2 List)**

### **1. PM2 Was Never Started After Last Deployment**
- **Check:** Look at last deployment time vs current time
- **Evidence:** Empty PM2 list, no processes saved

### **2. EC2 Instance Was Rebooted**
- **Check:** `uptime -s` and `last reboot`
- **Evidence:** PM2 not configured to start on boot

### **3. Manual Stop/Delete**
- **Check:** `history | grep pm2`
- **Evidence:** Commands like `pm2 delete all` or `pm2 stop all`

### **4. PM2 Daemon Restarted**
- **Check:** PM2 logs show daemon restart
- **Evidence:** Processes lost when PM2 daemon restarted

### **5. Out of Memory Kill**
- **Check:** `dmesg | grep killed`
- **Evidence:** Processes killed by system OOM killer

---

## 📝 **WHAT TO LOOK FOR IN RESULTS**

After running the diagnostics, look for:

1. **High restart count** = Frequent crashes before final stop
2. **OOM kills** = Out of memory issues
3. **Exit codes** = Non-zero = crash, 0 = normal stop
4. **Missing build files** = Deployment incomplete
5. **Recent reboot** = PM2 not configured for startup
6. **Error logs** = Specific error messages showing why it crashed

---

## 🔍 **QUICK ROOT CAUSE CHECK**

Run this single command to get the most important info:

```bash
cd /var/www/wissen-publication-group && \
echo "=== QUICK ROOT CAUSE CHECK ===" && \
echo "" && \
echo "1. PM2 Saved Processes:" && \
pm2 jlist 2>/dev/null | jq -r '.[] | "\(.name): Status=\(.pm2_env.status), Restarts=\(.pm2_env.restart_time), Exit=\(.pm2_env.exit_code), Last Start=\(.pm2_env.created_at)"' 2>/dev/null || echo "No saved processes" && \
echo "" && \
echo "2. Last Error (Backend):" && \
tail -5 ~/.pm2/logs/wissen-backend-error.log 2>/dev/null | tail -1 || echo "No backend errors" && \
echo "" && \
echo "3. Last Error (Frontend):" && \
tail -5 ~/.pm2/logs/wissen-frontend-error.log 2>/dev/null | tail -1 || echo "No frontend errors" && \
echo "" && \
echo "4. OOM Kills:" && \
dmesg | grep -i "killed process" | tail -3 || echo "No OOM kills" && \
echo "" && \
echo "5. System Reboot:" && \
uptime -s && \
echo "" && \
echo "6. Build Files:" && \
[ -f backend/dist/src/main.js ] && echo "Backend: ✅" || echo "Backend: ❌" && \
[ -d frontend/.next ] && echo "Frontend: ✅" || echo "Frontend: ❌"
```
