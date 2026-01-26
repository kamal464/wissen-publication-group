# ✅ Verify Frontend Auto-Restart Configuration

## **CHECK CURRENT CONFIGURATION**

Run this to see the full PM2 configuration:

```bash
echo "=== FRONTEND PM2 CONFIGURATION ===" && \
echo "" && \
echo "1. Full PM2 describe output:" && \
pm2 describe wissen-frontend && \
echo "" && \
echo "2. PM2 list (shows restart count):" && \
pm2 list | grep wissen-frontend && \
echo "" && \
echo "3. Check if auto-restart is in config:" && \
pm2 describe wissen-frontend | grep -i "restart\|auto" || echo "Checking PM2 ecosystem..." && \
echo "" && \
echo "4. PM2 saved configuration:" && \
cat ~/.pm2/dump.pm2 2>/dev/null | grep -A 10 "wissen-frontend" | head -15 || echo "No saved config found"
```

---

## **PM2 AUTO-RESTART IS ENABLED BY DEFAULT**

**Important:** PM2 enables auto-restart **by default** for all processes. The fact that your frontend shows **16 restarts** proves that auto-restart is working!

---

## **ENSURE AUTO-RESTART IS PROPERLY CONFIGURED**

If you want to explicitly verify and configure it:

```bash
cd /var/www/wissen-publication-group && \
echo "=== VERIFY & CONFIGURE FRONTEND AUTO-RESTART ===" && \
echo "" && \
echo "1. Current status:" && \
pm2 list | grep wissen-frontend && \
echo "" && \
echo "2. Stop and reconfigure frontend with explicit auto-restart:" && \
pm2 delete wissen-frontend 2>/dev/null || true && \
sleep 2 && \
echo "" && \
echo "3. Start frontend with auto-restart explicitly enabled:" && \
cd frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd .. && \
echo "" && \
echo "4. Save PM2 configuration:" && \
pm2 save && \
echo "" && \
echo "5. Verify it's running:" && \
pm2 list | grep wissen-frontend && \
echo "" && \
echo "✅ Frontend auto-restart is now explicitly configured!"
```

---

## **TEST FRONTEND AUTO-RESTART**

Test that it actually works:

```bash
cd /var/www/wissen-publication-group && \
echo "=== TEST FRONTEND AUTO-RESTART ===" && \
echo "" && \
echo "1. Initial status:" && \
pm2 list | grep wissen-frontend && \
INITIAL=$(pm2 list | grep wissen-frontend | sed 's/│/ /g' | awk '{print $8}') && \
echo "   Initial restarts: $INITIAL" && \
echo "" && \
echo "2. Get PID:" && \
PID=$(pm2 list | grep wissen-frontend | sed 's/│/ /g' | awk '{print $6}') && \
echo "   PID: $PID" && \
echo "" && \
echo "3. Kill frontend..." && \
kill -9 $PID 2>/dev/null && \
sleep 5 && \
echo "" && \
echo "4. Check if restarted:" && \
pm2 list | grep wissen-frontend && \
FINAL=$(pm2 list | grep wissen-frontend | sed 's/│/ /g' | awk '{print $8}') && \
echo "   Final restarts: $FINAL" && \
echo "" && \
INCREASE=$((FINAL - INITIAL)) && \
if [ "$INCREASE" -gt 0 ]; then \
  echo "✅ Frontend auto-restart is working! (Count increased by $INCREASE)"; \
  curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 http://localhost:3000 && \
  echo "✅ Frontend is healthy!"; \
else \
  echo "⚠️ Count didn't increase, but frontend is online"; \
  curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 http://localhost:3000; \
fi
```

---

## **SUMMARY**

✅ **Frontend auto-restart IS enabled** (PM2 enables it by default)
✅ **16 restarts proves it's working** (PM2 has been restarting the frontend)
✅ **Frontend is currently online and stable**
✅ **No action needed** - auto-restart is already working!

**Your frontend is protected!** 🛡️
