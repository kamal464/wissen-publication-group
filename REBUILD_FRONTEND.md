# 🔧 Fix: Frontend Build Missing

## **PROBLEM IDENTIFIED**
- ❌ Frontend build (`.next` directory) is missing
- ✅ `.env.production` exists and is correct
- This is why frontend crashed 95 times - Next.js needs a build to run

---

## **FIX: Rebuild Frontend**

Run this command to rebuild and restart:

```bash
cd /var/www/wissen-publication-group && \
echo "=== Stopping Frontend ===" && \
pm2 delete wissen-frontend 2>/dev/null || true && \
sleep 2 && \
echo "" && \
echo "=== Rebuilding Frontend ===" && \
cd frontend && \
rm -rf .next node_modules/.cache && \
npm install --no-audit --no-fund --loglevel=error && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
echo "" && \
echo "=== Starting Frontend ===" && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd .. && \
pm2 save && \
echo "" && \
echo "=== Waiting for Frontend to Start ===" && \
sleep 30 && \
echo "" && \
echo "=== Checking Status ===" && \
pm2 list | grep wissen-frontend && \
echo "" && \
echo "=== Testing Frontend ===" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 http://localhost:3000 && \
echo "" && \
echo "✅ Frontend should be running now!"
```

---

## **VERIFY AFTER FIX**

Wait 30 seconds after the command completes, then check:

```bash
echo "=== Final Verification ===" && \
echo "" && \
echo "1. PM2 Status:" && \
pm2 list && \
echo "" && \
echo "2. Frontend Restart Count (should be 0 or very low):" && \
pm2 list | grep wissen-frontend && \
echo "" && \
echo "3. Frontend Response:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 http://localhost:3000 && \
echo "" && \
echo "4. Backend Health (correct path):" && \
curl -s http://localhost:3001/health && echo ""
```

---

## **EXPECTED RESULTS**

After rebuild:
- ✅ `.next` directory should exist
- ✅ Frontend restart count should be 0 (not 95+)
- ✅ Frontend should respond with HTTP 200
- ✅ Site should be accessible
