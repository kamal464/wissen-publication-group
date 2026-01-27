# 🚀 Run AWS Setup & Launch Script

## Quick Start

### Step 1: Check Your Setup

```bash
# Make verification script executable
chmod +x check-aws-setup.sh

# Run verification
./check-aws-setup.sh
```

This will check:
- ✅ AWS CLI installation
- ✅ AWS credentials
- ✅ Default region
- ✅ jq installation
- ✅ Key pairs
- ✅ Script files

### Step 2: Fix Any Issues

**If AWS CLI not installed:**
```bash
# Windows: Download from https://awscli.amazonaws.com/AWSCLIV2.msi
# Linux:
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Mac:
brew install awscli
```

**If AWS not configured:**
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, region (us-east-1), and output format (json)
```

**If jq not installed:**
```bash
# Linux
sudo apt install jq

# Mac
brew install jq

# Windows
choco install jq
```

**If no key pairs:**
```bash
# Create new key pair
aws ec2 create-key-pair \
  --key-name wissen-secure-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/wissen-secure-key.pem

# Set permissions (Linux/Mac)
chmod 400 ~/.ssh/wissen-secure-key.pem
```

### Step 3: Edit Launch Script

```bash
# Open the script
nano launch-new-instance.sh
# Or use your preferred editor

# Change line 9:
KEY_NAME="your-actual-key-name"  # Use the key name from check-aws-setup.sh output
```

### Step 4: Run Launch Script

```bash
# Make sure it's executable
chmod +x launch-new-instance.sh

# Run it
./launch-new-instance.sh
```

---

## Manual Commands (If You Prefer)

### Check AWS CLI
```bash
aws --version
```

### Check AWS Configuration
```bash
aws sts get-caller-identity
```

### Check Default Region
```bash
aws configure get region
```

### List Key Pairs
```bash
aws ec2 describe-key-pairs --region us-east-1
```

### Create Key Pair (if needed)
```bash
aws ec2 create-key-pair \
  --key-name wissen-secure-key \
  --region us-east-1 \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/wissen-secure-key.pem

chmod 400 ~/.ssh/wissen-secure-key.pem
```

---

## Complete Workflow

```bash
# 1. Verify setup
./check-aws-setup.sh

# 2. Edit launch script (set KEY_NAME)
nano launch-new-instance.sh

# 3. Launch instance
./launch-new-instance.sh

# 4. After instance launches, SSH and deploy
ssh -i ~/.ssh/your-key-name.pem ubuntu@<PUBLIC_IP>

# 5. On the instance, run deployment
cd /var/www
git clone https://github.com/kamal464/wissen-publication-group.git
cd wissen-publication-group
# Upload or copy QUICK_DEPLOY.sh
chmod +x QUICK_DEPLOY.sh
./QUICK_DEPLOY.sh
```

---

## Troubleshooting

### "aws: command not found"
- Install AWS CLI (see Step 2 above)

### "Unable to locate credentials"
- Run: `aws configure`
- Or set environment variables:
  ```bash
  export AWS_ACCESS_KEY_ID="your-key"
  export AWS_SECRET_ACCESS_KEY="your-secret"
  ```

### "An error occurred (UnauthorizedOperation)"
- Your IAM user needs EC2 permissions
- Check IAM policies in AWS Console

### "Key pair not found"
- List key pairs: `aws ec2 describe-key-pairs`
- Use exact key name (case-sensitive) in script

---

**Ready? Run `./check-aws-setup.sh` first!** 🔍
