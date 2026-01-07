# 🚀 AWS EC2 Quick Start Guide

Complete step-by-step guide to set up AWS CLI, add permissions, and launch your EC2 instance.

---

## 📋 Prerequisites

- AWS Account with admin access
- IAM User: `s3-cloudfront-user` (already exists)
- Access Key ID and Secret Access Key for the IAM user

---

## Step 1: Add EC2 Permissions to IAM User

### Method A: Using AWS Console (Recommended - Easiest)

1. **Sign in to AWS Console as Admin**
   - Go to: https://console.aws.amazon.com/iam/
   - Use your root/admin account (not s3-cloudfront-user)

2. **Navigate to IAM User**
   - Click **Users** in left sidebar
   - Search for: `s3-cloudfront-user`
   - Click on the user

3. **Add Permissions**
   - Click **Add permissions** button
   - Select **Attach policies directly**
   - Search and select these policies:
     - ✅ **AmazonEC2FullAccess**
     - ✅ **AmazonVPCFullAccess**
     - ✅ **AmazonRDSFullAccess**
     - ✅ **CloudWatchFullAccess**
     - ✅ **AutoScalingFullAccess**
     - ✅ **ElasticLoadBalancingFullAccess**
     - ✅ **AmazonSSMFullAccess**
   - Click **Next: Review** → **Add permissions**

✅ **Done!** Your IAM user now has EC2 permissions.

### Method B: Using AWS CLI Script

```bash
# 1. Install AWS CLI (if not installed)
# Windows: Download from https://awscli.amazonaws.com/AWSCLIV2.msi
# Mac: brew install awscli
# Linux: See aws-cli-setup.md

# 2. Configure with admin credentials
aws configure --profile admin
# Enter admin Access Key ID, Secret Access Key, Region (us-east-1), Output (json)

# 3. Run the script
chmod +x add-ec2-permissions.sh
./add-ec2-permissions.sh --profile admin
```

---

## Step 2: Install AWS CLI

### Windows (PowerShell)

```powershell
# Download and install
# Option 1: Download from https://awscli.amazonaws.com/AWSCLIV2.msi

# Option 2: Using winget
winget install Amazon.AWSCLI

# Verify installation
aws --version
```

### Mac

```bash
brew install awscli
aws --version
```

### Linux (Ubuntu/Debian)

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version
```

---

## Step 3: Configure AWS CLI with IAM User

### Get Your Access Keys

**From GitHub Secrets:**
1. Go to: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
2. Copy:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

**Or from AWS Console:**
1. Sign in: https://046746962616.signin.aws.amazon.com/console
2. Go to: **IAM** → **Users** → **s3-cloudfront-user** → **Security credentials**
3. Create new access key if needed

### Configure AWS CLI

```bash
# Configure with profile name
aws configure --profile wissen-user

# Enter when prompted:
# AWS Access Key ID: [Paste your Access Key ID]
# AWS Secret Access Key: [Paste your Secret Access Key]
# Default region name: us-east-1
# Default output format: json
```

---

## Step 4: Test Access

```bash
# Test S3 access (should work)
aws s3 ls --profile wissen-user

# Test EC2 access (should work after Step 1)
aws ec2 describe-instances --profile wissen-user

# Test CloudFront access (should work)
aws cloudfront list-distributions --profile wissen-user

# Get your account info
aws sts get-caller-identity --profile wissen-user
```

✅ **If all commands work, you're ready to launch EC2!**

---

## Step 5: Launch EC2 Instance

### Option A: Using AWS Console

1. **Go to EC2 Console**
   - Sign in: https://console.aws.amazon.com/ec2/
   - Use `s3-cloudfront-user` account

2. **Launch Instance**
   - Click **Launch Instance**
   - **Name**: `wissen-publication-group`
   - **AMI**: Ubuntu 22.04 LTS
   - **Instance Type**: `t3.small` (2 vCPU, 2GB RAM)
   - **Key Pair**: Create new or use existing
   - **Network Settings**: 
     - Allow HTTP (port 80)
     - Allow HTTPS (port 443)
     - Allow SSH (port 22) from your IP
   - **Storage**: 20GB gp3
   - Click **Launch Instance**

3. **Get Instance Details**
   - Wait for instance to be "Running"
   - Note the **Public IP** address

### Option B: Using AWS CLI

```bash
# Make management script executable
chmod +x ec2-management-commands.sh

