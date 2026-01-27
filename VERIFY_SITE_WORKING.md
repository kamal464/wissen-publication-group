# ✅ Verify Site is Working

## Domain test shows HTTP 200! Let's verify everything.

---

## Complete Verification

**Copy and paste this:**

```bash
# 1. Test domain directly
echo "=== Testing Domain (HTTPS) ==="
curl -I https://wissenpublicationgroup.com 2>&1 | head -10
echo ""

# 2. Test domain (HTTP)
echo "=== Testing Domain (HTTP) ==="
curl -I http://wissenpublicationgroup.com 2>&1 | head -10
echo ""

# 3. Test API endpoint
echo "=== Testing API ==="
curl -s https://wissenpublicationgroup.com/api/health && echo "" || echo "API failed"
echo ""

# 4. Test frontend page
echo "=== Testing Frontend ==="
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" https://wissenpublicationgroup.com
echo ""

# 5. Check SSL certificate
echo "=== SSL Certificate Status ==="
sudo certbot certificates 2>/dev/null | grep -A 5 "wissenpublicationgroup" || echo "No SSL certificate found"
echo ""

# 6. Check nginx config for SSL
echo "=== Nginx SSL Configuration ==="
sudo grep -E "(listen|ssl_certificate)" /etc/nginx/sites-available/wissen-publication-group | head -5
echo ""

# 7. Final status check
echo "=== Final Status ==="
pm2 list
echo ""
echo "✅ If all tests above show HTTP 200, your site is WORKING!"
echo "   The 404 on localhost is normal - nginx only responds to the domain name."
```

---

## If Site is Still Down in Browser

**Check these:**

1. **DNS Propagation** - Domain might not be pointing to your server yet
   ```bash
   # Check what IP your domain points to
   dig wissenpublicationgroup.com +short
   # Should match your EC2 instance IP
   ```

2. **Firewall/Security Groups** - Make sure ports 80 and 443 are open
   ```bash
   # Check if nginx is listening on all interfaces
   sudo ss -tlnp | grep -E ':(80|443)'
   ```

3. **Browser Cache** - Clear your browser cache or try incognito mode

4. **Check actual website**
   ```bash
   # Test from server
   curl -I https://wissenpublicationgroup.com
   curl -I http://wissenpublicationgroup.com
   ```

---

**Run the verification script above!** 🔍
