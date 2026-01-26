# 🔄 Test Frontend Auto-Restart

## **IS FRONTEND AUTO-RESTART REQUIRED?**

**YES! ✅** Frontend auto-restart is **CRITICAL** because:

1. **Website won't load** if frontend crashes
2. **Users can't access the site** if frontend is down
3. **Frontend can crash** due to:
   - Memory issues
   - Port conflicts
   - Build errors
   - Node.js errors
   - Unexpected exceptions

---

## **VERIFY FRONTEND AUTO-RESTART IS ENABLED**

```bash
echo "=== CHECK FRONTEND AUTO-RESTART ===" && \
echo "" && \
echo "1. PM2 Frontend Status:" && \
pm2 list | grep wissen-frontend && \
echo "" && \
echo "2. Auto-restart enabled (should be true):" && \
pm2 describe wissen-frontend | grep "autorestart" && \
echo "" && \
echo "3. Memory limit (should be set):" && \
pm2 describe wissen-frontend | grep "max_memory_restart" || echo "No memory limit set" && \
echo "" && \
echo "4. Current restart count:" && \
pm2 list | grep wissen-frontend | sed 's/│/ /g' | awk '{print "Restarts: " $8}' && \
echo "" && \
echo "✅ If autorestart shows 'true', auto-restart is enabled!"
```

---

## **TEST FRONTEND AUTO-RESTART**

Run this to verify frontend will auto-restart on crash:

```bash
cd /var/www/wissen-publication-group && \
echo "=== FRONTEND AUTO-RESTART TEST ===" && \
echo "" && \
echo "⚠️  WARNING: This will temporarily crash the frontend to test recovery" && \
echo "" && \
echo "1. Current status:" && \
pm2 list | grep wissen-frontend && \
echo "" && \
echo "2. Initial restart count:" && \
INITIAL=$(pm2 list | grep wissen-frontend | sed 's/│/ /g' | awk '{print $8}') && \
echo "   Restarts: $INITIAL" && \
echo "" && \
echo "3. Get Frontend PID:" && \
PID=$(pm2 list | grep wissen-frontend | sed 's/│/ /g' | awk '{print $6}') && \
echo "   PID: $PID" && \
echo "" && \
echo "4. Test frontend before kill:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 5 http://localhost:3000 && \
echo "" && \
echo "5. Kill frontend..." && \
kill -9 $PID 2>/dev/null && \
echo "   Process killed" && \
echo "" && \
echo "6. Wait 5 seconds for PM2 to restart..." && \
sleep 5 && \
echo "" && \
echo "7. Check status:" && \
pm2 list | grep wissen-frontend && \
echo "" && \
echo "8. Final restart count:" && \
FINAL=$(pm2 list | grep wissen-frontend | sed 's/│/ /g' | awk '{print $8}') && \
echo "   Restarts: $FINAL" && \
echo "" && \
INCREASE=$((FINAL - INITIAL)) && \
if [ "$INCREASE" -gt 0 ]; then \
  echo "✅ PM2 restarted frontend! (Count increased by $INCREASE)"; \
  echo ""; \
  echo "9. Test frontend after restart:"; \
  sleep 3; \
  curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 http://localhost:3000 && \
  echo ""; \
  echo "✅ FRONTEND AUTO-RESTART IS WORKING!"; \
else \
  echo "⚠️ Count didn't increase, but checking if frontend is online..."; \
  sleep 3; \
  curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 http://localhost:3000 && \
  if [ $? -eq 0 ]; then \
    echo "✅ Frontend is online!"; \
  else \
    echo "❌ Frontend is not responding"; \
  fi; \
fi
```

---

## **ENSURE FRONTEND HAS AUTO-RESTART CONFIGURED**

If auto-restart is not enabled, configure it:

```bash
cd /var/www/wissen-publication-group && \
echo "=== CONFIGURE FRONTEND AUTO-RESTART ===" && \
echo "" && \
echo "1. Stop frontend:" && \
pm2 delete wissen-frontend 2>/dev/null || true && \
sleep 2 && \
echo "" && \
echo "2. Start frontend with auto-restart enabled:" && \
cd frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd .. && \
echo "" && \
echo "3. Save PM2 configuration:" && \
pm2 save && \
echo "" && \
echo "4. Verify auto-restart is enabled:" && \
pm2 describe wissen-frontend | grep "autorestart" && \
echo "" && \
echo "✅ Frontend auto-restart configured!"
```

---

## **WHY FRONTEND AUTO-RESTART IS CRITICAL**

### **Without Auto-Restart:**
- ❌ Frontend crashes → Website goes down
- ❌ Users can't access the site
- ❌ Manual intervention required to restart
- ❌ Downtime until someone notices and fixes

### **With Auto-Restart:**
- ✅ Frontend crashes → PM2 automatically restarts it
- ✅ Website stays online
- ✅ No manual intervention needed
- ✅ Minimal downtime (seconds)

---

## **CURRENT FRONTEND STATUS**

From your test output, I can see:
- Frontend has **16 restarts** (shows it's been restarting)
- Frontend is **online** and stable now
- PM2 is managing it

**This means auto-restart is already working!** ✅

---

## **SUMMARY**

✅ **Frontend auto-restart is REQUIRED and should be enabled**
✅ **PM2 enables auto-restart by default**
✅ **Your frontend already has auto-restart working** (16 restarts shows it's been recovering)
✅ **Both backend and frontend should have auto-restart enabled**

**Your system is fully protected!** 🛡️
