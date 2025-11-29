# Create Artifact Registry Repositories Manually

## Problem
The error shows: `gcr.io repo does not exist. Creating on push requires the artifactregistry.repositories.createOnPush permission`

## Solution: Create Repositories Manually

Since you have gcloud CLI ready, run these commands to create the repositories:

### Step 1: Set Project
```powershell
gcloud config set project wissen-publication-group
```

### Step 2: Create Frontend Repository
```powershell
gcloud artifacts repositories create wissen-frontend `
  --repository-format=docker `
  --location=us-central1 `
  --description="Frontend Docker images"
```

### Step 3: Create Backend Repository
```powershell
gcloud artifacts repositories create wissen-api `
  --repository-format=docker `
  --location=us-central1 `
  --description="Backend API Docker images"
```

### Step 4: Verify Repositories
```powershell
gcloud artifacts repositories list --location=us-central1
```

## Alternative: Grant Create Permission

If you prefer to let the workflow create repositories automatically, grant this additional role:

1. Go to IAM page: https://console.cloud.google.com/iam-admin/iam?project=wissen-publication-group
2. Find `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com`
3. Click edit (pencil icon)
4. Add role: **Artifact Registry Admin** (`roles/artifactregistry.admin`)

## After Creating Repositories

1. The workflow will now be able to push images
2. Re-run the failed workflow in GitHub Actions
3. Or push a new commit to trigger it

## Updated Workflow

I've also updated the workflow to:
- Use Artifact Registry format instead of GCR
- Create repositories automatically if they don't exist
- Use proper Artifact Registry URLs

The workflow will now work! 🚀

