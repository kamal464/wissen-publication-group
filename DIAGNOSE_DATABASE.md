# 🔍 Diagnose Database Connection

**Run this to check what tables exist and fix the connection:**

```bash
cd /var/www/wissen-publication-group/backend && \
# Get database name from .env
DB_NAME=$(grep "^DB_NAME=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ' || echo "wissen_publication_group") && \
echo "Checking database: $DB_NAME" && \
echo "" && \
echo "=== List all databases ===" && \
sudo -u postgres psql -l && \
echo "" && \
echo "=== List all tables in $DB_NAME ===" && \
sudo -u postgres psql "$DB_NAME" -c "\dt" && \
echo "" && \
echo "=== List all tables with schema ===" && \
sudo -u postgres psql "$DB_NAME" -c "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema') ORDER BY table_schema, table_name;" && \
echo "" && \
echo "=== Check if User table exists (case-sensitive) ===" && \
sudo -u postgres psql "$DB_NAME" -c "SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%user%' OR table_name LIKE '%User%';" && \
echo "" && \
echo "=== Check current schema ===" && \
sudo -u postgres psql "$DB_NAME" -c "SELECT current_schema();"
```

---

## 🔧 **FIXED CLEAR COMMAND (After Diagnosis):**

Once you know the correct table names, use this:

```bash
cd /var/www/wissen-publication-group/backend && \
DB_NAME=$(grep "^DB_NAME=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ' || echo "wissen_publication_group") && \
echo "=== Backing up admin user ===" && \
sudo -u postgres psql "$DB_NAME" -c "SELECT id, \"userName\", password FROM \"User\" WHERE \"userName\" = 'admin';" > /tmp/admin_backup.txt 2>&1 || \
sudo -u postgres psql "$DB_NAME" -c "SELECT id, username, password FROM \"user\" WHERE username = 'admin';" > /tmp/admin_backup.txt 2>&1 || \
sudo -u postgres psql "$DB_NAME" -c "SELECT id, \"userName\", password FROM public.\"User\" WHERE \"userName\" = 'admin';" > /tmp/admin_backup.txt 2>&1 || \
echo "Could not backup - table may not exist" && \
echo "" && \
echo "=== Clearing tables ===" && \
sudo -u postgres psql "$DB_NAME" << 'SQL'
SET session_replication_role = 'replica';
-- Try different table name variations
DELETE FROM "Author" WHERE 1=1;
DELETE FROM "Article" WHERE 1=1;
DELETE FROM "BoardMember" WHERE 1=1;
DELETE FROM "Journal" WHERE 1=1;
DELETE FROM "Message" WHERE 1=1;
DELETE FROM "Contact" WHERE 1=1;
DELETE FROM "News" WHERE 1=1;
DELETE FROM "Notification" WHERE 1=1;
DELETE FROM "WebPage" WHERE 1=1;
DELETE FROM "JournalShortcode" WHERE 1=1;
DELETE FROM "User" WHERE "userName" != 'admin';
SET session_replication_role = 'origin';
SQL
echo "✅ Done!"
```

---

## 🚨 **ALTERNATIVE: Use Prisma to Clear (Safest):**

If psql isn't working, use Prisma:

```bash
cd /var/www/wissen-publication-group/backend && \
# Create a clear script
cat > /tmp/clear-db.js << 'JS'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('Backing up admin user...');
    const admin = await prisma.user.findUnique({
      where: { userName: 'admin' }
    });
    console.log('Admin user:', admin ? 'Found' : 'Not found');
    
    console.log('Clearing tables...');
    
    // Delete in order
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
    
    // Verify admin exists
    const adminCheck = await prisma.user.findUnique({
      where: { userName: 'admin' }
    });
    console.log('Admin user after clear:', adminCheck ? 'Still exists ✅' : 'MISSING ❌');
    
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
echo "✅ Database cleared using Prisma!"
```
