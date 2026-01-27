#!/bin/bash
# 🚨 EMERGENCY CLEANUP SCRIPT
# Run this immediately on the compromised instance

set -e

echo "🚨 EMERGENCY CLEANUP STARTING..."
echo ""

# Step 1: Kill all suspicious processes
echo "=== STEP 1: Kill All Suspicious Processes ==="
sudo pkill -9 xmrig 2>/dev/null || true
sudo pkill -9 scanner 2>/dev/null || true
sudo pkill -9 miner 2>/dev/null || true
ps aux | grep -E "xmrig|miner|scanner" | grep -v grep | awk '{print $2}' | xargs sudo kill -9 2>/dev/null || true
echo "✅ Suspicious processes killed"
echo ""

# Step 2: Remove suspicious files
echo "=== STEP 2: Remove Suspicious Files ==="
cd /var/www/wissen-publication-group 2>/dev/null || cd ~
rm -rf frontend/xmrig* 2>/dev/null || true
rm -rf frontend/scanner_linux 2>/dev/null || true
rm -rf frontend/public/ids.php 2>/dev/null || true
rm -f backend/.env.backup.* 2>/dev/null || true
rm -f backend/.env.save 2>/dev/null || true
echo "✅ Suspicious files removed"
echo ""

# Step 3: Check for persistence mechanisms
echo "=== STEP 3: Check for Persistence Mechanisms ==="
echo "Checking crontab..."
if crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$" | grep -E "xmrig|miner|scanner|curl.*http|wget.*http"; then
    echo "⚠️  SUSPICIOUS CRONTAB ENTRIES FOUND!"
    crontab -l
else
    echo "✅ No suspicious user crontab entries"
fi

if sudo crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$" | grep -E "xmrig|miner|scanner|curl.*http|wget.*http"; then
    echo "⚠️  SUSPICIOUS ROOT CRONTAB ENTRIES FOUND!"
    sudo crontab -l
else
    echo "✅ No suspicious root crontab entries"
fi

echo ""
echo "Checking systemd services..."
if systemctl list-units --type=service --all 2>/dev/null | grep -E "xmrig|miner|scanner"; then
    echo "⚠️  SUSPICIOUS SYSTEMD SERVICES FOUND!"
    systemctl list-units --type=service --all | grep -E "xmrig|miner|scanner"
else
    echo "✅ No suspicious systemd services"
fi

echo ""
echo "Checking /etc/rc.local..."
if [ -f /etc/rc.local ]; then
    if cat /etc/rc.local | grep -v "^#" | grep -v "^$" | grep -E "xmrig|miner|scanner"; then
        echo "⚠️  SUSPICIOUS RC.LOCAL ENTRIES FOUND!"
        cat /etc/rc.local
    else
        echo "✅ No suspicious rc.local entries"
    fi
else
    echo "✅ No rc.local file"
fi

echo ""

# Step 4: Check network connections
echo "=== STEP 4: Check Network Connections ==="
echo "Active connections:"
sudo netstat -tulpn 2>/dev/null | head -20 || sudo ss -tulpn 2>/dev/null | head -20
echo ""

# Step 5: Check for suspicious files in common locations
echo "=== STEP 5: Check for Additional Malicious Files ==="
echo "Checking /tmp..."
ls -la /tmp/* | grep -E "xmrig|miner|scanner" || echo "✅ No suspicious files in /tmp"
echo ""
echo "Checking /var/tmp..."
ls -la /var/tmp/* 2>/dev/null | grep -E "xmrig|miner|scanner" || echo "✅ No suspicious files in /var/tmp"
echo ""

# Step 6: Check SSH authorized_keys
echo "=== STEP 6: Review SSH Access ==="
echo "Authorized SSH keys:"
cat ~/.ssh/authorized_keys 2>/dev/null || echo "No authorized_keys file"
echo ""

# Step 7: Summary
echo "=== CLEANUP SUMMARY ==="
echo "✅ Suspicious processes terminated"
echo "✅ Suspicious files removed"
echo ""
echo "⚠️  NEXT STEPS REQUIRED:"
echo "1. Review crontab entries above (if any found)"
echo "2. Review systemd services above (if any found)"
echo "3. Change ALL passwords and API keys"
echo "4. Review SSH authorized_keys above"
echo "5. Update security groups to restrict access"
echo "6. Consider rebuilding instance from clean snapshot"
echo ""
echo "✅ Emergency cleanup complete"
echo ""
echo "📧 Please review SECURITY_INCIDENT_RESPONSE.md for full remediation steps"
