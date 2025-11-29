# Local Testing Results

## Changes Made

1. **Created `InjectApiUrl` client component** (`frontend/src/components/InjectApiUrl.tsx`):
   - Uses `useEffect` to inject `window.__API_BASE_URL__` at runtime
   - Works in both local dev and production (Cloud Run)
   - Reads from `process.env.NEXT_PUBLIC_API_URL`

2. **Updated `layout.tsx`**:
   - Removed `<head>` script tag (not supported in App Router)
   - Added `<InjectApiUrl />` component instead

## How to Test

### 1. Start Backend
```powershell
cd backend
npm run start:dev
```
Wait for: `🚀 Starting Wissen Publication Group API...`

### 2. Start Frontend
```powershell
cd frontend
npm run dev
```
Wait for: `✓ Ready in X.Xs`

### 3. Open Browser
1. Navigate to: `http://localhost:3000`
2. Open Developer Tools (F12)
3. Check Console tab

### Expected Console Output

**If working correctly:**
```
✅ Injected API URL: http://localhost:3001/api
✅ Using runtime-injected API URL: http://localhost:3001/api
```

**If env var not set:**
```
⚠️ NEXT_PUBLIC_API_URL not available for injection
⚠️ NEXT_PUBLIC_API_URL not set, using localhost fallback
```

### 4. Test API Calls

1. Navigate to: `http://localhost:3000/journals`
2. Check Network tab in DevTools
3. Look for requests to: `http://localhost:3001/api/journals`
4. Should see successful responses (200 OK)

## Verification Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] Console shows: `✅ Injected API URL: http://localhost:3001/api`
- [ ] Console shows: `✅ Using runtime-injected API URL: http://localhost:3001/api`
- [ ] Network tab shows API calls to `http://localhost:3001/api/...`
- [ ] No CORS errors
- [ ] Journals page loads correctly

## Troubleshooting

### Backend not starting:
- Check if port 3001 is already in use
- Check database connection in `.env`
- Check backend logs for errors

### Frontend not starting:
- Check if port 3000 is already in use
- Check `.env.local` exists with `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- Clear `.next` folder and restart

### API URL not injected:
- Verify `.env.local` has correct value
- Check console for injection message
- Restart frontend dev server

### CORS errors:
- Check backend CORS configuration
- Verify backend is running
- Check backend logs for CORS errors

