#!/bin/bash
# Quick fix for 502 Bad Gateway error
# Run this on EC2: bash fix-502-error.sh

echo "=========================================="
echo "🔧 Fixing 502 Bad Gateway Error"
echo "=========================================="
echo ""

cd /var/www/wissen-publication-group || exit 1

echo "1. Checking PM2 status..."
pm2 status
echo ""

echo "2. Checking ports..."
netstat -tln 2>/dev/null | grep -E ":3000|:3001|:80" || ss -tln 2>/dev/null | grep -E ":3000|:3001|:80"
echo ""

echo "3. Testing localhost connections..."
echo "Backend (port 3001):"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3001/api/health || echo "FAILED"
echo "Frontend (port 3000):"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 || echo "FAILED"
echo ""

echo "4. Checking PM2 logs for errors..."
echo "Backend errors (last 10 lines):"
pm2 logs wissen-backend --lines 10 --err --nostream 2>/dev/null || echo "No backend logs"
echo ""
echo "Frontend errors (last 10 lines):"
pm2 logs wissen-frontend --lines 10 --err --nostream 2>/dev/null || echo "No frontend logs"
echo ""

echo "5. Restarting PM2 services..."
pm2 restart all
sleep 5
pm2 save
echo ""

echo "6. Waiting for services to start..."
sleep 10

echo "7. Checking PM2 status after restart..."
pm2 status
echo ""

echo "8. Testing connections again..."
echo "Backend:"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")
echo "  HTTP $BACKEND_STATUS"
echo "Frontend:"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
echo "  HTTP $FRONTEND_STATUS"
echo ""

echo "9. Checking Nginx status..."
sudo systemctl status nginx --no-pager | head -5
echo ""

echo "10. Testing Nginx proxy..."
NGINX_BACKEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null || echo "000")
NGINX_FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null || echo "000")
echo "Nginx -> Backend: HTTP $NGINX_BACKEND"
echo "Nginx -> Frontend: HTTP $NGINX_FRONTEND"
echo ""

if [ "$BACKEND_STATUS" = "200" ] && [ "$FRONTEND_STATUS" = "200" ]; then
  echo "✅ Services are responding on localhost"
  if [ "$NGINX_BACKEND" = "200" ] && [ "$NGINX_FRONTEND" = "200" ]; then
    echo "✅ Nginx proxy is working!"
    echo "✅ 502 error should be fixed!"
  else
    echo "⚠️  Services work but Nginx proxy has issues"
    echo "Reloading Nginx..."
    sudo nginx -t && sudo systemctl reload nginx
  fi
else
  echo "❌ Services are not responding"
  echo "Checking backend logs for errors..."
  pm2 logs wissen-backend --lines 50 --nostream | tail -20
  echo ""
  echo "Checking frontend logs for errors..."
  pm2 logs wissen-frontend --lines 50 --nostream | tail -20
fi

echo ""
echo "=========================================="
echo "Diagnostic complete!"
echo "=========================================="

