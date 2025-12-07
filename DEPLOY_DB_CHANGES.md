# Deploying Database Changes to Production

This guide explains how to push database schema changes made locally to production using Docker.

## Overview

The Docker setup automatically runs migrations when the container starts. However, you need to:
1. Create migration files locally
2. Commit them to version control
3. Deploy to production
4. The container will automatically apply migrations on startup

## Step-by-Step Process

### 1. Create Migration from Local Changes

If you've made changes to `backend/prisma/schema.prisma`, create a migration:

```bash
cd backend
npx prisma migrate dev --name describe_your_changes
```

This will:
- Create a new migration file in `backend/prisma/migrations/`
- Apply the migration to your local database
- Regenerate Prisma Client

**Example:**
```bash
npx prisma migrate dev --name add_journal_shortcode_index
```

### 2. Verify Migration Files

Check that migration files were created:
```bash
ls -la backend/prisma/migrations/
```

You should see a new folder with a timestamp and your migration name, containing:
- `migration.sql` - The SQL changes
- `migration_lock.toml` - Lock file (should already exist)

### 3. Test Migration Locally

Verify the migration works:
```bash
cd backend
npx prisma migrate deploy
```

This applies pending migrations without creating new ones (like production does).

### 4. Commit Changes to Git

**If you're in the root directory:**
```bash
git add backend/prisma/schema.prisma
git add backend/prisma/migrations/
git commit -m "Add database migration: describe_your_changes"
git push origin main
```

**If you're already in the backend directory:**
```bash
git add prisma/schema.prisma
git add prisma/migrations/
cd ..  # Go back to root for commit
git commit -m "Add database migration: describe_your_changes"
git push origin main
```

### 5. Deploy to Production

#### Option A: Using Docker Compose (if available)

```bash
# Pull latest code
git pull origin main

# Rebuild and restart containers
docker-compose down
docker-compose build
docker-compose up -d
```

#### Option B: Manual Docker Deployment

```bash
# On production server, pull latest code
git pull origin main

# Rebuild Docker image
cd backend
docker build -t your-backend-image:latest .

# Stop existing container
docker stop your-backend-container

# Start new container (migrations run automatically via entrypoint.sh)
docker run -d \
  --name your-backend-container \
  -p 8080:8080 \
  -e DATABASE_URL="your-production-database-url" \
  your-backend-image:latest
```

### 6. Verify Migrations in Production

Check container logs to confirm migrations ran:
```bash
docker logs your-backend-container
```

You should see:
```
🔄 Running database migrations...
✅ Migrations completed
🚀 Starting application...
```

### 7. Verify Database Changes

Connect to production database and verify:
```bash
# Using Prisma Studio (if accessible)
cd backend
npx prisma studio

# Or using psql
psql $DATABASE_URL
\dt  # List tables
\d Journal  # Check Journal table structure
```

## Important Notes

### ⚠️ Migration Safety

1. **Always test migrations locally first** - Use `prisma migrate deploy` to simulate production
2. **Backup production database** before deploying:
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```
3. **Review migration SQL** - Check `migration.sql` files before committing
4. **Non-destructive changes first** - Add columns before removing them

### 🔄 How Docker Handles Migrations

The Dockerfile includes an entrypoint script (`/app/entrypoint.sh`) that:
1. Runs `npx prisma migrate deploy` on container startup
2. Applies all pending migrations
3. Then starts the application

This ensures migrations are always applied when the container starts.

### 📝 Migration Commands Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `prisma migrate dev` | Create and apply migration | Local development |
| `prisma migrate deploy` | Apply pending migrations | Production/CI |
| `prisma migrate reset` | Reset database (⚠️ deletes data) | Local testing only |
| `prisma db push` | Push schema without migration | Quick prototyping (not for production) |

### 🐛 Troubleshooting

#### Migration Fails in Production

1. **Check logs:**
   ```bash
   docker logs your-backend-container
   ```

2. **Common issues:**
   - Migration already applied: Safe to ignore
   - Database connection error: Check `DATABASE_URL` environment variable
   - Permission error: Check database user permissions
   - Schema drift: Database structure doesn't match migrations

3. **Manual migration (if needed):**
   ```bash
   docker exec -it your-backend-container sh
   cd /app
   npx prisma migrate deploy
   ```

#### Rollback Migration

Prisma doesn't support automatic rollbacks. To rollback:
1. Create a new migration that reverses the changes
2. Or manually edit the database (not recommended)

## Quick Checklist

- [ ] Created migration locally: `npx prisma migrate dev --name ...`
- [ ] Tested migration: `npx prisma migrate deploy`
- [ ] Committed migration files to git
- [ ] Pushed to repository
- [ ] Backed up production database
- [ ] Deployed to production
- [ ] Verified migrations ran (check logs)
- [ ] Verified database changes

## Example: Adding a New Field

Let's say you added a new field `newField` to the `Journal` model:

1. **Update schema.prisma:**
   ```prisma
   model Journal {
     // ... existing fields
     newField String?
   }
   ```

2. **Create migration:**
   ```bash
   cd backend
   npx prisma migrate dev --name add_new_field_to_journal
   ```

3. **Verify migration file:**
   ```bash
   cat backend/prisma/migrations/YYYYMMDDHHMMSS_add_new_field_to_journal/migration.sql
   ```

4. **Commit and push:**
   ```bash
   git add backend/prisma/
   git commit -m "Add newField to Journal model"
   git push
   ```

5. **Deploy to production** (see steps above)

6. **Verify in production:**
   ```bash
   docker logs your-backend-container | grep -i migration
   ```

## Additional Resources

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Backup Guide](https://www.postgresql.org/docs/current/backup.html)
