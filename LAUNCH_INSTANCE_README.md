# 🚀 Launch New Instance via AWS CLI

## Quick Start

### Prerequisites

1. **AWS CLI installed and configured**
   ```bash
   aws --version
   aws configure
   ```

2. **jq installed** (for JSON parsing)
   ```bash
   sudo apt install jq  # Linux
   brew install jq      # macOS
   ```

3. **Your EC2 Key Pair name** (you'll need to edit the script)

### Step 1: Edit Configuration

Open `launch-new-instance.sh` and edit:

```bash
KEY_NAME="your-key-name"  # CHANGE THIS to your actual EC2 key pair name
```

### Step 2: Make Script Executable

```bash
chmod +x launch-new-instance.sh
```

### Step 3: Run Script

```bash
./launch-new-instance.sh
```

---

## What the Script Does

1. ✅ Finds latest Ubuntu 22.04 LTS AMI
2. ✅ Gets default VPC and subnet
3. ✅ Creates security group (or uses existing) with:
   - SSH (port 22) - Your IP only
   - HTTP (port 80) - Anyone
   - HTTPS (port 443) - Anyone
4. ✅ Launches instance with:
   - User-data script (installs Node.js, PM2, Nginx)
   - Proper tags
   - Security group attached
5. ✅ Waits for instance to be running
6. ✅ Gets public IP address
7. ✅ Tests SSH connection

---

## Manual AWS CLI Commands (Alternative)

If you prefer to run commands manually:

### 1. Get Latest Ubuntu AMI

```bash
aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
            "Name=state,Values=available" \
  --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
  --output text \
  --region us-east-1
```

### 2. Create Security Group

```bash
# Get VPC ID
VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=isDefault,Values=true" \
  --query 'Vpcs[0].VpcId' \
  --output text \
  --region us-east-1)

# Create security group
SG_ID=$(aws ec2 create-security-group \
  --group-name wissen-secure-sg \
  --description "Security group for wissen-publication-group" \
  --vpc-id $VPC_ID \
  --region us-east-1 \
  --query 'GroupId' \
  --output text)

# Get your IP
MY_IP=$(curl -s https://checkip.amazonaws.com)

# Add rules
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr ${MY_IP}/32 \
  --region us-east-1

aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0 \
  --region us-east-1

aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0 \
  --region us-east-1
```

### 3. Launch Instance

```bash
# Get subnet
SUBNET_ID=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=default-for-az,Values=true" \
  --query 'Subnets[0].SubnetId' \
  --output text \
  --region us-east-1)

# Launch
aws ec2 run-instances \
  --image-id <AMI_ID> \
  --instance-type t3.medium \
  --key-name <YOUR_KEY_NAME> \
  --security-group-ids $SG_ID \
  --subnet-id $SUBNET_ID \
  --user-data file://user-data-quick.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=wissen-secure}]' \
  --region us-east-1
```

---

## After Instance Launches

1. **SSH into instance:**
   ```bash
   ssh -i ~/.ssh/your-key.pem ubuntu@<PUBLIC_IP>
   ```

2. **Run deployment:**
   ```bash
   # Option 1: Upload QUICK_DEPLOY.sh
   scp -i ~/.ssh/your-key.pem QUICK_DEPLOY.sh ubuntu@<PUBLIC_IP>:/home/ubuntu/
   
   # Option 2: Clone and run
   cd /var/www
   git clone https://github.com/kamal464/wissen-publication-group.git
   # Then follow QUICK_NEW_INSTANCE_SETUP.md
   ```

3. **Or use the all-in-one script:**
   ```bash
   cd /var/www
   wget https://raw.githubusercontent.com/kamal464/wissen-publication-group/main/QUICK_DEPLOY.sh
   chmod +x QUICK_DEPLOY.sh
   ./QUICK_DEPLOY.sh
   ```

---

## Troubleshooting

### "Key pair not found"
- Make sure `KEY_NAME` matches your actual EC2 key pair name
- Check in AWS Console: EC2 → Key Pairs

### "Security group already exists"
- The script will use the existing one
- Or delete and recreate: `aws ec2 delete-security-group --group-id <SG_ID>`

### "No default VPC"
- Create a VPC or specify a VPC ID in the script
- Or use a specific subnet ID

### SSH connection fails
- Wait 2-3 minutes after instance launch
- Check security group allows your IP
- Verify key file permissions: `chmod 400 ~/.ssh/your-key.pem`

---

## Security Notes

- ✅ SSH only from your IP
- ✅ HTTP/HTTPS open for web traffic
- ✅ Firewall configured on instance
- ✅ Fresh credentials required (don't copy from old instance)

---

**Ready? Edit `KEY_NAME` and run `./launch-new-instance.sh`!** 🚀
