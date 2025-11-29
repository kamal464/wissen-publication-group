# Setup GCP APIs and Permissions

## Project ID
`wissen-publication-group`

## Option 1: Using Google Cloud Console (Web UI) - Easiest

### Enable APIs:
1. Go to: https://console.cloud.google.com/apis/library?project=wissen-publication-group
2. Search for and enable each API:
   - **Artifact Registry API** - Search "Artifact Registry"
   - **Cloud Run API** - Search "Cloud Run"
   - **Cloud Build API** - Search "Cloud Build"
3. Click "Enable" for each one

### Grant Service Account Permissions:
1. Go to: https://console.cloud.google.com/iam-admin/iam?project=wissen-publication-group
2. Find your service account (likely `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com`)
3. Click the pencil icon to edit
4. Click "ADD ANOTHER ROLE" and add these roles:
   - **Cloud Run Admin** (`roles/run.admin`)
   - **Service Account User** (`roles/iam.serviceAccountUser`)
   - **Storage Admin** (`roles/storage.admin`)
   - **Artifact Registry Writer** (`roles/artifactregistry.writer`)
5. Click "SAVE"

## Option 2: Using gcloud CLI

### Install gcloud CLI (if not installed):
1. Download from: https://cloud.google.com/sdk/docs/install
2. Run the installer
3. Run `gcloud init` to authenticate

### Run the setup script:
```powershell
# Make sure you're authenticated
gcloud auth login

# Run the setup script
.\setup-gcp-apis.ps1
```

### Or run commands manually:
```powershell
$PROJECT_ID = "wissen-publication-group"
$SERVICE_ACCOUNT = "github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

# Set project
gcloud config set project $PROJECT_ID

# Enable APIs
gcloud services enable artifactregistry.googleapis.com --project=$PROJECT_ID
gcloud services enable run.googleapis.com --project=$PROJECT_ID
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/run.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/iam.serviceAccountUser"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/storage.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT" --role="roles/artifactregistry.writer"
```

## Verify Setup

### Check APIs are enabled:
```powershell
gcloud services list --enabled --project=wissen-publication-group --filter="name:artifactregistry.googleapis.com OR name:run.googleapis.com OR name:cloudbuild.googleapis.com"
```

### Check service account permissions:
1. Go to: https://console.cloud.google.com/iam-admin/iam?project=wissen-publication-group
2. Find your service account and verify it has the 4 roles listed above

## After Setup

Once APIs are enabled and permissions are granted:
1. Go to GitHub Actions
2. Re-run the failed workflow, OR
3. Push a new commit to trigger the workflow

The deployment should now work! 🚀

