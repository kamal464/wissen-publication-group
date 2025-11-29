# Immediate Fix for Localhost Issue

## The Problem

You're still seeing `localhost:3001` because **Next.js bakes environment variables into the JavaScript bundle at build time**. If the build happened before you updated the GitHub secret, it will still use the old value (or default to localhost).

## Quick Fix (Do This Now)

### Step 1: Verify GitHub Secret

1. Go to: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
2. Check `NEXT_PUBLIC_API_URL`
3. It should be exactly: `https://wissen-api-285326281784.us-central1.run.app`
   - No `/api` at the end
   - No trailing slash

### Step 2: Force a Rebuild

The frontend needs to be rebuilt with the correct environment variable. Run this command:

```cmd
git commit --allow-empty -m "Rebuild frontend with correct API URL"
git push
```

This will trigger a new build that uses the updated `NEXT_PUBLIC_API_URL` secret.

### Step 3: Wait for Deployment

1. Go to: https://github.com/kamal464/wissen-publication-group/actions
2. Wait for the "Deploy Frontend to Cloud Run" job to complete
3. This usually takes 5-10 minutes

### Step 4: Clear Browser Cache

After deployment completes:
1. Open: https://wissen-frontend-285326281784.us-central1.run.app
2. Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) to hard refresh
3. Or open DevTools → Application → Clear Storage → Clear site data

### Step 5: Verify It's Fixed

1. Open DevTools (F12)
2. Go to Console tab
3. Type: `process.env.NEXT_PUBLIC_API_URL`
4. You should see: `https://wissen-api-285326281784.us-central1.run.app`

If you still see `undefined`, the environment variable wasn't set during build. Check the GitHub Actions build logs.

## Why This Happens

Next.js replaces `process.env.NEXT_PUBLIC_*` variables with their actual values **during the build process**. This means:

- ✅ If `NEXT_PUBLIC_API_URL` is set during build → It gets baked into the code
- ❌ If `NEXT_PUBLIC_API_URL` is not set during build → It becomes `undefined` and falls back to localhost

The workflow sets the env var during build (line 57 of the workflow), so as long as the secret is set correctly, the rebuild will fix it.

## Check Build Logs

After the rebuild, check the GitHub Actions logs:
1. Go to the latest workflow run
2. Expand "Build Frontend"
3. Look for: "Building with NEXT_PUBLIC_API_URL: https://..."
4. This confirms the variable was used during build

## Summary

**The fix is simple: Rebuild the frontend with the correct environment variable set.**

Run the command above and wait for the deployment. The localhost issue will be resolved! 🚀

