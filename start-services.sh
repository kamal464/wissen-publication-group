#!/bin/bash
# Start all services on EC2
# Run this on EC2: bash start-services.sh

echo "=========================================="
echo "🚀 Starting Wissen Publication Group Services"
echo "=========================================="
echo ""

cd /var/www/wissen-publication-group || exit 1

echo "1. Checking current directory..."
pwd
echo ""

echo "2. Checking if .env file exists..."
if [ -f backend/.env ]; then
  echo "✅ backend/.env exists"
  echo "DATABASE_URL is set: $(grep -q "^DATABASE_URL=" backend/.env && echo "YES" || echo "NO")"
else
  echo "❌ backend/.env not found!"
  echo "Creating .env file..."
  
  # Get DB_PASSWORD from environment or use default
  DB_PASS="${DB_PASSWORD:-wissen@2024}"
  ENCODED_PASS=$(echo "$DB_PASS" | sed 's/@/%40/g')
  
  {
    echo "DATABASE_URL=postgresql://postgres:${ENCODED_PASS}@localhost:5432/wissen_publication_group"
    echo "NODE_ENV=production"
    echo "PORT=3001"
    echo "CORS_ORIGIN=http://54.165.116.208,http://localhost:3000,http://localhost:3002"
  } > backend/.env
  echo "✅ Created backend/.env"
fi
echo ""

echo "3. Checking if backend is built..."
if [ -f backend/dist/src/main.js ]; then
  echo "✅ Backend is built"
else
  echo "⚠️  Backend not built, building now..."
  cd backend
  npm install --unsafe-perm
  npm run build
  cd ..
fi
echo ""

echo "4. Checking if frontend is built..."
if [ -d frontend/.next ]; then
  echo "✅ Frontend is built"
else
  echo "⚠️  Frontend not built, building now..."
  cd frontend
  npm install
  npm run build
  cd ..
fi
echo ""

echo "5. Stopping any existing PM2 processes..."
pm2 delete all 2>/dev/null || true
sleep 2
echo ""

echo "6. Starting services with PM2..."
if [ -f ecosystem.config.js ]; then
  echo "Using ecosystem.config.js..."
  pm2 start ecosystem.config.js --update-env
else
  echo "Starting manually..."
  cd backend
  pm2 start node --name wissen-backend -- dist/src/main.js
  cd ../frontend
  pm2 start npm --name wissen-frontend -- start
  cd ..
fi

pm2 save
echo ""

echo "7. Waiting for services to start..."
sleep 15

echo "8. PM2 Status:"
pm2 list
echo ""

echo "9. Testing services..."
echo "Backend (port 3001):"
for i in {1..5}; do
  BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null || echo "000")
  if [ "$BACKEND_STATUS" = "200" ]; then
    echo "  ✅ Backend is responding (HTTP $BACKEND_STATUS)"
    break
  else
    echo "  Attempt $i/5: HTTP $BACKEND_STATUS (waiting...)"
    sleep 3
  fi
done

echo "Frontend (port 3000):"
for i in {1..5}; do
  FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
  if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "  ✅ Frontend is responding (HTTP $FRONTEND_STATUS)"
    break
  else
    echo "  Attempt $i/5: HTTP $FRONTEND_STATUS (waiting...)"
    sleep 3
  fi
done
echo ""

echo "10. Checking ports..."
netstat -tln 2>/dev/null | grep -E ":3000|:3001" || ss -tln 2>/dev/null | grep -E ":3000|:3001"
echo ""

echo "11. Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx
echo ""

echo "12. Final test via Nginx..."
sleep 3
NGINX_BACKEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null || echo "000")
NGINX_FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null || echo "000")
echo "Nginx -> Backend: HTTP $NGINX_BACKEND"
echo "Nginx -> Frontend: HTTP $NGINX_FRONTEND"
echo ""

if [ "$NGINX_BACKEND" = "200" ] && [ "$NGINX_FRONTEND" = "200" ]; then
  echo "=========================================="
  echo "✅ All services are running!"
  echo "=========================================="
  echo "🌐 Application: http://54.165.116.208"
  echo "🌐 API: http://54.165.116.208/api"
  echo "🌐 Health: http://54.165.116.208/api/health"
else
  echo "⚠️  Services may still be starting. Check logs:"
  echo "  pm2 logs wissen-backend"
  echo "  pm2 logs wissen-frontend"
fi

echo ""
echo "PM2 Status:"
pm2 list

