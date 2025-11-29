@echo off
echo Checking and creating Artifact Registry repositories...
echo.

REM Verify project is set
gcloud config get-value project
echo.

REM Check if frontend repository exists
echo Checking wissen-frontend repository...
gcloud artifacts repositories describe wissen-frontend --location=us-central1 2>nul
if %errorlevel% equ 0 (
    echo ✓ wissen-frontend already exists
) else (
    echo Creating wissen-frontend repository...
    gcloud artifacts repositories create wissen-frontend --repository-format=docker --location=us-central1 --description="Frontend Docker images"
    if %errorlevel% equ 0 (
        echo ✓ wissen-frontend created successfully
    ) else (
        echo ✗ Failed to create wissen-frontend
    )
)

echo.

REM Check if backend repository exists
echo Checking wissen-api repository...
gcloud artifacts repositories describe wissen-api --location=us-central1 2>nul
if %errorlevel% equ 0 (
    echo ✓ wissen-api already exists
) else (
    echo Creating wissen-api repository...
    gcloud artifacts repositories create wissen-api --repository-format=docker --location=us-central1 --description="Backend API Docker images"
    if %errorlevel% equ 0 (
        echo ✓ wissen-api created successfully
    ) else (
        echo ✗ Failed to create wissen-api
    )
)

echo.
echo Listing all repositories in us-central1:
gcloud artifacts repositories list --location=us-central1

echo.
echo Done!
pause

