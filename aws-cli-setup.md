# AWS CLI Setup and Configuration Guide

Complete guide to configure AWS CLI with your IAM user and manage EC2 instances.

---

## 🔧 Step 1: Install AWS CLI

### Windows (PowerShell)
```powershell
# Download and install AWS CLI
# Download from: https://awscli.amazonaws.com/AWSCLIV2.msi
# Or use winget:
winget install Amazon.AWSCLI
```

### Mac
```bash
brew install awscli
```

### Linux (Ubuntu/Debian)
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

---

## 🔑 Step 2: Configure AWS CLI with IAM User

### Get Your Access Keys

1. **From GitHub Secrets** (if already stored):
   - Go to: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
   - Copy `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

2. **From AWS Console**:
   - Sign in: https://046746962616.signin.aws.amazon.com/console
   - Go to: **IAM** → **Users** → **s3-cloudfront-user** → **Security credentials**
   - Create new access key if needed

### Configure AWS CLI

```bash
# Configure with profile name
aws configure --profile wissen-user

# Enter when prompted:
# AWS Access Key ID: [Your Access Key ID]
# AWS Secret Access Key: [Your Secret Access Key]
# Default region name: us-east-1
# Default output format: json
```

**Or set environment variables:**
```bash
# Windows PowerShell
$env:AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_ID"
$env:AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY"
$env:AWS_DEFAULT_REGION="us-east-1"

# Linux/Mac
export AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="us-east-1"
```

---

## ✅ Step 3: Verify Configuration

```bash
# Test S3 access
aws s3 ls --profile wissen-user

# Test EC2 access
aws ec2 describe-instances --profile wissen-user

# Test CloudFront access
aws cloudfront list-distributions --profile wissen-user

# Get your account info
aws sts get-caller-identity --profile wissen-user
```

---

## 🚀 Step 4: Add EC2 Permissions to IAM User

Run the script to add EC2 permissions:

```bash
# Make script executable
chmod +x add-ec2-permissions.sh

# Run the script (requires admin/root AWS credentials)
aws configure --profile admin  # Use admin account credentials
./add-ec2-permissions.sh --profile admin

# Or run directly with AWS CLI commands:
```

**Manual method (using AWS Console or admin account):**

1. Go to: https://console.aws.amazon.com/iam/
2. Navigate to: **Users** → **s3-cloudfront-user** → **Add permissions**
3. Attach policy: **AmazonEC2FullAccess**
4. Attach policy: **AmazonVPCFullAccess**
5. Attach policy: **AmazonRDSFullAccess**
6. Attach policy: **CloudWatchFullAccess**

---

## 💻 Essential EC2 Management Commands

### List EC2 Instances
```bash
aws ec2 describe-instances --profile wissen-user --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress,InstanceType]' --output table
```

### Launch EC2 Instance
```bash
# Get available AMI IDs
aws ec2 describe-images \
    --owners amazon \
    --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
    --query 'Images[*].[ImageId,CreationDate]' \
    --output table \
    --profile wissen-user

# Launch instance
aws ec2 run-instances \
    --image-id ami-0c55b159cbfafe1f0 \
    --instance-type t3.small \
    --key-name your-key-pair-name \
    --security-group-ids sg-xxxxxxxxx \
    --subnet-id subnet-xxxxxxxxx \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=wissen-publication-group}]' \
    --profile wissen-user
```

### Get Instance Details
```bash
aws ec2 describe-instances \
    --instance-ids i-xxxxxxxxxxxxx \
    --profile wissen-user
```

### Start/Stop/Reboot Instance
```bash
# Start
aws ec2 start-instances --instance-ids i-xxxxxxxxxxxxx --profile wissen-user

# Stop
aws ec2 stop-instances --instance-ids i-xxxxxxxxxxxxx --profile wissen-user

# Reboot
aws ec2 reboot-instances --instance-ids i-xxxxxxxxxxxxx --profile wissen-user
```

### Get Instance Public IP
```bash
aws ec2 describe-instances \
    --instance-ids i-xxxxxxxxxxxxx \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text \
    --profile wissen-user
```

### SSH to Instance
```bash
# Get public IP first
INSTANCE_IP=$(aws ec2 describe-instances \
    --instance-ids i-xxxxxxxxxxxxx \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text \
    --profile wissen-user)

# SSH
ssh -i your-key.pem ubuntu@$INSTANCE_IP
```

---

## 🔒 Security Groups Management

### List Security Groups
```bash
aws ec2 describe-security-groups --profile wissen-user
```

### Create Security Group
```bash
aws ec2 create-security-group \
    --group-name wissen-app-sg \
    --description "Security group for Wissen Publication Group" \
    --profile wissen-user
```

### Add Rules to Security Group
```bash
# Allow HTTP
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --profile wissen-user

# Allow HTTPS
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 \
    --profile wissen-user

# Allow SSH (from your IP only - replace with your IP)
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp \
    --port 22 \
    --cidr YOUR_IP/32 \
    --profile wissen-user
```

---

## 🌐 VPC Management

### List VPCs
```bash
aws ec2 describe-vpcs --profile wissen-user
```

### List Subnets
```bash
aws ec2 describe-subnets --profile wissen-user
```

---

## 💾 RDS Management

### List RDS Instances
```bash
aws rds describe-db-instances --profile wissen-user
```

### Create RDS Instance
```bash
aws rds create-db-instance \
    --db-instance-identifier wissen-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username postgres \
    --master-user-password YourSecurePassword123! \
    --allocated-storage 20 \
    --profile wissen-user
```

---

## 📊 CloudWatch Monitoring

### Get Instance Metrics
```bash
aws cloudwatch get-metric-statistics \
    --namespace AWS/EC2 \
    --metric-name CPUUtilization \
    --dimensions Name=InstanceId,Value=i-xxxxxxxxxxxxx \
    --start-time 2026-01-01T00:00:00Z \
    --end-time 2026-01-02T00:00:00Z \
    --period 3600 \
    --statistics Average \
    --profile wissen-user
```

---

## 🔄 Quick Reference Commands

### Set Default Profile
```bash
export AWS_PROFILE=wissen-user
# Now you can omit --profile flag
aws ec2 describe-instances
```

### Switch Profiles
```bash
export AWS_PROFILE=wissen-user
# or
export AWS_PROFILE=admin
```

### List All Profiles
```bash
cat ~/.aws/credentials
# or
cat ~/.aws/config
```

---

## 📝 Useful Aliases (Optional)

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# AWS CLI aliases
alias aws-wissen='aws --profile wissen-user'
alias aws-ec2='aws ec2 --profile wissen-user'
alias aws-s3='aws s3 --profile wissen-user'
alias aws-rds='aws rds --profile wissen-user'
```

Then use:
```bash
aws-ec2 describe-instances
aws-s3 ls
```

---

## 🆘 Troubleshooting

### Permission Denied
```bash
# Check your IAM user permissions
aws iam list-attached-user-policies --user-name s3-cloudfront-user --profile wissen-user

# Check inline policies
aws iam list-user-policies --user-name s3-cloudfront-user --profile wissen-user
```

### Invalid Credentials
```bash
# Reconfigure
aws configure --profile wissen-user
```

### Region Not Set
```bash
# Set default region
aws configure set region us-east-1 --profile wissen-user
```

---

## ✅ Verification Checklist

- [ ] AWS CLI installed
- [ ] IAM user credentials configured
- [ ] S3 access verified
- [ ] EC2 permissions added
- [ ] EC2 access verified
- [ ] Can list instances
- [ ] Can launch/stop instances
- [ ] Security groups configured

---

**Last Updated**: January 2026

