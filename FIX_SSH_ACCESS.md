# 🔧 Fix SSH Access - Step by Step

**Run these commands on YOUR LOCAL COMPUTER (not on EC2)**

---

## 📍 **STEP 1: Get Your IP Address**

### On Windows (PowerShell):
```powershell
# Option 1: Using curl (if available)
curl https://checkip.amazonaws.com

# Option 2: Using Invoke-WebRequest
(Invoke-WebRequest -Uri "https://checkip.amazonaws.com").Content.Trim()

# Option 3: Using a browser
# Just visit: https://checkip.amazonaws.com
```

### On Mac/Linux:
```bash
curl https://checkip.amazonaws.com
```

### Or use your browser:
Just visit: **https://checkip.amazonaws.com**

**Copy the IP address that's shown (e.g., `123.45.67.89`)**

---

## 🔐 **STEP 2: Update Security Group in AWS Console**

### Method 1: Via AWS Console (Easiest)

1. **Open AWS Console**: https://console.aws.amazon.com/ec2/
2. **Navigate to Security Groups**:
   - Left sidebar → **Network & Security** → **Security Groups**
   - OR search for "Security Groups" in the top search bar
3. **Find your security group**:
   - Search for: `sg-0bea1705b41dd4806`
   - OR look for security group name: `wissen-app-sg`
4. **Select the security group** (click on it)
5. **Edit Inbound Rules**:
   - Click **Edit inbound rules** button
   - Click **Add rule**
   - Configure:
     - **Type**: SSH
     - **Protocol**: TCP
     - **Port range**: 22
     - **Source**: Custom
     - **IP**: Paste your IP from Step 1 (e.g., `123.45.67.89/32`)
   - Click **Save rules**

### Method 2: Via AWS CLI (If you have AWS CLI configured)

```bash
# Get your IP
MY_IP=$(curl -s https://checkip.amazonaws.com)
echo "Your IP is: $MY_IP"

# Add SSH rule to security group
aws ec2 authorize-security-group-ingress \
    --group-id sg-0bea1705b41dd4806 \
    --protocol tcp \
    --port 22 \
    --cidr $MY_IP/32 \
    --region us-east-1
```

---

## ✅ **STEP 3: Test SSH Connection**

### On Windows (PowerShell):
```powershell
# Make sure your key file exists
Test-Path "$env:USERPROFILE\.ssh\Ec2-Tutorial.pem"

# Connect via SSH
ssh -i "$env:USERPROFILE\.ssh\Ec2-Tutorial.pem" ubuntu@54.165.116.208
```

### On Mac/Linux:
```bash
# Set key permissions (if needed)
chmod 400 ~/.ssh/Ec2-Tutorial.pem

# Connect via SSH
ssh -i ~/.ssh/Ec2-Tutorial.pem ubuntu@54.165.116.208
```

**Note:** The IP `54.165.116.208` might have changed if the instance was stopped/started. Get the current IP from EC2 Console.

---

## 🔍 **STEP 4: Get Current Instance IP (If Connection Fails)**

### Via AWS Console:
1. EC2 → Instances
2. Select instance `i-016ab2b939f5f7a3b`
3. Check **Public IPv4 address** in the details panel

### Via AWS CLI:
```bash
aws ec2 describe-instances \
    --instance-ids i-016ab2b939f5f7a3b \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text \
    --region us-east-1
```

---

## 🚨 **TROUBLESHOOTING:**

### Issue: "Permission denied (publickey)"
**Solution**: Check that your SSH key file exists and has correct permissions

### Issue: "Connection timed out"
**Solutions**:
1. Verify security group rule was added correctly
2. Check that instance is running
3. Verify the public IP address is correct
4. Your IP might have changed (especially if using mobile/hotspot)

### Issue: "Host key verification failed"
**Solution**: 
```bash
ssh-keygen -R 54.165.116.208
```

### Issue: "WARNING: UNPROTECTED PRIVATE KEY FILE"
**Windows**: Usually not an issue, but you can try:
```powershell
icacls "$env:USERPROFILE\.ssh\Ec2-Tutorial.pem" /inheritance:r
icacls "$env:USERPROFILE\.ssh\Ec2-Tutorial.pem" /grant:r "$env:USERNAME:(R)"
```

**Mac/Linux**:
```bash
chmod 400 ~/.ssh/Ec2-Tutorial.pem
```

---

## 📋 **QUICK CHECKLIST:**

- [ ] Got my IP address from https://checkip.amazonaws.com
- [ ] Opened AWS Console → Security Groups
- [ ] Found security group `sg-0bea1705b41dd4806`
- [ ] Added SSH rule (port 22) with my IP/32
- [ ] Saved the security group rules
- [ ] Verified instance is running
- [ ] Got current public IP of instance
- [ ] Have SSH key file ready
- [ ] Tested SSH connection

---

## 🎯 **ALTERNATIVE: If SSH Still Doesn't Work**

### Use EC2 Instance Connect (Browser Terminal):
1. EC2 Console → Select instance
2. Click **Connect** button
3. Select **EC2 Instance Connect** tab
4. Click **Connect**

**This works without SSH keys!** But you still need to be able to access AWS Console.

---

**Security Group ID**: `sg-0bea1705b41dd4806`  
**Instance ID**: `i-016ab2b939f5f7a3b`  
**Region**: `us-east-1`  
**Key Pair**: `Ec2 Tutorial`
