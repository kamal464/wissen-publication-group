# Debug Environment Variable Issue

## Current Status

The build log shows `Building with NEXT_PUBLIC_API_URL: ***`, which means:
- ✅ The GitHub secret exists
- ✅ The secret has a value (GitHub only masks non-empty secrets)
- ✅ The workflow is reading the secret correctly

## The Problem

Even though the secret is set, the frontend is still showing the warning that `NEXT_PUBLIC_API_URL` is not set. This suggests:

1. **Next.js might not be replacing the variable correctly** - Next.js replaces `NEXT_PUBLIC_*` vars at build time, but there might be an issue with how it's being done
2. **Build cache issue** - The build might be using cached output
3. **Turbopack issue** - Next.js 15.5.4 with Turbopack might handle env vars differently

## What I Changed

1. **Added explicit env var in next.config.ts** - This ensures Next.js knows about the variable
2. **Fixed warning location** - Moved the warning to only show when the variable is actually missing

## Next Steps

### Step 1: Wait for New Build

The latest push will trigger a new build. Wait for it to complete (5-10 minutes).

### Step 2: Check Build Output

After the build completes, check the build logs:
1. Go to: https://github.com/kamal464/wissen-publication-group/actions
2. Click the latest workflow run
3. Expand "Build Frontend"
4. Look for any errors or warnings about environment variables

### Step 3: Verify in Browser

After deployment:
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Open DevTools (F12) → Console
3. Type: `process.env.NEXT_PUBLIC_API_URL`
4. You should see: `https://wissen-api-285326281784.us-central1.run.app`

### Step 4: If Still Not Working

If the warning persists, we might need to:
1. Clear Next.js build cache
2. Check if Turbopack has specific env var requirements
3. Verify the secret value is exactly correct (no extra spaces, correct URL)

## Alternative: Check Secret Value

To verify the secret value is correct:
1. Go to: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
2. Click on `NEXT_PUBLIC_API_URL` (you can't see the value, but you can update it)
3. Make sure it's exactly: `https://wissen-api-285326281784.us-central1.run.app`
   - No `/api` at the end
   - No trailing slash
   - No extra spaces

## Why This Might Happen

Next.js with Turbopack might require:
- Explicit env var declaration in `next.config.ts` (which I just added)
- No build cache (the workflow doesn't cache, so this should be fine)
- The variable to be available during the entire build process

The changes I made should fix this. Wait for the new build to complete and test again.

