# 🗄️ Clear Database Except Admin Credentials

**Run this on production server to clear all data except admin user**

---

## ⚠️ **WARNING: This will delete ALL data except admin user!**

**Make sure you have backups before running this!**

---

## 📋 **PRODUCTION DATABASE CLEAR COMMAND:**

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== STEP 1: Load database connection ===" && \
# Load DATABASE_URL from .env
export $(grep -v '^#' .env | grep DATABASE_URL | xargs) && \
# Extract connection details if DATABASE_URL is not set
if [ -z "$DATABASE_URL" ]; then
  DB_USER=$(grep DB_USER .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "postgres")
  DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "")
  DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "wissen_publication_group")
  DB_HOST=$(grep DB_HOST .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "localhost")
  DB_PORT=$(grep DB_PORT .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "5432")
  export PGPASSWORD="$DB_PASSWORD"
  DB_CONN="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
else
  DB_CONN="psql \"$DATABASE_URL\""
fi && \
echo "Database connection configured" && \
echo "" && \
echo "=== STEP 2: Backup admin user ===" && \
# Export admin user data
$DB_CONN -c "SELECT id, \"userName\", password, \"createdAt\", \"updatedAt\" FROM \"User\" WHERE \"userName\" = 'admin';" > /tmp/admin_backup.txt 2>/dev/null && \
echo "Admin user backed up to /tmp/admin_backup.txt" && \
echo "" && \
echo "=== STEP 3: Clear all tables except User ===" && \
# Clear all tables except User - handle foreign keys properly
$DB_CONN << 'EOF'
-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Delete in order: child tables first, then parent tables
DELETE FROM "Author";
DELETE FROM "Article";
DELETE FROM "BoardMember";
DELETE FROM "Journal";
DELETE FROM "Message";
DELETE FROM "Contact";
DELETE FROM "News";
DELETE FROM "Notification";
DELETE FROM "WebPage";
DELETE FROM "JournalShortcode";

-- Delete all users except admin
DELETE FROM "User" WHERE "userName" != 'admin';

-- Re-enable foreign key checks
SET session_replication_role = 'origin';
EOF
echo "" && \
echo "=== STEP 4: Verify admin user still exists ===" && \
$DB_CONN -c "SELECT id, \"userName\" FROM \"User\" WHERE \"userName\" = 'admin';" && \
echo "" && \
echo "✅ Database cleared! Admin user preserved."
```

---

## 🔄 **ALTERNATIVE: Using Prisma Studio (Safer for verification)**

If you want to verify before clearing:

```bash
cd /var/www/wissen-publication-group/backend && \
# Open Prisma Studio to verify data
npx prisma studio
```

Then manually delete records via the UI (except admin user).

---

## 🚀 **FULL DEPLOYMENT WITH DB CLEAR:**

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
echo "=== STEP 4: Backup and Clear Database ===" && \
cd backend && \
# Load DATABASE_URL from .env
export $(grep -v '^#' .env | grep DATABASE_URL | xargs) && \
# Extract connection details if DATABASE_URL is not set
if [ -z "$DATABASE_URL" ]; then
  DB_USER=$(grep DB_USER .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "postgres")
  DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "")
  DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "wissen_publication_group")
  DB_HOST=$(grep DB_HOST .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "localhost")
  DB_PORT=$(grep DB_PORT .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "5432")
  export PGPASSWORD="$DB_PASSWORD"
  DB_CONN="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
else
  DB_CONN="psql \"$DATABASE_URL\""
fi && \
# Backup admin
$DB_CONN -c "SELECT id, \"userName\", password, \"createdAt\", \"updatedAt\" FROM \"User\" WHERE \"userName\" = 'admin';" > /tmp/admin_backup.txt 2>/dev/null || echo "Admin backup skipped" && \
# Clear database - handle foreign keys properly
$DB_CONN << 'EOF'
SET session_replication_role = 'replica';
-- Delete in order: child tables first, then parent tables
DELETE FROM "Author";
DELETE FROM "Article";
DELETE FROM "BoardMember";
DELETE FROM "Journal";
DELETE FROM "Message";
DELETE FROM "Contact";
DELETE FROM "News";
DELETE FROM "Notification";
DELETE FROM "WebPage";
DELETE FROM "JournalShortcode";
-- Delete all users except admin
DELETE FROM "User" WHERE "userName" != 'admin';
SET session_replication_role = 'origin';
EOF
echo "" && \
echo "=== STEP 5: Apply Migrations ===" && \
npx prisma migrate deploy && \
npx prisma generate && \
echo "" && \
echo "=== STEP 6: Build Backend ===" && \
npm install --no-audit --no-fund --loglevel=error && \
npm run build && \
echo "" && \
echo "=== STEP 7: Build Frontend ===" && \
cd ../frontend && \
npm install --no-audit --no-fund --loglevel=error && \
npm run build && \
echo "" && \
echo "=== STEP 8: Restart Services ===" && \
cd .. && \
pm2 restart all && \
sleep 5 && \
pm2 save && \
sudo systemctl reload nginx && \
echo "" && \
echo "=== STEP 9: Verify ===" && \
pm2 list && \
curl -s http://localhost:3001/api/health && echo "" && \
echo "✅ Deployment complete! Database cleared except admin."
```

---

## 🔍 **VERIFY ADMIN USER:**

After clearing, verify admin still exists:

```bash
# First load connection
cd /var/www/wissen-publication-group/backend && \
export $(grep -v '^#' .env | grep DATABASE_URL | xargs) && \
if [ -z "$DATABASE_URL" ]; then
  DB_USER=$(grep DB_USER .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "postgres")
  DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "")
  DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "wissen_publication_group")
  export PGPASSWORD="$DB_PASSWORD"
  psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT id, \"userName\", \"createdAt\" FROM \"User\" WHERE \"userName\" = 'admin';"
else
  psql "$DATABASE_URL" -c "SELECT id, \"userName\", \"createdAt\" FROM \"User\" WHERE \"userName\" = 'admin';"
fi
```

---

## 🚨 **IF ADMIN USER IS MISSING:**

Restore from backup:

```bash
# Check backup file
cat /tmp/admin_backup.txt

# If needed, manually recreate admin user
psql $DATABASE_URL -c "INSERT INTO \"User\" (\"userName\", password, \"createdAt\", \"updatedAt\") VALUES ('admin', '\$2b\$10\$...', NOW(), NOW()) ON CONFLICT DO NOTHING;"
```

---

**⚠️ Remember:** This permanently deletes all data except the admin user. Make sure you have backups!
