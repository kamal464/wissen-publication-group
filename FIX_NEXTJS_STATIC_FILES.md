# 🔧 Fix: Next.js Static Files 400 Error

## **PROBLEM**

Next.js static files (`/_next/static/...`) are returning **400 Bad Request**:
- `/_next/static/css/312758d985e43958.css` → 400
- `/_next/static/chunks/app/instructions/page-d5749c890fd87a10.js` → 400
- `/_next/static/chunks/app/submit-manuscript/page-b23ec1f5ea3ba603.js` → 400

## **ROOT CAUSE**

The Nginx configuration may not be properly handling `/_next/` paths, or the frontend build might be missing files.

---

## **FIX: Update Nginx Configuration**

Run this to fix the Nginx configuration:

```bash
cd /var/www/wissen-publication-group && \
echo "=== FIXING NGINX CONFIGURATION ===" && \
echo "" && \
echo "1. Backing up current Nginx config..." && \
sudo cp /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-available/wissen-publication-group.backup.$(date +%Y%m%d_%H%M%S) && \
echo "✅ Backup created" && \
echo "" && \
echo "2. Creating updated Nginx configuration..." && \
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
echo "3. Testing Nginx configuration..." && \
sudo nginx -t && \
echo "" && \
echo "4. Reloading Nginx..." && \
sudo systemctl reload nginx && \
echo "✅ Nginx reloaded" && \
echo "" && \
echo "5. Verifying frontend build exists..." && \
if [ -d "/var/www/wissen-publication-group/frontend/.next" ]; then \
  echo "✅ Frontend build exists"; \
  ls -la /var/www/wissen-publication-group/frontend/.next/static 2>/dev/null | head -5 || echo "⚠️ Static directory may be empty"; \
else \
  echo "❌ Frontend build missing - need to rebuild"; \
fi && \
echo "" && \
echo "✅ Nginx configuration fixed!"
```

---

## **IF BUILD IS MISSING: Rebuild Frontend**

If the frontend build is missing:

```bash
cd /var/www/wissen-publication-group/frontend && \
echo "=== Rebuilding Frontend ===" && \
rm -rf .next node_modules/.cache && \
npm install --no-audit --no-fund --loglevel=error && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
echo "" && \
echo "=== Restarting Frontend ===" && \
cd .. && \
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
echo "1. Test static CSS file:" && \
curl -I https://wissenpublicationgroup.com/_next/static/css/312758d985e43958.css 2>&1 | head -5 && \
echo "" && \
echo "2. Test static JS file:" && \
curl -I https://wissenpublicationgroup.com/_next/static/chunks/app/instructions/page-d5749c890fd87a10.js 2>&1 | head -5 && \
echo "" && \
echo "3. Check frontend status:" && \
pm2 list | grep wissen-frontend && \
echo "" && \
echo "4. Check Nginx status:" && \
sudo systemctl status nginx --no-pager | head -5
```

---

## **ALTERNATIVE: Check Frontend Directly**

Test if frontend is serving files correctly:

```bash
echo "=== TESTING FRONTEND DIRECTLY ===" && \
echo "" && \
echo "1. Test frontend root:" && \
curl -I http://localhost:3000 2>&1 | head -3 && \
echo "" && \
echo "2. Test static file (if build exists):" && \
curl -I http://localhost:3000/_next/static/css/app.css 2>&1 | head -3 || echo "File may not exist (check build)" && \
echo "" && \
echo "3. Check if .next directory exists:" && \
ls -ld /var/www/wissen-publication-group/frontend/.next 2>/dev/null && echo "✅ Build exists" || echo "❌ Build missing"
```

---

## **SUMMARY**

The fix:
1. ✅ Adds explicit `location /_next/static` block in Nginx
2. ✅ Ensures proper proxy headers
3. ✅ Adds caching for static files
4. ✅ Verifies frontend build exists

**After applying this fix, the 400 errors should be resolved!** 🎯
