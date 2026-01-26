# 🔧 Fix Port 3000 Conflict - Frontend Can't Start

## **PROBLEM**
Port 3000 is already in use, preventing the frontend from starting. There are also duplicate PM2 processes.

## **IMMEDIATE FIX**

```bash
cd /var/www/wissen-publication-group && \
echo "==========================================" && \
echo "🔧 FIXING PORT 3000 CONFLICT" && \
echo "==========================================" && \
echo "" && \
echo "=== STEP 1: Check What's Using Port 3000 ===" && \
sudo lsof -i :3000 || sudo ss -tlnp | grep 3000 && \
echo "" && \
echo "=== STEP 2: Kill All Processes on Port 3000 ===" && \
sudo fuser -k 3000/tcp 2>/dev/null || \
(sudo lsof -ti :3000 | xargs sudo kill -9 2>/dev/null || true) && \
sleep 3 && \
echo "✅ Port 3000 cleared" && \
echo "" && \
echo "=== STEP 3: Clean Up PM2 Processes ===" && \
pm2 delete wissen-frontend 2>/dev/null || true && \
pm2 delete all 2>/dev/null || true && \
sleep 2 && \
echo "✅ PM2 cleaned" && \
echo "" && \
echo "=== STEP 4: Verify Port 3000 is Free ===" && \
sudo ss -tlnp | grep 3000 || echo "✅ Port 3000 is free" && \
echo "" && \
echo "=== STEP 5: Start Backend ===" && \
cd backend && \
pm2 start dist/src/main.js --name wissen-backend \
  --max-memory-restart 400M \
  --update-env && \
cd .. && \
sleep 5 && \
echo "" && \
echo "=== STEP 6: Start Frontend ===" && \
cd frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd .. && \
pm2 save && \
sleep 15 && \
echo "" && \
echo "=== STEP 7: Verify Services ===" && \
pm2 list && \
echo "" && \
echo "Backend:" && \
curl -s http://localhost:3001/health && echo "" && \
echo "" && \
echo "Frontend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 && \
echo "" && \
echo "=== STEP 8: Restart Nginx ===" && \
sudo systemctl restart nginx && \
sleep 3 && \
echo "" && \
echo "=== STEP 9: Test Static File ===" && \
curl -I http://localhost:3000/_next/static/css/app.css 2>&1 | head -5 && \
echo "" && \
echo "==========================================" && \
echo "✅ FIX COMPLETE!" && \
echo "=========================================="
```

---

## **ALTERNATIVE: If fuser doesn't work**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Finding and Killing Port 3000 Process ===" && \
PID=$(sudo lsof -ti :3000) && \
if [ ! -z "$PID" ]; then \
  echo "Killing process $PID on port 3000"; \
  sudo kill -9 $PID; \
  sleep 3; \
else \
  echo "No process found on port 3000"; \
fi && \
echo "" && \
echo "=== Cleaning PM2 ===" && \
pm2 delete all 2>/dev/null || true && \
sleep 2 && \
echo "" && \
echo "=== Starting Services ===" && \
cd backend && \
pm2 start dist/src/main.js --name wissen-backend --max-memory-restart 400M --update-env && \
cd ../frontend && \
pm2 start npm --name wissen-frontend --max-memory-restart 400M --update-env -- start && \
cd .. && \
pm2 save && \
sleep 15 && \
pm2 list
```

---

## **VERIFY FIX**

```bash
echo "=== VERIFICATION ===" && \
echo "1. PM2 Status:" && \
pm2 list && \
echo "" && \
echo "2. Port 3000:" && \
sudo ss -tlnp | grep 3000 && \
echo "" && \
echo "3. Frontend Test:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 && \
echo "" && \
echo "4. Static File Test:" && \
curl -I http://localhost:3000/_next/static/css/app.css 2>&1 | head -3
```

---

**Run the IMMEDIATE FIX command to clear port 3000 and restart the frontend!** 🚀
