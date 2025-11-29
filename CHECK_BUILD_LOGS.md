# Check Build Logs to Diagnose Issue

## The Problem

The environment variable is still not being picked up. We need to check the actual build logs to see what's happening.

## Step 1: Check Latest Build Logs

1. Go to: https://github.com/kamal464/wissen-publication-group/actions
2. Click on the **latest workflow run**
3. Expand **"Build Frontend"** step
4. Look for these lines:
   - `Building with NEXT_PUBLIC_API_URL: ***` (should show `***` if secret exists)
   - `NEXT_PUBLIC_API_URL length: XX` (should be > 0)

## Step 2: What to Look For

### If you see:
- `Building with NEXT_PUBLIC_API_URL: ***` → Secret exists ✅
- `NEXT_PUBLIC_API_URL length: 0` → Secret is empty ❌
- `NEXT_PUBLIC_API_URL length: 50-60` → Secret has value ✅

### If you DON'T see:
- The echo lines → The workflow step didn't run
- Any mention of NEXT_PUBLIC_API_URL → The env var wasn't set

## Step 3: Verify Secret Value

Even if the secret exists, it might have the wrong value:

1. Go to: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
2. Click on `NEXT_PUBLIC_API_URL` to edit
3. **Delete the entire value**
4. **Type exactly** (or copy-paste):
   ```
   https://wissen-api-285326281784.us-central1.run.app
   ```
5. Make sure there are NO:
   - Trailing spaces
   - Leading spaces
   - Newlines
   - `/api` at the end
   - Trailing slash
6. Click "Update secret"

## Step 4: Alternative Solution

If the build-time approach isn't working, we can try setting it as a **runtime environment variable** in Cloud Run instead. This would require:

1. Setting it in Cloud Run deployment (already done)
2. Using a runtime check instead of build-time replacement

But Next.js `NEXT_PUBLIC_*` vars should work at build time, so this is a workaround.

## Step 5: Share Build Logs

If you can, share:
1. The output from "Build Frontend" step
2. Specifically the lines with `NEXT_PUBLIC_API_URL`
3. Any errors or warnings

This will help diagnose the exact issue.

## Quick Test

After updating the secret, run:

```cmd
git commit --allow-empty -m "Test after secret update"
git push
```

Then check the build logs again to see if the length is now > 0.

