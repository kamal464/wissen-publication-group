# 📚 Deployment Documentation References
## Current vs Legacy Documents

---

## ✅ **CURRENT - AWS EC2 Deployment (Use These)**

### Primary Documentation
- **DEPLOYMENT_DOCUMENTATION.md** ⭐ - Main deployment guide (AWS EC2)
- **TROUBLESHOOT_DEPLOYMENT.md** ⭐ - Troubleshooting guide (AWS EC2)
- **EC2_DEPLOYMENT_GUIDE.md** - Detailed EC2 setup guide
- **DEPLOYMENT_STRATEGY.md** - Current deployment strategy overview

### AWS-Specific Guides
- **AWS_EC2_QUICK_START.md** - Quick start guide for EC2
- **AWS_S3_CLOUDFRONT_SETUP.md** - S3 and CloudFront setup
- **EC2_INSTANCE_INFO.md** - EC2 instance details
- **EC2_BROWSER_COMMANDS.md** - Browser-based EC2 commands

### GitHub Actions
- **GITHUB_ACTIONS_EC2_SETUP.md** - GitHub Actions setup for EC2
- **GITHUB_SECRETS_CHECKLIST.md** - Required GitHub secrets
- **CHECK_GITHUB_ACTIONS.md** - How to check GitHub Actions

### Deployment Scripts (Active)
- **deploy-ec2.sh** - EC2 deployment script
- **deploy-to-ec2.ps1** - PowerShell EC2 deployment
- **instant-deploy.sh** - Quick deployment script
- **ecosystem.config.js** - PM2 configuration

---

## ❌ **LEGACY - Old Deployment Methods (Ignore/Archive)**

### Google Cloud Run (No Longer Used)
- **DEPLOYMENT_DOCUMENTATION.md** (old version) - Had GCP/Cloud Run info
- **GCP_COST_ESTIMATE.md** - GCP cost analysis
- **GCP_COST_ANALYSIS.md** - GCP cost details
- **SETUP_GCP_SECRETS.md** - GCP secrets setup
- **SETUP_GCP_APIS.md** - GCP API setup
- **ENABLE_GCP_APIS.md** - Enable GCP APIs
- **CREATE_REPOSITORIES_MANUAL.md** - GCP repository creation
- **create-gcr-repositories.sh** - GCP repository script
- **create-gcr-repositories.ps1** - GCP repository PowerShell
- **run-gcloud-commands.ps1** - GCP gcloud commands
- **CLOUD_RUN_FILE_STORAGE_ISSUE.md** - Cloud Run issues

### Firebase (No Longer Used)
- **FIREBASE_DEPLOYMENT_FIX.md** - Firebase deployment fixes
- **FIREBASE_DEPLOYMENT_NOTE.md** - Firebase notes
- **SETUP_FIREBASE_SECRETS.md** - Firebase secrets
- **firebase.json** - Firebase configuration

### Supabase (No Longer Used - Using Local PostgreSQL)
- Any references to Supabase in deployment docs
- Database is now local PostgreSQL on EC2

---

## 📋 **Documentation by Category**

### Setup & Installation
- ✅ **EC2_DEPLOYMENT_GUIDE.md** - Complete EC2 setup
- ✅ **AWS_EC2_QUICK_START.md** - Quick start
- ✅ **setup-ec2.sh** - EC2 setup script
- ❌ **INSTALL_GCLOUD_CLI.md** - GCP (legacy)

### Deployment Process
- ✅ **DEPLOYMENT_DOCUMENTATION.md** - Main guide
- ✅ **DEPLOYMENT_STRATEGY.md** - Strategy overview
- ✅ **DEPLOYMENT_STEPS_CLI.md** - CLI deployment steps
- ✅ **INSTANT_DEPLOY.md** - Quick deploy guide
- ❌ **SSR_DEPLOYMENT_GUIDE.md** - Old SSR guide (may have GCP refs)

### Troubleshooting
- ✅ **TROUBLESHOOT_DEPLOYMENT.md** - Main troubleshooting
- ✅ **DEBUG_EC2_DEPLOYMENT.md** - EC2 debugging
- ✅ **CHECK_DEPLOYMENT_STATUS.md** - Status checks
- ✅ **CHECK_DEPLOYMENT_LOGS.md** - Log checking
- ✅ **DEPLOYMENT_VERIFICATION_GUIDE.md** - Verification steps

### Monitoring & Status
- ✅ **DEPLOYMENT_STATUS.md** - Current status
- ✅ **HOW_TO_SEE_DEPLOYMENT_LOGS.md** - Log viewing
- ✅ **DEPLOYMENT_VERIFICATION_GUIDE.md** - Verification

