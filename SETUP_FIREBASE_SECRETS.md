# 🔐 Setup Firebase Service Account for GitHub Actions

To enable automatic deployment, you need to add a Firebase service account secret to your GitHub repository.

## Step 1: Generate Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **wissen-publication-group**
3. Click the **⚙️ Settings** icon → **Project settings**
4. Go to the **Service accounts** tab
5. Click **Generate new private key**
6. Click **Generate key** in the confirmation dialog
7. A JSON file will download - **save this file securely**

## Step 2: Add Secret to GitHub

1. Go to your GitHub repository: https://github.com/kamal464/wissen-publication-group
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `FIREBASE_SERVICE_ACCOUNT_WISSEN_PUBLICATION_GROUP`
5. Value: Open the downloaded JSON file and **copy the entire contents**
6. Click **Add secret**

## Step 3: Add API URL Secret (Optional but Recommended)

1. In the same **Secrets** page, click **New repository secret**
2. Name: `NEXT_PUBLIC_API_URL`
3. Value: Your backend API URL (e.g., `https://wissen-api-xxxxx.run.app`)
4. Click **Add secret**

## Step 4: Verify Setup

After adding the secrets:
1. Go to **Actions** tab in your repository
2. You should see the workflows listed
3. When you merge a PR to `main`, the deployment will automatically trigger

## ✅ What Happens Now

- **On Pull Request**: Creates a preview deployment
- **On Merge to Main**: Automatically deploys to production (live channel)

## 🔍 Troubleshooting

If deployment fails:
1. Check the **Actions** tab for error logs
2. Verify the service account secret name matches exactly: `FIREBASE_SERVICE_ACCOUNT_WISSEN_PUBLICATION_GROUP`
3. Ensure the Firebase project ID is correct: `wissen-publication-group`
4. Check that the frontend build completes successfully

---

**Note**: The service account JSON contains sensitive credentials. Never commit it to the repository!

