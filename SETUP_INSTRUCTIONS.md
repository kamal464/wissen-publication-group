# 🔑 Setup Instructions - Keys & Running the Script

## Part 1: Getting Your EC2 Key Pair

### Option A: Use Existing Key Pair (Recommended)

1. **Check if you already have a key pair:**
   ```bash
   # List your key pairs
   aws ec2 describe-key-pairs --region us-east-1
   ```

2. **Find your key file locally:**
   - Usually in: `~/.ssh/` or `C:\Users\YourName\.ssh\`
   - Look for files like: `your-key-name.pem` or `your-key-name.ppk`

3. **Note the key name** (not the filename, but the AWS key pair name)
   - Example: If file is `my-server-key.pem`, the key name might be `my-server-key`

### Option B: Create New Key Pair

**Via AWS Console:**
1. Go to **EC2 → Key Pairs** (left sidebar)
2. Click **Create key pair**
3. Name: `wissen-secure-key` (or any name you prefer)
4. Key pair type: **RSA**
5. Private key file format: **.pem** (for Linux/Mac) or **.ppk** (for Windows PuTTY)
6. Click **Create key pair**
7. **IMPORTANT:** The `.pem` file will download automatically - save it securely!

**Via AWS CLI:**
```bash
# Create new key pair
aws ec2 create-key-pair \
  --key-name wissen-secure-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/wissen-secure-key.pem

# Set proper permissions (Linux/Mac)
chmod 400 ~/.ssh/wissen-secure-key.pem
```

---

## Part 2: Where to Run the Script

### You need to run the script on YOUR LOCAL COMPUTER (not on AWS)

The script uses AWS CLI to launch an instance, so it needs to run where:
- ✅ AWS CLI is installed
- ✅ AWS credentials are configured
- ✅ You have internet access

### Step-by-Step Setup

#### 1. Install AWS CLI (if not installed)

**Windows:**
```powershell
# Download and install from:
# https://awscli.amazonaws.com/AWSCLIV2.msi
# Or use Chocolatey:
choco install awscli
```

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**macOS:**
```bash
brew install awscli
# Or download from AWS website
```

**Verify installation:**
```bash
aws --version
```

#### 2. Configure AWS Credentials

```bash
aws configure
```

You'll need:
- **AWS Access Key ID** - Get from AWS Console → IAM → Users → Security credentials
- **AWS Secret Access Key** - Get when creating access key
- **Default region**: `us-east-1` (or your preferred region)
- **Default output format**: `json`

**Or set environment variables:**
```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

#### 3. Install jq (for JSON parsing)

**Windows:**
```powershell
choco install jq
# Or download from: https://stedolan.github.io/jq/download/
```

**Linux:**
```bash
sudo apt install jq  # Debian/Ubuntu
sudo yum install jq  # RHEL/CentOS
```

**macOS:**
```bash
brew install jq
```

**Verify:**
```bash
jq --version
```

#### 4. Download/Prepare the Script

**Option A: If script is in your local repo:**
```bash
cd /path/to/universal-publishers
chmod +x launch-new-instance.sh
```

**Option B: Create script file manually:**
```bash
# Copy contents of launch-new-instance.sh into a new file
nano launch-new-instance.sh
# Paste the script content
chmod +x launch-new-instance.sh
```

#### 5. Edit the Script

Open `launch-new-instance.sh` and edit line 9:

```bash
KEY_NAME="your-key-name"  # CHANGE THIS
```

Change to your actual key pair name, for example:
```bash
KEY_NAME="wissen-secure-key"  # Your actual key name
```

**Important:** Use the KEY PAIR NAME (from AWS), not the filename!

#### 6. Verify Your Key File Location

The script assumes your key is at: `~/.ssh/${KEY_NAME}.pem`

**Check if your key file exists:**
```bash
# Linux/Mac
ls -la ~/.ssh/your-key-name.pem

# Windows (PowerShell)
Test-Path $env:USERPROFILE\.ssh\your-key-name.pem
```

**If your key is in a different location:**
- Either move it to `~/.ssh/`
- Or edit the script to use the correct path (line 206 in the script)

#### 7. Set Key File Permissions (Linux/Mac only)

```bash
chmod 400 ~/.ssh/your-key-name.pem
```

---

## Part 3: Running the Script

### From Your Local Computer:

```bash
# Navigate to script directory
cd /path/to/universal-publishers

# Make sure it's executable
chmod +x launch-new-instance.sh

# Run it
./launch-new-instance.sh
```

### What Happens:

1. ✅ Script finds latest Ubuntu AMI
2. ✅ Creates security group
3. ✅ Launches instance
4. ✅ Waits for it to be ready
5. ✅ Shows you the public IP
6. ✅ Tests SSH connection

### After Script Completes:

You'll get output like:
```
✅ INSTANCE LAUNCHED SUCCESSFULLY!
Instance ID: i-0123456789abcdef0
Public IP: 54.123.45.67
```

Then SSH into the new instance:
```bash
ssh -i ~/.ssh/your-key-name.pem ubuntu@54.123.45.67
```

---

## Quick Checklist

Before running the script:

- [ ] AWS CLI installed (`aws --version`)
- [ ] AWS credentials configured (`aws configure`)
- [ ] jq installed (`jq --version`)
- [ ] EC2 key pair exists (check AWS Console or `aws ec2 describe-key-pairs`)
- [ ] Key file downloaded and saved (usually `~/.ssh/key-name.pem`)
- [ ] Key file permissions set (Linux/Mac: `chmod 400 ~/.ssh/key-name.pem`)
- [ ] Script edited with correct `KEY_NAME`
- [ ] Script is executable (`chmod +x launch-new-instance.sh`)

---

## Common Issues

### "Key pair not found"
- Check key name in AWS Console: EC2 → Key Pairs
- Make sure `KEY_NAME` in script matches exactly (case-sensitive)

### "Permission denied (publickey)"
- Key file permissions wrong: `chmod 400 ~/.ssh/key-name.pem`
- Wrong key file path
- Wrong key name

### "AWS CLI not found"
- Install AWS CLI (see step 1 above)
- Make sure it's in your PATH

### "jq: command not found"
- Install jq (see step 3 above)

### "Access Denied"
- Check AWS credentials: `aws sts get-caller-identity`
- Verify IAM user has EC2 permissions

---

## Where Everything Lives

```
Your Local Computer:
├── ~/.ssh/
│   └── your-key-name.pem          # EC2 key file (download from AWS)
├── /path/to/universal-publishers/
│   ├── launch-new-instance.sh     # Script to run
│   └── QUICK_DEPLOY.sh            # Deployment script (for later)
└── AWS CLI config:
    └── ~/.aws/
        ├── credentials             # AWS access keys
        └── config                  # AWS region settings

AWS:
└── EC2 Key Pairs:
    └── your-key-name               # Key pair name (use in script)
```

---

## Summary

1. **Get Key Pair:** AWS Console → EC2 → Key Pairs (download .pem file)
2. **Save Key:** `~/.ssh/your-key-name.pem`
3. **Set Permissions:** `chmod 400 ~/.ssh/your-key-name.pem` (Linux/Mac)
4. **Edit Script:** Change `KEY_NAME="your-key-name"` to your actual key name
5. **Run Script:** `./launch-new-instance.sh` (from your local computer)
6. **SSH to Instance:** Use the public IP shown in output

---

**Ready? Follow the checklist above, then run the script!** 🚀
