# 🔧 Fix Domain, SSL & CORS Issues

## Problem
- Domain `https://wissenpublicationgroup.com` not loading
- Only IP `http://3.85.82.78` works
- Need SSL certificate
- CORS needs to work for domain

## Step 1: Verify DNS is Pointing Correctly

```bash
# Check DNS
nslookup wissenpublicationgroup.com
dig wissenpublicationgroup.com +short

# Should return: 3.85.82.78
```

## Step 2: Update Nginx Server Name

**On server:**

```bash
sudo nano /etc/nginx/sites-available/wissen-publication-group
```

**Change `server_name` to:**

```nginx
server_name wissenpublicationgroup.com www.wissenpublicationgroup.com;
```

**Save and test:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Step 3: Install SSL Certificate

```bash
# Install certbot if not installed
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d wissenpublicationgroup.com -d www.wissenpublicationgroup.com
```

**When prompted:**
- Email: your email
- Terms: Type `A`
- Share email: `Y` or `N`
- Redirect HTTP to HTTPS: Type `2` (recommended)

## Step 4: Update CORS for HTTPS Domain

```bash
cd /var/www/wissen-publication-group/backend
nano .env
```

**Set CORS_ORIGIN to (remove duplicates, keep only one):**

```env
CORS_ORIGIN=https://wissenpublicationgroup.com,https://www.wissenpublicationgroup.com,http://3.85.82.78,http://localhost:3000,http://localhost:3002
```

**Save and restart:**

```bash
pm2 restart wissen-backend --update-env
pm2 logs wissen-backend --lines 10 | grep -i "CORS enabled"
```

## Step 5: Verify SSL Certificate

```bash
# Check certificate
sudo certbot certificates

# Test HTTPS
curl -I https://wissenpublicationgroup.com
curl -I https://www.wissenpublicationgroup.com
```

## Step 6: Test Admin Login

Open in browser:
- `https://wissenpublicationgroup.com/admin/login`
- Login: `admin` / `Bharath@321`

## Troubleshooting

### "Domain not accessible"
- Wait for DNS propagation (can take 5-30 min)
- Check DNS: `nslookup wissenpublicationgroup.com`
- Verify Nginx server_name matches domain

### "Certbot can't verify"
- Make sure DNS points to `3.85.82.78`
- Check port 80 is open: `sudo ufw status`
- Verify Nginx is running: `sudo systemctl status nginx`

### "CORS still failing"
- Check exact origin in browser console (F12 → Network → Request Headers)
- Add that exact origin to CORS_ORIGIN
- Restart: `pm2 restart wissen-backend --update-env`

---

**Run these commands on your server to fix everything!** 🔒
