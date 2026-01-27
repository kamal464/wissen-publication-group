# 🚀 Complete Setup Guide - Auto Install Everything

## Quick Start (Windows)

### Option 1: Automated Setup (Recommended)

```powershell
# Run the automated setup script
.\auto-setup-aws.ps1
```

This script will:
- ✅ Check if AWS CLI is installed, install if missing
- ✅ Check AWS configuration, prompt to configure if needed
- ✅ Check and set default region
- ✅ Check if jq is installed, install if missing
- ✅ Check your EC2 key pairs
- ✅ Verify all script files

### Option 2: Manual Setup

Follow the step-by-step guide below.

---

## Step-by-Step Manual Setup

### Step 1: Install AWS CLI

**Windows:**
```powershell
# Download and install
$msiPath = "$env:TEMP\AWSCLIV2.msi"
Invoke-WebRequest -Uri "https://awscli.amazonaws.com/AWSCLIV2.msi" -OutFile $msiPath
Start-Process msiexec.exe -ArgumentList "/i $msiPath /quiet" -Wait
Remove-Item $msiPath

# Verify
aws --version
```

**Or download manually:**
- Go to: https://awscli.amazonaws.com/AWSCLIV2.msi
- Run the installer

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version
```

**Mac:**
```bash
brew install awscli
aws --version
```

---

### Step 2: Configure AWS Credentials

```powershell
# Run configuration
aws configure
```

You'll need:
1. **AWS Access Key ID** - Get from:
   - AWS Console → Your Username (top right) → Security credentials
   - Or: https://console.aws.amazon.com/iam/
   - Click "Create access key" → Choose "CLI" → Download

2. **AWS Secret Access Key** - Shown when creating access key

3. **Default region:** `us-east-1`

4. **Default output format:** `json`

**Verify:**
```powershell
aws sts get-caller-identity
```

---

### Step 3: Install jq

**Windows (Chocolatey):**
```powershell
choco install jq
```

**Windows (Manual):**
```powershell
# Download jq
$jqUrl = "https://github.com/jqlang/jq/releases/download/jq-1.7.1/jq-win64.exe"
$jqDir = "$env:USERPROFILE\.local\bin"
New-Item -ItemType Directory -Path $jqDir -Force | Out-Null
Invoke-WebRequest -Uri $jqUrl -OutFile "$jqDir\jq.exe" -UseBasicParsing
$env:Path += ";$jqDir"
[Environment]::SetEnvironmentVariable("Path", $env:Path, [EnvironmentVariableTarget]::User)

# Verify
jq --version
```

**Linux:**
```bash
sudo apt install jq
jq --version
```

**Mac:**
```bash
brew install jq
jq --version
```

---

### Step 4: Check/Create Key Pairs

**List existing key pairs:**
```powershell
aws ec2 describe-key-pairs --region us-east-1
```

**Create new key pair (if needed):**
```powershell
# Create key pair
aws ec2 create-key-pair `
  --key-name wissen-secure-key `
  --region us-east-1 `
  --query 'KeyMaterial' `
  --output text | Out-File -FilePath "$env:USERPROFILE\.ssh\wissen-secure-key.pem" -Encoding ASCII

# Verify
Test-Path "$env:USERPROFILE\.ssh\wissen-secure-key.pem"
```

**Note:** Save the `.pem` file securely - you can't download it again!

---

### Step 5: Prepare Scripts

**For Windows, you need Git Bash or WSL to run bash scripts:**

**Option A: Install Git Bash (Recommended)**
1. Download Git for Windows: https://git-scm.com/download/win
2. Install (includes Git Bash)
3. Open Git Bash
4. Navigate to project:
   ```bash
   cd /c/Users/kolli/universal-publishers
   ```

**Option B: Install WSL**
```powershell
wsl --install
# Restart computer, then open WSL terminal
```

---

### Step 6: Run Verification

**In Git Bash or WSL:**
```bash
# Make executable
chmod +x check-aws-setup.sh

# Run verification
./check-aws-setup.sh
```

**Or use PowerShell:**
```powershell
# Check everything manually
aws --version
aws sts get-caller-identity
aws configure get region
aws ec2 describe-key-pairs --region us-east-1
jq --version
```

---

### Step 7: Edit Launch Script

**In Git Bash/WSL or your editor:**
```bash
# Edit the script
nano launch-new-instance.sh
# Or: code launch-new-instance.sh

# Change line 9:
KEY_NAME="your-actual-key-name"  # Use key name from step 4
```

---

### Step 8: Launch Instance

**In Git Bash or WSL:**
```bash
# Make executable
chmod +x launch-new-instance.sh

# Run
./launch-new-instance.sh
```

---

## All-in-One Commands

### Windows PowerShell (Quick Check)

```powershell
# 1. Check AWS CLI
aws --version

# 2. Configure (if needed)
aws configure

# 3. Verify credentials
aws sts get-caller-identity

# 4. Set region
aws configure set region us-east-1

# 5. List key pairs
aws ec2 describe-key-pairs --region us-east-1 --output table

# 6. Check jq
jq --version
```

### Create Key Pair (if needed)

```powershell
aws ec2 create-key-pair `
  --key-name wissen-secure-key `
  --region us-east-1 `
  --query 'KeyMaterial' `
  --output text | Out-File -FilePath "$env:USERPROFILE\.ssh\wissen-secure-key.pem" -Encoding ASCII
```

---

## Complete Checklist

Before launching instance:

- [ ] AWS CLI installed (`aws --version`)
- [ ] AWS credentials configured (`aws configure`)
- [ ] Credentials verified (`aws sts get-caller-identity`)
- [ ] Default region set (`aws configure get region`)
- [ ] jq installed (`jq --version`)
- [ ] Key pair exists (`aws ec2 describe-key-pairs`)
- [ ] Key file downloaded (check `~/.ssh/` or `$env:USERPROFILE\.ssh\`)
- [ ] Git Bash or WSL installed (for bash scripts)
- [ ] Script edited with correct `KEY_NAME`
- [ ] Ready to run `./launch-new-instance.sh`

---

## Troubleshooting

### "aws: command not found"
- Restart PowerShell after installation
- Check PATH: `$env:PATH`
- Reinstall AWS CLI

### "Unable to locate credentials"
- Run: `aws configure`
- Check: `$env:USERPROFILE\.aws\credentials`

### "jq: command not found"
- Install via Chocolatey: `choco install jq`
- Or add to PATH manually

### "Key pair not found"
- List key pairs: `aws ec2 describe-key-pairs --region us-east-1`
- Create new one if needed (see Step 4)

### Scripts won't run in PowerShell
- Use Git Bash or WSL (bash scripts need bash)
- Or run AWS CLI commands directly in PowerShell

---

## Quick Reference

| Tool | Install Command | Verify Command |
|------|----------------|----------------|
| AWS CLI | Download MSI or `choco install awscli` | `aws --version` |
| AWS Config | `aws configure` | `aws sts get-caller-identity` |
| jq | `choco install jq` or manual download | `jq --version` |
| Key Pair | `aws ec2 create-key-pair` | `aws ec2 describe-key-pairs` |

---

## Next Steps After Setup

1. ✅ Run `.\auto-setup-aws.ps1` to verify everything
2. ✅ Edit `launch-new-instance.sh` (set KEY_NAME)
3. ✅ Run `./launch-new-instance.sh` (in Git Bash/WSL)
4. ✅ SSH to new instance
5. ✅ Deploy application with `QUICK_DEPLOY.sh`

---

**Start with: Run `.\auto-setup-aws.ps1` in PowerShell!** 🚀
