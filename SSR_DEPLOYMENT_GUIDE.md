# SSR Deployment Guide

## ✅ Successfully Switched to SSR

The application has been successfully switched from static export to Server-Side Rendering (SSR) for deployment to Google Cloud Run.

## Changes Made

### 1. Next.js Configuration (`frontend/next.config.ts`)
- ✅ Removed `output: 'export'` (static export)
- ✅ Added `output: 'standalone'` (for Docker/Cloud Run)
- ✅ Enabled image optimization
- ✅ Removed static export specific settings

### 2. Dynamic Routes
- ✅ Removed `generateStaticParams()` from `/articles/[id]/page.tsx`
- ✅ Removed `generateStaticParams()` from `/journals/[shortcode]/page.tsx`
- ✅ Routes now use SSR (marked as `ƒ (Dynamic)` in build output)

### 3. GitHub Actions Workflow (`.github/workflows/firebase-hosting-merge.yml`)
- ✅ Updated to deploy to Cloud Run instead of Firebase Hosting
- ✅ Added Docker build and push steps
- ✅ Added Cloud Run deployment for both frontend and backend
- ✅ Uses proper GCP authentication

### 4. Dockerfile
- ✅ Already configured correctly for SSR with `standalone` output
- ✅ Uses `.next/standalone` directory
- ✅ Runs `node server.js` for SSR

## Build Status

✅ **Build Successful!**
- Dynamic routes are now server-rendered
- No more `generateStaticParams()` errors
- Ready for Cloud Run deployment

## Deployment

The workflow will:
1. Build frontend with SSR support
2. Build Docker images for both frontend and backend
3. Push images to Google Container Registry
4. Deploy to Cloud Run

## Required GitHub Secrets

Make sure these secrets are set in GitHub:
- `GCP_SERVICE_ACCOUNT` - Google Cloud service account JSON
- `GCP_PROJECT_ID` - Google Cloud project ID
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Benefits of SSR

1. ✅ **Dynamic Routes Work** - No need for `generateStaticParams()`
2. ✅ **Better SEO** - Server-rendered content
3. ✅ **Real-time Data** - Can fetch data on each request
4. ✅ **More Flexible** - Can use server-side features
5. ✅ **Better Performance** - Optimized rendering

## Next Steps

1. Monitor GitHub Actions workflow
2. Verify Cloud Run deployments
3. Test the deployed application
4. Update any hardcoded URLs to use Cloud Run endpoints

