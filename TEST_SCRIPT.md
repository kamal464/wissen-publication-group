# Testing Instructions

## Current Status
✅ Script tag injection is working (verified in HTML)
✅ API URL value is correct: `http://localhost:3001/api`

## Manual Testing Steps

1. **Open Browser**: Navigate to `http://localhost:3000`
2. **Open DevTools** (F12)
3. **Check Console** - You should see:
   - `✅ API URL injected successfully: http://localhost:3001/api`
   - `✅ Using runtime-injected API URL: http://localhost:3001/api`

4. **Navigate to Journals**: `http://localhost:3000/journals`
5. **Check Network Tab** - API calls should go to:
   - `http://localhost:3001/api/journals` ✅
   - NOT `http://localhost:3001/api/api/journals` ❌

## If You Still See Warnings

The script tag executes synchronously, so `window.__API_BASE_URL__` should be available immediately. If you still see warnings:

1. **Hard refresh**: `Ctrl+Shift+R` or `Cmd+Shift+R`
2. **Clear browser cache**
3. **Check that backend is running**: `http://localhost:3001/api/health`
4. **Verify .env.local**: Should contain `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

## Expected Console Output

```
✅ API URL injected successfully: http://localhost:3001/api
✅ Using runtime-injected API URL: http://localhost:3001/api
```

## Expected Network Requests

- `GET http://localhost:3001/api/journals` → 200 OK
- `GET http://localhost:3001/api/admin/journal-shortcodes` → 200 OK (if logged in)
- `GET http://localhost:3001/api/admin/users` → 200 OK (if logged in)

No CORS errors, no localhost fallback warnings.

