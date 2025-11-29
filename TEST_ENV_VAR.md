# Test Environment Variable Locally

## The Issue

The warning shows that `NEXT_PUBLIC_API_URL` is not being set during the build. Even though the GitHub secret exists, Next.js isn't picking it up.

## Test Locally

### Step 1: Create .env.local file

In the `frontend` directory, create a `.env.local` file:

```bash
cd frontend
```

Create `.env.local` with:
```
NEXT_PUBLIC_API_URL=https://wissen-api-285326281784.us-central1.run.app
```

### Step 2: Test Build Locally

```bash
npm run build
```

During the build, you should see Next.js processing the env var. After build, check if the variable is in the output.

### Step 3: Check Build Output

After building, check the `.next` directory to see if the env var was baked in. You can also:

1. Start the production server: `npm start`
2. Open the app
3. Check console - the warning should NOT appear
4. Check Network tab - API calls should go to Cloud Run URL

## Verify GitHub Secret Value

The secret might be set incorrectly. To verify:

1. Go to: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
2. Click on `NEXT_PUBLIC_API_URL` to edit it
3. Make sure it's exactly: `https://wissen-api-285326281784.us-central1.run.app`
   - No `/api` at the end
   - No trailing slash
   - No extra spaces

## Alternative: Check Build Logs

In GitHub Actions, after the build completes:
1. Go to the workflow run
2. Expand "Build Frontend"
3. Look for any errors or warnings
4. Check if the env var is being logged (it will show as `***`)

## Possible Issues

1. **Secret value has extra characters** - Check for trailing spaces or newlines
2. **Next.js cache** - The build might be using cached output
3. **Turbopack issue** - Next.js 15.5.4 with Turbopack might need different handling

## Quick Fix: Recreate Secret

If nothing works, try recreating the secret:
1. Delete the existing `NEXT_PUBLIC_API_URL` secret
2. Create a new one with the exact value: `https://wissen-api-285326281784.us-central1.run.app`
3. Rebuild

