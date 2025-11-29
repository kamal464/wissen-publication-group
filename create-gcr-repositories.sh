#!/bin/bash
# Create GCR repositories for Docker images
# Run this script to create the repositories before pushing

PROJECT_ID="wissen-publication-group"

echo "Creating GCR repositories for project: $PROJECT_ID"

# Note: GCR repositories are created automatically on first push
# But we need to ensure the service account has create permissions

# Alternative: Use gcloud to create repositories explicitly
# However, GCR (gcr.io) uses Cloud Storage buckets, not Artifact Registry

# For GCR, repositories are created automatically on first push
# The issue is the service account needs permission to create them

echo "GCR repositories will be created automatically on first push"
echo "Make sure the service account has:"
echo "  - Storage Admin role (roles/storage.admin)"
echo "  - Artifact Registry Writer role (roles/artifactregistry.writer)"
echo ""
echo "If using Artifact Registry instead, create repositories:"
echo "  gcloud artifacts repositories create wissen-frontend --repository-format=docker --location=us-central1"
echo "  gcloud artifacts repositories create wissen-api --repository-format=docker --location=us-central1"

