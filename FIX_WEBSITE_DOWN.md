# 🚨 Website Not Loading - Emergency Fix

## **IMMEDIATE DIAGNOSTIC & FIX**

Run this on your server to diagnose and fix:

```bash
cd /var/www/wissen-publication-group && \
echo "==========================================" && \
echo "🚨 EMERGENCY WEBSITE FIX" && \
echo "==========================================" && \
echo "" && \
echo "=== STEP 1: Check Current Status ===" && \
pm2 list && \
echo "" && \
echo "=== STEP 2: Test Services ===" && \
echo "Backend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 5 http://localhost:3001/health || echo "❌ Backend DOWN" && \
echo "Frontend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 5 http://localhost:3000 || echo "❌ Frontend DOWN" && \
echo "" && \
echo "=== STEP 3: Restart All Services ===" && \
pm2 restart all && \
sleep 10 && \
echo "" && \
echo "=== STEP 4: Restart Nginx ===" && \
sudo systemctl restart nginx && \
sleep 3 && \
echo "" && \
echo "=== STEP 5: Verify Services ===" && \
pm2 list && \
echo "" && \
echo "Backend Health:" && \
curl -s http://localhost:3001/health && echo "" && \
echo "" && \
echo "Frontend Status:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 http://localhost:3000 && \
echo "" && \
echo "=== STEP 6: Check Nginx Status ===" && \
sudo systemctl status nginx --no-pager | head -5 && \
echo "" && \
echo "=== STEP 7: Test Public URL ===" && \
curl -s -o /dev/null -w "Public URL: HTTP %{http_code}\n" --max-time 10 http://54.165.116.208 || echo "❌ Cannot reach public IP" && \
echo "" && \
echo "==========================================" && \
echo "✅ Fix Applied - Check results above" && \
echo "=========================================="
```

---

## **IF SERVICES ARE DOWN - FORCE RESTART**

If the above doesn't work, force restart everything:

```bash
cd /var/www/wissen-publication-group && \
echo "🚨 FORCE RESTARTING ALL SERVICES" && \
echo "" && \
pm2 delete all 2>/dev/null || true && \
sleep 3 && \
echo "Starting Backend..." && \
cd backend && \
pm2 start dist/src/main.js --name wissen-backend \
  --max-memory-restart 400M \
  --update-env && \
cd ../frontend && \
echo "Starting Frontend..." && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd .. && \
pm2 save && \
sleep 10 && \
echo "" && \
echo "Restarting Nginx..." && \
sudo systemctl restart nginx && \
sleep 5 && \
echo "" && \
echo "=== VERIFICATION ===" && \
pm2 list && \
echo "" && \
curl -s http://localhost:3001/health && echo "" && \
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000 && \
echo "" && \
echo "✅ Services restarted!"
```

---

## **CHECK SPECIFIC ISSUES**

### **1. Check if PM2 processes are running:**
```bash
pm2 list
# If you see "errored" or "stopped", restart them
```

### **2. Check if ports are listening:**
```bash
sudo ss -tlnp | grep -E ":3000|:3001|:80"
# Should show processes listening on these ports
```

### **3. Check Nginx error logs:**
```bash
sudo tail -50 /var/log/nginx/error.log
```

### **4. Check PM2 error logs:**
```bash
pm2 logs wissen-backend --err --lines 50 --nostream
pm2 logs wissen-frontend --err --lines 50 --nostream
```

### **5. Check if services are accessible:**
```bash
# Backend
curl -v http://localhost:3001/health

# Frontend
curl -v http://localhost:3000

# Public IP
curl -v http://54.165.116.208
```

---

## **IF STILL NOT WORKING - FULL REBUILD**

```bash
cd /var/www/wissen-publication-group && \
echo "🔧 FULL REBUILD & RESTART" && \
echo "" && \
echo "1. Stopping all services..." && \
pm2 delete all 2>/dev/null || true && \
echo "" && \
echo "2. Rebuilding backend..." && \
cd backend && \
npm install --no-audit --no-fund --loglevel=error && \
npx prisma generate && \
npm run build && \
cd .. && \
echo "" && \
echo "3. Rebuilding frontend..." && \
cd frontend && \
rm -rf .next node_modules/.cache && \
npm install --no-audit --no-fund --loglevel=error && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
cd .. && \
echo "" && \
echo "4. Starting services..." && \
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
echo "" && \
echo "5. Restarting Nginx..." && \
sudo systemctl restart nginx && \
sleep 5 && \
echo "" && \
echo "=== VERIFICATION ===" && \
pm2 list && \
curl -s http://localhost:3001/health && echo "" && \
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000 && \
echo "" && \
echo "✅ Full rebuild complete!"
```

---

## **QUICK STATUS CHECK**

```bash
echo "=== QUICK STATUS ===" && \
pm2 list && \
echo "" && \
echo "Backend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3001/health && \
echo "Frontend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 && \
echo "Nginx:" && \
sudo systemctl is-active nginx
```

---

**Run the first command block to diagnose and fix immediately!** 🚀
