# 🔧 Fix Port 3000 Conflict

## **PROBLEM IDENTIFIED**
- Port 3000 is already in use by process PID 10555 (`next-server`)
- This is preventing PM2 from starting the frontend
- Error: `EADDRINUSE: address already in use :::3000`

---

## **FIX: Kill Process and Restart**

Run this to fix:

```bash
echo "=== Fixing Port 3000 Conflict ===" && \
echo "" && \
echo "1. Killing process on port 3000 (PID 10555)..." && \
sudo kill -9 10555 2>/dev/null || true && \
echo "" && \
echo "2. Killing all processes on port 3000..." && \
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true && \
echo "" && \
echo "3. Killing all Next.js processes..." && \
pkill -9 -f "next-server" 2>/dev/null || true && \
pkill -9 -f "node.*3000" 2>/dev/null || true && \
echo "" && \
echo "4. Waiting 3 seconds..." && \
sleep 3 && \
echo "" && \
echo "5. Verifying port 3000 is free..." && \
sudo ss -tlnp | grep :3000 || echo "✅ Port 3000 is now free" && \
echo "" && \
echo "6. Restarting frontend..." && \
pm2 restart wissen-frontend && \
echo "" && \
echo "7. Waiting 20 seconds for frontend to start..." && \
sleep 20 && \
echo "" && \
echo "8. Checking status..." && \
pm2 list | grep wissen-frontend && \
echo "" && \
echo "9. Testing frontend..." && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 http://localhost:3000 && \
echo "" && \
echo "✅ Frontend should be running now!"
```

---

## **ALTERNATIVE: Delete and Restart**

If the above doesn't work:

```bash
cd /var/www/wissen-publication-group && \
echo "=== Complete Frontend Restart ===" && \
echo "" && \
echo "1. Stopping frontend..." && \
pm2 delete wissen-frontend 2>/dev/null || true && \
echo "" && \
echo "2. Killing all processes on port 3000..." && \
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true && \
pkill -9 -f "next-server" 2>/dev/null || true && \
pkill -9 -f "node.*3000" 2>/dev/null || true && \
sleep 3 && \
echo "" && \
echo "3. Starting frontend fresh..." && \
cd frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd .. && \
pm2 save && \
echo "" && \
echo "4. Waiting 30 seconds..." && \
sleep 30 && \
echo "" && \
echo "5. Final status:" && \
pm2 list && \
echo "" && \
echo "6. Testing:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 http://localhost:3000
```

---

## **VERIFY FIX**

After running the fix, check:

```bash
echo "=== Verification ===" && \
echo "" && \
echo "1. PM2 Status:" && \
pm2 list | grep wissen-frontend && \
echo "" && \
echo "2. Port 3000:" && \
sudo ss -tlnp | grep :3000 && \
echo "" && \
echo "3. Frontend Response:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 http://localhost:3000 && \
echo "" && \
echo "✅ Should show: online status, port listening, HTTP 200"
```
