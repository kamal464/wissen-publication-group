#!/bin/bash

# Script to create IAM user with S3 and CloudFront permissions
# Run this in AWS CloudShell

# Configuration
USERNAME="s3-cloudfront-user"
PASSWORD="YourSecurePassword123!"  # Change this to your desired password
POLICY_NAME="S3CloudFrontFullAccess"

echo "Creating IAM user: $USERNAME"

# Create the IAM user
aws iam create-user --user-name $USERNAME

# Create a custom policy for S3 and CloudFront
cat > /tmp/s3-cloudfront-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:*",
                "cloudfront:*"
            ],
            "Resource": "*"
        }
    ]
}
EOF

# Create the policy
aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document file:///tmp/s3-cloudfront-policy.json \
    --description "Full access to S3 and CloudFront services"

# Get the policy ARN (replace ACCOUNT_ID with your actual account ID)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/${POLICY_NAME}"

# Attach the policy to the user
aws iam attach-user-policy \
    --user-name $USERNAME \
    --policy-arn $POLICY_ARN

# Create login profile (console password)
aws iam create-login-profile \
    --user-name $USERNAME \
    --password $PASSWORD \
    --password-reset-required

# Create access keys for programmatic access
echo "Creating access keys..."
aws iam create-access-key --user-name $USERNAME > /tmp/access-keys.json

echo ""
echo "=========================================="
echo "IAM User Created Successfully!"
echo "=========================================="
echo "Username: $USERNAME"
echo "Password: $PASSWORD"
echo ""
echo "Access Keys (save these securely):"
cat /tmp/access-keys.json
echo ""
echo "Policy ARN: $POLICY_ARN"
echo ""
echo "User can sign in at: https://$(aws sts get-caller-identity --query Account --output text).signin.aws.amazon.com/console"
echo ""
echo "⚠️  IMPORTANT: Save the access keys and password securely!"


