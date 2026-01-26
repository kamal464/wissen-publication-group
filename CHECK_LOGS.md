# 🔍 Check Logs for Issues

## **COMPREHENSIVE LOG CHECK**

Run this to check all logs:

```bash
echo "=== COMPREHENSIVE LOG CHECK ===" && \
echo "" && \
echo "1. Backend Error Logs (last 50 lines):" && \
pm2 logs wissen-backend --err --lines 50 --nostream && \
echo "" && \
echo "2. Backend Output Logs (last 30 lines):" && \
pm2 logs wissen-backend --out --lines 30 --nostream && \
echo "" && \
echo "3. Frontend Error Logs (last 50 lines):" && \
pm2 logs wissen-frontend --err --lines 50 --nostream && \
echo "" && \
echo "4. Frontend Output Logs (last 30 lines):" && \
pm2 logs wissen-frontend --out --lines 30 --nostream && \
echo "" && \
echo "5. System Logs (recent errors):" && \
sudo journalctl -u pm2-ubuntu --no-pager -n 20 2>/dev/null || echo "No systemd logs" && \
echo "" && \
echo "✅ Log check complete!"
```

---

## **QUICK ERROR CHECK**

If you just want to see errors:

```bash
echo "=== ERROR LOGS ONLY ===" && \
echo "" && \
echo "Backend Errors:" && \
pm2 logs wissen-backend --err --lines 20 --nostream 2>/dev/null | tail -10 || echo "No backend errors" && \
echo "" && \
echo "Frontend Errors:" && \
pm2 logs wissen-frontend --err --lines 20 --nostream 2>/dev/null | tail -10 || echo "No frontend errors"
```
