# 🔧 Troubleshooting Guide - Wissen Publication Group

**Server IP:** `54.165.116.208`  
**Domain:** `wissenpublicationgroup.com`  
**Instance ID:** `i-016ab2b939f5f7a3b`  
**Region:** `us-east-1`

---

## 🚨 Quick Status Check

Run this first to see what's wrong:

```bash
cd /var/www/wissen-publication-group && \
echo "==========================================" && \
echo "🔍 QUICK STATUS CHECK" && \
echo "==========================================" && \
echo "" && \
echo "1. PM2 Services:" && \
pm2 list 2>/dev/null || echo "PM2 not in PATH - check processes manually" && \
echo "" && \
echo "2. Port Status:" && \
sudo ss -tlnp | grep -E ":3000|:3001|:80|:443" && \
echo "" && \
echo "3. Backend Test:" && \
curl -s http://localhost:3001/health && echo "" || echo "❌ Backend not responding" && \
echo "" && \
echo "4. Frontend Test:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 || echo "❌ Frontend not responding" && \
echo "" && \
echo "5. Nginx Test:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost/api/health || echo "❌ Nginx not responding" && \
echo "" && \
echo "6. Nginx Status:" && \
sudo systemctl status nginx --no-pager | head -3 && \
echo "" && \
echo "7. Running Processes:" && \
ps aux | grep -E "node.*3000|node.*3001" | grep -v grep
```

---

## 🔄 Service Restart Commands

### Restart All Services

```bash
cd /var/www/wissen-publication-group && \
echo "Restarting all services..." && \
pm2 delete all 2>/dev/null || true && \
sleep 3 && \
pm2 start ecosystem.config.js --update-env && \
pm2 save && \
sleep 15 && \
pm2 list && \
echo "" && \
echo "Testing services..." && \
curl -s http://localhost:3001/health && echo "" && \
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000
```

### Restart Backend Only

```bash
cd /var/www/wissen-publication-group && \
pm2 restart wissen-backend --update-env && \
sleep 5 && \
curl -s http://localhost:3001/health && echo ""
```

### Restart Frontend Only

```bash
cd /var/www/wissen-publication-group && \
pm2 restart wissen-frontend --update-env && \
sleep 10 && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000
```

---

## ⚠️ Common Issues and Fixes

### Issue 1: Port Already in Use (EADDRINUSE)

**Symptoms:**
- Error: `EADDRINUSE: address already in use :::3000`
- Services keep restarting
- PM2 shows high restart count

**Fix:**

```bash
cd /var/www/wissen-publication-group && \
echo "Fixing port conflicts..." && \
echo "" && \
echo "1. Finding processes on ports 3000 and 3001..." && \
sudo lsof -ti:3000 && \
sudo lsof -ti:3001 && \
echo "" && \
echo "2. Killing processes on ports..." && \
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true && \
sudo lsof -ti:3001 | xargs sudo kill -9 2>/dev/null || true && \
pkill -9 -f "next-server" 2>/dev/null || true && \
sleep 3 && \
echo "" && \
echo "3. Verifying ports are free..." && \
sudo ss -tlnp | grep -E ":3000|:3001" || echo "✅ Ports are free" && \
echo "" && \
echo "4. Restarting services..." && \
pm2 delete all 2>/dev/null || true && \
sleep 2 && \
cd backend && \
pm2 start dist/src/main.js --name wissen-backend --update-env && \
sleep 5 && \
cd ../frontend && \
pm2 start npm --name wissen-frontend -- start --update-env && \
sleep 20 && \
cd .. && \
pm2 save && \
pm2 list
```

---

### Issue 2: Services Not Starting

**Symptoms:**
- PM2 shows status as "errored" or "stopped"
- No response on ports 3000/3001

**Fix:**

```bash
cd /var/www/wissen-publication-group && \
echo "Diagnosing service startup issues..." && \
echo "" && \
echo "1. Checking build files..." && \
[ -f backend/dist/src/main.js ] && echo "✅ Backend build exists" || echo "❌ Backend build missing - need to rebuild" && \
[ -d frontend/.next ] && echo "✅ Frontend build exists" || echo "❌ Frontend build missing - need to rebuild" && \
echo "" && \
echo "2. Checking .env files..." && \
[ -f backend/.env ] && echo "✅ Backend .env exists" || echo "❌ Backend .env missing" && \
echo "" && \
echo "3. Checking PM2 logs..." && \
pm2 logs wissen-backend --lines 20 --nostream 2>/dev/null | tail -10 && \
echo "" && \
pm2 logs wissen-frontend --lines 20 --nostream 2>/dev/null | tail -10 && \
echo "" && \
echo "4. If builds are missing, rebuild:" && \
echo "   cd backend && npm run build" && \
echo "   cd ../frontend && npm run build"
```

