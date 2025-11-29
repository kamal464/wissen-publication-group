# Final Fix for Environment Variable Issue

## The Problem

The `NEXT_PUBLIC_API_URL` environment variable is not being picked up by Next.js during the build, even though:
- ✅ The GitHub secret exists (shown as `***` in logs)
- ✅ The workflow is setting it correctly
- ✅ The build is running

## Root Cause

Next.js with Turbopack might need the environment variable to be set **inline** in the build command, not just in the `env:` section.

## What I Changed

1. **Removed explicit `env` declaration** from `next.config.ts` - Next.js automatically handles `NEXT_PUBLIC_*` variables, and explicitly declaring them can cause issues
2. **Added inline env var** in the build command - `NEXT_PUBLIC_API_URL="${{ secrets.NEXT_PUBLIC_API_URL }}" npm run build`
3. **Added debug logging** to show the value length (to verify it's not empty)

## Verify GitHub Secret

**CRITICAL**: Make sure your GitHub secret is set correctly:

1. Go to: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
2. Click on `NEXT_PUBLIC_API_URL` (or create it if it doesn't exist)
3. **Value must be exactly**: `https://wissen-api-285326281784.us-central1.run.app`
   - ❌ NOT: `https://wissen-api-285326281784.us-central1.run.app/api`
   - ❌ NOT: `https://wissen-api-285326281784.us-central1.run.app/`
   - ❌ NOT: ` https://wissen-api-285326281784.us-central1.run.app` (no leading space)
   - ✅ YES: `https://wissen-api-285326281784.us-central1.run.app`

## After Next Build

1. **Check build logs** - Look for:
   - `Building with NEXT_PUBLIC_API_URL: ***` (should show)
   - `NEXT_PUBLIC_API_URL value length: XX` (should be > 0)

2. **After deployment**:
   - Hard refresh: `Ctrl+Shift+R`
   - Check console - warning should be GONE
   - Check Network tab - API calls should go to Cloud Run URL

## If Still Not Working

If the warning persists after the next build:

1. **Delete and recreate the secret**:
   - Delete `NEXT_PUBLIC_API_URL` from GitHub Secrets
   - Create it again with the exact value
   - Rebuild

2. **Check for hidden characters**:
   - Copy the URL directly: `https://wissen-api-285326281784.us-central1.run.app`
   - Paste it into the secret (don't type it)
   - Make sure there are no extra spaces

3. **Verify in build output**:
   - The build log should show the value length > 0
   - If it shows 0, the secret is empty

## Summary

The fix is in place. The next build should work. The key changes:
- Removed explicit env declaration (can cause conflicts)
- Added inline env var in build command (ensures it's available)
- Added debug logging (to verify it's set)

Wait for the next deployment and test again!

