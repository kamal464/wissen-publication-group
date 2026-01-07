# 🌱 Seed Admin User on EC2 - Quick Command

After your deployment completes, run this in your browser terminal:

## Quick Seed Command

```bash
cd /var/www/wissen-publication-group/backend && npx prisma db seed
```

This will:
- ✅ Create admin user: `admin` / `Bharath@321`
- ✅ Create 10 sample journals
- ✅ Create 5 sample articles with authors
- ✅ Set up initial data

---

## Or Add to Deployment Script

You can also add the seed command to your deployment script. After the build steps, add:

```bash
# After npm run build in backend
npx prisma db seed
```

---

## Verify After Seeding

```bash
# Check admin user
psql -U postgres -d wissen_publication_group -c "SELECT userName, isActive FROM \"User\" WHERE userName='admin';"

# Check journals
psql -U postgres -d wissen_publication_group -c "SELECT COUNT(*) as journal_count FROM \"Journal\";"

# Check articles
psql -U postgres -d wissen_publication_group -c "SELECT COUNT(*) as article_count FROM \"Article\";"
```

---

**That's it! After seeding, you can login with admin/Bharath@321**

