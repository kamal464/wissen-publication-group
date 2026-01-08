# Commands to Run in AWS EC2 Browser Terminal

Copy and paste these commands one by one into your EC2 browser terminal:

## Step 1: Navigate to the project directory
```bash
cd /var/www/wissen-publication-group
```

## Step 2: Pull latest code (if needed)
```bash
git pull origin main
```

## Step 3: Check current status
```bash
pm2 status
```

## Step 4: Create/verify .env file exists
```bash
cat > backend/.env << 'ENVEOF'
DATABASE_URL=postgresql://postgres:wissen%402024@localhost:5432/wissen_publication_group
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://54.165.116.208,http://localhost:3000,http://localhost:3002
ENVEOF
echo "✅ .env file created"
```

## Step 5: Stop any existing PM2 processes
```bash
pm2 delete all 2>/dev/null || true
sleep 2
```

## Step 6: Start services with PM2
```bash
pm2 start ecosystem.config.js --update-env
pm2 save
```

## Step 7: Wait for services to start
```bash
sleep 15
```

## Step 8: Check PM2 status
```bash
pm2 list
```

## Step 9: Test backend
```bash
curl http://localhost:3001/api/health
```

## Step 10: Test frontend
```bash
curl http://localhost:3000 | head -5
```

## Step 11: Check ports are listening
```bash
netstat -tln | grep -E ":3000|:3001" || ss -tln | grep -E ":3000|:3001"
```

## Step 12: Reload Nginx
```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Step 13: Test via Nginx
```bash
curl http://localhost/api/health
curl http://localhost/ | head -5
```

## Step 14: Final status check
```bash
pm2 status
echo ""
echo "✅ If PM2 shows both services as 'online', the 502 error should be fixed!"
echo "🌐 Visit: http://54.165.116.208"
```

---

## Alternative: All-in-One Command

If you want to run everything at once:

```bash
cd /var/www/wissen-publication-group && \
cat > backend/.env << 'ENVEOF'
DATABASE_URL=postgresql://postgres:wissen%402024@localhost:5432/wissen_publication_group
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://54.165.116.208,http://localhost:3000,http://localhost:3002
ENVEOF
pm2 delete all 2>/dev/null || true && \
sleep 2 && \
pm2 start ecosystem.config.js --update-env && \
pm2 save && \
sleep 15 && \
pm2 list && \
echo "" && \
echo "Testing services..." && \
curl -s http://localhost:3001/api/health && echo "" && \
curl -s http://localhost:3000 | head -1 && echo "" && \
sudo nginx -t && sudo systemctl reload nginx && \
echo "" && \
echo "✅ Services started! Test: curl http://localhost/api/health"
```

---

## If Services Don't Start - Check Logs

```bash
# Check backend logs
pm2 logs wissen-backend --lines 50

# Check frontend logs  
pm2 logs wissen-frontend --lines 50

# Check if builds exist
ls -la backend/dist/src/main.js
ls -ld frontend/.next
```

---

## If Builds Don't Exist - Rebuild

```bash
# Build backend
cd /var/www/wissen-publication-group/backend
npm install --unsafe-perm
npm run build
cd ..

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Then start services
pm2 start ecosystem.config.js --update-env
pm2 save
```

