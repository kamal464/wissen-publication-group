# 🔌 AWS EC2 Connection Troubleshooting

**Quick fixes for SSH and connection issues**

---

## 🚨 **QUICK FIX: Use AWS Systems Manager Session Manager (No SSH Required!)**

**This works through the AWS browser console - no SSH keys needed!**

### Step 1: Enable Session Manager on Instance

1. Go to **EC2 Console** → Select your instance (`i-016ab2b939f5f7a3b`)
2. Click **Connect** button
3. Select **Session Manager** tab
4. Click **Connect**

**OR** use AWS CLI:
```bash
aws ssm start-session --target i-016ab2b939f5f7a3b --region us-east-1
```

### Step 2: If Session Manager Not Available

Enable SSM Agent (if not already enabled):

```bash
# Run this via EC2 Instance Connect (browser terminal) or if you have another way in
sudo snap install amazon-ssm-agent --classic
sudo snap start amazon-ssm-agent
sudo snap enable amazon-ssm-agent
```

**Attach IAM Role to Instance:**
1. EC2 Console → Select instance → **Actions** → **Security** → **Modify IAM role**
2. Attach role: `AmazonSSMManagedInstanceCore` (or create new role with this policy)

---

## 🔍 **TROUBLESHOOT SSH CONNECTION:**

### 1. Check Instance Status

**In AWS Console:**
- EC2 → Instances → Check if instance is **Running**
- If stopped, click **Start instance**

**Via AWS CLI:**
```bash
aws ec2 describe-instances \
    --instance-ids i-016ab2b939f5f7a3b \
    --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress]' \
    --output table \
    --region us-east-1
```

### 2. Check Security Group Rules

**Your Security Group:** `sg-0bea1705b41dd4806`

**Required Rule:**
- **Type:** SSH
- **Port:** 22
- **Source:** Your IP address (or `0.0.0.0/0` for testing - **not recommended for production**)

**Fix via AWS Console:**
1. EC2 → Security Groups → Select `sg-0bea1705b41dd4806`
2. **Inbound rules** → **Edit inbound rules**
3. Add rule:
   - **Type:** SSH
   - **Port:** 22
   - **Source:** `My IP` (or your specific IP)

**Fix via AWS CLI:**
```bash
# Get your current IP
MY_IP=$(curl -s https://checkip.amazonaws.com)

# Add SSH rule (replace YOUR_IP with your actual IP)
aws ec2 authorize-security-group-ingress \
    --group-id sg-0bea1705b41dd4806 \
    --protocol tcp \
    --port 22 \
    --cidr $MY_IP/32 \
    --region us-east-1
```

### 3. Verify Public IP

**Current Public IP:** `54.165.116.208`

**Note:** Public IP changes when instance stops/starts (unless using Elastic IP)

**Get current IP:**
```bash
aws ec2 describe-instances \
    --instance-ids i-016ab2b939f5f7a3b \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text \
    --region us-east-1
```

### 4. Check SSH Key File

**Key Name:** `Ec2 Tutorial`

**Windows (PowerShell):**
```powershell
# Check if key exists
Test-Path "$env:USERPROFILE\.ssh\Ec2-Tutorial.pem"

# SSH command
ssh -i "$env:USERPROFILE\.ssh\Ec2-Tutorial.pem" ubuntu@54.165.116.208
```

**Linux/Mac:**
```bash
# Check if key exists
ls -la ~/.ssh/Ec2-Tutorial.pem

# Set correct permissions
chmod 400 ~/.ssh/Ec2-Tutorial.pem

# SSH command
ssh -i ~/.ssh/Ec2-Tutorial.pem ubuntu@54.165.116.208
```

### 5. Test Connection

**Ping test:**
```bash
ping 54.165.116.208
```

**Port test:**
```bash
# Windows PowerShell
Test-NetConnection -ComputerName 54.165.116.208 -Port 22

# Linux/Mac
nc -zv 54.165.116.208 22
```

---

## 🌐 **ALTERNATIVE: EC2 Instance Connect (Browser Terminal)**

