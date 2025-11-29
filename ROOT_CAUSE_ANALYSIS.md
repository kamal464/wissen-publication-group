# Root Cause Analysis

## The Core Problem

**Production frontend is using `localhost:3001` instead of Cloud Run backend URL**

## Why This Happens

1. **Next.js `NEXT_PUBLIC_*` variables are replaced at BUILD time**
   - They're baked into the JavaScript bundle during `npm run build`
   - If the env var isn't available during build, it becomes `undefined` in the bundle

2. **Cloud Run sets env vars at RUNTIME**
   - `--update-env-vars` sets the env var when the container starts
   - But the JavaScript bundle was already built WITHOUT the env var
   - So `process.env.NEXT_PUBLIC_API_URL` is `undefined` in the bundle

3. **Script injection timing**
   - Even if we inject via script tag, it might execute after client code runs
   - `beforeInteractive` should work, but there might be edge cases

## Solution Applied

### Multi-Layer Fallback System

1. **Next.js Script component** (`beforeInteractive`)
   - Primary injection method
   - Executes before React hydrates

2. **Inline script tag** (immediate fallback)
   - Executes synchronously in body
   - Sets `window.__API_BASE_URL__` immediately

3. **Meta tag** (client-side readable)
   - `<meta name="api-base-url" content="...">`
   - Can be read by client-side code as fallback

4. **Client-side fallback** (`InjectApiUrl` component)
   - Reads from meta tag if script didn't execute
   - Constructs URL from known backend URL if in production
   - Ensures `window.__API_BASE_URL__` is always set

5. **Production URL hardcoded fallback**
   - If all else fails, use known Cloud Run backend URL
   - `https://wissen-api-285326281784.us-central1.run.app`

## Why This Will Work

- **Multiple injection points**: If one fails, others will catch it
- **Client-side fallback**: Even if server-side injection fails, client code can fix it
- **Known production URL**: Hardcoded fallback ensures it always works in production

## Next Steps

1. **Wait for next deployment** - The new code will be deployed
2. **Test production** - Should now use Cloud Run backend URL
3. **Verify** - Check browser console for `✅ API URL injected`

## Long-Term Fix

For future deployments, we should:
1. Set `NEXT_PUBLIC_API_URL` in GitHub Actions BUILD step (not just runtime)
2. This way it's baked into the bundle at build time
3. But runtime injection still works as fallback

