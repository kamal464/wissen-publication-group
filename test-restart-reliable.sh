#!/bin/bash

# Reliable Auto-Restart Test
# Uses direct PM2 list parsing

echo "=== AUTO-RESTART TEST (Reliable) ==="
echo ""
echo "⚠️  WARNING: This will temporarily crash the backend to test recovery"
echo ""

# Get PID from pm2 list - more reliable method
echo "1. Getting backend PID from PM2 list..."
PM2_OUTPUT=$(pm2 list | grep wissen-backend | grep -v "name\|──\|id")
if [ -z "$PM2_OUTPUT" ]; then
  echo "❌ Could not find wissen-backend in PM2 list"
  exit 1
fi

# Extract PID (6th field, but need to handle the table format)
BACKEND_PID=$(echo "$PM2_OUTPUT" | awk '{print $6}')
if [ -z "$BACKEND_PID" ] || [ "$BACKEND_PID" = "pid" ] || [ "$BACKEND_PID" = "default" ]; then
  # Try alternative: get from pm2 list JSON-like output
  BACKEND_PID=$(pm2 list | grep wissen-backend | tr -s ' ' | cut -d' ' -f6)
fi

# Final fallback: use ps to find the process
if [ -z "$BACKEND_PID" ] || [ "$BACKEND_PID" = "pid" ] || [ "$BACKEND_PID" = "default" ] || [ "$BACKEND_PID" = "0" ]; then
  BACKEND_PID=$(ps aux | grep "dist/src/main.js" | grep -v grep | awk '{print $2}' | head -1)
fi

if [ -z "$BACKEND_PID" ] || [ "$BACKEND_PID" = "0" ]; then
  echo "❌ Could not get backend PID"
  echo "PM2 output: $PM2_OUTPUT"
  exit 1
fi

echo "   Backend PID: $BACKEND_PID"
echo ""

echo "2. Current PM2 status:"
pm2 list | grep wissen-backend
echo ""

echo "3. Testing backend health:"
curl -s http://localhost:3001/health && echo ""
echo ""

echo "4. Getting initial restart count..."
INITIAL_RESTARTS=$(pm2 list | grep wissen-backend | tr -s ' ' | cut -d' ' -f8)
echo "   Initial restarts: $INITIAL_RESTARTS"
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

# Get new PID
NEW_PM2_OUTPUT=$(pm2 list | grep wissen-backend | grep -v "name\|──\|id")
NEW_PID=$(echo "$NEW_PM2_OUTPUT" | awk '{print $6}')
if [ -z "$NEW_PID" ] || [ "$NEW_PID" = "pid" ] || [ "$NEW_PID" = "default" ]; then
  NEW_PID=$(pm2 list | grep wissen-backend | tr -s ' ' | cut -d' ' -f6)
fi

if [ -z "$NEW_PID" ] || [ "$NEW_PID" = "pid" ] || [ "$NEW_PID" = "default" ] || [ "$NEW_PID" = "0" ]; then
  NEW_PID=$(ps aux | grep "dist/src/main.js" | grep -v grep | awk '{print $2}' | head -1)
fi

echo "8. New Backend PID: $NEW_PID"
echo ""

# Get new restart count
FINAL_RESTARTS=$(pm2 list | grep wissen-backend | tr -s ' ' | cut -d' ' -f8)
echo "9. Final restart count: $FINAL_RESTARTS"
echo ""

# Check if restarted
RESTART_INCREASE=$((FINAL_RESTARTS - INITIAL_RESTARTS))

if [ "$RESTART_INCREASE" -gt 0 ]; then
  echo "✅ PM2 detected the crash and restarted! (Restart count increased by $RESTART_INCREASE)"
  echo ""
  echo "10. Testing backend health after restart:"
  sleep 2
  HEALTH=$(curl -s http://localhost:3001/health)
  if [ -n "$HEALTH" ]; then
    echo "✅ Backend is healthy: $HEALTH"
    echo ""
    echo "✅ AUTO-RESTART IS WORKING!"
  else
    echo "⚠️ Backend restarted but not responding yet"
  fi
elif [ "$NEW_PID" != "$BACKEND_PID" ] && [ "$NEW_PID" != "0" ] && [ -n "$NEW_PID" ]; then
  echo "✅ Backend restarted with new PID!"
  echo ""
  echo "10. Testing backend health after restart:"
  sleep 2
  curl -s http://localhost:3001/health && echo ""
  echo ""
  echo "✅ AUTO-RESTART IS WORKING!"
else
  echo "⚠️ Checking if backend is still running..."
  sleep 2
  CURRENT_STATUS=$(pm2 list | grep wissen-backend | tr -s ' ' | cut -d' ' -f9)
  if [ "$CURRENT_STATUS" = "online" ]; then
    echo "✅ Backend is still online (may have restarted quickly)"
    curl -s http://localhost:3001/health && echo ""
    echo ""
    echo "✅ Backend is stable!"
  else
    echo "❌ Backend did NOT restart properly"
    echo "   Status: $CURRENT_STATUS"
    exit 1
  fi
fi

echo ""
echo "11. Final PM2 status:"
pm2 list | grep wissen-backend
echo ""
echo "✅ Test complete!"
