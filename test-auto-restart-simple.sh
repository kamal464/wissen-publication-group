#!/bin/bash

# Simple Auto-Restart Test
# Uses PM2's built-in commands for reliability

echo "=== AUTO-RESTART TEST (Simple) ==="
echo ""
echo "⚠️  WARNING: This will temporarily crash the backend to test recovery"
echo ""

# Get PID using pm2 jlist (more reliable)
echo "1. Getting backend PID..."
BACKEND_PID=$(pm2 jlist | jq -r '.[] | select(.name=="wissen-backend") | .pid' 2>/dev/null)
if [ -z "$BACKEND_PID" ] || [ "$BACKEND_PID" = "null" ]; then
  # Fallback: use pm2 describe
  BACKEND_PID=$(pm2 describe wissen-backend 2>/dev/null | grep "pid" | head -1 | awk '{print $4}')
fi

if [ -z "$BACKEND_PID" ] || [ "$BACKEND_PID" = "0" ]; then
  echo "❌ Could not get backend PID"
  exit 1
fi

echo "   Backend PID: $BACKEND_PID"
echo ""

echo "2. Current status:"
pm2 list | grep wissen-backend
echo ""

echo "3. Testing health:"
curl -s http://localhost:3001/health && echo ""
echo ""

echo "4. Killing backend process..."
kill -9 $BACKEND_PID 2>/dev/null
echo "   Process killed"
echo ""

echo "5. Waiting 5 seconds for PM2 to restart..."
sleep 5
echo ""

echo "6. Checking if restarted:"
pm2 list | grep wissen-backend
echo ""

# Get new PID
NEW_PID=$(pm2 jlist | jq -r '.[] | select(.name=="wissen-backend") | .pid' 2>/dev/null)
if [ -z "$NEW_PID" ] || [ "$NEW_PID" = "null" ]; then
  NEW_PID=$(pm2 describe wissen-backend 2>/dev/null | grep "pid" | head -1 | awk '{print $4}')
fi

echo "7. New Backend PID: $NEW_PID"
echo ""

if [ -n "$NEW_PID" ] && [ "$NEW_PID" != "0" ] && [ "$NEW_PID" != "$BACKEND_PID" ]; then
  echo "✅ Backend restarted! New PID: $NEW_PID"
  echo ""
  echo "8. Testing health after restart:"
  sleep 2
  curl -s http://localhost:3001/health && echo ""
  echo ""
  echo "✅ Auto-restart is working!"
else
  echo "❌ Backend did NOT restart properly"
  echo "   Old PID: $BACKEND_PID"
  echo "   New PID: $NEW_PID"
  exit 1
fi

echo ""
echo "9. Final status:"
pm2 list | grep wissen-backend
echo ""
echo "✅ Test complete!"
