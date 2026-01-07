# 🚀 Run Deployment Script in Browser Terminal

## Option 1: Download and Run Script (Recommended)

In your browser terminal, run:

```bash
# Download the script
curl -o /tmp/deploy.sh https://raw.githubusercontent.com/kamal464/wissen-publication-group/main/deploy-with-logs.sh

# Make it executable
chmod +x /tmp/deploy.sh

# Run it
bash /tmp/deploy.sh
```

**Note:** This requires the script to be on GitHub. If it's not there yet, use Option 2.

---

## Option 2: Create Script Directly on Server

Copy and paste this entire block in your browser terminal:

```bash
cat > /tmp/deploy.sh << 'SCRIPTEOF'
#!/bin/bash
set -e
INSTANCE_IP="54.165.116.208"
DB_PASSWORD="Wissen2024!Secure"
echo "=========================================="
echo "🚀 Starting Wissen Publication Group Deployment"
echo "=========================================="
echo ""
echo "📦 Step 1/11: Updating system packages..."
sudo apt update -y
echo "✅ System updated"
echo ""
echo "📦 Step 2/11: Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
echo "✅ Node.js $(node --version) installed"
echo ""
echo "📦 Step 3/11: Installing Nginx, PostgreSQL, and PM2..."
sudo apt install -y nginx postgresql postgresql-contrib
sudo npm install -g pm2
echo "✅ All packages installed"
echo ""
echo "📦 Step 4/11: Starting PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql
echo "✅ PostgreSQL started"
echo ""
echo "📦 Step 5/11: Setting up database..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo "⚠️  Password may already be set"
sudo -u postgres createdb wissen_publication_group 2>/dev/null || echo "⚠️  Database may already exist"
echo "✅ Database setup complete"
echo ""
echo "📦 Step 6/11: Setting up application directory..."
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
echo "✅ Directory ready"
echo ""
echo "📦 Step 7/11: Cloning repository..."
if [ -d wissen-publication-group ]; then
    echo "⚠️  Repository exists, pulling latest changes..."
    cd wissen-publication-group
    sudo git pull || echo "⚠️  Git pull failed, continuing..."
else
    sudo git clone https://github.com/kamal464/wissen-publication-group.git
    cd wissen-publication-group
fi
sudo chown -R $USER:$USER wissen-publication-group
echo "✅ Repository ready"
echo ""
echo "📦 Step 8/11: Creating environment configuration files..."
cat > backend/.env << ENVEOF
DATABASE_URL=postgresql://postgres:$DB_PASSWORD@localhost:5432/wissen_publication_group
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://$INSTANCE_IP
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAQVYSWBK4GMRMNMXK
AWS_SECRET_ACCESS_KEY=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
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net
ENVEOF
echo "NEXT_PUBLIC_API_URL=http://$INSTANCE_IP:3001/api" > frontend/.env.production
echo "✅ Environment files created"
echo ""
echo "📦 Step 9/11: Building backend (this may take 3-5 minutes)..."
cd backend
echo "  → Installing dependencies..."
npm install
echo "  → Generating Prisma client..."
npx prisma generate
echo "  → Setting up database schema..."
npx prisma db push --accept-data-loss
echo "  → Building application..."
npm run build
echo "✅ Backend built successfully"
echo ""
echo "📦 Step 10/11: Building frontend (this may take 3-5 minutes)..."
cd ../frontend
echo "  → Installing dependencies..."
npm install
echo "  → Building Next.js application..."
npm run build
echo "✅ Frontend built successfully"
echo ""
echo "📦 Step 11/11: Starting services and configuring Nginx..."
cd /var/www/wissen-publication-group
echo "  → Starting PM2 processes..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
echo "  ✅ PM2 started"
echo "  → Configuring Nginx..."
sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name 54.165.116.208;
    client_max_body_size 50M;
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINXEOF
sudo ln -sf /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
echo "  ✅ Nginx configured"
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
echo "📊 Service Status:"
pm2 status
echo ""
echo "⏳ Services may take 1-2 minutes to fully start"
echo "   If URLs don't work immediately, wait a bit and try again"
echo ""
SCRIPTEOF

# Make executable and run
chmod +x /tmp/deploy.sh
bash /tmp/deploy.sh
```

This will:
1. Create the script file on the server
2. Make it executable
3. Run it with full progress logs

---

## What You'll See:

Clear progress at each step:
- ✅ System updated
- ✅ Node.js installed
- ✅ Packages installed
- ✅ Database ready
- ✅ Repository ready
- ✅ Backend built
- ✅ Frontend built
- ✅ Services started

**Total time: ~10-15 minutes**

---

## After Completion:

Visit: **http://54.165.116.208**

The script shows exactly which step is running, so you'll always know the progress!

