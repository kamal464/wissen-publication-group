# 🔧 Fix Frontend Timeout - Nginx Can't Reach Frontend

## Problem: Nginx times out when connecting to frontend (port 3000)

---

## Step 1: Check Frontend Status & Logs

```bash
# Check frontend process
pm2 logs wissen-frontend --lines 50 --err

# Check if frontend is actually responding
curl -v --max-time 10 http://localhost:3000
```

---

## Step 2: Check Frontend Build

```bash
# Check if .next directory exists
ls -la /var/www/wissen-publication-group/frontend/.next

# Check frontend package.json
cat /var/www/wissen-publication-group/frontend/package.json | grep -A 5 "scripts"
```

---

## Step 3: Restart Frontend Properly

```bash
# Stop frontend
pm2 stop wissen-frontend
pm2 delete wissen-frontend

# Navigate to frontend
cd /var/www/wissen-publication-group/frontend

# Check if it's built
if [ ! -d ".next" ]; then
    echo "Frontend not built! Building now..."
    NODE_OPTIONS="--max-old-space-size=2048" npm run build
fi

# Start frontend
pm2 start npm --name wissen-frontend -- start

# Wait and check
sleep 10
pm2 list
curl -v --max-time 5 http://localhost:3000
```

---

## Step 4: Increase Nginx Timeouts

**Edit nginx config:**

```bash
sudo nano /etc/nginx/sites-available/wissen-publication-group
```

**Make sure these are at the TOP of the server block (before location blocks):**

```nginx
server {
    listen 80;
    server_name wissenpublicationgroup.com www.wissenpublicationgroup.com;

    # CRITICAL: Increase all timeouts
    proxy_read_timeout 600s;
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
    client_max_body_size 50M;
    fastcgi_read_timeout 600s;
    
    # Keep-alive settings
    keepalive_timeout 600s;
    keepalive_requests 1000;

    # ... rest of config
}
```

**Also, in the frontend location block, add:**

```nginx
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
    
    # ADD THESE TIMEOUTS
    proxy_read_timeout 600s;
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
    proxy_buffering off;
}
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Test and reload:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Complete Fix Script

**Copy and paste this entire block:**

```bash
# 1. Check frontend logs
echo "=== Frontend Logs (last 30 lines) ==="
pm2 logs wissen-frontend --lines 30 --nostream
echo ""

# 2. Test frontend directly
echo "=== Testing Frontend Directly ==="
timeout 10 curl -v http://localhost:3000 2>&1 | head -20 || echo "Frontend not responding within 10 seconds"
echo ""

# 3. Check frontend build
echo "=== Checking Frontend Build ==="
if [ -d "/var/www/wissen-publication-group/frontend/.next" ]; then
    echo "✅ Frontend build exists"
    ls -lh /var/www/wissen-publication-group/frontend/.next | head -5
else
    echo "❌ Frontend build missing!"
fi
echo ""

# 4. Restart frontend
echo "=== Restarting Frontend ==="
pm2 restart wissen-frontend
sleep 15
echo ""

# 5. Test again
echo "=== Testing Frontend After Restart ==="
timeout 10 curl -s -o /dev/null -w "HTTP %{http_code} (took %{time_total}s)\n" http://localhost:3000 || echo "Still timing out"
echo ""

# 6. Check PM2 status
pm2 list
```

---

## If Frontend Keeps Timing Out

**Rebuild frontend completely:**

```bash
cd /var/www/wissen-publication-group/frontend

# Stop frontend
pm2 stop wissen-frontend
pm2 delete wissen-frontend

# Clean and rebuild
rm -rf .next node_modules/.cache
npm install --no-audit --no-fund
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Start
pm2 start npm --name wissen-frontend -- start
pm2 save

# Wait for startup
sleep 20

# Test
curl -v --max-time 10 http://localhost:3000
```

---

## Quick Diagnostic

```bash
# All checks at once
echo "=== Frontend Process ==="
pm2 describe wissen-frontend | grep -E "(status|pid|uptime|restarts)"
echo ""
echo "=== Frontend Port ==="
sudo ss -tlnp | grep :3000
echo ""
echo "=== Frontend Response Test ==="
timeout 15 curl -s -o /dev/null -w "HTTP %{http_code} - Time: %{time_total}s\n" http://localhost:3000 || echo "TIMEOUT after 15 seconds"
echo ""
echo "=== Frontend Logs (errors only) ==="
pm2 logs wissen-frontend --lines 20 --err --nostream
```

---

**Run the diagnostic script first, then share the output!** 🔍
