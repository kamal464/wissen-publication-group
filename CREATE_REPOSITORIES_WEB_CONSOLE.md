# Create Artifact Registry Repositories via Web Console

Since gcloud CLI is not installed locally, use the Google Cloud Console web interface to create the repositories.

## Step-by-Step Instructions

### Step 1: Open Artifact Registry
1. Go to: https://console.cloud.google.com/artifacts?project=wissen-publication-group
2. Or navigate: **Artifact Registry** → **Repositories** in the Google Cloud Console

### Step 2: Create Frontend Repository
1. Click **"CREATE REPOSITORY"** button
2. Fill in the form:
   - **Name**: `wissen-frontend`
   - **Format**: Select **Docker**
   - **Mode**: Select **Standard** (default)
   - **Region**: Select **us-central1**
   - **Description**: `Frontend Docker images` (optional)
3. Click **"CREATE"**

### Step 3: Create Backend Repository
1. Click **"CREATE REPOSITORY"** again
2. Fill in the form:
   - **Name**: `wissen-api`
   - **Format**: Select **Docker**
   - **Mode**: Select **Standard** (default)
   - **Region**: Select **us-central1**
   - **Description**: `Backend API Docker images` (optional)
3. Click **"CREATE"**

### Step 4: Verify
After creating both repositories, you should see:
- `wissen-frontend` in the list
- `wissen-api` in the list

Both should be in the **us-central1** region.

## Alternative: Let Workflow Create Them

If you prefer, you can grant the service account permission to create repositories automatically:

1. Go to: https://console.cloud.google.com/iam-admin/iam?project=wissen-publication-group
2. Find: `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com`
3. Click the **pencil icon** (Edit)
4. Click **"ADD ANOTHER ROLE"**
5. Select: **Artifact Registry Admin** (`roles/artifactregistry.admin`)
6. Click **"SAVE"**

Then the workflow will automatically create the repositories if they don't exist.

## After Creating Repositories

1. The GitHub Actions workflow will be able to push Docker images
2. Re-run the failed workflow in GitHub Actions
3. Or push a new commit to trigger it automatically

## Quick Links

- **Artifact Registry**: https://console.cloud.google.com/artifacts?project=wissen-publication-group
- **IAM (for permissions)**: https://console.cloud.google.com/iam-admin/iam?project=wissen-publication-group

