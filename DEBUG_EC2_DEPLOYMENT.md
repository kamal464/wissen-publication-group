# Debug EC2 Deployment Not Updating

## Problem
Google Cloud Run updates after GitHub Actions jobs, but AWS EC2 is not updating.

## Quick Checks

### 1. Is the EC2 Workflow Running?

Go to: **GitHub Repo → Actions**

Check if "Deploy to AWS EC2" workflow is:
- ✅ Running (green/yellow)
- ❌ Not running at all
- ❌ Failing (red)

### 2. Check Workflow Logs

If the workflow is running, check the logs for:

**Look for these success messages:**
- ✅ "SSH key file created successfully"
- ✅ "SSH setup complete"
- ✅ "Current commit: [hash]"
- ✅ "Backend built successfully"
- ✅ "Frontend built successfully"
- ✅ "Services restarted"
- ✅ "Deployment complete"

**Look for these errors:**
- ❌ "Permission denied (publickey)" - SSH key issue
- ❌ "error in libcrypto" - SSH key format issue
- ❌ Build failures
- ❌ PM2 restart failures

### 3. Verify on EC2

SSH into EC2 and check manually:

```bash
# Check current commit
cd /var/www/wissen-publication-group
git log -1 --oneline

# Check if code matches GitHub
git fetch origin
git status

# Check PM2 status
pm2 status

# Check if services are running
pm2 logs wissen-backend --lines 10
pm2 logs wissen-frontend --lines 10

# Check build timestamps
ls -la frontend/.next/BUILD_ID 2>/dev/null || echo "No build found"
ls -la backend/dist/main.js 2>/dev/null || echo "No backend build found"
```

### 4. Force Manual Deployment

If workflow isn't running, deploy manually:

```bash
cd /var/www/wissen-publication-group
git fetch origin
git reset --hard origin/main
git clean -fd

# Backend
cd backend
npm ci
npx prisma generate
npm run build

# Frontend
cd ../frontend
npm ci
rm -rf .next
npm run build

# Restart
cd /var/www/wissen-publication-group
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

## Common Issues

### Issue 1: Workflow Not Triggering

**Symptom:** No "Deploy to AWS EC2" workflow runs

**Fix:**
- Check if workflow file exists: `.github/workflows/deploy-ec2.yml`
- Verify it's on `main` branch
- Manually trigger: Actions → Deploy to AWS EC2 → Run workflow

### Issue 2: SSH Authentication Failing

**Symptom:** "Permission denied (publickey)" in logs

**Fix:**
- Verify `EC2_SSH_PRIVATE_KEY` in GitHub Secrets
- Make sure key has `-----BEGIN` and `-----END` markers
- Test SSH manually from your computer

### Issue 3: PM2 Not Restarting

**Symptom:** Code pulled but services not updated

**Fix:**
- PM2 might be caching old code
- Force restart: `pm2 delete all && pm2 start ecosystem.config.js`
- Check PM2 logs for errors

### Issue 4: Build Cache Issues

**Symptom:** Old code still running after build

**Fix:**
- Clear Next.js cache: `rm -rf frontend/.next`
- Clear backend build: `rm -rf backend/dist`
- Rebuild and restart

## Verification Steps

After deployment, verify:

1. **Check deployment badge** (if added):
   - Should show new timestamp
   - Visit: http://54.165.116.208

2. **Check commit hash**:
   ```bash
   cd /var/www/wissen-publication-group
   git rev-parse --short HEAD
   ```
   Should match latest commit on GitHub

3. **Check service uptime**:
   ```bash
   pm2 status
   ```
   Uptime should be recent (not hours/days old)

4. **Test API**:
   ```bash
   curl http://54.165.116.208/api/health
   ```

## Next Steps

1. Check GitHub Actions logs for the latest run
2. If workflow failed, fix the error
3. If workflow succeeded but code not updated, check PM2 and build directories
4. Force manual deployment if needed

