# 🔐 Seed Admin User - Quick Guide

## ✅ Good News: Admin User is Auto-Created!

Your application **automatically creates** the admin user on first login attempt. However, you can also seed it manually.

---

## Option 1: Auto-Create on First Login (Easiest)

**No action needed!** Just try to login:

1. Go to: http://54.165.116.208/admin/login
2. Enter:
   - **Username:** `admin`
   - **Password:** `Bharath@321`
3. The system will automatically create the admin user if it doesn't exist

---

## Option 2: Seed Admin User Manually (Recommended)

Run this in your browser terminal on EC2:

```bash
cd /var/www/wissen-publication-group/backend
npx prisma db seed
```

This will:
- ✅ Create admin user: `admin` / `Bharath@321`
- ✅ Create 10 sample journals
- ✅ Create 5 sample articles
- ✅ Set up initial data

**Note:** Seed uses `upsert`, so it's safe to run multiple times - it won't create duplicates.

---

## Option 3: Create Admin User Only (Without Sample Data)

If you only want the admin user (no sample journals/articles), run this:

```bash
cd /var/www/wissen-publication-group/backend

# Create a simple seed script
cat > seed-admin-only.ts << 'EOF'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { userName: 'admin' },
    update: {
      password: 'Bharath@321',
      isActive: true,
      journalName: 'Administrator',
      category: 'System'
    },
    create: {
      userName: 'admin',
      password: 'Bharath@321',
      isActive: true,
      journalName: 'Administrator',
      category: 'System'
    }
  });
  console.log('✅ Admin user created: username="admin", password="Bharath@321"');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
EOF

# Run it
npx ts-node seed-admin-only.ts
```

---

## 🔄 Do You Need Data Migration?

### Scenario 1: Fresh Deployment (No Existing Data)
**Answer: NO migration needed**
- Just run the seed: `npx prisma db seed`
- Admin user will be created
- Sample data will be added (optional)

### Scenario 2: You Have Existing Data in Supabase
**Answer: YES, you need migration**
- Export data from Supabase
- Import to EC2 PostgreSQL
- See migration guide below

---

## 📊 Check If You Have Existing Data

Run this to check your Supabase database:

```bash
# Connect to Supabase (from your local machine)
psql "postgresql://postgres:[PASSWORD]@db.clupojsvmfxycklmdkjy.supabase.co:5432/postgres" -c "SELECT COUNT(*) FROM \"User\";"
psql "postgresql://postgres:[PASSWORD]@db.clupojsvmfxycklmdkjy.supabase.co:5432/postgres" -c "SELECT COUNT(*) FROM \"Journal\";"
psql "postgresql://postgres:[PASSWORD]@db.clupojsvmfxycklmdkjy.supabase.co:5432/postgres" -c "SELECT COUNT(*) FROM \"Article\";"
```

If counts are > 0, you have data to migrate.

---

## 🚀 Quick Steps for EC2 Deployment

### Step 1: After Deployment Completes

Once your deployment script finishes, run:

```bash
cd /var/www/wissen-publication-group/backend
npx prisma db seed
```

### Step 2: Verify Admin User

```bash
# Check if admin user exists
psql -U postgres -d wissen_publication_group -c "SELECT userName, isActive FROM \"User\" WHERE userName='admin';"
```

### Step 3: Test Login

Visit: http://54.165.116.208/admin/login
- Username: `admin`
- Password: `Bharath@321`

---

## 📋 Migration from Supabase (If You Have Existing Data)

If you have real data in Supabase that you want to keep:

### Step 1: Export from Supabase

```bash
# Export all data
pg_dump "postgresql://postgres:[PASSWORD]@db.clupojsvmfxycklmdkjy.supabase.co:5432/postgres" \
  --data-only \
  --format=custom \
  --file=supabase_data.dump

# Or export specific tables
pg_dump "postgresql://postgres:[PASSWORD]@db.clupojsvmfxycklmdkjy.supabase.co:5432/postgres" \
  --data-only \
  --table="User" \
  --table="Journal" \
  --table="Article" \
  --table="Author" \
  --table="Contact" \
  --table="News" \
  --format=custom \
  --file=supabase_data.dump
```

### Step 2: Import to EC2 Database

```bash
# On EC2 instance, copy the dump file first (via SCP or download)
# Then restore:
pg_restore -d "postgresql://postgres:Wissen2024!Secure@localhost:5432/wissen_publication_group" \
  --data-only \
  --clean \
  supabase_data.dump
```

### Step 3: Verify Migration

```bash
# Check data counts
psql -U postgres -d wissen_publication_group -c "SELECT COUNT(*) FROM \"User\";"
psql -U postgres -d wissen_publication_group -c "SELECT COUNT(*) FROM \"Journal\";"
psql -U postgres -d wissen_publication_group -c "SELECT COUNT(*) FROM \"Article\";"
```

---

## ✅ Summary

**For Fresh Deployment:**
1. ✅ Run `npx prisma db seed` after deployment
2. ✅ Admin user will be created: `admin` / `Bharath@321`
3. ✅ Sample data will be added (optional)

**For Existing Data:**
1. ✅ Export from Supabase
2. ✅ Import to EC2 PostgreSQL
3. ✅ Verify data integrity

**Admin User:**
- ✅ Auto-created on first login, OR
- ✅ Created via seed command
- ✅ Username: `admin`
- ✅ Password: `Bharath@321`

---

**After deployment completes, just run the seed command to create the admin user!**

