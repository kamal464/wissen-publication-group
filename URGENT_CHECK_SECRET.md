# ⚠️ URGENT: Check GitHub Secret

## The Problem

The environment variable is **definitely not being set during the build**. This means one of:

1. **The GitHub secret doesn't exist** ❌
2. **The GitHub secret is empty** ❌  
3. **The GitHub secret has wrong value** ❌

## IMMEDIATE ACTION REQUIRED

### Step 1: Go to GitHub Secrets

**Right now**, go to:
https://github.com/kamal464/wissen-publication-group/settings/secrets/actions

### Step 2: Check if Secret Exists

Look for `NEXT_PUBLIC_API_URL` in the list.

- **If it doesn't exist**: Create it now (see Step 3)
- **If it exists**: Click on it to edit (see Step 4)

### Step 3: Create Secret (If Missing)

1. Click **"New repository secret"**
2. Name: `NEXT_PUBLIC_API_URL` (exactly, case-sensitive)
3. Value: `https://wissen-api-285326281784.us-central1.run.app`
   - Copy this EXACTLY
   - No `/api` at the end
   - No trailing slash
   - No spaces
4. Click **"Add secret"**

### Step 4: Update Secret (If Exists)

1. Click the **pencil icon** next to `NEXT_PUBLIC_API_URL`
2. **Delete everything** in the value field
3. **Type or paste exactly**: `https://wissen-api-285326281784.us-central1.run.app`
4. Make sure there are NO:
   - Trailing spaces
   - Leading spaces  
   - Newlines
   - `/api` suffix
   - Trailing `/`
5. Click **"Update secret"**

### Step 5: Verify Secret

After creating/updating, you should see:
- Name: `NEXT_PUBLIC_API_URL`
- Last updated: Just now

### Step 6: Force Rebuild

```cmd
git commit --allow-empty -m "Rebuild after fixing NEXT_PUBLIC_API_URL secret"
git push
```

### Step 7: Check Build Logs

After the workflow runs:
1. Go to: https://github.com/kamal464/wissen-publication-group/actions
2. Click latest workflow run
3. Expand "Build Frontend"
4. Look for: `NEXT_PUBLIC_API_URL length: XX`
   - If XX > 0 → Secret is set ✅
   - If XX = 0 → Secret is empty ❌

## Why This Is Critical

Next.js **bakes** `NEXT_PUBLIC_*` variables into the JavaScript bundle **at build time**. If the variable isn't available during build:

- It becomes `undefined` in the code
- Falls back to localhost
- **Cannot be fixed at runtime** - must rebuild

## After Fixing

Once the secret is set correctly and you rebuild:
1. The warning will disappear
2. API calls will go to Cloud Run
3. Everything will work correctly

**This is the root cause. Fix the secret and rebuild.**

