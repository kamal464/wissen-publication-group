# Frontend & Backend Structure Optimization

## ✅ Completed Changes

### Backend Structure (NestJS on port 3001)

#### 1. **Global API Prefix**
- Added `app.setGlobalPrefix('api')` in `main.ts`
- All routes now accessible under `/api/*`
- Example: `http://localhost:3001/api/journals`

#### 2. **Organized Folder Structure**
```
backend/src/
├── routes/          (Created for future route definitions)
├── models/          (Created - added journal.model.ts with TypeScript interfaces)
├── journals/
│   ├── journals.controller.ts
│   ├── journals.service.ts
│   ├── journals.module.ts
│   └── dto/
├── prisma/
├── config/
└── main.ts
```

#### 3. **API Endpoints**
- **GET** `/api/journals` - List all journals
- **POST** `/api/journals` - Create journal
- **GET** `/api/journals/:id` - Get journal by ID
- **GET** `/api/journals/:id/articles` - Get journal articles

---

### Frontend Structure (Next.js on port 3000)

#### 1. **Removed Unnecessary Proxy Routes**
- Deleted `frontend/src/app/api/journals/` (proxy routes)
- Frontend now calls backend directly via axios
- Simpler architecture, better performance

#### 2. **Performance Optimizations**

##### Created Optimized `JournalCard` Component
- **Location**: `frontend/src/components/JournalCard.tsx`
- Wrapped with `React.memo` to prevent unnecessary re-renders
- Proper image lazy loading with width/height attributes
- Clean props interface with TypeScript

##### Optimized `journals/page.tsx`
- **Fast-path filtering**: Returns entire list when no filters active
- **useMemo** for expensive filtered list computation
- **useCallback** for event handlers (`handleRefresh`, `renderCard`)
- Conditional rendering with `isClient` to avoid hydration mismatches

#### 3. **TypeScript Type Safety**
- Updated `Journal` type in `types/index.ts` to include:
  ```typescript
  _count?: {
    articles: number;
  };
  createdAt?: string;
  ```
- Full type coverage across components
- No TypeScript errors

#### 4. **Grid Layout**
- Changed from `md:grid-cols-2 xl:grid-cols-3` to `md:grid-cols-2`
- Ensures exactly **2 journals per row** on medium+ screens
- Maintains single column on mobile

#### 5. **Configuration**
- Updated `.env.local`:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:3001/api
  ```
- Frontend axios client uses this base URL

---

## Performance Improvements

### Before
- Unnecessary Next.js API proxy layer
- No component memoization
- Full list re-filtering on every render
- Hydration warnings

### After
- ✅ Direct backend calls (one less hop)
- ✅ Memoized JournalCard component
- ✅ Fast-path filtering with useMemo
- ✅ useCallback for stable function references
- ✅ No hydration warnings
- ✅ Proper lazy loading images
- ✅ Type-safe throughout

---

## How to Run

### Start Backend (Terminal 1)
```powershell
Set-Location -Path 'C:\Users\kolli\universal-publishers\backend'
npm run start:dev
```
Backend will run on: `http://localhost:3001/api`

### Start Frontend (Terminal 2)
```powershell
Set-Location -Path 'C:\Users\kolli\universal-publishers\frontend'
npm run dev
```
Frontend will run on: `http://localhost:3000`

### Test Endpoints
```powershell
# Test backend directly
node -e "fetch('http://localhost:3001/api/journals').then(r=>r.json()).then(d=>console.log(d.length,'journals')).catch(e=>console.error(e.message));"

# Open in browser
http://localhost:3000/journals
```

---

## Folder Structure Summary

```
universal-publishers/
├── backend/
│   └── src/
│       ├── api/           (Empty - for future versioning)
│       ├── routes/        (Created - for route organization)
│       ├── models/        (Created - contains journal.model.ts)
│       ├── journals/      (Feature module)
│       │   ├── journals.controller.ts
│       │   ├── journals.service.ts
│       │   ├── journals.module.ts
│       │   └── dto/
│       ├── prisma/
│       ├── config/
│       └── main.ts        (Added global /api prefix)
│
└── frontend/
    └── src/
        ├── app/
        │   ├── journals/
        │   │   └── page.tsx   (Optimized with memo/callback)
        │   └── layout.tsx
        ├── components/
        │   ├── JournalCard.tsx  (New memoized component)
        │   └── layout/
        ├── services/
        │   └── api.ts         (Direct backend calls)
        ├── store/
        ├── styles/
        └── types/
            └── index.ts       (Updated Journal type)
```

---

## Next Steps (Optional)

1. **Add pagination** to journals list for large datasets
2. **Implement journal detail pages** at `/journals/[id]`
3. **Add error boundaries** for better error handling
4. **Create loading skeletons** for better UX
5. **Add search debouncing** (currently instant filter)
6. **Implement caching** with React Query or SWR

---

## Testing Checklist

- [x] Backend starts on port 3001 with `/api` prefix
- [x] Frontend starts on port 3000
- [x] `/api/journals` endpoint returns 10 seeded journals
- [x] Journals page displays 2 journals per row (grid view)
- [x] Search filters journals correctly
- [x] Subject dropdown filters work
- [x] No TypeScript errors
- [x] No hydration warnings
- [x] Components properly memoized
- [x] Images lazy load correctly
