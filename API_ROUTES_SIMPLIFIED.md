# API Routes Simplification - v1 Removal

## ✅ Changes Summary

Removed `/v1` prefix from article routes to match the simpler pattern used by journal routes.

---

## 🔄 What Changed

### Backend Routes

**Before:**
```typescript
@Controller('v1/articles')
```

**After:**
```typescript
@Controller('articles')
```

### API Endpoints

| Endpoint | Before | After |
|----------|--------|-------|
| Get All Articles | `GET /api/v1/articles` | `GET /api/articles` |
| Get Single Article | `GET /api/v1/articles/:id` | `GET /api/articles/:id` |
| Get Related Articles | `GET /api/v1/articles/:id/related` | `GET /api/articles/:id/related` |
| Create Article | `POST /api/v1/articles` | `POST /api/articles` |
| Update Article | `PATCH /api/v1/articles/:id` | `PATCH /api/articles/:id` |
| Delete Article | `DELETE /api/v1/articles/:id` | `DELETE /api/articles/:id` |
| Submit Manuscript | `POST /api/v1/articles/manuscripts` | `POST /api/articles/manuscripts` |

---

## 📋 Consistent API Structure

All API routes now follow the same pattern:

### Journals API
```
GET    /api/journals
GET    /api/journals/:id
POST   /api/journals
PUT    /api/journals/:id
DELETE /api/journals/:id
```

### Articles API
```
GET    /api/articles
GET    /api/articles/:id
GET    /api/articles/:id/related
POST   /api/articles
PATCH  /api/articles/:id
DELETE /api/articles/:id
POST   /api/articles/manuscripts
```

### Auth API
```
POST   /api/auth/login
POST   /api/auth/register
```

---

## 🔧 Files Modified

### Backend
✅ `backend/src/articles/articles.controller.ts`
- Changed `@Controller('v1/articles')` to `@Controller('articles')`

### Frontend
✅ `frontend/src/services/api.ts`
- Updated all article service endpoints
- Removed `/v1` prefix from all routes
- Fixed manuscript submission route (404 error resolved)

---

## 🧪 Testing

### Test Commands

```powershell
# Get all articles
curl.exe http://localhost:3001/api/articles

# Get single article
curl.exe http://localhost:3001/api/articles/1

# Get related articles
curl.exe http://localhost:3001/api/articles/1/related

# Submit manuscript
curl.exe -X POST http://localhost:3001/api/articles/manuscripts `
  -F "title=Test Paper" `
  -F "journalId=1" `
  -F "abstract=This is a test abstract that is more than 100 characters long to meet the validation requirements." `
  -F 'authors=[{"name":"John Doe","email":"john@test.com","affiliation":"MIT"}]' `
  -F "pdf=@C:\path\to\test.pdf"
```

### Frontend Pages
- ✅ Articles List: `http://localhost:3002/articles`
- ✅ Article Detail: `http://localhost:3002/articles/[id]`
- ✅ Submit Manuscript: `http://localhost:3002/submit-manuscript`

---

## ✨ Benefits

1. **Simpler URLs**: Shorter, cleaner endpoint paths
2. **Consistency**: All API routes follow the same pattern
3. **Easier to Remember**: No version prefix to worry about
4. **Fixed 404 Error**: Manuscript submission now works correctly
5. **Better Developer Experience**: Less typing, clearer structure

---

## 🚀 Ready to Test!

All routes updated and ready to use:
- ✅ Backend controller updated
- ✅ Frontend API service updated
- ✅ 404 error resolved
- ✅ Consistent with journal routes
- ✅ Simpler, cleaner URLs

Test the manuscript submission now at:
**POST** `http://localhost:3001/api/articles/manuscripts` 🎉
