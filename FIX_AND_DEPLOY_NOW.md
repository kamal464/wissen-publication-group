# 🚀 Fix and Deploy Now - Step by Step

Your deployment didn't complete. Let's fix it step by step.

## Run These Commands One by One:

### Step 1: Install Node.js and PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
node --version
pm2 --version
```

### Step 2: Install Other Required Packages

```bash
sudo apt update -y
sudo apt install -y nginx postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 3: Setup Database

```bash
DB_PASSWORD="Wissen2024!Secure"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASSWORD';"
sudo -u postgres createdb wissen_publication_group
```

### Step 4: Clone Repository

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
sudo git clone https://github.com/kamal464/wissen-publication-group.git
sudo chown -R $USER:$USER wissen-publication-group
cd wissen-publication-group
```

### Step 5: Create Environment Files

```bash
INSTANCE_IP="54.165.116.208"
DB_PASSWORD="Wissen2024!Secure"

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
```

### Step 6: Build Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push --accept-data-loss
npm run build
```

### Step 7: Build Frontend

```bash
cd ../frontend
npm install
npm run build
```

### Step 8: Start with PM2

```bash
cd /var/www/wissen-publication-group
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

### Step 9: Configure Nginx

```bash
sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null << 'EOF'
server {
    listen 80;
    server_name 54.165.116.208;
    client_max_body_size 50M;
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Step 10: Verify

```bash
pm2 status
curl http://localhost:3001/api/health
curl http://localhost:3000 | head -5
```

---

## Or Run the Complete Script:

If you want to run it all at once, use the deployment script we created earlier.

