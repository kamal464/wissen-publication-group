# Map GoDaddy Domain to EC2 Instance

## Current Setup
- **EC2 IP:** `54.165.116.208`
- **Current Access:** http://54.165.116.208

---

## Step 1: Configure DNS in GoDaddy

### 1.1 Log in to GoDaddy
1. Go to: https://www.godaddy.com
2. Sign in to your account
3. Go to **My Products** → **Domains**
4. Click on your domain name
5. Click **DNS** or **Manage DNS**

### 1.2 Add/Update DNS Records

You need to add an **A Record** pointing to your EC2 IP:

**A Record:**
- **Type:** A
- **Name:** `@` (or leave blank for root domain) OR `www` (for www subdomain)
- **Value:** `54.165.116.208`
- **TTL:** 600 (or default)

**For both root and www, add two records:**

1. **Root domain (example.com):**
   - Type: A
   - Name: `@` (or blank)
   - Value: `54.165.116.208`
   - TTL: 600

2. **WWW subdomain (www.example.com):**
   - Type: A
   - Name: `www`
   - Value: `54.165.116.208`
   - TTL: 600

**Save the changes.**

---

## Step 2: Update Nginx Configuration on EC2

After DNS is configured, update Nginx to handle your domain.

### 2.1 Update Nginx Config

Run this on your EC2 instance (replace `yourdomain.com` with your actual domain):

```bash
sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com 54.165.116.208;

    # Allow large file uploads (PDFs, etc.)
    client_max_body_size 50M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;

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

sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx updated"
```

**Important:** Replace `yourdomain.com` with your actual domain name!

---

## Step 3: Update Frontend Environment

Update the frontend to use your domain:

```bash
cd /var/www/wissen-publication-group
echo "NEXT_PUBLIC_API_URL=http://yourdomain.com/api" > frontend/.env.production
# Or for HTTPS (after SSL setup):
# echo "NEXT_PUBLIC_API_URL=https://yourdomain.com/api" > frontend/.env.production

cd frontend
npm run build
cd /var/www/wissen-publication-group
pm2 restart wissen-frontend
echo "✅ Frontend updated"
```

**Replace `yourdomain.com` with your actual domain!**

---

## Step 4: Update Backend CORS

Update backend CORS to allow your domain:

```bash
cd /var/www/wissen-publication-group/backend
nano .env
```

Update the `CORS_ORIGIN` line:
```env
CORS_ORIGIN=http://yourdomain.com,http://www.yourdomain.com,http://54.165.116.208,http://localhost:3000,http://localhost:3002
```

Save: `Ctrl+X`, `Y`, `Enter`

Then restart backend:
```bash
cd /var/www/wissen-publication-group
pm2 restart wissen-backend
```

---

## Step 5: Wait for DNS Propagation

DNS changes can take **15 minutes to 48 hours** to propagate. Usually it's within 1-2 hours.

**Check DNS propagation:**
```bash
# From your local computer or EC2
nslookup yourdomain.com
# or
dig yourdomain.com
```

You should see `54.165.116.208` in the response.

---

## Step 6: Test Your Domain

Once DNS propagates:
1. Visit: `http://yourdomain.com`
2. It should load your application
3. Test API: `http://yourdomain.com/api/health`

---

## Step 7: Setup SSL/HTTPS (Optional but Recommended)

After domain is working, set up SSL with Let's Encrypt:

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

After SSL setup, update frontend to use HTTPS:
```bash
cd /var/www/wissen-publication-group
echo "NEXT_PUBLIC_API_URL=https://yourdomain.com/api" > frontend/.env.production
cd frontend
npm run build
cd /var/www/wissen-publication-group
pm2 restart wissen-frontend
```

---

## Quick Setup Script

Replace `yourdomain.com` with your actual domain and run:

```bash
DOMAIN="yourdomain.com"
IP="54.165.116.208"

# Update Nginx
sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN $IP;

    client_max_body_size 50M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXEOF

sudo nginx -t && sudo systemctl reload nginx

# Update frontend
cd /var/www/wissen-publication-group
echo "NEXT_PUBLIC_API_URL=http://$DOMAIN/api" > frontend/.env.production
cd frontend
npm run build
cd /var/www/wissen-publication-group
pm2 restart wissen-frontend

# Update backend CORS
cd backend
sed -i "s|^CORS_ORIGIN=.*|CORS_ORIGIN=http://$DOMAIN,http://www.$DOMAIN,http://$IP,http://localhost:3000,http://localhost:3002|" .env
cd /var/www/wissen-publication-group
pm2 restart wissen-backend

echo "✅ Domain configuration complete!"
echo "🌐 Visit: http://$DOMAIN"
echo ""
echo "⚠️  Don't forget to:"
echo "1. Add A records in GoDaddy DNS pointing to $IP"
echo "2. Wait for DNS propagation (15 min - 48 hours)"
echo "3. Setup SSL with: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
```

---

## Troubleshooting

### Domain not resolving?
- Check DNS propagation: `nslookup yourdomain.com`
- Verify A records in GoDaddy DNS settings
- Wait longer (up to 48 hours)

### 502 Bad Gateway?
- Check if services are running: `pm2 status`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify Nginx config: `sudo nginx -t`

### CORS errors?
- Update `CORS_ORIGIN` in `backend/.env` to include your domain
- Restart backend: `pm2 restart wissen-backend`

---

## Summary

1. ✅ Add A records in GoDaddy DNS → `54.165.116.208`
2. ✅ Update Nginx config with your domain
3. ✅ Update frontend `.env.production` with domain
4. ✅ Update backend CORS with domain
5. ✅ Wait for DNS propagation
6. ✅ Test: `http://yourdomain.com`
7. ✅ (Optional) Setup SSL with Certbot

What's your domain name? I can help you customize the commands!

