# Database Migration Guide

This guide explains how to run database migrations for the Wissen Publication Group backend.

## Problem

If you see errors like:
```
Invalid `prisma.user.findFirst()` invocation: The table `public.User` does not exist in the current database.
Invalid `prisma.journalShortcode.findMany()` invocation: The table `public.JournalShortcode` does not exist in the current database.
```

This means the database migrations haven't been applied to your database.

## Solution

### Option 1: Automatic Migration (Recommended)

Migrations are now **automatically run** when the Docker container starts. The entrypoint script runs `prisma migrate deploy` before starting the application.

### Option 2: Manual Migration (Local Development)

If you're running the backend locally:

```bash
cd backend

# Set your DATABASE_URL
export DATABASE_URL="your-database-url"

# Run migrations
npx prisma migrate deploy
```

### Option 3: Manual Migration (Production/Cloud Run)

If you need to run migrations manually in production:

```bash
# Connect to your Cloud Run service
gcloud run services describe wissen-api --region us-central1

# Or run migrations using Cloud Run Jobs (recommended for production)
gcloud run jobs create run-migrations \
  --image us-central1-docker.pkg.dev/wissen-publication-group/wissen-api/wissen-api:latest \
  --region us-central1 \
  --set-env-vars DATABASE_URL="$DATABASE_URL" \
  --command "npx" \
  --args "prisma,migrate,deploy"
```

## Migration Scripts

### Shell Script (Linux/Mac)

```bash
cd backend
./scripts/run-migrations.sh
```

### Node.js Script (Cross-platform)

```bash
cd backend
node scripts/run-migrations.js
```

## Prisma Commands

### Check Migration Status

```bash
npx prisma migrate status
```

### Create New Migration

```bash
# After modifying schema.prisma
npx prisma migrate dev --name your_migration_name
```

### Reset Database (⚠️ DANGER - Deletes all data)

```bash
npx prisma migrate reset
```

### Deploy Migrations (Production)

```bash
npx prisma migrate deploy
```

## Troubleshooting

### Migration Fails

1. **Check DATABASE_URL**: Ensure it's correctly set
   ```bash
   echo $DATABASE_URL
   ```

2. **Check Database Connection**: Verify you can connect
   ```bash
   npx prisma db pull
   ```

3. **Check Migration Status**: See what migrations are pending
   ```bash
   npx prisma migrate status
   ```

### Tables Still Don't Exist

1. **Verify migrations exist**: Check `backend/prisma/migrations/` folder
2. **Check migration history**: Run `npx prisma migrate status`
3. **Force migration**: If needed, you can manually run SQL from migration files

### Connection Issues

1. **Check DATABASE_URL format**: Should be `postgresql://user:password@host:port/database`
2. **Verify network access**: Ensure your IP is allowed (for Supabase, check connection settings)
3. **Check SSL requirements**: Some databases require SSL connections

## Migration Files

Migrations are stored in `backend/prisma/migrations/`. Each migration folder contains:
- `migration.sql` - The SQL to execute
- Migration name format: `YYYYMMDDHHMMSS_description`

## Important Notes

1. **Never modify migration files** after they've been applied to production
2. **Always test migrations** in a development environment first
3. **Backup your database** before running migrations in production
4. **Use `migrate deploy`** in production (not `migrate dev`)

## Current Migrations

The following migrations should be applied:

1. `20251006203133_init` - Initial schema
2. `20251012045546_add_message_model` - Message model
3. `20251012060000_add_journal_metadata` - Journal metadata fields
4. `20251013173529_add_keywords_to_article` - Article keywords
5. `20251102144446_add_admin_models` - User, JournalShortcode, WebPage, BoardMember, Notification
6. `20251116092017_add_user_password` - User password field
7. `20251126184536_add_journal_image_fields` - Journal image fields
8. `20251126194208_add_homepage_fields` - Homepage fields
9. `20251128161310_update_board_member_fields` - BoardMember updates

## Verification

After running migrations, verify tables exist:

```bash
# Using Prisma Studio (visual database browser)
npx prisma studio

# Or using psql
psql $DATABASE_URL -c "\dt"
```

You should see tables like:
- User
- JournalShortcode
- Journal
- Article
- BoardMember
- etc.

## Support

If migrations continue to fail:
1. Check Prisma logs for detailed error messages
2. Verify DATABASE_URL is correct
3. Ensure database user has CREATE TABLE permissions
4. Check database connection limits

