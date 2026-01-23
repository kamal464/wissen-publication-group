# ✅ Verify Deployment Status

## 🔍 **Check if Build Completed and Services are Running:**

Run these commands to verify everything:

```bash
# Check if .next folder exists (build completed)
ls -la /var/www/wissen-publication-group/frontend/.next 2>/dev/null && echo "✅ Build folder exists" || echo "❌ Build folder missing"

# Check PM2 services
pm2 list

# Check backend health
curl -s http://localhost:3001/api/health && echo "" || echo "❌ Backend not responding"

# Check frontend
curl -I http://localhost:3000 2>&1 | head -5

# Check Nginx status
sudo systemctl status nginx --no-pager | head -10

# Check recent PM2 logs
pm2 logs wissen-frontend --lines 10 --nostream
pm2 logs wissen-backend --lines 10 --nostream
```

---

## 🚀 **If Build Didn't Complete, Run This:**

```bash
cd /var/www/wissen-publication-group/frontend && \
echo "=== Checking current status ===" && \
ls -la .next 2>/dev/null || echo "No .next folder - need to build" && \
echo "" && \
echo "=== Starting build ===" && \
npm install --no-audit --no-fund --loglevel=error && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build 2>&1 | tee /tmp/build.log && \
echo "" && \
echo "=== Build output saved to /tmp/build.log ===" && \
tail -20 /tmp/build.log
```

---

## ✅ **Quick Status Check (One Command):**

```bash
echo "=== Build Status ===" && \
[ -d "/var/www/wissen-publication-group/frontend/.next" ] && echo "✅ Build folder exists" || echo "❌ Build folder missing" && \
echo "" && \
echo "=== PM2 Services ===" && \
pm2 list && \
echo "" && \
echo "=== Backend Health ===" && \
curl -s http://localhost:3001/api/health && echo "" || echo "❌ Backend down" && \
echo "" && \
echo "=== Frontend Status ===" && \
curl -I http://localhost:3000 2>&1 | head -3
```

---

## 🔄 **If Services Need Restart:**

```bash
cd /var/www/wissen-publication-group && \
pm2 restart all && \
sleep 3 && \
pm2 save && \
sudo systemctl reload nginx && \
echo "✅ Services restarted!"
```

---

## 📊 **View Build Logs:**

If you want to see what happened during the build:

```bash
# Check if build log exists
cat /tmp/build.log 2>/dev/null || echo "No build log found"

# Or check PM2 logs
pm2 logs wissen-frontend --lines 50
```

---

## ⚠️ **If Build Failed:**

Run the build again with verbose output:

```bash
cd /var/www/wissen-publication-group/frontend && \
rm -rf .next && \
npm install --no-audit --no-fund && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build
```

This will show you any errors that occurred.
