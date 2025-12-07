# Article Volume and Issue Management - Dataflow Documentation

## Overview
This document explains the dataflow between **Articles in Press**, **Current Issue**, and **Archive Page**, and how articles are organized by volume, issue, and year.

## Dataflow

### 1. Articles in Press (`/journal-admin/journals/articles-press`)
- **Status**: `ACCEPTED`
- **Purpose**: Articles that have been accepted but not yet published in an issue
- **Volume Assignment**: **REQUIRED** - When creating an article, you must specify:
  - Volume Number (e.g., "7", "6")
  - Issue Number (e.g., "9", "1")
  - Issue Month (e.g., "January", "February")
  - Year (e.g., "2025", "2024")
- **Flow**: Articles are created here with volume/issue information. They can be moved to "Current Issue" when ready to publish.

### 2. Current Issue (`/journal-admin/journals/current-issue`)
- **Status**: `PUBLISHED`
- **Purpose**: The latest published issue containing articles that are currently live
- **Volume/Issue**: Articles retain their volume and issue information from "Articles in Press"
- **Flow**: 
  - Articles are moved here from "Articles in Press" by changing status from `ACCEPTED` to `PUBLISHED`
  - Articles can be moved back to "Articles in Press" by changing status from `PUBLISHED` to `ACCEPTED` (unpublishing)

### 3. Archive Page (`/journal-admin/journals/archive`)
- **Status**: `PUBLISHED`
- **Purpose**: Historical archive of all published issues organized by year, volume, and issue
- **Organization**: 
  - Articles are grouped by **Year** (e.g., 2025, 2024)
  - Within each year, articles are organized by **Volume** and **Issue** (e.g., Volume 7, Issue 9)
  - Display format matches the reference image: Two-column layout with year headers, and 3-column grid of volume/issue buttons
- **Flow**: All published articles automatically appear in the archive, organized by their volume, issue, and year

## Database Schema Changes

### Article Model Fields Added:
```prisma
// Volume and Issue Management
volumeNo     String?   // Volume number (e.g., "7", "6")
issueNo      String?   // Issue number (e.g., "9", "1")
issueMonth   String?   // Issue month (e.g., "January", "February")
year         String?   // Publication year (e.g., "2025", "2024")
specialIssue String?   // Special issue or conference title

// Additional publication details
firstPageNumber String?
lastPageNumber  String?
doi             String?
correspondingAuthorDetails String? @db.Text
citeAs          String? @db.Text
country         String?
receivedAt      DateTime?
acceptedAt      DateTime?

// Fulltext content
fulltextImages  String? @db.Text // JSON array of image paths
heading1Title   String?
heading1Content String? @db.Text
heading2Title   String?
heading2Content String? @db.Text
heading3Title   String?
heading3Content String? @db.Text
heading4Title   String?
heading4Content String? @db.Text
heading5Title   String?
heading5Content String? @db.Text
```

## Implementation Details

### Backend Changes:
1. **Prisma Schema** (`backend/prisma/schema.prisma`):
   - Added volume, issue, year, and related fields to Article model

2. **DTOs** (`backend/src/articles/dto/create-article.dto.ts`):
   - Added optional fields for volume, issue, year, and all related publication details

3. **Service** (`backend/src/articles/articles.service.ts`):
   - Updated `create()` method to accept and save volume/issue fields
   - Updated `update()` method to handle volume/issue fields (already had support)

### Frontend Changes:
1. **Articles in Press** (`frontend/src/app/journal-admin/journals/articles-press/page.tsx`):
   - **Volume is now REQUIRED** when creating articles
   - Validation ensures volume, issue, month, and year are provided
   - All volume/issue fields are sent to backend when creating/updating articles

2. **Archive Page** (`frontend/src/app/journal-admin/journals/archive/page.tsx`):
   - Displays articles organized by year (two-column layout)
   - Within each year, shows volume/issue buttons in a 3-column grid (matching reference image)
   - Clicking a volume/issue button shows all articles for that specific issue

3. **Current Issue** (`frontend/src/app/journal-admin/journals/current-issue/page.tsx`):
   - Already displays published articles with their volume/issue information
   - Can filter by month/year to find specific issues

## Workflow Example

1. **Create Article in "Articles in Press"**:
   - Journal admin creates a new article
   - **Must specify**: Volume 7, Issue 9, Month: January, Year: 2025
   - Article status: `ACCEPTED`
   - Article appears in "Articles in Press"

2. **Move to "Current Issue"**:
   - Journal admin selects articles and clicks "Move to Current Issue"
   - Article status changes to `PUBLISHED`
   - Article appears in "Current Issue" page
   - Article retains volume/issue information (Volume 7, Issue 9)

3. **Archive Display**:
   - Article automatically appears in Archive Page
   - Organized under Year: 2025
   - Listed as "Volume 7, Issue 9"
   - Clicking the button shows all articles for Volume 7, Issue 9

## Migration Required

**Important**: Run the Prisma migration to add the new fields to the database:

```bash
cd backend
npx prisma migrate dev --name add_volume_issue_year_to_articles
```

This will create the migration file and apply it to your database.

## Notes

- **Volume is REQUIRED** for all new articles created in "Articles in Press"
- Articles without volume/issue information will be skipped in the Archive page
- The Archive page displays issues in descending order (newest first)
- Issues within each year are sorted by volume (descending), then by issue (descending)


