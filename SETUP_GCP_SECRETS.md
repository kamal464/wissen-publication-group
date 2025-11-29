# 🔐 Setup Google Cloud Secrets for GitHub Actions

## Required Secrets

To enable automatic deployment to Cloud Run, you need to add these secrets to your GitHub repository:

### 1. GCP_SERVICE_ACCOUNT
**Purpose**: Service account JSON key for Google Cloud authentication

**Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Go to **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**
5. Name: `github-actions-deploy`
6. Grant roles:
   - **Cloud Run Admin**
   - **Service Account User**
   - **Storage Admin** (for Container Registry)
   - **Artifact Registry Writer** (if using Artifact Registry)
7. Click **Done**
8. Click on the created service account
9. Go to **Keys** tab → **Add Key** → **Create new key** → **JSON**
10. Download the JSON file
11. Go to GitHub: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
12. Click **New repository secret**
13. Name: `GCP_SERVICE_ACCOUNT`
14. Value: Paste the **entire contents** of the downloaded JSON file
15. Click **Add secret**

### 2. GCP_PROJECT_ID
**Purpose**: Your Google Cloud Project ID

**Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Copy your **Project ID** (not Project Name)
3. Go to GitHub: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
4. Click **New repository secret**
5. Name: `GCP_PROJECT_ID`
6. Value: Paste your Project ID (e.g., `my-project-123456`)
7. Click **Add secret**

### 3. DATABASE_URL
**Purpose**: PostgreSQL connection string (Supabase or Cloud SQL)

**Steps**:
1. Get your database connection string from Supabase or Cloud SQL
2. Format: `postgresql://user:password@host:5432/database`
3. Go to GitHub: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
4. Click **New repository secret**
5. Name: `DATABASE_URL`
6. Value: Paste your connection string
7. Click **Add secret**

### 4. NEXT_PUBLIC_API_URL
**Purpose**: Backend API URL (will be your Cloud Run backend URL after first deployment)

**Steps**:
1. After first backend deployment, copy the Cloud Run URL
2. Format: `https://wissen-api-xxxxx.run.app`
3. Go to GitHub: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
4. Click **New repository secret**
5. Name: `NEXT_PUBLIC_API_URL`
6. Value: Paste your backend URL
7. Click **Add secret**

**Note**: For the first deployment, you can use a placeholder like `http://localhost:3001`, then update it after the backend is deployed.

---

## ✅ Verification

After adding all secrets:
1. Go to: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
2. Verify you see all 4 secrets:
   - ✅ `GCP_SERVICE_ACCOUNT`
   - ✅ `GCP_PROJECT_ID`
   - ✅ `DATABASE_URL`
   - ✅ `NEXT_PUBLIC_API_URL`

---

## 🚀 After Setup

Once all secrets are added:
1. Push a new commit to trigger deployment
2. Check: https://github.com/kamal464/wissen-publication-group/actions
3. The workflow should now succeed!

---

## 🆘 Troubleshooting

### "Service account key not found"
- Verify the JSON file was copied completely
- Check for any extra spaces or line breaks

### "Project ID not found"
- Verify you're using Project ID, not Project Name
- Check the project exists in Google Cloud Console

### "Permission denied"
- Verify service account has required roles
- Check service account is enabled

