# Complete Fix Guide

## Issues Identified

### 1. Local CORS (308 Redirect)
- **Problem**: Backend is redirecting requests (308 Permanent Redirect)
- **Cause**: Express strict routing or trailing slash redirects
- **Fix Applied**: Disabled strict routing in Express

### 2. Production API URL
- **Problem**: Production frontend using `localhost:3001` instead of Cloud Run URL
- **Cause**: `NEXT_PUBLIC_API_URL` not available at runtime in Cloud Run container
- **Status**: Env var is set in Cloud Run deployment, but script tag injection needs it

## Fixes Applied

1. ✅ Disabled Express strict routing (prevents 308 redirects)
2. ✅ Fixed global prefix exclusions (health and uploads routes)
3. ✅ CORS enabled before global prefix
4. ✅ Script tag injection in layout.tsx

## Next Steps

### For Local Development:

1. **Kill old backend processes**:
   ```powershell
   taskkill /PID 189136 /F
   taskkill /PID 15684 /F
   ```

2. **Restart backend**:
   ```powershell
   cd C:\Users\kolli\universal-publishers\backend
   npm run start:dev
   ```

3. **Verify backend logs show**:
   ```
   🌐 CORS enabled for origins: http://localhost:3000, http://localhost:3002
   ✅ Wissen Publication Group API running on http://0.0.0.0:3001/api
   ```

4. **Test in browser**:
   - Open `http://localhost:3000/journals`
   - Should see: `✅ Using runtime-injected API URL: http://localhost:3001/api`
   - Network tab: `GET http://localhost:3001/api/journals` → 200 OK (not 308)

### For Production:

The next deployment will:
1. Set `NEXT_PUBLIC_API_URL` in Cloud Run container
2. Script tag will inject it into HTML
3. Frontend will use Cloud Run backend URL

**Wait for the next GitHub Actions deployment to complete**, then test production.

## Expected Results

### Local:
- ✅ No 308 redirects
- ✅ No CORS errors
- ✅ API calls succeed

### Production (after next deploy):
- ✅ Frontend uses Cloud Run backend URL
- ✅ No localhost fallback
- ✅ API calls work correctly

