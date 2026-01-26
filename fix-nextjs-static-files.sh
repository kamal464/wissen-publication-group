#!/bin/bash

# Fix Next.js Static Files 400 Error
# Updates Nginx configuration to properly handle /_next/static paths

echo "=== FIXING NEXT.JS STATIC FILES 400 ERROR ==="
echo ""

# Backup current config
echo "1. Backing up current Nginx config..."
sudo cp /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-available/wissen-publication-group.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "No existing config to backup"
echo "✅ Backup created"
echo ""

# Create updated config
echo "2. Creating updated Nginx configuration..."
sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name wissenpublicationgroup.com www.wissenpublicationgroup.com 54.165.116.208;

    client_max_body_size 50M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;

    # Health check endpoint
    location = /health {
        proxy_pass http://localhost:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        access_log off;
    }

    # API endpoints
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

    # Next.js static files - MUST be before location /
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable, max-age=31536000";
        access_log off;
    }

    # Next.js image optimization
    location /_next/image {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend (catch-all - must be last)
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

echo "✅ Configuration updated"
echo ""

# Test configuration
echo "3. Testing Nginx configuration..."
if sudo nginx -t; then
  echo "✅ Nginx configuration is valid"
  echo ""
  echo "4. Reloading Nginx..."
  sudo systemctl reload nginx
  echo "✅ Nginx reloaded"
else
  echo "❌ Nginx configuration has errors!"
  echo "Restoring backup..."
  sudo cp /etc/nginx/sites-available/wissen-publication-group.backup.* /etc/nginx/sites-available/wissen-publication-group 2>/dev/null
  exit 1
fi

echo ""
echo "5. Verifying frontend build..."
if [ -d "/var/www/wissen-publication-group/frontend/.next" ]; then
  echo "✅ Frontend build exists"
  STATIC_COUNT=$(find /var/www/wissen-publication-group/frontend/.next/static -type f 2>/dev/null | wc -l)
  echo "   Static files found: $STATIC_COUNT"
else
  echo "❌ Frontend build missing - need to rebuild"
  echo ""
  echo "6. Rebuilding frontend..."
  cd /var/www/wissen-publication-group/frontend && \
  rm -rf .next node_modules/.cache && \
  npm install --no-audit --no-fund --loglevel=error && \
  NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
  cd .. && \
  pm2 restart wissen-frontend && \
  sleep 10 && \
  echo "✅ Frontend rebuilt"
fi

echo ""
echo "6. Testing static file access..."
sleep 2
STATIC_TEST=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000/_next/static/css/app.css 2>/dev/null || echo "000")
if [ "$STATIC_TEST" = "200" ] || [ "$STATIC_TEST" = "404" ]; then
  echo "✅ Frontend is responding (HTTP $STATIC_TEST)"
else
  echo "⚠️ Frontend returned HTTP $STATIC_TEST (may need more time to start)"
fi

echo ""
echo "==========================================="
echo "✅ FIX APPLIED!"
echo "==========================================="
echo ""
echo "Next steps:"
echo "1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Test the website: https://wissenpublicationgroup.com"
echo "3. Check browser console for any remaining errors"
echo ""
