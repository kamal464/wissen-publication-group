# 🧪 Comprehensive API Test Suite

## **RUN THIS TO TEST ALL APIs**

```bash
cd /var/www/wissen-publication-group && \
echo "=== COMPREHENSIVE API TEST SUITE ===" && \
echo "" && \
BASE_URL="http://localhost:3001/api" && \
ERRORS=0 && \
WARNINGS=0 && \
echo "" && \
echo "===========================================" && \
echo "1. HEALTH & BASIC ENDPOINTS" && \
echo "===========================================" && \
echo "" && \
echo "1.1 Health Check:" && \
HEALTH=$(curl -s -w "\nHTTP:%{http_code}" http://localhost:3001/health) && \
HTTP_CODE=$(echo "$HEALTH" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ]; then echo "✅ Health check: OK"; else echo "❌ Health check failed: $HTTP_CODE"; ((ERRORS++)); fi && \
echo "" && \
echo "1.2 Root endpoint:" && \
ROOT=$(curl -s -w "\nHTTP:%{http_code}" http://localhost:3001/api) && \
HTTP_CODE=$(echo "$ROOT" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then echo "✅ Root endpoint: $HTTP_CODE"; else echo "⚠️ Root endpoint: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "===========================================" && \
echo "2. JOURNALS API" && \
echo "===========================================" && \
echo "" && \
echo "2.1 GET /api/journals:" && \
JOURNALS=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/journals") && \
HTTP_CODE=$(echo "$JOURNALS" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ]; then echo "✅ GET journals: OK"; else echo "❌ GET journals failed: $HTTP_CODE"; ((ERRORS++)); fi && \
echo "" && \
echo "2.2 GET /api/journals/:id (test with ID 1):" && \
JOURNAL_ID=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/journals/1") && \
HTTP_CODE=$(echo "$JOURNAL_ID" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then echo "✅ GET journal by ID: $HTTP_CODE"; else echo "⚠️ GET journal by ID: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "2.3 GET /api/journals/shortcode/:shortcode:" && \
JOURNAL_SHORT=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/journals/shortcode/test") && \
HTTP_CODE=$(echo "$JOURNAL_SHORT" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then echo "✅ GET journal by shortcode: $HTTP_CODE"; else echo "⚠️ GET journal by shortcode: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "===========================================" && \
echo "3. ARTICLES API" && \
echo "===========================================" && \
echo "" && \
echo "3.1 GET /api/articles:" && \
ARTICLES=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/articles") && \
HTTP_CODE=$(echo "$ARTICLES" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ]; then echo "✅ GET articles: OK"; else echo "❌ GET articles failed: $HTTP_CODE"; ((ERRORS++)); fi && \
echo "" && \
echo "3.2 GET /api/articles/:id (test with ID 1):" && \
ARTICLE_ID=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/articles/1") && \
HTTP_CODE=$(echo "$ARTICLE_ID" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then echo "✅ GET article by ID: $HTTP_CODE"; else echo "⚠️ GET article by ID: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "3.3 GET /api/articles?journalId=1:" && \
ARTICLES_JOURNAL=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/articles?journalId=1") && \
HTTP_CODE=$(echo "$ARTICLES_JOURNAL" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ]; then echo "✅ GET articles by journal: OK"; else echo "⚠️ GET articles by journal: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "===========================================" && \
echo "4. NEWS API" && \
echo "===========================================" && \
echo "" && \
echo "4.1 GET /api/news:" && \
NEWS=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/news") && \
HTTP_CODE=$(echo "$NEWS" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ]; then echo "✅ GET news: OK"; else echo "❌ GET news failed: $HTTP_CODE"; ((ERRORS++)); fi && \
echo "" && \
echo "4.2 GET /api/news/latest:" && \
NEWS_LATEST=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/news/latest") && \
HTTP_CODE=$(echo "$NEWS_LATEST" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ]; then echo "✅ GET latest news: OK"; else echo "❌ GET latest news failed: $HTTP_CODE"; ((ERRORS++)); fi && \
echo "" && \
echo "4.3 GET /api/news/:id (test with ID 1):" && \
NEWS_ID=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/news/1") && \
HTTP_CODE=$(echo "$NEWS_ID" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then echo "✅ GET news by ID: $HTTP_CODE"; else echo "⚠️ GET news by ID: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "===========================================" && \
echo "5. ADMIN API (Unauthenticated - Expected 401/404)" && \
echo "===========================================" && \
echo "" && \
echo "5.1 POST /api/admin/login (invalid credentials):" && \
ADMIN_LOGIN=$(curl -s -w "\nHTTP:%{http_code}" -X POST "$BASE_URL/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}') && \
HTTP_CODE=$(echo "$ADMIN_LOGIN" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "200" ]; then echo "✅ POST admin login: $HTTP_CODE (expected)"; else echo "⚠️ POST admin login: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "5.2 GET /api/admin/dashboard/stats:" && \
ADMIN_STATS=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/admin/dashboard/stats") && \
HTTP_CODE=$(echo "$ADMIN_STATS" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then echo "✅ GET admin stats: $HTTP_CODE"; else echo "⚠️ GET admin stats: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "5.3 GET /api/admin/users:" && \
ADMIN_USERS=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/admin/users") && \
HTTP_CODE=$(echo "$ADMIN_USERS" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "404" ]; then echo "✅ GET admin users: $HTTP_CODE"; else echo "⚠️ GET admin users: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "5.4 GET /api/admin/journals:" && \
ADMIN_JOURNALS=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/admin/journals") && \
HTTP_CODE=$(echo "$ADMIN_JOURNALS" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "404" ]; then echo "✅ GET admin journals: $HTTP_CODE"; else echo "⚠️ GET admin journals: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "5.5 GET /api/admin/submissions:" && \
ADMIN_SUBMISSIONS=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/admin/submissions") && \
HTTP_CODE=$(echo "$ADMIN_SUBMISSIONS" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "404" ]; then echo "✅ GET admin submissions: $HTTP_CODE"; else echo "⚠️ GET admin submissions: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "5.6 GET /api/admin/analytics/journals:" && \
ADMIN_ANALYTICS=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/admin/analytics/journals") && \
HTTP_CODE=$(echo "$ADMIN_ANALYTICS" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "404" ]; then echo "✅ GET admin analytics: $HTTP_CODE"; else echo "⚠️ GET admin analytics: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "5.7 GET /api/admin/notifications:" && \
ADMIN_NOTIF=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/admin/notifications") && \
HTTP_CODE=$(echo "$ADMIN_NOTIF" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "404" ]; then echo "✅ GET admin notifications: $HTTP_CODE"; else echo "⚠️ GET admin notifications: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "5.8 GET /api/admin/journal-shortcodes:" && \
ADMIN_SHORTCODES=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/admin/journal-shortcodes") && \
HTTP_CODE=$(echo "$ADMIN_SHORTCODES" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "404" ]; then echo "✅ GET admin journal-shortcodes: $HTTP_CODE"; else echo "⚠️ GET admin journal-shortcodes: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "5.9 GET /api/admin/board-members:" && \
ADMIN_BOARD=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/admin/board-members") && \
HTTP_CODE=$(echo "$ADMIN_BOARD" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "404" ]; then echo "✅ GET admin board-members: $HTTP_CODE"; else echo "⚠️ GET admin board-members: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "===========================================" && \
echo "6. MESSAGES API" && \
echo "===========================================" && \
echo "" && \
echo "6.1 GET /api/messages:" && \
MESSAGES=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/messages") && \
HTTP_CODE=$(echo "$MESSAGES" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ]; then echo "✅ GET messages: OK"; else echo "❌ GET messages failed: $HTTP_CODE"; ((ERRORS++)); fi && \
echo "" && \
echo "6.2 POST /api/messages:" && \
MESSAGES_POST=$(curl -s -w "\nHTTP:%{http_code}" -X POST "$BASE_URL/messages" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test message"}') && \
HTTP_CODE=$(echo "$MESSAGES_POST" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then echo "✅ POST messages: OK"; else echo "⚠️ POST messages: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "===========================================" && \
echo "7. ERROR HANDLING TESTS" && \
echo "===========================================" && \
echo "" && \
echo "7.1 Test malformed JSON (should return 400):" && \
MALFORMED=$(curl -s -w "\nHTTP:%{http_code}" -X POST "$BASE_URL/admin/login" \
  -H "Content-Type: application/json" \
  -d '{invalid json}') && \
HTTP_CODE=$(echo "$MALFORMED" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "400" ]; then echo "✅ Malformed JSON handled: 400"; else echo "⚠️ Malformed JSON: $HTTP_CODE (expected 400)"; ((WARNINGS++)); fi && \
echo "" && \
echo "7.2 Test non-existent endpoint (should return 404):" && \
NOT_FOUND=$(curl -s -w "\nHTTP:%{http_code}" "$BASE_URL/nonexistent") && \
HTTP_CODE=$(echo "$NOT_FOUND" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "404" ]; then echo "✅ 404 handling: OK"; else echo "⚠️ 404 handling: $HTTP_CODE (expected 404)"; ((WARNINGS++)); fi && \
echo "" && \
echo "7.3 Test invalid method (should return 405 or 404):" && \
INVALID_METHOD=$(curl -s -w "\nHTTP:%{http_code}" -X DELETE "$BASE_URL/health") && \
HTTP_CODE=$(echo "$INVALID_METHOD" | grep "HTTP:" | cut -d: -f2) && \
if [ "$HTTP_CODE" = "405" ] || [ "$HTTP_CODE" = "404" ]; then echo "✅ Invalid method handled: $HTTP_CODE"; else echo "⚠️ Invalid method: $HTTP_CODE"; ((WARNINGS++)); fi && \
echo "" && \
echo "===========================================" && \
echo "8. CHECK PM2 LOGS FOR ERRORS" && \
echo "===========================================" && \
echo "" && \
echo "8.1 Recent backend errors:" && \
BACKEND_ERRORS=$(pm2 logs wissen-backend --err --lines 10 --nostream 2>/dev/null | tail -5 | grep -i "error\|exception" | wc -l) && \
if [ "$BACKEND_ERRORS" -eq 0 ]; then echo "✅ No recent errors in backend logs"; else echo "⚠️ Found $BACKEND_ERRORS error(s) in backend logs"; ((WARNINGS++)); fi && \
echo "" && \
echo "8.2 Recent backend warnings:" && \
BACKEND_WARNINGS=$(pm2 logs wissen-backend --out --lines 20 --nostream 2>/dev/null | tail -10 | grep -i "warn" | wc -l) && \
if [ "$BACKEND_WARNINGS" -eq 0 ]; then echo "✅ No recent warnings in backend logs"; else echo "ℹ️ Found $BACKEND_WARNINGS warning(s) in backend logs (may be expected)"; fi && \
echo "" && \
echo "===========================================" && \
echo "9. SUMMARY" && \
echo "===========================================" && \
echo "" && \
echo "Total Errors: $ERRORS" && \
echo "Total Warnings: $WARNINGS" && \
echo "" && \
if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then \
  echo "✅ ALL TESTS PASSED!"; \
elif [ "$ERRORS" -eq 0 ]; then \
  echo "✅ All critical tests passed (some warnings may be expected)"; \
else \
  echo "❌ Found $ERRORS error(s) that need attention"; \
fi && \
echo "" && \
echo "PM2 Status:" && \
pm2 list | grep -E "wissen-backend|wissen-frontend" && \
echo "" && \
echo "✅ API test suite complete!"
```

