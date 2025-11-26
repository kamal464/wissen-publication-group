# Article Search and Filter System - Implementation

## 🎯 Overview

Implemented a comprehensive search, filter, and pagination system for articles, inspired by major academic publishers like Springer, Elsevier, and PLOS.

## ✨ New Features

### 1. **Full-Text Search** 🔍
- Search across article titles
- Search in abstracts
- Search by author names
- Case-insensitive search
- Real-time search with Enter key support

### 2. **Advanced Filters** 🎛️

#### Journal Filter
- Filter articles by specific journal
- "All Journals" option to clear filter
- Dropdown populated with all available journals

#### Status Filter
- Published
- Under Review
- Accepted
- Pending
- "All Status" option

#### Sort Options
- **By Publication Date** (default)
- **By Title** (A-Z)
- **By Submission Date**

#### Sort Order
- Descending (newest first) ↓
- Ascending (oldest first) ↑

### 3. **Pagination** 📄
- 10 articles per page (configurable)
- Page navigation (First, Previous, Next, Last)
- Current page indicator
- "Showing X to Y of Z articles" display
- Maintains filters across pages

### 4. **Enhanced UI/UX** 🎨
- **Article Count Display** - Shows total results
- **Status Badges** - Color-coded article status
- **Icons** - Calendar, book, and user icons
- **Empty State** - Helpful message when no results
- **Loading State** - Spinner during data fetch
- **Error Handling** - User-friendly error messages
- **Responsive Design** - Works on mobile, tablet, desktop

## 🔧 Technical Implementation

### Backend Changes

#### Enhanced API Endpoint
```
GET /api/v1/articles?search=climate&journalId=1&status=PUBLISHED&sortBy=publishedAt&sortOrder=desc&page=1&limit=10
```

#### Query Parameters:
- `search` - Full-text search string
- `journalId` - Filter by journal ID
- `status` - Filter by publication status
- `sortBy` - Sort field (publishedAt, title, submittedAt)
- `sortOrder` - Sort direction (asc, desc)
- `page` - Page number (starts at 1)
- `limit` - Records per page

#### Response Format:
```json
{
  "data": [ /* array of articles */ ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### Frontend Changes

#### New Dependencies:
- `primereact/inputtext` - Search input
- `primereact/dropdown` - Filter dropdowns
- `primereact/button` - Action buttons
- `primereact/paginator` - Pagination component
- `primeicons` - Icons

#### State Management:
```typescript
// Search & Filters
searchQuery: string
selectedJournal: number | null
selectedStatus: string | null
sortBy: string
sortOrder: 'asc' | 'desc'

