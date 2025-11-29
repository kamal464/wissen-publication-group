# 🚀 Quick Deployment Guide - Wissen Publication Group

## ⚡ Fastest Way to Deploy (Step-by-Step)

### Step 1: Set Up Free PostgreSQL Database (5 minutes)

1. Go to [https://supabase.com](https://supabase.com) and sign up (FREE)
2. Click **"New Project"**
3. Fill in:
   - Name: `wissen-publication-group`
   - Password: Create a strong password (SAVE IT!)
   - Region: Choose closest
4. Wait 2-3 minutes for project creation
5. Go to **Settings** → **Database**
6. Copy the **"URI"** connection string (looks like):
   ```
   postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### Step 2: Set Up Database (2 minutes)

Open terminal in project root:

```bash
cd backend
```

Set environment variable (replace with your Supabase connection string):

**Windows PowerShell:**
```powershell
$env:DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

**Windows CMD:**
```cmd
set DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

**Mac/Linux:**
```bash
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

Then run:
```bash
npx prisma generate
npx prisma migrate deploy
```

### Step 3: Install Firebase CLI (1 minute)

```bash
npm install -g firebase-tools
firebase login
```

### Step 4: Initialize Firebase (2 minutes)

```bash
firebase init hosting
```

**Answer:**
- ✅ Use existing project or create new: **Create new project** → Name: `wissen-publication-group`
- ✅ Public directory: `frontend/.next`
- ✅ Single-page app: **No**
- ✅ Automatic builds: **No**
- ✅ Overwrite index.html: **No**

### Step 5: Install Google Cloud SDK (5 minutes)

1. Download: [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
2. Install it
3. Run:
```bash
gcloud init
gcloud auth login
```

### Step 6: Deploy Backend to Cloud Run (5 minutes)

```bash
cd backend

# Replace YOUR_PROJECT_ID with your Google Cloud project ID
gcloud config set project YOUR_PROJECT_ID

# Build and deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/wissen-api

# Deploy (replace [YOUR-PASSWORD] and db.xxxxx with your Supabase details)
gcloud run deploy wissen-api \
  --image gcr.io/YOUR_PROJECT_ID/wissen-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres,PORT=8080,NODE_ENV=production" \
  --memory 512Mi \
  --cpu 1
```

**Save the URL** you get (like: `https://wissen-api-xxxxx.run.app`)

### Step 7: Deploy Frontend to Cloud Run (5 minutes)

```bash
cd frontend

# Create .env.production file
echo "NEXT_PUBLIC_API_URL=https://wissen-api-xxxxx.run.app" > .env.production

# Build and deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/wissen-frontend

gcloud run deploy wissen-frontend \
  --image gcr.io/YOUR_PROJECT_ID/wissen-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1
```

**Save the URL** you get (like: `https://wissen-frontend-xxxxx.run.app`)

### Step 8: Update Firebase Hosting (Optional - for custom domain)

If you want to use Firebase Hosting as a CDN:

1. Update `firebase.json`:
```json
{
  "hosting": {
    "public": "frontend/.next",
    "rewrites": [
      {
        "source": "**",
        "destination": "https://wissen-frontend-xxxxx.run.app"
      }
    ]
  }
}
```

2. Deploy:
```bash
firebase deploy --only hosting
```

---

## ✅ You're Done!

- **Frontend**: `https://wissen-frontend-xxxxx.run.app`
- **Backend API**: `https://wissen-api-xxxxx.run.app/api`
- **Database**: Supabase (free tier)

## 💰 Total Cost: $0/month

All services are on free tiers:
- Supabase: 500MB database, unlimited requests
- Cloud Run: 2M requests/month
- Firebase Hosting: 10GB storage, 360MB/day

---

## 🔄 Update After Code Changes

**Backend:**
```bash
cd backend
npm run build
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/wissen-api
gcloud run deploy wissen-api --image gcr.io/YOUR_PROJECT_ID/wissen-api
```

**Frontend:**
```bash
cd frontend
npm run build
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/wissen-frontend
gcloud run deploy wissen-frontend --image gcr.io/YOUR_PROJECT_ID/wissen-frontend
```

---

## 🆘 Need Help?

1. Check Cloud Run logs: `gcloud run services logs read wissen-api`
2. Check Supabase dashboard: [https://app.supabase.com](https://app.supabase.com)
3. Check Firebase console: [https://console.firebase.google.com](https://console.firebase.google.com)

