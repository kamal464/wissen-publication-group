#!/bin/bash
# User data script for quick instance setup
# This runs automatically when instance launches

# Update system
apt-get update -y
apt-get upgrade -y

# Install basic tools
apt-get install -y curl git

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt-get install -y nginx

# Basic firewall (will be configured properly later)
ufw --force enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

# Create app directory
mkdir -p /var/www
chown ubuntu:ubuntu /var/www

# Log completion
echo "User data script completed at $(date)" >> /var/log/user-data.log
