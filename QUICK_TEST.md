# 🧪 Quick Pre-Deployment Test

## **Test 1: Backend Build & Start (30 seconds)**

```bash
cd backend
npm run build
# Should complete without errors
```

## **Test 2: Frontend Build (1 minute)**

```bash
cd frontend
npm run build
# Should complete without errors
```

## **Test 3: Verify API Still Works (30 seconds)**

If you have backend running locally:

```bash
# Test normal API call
curl http://localhost:3001/api/health
# Should return: {"status":"ok"}

# Test with normal JSON (should work)
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  -w "\nHTTP Status: %{http_code}\n"
# Should return 401 (unauthorized) or 200, NOT 413 (too large)
```

## **✅ If All Tests Pass → Safe to Deploy**

These changes are **defensive** - they only add error handling and limits. They won't break existing functionality.

---

## **⚠️ Potential Issues (Very Unlikely)**

1. **Large JSON payloads (>10MB)**: Will now return 413 instead of crashing
   - **Impact**: Low - most APIs don't send >10MB JSON
   - **Fix**: If needed, increase limit in `main.ts`

2. **Very slow API calls (>30 seconds)**: Will timeout
   - **Impact**: Very low - 30 seconds is generous
   - **Fix**: If needed, increase timeout in `api.ts`

---

## **Recommendation**

✅ **Safe to deploy** - These are defensive changes that add resilience.

If you want extra safety, run the quick tests above (takes ~2 minutes), then deploy.
