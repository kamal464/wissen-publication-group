# Grant Permissions to Service Account

## Service Account
**Email:** `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com`

## Step-by-Step Instructions (Google Cloud Console)

### Step 1: Go to IAM Page
1. In the Google Cloud Console, click on **"IAM"** in the left sidebar (under "IAM & Admin")
2. Or go directly to: https://console.cloud.google.com/iam-admin/iam?project=wissen-publication-group

### Step 2: Find Your Service Account
1. Look for `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com` in the list
2. If you don't see it, you can also grant permissions from the Service Accounts page:
   - Click on the service account name
   - Click **"PERMISSIONS"** tab
   - Click **"GRANT ACCESS"**

### Step 3: Grant Required Roles
Click **"GRANT ACCESS"** button (top of the page) and add these roles:

#### Required Roles:
1. **Cloud Run Admin** (`roles/run.admin`)
   - Allows deploying and managing Cloud Run services

2. **Service Account User** (`roles/iam.serviceAccountUser`)
   - Allows using service accounts

3. **Storage Admin** (`roles/storage.admin`)
   - Allows pushing Docker images to Google Container Registry

4. **Artifact Registry Writer** (`roles/artifactregistry.writer`)
   - Allows pushing images to Artifact Registry

### Step 4: Add Each Role
For each role:
1. Click **"ADD ANOTHER ROLE"**
2. Select the role from the dropdown
3. Click **"SAVE"**

### Alternative: Grant from Service Accounts Page
1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=wissen-publication-group
2. Click on `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com`
3. Click **"PERMISSIONS"** tab
4. Click **"GRANT ACCESS"**
5. In "New principals", enter: `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com`
6. Select all 4 roles listed above
7. Click **"SAVE"**

## Quick Links

### Enable APIs:
- **Artifact Registry:** https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com?project=wissen-publication-group
- **Cloud Run:** https://console.cloud.google.com/apis/library/run.googleapis.com?project=wissen-publication-group
- **Cloud Build:** https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=wissen-publication-group

### Grant Permissions:
- **IAM Page:** https://console.cloud.google.com/iam-admin/iam?project=wissen-publication-group
- **Service Accounts:** https://console.cloud.google.com/iam-admin/serviceaccounts?project=wissen-publication-group

## Verify Setup

After granting permissions:
1. Go to IAM page
2. Find `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com`
3. Verify it has all 4 roles listed above

## After Setup

Once APIs are enabled and permissions are granted:
1. Go to GitHub Actions
2. Re-run the failed workflow
3. The deployment should now work! 🚀

