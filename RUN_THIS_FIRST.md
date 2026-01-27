# 🚀 RUN THIS FIRST - Complete Server Setup

## One-Time Setup (Run in Browser Terminal)

**Copy and paste this ENTIRE block:**

```bash
# Make scripts executable
cd /var/www/wissen-publication-group
chmod +x MASTER_SETUP.sh QUICK_DEPLOY_ROBUST.sh

# Run master setup (does everything)
./MASTER_SETUP.sh
```

**This will:**
- ✅ Install PM2 with auto-startup
- ✅ Pull latest code
- ✅ Install dependencies
- ✅ Build applications
- ✅ Start services with auto-restart
- ✅ Setup health monitoring
- ✅ Configure firewall
- ✅ Install fail2ban
- ✅ Setup auto-updates
- ✅ Test everything

---

## Daily Deployment (After Setup)

**For future updates, just run:**

```bash
cd /var/www/wissen-publication-group
./QUICK_DEPLOY_ROBUST.sh
```

**Or manually:**

```bash
cd /var/www/wissen-publication-group

# Pull latest
git pull origin main

# Build
cd backend && npm install && npm run build
cd ../frontend && npm install && NODE_OPTIONS="--max-old-space-size=2048" npm run build
cd ..

# Restart
pm2 restart all --update-env

# Wait and test
sleep 20
curl http://localhost:3001/health && echo " ✅ Backend"
curl -I http://localhost:3000 | head -1 && echo " ✅ Frontend"

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```

---

## Verify Everything Works

```bash
# Check PM2 status
pm2 list

# Check health
curl http://localhost:3001/health
curl -I http://localhost:3000

# Check through Nginx
curl http://localhost/api/health
curl -I http://localhost

# Check logs
pm2 logs --lines 20

# Check firewall
sudo ufw status

# Check fail2ban
sudo fail2ban-client status
```

---

## Auto-Restart Features

✅ **PM2 will automatically:**
- Restart services if they crash
- Restart services on server reboot
- Limit memory usage (500MB backend, 1GB frontend)
- Log everything to `/var/log/pm2/`

✅ **Health Monitor (cron job) will:**
- Check services every 5 minutes
- Restart if health check fails
- Log all actions

✅ **Security:**
- Firewall blocks all ports except 22, 80, 443
- Fail2ban blocks brute force attacks
- Auto-updates security patches

---

## If Something Goes Wrong

```bash
# View logs
pm2 logs
pm2 logs wissen-backend --err
pm2 logs wissen-frontend --err

# Restart everything
pm2 restart all

# If services won't start
pm2 delete all
cd /var/www/wissen-publication-group/backend
pm2 start dist/src/main.js --name wissen-backend --update-env
cd ../frontend
pm2 start npm --name wissen-frontend -- start
pm2 save

# Check what's wrong
pm2 describe wissen-backend
pm2 describe wissen-frontend
```

---

**Your server is now bulletproof!** 🛡️
