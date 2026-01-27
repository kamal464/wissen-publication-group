# 🚀 Deploy with Clear Progress Logs

Use this version of the deployment command that shows clear progress at each step.

## Copy and Paste This in Browser Terminal:

```bash
INSTANCE_IP="54.165.116.208" && DB_PASSWORD="Wissen2024!Secure" && echo "==========================================" && echo "🚀 Starting Deployment" && echo "==========================================" && echo "" && echo "📦 Step 1/11: Updating system..." && sudo apt update -y && echo "✅ System updated" && echo "" && echo "📦 Step 2/11: Installing Node.js 20..." && curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs && echo "✅ Node.js $(node --version) installed" && echo "" && echo "📦 Step 3/11: Installing Nginx, PostgreSQL, PM2..." && sudo apt install -y nginx postgresql postgresql-contrib && sudo npm install -g pm2 && echo "✅ Packages installed" && echo "" && echo "📦 Step 4/11: Starting PostgreSQL..." && sudo systemctl start postgresql && sudo systemctl enable postgresql && echo "✅ PostgreSQL started" && echo "" && echo "📦 Step 5/11: Setting up database..." && sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASSWORD';" 2>/dev/null && sudo -u postgres createdb wissen_publication_group 2>/dev/null && echo "✅ Database ready" && echo "" && echo "📦 Step 6/11: Setting up directories..." && sudo mkdir -p /var/www && sudo chown -R $USER:$USER /var/www && cd /var/www && echo "✅ Directories ready" && echo "" && echo "📦 Step 7/11: Cloning repository..." && (sudo git clone https://github.com/kamal464/wissen-publication-group.git || (cd wissen-publication-group && sudo git pull)) && sudo chown -R $USER:$USER wissen-publication-group && cd wissen-publication-group && echo "✅ Repository ready" && echo "" && echo "📦 Step 8/11: Creating environment files..." && echo "DATABASE_URL=postgresql://postgres:$DB_PASSWORD@localhost:5432/wissen_publication_group
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://$INSTANCE_IP
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net" > backend/.env && echo "NEXT_PUBLIC_API_URL=http://$INSTANCE_IP:3001/api" > frontend/.env.production && echo "✅ Environment files created" && echo "" && echo "📦 Step 9/11: Building backend (3-5 min)..." && cd backend && npm install && echo "  → Dependencies installed" && npx prisma generate && echo "  → Prisma generated" && npx prisma db push --accept-data-loss && echo "  → Database schema synced" && npm run build && echo "✅ Backend built" && echo "" && echo "📦 Step 10/11: Building frontend (3-5 min)..." && cd ../frontend && npm install && echo "  → Dependencies installed" && npm run build && echo "✅ Frontend built" && echo "" && echo "📦 Step 11/11: Starting services..." && cd /var/www/wissen-publication-group && pm2 delete all 2>/dev/null; pm2 start ecosystem.config.js && pm2 save && echo "  → PM2 started" && sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null << 'EOF'
server { listen 80; server_name 54.165.116.208; location /api { proxy_pass http://localhost:3001; proxy_http_version 1.1; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; } location / { proxy_pass http://localhost:3000; proxy_http_version 1.1; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; } }
EOF
sudo ln -sf /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/ && sudo rm -f /etc/nginx/sites-enabled/default && sudo nginx -t && sudo systemctl reload nginx && echo "  → Nginx configured" && echo "" && echo "==========================================" && echo "✅ Deployment Complete!" && echo "==========================================" && echo "" && echo "🌐 Visit: http://$INSTANCE_IP" && echo "" && pm2 status
```

## What You'll See:

You'll see clear progress like:
```
==========================================
🚀 Starting Deployment
==========================================

📦 Step 1/11: Updating system...
✅ System updated

📦 Step 2/11: Installing Node.js 20...
✅ Node.js v20.x.x installed

📦 Step 3/11: Installing Nginx, PostgreSQL, PM2...
✅ Packages installed

... and so on for each step
```

## Expected Timeline:

- **Steps 1-5:** ~2-3 minutes
- **Step 6-8:** ~1 minute
- **Step 9 (Backend):** ~3-5 minutes (this is the longest)
- **Step 10 (Frontend):** ~3-5 minutes (also long)
- **Step 11:** ~1 minute

**Total: ~10-15 minutes**

## If You See Errors:

The logs will show exactly which step failed, making it easy to troubleshoot!

---

**Use this version - it shows clear progress at every step!**

