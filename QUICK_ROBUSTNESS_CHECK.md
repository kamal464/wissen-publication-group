# ⚡ Quick Robustness Check

## **RUN THIS TO VERIFY SYSTEM ROBUSTNESS**

```bash
echo "=== QUICK ROBUSTNESS CHECK ===" && \
echo "" && \
echo "1. PM2 Status & Restart Counts:" && \
pm2 list && \
echo "" && \
echo "2. Test Normal Request (should work):" && \
curl -s http://localhost:3001/health && echo "" && \
echo "" && \
echo "3. Test Large Request (should return 413, not crash):" && \
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"'$(head -c 11M /dev/zero 2>/dev/null | base64 | tr -d '\n' | head -c 11M)'"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  --max-time 5 \
  2>/dev/null | tail -1 && \
echo "" && \
echo "4. Test Malformed JSON (should return 400, not crash):" && \
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":invalid}' \
  -w "\nHTTP Status: %{http_code}\n" \
  --max-time 5 \
  2>/dev/null | tail -1 && \
echo "" && \
echo "5. Test Non-existent Endpoint (should return 404, not crash):" && \
curl -X GET http://localhost:3001/api/nonexistent \
  -w "\nHTTP Status: %{http_code}\n" \
  --max-time 5 \
  2>/dev/null | tail -1 && \
echo "" && \
echo "6. Test Concurrent Requests (10 simultaneous):" && \
for i in {1..10}; do
  curl -s http://localhost:3001/health > /dev/null &
done && \
wait && \
echo "✅ All concurrent requests completed" && \
echo "" && \
echo "7. Final PM2 Status (should still be online):" && \
pm2 list && \
echo "" && \
echo "8. Check Error Logs (should be minimal):" && \
echo "   Backend errors:" && \
pm2 logs wissen-backend --err --lines 3 --nostream 2>/dev/null | tail -2 || echo "   No recent errors" && \
echo "   Frontend errors:" && \
pm2 logs wissen-frontend --err --lines 3 --nostream 2>/dev/null | tail -2 || echo "   No recent errors" && \
echo "" && \
echo "✅ Robustness check complete!"
```

---

## **EXPECTED RESULTS**

- ✅ Normal requests: HTTP 200
- ✅ Large requests: HTTP 413 (Request Entity Too Large)
- ✅ Malformed requests: HTTP 400 (Bad Request)
- ✅ Missing endpoints: HTTP 404 (Not Found)
- ✅ Concurrent requests: All complete successfully
- ✅ PM2 status: Both services still online
- ✅ Restart counts: Low or zero
- ✅ Error logs: Minimal or empty

---

## **IF ANY TEST FAILS**

Share the output and we'll fix the specific issue to make it more robust.
