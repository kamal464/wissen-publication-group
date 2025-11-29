@echo off
echo Creating Artifact Registry repositories...
echo.

REM Set project
gcloud config set project wissen-publication-group
if %errorlevel% neq 0 (
    echo ERROR: Failed to set project. Make sure you're authenticated.
    echo Run: gcloud auth login
    pause
    exit /b 1
)

echo.
echo Creating wissen-frontend repository...
gcloud artifacts repositories create wissen-frontend ^
  --repository-format=docker ^
  --location=us-central1 ^
  --description="Frontend Docker images"
if %errorlevel% neq 0 (
    echo WARNING: Repository may already exist or creation failed.
)

echo.
echo Creating wissen-api repository...
gcloud artifacts repositories create wissen-api ^
  --repository-format=docker ^
  --location=us-central1 ^
  --description="Backend API Docker images"
if %errorlevel% neq 0 (
    echo WARNING: Repository may already exist or creation failed.
)

echo.
echo Verifying repositories...
gcloud artifacts repositories list --location=us-central1

echo.
echo Done! Repositories should now be available.
pause

