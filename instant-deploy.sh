#!/bin/bash
# Instant Deployment Script for Wissen Publication Group
# Run this on your EC2 instance to deploy everything automatically

set -e

INSTANCE_IP="54.165.116.208"
DB_PASSWORD="Wissen2024!Secure"

echo "🚀 Starting instant deployment..."
echo ""

# Step 1: Update system
echo "📦 Step 1: Updating system..."
sudo apt update -y
sudo apt upgrade -y

# Step 2: Install Node.js 20
echo "📦 Step 2: Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo "✅ Node.js $(node --version) installed"

# Step 3: Install PM2
echo "📦 Step 3: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi
echo "✅ PM2 installed"

# Step 4: Install PostgreSQL
echo "📦 Step 4: Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi
echo "✅ PostgreSQL installed"

# Step 5: Setup Database
echo "📦 Step 5: Setting up database..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo "Password already set"
sudo -u postgres createdb wissen_publication_group 2>/dev/null || echo "Database may already exist"
echo "✅ Database setup complete"

# Step 6: Install Nginx
echo "📦 Step 6: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi
echo "✅ Nginx installed"

# Step 7: Create app directory
echo "📦 Step 7: Setting up application directory..."
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www

# Step 8: Clone repository
echo "📦 Step 8: Cloning repository..."
if [ -d wissen-publication-group ]; then
    cd wissen-publication-group
    sudo git pull
else
    sudo git clone https://github.com/kamal464/wissen-publication-group.git
    cd wissen-publication-group
fi
sudo chown -R $USER:$USER .
echo "✅ Repository cloned"

# Step 9: Create backend .env
echo "📦 Step 9: Configuring backend..."
cat > backend/.env << EOF
DATABASE_URL=postgresql://postgres:$DB_PASSWORD@localhost:5432/wissen_publication_group
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://$INSTANCE_IP,https://$INSTANCE_IP
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAQVYSWBK4GMRMNMXK
AWS_SECRET_ACCESS_KEY=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
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net
EOF
echo "✅ Backend .env created"

# Step 10: Create frontend .env.production
echo "📦 Step 10: Configuring frontend..."
cat > frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=http://$INSTANCE_IP:3001/api
EOF
echo "✅ Frontend .env.production created"

# Step 11: Install backend dependencies
echo "📦 Step 11: Installing backend dependencies..."
cd backend
npm install
echo "✅ Backend dependencies installed"

# Step 12: Setup Prisma
echo "📦 Step 12: Setting up Prisma..."
npx prisma generate
npx prisma migrate deploy || npx prisma db push --accept-data-loss
echo "✅ Prisma setup complete"

# Step 13: Build backend
echo "📦 Step 13: Building backend..."
npm run build
echo "✅ Backend built"

# Step 14: Install frontend dependencies
echo "📦 Step 14: Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"

# Step 15: Build frontend
echo "📦 Step 15: Building frontend..."
npm run build
echo "✅ Frontend built"

# Step 16: Start with PM2
echo "📦 Step 16: Starting applications with PM2..."
cd /var/www/wissen-publication-group
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u $USER --hp /home/$USER || echo "Startup already configured"
echo "✅ Applications started with PM2"

# Step 17: Configure Nginx
echo "📦 Step 17: Configuring Nginx..."
sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name 54.165.116.208;

    client_max_body_size 50M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;

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

sudo ln -sf /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx configured"

# Step 18: Wait for services to start
echo "📦 Step 18: Waiting for services to start..."
sleep 10

# Step 19: Verify deployment
echo "📦 Step 19: Verifying deployment..."
echo ""
echo "=== PM2 Status ==="
pm2 status
echo ""
echo "=== Testing Backend ==="
curl -s http://localhost:3001/api/health || echo "Backend starting..."
echo ""
echo "=== Testing Frontend ==="
curl -s http://localhost:3000 | head -5 || echo "Frontend starting..."
echo ""

echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "🌐 Your Application URLs:"
echo "   Frontend: http://$INSTANCE_IP"
echo "   Backend API: http://$INSTANCE_IP/api"
echo "   Health Check: http://$INSTANCE_IP/api/health"
echo ""
echo "📝 Database Password: $DB_PASSWORD"
echo "   (Save this for future reference)"
echo ""
echo "⏳ Services may take 1-2 minutes to fully start"
echo "   If URLs don't work immediately, wait a bit and try again"
echo ""

