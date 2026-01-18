# GitHub Actions Auto-Deployment to AWS EC2

## Overview

This guide sets up automatic deployment to your AWS EC2 instance whenever you push code to the `main` branch.

---

## Prerequisites

1. ✅ EC2 instance running and accessible
2. ✅ SSH access to EC2 instance
3. ✅ GitHub repository with Actions enabled

---

## Step 1: Generate SSH Key Pair (if you don't have one)

### Option A: Use Existing SSH Key

If you already have an SSH key pair that works with EC2, use that.

### Option B: Create New SSH Key for GitHub Actions

On your local machine or EC2:

```bash
ssh-keygen -t rsa -b 4096 -C "github-actions-ec2" -f ~/.ssh/github_actions_ec2
```

This creates:
- `~/.ssh/github_actions_ec2` (private key - add to GitHub Secrets)
- `~/.ssh/github_actions_ec2.pub` (public key - add to EC2)

---

## Step 2: Add Public Key to EC2

### 2.1 Copy Public Key

```bash
cat ~/.ssh/github_actions_ec2.pub
```

Copy the entire output.

### 2.2 Add to EC2 Authorized Keys

SSH into your EC2 instance:

```bash
ssh ubuntu@54.165.116.208
```

Then:

```bash
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

Replace `YOUR_PUBLIC_KEY_HERE` with the public key you copied.

---

## Step 3: Add GitHub Secrets

Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Add these secrets:

### Required Secrets

**EC2 Deployment Secrets:**
| Secret Name | Description | Example |
|------------|-------------|---------|
| `EC2_SSH_PRIVATE_KEY` | Private SSH key for EC2 access | Contents of `~/.ssh/github_actions_ec2` |
| `EC2_HOST` | EC2 instance IP or domain | `54.165.116.208` |
| `EC2_DOMAIN` | Your domain name (if configured) | `yourdomain.com` or `54.165.116.208` |
| `DB_PASSWORD` | PostgreSQL database password | `Wissen2024!Secure` |

**AWS Secrets (Required for S3/CloudFront):**
| Secret Name | Description | Example |
|------------|-------------|---------|
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key ID | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | `...` |
| `S3_BUCKET_NAME` | S3 bucket name | `wissen-publication-group-files` |
| `CLOUDFRONT_URL` | CloudFront distribution URL | `https://d2qm3szai4trao.cloudfront.net` |

**Total: 9 secrets required**

---

## Step 4: Workflow File

The workflow file is already created at:
`.github/workflows/deploy-ec2.yml`

It will:
1. ✅ Checkout code
2. ✅ Setup SSH connection
3. ✅ Pull latest code on EC2
4. ✅ Update environment files
5. ✅ Install dependencies
6. ✅ Run database migrations
7. ✅ Build frontend and backend
8. ✅ Restart PM2 services
9. ✅ Reload Nginx

---

## Step 5: Test the Workflow

### 5.1 Manual Trigger

1. Go to: **GitHub Repo → Actions**
2. Select **"Deploy to AWS EC2"** workflow
3. Click **"Run workflow"**
4. Select branch: `main`
5. Click **"Run workflow"**

### 5.2 Automatic Trigger

Push to `main` branch:

```bash
git add .
git commit -m "Test auto-deployment"
git push origin main
```

The workflow will automatically trigger.

---

## Step 6: Monitor Deployment

1. Go to: **GitHub Repo → Actions**
2. Click on the running workflow
3. Watch the logs in real-time

---

## Troubleshooting

### SSH Connection Failed

**Error:** `Permission denied (publickey)`

**Fix:**
1. Verify public key is in `~/.ssh/authorized_keys` on EC2
2. Check file permissions: `chmod 600 ~/.ssh/authorized_keys`
3. Verify private key in GitHub Secrets (no extra spaces/newlines)

### Deployment Fails

**Error:** `npm ci` fails or build errors

**Fix:**
1. Check GitHub Actions logs for specific error
2. SSH into EC2 and run commands manually to debug
3. Check if all dependencies are in `package.json`

### Services Not Restarting

**Error:** PM2 services not running after deployment

**Fix:**
1. SSH into EC2: `ssh ubuntu@54.165.116.208`
2. Check PM2 status: `pm2 status`
3. Check logs: `pm2 logs`
4. Restart manually: `pm2 restart all`

### Database Migration Fails

**Error:** `prisma db push` fails

**Fix:**
1. Check database is running: `sudo systemctl status postgresql`
2. Verify `DATABASE_URL` in GitHub Secrets
3. Check database password is correct

---

## Workflow Details

### What Happens on Each Push

1. **Code Checkout**: GitHub Actions checks out your code
2. **SSH Setup**: Configures SSH connection to EC2
3. **Git Pull**: Pulls latest code on EC2
4. **Environment Update**: Updates `.env` files with secrets
5. **Dependencies**: Installs npm packages
6. **Database**: Runs Prisma migrations
7. **Build**: Builds frontend and backend
8. **Restart**: Restarts PM2 services
9. **Nginx**: Reloads Nginx configuration

### Deployment Time

- **First deployment**: ~5-10 minutes
- **Subsequent deployments**: ~3-5 minutes

---

## Security Best Practices

1. ✅ **Never commit secrets** to repository
2. ✅ **Use GitHub Secrets** for all sensitive data
3. ✅ **Rotate SSH keys** periodically
4. ✅ **Limit SSH access** to specific IPs (optional)
5. ✅ **Monitor deployment logs** for suspicious activity

---

## Multiple Environments

To deploy to different environments (staging/production):

1. Create separate workflows:
   - `.github/workflows/deploy-ec2-staging.yml`
   - `.github/workflows/deploy-ec2-production.yml`

2. Use different secrets:
   - `EC2_HOST_STAGING`
   - `EC2_HOST_PRODUCTION`

3. Trigger on different branches:
   - Staging: `develop` branch
   - Production: `main` branch

---

## Summary

✅ **Workflow created**: `.github/workflows/deploy-ec2.yml`  
✅ **Add GitHub Secrets**: SSH key, EC2 host, domain, DB password  
✅ **Test deployment**: Push to `main` or trigger manually  
✅ **Monitor**: Check GitHub Actions tab for deployment status  

Your application will now automatically deploy to EC2 whenever you push to `main`! 🚀

