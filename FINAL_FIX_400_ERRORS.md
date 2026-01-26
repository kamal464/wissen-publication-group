# 🚨 FINAL FIX - Complete Frontend Rebuild for 400 Errors

## **COMPLETE FIX - Run This Now**

This will completely rebuild the frontend and fix the 400 errors:

```bash
cd /var/www/wissen-publication-group && \
echo "==========================================" && \
echo "🚨 COMPLETE FRONTEND REBUILD & FIX" && \
echo "==========================================" && \
echo "" && \
echo "=== STEP 1: Stop All Services ===" && \
pm2 stop wissen-frontend wissen-backend && \
sleep 3 && \
echo "" && \
echo "=== STEP 2: Complete Clean ===" && \
cd frontend && \
echo "Removing build artifacts..." && \
rm -rf .next node_modules/.cache .next/cache dist out && \
echo "✅ Cleaned" && \
echo "" && \
echo "=== STEP 3: Reinstall Dependencies ===" && \
npm install --no-audit --no-fund --loglevel=error && \
echo "✅ Dependencies installed" && \
echo "" && \
echo "=== STEP 4: Rebuild Frontend ===" && \
NODE_ENV=production NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
if [ $? -ne 0 ]; then \
  echo "❌ Build failed!"; \
  exit 1; \
fi && \
echo "✅ Build complete" && \
cd .. && \
echo "" && \
echo "=== STEP 5: Verify Build ===" && \
if [ -d "frontend/.next/static" ]; then \
  STATIC_COUNT=$(find frontend/.next/static -type f 2>/dev/null | wc -l); \
  echo "✅ Build exists with $STATIC_COUNT static files"; \
  echo "Sample files:"; \
  find frontend/.next/static/css -type f 2>/dev/null | head -3; \
  find frontend/.next/static/chunks -type f 2>/dev/null | head -3; \
else \
  echo "❌ Build directory missing!"; \
  exit 1; \
fi && \
echo "" && \
echo "=== STEP 6: Start Services ===" && \
pm2 start wissen-backend && \
sleep 5 && \
cd frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd .. && \
pm2 save && \
sleep 20 && \
echo "" && \
echo "=== STEP 7: Test Services ===" && \
echo "Backend:" && \
curl -s http://localhost:3001/health && echo "" && \
echo "" && \
echo "Frontend root:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 && \
echo "" && \
echo "Frontend static file (should be 200 or 404, NOT 400):" && \
curl -I http://localhost:3000/_next/static/css/app.css 2>&1 | head -5 && \
echo "" && \
echo "=== STEP 8: Restart Nginx ===" && \
sudo systemctl restart nginx && \
sleep 3 && \
echo "" && \
echo "=== STEP 9: Final Test via Nginx ===" && \
curl -I http://54.165.116.208/_next/static/css/app.css 2>&1 | head -5 && \
echo "" && \
echo "=== STEP 10: Check PM2 Status ===" && \
pm2 list && \
echo "" && \
echo "==========================================" && \
echo "✅ REBUILD COMPLETE!" && \
echo "==========================================" && \
echo "" && \
echo "If you still see 400 errors:" && \
echo "1. Check frontend logs: pm2 logs wissen-frontend --lines 50" && \
echo "2. Verify build: ls -la frontend/.next/static/css" && \
echo "3. Test directly: curl -v http://localhost:3000/_next/static/css/app.css"
```

---

## **IF BUILD FAILS - Check Logs**

```bash
cd /var/www/wissen-publication-group/frontend && \
echo "=== Checking Build Errors ===" && \
npm run build 2>&1 | tail -50
```

---

## **IF STILL FAILING - Check Next.js Logs**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Frontend Logs ===" && \
pm2 logs wissen-frontend --lines 100 --nostream | tail -30 && \
echo "" && \
echo "=== Frontend Error Logs ===" && \
pm2 logs wissen-frontend --err --lines 50 --nostream
```

---

## **ALTERNATIVE: Check if Port 3000 is Correct**

```bash
echo "=== Checking Port 3000 ===" && \
sudo ss -tlnp | grep 3000 && \
echo "" && \
echo "=== Testing Frontend ===" && \
curl -v http://localhost:3000 2>&1 | head -20
```

---

## **VERIFY BUILD FILES EXIST**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Checking Build Files ===" && \
echo "CSS files:" && \
find frontend/.next/static/css -type f 2>/dev/null | head -10 && \
echo "" && \
echo "Chunk files:" && \
find frontend/.next/static/chunks -type f 2>/dev/null | head -10 && \
echo "" && \
echo "Total files:" && \
find frontend/.next/static -type f 2>/dev/null | wc -l
```

---

**Run the COMPLETE FIX command above. This will rebuild everything from scratch!** 🚀
