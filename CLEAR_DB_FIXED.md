# 🗄️ Clear Database - Fixed Command

**The table name might be lowercase. Use this command:**

```bash
cd /var/www/wissen-publication-group/backend && \
# Get database name from .env
DB_NAME=$(grep "^DB_NAME=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ' || echo "wissen_publication_group") && \
echo "Database: $DB_NAME" && \
echo "" && \
echo "=== STEP 1: Check what tables exist ===" && \
sudo -u postgres psql "$DB_NAME" -c "\dt" && \
echo "" && \
echo "=== STEP 2: Check User table name ===" && \
sudo -u postgres psql "$DB_NAME" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%user%' OR table_name LIKE '%User%';" && \
echo "" && \
echo "=== STEP 3: Backup admin user (try both cases) ===" && \
sudo -u postgres psql "$DB_NAME" -c "SELECT id, \"userName\", password, \"createdAt\", \"updatedAt\" FROM \"User\" WHERE \"userName\" = 'admin';" > /tmp/admin_backup.txt 2>&1 || \
sudo -u postgres psql "$DB_NAME" -c "SELECT id, \"userName\", password, \"createdAt\", \"updatedAt\" FROM \"user\" WHERE \"userName\" = 'admin';" > /tmp/admin_backup.txt 2>&1 || \
sudo -u postgres psql "$DB_NAME" -c "SELECT id, username, password, \"createdAt\", \"updatedAt\" FROM \"User\" WHERE username = 'admin';" > /tmp/admin_backup.txt 2>&1 || \
echo "Trying different table names..." && \
echo "Admin backup attempted" && \
echo "" && \
echo "=== STEP 4: Clear all tables ===" && \
sudo -u postgres psql "$DB_NAME" << 'SQL'
-- Disable foreign key checks
SET session_replication_role = 'replica';

-- Delete in order: child tables first, then parent tables
-- Try both uppercase and lowercase table names
DO $$
BEGIN
  -- Try uppercase first, then lowercase
  EXECUTE 'DELETE FROM "Author"'; EXCEPTION WHEN undefined_table THEN NULL;
  EXECUTE 'DELETE FROM "author"'; EXCEPTION WHEN undefined_table THEN NULL;
  
  EXECUTE 'DELETE FROM "Article"'; EXCEPTION WHEN undefined_table THEN NULL;
  EXECUTE 'DELETE FROM "article"'; EXCEPTION WHEN undefined_table THEN NULL;
  
  EXECUTE 'DELETE FROM "BoardMember"'; EXCEPTION WHEN undefined_table THEN NULL;
  EXECUTE 'DELETE FROM "boardmember"'; EXCEPTION WHEN undefined_table THEN NULL;
  
  EXECUTE 'DELETE FROM "Journal"'; EXCEPTION WHEN undefined_table THEN NULL;
  EXECUTE 'DELETE FROM "journal"'; EXCEPTION WHEN undefined_table THEN NULL;
  
  EXECUTE 'DELETE FROM "Message"'; EXCEPTION WHEN undefined_table THEN NULL;
  EXECUTE 'DELETE FROM "message"'; EXCEPTION WHEN undefined_table THEN NULL;
  
  EXECUTE 'DELETE FROM "Contact"'; EXCEPTION WHEN undefined_table THEN NULL;
  EXECUTE 'DELETE FROM "contact"'; EXCEPTION WHEN undefined_table THEN NULL;
  
  EXECUTE 'DELETE FROM "News"'; EXCEPTION WHEN undefined_table THEN NULL;
  EXECUTE 'DELETE FROM "news"'; EXCEPTION WHEN undefined_table THEN NULL;
  
  EXECUTE 'DELETE FROM "Notification"'; EXCEPTION WHEN undefined_table THEN NULL;
  EXECUTE 'DELETE FROM "notification"'; EXCEPTION WHEN undefined_table THEN NULL;
  
  EXECUTE 'DELETE FROM "WebPage"'; EXCEPTION WHEN undefined_table THEN NULL;
  EXECUTE 'DELETE FROM "webpage"'; EXCEPTION WHEN undefined_table THEN NULL;
  
  EXECUTE 'DELETE FROM "JournalShortcode"'; EXCEPTION WHEN undefined_table THEN NULL;
  EXECUTE 'DELETE FROM "journalshortcode"'; EXCEPTION WHEN undefined_table THEN NULL;
  
  -- Delete all users except admin (try both cases)
  EXECUTE 'DELETE FROM "User" WHERE "userName" != ''admin'''; EXCEPTION WHEN undefined_table THEN NULL;
  EXECUTE 'DELETE FROM "user" WHERE "userName" != ''admin'''; EXCEPTION WHEN undefined_table THEN NULL;
  EXECUTE 'DELETE FROM "User" WHERE username != ''admin'''; EXCEPTION WHEN undefined_table THEN NULL;
  EXECUTE 'DELETE FROM "user" WHERE username != ''admin'''; EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';
SQL
echo "" && \
echo "=== STEP 5: Verify admin user (try both cases) ===" && \
sudo -u postgres psql "$DB_NAME" -c "SELECT id, \"userName\", \"createdAt\" FROM \"User\" WHERE \"userName\" = 'admin';" 2>&1 || \
sudo -u postgres psql "$DB_NAME" -c "SELECT id, \"userName\", \"createdAt\" FROM \"user\" WHERE \"userName\" = 'admin';" 2>&1 || \
sudo -u postgres psql "$DB_NAME" -c "SELECT id, username, \"createdAt\" FROM \"User\" WHERE username = 'admin';" 2>&1 || \
echo "Could not verify - check manually" && \
echo "" && \
echo "✅ Database clear attempted!"
```

---

## 🔍 **SIMPLER: First check table names, then clear:**

```bash
cd /var/www/wissen-publication-group/backend && \
DB_NAME=$(grep "^DB_NAME=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ' || echo "wissen_publication_group") && \
echo "=== All tables in database ===" && \
sudo -u postgres psql "$DB_NAME" -c "\dt" && \
echo "" && \
echo "=== User table structure ===" && \
sudo -u postgres psql "$DB_NAME" -c "\d \"User\"" 2>&1 || sudo -u postgres psql "$DB_NAME" -c "\d user" 2>&1 || echo "User table not found" && \
echo "" && \
echo "=== Now run clear with correct table names ==="
```

---

## 🎯 **MOST RELIABLE: Use Prisma to clear (recommended):**

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== Using Prisma to clear database ===" && \
# Create a temporary script
cat > /tmp/clear-db.js << 'JS'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    // Backup admin
    const admin = await prisma.user.findUnique({
      where: { userName: 'admin' }
    });
    console.log('Admin user:', admin ? 'Found' : 'Not found');
    
    // Clear all tables
    await prisma.author.deleteMany();
    await prisma.article.deleteMany();
    await prisma.boardMember.deleteMany();
    await prisma.journal.deleteMany();
    await prisma.message.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.news.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.webPage.deleteMany();
    await prisma.journalShortcode.deleteMany();
    
    // Delete all users except admin
    await prisma.user.deleteMany({
      where: {
        userName: { not: 'admin' }
      }
    });
    
    console.log('✅ Database cleared!');
    
    // Verify admin
    const adminAfter = await prisma.user.findUnique({
      where: { userName: 'admin' }
    });
    console.log('Admin after clear:', adminAfter ? 'Still exists ✅' : 'Missing ❌');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
JS
node /tmp/clear-db.js && \
rm /tmp/clear-db.js && \
echo "✅ Done!"
```
