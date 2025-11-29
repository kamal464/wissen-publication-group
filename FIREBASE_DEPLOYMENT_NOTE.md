# ⚠️ Firebase Hosting Limitation

## Issue
Firebase Hosting requires **static files**, but your Next.js app has **dynamic routes** (`/journals/[shortcode]` and `/articles/[id]`) that can't be statically exported without pre-generating all possible routes.

## Current Status
The workflow is configured, but the build may fail due to dynamic routes.

## Solutions

### Option 1: Deploy Frontend to Cloud Run (Recommended)
- ✅ Supports Next.js SSR and dynamic routes
- ✅ Full functionality
- ✅ Free tier available

**Update workflow to deploy frontend to Cloud Run instead of Firebase Hosting**

### Option 2: Pre-generate Known Routes
If you know all journal shortcodes and article IDs, you can pre-generate them at build time.

### Option 3: Use Firebase Hosting + Cloud Run Hybrid
- Deploy static pages to Firebase Hosting
- Deploy dynamic routes to Cloud Run
- Use Firebase Hosting rewrites to proxy dynamic routes

## Current Workflow
The workflow will:
1. ✅ Build frontend (may fail on dynamic routes)
2. ✅ Build backend
3. ⚠️ Deploy to Firebase Hosting (if build succeeds)

## Recommendation
**Switch to Cloud Run deployment** for the frontend to support all features including dynamic routes.

See `.github/workflows/deploy.yml` for Cloud Run deployment workflow.

