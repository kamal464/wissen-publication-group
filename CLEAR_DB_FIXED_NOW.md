# 🗄️ Clear Database Except Admin - FIXED Command

**Run this on AWS browser terminal - Script runs from backend directory:**

---

## 🚀 **CORRECTED COMMAND (Run from backend directory):**

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== STEP 1: Install dependencies ===" && \
npm install --no-audit --no-fund --loglevel=error && \
echo "" && \
echo "=== STEP 2: Generate Prisma client ===" && \
npx prisma generate && \
echo "" && \
echo "=== STEP 3: Clear Database (Keep Admin) ===" && \
cat > clear-db-keep-admin.js << 'JS'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('=== Backing up admin user(s) ===');
    const adminUsers = await prisma.user.findMany({
      where: {
        OR: [
          { userName: 'admin' },
          { userName: { contains: 'admin', mode: 'insensitive' } }
        ]
      }
    });
    
    if (adminUsers.length > 0) {
      console.log(`✅ Found ${adminUsers.length} admin user(s):`);
      adminUsers.forEach(u => {
        console.log(`   - ID: ${u.id}, Username: ${u.userName}`);
      });
    } else {
      console.log('⚠️ No admin users found!');
    }
    
    console.log('\n=== Clearing all tables (keeping admin users) ===');
    
    // Delete in order: child tables first
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
    
    // Delete all users except admin
    // Use the admin usernames we already found
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        userName: {
          notIn: adminUsers.map(u => u.userName)
        }
      }
    });
    console.log(`✓ Deleted ${deletedUsers.count} non-admin users`);
    
    console.log('\n=== Verifying admin user(s) ===');
    const adminCheck = await prisma.user.findMany({
      where: {
        OR: [
          { userName: 'admin' },
          { userName: { contains: 'admin', mode: 'insensitive' } }
        ]
      }
    });
    
    if (adminCheck.length > 0) {
      console.log('✅ Admin user(s) still exist:');
      adminCheck.forEach(u => {
        console.log(`   - ID: ${u.id}, Username: ${u.userName}`);
      });
    } else {
      console.log('❌ ERROR: No admin users found after clear!');
    }
    
    console.log('\n=== Final table counts ===');
    const counts = {
      Article: await prisma.article.count(),
      Journal: await prisma.journal.count(),
      BoardMember: await prisma.boardMember.count(),
      User: await prisma.user.count(),
      JournalShortcode: await prisma.journalShortcode.count()
    };
    console.log(counts);
    
    console.log('\n✅ Database cleared successfully! Only admin user(s) remain.');
    
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
node clear-db-keep-admin.js && \
rm clear-db-keep-admin.js && \
echo "" && \
echo "✅ Database cleared! Admin credentials preserved."
```

---

## ⚠️ **IMPORTANT:**

- **MUST run from `/var/www/wissen-publication-group/backend` directory**
- Script is created in the **backend directory** (not `/tmp`)
- This ensures `@prisma/client` can be found in `node_modules`
- The script is automatically deleted after running

---

## 🔍 **VERIFY AFTER CLEARING:**

```bash
cd /var/www/wissen-publication-group/backend && \
npx prisma generate && \
cat > verify-db.js << 'JS'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const counts = {
    Article: await prisma.article.count(),
    Journal: await prisma.journal.count(),
    BoardMember: await prisma.boardMember.count(),
    User: await prisma.user.count(),
    JournalShortcode: await prisma.journalShortcode.count()
  };
  console.log('Table counts:', counts);
  const admin = await prisma.user.findUnique({ where: { userName: 'admin' } });
  console.log('Admin user:', admin ? `✅ Found (ID: ${admin.id})` : '❌ Missing');
  await prisma.$disconnect();
})();
JS
node verify-db.js && rm verify-db.js
```
