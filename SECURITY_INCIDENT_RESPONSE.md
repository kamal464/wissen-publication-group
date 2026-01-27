# 🚨 SECURITY INCIDENT RESPONSE - AWS Abuse Report

## Incident Summary

**Date:** $(date)  
**AWS Instance:** i-016ab2b939f5f7a3b  
**Region:** us-east-1  
**Issue:** EC2 instance implicated in unauthorized access attempts to remote hosts  
**Status:** CRITICAL - Immediate action required

## Evidence of Compromise

The following suspicious files were found on the server:
- `frontend/xmrig*` - Cryptocurrency mining software
- `frontend/scanner_linux` - Network scanning tool
- `frontend/public/ids.php` - Suspicious PHP file
- `backend/.env.backup.*` - Potentially exposed credentials

These files indicate the server has been compromised and is being used for:
1. Cryptocurrency mining (xmrig)
2. Network scanning/unauthorized access attempts (scanner_linux)
3. Potential credential theft (ids.php, .env backups)

## IMMEDIATE REMEDIATION STEPS

### Step 1: Isolate the Instance (CRITICAL)

**Option A: Stop the instance immediately (RECOMMENDED)**
```bash
# From AWS Console or CLI
aws ec2 stop-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1
```

**Option B: Restrict network access (if instance must stay running)**
```bash
# Revoke all outbound rules except necessary ones
# Update Security Group to only allow:
# - SSH from your IP only
# - HTTP/HTTPS inbound only
# - No outbound access except to AWS services you need
```

### Step 2: Connect and Investigate (If Instance Still Running)

```bash
# SSH into the instance
ssh ubuntu@<your-instance-ip>

# Immediately check for active malicious processes
ps aux | grep -E "xmrig|miner|scanner|curl.*http|wget.*http" | grep -v grep

# Check network connections
sudo netstat -tulpn | grep -E "ESTABLISHED|LISTEN"
sudo ss -tulpn | grep -E "ESTABLISHED|LISTEN"

# Check for suspicious cron jobs
crontab -l
sudo crontab -l
sudo ls -la /etc/cron.d/
sudo ls -la /etc/cron.hourly/
sudo ls -la /etc/cron.daily/

# Check for suspicious systemd services
systemctl list-units --type=service --state=running | grep -v "systemd\|dbus\|ssh\|nginx"
```

### Step 3: Remove Malicious Files and Processes

```bash
cd /var/www/wissen-publication-group && \
echo "🚨 EMERGENCY CLEANUP STARTING..." && \
echo "" && \
echo "=== STEP 1: Kill All Suspicious Processes ===" && \
sudo pkill -9 xmrig 2>/dev/null || true && \
sudo pkill -9 scanner 2>/dev/null || true && \
ps aux | grep -E "xmrig|miner|scanner" | grep -v grep | awk '{print $2}' | xargs sudo kill -9 2>/dev/null || true && \
echo "✅ Suspicious processes killed" && \
echo "" && \
echo "=== STEP 2: Remove Suspicious Files ===" && \
rm -rf frontend/xmrig* frontend/scanner_linux frontend/public/ids.php 2>/dev/null && \
rm -f backend/.env.backup.* backend/.env.save 2>/dev/null && \
echo "✅ Suspicious files removed" && \
echo "" && \
echo "=== STEP 3: Check for Persistence Mechanisms ===" && \
echo "Checking crontab..." && \
crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$" || echo "No user crontab" && \
sudo crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$" || echo "No root crontab" && \
echo "" && \
echo "Checking systemd services..." && \
systemctl list-units --type=service --all | grep -E "xmrig|miner|scanner" || echo "No suspicious services" && \
echo "" && \
echo "Checking /etc/rc.local..." && \
cat /etc/rc.local 2>/dev/null | grep -v "^#" | grep -v "^$" || echo "No rc.local" && \
echo "" && \
echo "=== STEP 4: Check Network Connections ===" && \
sudo netstat -tulpn | head -20 && \
echo "" && \
echo "✅ Emergency cleanup complete"
```

### Step 4: Secure the Environment

```bash
cd /var/www/wissen-publication-group && \
echo "=== SECURING ENVIRONMENT ===" && \
echo "" && \
echo "=== STEP 1: Change All Passwords ===" && \
echo "⚠️  MANUALLY CHANGE:" && \
echo "  - Database passwords" && \
echo "  - API keys" && \
echo "  - SSH keys (consider rotating)" && \
echo "  - AWS access keys" && \
echo "" && \
echo "=== STEP 2: Review SSH Access ===" && \
echo "Current SSH keys:" && \
cat ~/.ssh/authorized_keys && \
echo "" && \
echo "⚠️  Remove any unknown SSH keys" && \
echo "" && \
echo "=== STEP 3: Review User Accounts ===" && \
echo "All users:" && \
cat /etc/passwd | grep -v "nologin\|false" && \
echo "" && \
echo "Users with shell access:" && \
cat /etc/passwd | grep -E "/bin/(bash|sh)" && \
echo "" && \
echo "=== STEP 4: Check Sudo Access ===" && \
sudo cat /etc/sudoers | grep -v "^#" | grep -v "^$" && \
echo "" && \
echo "✅ Security review complete"
```

