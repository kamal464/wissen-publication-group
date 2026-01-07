# 🚀 Deploy via Browser Terminal (EC2 Instance Connect)

Since SSM is not available, use **EC2 Instance Connect** (browser-based terminal, no SSH key needed).

## Step 1: Open EC2 Instance Connect in Browser

1. **Go to EC2 Console:**
   - https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#Instances:instanceId=i-016ab2b939f5f7a3b

2. **Select the instance** → Click **"Connect"** button (top right)

3. **Choose "EC2 Instance Connect"** tab

4. **Click "Connect"** - This opens a browser-based terminal

## Step 2: Run Deployment in Browser Terminal

Once the browser terminal opens, **copy and paste this entire block**:

```bash
#!/bin/bash
INSTANCE_IP="54.165.116.208"
DB_PASSWORD="Wissen2024!Secure"

echo "🚀 Starting deployment..."

# Update and install
sudo apt update -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx postgresql postgresql-contrib
sudo npm install -g pm2

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Setup database
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
sudo -u postgres createdb wissen_publication_group 2>/dev/null || true

# Setup app directory
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www

# Clone repository
sudo git clone https://github.com/kamal464/wissen-publication-group.git || (cd wissen-publication-group && sudo git pull)
sudo chown -R $USER:$USER wissen-publication-group
cd wissen-publication-group

# Create backend .env
cat > backend/.env << EOF
DATABASE_URL=postgresql://postgres:$DB_PASSWORD@localhost:5432/wissen_publication_group
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://$INSTANCE_IP
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAQVYSWBK4GMRMNMXK
AWS_SECRET_ACCESS_KEY=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
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net
EOF

# Create frontend .env.production
echo "NEXT_PUBLIC_API_URL=http://$INSTANCE_IP:3001/api" > frontend/.env.production

# Build backend
cd backend
npm install
npx prisma generate
npx prisma db push --accept-data-loss
npm run build

# Build frontend
cd ../frontend
npm install
npm run build

# Start with PM2
cd /var/www/wissen-publication-group
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Configure Nginx
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
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "✅ Deployment complete!"
echo "🌐 Visit: http://$INSTANCE_IP"
echo "⏳ Wait 1-2 minutes for services to fully start"
```

## Step 3: Wait and Test

1. **Wait 5-10 minutes** for the deployment to complete
2. **Visit:** http://54.165.116.208
3. **Check health:** http://54.165.116.208/api/health

---

## Alternative: One-Line Command (Faster)

If the above doesn't work, try this single command in the browser terminal:

```bash
INSTANCE_IP="54.165.116.208" && DB_PASSWORD="Wissen2024!Secure" && sudo apt update -y && curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs nginx postgresql postgresql-contrib && sudo npm install -g pm2 && sudo systemctl start postgresql && sudo systemctl enable postgresql && sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASSWORD';" 2>/dev/null && sudo -u postgres createdb wissen_publication_group 2>/dev/null && sudo mkdir -p /var/www && sudo chown -R $USER:$USER /var/www && cd /var/www && sudo git clone https://github.com/kamal464/wissen-publication-group.git || (cd wissen-publication-group && sudo git pull) && sudo chown -R $USER:$USER wissen-publication-group && cd wissen-publication-group && echo "DATABASE_URL=postgresql://postgres:$DB_PASSWORD@localhost:5432/wissen_publication_group
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://$INSTANCE_IP
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAQVYSWBK4GMRMNMXK
AWS_SECRET_ACCESS_KEY=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
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net" > backend/.env && echo "NEXT_PUBLIC_API_URL=http://$INSTANCE_IP:3001/api" > frontend/.env.production && cd backend && npm install && npx prisma generate && npx prisma db push --accept-data-loss && npm run build && cd ../frontend && npm install && npm run build && cd /var/www/wissen-publication-group && pm2 delete all 2>/dev/null; pm2 start ecosystem.config.js && pm2 save && sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null << 'EOF'
server { listen 80; server_name 54.165.116.208; location /api { proxy_pass http://localhost:3001; proxy_http_version 1.1; proxy_set_header Host $host; } location / { proxy_pass http://localhost:3000; proxy_http_version 1.1; proxy_set_header Host $host; } }
EOF
sudo ln -sf /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/ && sudo rm -f /etc/nginx/sites-enabled/default && sudo nginx -t && sudo systemctl reload nginx && echo "✅ Done! Visit http://$INSTANCE_IP"
```

---

## Quick Steps Summary

1. **Open:** https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#Instances:instanceId=i-016ab2b939f5f7a3b
2. **Click:** "Connect" → "EC2 Instance Connect" → "Connect"
3. **Paste:** The deployment script above
4. **Wait:** 5-10 minutes
5. **Visit:** http://54.165.116.208

---

**This is the easiest method - no SSH key needed!**

