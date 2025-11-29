@echo off
echo ========================================
echo Creating Artifact Registry Repositories
echo ========================================
echo.

echo Step 1: Setting project...
gcloud config set project wissen-publication-group
echo.

echo Step 2: Creating wissen-frontend repository...
gcloud artifacts repositories create wissen-frontend --repository-format=docker --location=us-central1 --description="Frontend Docker images"
echo.

echo Step 3: Creating wissen-api repository...
gcloud artifacts repositories create wissen-api --repository-format=docker --location=us-central1 --description="Backend API Docker images"
echo.

echo Step 4: Listing all repositories...
gcloud artifacts repositories list --location=us-central1
echo.

echo ========================================
echo Done! Check the list above.
echo ========================================
pause

