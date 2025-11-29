# 🔐 Git Authentication Setup for GitHub

## Issue
You're currently logged in as `kkamalakar-mastishka` but trying to push to `kamal464/wissen-publication-group`.

## Solution Options

### Option 1: Use Personal Access Token (Recommended)

1. **Create a Personal Access Token**:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: `wissen-publication-group`
   - Select scopes: ✅ `repo` (full control of private repositories)
   - Click "Generate token"
   - **COPY THE TOKEN** (you won't see it again!)

2. **Update Remote URL with Token**:
   ```bash
   git remote set-url origin https://kamal464:YOUR_TOKEN@github.com/kamal464/wissen-publication-group.git
   ```

3. **Push**:
   ```bash
   git push -u origin main
   ```

### Option 2: Use SSH (More Secure)

1. **Generate SSH Key** (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "k.kamalakar@mastishkatech.com"
   # Press Enter to accept default location
   # Enter a passphrase (optional but recommended)
   ```

2. **Add SSH Key to GitHub**:
   - Copy your public key:
     ```bash
     cat ~/.ssh/id_ed25519.pub
     ```
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste the key and save

3. **Update Remote to SSH**:
   ```bash
   git remote set-url origin git@github.com:kamal464/wissen-publication-group.git
   ```

4. **Push**:
   ```bash
   git push -u origin main
   ```

### Option 3: Use GitHub CLI

1. **Install GitHub CLI** (if not installed):
   - Download from: https://cli.github.com/

2. **Authenticate**:
   ```bash
   gh auth login
   # Follow the prompts to authenticate
   ```

3. **Push**:
   ```bash
   git push -u origin main
   ```

---

## Quick Fix (If you have access to kamal464 account)

If you have the password or token for `kamal464` account:

```bash
# Update remote with username
git remote set-url origin https://kamal464@github.com/kamal464/wissen-publication-group.git

# Push (it will prompt for password/token)
git push -u origin main
```

---

## Verify Setup

After setting up authentication:

```bash
# Check remote
git remote -v

# Test connection
git ls-remote origin
```

If this works, you're ready to push!

