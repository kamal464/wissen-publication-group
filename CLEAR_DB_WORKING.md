# 🗄️ Clear Database - Working Command

**Run this on production server (includes dependency installation):**

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== STEP 1: Install dependencies ===" && \
npm install --no-audit --no-fund --loglevel=error && \
echo "" && \
echo "=== STEP 2: Generate Prisma client ===" && \
npx prisma generate && \
echo "" && \
echo "=== STEP 3: Clear Database Using Prisma ===" && \
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

## 🔄 **FULL DEPLOYMENT WITH DB CLEAR:**

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
npm install --no-audit --no-fund --loglevel=error && \
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
