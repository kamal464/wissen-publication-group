# 🚀 Deploy with Nginx Fix for Next.js Static Files

## **COMPLETE DEPLOYMENT COMMAND**

Run this on your server to deploy everything including the Nginx fix:

```bash
cd /var/www/wissen-publication-group && \
echo "===========================================" && \
echo "🚀 COMPLETE DEPLOYMENT WITH NGINX FIX" && \
echo "===========================================" && \
echo "" && \
echo "=== STEP 1: Pull Latest Code ===" && \
rm -f backend/dist/tsconfig.build.tsbuildinfo && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
echo "✅ Code pulled" && \
echo "" && \
echo "=== STEP 2: Deploy Backend ===" && \
cd backend && \
npm install --no-audit --no-fund --loglevel=error && \
npx prisma generate && \
npx prisma migrate deploy && \
npm run build && \
echo "✅ Backend deployed" && \
cd .. && \
echo "" && \
echo "=== STEP 3: Deploy Frontend ===" && \
cd frontend && \
rm -rf .next node_modules/.cache && \
npm install --no-audit --no-fund --loglevel=error && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
echo "✅ Frontend deployed" && \
cd .. && \
echo "" && \
echo "=== STEP 4: Fix Nginx Configuration ===" && \
sudo cp /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-available/wissen-publication-group.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true && \
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

echo "✅ Nginx config updated" && \
echo "" && \
echo "=== STEP 5: Test & Reload Nginx ===" && \
sudo nginx -t && \
sudo systemctl reload nginx && \
echo "✅ Nginx reloaded" && \
echo "" && \
echo "=== STEP 6: Restart Services ===" && \
pm2 restart all 2>/dev/null || \
(pm2 delete all 2>/dev/null || true && \
sleep 2 && \
cd backend && \
pm2 start dist/src/main.js --name wissen-backend \
  --max-memory-restart 400M \
  --update-env && \
cd ../frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd ..) && \
sleep 5 && \
pm2 save && \
echo "✅ Services restarted" && \
echo "" && \
echo "=== STEP 7: Verify Deployment ===" && \
echo "" && \
echo "1. PM2 Status:" && \
pm2 list && \
echo "" && \
echo "2. Backend Health:" && \
curl -s http://localhost:3001/health && echo "" && \
echo "" && \
echo "3. Frontend Status:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 http://localhost:3000 && \
echo "" && \
echo "4. Test Static File (should return 200 or 404, not 400):" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 5 http://localhost:3000/_next/static/css/app.css 2>/dev/null || echo "File may not exist (404 is OK)" && \
echo "" && \
echo "===========================================" && \
echo "✅ DEPLOYMENT COMPLETE!" && \
echo "===========================================" && \
echo "" && \
echo "Next steps:" && \
echo "1. Clear browser cache (Ctrl+Shift+R)" && \
echo "2. Test: https://wissenpublicationgroup.com" && \
echo "3. Check browser console - 400 errors should be gone!"
```

---

## **QUICK DEPLOY (If Already Configured)**

If Nginx is already configured, use this shorter version:

```bash
cd /var/www/wissen-publication-group && \
rm -f backend/dist/tsconfig.build.tsbuildinfo && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
cd backend && npm install --no-audit --no-fund --loglevel=error && npx prisma generate && npx prisma migrate deploy && npm run build && cd .. && \
cd frontend && rm -rf .next node_modules/.cache && npm install --no-audit --no-fund --loglevel=error && NODE_OPTIONS="--max-old-space-size=2048" npm run build && cd .. && \
pm2 restart all && sleep 5 && pm2 save && \
sudo systemctl reload nginx && \
echo "✅ Deployment complete!"
```

---

## **VERIFY AFTER DEPLOYMENT**

```bash
echo "=== VERIFICATION ===" && \
echo "" && \
echo "1. PM2 Status:" && \
pm2 list && \
echo "" && \
echo "2. Backend:" && \
curl -s http://localhost:3001/health && echo "" && \
echo "" && \
echo "3. Frontend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 && \
echo "" && \
echo "4. Nginx:" && \
sudo systemctl status nginx --no-pager | head -3 && \
echo "" && \
echo "✅ All services running!"
```

---

## **WHAT THIS FIXES**

✅ **Next.js static files 400 error** - Adds explicit `/_next/static` handling
✅ **All API endpoints** - Properly configured
✅ **Frontend build** - Rebuilt with latest changes
✅ **Backend build** - Rebuilt with latest changes
✅ **Services restarted** - PM2 restarts both services
✅ **Nginx reloaded** - New configuration applied

**After deployment, the 400 errors should be resolved!** 🎯
