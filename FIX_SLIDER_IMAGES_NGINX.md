# 🔧 Fix Slider Images ERR_CONTENT_LENGTH_MISMATCH

## Problem
Slider images sometimes fail to load with `ERR_CONTENT_LENGTH_MISMATCH` error in production. This typically happens when:
- Nginx compresses image files (which shouldn't be compressed)
- Proxy buffering issues cause header mismatches
- Network interruptions during image transfer

## Solution: Update Nginx Configuration

Add proper handling for `/images` static files to disable compression and set correct headers.

**Run this command on your EC2 instance:**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Updating Nginx configuration for image files ===" && \
sudo tee -a /etc/nginx/sites-available/wissen-publication-group > /dev/null <<'NGINXEOF'

    # Static images - disable compression and set proper headers
    location ~* ^/images/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Disable compression for images
        gzip off;
        proxy_set_header Accept-Encoding "";
        
        # Set proper cache headers
        proxy_cache_valid 200 1d;
        add_header Cache-Control "public, max-age=86400";
        
        # Disable buffering for images to prevent Content-Length mismatch
        proxy_buffering off;
        proxy_request_buffering off;
        
        # Increase timeouts for large images
        proxy_read_timeout 60s;
        proxy_connect_timeout 10s;
    }
NGINXEOF

echo "✅ Configuration added" && \
echo "" && \
echo "=== Testing Nginx configuration ===" && \
sudo nginx -t && \
echo "" && \
echo "=== Reloading Nginx ===" && \
sudo systemctl reload nginx && \
echo "✅ Nginx reloaded successfully!"
```

## Alternative: Complete Nginx Config Update

If the above doesn't work, replace the entire frontend server block:

```bash
cd /var/www/wissen-publication-group && \
sudo cp /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-available/wissen-publication-group.backup.$(date +%Y%m%d_%H%M%S) && \
sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null <<'NGINXEOF'
server {
    listen 80;
    server_name _;

    # Increase timeouts
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    client_max_body_size 50M;

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

    # Static images - CRITICAL: Must be before /_next/static
    location ~* ^/images/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Disable compression for images (prevents ERR_CONTENT_LENGTH_MISMATCH)
        gzip off;
        proxy_set_header Accept-Encoding "";
        
        # Disable buffering to prevent Content-Length mismatch
        proxy_buffering off;
        proxy_request_buffering off;
        
        # Cache headers
        proxy_cache_valid 200 1d;
        add_header Cache-Control "public, max-age=86400";
        
        # Timeouts
        proxy_read_timeout 60s;
        proxy_connect_timeout 10s;
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
        
        # Disable compression for optimized images too
        gzip off;
        proxy_set_header Accept-Encoding "";
        proxy_buffering off;
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
echo "=== Testing Nginx configuration ===" && \
sudo nginx -t && \
echo "" && \
echo "=== Reloading Nginx ===" && \
sudo systemctl reload nginx && \
echo "✅ Nginx reloaded successfully!"
```

## Verify Fix

After applying the fix, test the images:

```bash
# Test image loading
curl -I http://localhost/images/sliders/slider%201.jpg.jpeg

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check if images are being served correctly
curl -v http://localhost/images/sliders/slider%201.jpg.jpeg 2>&1 | grep -i "content-length\|content-type"
```

## What This Fixes

1. **Disables compression** (`gzip off`) - Images shouldn't be compressed, and compression can cause Content-Length mismatches
2. **Disables buffering** (`proxy_buffering off`) - Prevents nginx from buffering the response, which can cause header mismatches
3. **Proper ordering** - `/images/` location block must come before `/_next/static` to ensure correct routing
4. **Cache headers** - Sets appropriate cache headers for images

## Frontend Changes

The frontend component has been updated with:
- **Improved URL encoding**: Properly encodes each path segment separately to handle spaces in filenames (e.g., "slider 1.jpg.jpeg" → "/images/sliders/slider%201.jpg.jpeg")
- **Enhanced retry logic**: Up to 3 retries with progressive delays (2s, 4s, 6s for Content-Length errors)
- **Better error detection**: Specifically detects `ERR_CONTENT_LENGTH_MISMATCH` errors and applies longer retry delays
- **Multiple cache-busting strategies**: Uses different query parameter formats on each retry attempt
- **Fallback to placeholder**: Shows a placeholder image if all retries fail

## Deploy

After updating nginx config, rebuild and restart:

```bash
cd /var/www/wissen-publication-group/frontend && \
npm run build && \
pm2 restart wissen-frontend && \
sudo systemctl reload nginx
```
