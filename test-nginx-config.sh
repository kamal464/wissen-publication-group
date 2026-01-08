#!/bin/bash
# Test script to verify Nginx configuration and service connectivity
# Run this on EC2 or locally to diagnose 502 errors

echo "=========================================="
echo "🔍 Testing Nginx Configuration"
echo "=========================================="
echo ""

echo "1. Checking if services are running..."
echo "   Backend (port 3001):"
curl -s -o /dev/null -w "   HTTP %{http_code}\n" http://localhost:3001/health || echo "   ❌ Backend not responding"
echo "   Frontend (port 3000):"
curl -s -o /dev/null -w "   HTTP %{http_code}\n" http://localhost:3000 || echo "   ❌ Frontend not responding"
echo ""

echo "2. Checking ports..."
echo "   Port 3001 (backend):"
netstat -tln 2>/dev/null | grep ":3001" && echo "   ✅ Backend listening" || echo "   ❌ Backend not listening"
echo "   Port 3000 (frontend):"
netstat -tln 2>/dev/null | grep ":3000" && echo "   ✅ Frontend listening" || echo "   ❌ Frontend not listening"
echo ""

echo "3. PM2 Status:"
pm2 list 2>/dev/null || echo "   PM2 not running"
echo ""

echo "4. Testing Nginx config (if Nginx is installed):"
if command -v nginx &> /dev/null; then
    sudo nginx -t 2>&1 | head -5
    echo ""
    echo "5. Testing Nginx proxy (if configured):"
    echo "   /health endpoint:"
    curl -s -o /dev/null -w "   HTTP %{http_code}\n" http://localhost/health 2>/dev/null || echo "   ❌ Nginx not responding"
    echo "   / endpoint:"
    curl -s -o /dev/null -w "   HTTP %{http_code}\n" http://localhost/ 2>/dev/null || echo "   ❌ Nginx not responding"
    echo "   /api endpoint:"
    curl -s -o /dev/null -w "   HTTP %{http_code}\n" http://localhost/api/health 2>/dev/null || echo "   ❌ Nginx not responding"
else
    echo "   Nginx not installed"
fi
echo ""

echo "6. Process check:"
echo "   Node processes:"
ps aux | grep -E "node|npm" | grep -v grep | head -5 || echo "   No node processes found"
echo ""

echo "=========================================="
echo "✅ Test complete"
echo "=========================================="

