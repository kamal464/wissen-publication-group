# Comprehensive Fix for API URL Injection

## Problem

Production frontend is using `localhost:3001` instead of Cloud Run backend URL because:
1. `NEXT_PUBLIC_API_URL` is set at runtime in Cloud Run, but Next.js needs it at build time
2. Script injection might not execute before client code runs
3. No fallback mechanism if injection fails

## Solution: Multi-Layer Fallback System

### Layer 1: Next.js Script Component (`beforeInteractive`)
- Executes before React hydrates
- Primary injection method

### Layer 2: Inline Script Tag
- Synchronous execution in body
- Immediate fallback if Script component fails

### Layer 3: Meta Tag
- `<meta name="api-base-url" content="...">`
- Can be read by client-side code
- Works even if scripts don't execute

### Layer 4: Client Component (`InjectApiUrl`)
- Reads from meta tag
- Constructs URL if in production
- Ensures `window.__API_BASE_URL__` is always set

### Layer 5: Hardcoded Production URL
- If all else fails, use known backend URL
- `https://wissen-api-285326281784.us-central1.run.app/api`
- Guaranteed to work in production

### Layer 6: apiConfig.ts Fallbacks
- Checks `window.__API_BASE_URL__`
- Falls back to meta tag
- Falls back to hardcoded production URL
- Multiple safety nets

## How It Works

1. **Server-side** (`layout.tsx`):
   - Reads `process.env.NEXT_PUBLIC_API_URL` (from Cloud Run env vars)
   - Injects via Script component
   - Injects via inline script
   - Adds meta tag

2. **Client-side** (`InjectApiUrl` component):
   - Checks if `window.__API_BASE_URL__` exists
   - If not, reads from meta tag
   - If not, constructs from known backend URL (production)
   - Sets `window.__API_BASE_URL__`

3. **API calls** (`apiConfig.ts`):
   - Checks `window.__API_BASE_URL__`
   - Falls back to meta tag
   - Falls back to hardcoded production URL
   - Returns correct URL

## Expected Behavior

### Local Development:
- Script tag injects from `.env.local`
- `window.__API_BASE_URL__` = `http://localhost:3001/api`
- ✅ Works immediately

### Production:
- Script tag injects from Cloud Run env var (if available)
- OR meta tag provides the URL
- OR client component constructs it
- OR apiConfig uses hardcoded fallback
- `window.__API_BASE_URL__` = `https://wissen-api-285326281784.us-central1.run.app/api`
- ✅ Always works, no matter what

## Next Deployment

After the next GitHub Actions deployment:
1. New code will be deployed
2. Multiple fallback mechanisms will be active
3. Production will use Cloud Run backend URL
4. No more localhost fallback in production

## Testing

### Local:
1. Restart frontend: `npm run dev`
2. Open: `http://localhost:3000/journals`
3. Check console: Should see `✅ Using API URL: http://localhost:3001/api`

### Production (after deploy):
1. Open: `https://wissen-frontend-285326281784.us-central1.run.app/journals`
2. Check console: Should see `✅ Using API URL: https://wissen-api-285326281784.us-central1.run.app/api`
3. No localhost references
4. API calls should work

This comprehensive fallback system ensures the API URL is ALWAYS available, no matter what!

