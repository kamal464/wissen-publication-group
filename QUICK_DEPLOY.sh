#!/bin/bash
# 🚀 Quick Deployment Script for New Instance
# Run this on a fresh Ubuntu 22.04 instance

set -e

echo "🚀 QUICK DEPLOYMENT STARTING..."
echo ""

# Update system
echo "=== STEP 1: Updating system ==="
sudo apt update && sudo apt upgrade -y
echo "✅ System updated"
echo ""

# Install essentials
echo "=== STEP 2: Installing essentials ==="
sudo apt install -y ufw fail2ban nginx curl git build-essential
echo "✅ Essentials installed"
echo ""

# Firewall
echo "=== STEP 3: Configuring firewall ==="
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
echo "✅ Firewall configured"
echo ""

# Node.js
echo "=== STEP 4: Installing Node.js ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
echo "✅ Node.js $(node --version) installed"
echo ""

# PM2
echo "=== STEP 5: Installing PM2 ==="
sudo npm install -g pm2
echo "✅ PM2 installed"
echo ""

# App directory
echo "=== STEP 6: Creating app directory ==="
sudo mkdir -p /var/www
sudo chown ubuntu:ubuntu /var/www
echo "✅ App directory created"
echo ""

# Clone repository
echo "=== STEP 7: Cloning repository ==="
cd /var/www
if [ -d "wissen-publication-group" ]; then
    echo "⚠️  Repository exists, pulling latest..."
    cd wissen-publication-group
    git pull || echo "⚠️  Git pull failed, continuing..."
else
    git clone https://github.com/kamal464/wissen-publication-group.git
    cd wissen-publication-group
fi
echo "✅ Repository ready"
echo ""

# Backend setup
echo "=== STEP 8: Setting up backend ==="
cd backend

if [ ! -f ".env" ]; then
    echo "⚠️  WARNING: .env file not found!"
    echo "   Creating template. You MUST edit it with your credentials!"
    cat > .env <<'ENVEOF'
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT
JWT_SECRET="your-secret-key-here"

# Server
PORT=3001
NODE_ENV=production

# File uploads
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=52428800

# CORS
CORS_ORIGIN="http://localhost:3000"
ENVEOF
    echo ""
    echo "⚠️  CRITICAL: Edit .env file now with your actual credentials!"
    echo "   Run: nano .env"
    echo ""
    read -p "Press Enter after editing .env file..."
fi

echo "Installing backend dependencies..."
npm install --no-audit --no-fund --loglevel=error

echo "Generating Prisma client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy

echo "Building backend..."
npm run build

echo "✅ Backend ready"
echo ""

# Frontend setup
echo "=== STEP 9: Setting up frontend ==="
cd ../frontend

echo "Installing frontend dependencies..."
npm install --no-audit --no-fund --loglevel=error

echo "Building frontend..."
npm run build

echo "✅ Frontend ready"
echo ""

# Start services
echo "=== STEP 10: Starting services ==="
cd /var/www/wissen-publication-group

# Stop existing PM2 processes if any
pm2 delete all 2>/dev/null || true
sleep 2

# Start backend
cd backend
pm2 start dist/src/main.js --name wissen-backend --max-memory-restart 400M --update-env

# Start frontend
cd ../frontend
pm2 start npm --name wissen-frontend --max-memory-restart 400M --update-env -- start

# Save PM2 config
pm2 save

# Setup PM2 startup
pm2 startup | tail -1 | sudo bash || true

echo "✅ Services started"
echo ""

# Nginx configuration
echo "=== STEP 11: Configuring Nginx ==="
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

echo "✅ Nginx configured"
echo ""

# Verify
echo "=== STEP 12: Verifying deployment ==="
sleep 3

echo "PM2 Status:"
pm2 list
echo ""

echo "Backend Health:"
curl -s http://localhost:3001/api/health && echo "" || echo "⚠️  Backend not responding"
echo ""

echo "Frontend:"
curl -s http://localhost:3000 | head -5 || echo "⚠️  Frontend not responding"
echo ""

echo "Nginx Status:"
sudo systemctl status nginx --no-pager | head -5
echo ""

echo "Firewall Status:"
sudo ufw status | head -5
echo ""

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Verify services: pm2 list"
echo "2. Check logs: pm2 logs"
echo "3. Test website: curl http://$(curl -s ifconfig.me)"
echo "4. Update DNS if needed"
echo "5. Stop old compromised instance"
