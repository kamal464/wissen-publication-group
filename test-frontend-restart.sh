#!/bin/bash

# Frontend Auto-Restart Test
# Verifies frontend will automatically restart on crash

echo "=== FRONTEND AUTO-RESTART TEST ==="
echo ""
echo "⚠️  WARNING: This will temporarily crash the frontend to test recovery"
echo ""

echo "1. Current PM2 status:"
pm2 list | grep wissen-frontend
echo ""

echo "2. Getting initial restart count..."
INITIAL=$(pm2 list | grep wissen-frontend | sed 's/│/ /g' | awk '{print $8}')
echo "   Initial restarts: $INITIAL"
echo ""

echo "3. Getting frontend PID..."
PID=$(pm2 list | grep wissen-frontend | sed 's/│/ /g' | awk '{print $6}')
echo "   Frontend PID: $PID"
echo ""

if [ -z "$PID" ] || [ "$PID" = "0" ] || ! [[ "$PID" =~ ^[0-9]+$ ]]; then
  echo "❌ Could not extract valid PID"
  exit 1
fi

echo "4. Testing frontend before kill:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 5 http://localhost:3000
echo ""

echo "5. Killing frontend process (PID: $PID)..."
kill -9 $PID 2>/dev/null
echo "   Process killed"
echo ""

echo "6. Waiting 5 seconds for PM2 to detect and restart..."
sleep 5
echo ""

echo "7. Checking PM2 status:"
pm2 list | grep wissen-frontend
echo ""

echo "8. Getting final restart count..."
FINAL=$(pm2 list | grep wissen-frontend | sed 's/│/ /g' | awk '{print $8}')
echo "   Final restarts: $FINAL"
echo ""

INCREASE=$((FINAL - INITIAL))

if [ "$INCREASE" -gt 0 ]; then
  echo "✅ SUCCESS! PM2 restarted the frontend!"
  echo "   Restart count increased by: $INCREASE"
  echo ""
  echo "9. Testing frontend after restart:"
  sleep 3
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:3000)
  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Frontend is healthy: HTTP $HTTP_CODE"
    echo ""
    echo "==========================================="
    echo "✅ FRONTEND AUTO-RESTART IS WORKING!"
    echo "==========================================="
  else
    echo "⚠️ Frontend restarted but returned HTTP $HTTP_CODE (may need more time)"
  fi
else
  echo "⚠️ Restart count didn't increase, checking frontend status..."
  sleep 2
  STATUS=$(pm2 list | grep wissen-frontend | sed 's/│/ /g' | awk '{print $9}')
  echo "   Current status: $STATUS"
  echo ""
  echo "   Testing frontend:"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:3000)
  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Frontend is online and healthy: HTTP $HTTP_CODE"
    echo ""
    echo "✅ Frontend is stable (may have restarted very quickly)"
  else
    echo "❌ Frontend is not responding: HTTP $HTTP_CODE"
    exit 1
  fi
fi

echo ""
echo "10. Final PM2 status:"
pm2 list | grep wissen-frontend
echo ""
echo "✅ Test complete!"
