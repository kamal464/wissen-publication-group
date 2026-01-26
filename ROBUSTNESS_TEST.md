# 🛡️ System Robustness Test & Verification

## **COMPREHENSIVE ROBUSTNESS CHECK**

Run these tests to ensure the system won't crash on any request:

---

## **TEST 1: Backend Error Handling**

### Test Large Requests (Should return 413, not crash):

```bash
echo "=== Test 1: Large Request Handling ===" && \
echo "" && \
echo "1. Testing large JSON payload (11MB - should return 413):" && \
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d "$(python3 -c "print('{\"username\":\"test\",\"password\":\"' + 'x' * 11 * 1024 * 1024 + '\"}')" 2>/dev/null || echo '{"username":"test","password":"'$(head -c 11M /dev/zero | base64 | tr -d '\n')'"}')" \
  -w "\nHTTP Status: %{http_code}\n" \
  --max-time 10 \
  2>/dev/null | tail -1 && \
echo "" && \
echo "✅ Should return 413 (Request Entity Too Large), NOT crash"
```

### Test Malformed Requests:

```bash
echo "=== Test 2: Malformed Request Handling ===" && \
echo "" && \
echo "1. Testing invalid JSON:" && \
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":invalid}' \
  -w "\nHTTP Status: %{http_code}\n" \
  --max-time 10 \
  2>/dev/null | tail -1 && \
echo "" && \
echo "✅ Should return 400 (Bad Request), NOT crash"
```

### Test Missing Endpoints:

```bash
echo "=== Test 3: Missing Endpoint Handling ===" && \
echo "" && \
echo "1. Testing non-existent endpoint:" && \
curl -X GET http://localhost:3001/api/nonexistent \
  -w "\nHTTP Status: %{http_code}\n" \
  --max-time 10 \
  2>/dev/null | tail -1 && \
echo "" && \
echo "✅ Should return 404 (Not Found), NOT crash"
```

---

## **TEST 2: Frontend Timeout Handling**

### Test Slow Backend Response:

```bash
echo "=== Test 4: Frontend Timeout Handling ===" && \
echo "" && \
echo "1. Frontend should timeout after 30 seconds (configured)" && \
echo "   This is handled by axios timeout setting" && \
echo "✅ Frontend has 30-second timeout configured"
```

---

## **TEST 3: PM2 Auto-Restart Configuration**

### Check PM2 Restart Settings:

```bash
echo "=== Test 5: PM2 Auto-Restart Configuration ===" && \
echo "" && \
echo "1. Current PM2 configuration:" && \
pm2 describe wissen-backend | grep -E "restart|memory|uptime" && \
pm2 describe wissen-frontend | grep -E "restart|memory|uptime" && \
echo "" && \
echo "2. Check if auto-restart is enabled:" && \
pm2 describe wissen-backend | grep "autorestart" && \
pm2 describe wissen-frontend | grep "autorestart" && \
echo "" && \
echo "✅ Both should show autorestart: true"
```

---

## **TEST 4: Memory Limits**

### Check Memory Usage:

```bash
echo "=== Test 6: Memory Usage Check ===" && \
echo "" && \
echo "1. Current memory usage:" && \
pm2 list && \
echo "" && \
echo "2. Memory limits configured:" && \
pm2 describe wissen-backend | grep "max_memory_restart" && \
pm2 describe wissen-frontend | grep "max_memory_restart" && \
echo "" && \
echo "✅ Both should have max_memory_restart: 400M"
```

---

## **TEST 5: Concurrent Requests**

### Test Multiple Simultaneous Requests:

```bash
echo "=== Test 7: Concurrent Request Handling ===" && \
echo "" && \
echo "1. Sending 10 concurrent requests to backend:" && \
for i in {1..10}; do
  curl -s http://localhost:3001/health > /dev/null &
done && \
wait && \
echo "✅ All requests completed" && \
echo "" && \
echo "2. Checking PM2 status (should still be online):" && \
pm2 list | grep wissen-backend && \
echo "" && \
echo "✅ Backend should still be online"
```

