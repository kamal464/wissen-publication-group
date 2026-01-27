# ⏱️ Instance Rebuild Timeline & Steps

## Estimated Total Time: **2-4 hours** (depending on application complexity)

---

## Step-by-Step Timeline

### **STEP 1: Stop Instance & Create Snapshot** ⏱️ **5-10 minutes**

```bash
# 1. Stop the instance (1-2 minutes)
aws ec2 stop-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1

# Wait for instance to stop
aws ec2 wait instance-stopped --instance-ids i-016ab2b939f5f7a3b --region us-east-1

# 2. Get volume ID
aws ec2 describe-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1 \
  --query 'Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId' --output text

# 3. Create snapshot (2-5 minutes to initiate, runs in background)
VOLUME_ID=$(aws ec2 describe-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1 \
  --query 'Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId' --output text)

aws ec2 create-snapshot \
  --volume-id $VOLUME_ID \
  --description "Forensics snapshot - $(date +%Y%m%d_%H%M%S) - Before rebuild" \
  --region us-east-1 \
  --tag-specifications 'ResourceType=snapshot,Tags=[{Key=Purpose,Value=Forensics},{Key=Date,Value='$(date +%Y%m%d)'}]'
```

**Time Breakdown:**
- Stop instance: 1-2 minutes
- Get volume ID: 30 seconds
- Create snapshot: 2-5 minutes (initiation, completes in background)

---

### **STEP 2: Launch New Instance** ⏱️ **10-15 minutes**

```bash
# 1. Get your current instance details (for reference)
aws ec2 describe-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1 \
  --query 'Reservations[0].Instances[0].[InstanceType,SecurityGroups,KeyName,SubnetId]' --output table

# 2. Launch new instance with secure configuration
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name YOUR_KEY_NAME \
  --security-group-ids sg-XXXXXXXXX \
  --subnet-id subnet-XXXXXXXXX \
  --user-data file://user-data-secure.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=wissen-publication-secure},{Key=Environment,Value=Production}]' \
  --region us-east-1

# 3. Wait for instance to be running (5-10 minutes)
INSTANCE_ID=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=wissen-publication-secure" \
  --query 'Reservations[0].Instances[0].InstanceId' --output text)

aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region us-east-1

# 4. Get new instance IP
NEW_IP=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --region us-east-1 \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)

echo "New instance IP: $NEW_IP"
```

**Time Breakdown:**
- Launch instance: 1-2 minutes
- Wait for running: 5-10 minutes
- Get IP and verify: 1 minute

**Note:** Replace `ami-0c55b159cbfafe1f0` with latest Ubuntu 22.04 LTS AMI ID for us-east-1

---

### **STEP 3: Initial Server Setup & Hardening** ⏱️ **30-45 minutes**

```bash
# SSH into new instance
ssh -i your-key.pem ubuntu@$NEW_IP

# Run initial setup script (see SECURE_SETUP.sh below)
```

**Time Breakdown:**
- System updates: 10-15 minutes
- Install security tools: 5-10 minutes
- Configure firewall: 5 minutes
- Harden SSH: 5 minutes
- Install monitoring: 5-10 minutes

---

### **STEP 4: Deploy Application** ⏱️ **45-90 minutes**

```bash
# On new instance
cd /var/www
sudo git clone https://github.com/kamal464/wissen-publication-group.git
cd wissen-publication-group

# Backend setup
cd backend
npm install --no-audit --no-fund --loglevel=error  # 5-10 minutes
npx prisma generate  # 1-2 minutes
npx prisma migrate deploy  # 1-2 minutes
npm run build  # 3-5 minutes

# Frontend setup
cd ../frontend
npm install --no-audit --no-fund --loglevel=error  # 5-10 minutes
npm run build  # 10-20 minutes

# Configure environment variables
# (Manual step - copy from secure location, never from old instance)
```

**Time Breakdown:**
- Clone repository: 2-3 minutes
- Backend install & build: 10-20 minutes
- Frontend install & build: 15-30 minutes
- Environment configuration: 5-10 minutes
- Database migration: 2-5 minutes

---

### **STEP 5: Configure Services & Start** ⏱️ **15-20 minutes**

```bash
# Install PM2
sudo npm install -g pm2

# Start backend
cd /var/www/wissen-publication-group/backend
pm2 start dist/src/main.js --name wissen-backend --max-memory-restart 400M

# Start frontend
cd ../frontend
pm2 start npm --name wissen-frontend --max-memory-restart 400M -- start

# Save PM2 configuration
pm2 save
pm2 startup

# Configure Nginx
sudo cp nginx-config-secure.conf /etc/nginx/sites-available/wissen-publication-group
sudo ln -sf /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Verify services
pm2 list
curl http://localhost:3001/api/health
```

**Time Breakdown:**
- PM2 setup: 2-3 minutes
- Start services: 2-3 minutes
- Nginx configuration: 5-10 minutes
- Verification: 2-3 minutes

---

