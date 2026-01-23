# 🔧 Production Database Fix - Robust Solution

**Fixes both database issues without data loss**

---

## ✅ **MIGRATION CREATED**

**Migration File:** `backend/prisma/migrations/20260123121433_add_missing_columns/migration.sql`

**What it does:**
- Adds `Journal.content` column (TEXT)
- Adds missing `Article` columns (if needed)

**Status:** ✅ Marked as applied locally (columns already exist in your local DB)

---

## 🚀 **DEPLOY TO PRODUCTION:**

### Step 1: Commit and Push Migration

```powershell
# From project root
git add backend/prisma/migrations/20260123121433_add_missing_columns/
git commit -m "Add migration for missing Journal.content and Article columns"
git push origin main
```

### Step 2: Apply on Production Server

**Run this on AWS EC2:**

```bash
cd /var/www/wissen-publication-group && \
echo "=== STEP 1: Fix Disk Space (PostgreSQL needs space) ===" && \
df -h / && \
npm cache clean --force 2>/dev/null || true && \
sudo journalctl --vacuum-time=3d 2>/dev/null || true && \
pm2 flush 2>/dev/null || true && \
echo "" && \
echo "=== STEP 2: Fix PostgreSQL ===" && \
sudo systemctl restart postgresql && \
sleep 5 && \
sudo systemctl status postgresql | head -3 && \
echo "" && \
echo "=== STEP 3: Pull Latest Code (with migration) ===" && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
echo "" && \
echo "=== STEP 4: Baseline Database (if P3005 error) ===" && \
cd backend && \
# Mark all existing migrations as applied (baseline) \
npx prisma migrate resolve --applied 20251006203133_init || true && \
npx prisma migrate resolve --applied 20251012045546_add_message_model || true && \
npx prisma migrate resolve --applied 20251012060000_add_journal_metadata || true && \
npx prisma migrate resolve --applied 20251013173529_add_keywords_to_article || true && \
npx prisma migrate resolve --applied 20251102144446_add_admin_models || true && \
npx prisma migrate resolve --applied 20251116092017_add_user_password || true && \
npx prisma migrate resolve --applied 20251126184536_add_journal_image_fields || true && \
npx prisma migrate resolve --applied 20251126194208_add_homepage_fields || true && \
npx prisma migrate resolve --applied 20251128161310_update_board_member_fields || true && \
npx prisma migrate resolve --applied 20251202191526_add_volume_issue_year_to_articles || true && \
echo "" && \
echo "=== STEP 5: Apply New Migrations ===" && \
npx prisma migrate deploy && \
npx prisma generate && \
echo "" && \
echo "=== STEP 6: Manually Add Missing Column (if migration doesn't exist) ===" && \
psql $DATABASE_URL -c 'ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "content" TEXT;' 2>/dev/null || echo "Column may already exist or migration handled it" && \
echo "" && \
echo "=== STEP 7: Verify Schema ===" && \
psql $DATABASE_URL -c 'SELECT column_name FROM information_schema.columns WHERE table_name = '\''Journal'\'' AND column_name = '\''content'\'';' && \
echo "" && \
echo "=== STEP 8: Restart Backend ===" && \
cd .. && \
pm2 restart wissen-backend && \
sleep 5 && \
pm2 list && \
echo "✅ Database schema fixed!"
```

---

## 🔍 **VERIFICATION:**

After deployment, verify:

```bash
# Check column exists
psql $DATABASE_URL -c '\d "Journal"' | grep content

# Test query
psql $DATABASE_URL -c 'SELECT id, title, content FROM "Journal" LIMIT 1;'

# Test API
curl -s http://localhost:3001/api/journals | head -20
```

---

## 🛡️ **WHY THIS IS ROBUST:**

1. ✅ **Uses `IF NOT EXISTS`** - Safe if column already exists
2. ✅ **Proper migration file** - Tracked in version control
3. ✅ **No data loss** - Only adds columns, doesn't modify existing data
4. ✅ **Idempotent** - Can run multiple times safely
5. ✅ **Fixes disk space first** - Prevents PostgreSQL errors
6. ✅ **Verifies after applying** - Confirms fix worked

---

## 📋 **WHAT THE MIGRATION DOES:**

```sql
-- Add missing columns that exist in schema but not in database

-- AlterTable Journal
ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "content" TEXT;

-- AlterTable Article (if needed)
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "inPressMonth" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "inPressYear" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "issueId" INTEGER;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "schemaSyncTest" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "showInInpressCards" BOOLEAN DEFAULT false;
```

---

## 🚨 **IF MIGRATION FAILS IN PRODUCTION:**

**Fallback - Manual Column Addition:**

```bash
cd /var/www/wissen-publication-group/backend && \
psql $DATABASE_URL -c 'ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "content" TEXT;' && \
npx prisma migrate resolve --applied 20260123121433_add_missing_columns && \
npx prisma generate && \
pm2 restart wissen-backend
```

---

**Migration Name:** `20260123121433_add_missing_columns`  
**File Location:** `backend/prisma/migrations/20260123121433_add_missing_columns/migration.sql`
