# Check GitHub Secret and Rebuild

## The Problem

The warning `⚠️ NEXT_PUBLIC_API_URL not set, using localhost fallback` means the environment variable wasn't available during the build.

## Step 1: Verify GitHub Secret

1. Go to: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
2. Find `NEXT_PUBLIC_API_URL`
3. **Check if it exists and is set to**: `https://wissen-api-285326281784.us-central1.run.app`
   - No `/api` at the end
   - No trailing slash
   - Must be exactly: `https://wissen-api-285326281784.us-central1.run.app`

## Step 2: If Secret Doesn't Exist or is Wrong

1. Click "New repository secret" (or edit the existing one)
2. Name: `NEXT_PUBLIC_API_URL`
3. Value: `https://wissen-api-285326281784.us-central1.run.app`
4. Click "Add secret" (or "Update secret")

## Step 3: Force Rebuild

After setting/updating the secret, force a rebuild:

```cmd
git commit --allow-empty -m "Rebuild with NEXT_PUBLIC_API_URL"
git push
```

## Step 4: Check Build Logs

After the workflow runs:
1. Go to: https://github.com/kamal464/wissen-publication-group/actions
2. Click on the latest workflow run
3. Expand "Build Frontend"
4. Look for: "Building with NEXT_PUBLIC_API_URL: https://..."
5. If you see this, the variable was used during build ✅
6. If you don't see it or see "undefined", the secret isn't set correctly ❌

## Step 5: After Deployment

1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check console: Should NOT see the warning anymore
3. Check Network tab: API calls should go to Cloud Run URL, not localhost

## Why This Happens

Next.js replaces `process.env.NEXT_PUBLIC_*` variables **at build time**, not runtime. So:
- ✅ Secret set + Build happens = Variable baked into code
- ❌ Secret not set + Build happens = Variable is `undefined`, falls back to localhost

The workflow sets the env var during build (line 57), so as long as the secret exists, it will work.

