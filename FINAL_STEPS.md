# ✅ Final Steps - Launch Your Instance

## Step 1: Find Your Key Pair Name

Run this in PowerShell to list your key pairs:

```powershell
aws ec2 describe-key-pairs --region us-east-1 --output table
```

Or get just the names:

```powershell
aws ec2 describe-key-pairs --region us-east-1 --query 'KeyPairs[*].KeyName' --output text
```

**Note the key name** (e.g., `my-key`, `wissen-key`, etc.)

---

## Step 2: Edit Launch Script

Open `launch-new-instance.sh` in your editor and change **line 9**:

```bash
KEY_NAME="your-actual-key-name"  # CHANGE THIS
```

Change to your actual key name, for example:
```bash
KEY_NAME="my-key"  # Your actual key name from step 1
```

---

## Step 3: Run Launch Script

### Option A: Using Git Bash (Recommended)

1. **Open Git Bash:**
   - Right-click in your project folder
   - Select "Git Bash Here"
   - Or open Git Bash and navigate:
     ```bash
     cd /c/Users/kolli/universal-publishers
     ```

2. **Make script executable:**
   ```bash
   chmod +x launch-new-instance.sh
   ```

3. **Run the script:**
   ```bash
   ./launch-new-instance.sh
   ```

### Option B: Using WSL

1. **Open WSL terminal**

2. **Navigate to project:**
   ```bash
   cd /mnt/c/Users/kolli/universal-publishers
   ```

3. **Make executable and run:**
   ```bash
   chmod +x launch-new-instance.sh
   ./launch-new-instance.sh
   ```

---

## What the Script Will Do

1. ✅ Find latest Ubuntu 22.04 AMI
2. ✅ Get VPC and subnet
3. ✅ Create security group (or use existing)
4. ✅ Launch instance
5. ✅ Wait for instance to be running
6. ✅ Get public IP
7. ✅ Test SSH connection

**Time:** About 2-3 minutes

---

## After Instance Launches

You'll see output like:
```
✅ INSTANCE LAUNCHED SUCCESSFULLY!
Instance ID: i-0123456789abcdef0
Public IP: 54.123.45.67
```

Then:

1. **SSH into the instance:**
   ```bash
   ssh -i ~/.ssh/your-key-name.pem ubuntu@54.123.45.67
   ```

2. **Deploy your application:**
   ```bash
   cd /var/www
   git clone https://github.com/kamal464/wissen-publication-group.git
   cd wissen-publication-group
   # Upload QUICK_DEPLOY.sh or copy it
   chmod +x QUICK_DEPLOY.sh
   ./QUICK_DEPLOY.sh
   ```

---

## Quick Commands Summary

```powershell
# 1. Find key pair name
aws ec2 describe-key-pairs --region us-east-1 --query 'KeyPairs[*].KeyName' --output text

# 2. Edit launch-new-instance.sh (set KEY_NAME on line 9)

# 3. In Git Bash:
chmod +x launch-new-instance.sh
./launch-new-instance.sh
```

---

**Ready? Find your key name, edit the script, then run it in Git Bash!** 🚀
