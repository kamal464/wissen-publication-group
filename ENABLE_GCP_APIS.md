# Enable Google Cloud APIs

## Issue
The workflow was failing with:
```
denied: Artifact Registry API has not been used in project 285326281784 before or it is disabled.
```

## Solution
Added a step to automatically enable required Google Cloud APIs before Docker operations.

## APIs Enabled
1. **Artifact Registry API** (`artifactregistry.googleapis.com`)
   - Required for Docker image storage (GCR/Artifact Registry)

2. **Cloud Run API** (`run.googleapis.com`)
   - Required for deploying to Cloud Run

3. **Cloud Build API** (`cloudbuild.googleapis.com`)
   - Required for building Docker images

## Manual Enablement (Alternative)
If you prefer to enable manually, visit:
https://console.developers.google.com/apis/api/artifactregistry.googleapis.com/overview?project=YOUR_PROJECT_ID

Replace `YOUR_PROJECT_ID` with your actual GCP project ID.

## Note
The workflow now automatically enables these APIs, so manual intervention is not required.

