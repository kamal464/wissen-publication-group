# 🚨 Fix Next.js 400 Errors - Immediate Fix

## **PROBLEM**
Next.js static files are returning 400 Bad Request:
- `/_next/static/css/312758d985e43958.css` → 400
- `/_next/static/chunks/app/instructions/page-d5749c890fd87a10.js` → 400
- `/_next/static/chunks/app/submit-manuscript/page-b23ec1f5ea3ba603.js` → 400

## **IMMEDIATE FIX**

Run this to fix the Nginx configuration:

```bash
cd /var/www/wissen-publication-group && \
echo "==========================================" && \
echo "🔧 FIXING NGINX FOR NEXT.JS STATIC FILES" && \
echo "==========================================" && \
echo "" && \
echo "=== STEP 1: Backup Current Config ===" && \
sudo cp /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-available/wissen-publication-group.backup.$(date +%Y%m%d_%H%M%S) && \
echo "✅ Backup created" && \
echo "" && \
echo "=== STEP 2: Check Current Config ===" && \
sudo cat /etc/nginx/sites-available/wissen-publication-group | grep -A 5 "_next" || echo "⚠️ _next location not found in config" && \
echo "" && \
echo "=== STEP 3: Apply Fixed Nginx Config ===" && \
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

echo "✅ Configuration updated" && \
echo "" && \
echo "=== STEP 4: Test Nginx Config ===" && \
if sudo nginx -t; then \
  echo "✅ Nginx configuration is valid" && \
  echo "" && \
  echo "=== STEP 5: Reload Nginx ===" && \
  sudo systemctl reload nginx && \
  echo "✅ Nginx reloaded" && \
  sleep 2; \
else \
  echo "❌ Nginx configuration has errors!" && \
  echo "Restoring backup..." && \
  sudo cp /etc/nginx/sites-available/wissen-publication-group.backup.* /etc/nginx/sites-available/wissen-publication-group 2>/dev/null && \
  exit 1; \
fi && \
echo "" && \
echo "=== STEP 6: Verify Frontend Build ===" && \
if [ -d "/var/www/wissen-publication-group/frontend/.next" ]; then \
  echo "✅ Frontend build exists"; \
  STATIC_COUNT=$(find /var/www/wissen-publication-group/frontend/.next/static -type f 2>/dev/null | wc -l); \
  echo "   Static files found: $STATIC_COUNT"; \
else \
  echo "❌ Frontend build missing!" && \
  echo "Need to rebuild frontend..."; \
fi && \
echo "" && \
echo "=== STEP 7: Test Static File Access ===" && \
echo "Testing via localhost:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 5 http://localhost:3000/_next/static/css/app.css 2>/dev/null || echo "File may not exist (404 is OK)" && \
echo "" && \
echo "Testing via public IP:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 5 http://54.165.116.208/_next/static/css/app.css 2>/dev/null || echo "Testing static file access" && \
echo "" && \
echo "==========================================" && \
echo "✅ FIX APPLIED!" && \
echo "==========================================" && \
echo "" && \
echo "Next steps:" && \
echo "1. Clear browser cache (Ctrl+Shift+R)" && \
echo "2. Hard refresh the page" && \
echo "3. Check browser console for errors"
```

---

## **IF BUILD IS MISSING - REBUILD FRONTEND**

If the frontend build is missing, rebuild it:

```bash
cd /var/www/wissen-publication-group/frontend && \
echo "=== Rebuilding Frontend ===" && \
rm -rf .next node_modules/.cache && \
npm install --no-audit --no-fund --loglevel=error && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
cd .. && \
echo "" && \
echo "=== Restarting Frontend ===" && \
pm2 restart wissen-frontend && \
sleep 10 && \
echo "✅ Frontend rebuilt and restarted!"
```

---

## **VERIFY THE FIX**

After applying the fix:

```bash
echo "=== VERIFYING FIX ===" && \
echo "" && \
echo "1. Test static CSS file via Nginx:" && \
curl -I http://54.165.116.208/_next/static/css/app.css 2>&1 | head -5 && \
echo "" && \
echo "2. Test static file via localhost:" && \
curl -I http://localhost:3000/_next/static/css/app.css 2>&1 | head -5 && \
echo "" && \
echo "3. Check Nginx config:" && \
sudo nginx -t && \
echo "" && \
echo "4. Check frontend build:" && \
ls -la /var/www/wissen-publication-group/frontend/.next/static 2>/dev/null | head -5 || echo "Build may be missing"
```

---

## **TROUBLESHOOTING**

### **If still getting 400 errors:**

1. **Check if frontend is serving files:**
```bash
curl -v http://localhost:3000/_next/static/css/app.css
```

2. **Check Nginx error logs:**
```bash
sudo tail -50 /var/log/nginx/error.log
```

3. **Check if Nginx config was applied:**
```bash
sudo cat /etc/nginx/sites-available/wissen-publication-group | grep -A 10 "_next/static"
```

4. **Restart everything:**
```bash
pm2 restart all && \
sudo systemctl restart nginx && \
sleep 5 && \
pm2 list
```

---

**Run the first command block to fix the issue immediately!** 🚀
