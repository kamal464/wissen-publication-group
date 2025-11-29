# Run these commands to create Artifact Registry repositories
# Make sure you're authenticated: gcloud auth login

Write-Host "Setting up Artifact Registry repositories..." -ForegroundColor Green

# Set project
gcloud config set project wissen-publication-group

# Create frontend repository
Write-Host "`nCreating wissen-frontend repository..." -ForegroundColor Yellow
gcloud artifacts repositories create wissen-frontend `
  --repository-format=docker `
  --location=us-central1 `
  --description="Frontend Docker images"

# Create backend repository
Write-Host "`nCreating wissen-api repository..." -ForegroundColor Yellow
gcloud artifacts repositories create wissen-api `
  --repository-format=docker `
  --location=us-central1 `
  --description="Backend API Docker images"

# Verify repositories
Write-Host "`nVerifying repositories..." -ForegroundColor Cyan
gcloud artifacts repositories list --location=us-central1

Write-Host "`n✅ Repositories created successfully!" -ForegroundColor Green
Write-Host "`nNow the GitHub Actions workflow can push Docker images." -ForegroundColor Cyan

