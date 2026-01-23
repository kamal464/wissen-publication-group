# 🗄️ Clear Database Except Admin - Production Command

**Run this on AWS browser terminal to clear all tables except admin user:**

---

## 🚀 **COMPLETE COMMAND (Prisma-based - Most Reliable):**

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== STEP 1: Install dependencies ===" && \
npm install --no-audit --no-fund --loglevel=error && \
echo "" && \
echo "=== STEP 2: Generate Prisma client ===" && \
npx prisma generate && \
echo "" && \
echo "=== STEP 3: Clear Database (Keep Admin) ===" && \
cat > /tmp/clear-db-keep-admin.js << 'JS'
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
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        AND: [
          { userName: { not: 'admin' } },
          { userName: { not: { contains: 'admin', mode: 'insensitive' } } }
        ]
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
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        AND: [
          { userName: { not: 'admin' } },
          { userName: { not: { contains: 'admin', mode: 'insensitive' } } }
        ]
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

## ⚡ **QUICK VERSION (If Dependencies Already Installed):**

```bash
cd /var/www/wissen-publication-group/backend && \
npx prisma generate && \
cat > clear-db.js << 'JS'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    console.log('Clearing database (keeping admin)...');
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
    await prisma.user.deleteMany({
      where: {
        userName: { not: 'admin' }
      }
    });
    const admin = await prisma.user.findUnique({ where: { userName: 'admin' } });
    console.log(admin ? '✅ Admin preserved' : '❌ Admin missing!');
  } catch (e) { console.error('Error:', e.message); process.exit(1); }
  finally { await prisma.$disconnect(); }
})();
JS
node clear-db.js && rm clear-db.js && \
echo "✅ Database cleared!"
```

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

---

## 📝 **What This Does:**

1. ✅ **Preserves** all users with "admin" in username (case-insensitive)
2. ✅ **Clears** all journals (including duplicates)
3. ✅ **Clears** all articles, authors, board members, etc.
4. ✅ **Clears** all other non-admin users
5. ✅ **Verifies** admin still exists after clearing

---

## ⚠️ **IMPORTANT:**

- This will **delete all journals** (including the duplicates you're seeing)
- This will **delete all articles, authors, etc.**
- Only **admin user credentials** will be preserved
- Make sure you have backups if needed!

---

## 🔄 **After Clearing, Deploy Fresh:**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Pull latest code ===" && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
echo "" && \
echo "=== Apply migrations ===" && \
cd backend && \
npx prisma migrate deploy && \
npx prisma generate && \
echo "" && \
echo "=== Build backend ===" && \
npm run build && \
echo "" && \
echo "=== Build frontend ===" && \
cd ../frontend && \
npm install --no-audit --no-fund --loglevel=error && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
echo "" && \
echo "=== Restart services ===" && \
cd .. && \
pm2 restart all || (pm2 start backend/dist/src/main.js --name wissen-backend --update-env && cd frontend && pm2 start npm --name wissen-frontend -- start --update-env && cd ..) && \
sleep 5 && \
pm2 save && \
sudo systemctl reload nginx && \
echo "✅ Fresh deployment complete!"
```