### **STEP 6: Final Security Hardening** ⏱️ **20-30 minutes**

```bash
# Configure Fail2Ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Set up CloudWatch monitoring (if needed)
# Configure security alerts

# Final verification
sudo ufw status
sudo fail2ban-client status
pm2 list
```

**Time Breakdown:**
- Fail2Ban configuration: 5 minutes
- Monitoring setup: 10-15 minutes
- Final checks: 5 minutes

---

## Quick Start Scripts

### **user-data-secure.sh** (Run on instance launch)

```bash
#!/bin/bash
# User data script for secure instance setup

# Update system
apt-get update -y
apt-get upgrade -y

# Install security tools
apt-get install -y ufw fail2ban unattended-upgrades

# Configure automatic security updates
echo 'Unattended-Upgrade::Automatic-Reboot "false";' >> /etc/apt/apt.conf.d/50unattended-upgrades

# Install Node.js (adjust version as needed)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt-get install -y nginx

# Basic firewall setup (will be refined later)
ufw --force enable
ufw default deny incoming
ufw default deny outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

# Create application directory
mkdir -p /var/www
chown ubuntu:ubuntu /var/www
```

### **SECURE_SETUP.sh** (Run after SSH access)

```bash
#!/bin/bash
# Complete security hardening script

set -e

echo "🔒 SECURITY HARDENING STARTING..."

# 1. Update all packages
echo "=== Updating packages ==="
sudo apt update && sudo apt upgrade -y

# 2. Install security tools
echo "=== Installing security tools ==="
sudo apt install -y ufw fail2ban unattended-upgrades apt-listchanges

# 3. Configure UFW Firewall
echo "=== Configuring firewall ==="
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default deny outgoing

# Allow SSH (critical - don't lock yourself out!)
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow outbound DNS
sudo ufw allow out 53/tcp
sudo ufw allow out 53/udp

# Allow outbound HTTP/HTTPS for package updates
sudo ufw allow out 80/tcp
sudo ufw allow out 443/tcp

# Allow outbound NTP
sudo ufw allow out 123/udp

sudo ufw --force enable
sudo ufw status verbose

# 4. Configure Fail2Ban
echo "=== Configuring Fail2Ban ==="
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create custom jail for SSH
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s
EOF

sudo systemctl restart fail2ban
sudo fail2ban-client status

# 5. Harden SSH
echo "=== Hardening SSH ==="
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config

# Add AllowUsers if not present
if ! grep -q "AllowUsers" /etc/ssh/sshd_config; then
    echo "AllowUsers ubuntu" | sudo tee -a /etc/ssh/sshd_config
fi

sudo systemctl restart sshd

# 6. Configure automatic security updates
echo "=== Configuring automatic updates ==="
sudo tee /etc/apt/apt.conf.d/50unattended-upgrades > /dev/null <<EOF
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
EOF

sudo systemctl enable unattended-upgrades
sudo systemctl start unattended-upgrades

# 7. Set up log monitoring
echo "=== Setting up log monitoring ==="
sudo mkdir -p /var/log/security-audit
sudo chmod 700 /var/log/security-audit

# 8. Summary
echo ""
echo "✅ Security hardening complete!"
echo ""
echo "Firewall status:"
sudo ufw status
echo ""
echo "Fail2Ban status:"
sudo fail2ban-client status
echo ""
echo "SSH configuration:"
sudo sshd -T | grep -E "permitrootlogin|passwordauthentication|pubkeyauthentication|allowusers"
```

---

## Total Time Summary

| Step | Time | Can Run in Parallel? |
|------|------|---------------------|
| 1. Stop & Snapshot | 5-10 min | No |
| 2. Launch New Instance | 10-15 min | No (wait for Step 1) |
| 3. Initial Setup | 30-45 min | No (need SSH access) |
| 4. Deploy Application | 45-90 min | No (sequential) |
| 5. Configure Services | 15-20 min | No |
| 6. Final Hardening | 20-30 min | Partial (can do while testing) |
| **TOTAL** | **2-4 hours** | |

---

## Critical Notes

1. **Don't copy files from old instance** - Start fresh from git repository
2. **Rotate all credentials** - Database, API keys, SSH keys, AWS keys
3. **Update security groups** - Only allow necessary ports from specific IPs
4. **Test thoroughly** - Verify all services work before switching DNS
5. **Keep old instance stopped** - Don't terminate until new one is verified working

---

## Quick Checklist

- [ ] Old instance stopped
- [ ] Snapshot created
- [ ] New instance launched
- [ ] Security hardening applied
- [ ] Application deployed
- [ ] Services running
- [ ] Nginx configured
- [ ] All credentials rotated
- [ ] Security groups updated
- [ ] Monitoring configured
- [ ] DNS switched (if applicable)
- [ ] Old instance terminated (after verification)

---

**⚠️ IMPORTANT:** Keep the old instance stopped (not terminated) until you've verified the new instance is working correctly for at least 24-48 hours.
