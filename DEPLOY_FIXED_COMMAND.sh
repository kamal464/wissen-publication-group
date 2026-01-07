#!/bin/bash
# Fixed deployment command - copy and paste this entire block

INSTANCE_IP="54.165.116.208"
DB_PASSWORD='Wissen2024!Secure'

echo "🚀 Starting deployment..."
echo ""

echo "Step 1: Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
echo "✅ Node.js installed"
echo ""

echo "Step 2: Installing PM2, Nginx, PostgreSQL..."
sudo apt install -y nginx postgresql postgresql-contrib
sudo npm install -g pm2
echo "✅ Packages installed"
echo ""

echo "Step 3: Starting PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASSWORD';" 2>/dev/null
sudo -u postgres createdb wissen_publication_group 2>/dev/null
echo "✅ Database ready"
echo ""

echo "Step 4: Cloning repository..."
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
sudo git clone https://github.com/kamal464/wissen-publication-group.git || (cd wissen-publication-group && sudo git pull)
sudo chown -R $USER:$USER wissen-publication-group
cd wissen-publication-group
echo "✅ Repository cloned"
echo ""

echo "Step 5: Creating environment files..."
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

echo "NEXT_PUBLIC_API_URL=http://$INSTANCE_IP/api" > frontend/.env.production
echo "✅ Environment files created"
echo ""

echo "Step 6: Building backend (3-5 min)..."
cd backend
npm install
npx prisma generate
npx prisma db push --accept-data-loss
npm run build
echo "✅ Backend built"
echo ""

echo "Step 7: Building frontend (3-5 min)..."
cd ../frontend
npm install
npm run build
echo "✅ Frontend built"
echo ""

echo "Step 8: Starting services..."
cd /var/www/wissen-publication-group
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
echo "✅ PM2 started"
echo ""

echo "Step 9: Configuring Nginx..."
sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name 54.165.116.208;

    # Allow large file uploads (PDFs, etc.)
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
sudo nginx -t
sudo systemctl restart nginx
echo "✅ Nginx configured"
echo ""

echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "🌐 Visit: http://$INSTANCE_IP"
echo ""
pm2 status

