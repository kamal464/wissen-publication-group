# Deployment Verification Guide

## What Was Fixed

### 1. **Aggressive Cache Clearing**
- Clears `.next` directory (Next.js build cache)
- Clears `node_modules/.cache` (npm cache)
- Clears `.swc` directory (SWC compiler cache)
- Ensures fresh builds every time

### 2. **PM2 Process Verification**
- Verifies `ecosystem.config.js` exists before starting
- Checks that both `wissen-backend` and `wissen-frontend` processes start
- Shows PM2 logs if processes fail to start
- Verifies PM2 working directories are correct

### 3. **Build Timestamp Verification**
- Checks backend build file timestamp (`dist/main.js`)
- Checks frontend build file timestamp (`.next/BUILD_ID`)
- Warns if builds are older than 5 minutes (stale)
- Confirms builds are fresh

### 4. **Enhanced Health Checks**
- Tests backend `/api/health` endpoint
- Tests frontend root endpoint
- Shows HTTP status codes
- Provides clear success/failure messages

### 5. **Visible Change for Testing**
- Re-enabled "Contact Us" menu item in Header
- This will be visible in the navigation menu
- Easy way to verify deployment worked

---

## What to Check in GitHub Actions Logs

After deployment, check the logs for these indicators:

### ✅ Success Indicators

1. **Code Pull**
   ```
   📌 NEW COMMIT: [hash]
   📌 COMMIT MESSAGE: [message]
   ```

2. **Build Verification**
   ```
   ✅ Backend built successfully
   📦 Build file size: [size]
   ✅ Frontend built successfully
   📦 Build directory size: [size]
   ```

3. **Build Freshness**
   ```
   ✅ Backend build is fresh (X seconds old)
   ✅ Frontend build is fresh (X seconds old)
   ```

4. **PM2 Status**
   ```
   ✅ Both processes found in PM2
   📊 PM2 Status AFTER restart:
   [shows running processes]
   ```

5. **Health Checks**
   ```
   ✅ Backend is responding (HTTP 200)
   ✅ Frontend is responding (HTTP 200)
   ```

6. **Final Verification**
   ```
   ✅ Backend health check passed (HTTP 200)
   ✅ Frontend is accessible (HTTP 200)
   ```

### ❌ Failure Indicators

1. **Stale Builds**
   ```
   ⚠️  WARNING: Backend build is X seconds old (may be stale)
   ⚠️  WARNING: Frontend build is X seconds old (may be stale)
   ```

2. **PM2 Issues**
   ```
   ❌ ERROR: wissen-backend not found in PM2!
   ❌ ERROR: wissen-frontend not found in PM2!
   ```

3. **Health Check Failures**
   ```
   ❌ Backend not responding (HTTP 000)
   ❌ Frontend not responding (HTTP 000)
   ```

---

## How to Verify Deployment Worked

### 1. **Check GitHub Actions**
- Go to: https://github.com/kamal464/wissen-publication-group/actions
- Click on the latest workflow run
- Look for all ✅ success indicators above

### 2. **Check Production Site**
- Visit: http://54.165.116.208/
- Look for "Contact Us" in the navigation menu (this was re-enabled)
- If you see "Contact Us", deployment worked!

### 3. **Check Deployment Status Badge**
- Look for the green deployment badge in the bottom-right corner
- Should show deployment timestamp

### 4. **Check Browser Console**
- Open browser DevTools (F12)
- Check for any errors
- Verify API calls are working

---

## If Deployment Still Doesn't Work

### Check PM2 Logs on EC2
```bash
# SSH into EC2
ssh ubuntu@54.165.116.208

# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs --lines 50

# Check if processes are using correct directory
pm2 describe wissen-backend
pm2 describe wissen-frontend
```

### Check Build Files
```bash
# Check backend build
ls -lh /var/www/wissen-publication-group/backend/dist/

# Check frontend build
ls -lh /var/www/wissen-publication-group/frontend/.next/

# Check build timestamps
stat /var/www/wissen-publication-group/backend/dist/main.js
stat /var/www/wissen-publication-group/frontend/.next/BUILD_ID
```

### Force Rebuild
```bash
cd /var/www/wissen-publication-group

# Stop PM2
pm2 delete all

# Clear caches
cd backend && rm -rf dist node_modules/.cache
cd ../frontend && rm -rf .next node_modules/.cache .swc

# Rebuild
cd ../backend && npm run build
cd ../frontend && npm run build

# Restart PM2
cd .. && pm2 start ecosystem.config.js
pm2 save
```

---

## Next Steps

1. **Monitor the next deployment** - Watch the GitHub Actions logs
2. **Check for "Contact Us" menu item** - This confirms deployment worked
3. **Review all verification steps** - Make sure all ✅ indicators appear
4. **If issues persist** - Check PM2 logs and build timestamps on EC2

---

## Summary

The deployment workflow now:
- ✅ Clears all caches aggressively
- ✅ Verifies builds are fresh
- ✅ Checks PM2 processes start correctly
- ✅ Tests health endpoints
- ✅ Provides detailed logging
- ✅ Includes a visible change (Contact Us menu) for verification

This should ensure changes are properly deployed and visible in production.

