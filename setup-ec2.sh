#!/bin/bash

# Initial EC2 Setup Script for Wissen Publication Group
# Run this script once after launching a fresh EC2 instance

set -e

echo "🚀 Setting up EC2 instance for Wissen Publication Group..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}❌ Please run as root (use sudo)${NC}"
   exit 1
fi

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo -e "${RED}❌ Cannot detect OS${NC}"
    exit 1
fi

echo -e "${GREEN}📦 Detected OS: $OS${NC}"

# Update system
echo -e "${YELLOW}📥 Updating system packages...${NC}"
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt update && apt upgrade -y
    apt install -y curl wget git build-essential
elif [ "$OS" = "amzn" ] || [ "$OS" = "rhel" ] || [ "$OS" = "centos" ]; then
    yum update -y
    yum install -y curl wget git gcc-c++ make
else
    echo -e "${RED}❌ Unsupported OS${NC}"
    exit 1
fi

# Install Node.js 20
echo -e "${YELLOW}📦 Installing Node.js 20...${NC}"
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
elif [ "$OS" = "amzn" ] || [ "$OS" = "rhel" ] || [ "$OS" = "centos" ]; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
fi

# Verify Node.js
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"

# Install PM2
echo -e "${YELLOW}📦 Installing PM2...${NC}"
npm install -g pm2

# Install PostgreSQL
echo -e "${YELLOW}📦 Installing PostgreSQL...${NC}"
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
elif [ "$OS" = "amzn" ] || [ "$OS" = "rhel" ] || [ "$OS" = "centos" ]; then
    amazon-linux-extras install postgresql14 -y
    systemctl start postgresql
    systemctl enable postgresql
fi

# Install Nginx
echo -e "${YELLOW}📦 Installing Nginx...${NC}"
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt install -y nginx
elif [ "$OS" = "amzn" ] || [ "$OS" = "rhel" ] || [ "$OS" = "centos" ]; then
    yum install -y nginx
fi

systemctl start nginx
systemctl enable nginx

# Setup firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
fi

# Create app directory
echo -e "${YELLOW}📁 Creating application directory...${NC}"
mkdir -p /var/www
chown -R $SUDO_USER:$SUDO_USER /var/www

# Setup PM2 startup
echo -e "${YELLOW}⚙️  Configuring PM2 startup...${NC}"
sudo -u $SUDO_USER pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER

echo -e "${GREEN}✅ EC2 setup complete!${NC}"
echo -e "${GREEN}📝 Next steps:${NC}"
echo -e "   1. Clone your repository: cd /var/www && git clone https://github.com/kamal464/wissen-publication-group.git"
echo -e "   2. Setup environment variables in backend/.env and frontend/.env.production"
echo -e "   3. Run: cd /var/www/wissen-publication-group && ./deploy-ec2.sh"
echo -e "   4. Configure Nginx: sudo cp nginx-wissen.conf /etc/nginx/sites-available/wissen-publication-group"
echo -e "   5. Enable site: sudo ln -s /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/"
echo -e "   6. Test: sudo nginx -t && sudo systemctl reload nginx"

