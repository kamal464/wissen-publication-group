# 🔧 Fix Database Issues - Production Ready

**Robust fixes for database schema and PostgreSQL errors**

---

## 🚨 **ISSUE 1: Missing `Journal.content` Column**

**Error:** `The column Journal.content does not exist in the current database`

**Root Cause:** Database schema is out of sync with Prisma schema

**Solution:** Create and apply migration

---

## 🚨 **ISSUE 2: PostgreSQL "could not write init file"**

**Error:** `FATAL: could not write init file`

**Root Causes:**
1. **Disk space full** (most common)
2. **PostgreSQL data directory permissions**
3. **PostgreSQL temp directory full**

**Solution:** Fix disk space and PostgreSQL permissions

---

## 🔧 **ROBUST FIX - Step by Step:**

### Step 1: Fix Disk Space (Critical First!)

```bash
cd /var/www/wissen-publication-group && \
echo "=== Checking Disk Space ===" && \
df -h / && \
echo "" && \
echo "=== Cleaning Up ===" && \
# Clean npm cache
npm cache clean --force 2>/dev/null || true && \
# Clean old logs
sudo journalctl --vacuum-time=3d 2>/dev/null || true && \
sudo find /var/log -type f -name "*.log" -mtime +7 -delete 2>/dev/null || true && \
# Clean PM2 logs
pm2 flush 2>/dev/null || true && \
# Clean PostgreSQL temp files (if safe)
sudo find /var/lib/postgresql -type f -name "*.tmp" -mtime +1 -delete 2>/dev/null || true && \
echo "" && \
echo "=== After Cleanup ===" && \
df -h /
```

### Step 2: Fix PostgreSQL Permissions

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Fix PostgreSQL data directory permissions (if needed)
sudo chown -R postgres:postgres /var/lib/postgresql
sudo chmod 700 /var/lib/postgresql/*/main 2>/dev/null || true

# Restart PostgreSQL
sudo systemctl restart postgresql && \
sleep 5 && \
sudo systemctl status postgresql | head -5
```

### Step 3: Check Current Database Schema

```bash
cd /var/www/wissen-publication-group/backend && \
echo "Checking if Journal.content column exists..." && \
psql $DATABASE_URL -c "\d \"Journal\"" | grep content || echo "Column missing - will create migration"
```

### Step 4: Create Migration for Missing Column

**On your LOCAL machine (not server):**

```bash
cd backend

# Check migration status
npx prisma migrate status

# Create migration for missing content column
npx prisma migrate dev --name add_journal_content_column --create-only

# This creates a migration file. Edit it to add:
# ALTER TABLE "Journal" ADD COLUMN "content" TEXT;

# Then commit and push to git
git add prisma/migrations/
git commit -m "Add missing Journal.content column migration"
git push origin main
```

**OR manually create migration on server (if needed):**

```bash
cd /var/www/wissen-publication-group/backend && \
# Create migration directory
mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_add_journal_content_column && \
# Create migration SQL
cat > prisma/migrations/$(ls -t prisma/migrations/ | head -1)/migration.sql << 'EOF'
-- AlterTable
ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "content" TEXT;
EOF
echo "✅ Migration file created"
```

### Step 5: Apply Migration to Production

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== Pulling latest code ===" && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
echo "" && \
echo "=== Checking migration status ===" && \
npx prisma migrate status || echo "⚠️ Migration status check failed" && \
echo "" && \
echo "=== Applying migrations ===" && \
npx prisma migrate deploy && \
echo "" && \
echo "=== Regenerating Prisma Client ===" && \
npx prisma generate && \
echo "" && \
echo "=== Verifying schema ===" && \
psql $DATABASE_URL -c "\d \"Journal\"" | grep content && \
echo "✅ Database schema fixed!"
```

### Step 6: Verify Database Schema

```bash
cd /var/www/wissen-publication-group/backend && \
echo "Verifying Journal table columns..." && \
psql $DATABASE_URL -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Journal' AND column_name = 'content';" && \
echo "" && \
echo "✅ Verification complete!"
```

---

## 🚀 **COMPLETE FIX - All-in-One Command:**

```bash
cd /var/www/wissen-publication-group && \
echo "=== STEP 1: Fix Disk Space ===" && \
df -h / && \
npm cache clean --force 2>/dev/null || true && \
sudo journalctl --vacuum-time=3d 2>/dev/null || true && \
pm2 flush 2>/dev/null || true && \
echo "" && \
echo "=== STEP 2: Fix PostgreSQL ===" && \
sudo systemctl restart postgresql && \
sleep 5 && \
echo "" && \
echo "=== STEP 3: Pull Latest Code ===" && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
echo "" && \
echo "=== STEP 4: Apply Migrations ===" && \
cd backend && \
npx prisma migrate deploy && \
npx prisma generate && \
echo "" && \
echo "=== STEP 5: Verify Schema ===" && \
psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'Journal' AND column_name = 'content';" && \
echo "" && \
echo "=== STEP 6: Restart Services ===" && \
cd .. && \
pm2 restart wissen-backend && \
sleep 5 && \
pm2 list && \
echo "✅ Database issues fixed!"
```

---

## 📋 **PREVENTION - Add to Deployment Process:**

### Update Deployment Commands to Include:

1. **Check disk space before deployment**
2. **Verify PostgreSQL is running**
3. **Always run `prisma migrate deploy`**
4. **Verify schema after migration**
5. **Restart services after schema changes**

---

## 🔍 **TROUBLESHOOTING:**

### If Migration Fails:

```bash
# Check what migrations are pending
cd /var/www/wissen-publication-group/backend && \
npx prisma migrate status

# Check database connection
psql $DATABASE_URL -c "SELECT version();"

# Check if table exists
psql $DATABASE_URL -c "\dt" | grep Journal

# Manually add column if migration fails
psql $DATABASE_URL -c 'ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "content" TEXT;'
```

### If PostgreSQL Still Failing:

```bash
# Check PostgreSQL logs
sudo tail -50 /var/log/postgresql/postgresql-*-main.log

# Check disk space in PostgreSQL directory
df -h /var/lib/postgresql

# Check PostgreSQL configuration
sudo -u postgres psql -c "SHOW data_directory;"
```

---

## ✅ **VERIFICATION:**

After fixing, verify:

```bash
# 1. Check column exists
psql $DATABASE_URL -c "\d \"Journal\"" | grep content

# 2. Test query
psql $DATABASE_URL -c 'SELECT id, title, content FROM "Journal" LIMIT 1;'

# 3. Test Prisma query (via API)
curl -s http://localhost:3001/api/journals | head -20
```

---

**Key Points:**
- ✅ Always check disk space first
- ✅ Fix PostgreSQL permissions if needed
- ✅ Use `prisma migrate deploy` (not `migrate dev`)
- ✅ Verify schema after migration
- ✅ Restart services after schema changes