---

### Issue 3: Frontend Timeout (HTTP 408)

**Symptoms:**
- Frontend returns HTTP 408
- Nginx logs show "upstream timed out"
- Frontend process exists but not responding

**Fix:**

```bash
cd /var/www/wissen-publication-group && \
echo "Fixing frontend timeout..." && \
echo "" && \
echo "1. Stopping frontend..." && \
pm2 delete wissen-frontend 2>/dev/null || true && \
sleep 3 && \
echo "" && \
echo "2. Killing any processes on port 3000..." && \
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true && \
pkill -9 -f "next-server" 2>/dev/null || true && \
sleep 2 && \
echo "" && \
echo "3. Starting frontend fresh..." && \
cd frontend && \
pm2 start npm --name wissen-frontend -- start --update-env && \
echo "" && \
echo "4. Waiting 30 seconds for frontend to initialize..." && \
sleep 30 && \
echo "" && \
echo "5. Testing frontend..." && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 && \
cd .. && \
pm2 save
```

---

### Issue 4: Backend Health Endpoint 404

**Symptoms:**
- `/api/health` returns 404
- Backend is running but health check fails

**Fix:**

```bash
cd /var/www/wissen-publication-group && \
echo "Fixing backend health endpoint..." && \
echo "" && \
echo "1. Testing correct endpoint..." && \
curl -s http://localhost:3001/health && echo "" || echo "Backend not responding" && \
echo "" && \
echo "2. Updating Nginx health check..." && \
sudo bash -c 'cat > /etc/nginx/sites-available/wissen-publication-group << "NGINXCONF"
server {
    listen 80;
    listen [::]:80;
    server_name wissenpublicationgroup.com www.wissenpublicationgroup.com 54.165.116.208;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name wissenpublicationgroup.com www.wissenpublicationgroup.com 54.165.116.208;
    
    client_max_body_size 50M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    
    ssl_certificate /etc/letsencrypt/live/wissenpublicationgroup.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wissenpublicationgroup.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    location = /api/health {
        proxy_pass http://localhost:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        access_log off;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
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
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXCONF' && \
sudo nginx -t && \
sudo systemctl reload nginx && \
echo "✅ Nginx updated"
```

---

### Issue 5: Website Not Loading (502/504 Errors)

**Symptoms:**
- Website shows 502 Bad Gateway or 504 Gateway Timeout
- Domain doesn't load

**Fix:**

```bash
cd /var/www/wissen-publication-group && \
echo "Fixing website loading issues..." && \
echo "" && \
echo "1. Complete service restart..." && \
pm2 delete all 2>/dev/null || true && \
sleep 3 && \
echo "" && \
echo "2. Clearing port conflicts..." && \
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true && \
sudo lsof -ti:3001 | xargs sudo kill -9 2>/dev/null || true && \
pkill -9 -f "next-server" 2>/dev/null || true && \
sleep 3 && \
echo "" && \
echo "3. Starting backend..." && \
cd backend && \
pm2 start dist/src/main.js --name wissen-backend --update-env && \
sleep 8 && \
echo "Backend test:" && \
curl -s http://localhost:3001/health && echo "" && \
echo "" && \
echo "4. Starting frontend..." && \
cd ../frontend && \
pm2 start npm --name wissen-frontend -- start --update-env && \
sleep 25 && \
echo "Frontend test:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 && \
echo "" && \
cd .. && \
pm2 save && \
echo "" && \
echo "5. Reloading Nginx..." && \
sudo nginx -t && \
sudo systemctl reload nginx && \
echo "" && \
echo "6. Final test via Nginx..." && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost/api/health && \
echo "" && \
echo "✅ Services restarted!"
```

---

### Issue 6: Build Files Missing

**Symptoms:**
- Services fail to start
- Error: "Cannot find module" or "File not found"

**Fix:**

```bash
cd /var/www/wissen-publication-group && \
echo "Rebuilding application..." && \
echo "" && \
echo "1. Rebuilding backend..." && \
cd backend && \
npm install --unsafe-perm && \
npm run build && \
echo "✅ Backend rebuilt" && \
cd .. && \
echo "" && \
echo "2. Rebuilding frontend..." && \
cd frontend && \
npm install && \
npm run build && \
echo "✅ Frontend rebuilt" && \
cd .. && \
echo "" && \
echo "3. Restarting services..." && \
pm2 delete all 2>/dev/null || true && \
sleep 2 && \
pm2 start ecosystem.config.js --update-env && \
pm2 save && \
sleep 15 && \
pm2 list
```

---

