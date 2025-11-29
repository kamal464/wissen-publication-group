# Enable Google Cloud APIs Manually

## Required APIs

The following APIs must be enabled in your Google Cloud project before the workflow can run:

1. **Artifact Registry API** (`artifactregistry.googleapis.com`)
   - Required for Docker image storage (GCR/Artifact Registry)

2. **Cloud Run API** (`run.googleapis.com`)
   - Required for deploying to Cloud Run

3. **Cloud Build API** (`cloudbuild.googleapis.com`)
   - Required for building Docker images

## Enable via Google Cloud Console

1. Go to [Google Cloud Console - APIs & Services](https://console.cloud.google.com/apis/library)
2. Search for each API name above
3. Click on each API and click "Enable"

## Enable via gcloud CLI

Run these commands (replace `[PROJECT_ID]` with your actual project ID):

```bash
gcloud config set project [PROJECT_ID]

gcloud services enable artifactregistry.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## Verify APIs are Enabled

```bash
gcloud services list --enabled --filter="name:artifactregistry.googleapis.com OR name:run.googleapis.com OR name:cloudbuild.googleapis.com"
```

## Service Account Permissions

Your service account also needs these roles:
- **Cloud Run Admin** (`roles/run.admin`) - To deploy to Cloud Run
- **Service Account User** (`roles/iam.serviceAccountUser`) - To use service accounts
- **Storage Admin** (`roles/storage.admin`) - To push Docker images to GCR
- **Artifact Registry Writer** (`roles/artifactregistry.writer`) - To push images

## Grant Permissions via gcloud CLI

```bash
# Replace [PROJECT_ID] and [SERVICE_ACCOUNT_EMAIL] with your values
gcloud projects add-iam-policy-binding [PROJECT_ID] \
  --member="serviceAccount:[SERVICE_ACCOUNT_EMAIL]" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding [PROJECT_ID] \
  --member="serviceAccount:[SERVICE_ACCOUNT_EMAIL]" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding [PROJECT_ID] \
  --member="serviceAccount:[SERVICE_ACCOUNT_EMAIL]" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding [PROJECT_ID] \
  --member="serviceAccount:[SERVICE_ACCOUNT_EMAIL]" \
  --role="roles/artifactregistry.writer"
```

## Example

If your project ID is `wissen-publication-group` and service account is `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com`:

```bash
PROJECT_ID="wissen-publication-group"
SERVICE_ACCOUNT="github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com"

# Enable APIs
gcloud services enable artifactregistry.googleapis.com --project=$PROJECT_ID
gcloud services enable run.googleapis.com --project=$PROJECT_ID
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/artifactregistry.writer"
```

## After Enabling

Once APIs are enabled and permissions are granted:
1. Re-run the failed workflow in GitHub Actions
2. Or push a new commit to trigger the workflow again

