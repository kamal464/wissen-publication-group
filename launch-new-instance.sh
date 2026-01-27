#!/bin/bash
# 🚀 Launch New Secure Instance via AWS CLI
# This script creates a new EC2 instance with all security configurations

set -e

# Configuration - EDIT THESE VALUES
REGION="us-east-1"
INSTANCE_TYPE="t3.medium"
KEY_NAME="wissen-secure-key-2"  # CHANGE THIS to your EC2 key pair name
SECURITY_GROUP_NAME="wissen-secure-sg"  # Will create if doesn't exist
INSTANCE_NAME="wissen-publication-secure"

echo "🚀 Launching New Secure Instance..."
echo ""

# Step 1: Get latest Ubuntu 22.04 AMI
echo "=== STEP 1: Getting latest Ubuntu 22.04 AMI ==="
AMI_ID=$(aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
            "Name=state,Values=available" \
  --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
  --output text \
  --region $REGION)

if [ -z "$AMI_ID" ] || [ "$AMI_ID" == "None" ]; then
    echo "❌ Failed to find Ubuntu 22.04 AMI"
    exit 1
fi

echo "✅ Found AMI: $AMI_ID"
echo ""

# Step 2: Get default VPC and subnet
echo "=== STEP 2: Getting VPC and subnet ==="
VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=isDefault,Values=true" \
  --query 'Vpcs[0].VpcId' \
  --output text \
  --region $REGION)

if [ -z "$VPC_ID" ] || [ "$VPC_ID" == "None" ]; then
    echo "❌ Failed to find default VPC"
    exit 1
fi

SUBNET_ID=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=default-for-az,Values=true" \
  --query 'Subnets[0].SubnetId' \
  --output text \
  --region $REGION)

if [ -z "$SUBNET_ID" ] || [ "$SUBNET_ID" == "None" ]; then
    echo "❌ Failed to find subnet"
    exit 1
fi

echo "✅ VPC: $VPC_ID"
echo "✅ Subnet: $SUBNET_ID"
echo ""

# Step 3: Create or get security group
echo "=== STEP 3: Setting up security group ==="
SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=$SECURITY_GROUP_NAME" "Name=vpc-id,Values=$VPC_ID" \
  --query 'SecurityGroups[0].GroupId' \
  --output text \
  --region $REGION)

if [ -z "$SG_ID" ] || [ "$SG_ID" == "None" ]; then
    echo "Creating new security group..."
    SG_ID=$(aws ec2 create-security-group \
      --group-name $SECURITY_GROUP_NAME \
      --description "Security group for wissen-publication-group" \
      --vpc-id $VPC_ID \
      --region $REGION \
      --query 'GroupId' \
      --output text)
    
    echo "✅ Created security group: $SG_ID"
    
    # Get your current IP
    MY_IP=$(curl -s https://checkip.amazonaws.com)
    MY_IP_CIDR="$MY_IP/32"
    
    echo "Adding security group rules..."
    
    # Allow SSH from your IP only
    aws ec2 authorize-security-group-ingress \
      --group-id $SG_ID \
      --protocol tcp \
      --port 22 \
      --cidr $MY_IP_CIDR \
      --region $REGION 2>/dev/null || echo "SSH rule may already exist"
    
    # Allow HTTP from anywhere
    aws ec2 authorize-security-group-ingress \
      --group-id $SG_ID \
      --protocol tcp \
      --port 80 \
      --cidr 0.0.0.0/0 \
      --region $REGION 2>/dev/null || echo "HTTP rule may already exist"
    
    # Allow HTTPS from anywhere
    aws ec2 authorize-security-group-ingress \
      --group-id $SG_ID \
      --protocol tcp \
      --port 443 \
      --cidr 0.0.0.0/0 \
      --region $REGION 2>/dev/null || echo "HTTPS rule may already exist"
    
    echo "✅ Security group rules added"
else
    echo "✅ Using existing security group: $SG_ID"
fi
echo ""

# Step 4: Create user-data script
echo "=== STEP 4: Preparing user-data ==="
USER_DATA=$(cat <<'USERDATAEOF'
#!/bin/bash
# User data script for quick instance setup

# Update system
apt-get update -y
apt-get upgrade -y

# Install basic tools
apt-get install -y curl git

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt-get install -y nginx

# Basic firewall (will be configured properly later)
ufw --force enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

# Create app directory
mkdir -p /var/www
chown ubuntu:ubuntu /var/www

# Log completion
echo "User data script completed at $(date)" >> /var/log/user-data.log
USERDATAEOF
)

echo "✅ User-data script prepared"
echo ""

# Step 5: Launch instance
echo "=== STEP 5: Launching instance ==="
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type $INSTANCE_TYPE \
  --key-name $KEY_NAME \
  --security-group-ids $SG_ID \
  --subnet-id $SUBNET_ID \
  --user-data "$USER_DATA" \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME},{Key=Environment,Value=Production},{Key=Purpose,Value=Secure-Replacement}]" \
  --region $REGION \
  --query 'Instances[0].InstanceId' \
  --output text)

