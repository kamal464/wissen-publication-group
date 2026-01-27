# 🚀 Quick New Instance Setup & Deployment

## Total Time: **1.5-2 hours**

---

## STEP 1: Launch New Instance (10-15 min)

### Via AWS Console:

1. **EC2 → Launch Instance**
2. **Name:** `wissen-publication-secure`
3. **AMI:** Ubuntu Server 22.04 LTS (latest)
4. **Instance type:** t3.medium (or same as old)
5. **Key pair:** Select your existing key
6. **Network settings:**
   - Create new security group or select existing
   - **Inbound rules:**
     - SSH (22) - Your IP only
     - HTTP (80) - 0.0.0.0/0
     - HTTPS (443) - 0.0.0.0/0
   - **Outbound rules:** Allow all (or restrict as needed)
7. **Configure storage:** 20 GB (or same as old)
8. **Advanced details → User data:** Paste the contents of `user-data-quick.sh` (see below)
9. **Launch instance**

### Via CLI:

```bash
# Get latest Ubuntu 22.04 AMI
AMI_ID=$(aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
  --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
  --output text --region us-east-1)

# Launch (replace YOUR_KEY_NAME, sg-XXX, subnet-XXX)
aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type t3.medium \
  --key-name YOUR_KEY_NAME \
  --security-group-ids sg-XXXXXXXXX \
  --subnet-id subnet-XXXXXXXXX \
  --user-data file://user-data-quick.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=wissen-secure}]' \
  --region us-east-1

# Wait and get IP
sleep 60
NEW_IP=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=wissen-secure" "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text --region us-east-1)

echo "New instance IP: $NEW_IP"
```

---

## STEP 2: Complete Setup & Deploy (1-1.5 hours)

**SSH into new instance and run:**

```bash
ssh -i your-key.pem ubuntu@<NEW_IP>
```

**Then run the complete deployment script:**

```bash
# Copy and paste the entire QUICK_DEPLOY.sh script (see below)
```

Or run step by step:

### 2.1 Security & Base Setup (5 min)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essentials
sudo apt install -y ufw fail2ban nginx curl git

# Basic firewall
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default deny outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow out 53/tcp
sudo ufw allow out 53/udp
sudo ufw allow out 80/tcp
sudo ufw allow out 443/tcp
sudo ufw allow out 123/udp

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www
sudo chown ubuntu:ubuntu /var/www
```

### 2.2 Deploy Application (45-60 min)

```bash
cd /var/www

# Clone repository
git clone https://github.com/kamal464/wissen-publication-group.git
cd wissen-publication-group

# Backend setup
cd backend
npm install --no-audit --no-fund --loglevel=error

# Create .env file (IMPORTANT: Use fresh credentials!)
nano .env
# Add your environment variables (database, API keys, etc.)
# DO NOT copy from old instance - create fresh!

# Prisma setup
npx prisma generate
npx prisma migrate deploy

# Build backend
npm run build

# Frontend setup
cd ../frontend
npm install --no-audit --no-fund --loglevel=error

# Create .env.local if needed
nano .env.local
# Add frontend environment variables

# Build frontend
npm run build
```

### 2.3 Start Services (5 min)

```bash
cd /var/www/wissen-publication-group

# Start backend
cd backend
pm2 start dist/src/main.js --name wissen-backend --max-memory-restart 400M --update-env

# Start frontend
cd ../frontend
pm2 start npm --name wissen-frontend --max-memory-restart 400M --update-env -- start

