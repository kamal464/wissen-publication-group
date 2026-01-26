# 🚨 URGENT: Frontend Crashing 95 Times

## **IMMEDIATE DIAGNOSTIC**

Run these commands to see why frontend is crashing:

```bash
echo "=== Frontend Crash Diagnostic ===" && \
echo "" && \
echo "1. Frontend Error Logs (last 50 lines):" && \
pm2 logs wissen-frontend --err --lines 50 --nostream && \
echo "" && \
echo "2. Frontend Output Logs (last 30 lines):" && \
pm2 logs wissen-frontend --out --lines 30 --nostream && \
echo "" && \
echo "3. Frontend Process Details:" && \
pm2 describe wissen-frontend && \
echo "" && \
echo "4. Check if .next build exists:" && \
ls -ld /var/www/wissen-publication-group/frontend/.next 2>/dev/null || echo "❌ Build missing!" && \
echo "" && \
echo "5. Check .env.production:" && \
cat /var/www/wissen-publication-group/frontend/.env.production 2>/dev/null || echo "❌ .env.production missing!" && \
echo "" && \
echo "6. Check port 3000:" && \
sudo ss -tlnp | grep :3000 || echo "Port 3000 not listening"
```

---

## **COMMON FIXES**

### **Fix 1: Missing Build or .env.production**

```bash
cd /var/www/wissen-publication-group/frontend && \
echo "Checking build..." && \
[ -d .next ] && echo "✅ Build exists" || (echo "❌ Build missing - rebuilding..." && npm run build) && \
echo "" && \
echo "Checking .env.production..." && \
[ -f .env.production ] && echo "✅ .env.production exists" || (echo "Creating .env.production..." && echo "NEXT_PUBLIC_API_URL=https://wissenpublicationgroup.com/api" > .env.production) && \
echo "" && \
echo "Restarting frontend..." && \
pm2 restart wissen-frontend && \
sleep 15 && \
pm2 list | grep wissen-frontend
```

### **Fix 2: Port Already in Use**

```bash
echo "Killing processes on port 3000..." && \
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true && \
pkill -9 -f "next-server" 2>/dev/null || true && \
sleep 3 && \
echo "Restarting frontend..." && \
pm2 restart wissen-frontend && \
sleep 15 && \
pm2 list | grep wissen-frontend
```

### **Fix 3: Rebuild and Restart**

```bash
cd /var/www/wissen-publication-group && \
echo "Stopping frontend..." && \
pm2 delete wissen-frontend 2>/dev/null || true && \
sleep 2 && \
echo "Rebuilding frontend..." && \
cd frontend && \
rm -rf .next node_modules/.cache && \
npm install --no-audit --no-fund --loglevel=error && \
npm run build && \
echo "" && \
echo "Starting frontend..." && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd .. && \
pm2 save && \
sleep 20 && \
pm2 list | grep wissen-frontend
```

---

## **VERIFY FIX**

After applying a fix, wait 30 seconds and check:

```bash
echo "Waiting 30 seconds for frontend to stabilize..." && \
sleep 30 && \
echo "" && \
echo "PM2 Status:" && \
pm2 list | grep wissen-frontend && \
echo "" && \
echo "Restart count should be 0 or very low (not 95+)" && \
echo "" && \
echo "Testing frontend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 http://localhost:3000
```

---

## **IF STILL CRASHING**

Share the output of the diagnostic command above so we can see the exact error.
