# ⚠️ BACKEND RESTART REQUIRED

## Issue
The `/api/news/latest` endpoint is returning 404 because the backend server needs to be restarted to load the `NewsModule`.

## Quick Fix

### 1. Stop the Backend Server
If the backend is running, press `Ctrl+C` in the terminal where it's running.

### 2. Restart the Backend Server
```bash
cd backend
npm run start:dev
```

### 3. Wait for Server to Start
Look for this message in the console:
```
✅ Wissen Publication Group API running on http://0.0.0.0:3001/api
```

### 4. Test the Endpoint
Once restarted, test the endpoint:

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/news/latest?limit=5" -Method GET
```

**Or in browser:**
Open: `http://localhost:3001/api/news/latest?limit=5`

You should see a JSON response (empty array `[]` if no news items exist yet).

## Why This Happens

NestJS needs to restart to:
- Load the new `NewsModule` 
- Register the `NewsController` routes
- Make the `/api/news/latest` endpoint available

## After Restart

The frontend will automatically:
- ✅ Load news in `TopNewsBar`
- ✅ Display news in `LatestNewsSection` on homepage
- ✅ Stop showing 404 errors

## Optional: Seed Sample News

If you want to add sample news items:

```bash
cd backend
npx ts-node prisma/seed-news.ts
```

This will add 5 sample news items to the database.

