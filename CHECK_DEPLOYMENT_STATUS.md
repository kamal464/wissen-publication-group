# 🔍 Check Deployment Status

Run these commands in your browser terminal to see what's happening:

## Step 1: Check if processes are running

```bash
# Check if Node.js is installed
node --version

# Check if PM2 is running
pm2 status

# Check if services are installed
which nginx
which psql
```

## Step 2: Check if deployment is still running

```bash
# Check running processes
ps aux | grep -E "npm|node|apt|curl" | grep -v grep

# Check if git clone happened
ls -la /var/www/wissen-publication-group 2>/dev/null || echo "Repository not cloned yet"
```

## Step 3: Check installation progress

```bash
# Check if Node.js installed
dpkg -l | grep nodejs

# Check if PostgreSQL is running
sudo systemctl status postgresql --no-pager | head -5

# Check if Nginx is installed
dpkg -l | grep nginx
```

## Step 4: Check for errors

```bash
# Check system logs
sudo journalctl -n 50 --no-pager

# Check if there are any error messages
dmesg | tail -20
```

## Step 5: Manual status check

```bash
echo "=== Installation Status ==="
echo "Node.js: $(node --version 2>/dev/null || echo 'Not installed')"
echo "PM2: $(pm2 --version 2>/dev/null || echo 'Not installed')"
echo "PostgreSQL: $(sudo systemctl is-active postgresql 2>/dev/null || echo 'Not running')"
echo "Nginx: $(sudo systemctl is-active nginx 2>/dev/null || echo 'Not running')"
echo ""
echo "=== Repository Status ==="
[ -d /var/www/wissen-publication-group ] && echo "✅ Repository exists" || echo "❌ Repository not found"
echo ""
echo "=== Application Status ==="
pm2 list 2>/dev/null || echo "PM2 not running"
```

## If deployment seems stuck, try this:

The command might have failed silently. Run this to see what happened:

```bash
# Check the last command exit status
echo $?

# Check if we're in the right directory
pwd

# Try to continue manually
cd /var/www 2>/dev/null && ls -la
```

## Quick Fix: Run deployment in steps

If the one-liner didn't work, run it step by step:

```bash
# Step 1: Update system
sudo apt update -y

# Step 2: Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Step 3: Install other tools
sudo apt install -y nginx postgresql postgresql-contrib
sudo npm install -g pm2

# Step 4: Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Step 5: Setup database
DB_PASSWORD="Wissen2024!Secure"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASSWORD';"
sudo -u postgres createdb wissen_publication_group

# Step 6: Clone repository
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
sudo git clone https://github.com/kamal464/wissen-publication-group.git
sudo chown -R $USER:$USER wissen-publication-group
cd wissen-publication-group

# Step 7: Create environment files
INSTANCE_IP="54.165.116.208"
cat > backend/.env << EOF
DATABASE_URL=postgresql://postgres:$DB_PASSWORD@localhost:5432/wissen_publication_group
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://$INSTANCE_IP
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net
EOF

echo "NEXT_PUBLIC_API_URL=http://$INSTANCE_IP:3001/api" > frontend/.env.production

# Step 8: Build backend
cd backend
npm install
npx prisma generate
npx prisma db push --accept-data-loss
npm run build

# Step 9: Build frontend
cd ../frontend
npm install
npm run build

# Step 10: Start with PM2
cd /var/www/wissen-publication-group
pm2 start ecosystem.config.js
pm2 save

# Step 11: Configure Nginx
sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null << 'EOF'
server {
    listen 80;
    server_name 54.165.116.208;
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Deployment complete!"
```

