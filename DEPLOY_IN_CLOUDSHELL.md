# 🚀 Deploy Directly in CloudShell

Since the script isn't on GitHub yet, run these commands directly in CloudShell:

## Step 1: Connect to Your EC2 Instance

In CloudShell, run:

```bash
# Get your instance IP
INSTANCE_IP=$(aws ec2 describe-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1 --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
echo "Instance IP: $INSTANCE_IP"

# SSH to instance (you'll need the key)
# If you have the key in CloudShell:
ssh -i /path/to/key.pem ubuntu@$INSTANCE_IP
```

## Step 2: Run Deployment Commands Directly

Once connected to the EC2 instance, run this complete deployment script:

```bash
#!/bin/bash
set -e

INSTANCE_IP="54.165.116.208"
DB_PASSWORD="Wissen2024!Secure"

echo "🚀 Starting deployment..."

# Update system
sudo apt update -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Setup Database
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
sudo -u postgres createdb wissen_publication_group 2>/dev/null || true

# Create app directory
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
CORS_ORIGIN=http://$INSTANCE_IP,https://$INSTANCE_IP
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net
EOF

# Create frontend .env.production
cat > frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=http://$INSTANCE_IP:3001/api
EOF

# Install and build backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy || npx prisma db push --accept-data-loss
npm run build

# Install and build frontend
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
    proxy_read_timeout 300s;

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

echo "✅ Deployment complete!"
echo "🌐 Visit: http://$INSTANCE_IP"
```

## Alternative: One-Liner (Copy and Paste Entire Block)

Copy this entire block and paste into CloudShell after SSH'ing to the instance:

```bash
INSTANCE_IP="54.165.116.208" && DB_PASSWORD="Wissen2024!Secure" && sudo apt update -y && curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs nginx postgresql postgresql-contrib && sudo npm install -g pm2 && sudo systemctl start postgresql && sudo systemctl enable postgresql && sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASSWORD';" 2>/dev/null && sudo -u postgres createdb wissen_publication_group 2>/dev/null && sudo mkdir -p /var/www && sudo chown -R $USER:$USER /var/www && cd /var/www && sudo git clone https://github.com/kamal464/wissen-publication-group.git || (cd wissen-publication-group && sudo git pull) && sudo chown -R $USER:$USER wissen-publication-group && cd wissen-publication-group && echo "DATABASE_URL=postgresql://postgres:$DB_PASSWORD@localhost:5432/wissen_publication_group
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://$INSTANCE_IP
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net" > backend/.env && echo "NEXT_PUBLIC_API_URL=http://$INSTANCE_IP:3001/api" > frontend/.env.production && cd backend && npm install && npx prisma generate && npx prisma db push --accept-data-loss && npm run build && cd ../frontend && npm install && npm run build && cd /var/www/wissen-publication-group && pm2 delete all 2>/dev/null; pm2 start ecosystem.config.js && pm2 save && sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null << 'EOF'
server {
    listen 80;
    server_name 54.165.116.208;
    location /api { proxy_pass http://localhost:3001; proxy_http_version 1.1; proxy_set_header Host $host; }
    location / { proxy_pass http://localhost:3000; proxy_http_version 1.1; proxy_set_header Host $host; }
}
EOF
sudo ln -sf /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/ && sudo rm -f /etc/nginx/sites-enabled/default && sudo nginx -t && sudo systemctl reload nginx && echo "✅ Done! Visit http://$INSTANCE_IP"
```

