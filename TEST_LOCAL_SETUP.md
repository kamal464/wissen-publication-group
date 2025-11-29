# Local Testing Guide

## Current Setup

1. **Backend**: Running on `http://localhost:3001`
2. **Frontend**: Running on `http://localhost:3000`
3. **Environment Variable**: `NEXT_PUBLIC_API_URL=http://localhost:3001/api` (in `.env.local`)

## How It Works

### Runtime Injection Approach

Since `NEXT_PUBLIC_*` variables aren't being replaced at build time with standalone output, we're using a **runtime injection** approach:

1. **Server-side** (`layout.tsx`):
   - Reads `process.env.NEXT_PUBLIC_API_URL` (available at runtime in Cloud Run)
   - Injects it into the HTML via a `<script>` tag: `window.__API_BASE_URL__ = "...";`

2. **Client-side** (`apiConfig.ts`):
   - First checks for `window.__API_BASE_URL__` (runtime-injected value)
   - Falls back to `process.env.NEXT_PUBLIC_API_URL` (build-time replacement)
   - Falls back to `localhost:3001/api` (development fallback)

## Testing Steps

### 1. Check Backend
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/health"
```

### 2. Check Frontend
```powershell
Invoke-WebRequest -Uri "http://localhost:3000"
```

### 3. Check Browser Console
1. Open `http://localhost:3000` in browser
2. Open Developer Tools (F12)
3. Check Console for:
   - `✅ Using runtime-injected API URL: http://localhost:3001/api` (if script tag works)
   - OR `✅ Using API URL: http://localhost:3001/api` (if env var works)
   - OR `⚠️ NEXT_PUBLIC_API_URL not set, using localhost fallback` (if neither works)

### 4. Check Network Tab
- Open Network tab in DevTools
- Look for API calls
- They should go to `http://localhost:3001/api/...` (not `http://localhost:3001/api/api/...`)

## Expected Behavior

### Local Development
- ✅ Script tag should inject `window.__API_BASE_URL__ = "http://localhost:3001/api";`
- ✅ Console should show: `✅ Using runtime-injected API URL: http://localhost:3001/api`
- ✅ API calls should work correctly

### Production (Cloud Run)
- ✅ Cloud Run sets `NEXT_PUBLIC_API_URL` environment variable
- ✅ Server-side layout reads it and injects via script tag
- ✅ Client-side code reads from `window.__API_BASE_URL__`
- ✅ API calls go to the correct Cloud Run backend URL

## Troubleshooting

### If script tag is not found:
- Check that `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- Restart the frontend dev server
- Clear browser cache

### If API calls fail:
- Check backend is running on port 3001
- Check CORS settings in backend
- Check browser console for errors

### If URL is duplicated (`/api/api`):
- Check that `NEXT_PUBLIC_API_URL` doesn't already include `/api`
- Should be: `http://localhost:3001/api` (with `/api`)
- NOT: `http://localhost:3001` (without `/api`)

