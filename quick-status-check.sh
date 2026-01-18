#!/bin/bash
# Quick status check - run this on EC2 to see current state
# SSH into EC2 and run: bash quick-status-check.sh

echo "=========================================="
echo "🔍 Quick Status Check"
echo "=========================================="
echo ""

echo "1. PM2 Status:"
pm2 status
echo ""

echo "2. Port Status:"
netstat -tln 2>/dev/null | grep -E ":3000|:3001" || echo "No services on ports 3000/3001"
echo ""

echo "3. Process Status:"
ps aux | grep -E "node|npm" | grep -v grep || echo "No node processes running"
echo ""

echo "4. Testing localhost:"
echo "Backend:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3001/api/health 2>/dev/null || echo "FAILED"
echo "Frontend:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 2>/dev/null || echo "FAILED"
echo ""

echo "5. PM2 Logs (last 10 lines each):"
echo "Backend:"
pm2 logs wissen-backend --lines 10 --nostream 2>/dev/null || echo "No backend logs"
echo ""
echo "Frontend:"
pm2 logs wissen-frontend --lines 10 --nostream 2>/dev/null || echo "No frontend logs"
echo ""

echo "=========================================="

