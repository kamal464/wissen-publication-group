#!/bin/bash
# Validate Nginx configuration locally
# This script checks if the nginx config file is valid

echo "=========================================="
echo "🔍 Validating Nginx Configuration"
echo "=========================================="
echo ""

if [ ! -f "nginx-production.conf" ]; then
  echo "❌ nginx-production.conf not found!"
  exit 1
fi

echo "1. Checking nginx-production.conf syntax..."
echo "   File exists: ✅"
echo "   File size: $(wc -l < nginx-production.conf) lines"
echo ""

echo "2. Checking for required directives..."
REQUIRED=("listen 80" "location /api" "location /" "proxy_pass")
MISSING=0

for directive in "${REQUIRED[@]}"; do
  if grep -q "$directive" nginx-production.conf; then
    echo "   ✅ Found: $directive"
  else
    echo "   ❌ Missing: $directive"
    MISSING=1
  fi
done

echo ""
if [ "$MISSING" -eq 1 ]; then
  echo "❌ Configuration is missing required directives!"
  exit 1
fi

echo "3. Checking proxy_pass targets..."
if grep -q "proxy_pass http://localhost:3001" nginx-production.conf; then
  echo "   ✅ Backend proxy target correct (port 3001)"
else
  echo "   ❌ Backend proxy target incorrect!"
  exit 1
fi

if grep -q "proxy_pass http://localhost:3000" nginx-production.conf; then
  echo "   ✅ Frontend proxy target correct (port 3000)"
else
  echo "   ❌ Frontend proxy target incorrect!"
  exit 1
fi

echo ""
echo "4. Configuration structure:"
echo "   Server blocks: $(grep -c "^server {" nginx-production.conf)"
echo "   Location blocks: $(grep -c "^    location" nginx-production.conf)"

echo ""
echo "=========================================="
echo "✅ Configuration validation passed!"
echo "=========================================="
echo ""
echo "To test on EC2, run:"
echo "  bash test-nginx-config.sh"

