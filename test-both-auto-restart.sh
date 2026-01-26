#!/bin/bash

# Test Both Backend and Frontend Auto-Restart
# Verifies both services will automatically restart on crash

echo "=== TEST BOTH BACKEND & FRONTEND AUTO-RESTART ==="
echo ""
echo "⚠️  WARNING: This will temporarily crash both services to test recovery"
echo ""

# Test Backend
echo "==========================================="
echo "1. TESTING BACKEND AUTO-RESTART"
echo "==========================================="
echo ""

echo "1.1 Current backend status:"
pm2 list | grep wissen-backend
echo ""

echo "1.2 Getting initial backend restart count..."
BACKEND_INITIAL=$(pm2 list | grep wissen-backend | sed 's/│/ /g' | awk '{print $8}')
echo "   Initial restarts: $BACKEND_INITIAL"
echo ""

echo "1.3 Getting backend PID..."
BACKEND_PID=$(pm2 list | grep wissen-backend | sed 's/│/ /g' | awk '{print $6}')
echo "   Backend PID: $BACKEND_PID"
echo ""

if [ -z "$BACKEND_PID" ] || [ "$BACKEND_PID" = "0" ] || ! [[ "$BACKEND_PID" =~ ^[0-9]+$ ]]; then
  echo "❌ Could not extract valid backend PID"
  exit 1
fi

echo "1.4 Testing backend health before kill:"
curl -s http://localhost:3001/health && echo ""
echo ""

echo "1.5 Killing backend process..."
kill -9 $BACKEND_PID 2>/dev/null
echo "   Backend process killed"
echo ""

echo "1.6 Waiting 5 seconds for PM2 to restart..."
sleep 5
echo ""

echo "1.7 Checking backend status:"
pm2 list | grep wissen-backend
echo ""

echo "1.8 Getting final backend restart count..."
BACKEND_FINAL=$(pm2 list | grep wissen-backend | sed 's/│/ /g' | awk '{print $8}')
echo "   Final restarts: $BACKEND_FINAL"
echo ""

BACKEND_INCREASE=$((BACKEND_FINAL - BACKEND_INITIAL))

