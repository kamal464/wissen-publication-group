# ⚡ Run This Now - Direct Deployment

## 🌐 Open This URL in Your Browser:

**https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#Instances:instanceId=i-016ab2b939f5f7a3b**

## Steps:

1. **Click the "Connect" button** (top right of the instance details)
2. **Select "EC2 Instance Connect" tab**
3. **Click "Connect"** - Browser terminal opens
4. **Copy and paste this ENTIRE command block:**

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
server { listen 80; server_name 54.165.116.208; location /api { proxy_pass http://localhost:3001; proxy_http_version 1.1; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; } location / { proxy_pass http://localhost:3000; proxy_http_version 1.1; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; } }
EOF
sudo ln -sf /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/ && sudo rm -f /etc/nginx/sites-enabled/default && sudo nginx -t && sudo systemctl reload nginx && echo "✅ Deployment complete! Visit http://54.165.116.208"
```

5. **Press Enter** and wait 5-10 minutes
6. **Visit:** http://54.165.116.208

---

## ✅ That's It!

The browser terminal method is the **easiest** - no SSH keys, no CLI configuration needed.

Just open the URL above, click Connect, and paste the command!

