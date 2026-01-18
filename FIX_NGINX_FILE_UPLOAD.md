# Fix for 413 Request Entity Too Large Error

## Problem
When uploading PDFs, you're getting:
```
POST http://54.165.116.208/api/articles/6/upload-pdf 413 (Request Entity Too Large)
```

This happens because Nginx has a default `client_max_body_size` limit of **1MB**, which is too small for PDF uploads.

## Solution

### Quick Fix - Run This Command

Copy and paste this entire command block into your **EC2 browser terminal**:

```bash
sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name 54.165.116.208;

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
sudo nginx -t && sudo systemctl reload nginx && echo "✅ Nginx updated - file upload limit increased to 50MB"
```

### What This Does

1. **Increases file upload limit**: `client_max_body_size 50M` allows uploads up to 50MB
2. **Increases timeouts**: 300 seconds for large file uploads
3. **Adds proper proxy headers**: Better handling of requests
4. **Reloads Nginx**: Applies changes without downtime

### Verify the Fix

After running the command:

1. **Check Nginx status**: `sudo systemctl status nginx`
2. **Test upload**: Try uploading a PDF again
3. **Check logs** (if needed): `sudo tail -f /var/log/nginx/error.log`

### File Size Limits

- **Current limit**: 50MB (good for most PDFs)
- **If you need larger**: Change `50M` to `100M` or `200M` in the config
- **Maximum recommended**: 100MB for most use cases

### After Fix

You should now be able to upload PDFs without the 413 error! 🎉

---

## Alternative: One-Line Fix

If you prefer a one-liner:

```bash
sudo sed -i '/server_name 54.165.116.208;/a\    client_max_body_size 50M;\n    proxy_read_timeout 300s;\n    proxy_connect_timeout 300s;\n    proxy_send_timeout 300s;' /etc/nginx/sites-available/wissen-publication-group && sudo nginx -t && sudo systemctl reload nginx && echo "✅ Fixed!"
```

But the full config replacement above is recommended for better results.

