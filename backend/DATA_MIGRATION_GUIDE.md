# Data Migration Guide

## Important: Schema vs Data

**Prisma Migrations** (`prisma migrate`) only handle:
- ✅ Creating/modifying tables
- ✅ Adding/removing columns
- ✅ Creating indexes and constraints
- ❌ **NOT data migration**

**Data migration** is a separate process that copies actual records from one database to another.

## Current Setup

### Seed Data (Sample Data)

The `backend/prisma/seed.ts` file contains **sample/demo data**:
- 10 sample journals
- 5 sample articles with authors

This is **NOT your actual data** - it's just for testing/development.

### Running Seed Data

```bash
cd backend
npx prisma db seed
```

**Note:** Seed uses `upsert`, so it won't create duplicates if run multiple times.

## Migrating Your Actual Data

If you have **real data** in your local database that you want to migrate to production, you have several options:

### Option 1: PostgreSQL pg_dump/pg_restore (Recommended)

This is the most reliable method for PostgreSQL databases.

#### Step 1: Export from Local Database

```bash
# Export schema and data
pg_dump -h localhost -U postgres -d universal_publishers > local_backup.sql

# Or export only data (no schema)
pg_dump -h localhost -U postgres -d universal_publishers --data-only > local_data.sql

# Or export specific tables only
pg_dump -h localhost -U postgres -d universal_publishers -t "User" -t "Journal" -t "Article" > specific_tables.sql
```

#### Step 2: Import to Production Database

```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://user:password@host:port/database"

# Import data
psql $DATABASE_URL < local_data.sql

# Or using pg_restore (for custom format)
pg_restore -d $DATABASE_URL local_backup.sql
```

### Option 2: Prisma Data Migration Script

Create a custom script to export/import data using Prisma.

#### Export Script (`scripts/export-data.ts`)

```typescript
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function exportData() {
  const data = {
    journals: await prisma.journal.findMany(),
    articles: await prisma.article.findMany({
      include: { authors: true }
    }),
    users: await prisma.user.findMany(),
    journalShortcodes: await prisma.journalShortcode.findMany(),
    boardMembers: await prisma.boardMember.findMany(),
    contacts: await prisma.contact.findMany(),
    // Add other tables as needed
  };

  fs.writeFileSync('data-export.json', JSON.stringify(data, null, 2));
  console.log('✅ Data exported to data-export.json');
}

exportData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

#### Import Script (`scripts/import-data.ts`)

```typescript
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function importData() {
  const data = JSON.parse(fs.readFileSync('data-export.json', 'utf-8'));

  // Import in order (respecting foreign keys)
  for (const journal of data.journals) {
    await prisma.journal.upsert({
      where: { id: journal.id },
      update: journal,
      create: journal,
    });
  }

  for (const user of data.users) {
    await prisma.user.upsert({
      where: { userName: user.userName },
      update: user,
      create: user,
    });
  }

  // Continue for other tables...
  
  console.log('✅ Data imported successfully');
}

importData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Option 3: Direct Database Connection

If both databases are accessible, you can use PostgreSQL's `COPY` command:

```sql
-- On local database
COPY (SELECT * FROM "User") TO '/tmp/users.csv' WITH CSV HEADER;

-- On production database
COPY "User" FROM '/tmp/users.csv' WITH CSV HEADER;
```

### Option 4: Cloud SQL Import/Export (Google Cloud)

If using Google Cloud SQL:

```bash
# Export from local
gcloud sql export sql instance-name gs://bucket-name/backup.sql --database=universal_publishers

# Import to production
gcloud sql import sql instance-name gs://bucket-name/backup.sql --database=production_db
```

## Important Considerations

### 1. Foreign Key Constraints

When importing data, import in the correct order:
1. Journals (no dependencies)
2. Users
3. JournalShortcodes
4. Articles (depends on Journals)
5. Authors (depends on Articles)
6. BoardMembers (depends on Journals)
7. Contacts, Notifications, etc.

### 2. ID Conflicts

If your production database already has data:
- Use `upsert` instead of `create`
- Or reset IDs using sequences: `SELECT setval('"User_id_seq"', (SELECT MAX(id) FROM "User"));`

### 3. Sensitive Data

⚠️ **Never commit actual user data or passwords to Git!**
- Use environment variables for database URLs
- Encrypt backups if they contain sensitive information
- Follow GDPR/data protection regulations

### 4. Testing

Always test data migration on a **staging environment** first:
1. Export from local
2. Import to staging
3. Verify data integrity
4. Then import to production

## Automated Data Migration Script

I can create a comprehensive data migration script that:
- Exports all data from local database
- Validates data integrity
- Imports to production with proper error handling
- Handles foreign key relationships
- Provides rollback capability

Would you like me to create this script?

## Current Status

**What happens now:**
1. ✅ Migrations run automatically - creates all tables
2. ❌ Data is NOT migrated automatically
3. ✅ Seed data can be run manually with `npx prisma db seed`

**What you need to do:**
- If you have local data to migrate, use one of the options above
- If you're starting fresh, just run `npx prisma db seed` for sample data

## Quick Reference

```bash
# Check what data exists locally
cd backend
npx prisma studio  # Opens visual database browser

# Export specific table
psql $LOCAL_DATABASE_URL -c "COPY \"User\" TO '/tmp/users.csv' WITH CSV HEADER"

# Import to production
psql $PRODUCTION_DATABASE_URL -c "COPY \"User\" FROM '/tmp/users.csv' WITH CSV HEADER"
```