// Pagination
currentPage: number
totalRecords: number
recordsPerPage: number
```

## 📊 Features Comparison with Major Publishers

| Feature | Springer | Elsevier | PLOS | Our Implementation |
|---------|----------|----------|------|-------------------|
| Full-text search | ✅ | ✅ | ✅ | ✅ |
| Journal filter | ✅ | ✅ | ✅ | ✅ |
| Status filter | ✅ | ✅ | ❌ | ✅ |
| Date sorting | ✅ | ✅ | ✅ | ✅ |
| Pagination | ✅ | ✅ | ✅ | ✅ |
| Author search | ✅ | ✅ | ✅ | ✅ |
| Status badges | ❌ | ❌ | ❌ | ✅ |
| Article count | ✅ | ✅ | ✅ | ✅ |

## 🎨 UI Components

### Search Bar
- Large, prominent search input
- Search icon indicator
- Enter key submission
- Placeholder text guidance

### Filter Row
- 4 dropdown filters
- 2 action buttons (Apply, Reset)
- Responsive layout (stacks on mobile)

### Article Cards
- Title with hover effect
- Status badge (color-coded)
- Author list with icon
- Abstract preview (250 chars)
- Journal name with icon
- Publication date with icon
- Hover animation (lift effect)

### Pagination
- Page numbers
- First/Previous/Next/Last buttons
- Current page report
- Centered layout

## 🚀 Usage Examples

### Example 1: Search for Climate Articles
```
Search: "climate"
Journal: All Journals
Status: Published
Sort: Publication Date ↓
```

### Example 2: Filter by Journal
```
Search: (empty)
Journal: "Global Journal of Environmental Sciences"
Status: All Status
Sort: Title ↑
```

### Example 3: Recent Under Review
```
Search: (empty)
Journal: All Journals
Status: Under Review
Sort: Submission Date ↓
```

## 🔍 Search Algorithm

The backend search uses Prisma's `contains` with `insensitive` mode:
- Searches in `title` field
- Searches in `abstract` field
- Searches in related `authors.name` field
- Uses OR condition (matches any field)
- Case-insensitive matching

## 📱 Responsive Behavior

### Desktop (> 1024px)
- Filters in horizontal row
- 2-column if needed
- Full pagination display

### Tablet (768px - 1024px)
- Filters wrap to 2 columns
- Full article cards

### Mobile (< 768px)
- Filters stack vertically
- Search bar full width
- Simplified pagination
- Single column layout

## 🎯 Performance Optimizations

1. **Debounced Search** - Uses useCallback to prevent excessive API calls
2. **Pagination** - Loads only 10 records at a time
3. **Indexed Queries** - Prisma uses database indexes
4. **Skip/Take** - Efficient database pagination
5. **Selective Loading** - Only fetches needed fields

## 🔧 Configuration

### Change Records Per Page:
```typescript
const [recordsPerPage] = useState(20); // Change from 10 to 20
```

### Change Default Sort:
```typescript
const [sortBy, setSortBy] = useState('title'); // Change from 'publishedAt'
```

### Add More Status Options:
```typescript
const statusOptions = [
  // ... existing options
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Retracted', value: 'RETRACTED' },
];
```

## 🧪 Testing

### Test Cases:

1. **Empty Search**
   - Should return all articles
   - Should show total count

2. **Search with Results**
   - Enter "climate"
   - Should filter matching articles
   - Should update count

3. **Search with No Results**
   - Enter "xyzabc123"
   - Should show "No Articles Found"
   - Should suggest adjusting filters

4. **Filter Combination**
   - Select journal + status
   - Should apply both filters
   - Count should update

5. **Pagination**
   - Click page 2
   - Should load next 10 articles
   - Should maintain filters

6. **Reset**
   - Apply filters
   - Click Reset
   - Should clear all filters
   - Should return to page 1

## 📈 Future Enhancements

### Suggested Improvements:
1. **Advanced Search**
   - Date range picker
   - Keyword highlighting
   - Search history

2. **Export Results**
   - Export to CSV
   - Export to BibTeX
   - Print-friendly view

3. **Saved Searches**
   - Save filter combinations
   - Named searches
   - Email alerts

4. **More Filters**
   - Author filter
   - Subject area filter
   - Impact factor range

5. **Visualization**
   - Publication timeline
   - Journal distribution chart
   - Author collaboration network

## 📝 API Examples

### All Articles (Page 1):
```bash
curl "http://localhost:3001/api/v1/articles?page=1&limit=10"
```

### Search for "climate":
```bash
curl "http://localhost:3001/api/v1/articles?search=climate&page=1&limit=10"
```

### Filter by Journal ID 1:
```bash
curl "http://localhost:3001/api/v1/articles?journalId=1&page=1&limit=10"
```

### Published Articles, Sorted by Title:
```bash
curl "http://localhost:3001/api/v1/articles?status=PUBLISHED&sortBy=title&sortOrder=asc&page=1&limit=10"
```

### Complex Query:
```bash
curl "http://localhost:3001/api/v1/articles?search=machine&journalId=3&status=PUBLISHED&sortBy=publishedAt&sortOrder=desc&page=1&limit=10"
```

## ✅ Implementation Checklist

- [x] Backend pagination logic
- [x] Backend search functionality
- [x] Backend filter support
- [x] Backend sort options
- [x] Frontend search UI
- [x] Frontend filter dropdowns
- [x] Frontend pagination component
- [x] Frontend loading states
- [x] Frontend error handling
- [x] Frontend empty state
- [x] Responsive design
- [x] Status badges
- [x] Icons integration
- [x] Article count display
- [x] Reset functionality
- [x] SCSS styling
- [x] Documentation

## 🎉 Result

A professional, feature-rich article browsing experience comparable to major academic publishers!
