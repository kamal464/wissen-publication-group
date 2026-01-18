#!/bin/bash
# Manual diagnostic script to run on EC2 instance
# SSH into EC2 and run: bash diagnose-ec2.sh

echo "=========================================="
echo "🔍 EC2 Deployment Diagnostic"
echo "=========================================="
echo ""

echo "1. PM2 Status:"
pm2 status
echo ""

echo "2. PM2 List:"
pm2 list
echo ""

echo "3. PM2 Info:"
pm2 describe wissen-backend 2>/dev/null || echo "Backend not found"
pm2 describe wissen-frontend 2>/dev/null || echo "Frontend not found"
echo ""

echo "4. Port Status:"
netstat -tln 2>/dev/null | grep -E ":3000|:3001" || echo "No services on ports 3000/3001"
echo ""

echo "5. Process Status:"
ps aux | grep -E "node|npm" | grep -v grep || echo "No node processes running"
echo ""

echo "6. Testing localhost:"
echo "Backend:"
curl -s http://localhost:3001/api/health || echo "Backend not responding"
echo ""
echo "Frontend:"
curl -s http://localhost:3000 | head -20 || echo "Frontend not responding"
echo ""

echo "7. PM2 Logs (Backend - last 30 lines):"
pm2 logs wissen-backend --lines 30 --nostream 2>/dev/null || echo "Could not get backend logs"
echo ""

echo "8. PM2 Logs (Frontend - last 30 lines):"
pm2 logs wissen-frontend --lines 30 --nostream 2>/dev/null || echo "Could not get frontend logs"
echo ""

echo "9. Check if build files exist:"
ls -lh /var/www/wissen-publication-group/backend/dist/main.js 2>/dev/null || echo "Backend build file not found"
ls -ld /var/www/wissen-publication-group/frontend/.next 2>/dev/null || echo "Frontend build directory not found"
echo ""

echo "10. Check Nginx status:"
sudo systemctl status nginx --no-pager | head -10
echo ""

echo "11. Check Nginx config:"
sudo nginx -t
echo ""

echo "=========================================="
echo "Diagnostic complete!"
echo "=========================================="

