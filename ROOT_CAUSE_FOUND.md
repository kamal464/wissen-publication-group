# 🎯 ROOT CAUSE IDENTIFIED - Why Site Goes Down Frequently

## 📊 **DIAGNOSTIC RESULTS ANALYSIS**

Based on your diagnostic output, here's what happened:

---

## 🔴 **PRIMARY ROOT CAUSE: PM2 Not Configured for Auto-Start on Reboot**

### **Evidence:**
1. **System Reboot**: `2026-01-23 13:22:18` - EC2 instance was rebooted
2. **PM2 Exit Code**: `0` (normal shutdown, not crash)
3. **PM2 Restart Count**: `3` (process restarted 3 times before final stop)
4. **Empty PM2 List**: No processes running after reboot

### **What Happened:**
- EC2 instance rebooted on Jan 23, 13:22:18
- PM2 processes stopped gracefully (exit code 0)
- **PM2 was NOT configured to auto-start on boot**
- After reboot, services never started automatically
- Site went down and stayed down

---

## 🔴 **SECONDARY CAUSE: Manual PM2 Deletions**

### **Evidence from History:**
Your command history shows multiple `pm2 delete all` commands:
- Line 1047: `pm2 delete all` (cleanup command)
- Line 1048: `pm2 delete wissen-frontend` (frontend fix)
- Line 1421: `pm2 delete wissen-backend wissen-frontend` (deployment)

### **What This Means:**
- Services were manually stopped/deleted during troubleshooting
- After manual stops, services weren't always restarted properly
- No persistent configuration to ensure services stay running

---

## 🔴 **TERTIARY ISSUES: Process Crashes Before Final Stop**

### **Evidence:**
- **Restart Count**: `3` - Process crashed and restarted 3 times before stopping
- **Backend Error**: Body-parser error (likely from malformed requests)
- **Frontend Error**: `syscall: 'read'` error (connection/read issue)

### **What This Means:**
- Services were experiencing crashes before the final stop
- These crashes suggest:
  - Memory issues (processes restarting)
  - Request handling errors
  - Connection problems

---

## ✅ **THE FIX - Prevent Future Downtime**

### **1. Configure PM2 Auto-Start on Reboot (CRITICAL)**

After starting services, run:

```bash
pm2 save && \
pm2 startup
# Then copy and run the command it shows (starts with "sudo env PATH=...")
```

This ensures services automatically start after EC2 reboots.

---

### **2. Start Services with Proper Auto-Restart Configuration**

```bash
cd /var/www/wissen-publication-group && \
pm2 delete all 2>/dev/null || true && \
sleep 2 && \
cd backend && \
pm2 start dist/src/main.js --name wissen-backend \
  --max-memory-restart 400M \
  --min-uptime 10000 \
  --max-restarts 10 \
  --exp-backoff-restart-delay=100 \
  --update-env && \
cd ../frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --min-uptime 10000 \
  --max-restarts 10 \
  --exp-backoff-restart-delay=100 \
  --update-env \
  -- start && \
cd .. && \
pm2 save && \
pm2 startup && \
# Copy and run the command pm2 startup shows
sleep 10 && \
pm2 list && \
sudo systemctl restart nginx
```

---

### **3. Set Up Health Check Monitoring**

Create automated health checks to detect and restart services if they go down:

```bash
# Create health check script
cat > /var/www/wissen-publication-group/health-check.sh << 'EOF'
#!/bin/bash
BACKEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null)
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)

if [ "$BACKEND" != "200" ] || [ "$FRONTEND" != "200" ]; then
  echo "$(date): Service down! Backend=$BACKEND, Frontend=$FRONTEND" >> /var/www/wissen-publication-group/health-check.log
  cd /var/www/wissen-publication-group && \
  pm2 restart all 2>/dev/null || \
  (cd backend && pm2 start dist/src/main.js --name wissen-backend --update-env && \
   cd ../frontend && pm2 start npm --name wissen-frontend --update-env -- start)
fi
EOF

chmod +x /var/www/wissen-publication-group/health-check.sh

# Add to crontab (check every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /var/www/wissen-publication-group/health-check.sh") | crontab -
```

---

### **4. Install PM2 Log Rotation**

Prevent log files from filling up disk:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

## 📋 **SUMMARY OF ROOT CAUSES**

| Issue | Severity | Evidence | Fix |
|-------|----------|----------|-----|
| **PM2 not auto-starting on reboot** | 🔴 CRITICAL | System rebooted, PM2 empty | Run `pm2 startup` |
| **Manual PM2 deletions** | 🟡 HIGH | History shows `pm2 delete all` | Use restart instead of delete |
| **Process crashes before stop** | 🟡 MEDIUM | Restart count = 3 | Add memory limits & auto-restart |
| **No health monitoring** | 🟡 MEDIUM | No automated checks | Set up cron health check |

---

## 🎯 **IMMEDIATE ACTION REQUIRED**

1. **Start services** (using the fix command above)
2. **Configure PM2 startup** (`pm2 startup` + run the command it shows)
3. **Set up health monitoring** (health check script + cron)
4. **Update deployment process** to always run `pm2 startup` after `pm2 save`

---

## 🔄 **UPDATED DEPLOYMENT PROCESS**

Always include these steps in deployment:

```bash
# After pm2 save, ALWAYS run:
pm2 startup
# Then run the command it shows

# This ensures services survive reboots
```

---

## 📊 **WHY THIS HAPPENS FREQUENTLY**

1. **EC2 Auto-Reboots**: AWS may reboot instances for maintenance/updates
2. **Manual Interventions**: Troubleshooting commands that delete PM2 processes
3. **No Persistence**: PM2 not configured to remember processes across reboots
4. **No Monitoring**: No automated detection when services go down

---

## ✅ **AFTER APPLYING FIXES**

Your site should:
- ✅ Auto-start after EC2 reboots
- ✅ Auto-restart if processes crash
- ✅ Be monitored every 5 minutes
- ✅ Restart automatically if health checks fail

---

## 🚨 **NEXT STEPS**

1. Run the fix command above to start services
2. Run `pm2 startup` and execute the command it shows
3. Set up the health check monitoring
4. Test by rebooting EC2 (if safe) to verify auto-start works
