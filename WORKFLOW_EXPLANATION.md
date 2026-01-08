# 📋 GitHub Actions Workflows Explained

## Available Workflows

### 1. **Deploy to AWS EC2** (Main Deployment)
- **File**: `.github/workflows/deploy-ec2.yml`
- **Triggers**: 
  - ✅ Automatically on push to `main` branch
  - ✅ Manual trigger via "Run workflow" button
- **Purpose**: Full deployment to EC2
- **This is the main workflow you should see running**

### 2. **Test EC2 Connection** (Testing Only)
- **File**: `.github/workflows/test-ec2-connection.yml`
- **Triggers**: 
  - Manual trigger only (for testing)
- **Purpose**: Quick test to verify SSH connection works
- **This is just for troubleshooting**

### 3. **Other Workflows** (Disabled)
- `firebase-hosting-merge.yml` - DISABLED (using EC2)
- `deploy.yml` - DISABLED
- `firebase-deploy.yml` - DISABLED
- `firebase-hosting-pull-request.yml` - For PRs only

---

## What You Should See

### In GitHub Actions Tab:
1. **"Deploy to AWS EC2"** - Should run automatically on every push to `main`
2. **"Test EC2 Connection"** - Only appears when manually triggered

### Workflow Graph:
- Should show "Deploy to AWS EC2" running after each push
- May show "Test EC2 Connection" if you manually triggered it

---

## If "Deploy to AWS EC2" Isn't Running

1. **Check if you pushed to `main` branch**
   - Workflow only triggers on `main` branch
   - Check: `git branch` (should show `* main`)

2. **Manually trigger it**:
   - Go to: https://github.com/kamal464/wissen-publication-group/actions
   - Click "Deploy to AWS EC2"
   - Click "Run workflow"
   - Select branch: `main`
   - Click "Run workflow"

3. **Check workflow file exists**:
   - Go to: https://github.com/kamal464/wissen-publication-group/tree/main/.github/workflows
   - Should see `deploy-ec2.yml`

---

## Summary

- **Main workflow**: "Deploy to AWS EC2" - runs on push to main
- **Test workflow**: "Test EC2 Connection" - manual only, for troubleshooting
- If you only see "Test EC2 Connection", the main workflow might not be triggering

Make sure you're pushing to the `main` branch to trigger the main deployment workflow!

