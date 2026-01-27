# 🧹 Server Cleanup & Verification Script

## Purpose
This script will:
1. Remove all suspicious untracked files from the server
2. Verify git repository is clean
3. Check disk space
4. Verify no suspicious processes are running

## Run This on Your EC2 Server

```bash
cd /var/www/wissen-publication-group && \
echo "🚨 CLEANUP AND VERIFICATION STARTING..." && \
echo "" && \
echo "=== STEP 1: Remove Suspicious Files ===" && \
rm -rf frontend/xmrig* frontend/scanner_linux frontend/public/ids.php 2>/dev/null && \
rm -f backend/.env.backup.* backend/.env.save 2>/dev/null && \
echo "✅ Suspicious files removed" && \
echo "" && \
echo "=== STEP 2: Check Git Status ===" && \
git status --porcelain && \
if [ -z "$(git status --porcelain)" ]; then \
  echo "✅ Git repository is clean (no untracked files in git)"; \
else \
  echo "⚠️  Git shows some changes. Checking untracked files..."; \
  git status --short | grep "^??" || echo "✅ No untracked files shown by git"; \
fi && \
echo "" && \
echo "=== STEP 3: List Remaining Files (if any) ===" && \
echo "Checking for suspicious files that might still exist:" && \
ls -la frontend/xmrig* 2>/dev/null && echo "⚠️  XMRig files still exist!" || echo "✅ No XMRig files found" && \
ls -la frontend/scanner_linux 2>/dev/null && echo "⚠️  Scanner file still exists!" || echo "✅ No scanner file found" && \
ls -la frontend/public/ids.php 2>/dev/null && echo "⚠️  ids.php still exists!" || echo "✅ No ids.php found" && \
ls -la backend/.env.backup.* backend/.env.save 2>/dev/null && echo "⚠️  Backup files still exist!" || echo "✅ No backup files found" && \
echo "" && \
echo "=== STEP 4: Check for Running Miners ===" && \
ps aux | grep -E "xmrig|miner|crypto" | grep -v grep && echo "⚠️  MINING PROCESSES FOUND!" || echo "✅ No mining processes running" && \
echo "" && \
echo "=== STEP 5: Check Disk Space ===" && \
df -h / && \
echo "" && \
echo "✅ Cleanup and verification complete!"
```

## Expected Output

After running, you should see:
- ✅ Suspicious files removed
- ✅ Git repository is clean (no untracked files in git)
- ✅ No suspicious files found
- ✅ No mining processes running
- Disk space information

## Note About Git Status

**Important**: The files are already in `.gitignore`, so they won't show up in `git status` even if they exist on the filesystem. The script:
1. Removes the files from the filesystem
2. Verifies git status is clean (which it should be since files are ignored)
3. Double-checks by listing files directly to ensure they're gone

## If Files Still Exist

If any suspicious files are still found, manually remove them:

```bash
cd /var/www/wissen-publication-group
sudo rm -rf frontend/xmrig* frontend/scanner_linux frontend/public/ids.php
sudo rm -f backend/.env.backup.* backend/.env.save
```

## If Mining Processes Are Running

```bash
# Find and kill mining processes
ps aux | grep -E "xmrig|miner" | grep -v grep | awk '{print $2}' | xargs sudo kill -9 2>/dev/null

# Verify they're gone
ps aux | grep -E "xmrig|miner" | grep -v grep || echo "✅ All miners killed"
```
