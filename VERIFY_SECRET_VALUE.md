# Verify GitHub Secret Value

## Critical Check

The environment variable is still not working. This means the **GitHub secret value might be incorrect**.

## Step-by-Step Verification

### Step 1: Check Secret Exists
1. Go to: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
2. Look for `NEXT_PUBLIC_API_URL` in the list
3. If it doesn't exist, **create it now**

### Step 2: Verify Secret Value
1. Click on `NEXT_PUBLIC_API_URL` (or create it)
2. **The value MUST be exactly**:
   ```
   https://wissen-api-285326281784.us-central1.run.app
   ```

**Common mistakes:**
- ❌ `https://wissen-api-285326281784.us-central1.run.app/api` (has `/api`)
- ❌ `https://wissen-api-285326281784.us-central1.run.app/` (has trailing slash)
- ❌ ` https://wissen-api-285326281784.us-central1.run.app` (has leading space)
- ❌ `https://wissen-api-285326281784.us-central1.run.app ` (has trailing space)
- ✅ `https://wissen-api-285326281784.us-central1.run.app` (CORRECT)

### Step 3: Recreate Secret (If Needed)

If you're not sure, **delete and recreate it**:

1. Delete the existing `NEXT_PUBLIC_API_URL` secret
2. Click "New repository secret"
3. Name: `NEXT_PUBLIC_API_URL`
4. Value: Copy this exactly (no spaces):
   ```
   https://wissen-api-285326281784.us-central1.run.app
   ```
5. Click "Add secret"

### Step 4: Force Rebuild

After setting/updating the secret:

```cmd
git commit --allow-empty -m "Rebuild after verifying NEXT_PUBLIC_API_URL secret"
git push
```

### Step 5: Check Build Logs

After the workflow runs, check:
1. Go to: https://github.com/kamal464/wissen-publication-group/actions
2. Click latest workflow run
3. Expand "Build Frontend"
4. Look for:
   - `Building with NEXT_PUBLIC_API_URL: ***` (should show)
   - `NEXT_PUBLIC_API_URL length: XX` (should be > 0, probably around 50-60)

If the length is 0, the secret is empty or not set.

## Why This Matters

Next.js replaces `NEXT_PUBLIC_*` variables **at build time**. If the variable is:
- Not set → becomes `undefined` → falls back to localhost
- Set incorrectly → might have wrong value → causes issues
- Set correctly → works perfectly ✅

## After Fix

Once the secret is set correctly and the build completes:
1. Hard refresh: `Ctrl+Shift+R`
2. Check console - warning should be GONE
3. Check Network tab - API calls should go to Cloud Run URL

## Summary

**The most likely issue is the GitHub secret value is wrong or has extra characters.**

Verify it's exactly: `https://wissen-api-285326281784.us-central1.run.app` (no `/api`, no trailing slash, no spaces)

