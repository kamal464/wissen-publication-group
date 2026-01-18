#!/bin/bash
# Update .env file with AWS credentials from image
# Run this on EC2 instance

cd /var/www/wissen-publication-group/backend

echo "Updating .env file with AWS credentials..."
echo ""

# Update AWS credentials
sed -i "s|^AWS_REGION=.*|AWS_REGION=us-east-1|" .env
sed -i "s|^AWS_ACCESS_KEY_ID=.*|AWS_ACCESS_KEY_ID=AKIAQVYSWBK4GMRMNMXK|" .env
sed -i "s|^AWS_SECRET_ACCESS_KEY=.*|AWS_SECRET_ACCESS_KEY=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|" .env

echo "✅ .env file updated"
echo ""

# Verify
echo "Updated values:"
grep -E "AWS_REGION|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY" .env | sed 's/\(SECRET_ACCESS_KEY=\).*/\1***HIDDEN***/'
echo ""

# Test S3 connection
echo "Testing S3 connection..."
node test-s3.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ S3 connection successful!"
    echo ""
    echo "Restarting backend..."
    cd /var/www/wissen-publication-group
    pm2 restart wissen-backend
    echo "✅ Backend restarted"
    echo ""
    echo "=========================================="
    echo "✅ All done! Try uploading a PDF now."
    echo "=========================================="
else
    echo ""
    echo "❌ S3 connection still failing."
    echo "The credentials might be incorrect or rotated."
    echo "Please check AWS Console for current credentials."
fi

