# 🔧 Fix Frontend Error - PM2 Shows "errored" Status

## **IMMEDIATE DIAGNOSTIC**

The frontend shows as "errored" in PM2 but is still responding. Check what's wrong:

```bash
cd /var/www/wissen-publication-group && \
echo "=== CHECKING FRONTEND ERROR ===" && \
echo "" && \
echo "1. Frontend Status:" && \
pm2 describe wissen-frontend && \
echo "" && \
echo "2. Recent Frontend Errors:" && \
pm2 logs wissen-frontend --err --lines 50 --nostream && \
echo "" && \
echo "3. Recent Frontend Logs:" && \
pm2 logs wissen-frontend --lines 30 --nostream | tail -20
```

---

## **FIX FRONTEND ERROR**

If the frontend is crashing, try these fixes:

### **Option 1: Restart Frontend Only**

```bash
cd /var/www/wissen-publication-group && \
pm2 delete wissen-frontend && \
cd frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd .. && \
pm2 save && \
sleep 10 && \
pm2 list && \
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000
```

### **Option 2: Rebuild and Restart Frontend**

```bash
cd /var/www/wissen-publication-group/frontend && \
echo "=== Rebuilding Frontend ===" && \
rm -rf .next node_modules/.cache && \
npm install --no-audit --no-fund --loglevel=error && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
cd .. && \
echo "" && \
echo "=== Restarting Frontend ===" && \
pm2 delete wissen-frontend && \
cd frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd .. && \
pm2 save && \
sleep 15 && \
pm2 list && \
echo "" && \
echo "Testing frontend..." && \
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000
```

### **Option 3: Check if Build Exists**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Checking Frontend Build ===" && \
if [ -d "frontend/.next" ]; then \
  echo "✅ Build exists"; \
  ls -la frontend/.next/static 2>/dev/null | head -5 || echo "⚠️ Static directory may be empty"; \
else \
  echo "❌ Build missing - need to rebuild"; \
  cd frontend && \
  rm -rf .next node_modules/.cache && \
  npm install --no-audit --no-fund --loglevel=error && \
  NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
  cd .. && \
  pm2 restart wissen-frontend; \
fi
```

---

## **VERIFY FIX**

After fixing, verify everything is working:

```bash
cd /var/www/wissen-publication-group && \
echo "=== VERIFICATION ===" && \
pm2 list && \
echo "" && \
echo "Backend:" && \
curl -s http://localhost:3001/health && echo "" && \
echo "Frontend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 && \
echo "" && \
echo "Public URL:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 http://54.165.116.208 || echo "Cannot reach public IP"
```

---

**Run the diagnostic first to see what's causing the error!** 🔍
