# 🪟 Windows AWS CLI Setup Guide

## Step 1: Install AWS CLI

### Option A: Download Installer (Recommended)

1. **Download AWS CLI:**
   - Go to: https://awscli.amazonaws.com/AWSCLIV2.msi
   - Download the MSI installer

2. **Run the installer:**
   - Double-click `AWSCLIV2.msi`
   - Follow the installation wizard
   - Accept defaults

3. **Verify installation:**
   ```powershell
   aws --version
   ```

### Option B: Using Chocolatey

```powershell
# If you have Chocolatey installed
choco install awscli
```

### Option C: Using MSI via PowerShell

```powershell
# Download and install
$msiPath = "$env:TEMP\AWSCLIV2.msi"
Invoke-WebRequest -Uri "https://awscli.amazonaws.com/AWSCLIV2.msi" -OutFile $msiPath
Start-Process msiexec.exe -ArgumentList "/i $msiPath /quiet" -Wait
Remove-Item $msiPath
aws --version
```

---

## Step 2: Configure AWS Credentials

### Get Your AWS Credentials

1. **Go to AWS Console:**
   - https://console.aws.amazon.com/
   - Sign in

2. **Navigate to IAM:**
   - Click your username (top right)
   - Click "Security credentials"

3. **Create Access Key:**
   - Scroll to "Access keys"
   - Click "Create access key"
   - Choose "Command Line Interface (CLI)"
   - Click "Next" → "Create access key"
   - **IMPORTANT:** Download or copy:
     - Access Key ID
     - Secret Access Key

### Configure AWS CLI

```powershell
aws configure
```

Enter:
- **AWS Access Key ID:** (paste your access key)
- **AWS Secret Access Key:** (paste your secret key)
- **Default region name:** `us-east-1`
- **Default output format:** `json`

### Verify Configuration

```powershell
# Test your credentials
aws sts get-caller-identity

# Check configured region
aws configure get region
```

---

## Step 3: Install jq (JSON Parser)

### Option A: Using Chocolatey

```powershell
choco install jq
```

### Option B: Manual Download

1. **Download jq:**
   - Go to: https://stedolan.github.io/jq/download/
   - Download Windows 64-bit version

2. **Extract and add to PATH:**
   - Extract `jq.exe` to a folder (e.g., `C:\tools\jq\`)
   - Add to PATH:
     ```powershell
     [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\tools\jq", [EnvironmentVariableTarget]::User)
     ```
   - Restart PowerShell

3. **Verify:**
   ```powershell
   jq --version
   ```

---

## Step 4: Check Key Pairs

### List Your Key Pairs

```powershell
aws ec2 describe-key-pairs --region us-east-1
```

### Create New Key Pair (if needed)

```powershell
# Create key pair
aws ec2 create-key-pair `
  --key-name wissen-secure-key `
  --region us-east-1 `
  --query 'KeyMaterial' `
  --output text | Out-File -FilePath "$env:USERPROFILE\.ssh\wissen-secure-key.pem" -Encoding ASCII

# Verify file created
Test-Path "$env:USERPROFILE\.ssh\wissen-secure-key.pem"
```

**Note:** Save the `.pem` file securely - you can't download it again!

---

## Step 5: Prepare Scripts

### Download Scripts

The scripts are in your repository:
- `check-aws-setup.sh` - Verification script
- `launch-new-instance.sh` - Launch script

### For Windows, Use Git Bash or WSL

**Option A: Git Bash (Recommended)**
1. Install Git for Windows (includes Git Bash)
2. Open Git Bash
3. Navigate to your project:
   ```bash
   cd /c/Users/kolli/universal-publishers
   ```

**Option B: WSL (Windows Subsystem for Linux)**
1. Install WSL:
   ```powershell
   wsl --install
   ```
2. Open WSL terminal
3. Navigate to your project

**Option C: Use PowerShell with AWS CLI directly**

I'll create a PowerShell version of the scripts for you.

---

## Step 6: Run Verification

### In Git Bash or WSL:

```bash
# Make executable
chmod +x check-aws-setup.sh

# Run verification
./check-aws-setup.sh
```

### Or use PowerShell commands:

```powershell
# Check AWS CLI
aws --version

# Check credentials
aws sts get-caller-identity

# Check region
aws configure get region

# List key pairs
aws ec2 describe-key-pairs --region us-east-1

# Check jq
jq --version
```

---

## Step 7: Edit and Run Launch Script

### Edit Script (in Git Bash/WSL)

```bash
# Edit the script
nano launch-new-instance.sh
# Or use: code launch-new-instance.sh (if VS Code is installed)

# Change line 9:
KEY_NAME="your-actual-key-name"
```

### Run Launch Script

```bash
# Make executable
chmod +x launch-new-instance.sh

# Run
./launch-new-instance.sh
```

---

## Quick PowerShell Commands

```powershell
# 1. Check AWS CLI
aws --version

# 2. Configure (if not done)
aws configure

# 3. Verify credentials
aws sts get-caller-identity

# 4. List key pairs
aws ec2 describe-key-pairs --region us-east-1 --output table

# 5. Create key pair (if needed)
aws ec2 create-key-pair --key-name wissen-secure-key --region us-east-1 --query 'KeyMaterial' --output text | Out-File -FilePath "$env:USERPROFILE\.ssh\wissen-secure-key.pem"

# 6. Check jq
jq --version
```

---

## Troubleshooting

### "aws: command not found"
- Restart PowerShell/terminal after installation
- Check PATH: `$env:PATH`
- Reinstall AWS CLI

### "Unable to locate credentials"
- Run: `aws configure`
- Check: `$env:USERPROFILE\.aws\credentials`

### "jq: command not found"
- Install via Chocolatey: `choco install jq`
- Or add to PATH manually

### Scripts won't run
- Use Git Bash or WSL (bash scripts need bash)
- Or I can create PowerShell versions

---

## Next Steps

1. ✅ Install AWS CLI
2. ✅ Configure credentials (`aws configure`)
3. ✅ Install jq
4. ✅ Check/create key pairs
5. ✅ Edit `launch-new-instance.sh` (set KEY_NAME)
6. ✅ Run `./launch-new-instance.sh` (in Git Bash/WSL)

---

**Start with: Install AWS CLI from https://awscli.amazonaws.com/AWSCLIV2.msi** 🚀
