#!/bin/bash
# Complete security hardening script for new instance
# Run this immediately after SSH access to new instance

set -e

echo "🔒 SECURITY HARDENING STARTING..."
echo ""

# 1. Update all packages
echo "=== STEP 1: Updating packages ==="
sudo apt update && sudo apt upgrade -y
echo "✅ Packages updated"
echo ""

# 2. Install security tools
echo "=== STEP 2: Installing security tools ==="
sudo apt install -y ufw fail2ban unattended-upgrades apt-listchanges
echo "✅ Security tools installed"
echo ""

# 3. Configure UFW Firewall
echo "=== STEP 3: Configuring firewall ==="
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
echo "✅ Firewall configured"
sudo ufw status verbose
echo ""

# 4. Configure Fail2Ban
echo "=== STEP 4: Configuring Fail2Ban ==="
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
echo "✅ Fail2Ban configured"
sudo fail2ban-client status
echo ""

# 5. Harden SSH
echo "=== STEP 5: Hardening SSH ==="
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config

# Add AllowUsers if not present
if ! grep -q "AllowUsers" /etc/ssh/sshd_config; then
    echo "AllowUsers ubuntu" | sudo tee -a /etc/ssh/sshd_config
fi

sudo systemctl restart sshd
echo "✅ SSH hardened"
echo ""

# 6. Configure automatic security updates
echo "=== STEP 6: Configuring automatic updates ==="
sudo tee /etc/apt/apt.conf.d/50unattended-upgrades > /dev/null <<EOF
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
EOF

sudo systemctl enable unattended-upgrades
sudo systemctl start unattended-upgrades
echo "✅ Automatic updates configured"
echo ""

# 7. Install Node.js and PM2
echo "=== STEP 7: Installing Node.js and PM2 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
echo "✅ Node.js and PM2 installed"
echo ""

# 8. Install Nginx
echo "=== STEP 8: Installing Nginx ==="
sudo apt install -y nginx
echo "✅ Nginx installed"
echo ""

# 9. Create application directory
echo "=== STEP 9: Creating application directory ==="
sudo mkdir -p /var/www
sudo chown ubuntu:ubuntu /var/www
echo "✅ Application directory created"
echo ""

# 10. Summary
echo "=== HARDENING SUMMARY ==="
echo "✅ All security measures applied"
echo ""
echo "Firewall status:"
sudo ufw status
echo ""
echo "Fail2Ban status:"
sudo fail2ban-client status
echo ""
echo "SSH configuration:"
sudo sshd -T | grep -E "permitrootlogin|passwordauthentication|pubkeyauthentication|allowusers"
echo ""
echo "✅ Security hardening complete!"
echo ""
echo "Next steps:"
echo "1. Clone your repository: cd /var/www && git clone <repo-url>"
echo "2. Deploy your application"
echo "3. Configure Nginx"
echo "4. Start services with PM2"
