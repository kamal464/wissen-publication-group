# Manual Steps to Create Repositories

If the script doesn't work, run these commands **one at a time** in CMD:

## Step 1: Set Project
```cmd
gcloud config set project wissen-publication-group
```

## Step 2: Create Frontend Repository
```cmd
gcloud artifacts repositories create wissen-frontend --repository-format=docker --location=us-central1 --description="Frontend Docker images"
```

**Expected output:** `Created repository [wissen-frontend].`

If you see: `ERROR: (gcloud.artifacts.repositories.create) PERMISSION_DENIED` - you need to authenticate:
```cmd
gcloud auth login
```

## Step 3: Create Backend Repository
```cmd
gcloud artifacts repositories create wissen-api --repository-format=docker --location=us-central1 --description="Backend API Docker images"
```

**Expected output:** `Created repository [wissen-api].`

## Step 4: Verify
```cmd
gcloud artifacts repositories list --location=us-central1
```

**Expected output:** You should see both `wissen-frontend` and `wissen-api` in the list.

---

## If You Get Authentication Errors

Run:
```cmd
gcloud auth login
```

Then try the create commands again.

---

## Alternative: Use Web Console

If gcloud commands don't work, use the web console:
1. Go to: https://console.cloud.google.com/artifacts?project=wissen-publication-group
2. Click "CREATE REPOSITORY"
3. Name: `wissen-frontend`, Format: Docker, Region: us-central1
4. Repeat for `wissen-api`

