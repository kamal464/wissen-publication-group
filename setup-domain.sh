#!/bin/bash
# Setup domain mapping for GoDaddy domain to EC2
# Usage: ./setup-domain.sh yourdomain.com

if [ -z "$1" ]; then
    echo "Usage: ./setup-domain.sh yourdomain.com"
    exit 1
fi

DOMAIN="$1"
IP="54.165.116.208"

echo "🌐 Setting up domain: $DOMAIN"
echo "📍 IP Address: $IP"
echo ""

# Step 1: Update Nginx
echo "1. Updating Nginx configuration..."
sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN $IP;

    client_max_body_size 50M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXEOF

sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo "✅ Nginx updated and reloaded"
else
    echo "❌ Nginx configuration error"
    exit 1
fi

echo ""

# Step 2: Update Frontend
echo "2. Updating frontend environment..."
cd /var/www/wissen-publication-group
echo "NEXT_PUBLIC_API_URL=http://$DOMAIN/api" > frontend/.env.production
echo "✅ Frontend .env.production updated"

echo "3. Rebuilding frontend..."
cd frontend
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend rebuilt"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo "4. Restarting frontend..."
cd /var/www/wissen-publication-group
pm2 restart wissen-frontend
echo "✅ Frontend restarted"

echo ""

# Step 3: Update Backend CORS
echo "5. Updating backend CORS..."
cd backend
if [ -f .env ]; then
    sed -i "s|^CORS_ORIGIN=.*|CORS_ORIGIN=http://$DOMAIN,http://www.$DOMAIN,http://$IP,http://localhost:3000,http://localhost:3002|" .env
    echo "✅ Backend CORS updated"
else
    echo "⚠️  backend/.env not found, skipping CORS update"
fi

echo "6. Restarting backend..."
cd /var/www/wissen-publication-group
pm2 restart wissen-backend
echo "✅ Backend restarted"

echo ""
echo "=========================================="
echo "✅ Domain Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Go to GoDaddy DNS settings:"
echo "   - Add A record: @ → $IP"
echo "   - Add A record: www → $IP"
echo ""
echo "2. Wait for DNS propagation (15 min - 48 hours)"
echo "   Check with: nslookup $DOMAIN"
echo ""
echo "3. Test your domain:"
echo "   http://$DOMAIN"
echo ""
echo "4. (Optional) Setup SSL:"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""