# Save PM2 config
pm2 save
pm2 startup
```

### 2.4 Configure Nginx (10 min)

```bash
# Create nginx config
sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null <<'NGINXEOF'
server {
    listen 80;
    server_name _;

    # Increase timeouts
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    client_max_body_size 50M;

    # Health check endpoint
    location = /health {
        proxy_pass http://localhost:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        access_log off;
    }

    # API endpoints
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static images - CRITICAL: Must be before /_next/static
    location ~* ^/images/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Disable compression for images (prevents ERR_CONTENT_LENGTH_MISMATCH)
        gzip off;
        proxy_set_header Accept-Encoding "";
        
        # Disable buffering to prevent Content-Length mismatch
        proxy_buffering off;
        proxy_request_buffering off;
        
        # Cache headers
        proxy_cache_valid 200 1d;
        add_header Cache-Control "public, max-age=86400";
        
        # Timeouts
        proxy_read_timeout 60s;
        proxy_connect_timeout 10s;
    }

    # Next.js static files
    location ~ ^/_next/static {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable, max-age=31536000";
        access_log off;
    }

    # Next.js image optimization
    location ~ ^/_next/image {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Disable compression for optimized images too
        gzip off;
        proxy_set_header Accept-Encoding "";
        proxy_buffering off;
    }

    # Frontend (catch-all - must be last)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 2.5 Verify (5 min)

```bash
# Check services
pm2 list

# Test endpoints
curl http://localhost:3001/api/health
curl http://localhost:3000

# Check nginx
sudo systemctl status nginx

# Check firewall
sudo ufw status
```

---

## All-in-One Script

Save this as `QUICK_DEPLOY.sh` and run it:

```bash
#!/bin/bash
set -e

echo "🚀 QUICK DEPLOYMENT STARTING..."
echo ""

# Update system
echo "=== Updating system ==="
sudo apt update && sudo apt upgrade -y

# Install essentials
echo "=== Installing essentials ==="
sudo apt install -y ufw fail2ban nginx curl git

# Firewall
echo "=== Configuring firewall ==="
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default deny outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow out 53/tcp
sudo ufw allow out 53/udp
sudo ufw allow out 80/tcp
sudo ufw allow out 443/tcp
sudo ufw allow out 123/udp

# Node.js
echo "=== Installing Node.js ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
echo "=== Installing PM2 ==="
sudo npm install -g pm2

# App directory
echo "=== Creating app directory ==="
sudo mkdir -p /var/www
sudo chown ubuntu:ubuntu /var/www

# Clone and deploy
echo "=== Deploying application ==="
cd /var/www
git clone https://github.com/kamal464/wissen-publication-group.git
cd wissen-publication-group

# Backend
echo "=== Setting up backend ==="
cd backend
npm install --no-audit --no-fund --loglevel=error

echo "⚠️  IMPORTANT: Create .env file now with:"
echo "   nano .env"
echo "   (Add database URL, API keys, etc.)"
read -p "Press Enter after creating .env file..."

npx prisma generate
npx prisma migrate deploy
npm run build

# Frontend
echo "=== Setting up frontend ==="
cd ../frontend
npm install --no-audit --no-fund --loglevel=error

echo "⚠️  Create .env.local if needed:"
echo "   nano .env.local"
read -p "Press Enter to continue (or create .env.local first)..."

npm run build

# Start services
echo "=== Starting services ==="
cd ../backend
pm2 start dist/src/main.js --name wissen-backend --max-memory-restart 400M --update-env

cd ../frontend
pm2 start npm --name wissen-frontend --max-memory-restart 400M --update-env -- start

pm2 save
pm2 startup

# Nginx config (paste the nginx config from step 2.4 above)
echo "=== Configuring Nginx ==="
# (Use the nginx config from step 2.4)

# Verify
echo "=== Verifying deployment ==="
pm2 list
curl -s http://localhost:3001/api/health && echo ""
curl -s http://localhost:3000 | head -20

echo ""
echo "✅ Deployment complete!"
```

---

## Quick Checklist

- [ ] New instance launched
- [ ] SSH access working
- [ ] System updated
- [ ] Node.js and PM2 installed
- [ ] Repository cloned
- [ ] Backend .env created (fresh credentials!)
- [ ] Backend built and running
- [ ] Frontend .env.local created (if needed)
- [ ] Frontend built and running
- [ ] Nginx configured
- [ ] Services verified
- [ ] Firewall configured
- [ ] Old instance stopped

---

**Time Estimate:**
- Instance launch: 10-15 min
- Setup & deploy: 1-1.5 hours
- **Total: 1.5-2 hours**

---

**⚠️ CRITICAL:** Use fresh credentials for .env files. Do NOT copy from the compromised instance!
