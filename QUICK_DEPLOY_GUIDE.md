# Quick Guide: Deploy Database Changes to Production

## Current Setup ✅

Your Docker setup is **already configured** to run migrations automatically! The `backend/Dockerfile` includes an entrypoint script that runs `prisma migrate deploy` when the container starts.

## Quick Steps

### 1. Check if you have schema changes

```powershell
cd backend
npx prisma migrate status
```

### 2. If you have changes, create a migration

```powershell
# Create migration with a descriptive name
npx prisma migrate dev --name your_change_description

# Example:
npx prisma migrate dev --name fix_duplicate_journals
```

### 3. Verify migration files were created

```powershell
# Check migrations folder
ls prisma\migrations
```

You should see a new folder with timestamp and your migration name.

### 4. Test migration locally (simulates production)

```powershell
npx prisma migrate deploy
```

This applies migrations without creating new ones (like production does).

### 5. Commit and push

**If you're in the root directory:**
```powershell
git add backend/prisma/schema.prisma
git add backend/prisma/migrations/
git commit -m "Database migration: your_change_description"
git push origin main
```

**If you're already in the backend directory:**
```powershell
git add prisma/schema.prisma
git add prisma/migrations/
cd ..  # Go back to root for commit
git commit -m "Database migration: your_change_description"
git push origin main
```

### 6. Deploy to production

**If using Docker Compose:**
```powershell
docker-compose down
docker-compose build
docker-compose up -d
```

**If using manual Docker:**
```powershell
# On production server
git pull origin main
docker build -t your-backend-image:latest ./backend
docker stop your-backend-container
docker run -d --name your-backend-container -p 8080:8080 -e DATABASE_URL="..." your-backend-image:latest
```

### 7. Verify migrations ran

```powershell
# Check container logs
docker logs your-backend-container

# Look for:
# 🔄 Running database migrations...
# ✅ Migrations completed
# 🚀 Starting application...
```

## Important Notes

### ✅ What Works Automatically

- **Migrations run automatically** when Docker container starts
- The entrypoint script (`/app/entrypoint.sh`) handles this
- No manual intervention needed after deployment

### ⚠️ Before Deploying

1. **Always backup production database first:**
   ```powershell
   # If you have psql access
   pg_dump $DATABASE_URL > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
   ```

2. **Test migrations locally:**
   ```powershell
   npx prisma migrate deploy
   ```

3. **Review migration SQL files** before committing

### 🔍 Troubleshooting

**Migration fails in production:**
```powershell
# Check logs
docker logs your-backend-container

# Common issues:
# - Migration already applied (safe to ignore)
# - Database connection error (check DATABASE_URL)
# - Permission error (check DB user permissions)
```

**Manual migration (if needed):**
```powershell
docker exec -it your-backend-container sh
cd /app
npx prisma migrate deploy
exit
```

## Example: Complete Workflow

Let's say you made changes to fix duplicate journal issues:

```powershell
# 1. Create migration
cd backend
npx prisma migrate dev --name fix_journal_duplicates

# 2. Review the generated SQL
cat prisma\migrations\*\migration.sql

# 3. Test it
npx prisma migrate deploy

# 4. Commit
git add prisma/
git commit -m "Fix: Prevent duplicate journal creation"
git push

# 5. Deploy (on production server)
git pull
docker-compose build
docker-compose up -d

# 6. Verify
docker logs your-backend-container | Select-String -Pattern "migration"
```

## Need Help?

- See `DEPLOY_DB_CHANGES.md` for detailed documentation
- Run `backend/scripts/check-migrations.ps1` to check your setup
- Check Prisma docs: https://www.prisma.io/docs/concepts/components/prisma-migrate