### Database
- ✅ **DEPLOY_DB_CHANGES.md** - Database deployment
- ✅ **DATABASE_MIGRATION_GUIDE.md** - Migration guide
- ❌ Any Supabase references (legacy)

### Domain & DNS
- ✅ **SETUP_GODADDY_DOMAIN.md** - GoDaddy domain setup
- ✅ **MAP_GODADDY_DOMAIN.md** - Domain mapping
- ✅ **setup-domain.sh** - Domain setup script

### AWS Services
- ✅ **AWS_S3_CLOUDFRONT_SETUP.md** - S3/CloudFront
- ✅ **AWS_EC2_QUICK_START.md** - EC2 quick start
- ✅ **aws-cli-setup.md** - AWS CLI setup
- ✅ **IAM_PERMISSIONS_UPDATE.md** - IAM permissions

### Scripts & Automation
- ✅ **deploy-ec2.sh** - Main deployment script
- ✅ **deploy-to-ec2.ps1** - PowerShell deployment
- ✅ **instant-deploy.sh** - Quick deploy
- ✅ **ecosystem.config.js** - PM2 config
- ✅ **start-services.sh** - Service startup
- ✅ **nginx-wissen.conf** - Nginx configuration

---

## 🗂️ **Recommended File Organization**

### Keep (Current AWS)
```
✅ DEPLOYMENT_DOCUMENTATION.md
✅ TROUBLESHOOT_DEPLOYMENT.md
✅ EC2_DEPLOYMENT_GUIDE.md
✅ DEPLOYMENT_STRATEGY.md
✅ AWS_EC2_QUICK_START.md
✅ AWS_S3_CLOUDFRONT_SETUP.md
✅ GITHUB_ACTIONS_EC2_SETUP.md
✅ deploy-ec2.sh
✅ ecosystem.config.js
✅ nginx-wissen.conf
```

### Archive (Legacy - Can Delete)
```
❌ GCP_COST_ESTIMATE.md
❌ GCP_COST_ANALYSIS.md
❌ SETUP_GCP_SECRETS.md
❌ FIREBASE_DEPLOYMENT_FIX.md
❌ FIREBASE_DEPLOYMENT_NOTE.md
❌ firebase.json
❌ create-gcr-repositories.sh
❌ create-gcr-repositories.ps1
❌ run-gcloud-commands.ps1
```

### Review (May Have Mixed Content)
```
⚠️ DEPLOYMENT_GUIDE.md - Check for GCP references
⚠️ DEPLOYMENT_SUMMARY.md - Check content
⚠️ QUICK_DEPLOY_GUIDE.md - Check content
⚠️ DEPLOYMENT_READY.md - Check content
```

---

## 🔍 **How to Identify Legacy Documents**

Look for these keywords (indicates legacy):
- "Google Cloud" or "GCP"
- "Cloud Run"
- "Artifact Registry"
- "gcloud" commands
- "Firebase"
- "Supabase" (for database)
- "wissen-publication-group" GCP project
- Port 8080 (Cloud Run default)

Current AWS keywords:
- "EC2"
- "AWS"
- "S3"
- "CloudFront"
- "PM2"
- "Nginx"
- Port 3000/3001
- Instance ID: i-016ab2b939f5f7a3b

---

## 📝 **Quick Reference**

### For Deployment
1. Read: **DEPLOYMENT_DOCUMENTATION.md**
2. Follow: **EC2_DEPLOYMENT_GUIDE.md**
3. Use: **deploy-ec2.sh** or GitHub Actions

### For Troubleshooting
1. Read: **TROUBLESHOOT_DEPLOYMENT.md**
2. Check: **DEBUG_EC2_DEPLOYMENT.md**
3. Verify: **CHECK_DEPLOYMENT_STATUS.md**

### For Setup
1. Follow: **AWS_EC2_QUICK_START.md**
2. Configure: **AWS_S3_CLOUDFRONT_SETUP.md**
3. Setup: **GITHUB_ACTIONS_EC2_SETUP.md**

---

## 🧹 **Cleanup Recommendations**

### Safe to Delete
- All GCP-related markdown files
- All Firebase-related files
- Old Cloud Run scripts
- Supabase references (if using local PostgreSQL)

### Keep for Reference (Archive)
- Move legacy docs to `/archive/legacy-deployment/` folder
- Or add `_LEGACY` suffix to filenames

### Update Required
- Any document mentioning Google Cloud Run
- Any document mentioning Firebase
- Any document mentioning Supabase (if not using it)
- GitHub workflow files (keep only deploy-ec2.yml)

---

**Last Updated**: 2025-01-20  
**Current Platform**: AWS EC2  
**Legacy Platforms**: Google Cloud Run, Firebase (no longer used)
