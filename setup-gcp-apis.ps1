# Setup GCP APIs and Permissions for wissen-publication-group
# Run this script after installing gcloud CLI

$PROJECT_ID = "wissen-publication-group"
# Common service account pattern - adjust if different
$SERVICE_ACCOUNT = "github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

Write-Host "Setting GCP project..." -ForegroundColor Green
gcloud config set project $PROJECT_ID

Write-Host "`nEnabling required APIs..." -ForegroundColor Green
gcloud services enable artifactregistry.googleapis.com --project=$PROJECT_ID
gcloud services enable run.googleapis.com --project=$PROJECT_ID
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID

Write-Host "`nGranting permissions to service account: $SERVICE_ACCOUNT" -ForegroundColor Green

Write-Host "`nGranting Cloud Run Admin role..." -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/run.admin"

Write-Host "`nGranting Service Account User role..." -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/iam.serviceAccountUser"

Write-Host "`nGranting Storage Admin role..." -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/storage.admin"

Write-Host "`nGranting Artifact Registry Writer role..." -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/artifactregistry.writer"

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nVerifying APIs are enabled..." -ForegroundColor Cyan
gcloud services list --enabled --project=$PROJECT_ID --filter="name:artifactregistry.googleapis.com OR name:run.googleapis.com OR name:cloudbuild.googleapis.com"

