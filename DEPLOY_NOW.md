# 🚀 Deploy Latest Changes - AWS Browser Commands

**Run these commands in AWS Systems Manager Session Manager or EC2 Instance Connect browser terminal**

---

## 📥 **STEP 1: Pull Latest Code**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Pulling latest code ===" && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
echo "✅ Code pulled successfully!"
```

---

## 🔧 **STEP 2: Deploy Backend**

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== Installing backend dependencies ===" && \
npm install --no-audit --no-fund --loglevel=error && \
echo "" && \
echo "=== Generating Prisma client ===" && \
npx prisma generate && \
echo "" && \
echo "=== Applying migrations ===" && \
npx prisma migrate deploy && \
echo "" && \
echo "=== Building backend ===" && \
npm run build && \
echo "✅ Backend built successfully!"
```

---

## 🎨 **STEP 3: Deploy Frontend**

```bash
cd /var/www/wissen-publication-group/frontend && \
echo "=== Installing frontend dependencies ===" && \
npm install --no-audit --no-fund --loglevel=error && \
echo "" && \
echo "=== Building frontend ===" && \
npm run build && \
echo "✅ Frontend built successfully!"
```

---

## 🔄 **STEP 4: Restart Services**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Restarting PM2 services ===" && \
pm2 restart all || (pm2 start backend/dist/src/main.js --name wissen-backend --update-env && cd frontend && pm2 start npm --name wissen-frontend -- start --update-env && cd ..) && \
sleep 5 && \
pm2 save && \
echo "" && \
echo "=== Reloading Nginx ===" && \
sudo systemctl reload nginx && \
echo "" && \
echo "=== Verifying services ===" && \
pm2 list && \
echo "" && \
echo "✅ Deployment complete!"
```

---

## 🚀 **ALL-IN-ONE DEPLOYMENT COMMAND**

**Copy and paste this entire block:**

```bash
cd /var/www/wissen-publication-group && \
echo "=== STEP 1: Pull Latest Code ===" && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
echo "" && \
echo "=== STEP 2: Deploy Backend ===" && \
cd backend && \
npm install --no-audit --no-fund --loglevel=error && \
npx prisma generate && \
npx prisma migrate deploy && \
npm run build && \
echo "" && \
echo "=== STEP 3: Deploy Frontend ===" && \
cd ../frontend && \
npm install --no-audit --no-fund --loglevel=error && \
npm run build && \
echo "" && \
echo "=== STEP 4: Restart Services ===" && \
cd .. && \
pm2 restart all || (pm2 start backend/dist/src/main.js --name wissen-backend --update-env && cd frontend && pm2 start npm --name wissen-frontend -- start --update-env && cd ..) && \
sleep 5 && \
pm2 save && \
sudo systemctl reload nginx && \
echo "" && \
echo "=== STEP 5: Verify ===" && \
pm2 list && \
curl -s http://localhost:3001/api/health && echo "" && \
echo "✅ Deployment complete! All services running."
```

---

## 🔍 **VERIFY DEPLOYMENT**

After deployment, check:

```bash
# Check PM2 status
pm2 list

# Check backend health
curl http://localhost:3001/api/health

# Check frontend
curl -I http://localhost:3000

# Check Nginx
sudo systemctl status nginx

# View logs if needed
pm2 logs wissen-backend --lines 20
pm2 logs wissen-frontend --lines 20
```

---

## ⚠️ **IF YOU GET ERRORS:**

### Disk Space Full?
```bash
df -h / && \
npm cache clean --force && \
sudo journalctl --vacuum-time=3d && \
pm2 flush
```

### NPM Install Fails?
```bash
cd /var/www/wissen-publication-group/backend && \
sudo rm -rf node_modules package-lock.json && \
npm cache clean --force && \
npm install --no-audit --no-fund --loglevel=error
```

### PM2 Process Not Found?
```bash
cd /var/www/wissen-publication-group && \
pm2 start backend/dist/src/main.js --name wissen-backend --update-env && \
cd frontend && \
pm2 start npm --name wissen-frontend -- start --update-env && \
cd .. && \
pm2 save
```

---

## 📝 **QUICK REFERENCE:**

- **Connect**: EC2 Console → Select instance → Connect → Session Manager → Connect
- **Project Path**: `/var/www/wissen-publication-group`
- **Backend Path**: `/var/www/wissen-publication-group/backend`
- **Frontend Path**: `/var/www/wissen-publication-group/frontend`
- **PM2 Commands**: `pm2 list`, `pm2 restart all`, `pm2 logs`, `pm2 save`
