# IAM Permissions Update - Add EC2 and Required Services

Guide to extend the existing `s3-cloudfront-user` IAM user with EC2 and other AWS service permissions.

---

## 📋 Current Permissions

**IAM User:** `s3-cloudfront-user`  
**Account ID:** `046746962616`  
**Current Access:**
- ✅ S3 (Full Access)
- ✅ CloudFront (Full Access)

---

## 🎯 Required Additional Permissions

To fully manage EC2 and deploy your application, add:

- ✅ **EC2** - Launch, manage, and terminate instances
- ✅ **VPC** - Network configuration
- ✅ **RDS** - Database management (if using RDS)
- ✅ **CloudWatch** - Monitoring and logs
- ✅ **Auto Scaling** - Auto-scaling groups
- ✅ **Elastic Load Balancing** - Load balancers
- ✅ **Systems Manager** - Instance management
- ✅ **IAM** - Limited permissions (PassRole, GetRole)

---

## 🚀 Method 1: Using AWS CLI Script (Recommended)

### Prerequisites
- AWS CLI installed and configured with admin account
- Admin credentials to modify IAM policies

### Run the Script

```bash
# Make script executable
chmod +x add-ec2-permissions.sh

# Run with admin profile
aws configure --profile admin
# Enter admin credentials when prompted

# Execute script
./add-ec2-permissions.sh --profile admin
```

---

## 🖥️ Method 2: Using AWS Console

### Step 1: Sign in to AWS Console

1. Go to: https://046746962616.signin.aws.amazon.com/console
2. Sign in with admin account (not s3-cloudfront-user)

### Step 2: Navigate to IAM

1. Go to: https://console.aws.amazon.com/iam/
2. Click **Users** in left sidebar
3. Search for: `s3-cloudfront-user`
4. Click on the user

### Step 3: Add Permissions

1. Click **Add permissions** button
2. Select **Attach policies directly**
3. Search and attach these policies:

#### Required Policies:
- ✅ **AmazonEC2FullAccess** - Full EC2 access
- ✅ **AmazonVPCFullAccess** - VPC management
- ✅ **AmazonRDSFullAccess** - RDS database access
- ✅ **CloudWatchFullAccess** - Monitoring and logs
- ✅ **AutoScalingFullAccess** - Auto-scaling groups
- ✅ **ElasticLoadBalancingFullAccess** - Load balancers
- ✅ **AmazonSSMFullAccess** - Systems Manager

#### Optional (for advanced features):
- **IAMReadOnlyAccess** - Read IAM information
- **AmazonS3FullAccess** - Already have this
- **CloudFrontFullAccess** - Already have this

4. Click **Next: Review**
5. Click **Add permissions**

---

## 🔧 Method 3: Create Custom Policy (Most Secure)

### Step 1: Create Policy

1. Go to: https://console.aws.amazon.com/iam/
2. Click **Policies** → **Create policy**
3. Click **JSON** tab
4. Paste this policy:

```json
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
                "iam:ListUserPolicies",
                "iam:PassRole"
            ],
            "Resource": "*"
        }
    ]
}
```

5. Click **Next**
6. Name: `EC2AndServicesFullAccess`
7. Description: `Full access to EC2, VPC, RDS, CloudWatch, and related services`
8. Click **Create policy**

### Step 2: Attach Policy to User

1. Go to **Users** → `s3-cloudfront-user`
2. Click **Add permissions** → **Attach policies directly**
3. Search for: `EC2AndServicesFullAccess`
4. Select and click **Next: Review** → **Add permissions**

---

## ✅ Verify Permissions

### Using AWS CLI

```bash
# List attached policies
aws iam list-attached-user-policies \
    --user-name s3-cloudfront-user \
    --profile wissen-user

# Test EC2 access
aws ec2 describe-instances --profile wissen-user

# Test VPC access
aws ec2 describe-vpcs --profile wissen-user

# Test RDS access
aws rds describe-db-instances --profile wissen-user
```

### Using AWS Console

1. Sign in as `s3-cloudfront-user`
2. Try accessing:
   - EC2 Console: https://console.aws.amazon.com/ec2/
   - VPC Console: https://console.aws.amazon.com/vpc/
   - RDS Console: https://console.aws.amazon.com/rds/

---

## 🔒 Security Best Practices

### 1. Use Least Privilege (Recommended)

Instead of full access, create scoped policies:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:Describe*",
                "ec2:RunInstances",
                "ec2:StartInstances",
                "ec2:StopInstances",
                "ec2:RebootInstances",
                "ec2:TerminateInstances",
                "ec2:CreateTags",
                "ec2:CreateSecurityGroup",
                "ec2:AuthorizeSecurityGroupIngress"
            ],
            "Resource": "*"
        }
    ]
}
```

### 2. Restrict by Resource Tags

Only allow actions on resources with specific tags:

```json
{
    "Effect": "Allow",
    "Action": "ec2:*",
    "Resource": "*",
    "Condition": {
        "StringEquals": {
            "ec2:ResourceTag/Project": "wissen-publication-group"
        }
    }
}
```

### 3. Enable MFA

1. Go to IAM → Users → `s3-cloudfront-user`
2. Click **Security credentials** tab
3. Click **Assign MFA device**
4. Follow setup instructions

---

## 📊 Permission Summary

After adding permissions, `s3-cloudfront-user` will have:

| Service | Access Level | Use Case |
|---------|-------------|----------|
| **S3** | Full | File storage |
| **CloudFront** | Full | CDN distribution |
| **EC2** | Full | Virtual servers |
| **VPC** | Full | Network configuration |
| **RDS** | Full | Managed databases |
| **CloudWatch** | Full | Monitoring & logs |
| **Auto Scaling** | Full | Auto-scaling groups |
| **ELB** | Full | Load balancers |
| **SSM** | Full | Instance management |

---

## 🆘 Troubleshooting

### Permission Denied Errors

```bash
# Check current policies
aws iam list-attached-user-policies \
    --user-name s3-cloudfront-user \
    --profile wissen-user

# Check inline policies
aws iam list-user-policies \
    --user-name s3-cloudfront-user \
    --profile wissen-user

# Test specific permission
aws ec2 describe-instances --profile wissen-user
```

### Policy Not Attached

1. Verify policy exists:
   ```bash
   aws iam list-policies \
       --scope Local \
       --query 'Policies[?PolicyName==`EC2AndServicesFullAccess`]' \
       --profile admin
   ```

2. Re-attach policy:
   ```bash
   aws iam attach-user-policy \
       --user-name s3-cloudfront-user \
       --policy-arn arn:aws:iam::046746962616:policy/EC2AndServicesFullAccess \
       --profile admin
   ```

---

## ✅ Verification Checklist

- [ ] IAM user has EC2 permissions
- [ ] Can list EC2 instances
- [ ] Can launch EC2 instances
- [ ] Can stop/start instances
- [ ] Can manage security groups
- [ ] Can access VPC
- [ ] Can access RDS (if needed)
- [ ] CloudWatch access works
- [ ] AWS CLI configured correctly
- [ ] All commands work with `--profile wissen-user`

---

## 📝 Next Steps

After adding permissions:

1. **Configure AWS CLI** (see `aws-cli-setup.md`)
2. **Launch EC2 Instance** (see `EC2_DEPLOYMENT_GUIDE.md`)
3. **Deploy Application** (see `EC2_DEPLOYMENT_GUIDE.md`)
4. **Setup Monitoring** (CloudWatch)

---

**Last Updated**: January 2026

