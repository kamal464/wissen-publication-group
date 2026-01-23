# 🔧 Fix Database Clear - Database Name Issue

**The database name is empty! Let's fix this:**

---

## 🔍 **STEP 1: Check .env and Find Database Name**

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== Checking .env file ===" && \
cat .env | grep -i "DB_\|DATABASE" && \
echo "" && \
echo "=== Listing all PostgreSQL databases ===" && \
sudo -u postgres psql -l && \
echo "" && \
echo "=== Check which database has tables ===" && \
for db in wissen_publication_group universal_publishers postgres; do
  echo "Checking database: $db"
  sudo -u postgres psql "$db" -c "\dt" 2>&1 | head -5
  echo ""
done
```

---

## 🗄️ **STEP 2: Clear Database (Once you know the correct name)**

**Replace `wissen_publication_group` with the actual database name from Step 1:**

```bash
cd /var/www/wissen-publication-group/backend && \
# Use the ACTUAL database name (check Step 1 output)
DB_NAME="wissen_publication_group" && \
# Or try: DB_NAME="universal_publishers" && \
echo "Using database: $DB_NAME" && \
echo "" && \
echo "=== Backing up admin user ===" && \
sudo -u postgres psql "$DB_NAME" -c "SELECT id, \"userName\", password FROM \"User\" WHERE \"userName\" = 'admin';" > /tmp/admin_backup.txt 2>&1 && \
cat /tmp/admin_backup.txt && \
echo "" && \
echo "=== Clearing all tables except admin user ===" && \
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
echo "=== Verifying admin user ===" && \
sudo -u postgres psql "$DB_NAME" -c "SELECT id, \"userName\" FROM \"User\" WHERE \"userName\" = 'admin';" && \
echo "" && \
echo "✅ Database cleared!"
```

---

## 🚀 **BEST OPTION: Use Prisma (Handles everything automatically)**

**This will work regardless of database name issues:**

```bash
cd /var/www/wissen-publication-group/backend && \
# Install dependencies and generate Prisma client first
echo "=== Installing dependencies ===" && \
npm install --no-audit --no-fund --loglevel=error && \
echo "" && \
echo "=== Generating Prisma client ===" && \
npx prisma generate && \
echo "" && \
echo "=== Creating clear script ===" && \
# Create clear script
cat > /tmp/clear-db.js << 'JS'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('=== Backing up admin user ===');
    const admin = await prisma.user.findUnique({
      where: { userName: 'admin' }
    });
    if (admin) {
      console.log('✅ Admin user found:', admin.userName, '(ID:', admin.id + ')');
    } else {
      console.log('⚠️ Admin user not found!');
    }
    
    console.log('\n=== Clearing tables ===');
    
    await prisma.author.deleteMany();
    console.log('✓ Author cleared');
    
    await prisma.article.deleteMany();
    console.log('✓ Article cleared');
    
    await prisma.boardMember.deleteMany();
    console.log('✓ BoardMember cleared');
    
    await prisma.journal.deleteMany();
    console.log('✓ Journal cleared');
    
    await prisma.message.deleteMany();
    console.log('✓ Message cleared');
    
    await prisma.contact.deleteMany();
    console.log('✓ Contact cleared');
    
    await prisma.news.deleteMany();
    console.log('✓ News cleared');
    
    await prisma.notification.deleteMany();
    console.log('✓ Notification cleared');
    
    await prisma.webPage.deleteMany();
    console.log('✓ WebPage cleared');
    
    await prisma.journalShortcode.deleteMany();
    console.log('✓ JournalShortcode cleared');
    
    const deletedUsers = await prisma.user.deleteMany({
      where: { userName: { not: 'admin' } }
    });
    console.log(`✓ Deleted ${deletedUsers.count} users (kept admin)`);
    
    console.log('\n=== Verifying admin user ===');
    const adminCheck = await prisma.user.findUnique({
      where: { userName: 'admin' }
    });
    
    if (adminCheck) {
      console.log('✅ Admin user still exists!');
      console.log('   ID:', adminCheck.id);
      console.log('   Username:', adminCheck.userName);
    } else {
      console.log('❌ ERROR: Admin user is missing!');
    }
    
    console.log('\n=== Final table counts ===');
    const counts = {
      Article: await prisma.article.count(),
      Journal: await prisma.journal.count(),
      BoardMember: await prisma.boardMember.count(),
      User: await prisma.user.count()
    };
    console.log(counts);
    
    console.log('\n✅ Database cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
JS
node /tmp/clear-db.js && \
rm /tmp/clear-db.js && \
echo "" && \
echo "✅ Database cleared using Prisma!"
```

---

## 🔄 **FULL DEPLOYMENT WITH DB CLEAR (Using Prisma):**

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
echo "=== STEP 4: Clear Database Using Prisma ===" && \
cd backend && \
npx prisma generate && \
cat > /tmp/clear-db.js << 'JS'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    console.log('Clearing database...');
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
    await prisma.user.deleteMany({ where: { userName: { not: 'admin' } } });
    const admin = await prisma.user.findUnique({ where: { userName: 'admin' } });
    console.log(admin ? '✅ Admin preserved' : '❌ Admin missing!');
  } catch (e) { console.error('Error:', e.message); process.exit(1); }
  finally { await prisma.$disconnect(); }
})();
JS
node /tmp/clear-db.js && rm /tmp/clear-db.js && \
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
pm2 restart all || (pm2 start dist/src/main.js --name wissen-backend --update-env && cd frontend && pm2 start npm --name wissen-frontend -- start --update-env && cd ..) && \
sleep 5 && \
pm2 save && \
sudo systemctl reload nginx && \
echo "" && \
echo "=== STEP 9: Verify ===" && \
pm2 list && \
curl -s http://localhost:3001/api/health && echo "" && \
echo "✅ Deployment complete! Database cleared except admin."
```
