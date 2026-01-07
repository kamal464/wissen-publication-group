# 🗄️ Database Migration Guide - Moving from Supabase

## 📋 Current Setup

- **Current Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Connection**: Via `DATABASE_URL` environment variable
- **Schema**: Defined in `backend/prisma/schema.prisma`

---

## 🎯 Alternative Database Options

### Option 1: Self-Hosted PostgreSQL (Recommended for Control)
**Best for**: Full control, custom configurations, on-premise deployments

**Pros:**
- ✅ Complete control over database
- ✅ No vendor lock-in
- ✅ Can optimize for your specific needs
- ✅ Lower cost at scale

**Cons:**
- ❌ You manage backups, updates, security
- ❌ Need to set up high availability yourself
- ❌ Infrastructure management required

**Providers:**
- DigitalOcean Managed PostgreSQL
- AWS RDS PostgreSQL
- Google Cloud SQL (PostgreSQL)
- Azure Database for PostgreSQL
- Railway PostgreSQL
- Render PostgreSQL
- Self-hosted on VPS (DigitalOcean, Linode, etc.)

---

### Option 2: Managed PostgreSQL Services

#### **AWS RDS PostgreSQL**
- **Free Tier**: 750 hours/month for 12 months
- **Pricing**: ~$15-50/month after free tier
- **Features**: Automated backups, Multi-AZ, Read replicas
- **Connection**: `postgresql://user:pass@rds-endpoint.region.rds.amazonaws.com:5432/dbname`

#### **Google Cloud SQL (PostgreSQL)**
- **Free Tier**: $300 credit for 90 days
- **Pricing**: ~$10-30/month (depends on instance size)
- **Features**: Automated backups, High availability, Point-in-time recovery
- **Connection**: `postgresql://user:pass@/dbname?host=/cloudsql/PROJECT:REGION:INSTANCE`

#### **Azure Database for PostgreSQL**
- **Free Tier**: 12 months free (limited)
- **Pricing**: ~$15-40/month
- **Features**: Built-in high availability, Automated backups
- **Connection**: `postgresql://user:pass@server.postgres.database.azure.com:5432/dbname`

#### **Railway PostgreSQL**
- **Free Tier**: $5 credit/month
- **Pricing**: Pay-as-you-go
- **Features**: Simple setup, Automatic backups
- **Connection**: Provided in Railway dashboard

#### **Render PostgreSQL**
- **Free Tier**: Available (with limitations)
- **Pricing**: $7-25/month
- **Features**: Automatic backups, Easy scaling
- **Connection**: Provided in Render dashboard

---

### Option 3: Other Database Types (Requires Schema Changes)

#### **MySQL/MariaDB**
- Requires Prisma schema changes
- Different data types
- Good for: Traditional web apps, WordPress-like systems

#### **MongoDB**
- Requires complete rewrite (NoSQL)
- Good for: Document-based data, flexible schemas

#### **SQLite**
- File-based database
- Good for: Development, small apps, embedded systems
- **Not recommended for production** with multiple users

---

## 🚀 Migration Steps

### Step 1: Choose Your New Database

Based on your needs:
- **Need managed service?** → AWS RDS, Google Cloud SQL, or Railway
- **Want full control?** → Self-hosted PostgreSQL
- **Budget conscious?** → Railway, Render (free tiers available)

---

### Step 2: Set Up New Database

#### For AWS RDS:
```bash
# 1. Go to AWS Console → RDS → Create Database
# 2. Choose PostgreSQL
# 3. Select instance size (db.t3.micro for free tier)
# 4. Set master username and password
# 5. Create database
# 6. Get endpoint: your-db.xxxxx.us-east-1.rds.amazonaws.com
```

#### For Google Cloud SQL:
```bash
# 1. Go to Google Cloud Console → SQL → Create Instance
# 2. Choose PostgreSQL
# 3. Set root password
# 4. Create instance
# 5. Get connection name: PROJECT:REGION:INSTANCE
```

#### For Railway:
```bash
# 1. Go to railway.app
# 2. New Project → Add PostgreSQL
# 3. Copy connection string from Variables tab
```

---

### Step 3: Export Data from Supabase

```bash
# Option 1: Using pg_dump (recommended)
pg_dump "postgresql://postgres:[PASSWORD]@db.clupojsvmfxycklmdkjy.supabase.co:5432/postgres" \
  --format=custom \
  --file=supabase_backup.dump

# Option 2: Using Supabase Dashboard
# 1. Go to Supabase Dashboard → Database → Backups
# 2. Download backup file
```

---

### Step 4: Import Data to New Database

```bash
# For PostgreSQL (RDS, Cloud SQL, Railway, etc.)
pg_restore -d "postgresql://user:pass@new-db-host:5432/dbname" \
  --clean \
  --if-exists \
  supabase_backup.dump

# Or using psql for SQL dumps
psql "postgresql://user:pass@new-db-host:5432/dbname" < supabase_backup.sql
```