### Issue 7: Nginx Not Working

**Symptoms:**
- Nginx errors in logs
- Configuration test fails
- Services work directly but not via domain

**Fix:**

```bash
cd /var/www/wissen-publication-group && \
echo "Fixing Nginx..." && \
echo "" && \
echo "1. Testing Nginx config..." && \
sudo nginx -t && \
echo "" && \
echo "2. Checking Nginx status..." && \
sudo systemctl status nginx --no-pager | head -5 && \
echo "" && \
echo "3. Checking Nginx error log..." && \
sudo tail -20 /var/log/nginx/error.log && \
echo "" && \
echo "4. Reloading Nginx..." && \
sudo systemctl reload nginx && \
echo "" && \
echo "5. If still not working, restart Nginx..." && \
sudo systemctl restart nginx && \
echo "" && \
echo "6. Testing via Nginx..." && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost/api/health
```

---

### Issue 8: SSL Certificate Issues

**Symptoms:**
- HTTPS not working
- SSL certificate errors
- Mixed content warnings

**Fix:**

```bash
cd /var/www/wissen-publication-group && \
echo "Checking SSL certificate..." && \
echo "" && \
echo "1. Certificate status:" && \
sudo certbot certificates 2>/dev/null | grep -A 5 wissenpublicationgroup || echo "Certificate not found" && \
echo "" && \
echo "2. Certificate files:" && \
sudo ls -la /etc/letsencrypt/live/wissenpublicationgroup.com/ 2>/dev/null || echo "Certificate directory not found" && \
echo "" && \
echo "3. If certificate is missing or expired, renew:" && \
echo "   sudo certbot --nginx -d wissenpublicationgroup.com -d www.wissenpublicationgroup.com --non-interactive --agree-tos --email admin@wissenpublicationgroup.com --redirect" && \
echo "" && \
echo "4. Test certificate renewal:" && \
sudo certbot renew --dry-run
```

---

### Issue 9: PM2 Not Found

**Symptoms:**
- `pm2: command not found`
- Can't manage services

**Fix:**

```bash
echo "Fixing PM2 PATH..." && \
export PATH=$PATH:/usr/bin:/usr/local/bin && \
source ~/.bashrc 2>/dev/null || true && \
echo "" && \
echo "Finding PM2..." && \
which pm2 || /usr/bin/pm2 --version || /usr/local/bin/pm2 --version || \
echo "" && \
echo "If PM2 not found, reinstall:" && \
echo "sudo npm install -g pm2" && \
echo "pm2 startup systemd -u ubuntu --hp /home/ubuntu"
```

---

### Issue 10: Complete System Recovery

**When everything is broken, use this complete recovery:**

```bash
cd /var/www/wissen-publication-group && \
echo "==========================================" && \
echo "🔄 COMPLETE SYSTEM RECOVERY" && \
echo "==========================================" && \
echo "" && \
echo "1. Stopping all services..." && \
pm2 delete all 2>/dev/null || true && \
sudo systemctl stop nginx 2>/dev/null || true && \
sleep 3 && \
echo "" && \
echo "2. Killing all processes on ports..." && \
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true && \
sudo lsof -ti:3001 | xargs sudo kill -9 2>/dev/null || true && \
pkill -9 -f "next-server" 2>/dev/null || true && \
pkill -9 -f "node.*3000" 2>/dev/null || true && \
pkill -9 -f "node.*3001" 2>/dev/null || true && \
sleep 3 && \
echo "" && \
echo "3. Verifying .env file exists..." && \
if [ ! -f backend/.env ]; then \
  cat > backend/.env << 'ENVEOF'
DATABASE_URL=postgresql://postgres:wissen%402024@localhost:5432/wissen_publication_group
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://wissenpublicationgroup.com,https://www.wissenpublicationgroup.com,http://54.165.116.208,http://localhost:3000,http://localhost:3002
ENVEOF
  echo "✅ .env file created"; \
else \
  echo "✅ .env file exists"; \
fi && \
echo "" && \
echo "4. Verifying build files..." && \
if [ ! -f backend/dist/src/main.js ]; then \
  echo "Rebuilding backend..." && \
  cd backend && npm install --unsafe-perm && npm run build && cd ..; \
fi && \
if [ ! -d frontend/.next ]; then \
  echo "Rebuilding frontend..." && \
  cd frontend && npm install && npm run build && cd ..; \
fi && \
echo "" && \
echo "5. Starting backend..." && \
cd backend && \
pm2 start dist/src/main.js --name wissen-backend --update-env && \
sleep 8 && \
echo "Backend test:" && \
curl -s http://localhost:3001/health && echo "" && \
echo "" && \
echo "6. Starting frontend..." && \
cd ../frontend && \
pm2 start npm --name wissen-frontend -- start --update-env && \
sleep 25 && \
echo "Frontend test:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 && \
echo "" && \
cd .. && \
pm2 save && \
echo "" && \
echo "7. Starting Nginx..." && \
sudo systemctl start nginx && \
sudo nginx -t && \
sudo systemctl reload nginx && \
echo "" && \
echo "8. Final verification..." && \
pm2 list && \
echo "" && \
echo "Testing endpoints:" && \
curl -s http://localhost:3001/health && echo "" && \
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000 && \
curl -s -o /dev/null -w "Nginx: HTTP %{http_code}\n" http://localhost/api/health && \
echo "" && \
echo "==========================================" && \
echo "✅ RECOVERY COMPLETE!" && \
echo "=========================================="
```

