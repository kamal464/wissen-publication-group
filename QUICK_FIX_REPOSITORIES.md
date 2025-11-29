# Quick Fix: Create Repositories via Web Console

## 🚀 Fastest Solution (5 minutes)

### Step 1: Open Artifact Registry
Go to: **https://console.cloud.google.com/artifacts?project=wissen-publication-group**

### Step 2: Create Frontend Repository
1. Click **"CREATE REPOSITORY"**
2. Enter:
   - **Name**: `wissen-frontend`
   - **Format**: **Docker**
   - **Region**: **us-central1**
3. Click **"CREATE"**

### Step 3: Create Backend Repository
1. Click **"CREATE REPOSITORY"** again
2. Enter:
   - **Name**: `wissen-api`
   - **Format**: **Docker**
   - **Region**: **us-central1**
3. Click **"CREATE"**

### Step 4: Done! ✅
The workflow will now be able to push Docker images.

---

## 🔄 Alternative: Let Workflow Create Them Automatically

If you want the workflow to create repositories automatically, grant this permission:

1. Go to: **https://console.cloud.google.com/iam-admin/iam?project=wissen-publication-group**
2. Find: `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com`
3. Click **Edit** (pencil icon)
4. Click **"ADD ANOTHER ROLE"**
5. Select: **Artifact Registry Admin** (`roles/artifactregistry.admin`)
6. Click **"SAVE"**

Then the workflow will create repositories automatically if they don't exist.

---

## 📋 After Creating Repositories

1. Go to GitHub Actions: https://github.com/kamal464/wissen-publication-group/actions
2. Re-run the failed workflow
3. Or push a new commit to trigger it

The deployment should work now! 🎉

