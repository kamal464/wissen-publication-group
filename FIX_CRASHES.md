# 🔧 Fix Process Crashes - Body-Parser & Connection Errors

## ✅ **FIXES APPLIED**

### **1. Backend Body-Parser Error Fix**

**Problem:** Body-parser crashes on malformed/large requests

**Fix Applied:**
- Added explicit body-parser limits (10MB)
- Added error handler for body-parser errors
- Added proper error responses for large requests

**File:** `backend/src/main.ts`

---

### **2. Frontend Connection Error Fix**

**Problem:** `syscall: 'read'` errors causing frontend crashes

**Fix Applied:**
- Added 30-second timeout to prevent hanging requests
- Added max content/body size limits
- Added proper error handling for network errors
- Added specific handlers for connection/read errors

**Files:** 
- `frontend/src/lib/api.ts`
- `frontend/src/services/api.ts`

---

### **3. Deployment Command Fix**

**Problem:** Using `pm2 delete all` loses process state and doesn't always restart

**Fix Applied:**
- Changed to use `pm2 restart all` first (preserves state)
- Only falls back to delete/start if restart fails
- This prevents losing process configuration

**File:** `DEPLOY_NOW.md`

---

## 🚀 **DEPLOY THE FIXES**

Run this to deploy the fixes:

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
npm install --no-audit --no-fund --loglevel=error && \
npm run build && \
echo "" && \
echo "=== STEP 4: Restart Services (Using RESTART, not DELETE) ===" && \
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
echo "✅ Deployment complete! Crashes should be fixed."
```

---

## 📋 **WHAT WAS FIXED**

### **Backend Body-Parser Errors:**
- ✅ Added 10MB request body limit
- ✅ Added error handler for malformed requests
- ✅ Added proper error responses (400/413)
- ✅ Prevents crashes from large/malformed requests

### **Frontend Connection Errors:**
- ✅ Added 30-second timeout
- ✅ Added max content/body size limits
- ✅ Added error handlers for:
  - Timeout errors
  - Connection refused errors
  - Network errors
  - Read/syscall errors
- ✅ Better error messages for users

### **Deployment Process:**
- ✅ Changed from `pm2 delete all` to `pm2 restart all`
- ✅ Preserves process state and configuration
- ✅ Only deletes if restart fails
- ✅ Prevents accidental service loss

---

## 🔍 **VERIFY FIXES WORK**

After deployment, test:

```bash
# 1. Check PM2 status (should show online, not errored)
pm2 list

# 2. Check restart count (should be low/zero)
pm2 list | grep wissen

# 3. Test backend with large request (should return 413, not crash)
curl -X POST http://localhost:3001/api/test \
  -H "Content-Type: application/json" \
  -d "$(python3 -c "print('x' * 11 * 1024 * 1024)")" || echo "Expected 413 error"

# 4. Monitor logs for errors
pm2 logs wissen-backend --lines 20 --nostream | grep -i error || echo "No errors"
pm2 logs wissen-frontend --lines 20 --nostream | grep -i error || echo "No errors"
```

---

## 📊 **EXPECTED RESULTS**

After fixes:
- ✅ No more body-parser crashes
- ✅ No more `syscall: 'read'` errors
- ✅ Better error handling for network issues
- ✅ Services restart properly (not delete)
- ✅ Lower restart counts in PM2

---

## 🎯 **PREVENT FUTURE CRASHES**

1. **Always use `pm2 restart` instead of `pm2 delete`**
2. **Monitor PM2 restart counts** - High numbers = still crashing
3. **Check error logs regularly**: `pm2 logs wissen-backend --err --lines 50`
4. **Set up health monitoring** (see ROOT_CAUSE_FOUND.md)
