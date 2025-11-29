# Fix Permission Error: artifactregistry.repositories.uploadArtifacts

## Error Message
```
denied: Permission "artifactregistry.repositories.uploadArtifacts" denied on resource "projects/***/locations/us/repositories/gcr.io"
```

## Problem
The service account `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com` doesn't have permission to push Docker images to Google Container Registry (GCR).

## Solution: Grant Required Roles

### Step 1: Go to IAM Page
https://console.cloud.google.com/iam-admin/iam?project=wissen-publication-group

### Step 2: Grant Access
1. Click **"+ Grant access"** button
2. In "New principals", enter: `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com`
3. Add these roles:

#### Required Roles:
1. **Storage Admin** (`roles/storage.admin`)
   - Required for pushing to GCR (gcr.io uses Cloud Storage)

2. **Artifact Registry Writer** (`roles/artifactregistry.writer`)
   - Required for Artifact Registry operations

3. **Cloud Run Admin** (`roles/run.admin`)
   - Required for deploying to Cloud Run

4. **Service Account User** (`roles/iam.serviceAccountUser`)
   - Required for using service accounts

### Step 3: Alternative - Use Storage Object Admin
If "Storage Admin" doesn't work, try:
- **Storage Object Admin** (`roles/storage.objectAdmin`)
  - More specific permission for GCR operations

## Enable APIs First

Before roles appear, enable these APIs:

1. **Artifact Registry API:**
   https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com?project=wissen-publication-group

2. **Cloud Run API:**
   https://console.cloud.google.com/apis/library/run.googleapis.com?project=wissen-publication-group

3. **Cloud Storage API:**
   https://console.cloud.google.com/apis/library/storage-component.googleapis.com?project=wissen-publication-group

## Verify Permissions

After granting roles:
1. Refresh the IAM page
2. Find `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com`
3. Verify it has all 4 roles listed above

## After Fixing

1. Re-run the failed workflow in GitHub Actions
2. Or push a new commit to trigger it again

The Docker push should now work! 🚀

