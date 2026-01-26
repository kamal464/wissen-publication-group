# 🚀 Deploy and Test All APIs

## **STEP 1: Resolve Build Artifact Conflict**

The `tsconfig.build.tsbuildinfo` file is a build artifact that shouldn't be tracked. Remove it:

```bash
cd /var/www/wissen-publication-group && \
echo "=== Removing build artifacts ===" && \
rm -f backend/dist/tsconfig.build.tsbuildinfo && \
echo "✅ Build artifacts removed"
```

---

## **STEP 2: Pull Latest Changes**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Pulling latest changes ===" && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
echo "✅ Latest changes pulled"
```

---

## **STEP 3: Rebuild Backend**

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== Rebuilding backend ===" && \
npm install --no-audit --no-fund --loglevel=error && \
npm run build && \
echo "✅ Backend rebuilt"
```

---

## **STEP 4: Restart Backend**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Restarting backend ===" && \
pm2 restart wissen-backend && \
sleep 5 && \
echo "✅ Backend restarted"
```

---

## **STEP 5: Run API Tests**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Running API tests ===" && \
chmod +x test-apis.sh && \
bash test-apis.sh
```

---

## **COMPLETE DEPLOYMENT COMMAND**

Run this all at once:

```bash
cd /var/www/wissen-publication-group && \
echo "=== STEP 1: Remove build artifacts ===" && \
rm -f backend/dist/tsconfig.build.tsbuildinfo && \
echo "" && \
echo "=== STEP 2: Pull latest changes ===" && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
echo "" && \
echo "=== STEP 3: Rebuild backend ===" && \
cd backend && \
npm install --no-audit --no-fund --loglevel=error && \
npm run build && \
cd .. && \
echo "" && \
echo "=== STEP 4: Restart backend ===" && \
pm2 restart wissen-backend && \
sleep 5 && \
echo "" && \
echo "=== STEP 5: Run API tests ===" && \
chmod +x test-apis.sh && \
bash test-apis.sh && \
echo "" && \
echo "✅ Deployment and testing complete!"
```

---

## **IF BUILD ARTIFACTS KEEP CAUSING ISSUES**

Add to `.gitignore` (if not already there):

```bash
echo "backend/dist/tsconfig.build.tsbuildinfo" >> .gitignore && \
git add .gitignore && \
git commit -m "Ignore build artifacts" && \
git push origin main
```

---

## **QUICK CHECK AFTER DEPLOYMENT**

```bash
echo "=== Quick Health Check ===" && \
pm2 list && \
echo "" && \
curl -s http://localhost:3001/health && echo "" && \
echo "✅ Services are running!"
```
