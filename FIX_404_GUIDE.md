# Quick Start Guide - Fix 404 Error

## 🔴 Current Issue
```
POST http://localhost:3001/api/articles/manuscripts
Status: 404 Not Found
```

## 🎯 Solution

The backend server is running with **old routes** and needs to be restarted to load the updated routes.

---

## 📋 Step-by-Step Fix

### Step 1: Stop All Running Servers

```powershell
# Stop any running Node processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Or press Ctrl+C in any terminals running npm
```

### Step 2: Start Backend Server (Fresh)

```powershell
cd C:\Users\kolli\universal-publishers\backend
npm run start:dev
```

**Wait for:**
```
🚀 Backend running on http://localhost:3001/api
```

### Step 3: Verify Routes are Loaded

```powershell
# In a NEW PowerShell window
curl.exe http://localhost:3001/api/articles
```

**Expected:** JSON response with articles

### Step 4: Test Manuscript Submission

```powershell
curl.exe -X POST http://localhost:3001/api/articles/manuscripts `
  -F "title=Test Manuscript" `
  -F "journalId=1" `
  -F "abstract=This is a test abstract that contains more than one hundred characters to meet the minimum validation requirements for manuscript submissions in our system." `
  -F "keywords=test,api,validation" `
  -F 'authors=[{"name":"Test Author","email":"test@example.com","affiliation":"Test University"}]' `
  -F "pdf=@C:\Users\kolli\Downloads\python-roadmap.pdf"
```

**Expected:** Success response with manuscript ID

### Step 5: Start Frontend

```powershell
# In another terminal
cd C:\Users\kolli\universal-publishers\frontend
npm run dev
```

**Wait for:**
```
✓ Ready on http://localhost:3002
```

### Step 6: Test in Browser

Navigate to: `http://localhost:3002/submit-manuscript`

Fill out the form and submit!

---

## 🔍 Verification Checklist

- [ ] Backend started fresh with `npm run start:dev`
- [ ] See "Backend running on http://localhost:3001/api" message
- [ ] `curl.exe http://localhost:3001/api/articles` returns JSON
- [ ] `curl.exe` POST to `/api/articles/manuscripts` returns success (not 404)
- [ ] Frontend running on port 3002
- [ ] Submit manuscript form works without 404 error
- [ ] Success toast appears with green gradient
- [ ] File uploaded to `backend/uploads/` directory

---

## 🐛 Troubleshooting

### Still Getting 404?

1. **Check backend logs** for route registration:
   ```
   [Nest] ArticlesController {/articles}
   ```

2. **Verify controller decorator**:
   ```typescript
   // backend/src/articles/articles.controller.ts
   @Controller('articles')  // NOT 'v1/articles'
   ```

3. **Check main.ts global prefix**:
   ```typescript
   // backend/src/main.ts
   app.setGlobalPrefix('api');
   ```

4. **Full route should be**: `/api/articles/manuscripts`

### Backend Won't Start?

```powershell
# Clear node_modules and reinstall
cd backend
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
npm run start:dev
```

### TypeScript Compilation Errors?

```powershell
cd backend
npm run build
```

If successful, then run:
```powershell
npm run start:dev
```

---

## ✅ Expected Results

### Backend Logs (on start)
```
[Nest] Starting Nest application...
[Nest] AppModule dependencies initialized
[Nest] ArticlesModule dependencies initialized
[Nest] ArticlesController {/articles}:
[Nest]   POST manuscripts
[Nest]   GET
[Nest]   GET :id
[Nest]   GET :id/related
[Nest]   PATCH :id
[Nest]   DELETE :id
[Nest] Nest application successfully started
🚀 Backend running on http://localhost:3001/api
```

### Successful API Response
```json
{
  "success": true,
  "message": "Manuscript submitted successfully",
  "article": {
    "id": 6,
    "title": "Test Manuscript",
    "abstract": "...",
    "status": "PENDING",
    "pdfUrl": "/uploads/abc123...xyz.pdf",
    "authors": [...]
  },
  "manuscriptId": 6
}
```

### Frontend Success
- Green toast notification slides in from right
- White bold text: "Manuscript Submitted Successfully!"
- Form resets after submission
- No console errors

---

## 🚀 Quick Commands

### Kill Everything and Restart
```powershell
# Stop all
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\kolli\universal-publishers\backend ; npm run start:dev"

# Wait 10 seconds, then start frontend
Start-Sleep -Seconds 10
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\kolli\universal-publishers\frontend ; npm run dev"
```

### Test Everything
```powershell
cd C:\Users\kolli\universal-publishers
.\test-simple.ps1
```

---

## 📊 Status After Fix

| Component | Status | URL |
|-----------|--------|-----|
| Backend API | ✅ Running | http://localhost:3001/api |
| Articles List | ✅ Working | GET /api/articles |
| Manuscript Submit | ✅ Working | POST /api/articles/manuscripts |
| Static Files | ✅ Working | /uploads/{filename} |
| Frontend | ✅ Running | http://localhost:3002 |
| Submit Page | ✅ Working | /submit-manuscript |

---

## 🎉 Success!

Once you restart the backend server, the 404 error will be resolved and manuscript submission will work perfectly!

**The routes are correct in the code**, they just need to be loaded by restarting the server.
