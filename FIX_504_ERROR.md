# 🔧 Fix 504 Gateway Timeout Error

## Quick Diagnostic Commands

**Run these in browser terminal to diagnose:**

```bash
# 1. Check if PM2 services are running
pm2 list

# 2. Check if services are listening on correct ports
sudo netstat -tlnp | grep -E ':(3000|3001)'

# 3. Check service logs for errors
pm2 logs wissen-backend --lines 30
pm2 logs wissen-frontend --lines 30

# 4. Test if services respond locally
curl http://localhost:3001/health
curl http://localhost:3000
```

---

## Fix Steps

### Step 1: Check PM2 Status

```bash
pm2 list
```

**Expected output:** Both `wissen-backend` and `wissen-frontend` should show `online` status.

**If services are stopped/errored:**

```bash
# Restart all services
pm2 restart all

# If that doesn't work, delete and restart
pm2 delete all
cd /var/www/wissen-publication-group/backend
pm2 start dist/src/main.js --name wissen-backend
cd /var/www/wissen-publication-group/frontend
pm2 start npm --name wissen-frontend -- start
pm2 save
```

---

### Step 2: Check Ports

```bash
sudo netstat -tlnp | grep -E ':(3000|3001)'
```

**Expected:** Should show processes listening on ports 3000 and 3001.

**If ports are not listening:**

```bash
# Check what's using the ports
sudo lsof -i :3000
sudo lsof -i :3001

# Kill any conflicting processes
sudo kill -9 $(sudo lsof -t -i:3000) 2>/dev/null
sudo kill -9 $(sudo lsof -t -i:3001) 2>/dev/null

# Restart services
pm2 restart all
```

---

### Step 3: Check Service Logs

```bash
# Backend logs
pm2 logs wissen-backend --lines 50 --err

# Frontend logs
pm2 logs wissen-frontend --lines 50 --err
```

**Look for:**
- Database connection errors
- Port already in use errors
- Missing environment variables
- Build/compilation errors

---

### Step 4: Restart Services Properly

```bash
# Stop all
pm2 stop all

# Delete all
pm2 delete all

# Start backend
cd /var/www/wissen-publication-group/backend
pm2 start dist/src/main.js --name wissen-backend --update-env

# Start frontend
cd /var/www/wissen-publication-group/frontend
pm2 start npm --name wissen-frontend -- start

# Save PM2 config
pm2 save

# Check status
pm2 list
```

---

### Step 5: Verify Services Are Responding

```bash
# Test backend health endpoint
curl -v http://localhost:3001/health

# Test backend API
curl -v http://localhost:3001/api/journals

# Test frontend
curl -v http://localhost:3000
```

**If these fail, services aren't running properly.**

---

### Step 6: Rebuild If Needed

**If services keep crashing, rebuild:**

```bash
# Rebuild backend
cd /var/www/wissen-publication-group/backend
npm install
npm run build
pm2 restart wissen-backend --update-env

# Rebuild frontend
cd /var/www/wissen-publication-group/frontend
rm -rf .next node_modules/.cache
npm install
NODE_OPTIONS="--max-old-space-size=2048" npm run build
pm2 restart wissen-frontend
```

---

### Step 7: Check Nginx Configuration

```bash
# Test nginx config
sudo nginx -t

# Check nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Reload nginx
sudo systemctl reload nginx
```

---

## Complete Fix Script

**Copy and paste this entire block:**

```bash
# Stop everything
pm2 stop all
pm2 delete all

# Start backend
cd /var/www/wissen-publication-group/backend
pm2 start dist/src/main.js --name wissen-backend --update-env

# Start frontend  
cd /var/www/wissen-publication-group/frontend
pm2 start npm --name wissen-frontend -- start

# Save and check
pm2 save
pm2 list

# Wait 10 seconds
sleep 10

# Test services
echo "Testing backend..."
curl -s http://localhost:3001/health || echo "Backend not responding"
echo ""
echo "Testing frontend..."
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 || echo "Frontend not responding"

# Reload nginx
sudo nginx -t && sudo systemctl reload nginx
echo ""
echo "✅ Services restarted. Check pm2 list above."
```

---

## Common Issues & Solutions

### Issue: "Port 3000/3001 already in use"
```bash
sudo kill -9 $(sudo lsof -t -i:3000) 2>/dev/null
sudo kill -9 $(sudo lsof -t -i:3001) 2>/dev/null
pm2 restart all
```

### Issue: "Database connection failed"
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Issue: "Cannot find module" errors
```bash
cd /var/www/wissen-publication-group/backend
npm install
npm run build
pm2 restart wissen-backend
```

### Issue: Frontend build missing
```bash
cd /var/www/wissen-publication-group/frontend
rm -rf .next
NODE_OPTIONS="--max-old-space-size=2048" npm run build
pm2 restart wissen-frontend
```

---

**After running the fix script, test your website again!** 🚀
