# 🔧 Fix Port 3000 Conflict - Multiple Processes

## Problem: Port 3000 is already in use, frontend can't start properly

---

## Complete Fix Script

**Copy and paste this entire block:**

```bash
# 1. Stop all PM2 processes
pm2 stop all
pm2 delete all

# 2. Kill any process using port 3000
echo "=== Killing processes on port 3000 ==="
sudo lsof -ti:3000 | xargs -r sudo kill -9
sudo lsof -ti:3001 | xargs -r sudo kill -9
sleep 2

# 3. Verify ports are free
echo "=== Checking ports ==="
sudo ss -tlnp | grep -E ':(3000|3001)' || echo "✅ Ports are free"
echo ""

# 4. Start backend first
echo "=== Starting Backend ==="
cd /var/www/wissen-publication-group/backend
pm2 start dist/src/main.js --name wissen-backend --update-env
sleep 3

# 5. Start frontend
echo "=== Starting Frontend ==="
cd /var/www/wissen-publication-group/frontend
pm2 start npm --name wissen-frontend -- start
sleep 15

# 6. Check status
echo "=== PM2 Status ==="
pm2 list
echo ""

# 7. Verify ports
echo "=== Port Status ==="
sudo ss -tlnp | grep -E ':(3000|3001)'
echo ""

# 8. Test services
echo "=== Testing Services ==="
curl -s http://localhost:3001/health && echo " ✅ Backend OK" || echo " ❌ Backend failed"
timeout 10 curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000 || echo " ❌ Frontend timeout"
echo ""

# 9. Save PM2 config
pm2 save
echo "✅ Done!"
```

---

## If Frontend Still Hangs

**Rebuild frontend completely:**

```bash
# Stop everything
pm2 stop all
pm2 delete all

# Kill ports
sudo lsof -ti:3000 | xargs -r sudo kill -9
sudo lsof -ti:3001 | xargs -r sudo kill -9
sleep 2

# Rebuild frontend
cd /var/www/wissen-publication-group/frontend
rm -rf .next node_modules/.cache
npm install --no-audit --no-fund
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Start backend
cd /var/www/wissen-publication-group/backend
pm2 start dist/src/main.js --name wissen-backend --update-env

# Start frontend
cd /var/www/wissen-publication-group/frontend
pm2 start npm --name wissen-frontend -- start

# Wait
sleep 20

# Test
pm2 list
curl -s http://localhost:3001/health
timeout 10 curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000

# Save
pm2 save
```

---

**Run the first script to fix the port conflict!** 🚀