# Launch instance
./ec2-management-commands.sh launch

# Or manually:
aws ec2 run-instances \
    --image-id ami-0c55b159cbfafe1f0 \
    --instance-type t3.small \
    --key-name your-key-pair-name \
    --security-group-ids sg-xxxxxxxxx \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=wissen-publication-group}]' \
    --profile wissen-user
```

---

## Step 6: Connect to EC2 Instance

```bash
# Get instance IP
./ec2-management-commands.sh ip

# Or manually:
INSTANCE_IP=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=wissen-publication-group" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text \
    --profile wissen-user)

# SSH to instance
ssh -i your-key.pem ubuntu@$INSTANCE_IP
```

---

## Step 7: Deploy Application on EC2

Once connected to EC2:

```bash
# 1. Run initial setup (one time)
sudo bash setup-ec2.sh

# 2. Clone repository
cd /var/www
git clone https://github.com/kamal464/wissen-publication-group.git
cd wissen-publication-group

# 3. Setup environment variables
nano backend/.env
# Add: DATABASE_URL, AWS keys, etc.

nano frontend/.env.production
# Add: NEXT_PUBLIC_API_URL

# 4. Deploy
chmod +x deploy-ec2.sh
./deploy-ec2.sh

# 5. Configure Nginx
sudo cp nginx-wissen.conf /etc/nginx/sites-available/wissen-publication-group
sudo nano /etc/nginx/sites-available/wissen-publication-group
# Update YOUR_EC2_IP and yourdomain.com

sudo ln -s /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 8: Setup SSL (Optional - if you have a domain)

```bash
# On EC2 instance
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is already configured
```

---

## ✅ Verification Checklist

- [ ] IAM user has EC2 permissions added
- [ ] AWS CLI installed and configured
- [ ] Can list S3 buckets
- [ ] Can list EC2 instances
- [ ] EC2 instance launched and running
- [ ] Can SSH to instance
- [ ] Application deployed on EC2
- [ ] Nginx configured and running
- [ ] Application accessible via browser
- [ ] SSL certificate installed (if using domain)

---

## 🆘 Troubleshooting

### Permission Denied
```bash
# Check IAM user policies
aws iam list-attached-user-policies \
    --user-name s3-cloudfront-user \
    --profile wissen-user
```

### Can't Connect to EC2
```bash
# Check security group allows SSH from your IP
aws ec2 describe-security-groups \
    --group-ids sg-xxxxxxxxx \
    --profile wissen-user
```

### Instance Not Starting
```bash
# Check instance status
aws ec2 describe-instance-status \
    --instance-ids i-xxxxxxxxxxxxx \
    --profile wissen-user
```

---

## 📚 Additional Resources

- **Full EC2 Guide**: See `EC2_DEPLOYMENT_GUIDE.md`
- **AWS CLI Setup**: See `aws-cli-setup.md`
- **IAM Permissions**: See `IAM_PERMISSIONS_UPDATE.md`
- **Database Migration**: See `DATABASE_MIGRATION_GUIDE.md`

---

## 🎯 Quick Command Reference

```bash
# Set default profile
export AWS_PROFILE=wissen-user

# List instances
aws ec2 describe-instances --profile wissen-user

# Start instance
./ec2-management-commands.sh start

# Stop instance
./ec2-management-commands.sh stop

# Get IP
./ec2-management-commands.sh ip

# SSH to instance
./ec2-management-commands.sh ssh
```

---

**Last Updated**: January 2026