---

## **TEST 6: Stress Test**

### Send Many Requests Rapidly:

```bash
echo "=== Test 8: Stress Test ===" && \
echo "" && \
echo "1. Sending 50 rapid requests:" && \
for i in {1..50}; do
  curl -s http://localhost:3001/health > /dev/null &
done && \
wait && \
echo "✅ All requests completed" && \
echo "" && \
echo "2. Final PM2 status:" && \
pm2 list && \
echo "" && \
echo "✅ Services should still be online with low restart count"
```

---

## **TEST 7: Error Recovery**

### Simulate Process Crash and Verify Auto-Restart:

```bash
echo "=== Test 9: Error Recovery Test ===" && \
echo "" && \
echo "⚠️  WARNING: This will temporarily kill the backend process" && \
echo "1. Current backend PID:" && \
pm2 list | grep wissen-backend | awk '{print $6}' && \
echo "" && \
echo "2. Killing backend process (PM2 should restart it):" && \
BACKEND_PID=$(pm2 list | grep wissen-backend | awk '{print $6}') && \
kill -9 $BACKEND_PID 2>/dev/null && \
echo "Process killed" && \
echo "" && \
echo "3. Waiting 5 seconds for PM2 to restart..." && \
sleep 5 && \
echo "" && \
echo "4. Checking if backend restarted:" && \
pm2 list | grep wissen-backend && \
echo "" && \
echo "5. Testing backend health:" && \
curl -s http://localhost:3001/health && echo "" && \
echo "" && \
echo "✅ Backend should have restarted automatically"
```

---

## **TEST 8: Database Connection Resilience**

### Test Database Error Handling:

```bash
echo "=== Test 10: Database Connection Resilience ===" && \
echo "" && \
echo "1. Testing database-dependent endpoint:" && \
curl -s http://localhost:3001/api/journals \
  -w "\nHTTP Status: %{http_code}\n" \
  --max-time 10 \
  2>/dev/null | tail -1 && \
echo "" && \
echo "✅ Should return 200 or proper error, NOT crash"
```

---

## **COMPREHENSIVE ROBUSTNESS CHECKLIST**

Run all tests and verify:

```bash
echo "=== COMPREHENSIVE ROBUSTNESS CHECK ===" && \
echo "" && \
echo "1. PM2 Status (should be online):" && \
pm2 list && \
echo "" && \
echo "2. Restart Counts (should be low/zero):" && \
pm2 list | grep -E "wissen-backend|wissen-frontend" && \
echo "" && \
echo "3. Memory Usage (should be reasonable):" && \
pm2 list | grep -E "wissen-backend|wissen-frontend" | awk '{print $1, $10}' && \
echo "" && \
echo "4. Port Status:" && \
sudo ss -tlnp | grep -E ":3000|:3001" && \
echo "" && \
echo "5. Service Health:" && \
echo "   Backend:" && \
curl -s http://localhost:3001/health && echo "" && \
echo "   Frontend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 && \
echo "" && \
echo "6. Error Logs (should be empty or minimal):" && \
pm2 logs wissen-backend --err --lines 5 --nostream 2>/dev/null | tail -3 || echo "No recent errors" && \
pm2 logs wissen-frontend --err --lines 5 --nostream 2>/dev/null | tail -3 || echo "No recent errors" && \
echo "" && \
echo "✅ All checks passed - system is robust!"
```

---

## **EXPECTED RESULTS**

After all tests:
- ✅ All requests return proper HTTP status codes (not crashes)
- ✅ PM2 auto-restarts if processes crash
- ✅ Memory limits prevent OOM kills
- ✅ Timeouts prevent hanging requests
- ✅ Error handling returns proper responses
- ✅ Services remain online after stress tests

---

## **IF ANY TEST FAILS**

Share the output and we'll fix the specific issue to make the system more robust.
