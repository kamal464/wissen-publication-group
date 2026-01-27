# 🔑 How to Get AWS Access Keys

## Quick Steps

### Method 1: From IAM Console (Recommended)

1. **Go to AWS Console:**
   - https://console.aws.amazon.com/
   - Sign in

2. **Navigate to IAM:**
   - Click on your **username** (top right corner)
   - Click **"Security credentials"**

3. **Create Access Key:**
   - Scroll down to **"Access keys"** section
   - Click **"Create access key"**
   - Choose use case: **"Command Line Interface (CLI)"**
   - Check the confirmation box
   - Click **"Next"**
   - (Optional) Add description: "For EC2 instance management"
   - Click **"Create access key"**

4. **Download/Copy Keys:**
   - **Access Key ID** - Copy this immediately
   - **Secret Access Key** - Click "Show" and copy this immediately
   - **⚠️ IMPORTANT:** You can only see the secret key once!
   - Click **"Download .csv file"** to save both keys securely
   - Or copy both keys to a secure location

5. **Click "Done"**

---

### Method 2: Direct IAM Link

1. **Go directly to IAM Security Credentials:**
   - https://console.aws.amazon.com/iam/home#/security_credentials

2. **Follow steps 3-5 from Method 1**

---

### Method 3: For IAM Users (If Using IAM User)

1. **Go to IAM Console:**
   - https://console.aws.amazon.com/iam/
   - Click **"Users"** (left sidebar)

2. **Select Your User:**
   - Click on your IAM username

3. **Go to Security Credentials Tab:**
   - Click **"Security credentials"** tab

4. **Create Access Key:**
   - Scroll to **"Access keys"** section
   - Click **"Create access key"**
   - Choose use case: **"Command Line Interface (CLI)"**
   - Click **"Next"** → **"Create access key"**

5. **Download/Copy Keys:**
   - Copy both keys immediately
   - Download .csv file for backup

---

## Visual Guide

### Step-by-Step Path:

```
AWS Console
  └─> Click Username (top right)
      └─> Security credentials
          └─> Access keys section
              └─> Create access key
                  └─> Choose "Command Line Interface (CLI)"
                      └─> Next → Create access key
                          └─> Copy Access Key ID
                          └─> Show & Copy Secret Access Key
                          └─> Download .csv (backup)
```

---

## What You'll See

After clicking "Create access key", you'll see:

```
┌─────────────────────────────────────────┐
│  Access key created                     │
├─────────────────────────────────────────┤
│  Access key ID:                         │
│  AKIAIOSFODNN7EXAMPLE                   │
│  [Copy]                                 │
├─────────────────────────────────────────┤
│  Secret access key:                     │
│  [Show]                                 │
│  wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY│
│  [Copy]                                 │
├─────────────────────────────────────────┤
│  [Download .csv file]                   │
│  [Done]                                 │
└─────────────────────────────────────────┘
```

---

## Security Best Practices

1. **Never share your access keys**
2. **Don't commit keys to git** (they're in `.gitignore`)
3. **Download the .csv file** as backup
4. **Store keys securely** (password manager, encrypted file)
5. **Rotate keys regularly** (every 90 days recommended)
6. **Delete unused keys** (old keys can be security risk)

---

## Using the Keys

### Configure AWS CLI:

```powershell
aws configure
```

Enter:
- **AWS Access Key ID:** `AKIAIOSFODNN7EXAMPLE` (your actual key)
- **AWS Secret Access Key:** `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` (your actual secret)
- **Default region name:** `us-east-1`
- **Default output format:** `json`

### Verify:

```powershell
aws sts get-caller-identity
```

Should show your AWS account ID and user ARN.

---

## Troubleshooting

### "You don't have permission to create access keys"
- Your IAM user may not have permission
- Contact your AWS administrator
- Or use root account (not recommended for production)

### "Access key limit reached"
- You can have up to 2 access keys per user
- Delete an old unused key first
- Go to Security credentials → Access keys → Delete

### "Can't find Security credentials"
- Make sure you're signed in
- Try direct link: https://console.aws.amazon.com/iam/home#/security_credentials
- Or go to IAM → Users → Your User → Security credentials tab

---

## Quick Links

- **IAM Security Credentials:** https://console.aws.amazon.com/iam/home#/security_credentials
- **IAM Users:** https://console.aws.amazon.com/iam/home#/users
- **IAM Console:** https://console.aws.amazon.com/iam/

---

## After Getting Keys

1. **Configure AWS CLI:**
   ```powershell
   aws configure
   ```

2. **Verify:**
   ```powershell
   aws sts get-caller-identity
   ```

3. **Run setup script:**
   ```powershell
   .\auto-setup-aws.ps1
   ```

---

**Quick Path: AWS Console → Your Username (top right) → Security credentials → Access keys → Create access key** 🔑