**Works directly in AWS Console - no SSH keys needed!**

1. Go to **EC2 Console** → Select instance
2. Click **Connect** button
3. Select **EC2 Instance Connect** tab
4. Click **Connect**

**This opens a browser-based terminal!**

---

## 🔧 **QUICK FIXES:**

### Fix 1: Security Group Issue

```bash
# Add SSH rule for your IP
MY_IP=$(curl -s https://checkip.amazonaws.com)
aws ec2 authorize-security-group-ingress \
    --group-id sg-0bea1705b41dd4806 \
    --protocol tcp \
    --port 22 \
    --cidr $MY_IP/32 \
    --region us-east-1
```

### Fix 2: Restart Instance

```bash
# Stop and start instance (gets new public IP)
aws ec2 stop-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1
# Wait 1-2 minutes
aws ec2 start-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1
# Wait for running state, then get new IP
```

### Fix 3: Use Elastic IP (Prevents IP Changes)

```bash
# Allocate Elastic IP
aws ec2 allocate-address --domain vpc --region us-east-1

# Associate with instance (replace eipalloc-xxx with your allocation ID)
aws ec2 associate-address \
    --instance-id i-016ab2b939f5f7a3b \
    --allocation-id eipalloc-xxx \
    --region us-east-1
```

---

## 📋 **CONNECTION METHODS SUMMARY:**

| Method | Requires SSH Key? | Works in Browser? | Best For |
|--------|------------------|------------------|----------|
| **SSH** | ✅ Yes | ❌ No | Local terminal access |
| **EC2 Instance Connect** | ❌ No | ✅ Yes | Quick browser access |
| **Session Manager** | ❌ No | ✅ Yes | Secure, no ports needed |
| **EC2 Serial Console** | ❌ No | ✅ Yes | Emergency access |

---

## 🎯 **RECOMMENDED: Use Session Manager**

**Why?**
- ✅ No SSH keys needed
- ✅ No security group rules for port 22
- ✅ Works through AWS Console
- ✅ More secure
- ✅ Audit logging

**Setup:**
1. EC2 Console → Instance → **Connect** → **Session Manager**
2. If not available, attach IAM role with `AmazonSSMManagedInstanceCore` policy
3. SSM Agent is pre-installed on Ubuntu 22.04 AMI

---

## 🆘 **STILL CAN'T CONNECT?**

### Check These:

1. **Instance Status:**
   ```bash
   aws ec2 describe-instance-status --instance-ids i-016ab2b939f5f7a3b --region us-east-1
   ```

2. **Security Group:**
   ```bash
   aws ec2 describe-security-groups --group-ids sg-0bea1705b41dd4806 --region us-east-1
   ```

3. **Network ACLs:**
   - EC2 → Network Interfaces → Check NACL rules

4. **Route Tables:**
   - VPC → Route Tables → Verify internet gateway route

5. **Instance Logs:**
   - EC2 → Instance → **Actions** → **Monitor and troubleshoot** → **Get system log**

---

## 📞 **QUICK COMMANDS:**

### Get Instance Info:
```bash
aws ec2 describe-instances \
    --instance-ids i-016ab2b939f5f7a3b \
    --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress,PublicDnsName]' \
    --output table \
    --region us-east-1
```

### Connect via Session Manager:
```bash
aws ssm start-session --target i-016ab2b939f5f7a3b --region us-east-1
```

### Connect via EC2 Instance Connect:
```bash
aws ec2-instance-connect send-ssh-public-key \
    --instance-id i-016ab2b939f5f7a3b \
    --availability-zone us-east-1a \
    --instance-os-user ubuntu \
    --ssh-public-key file://~/.ssh/id_rsa.pub \
    --region us-east-1
```

---

**Instance ID:** `i-016ab2b939f5f7a3b`  
**Public IP:** `54.165.116.208` (may change)  
**Region:** `us-east-1`  
**Security Group:** `sg-0bea1705b41dd4806`  
**Key Pair:** `Ec2 Tutorial`
