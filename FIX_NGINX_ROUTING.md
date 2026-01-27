# 🔧 Fix Nginx Routing - Services Working But Site Down

## Services are running! Now fix Nginx routing.

---

## Quick Diagnostic & Fix

**Copy and paste this entire block:**

```bash
# 1. Test through nginx
echo "=== Testing Through Nginx ==="
curl -s http://localhost/api/health && echo " ✅ API through nginx OK" || echo " ❌ API through nginx FAILED"
curl -s -o /dev/null -w "Frontend through nginx: HTTP %{http_code}\n" http://localhost || echo " ❌ Frontend through nginx FAILED"
echo ""

# 2. Check nginx error logs
echo "=== Recent Nginx Errors ==="
sudo tail -20 /var/log/nginx/error.log | grep -i error || echo "No recent errors"
echo ""

# 3. Check nginx access logs
echo "=== Recent Nginx Access ==="
sudo tail -5 /var/log/nginx/access.log
echo ""

# 4. Test nginx config
echo "=== Testing Nginx Config ==="
sudo nginx -t
echo ""

# 5. Check which nginx config is active
echo "=== Active Nginx Sites ==="
ls -la /etc/nginx/sites-enabled/
echo ""

# 6. Check nginx server blocks
echo "=== Nginx Server Blocks ==="
sudo grep -E "(server_name|listen)" /etc/nginx/sites-available/wissen-publication-group | head -5
echo ""

# 7. Restart nginx completely
echo "=== Restarting Nginx ==="
sudo systemctl restart nginx
sleep 2
sudo systemctl status nginx --no-pager | head -10
echo ""

# 8. Test again
echo "=== Testing After Restart ==="
curl -s http://localhost/api/health && echo " ✅ API OK" || echo " ❌ API FAILED"
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost || echo " ❌ Frontend FAILED"
echo ""

# 9. Test with domain name (if DNS is configured)
echo "=== Testing Domain ==="
curl -s -o /dev/null -w "Domain HTTP: %{http_code}\n" -H "Host: wissenpublicationgroup.com" http://localhost || echo "Domain test failed"
```

---

## If Nginx Still Not Working

**Check nginx configuration file:**

```bash
# View full nginx config
sudo cat /etc/nginx/sites-available/wissen-publication-group
```

**Make sure it has:**
- `listen 80;`
- `server_name wissenpublicationgroup.com www.wissenpublicationgroup.com;`
- `location /api` → `proxy_pass http://localhost:3001;`
- `location /` → `proxy_pass http://localhost:3000;`

---

## If Using HTTPS (SSL)

**Check SSL certificate:**

```bash
sudo certbot certificates
```

**If SSL is configured, test HTTPS:**

```bash
curl -I https://wissenpublicationgroup.com
```

**If SSL not configured yet, you need to install it:**

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d wissenpublicationgroup.com -d www.wissenpublicationgroup.com
```

---

**Run the diagnostic script above first!** 🔍
