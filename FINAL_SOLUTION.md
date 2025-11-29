# Final Solution for API URL Injection

## Problem Summary

1. **Local**: Script tag works but backend needs restart for CORS fix
2. **Production**: Script tag not executing before client code, causing `window.__API_BASE_URL__` to be undefined

## Solution Applied

### Changed from `<script>` tag to Next.js `Script` component

**Before:**
```tsx
<script dangerouslySetInnerHTML={{...}} />
```

**After:**
```tsx
<Script
  id="api-url-injector"
  strategy="beforeInteractive"
  dangerouslySetInnerHTML={{...}}
/>
```

### Why This Works

1. **`beforeInteractive` strategy**: Ensures script executes before React hydrates
2. **Next.js optimization**: Script is injected into initial HTML and executes synchronously
3. **Works in both dev and production**: Next.js handles the injection correctly

## Next Steps

### For Local Development:

1. **Restart backend** (if not already done):
   ```powershell
   cd backend
   npm run start:dev
   ```

2. **Restart frontend**:
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Test**: Open `http://localhost:3000/journals`
   - Should see: `✅ API URL injected successfully: http://localhost:3001/api`
   - Should see: `✅ Using runtime-injected API URL: http://localhost:3001/api`
   - No CORS errors
   - No 308 redirects

### For Production:

The next GitHub Actions deployment will:
1. Build with the new `Script` component
2. Inject API URL using `beforeInteractive` strategy
3. Ensure `window.__API_BASE_URL__` is available before client code runs
4. Frontend will use Cloud Run backend URL correctly

## Expected Results

### Local:
- ✅ Script executes before React
- ✅ `window.__API_BASE_URL__` available immediately
- ✅ No CORS errors
- ✅ No 308 redirects

### Production (after next deploy):
- ✅ Script executes before React
- ✅ `window.__API_BASE_URL__` available immediately
- ✅ Uses Cloud Run backend URL (not localhost)
- ✅ No CORS errors

## Technical Details

- `beforeInteractive`: Scripts are injected into the initial HTML and executed before the page becomes interactive
- This ensures `window.__API_BASE_URL__` is set before any client-side code tries to access it
- Works with both SSR and static builds
- Compatible with Next.js 15 App Router

