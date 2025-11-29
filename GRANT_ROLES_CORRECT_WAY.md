# Grant Roles to Service Account - Correct Method

## Important: You're on the Wrong Tab!

The "Principals with access" tab is for granting access **TO** the service account.
We need to grant roles **TO** the service account so it can use GCP resources.

## Correct Method: Use IAM Page

### Step 1: Go to IAM Page
1. Click **"IAM"** in the left sidebar (under "IAM & Admin")
2. Or go directly to: https://console.cloud.google.com/iam-admin/iam?project=wissen-publication-group

### Step 2: Find Your Service Account
1. Look for: `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com`
2. If you don't see it, you may need to click "Include Google-provided role grants" at the top

### Step 3: Grant Access
1. Click the **pencil icon (Edit)** next to the service account
2. Click **"ADD ANOTHER ROLE"**
3. Search for and add these roles **one by one**:

#### Role 1: Cloud Run Admin
- Search: `Cloud Run Admin`
- Select: **"Cloud Run Admin"** (roles/run.admin)

#### Role 2: Service Account User
- Search: `Service Account User`
- Select: **"Service Account User"** (roles/iam.serviceAccountUser)

#### Role 3: Storage Admin
- Search: `Storage Admin`
- Select: **"Storage Admin"** (roles/storage.admin)

#### Role 4: Artifact Registry Writer
- Search: `Artifact Registry Writer`
- Select: **"Artifact Registry Writer"** (roles/artifactregistry.writer)

### Step 4: Save
Click **"SAVE"** after adding all 4 roles

## Alternative: Grant from Project Level

### Method 2: Grant Access Button
1. On the IAM page, click **"GRANT ACCESS"** button (top)
2. In "New principals", enter: `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com`
3. Click **"Select a role"** dropdown
4. Add all 4 roles listed above
5. Click **"SAVE"**

## Exact Role Names to Search

When searching in the role dropdown, use these exact names:

1. **Cloud Run Admin** (not "Cloud Run")
2. **Service Account User** (not "Service Account")
3. **Storage Admin** (not "Storage")
4. **Artifact Registry Writer** (not "Artifact Registry")

## If Roles Don't Appear

### Enable APIs First
Some roles may not appear until APIs are enabled:

1. **Artifact Registry API:**
   https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com?project=wissen-publication-group

2. **Cloud Run API:**
   https://console.cloud.google.com/apis/library/run.googleapis.com?project=wissen-publication-group

3. **Cloud Build API:**
   https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=wissen-publication-group

After enabling APIs, refresh the IAM page and try again.

## Quick Link

**Go directly to IAM page:**
https://console.cloud.google.com/iam-admin/iam?project=wissen-publication-group

Then find `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com` and click the pencil icon to edit.

