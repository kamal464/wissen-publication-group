# ⚡ Quick Fix Commands - Emergency Reference

**Copy and paste these commands when things go wrong**

---

## 🚨 **SITE NOT LOADING? RUN THIS FIRST:**

```bash
cd /var/www/wissen-publication-group && \
pm2 delete all && \
sleep 3 && \
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true && \
sudo lsof -ti:3001 | xargs sudo kill -9 2>/dev/null || true && \
cd backend && pm2 start dist/src/main.js --name wissen-backend --update-env && \
sleep 8 && \
cd ../frontend && pm2 start npm --name wissen-frontend -- start --update-env && \
sleep 25 && \
cd .. && pm2 save && \
sudo systemctl reload nginx && \
echo "✅ Services restarted!" && \
curl -s http://localhost:3001/health && echo "" && \
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000
```

---

## 🔍 **QUICK STATUS CHECK:**

```bash
pm2 list && \
curl -s http://localhost:3001/health && echo "" && \
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000 && \
sudo ss -tlnp | grep -E ":3000|:3001"
```

---

## 🔄 **RESTART ALL SERVICES:**

```bash
cd /var/www/wissen-publication-group && \
pm2 restart all && \
sleep 15 && \
pm2 list
```

---

## ⚠️ **PORT CONFLICT? FIX IT:**

```bash
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true && \
sudo lsof -ti:3001 | xargs sudo kill -9 2>/dev/null || true && \
pkill -9 -f "next-server" 2>/dev/null || true && \
sleep 2 && \
cd /var/www/wissen-publication-group && \
pm2 restart all
```

---

## 📋 **VIEW LOGS:**

```bash
# Backend errors
pm2 logs wissen-backend --lines 30 --nostream | tail -20

# Frontend errors
pm2 logs wissen-frontend --lines 30 --nostream | tail -20

# Nginx errors
sudo tail -20 /var/log/nginx/error.log
```

---

## 🏗️ **REBUILD EVERYTHING:**

```bash
cd /var/www/wissen-publication-group && \
cd backend && npm install && npm run build && cd .. && \
cd frontend && npm install && npm run build && cd .. && \
pm2 restart all
```

---

## 🌐 **TEST ENDPOINTS:**

```bash
echo "Backend: $(curl -s http://localhost:3001/health)" && \
echo "Frontend: HTTP $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)" && \
echo "Nginx: HTTP $(curl -s -o /dev/null -w '%{http_code}' http://localhost/api/health)"
```

---

## 🔧 **NGINX ISSUES:**

```bash
sudo nginx -t && \
sudo systemctl reload nginx && \
sudo systemctl status nginx | head -5
```

---

## 💾 **CHECK RESOURCES:**

```bash
free -h && \
df -h / && \
pm2 list
```

---

## 🆘 **COMPLETE RECOVERY (When nothing works):**

```bash
cd /var/www/wissen-publication-group && \
pm2 delete all && \
sudo systemctl stop nginx && \
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true && \
sudo lsof -ti:3001 | xargs sudo kill -9 2>/dev/null || true && \
pkill -9 -f "next-server" 2>/dev/null || true && \
sleep 5 && \
cd backend && pm2 start dist/src/main.js --name wissen-backend --update-env && \
sleep 8 && \
cd ../frontend && pm2 start npm --name wissen-frontend -- start --update-env && \
sleep 30 && \
cd .. && pm2 save && \
sudo systemctl start nginx && \
sudo systemctl reload nginx && \
pm2 list && \
curl -s http://localhost:3001/health && echo "" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000
```

---

**Server:** 54.165.116.208  
**Domain:** wissenpublicationgroup.com  
**Location:** /var/www/wissen-publication-group

