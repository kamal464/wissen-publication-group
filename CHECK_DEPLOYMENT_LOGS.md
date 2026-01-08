# 🔍 How to Check Deployment Logs

## Critical: Check These Sections in GitHub Actions

Go to: https://github.com/kamal464/wissen-publication-group/actions

Click on the **latest workflow run**, then look for these sections:

### 1. **"Deploy to EC2" Step** - Look for:

#### Step 4: Restarting Services
- Look for: `📊 PM2 List Output:`
- Should show both `wissen-backend` and `wissen-frontend`
- Check if status is `online` or `errored`

#### Port Verification
- Look for: `✅ Backend is listening on port 3001`
- Look for: `✅ Frontend is listening on port 3000`
- If you see `❌ ERROR: Backend is NOT listening`, check the logs shown

#### Final Check Before Ending SSH
- Look for: `🔍 FINAL CHECK: Verifying services before ending deployment...`
- Should show: `✅ Backend is online` and `✅ Frontend is online`
- Should show: `Backend localhost:3001/api/health = HTTP 200`
- Should show: `Frontend localhost:3000 = HTTP 200`

### 2. **"Verify deployment" Step** - Look for:

#### SSH Check
- Look for: `Checking PM2 status via SSH...`
- Should show PM2 status and port status
- Should show localhost tests

---

## What to Look For

### ✅ Success Indicators:
- `✅ Both processes found in PM2`
- `✅ Backend is listening on port 3001`
- `✅ Frontend is listening on port 3000`
- `✅ Backend is online`
- `✅ Frontend is online`
- `Backend localhost:3001/api/health = HTTP 200`
- `Frontend localhost:3000 = HTTP 200`

### ❌ Failure Indicators:
- `❌ ERROR: wissen-backend not found in PM2!`
- `❌ ERROR: Backend is NOT listening on port 3001!`
- `❌ CRITICAL: Backend is NOT online!`
- `Backend localhost:3001/api/health = HTTP 000` or `failed`
- PM2 logs showing errors

---

## If Services Aren't Starting

### Check PM2 Logs:
The deployment should show PM2 logs if services fail. Look for:
- `Backend logs:`
- `Frontend logs:`

Common errors:
- `Error: Cannot find module...` - Missing dependencies
- `EADDRINUSE` - Port already in use
- `ENOENT` - File not found
- Build errors

### Check Port Status:
Look for: `Port listening status:`
- Should show ports 3000 and 3001 are listening
- If not, services aren't starting

---

## Next Steps

1. **Check the deployment logs** in GitHub Actions
2. **Look for the sections above** to see what's failing
3. **Copy the error messages** from PM2 logs
4. **Share the relevant log sections** so we can fix the issue

The deployment now has comprehensive diagnostics - it will show exactly why services aren't starting!

