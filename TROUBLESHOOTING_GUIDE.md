# Troubleshooting Guide - Article Detail Page

## Issue: Frontend Getting 404 Error

### Problem
The frontend was unable to fetch articles from the backend API, resulting in a 404 error.

### Root Cause
**CORS (Cross-Origin Resource Sharing) Configuration Issue**

The backend CORS was configured to only allow requests from `http://localhost:3000`, but the frontend was running on `http://localhost:3002`.

### Solution Applied ✅

Updated `backend/src/config/app.config.ts`:

```typescript
cors: {
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
},
```

### Verification Steps

1. **Test Backend API directly** (Should work):
```bash
curl http://localhost:3001/api/v1/articles
```

2. **Check Frontend**:
   - Navigate to http://localhost:3002/articles
   - Check browser console for any CORS errors
   - Articles should load successfully

3. **Test Article Detail Page**:
   - Navigate to http://localhost:3002/articles/1
   - Should display full article with:
     - Title
     - Authors
     - Abstract
     - PDF link
     - Related articles sidebar
     - Breadcrumb navigation

### Common Issues & Solutions

#### Issue 1: Port Already in Use
**Symptom**: `EADDRINUSE: address already in use :::3001`
**Solution**: 
```powershell
Stop-Process -Name node -Force
cd backend
npm run start:dev
```

#### Issue 2: CORS Error in Browser Console
**Symptom**: `Access-Control-Allow-Origin` error
**Solution**: Verify backend CORS config includes the frontend port

#### Issue 3: 404 Not Found
**Symptom**: Cannot GET /api/v1/articles
**Solution**: 
- Ensure backend is running: `npm run start:dev`
- Check ArticlesModule is imported in AppModule
- Verify controller decorator: `@Controller('v1/articles')`

#### Issue 4: TypeScript Compilation Errors
**Symptom**: Cannot find module errors
**Solution**:
```bash
cd backend
rm -rf dist
npm run build
npm run start:dev
```

### Current Status

✅ Backend API: Running on http://localhost:3001
✅ Frontend: Running on http://localhost:3002
✅ CORS: Configured for both ports
✅ Articles API: Tested and working
✅ Database: Seeded with 5 sample articles

### Test URLs

- Articles List: http://localhost:3002/articles
- Article #1: http://localhost:3002/articles/1
- Article #2: http://localhost:3002/articles/2
- Article #3: http://localhost:3002/articles/3
- Article #4: http://localhost:3002/articles/4
- Article #5: http://localhost:3002/articles/5

### API Endpoints

- GET /api/v1/articles - List all articles
- GET /api/v1/articles/:id - Get article by ID  
- GET /api/v1/articles/:id/related - Get related articles
- POST /api/v1/articles - Create new article
- PATCH /api/v1/articles/:id - Update article
- DELETE /api/v1/articles/:id - Delete article

---

**If issues persist after CORS fix:**

1. Hard refresh browser: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check browser console for detailed error messages
4. Verify backend logs show incoming requests
5. Test API endpoints directly with curl/Postman first
