# 🔧 Fix Frontend 400 Error - Next.js Issue

## **ROOT CAUSE IDENTIFIED**

The frontend itself is returning 400 Bad Request for static files. This is a Next.js issue, not Nginx.

## **IMMEDIATE FIX**

### **STEP 1: Check if File Exists in Build**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Checking Build Files ===" && \
find frontend/.next/static -name "*312758d985e43958.css" 2>/dev/null && \
echo "" && \
echo "=== Listing CSS Files ===" && \
find frontend/.next/static/css -type f 2>/dev/null | head -10 && \
echo "" && \
echo "=== Total Static Files ===" && \
find frontend/.next/static -type f 2>/dev/null | wc -l
```

### **STEP 2: Check Next.js Configuration**

```bash
cd /var/www/wissen-publication-group/frontend && \
echo "=== Checking Next.js Config ===" && \
cat next.config.ts | grep -A 5 "output\|standalone" && \
echo "" && \
echo "=== Checking Package.json ===" && \
cat package.json | grep -A 3 "scripts"
```

### **STEP 3: Rebuild Frontend (Most Likely Fix)**

The build might be corrupted or incomplete. Rebuild it:

```bash
cd /var/www/wissen-publication-group && \
echo "=== REBUILDING FRONTEND ===" && \
pm2 stop wissen-frontend && \
cd frontend && \
echo "1. Cleaning..." && \
rm -rf .next node_modules/.cache && \
echo "2. Installing dependencies..." && \
npm install --no-audit --no-fund --loglevel=error && \
echo "3. Building..." && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
cd .. && \
echo "" && \
echo "4. Starting frontend..." && \
pm2 start wissen-frontend && \
sleep 15 && \
echo "" && \
echo "=== Testing After Rebuild ===" && \
curl -I http://localhost:3000/_next/static/css/app.css 2>&1 | head -5 && \
echo "" && \
echo "=== Checking Build ===" && \
find frontend/.next/static/css -type f 2>/dev/null | head -5 && \
echo "" && \
echo "✅ Frontend rebuilt!"
```

### **STEP 4: If Still Failing - Check Next.js Version & Config**

```bash
cd /var/www/wissen-publication-group/frontend && \
echo "=== Next.js Version ===" && \
npm list next && \
echo "" && \
echo "=== Full Next.js Config ===" && \
cat next.config.ts
```

### **STEP 5: Alternative - Use Standalone Build**

If the issue persists, try standalone mode:

```bash
cd /var/www/wissen-publication-group/frontend && \
echo "=== Checking if standalone mode is needed ===" && \
cat next.config.ts && \
echo "" && \
echo "If output: 'standalone' is commented, the build might need it for production"
```

---

## **COMPLETE REBUILD & RESTART**

Run this complete fix:

```bash
cd /var/www/wissen-publication-group && \
echo "==========================================" && \
echo "🔧 COMPLETE FRONTEND FIX" && \
echo "==========================================" && \
echo "" && \
echo "=== STEP 1: Stop Frontend ===" && \
pm2 stop wissen-frontend && \
sleep 3 && \
echo "" && \
echo "=== STEP 2: Clean Build ===" && \
cd frontend && \
rm -rf .next node_modules/.cache .next/cache && \
echo "✅ Cleaned" && \
echo "" && \
echo "=== STEP 3: Reinstall Dependencies ===" && \
npm install --no-audit --no-fund --loglevel=error && \
echo "✅ Dependencies installed" && \
echo "" && \
echo "=== STEP 4: Rebuild ===" && \
NODE_ENV=production NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
echo "✅ Build complete" && \
cd .. && \
echo "" && \
echo "=== STEP 5: Verify Build ===" && \
if [ -d "frontend/.next/static" ]; then \
  STATIC_COUNT=$(find frontend/.next/static -type f 2>/dev/null | wc -l); \
  echo "✅ Build exists with $STATIC_COUNT static files"; \
  find frontend/.next/static/css -type f 2>/dev/null | head -5; \
else \
  echo "❌ Build failed!"; \
  exit 1; \
fi && \
echo "" && \
echo "=== STEP 6: Start Frontend ===" && \
pm2 start wissen-frontend && \
sleep 15 && \
echo "" && \
echo "=== STEP 7: Test ===" && \
echo "Frontend root:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 && \
echo "" && \
echo "Static file test:" && \
curl -I http://localhost:3000/_next/static/css/app.css 2>&1 | head -3 && \
echo "" && \
echo "=== STEP 8: Restart Nginx ===" && \
sudo systemctl reload nginx && \
echo "" && \
echo "==========================================" && \
echo "✅ FIX COMPLETE!" && \
echo "=========================================="
```

---

## **VERIFY THE FIX**

After rebuilding:

```bash
echo "=== VERIFICATION ===" && \
pm2 list | grep wissen-frontend && \
echo "" && \
echo "Test static file:" && \
curl -v http://localhost:3000/_next/static/css/app.css 2>&1 | head -10 && \
echo "" && \
echo "Test via Nginx:" && \
curl -I http://54.165.116.208/_next/static/css/app.css 2>&1 | head -5
```

---

**The issue is that Next.js is returning 400. Run the complete rebuild (STEP 3 or COMPLETE REBUILD) to fix it!** 🚀
