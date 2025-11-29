# Fix Localhost URL Issue

## The Problem

The frontend is still using `localhost:3001` URLs even though `NEXT_PUBLIC_API_URL` is set. This happens because:

1. **Next.js bakes environment variables at build time** - If the build happened before the secret was updated, it will still use the old value (or default to localhost)
2. **Browser cache** - The browser might be caching the old JavaScript bundle
3. **Environment variable not available** - The variable might not be set correctly during build

## Solution

### Step 1: Verify GitHub Secret

1. Go to: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
2. Check `NEXT_PUBLIC_API_URL`
3. It should be: `https://wissen-api-285326281784.us-central1.run.app`
   - **WITHOUT** `/api` at the end
   - **WITHOUT** trailing slash

### Step 2: Rebuild Frontend

Since Next.js bakes env vars at build time, you need to rebuild:

**Option A: Re-run the workflow**
1. Go to: https://github.com/kamal464/wissen-publication-group/actions
2. Find the latest workflow run
3. Click "Re-run jobs" → "Re-run all jobs"

**Option B: Push a new commit**
```cmd
git commit --allow-empty -m "Rebuild frontend with correct API URL"
git push
```

### Step 3: Clear Browser Cache

After the new deployment:
1. Open your frontend URL
2. Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) to hard refresh
3. Or open DevTools → Application → Clear Storage → Clear site data

### Step 4: Verify in Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Type: `process.env.NEXT_PUBLIC_API_URL`
4. You should see: `https://wissen-api-285326281784.us-central1.run.app`

If you see `undefined`, the environment variable wasn't set during build.

## Debug: Check Build Logs

In GitHub Actions, look for:
- "Building with NEXT_PUBLIC_API_URL: ..." in the build logs
- This will show what value was used during build

## About the 404 Error

The 404 for `/events/global-perspectives-webinar/` is a separate issue:
- This route doesn't exist in your Next.js app
- You need to create a page at `frontend/src/app/events/[slug]/page.tsx` if you want this route
- Or it's a link that should point to a different page

## Quick Fix Command

To force a rebuild right now:
```cmd
git commit --allow-empty -m "Force rebuild - fix API URL"
git push
```

Then wait for the deployment to complete and hard refresh your browser.

