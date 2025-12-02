# Seed Latest News Data

## Instructions

To seed the database with sample latest news items, run the following command:

```bash
# Navigate to backend directory
cd backend

# Run the seed script using ts-node or tsx
npx ts-node prisma/seed-news.ts

# Or if you have tsx installed globally
tsx prisma/seed-news.ts
```

## What Gets Seeded

The script will create 5 sample news items:

1. **New Issue Published** (Pinned) - Announcement about Volume 12, Issue 3
2. **Call for Papers** (Pinned) - Special issue on AI in Healthcare
3. **Editorial Board Expansion** - Welcome new board members
4. **Journal Indexed** - Indexing achievement announcement
5. **Open Access Week** - Event announcement

## Database Model

The News model includes:
- `id` - Unique identifier
- `title` - News title
- `content` - News content (text)
- `link` - Optional link URL
- `isPinned` - Boolean to pin news at top
- `publishedAt` - Publication date
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## API Endpoints

After seeding, you can access news via:

- `GET /api/news` - Get all news items
- `GET /api/news/latest?limit=5` - Get latest 5 news items
- `GET /api/news/:id` - Get single news item
- `POST /api/news` - Create news item (admin/journal-admin)
- `PUT /api/news/:id` - Update news item (admin/journal-admin)
- `DELETE /api/news/:id` - Delete news item (admin/journal-admin)

## Frontend Display

News items are displayed in:
1. **Top News Bar** - Scrolling ticker at the top of the page
2. **Latest News Section** - Card grid on the homepage
3. **Journal Admin Panel** - Management interface at `/journal-admin/latest-news`

