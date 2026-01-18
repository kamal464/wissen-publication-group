#!/bin/bash
# Fetch AWS credentials from AWS CLI and update .env file
# Run this on EC2 instance

echo "🔍 Fetching AWS credentials from AWS CLI..."
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed"
    echo "Install it with: sudo apt install awscli -y"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured"
    echo "Configure it with: aws configure"
    exit 1
fi

echo "✅ AWS CLI is configured"
echo ""

# Get current AWS credentials from AWS CLI
echo "Fetching credentials..."
AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id)
AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)
AWS_REGION=$(aws configure get region || echo "us-east-1")

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ Could not fetch credentials from AWS CLI"
    echo "Make sure AWS CLI is configured with: aws configure"
    exit 1
fi

echo "✅ Credentials fetched:"
echo "   AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:0:8}..."
echo "   AWS_SECRET_ACCESS_KEY: *** (length: ${#AWS_SECRET_ACCESS_KEY})"
echo "   AWS_REGION: $AWS_REGION"
echo ""

# Update .env file
cd /var/www/wissen-publication-group/backend

if [ ! -f .env ]; then
    echo "❌ .env file not found at /var/www/wissen-publication-group/backend/.env"
    exit 1
fi

echo "Updating .env file..."

# Backup current .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup created: .env.backup.$(date +%Y%m%d_%H%M%S)"

# Update AWS credentials in .env
sed -i "s|^AWS_REGION=.*|AWS_REGION=$AWS_REGION|" .env
sed -i "s|^AWS_ACCESS_KEY_ID=.*|AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID|" .env
sed -i "s|^AWS_SECRET_ACCESS_KEY=.*|AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY|" .env

echo "✅ .env file updated"
echo ""

# Display updated values (hide secret)
echo "Updated values in .env:"
grep -E "AWS_REGION|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY" .env | sed 's/\(SECRET_ACCESS_KEY=\).*/\1***HIDDEN***/'
echo ""

# Test S3 connection
echo "Testing S3 connection..."
if [ -f test-s3.js ]; then
    node test-s3.js
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ S3 connection successful!"
        echo ""
        echo "Restarting backend..."
        cd /var/www/wissen-publication-group
        pm2 restart wissen-backend
        echo "✅ Backend restarted"
    else
        echo "❌ S3 connection failed. Please check credentials."
    fi
else
    echo "⚠️  test-s3.js not found. Skipping test."
fi

echo ""
echo "=========================================="
echo "✅ Credentials Updated!"
echo "=========================================="
echo ""
echo "📋 Next step: Update GitHub Secrets with these values:"
echo "   AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID"
echo "   AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY"
echo "   AWS_REGION: $AWS_REGION"
echo ""
echo "Go to: GitHub Repo → Settings → Secrets and variables → Actions"
echo "Update the three secrets with the values above."

