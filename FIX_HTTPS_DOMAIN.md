# 🔧 Fix HTTPS Domain - Site Works on IP but Not Domain

## **PROBLEM**
Site works on `http://54.165.116.208` but not on `https://wissenpublicationgroup.com`

## **DIAGNOSTIC**

First, check the current configuration:

```bash
echo "=== DIAGNOSTIC ===" && \
echo "1. Check DNS:" && \
nslookup wissenpublicationgroup.com && \
echo "" && \
echo "2. Check Nginx SSL config:" && \
sudo ls -la /etc/nginx/sites-enabled/ && \
echo "" && \
echo "3. Check if SSL certificate exists:" && \
sudo ls -la /etc/letsencrypt/live/wissenpublicationgroup.com/ 2>/dev/null || echo "No SSL certificate found" && \
echo "" && \
echo "4. Check current Nginx config:" && \
sudo cat /etc/nginx/sites-available/wissen-publication-group | grep -E "server_name|listen|ssl" && \
echo "" && \
echo "5. Test HTTP (port 80):" && \
curl -I http://wissenpublicationgroup.com 2>&1 | head -5 && \
echo "" && \
echo "6. Test HTTPS (port 443):" && \
curl -I https://wissenpublicationgroup.com 2>&1 | head -5
```

---

## **FIX 1: Configure HTTP to HTTPS Redirect**

If SSL is not configured, at least set up HTTP to work and redirect to HTTPS:

```bash
cd /var/www/wissen-publication-group && \
echo "=== FIXING NGINX FOR DOMAIN ===" && \
sudo cp /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-available/wissen-publication-group.backup.domain.$(date +%Y%m%d_%H%M%S) && \
sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null << 'NGINXEOF'
# HTTP Server - Redirect to HTTPS if SSL exists, otherwise serve HTTP
server {
    listen 80;
    server_name wissenpublicationgroup.com www.wissenpublicationgroup.com 54.165.116.208;

    # If SSL certificate exists, redirect to HTTPS
    # If not, serve HTTP (comment out the redirect line below)
    # return 301 https://$server_name$request_uri;

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

    # Next.js static files - Use regex for better matching
    location ~ ^/_next/static {
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
    location ~ ^/_next/image {
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

echo "✅ Config updated" && \
sudo nginx -t && \
sudo systemctl reload nginx && \
echo "✅ Nginx reloaded"
```

---

## **FIX 2: If SSL Certificate Exists, Configure HTTPS**

If you have an SSL certificate, configure HTTPS:

```bash
cd /var/www/wissen-publication-group && \
echo "=== CONFIGURING HTTPS ===" && \
sudo cp /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-available/wissen-publication-group.backup.https.$(date +%Y%m%d_%H%M%S) && \
sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null << 'NGINXEOF'
# HTTP Server - Redirect to HTTPS
server {
    listen 80;
    server_name wissenpublicationgroup.com www.wissenpublicationgroup.com 54.165.116.208;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name wissenpublicationgroup.com www.wissenpublicationgroup.com;

    # SSL Configuration (update paths if different)
    ssl_certificate /etc/letsencrypt/live/wissenpublicationgroup.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wissenpublicationgroup.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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

    # Next.js static files
    location ~ ^/_next/static {
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
    location ~ ^/_next/image {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend (catch-all)
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

echo "✅ HTTPS config applied" && \
sudo nginx -t && \
sudo systemctl reload nginx && \
echo "✅ Nginx reloaded"
```

---

## **FIX 3: Install SSL Certificate (If Not Installed)**

If you don't have SSL, install Let's Encrypt:

```bash
echo "=== INSTALLING SSL CERTIFICATE ===" && \
sudo apt update && \
sudo apt install -y certbot python3-certbot-nginx && \
echo "" && \
echo "=== Obtaining SSL Certificate ===" && \
sudo certbot --nginx -d wissenpublicationgroup.com -d www.wissenpublicationgroup.com --non-interactive --agree-tos --email your-email@example.com || \
echo "⚠️ SSL installation failed. Check DNS and try again." && \
echo "" && \
echo "=== Reloading Nginx ===" && \
sudo systemctl reload nginx
```

---

## **VERIFY FIX**

```bash
echo "=== VERIFICATION ===" && \
echo "1. Test HTTP:" && \
curl -I http://wissenpublicationgroup.com 2>&1 | head -5 && \
echo "" && \
echo "2. Test HTTPS:" && \
curl -I https://wissenpublicationgroup.com 2>&1 | head -5 && \
echo "" && \
echo "3. Check Nginx status:" && \
sudo systemctl status nginx --no-pager | head -5 && \
echo "" && \
echo "4. Check DNS:" && \
dig +short wissenpublicationgroup.com
```

---

**Run the DIAGNOSTIC first, then apply FIX 1 (HTTP) or FIX 2 (HTTPS) based on whether you have SSL!** 🚀