### Step 5: Review Logs for Attack Vector

```bash
echo "=== INVESTIGATING ATTACK VECTOR ===" && \
echo "" && \
echo "=== Recent SSH login attempts ===" && \
sudo tail -100 /var/log/auth.log | grep -E "Failed|Accepted" && \
echo "" && \
echo "=== Recent sudo commands ===" && \
sudo tail -100 /var/log/auth.log | grep sudo && \
echo "" && \
echo "=== Web server access logs (last 50 suspicious requests) ===" && \
sudo tail -1000 /var/log/nginx/access.log | grep -E "\.php|\.sh|\.py|POST.*upload|cmd=|exec=" | tail -50 && \
echo "" && \
echo "=== System logs (recent errors) ===" && \
sudo journalctl -n 100 --no-pager | grep -i "error\|fail\|unauthorized" && \
echo "" && \
echo "✅ Investigation complete"
```

## LONG-TERM REMEDIATION

### Option 1: Rebuild the Instance (RECOMMENDED)

**If the instance is heavily compromised, the safest approach is to rebuild:**

1. **Snapshot current state (for forensics)**
   ```bash
   # Create snapshot before termination
   aws ec2 create-snapshot --volume-id <volume-id> --description "Forensics snapshot before rebuild"
   ```

2. **Launch new instance with:**
   - Fresh Ubuntu installation
   - Updated security groups (restrictive)
   - Only necessary ports open
   - SSH key-based authentication only
   - No password authentication

3. **Deploy application from clean codebase:**
   ```bash
   # On new instance
   git clone https://github.com/kamal464/wissen-publication-group.git
   cd wissen-publication-group
   # Follow secure deployment procedures
   ```

### Option 2: Hardening Current Instance (If Rebuild Not Possible)

1. **Update all packages:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install fail2ban ufw -y
   ```

2. **Configure Firewall:**
   ```bash
   sudo ufw default deny incoming
   sudo ufw default deny outgoing
   sudo ufw allow ssh
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   # Allow outbound only to specific services you need
   sudo ufw enable
   ```

3. **Install and Configure Fail2Ban:**
   ```bash
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

4. **Harden SSH:**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Set:
   # PermitRootLogin no
   # PasswordAuthentication no
   # PubkeyAuthentication yes
   # AllowUsers ubuntu
   sudo systemctl restart sshd
   ```

5. **Set up monitoring:**
   ```bash
   # Install CloudWatch agent or similar monitoring
   # Set up alerts for suspicious activity
   ```

## RESPONSE TO AWS

**Draft Response Email:**

```
Subject: Re: AWS Abuse Report - Instance i-016ab2b939f5f7a3b

Dear AWS Security Team,

Thank you for notifying us of the security incident involving our EC2 instance 
(i-016ab2b939f5f7a3b).

We have taken immediate corrective action:

1. IMMEDIATE ACTIONS TAKEN:
   - Stopped the compromised instance to prevent further abuse
   - Identified and removed malicious files:
     * xmrig cryptocurrency mining software
     * scanner_linux network scanning tool
     * ids.php suspicious PHP file
   - Terminated all malicious processes
   - Reviewed and secured SSH access
   - Changed all credentials (database, API keys, etc.)

2. ROOT CAUSE ANALYSIS:
   - Investigation revealed the instance was compromised through [INSERT METHOD]
   - Malicious actors installed cryptocurrency mining and network scanning tools
   - The instance was being used for unauthorized access attempts

3. PREVENTIVE MEASURES IMPLEMENTED:
   - Rebuilt instance from clean snapshot
   - Implemented restrictive security groups
   - Enabled firewall (UFW) with minimal required rules
   - Installed and configured Fail2Ban
   - Hardened SSH configuration (key-based auth only, no passwords)
   - Set up CloudWatch monitoring and alerts
   - Regular security audits scheduled

4. ONGOING MONITORING:
   - We have implemented continuous monitoring to detect future incidents
   - Security alerts configured for suspicious activity

We apologize for any inconvenience caused and assure you that we have taken 
comprehensive steps to prevent recurrence.

Please let us know if you need any additional information.

Best regards,
[Your Name]
[Your Contact Information]
```

## PREVENTION CHECKLIST

- [ ] All suspicious files removed
- [ ] All malicious processes terminated
- [ ] All credentials rotated
- [ ] SSH keys reviewed and unknown keys removed
- [ ] Security groups updated (restrictive)
- [ ] Firewall configured
- [ ] Fail2Ban installed and configured
- [ ] SSH hardened (no password auth)
- [ ] All packages updated
- [ ] Monitoring set up
- [ ] Response sent to AWS
- [ ] Application redeployed from clean codebase
- [ ] Regular security audits scheduled

## ADDITIONAL RESOURCES

- AWS Security Best Practices: https://docs.aws.amazon.com/security/
- EC2 Security Groups: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-network-security.html
- Linux Security Hardening: https://ubuntu.com/security/guides

---

**⚠️ CRITICAL: Take action immediately. The longer the instance remains compromised, the greater the risk.**
