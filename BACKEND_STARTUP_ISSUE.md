# Backend Startup Issue - Troubleshooting Guide

## The Problem

The backend container is failing to start and listen on port 8080 within the Cloud Run timeout.

## Possible Causes

1. **Database Connection Failure**
   - The `DATABASE_URL` might be incorrect or the database might not be accessible
   - Check if Supabase allows connections from Cloud Run IPs

2. **Startup Timeout**
   - The app might be taking too long to initialize
   - I've increased the timeout to 300 seconds

3. **Missing Environment Variables**
   - `DATABASE_URL` might not be set correctly
   - Check GitHub secrets

## Solutions Applied

1. ✅ Increased Cloud Run timeout to 300 seconds
2. ✅ Added comprehensive error logging to backend startup
3. ✅ Added error handling to catch startup failures

## Next Steps

### 1. Check Cloud Run Logs

After the next deployment, check the logs:
1. Go to: https://console.cloud.google.com/run?project=wissen-publication-group
2. Click on `wissen-api` service
3. Click "Logs" tab
4. Look for error messages

### 2. Verify DATABASE_URL Secret

1. Go to: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
2. Check `DATABASE_URL` secret
3. It should be in format: `postgresql://user:password@host:port/database?sslmode=require`

### 3. Test Database Connection

The DATABASE_URL should be:
```
postgresql://postgres:oOL7KbQaBQ1zQdRz@db.clupojsvmfxycklmdkjy.supabase.co:5432/postgres?sslmode=require
```

### 4. Check Supabase Settings

1. Go to your Supabase project
2. Check "Settings" → "Database"
3. Ensure "Connection pooling" is configured correctly
4. Check if there are any IP restrictions

## What the Logs Will Show

With the new error handling, you should see:
- `🚀 Starting Wissen Publication Group API...`
- `📊 Environment: production`
- `🔌 PORT: 8080` (set by Cloud Run)
- `💾 DATABASE_URL: Set` or `Not set`
- Any error messages if startup fails

## If Database Connection Fails

The backend uses Prisma. If the database connection fails, you might see:
- Prisma connection errors
- Timeout errors
- SSL certificate errors

Make sure:
1. DATABASE_URL includes `?sslmode=require` for Supabase
2. The password is correct
3. Supabase allows connections from Cloud Run

## Re-deploy and Check Logs

After the next deployment:
1. Wait for deployment to complete (or fail)
2. Check Cloud Run logs immediately
3. Look for the startup messages and any errors
4. Share the error logs if the issue persists