---

### Step 5: Update Connection String

#### Update GitHub Secrets:
1. Go to: `https://github.com/kamal464/wissen-publication-group/settings/secrets/actions`
2. Update `DATABASE_URL` secret with new connection string

#### Update Local `.env`:
```env
# backend/.env
DATABASE_URL=postgresql://user:password@new-db-host:5432/dbname
```

#### Update Cloud Run Environment:
```bash
gcloud run services update wissen-api \
  --update-env-vars "DATABASE_URL=postgresql://user:password@new-db-host:5432/dbname"
```

---

### Step 6: Test Connection

```bash
cd backend
npx prisma db pull  # Pull schema from new database
npx prisma generate # Regenerate Prisma client
npx prisma studio   # Open Prisma Studio to verify data
```

---

### Step 7: Run Migrations (if needed)

```bash
cd backend
npx prisma migrate deploy  # Apply any pending migrations
```

---

### Step 8: Update Deployment Workflow (if needed)

If your new database requires different connection parameters, update:
- `.github/workflows/firebase-hosting-merge.yml`
- Add any additional environment variables needed

---

## 🔄 Migration Checklist

- [ ] Choose new database provider
- [ ] Create new database instance
- [ ] Export data from Supabase
- [ ] Import data to new database
- [ ] Update `DATABASE_URL` in GitHub Secrets
- [ ] Update `DATABASE_URL` in local `.env`
- [ ] Update Cloud Run environment variables
- [ ] Test connection locally
- [ ] Run Prisma migrations
- [ ] Verify data integrity
- [ ] Test application functionality
- [ ] Update documentation
- [ ] Monitor for 24-48 hours
- [ ] Cancel Supabase subscription (if applicable)

---

## 📊 Comparison Table

| Feature | Supabase | AWS RDS | Google Cloud SQL | Railway | Render |
|---------|----------|---------|------------------|---------|--------|
| **Free Tier** | ✅ Yes | ✅ 12 months | ✅ $300 credit | ✅ $5/month | ✅ Limited |
| **PostgreSQL** | ✅ Latest | ✅ Latest | ✅ Latest | ✅ Latest | ✅ Latest |
| **Backups** | ✅ Auto | ✅ Auto | ✅ Auto | ✅ Auto | ✅ Auto |
| **Scaling** | ⚠️ Limited | ✅ Easy | ✅ Easy | ✅ Easy | ⚠️ Manual |
| **Connection Pooling** | ✅ Built-in | ⚠️ Manual | ⚠️ Manual | ✅ Built-in | ✅ Built-in |
| **SSL/TLS** | ✅ Required | ✅ Optional | ✅ Optional | ✅ Required | ✅ Required |
| **Cost (after free)** | $25+/mo | $15-50/mo | $10-30/mo | Pay-as-go | $7-25/mo |
| **Setup Complexity** | ⭐ Easy | ⭐⭐ Medium | ⭐⭐ Medium | ⭐ Easy | ⭐ Easy |

---

## 🎯 Recommended Migration Path

### For Most Users: **Railway or Render**
- ✅ Easiest migration (similar to Supabase)
- ✅ Free tier available
- ✅ Simple connection strings
- ✅ Good for small to medium apps

### For Enterprise/Scale: **AWS RDS or Google Cloud SQL**
- ✅ More control and features
- ✅ Better for high-traffic applications
- ✅ Enterprise-grade reliability
- ⚠️ More complex setup

### For Full Control: **Self-Hosted PostgreSQL**
- ✅ Complete control
- ✅ No vendor lock-in
- ⚠️ Requires DevOps knowledge
- ⚠️ You manage everything

---

## 🔐 Security Considerations

1. **Update all connection strings** immediately after migration
2. **Rotate passwords** on new database
3. **Enable SSL/TLS** connections
4. **Restrict IP access** (if possible)
5. **Use connection pooling** for production
6. **Set up automated backups** (if not included)
7. **Monitor database logs** for suspicious activity

---

## 🆘 Troubleshooting

### Connection Issues
```bash
# Test connection
psql "postgresql://user:pass@host:5432/dbname" -c "SELECT version();"

# Check Prisma connection
cd backend
npx prisma db pull
```

### Migration Issues
```bash
# Reset migrations (careful - this deletes data!)
npx prisma migrate reset

# Or apply migrations manually
npx prisma migrate deploy
```

### Data Integrity
```bash
# Compare row counts
psql $OLD_DB -c "SELECT COUNT(*) FROM \"Journal\";"
psql $NEW_DB -c "SELECT COUNT(*) FROM \"Journal\";"
```

---

## 📞 Support

- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Railway Docs**: https://docs.railway.app
- **AWS RDS Docs**: https://docs.aws.amazon.com/rds/
- **Google Cloud SQL Docs**: https://cloud.google.com/sql/docs

---

**Last Updated**: January 2026

