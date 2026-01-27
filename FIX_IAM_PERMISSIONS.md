# 🔐 Fix IAM Permissions for EC2

## Problem

Your IAM user `s3-cloudfront-user` only has S3 and CloudFront permissions, but needs EC2 permissions to launch instances.

## Solution Options

### Option 1: Add EC2 Permissions to Current User (Recommended)

1. **Go to IAM Console:**
   - https://console.aws.amazon.com/iam/
   - Click **"Users"** (left sidebar)
   - Click on **"s3-cloudfront-user"**

2. **Add EC2 Permissions:**
   - Click **"Add permissions"** button
   - Choose **"Attach policies directly"**
   - Search for: `AmazonEC2FullAccess`
   - Check the box next to it
   - Click **"Next"** → **"Add permissions"**

3. **Verify:**
   ```powershell
   aws ec2 describe-key-pairs --region us-east-1
   ```

### Option 2: Create New IAM User with EC2 Access

1. **Go to IAM Console:**
   - https://console.aws.amazon.com/iam/
   - Click **"Users"** → **"Create user"**

2. **Create User:**
   - Username: `ec2-admin-user` (or any name)
   - Click **"Next"**

3. **Attach Permissions:**
   - Choose **"Attach policies directly"**
   - Search and select:
     - `AmazonEC2FullAccess`
     - `AmazonVPCFullAccess` (for VPC/subnet access)
   - Click **"Next"** → **"Create user"**

4. **Create Access Key:**
   - Click on the new user
   - Go to **"Security credentials"** tab
   - Click **"Create access key"**
   - Choose **"Command Line Interface (CLI)"**
   - Download/copy the keys

5. **Configure AWS CLI with New User:**
   ```powershell
   aws configure
   # Enter the new user's access keys
   ```

### Option 3: Use Root Account (Not Recommended)

If you have root account access, you can use it temporarily, but this is **NOT recommended** for security reasons.

---

## Quick Fix: Add EC2 Permissions

### Via AWS Console:

1. **Go to:** https://console.aws.amazon.com/iam/home#/users/s3-cloudfront-user
2. **Click:** "Add permissions" button
3. **Choose:** "Attach policies directly"
4. **Search:** `AmazonEC2FullAccess`
5. **Select** and click "Next" → "Add permissions"

### Via AWS CLI (if you have admin access):

```powershell
aws iam attach-user-policy `
  --user-name s3-cloudfront-user `
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess
```

---

## Minimal Permissions (More Secure)

If you want to give only necessary permissions instead of full EC2 access:

**Create a custom policy:**

1. **Go to IAM → Policies → Create policy**
2. **Use JSON:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:Describe*",
                "ec2:Create*",
                "ec2:RunInstances",
                "ec2:StartInstances",
                "ec2:StopInstances",
                "ec2:TerminateInstances",
                "ec2:CreateSecurityGroup",
                "ec2:AuthorizeSecurityGroupIngress",
                "ec2:CreateKeyPair",
                "ec2:DescribeKeyPairs",
                "ec2:CreateSnapshot",
                "ec2:DescribeSnapshots",
                "ec2:DescribeImages",
                "ec2:DescribeVpcs",
                "ec2:DescribeSubnets",
                "ec2:DescribeInstances"
            ],
            "Resource": "*"
        }
    ]
}
```

3. **Name it:** `EC2InstanceManagement`
4. **Attach to user:** s3-cloudfront-user

---

## Verify Permissions

After adding permissions, test:

```powershell
# Test key pairs
aws ec2 describe-key-pairs --region us-east-1

# Test instances
aws ec2 describe-instances --region us-east-1 --query 'Reservations[*].Instances[*].[InstanceId,State.Name]' --output table
```

---

## Recommended Approach

**Best practice:** Create a dedicated IAM user for EC2 management:

1. Create new user: `ec2-management-user`
2. Attach: `AmazonEC2FullAccess` policy
3. Create access keys
4. Use this user for EC2 operations
5. Keep `s3-cloudfront-user` for S3/CloudFront only

---

## After Fixing Permissions

Once you have EC2 permissions:

1. **List key pairs:**
   ```powershell
   aws ec2 describe-key-pairs --region us-east-1 --query 'KeyPairs[*].KeyName' --output text
   ```

2. **Edit launch script** with your key name

3. **Run launch script** in Git Bash

---

**Quick Fix: Go to IAM → Users → s3-cloudfront-user → Add permissions → Attach AmazonEC2FullAccess** 🔐
