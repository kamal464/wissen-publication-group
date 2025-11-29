# Workflow Cleanup Summary

## Problem
Three workflows were running on every push to `main`, causing duplicate builds and failures:
1. `deploy.yml` - "Deploy Application"
2. `firebase-hosting-merge.yml` - "Deploy to Cloud Run (SSR)"
3. `firebase-deploy.yml` - "Deploy to Firebase Hosting"

## Solution
Disabled duplicate workflows and kept only the Cloud Run SSR deployment.

## Active Workflows

### ✅ Production Deployment
- **File:** `.github/workflows/firebase-hosting-merge.yml`
- **Name:** "Deploy to Cloud Run (SSR) - Production"
- **Triggers:** Push to `main` branch
- **Purpose:** Deploy both frontend and backend to Google Cloud Run

### ✅ PR Preview (Optional)
- **File:** `.github/workflows/firebase-hosting-pull-request.yml`
- **Name:** "Deploy to Firebase Hosting on PR"
- **Triggers:** Pull requests only
- **Purpose:** Preview deployments for PRs (if needed)

## Disabled Workflows

### ❌ Deploy Application
- **File:** `.github/workflows/deploy.yml`
- **Status:** Disabled (only manual trigger via `workflow_dispatch`)
- **Reason:** Duplicate of Cloud Run deployment

### ❌ Deploy to Firebase Hosting
- **File:** `.github/workflows/firebase-deploy.yml`
- **Status:** Disabled (only manual trigger via `workflow_dispatch`)
- **Reason:** We're using Cloud Run SSR, not Firebase Hosting static export

## Result
Now only **ONE** workflow runs on push to `main`:
- ✅ "Deploy to Cloud Run (SSR) - Production"

This eliminates duplicate builds and reduces CI/CD costs.

