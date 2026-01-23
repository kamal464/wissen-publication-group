# 🗄️ Clear Database - Direct Command

**Run this EXACT command on production server:**

```bash
cd /var/www/wissen-publication-group/backend && \
# Get database credentials from .env
DB_USER=$(grep "^DB_USER=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ' || echo "postgres") && \
DB_PASSWORD=$(grep "^DB_PASSWORD=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ' || echo "") && \
DB_NAME=$(grep "^DB_NAME=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ' || echo "wissen_publication_group") && \
DB_HOST=$(grep "^DB_HOST=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ' || echo "localhost") && \
DB_PORT=$(grep "^DB_PORT=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ' || echo "5432") && \
echo "Connecting as: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME" && \
export PGPASSWORD="$DB_PASSWORD" && \
echo "" && \
echo "=== Backing up admin user ===" && \
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT id, \"userName\", password, \"createdAt\", \"updatedAt\" FROM \"User\" WHERE \"userName\" = 'admin';" > /tmp/admin_backup.txt 2>&1 && \
echo "Admin backed up" && \
echo "" && \
echo "=== Clearing all tables except admin user ===" && \
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'SQL'
-- Disable foreign key checks
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
SQL
echo "" && \
echo "=== Verifying admin user ===" && \
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT id, \"userName\", \"createdAt\" FROM \"User\" WHERE \"userName\" = 'admin';" && \
echo "" && \
echo "=== Verifying tables are cleared ===" && \
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 'Article' as table_name, COUNT(*) as count FROM \"Article\" UNION ALL SELECT 'Journal', COUNT(*) FROM \"Journal\" UNION ALL SELECT 'BoardMember', COUNT(*) FROM \"BoardMember\" UNION ALL SELECT 'User', COUNT(*) FROM \"User\";" && \
echo "" && \
echo "✅ Database cleared! Only admin user remains."
```

---

## 🔧 **If the above doesn't work, try this simpler version:**

```bash
cd /var/www/wissen-publication-group/backend && \
# Use postgres user directly (most common)
export PGPASSWORD=$(grep "^DB_PASSWORD=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ' || echo "") && \
DB_NAME=$(grep "^DB_NAME=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ' || echo "wissen_publication_group") && \
echo "=== Backing up admin ===" && \
sudo -u postgres psql "$DB_NAME" -c "SELECT id, \"userName\", password FROM \"User\" WHERE \"userName\" = 'admin';" > /tmp/admin_backup.txt 2>&1 && \
echo "=== Clearing database ===" && \
sudo -u postgres psql "$DB_NAME" << 'SQL'
SET session_replication_role = 'replica';
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
DELETE FROM "User" WHERE "userName" != 'admin';
SET session_replication_role = 'origin';
SQL
echo "" && \
echo "=== Verifying ===" && \
sudo -u postgres psql "$DB_NAME" -c "SELECT id, \"userName\" FROM \"User\" WHERE \"userName\" = 'admin';" && \
echo "✅ Done!"
```

---

## 🚨 **If you get permission errors, use this:**

```bash
cd /var/www/wissen-publication-group/backend && \
# Check what user PostgreSQL expects
sudo -u postgres psql -l && \
# Then use that user
DB_NAME=$(grep "^DB_NAME=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ' || echo "wissen_publication_group") && \
sudo -u postgres psql "$DB_NAME" -c "DELETE FROM \"Author\"; DELETE FROM \"Article\"; DELETE FROM \"BoardMember\"; DELETE FROM \"Journal\"; DELETE FROM \"Message\"; DELETE FROM \"Contact\"; DELETE FROM \"News\"; DELETE FROM \"Notification\"; DELETE FROM \"WebPage\"; DELETE FROM \"JournalShortcode\"; DELETE FROM \"User\" WHERE \"userName\" != 'admin';" && \
sudo -u postgres psql "$DB_NAME" -c "SELECT id, \"userName\" FROM \"User\";" && \
echo "✅ Cleared!"
```
