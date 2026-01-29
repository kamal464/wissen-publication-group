# Fix: "Can't reach database server at localhost:5432"

The backend is trying to connect to PostgreSQL on **localhost:5432**. On EC2 that either means:

1. **`DATABASE_URL` in `backend/.env` points to `localhost`** but PostgreSQL is not installed or not running on the EC2 instance, or  
2. **`DATABASE_URL` is missing** and the app is using a default that points to localhost.

You need a **real PostgreSQL** the server can reach, and **`backend/.env`** must point to it.

---

## Option A: Use AWS RDS (recommended for production)

1. **Create a PostgreSQL DB** (if you don’t have one):
   - AWS Console → RDS → Create database → PostgreSQL.
   - Choose a size (e.g. db.t3.micro), set master username/password, create DB.
   - Note the **Endpoint** (e.g. `your-db.xxxxxx.region.rds.amazonaws.com`).

2. **Allow EC2 to reach RDS**:
   - RDS → your DB → VPC security group → Inbound rules.
   - Add rule: Type **PostgreSQL**, Port **5432**, Source = **EC2 instance’s security group** (or the VPC CIDR).

3. **Set `DATABASE_URL` on the server** (SSH into EC2):

   ```bash
   cd /var/www/wissen-publication-group/backend
   nano .env
   ```

   Set (replace with your RDS endpoint, user, password, and database name):

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@your-rds-endpoint.region.rds.amazonaws.com:5432/DATABASE?schema=public"
   PORT=3001
   CORS_ORIGIN="https://wissenpublicationgroup.com,https://www.wissenpublicationgroup.com"
   ```

   Save and exit.

4. **Run migrations and restart backend**:

   ```bash
   cd /var/www/wissen-publication-group/backend
   npx prisma migrate deploy
   pm2 restart wissen-backend
   ```

5. **Check**:

   ```bash
   pm2 logs wissen-backend --lines 20
   curl -s http://localhost:3001/api/news/latest?limit=5
   ```

---

## Option B: Run PostgreSQL on the same EC2 instance

Use this only if you want the DB on the same server (e.g. for a small/test setup).

1. **Install and start PostgreSQL** on EC2:

   ```bash
   sudo apt update
   sudo apt install -y postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **Create a DB and user**:

   ```bash
   sudo -u postgres psql -c "CREATE USER wissen WITH PASSWORD 'your_secure_password';"
   sudo -u postgres psql -c "CREATE DATABASE wissen_db OWNER wissen;"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE wissen_db TO wissen;"
   ```

3. **Set `DATABASE_URL` in backend `.env`** on the server:

   ```bash
   cd /var/www/wissen-publication-group/backend
   nano .env
   ```

   Add or update (use the same password as above):

   ```env
   DATABASE_URL="postgresql://wissen:your_secure_password@localhost:5432/wissen_db?schema=public"
   PORT=3001
   CORS_ORIGIN="https://wissenpublicationgroup.com,https://www.wissenpublicationgroup.com"
   ```

4. **Run migrations and restart**:

   ```bash
   cd /var/www/wissen-publication-group/backend
   npx prisma migrate deploy
   pm2 restart wissen-backend
   ```

5. **Check**:

   ```bash
   curl -s http://localhost:3001/api/news/latest?limit=5
   ```

---

## Summary

- **"Can't reach database server at localhost:5432"** = backend is trying to use PostgreSQL on the EC2 box, but there is no DB there (or `.env` is wrong).
- **Fix:** Point `backend/.env` → `DATABASE_URL` at a real PostgreSQL (RDS or local Postgres on EC2), then run `npx prisma migrate deploy` and `pm2 restart wissen-backend`.
