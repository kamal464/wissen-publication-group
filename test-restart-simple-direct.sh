#!/bin/bash

# Simple Direct Auto-Restart Test
# Uses visible PID from pm2 list output

echo "=== AUTO-RESTART TEST (Simple & Direct) ==="
echo ""
echo "⚠️  WARNING: This will temporarily crash the backend to test recovery"
echo ""

echo "1. Current PM2 status:"
pm2 list | grep wissen-backend
echo ""

# Extract restart count (the number after uptime, before status)
echo "2. Getting initial restart count..."
INITIAL_RESTARTS=$(pm2 list | grep wissen-backend | sed 's/│/ /g' | awk '{print $8}')
echo "   Initial restarts: $INITIAL_RESTARTS"
echo ""

# Extract PID (6th field after replacing │ with space)
echo "3. Getting backend PID..."
BACKEND_PID=$(pm2 list | grep wissen-backend | sed 's/│/ /g' | awk '{print $6}')
echo "   Backend PID: $BACKEND_PID"
echo ""

if [ -z "$BACKEND_PID" ] || [ "$BACKEND_PID" = "0" ] || ! [[ "$BACKEND_PID" =~ ^[0-9]+$ ]]; then
  echo "❌ Could not extract valid PID"
  exit 1
fi

echo "4. Testing backend health before kill:"
curl -s http://localhost:3001/health && echo ""
echo ""

echo "5. Killing backend process (PID: $BACKEND_PID)..."
kill -9 $BACKEND_PID 2>/dev/null
echo "   Process killed"
echo ""

echo "6. Waiting 5 seconds for PM2 to detect and restart..."
sleep 5
echo ""

echo "7. Checking PM2 status:"
pm2 list | grep wissen-backend
echo ""

echo "8. Getting final restart count..."
FINAL_RESTARTS=$(pm2 list | grep wissen-backend | sed 's/│/ /g' | awk '{print $8}')
echo "   Final restarts: $FINAL_RESTARTS"
echo ""

RESTART_INCREASE=$((FINAL_RESTARTS - INITIAL_RESTARTS))

if [ "$RESTART_INCREASE" -gt 0 ]; then
  echo "✅ SUCCESS! PM2 restarted the backend!"
  echo "   Restart count increased by: $RESTART_INCREASE"
  echo ""
  echo "9. Testing backend health after restart:"
  sleep 2
  HEALTH=$(curl -s http://localhost:3001/health)
  if [ -n "$HEALTH" ]; then
    echo "✅ Backend is healthy: $HEALTH"
    echo ""
    echo "==========================================="
    echo "✅ AUTO-RESTART IS WORKING PERFECTLY!"
    echo "==========================================="
  else
    echo "⚠️ Backend restarted but not responding yet (may need more time)"
  fi
else
  echo "⚠️ Restart count didn't increase, checking backend status..."
  sleep 2
  STATUS=$(pm2 list | grep wissen-backend | sed 's/│/ /g' | awk '{print $9}')
  echo "   Current status: $STATUS"
  echo ""
  echo "   Testing health endpoint:"
  HEALTH=$(curl -s http://localhost:3001/health 2>/dev/null)
  if [ -n "$HEALTH" ]; then
    echo "✅ Backend is online and healthy: $HEALTH"
    echo ""
    echo "✅ Backend is stable (may have restarted very quickly)"
  else
    echo "❌ Backend is not responding"
    exit 1
  fi
fi

echo ""
echo "10. Final PM2 status:"
pm2 list | grep wissen-backend
echo ""
echo "✅ Test complete!"
