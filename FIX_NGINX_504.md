# 🔧 Fix Nginx 504 Error - Services Running

## Your services are running! The issue is Nginx configuration.

---

## Step 1: Check Nginx Error Logs

```bash
sudo tail -50 /var/log/nginx/error.log
```

**Look for:**
- "upstream timed out"
- "connect() failed"
- "Connection refused"

---

## Step 2: Test Nginx Configuration

```bash
sudo nginx -t
```

**If there are errors, fix them first.**

---

## Step 3: Check if Nginx Can Reach Services

```bash
# Test from nginx's perspective
sudo curl -v http://127.0.0.1:3001/health
sudo curl -v http://127.0.0.1:3000
```

---

## Step 4: Increase Nginx Timeouts

**Edit nginx config:**

```bash
sudo nano /etc/nginx/sites-available/wissen-publication-group
```

**Make sure these timeout settings are at the top of the server block:**

```nginx
server {
    listen 80;
    server_name wissenpublicationgroup.com www.wissenpublicationgroup.com;

    # Increase timeouts - ADD THESE IF MISSING
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    client_max_body_size 50M;
    fastcgi_read_timeout 300s;

    # ... rest of config
}
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Test and reload:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 5: Check Nginx is Using Correct Upstream

**Verify nginx config has correct proxy_pass:**

```bash
sudo grep -A 5 "proxy_pass" /etc/nginx/sites-available/wissen-publication-group
```

**Should show:**
- `/api` → `http://localhost:3001`
- `/` → `http://localhost:3000`

---

## Step 6: Restart Nginx Completely

```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

---

## Step 7: Test Through Nginx

```bash
# Test API through nginx
curl -v http://localhost/api/health

# Test frontend through nginx
curl -I http://localhost
```

---

## Complete Fix Script

**Copy and paste:**

```bash
# 1. Check nginx logs
echo "=== Nginx Error Logs ==="
sudo tail -20 /var/log/nginx/error.log
echo ""

# 2. Test nginx config
echo "=== Testing Nginx Config ==="
sudo nginx -t
echo ""

# 3. Check current nginx config
echo "=== Current Proxy Settings ==="
sudo grep -E "(proxy_pass|proxy_read_timeout)" /etc/nginx/sites-available/wissen-publication-group
echo ""

# 4. Restart nginx
echo "=== Restarting Nginx ==="
sudo systemctl restart nginx
sleep 2
sudo systemctl status nginx --no-pager | head -10
echo ""

# 5. Test through nginx
echo "=== Testing Through Nginx ==="
curl -s http://localhost/api/health || echo "❌ API not accessible through nginx"
curl -s -o /dev/null -w "Frontend HTTP %{http_code}\n" http://localhost || echo "❌ Frontend not accessible through nginx"
```

---

## If Still Getting 504

**Check if services are actually listening:**

```bash
# Use ss instead of netstat
sudo ss -tlnp | grep -E ':(3000|3001)'
```

**Should show:**
- Port 3000 (frontend)
- Port 3001 (backend)

**If ports not showing, restart services:**

```bash
pm2 restart all --update-env
sleep 5
sudo ss -tlnp | grep -E ':(3000|3001)'
```

---

## Quick Diagnostic

```bash
# All-in-one check
echo "=== Services Status ==="
pm2 list
echo ""
echo "=== Ports Listening ==="
sudo ss -tlnp | grep -E ':(3000|3001)'
echo ""
echo "=== Direct Service Test ==="
curl -s http://localhost:3001/health && echo " ✅ Backend OK"
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000
echo ""
echo "=== Nginx Test ==="
curl -s http://localhost/api/health && echo " ✅ Nginx→Backend OK" || echo " ❌ Nginx→Backend FAILED"
curl -s -o /dev/null -w "Nginx→Frontend: HTTP %{http_code}\n" http://localhost || echo " ❌ Nginx→Frontend FAILED"
```

---

**Run the diagnostic script above and share the output!** 🔍