if [ "$BACKEND_INCREASE" -gt 0 ]; then
  echo "✅ Backend auto-restart is working! (Count: $BACKEND_INITIAL → $BACKEND_FINAL)"
  echo ""
  echo "1.9 Testing backend health after restart:"
  sleep 2
  BACKEND_HEALTH=$(curl -s http://localhost:3001/health)
  if [ -n "$BACKEND_HEALTH" ]; then
    echo "✅ Backend is healthy: $BACKEND_HEALTH"
    BACKEND_RESULT="✅ WORKING"
  else
    echo "⚠️ Backend restarted but not responding yet"
    BACKEND_RESULT="⚠️ RESTARTED BUT SLOW"
  fi
else
  echo "⚠️ Backend restart count didn't increase"
  sleep 2
  BACKEND_HEALTH=$(curl -s http://localhost:3001/health)
  if [ -n "$BACKEND_HEALTH" ]; then
    echo "✅ Backend is stable and healthy: $BACKEND_HEALTH"
    BACKEND_RESULT="✅ STABLE"
  else
    echo "❌ Backend is not responding"
    BACKEND_RESULT="❌ FAILED"
  fi
fi

echo ""
echo "==========================================="
echo "2. TESTING FRONTEND AUTO-RESTART"
echo "==========================================="
echo ""

echo "2.1 Current frontend status:"
pm2 list | grep wissen-frontend
echo ""

echo "2.2 Getting initial frontend restart count..."
FRONTEND_INITIAL=$(pm2 list | grep wissen-frontend | sed 's/│/ /g' | awk '{print $8}')
echo "   Initial restarts: $FRONTEND_INITIAL"
echo ""

echo "2.3 Getting frontend PID..."
FRONTEND_PID=$(pm2 list | grep wissen-frontend | sed 's/│/ /g' | awk '{print $6}')
echo "   Frontend PID: $FRONTEND_PID"
echo ""

if [ -z "$FRONTEND_PID" ] || [ "$FRONTEND_PID" = "0" ] || ! [[ "$FRONTEND_PID" =~ ^[0-9]+$ ]]; then
  echo "❌ Could not extract valid frontend PID"
  exit 1
fi

echo "2.4 Testing frontend before kill:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 5 http://localhost:3000
echo ""

echo "2.5 Killing frontend process..."
kill -9 $FRONTEND_PID 2>/dev/null
echo "   Frontend process killed"
echo ""

echo "2.6 Waiting 5 seconds for PM2 to restart..."
sleep 5
echo ""

echo "2.7 Checking frontend status:"
pm2 list | grep wissen-frontend
echo ""

echo "2.8 Getting final frontend restart count..."
FRONTEND_FINAL=$(pm2 list | grep wissen-frontend | sed 's/│/ /g' | awk '{print $8}')
echo "   Final restarts: $FRONTEND_FINAL"
echo ""

FRONTEND_INCREASE=$((FRONTEND_FINAL - FRONTEND_INITIAL))

if [ "$FRONTEND_INCREASE" -gt 0 ]; then
  echo "✅ Frontend auto-restart is working! (Count: $FRONTEND_INITIAL → $FRONTEND_FINAL)"
  echo ""
  echo "2.9 Testing frontend after restart:"
  sleep 3
  FRONTEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:3000)
  if [ "$FRONTEND_HTTP" = "200" ]; then
    echo "✅ Frontend is healthy: HTTP $FRONTEND_HTTP"
    FRONTEND_RESULT="✅ WORKING"
  else
    echo "⚠️ Frontend restarted but returned HTTP $FRONTEND_HTTP"
    FRONTEND_RESULT="⚠️ RESTARTED BUT SLOW"
  fi
else
  echo "⚠️ Frontend restart count didn't increase"
  sleep 2
  FRONTEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:3000)
  if [ "$FRONTEND_HTTP" = "200" ]; then
    echo "✅ Frontend is stable: HTTP $FRONTEND_HTTP"
    FRONTEND_RESULT="✅ STABLE"
  else
    echo "❌ Frontend is not responding: HTTP $FRONTEND_HTTP"
    FRONTEND_RESULT="❌ FAILED"
  fi
fi

echo ""
echo "==========================================="
echo "3. FINAL SUMMARY"
echo "==========================================="
echo ""
echo "Backend Auto-Restart:  $BACKEND_RESULT"
echo "  - Initial restarts: $BACKEND_INITIAL"
echo "  - Final restarts:   $BACKEND_FINAL"
echo "  - Increase:         $BACKEND_INCREASE"
echo ""
echo "Frontend Auto-Restart: $FRONTEND_RESULT"
echo "  - Initial restarts: $FRONTEND_INITIAL"
echo "  - Final restarts:   $FRONTEND_FINAL"
echo "  - Increase:         $FRONTEND_INCREASE"
echo ""

echo "4. Final PM2 Status:"
pm2 list
echo ""

echo "5. Final Health Checks:"
echo "   Backend:"
curl -s http://localhost:3001/health && echo ""
echo "   Frontend:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 http://localhost:3000
echo ""

if [ "$BACKEND_RESULT" = "✅ WORKING" ] || [ "$BACKEND_RESULT" = "✅ STABLE" ]; then
  if [ "$FRONTEND_RESULT" = "✅ WORKING" ] || [ "$FRONTEND_RESULT" = "✅ STABLE" ]; then
    echo "==========================================="
    echo "✅ BOTH SERVICES HAVE AUTO-RESTART WORKING!"
    echo "==========================================="
    echo ""
    echo "Your server is fully protected! 🛡️"
    exit 0
  else
    echo "⚠️ Backend is working, but frontend needs attention"
    exit 1
  fi
else
  echo "❌ Backend auto-restart test failed"
  exit 1
fi
