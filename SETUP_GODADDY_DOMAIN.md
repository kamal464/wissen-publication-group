# Setup GoDaddy Domain: wissenpublicationgroup.com

## Step 1: Configure DNS in GoDaddy

### 1.1 Log in to GoDaddy
1. Go to: https://www.godaddy.com
2. Sign in to your account
3. Go to **My Products** → **Domains**
4. Find and click on **wissenpublicationgroup.com**
5. Click **DNS** or **Manage DNS**

### 1.2 Add A Records

Add **TWO A Records**:

**Record 1 - Root Domain:**
- **Type:** A
- **Name:** `@` (or leave blank)
- **Value:** `54.165.116.208`
- **TTL:** 600 (or default)

**Record 2 - WWW Subdomain:**
- **Type:** A
- **Name:** `www`
- **Value:** `54.165.116.208`
- **TTL:** 600 (or default)

**Click Save** after adding both records.

---

## Step 2: Update EC2 Configuration

After adding DNS records in GoDaddy, run these commands on your EC2 instance:

```bash
cd /var/www/wissen-publication-group

# Update Nginx with your domain
sudo bash -c 'cat > /etc/nginx/sites-available/wissen-publication-group << "NGINXCONF"
server {
    listen 80;
    server_name wissenpublicationgroup.com www.wissenpublicationgroup.com 54.165.116.208;
    client_max_body_size 50M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    location = /api/health {
        proxy_pass http://localhost:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection '"'"'upgrade'"'"';
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
        proxy_set_header Connection '"'"'upgrade'"'"';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXCONF'

# Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# Update frontend environment
echo "NEXT_PUBLIC_API_URL=http://wissenpublicationgroup.com/api" > frontend/.env.production

# Rebuild frontend
cd frontend
npm run build
cd ..

# Restart frontend
pm2 restart wissen-frontend --update-env

# Update backend CORS
cd backend
sed -i 's|^CORS_ORIGIN=.*|CORS_ORIGIN=http://wissenpublicationgroup.com,http://www.wissenpublicationgroup.com,http://54.165.116.208,http://localhost:3000,http://localhost:3002|' .env
cd ..

# Restart backend
pm2 restart wissen-backend --update-env

# Save PM2 config
pm2 save

echo "✅ Domain configuration complete!"
echo "🌐 Your site will be available at: http://wissenpublicationgroup.com"
echo "⏳ Wait 15 minutes to 2 hours for DNS to propagate"
```

---

## Step 3: Wait for DNS Propagation

DNS changes can take **15 minutes to 48 hours** to propagate globally. Usually it's within 1-2 hours.

**Check if DNS is working:**
```bash
# From your local computer
nslookup wissenpublicationgroup.com
# or
dig wissenpublicationgroup.com
```

You should see `54.165.116.208` in the response.

---

## Step 4: Setup SSL/HTTPS (Recommended)

After your domain is working, set up SSL with Let's Encrypt:

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d wissenpublicationgroup.com -d www.wissenpublicationgroup.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended: Yes)
```

After SSL setup, update frontend to use HTTPS:
```bash
cd /var/www/wissen-publication-group
echo "NEXT_PUBLIC_API_URL=https://wissenpublicationgroup.com/api" > frontend/.env.production
cd frontend
npm run build
cd ..
pm2 restart wissen-frontend --update-env
```

---

## Summary

1. ✅ Add A records in GoDaddy DNS → `54.165.116.208`
2. ✅ Update Nginx config with domain
3. ✅ Update frontend `.env.production`
4. ✅ Update backend CORS
5. ✅ Wait for DNS propagation (15 min - 2 hours)
6. ✅ Test: `http://wissenpublicationgroup.com`
7. ✅ (Optional) Setup SSL with Certbot

