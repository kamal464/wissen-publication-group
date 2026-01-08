# 🔧 Troubleshooting Deployment Issues

## Current Issue
External health checks are failing (HTTP 000000), meaning services aren't accessible from outside EC2.

## What to Check

### Step 1: Check "Diagnostic Check" Step in GitHub Actions

1. Go to: https://github.com/kamal464/wissen-publication-group/actions
2. Click on the **latest workflow run**
3. Find the **"Diagnostic Check"** step (it runs even if deployment fails)
4. Expand it and look for:

#### Critical Information:
- **PM2 Status** - Are processes showing as "online" or "errored"?
- **Port Status** - Are ports 3000 and 3001 listening?
- **Process Status** - Are node processes running?
- **Localhost Tests** - Do localhost endpoints work?
- **PM2 Logs** - What errors are shown?

### Step 2: Check "Deploy to EC2" Step

Look for these sections:

#### "STEP 4: RESTARTING SERVICES"
- `📊 PM2 List Output:` - Should show both processes
- `Backend status:` - Should be "online"
- `Frontend status:` - Should be "online"

#### "Verifying services are listening on ports..."
- Should show: `✅ Backend is listening on port 3001`
- Should show: `✅ Frontend is listening on port 3000`

#### "FINAL CHECK: Verifying services before ending deployment..."
- Should show: `✅ Backend is online`
- Should show: `✅ Frontend is online`
- Should show: `Backend localhost:3001/api/health = HTTP 200`
- Should show: `Frontend localhost:3000 = HTTP 200`

---

## Common Issues and Solutions

### Issue 1: PM2 Processes Not Starting

**Symptoms:**
- PM2 status shows processes as "errored" or "stopped"
- Ports 3000/3001 not listening

**Check PM2 Logs:**
Look for error messages like:
- `Error: Cannot find module...` - Missing dependencies
- `EADDRINUSE` - Port already in use
- `ENOENT` - File not found
- Build errors

**Solution:**
Check the PM2 logs shown in the diagnostic output. Common fixes:
- Reinstall dependencies: `cd backend && npm install`
- Check if ports are in use: `sudo lsof -i :3000 -i :3001`
- Verify build files exist: `ls -lh backend/dist/main.js`

### Issue 2: Services Start But Then Crash

**Symptoms:**
- PM2 shows processes as "online" initially
- But then they become "errored" or "stopped"
- Ports stop listening

**Check:**
- PM2 logs will show the crash reason
- Look for runtime errors in the logs

### Issue 3: Services Work on Localhost But Not Externally

**Symptoms:**
- Localhost tests return HTTP 200
- External health checks return HTTP 000

**Possible Causes:**
- Security group not allowing port 80
- Nginx not configured correctly
- Firewall blocking connections

**Solution:**
- Check EC2 security group allows HTTP (port 80) from 0.0.0.0/0
- Check Nginx is running: `sudo systemctl status nginx`
- Check Nginx config: `sudo nginx -t`

---

## What to Share

Please share the output from:

1. **"Diagnostic Check" step** - This shows the current state
2. **"Deploy to EC2" step** - Specifically:
   - PM2 status output
   - Port listening status
   - Any error messages
   - PM2 logs if shown

---

## Quick Manual Check

If you have SSH access to EC2, run:

```bash
ssh ubuntu@54.165.116.208
cd /var/www/wissen-publication-group
bash diagnose-ec2.sh
```

Or manually:
```bash
pm2 status
pm2 list
pm2 logs wissen-backend --lines 30
pm2 logs wissen-frontend --lines 30
netstat -tln | grep -E ":3000|:3001"
curl http://localhost:3001/api/health
curl http://localhost:3000
```

---

## Next Steps

1. **Check the "Diagnostic Check" step** in GitHub Actions
2. **Copy the output** and share it
3. **Check the "Deploy to EC2" step** for any error messages
4. **Share the relevant sections** so we can identify the issue

The diagnostic check will show exactly what's wrong!
