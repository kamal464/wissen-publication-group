# 🔍 Diagnose & Fix Persistent 400 Errors

## **STEP 1: DIAGNOSE THE ISSUE**

Run this to find the root cause:

```bash
cd /var/www/wissen-publication-group && \
echo "==========================================" && \
echo "🔍 DIAGNOSING 400 ERRORS" && \
echo "==========================================" && \
echo "" && \
echo "=== 1. Check Nginx Config ===" && \
sudo cat /etc/nginx/sites-available/wissen-publication-group | grep -A 10 "_next/static" || echo "❌ _next/static location NOT FOUND in config!" && \
echo "" && \
echo "=== 2. Check if Frontend Can Serve Files Directly ===" && \
echo "Testing specific file that's failing:" && \
curl -v http://localhost:3000/_next/static/css/312758d985e43958.css 2>&1 | head -20 && \
echo "" && \
echo "=== 3. Check Frontend Build ===" && \
if [ -d "frontend/.next/static" ]; then \
  echo "✅ Build exists"; \
  echo "Checking for the specific CSS file:"; \
  find frontend/.next/static -name "*312758d985e43958.css" 2>/dev/null || echo "⚠️ Specific CSS file not found"; \
  echo "Total static files:"; \
  find frontend/.next/static -type f 2>/dev/null | wc -l; \
else \
  echo "❌ Build directory missing!"; \
fi && \
echo "" && \
echo "=== 4. Check Nginx Error Logs ===" && \
sudo tail -20 /var/log/nginx/error.log && \
echo "" && \
echo "=== 5. Test via Nginx ===" && \
curl -v http://54.165.116.208/_next/static/css/312758d985e43958.css 2>&1 | head -20
```

---

## **STEP 2: CHECK IF NGINX CONFIG IS ACTIVE**

```bash
echo "=== Checking Active Nginx Config ===" && \
sudo nginx -T 2>/dev/null | grep -A 10 "_next/static" || echo "❌ Config not active!" && \
echo "" && \
echo "=== Checking if site is enabled ===" && \
sudo ls -la /etc/nginx/sites-enabled/ | grep wissen && \
echo "" && \
echo "=== Testing Nginx Config ===" && \
sudo nginx -t
```

---

## **STEP 3: ALTERNATIVE FIX - Use Exact Path Matching**

If the location block isn't working, try this more specific config:

```bash
cd /var/www/wissen-publication-group && \
echo "=== Applying Alternative Nginx Config ===" && \
sudo cp /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-available/wissen-publication-group.backup.alt.$(date +%Y%m%d_%H%M%S) && \
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

    # Next.js static files - Use regex for better matching
    location ~ ^/_next/static {
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
    location ~ ^/_next/image {
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

echo "✅ Alternative config applied" && \
sudo nginx -t && \
sudo systemctl reload nginx && \
echo "✅ Nginx reloaded"
```

---

## **STEP 4: CHECK IF FRONTEND IS SERVING FILES**

The issue might be that the frontend itself isn't serving the files correctly:

```bash
cd /var/www/wissen-publication-group && \
echo "=== Testing Frontend Directly ===" && \
echo "1. Check if frontend is running:" && \
pm2 list | grep wissen-frontend && \
echo "" && \
echo "2. Test root:" && \
curl -I http://localhost:3000 2>&1 | head -5 && \
echo "" && \
echo "3. Test static file path:" && \
curl -I http://localhost:3000/_next/static/css/app.css 2>&1 | head -5 && \
echo "" && \
echo "4. Check frontend logs:" && \
pm2 logs wissen-frontend --lines 20 --nostream | tail -10
```

---

## **STEP 5: REBUILD FRONTEND IF NEEDED**

If the build is missing or corrupted:

```bash
cd /var/www/wissen-publication-group/frontend && \
echo "=== Rebuilding Frontend ===" && \
pm2 stop wissen-frontend && \
rm -rf .next node_modules/.cache && \
npm install --no-audit --no-fund --loglevel=error && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
cd .. && \
pm2 start wissen-frontend && \
sleep 15 && \
echo "✅ Frontend rebuilt" && \
echo "" && \
echo "Testing after rebuild:" && \
curl -I http://localhost:3000/_next/static/css/app.css 2>&1 | head -5
```

---

## **STEP 6: COMPLETE RESTART**

If nothing else works, restart everything:

```bash
cd /var/www/wissen-publication-group && \
echo "=== Complete Restart ===" && \
pm2 restart all && \
sleep 10 && \
sudo systemctl restart nginx && \
sleep 5 && \
echo "✅ All services restarted" && \
pm2 list && \
echo "" && \
echo "Testing:" && \
curl -I http://localhost:3000 2>&1 | head -3 && \
curl -I http://54.165.116.208 2>&1 | head -3
```

---

**Run STEP 1 first to diagnose the issue, then apply the appropriate fix!** 🔍
