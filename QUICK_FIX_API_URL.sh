#!/bin/bash
# Quick fix for API URL - run this on EC2 instance

INSTANCE_IP="54.165.116.208"

echo "🔧 Fixing API URL configuration..."
echo ""

cd /var/www/wissen-publication-group

echo "1. Updating frontend environment file..."
echo "NEXT_PUBLIC_API_URL=http://$INSTANCE_IP/api" > frontend/.env.production
echo "✅ Updated: NEXT_PUBLIC_API_URL=http://$INSTANCE_IP/api"
echo ""

echo "2. Rebuilding frontend (this will take 2-3 minutes)..."
cd frontend
npm run build
echo "✅ Frontend rebuilt"
echo ""

echo "3. Restarting services..."
cd /var/www/wissen-publication-group
pm2 restart wissen-frontend
echo "✅ Frontend restarted"
echo ""

echo "4. Checking services status..."
pm2 status
echo ""

echo "=========================================="
echo "✅ Fix Complete!"
echo "=========================================="
echo ""
echo "🌐 Visit: http://$INSTANCE_IP"
echo ""
echo "The frontend should now connect to: http://$INSTANCE_IP/api"
echo ""