if [ -z "$INSTANCE_ID" ] || [ "$INSTANCE_ID" == "None" ]; then
    echo "❌ Failed to launch instance"
    exit 1
fi

echo "✅ Instance launched: $INSTANCE_ID"
echo ""

# Step 6: Wait for instance to be running
echo "=== STEP 6: Waiting for instance to be running ==="
echo "This may take 1-2 minutes..."
aws ec2 wait instance-running \
  --instance-ids $INSTANCE_ID \
  --region $REGION

echo "✅ Instance is running"
echo ""

# Step 7: Get instance details
echo "=== STEP 7: Getting instance details ==="
sleep 10  # Wait a bit more for public IP assignment

INSTANCE_INFO=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --region $REGION \
  --query 'Reservations[0].Instances[0]')

PUBLIC_IP=$(echo $INSTANCE_INFO | jq -r '.PublicIpAddress // empty')
PRIVATE_IP=$(echo $INSTANCE_INFO | jq -r '.PrivateIpAddress // empty')
INSTANCE_STATE=$(echo $INSTANCE_INFO | jq -r '.State.Name')

echo "✅ Instance Details:"
echo "   Instance ID: $INSTANCE_ID"
echo "   State: $INSTANCE_STATE"
echo "   Public IP: ${PUBLIC_IP:-'Not assigned yet'}"
echo "   Private IP: $PRIVATE_IP"
echo ""

# Step 8: Wait for SSH to be ready
if [ -n "$PUBLIC_IP" ]; then
    echo "=== STEP 8: Waiting for SSH to be ready ==="
    echo "Testing SSH connection..."
    
    MAX_ATTEMPTS=30
    ATTEMPT=0
    
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if ssh -i ~/.ssh/${KEY_NAME}.pem -o ConnectTimeout=5 -o StrictHostKeyChecking=no ubuntu@$PUBLIC_IP "echo 'SSH ready'" 2>/dev/null; then
            echo "✅ SSH is ready!"
            break
        fi
        
        ATTEMPT=$((ATTEMPT + 1))
        echo "   Attempt $ATTEMPT/$MAX_ATTEMPTS - waiting 10 seconds..."
        sleep 10
    done
    
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo "⚠️  SSH not ready yet, but instance is running"
        echo "   You can try connecting manually in a few minutes"
    fi
    echo ""
fi

# Summary
echo "=========================================="
echo "✅ INSTANCE LAUNCHED SUCCESSFULLY!"
echo "=========================================="
echo ""
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: ${PUBLIC_IP:-'Check AWS Console'}"
echo "Private IP: $PRIVATE_IP"
echo "Security Group: $SG_ID"
echo ""
echo "Next Steps:"
echo "1. SSH into instance:"
echo "   ssh -i ~/.ssh/${KEY_NAME}.pem ubuntu@${PUBLIC_IP:-'<PUBLIC_IP>'}"
echo ""
echo "2. Run deployment script:"
echo "   cd /var/www"
echo "   # Upload QUICK_DEPLOY.sh or clone from git"
echo "   chmod +x QUICK_DEPLOY.sh"
echo "   ./QUICK_DEPLOY.sh"
echo ""
echo "3. Or follow manual steps from QUICK_NEW_INSTANCE_SETUP.md"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Edit KEY_NAME in this script before running"
echo "   - Use fresh credentials in .env file"
echo "   - Stop old compromised instance after verification"
echo ""
