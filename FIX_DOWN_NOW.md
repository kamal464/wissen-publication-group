# 🆘 IMMEDIATE FIX - Site is DOWN (No PM2 Processes Running)

**Your PM2 shows NO processes running - this is why the site is down!**

---

## 🚨 **IMMEDIATE FIX - Start Services Now**

Run this command to start everything:

```bash
cd /var/www/wissen-publication-group && \
echo "==========================================" && \
echo "🚀 STARTING ALL SERVICES" && \
echo "==========================================" && \
echo "" && \
echo "1. Checking if build files exist..." && \
ls -lh backend/dist/src/main.js 2>/dev/null && \
ls -ld frontend/.next 2>/dev/null && \
echo "" && \
echo "2. Starting Backend..." && \
cd backend && \
pm2 start dist/src/main.js --name wissen-backend \
  --max-memory-restart 400M \
  --update-env && \
echo "" && \
echo "3. Starting Frontend..." && \
cd ../frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
echo "" && \
echo "4. Saving PM2 configuration..." && \
cd .. && \
pm2 save && \
echo "" && \
echo "5. Waiting for services to start..." && \
sleep 10 && \
echo "" && \
echo "6. Checking PM2 status..." && \
pm2 list && \
echo "" && \
echo "7. Testing services..." && \
echo "   Backend:" && \
curl -s http://localhost:3001/api/health && echo "" || echo "❌ Backend not responding yet" && \
echo "   Frontend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 || echo "❌ Frontend not responding yet" && \
echo "" && \
echo "8. Restarting Nginx..." && \
sudo systemctl restart nginx && \
echo "" && \
echo "==========================================" && \
echo "✅ Services started! Check status above." && \
echo "=========================================="
```

---

## 🔍 **IF SERVICES DON'T START - Check Build Files**

If the above fails, check if build files exist:

```bash
cd /var/www/wissen-publication-group && \
echo "Checking build files..." && \
echo "" && \
echo "Backend build:" && \
ls -lh backend/dist/src/main.js 2>/dev/null || echo "❌ Backend not built - need to build first" && \
echo "" && \
echo "Frontend build:" && \
ls -ld frontend/.next 2>/dev/null || echo "❌ Frontend not built - need to build first" && \
echo "" && \
echo "If files are missing, run deployment from DEPLOY_NOW.md"
```

---

## 🔄 **IF BUILD FILES ARE MISSING - Quick Rebuild**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Rebuilding Backend ===" && \
cd backend && \
npm install --no-audit --no-fund --loglevel=error && \
npx prisma generate && \
npm run build && \
echo "" && \
echo "=== Rebuilding Frontend ===" && \
cd ../frontend && \
npm install --no-audit --no-fund --loglevel=error && \
npm run build && \
echo "" && \
echo "=== Starting Services ===" && \
cd .. && \
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
sleep 10 && \
pm2 list && \
sudo systemctl restart nginx
```

---

## ✅ **VERIFY SITE IS UP**

After starting services, verify:

```bash
echo "Testing site..." && \
echo "" && \
echo "1. PM2 Status:" && \
pm2 list && \
echo "" && \
echo "2. Backend Health:" && \
curl -s http://localhost:3001/api/health && echo "" && \
echo "" && \
echo "3. Frontend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 && \
echo "" && \
echo "4. Public Site (via Nginx):" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://wissenpublicationgroup.com || \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://wissenpublicationgroup.com
```

---

## 🔧 **CONFIGURE PM2 TO START ON REBOOT**

After services are running, configure PM2 to auto-start on reboot:

```bash
pm2 save && \
pm2 startup
# Copy and run the command it shows (starts with "sudo env PATH=...")
```

---

## 📊 **CHECK WHY SERVICES STOPPED**

After starting services, check logs to see why they stopped:

```bash
echo "Checking recent logs..." && \
pm2 logs wissen-backend --lines 50 --nostream 2>/dev/null | tail -20 && \
echo "" && \
pm2 logs wissen-frontend --lines 50 --nostream 2>/dev/null | tail -20
```

---

## 🎯 **QUICKEST FIX (If you just need it up NOW)**

```bash
cd /var/www/wissen-publication-group/backend && \
pm2 start dist/src/main.js --name wissen-backend --update-env && \
cd ../frontend && \
pm2 start npm --name wissen-frontend --update-env -- start && \
cd .. && \
pm2 save && \
sleep 5 && \
pm2 list && \
sudo systemctl restart nginx
```
