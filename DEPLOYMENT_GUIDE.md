# 🚀 Wissen Publication Group - Firebase Deployment Guide

This guide will help you deploy your application to Firebase Hosting (frontend) and use a free PostgreSQL database.

## 📋 Prerequisites

1. **Node.js** (v20 or higher) installed
2. **Firebase CLI** installed: `npm install -g firebase-tools`
3. **Git** installed
4. **A free PostgreSQL database** (we'll use **Supabase** - completely free tier)

---

## 🗄️ Step 1: Set Up Free PostgreSQL Database (Supabase)

### 1.1 Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** and sign up (free)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `wissen-publication-group`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - Click **"Create new project"** (takes 2-3 minutes)

### 1.2 Get Database Connection String
1. In your Supabase project, go to **Settings** → **Database**
2. Scroll to **"Connection string"**
3. Copy the **"URI"** connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
4. **Save this connection string** - you'll need it later!

### 1.3 Run Database Migrations
1. Open terminal in your project root
2. Navigate to backend:
   ```bash
   cd backend
   ```
3. Set your database URL:
   ```bash
   # Windows PowerShell
   $env:DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
   
   # Windows CMD
   set DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   
   # Mac/Linux
   export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
   ```
4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
5. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
6. (Optional) Seed database:
   ```bash
   npx prisma db seed
   ```

---

## 🔥 Step 2: Set Up Firebase

### 2.1 Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2.2 Login to Firebase
```bash
firebase login
```
This will open your browser - login with your Google account.

### 2.3 Initialize Firebase Project
```bash
# From project root
firebase init hosting
```

**Answer the prompts:**
- ✅ **Select "Use an existing project"** or create a new one
- ✅ **Public directory**: `frontend/.next`
- ✅ **Configure as single-page app**: **No**
- ✅ **Set up automatic builds**: **No** (we'll build manually)
- ✅ **File `frontend/.next/index.html` already exists. Overwrite?**: **No**

---

## 🏗️ Step 3: Build the Application

### 3.1 Build Backend
```bash
cd backend
npm install
npm run build
cd ..
```

### 3.2 Build Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

---

## 🌐 Step 4: Deploy Backend (Using Google Cloud Run - Free Tier)

### 4.1 Install Google Cloud SDK
1. Download from: [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
2. Install and run `gcloud init`
3. Login: `gcloud auth login`

### 4.2 Build and Deploy Backend
```bash
cd backend

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Build Docker image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/wissen-api

# Deploy to Cloud Run (FREE TIER)
gcloud run deploy wissen-api \
  --image gcr.io/YOUR_PROJECT_ID/wissen-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres,PORT=8080,NODE_ENV=production" \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

**Note**: Cloud Run free tier includes:
- 2 million requests/month
- 360,000 GB-seconds memory
- 180,000 vCPU-seconds

### 4.3 Get Your Backend URL
After deployment, you'll get a URL like:
```
https://wissen-api-xxxxx.run.app
```
**Save this URL** - you'll need it for the frontend!

---

## 🎨 Step 5: Deploy Frontend to Firebase

### 5.1 Update Frontend Environment
1. Create `frontend/.env.production`:
   ```env
   NEXT_PUBLIC_API_URL=https://wissen-api-xxxxx.run.app
   ```

2. Rebuild frontend:
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

### 5.2 Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

**Your site will be live at**: `https://wissen-publication-group.web.app` (or your project name)

---

## 🔧 Step 6: Configure Environment Variables

### For Local Development

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### For Production

**Backend** (Cloud Run environment variables - set via gcloud):
- `DATABASE_URL`: Your Supabase connection string
- `PORT`: 8080
- `NODE_ENV`: production
- `CORS_ORIGIN`: Your Firebase hosting URL

**Frontend** (`frontend/.env.production`):
```env
NEXT_PUBLIC_API_URL=https://wissen-api-xxxxx.run.app
```

---

## 📝 Step 7: Update Database Connection in Production

If you need to update the database connection later:

```bash
gcloud run services update wissen-api \
  --update-env-vars "DATABASE_URL=postgresql://postgres:[NEW-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

---

## 🧪 Step 8: Test Your Deployment

1. **Frontend**: Visit `https://wissen-publication-group.web.app`
2. **Backend API**: Visit `https://wissen-api-xxxxx.run.app/api/journals`
3. **Test database**: Try creating a journal in the admin panel

---

## 🔄 Step 9: Update Deployment (After Code Changes)

### Update Backend:
```bash
cd backend
npm run build
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/wissen-api
gcloud run deploy wissen-api --image gcr.io/YOUR_PROJECT_ID/wissen-api
```

### Update Frontend:
```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

---

## 💰 Cost Breakdown (100% FREE)

- **Supabase PostgreSQL**: Free tier (500MB database, unlimited API requests)
- **Firebase Hosting**: Free tier (10GB storage, 360MB/day transfer)
- **Cloud Run**: Free tier (2M requests/month, 360K GB-seconds)

**Total Cost: $0/month** ✅

---

## 🐛 Troubleshooting

### Database Connection Issues
- Check your Supabase connection string
- Ensure database password is correct
- Verify Supabase project is active

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 20+)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

### Deployment Errors
- Check Firebase login: `firebase login`
- Verify project ID: `firebase projects:list`
- Check Cloud Run logs: `gcloud run services logs read wissen-api`

---

## 📞 Support

If you encounter issues:
1. Check Firebase console: [https://console.firebase.google.com](https://console.firebase.google.com)
2. Check Supabase dashboard: [https://app.supabase.com](https://app.supabase.com)
3. Check Cloud Run logs in Google Cloud Console

---

## ✅ Deployment Checklist

- [ ] Created Supabase account and database
- [ ] Got database connection string
- [ ] Ran Prisma migrations
- [ ] Installed Firebase CLI
- [ ] Initialized Firebase project
- [ ] Built backend application
- [ ] Deployed backend to Cloud Run
- [ ] Got backend URL
- [ ] Updated frontend environment variables
- [ ] Built frontend application
- [ ] Deployed frontend to Firebase Hosting
- [ ] Tested the live application

**Congratulations! Your application is now live! 🎉**

