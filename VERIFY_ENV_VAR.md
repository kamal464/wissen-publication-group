# Verify Environment Variable is Set Correctly

## The Issue

Next.js bakes `NEXT_PUBLIC_*` environment variables into the build at **build time**, not runtime. This means:

1. The environment variable must be available **during the build step**
2. If you update the secret after a build, you need to **rebuild** the frontend
3. The variable is embedded in the JavaScript bundle, so it can't be changed without rebuilding

## Check Your GitHub Secret

1. Go to: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
2. Find `NEXT_PUBLIC_API_URL`
3. Verify it's set to: `https://wissen-api-285326281784.us-central1.run.app`
   - **WITHOUT** `/api` at the end
   - **WITHOUT** trailing slash

## Solution: Re-run the Workflow

Since the build already happened, you need to trigger a new build:

### Option 1: Re-run the Workflow
1. Go to: https://github.com/kamal464/wissen-publication-group/actions
2. Find the latest workflow run
3. Click "Re-run jobs" → "Re-run all jobs"

### Option 2: Push a New Commit
```cmd
git commit --allow-empty -m "Rebuild frontend with updated API URL"
git push
```

### Option 3: Manual Trigger
1. Go to: https://github.com/kamal464/wissen-publication-group/actions
2. Click "Deploy to Cloud Run (SSR) - Production"
3. Click "Run workflow" → "Run workflow"

## Verify After Deployment

After the new deployment completes:

1. Open your frontend URL: `https://wissen-frontend-285326281784.us-central1.run.app`
2. Open browser DevTools (F12)
3. Go to Console tab
4. Type: `process.env.NEXT_PUBLIC_API_URL`
5. You should see: `https://wissen-api-285326281784.us-central1.run.app`

Or check the Network tab to see if API calls are going to the Cloud Run URL instead of localhost.

## Debug: Check Build Logs

In the GitHub Actions workflow logs, look for:
- "Building with NEXT_PUBLIC_API_URL: ..." - this will show what value was used during build

If it shows `undefined` or empty, the secret isn't set correctly.

