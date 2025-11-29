@echo off
echo Creating wissen-frontend repository...
echo.

gcloud artifacts repositories create wissen-frontend --repository-format=docker --location=us-central1 --description="Frontend Docker images"

echo.
echo Verifying...
gcloud artifacts repositories list --location=us-central1

echo.
echo Done!
pause

