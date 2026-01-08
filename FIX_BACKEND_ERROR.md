# Fix Backend Error - Commands for EC2 Browser Terminal

The backend is crashing. Run these commands to diagnose and fix:

## Step 1: Check Backend Logs (Most Important!)
```bash
pm2 logs wissen-backend --lines 100 --nostream
```

## Step 2: Check if .env file has correct DATABASE_URL
```bash
cat backend/.env | grep DATABASE_URL
```

## Step 3: Test database connection
```bash
PGPASSWORD='wissen@2024' psql -h localhost -U postgres -d wissen_publication_group -c "SELECT 1;"
```

## Step 4: Check if backend build exists
```bash
ls -la backend/dist/src/main.js
```

## Step 5: Check backend .env file location
```bash
ls -la backend/.env
cat backend/.env
```

## Step 6: Restart backend with environment variables loaded
```bash
cd /var/www/wissen-publication-group/backend
source .env 2>/dev/null || true
export $(cat .env | xargs) 2>/dev/null || true
cd ..
pm2 delete wissen-backend
pm2 start ecosystem.config.js --only wissen-backend --update-env
```

## Step 7: Watch backend logs in real-time
```bash
pm2 logs wissen-backend --lines 50
```

---

## Quick Fix - All Commands at Once

```bash
cd /var/www/wissen-publication-group && \
echo "=== Backend Logs ===" && \
pm2 logs wissen-backend --lines 50 --nostream && \
echo "" && \
echo "=== Checking .env ===" && \
cat backend/.env && \
echo "" && \
echo "=== Testing Database ===" && \
PGPASSWORD='wissen@2024' psql -h localhost -U postgres -d wissen_publication_group -c "SELECT 1;" && \
echo "" && \
echo "=== Restarting Backend ===" && \
pm2 delete wissen-backend && \
cd backend && \
export $(cat .env | grep -v '^#' | xargs) && \
cd .. && \
pm2 start ecosystem.config.js --only wissen-backend --update-env && \
sleep 10 && \
pm2 logs wissen-backend --lines 30
```

---

## Most Common Issues:

### Issue 1: DATABASE_URL not being read
**Fix:**
```bash
cd /var/www/wissen-publication-group/backend
cat .env
# Make sure DATABASE_URL is there
pm2 restart wissen-backend --update-env
```

### Issue 2: Database connection failing
**Fix:**
```bash
# Test connection
PGPASSWORD='wissen@2024' psql -h localhost -U postgres -d wissen_publication_group -c "SELECT 1;"

# If it fails, check PostgreSQL is running
sudo systemctl status postgresql
```

### Issue 3: Missing dependencies
**Fix:**
```bash
cd /var/www/wissen-publication-group/backend
npm install --unsafe-perm
npm run build
pm2 restart wissen-backend --update-env
```

### Issue 4: Port already in use
**Fix:**
```bash
# Check what's using port 3001
sudo lsof -i :3001 || sudo netstat -tlnp | grep 3001
# Kill the process if needed
pm2 delete wissen-backend
pm2 start ecosystem.config.js --only wissen-backend --update-env
```

