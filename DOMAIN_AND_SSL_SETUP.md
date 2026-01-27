# 🌐 Domain Mapping & SSL Certificate Setup

## Step 1: Update DNS Records

### If Using AWS Route53:

1. **Go to Route53 Console:**
   - https://console.aws.amazon.com/route53/
   - Click **"Hosted zones"**
   - Select your domain: `wissenpublicationgroup.com`

2. **Update/Create A Records:**
   - Click **"Create record"** or edit existing
   - **Record name:** Leave blank (for root) or `www`
   - **Record type:** `A`
   - **Value:** `3.85.82.78`
   - **TTL:** `300` (or default)
   - Click **"Create records"**

   **Create TWO records:**
   - One for root: `wissenpublicationgroup.com` → `3.85.82.78`
   - One for www: `www.wissenpublicationgroup.com` → `3.85.82.78`

### If Using Other DNS Provider:

1. **Log into your DNS provider** (GoDaddy, Namecheap, Cloudflare, etc.)
2. **Find DNS Management / DNS Records**
3. **Update/Create A Records:**

   ```
   Type: A
   Name: @ (or leave blank for root)
   Value: 3.85.82.78
   TTL: 300

   Type: A
   Name: www
   Value: 3.85.82.78
   TTL: 300
   ```

4. **Save changes**

### Verify DNS Propagation:

```bash
# Check if DNS is pointing to new IP
nslookup wissenpublicationgroup.com
nslookup www.wissenpublicationgroup.com

# Or use dig
dig wissenpublicationgroup.com +short
dig www.wissenpublicationgroup.com +short
```

**Wait 5-30 minutes** for DNS to propagate before proceeding to SSL.

---

## Step 2: Update Nginx Server Name

**On your server (SSH in):**

```bash
sudo nano /etc/nginx/sites-available/wissen-publication-group
```

**Change the `server_name` line** from:

```nginx
server_name _;
```

**To:**

```nginx
server_name wissenpublicationgroup.com www.wissenpublicationgroup.com;
```

**Save and test:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 3: Install SSL Certificate (Let's Encrypt)

### Prerequisites Check:

```bash
# Verify domain is pointing to your server
curl -I http://wissenpublicationgroup.com
curl -I http://www.wissenpublicationgroup.com

# Should return 200 OK from your Nginx
```

### Install Certbot:

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain SSL Certificate:

```bash
sudo certbot --nginx -d wissenpublicationgroup.com -d www.wissenpublicationgroup.com
```

**During setup, you'll be asked:**

1. **Email address:** Enter your email (for renewal notices)
2. **Terms of Service:** Type `A` to agree
3. **Share email with EFF:** Type `Y` or `N` (your choice)
4. **Redirect HTTP to HTTPS:** Type `2` to redirect (recommended)

Certbot will:
- ✅ Obtain certificate from Let's Encrypt
- ✅ Update Nginx config automatically
- ✅ Set up auto-renewal

### Verify Certificate:

```bash
# Check certificate status
sudo certbot certificates

# Test auto-renewal (dry run)
sudo certbot renew --dry-run
```

### Test HTTPS:

Open in browser:
- `https://wissenpublicationgroup.com`
- `https://www.wissenpublicationgroup.com`

---

## Step 4: Update CORS in Backend (If Needed)

If you still see CORS errors, update backend `.env`:

```bash
cd /var/www/wissen-publication-group/backend
nano .env
```

**Update CORS_ORIGIN to include new domain:**

```env
CORS_ORIGIN=https://wissenpublicationgroup.com,https://www.wissenpublicationgroup.com,http://3.85.82.78,http://localhost:3000,http://localhost:3002
```

**Restart backend:**

```bash
pm2 restart wissen-backend
```

---

## Step 5: Verify Everything Works

### Test Endpoints:

```bash
# HTTP should redirect to HTTPS
curl -I http://wissenpublicationgroup.com

# HTTPS should work
curl -I https://wissenpublicationgroup.com

# API should work
curl https://wissenpublicationgroup.com/api/journals

# Health check
curl https://wissenpublicationgroup.com/health
```

### Test in Browser:

1. ✅ `https://wissenpublicationgroup.com` - Should load
2. ✅ `https://www.wissenpublicationgroup.com` - Should load
3. ✅ `https://wissenpublicationgroup.com/admin` - Should show login
4. ✅ Login with: `admin` / `Bharath@321`

---

## Troubleshooting

### "Domain not pointing to server"
- Wait longer for DNS propagation (can take up to 48 hours, usually 5-30 min)
- Check DNS with: `nslookup wissenpublicationgroup.com`
- Verify it returns: `3.85.82.78`

### "Certbot can't verify domain"
- Make sure DNS is propagated
- Check Nginx is accessible on port 80
- Verify firewall allows port 80 and 443

### "CORS errors persist"
- Update `CORS_ORIGIN` in backend `.env`
- Restart backend: `pm2 restart wissen-backend`
- Check browser console for exact error

### "SSL certificate expired"
- Auto-renewal should handle this
- Manual renewal: `sudo certbot renew`
- Check renewal status: `sudo certbot certificates`

---

## Quick Commands Summary

```bash
# 1. Update Nginx server_name
sudo nano /etc/nginx/sites-available/wissen-publication-group
# Change: server_name wissenpublicationgroup.com www.wissenpublicationgroup.com;
sudo nginx -t && sudo systemctl reload nginx

# 2. Install certbot
sudo apt install -y certbot python3-certbot-nginx

# 3. Get SSL certificate
sudo certbot --nginx -d wissenpublicationgroup.com -d www.wissenpublicationgroup.com

# 4. Update CORS (if needed)
cd /var/www/wissen-publication-group/backend
nano .env
# Update CORS_ORIGIN
pm2 restart wissen-backend

# 5. Verify
curl -I https://wissenpublicationgroup.com
```

---

**After DNS propagates, run the certbot command to get SSL!** 🔒
