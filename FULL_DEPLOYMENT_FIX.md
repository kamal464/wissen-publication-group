# 🔧 Full Deployment - Build and Start Services

## 🚀 **COMPLETE DEPLOYMENT COMMAND:**

**Copy and paste this entire block:**

```bash
cd /var/www/wissen-publication-group && \
echo "=== STEP 1: Pull Latest Code ===" && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
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
rm -rf .next node_modules/.cache && \
npm install --no-audit --no-fund --loglevel=error && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
echo "" && \
echo "=== STEP 4: Start/Restart Services ===" && \
cd .. && \
pm2 delete wissen-backend wissen-frontend 2>/dev/null || true && \
pm2 start backend/dist/src/main.js --name wissen-backend --update-env && \
cd frontend && \
pm2 start npm --name wissen-frontend -- start --update-env && \
cd .. && \
sleep 5 && \
pm2 save && \
sudo systemctl reload nginx && \
echo "" && \
echo "=== STEP 5: Verify ===" && \
pm2 list && \
sleep 3 && \
curl -s http://localhost:3001/api/health && echo "" && \
echo "✅ Deployment complete!"
```

---

## ⚡ **IF FRONTEND BUILD IS TOO SLOW:**

Use this faster version (skips some checks):

```bash
cd /var/www/wissen-publication-group/frontend && \
rm -rf .next && \
npm install --no-audit --no-fund --loglevel=error && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build 2>&1 | tee /tmp/build.log && \
tail -20 /tmp/build.log && \
cd /var/www/wissen-publication-group && \
pm2 restart wissen-frontend || (cd frontend && pm2 start npm --name wissen-frontend -- start --update-env) && \
pm2 save && \
echo "✅ Frontend deployed!"
```

---

## 🔄 **START SERVICES IF THEY'RE DOWN:**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Starting Backend ===" && \
pm2 start backend/dist/src/main.js --name wissen-backend --update-env && \
echo "" && \
echo "=== Starting Frontend ===" && \
cd frontend && \
pm2 start npm --name wissen-frontend -- start --update-env && \
cd .. && \
sleep 5 && \
pm2 save && \
sudo systemctl reload nginx && \
echo "" && \
echo "=== Verifying ===" && \
pm2 list && \
sleep 3 && \
curl -s http://localhost:3001/api/health && echo "" && \
echo "✅ Services started!"
```

---

## 🔍 **CHECK WHAT'S WRONG:**

```bash
# Check if backend is built
ls -la /var/www/wissen-publication-group/backend/dist/src/main.js && echo "✅ Backend built" || echo "❌ Backend not built"

# Check if frontend is built
ls -la /var/www/wissen-publication-group/frontend/.next && echo "✅ Frontend built" || echo "❌ Frontend not built"

# Check PM2 processes
pm2 list

# Check PM2 logs
pm2 logs --lines 20 --nostream

# Check Nginx
sudo systemctl status nginx --no-pager | head -10
```

---

## 📝 **STEP-BY-STEP (If Above Fails):**

### 1. Build Backend:
```bash
cd /var/www/wissen-publication-group/backend && \
npm install --no-audit --no-fund --loglevel=error && \
npx prisma generate && \
npm run build
```

### 2. Build Frontend:
```bash
cd /var/www/wissen-publication-group/frontend && \
npm install --no-audit --no-fund --loglevel=error && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build
```

### 3. Start Services:
```bash
cd /var/www/wissen-publication-group && \
pm2 start backend/dist/src/main.js --name wissen-backend --update-env && \
cd frontend && \
pm2 start npm --name wissen-frontend -- start --update-env && \
cd .. && \
pm2 save
```

### 4. Verify:
```bash
pm2 list
curl http://localhost:3001/api/health
```
