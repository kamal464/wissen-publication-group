# Quick Fix for API Connection Timeout

## Problem
The frontend is trying to connect to `http://54.165.116.208:3001/api` but port 3001 is not exposed. It should use port 80 via Nginx: `http://54.165.116.208/api`

## Solution

### Option 1: Run Quick Fix Script (Recommended)

Copy and paste this entire command block into your EC2 browser terminal:

```bash
INSTANCE_IP="54.165.116.208" && cd /var/www/wissen-publication-group && echo "NEXT_PUBLIC_API_URL=http://$INSTANCE_IP/api" > frontend/.env.production && echo "✅ Updated API URL" && cd frontend && npm run build && echo "✅ Frontend rebuilt" && cd /var/www/wissen-publication-group && pm2 restart wissen-frontend && echo "✅ Services restarted" && pm2 status
```

### Option 2: Step-by-Step Fix

Run these commands one by one in your EC2 browser terminal:

```bash
# 1. Navigate to project
cd /var/www/wissen-publication-group

# 2. Update frontend environment file
echo "NEXT_PUBLIC_API_URL=http://54.165.116.208/api" > frontend/.env.production

# 3. Rebuild frontend
cd frontend
npm run build

# 4. Restart frontend service
cd /var/www/wissen-publication-group
pm2 restart wissen-frontend

# 5. Check status
pm2 status
```

## Verify Fix

After running the fix:

1. **Check PM2 status**: Both `wissen-backend` and `wissen-frontend` should be `online`
2. **Test backend directly**: `curl http://localhost:3001/api/health`
3. **Test via Nginx**: `curl http://localhost/api/health`
4. **Visit in browser**: http://54.165.116.208

## Why This Happened

The deployment script incorrectly set:
- ❌ `NEXT_PUBLIC_API_URL=http://54.165.116.208:3001/api` (port 3001 not exposed)

It should be:
- ✅ `NEXT_PUBLIC_API_URL=http://54.165.116.208/api` (port 80 via Nginx)

Nginx proxies `/api` requests to `localhost:3001`, so the frontend should call port 80, not 3001.

## After Fix

The frontend will now correctly call:
- `http://54.165.116.208/api/admin/login` ✅
- Instead of: `http://54.165.116.208:3001/api/admin/login` ❌

