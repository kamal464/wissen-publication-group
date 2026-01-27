# 🚀 Deploy Latest Changes - AWS Browser Commands

**Run these commands in AWS Systems Manager Session Manager or EC2 Instance Connect browser terminal**

---

## 📥 **STEP 1: Pull Latest Code**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Pulling latest code ===" && \
(GIT_TERMINAL_PROMPT=0 timeout 60 git fetch origin main 2>&1 && \
git reset --hard origin/main && \
echo "✅ Code pulled successfully!") || \
(echo "⚠️  Git pull failed (network timeout or connection issue)" && \
echo "   Continuing with existing code..." && \
git status)
```

---

## 🔧 **STEP 2: Deploy Backend**

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== Installing backend dependencies ===" && \
npm install --no-audit --no-fund --loglevel=error && \
echo "" && \
echo "=== Generating Prisma client ===" && \
npx prisma generate && \
echo "" && \
echo "=== Applying migrations ===" && \
npx prisma migrate deploy && \
echo "" && \
echo "=== Building backend ===" && \
npm run build && \
echo "✅ Backend built successfully!"
```

---

## 🎨 **STEP 3: Deploy Frontend**

```bash
cd /var/www/wissen-publication-group/frontend && \
echo "=== Installing frontend dependencies ===" && \
npm install --no-audit --no-fund --loglevel=error && \
echo "✅ Dependencies installed" && \
echo "" && \
echo "=== Building frontend (this may take 1-2 minutes) ===" && \
NODE_ENV=production npm run build && \
echo "✅ Frontend built successfully!"
```

---

## 🔄 **STEP 4: Restart Services**

**IMPORTANT: Use `pm2 restart` instead of `pm2 delete` to preserve process state**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Restarting PM2 services ===" && \
pm2 restart all 2>/dev/null || \
(pm2 delete all 2>/dev/null || true && \
sleep 2 && \
cd backend && \
pm2 start dist/src/main.js --name wissen-backend \
  --max-memory-restart 400M \
  --update-env && \
cd ../frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd ..) && \
sleep 5 && \
pm2 save && \
pm2 startup && \
echo "" && \
echo "=== Reloading Nginx ===" && \
sudo systemctl reload nginx && \
echo "" && \
echo "=== Verifying services ===" && \
pm2 list && \
echo "" && \
echo "✅ Deployment complete!"
```

---

## 🚀 **ALL-IN-ONE DEPLOYMENT COMMAND**

**Copy and paste this entire block:**

```bash
cd /var/www/wissen-publication-group && \
echo "=== STEP 0: Security Check & Cleanup ===" && \
echo "Removing suspicious files (if any)..." && \
rm -rf frontend/xmrig* frontend/scanner_linux frontend/public/ids.php 2>/dev/null && \
rm -f backend/.env.backup.* backend/.env.save 2>/dev/null && \
echo "Checking disk space..." && \
df -h / | head -2 && \
if [ $(df / | tail -1 | awk '{print $5}' | sed 's/%//') -gt 90 ]; then \
  echo "⚠️  Disk space > 90%, cleaning up..." && \
  npm cache clean --force 2>/dev/null || true && \
  sudo journalctl --vacuum-time=3d 2>/dev/null || true && \
  pm2 flush 2>/dev/null || true; \
fi && \
echo "" && \
echo "=== STEP 1: Pull Latest Code ===" && \
(GIT_TERMINAL_PROMPT=0 timeout 60 git fetch origin main 2>&1 && \
git reset --hard origin/main && \
echo "✅ Code pulled successfully!") || \
(echo "⚠️  Git pull failed (network timeout or connection issue)" && \
echo "   Continuing with existing code..." && \
git status) && \
echo "" && \
echo "=== STEP 2: Deploy Backend ===" && \
cd backend && \
npm install --no-audit --no-fund --loglevel=error && \
npx prisma generate && \
npx prisma migrate deploy && \
npm run build && \
echo "" && \
echo "=== STEP 3: Deploy Frontend ===" && \
cd ../frontend && \
npm install --no-audit --no-fund --loglevel=error && \
npm run build && \
echo "" && \
echo "=== STEP 4: Restart Services ===" && \
cd /var/www/wissen-publication-group && \
pm2 restart all 2>/dev/null || \
(pm2 delete all 2>/dev/null || true && \
sleep 2 && \
cd backend && \
pm2 start dist/src/main.js --name wissen-backend \
  --max-memory-restart 400M \
  --update-env && \
cd ../frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd ..) && \
sleep 5 && \
pm2 save && \
pm2 startup && \
sudo systemctl reload nginx && \
echo "" && \
echo "=== STEP 5: Verify ===" && \
pm2 list && \
curl -s http://localhost:3001/api/health && echo "" && \
echo "✅ Deployment complete! All services running."
```

---

## 🔍 **VERIFY DEPLOYMENT**

After deployment, check:

```bash
# Check PM2 status
pm2 list

