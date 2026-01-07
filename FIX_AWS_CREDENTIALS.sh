#!/bin/bash
# Fix AWS credentials signature error - run this on EC2 instance

echo "🔧 Fixing AWS S3 Credentials..."
echo ""

cd /var/www/wissen-publication-group/backend

echo "1. Checking current .env file..."
if [ -f .env ]; then
    echo "✅ .env file exists"
    echo ""
    echo "Current AWS configuration:"
    grep -E "AWS_|S3_|CLOUDFRONT" .env | sed 's/\(SECRET_ACCESS_KEY=\).*/\1***HIDDEN***/'
    echo ""
else
    echo "❌ .env file not found!"
    exit 1
fi

echo "2. Verifying AWS credentials format..."
AWS_ACCESS_KEY_ID=$(grep "^AWS_ACCESS_KEY_ID=" .env | cut -d'=' -f2 | tr -d ' ')
AWS_SECRET_ACCESS_KEY=$(grep "^AWS_SECRET_ACCESS_KEY=" .env | cut -d'=' -f2 | tr -d ' ')

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ AWS credentials are missing or empty!"
    echo ""
    echo "Please update backend/.env with correct credentials:"
    echo "  AWS_ACCESS_KEY_ID=AKIA..."
    echo "  AWS_SECRET_ACCESS_KEY=..."
    exit 1
fi

echo "✅ AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:0:8}... (length: ${#AWS_ACCESS_KEY_ID})"
echo "✅ AWS_SECRET_ACCESS_KEY: *** (length: ${#AWS_SECRET_ACCESS_KEY})"
echo ""

# Check if credentials look valid
if [ ${#AWS_ACCESS_KEY_ID} -lt 16 ] || [ ${#AWS_SECRET_ACCESS_KEY} -lt 20 ]; then
    echo "⚠️  Warning: Credentials seem too short. They might be incorrect."
    echo ""
fi

echo "3. Testing S3 connection..."
cd /var/www/wissen-publication-group/backend

# Create a test script
cat > /tmp/test-s3.js << 'TESTEOF'
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env' });

async function test() {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      MaxKeys: 1,
    });
    await s3Client.send(command);
    console.log('✅ S3 connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
    if (error.name === 'InvalidAccessKeyId') {
      console.error('   → AWS_ACCESS_KEY_ID is incorrect');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error('   → AWS_SECRET_ACCESS_KEY is incorrect');
    } else if (error.name === 'NoSuchBucket') {
      console.error('   → S3_BUCKET_NAME is incorrect');
    }
    process.exit(1);
  }
}

test();
TESTEOF

node /tmp/test-s3.js
TEST_RESULT=$?

if [ $TEST_RESULT -eq 0 ]; then
    echo ""
    echo "4. Restarting backend service..."
    cd /var/www/wissen-publication-group
    pm2 restart wissen-backend
    echo "✅ Backend restarted"
    echo ""
    echo "=========================================="
    echo "✅ AWS Credentials Verified!"
    echo "=========================================="
    echo ""
    echo "You can now try uploading a PDF again."
else
    echo ""
    echo "=========================================="
    echo "❌ AWS Credentials Test Failed"
    echo "=========================================="
    echo ""
    echo "Please check:"
    echo "1. AWS_ACCESS_KEY_ID is correct"
    echo "2. AWS_SECRET_ACCESS_KEY is correct (no extra spaces)"
    echo "3. IAM user has S3 permissions"
    echo ""
    echo "To update credentials, edit:"
    echo "  nano /var/www/wissen-publication-group/backend/.env"
    echo ""
    echo "Then restart the backend:"
    echo "  pm2 restart wissen-backend"
fi

rm -f /tmp/test-s3.js