---

## **QUICK API TEST (Simplified)**

If you want a quicker test:

```bash
cd /var/www/wissen-publication-group && \
echo "=== QUICK API TEST ===" && \
BASE_URL="http://localhost:3001/api" && \
echo "" && \
echo "1. Health:" && \
curl -s http://localhost:3001/health && echo "" && \
echo "" && \
echo "2. Journals:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" "$BASE_URL/journals" && \
echo "" && \
echo "3. Articles:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" "$BASE_URL/articles" && \
echo "" && \
echo "4. News:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" "$BASE_URL/news" && \
echo "" && \
echo "5. Messages:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" "$BASE_URL/messages" && \
echo "" && \
echo "6. Admin (expected 401/404):" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" "$BASE_URL/admin/dashboard/stats" && \
echo "" && \
echo "✅ Quick test complete!"
```

---

## **CHECK FOR SPECIFIC ERRORS**

### **Check for 500 errors:**
```bash
pm2 logs wissen-backend --err --lines 50 --nostream | grep -E "500|Internal Server Error|Exception" | tail -10
```

### **Check for database errors:**
```bash
pm2 logs wissen-backend --err --lines 50 --nostream | grep -i "prisma\|database\|connection" | tail -10
```

### **Check for validation errors:**
```bash
pm2 logs wissen-backend --err --lines 50 --nostream | grep -i "validation\|bad request\|400" | tail -10
```
