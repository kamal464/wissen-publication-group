# Article Detail Page Implementation

## Overview
This implementation creates a comprehensive article detail page with dynamic routing, related articles sidebar, breadcrumb navigation, and full article information display.

## Features Implemented

### 1. Backend API (`/api/v1/articles/:id`)
- **ArticlesModule**: Complete NestJS module with controller, service, and DTOs
- **Endpoints**:
  - `GET /api/v1/articles` - Get all articles (with optional journalId filter)
  - `GET /api/v1/articles/:id` - Get single article with authors and journal info
  - `GET /api/v1/articles/:id/related` - Get related articles from same journal
  - `POST /api/v1/articles` - Create new article
  - `PATCH /api/v1/articles/:id` - Update article
  - `DELETE /api/v1/articles/:id` - Delete article

### 2. Frontend Components

#### Dynamic Route: `/articles/[id]/page.tsx`
- Fetches article data using the article ID from URL params
- Displays comprehensive article information
- Includes error and loading states
- Responsive layout with main content and sidebar

#### Article Information Displayed:
- **Title**: Full article title
- **Authors**: List of authors with affiliations and email
- **Abstract**: Complete article abstract
- **PDF Link**: Direct link to S3/external PDF URL
- **Journal Information**: Journal name, ISSN, publisher
- **Publication Date**: When the article was published
- **Status Badge**: Current article status (Published, Pending, etc.)

#### Breadcrumb Component (`components/Breadcrumb.tsx`)
- Navigation path: Home → Journals → Journal Name → Article Title
- Clickable links for navigation
- ARIA compliant for accessibility

#### Related Articles Sidebar (`components/RelatedArticles.tsx`)
- Shows up to 5 related articles from the same journal
- Each related article shows:
  - Title
  - Authors
  - Publication date
- Clickable links to navigate to related articles

### 3. Styling
- Comprehensive SCSS styles in `_article-detail.scss`
- Responsive design with grid layout
- Mobile-first approach
- Professional academic styling
- Hover effects and transitions
- Color-coded status badges

### 4. Type Safety
- TypeScript types for Article and Author
- Full type safety across frontend and backend
- API response types properly defined

### 5. Sample Data
- Seeded 5 sample articles with real-world topics
- Multiple authors per article
- Different journals and publication dates
- Complete abstracts and metadata

## File Structure

```
backend/
├── src/
│   ├── articles/
│   │   ├── articles.controller.ts
│   │   ├── articles.service.ts
│   │   ├── articles.module.ts
│   │   └── dto/
│   │       ├── create-article.dto.ts
│   │       └── update-article.dto.ts
│   └── app.module.ts (updated)
└── prisma/
    └── seed.ts (updated)

frontend/
├── src/
│   ├── app/
│   │   └── articles/
│   │       ├── page.tsx (list view)
│   │       └── [id]/
│   │           └── page.tsx (detail view)
│   ├── components/
│   │   ├── Breadcrumb.tsx
│   │   └── RelatedArticles.tsx
│   ├── types/
│   │   └── index.ts (updated with Article & Author)
│   ├── services/
│   │   └── api.ts (updated)
│   └── styles/
│       └── components/
│           └── _article-detail.scss
```

## API Response Examples

### GET /api/v1/articles/:id
```json
{
  "id": 1,
  "title": "Climate Change Mitigation Through Renewable Energy Integration",
  "abstract": "This study examines the effectiveness...",
  "authors": [
    {
      "id": 1,
      "name": "Dr. Sarah Martinez",
      "email": "sarah.martinez@example.com",
      "affiliation": "MIT Climate Lab"
    }
  ],
  "journal": {
    "id": 1,
    "title": "Global Journal of Environmental Sciences",
    "issn": "2765-9820",
    "publisher": "Universal Publishers"
  },
  "journalId": 1,
  "status": "PUBLISHED",
  "pdfUrl": "https://example.com/sample-paper-1.pdf",
  "submittedAt": "2024-09-15T00:00:00.000Z",
  "publishedAt": "2024-09-15T00:00:00.000Z"
}
```

### GET /api/v1/articles/:id/related
```json
[
  {
    "id": 2,
    "title": "Biodiversity Conservation in Urban Ecosystems",
    "authors": [...],
    "journal": {...},
    ...
  }
]
```

## Usage

### Testing the Backend
```bash
cd backend
npm run start:dev

# Test endpoints
curl http://localhost:3001/api/v1/articles
curl http://localhost:3001/api/v1/articles/1
curl http://localhost:3001/api/v1/articles/1/related
```

### Testing the Frontend
```bash
cd frontend
npm run dev

# Navigate to:
# http://localhost:3000/articles (list view)
# http://localhost:3000/articles/1 (detail view)
```

## Key Features

### 1. SEO Friendly
- Semantic HTML structure
- Proper heading hierarchy
- Meta information for articles

### 2. Accessible
- ARIA labels on breadcrumbs
- Semantic navigation elements
- Keyboard navigation support

### 3. Responsive Design
- Mobile-first approach
- Grid layout that adapts to screen size
- Sidebar moves to top on mobile devices

### 4. Error Handling
- Loading states during data fetch
- Error messages for failed requests
- 404 handling for non-existent articles

### 5. Performance
- Efficient data fetching
- Minimal re-renders
- Optimized images and icons

## Database Schema

The Article model includes:
- `id`: Primary key
- `title`: Article title
- `abstract`: Full abstract text
- `authors`: Many-to-many relationship with Author model
- `journal`: Foreign key to Journal
- `status`: Article status (PENDING, UNDER_REVIEW, ACCEPTED, PUBLISHED)
- `pdfUrl`: Link to PDF file (S3 URL)
- `submittedAt`: Submission timestamp
- `publishedAt`: Publication timestamp

## Next Steps

To enhance this implementation, consider:

1. **Search & Filtering**: Add article search and filtering by journal, author, date
2. **Citations**: Display citation count and export citation formats
3. **Comments**: Add comment section for discussions
4. **Social Sharing**: Add social media sharing buttons
5. **PDF Viewer**: Embed PDF viewer instead of external link
6. **Metrics**: Display article views, downloads, citations
7. **Recommendations**: ML-based article recommendations
8. **Bookmarking**: Allow users to save articles for later

## Dependencies Added

Backend:
- `class-validator`: Validation decorators
- `class-transformer`: Transform objects
- `@nestjs/mapped-types`: Partial type utilities

No new frontend dependencies required - used existing Next.js and React setup.
