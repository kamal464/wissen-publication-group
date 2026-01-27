# 🚨 SECURITY ALERT: Suspicious Files Detected

## ⚠️ CRITICAL: Server May Be Compromised

**Date:** 2026-01-27  
**Status:** URGENT ACTION REQUIRED

## Suspicious Files Found

The following untracked files were detected on the server:

```
frontend/public/ids.php          - PHP file in Next.js project (suspicious)
frontend/scanner_linux           - Binary scanner (suspicious)
frontend/xmrig-6.21.0/          - ⚠️ CRITICAL: Cryptocurrency miner
frontend/xmrig-auto.tar.gz       - ⚠️ CRITICAL: Miner installer
frontend/xmrig.tar.gz            - ⚠️ CRITICAL: Miner archive
backend/.env.backup.*            - Backup files (may contain sensitive data)
backend/.env.save                - Backup file (may contain sensitive data)
```

### What is XMRig?

**XMRig is a cryptocurrency mining tool** commonly used by malware to:
- Mine Monero (XMR) cryptocurrency using your server's CPU
- Consume 100% CPU resources
- Slow down your server significantly
- Generate revenue for attackers

**This is a strong indicator that your server has been compromised.**

## Immediate Actions Required

### Step 1: Remove Suspicious Files (URGENT)

**Run this immediately on your EC2 instance:**

```bash
cd /var/www/wissen-publication-group && \
echo "🚨 REMOVING SUSPICIOUS FILES..." && \
echo "" && \
echo "Removing cryptocurrency miner..." && \
rm -rf frontend/xmrig* frontend/scanner_linux frontend/public/ids.php 2>/dev/null && \
echo "Removing backup files (may contain sensitive data)..." && \
rm -f backend/.env.backup.* backend/.env.save 2>/dev/null && \
echo "" && \
echo "✅ Suspicious files removed" && \
echo "" && \
echo "Checking for other suspicious processes..." && \
ps aux | grep -i "xmrig\|miner\|crypto" | grep -v grep || echo "No mining processes found (good)"
```

### Step 2: Check for Running Mining Processes

```bash
# Check for mining processes
ps aux | grep -E "xmrig|miner|crypto|monero" | grep -v grep

# Check CPU usage
top -bn1 | head -20

# Check for suspicious network connections
netstat -tulpn | grep -E "xmrig|miner"

# Check cron jobs (attackers often add mining to cron)
crontab -l
sudo crontab -l -u root
```

### Step 3: Check System Integrity

```bash
# Check for unauthorized SSH keys
cat ~/.ssh/authorized_keys
sudo cat /root/.ssh/authorized_keys

# Check for suspicious systemd services
systemctl list-units --type=service --state=running | grep -v "systemd\|dbus\|network"

# Check for suspicious files in common locations
find /tmp /var/tmp -type f -name "*xmrig*" -o -name "*miner*" 2>/dev/null
find /home -type f -name "*xmrig*" -o -name "*miner*" 2>/dev/null
```

### Step 4: Secure the Server

```bash
# Change all passwords (if using password auth)
# Update SSH keys
# Review firewall rules
sudo ufw status

# Check for unauthorized users
cat /etc/passwd | grep -E "/bin/bash|/bin/sh"

# Review recent logins
last -20
sudo lastlog
```

## How This Likely Happened

Common attack vectors:
1. **Weak SSH credentials** - Brute force attack
2. **Exposed ports** - Unnecessary services exposed to internet
3. **Outdated software** - Unpatched vulnerabilities
4. **Compromised dependencies** - Malicious npm packages
5. **Insecure file uploads** - PHP file upload vulnerability

## Prevention Measures

### 1. Secure SSH Access

```bash
# Disable password authentication (use keys only)
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Change SSH port (optional)
# sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
```

### 2. Set Up Firewall

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 3. Install Fail2Ban

```bash
sudo apt update
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Regular Security Updates

```bash
# Set up automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 5. Monitor System

```bash
# Install monitoring tools
sudo apt install -y htop iotop

# Set up log monitoring
sudo apt install -y logwatch
```

## Clean Up Disk Space (Also Needed)

The server is also out of disk space. Run this after removing suspicious files:

```bash
cd /var/www/wissen-publication-group && \
echo "=== Cleaning Disk Space ===" && \
df -h / && \
echo "" && \
echo "Cleaning npm cache..." && \
npm cache clean --force 2>/dev/null || true && \
echo "Cleaning old logs..." && \
sudo journalctl --vacuum-time=3d 2>/dev/null || true && \
sudo find /var/log -type f -name "*.log" -mtime +7 -delete 2>/dev/null || true && \
echo "Cleaning PM2 logs..." && \
pm2 flush 2>/dev/null || true && \
echo "Cleaning node_modules..." && \
cd backend && rm -rf node_modules dist 2>/dev/null || true && \
cd ../frontend && rm -rf node_modules .next 2>/dev/null || true && \
cd .. && \
echo "" && \
echo "=== After Cleanup ===" && \
df -h / && \
echo "✅ Cleanup complete!"
```

## Next Steps

1. ✅ **IMMEDIATE:** Remove suspicious files (Step 1)
2. ✅ **IMMEDIATE:** Check for running miners (Step 2)
3. ✅ **URGENT:** Clean disk space
4. ✅ **URGENT:** Secure SSH access
5. ✅ **URGENT:** Set up firewall
6. ⚠️ **SOON:** Review all system logs
7. ⚠️ **SOON:** Consider rebuilding server from scratch (if heavily compromised)
8. ⚠️ **ONGOING:** Set up monitoring and alerts

## If Server is Heavily Compromised

If you find evidence of:
- Multiple backdoors
- Data exfiltration
- Persistent rootkits
- Multiple unauthorized users

**Consider:**
1. Taking a snapshot of the compromised instance (for forensics)
2. Creating a new EC2 instance
3. Restoring from a known-good backup
4. Migrating services to the new instance
5. Terminating the compromised instance

## Report to AWS

If you suspect a security breach:
1. Document all findings
2. Report to AWS Security: security@amazon.com
3. Review AWS CloudTrail logs for unauthorized API calls
4. Check AWS GuardDuty for threat detection alerts

---

**⚠️ This is a serious security incident. Take immediate action.**