---

## 📋 Service Management Commands

### View Logs

```bash
# Backend logs
pm2 logs wissen-backend --lines 50

# Frontend logs
pm2 logs wissen-frontend --lines 50

# All logs
pm2 logs

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# Nginx access log
sudo tail -f /var/log/nginx/access.log
```

### Monitor Services

```bash
# PM2 monitoring
pm2 monit

# System resources
htop

# Disk usage
df -h

# Memory usage
free -h
```

### Check Service Status

```bash
# PM2 status
pm2 list
pm2 status

# Nginx status
sudo systemctl status nginx

# PostgreSQL status
sudo systemctl status postgresql

# All system services
sudo systemctl list-units --type=service --state=running | grep -E "nginx|postgresql"
```

---

## 🔍 Diagnostic Commands

### Full System Diagnostic

```bash
cd /var/www/wissen-publication-group && \
echo "==========================================" && \
echo "🔍 FULL SYSTEM DIAGNOSTIC" && \
echo "==========================================" && \
echo "" && \
echo "1. System Resources:" && \
free -h && \
df -h / && \
uptime && \
echo "" && \
echo "2. PM2 Services:" && \
pm2 list 2>/dev/null || echo "PM2 not available" && \
echo "" && \
echo "3. Port Status:" && \
sudo ss -tlnp | grep -E ":3000|:3001|:80|:443" && \
echo "" && \
echo "4. Process Status:" && \
ps aux | grep -E "node|npm|nginx" | grep -v grep && \
echo "" && \
echo "5. Service Health:" && \
echo "Backend:" && \
curl -s http://localhost:3001/health && echo "" || echo "❌ Backend not responding" && \
echo "Frontend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 || echo "❌ Frontend not responding" && \
echo "Nginx:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost/api/health || echo "❌ Nginx not responding" && \
echo "" && \
echo "6. Nginx Status:" && \
sudo systemctl status nginx --no-pager | head -5 && \
echo "" && \
echo "7. Recent Errors:" && \
pm2 logs wissen-backend --lines 10 --nostream 2>/dev/null | grep -i error | tail -5 && \
pm2 logs wissen-frontend --lines 10 --nostream 2>/dev/null | grep -i error | tail -5 && \
sudo tail -10 /var/log/nginx/error.log | grep -i error && \
echo "" && \
echo "8. Build Files:" && \
ls -lh backend/dist/src/main.js 2>/dev/null && echo "✅ Backend build exists" || echo "❌ Backend build missing" && \
ls -ld frontend/.next 2>/dev/null && echo "✅ Frontend build exists" || echo "❌ Frontend build missing" && \
echo "" && \
echo "=========================================="
```

---

## 🚀 Quick Reference

### Most Common Commands

```bash
# Quick status
pm2 list && curl -s http://localhost:3001/health && curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000

# Restart all
pm2 restart all

# Restart specific
pm2 restart wissen-backend
pm2 restart wissen-frontend

# View logs
pm2 logs

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# Check ports
sudo ss -tlnp | grep -E ":3000|:3001"
```

---

## 📞 Emergency Contacts

- **AWS Console:** https://console.aws.amazon.com/ec2/v2/home?region=us-east-1
- **Instance:** i-016ab2b939f5f7a3b
- **Security Group:** sg-0bea1705b41dd4806
- **Domain:** wissenpublicationgroup.com

---

## ⚠️ Important Notes

1. **Always check logs first** before making changes
2. **Backup before major changes** - especially Nginx config
3. **Test after each fix** - verify services are responding
4. **Wait for services to start** - Frontend needs 20-30 seconds
5. **Check DNS propagation** - Can take up to 48 hours
6. **Verify security groups** - Ports 80 and 443 must be open

---

**Last Updated:** January 18, 2026 
**Server:** EC2 Instance (t3.small)
**Location:** /var/www/wissen-publication-group