# Check backend health
curl http://localhost:3001/api/health

# Check frontend
curl -I http://localhost:3000

# Check Nginx
sudo systemctl status nginx

# View logs if needed
pm2 logs wissen-backend --lines 20
pm2 logs wissen-frontend --lines 20
```

---

## ⚠️ **IF YOU GET ERRORS:**

### Git Pull Timeout / Connection Failed?
```bash
# Option 1: Retry with shorter timeout and continue on failure
cd /var/www/wissen-publication-group && \
GIT_TERMINAL_PROMPT=0 timeout 30 git fetch origin main 2>&1 || \
echo "⚠️  Git fetch failed, continuing with existing code" && \
git reset --hard origin/main 2>/dev/null || echo "Using current code"

# Option 2: Check network connectivity
ping -c 3 github.com || echo "❌ Cannot reach GitHub - check security groups/firewall"

# Option 3: Try using SSH instead of HTTPS (if SSH keys are configured)
cd /var/www/wissen-publication-group && \
git remote -v && \
git remote set-url origin git@github.com:kamal464/wissen-publication-group.git && \
git fetch origin main

# Option 4: Skip git pull and continue deployment
echo "⚠️  Skipping git pull, deploying existing code..."
```

### Disk Space Full?
```bash
cd /var/www/wissen-publication-group && \
echo "=== Checking Disk Space ===" && \
df -h / && \
echo "" && \
echo "=== Removing Suspicious Files (if any) ===" && \
rm -rf frontend/xmrig* frontend/scanner_linux frontend/public/ids.php 2>/dev/null && \
rm -f backend/.env.backup.* backend/.env.save 2>/dev/null && \
echo "" && \
echo "=== Cleaning Up ===" && \
npm cache clean --force 2>/dev/null || true && \
sudo journalctl --vacuum-time=3d 2>/dev/null || true && \
sudo find /var/log -type f -name "*.log" -mtime +7 -delete 2>/dev/null || true && \
pm2 flush 2>/dev/null || true && \
cd backend && rm -rf node_modules dist 2>/dev/null || true && \
cd ../frontend && rm -rf node_modules .next 2>/dev/null || true && \
cd .. && \
echo "" && \
echo "=== After Cleanup ===" && \
df -h / && \
echo "✅ Cleanup complete!"
```

### Suspicious Files Detected? (XMRig, Miners, etc.)
**⚠️ SECURITY ALERT:** If you see files like `xmrig`, `scanner_linux`, or `ids.php`, your server may be compromised!

**See `SECURITY_ALERT_SUSPICIOUS_FILES.md` for immediate action steps.**

### NPM Install Fails?
```bash
cd /var/www/wissen-publication-group/backend && \
sudo rm -rf node_modules package-lock.json && \
npm cache clean --force && \
npm install --no-audit --no-fund --loglevel=error
```

### PM2 Process Not Found?
```bash
cd /var/www/wissen-publication-group && \
cd backend && \
pm2 start dist/src/main.js --name wissen-backend \
  --max-memory-restart 400M \
  --update-env && \
cd ../frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd .. && \
pm2 save && \
pm2 startup
```

### Site Down Frequently? Check DIAGNOSE_DOWNTIME.md
```bash
# Run comprehensive diagnostic
cat DIAGNOSE_DOWNTIME.md
# Or check PM2 restart counts
pm2 list
# Look for high numbers in "↺" column = frequent crashes
```

---

## 📝 **QUICK REFERENCE:**

- **Connect**: EC2 Console → Select instance → Connect → Session Manager → Connect
- **Project Path**: `/var/www/wissen-publication-group`
- **Backend Path**: `/var/www/wissen-publication-group/backend`
- **Frontend Path**: `/var/www/wissen-publication-group/frontend`
- **PM2 Commands**: `pm2 list`, `pm2 restart all`, `pm2 logs`, `pm2 save`
