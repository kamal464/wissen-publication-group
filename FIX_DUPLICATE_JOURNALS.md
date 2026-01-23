# 🔧 Fix Duplicate Journals - Backend & Frontend Deduplication

## 🐛 **Problem:**
Duplicate journals appearing in API response with same title but different IDs/shortcodes:
- ID 53 & 54: Both titled "k" (shortcodes: "k" vs "k_j85p1h")
- ID 55 & 56: Both titled "f" (shortcodes: "f" vs "f_dr322t")

**Root Cause:** When creating users, the system always creates a new journal even if one with the same title exists (see `admin.service.ts` line 697-698).

## ✅ **Solution:**

### 1. **Backend Deduplication** (`journals.service.ts`)
- Added `deduplicateJournals()` method to `findAll()`
- Deduplicates by title (case-insensitive)
- Prefers journal with more complete data (higher completeness score)
- If scores equal, prefers newer journal (by `updatedAt`)

**Completeness Score Factors:**
- `aimsScope`, `guidelines`: +3 points each
- `description`, `editorialBoard`, `homePageContent`: +2 points each
- `category`, `subjectArea`, `issn`, `coverImage`, `bannerImage`: +1 point each
- Articles count > 0: +2 points

### 2. **Frontend Deduplication** (`journals/page.tsx`)
- Improved `deduplicateJournals()` function
- First deduplicates by ID
- Then deduplicates by title (prefers more complete journal)
- Uses same completeness scoring as backend

## 🧪 **Testing:**

### Test Locally:
1. Build backend: `cd backend && npm run build`
2. Build frontend: `cd frontend && npm run build`
3. Start backend: `npm start` (or `pm2 start`)
4. Start frontend: `npm start`
5. Check API: `http://localhost:3001/api/journals`
6. Check frontend: `http://localhost:3000/journals`

### Expected Result:
- No duplicate journals with same title
- If duplicates exist, only the more complete one is shown
- API returns deduplicated list
- Frontend displays deduplicated list

## 📝 **Files Changed:**

1. `backend/src/journals/journals.service.ts`
   - Added `deduplicateJournals()` private method
   - Added `getJournalCompletenessScore()` private method
   - Updated `findAll()` to deduplicate results

2. `frontend/src/app/journals/page.tsx`
   - Improved `deduplicateJournals()` function
   - Added completeness scoring
   - Better handling of same-title duplicates

## 🚀 **Deployment:**

After testing locally, deploy to production:

```bash
cd /var/www/wissen-publication-group && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
cd backend && \
npm install --no-audit --no-fund --loglevel=error && \
npm run build && \
cd ../frontend && \
npm install --no-audit --no-fund --loglevel=error && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
cd .. && \
pm2 restart all && \
pm2 save && \
sudo systemctl reload nginx && \
echo "✅ Deployment complete!"
```

## ⚠️ **Note:**

This fix handles duplicates at the API/display level. To prevent duplicates from being created:
- Consider adding unique constraint on `title` in database (with migration)
- Or modify `admin.service.ts` to check for existing journal by title before creating

For now, deduplication ensures users don't see duplicates even if they exist in the database.
