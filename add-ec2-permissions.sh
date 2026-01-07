#!/bin/bash

# Add EC2 and Required Permissions to Existing IAM User
# This script extends the s3-cloudfront-user with EC2 and other AWS service permissions

# Configuration
USERNAME="s3-cloudfront-user"
ACCOUNT_ID="046746962616"
POLICY_NAME="EC2AndServicesFullAccess"

echo "🔧 Adding EC2 and required permissions to IAM user: $USERNAME"
echo ""

# Create comprehensive policy for EC2, VPC, RDS, and other services
cat > /tmp/ec2-services-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:*",
                "elasticloadbalancing:*",
                "autoscaling:*",
                "cloudwatch:*",
                "logs:*",
                "rds:*",
                "vpc:*",
                "iam:GetInstanceProfile",
                "iam:ListInstanceProfiles",
                "iam:PassRole",
                "ssm:*",
                "ec2-instance-connect:*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "iam:GetRole",
                "iam:ListRoles",
                "iam:GetPolicy",
                "iam:ListPolicies",
                "iam:ListAttachedUserPolicies",
                "iam:ListUserPolicies"
            ],
            "Resource": "*"
        }
    ]
}
EOF

echo "📝 Creating policy: $POLICY_NAME"
aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document file:///tmp/ec2-services-policy.json \
    --description "Full access to EC2, VPC, RDS, CloudWatch, and related services" \
    || echo "⚠️  Policy may already exist, continuing..."

POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/${POLICY_NAME}"

echo ""
echo "🔗 Attaching policy to user: $USERNAME"
aws iam attach-user-policy \
    --user-name $USERNAME \
    --policy-arn $POLICY_ARN

echo ""
echo "✅ Permissions added successfully!"
echo ""
echo "📋 Current policies attached to $USERNAME:"
aws iam list-attached-user-policies --user-name $USERNAME

echo ""
echo "🎯 User now has access to:"
echo "   ✅ S3 (existing)"
echo "   ✅ CloudFront (existing)"
echo "   ✅ EC2 (new)"
echo "   ✅ VPC (new)"
echo "   ✅ RDS (new)"
echo "   ✅ CloudWatch (new)"
echo "   ✅ Auto Scaling (new)"
echo "   ✅ Load Balancer (new)"
echo "   ✅ Systems Manager (new)"

