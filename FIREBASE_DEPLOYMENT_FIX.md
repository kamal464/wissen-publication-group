# Firebase Hosting Deployment Fix

## Issue
Firebase Hosting requires static files, but Next.js dynamic routes (`/journals/[shortcode]`, `/articles/[id]`) can't be statically exported without `generateStaticParams()`.

## Solution Options

### Option 1: Deploy Frontend to Cloud Run (Recommended)
Deploy the Next.js app to Cloud Run which supports SSR, then use Firebase Hosting as a reverse proxy.

### Option 2: Use Static Export with Client-Side Routing
Configure Next.js to export static pages and handle dynamic routes client-side (requires changes to routing).

### Option 3: Pre-generate Known Routes
If you know all journal shortcodes and article IDs, pre-generate them at build time.

## Current Status
The build is failing because dynamic routes need `generateStaticParams()` for static export.

## Quick Fix: Deploy to Cloud Run Instead

Update the workflow to deploy frontend to Cloud Run:

```yaml
# Deploy frontend to Cloud Run (supports Next.js SSR)
- name: Deploy Frontend to Cloud Run
  run: |
    gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/wissen-frontend ./frontend
    gcloud run deploy wissen-frontend \
      --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/wissen-frontend \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated
```

Then update `firebase.json` to proxy to Cloud Run:

```json
{
  "hosting": {
    "public": "public",
    "rewrites": [
      {
        "source": "**",
        "run": {
          "serviceId": "wissen-frontend",
          "region": "us-central1"
        }
      }
    ]
  }
}
```

