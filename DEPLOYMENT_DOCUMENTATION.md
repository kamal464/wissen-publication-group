# 🚀 Deployment Documentation - Wissen Publication Group

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Infrastructure Components](#infrastructure-components)
4. [Deployment Process](#deployment-process)
5. [GitHub Actions CI/CD](#github-actions-cicd)
6. [Docker Images](#docker-images)
7. [Database (Supabase PostgreSQL)](#database-supabase-postgresql)
8. [Environment Variables](#environment-variables)
9. [URLs and Endpoints](#urls-and-endpoints)
10. [Troubleshooting](#troubleshooting)
11. [Cost Estimation](#cost-estimation)

---

## 🎯 Overview

**Wissen Publication Group** is deployed as a full-stack application using:

- **Frontend**: Next.js 15.5.4 (Server-Side Rendering) on Google Cloud Run
- **Backend**: NestJS API on Google Cloud Run
- **Database**: PostgreSQL on Supabase (managed)
- **CI/CD**: GitHub Actions with automated Docker builds and deployments
- **Container Registry**: Google Artifact Registry
- **Project**: `wissen-publication-group` (GCP Project ID)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│         kamal464/wissen-publication-group                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Push to main branch
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Actions Workflow                         │
│  .github/workflows/firebase-hosting-merge.yml               │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Build Frontend │         │  Build Backend   │          │
│  │  (Next.js SSR)  │         │  (NestJS)        │          │
│  └────────┬─────────┘         └────────┬─────────┘          │
│           │                           │                      │
│           ▼                           ▼                      │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Docker Build    │         │  Docker Build    │          │
│  └────────┬─────────┘         └────────┬─────────┘          │
│           │                           │                      │
│           ▼                           ▼                      │
│  ┌──────────────────────────────────────────┐              │
│  │   Google Artifact Registry                │              │
│  │   - wissen-frontend                       │              │
│  │   - wissen-api                            │              │
│  └────────┬──────────────────────┬───────────┘              │
│           │                      │                           │
│           ▼                        ▼                          │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Cloud Run       │  │  Cloud Run        │                │
│  │  wissen-frontend │  │  wissen-api      │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
└───────────┼──────────────────────┼──────────────────────────┘
            │                      │
            │                      │
            ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL Database                   │
│         db.clupojsvmfxycklmdkjy.supabase.co                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Infrastructure Components

### 1. **Google Cloud Platform (GCP)**

#### Project Details
- **Project ID**: `wissen-publication-group`
- **Project Number**: `285326281784`
- **Region**: `us-central1` (Iowa, USA)

#### Services Used
- **Cloud Run**: Serverless container platform
  - Frontend service: `wissen-frontend`
  - Backend service: `wissen-api`
- **Artifact Registry**: Docker image storage
  - Repository: `wissen-frontend` (us-central1)
  - Repository: `wissen-api` (us-central1)
- **Service Account**: `github-actions-deploy@wissen-publication-group.iam.gserviceaccount.com`

#### Required IAM Roles
The service account has the following roles:
- `roles/run.admin` - Cloud Run Admin
- `roles/iam.serviceAccountUser` - Service Account User
- `roles/storage.admin` - Storage Admin
- `roles/artifactregistry.writer` - Artifact Registry Writer
- `roles/artifactregistry.repositories.admin` - Artifact Registry Repository Administrator

#### Required APIs
- `artifactregistry.googleapis.com` - Artifact Registry API
- `run.googleapis.com` - Cloud Run API
- `cloudbuild.googleapis.com` - Cloud Build API

---

### 2. **Supabase PostgreSQL Database**

#### Connection Details
- **Host**: `db.clupojsvmfxycklmdkjy.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **Username**: `postgres`
- **Password**: Stored in GitHub Secrets as `DATABASE_URL`

#### Connection String Format
```
postgresql://postgres:[PASSWORD]@db.clupojsvmfxycklmdkjy.supabase.co:5432/postgres
```

#### Database Management
- **ORM**: Prisma
- **Migrations**: Automatic on container startup (via `entrypoint.sh`)
- **Schema**: Defined in `backend/prisma/schema.prisma`
- **Migrations Location**: `backend/prisma/migrations/`

#### Database Features
- Automatic migrations on backend container startup
- Connection pooling via Supabase
- SSL/TLS encrypted connections
- Managed backups and high availability

---

### 3. **Docker Images**

#### Frontend Image
- **Repository**: `us-central1-docker.pkg.dev/wissen-publication-group/wissen-frontend/wissen-frontend`
- **Base Image**: `node:20-alpine`
- **Port**: `3000`
- **Build Strategy**: Multi-stage build (deps → builder → runner)
- **Output**: Next.js standalone build

#### Backend Image
- **Repository**: `us-central1-docker.pkg.dev/wissen-publication-group/wissen-api/wissen-api`
- **Base Image**: `node:20-alpine`
- **Port**: `8080` (Cloud Run sets this automatically)
- **Build Strategy**: Multi-stage build (builder → production)
- **Features**: 
  - Automatic Prisma migrations on startup
  - Non-blocking database connection
  - Health check endpoint at `/api/health`

---

## 🔄 Deployment Process

### Automatic Deployment (GitHub Actions)

1. **Trigger**: Push to `main` branch or manual workflow dispatch
2. **Build Phase**:
   - Checkout code
   - Setup Node.js 20
   - Authenticate to Google Cloud
   - Install dependencies
   - Build application
3. **Docker Phase**:
   - Build Docker image
   - Tag with commit SHA and `latest`
   - Push to Artifact Registry
4. **Deploy Phase**:
   - Deploy to Cloud Run with environment variables
   - Update service configuration

### Manual Deployment

#### Frontend
```bash
# Build Docker image
cd frontend
docker build -t us-central1-docker.pkg.dev/wissen-publication-group/wissen-frontend/wissen-frontend:manual .

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/wissen-publication-group/wissen-frontend/wissen-frontend:manual

# Deploy to Cloud Run
gcloud run deploy wissen-frontend \
  --image us-central1-docker.pkg.dev/wissen-publication-group/wissen-frontend/wissen-frontend:manual \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1 \
  --update-env-vars "NEXT_PUBLIC_API_URL=https://wissen-api-285326281784.us-central1.run.app/api"
```

#### Backend
```bash
# Build Docker image
cd backend
docker build -t us-central1-docker.pkg.dev/wissen-publication-group/wissen-api/wissen-api:manual .

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/wissen-publication-group/wissen-api/wissen-api:manual

# Deploy to Cloud Run
gcloud run deploy wissen-api \
  --image us-central1-docker.pkg.dev/wissen-publication-group/wissen-api/wissen-api:manual \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --env-vars-file env-vars.yaml \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10
```

---

## 🤖 GitHub Actions CI/CD

### Workflow File
`.github/workflows/firebase-hosting-merge.yml`

### Workflow Structure

#### Frontend Job (`deploy-frontend`)
1. Checkout code
2. Setup Node.js 20
3. Authenticate to Google Cloud
4. Setup Google Cloud SDK
5. Configure Docker for Artifact Registry
6. Create Artifact Registry repository (if needed)
7. Install frontend dependencies (`npm ci`)
8. Build frontend with `NEXT_PUBLIC_API_URL` environment variable
9. Build Docker image
10. Push Docker image to Artifact Registry
11. Deploy to Cloud Run

#### Backend Job (`deploy-backend`)
1. Checkout code
2. Setup Node.js 20
3. Authenticate to Google Cloud
4. Setup Google Cloud SDK
5. Configure Docker for Artifact Registry
6. Create Artifact Registry repository (if needed)
7. Install backend dependencies (`npm ci`)
8. Generate Prisma Client
9. Verify database connection
10. Build backend (`npm run build`)
11. Build Docker image
12. Push Docker image to Artifact Registry-
13. Deploy to Cloud Run with environment variables

### GitHub Secrets Required

| Secret Name | Description | Example |
|------------|-------------|---------|
| `GCP_SERVICE_ACCOUNT` | Google Cloud service account JSON key | `{"type":"service_account",...}` |
| `GCP_PROJECT_ID` | Google Cloud project ID | `wissen-publication-group` |
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://postgres:...@db.clupojsvmfxycklmdkjy.supabase.co:5432/postgres` |
| `NEXT_PUBLIC_API_URL` | Frontend API base URL | `https://wissen-api-285326281784.us-central1.run.app/api` |

### Workflow Triggers
- **Automatic**: Push to `main` branch
- **Manual**: `workflow_dispatch` (can be triggered from GitHub UI)

---

## 🐳 Docker Images

### Frontend Dockerfile (`frontend/Dockerfile`)

```dockerfile
# Multi-stage build for Next.js SSR
FROM node:20-alpine AS base
FROM base AS deps      # Install dependencies
FROM base AS builder   # Build Next.js
FROM base AS runner    # Production runtime
```

**Key Features**:
- Standalone Next.js build
- Runs as non-root user (`nextjs`)
- Exposes port 3000
- Environment variables set at runtime by Cloud Run

### Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
# Multi-stage build for NestJS
FROM node:20-alpine AS builder  # Build stage
FROM node:20-alpine             # Production stage
```

**Key Features**:
- Automatic Prisma migrations on startup (`entrypoint.sh`)
- Non-blocking database connection
- Health check endpoint
- Exposes port 8080 (Cloud Run manages this)

**Entrypoint Script** (`entrypoint.sh`):
```bash
#!/bin/sh
set -e
echo "🔄 Running database migrations..."
npx prisma migrate deploy || echo "⚠️ Migration failed or already applied"
echo "✅ Migrations completed"
echo "🚀 Starting application..."
exec node dist/src/main.js
```

---

## 🗄️ Database (Supabase PostgreSQL)

### Connection

**Supabase** provides a managed PostgreSQL database with:
- Automatic backups
- High availability
- Connection pooling
- SSL/TLS encryption
- Web dashboard for management

### Prisma ORM

**Schema Location**: `backend/prisma/schema.prisma`

**Key Models**:
- `User` - Admin and journal admin users
- `Journal` - Journal information
- `JournalShortcode` - Journal shortcodes for routing
- `Article` - Articles and manuscripts
- `EditorialBoardMember` - Editorial board members
- `Message` - Contact form messages
- And more...

### Migrations

**Automatic Migrations**:
- Run on every backend container startup
- Command: `npx prisma migrate deploy`
- Location: `backend/Dockerfile` entrypoint script

**Manual Migrations**:
```bash
cd backend
npx prisma migrate dev --name migration_name
npx prisma migrate deploy  # For production
```

### Database Access

**Via Supabase Dashboard**:
- URL: https://supabase.com/dashboard
- Navigate to your project → Database → SQL Editor

**Via psql**:
```bash
psql -h db.clupojsvmfxycklmdkjy.supabase.co \
     -p 5432 \
     -d postgres \
     -U postgres
```

---

## 🔐 Environment Variables

### Frontend (Cloud Run)

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://wissen-api-285326281784.us-central1.run.app/api` | Backend API URL (baked into build) |

### Backend (Cloud Run)

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres:...@db.clupojsvmfxycklmdkjy.supabase.co:5432/postgres` | Supabase connection string |
| `NODE_ENV` | `production` | Node.js environment |
| `CORS_ORIGIN` | `https://wissen-frontend-285326281784.us-central1.run.app,http://localhost:3000,http://localhost:3002` | Allowed CORS origins |
| `PORT` | `8080` | Server port (automatically set by Cloud Run) |

### Local Development

Create `.env.local` files:

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://postgres:password@db.clupojsvmfxycklmdkjy.supabase.co:5432/postgres
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
PORT=3001
```

---

## 🌐 URLs and Endpoints

### Production URLs

#### Frontend
- **URL**: https://wissen-frontend-285326281784.us-central1.run.app
- **Region**: us-central1
- **Service**: wissen-frontend

#### Backend API
- **Base URL**: https://wissen-api-285326281784.us-central1.run.app
- **API Base**: https://wissen-api-285326281784.us-central1.run.app/api
- **Health Check**: https://wissen-api-285326281784.us-central1.run.app/api/health
- **Region**: us-central1
- **Service**: wissen-api

### Key Endpoints

#### Public Endpoints
- `GET /api/journals` - List all journals
- `GET /api/journals/:shortcode` - Get journal by shortcode
- `GET /api/articles` - List articles
- `POST /api/articles/manuscripts` - Submit manuscript
- `POST /api/messages` - Contact form submission
- `GET /api/health` - Health check

#### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `GET /api/admin/users` - List users
- `GET /api/admin/journal-shortcodes` - List journal shortcodes
- `GET /api/admin/submissions` - List manuscript submissions

#### Journal Admin Endpoints
- `POST /api/journal-admin/login` - Journal admin login
- `GET /api/journal-admin/journals/:id` - Get journal details
- `PUT /api/journal-admin/journals/:id` - Update journal
- `POST /api/journal-admin/journals/:id/images` - Upload journal images

### File Uploads
- **Static Files**: `https://wissen-api-285326281784.us-central1.run.app/uploads/[filename]`
- **Upload Endpoint**: `POST /api/articles/:id/upload-pdf`
- **Image Upload**: `POST /api/articles/:id/upload-images`

---

## 🔍 Troubleshooting

### Common Issues

#### 1. **Build Fails - Missing Environment Variable**
**Error**: `NEXT_PUBLIC_API_URL not set`
**Solution**: 
- Verify GitHub Secret `NEXT_PUBLIC_API_URL` is set correctly
- Check workflow logs for environment variable injection
- Ensure secret value ends with `/api`

#### 2. **Database Connection Failed**
**Error**: `Invalid prisma.user.findFirst() invocation: The table public.User does not exist`
**Solution**:
- Check `DATABASE_URL` secret is correct
- Verify database migrations ran: Check backend logs for migration output
- Run migrations manually: `npx prisma migrate deploy`

#### 3. **CORS Errors**
**Error**: `Access to XMLHttpRequest blocked by CORS policy`
**Solution**:
- Verify `CORS_ORIGIN` includes frontend URL
- Check backend logs for CORS configuration
- Ensure frontend URL matches exactly (including protocol)

#### 4. **Container Fails to Start**
**Error**: `The user-provided container failed to start and listen on the port`
**Solution**:
- Check backend logs in Cloud Run console
- Verify `PORT` environment variable (Cloud Run sets this automatically)
- Ensure health endpoint `/api/health` is accessible
- Check database connection is non-blocking

#### 5. **Image Push Fails**
**Error**: `denied: Permission "artifactregistry.repositories.uploadArtifacts" denied`
**Solution**:
- Verify service account has `Artifact Registry Writer` role
- Check Artifact Registry repositories exist
- Verify API is enabled: `artifactregistry.googleapis.com`

### Debugging Commands

#### Check Cloud Run Services
```bash
gcloud run services list --region=us-central1
```

#### View Logs
```bash
# Frontend logs
gcloud run services logs read wissen-frontend --region=us-central1 --limit=50

# Backend logs
gcloud run services logs read wissen-api --region=us-central1 --limit=50
```

#### Check Service Configuration
```bash
gcloud run services describe wissen-frontend --region=us-central1
gcloud run services describe wissen-api --region=us-central1
```

#### Test Database Connection
```bash
cd backend
DATABASE_URL="your-connection-string" npx prisma db pull
```

---

## 💰 Cost Estimation

### Google Cloud Run

#### Frontend Service
- **Memory**: 1 GiB
- **CPU**: 1 vCPU
- **Requests**: Pay per request
- **Estimated Monthly**: ~$5-15 (depending on traffic)

#### Backend Service
- **Memory**: 512 MiB
- **CPU**: 1 vCPU
- **Requests**: Pay per request
- **Estimated Monthly**: ~$3-10 (depending on traffic)

#### Artifact Registry
- **Storage**: ~$0.10/GB/month
- **Estimated Monthly**: ~$1-2

### Supabase

#### PostgreSQL Database
- **Free Tier**: 500 MB database, 2 GB bandwidth
- **Paid Plans**: Starting at $25/month for production
- **Current Plan**: Check Supabase dashboard

### Total Estimated Monthly Cost
- **With Free Tier**: $0-5 (within free tier limits)
- **Production Scale**: $30-50/month (moderate traffic)
- **High Traffic**: $100-200/month

### Cost Optimization Tips
1. Use Cloud Run's automatic scaling (scales to zero when idle)
2. Monitor request counts and optimize API calls
3. Use Supabase connection pooling to reduce database connections
4. Enable Cloud Run min instances = 0 (scale to zero)
5. Monitor Artifact Registry storage and clean old images

---

## 📚 Additional Resources

### Documentation Links
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NestJS Deployment](https://docs.nestjs.com/recipes/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

### Support
- **GitHub Repository**: https://github.com/kamal464/wissen-publication-group
- **Google Cloud Console**: https://console.cloud.google.com
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## 📝 Deployment Checklist

### Initial Setup
- [ ] Create Google Cloud Project
- [ ] Enable required APIs (Artifact Registry, Cloud Run, Cloud Build)
- [ ] Create service account with required roles
- [ ] Create Artifact Registry repositories
- [ ] Set up Supabase PostgreSQL database
- [ ] Configure GitHub Secrets
- [ ] Test local builds

### Before Each Deployment
- [ ] Verify database migrations are up to date
- [ ] Test locally with production environment variables
- [ ] Check GitHub Secrets are correct
- [ ] Review code changes
- [ ] Ensure tests pass (if applicable)

### After Deployment
- [ ] Verify frontend is accessible
- [ ] Test API endpoints
- [ ] Check database connectivity
- [ ] Monitor Cloud Run logs
- [ ] Verify file uploads work
- [ ] Test authentication flows
- [ ] Check CORS configuration

---

**Last Updated**: 2025-11-29  
**Maintained By**: Wissen Publication Group Development Team

