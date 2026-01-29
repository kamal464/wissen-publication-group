# All APIs return 500 – Troubleshooting

If every API (e.g. `/api/news/latest`) returns **500 Internal Server Error** while PM2 shows backend and frontend running, the backend is almost certainly failing on **database** (missing env or unreachable DB).

## 1. Check backend logs on the server

SSH into EC2 and run:

```bash
pm2 logs wissen-backend --lines 100
```

Look for:

- **`DATABASE_URL: Not set`** → backend `.env` not loaded or missing (see step 2).
- **`Invalid prisma.datasource.db.url`** or **`P1001`** → wrong or unreachable database (see step 2 and 3).
- **`relation "News" does not exist`** or **`table "News" does not exist`** → schema not applied (see step 4).

## 2. Ensure backend has a `.env` with `DATABASE_URL`

On the server:

```bash
cd /var/www/wissen-publication-group/backend
cat .env | grep DATABASE_URL
```

- If **nothing** or **empty**: create/copy a `.env` in `backend/` with at least:
  - `DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"`
  - Plus any other vars the app needs (e.g. `CORS_ORIGIN`, `JWT_SECRET`, `PORT`).
- After adding/editing `.env`, restart the backend:
  ```bash
  pm2 restart wissen-backend
  ```

The backend now loads `.env` from `backend/` on startup (see `main.ts`), so PM2 will pick it up when started from the project directory.

## 3. Check database reachability

From the EC2 instance:

```bash
# If DATABASE_URL is in backend/.env, source it and test (replace with your DB host)
cd /var/www/wissen-publication-group/backend
# Optional: install postgres client
# sudo apt install -y postgresql-client
# psql "$DATABASE_URL" -c "SELECT 1"
```

- If using **RDS**: ensure the RDS security group allows **inbound** from the EC2 security group on port **5432**.
- If the URL has a **hostname**: ensure DNS resolves from EC2 (e.g. `getent hosts your-rds-endpoint.rds.amazonaws.com`).

## 4. Apply Prisma schema and regenerate client

On the server, from the **backend** directory:

```bash
cd /var/www/wissen-publication-group/backend
npx prisma generate
npx prisma migrate deploy
# Or if you don't use migrations: npx prisma db push
pm2 restart wissen-backend
```

## 5. Test health and one API

```bash
curl -s http://localhost:3001/health
curl -s http://localhost:3001/api/news/latest?limit=5
```

If `/health` returns 200 but `/api/news/latest` returns 500, the failure is in the API (usually DB). Use step 1 again after the request to see the exact error in `pm2 logs wissen-backend`.

## Quick checklist

- [ ] `backend/.env` exists and has `DATABASE_URL` (and other required vars).
- [ ] `pm2 logs wissen-backend` shows no “Not set” for DATABASE_URL and no Prisma/DB errors.
- [ ] DB is reachable from EC2 (security group, DNS, port 5432).
- [ ] `npx prisma generate` and `npx prisma migrate deploy` (or `db push`) run successfully.
- [ ] `pm2 restart wissen-backend` after any env or schema change.
