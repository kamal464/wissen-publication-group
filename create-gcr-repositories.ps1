# Create GCR repositories for Docker images
# PowerShell script for Windows

$PROJECT_ID = "wissen-publication-group"

Write-Host "Setting up GCR repositories for project: $PROJECT_ID" -ForegroundColor Green

# GCR (gcr.io) repositories are created automatically on first push
# But we need to ensure proper permissions

Write-Host "`nGCR repositories will be created automatically on first push" -ForegroundColor Yellow
Write-Host "Make sure the service account has:" -ForegroundColor Cyan
Write-Host "  - Storage Admin role (roles/storage.admin)" -ForegroundColor White
Write-Host "  - Artifact Registry Writer role (roles/artifactregistry.writer)" -ForegroundColor White

Write-Host "`nChecking if we need to grant additional permissions..." -ForegroundColor Yellow

# The service account needs permission to create repositories on push
# Grant this additional role:
Write-Host "`nGrant this additional role to the service account:" -ForegroundColor Green
Write-Host "  - Artifact Registry Admin (roles/artifactregistry.admin)" -ForegroundColor White
Write-Host "    OR" -ForegroundColor Yellow
Write-Host "  - Storage Object Creator (roles/storage.objectCreator)" -ForegroundColor White

Write-Host "`nOr create repositories manually first:" -ForegroundColor Yellow
Write-Host "  gcloud artifacts repositories create wissen-frontend --repository-format=docker --location=us-central1 --project=$PROJECT_ID" -ForegroundColor Cyan
Write-Host "  gcloud artifacts repositories create wissen-api --repository-format=docker --location=us-central1 --project=$PROJECT_ID" -ForegroundColor Cyan

