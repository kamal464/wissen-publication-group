#!/bin/bash

# Comprehensive API Test Suite
# Tests all endpoints and identifies errors/warnings

BASE_URL="http://localhost:3001/api"
ERRORS=0
WARNINGS=0

echo "=== COMPREHENSIVE API TEST SUITE ==="
echo ""
echo "Testing base URL: $BASE_URL"
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_codes=$4
    local description=$5
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\nHTTP:%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | grep "HTTP:" | cut -d: -f2)
    body=$(echo "$response" | grep -v "HTTP:")
    
    # Check if HTTP code is in expected codes
    if echo "$expected_codes" | grep -q "$http_code"; then
        echo "✅ $description: $http_code"
        return 0
    else
        echo "❌ $description: $http_code (expected: $expected_codes)"
        ((ERRORS++))
        return 1
    fi
}

echo "==========================================="
echo "1. HEALTH & BASIC ENDPOINTS"
echo "==========================================="
test_endpoint "GET" "" "" "200 404" "Root endpoint"
# Health endpoint is at /health (not /api/health) - excluded from global prefix
HEALTH_RESPONSE=$(curl -s -w "\nHTTP:%{http_code}" "http://localhost:3001/health")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | grep "HTTP:" | cut -d: -f2)
if [ "$HEALTH_CODE" = "200" ]; then
    echo "✅ Health check: $HEALTH_CODE"
else
    echo "❌ Health check: $HEALTH_CODE (expected: 200)"
    ((ERRORS++))
fi

echo ""
echo "==========================================="
echo "2. JOURNALS API"
echo "==========================================="
test_endpoint "GET" "/journals" "" "200" "GET all journals"
test_endpoint "GET" "/journals/1" "" "200 404" "GET journal by ID"
test_endpoint "GET" "/journals/shortcode/test" "" "200 404" "GET journal by shortcode"

echo ""
echo "==========================================="
echo "3. ARTICLES API"
echo "==========================================="
test_endpoint "GET" "/articles" "" "200" "GET all articles"
test_endpoint "GET" "/articles?journalId=1" "" "200" "GET articles by journal"
test_endpoint "GET" "/articles/1" "" "200 404" "GET article by ID"
test_endpoint "GET" "/articles/1/related" "" "200 404" "GET related articles"

echo ""
echo "==========================================="
echo "4. NEWS API"
echo "==========================================="
test_endpoint "GET" "/news" "" "200" "GET all news"
test_endpoint "GET" "/news/latest" "" "200" "GET latest news"
test_endpoint "GET" "/news/1" "" "200 404" "GET news by ID"

echo ""
echo "==========================================="
echo "5. MESSAGES API"
echo "==========================================="
test_endpoint "GET" "/messages" "" "200" "GET all messages"
test_endpoint "POST" "/messages" '{"content":"Test message"}' "200 201" "POST message"

echo ""
echo "==========================================="
echo "6. ADMIN API (Unauthenticated)"
echo "==========================================="
test_endpoint "POST" "/admin/login" '{"username":"test","password":"test"}' "401 200" "POST admin login"
test_endpoint "GET" "/admin/dashboard/stats" "" "200 401 404" "GET admin stats"
test_endpoint "GET" "/admin/users" "" "200 401 404" "GET admin users"
test_endpoint "GET" "/admin/journals" "" "200 401 404" "GET admin journals"
test_endpoint "GET" "/admin/submissions" "" "200 401 404" "GET admin submissions"
test_endpoint "GET" "/admin/analytics/journals" "" "200 401 404" "GET admin analytics"
test_endpoint "GET" "/admin/notifications" "" "200 401 404" "GET admin notifications"
test_endpoint "GET" "/admin/journal-shortcodes" "" "200 401 404" "GET admin journal-shortcodes"
test_endpoint "GET" "/admin/board-members" "" "200 401 404" "GET admin board-members"

echo ""
echo "==========================================="
echo "7. ERROR HANDLING TESTS"
echo "==========================================="
test_endpoint "POST" "/admin/login" '{invalid json}' "400" "Malformed JSON (400)"
test_endpoint "GET" "/nonexistent" "" "404" "Non-existent endpoint (404)"

echo ""
echo "==========================================="
echo "8. SUMMARY"
echo "==========================================="
echo ""
echo "Total Errors: $ERRORS"
echo "Total Warnings: $WARNINGS"
echo ""

if [ "$ERRORS" -eq 0 ]; then
    echo "✅ ALL CRITICAL TESTS PASSED!"
else
    echo "❌ Found $ERRORS error(s) that need attention"
fi

echo ""
echo "PM2 Status:"
pm2 list | grep -E "wissen-backend|wissen-frontend"
echo ""
echo "✅ API test suite complete!"
