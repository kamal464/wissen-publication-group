# Fix Repository Issues

## Problems Found

1. **Frontend**: Still using `gcr.io` instead of Artifact Registry
2. **Backend**: Repository "wissen-api" doesn't exist yet
3. **Authentication**: May need proper Docker authentication

## Solutions

### Option 1: Create Repositories Manually (Recommended)

Since you have gcloud CLI ready, run these commands:

```powershell
# Set project
gcloud config set project wissen-publication-group

# Create frontend repository
gcloud artifacts repositories create wissen-frontend `
  --repository-format=docker `
  --location=us-central1 `
  --description="Frontend Docker images"

# Create backend repository
gcloud artifacts repositories create wissen-api `
  --repository-format=docker `
  --location=us-central1 `
  --description="Backend API Docker images"

# Verify
gcloud artifacts repositories list --location=us-central1
```

### Option 2: Let Workflow Create Them

The workflow now has steps to automatically create repositories if they don't exist. However, the service account needs permission to create them.

**Grant this additional role:**
- Go to: https://console.cloud.google.com/iam-admin/iam?project=wissen-publication-group
- Find: `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com`
- Add role: **Artifact Registry Admin** (`roles/artifactregistry.admin`)

## What I Fixed

1. ✅ Updated frontend Docker build/push to use Artifact Registry format
2. ✅ Added automatic repository creation steps in workflow
3. ✅ Updated Docker authentication to use Artifact Registry

## Next Steps

1. **Create repositories manually** (Option 1 above) - This is fastest
2. **Push the updated workflow** - I've fixed the frontend issue
3. **Re-run the workflow** - It should work now

The workflow will now:
- Create repositories if they don't exist (if service account has permission)
- Use correct Artifact Registry URLs
- Authenticate properly with Docker

