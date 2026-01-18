#!/bin/bash
# Comprehensive EC2 diagnostic - run this ON the EC2 instance via SSH
# SSH into EC2 and run: bash comprehensive-ec2-diagnostic.sh

echo "=========================================="
echo "🔍 Comprehensive EC2 Diagnostic"
echo "=========================================="
echo "Timestamp: $(date)"
echo ""

echo "1. System Information:"
echo "   Hostname: $(hostname)"
echo "   IP Address: $(hostname -I | awk '{print $1}')"
echo "   Uptime: $(uptime)"
echo "   Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
echo "   Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')"
echo ""

echo "2. Node.js and PM2:"
echo "   Node version: $(node --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "   NPM version: $(npm --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "   PM2 version: $(pm2 --version 2>/dev/null || echo 'NOT INSTALLED')"
echo ""

echo "3. PM2 Status:"
pm2 status || echo "PM2 not running"
echo ""

echo "4. PM2 List:"
pm2 list || echo "PM2 list failed"
echo ""

echo "5. PM2 Process Details:"
echo "Backend:"
pm2 describe wissen-backend 2>/dev/null || echo "Backend not found in PM2"
echo ""
echo "Frontend:"
pm2 describe wissen-frontend 2>/dev/null || echo "Frontend not found in PM2"
echo ""

echo "6. Port Status:"
echo "Listening ports:"
netstat -tln 2>/dev/null | grep -E ":3000|:3001|:80|:443" || echo "No services listening on ports 3000, 3001, 80, or 443"
echo ""

echo "7. Process Status:"
echo "Node processes:"
ps aux | grep -E "node|npm" | grep -v grep || echo "No node processes running"
echo ""

echo "8. Nginx Status:"
sudo systemctl status nginx --no-pager | head -10 || echo "Nginx not installed or not running"
echo ""

echo "9. PostgreSQL Status:"
sudo systemctl status postgresql --no-pager | head -10 || echo "PostgreSQL not installed or not running"
echo ""

echo "10. Testing Localhost Endpoints:"
echo "Backend (localhost:3001/api/health):"
BACKEND_TEST=$(curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "FAILED")
echo "   $BACKEND_TEST"
if [ "$BACKEND_TEST" != "HTTP 200" ]; then
  echo "   ⚠️  Backend not responding!"
fi
echo ""

echo "Frontend (localhost:3000):"
FRONTEND_TEST=$(curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:3000 2>/dev/null || echo "FAILED")
echo "   $FRONTEND_TEST"
if [ "$FRONTEND_TEST" != "HTTP 200" ]; then
  echo "   ⚠️  Frontend not responding!"
fi
echo ""

echo "11. PM2 Logs (Last 20 lines each):"
echo "Backend logs:"
pm2 logs wissen-backend --lines 20 --nostream 2>/dev/null || echo "Could not get backend logs"
echo ""
echo "Frontend logs:"
pm2 logs wissen-frontend --lines 20 --nostream 2>/dev/null || echo "Could not get frontend logs"
echo ""

echo "12. Application Files:"
echo "Repository exists: $([ -d /var/www/wissen-publication-group ] && echo 'YES' || echo 'NO')"
echo "Backend build exists: $([ -f /var/www/wissen-publication-group/backend/dist/main.js ] && echo 'YES' || echo 'NO')"
echo "Frontend build exists: $([ -d /var/www/wissen-publication-group/frontend/.next ] && echo 'YES' || echo 'NO')"
echo ""

echo "13. Environment Files:"
echo "Backend .env exists: $([ -f /var/www/wissen-publication-group/backend/.env ] && echo 'YES' || echo 'NO')"
echo "Frontend .env.production exists: $([ -f /var/www/wissen-publication-group/frontend/.env.production ] && echo 'YES' || echo 'NO')"
echo ""

echo "14. Nginx Configuration:"
sudo nginx -t 2>&1 || echo "Nginx config test failed"
echo ""

echo "15. Firewall Status:"
sudo ufw status 2>/dev/null || echo "UFW not installed or not active"
echo ""

echo "=========================================="
echo "Diagnostic Complete!"
echo "=========================================="
echo ""
echo "💡 Key Things to Check:"
echo "   - Are PM2 processes 'online'?"
echo "   - Are ports 3000/3001 listening?"
echo "   - Do localhost tests return HTTP 200?"
echo "   - Are there errors in PM2 logs?"
echo "=========================================="

